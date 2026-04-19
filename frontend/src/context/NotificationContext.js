"use client";
import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '../components/Toast';
import axios from 'axios';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
    const { user } = useAuth();
    const toast = useToast();
    const [notifications, setNotifications] = useState([]);
    const knownIdsRef = useRef(new Set());
    const isFirstFetchRef = useRef(true);
    const audioRef = useRef(null);

    useEffect(() => {
        try { audioRef.current = new Audio('/discord-notification.mp3'); } catch (_) {}
    }, []);

    const playSound = useCallback(() => {
        if (!audioRef.current) return;
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
    }, []);

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        try {
            const res = await axios.get('http://localhost:5000/api/notifications');
            const data = Array.isArray(res.data) ? res.data : [];

            if (isFirstFetchRef.current) {
                // First load — seed known IDs, no sound
                data.forEach(n => knownIdsRef.current.add(n.id));
                isFirstFetchRef.current = false;
            } else {
                // Find genuinely new notifications
                const newOnes = data.filter(n => !knownIdsRef.current.has(n.id));
                if (newOnes.length > 0) {
                    playSound();
                    const newest = newOnes[0];
                    if (newest?.title) toast.info(`🔔 ${newest.title}`);
                    newOnes.forEach(n => knownIdsRef.current.add(n.id));
                }
            }

            setNotifications(data);
        } catch (_) {}
    }, [user, toast, playSound]);

    useEffect(() => {
        if (!user) {
            setNotifications([]);
            knownIdsRef.current.clear();
            isFirstFetchRef.current = true;
            return;
        }
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 8000);
        return () => clearInterval(interval);
    }, [user, fetchNotifications]);

    const markAsRead = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/notifications/${id}/read`);
            fetchNotifications();
        } catch (_) {}
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{ notifications, fetchNotifications, markAsRead, unreadCount }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    return useContext(NotificationContext);
}

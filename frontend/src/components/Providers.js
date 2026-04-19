"use client";
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from './Toast';
import { NotificationProvider } from '../context/NotificationContext';
import { useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://agency-workspace-2.onrender.com';

export default function Providers({ children }) {
    useEffect(() => {
        axios.defaults.baseURL = API_BASE_URL;
    }, []);

    return (
        <ToastProvider>
            <AuthProvider>
                <NotificationProvider>
                    {children}
                </NotificationProvider>
            </AuthProvider>
        </ToastProvider>
    );
}

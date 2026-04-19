"use client";
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from './Toast';
import { NotificationProvider } from '../context/NotificationContext';

export default function Providers({ children }) {
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

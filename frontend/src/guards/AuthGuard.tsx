// src/guards/AuthGuard.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from '../hooks/useAuth';

export const AuthGuard = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    // แสดง loading ขณะตรวจสอบสถานะ
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spin size="large" />
            </div>
        );
    }

    // ถ้ายังไม่ login ให้ redirect ไปหน้า login พร้อมเก็บ pathname ปัจจุบัน
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    // ถ้า login แล้ว ให้แสดงเนื้อหา
    return <Outlet />;
};
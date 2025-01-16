import { Navigate, Outlet } from 'react-router-dom';
import { Spin, Result, Button } from 'antd';
import { useAuth } from '../hooks/useAuth';

export const AdminGuard = () => {
    const { isAuthenticated, isAdmin, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spin size="large" />
            </div>
        );
    }

    // ถ้ายังไม่ login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // ถ้า login แล้วแต่ไม่ใช่ admin
    if (!isAdmin) {
        return (
            <Result
                status="403"
                title="403"
                subTitle="ขออภัย คุณไม่มีสิทธิ์เข้าถึงหน้านี้"
                extra={
                    <Button type="primary" href="/">
                        กลับหน้าแรก
                    </Button>
                }
            />
        );
    }

    // ถ้าเป็น admin
    return <Outlet />;
};
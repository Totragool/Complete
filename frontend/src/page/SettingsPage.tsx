import React from 'react';
import { Card, Switch, Space, Typography } from 'antd';

const { Text } = Typography;

export const SettingsPage: React.FC = () => {
    return (
        <div className="max-w-2xl mx-auto p-4">
            <Card title="การตั้งค่า">
                <Space direction="vertical" className="w-full">
                    <div className="flex justify-between items-center">
                        <Text>รับการแจ้งเตือนสินค้าใหม่</Text>
                        <Switch />
                    </div>
                    <div className="flex justify-between items-center">
                        <Text>รับการแจ้งเตือนสถานะคำสั่งซื้อ</Text>
                        <Switch defaultChecked />
                    </div>
                    <div className="flex justify-between items-center">
                        <Text>รับการแจ้งเตือนโปรโมชั่น</Text>
                        <Switch defaultChecked />
                    </div>
                </Space>
            </Card>
        </div>
    );
};
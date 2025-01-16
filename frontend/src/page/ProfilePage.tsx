// src/pages/ProfilePage.tsx
import React from 'react';
import { Card, Form, Input, Button, App} from 'antd';
import { useAuth } from '../hooks/useAuth';

export const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const [form] = Form.useForm();
    const { message } = App.useApp();

    return (
        <div className="max-w-2xl mx-auto p-4">
            <Card title="โปรไฟล์ของฉัน">
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        email: user?.email,
                        firstName: user?.firstName,
                        lastName: user?.lastName,
                    }}
                >
                    <Form.Item label="อีเมล" name="email">
                        <Input disabled />
                    </Form.Item>
                    <Form.Item label="ชื่อ" name="firstName">
                        <Input />
                    </Form.Item>
                    <Form.Item label="นามสกุล" name="lastName">
                        <Input />
                    </Form.Item>
                    <Button type="primary">บันทึกการเปลี่ยนแปลง</Button>
                </Form>
            </Card>
        </div>
    );
};
// src/components/AppFooter.tsx
import React from 'react';
import { Layout, Typography, Space, Button } from 'antd';

const { Footer } = Layout;
const { Title, Text } = Typography;

export const AppFooter: React.FC = () => {
    return (
        <Footer className="bg-gray-800 text-white">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <Title level={4} className="text-white">เกี่ยวกับเรา</Title>
                        <Text className="text-gray-300">
                            บริษัทของเราให้บริการเฟอร์นิเจอร์คุณภาพสูง
                            ที่ตอบโจทย์ทุกการใช้งาน
                        </Text>
                    </div>
                    <div>
                        <Title level={4} className="text-white">ติดต่อเรา</Title>
                        <Space direction="vertical">
                            <Text className="text-gray-300">
                                อีเมล: contact@example.com
                            </Text>
                            <Text className="text-gray-300">
                                โทร: 02-123-4567
                            </Text>
                        </Space>
                    </div>
                    <div>
                        <Title level={4} className="text-white">ติดตามเรา</Title>
                        <Space>
                            <Button type="link" className="text-white">Facebook</Button>
                            <Button type="link" className="text-white">Instagram</Button>
                            <Button type="link" className="text-white">Line</Button>
                        </Space>
                    </div>
                </div>
                <div className="text-center mt-8 pt-4 border-t border-gray-700">
                    <Text className="text-gray-400">
                        © 2024 บริษัทของเรา. สงวนลิขสิทธิ์
                    </Text>
                </div>
            </div>
        </Footer>
    );
};
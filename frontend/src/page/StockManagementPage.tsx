// src/pages/StockManagementPage.tsx
import React, { useState } from 'react';
import { Tabs, Card, Typography } from 'antd';
import { StockManagement } from '../Components/StockManagement';
import { ProductList } from '../Components/ProductList';

const { Title } = Typography;
const { TabPane } = Tabs;

export const StockManagementPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('1');

    return (
        <div className="container mx-auto px-4 py-8">
            <Title level={2}>จัดการสต็อกสินค้า</Title>
            
            <Card className="mt-4">
                <Tabs activeKey={activeTab} onChange={setActiveTab}>
                    <TabPane tab="รายการสินค้า" key="1">
                        <ProductList mode="management" />
                    </TabPane>
                    
                    <TabPane tab="ภาพรวมสต็อก" key="2">
                        <StockManagement />
                    </TabPane>
                    
                    <TabPane tab="สินค้าใกล้หมด" key="3">
                        <StockManagement filterLowStock />
                    </TabPane>
                    
                    <TabPane tab="รายงาน" key="4">
                        {/* Stock Reports Component */}
                    </TabPane>
                </Tabs>
            </Card>
        </div>
    );
};
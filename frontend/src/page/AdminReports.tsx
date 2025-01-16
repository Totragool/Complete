import React from 'react';
import { Card, DatePicker, Button, Table } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export const AdminReports: React.FC = () => {
  return (
    <div className="p-6">
      <Card title="รายงานยอดขาย">
        <div className="flex justify-between mb-4">
          <DatePicker.RangePicker />
          <Button icon={<DownloadOutlined />}>ดาวน์โหลดรายงาน</Button>
        </div>

        {/* Sales Graph */}
        <div className="mb-6">
          <LineChart width={800} height={400} data={[]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="sales" stroke="#8884d8" />
          </LineChart>
        </div>

        {/* Sales Table */}
        <Table 
          columns={[
            { title: 'วันที่', dataIndex: 'date' },
            { title: 'ยอดขาย', dataIndex: 'sales' },
            { title: 'จำนวนออเดอร์', dataIndex: 'orders' },
            { title: 'เฉลี่ยต่อออเดอร์', dataIndex: 'average' }
          ]}
        />
      </Card>
    </div>
  );
};
import { Col, Row, Card, Statistic, Table, Select } from "antd";
import { AuditOutlined, UserOutlined, PieChartOutlined, StockOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { GetCollectedCodesToShow } from "../../../../services/https"; // Import API function

const columns = [
  { title: "ลำดับ", dataIndex: "ID", key: "id" },
  { title: "ชื่อ", dataIndex: "FirstName", key: "firstname" },
  { title: "นามสกุล", dataIndex: "LastName", key: "lastname" },
  { title: "อีเมล", dataIndex: "Email", key: "email" },
  { title: "เบอร์โทร", dataIndex: "Phone", key: "phone" },
];

export default function Dashboard() {
  const { Option } = Select;
 
  const [codes, setCodes] = useState<{ ID: number, CodeTopic: string }[]>([]); // state สำหรับเก็บข้อมูลใน dropdown

  const getCollectedCodes = async () => {
    const userId = localStorage.getItem("id") || "1";
    try {
      const res = await GetCollectedCodesToShow(userId); // เรียก API
      console.log("API Response: ", res.data); // ตรวจสอบข้อมูลที่ได้รับ

      // ตรวจสอบว่า res.data เป็น array หรือไม่
      if (res && res.data) {
        const transformedData = res.data.map((item: any) => ({
          ID: item.ID,
          CodeTopic: item.code_topic,
        }));
        setCodes(transformedData); // อัปเดตข้อมูลใน state
      } else {
        console.error("res.data is not an array:", res.data);
      }
    } catch (error) {
      console.error("Error fetching collected codes: ", error);
    }
  };

  useEffect(() => {
    getCollectedCodes(); // ดึงข้อมูลตอนโหลดคอมโพเนนต์
  }, []);

  useEffect(() => {
    console.log("Updated codes: ", codes);
  }, [codes]);

  return (
    <>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <h2>แดชบอร์ด</h2>
        </Col>
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <Card style={{ backgroundColor: "#F5F5F5" }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={24} md={12} lg={12} xl={6}>
                <Card bordered={false} style={{ boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px" }}>
                  <Statistic title="จำนวน" value={1800} prefix={<StockOutlined />} />
                </Card>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12} xl={6}>
                <Card bordered={false} style={{ boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px" }}>
                  <Statistic title="จำนวน" value={200} valueStyle={{ color: "black" }} prefix={<AuditOutlined />} />
                </Card>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12} xl={6}>
                <Card bordered={false} style={{ boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px" }}>
                  <Statistic title="จำนวน" value={3000} valueStyle={{ color: "black" }} prefix={<PieChartOutlined />} />
                </Card>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12} xl={6}>
                <Card bordered={false} style={{ boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px" }}>
                  <Statistic title="จำนวน" value={10} valueStyle={{ color: "black" }} prefix={<UserOutlined />} />
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <h3>ผู้ใช้งานล่าสุด</h3>
        </Col>
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <Table columns={columns}/>
        </Col>
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <Select
            style={{ width: 200 }}
            placeholder="เลือกโค้ด"
            onChange={(value) => console.log("Selected code ID: ", value)}
          >
            {codes.map((item) => (
              <Option key={item.ID} value={item.ID}>
                {item.CodeTopic}
              </Option>
            ))}
          </Select>

        </Col>
      </Row>
    </>
  );
}

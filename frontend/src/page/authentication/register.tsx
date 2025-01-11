import { Button, Form, Input, message, Typography, Flex, DatePicker } from "antd";
import { useNavigate } from "react-router-dom";
import { CreateUser, DeleteUsersById } from "../../../services/https";
import { UserInterface } from "../../interfaces/User";

import dayjs from "dayjs";

const { Title, Text } = Typography;

function SignUpPages() {
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();

    const onFinish = async (values: any) => {
        let userId: string | null = null; // เก็บ userId สำหรับกรณีลบ

        try {
            // Step 1: สร้าง User
            const userPayload: UserInterface = {
                first_name: values.first_name,
                last_name: values.last_name,
                email: values.email,
                password: values.password,
                phone_number: values.phone_number,
                birthday: dayjs(values.birthday).toISOString(),
            };

            const userRes = await CreateUser(userPayload);
            console.log("kuy u nee", userRes);

            if (userRes.status === 201) {
                if (userRes.data && userRes.data.user.ID) {
                    userId = userRes.data.user.ID;  // ใช้ค่าของ id หากมี
                    console.log("Created user with ID:", userId);
                } else {
                    console.log("Error: user ID is undefined");
                    // หรือเพิ่มการจัดการข้อผิดพลาดที่เหมาะสม
                }

                // หากสำเร็จ
                messageApi.success(userRes.data.message || "สมัครสมาชิกสำเร็จ!");
                setTimeout(() => navigate("/"), 2000);
            } else {
                throw new Error(userRes.data.error || "เกิดข้อผิดพลาด");
            }
        } catch (error: unknown) {
            // กรณีเกิดข้อผิดพลาด
            if (error instanceof Error) {
                messageApi.error(error.message || "เกิดข้อผิดพลาดในการสมัครสมาชิก");
            } else {
                messageApi.error("เกิดข้อผิดพลาดที่ไม่รู้จัก");
            }

            // ลบ User ที่บันทึกแล้วถ้ามีข้อผิดพลาด
            if (userId) {
                try {
                    await DeleteUsersById(userId); // ลบ User ที่บันทึกไปแล้ว
                } catch (err) {
                    messageApi.error("ไม่สามารถลบข้อมูลผู้ใช้ได้");
                }
            }
        }
    };

    return (
        <>
            {contextHolder}
            <Flex
                justify="center"
                align="center"
                style={{
                    minHeight: "100vh",
                    width: "100vw",
                    background: "#f5f5f5",
                    padding: "20px",
                }}
            >
                <div
                    style={{
                        width: "100%",
                        maxWidth: "500px",
                        padding: "40px",
                        backgroundColor: "#fff",
                        borderRadius: "20px",
                        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
                    }}
                >
                    <Title level={2} style={{ marginBottom: "24px" }}>
                        สร้างบัญชี iGotsofar
                    </Title>

                    <Text type="secondary" style={{ display: "block", marginBottom: "32px" }}>
                        คุณจะพบข้อมูลทั้งหมดที่เชื่อมโยงกับบัญชีของคุณจากโปรไฟล์ของคุณ และเข้าร่วมฟรี!
                    </Text>

                    <Form
                        name="signup-form"
                        layout="vertical"
                        onFinish={onFinish}
                        autoComplete="off"
                        size="large"
                    >
                        <Form.Item
                            label="ชื่อจริง"
                            name="first_name"
                            rules={[{ required: true, message: "กรุณากรอกชื่อจริง" }]}
                        >
                            <Input
                                placeholder="ชื่อจริงของคุณ"
                                style={{ borderColor: "#000" }}
                            />
                        </Form.Item>

                        <Form.Item
                            label="นามสกุล"
                            name="last_name"
                            rules={[{ required: true, message: "กรุณากรอกนามสกุล" }]}
                        >
                            <Input
                                placeholder="นามสกุลของคุณ"
                                style={{ borderColor: "#000" }}
                            />
                        </Form.Item>

                        <Form.Item
                            label="อีเมล"
                            name="email"
                            rules={[
                                { required: true, message: "กรุณากรอกอีเมล" },
                                { type: "email", message: "รูปแบบอีเมลไม่ถูกต้อง" }
                            ]}
                        >
                            <Input
                                placeholder="example@email.com"
                                style={{ borderColor: "#000" }}
                            />
                        </Form.Item>

                        <Form.Item
                            label="รหัสผ่าน"
                            name="password"
                            rules={[{ required: true, message: "กรุณากรอกรหัสผ่าน" }]}
                        >
                            <Input.Password
                                placeholder="••••••••"
                                style={{ borderColor: "#000" }}
                            />
                        </Form.Item>

                        <Form.Item
                            label="เบอร์โทรศัพท์"
                            name="phone_number"
                            rules={[
                                {
                                    required: true,
                                    message: "กรุณากรอกเบอร์โทรศัพท์",
                                },
                                {
                                    pattern: /^\d{10}$/,
                                    message: "เบอร์โทรศัพท์ต้องมี 10 หลัก",
                                },
                            ]}
                        >
                            <Input
                                placeholder="0xxxxxxxxx"
                                maxLength={10}
                                style={{ borderColor: "#000" }}
                                onChange={(e) => {
                                    const { value } = e.target;
                                    if (!/^\d*$/.test(value)) {
                                        e.target.value = value.replace(/\D/g, "");
                                    }
                                }}
                            />
                        </Form.Item>

                        <Form.Item
                            label="วันเกิด"
                            name="birthday"
                            rules={[
                                {
                                    required: true,
                                    message: "กรุณาเลือกวันเกิด",
                                },
                            ]}
                        >
                            <DatePicker
                                style={{
                                    width: "100%",
                                    borderColor: "#000",
                                }}
                                placeholder="เลือกวันเกิดของคุณ"
                            />
                        </Form.Item>

                        <Button
                            type="primary"
                            htmlType="submit"
                            style={{
                                width: "100%",
                                height: "45px",
                                borderRadius: "10px",
                                backgroundColor: "#000",
                                marginTop: "16px",
                                fontSize: "16px",
                            }}
                        >
                            สร้างบัญชี
                        </Button>

                        <Flex justify="center" style={{ marginTop: "24px" }}>
                            <Text type="secondary">
                                มีบัญชีอยู่แล้ว?{" "}
                                <a onClick={() => navigate("/")} style={{ color: "#1677ff" }}>
                                    เข้าสู่ระบบที่นี่
                                </a>
                            </Text>
                        </Flex>
                    </Form>
                </div>
            </Flex>
        </>
    );
}

export default SignUpPages;

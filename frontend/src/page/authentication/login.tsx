import { Button, Form, Input, message, Flex, Row, Col } from "antd";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { SignIn } from "../../../services/https";
import { SignInInterface } from "../../../interfaces/SignIn";
import { useState } from "react";

function SignInPages() {
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();
    const [emailValid, setEmailValid] = useState<boolean | null>(null);


    const onFinish = async (values: SignInInterface) => {
        let res = await SignIn(values);

        if (res.status === 200) {
            const { role } = res.data;

            messageApi.success("Sign-in successful");

            localStorage.setItem("isLogin", "true");
            localStorage.setItem("role", role);
            localStorage.setItem("page", "dashboard");
            localStorage.setItem("token_type", res.data.token_type);
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("id", res.data.id);

            setTimeout(() => {
                location.href = "/";
            }, 1500);
        } else {
            messageApi.error(res.data.error);
        }
    };

    // Handle email input changes to validate email format
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const emailValue = e.target.value;
        // Basic email regex validation
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        setEmailValid(emailRegex.test(emailValue)); // Set email validity based on regex match
    };



    return (
        <>
            {contextHolder}

            <Flex
                justify="center"
                align="center"
                className="login"
                style={{
                    height: "100vh", // full height
                    width: "100vw", // full width
                    backgroundColor: "#f5f5f5", // background color
                    padding: "20px", // padding
                    display: "flex", // flexbox to center content
                    flexDirection: "column", // stacking content vertically
                    justifyContent: "center", // center content vertically
                }}
            >
                <div
                    style={{
                        width: "100%", // full width
                        maxWidth: "500px", // max width of the form
                        padding: "40px 30px", // padding inside form container
                        borderRadius: "15px", // rounded corners
                        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)", // shadow effect
                        backgroundColor: "#fff", // background color for the form
                        textAlign: "center", // center text
                    }}
                >
                    <Row align="middle" justify="center">
                        <Col xs={24} style={{ marginBottom: "30px", textAlign: "left" }}>
                            <h1 style={{ marginBottom: "10px", fontSize: "24px", fontWeight: "bold" }}>
                                ลงชื่อเข้าใช้บัญชีของคุณ
                            </h1>
                            <p style={{ color: "#666", fontSize: "14px", lineHeight: "1.5", margin: 0 }}>
                                สัมผัสประสบการณ์ที่เหมาะกับคุณมากขึ้น<br></br>
                                โดยที่คุณไม่จำเป็นต้องกรอกข้อมูลของคุณทุกครั้ง
                            </p>
                        </Col>

                        <Col xs={24}>
                            <Form
                                name="basic"
                                onFinish={onFinish}
                                autoComplete="off"
                                layout="vertical"
                                style={{ textAlign: "left" }}
                            >
                                <Form.Item
                                    label="อีเมล (ชื่อผู้ใช้)"
                                    name="email"
                                    rules={[
                                        {
                                            required: true,
                                            message: (
                                                <>
                                                    <ExclamationCircleFilled style={{ marginRight: 6 }} />
                                                    โปรดกรอกอีเมลที่ถูกต้อง
                                                </>
                                            ),
                                        },
                                    ]}
                                    style={{ marginBottom: "20px" }}
                                >
                                    <Input
                                        placeholder="example@gmail.com"
                                        onChange={handleEmailChange}
                                        style={{
                                            borderColor: emailValid === null ? 'black' : (emailValid ? 'green' : 'red'),
                                            boxShadow: emailValid === null ? 'none' : (emailValid ? '0 0 5px green' : '0 0 5px red'), // optional: add a shadow for better visual feedback
                                        }}
                                    />
                                </Form.Item>

                                <Form.Item
                                    label="รหัสผ่าน"
                                    name="password"
                                    style={{ marginBottom: "30px" }}
                                >
                                    <Input.Password
                                        placeholder="••••••••"
                                        style={{
                                            borderColor: 'black', // ensure border color is black for password input
                                        }}
                                    />
                                </Form.Item>


                                <Form.Item>
                                    <Button
                                        type="default"
                                        htmlType="submit"
                                        className="login-form-button"
                                        style={{
                                            marginBottom: 20,
                                            backgroundColor: "#000",
                                            color: "#fff",
                                            border: "1px solid #000",
                                            borderColor: 'black',
                                            width: "100%",
                                            textAlign: "center",
                                            height: "45px",
                                            borderRadius: "25px",
                                            fontSize: "16px",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        เข้าสู่ระบบ
                                    </Button>

                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            margin: "20px 0",
                                        }}
                                    >
                                        <span
                                            style={{
                                                flex: 1,
                                                borderTop: "1px solid #ddd",
                                                marginRight: "10px",
                                            }}
                                        />
                                        <span style={{ color: "#888", fontSize: "14px" }}>
                                            ใหม่ที่ iGotsofar?
                                        </span>
                                        <span
                                            style={{
                                                flex: 1,
                                                borderTop: "1px solid #ddd",
                                                marginLeft: "10px",
                                            }}
                                        />
                                    </div>

                                    <Button
                                        type="default"
                                        className="register-button"
                                        style={{
                                            display: "block",
                                            margin: "0 auto",
                                            backgroundColor: "#fff",
                                            color: "#000",
                                            border: "1px solid #000",
                                            width: "100%",
                                            textAlign: "center",
                                            height: "45px",
                                            borderRadius: "25px",
                                            fontSize: "16px",
                                            fontWeight: "bold",
                                        }}
                                        onClick={() => navigate("/signup")}
                                    >
                                        สร้างบัญชี
                                    </Button>

                                </Form.Item>
                            </Form>
                        </Col>
                    </Row>
                </div>
            </Flex>
        </>
    );
}

export default SignInPages;

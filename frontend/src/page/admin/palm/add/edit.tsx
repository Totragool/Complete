import { useEffect } from "react";

import {

    Space,

    Button,

    Col,

    Row,

    Divider,

    Form,

    Input,

    Card,

    message,

    DatePicker,

} from "antd";

import { PlusOutlined } from "@ant-design/icons";

import { UserInterface } from "../../../../interfaces/User";

import { GetUsersById, UpdateUsersById } from "../../../../../services/https/index";

import { useNavigate, Link, useParams } from "react-router-dom";

import dayjs from "dayjs";


function AdminEdit() {

    const navigate = useNavigate();

    const { id } = useParams<{ id: any }>();

    const [messageApi, contextHolder] = message.useMessage();

    const [form] = Form.useForm();


    const getUserById = async (id: string) => {

        let res = await GetUsersById(id);

        if (res.status == 200) {

            form.setFieldsValue({

                first_name: res.data.first_name,

                last_name: res.data.last_name,

                email: res.data.email,

                birthday: dayjs(res.data.birthday),

                phone_number: res.data.phone_number

            });

        } else {

            messageApi.open({

                type: "error",

                content: "ไม่พบข้อมูลผู้ใช้",

            });

            setTimeout(() => {

                navigate("/customer");

            }, 2000);

        }

    };


    const onFinish = async (values: UserInterface) => {

        let payload = {

            ...values,

        };


        const res = await UpdateUsersById(id, payload);

        if (res.status == 200) {

            messageApi.open({

                type: "success",

                content: res.data.message,

            });

            setTimeout(() => {

                navigate("/add");

            }, 2000);

        } else {

            messageApi.open({

                type: "error",

                content: res.data.error,

            });

        }

    };


    useEffect(() => {

        getUserById(id);

    }, []);


    return (

        <div>

            {contextHolder}

            <Card>

                <h2>แก้ไขข้อมูล ผู้ดูแลระบบ</h2>

                <Divider />


                <Form

                    name="basic"

                    form={form}

                    layout="vertical"

                    onFinish={onFinish}

                    autoComplete="off"

                >

                    <Row gutter={[16, 0]}>

                        <Col xs={24} sm={24} md={24} lg={24} xl={12}>

                            <Form.Item

                                label="ชื่อจริง"

                                name="first_name"

                                rules={[

                                    {

                                        required: true,

                                        message: "กรุณากรอกชื่อ !",

                                    },

                                ]}

                            >

                                <Input />

                            </Form.Item>

                        </Col>


                        <Col xs={24} sm={24} md={24} lg={24} xl={12}>

                            <Form.Item

                                label="นามกสุล"

                                name="last_name"

                                rules={[

                                    {

                                        required: true,

                                        message: "กรุณากรอกนามสกุล !",

                                    },

                                ]}

                            >

                                <Input />

                            </Form.Item>

                        </Col>


                        <Col xs={24} sm={24} md={24} lg={24} xl={12}>

                            <Form.Item

                                label="อีเมล"

                                name="email"

                                rules={[

                                    {

                                        type: "email",

                                        message: "รูปแบบอีเมลไม่ถูกต้อง !",

                                    },

                                    {

                                        required: true,

                                        message: "กรุณากรอกอีเมล !",

                                    },

                                ]}

                            >

                                <Input />

                            </Form.Item>

                        </Col>

                        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                                        <Form.Item
                                            label="Phone Number"
                                            name="phone_number"
                                            rules={[
                                                {
                                                    required: true,
                                                    message: "Please enter your phone number!",
                                                },
                                                {
                                                    pattern: /^\d{10}$/,
                                                    message: "Phone number must be 10 digits!",
                                                },
                                            ]}
                                        >
                                            <Input
                                                maxLength={10} // จำกัดความยาวเป็น 10 ตัวอักษร
                                                onChange={(e) => {
                                                    const { value } = e.target;
                                                    if (!/^\d*$/.test(value)) {
                                                        e.target.value = value.replace(/\D/g, ""); // กรองเฉพาะตัวเลข
                                                    }
                                                }}
                                            />
                                        </Form.Item>
                                    </Col>

                        <Col xs={24} sm={24} md={24} lg={24} xl={12}>

                            <Form.Item

                                label="วัน/เดือน/ปี เกิด"

                                name="birthday"

                                rules={[

                                    {

                                        required: true,

                                        message: "กรุณาเลือกวัน/เดือน/ปี เกิด !",

                                    },

                                ]}

                            >

                                <DatePicker style={{ width: "100%" }} />

                            </Form.Item>

                        </Col>


                    </Row>


                    <Row justify="end">

                        <Col style={{ marginTop: "40px" }}>

                            <Form.Item>

                                <Space>

                                    <Link to="/add">

                                        <Button htmlType="button" style={{ marginRight: "10px" }}>

                                            ยกเลิก

                                        </Button>

                                    </Link>


                                    <Button

                                        type="primary"

                                        htmlType="submit"

                                        icon={<PlusOutlined />}

                                    >

                                        บันทึก

                                    </Button>

                                </Space>

                            </Form.Item>

                        </Col>

                    </Row>

                </Form>

            </Card>

        </div>

    );

}

export default AdminEdit;
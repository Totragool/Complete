import React, { useState, useEffect } from "react";
import { Breadcrumb, Layout, Menu, theme, message, Dropdown, Avatar } from "antd";
import { UserOutlined, DashboardOutlined, PercentageOutlined } from "@ant-design/icons";
import { Link, Routes, Route } from "react-router-dom";
import logo from "../../assets/logo.jpg";
import { GetUsersById } from "../../services/https";

// User Pages
import Dashboard from "../../pages/customer/palm/dashboard";
import Customer from "../../pages/customer/palm/customer";
import CustomerCreate from "../../pages/customer/palm/customer/create";
import CustomerEdit from "../../pages/customer/palm/customer/edit";

import UserCodes from "../../pages/customer/palm/code";

import ProfileEdit from "../../pages/customer/palm/profile";
import AddAddressPage from "../../pages/customer/palm/profile/address";

const { Header, Content, Footer } = Layout;

const UserLayout: React.FC = () => {
    const page = localStorage.getItem("page");
    const [messageApi, contextHolder] = message.useMessage();
    const [firstName, setFirstName] = useState<string>("");
    const myId = localStorage.getItem("id");

    const {
        token: { colorBgContainer },
    } = theme.useToken();

    const setCurrentPage = (val: string) => {
        localStorage.setItem("page", val);
    };

    const Logout = () => {
        localStorage.clear();
        messageApi.success("Logout successful");
        setTimeout(() => {
            location.href = "/";
        }, 2000);
    };

    const fetchUserData = async () => {
        try {
            if (!myId) {
                throw new Error("User ID is null");
            }
            const response = await GetUsersById(myId);
            setFirstName(response.data.first_name || "ผู้ใช้");
        } catch (error) {
            console.error("Failed to fetch user data:", error);
            messageApi.error("ไม่สามารถดึงข้อมูลผู้ใช้ได้");
        }
    };
    

    const profileMenu = (
        <Menu>
            <Menu.Item key="profile">
                <Link to="/profile">
                    <UserOutlined />
                    <span>แก้ไขข้อมูลส่วนตัว</span>
                </Link>
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item key="logout" onClick={Logout}>
                <span style={{ color: "red" }}>ออกจากระบบ</span>
            </Menu.Item>
        </Menu>
    );

    useEffect(() => {
        fetchUserData(); // เรียกข้อมูลผู้ใช้เมื่อ component ถูกโหลด
    }, []);

    return (
        <Layout style={{ minHeight: "100vh" }}>
            {contextHolder}

            <Layout>
                {/* Header with horizontal menu */}
                <Header style={{ background: colorBgContainer, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <img src={logo} alt="Logo" style={{ height: 50, marginRight: 16 }} />
                        <Menu theme="light" mode="horizontal" defaultSelectedKeys={[page ? page : "dashboard"]}>
                            <Menu.Item key="dashboard" onClick={() => setCurrentPage("dashboard")}>
                                <Link to="/dashboard">
                                    <DashboardOutlined />
                                    <span>แดชบอร์ด</span>
                                </Link>
                            </Menu.Item>
                            <Menu.Item key="customer" onClick={() => setCurrentPage("customer")}>
                                <Link to="/customer">
                                    <UserOutlined />
                                    <span>ข้อมูลสมาชิก</span>
                                </Link>
                            </Menu.Item>
                            <Menu.Item key="code" onClick={() => setCurrentPage("code")}>
                                <Link to="/code">
                                <PercentageOutlined />
                                    <span>เก็บ code</span>
                                </Link>
                            </Menu.Item>
                        </Menu>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <span>สวัสดีคุณ {firstName}!</span>
                        <Dropdown overlay={profileMenu} placement="bottomRight">
                            <Avatar
                                size="large"
                                icon={<UserOutlined />}
                                style={{ cursor: "pointer" }}
                            />
                        </Dropdown>
                    </div>
                </Header>

                <Content style={{ margin: "0 16px" }}>
                    <Breadcrumb style={{ margin: "16px 0" }} />
                    <div
                        style={{
                            padding: 24,
                            minHeight: "100%",
                            background: colorBgContainer,
                        }}
                    >
                        <Routes>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/customer" element={<Customer />} />
                            <Route path="/customer/create" element={<CustomerCreate />} />
                            <Route path="/customer/edit/:id" element={<CustomerEdit />} />

                            <Route path="/code" element={<UserCodes />} />

                            <Route path="/profile" element={<ProfileEdit />} />
                            <Route path="/profile/address" element={<AddAddressPage />} />
                        </Routes>
                    </div>
                </Content>

                <Footer style={{ textAlign: "center" }}>
                    IGOTSOFAR 555
                </Footer>
            </Layout>
        </Layout>
    );
};

export default UserLayout;

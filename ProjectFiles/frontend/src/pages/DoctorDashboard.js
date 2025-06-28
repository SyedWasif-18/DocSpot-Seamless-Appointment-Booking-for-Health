import React, { useState, useEffect } from "react";
import axios from "../utils/axios";
import DoctorProfileForm from "./DoctorProfileForm";
import { useNavigate } from "react-router-dom";
import {
  Layout,
  Menu,
  Table,
  Button,
  Tag,
  message,
  Spin,
  Drawer,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LogoutOutlined,
  UploadOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import "./DoctorDashboard.css";

const { Header, Content } = Layout;

const DoctorDashboard = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("dashboard");
  const [drawerVisible, setDrawerVisible] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/v1/doctor/notifications/${user._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const merged = res.data.data.map((notif) => ({
        ...notif,
        status: notif.status || "pending",
      }));
      setNotifications(merged);
    } catch (err) {
      console.error("❌ Failed to fetch notifications", err);
      message.error("Failed to fetch notifications");
    }
    setLoading(false);
  };

  const handleDeleteNotification = async (appointmentId) => {
    try {
      await axios.post(
        "/doctor/delete-notification",
        { appointmentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success("Notification removed");
      setNotifications((prev) =>
        prev.filter((n) => n?.data?.appointmentId !== appointmentId)
      );
    } catch (err) {
      console.error("❌ Failed to delete doctor notification", err);
      message.error("Delete failed");
    }
  };

  const handleStatusChange = async (appointmentId, status) => {
    try {
      await axios.post(
        "/doctor/update-status",
        { appointmentId, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success("Status updated");
      if (status === "rejected") {
        setNotifications((prev) =>
          prev.filter((n) => n.data.appointmentId !== appointmentId)
        );
      } else {
        setNotifications((prev) =>
          prev.map((n) =>
            n.data.appointmentId === appointmentId
              ? { ...n, isRead: true, status }
              : n
          )
        );
      }
    } catch (err) {
      console.error("❌ Update failed", err);
      message.error("Failed to update status");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    message.success("Logged out");
    navigate("/auth");
  };

  const columns = [
    {
      title: "Patient Name",
      dataIndex: ["data", "patientName"],
    },
    {
      title: "Date",
      dataIndex: ["data", "date"],
    },
    {
      title: "Time",
      dataIndex: ["data", "time"],
    },
    {
      title: "Appointment ID",
      render: (_, record) =>
        record.status === "approved" ? (
          <strong className="doctor-appointment-id">
            {record.data?.appointmentId?.slice(-6).toUpperCase()}
          </strong>
        ) : (
          "-"
        ),
    },
    {
      title: "Status",
      render: (_, record) => {
        let status = record.status || "pending";
        let color = "orange";
        if (status === "approved") color = "green";
        if (status === "rejected") color = "red";
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Actions",
      render: (_, record) => (
        <>
          {!record.isRead ? (
            <>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() =>
                  handleStatusChange(record.data?.appointmentId, "approved")
                }
                style={{ marginRight: 8 }}
              >
                Approve
              </Button>
            <Button
  danger
  onClick={() => handleStatusChange(doctor._id, "rejected")}
  style={{ 
    color: "#ff4d4f", 
    borderColor: "#ff4d4f",
    backgroundColor: "transparent",
    fontWeight: "bold",
    boxShadow: "0 0 10px #ff4d4f99"
  }}
>
  Reject
</Button>

            </>
          ) : (
            <span style={{ color: "#aaa", marginRight: 8 }}>
              No action needed
            </span>
          )}
          <Button
            danger
            type="text"
            onClick={() =>
              handleDeleteNotification(record.data?.appointmentId)
            }
          >
            ❌
          </Button>
        </>
      ),
    },
  ];

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <Layout className={`doctor-dashboard-bg ${drawerVisible ? "drawer-open" : ""}`}>
      
      <Header className="doctor-header">
        <div className="doctor-header-left">
          <Button
            icon={<MenuOutlined />}
            type="text"
            className="neon-toggle-btn"
            onClick={() => setDrawerVisible(true)}
          />
          <span className="docspot-brand">DocSpot</span>
        </div>
        <div className="doctor-header-center">
          Welcome Dr. {user?.name || "Doctor"}
        </div>
      </Header>

      
      <Drawer
        placement="left"
        closable={false}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        className="doctor-sider"
        width={200}
      >
        <Menu
          mode="vertical"
          selectedKeys={[selectedMenu]}
          onClick={({ key }) => {
            setSelectedMenu(key);
            setDrawerVisible(false);
            if (key === "logout") handleLogout();
          }}
        >
          <Menu.Item key="dashboard">Dashboard</Menu.Item>
          <Menu.Item key="profile">Profile</Menu.Item>
          <Menu.Item key="logout">Logout</Menu.Item>
        </Menu>
      </Drawer>

      <Content className="doctor-content">
        {selectedMenu === "dashboard" ? (
          <>
            <h3 className="doctor-section-title">Appointment Requests</h3>
            <div className="doctor-table-wrapper">
              {loading ? (
                <Spin size="large" />
              ) : (
                <Table
                  columns={columns}
                  dataSource={notifications}
                  rowKey="_id"
                  pagination={{ pageSize: 5 }}
                />
              )}
            </div>
          </>
        ) : (
          <DoctorProfileForm />
        )}
      </Content>
    </Layout>
  );
};

export default DoctorDashboard;

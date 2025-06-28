import React, { useState, useEffect } from "react";
import {
  Card,
  Layout,
  Menu,
  Button,
  message,
  DatePicker,
  TimePicker,
  Modal,
  List,
  Avatar,
  Tag,
  Popover,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import {
  UserOutlined,
  EnvironmentOutlined,
  DollarCircleOutlined,
  CalendarOutlined,
  BellOutlined,
  MenuOutlined,
} from "@ant-design/icons";

import "./PatientDashboard.css";

const { Header, Content, Footer, Sider } = Layout;

const PatientDashboard = () => {
  const navigate = useNavigate();

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [open, setOpen] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const handleBookClick = (doctor) => {
    setSelectedDoctor(doctor);
    setOpen(true);
  };

  const handleBookingSubmit = async () => {
    if (!date || !time) {
      message.warning("Please select both date and time");
      return;
    }

    try {
      await axios.post(
        "/api/v1/doctor/book-appointment",
        {
          doctorId: selectedDoctor._id,
          patientId: user._id,
          doctorInfo: selectedDoctor,
          patientInfo: user,
          date: dayjs(date).format("YYYY-MM-DD"),
          time: dayjs(time).format("HH:mm"),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      message.success("Appointment request sent!");
      setOpen(false);
      setDate(null);
      setTime(null);
    } catch (err) {
      console.error(err);
      message.error("Booking failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    message.success("Logged out");
    navigate("/auth");
  };

  const fetchDoctors = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/v1/doctor/approved-doctors"
      );
      if (res.data.success) {
        setDoctors(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  const fetchPatientNotifications = async () => {
    try {
      const res = await axios.get(`/api/v1/user/notifications/${user._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.data.success) {
        setNotifications(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch patient notifications", err);
    }
  };

  const handleNotificationDelete = async (notifId) => {
    try {
      await axios.delete(`/api/v1/user/notifications/${user._id}/${notifId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotifications((prev) => prev.filter((n) => n._id !== notifId));
      message.success("Notification removed");
    } catch (err) {
      console.error("Error deleting notification:", err);
      message.error("Failed to delete notification");
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  useEffect(() => {
    fetchDoctors();
    fetchPatientNotifications();
  }, []);

  const notificationContent = (
    <List
      dataSource={notifications}
      renderItem={(notif) => (
        <List.Item
          actions={[
            <Button
              type="text"
              danger
              onClick={() => handleNotificationDelete(notif._id)}
              key="delete"
            >
              X
            </Button>,
          ]}
          key={notif._id}
        >
          ✅ Appointment with{" "}
          <strong>{notif.data?.doctorName || "Doctor"}</strong> on{" "}
          <strong>{notif.data?.date || "N/A"}</strong> at{" "}
          <strong>{notif.data?.time || "N/A"}</strong> is{" "}
          <Tag color="green">{notif.data?.status?.toUpperCase() || "APPROVED"}</Tag>
          . Your ID:{" "}
          <Tag color="purple">
            {notif.data?.appointmentId?.slice(-6).toUpperCase() || "UNKNOWN"}
          </Tag>
        </List.Item>
      )}
    />
  );

  return (
    <Layout style={{ display: 'flex', flexDirection: 'row', minHeight: '100vh' }}>
      <Sider
        collapsible={false}
        collapsed={!sidebarOpen}
        collapsedWidth={0}
        trigger={null}
        width={200}
        className="patient-sidebar"
      >
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["dashboard"]}
          onClick={({ key }) => {
            if (key === "logout") handleLogout();
          }}
        >
          <Menu.Item key="dashboard">Dashboard</Menu.Item>
          <Menu.Item key="logout">Logout</Menu.Item>
        </Menu>
      </Sider>

      <Layout
        style={{
          marginLeft: sidebarOpen ? 200 : 0,
          transition: "margin-left 0.3s",
        }}
      >
        <Header className="patient-header">
          <div className="header-left">
            <Button
              className="neon-toggle-btn"
              icon={<MenuOutlined />}
              onClick={toggleSidebar}
            />
            <div className="patient-sider-brand-small">DocSpot</div>
          </div>
          <div className="welcome-message">Welcome, {user?.name || "Patient"}</div>
          <Popover
            content={notificationContent}
            title={
              <>
                <BellOutlined /> Notifications
              </>
            }
            trigger="click"
            open={showNotifications}
            onOpenChange={() => setShowNotifications(!showNotifications)}
          >
            <Button
              className="notification-btn"
              icon={<BellOutlined />}
              shape="circle"
            />
          </Popover>
        </Header>

        <Content className="patient-content">
          <Card title="Available Doctors" className="doctors-card">
            <List
              grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }}
              dataSource={doctors}
              renderItem={(doc) => (
                <List.Item key={doc._id}>
                  <Card
                    hoverable
                    className="doctor-card"
                    bodyStyle={{ padding: 20 }}
                  >
                    <Avatar
                      size={80}
                      src={`http://localhost:5000${doc.image}`}
                      icon={<UserOutlined />}
                      className="doctor-avatar"
                    />
                    <h3 className="doctor-name">{doc.name}</h3>
                    <Tag color="blue">{doc.specialization}</Tag>
                    <p>
                      <EnvironmentOutlined /> {doc.location}
                    </p>
                    <p>
                      <CalendarOutlined /> {doc.experience} years
                    </p>
                    <p>
                      <DollarCircleOutlined /> ₹{doc.fee}
                    </p>
                    <Button
                      type="primary"
                      shape="round"
                      size="middle"
                      className="book-btn"
                      onClick={() => handleBookClick(doc)}
                    >
                      Book Now
                    </Button>
                  </Card>
                </List.Item>
              )}
            />
          </Card>
        </Content>

        <Footer className="patient-footer">DocSpot ©2025</Footer>
      </Layout>

      <Modal
        title={`Book Appointment with ${selectedDoctor?.name}`}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleBookingSubmit}
        okText="Book"
      >
        <DatePicker
          onChange={(val) => setDate(val)}
          style={{ width: "100%", marginBottom: 12 }}
        />
        <TimePicker
          onChange={(val) => setTime(val)}
          style={{ width: "100%" }}
          format="HH:mm"
        />
      </Modal>
    </Layout>
  );
};

export default PatientDashboard;

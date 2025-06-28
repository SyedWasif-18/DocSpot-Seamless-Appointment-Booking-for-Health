import React, { useEffect, useState } from "react";
import { Layout, Table, Button, message, Tag, Tabs } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import "./AdminDashboard.css";

const { Header, Content } = Layout;
const { TabPane } = Tabs;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const token = localStorage.getItem("token");

  const fetchDoctors = async (status) => {
    try {
      const res = await axios.get(`/admin/doctors?status=${status}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        setDoctors(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching doctors:", err);
      message.error("Failed to fetch doctors");
    }
  };

  useEffect(() => {
    fetchDoctors(activeTab);
  }, [activeTab]);

  const handleStatusChange = async (doctorId, status) => {
    try {
      const res = await axios.post(
        "/admin/change-doctor-status",
        { doctorId, status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data.success) {
        message.success(`Doctor ${status} successfully`);
        fetchDoctors(activeTab);
      }
    } catch (err) {
      console.error("Status update error:", err);
      message.error("Failed to update status");
    }
  };

  const columns = [
    { title: "Doctor Name", dataIndex: "name" },
    { title: "Specialization", dataIndex: "specialization" },
    { title: "Experience", dataIndex: "experience" },
    {
      title: "Fee",
      dataIndex: "fee",
      render: (fee) => `₹${fee}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => (
        <Tag
          color={
            status === "pending"
              ? "orange"
              : status === "approved"
              ? "green"
              : "red"
          }
        >
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Actions",
      render: (_, doctor) =>
        activeTab === "pending" ? (
          <>
            <Button
              type="primary"
              onClick={() => handleStatusChange(doctor._id, "approved")}
              style={{ marginRight: 8 }}
            >
              Approve
            </Button>
            <Button danger onClick={() => handleStatusChange(doctor._id, "rejected")}>
              Reject
            </Button>
          </>
        ) : (
          <span style={{ color: "#aaa" }}>No actions</span>
        ),
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    message.success("Logged out");
    navigate("/auth");
  };

  return (
    <Layout className="admin-dashboard-bg">
      <Header className="admin-header">
        <div className="admin-header-left">DocSpot</div>
        <div className="admin-header-center">Welcome, Admin</div>
        <div className="admin-header-right">
          <Button className="admin-logout-btn" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </Header>

      <h2 className="admin-section-heading">Doctor Requests</h2>

      <Content className="admin-content">
        <Tabs defaultActiveKey="pending" onChange={setActiveTab} className="admin-tabs">
          <TabPane tab="Pending" key="pending" />
          <TabPane tab="Approved" key="approved" />
          <TabPane tab="Rejected" key="rejected" />
        </Tabs>

        {doctors.length === 0 ? (
          <p className="admin-empty-msg">No doctors in this category.</p>
        ) : (
          <Table
            dataSource={doctors}
            columns={columns}
            rowKey="_id"
            bordered
            pagination={{ pageSize: 5 }}
            className="admin-table"
          />
        )}
      </Content>
    </Layout>
  );
};

export default AdminDashboard;

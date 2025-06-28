import React, { useEffect, useState } from "react";
import { Form, Input, Button, Upload, message, Card } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "../utils/axios";

const DoctorProfileForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const fetchProfile = async () => {
    try {
      const res = await axios.get("/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.data?.doctorInfo) {
        form.setFieldsValue(res.data.data.doctorInfo);
      }
    } catch (err) {
      console.error("❌ Failed to load profile", err);
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    const formData = new FormData();
    for (let key in values) {
      if (key !== "image") formData.append(key, values[key]);
    }
    if (values.image?.file) {
      formData.append("image", values.image.file);
    }

    try {
      await axios.post("/doctor/profile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      message.success("Profile updated");
    } catch (err) {
      console.error("❌ Update failed", err);
      message.error("Failed to update profile");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <Card title="Update Doctor Profile" style={{ maxWidth: 600, margin: "auto" }}>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="specialization" label="Specialization" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="experience" label="Experience (Years)" rules={[{ required: true }]}>
          <Input type="number" />
        </Form.Item>
        <Form.Item name="location" label="Location" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="fee" label="Consultation Fee" rules={[{ required: true }]}>
          <Input type="number" />
        </Form.Item>
        <Form.Item name="image" label="Profile Picture">
          <Upload maxCount={1} beforeUpload={() => false}>
            <Button icon={<UploadOutlined />}>Upload</Button>
          </Upload>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Save Profile
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default DoctorProfileForm;

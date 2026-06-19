import { Input, Form, Button, Radio, Modal, Select, notification } from "antd";
import { useState } from "react";

function AddVehicle({ owners = [], onCreated }) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const openNotification = (type, message, description) => {
    notification[type]({
      message,
      description,
      placement: "topRight",
      duration: 2,
      pauseOnHover: true,
    });
  };

  const handleSubmit = async (value) => {
    setSubmitting(true);
    try {
      const response = await fetch("http://localhost:8386/vehicles/api/v2/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...value,
          plate: value.plate?.trim().toUpperCase(),
        }),
      });
      const data = await response.json();

      if (!response.ok || data.message !== "Success") {
        throw new Error(data.message || "Có lỗi xảy ra khi gửi yêu cầu!");
      }

      openNotification("success", "Thành công", "Thêm phương tiện thành công!");
      form.resetFields();
      setIsModalVisible(false);
      onCreated?.();
    } catch (error) {
      openNotification("error", "Lỗi", error.message || "Có lỗi xảy ra khi gửi yêu cầu!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button className="btn" onClick={() => setIsModalVisible(true)}>
        Thêm phương tiện
      </button>
      <Modal
        title="Thêm phương tiện"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        centered
        width={520}
        className="vehicle-modal"
      >
        <Form form={form} layout="vertical" name="create-vehicle" onFinish={handleSubmit}>
          <Form.Item
            label="Tên chủ hộ"
            name="ownName"
            rules={[{ required: true, message: "Bắt buộc!" }]}
          >
            <Select
              placeholder="Chọn chủ hộ"
              showSearch
              optionFilterProp="children"
              notFoundContent="Không có chủ hộ"
            >
              {owners.map((owner) => (
                <Select.Option key={owner} value={owner}>
                  {owner}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Biển số xe"
            name="plate"
            normalize={(value) => value?.toUpperCase()}
            rules={[{ required: true, whitespace: true, message: "Bắt buộc!" }]}
          >
            <Input placeholder="Nhập biển số" />
          </Form.Item>

          <Form.Item
            label="Loại phương tiện"
            name="vehicle_type"
            rules={[{ required: true, message: "Bắt buộc!" }]}
          >
            <Radio.Group>
              <Radio value="Ô tô">Ô tô</Radio>
              <Radio value="Xe máy">Xe máy</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item className="vehicle-modal-actions">
            <Button onClick={() => setIsModalVisible(false)} style={{ marginRight: 8 }}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={submitting}>
              Tạo mới
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default AddVehicle;

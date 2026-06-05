import { Input, Form, Button, InputNumber, Select, notification, Modal } from "antd";
import { useState, useEffect } from "react";
import axios from "axios";

function EditFee(props) {
  const { item, onReload } = props;
  const [form] = Form.useForm();
  const [fee, setFee] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isMandatory, setIsMandatory] = useState(true);
  const [isParkingFee, setIsParkingFee] = useState(false);

  const [householdsOptions, setHouseholdsOptions] = useState([]);
  const [loadingHouseholds, setLoadingHouseholds] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:8386/household/api/v1/all")
      .then(res => {
        setHouseholdsOptions(res.data.array.map(h => ({
          household_id: h.id,
          value: h.numbers[0],
          label: `Hộ ${h.head}`,
        })));
      })
      .catch(err => console.error("Error fetching households:", err))
      .finally(() => setLoadingHouseholds(false));
  }, []);

  // Populate form whenever fee changes (modal opened for a specific item)
  useEffect(() => {
    if (fee && isModalVisible) {
      const statusValue = fee.status === "Bắt buộc" ? "required" : "unrequired";
      const isParking = fee.feeType === "parking";
      setIsMandatory(statusValue === "required");
      setIsParkingFee(isParking);
      form.setFieldsValue({
        id: fee._id,
        name: fee.name,
        amount: fee.amount,
        due: fee.due,
        status: statusValue,
        feeType: fee.feeType ?? undefined,
        vehicleType: fee.vehicleType ?? undefined,
        households: undefined,
      });
    }
  }, [fee, isModalVisible, form]);

  const showModal = (item) => {
    setFee(item);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const openNotification = (type, message, description) => {
    notification[type]({
      message, description,
      placement: "topRight", duration: 2, pauseOnHover: true,
    });
  };

  const handleSubmit = async (values) => {
    try {
      const payload = {
        id: values.id,
        name: values.name,
        amount: values.amount,
        due: values.due,
        status: values.status === "required" ? "Bắt buộc" : "Không bắt buộc",
        feeType: values.feeType,
        vehicleType: values.feeType === "parking" ? values.vehicleType : undefined,
        households: values.status === "required" ? "Tất cả" : values.households,
      };

      const response = await axios.post("http://localhost:8386/fees/api/v1/change", payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 200) {
        openNotification("success", "Thành công", "Cập nhật thành công!");
        onReload();
        setIsModalVisible(false);
        form.resetFields();
      } else {
        openNotification("error", "Thất bại", "Cập nhật thất bại!");
      }
    } catch (error) {
      openNotification("error", "Lỗi", "Có lỗi xảy ra khi gửi yêu cầu!");
    }
  };

  const formItemLayout = {
    labelCol: { xs: { span: 24 }, sm: { span: 8 } },
    wrapperCol: { xs: { span: 24 }, sm: { span: 14 } },
  };

  return (
    <>
      <button className="btn-details" onClick={() => showModal(item)}>Cập nhật</button>
      <Modal
        title="Chỉnh sửa loại phí"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          {...formItemLayout}
          layout="horizontal"
          onFinish={handleSubmit}
        >
          <Form.Item name="id" style={{ display: "none" }}>
            <Input />
          </Form.Item>
          <Form.Item label="Tên loại phí" name="name" rules={[{ required: true, message: "Bắt buộc!" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Giá/đơn vị" name="amount" rules={[{ required: true, message: "Bắt buộc!" }]}>
            <InputNumber
              formatter={(value) => `${Number(value).toLocaleString("vi-VN")}`}
              parser={(value) => value.replace(/\D/g, '')}
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item label="Thời hạn (tháng)" name="due" rules={[{ required: true, message: "Bắt buộc!" }]}>
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Loại phí" name="feeType">
            <Select
              placeholder="Chọn loại phí"
              onChange={(val) => setIsParkingFee(val === "parking")}
            >
              <Select.Option value="service">Dịch vụ</Select.Option>
              <Select.Option value="management">Quản lý</Select.Option>
              <Select.Option value="parking">Gửi xe</Select.Option>
              <Select.Option value="utility">Tiện ích</Select.Option>
              <Select.Option value="contribution">Đóng góp</Select.Option>
            </Select>
          </Form.Item>
          {isParkingFee && (
            <Form.Item label="Loại xe" name="vehicleType" rules={[{ required: true, message: "Bắt buộc!" }]}>
              <Select placeholder="Chọn loại xe">
                <Select.Option value="Xe máy">Xe máy</Select.Option>
                <Select.Option value="Ô tô">Ô tô</Select.Option>
              </Select>
            </Form.Item>
          )}
          <Form.Item label="Trạng thái" name="status">
            <Select
              placeholder="Chọn trạng thái"
              onChange={(val) => setIsMandatory(val === "required")}
            >
              <Select.Option value="required">Bắt buộc</Select.Option>
              <Select.Option value="unrequired">Không bắt buộc</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Hộ gia đình"
            name="households"
            rules={!isMandatory ? [{ required: true, message: "Chọn ít nhất 1 hộ" }] : []}
          >
            {loadingHouseholds ? (
              <p>Đang tải danh sách hộ gia đình...</p>
            ) : (
              <Select
                mode="multiple"
                style={{ width: "100%" }}
                placeholder={isMandatory ? "Tất cả hộ gia đình" : "Chọn hộ gia đình"}
                disabled={isMandatory}
                maxTagCount="responsive"
              >
                {householdsOptions.map((option) => (
                  <Select.Option key={option.value} value={option.household_id}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 8 }}>
            <Button onClick={handleCancel} style={{ marginRight: 8 }}>Hủy</Button>
            <Button type="primary" htmlType="submit">Cập nhật</Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default EditFee;

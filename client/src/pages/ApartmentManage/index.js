import { useState, useEffect, useMemo } from 'react';
import { Form, Select, Row, Col, Modal, Input, InputNumber, notification, Tag, Button, Spin } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import "../ResidentManage/style.css";

const BASE = "http://localhost:8386";

const openNotif = (type, msg) =>
  notification[type]({ message: msg, placement: "topRight", duration: 2 });

function ApartmentManage() {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ floor: "", status: "" });

  const [addVisible, setAddVisible] = useState(false);
  const [addForm] = Form.useForm();

  const [editVisible, setEditVisible] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm] = Form.useForm();

  const fetchApartments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE}/apartments/api/v1/apartments`);
      setApartments(res.data ?? []);
    } catch {
      openNotif("error", "Không thể tải danh sách căn hộ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApartments(); }, []);

  const floorOptions = useMemo(() => {
    const floors = new Set(apartments.map(a => Math.floor(a.number / 100)));
    return [
      { value: "", label: "Tất cả" },
      ...[...floors].sort((a, b) => a - b).map(f => ({ value: f, label: `Tầng ${f}` }))
    ];
  }, [apartments]);

  const filtered = useMemo(() => {
    return apartments.filter(a => {
      const floor = Math.floor(a.number / 100);
      if (filters.floor !== "" && floor !== filters.floor) return false;
      if (filters.status === "available" && a.household) return false;
      if (filters.status === "occupied" && !a.household) return false;
      return true;
    });
  }, [apartments, filters]);

  // --- Add ---
  const handleAdd = async () => {
    try {
      const values = await addForm.validateFields();
      await axios.post(`${BASE}/apartments/api/v1/create`, values);
      openNotif("success", "Thêm căn hộ thành công");
      addForm.resetFields();
      setAddVisible(false);
      fetchApartments();
    } catch (err) {
      if (err?.response?.data?.message) openNotif("error", err.response.data.message);
    }
  };

  // --- Edit ---
  const openEdit = (apt) => {
    setEditTarget(apt);
    editForm.setFieldsValue({ number: apt.number, type: apt.type, totalArea: apt.totalArea });
    setEditVisible(true);
  };

  const handleEdit = async () => {
    try {
      const values = await editForm.validateFields();
      await axios.post(`${BASE}/apartments/api/v1/edit`, { id: editTarget._id, ...values });
      openNotif("success", "Cập nhật thành công");
      setEditVisible(false);
      fetchApartments();
    } catch (err) {
      if (err?.response?.data?.message) openNotif("error", err.response.data.message);
    }
  };

  // --- Delete ---
  const handleDelete = (apt) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      icon: <ExclamationCircleOutlined />,
      content: `Xóa căn hộ số ${apt.number}?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      centered: true,
      onOk: async () => {
        try {
          await axios.post(`${BASE}/apartments/api/v1/delete`, { id: apt._id });
          openNotif("success", "Xóa thành công");
          fetchApartments();
        } catch (err) {
          openNotif("error", err?.response?.data?.message || "Không thể xóa căn hộ đang có hộ ở");
        }
      }
    });
  };

  return (
    <>
      <div className="details page2">
        <div className="recentCt page2">
          <div className="cardHeader">
            <h2>Quản lý căn hộ</h2>
            <button className="btn" onClick={() => setAddVisible(true)}>Thêm căn hộ</button>
          </div>

          <div className="household">
            <Form layout="vertical">
              <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                <Col span={6}>
                  <Form.Item label="Tầng">
                    <Select
                      allowClear
                      placeholder="Chọn tầng"
                      options={floorOptions}
                      onChange={(v) => setFilters(p => ({ ...p, floor: v ?? "" }))}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Trạng thái">
                    <Select
                      allowClear
                      placeholder="Chọn trạng thái"
                      options={[
                        { value: "", label: "Tất cả" },
                        { value: "available", label: "Trống" },
                        { value: "occupied", label: "Đã có hộ" },
                      ]}
                      onChange={(v) => setFilters(p => ({ ...p, status: v ?? "" }))}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </div>

          <table>
            <thead>
              <tr>
                <td>Số căn hộ</td>
                <td>Tầng</td>
                <td>Loại</td>
                <td>Diện tích (m²)</td>
                <td>Trạng thái</td>
                <td></td>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "32px 0" }}><Spin /></td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "32px 0", color: "#999" }}>
                    Chưa có căn hộ nào
                  </td>
                </tr>
              )}
              {filtered.map(apt => (
                <tr key={apt._id}>
                  <td>{apt.number}</td>
                  <td>{Math.floor(apt.number / 100)}</td>
                  <td>{apt.type || "—"}</td>
                  <td>{apt.totalArea}</td>
                  <td>
                    <Tag color={apt.household ? "green" : "default"}>
                      {apt.household ? "Đã có hộ" : "Trống"}
                    </Tag>
                  </td>
                  <td style={{ display: "flex", gap: 8 }}>
                    <Button
                      icon={<EditOutlined />}
                      size="small"
                      onClick={() => openEdit(apt)}
                    />
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      size="small"
                      disabled={!!apt.household}
                      title={apt.household ? "Không thể xóa căn hộ đang có hộ ở" : "Xóa"}
                      onClick={() => handleDelete(apt)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm */}
      <Modal
        title="Thêm căn hộ mới"
        open={addVisible}
        onOk={handleAdd}
        onCancel={() => { setAddVisible(false); addForm.resetFields(); }}
        okText="Thêm"
        cancelText="Hủy"
        centered
      >
        <Form form={addForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            label="Số căn hộ"
            name="number"
            rules={[{ required: true, message: "Vui lòng nhập số căn hộ" }]}
            extra="Tầng được tính tự động: số căn hộ / 100 (VD: 101 → Tầng 1)"
          >
            <InputNumber style={{ width: "100%" }} placeholder="VD: 101" min={1} />
          </Form.Item>
          <Form.Item label="Loại căn hộ" name="type">
            <Input placeholder="VD: Căn hộ chung cư" />
          </Form.Item>
          <Form.Item
            label="Diện tích (m²)"
            name="totalArea"
            rules={[{ required: true, message: "Vui lòng nhập diện tích" }]}
          >
            <InputNumber style={{ width: "100%" }} min={1} placeholder="VD: 85" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Sửa */}
      <Modal
        title={`Chỉnh sửa căn hộ ${editTarget?.number ?? ""}`}
        open={editVisible}
        onOk={handleEdit}
        onCancel={() => setEditVisible(false)}
        okText="Lưu"
        cancelText="Hủy"
        centered
      >
        <Form form={editForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            label="Số căn hộ"
            name="number"
            rules={[{ required: true, message: "Vui lòng nhập số căn hộ" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={1}
              disabled={!!editTarget?.household}
            />
          </Form.Item>
          {editTarget?.household && (
            <p style={{ color: "#999", fontSize: 12, marginTop: -12, marginBottom: 12 }}>
              Không thể đổi số căn hộ khi đang có hộ ở.
            </p>
          )}
          <Form.Item label="Loại căn hộ" name="type">
            <Input />
          </Form.Item>
          <Form.Item
            label="Diện tích (m²)"
            name="totalArea"
            rules={[{ required: true, message: "Vui lòng nhập diện tích" }]}
          >
            <InputNumber style={{ width: "100%" }} min={1} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default ApartmentManage;
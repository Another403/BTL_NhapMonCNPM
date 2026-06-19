import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./style.css";
import { CloseOutlined, EditOutlined } from "@ant-design/icons";
import { Col, Form, Input, Modal, Radio, Row, Select, Spin, notification } from "antd";
import axios from "axios";
import AddVehicle from "./AddVehicle";

const API_URL = "http://localhost:8386/vehicles/api/v2";
const HOUSEHOLD_API_URL = "http://localhost:8386/household/api/v1";

const openNotification = (type, message, description) => {
  notification[type]({
    message,
    description,
    placement: "topRight",
    duration: 2,
    pauseOnHover: true,
  });
};

function VehicleMange() {
  const [dataList, setVehicles] = useState([]);
  const [householdOptions, setHouseholdOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ ownName: undefined, plate: "" });
  const [editVisible, setEditVisible] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm] = Form.useForm();

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/vehicles`);
      setVehicles(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching vehicles data:", error);
      openNotification("error", "Lỗi", "Không tải được danh sách phương tiện!");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHouseholdOptions = useCallback(async () => {
    try {
      const firstResponse = await axios.get(`${HOUSEHOLD_API_URL}/all`);
      const firstPage = firstResponse.data;
      const totalPage = firstPage.totalPage || 1;
      const allHouseholds = [...(firstPage.array || [])];

      if (totalPage > 1) {
        const restResponses = await Promise.all(
          Array.from({ length: totalPage - 1 }, (_, index) =>
            axios.get(`${HOUSEHOLD_API_URL}/all`, { params: { page: index + 2 } }),
          ),
        );
        restResponses.forEach((response) => {
          allHouseholds.push(...(response.data.array || []));
        });
      }

      const options = [...new Set(
        allHouseholds
          .filter((household) => household.id && household.head)
          .map((household) => household.head),
      )].map((ownerName) => ({
        value: ownerName,
        label: ownerName,
      }));

      setHouseholdOptions(options);
    } catch (error) {
      console.error("Error fetching household options:", error);
      openNotification("error", "Lỗi", "Không tải được danh sách chủ hộ!");
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
    fetchHouseholdOptions();
  }, [fetchHouseholdOptions, fetchVehicles]);

  const ownerNames = useMemo(() => householdOptions.map((option) => option.value), [householdOptions]);

  const filteredData = useMemo(() => {
    const plateKeyword = filters.plate.trim().toLowerCase();

    return dataList
      .filter((owner) => !filters.ownName || owner.ownName === filters.ownName)
      .map((owner) => ({
        ...owner,
        vehicle: (owner.vehicle || []).filter((vehicle) => {
          if (!plateKeyword) return true;
          return (vehicle.plate || "").toLowerCase().includes(plateKeyword);
        }),
      }))
      .filter((owner) => owner.vehicle.length > 0);
  }, [dataList, filters]);

  const openEdit = (vehicle, owner) => {
    setEditTarget({
      household_id: owner.household_id,
      oldPlate: vehicle.plate,
    });
    editForm.setFieldsValue({
      plate: vehicle.plate,
      vehicle_type: vehicle.vehicle_type,
    });
    setEditVisible(true);
  };

  const closeEdit = () => {
    setEditVisible(false);
    setEditTarget(null);
    editForm.resetFields();
  };

  const handleEdit = async () => {
    try {
      const values = await editForm.validateFields();
      const response = await axios.post(`${API_URL}/edit`, {
        household_id: editTarget.household_id,
        oldPlate: editTarget.oldPlate,
        plate: values.plate.trim().toUpperCase(),
        vehicle_type: values.vehicle_type,
      });

      if (response.status === 200) {
        openNotification("success", "Thành công", "Cập nhật phương tiện thành công!");
        closeEdit();
        fetchVehicles();
      }
    } catch (error) {
      openNotification("error", "Lỗi", error?.response?.data?.message || "Có lỗi xảy ra!");
    }
  };

  const handleDelete = async (vehicle, owner) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: `Bạn có chắc chắn muốn xóa phương tiện biển số ${vehicle.plate}?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      centered: true,
      onOk: async () => {
        try {
          const response = await axios.post(`${API_URL}/delete`, {
            household_id: owner.household_id,
            vehicle_type: vehicle.vehicle_type,
            plate: vehicle.plate,
          });

          if (response.status === 200) {
            openNotification("success", "Thành công", "Xóa phương tiện thành công!");
            fetchVehicles();
          }
        } catch (error) {
          console.error("Error deleting vehicle:", error);
          openNotification("error", "Lỗi", error?.response?.data?.message || "Có lỗi xảy ra khi gửi yêu cầu!");
        }
      },
    });
  };

  return (
    <>
      <div className="details__vehicle">
        <div className="recentCt">
          <div className="cardHeader">
            <h2>Quản lý phương tiện</h2>
            <div className="all-button">
              <AddVehicle owners={ownerNames} onCreated={fetchVehicles} />
            </div>
          </div>

          <div className="filter_options">
            <Form layout="vertical">
              <Row className="vehicle-filter-row" gutter={[48, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item label="Tên chủ hộ">
                    <Select
                      allowClear
                      showSearch
                      placeholder="Chọn chủ hộ"
                      options={householdOptions}
                      optionFilterProp="label"
                      value={filters.ownName}
                      onChange={(value) => setFilters((prev) => ({ ...prev, ownName: value }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Biển số xe">
                    <Input
                      allowClear
                      placeholder="Nhập biển số"
                      value={filters.plate}
                      onChange={(event) => setFilters((prev) => ({ ...prev, plate: event.target.value }))}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </div>

          <Spin spinning={loading}>
            <div className="vehicle-table-wrap">
              <table className="overall">
                <thead>
                  <tr>
                    <td>Tên chủ hộ</td>
                    <td>Số lượng</td>
                    <td>Tên phương tiện</td>
                    <td>Biển số xe</td>
                    <td>Thao tác</td>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr className="vehicle-empty-row">
                      <td colSpan={5} className="vehicle-empty">
                        {loading ? "Đang tải dữ liệu..." : "Chưa có phương tiện nào được đăng ký"}
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((owner) =>
                      owner.vehicle.map((vehicle, vehicleIndex) => (
                        <tr key={`${owner.household_id}-${vehicle.plate}-${vehicleIndex}`}>
                          <td>{vehicleIndex === 0 ? owner.ownName : ""}</td>
                          <td>{vehicleIndex === 0 ? owner.vehicle.length : ""}</td>
                          <td>{vehicle.vehicle_type}</td>
                          <td>{vehicle.plate}</td>
                          <td>
                            <div className="vehicle-actions">
                              <button
                                className="btn-details"
                                type="button"
                                title="Sửa phương tiện"
                                onClick={() => openEdit(vehicle, owner)}
                              >
                                <EditOutlined />
                              </button>
                              <button
                                className="btn-details delete-icon"
                                type="button"
                                title="Xóa phương tiện"
                                onClick={() => handleDelete(vehicle, owner)}
                              >
                                <CloseOutlined />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )),
                    )
                  )}
                </tbody>
              </table>
            </div>
          </Spin>
        </div>
      </div>

      <Modal
        title={`Sửa phương tiện${editTarget?.oldPlate ? ` - ${editTarget.oldPlate}` : ""}`}
        open={editVisible}
        onOk={handleEdit}
        onCancel={closeEdit}
        okText="Lưu"
        cancelText="Hủy"
        centered
        className="vehicle-modal"
      >
        <Form form={editForm} layout="vertical" style={{ marginTop: 16 }}>
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
              <Radio value="Xe máy">Xe máy</Radio>
              <Radio value="Ô tô">Ô tô</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default VehicleMange;

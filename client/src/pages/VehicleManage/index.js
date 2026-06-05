import React, { useState, useEffect, useMemo } from 'react';
import "./style.css"
import { Form, Select, Col, Row, Modal, Input, Radio, notification } from 'antd';
import { CloseOutlined, EditOutlined } from "@ant-design/icons";
import AddVehicle from "./AddVehicle"
import axios from "axios";

function VehicleMange(){
  const [dataList, setVehicles] = useState([]);
  const fetchVehicles = async () => {
    try {
        const response = await axios.get("http://localhost:8386/vehicles/api/v2/vehicles");
        setVehicles(response.data);
    } catch (error) {
        console.error("Error fetching residents data:", error);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const householdName = [
    { value: "", label: "Tất cả" },
      ...dataList.map(item => ({
      value: item.ownName,
      label: item.ownName,
    })),
  ];


  const [filters, setFilters] = useState({ ownName: null, plate: null });

  const [editVisible, setEditVisible] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm] = Form.useForm();

  const openEdit = (vehicle, owner) => {
    setEditTarget({ household_id: owner.household_id, oldPlate: vehicle.plate, vehicle_type: vehicle.vehicle_type });
    editForm.setFieldsValue({ plate: vehicle.plate, vehicle_type: vehicle.vehicle_type });
    setEditVisible(true);
  };

  const handleEdit = async () => {
    try {
      const values = await editForm.validateFields();
      const response = await axios.post("http://localhost:8386/vehicles/api/v2/edit", {
        household_id: editTarget.household_id,
        oldPlate: editTarget.oldPlate,
        plate: values.plate,
        vehicle_type: values.vehicle_type,
      });
      if (response.status === 200) {
        openNotification("success", "Thành công", "Cập nhật phương tiện thành công!");
        setEditVisible(false);
        fetchVehicles();
      }
    } catch (error) {
      openNotification("error", "Lỗi", error?.response?.data?.message || "Có lỗi x��y ra!");
    }
  };

  const filteredData = useMemo(() => {
    return dataList
      .map(owner => ({
        ...owner,
        vehicle: owner.vehicle.filter(vehicle => {
          if (filters.plate && !vehicle.plate.toLowerCase().startsWith(filters.plate.toLowerCase())) {
            return false;
          }
          return true;
        })
      }))
      .filter(owner => {
        if (filters.ownName && !owner.ownName.toLowerCase().includes(filters.ownName.toLowerCase())) {
          return false;
        }
        return owner.vehicle.length > 0;
      });
  }, [dataList, filters]);
  
  const openNotification = (type, message, description) => {
    notification[type]({
      message,
      description,
      placement: "topRight",
      duration: 2,
      pauseOnHover: true,
    });
  };

  const handleDelete = async (vehicle,owner) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa loại phí này không?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          const response = await axios.post("http://localhost:8386/vehicles/api/v2/delete", {
            "household_id":owner.household_id,
            "ownName":owner.ownName,
            "vehicle_type":vehicle.vehicle_type,
            "plate":vehicle.plate
          }, {
            headers: {
              "Content-Type": "application/json",
            },
          }); 
          if (response.status === 200) {
            openNotification("success", "Thành công", "Xóa phương tiện thành công!");
            fetchVehicles();
          }
        } catch (error) {
            console.error("Error fetching residents data:", error);
            openNotification("error", "Lỗi", "Có lỗi xảy ra khi gửi yêu cầu !!!");
        }
      }
  })};
  
  return(
    <>
    <div className="details__vehicle">
        <div className="recentCt">
          <div className="cardHeader">
              <h2>Quản lý phương tiện</h2>
              <div className="all-button">
                <AddVehicle owners={dataList?.map(data => data?.ownName)} />
              </div>
          </div>
          <div className="filter_options">
                <Form
                  layout="vertical"
                >
                  <Row
                    gutter={{
                      xs: 8,
                      sm: 16,
                      md: 24,
                      lg: 32,
                    }}
                  >
                    <Col className="gutter-row" span={12}>
                      <Form.Item label="Tên chủ hộ">
                        <Select 
                          placeholder="Chọn chủ hộ" 
                          options={householdName}
                          onChange={(value) => setFilters((prev) => ({ ...prev, ownName: value }))}
                          style={{width: '200%'}}
                        >
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col className="gutter-row" span={12}>
                    <Form.Item label="Biển số xe:">
                      <Input 
                        placeholder="Nhập biển số" 
                        value={filters.plate} 
                        onChange={(e) => setFilters({ ...filters, plate: e.target.value })} 
                        style={{width: '200%'}}
                      />
                    </Form.Item>
                    </Col>
                  </Row>
                </Form>
              </div>

          <table className='overall'>
            <thead>
              <tr>
                <td>Tên chủ hộ</td>
                <td>Số lượng</td>
                <td>Tên phương tiện</td>
                <td>Biển số xe</td>
                <td></td>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: "32px 0", color: "#999" }}>Chưa có phương tiện nào được đăng ký</td></tr>
              )}
              {filteredData.map((owner, ownerIndex) => (
                owner.vehicle.map((vehicle, vehicleIndex) => (
                  <tr key={`${ownerIndex}-${vehicleIndex}`}>
                    <td>{vehicleIndex === 0 ? owner.ownName : ""}</td>
                    <td>{vehicleIndex === 0 ? owner.vehicle.length : ""}</td>
                    <td>{vehicle.vehicle_type}</td>
                    <td>{vehicle.plate}</td>
                    <td style={{ display: "flex", gap: 6 }}>
                      <button className="btn-details" onClick={() => openEdit(vehicle, owner)}><EditOutlined /></button>
                      <button className="btn-details delete-icon" onClick={() => handleDelete(vehicle,owner)}><CloseOutlined /></button>
                    </td>
                  </tr>
                ))
              ))}
            </tbody>
          </table>
        </div>
    </div>

      {/* Modal sửa phương tiện */}
      <Modal
        title={`Sửa phương tiện — ${editTarget?.oldPlate ?? ""}`}
        open={editVisible}
        onOk={handleEdit}
        onCancel={() => setEditVisible(false)}
        okText="Lưu"
        cancelText="Hủy"
        centered
      >
        <Form form={editForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="Biển số xe" name="plate" rules={[{ required: true, message: "Bắt buộc!" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Loại phương tiện" name="vehicle_type" rules={[{ required: true, message: "Bắt buộc!" }]}>
            <Radio.Group>
              <Radio value="Xe máy">Xe máy</Radio>
              <Radio value="Ô tô">Ô tô</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default VehicleMange;
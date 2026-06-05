import "./style.css";
import { Link } from 'react-router-dom';
import { CloseOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import axios from "axios";
import { Modal, notification, Pagination, Spin } from "antd";
import EditFee from "./EditFee";
import CreateFee from "./CreateFee";

const openNotification = (type, message, description) => {
  notification[type]({
    message,
    description,
    placement: "topRight",
    duration: 2,
    pauseOnHover: true,
  });
};

function FeeList() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limitItem, setLimitItem] = useState(8);

  const handleReload = () => setReload(r => !r);

  const fetchFees = async (page = 1) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8386/fees/api/v1/fees?page=${page}`);
      setFees(response.data.array ?? []);
      setTotalItems(response.data.totalItems ?? 0);
      setLimitItem(response.data.limitItem ?? 8);
    } catch {
      openNotification("error", "Lỗi", "Có lỗi khi tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      // Hiển thị modal xác nhận trước khi xóa
      Modal.confirm({
        title: "Xác nhận xóa",
        content: "Bạn có chắc chắn muốn xóa loại phí này không?",
        okText: "Xóa",
        okType: "danger",
        cancelText: "Hủy",
        onOk: async () => {
          try {
            const response = await axios.post(
              "http://localhost:8386/fees/api/v1/delete",
              { id },
              {
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            if (response.status === 200 || response.status === 201) {
              openNotification("success", "Thành công", "Xóa thành công!");
              await fetchFees();
            } else {
              openNotification("error", "Thất bại", "Xóa thất bại!");
            }
          } catch (error) {
            openNotification("error", "Lỗi", "Có lỗi xảy ra khi xóa!");
          }
        },
      });
    } catch (error) {
      openNotification("error", "Lỗi", "Error in delete handler!");
    }
  };

  useEffect(() => {
    fetchFees(currentPage);
  }, [reload, currentPage]);

  return (
    <>
      <div className="details__fee">
        <div className="recentCt">
          <div className="cardHeader">
            <h2>Danh sách các loại phí</h2>
            <div className="all-button">
              <CreateFee onReload={handleReload}/>
              {/* <Link to="/fee_create" className="btn">Thêm loại phí</Link> */}
              <Link to="/fee_manage" className="btn">Quay lại</Link>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <td>STT</td>
                <td>Tên phí</td>
                <td>Danh mục</td>
                <td>Giá/đơn vị</td>
                <td>Thời hạn</td>
                <td>Bắt buộc</td>
                <td></td>
              </tr>
            </thead>
            <tbody>
              {fees.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: "32px 0", color: "#999" }}>Chưa có loại phí nào</td></tr>
              )}
              {fees.map((fee, index) => {
                const feeTypeLabel = {
                  service: 'Dịch vụ', management: 'Quản lý',
                  parking: 'Gửi xe', utility: 'Tiện ích', contribution: 'Đóng góp'
                }[fee.feeType] || '—';
                return (
                  <tr key={fee._id}>
                    <td>{(currentPage - 1) * limitItem + index + 1}</td>
                    <td>{fee.name}</td>
                    <td>{feeTypeLabel}</td>
                    <td>{fee.amount.toLocaleString("vi-VN")} VNĐ</td>
                    <td>{fee.due} Tháng</td>
                    <td>{fee.status}</td>
                    <td style={{maxWidth: '80px'}}>
                      <EditFee item={fee} onReload={handleReload}/>
                      <button className="btn-details delete-icon" onClick={() => handleDelete(fee._id)}><CloseOutlined /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {totalItems > 0 && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
              <Pagination
                current={currentPage}
                pageSize={limitItem}
                total={totalItems}
                onChange={(page) => { setCurrentPage(page); }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default FeeList;
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from "react-router-dom"
import "./style.css"
import { useDispatch, useSelector } from "react-redux";
import { fetchAllPayments, fetchTotalPayments } from "../../actions/feeManage";
import { Form, Select, Col, Row, DatePicker, Modal, Input, Checkbox, InputNumber, Pagination } from 'antd';
import dayjs from 'dayjs';
import axios from "axios";
import { message } from "antd";

function FeeMange() {
  const [currentPage, setCurrentPage] = useState(1);
  const dispatch = useDispatch();
  const allPayment = useSelector((state) => state.feeManageReducer.totalPayments);
  const totalPayment = useSelector((state) => state.feePageReducer.totalPayments);
  const limitItem = useSelector((state) => state.feeManageReducer.limitItem);
  const totalItems = useSelector((state) => state.feePageReducer.totalItems);
  useEffect(() => {
    dispatch(fetchAllPayments())
  }, [dispatch])

  // Dữ liệu để lọc
  const householdName = [
    { value: "", label: "Tất cả" },
    ...[...new Set(allPayment?.map(Tpayment => Tpayment.householdHead))].map(householdHead => ({
      value: householdHead,
      label: householdHead,
    })),
  ];

  const paymentName = [
    { value: "", label: "Tất cả" },
    ...[...new Set(allPayment?.map(Tpayment => Tpayment.feeName))].map(feeName => ({
      value: feeName,
      label: feeName,
    })),
  ]

  const paymentStatus = [
    { value: "", label: "Tất cả" },
    ...[...new Set(allPayment?.map(Tpayment => Tpayment.status))].map(feeStatus => ({
      value: feeStatus,
      label: feeStatus,
    })),
  ]

  // Modal cập nhật
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [checkedPayments, setCheckedPayments] = useState([]);
  const [transactionID, setTransactionID] = useState("");

  const [detailVisible, setDetailVisible] = useState(false);
  const [detailData, setDetailData] = useState(null);

  const showDetail = async (paymentId) => {
    try {
      const res = await axios.get(`http://localhost:8386/payments/api/v1/detail?id=${paymentId}`);
      setDetailData(res.data.payment);
      setDetailVisible(true);
    } catch {
      message.error("Không thể tải chi tiết phiếu thu");
    }
  };
  
  const [filters, setFilters] = useState({
    paymentName: null,
    householdName: null,
    fromDate: null,
    toDate: null,
    paymentStatus: null
  });

  useEffect(() => {
    const params = {
      page: currentPage,
      limit: limitItem,
      feeName: filters.paymentName ? filters.paymentName : null,
      householdHead: filters.householdName ? filters.householdName : null,
      fromDate: filters.fromDate ? new Date(filters.fromDate) : null,
      toDate: filters.toDate ? new Date(filters.toDate) : null,
      status: filters.paymentStatus === "Đã thanh toán" ? "done" : filters.paymentStatus === "Chưa thanh toán" ? "undone" : null,
    };
    dispatch(fetchTotalPayments(params));
  }, [dispatch, currentPage, filters, limitItem]);


  const handleCheck = (paymentId) => {
    setCheckedPayments((prev) => {
      if (prev.includes(paymentId)) {
        return prev.filter((id) => id !== paymentId);
      } else {
        return [...prev, paymentId];
      }
    });
  };

  // Hàm mở Modal
  const showModal = () => {
    if (checkedPayments.length === 0) {
      message.warning("Vui lòng chọn ít nhất một hóa đơn chờ thanh toán");
      return;
    }

    setIsModalVisible(true);
    // Tạo ID giao dịch
    const generateTransactionID = () => {
      const now = new Date().getTime();
      const hash = now.toString(36);
      return hash.slice(-8); // Lấy 8 ký tự cuối
    };
    const transactionID = generateTransactionID();
    setTransactionID(transactionID);
  };

  // Hàm đóng Modal
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const selectedPayments = useMemo(() => {
    return allPayment?.filter(payment => checkedPayments.includes(payment.payment_id));
  }, [allPayment, checkedPayments]);

  const totalAmount = selectedPayments?.reduce(
    (sum, item) =>
      sum += item.amount * item.count,
    0
  ) || 0;

  const handlePayment = async () => {
    try {
      const response = await axios.post("http://localhost:8386/payments/api/v1/changes", {
        payment_ids: selectedPayments?.map((payment) => payment.payment_id),
        bill_id: transactionID,
        bill_time: dayjs().toISOString(),
      });

      if (response.status === 200) {
        message.success(response.data.message);
        dispatch(fetchAllPayments());
        const params = {
          page: currentPage,
          limit: limitItem,
          feeName: filters.paymentName ? filters.paymentName : null,
          householdHead: filters.householdName ? filters.householdName : null,
          fromDate: filters.fromDate ? new Date(filters.fromDate) : null,
          toDate: filters.toDate ? new Date(filters.toDate) : null,
          status: filters.paymentStatus === "Đã thanh toán" ? "done" : filters.paymentStatus === "Chưa thanh toán" ? "undone" : null,
        };
        dispatch(fetchTotalPayments(params));
        handleCancel();
        setCheckedPayments([]);
      } else {
        message.error("Có lỗi xảy ra khi thanh toán hóa đơn.");
      }
    } catch (error) {
      console.error("Error while updating payments:", error);
      message.error("Lỗi máy chủ. Vui lòng thử lại sau.");
    }
  };

  return (
    <>
      <div className="details__fee">
        
        {/* Phần Header trang */}
        <div className="cardHeader" style={{ padding: "0 10px", alignItems: "center" }}>
          <div>
            <h2 style={{ color: "#2a2185", margin: 0, fontSize: "24px", fontWeight: "bold" }}>Quản lý thu phí chung cư</h2>
          </div>
          <Link to="/fee_list">
            <button className="btn btn-details" style={{ backgroundColor: "#2a2185", fontSize: "16px", padding: "12px 24px", fontWeight: "600", boxShadow: "0 4px 12px rgba(30, 27, 75, 0.15)" }}>
              Danh sách các loại phí
            </button>
          </Link>
        </div>

        {/* Khối 1: Bộ lọc (Được tách thành 1 thẻ Card riêng) */}
        <div className="recentCt filter_fee" style={{ minHeight: "auto", paddingBottom: "10px" }}>
          <Form layout="vertical">
            <Row gutter={24}>
              <Col flex={1}>
                <Form.Item label="Tên khoản thu">
                  <Select
                    style={{ width: "100%" }}
                    placeholder="Chọn khoản thu"
                    options={paymentName}
                    onChange={(value) => setFilters((prev) => ({ ...prev, paymentName: value }))}
                  />
                </Form.Item>
              </Col>
              <Col flex={1}>
                <Form.Item label="Tên chủ hộ">
                  <Select
                    style={{ width: "100%" }}
                    showSearch
                    placeholder="Chọn chủ hộ"
                    filterOption={(input, option) => (option.label).includes(input)}
                    options={householdName}
                    onChange={(value) => setFilters((prev) => ({ ...prev, householdName: value }))}
                  />
                </Form.Item>
              </Col>
              <Col flex={1}>
                <Form.Item label="Trạng thái">
                  <Select
                    style={{ width: "100%" }}
                    showSearch
                    placeholder="Chọn trạng thái"
                    filterOption={(input, option) => (option.label).includes(input)}
                    options={paymentStatus}
                    onChange={(value) => setFilters((prev) => ({ ...prev, paymentStatus: value }))}
                  />
                </Form.Item>
              </Col>
              <Col flex={1}>
                <Form.Item label="Từ ngày">
                  <DatePicker
                    style={{ width: "100%" }}
                    onChange={(date) =>
                      setFilters((prev) => ({ ...prev, fromDate: date ? dayjs(date).format('YYYY-MM-DD') : null }))
                    }
                  />
                </Form.Item>
              </Col>
              <Col flex={1}>
                <Form.Item label="Đến ngày">
                  <DatePicker
                    style={{ width: "100%" }}
                    onChange={(date) =>
                      setFilters((prev) => ({ ...prev, toDate: date ? dayjs(date).format('YYYY-MM-DD') : null }))
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>

        {/* Khối 2: Bảng dữ liệu (Tách thành 1 thẻ Card riêng) */}
        <div className="recentCt">
          <table className='overall'>
            <thead>
              <tr>
                <td>ID hoá đơn</td>
                <td>Hạn nộp</td>
                <td>Tên hộ dân cư</td>
                <td>Tên khoản thu</td>
                <td>Số tiền cần thu</td>
                <td>Trạng thái</td>
                <td style={{ textAlign: "center" }}>
                  <button 
                    className="btn btn-details" 
                    onClick={showModal}
                    disabled={checkedPayments.length === 0}
                    style={{ backgroundColor: "#10b981", boxShadow: "0 4px 10px rgba(16, 185, 129, 0.2)" }}
                  >
                    Cập nhật
                  </button>
                </td>
              </tr>
            </thead>
            <tbody>
              {(!totalPayment || totalPayment.length === 0) && (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: "32px 0", color: "#999" }}>Chưa có phiếu thu nào</td></tr>
              )}
              {totalPayment?.map((Tpayment, index) => (
                <tr key={index}>
                  <td>
                    <span
                      style={{ cursor: "pointer", color: "#4f46e5", fontWeight: "600", textDecoration: "underline", padding: 0 }}
                      onClick={() => showDetail(Tpayment.payment_id)}
                    >
                      {Tpayment.payment_id}
                    </span>
                  </td>
                  <td>{dayjs(Tpayment.payment_date).format('DD/MM/YYYY')}</td>
                  <td style={{ fontWeight: "500", color: "#1f2937" }}>{Tpayment.householdHead}</td>
                  <td>{Tpayment.payment_name}</td>
                  <td style={{ fontWeight: "600" }}>
                    {Tpayment.amount && Tpayment.count ? Number(Tpayment.amount * Tpayment.count).toLocaleString("vi-VN") : "0"} VNĐ
                  </td>
                  <td>
                    {/* Badge trạng thái tự động đổi màu */}
                    <span className={Tpayment.status === "Đã thanh toán" ? "status-paid" : "status-unpaid"}>
                      {Tpayment.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <Checkbox
                      className='checkbox-btn'
                      checked={checkedPayments.includes(Tpayment.payment_id)}
                      onChange={() => handleCheck(Tpayment.payment_id)}
                      disabled={Tpayment.status === "Đã thanh toán"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalItems > 0 && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
              <Pagination
                current={currentPage}
                pageSize={limitItem}
                total={totalItems}
                onChange={(page) => setCurrentPage(page)}
              />
            </div>
          )}
        </div>

        {/* Modal Thanh Toán Giữ Nguyên */}
        <Modal
          title={`Thanh toán hoá đơn cho hộ: `}
          open={isModalVisible}
          onCancel={handleCancel}
          okText="Thanh toán"
          cancelText="Hủy"
          onOk={handlePayment}
          okButtonProps={{ style: { backgroundColor: '#10b981', borderColor: '#10b981' } }}
        >
          <Form layout="horizontal">
            <Form.Item label="ID giao dịch">
              <Input value={transactionID} readOnly />
            </Form.Item>
            <hr />
            <table className="payment">
              <thead>
                <tr>
                  <td>ID hoá đơn</td>
                  <td>Loại phí</td>
                  <td>Giá (VNĐ)</td>
                  <td>Hạn nộp</td>
                </tr>
              </thead>
              <tbody>
                {selectedPayments?.map((Tpayment, index) => (
                  <tr key={index}>
                    <td>{Tpayment.payment_id}</td>
                    <td>{Tpayment.feeName}</td>
                    <td>{Number(Tpayment.amount * Tpayment.count).toLocaleString('vi-VN')}</td>
                    <td>{dayjs(Tpayment.payment_date).format('DD/MM/YYYY')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <hr />
            <Form.Item>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item label="Ngày thanh toán">
                    <Input value={dayjs().format('DD/MM/YYYY')} readOnly />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Tổng (VNĐ):"
                    labelCol={{ span: 10 }}
                    wrapperCol={{ span: 14 }}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      value={totalAmount}
                      readOnly
                      formatter={(value) => `${Number(value).toLocaleString("vi-VN")}`}
                      parser={(value) => value.replace(/\D/g, '')}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form.Item>
          </Form>
        </Modal>
      </div>

      {/* Modal chi tiết phiếu thu Giữ Nguyên */}
      <Modal
        title={`Chi tiết phiếu thu — ${detailData?.payment_id ?? ""}`}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={<button className="btn btn-details" onClick={() => setDetailVisible(false)}>Đóng</button>}
        centered
      >
        {detailData && (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {[
                ["Tên khoản phí", detailData.feeName ?? "—"],
                ["Loại phí", { service: "Dịch vụ", management: "Quản lý", parking: "Gửi xe", utility: "Tiện ích", contribution: "Đóng góp" }[detailData.feeType] ?? "—"],
                ["Số tiền", `${(detailData.amount * (detailData.count || 1)).toLocaleString("vi-VN")} VNĐ`],
                ["Hạn nộp", dayjs(detailData.payment_date).format("DD/MM/YYYY")],
                ["Trạng thái", <span className={detailData.status === "Đã thanh toán" ? "status-paid" : "status-unpaid"}>{detailData.status}</span>],
                ["ID giao dịch", detailData.bill_id ?? "Chưa thanh toán"],
                ["Thời gian thanh toán", detailData.bill_time ? dayjs(detailData.bill_time).format("DD/MM/YYYY HH:mm") : "—"],
              ].map(([label, value], i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: "12px 12px", color: "#6b7280", width: "40%" }}>{label}</td>
                  <td style={{ padding: "12px 12px", fontWeight: 500, color: "#1f2937" }}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Modal>
    </>
  )
}
export default FeeMange;

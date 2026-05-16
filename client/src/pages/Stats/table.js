import "./stats.scss"
import { useState, useEffect } from 'react'
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

function Table(){
  const totalPaymentData = useSelector((state) => state.feeManageReducer1.totalPayment) || [];
  const [showAll, setShowAll] = useState(false);
  const visibleData = showAll ? totalPaymentData : totalPaymentData.slice(0, 3);

  const [feeTypeStats, setFeeTypeStats] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8386/payments/api/v1/feeTypeStats", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => setFeeTypeStats(data.data ?? []))
      .catch(() => {});
  }, []);

  return (
    <>
      <div className="container__body">
        <main>
          <div className="recent_order">
            <h2>Thống kê các khoản thu</h2>
            <table>
              <thead>
                <tr>
                  <th>Tên chủ căn hộ</th>
                  <th>Tổng phải nộp (VNĐ)</th>
                  <th>Tổng thu (VNĐ)</th>
                  <th>Tỉ lệ</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {totalPaymentData.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: "center", padding: "24px 0", color: "#999" }}>Chưa có dữ liệu</td></tr>
                )}
                {visibleData.map((item) => (
                  <tr key={item.household_id}>
                    <td>{item.headName}</td>
                    <td>{item.totalAmount.toLocaleString("vi-VN")} VNĐ</td>
                    <td>{(item.totalAmount - item.unpaidAmount).toLocaleString("vi-VN")} VNĐ</td>
                    <td>{item.totalAmount > 0 ? Math.floor(((item.totalAmount - item.unpaidAmount) / item.totalAmount) * 100) : 0}%</td>
                    <td>
                      {item.household_id
                        ? <Link to={`/detail/${item.household_id}`} className="primary">Chi tiết</Link>
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPaymentData.length > 3 && (
              <button
                type="button"
                onClick={() => setShowAll(!showAll)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit' }}
              >
                {showAll ? "Thu gọn" : "Xem tất cả"}
              </button>
            )}
          </div>

          <div className="recent_order" style={{ marginTop: 32 }}>
            <h2>Thống kê theo loại phí</h2>
            <table>
              <thead>
                <tr>
                  <th>Loại phí</th>
                  <th>Tổng phải thu (VNĐ)</th>
                  <th>Đã thu (VNĐ)</th>
                  <th>Chưa thu (VNĐ)</th>
                  <th>Tỉ lệ</th>
                </tr>
              </thead>
              <tbody>
                {feeTypeStats.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: "center", padding: "24px 0", color: "#999" }}>Chưa có dữ liệu</td></tr>
                )}
                {feeTypeStats.map((item) => (
                  <tr key={item.feeType}>
                    <td>{item.label}</td>
                    <td>{item.totalAmount.toLocaleString("vi-VN")} VNĐ</td>
                    <td>{item.paidAmount.toLocaleString("vi-VN")} VNĐ</td>
                    <td>{item.unpaidAmount.toLocaleString("vi-VN")} VNĐ</td>
                    <td>{item.totalAmount > 0 ? Math.floor((item.paidAmount / item.totalAmount) * 100) : 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </>
  )
}

export default Table

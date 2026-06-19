import "./stats.scss"
import { useState, useEffect } from 'react'
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

function Table(){
  const totalPaymentData = useSelector((state) => state.feeManageReducer1.totalPayment) || [];
  const [showAll, setShowAll] = useState(false);
  const visibleData = showAll ? totalPaymentData : totalPaymentData.slice(0, 3);
  const moneyFormatter = new Intl.NumberFormat("vi-VN");
  const getPaidAmount = (item) => Math.max(Number(item.totalAmount || 0) - Number(item.unpaidAmount || 0), 0);
  const getPercent = (paid, expected) => {
    if (!expected) return 0;
    return Math.min(Math.floor((paid / expected) * 100), 100);
  };

  const [feeTypeStats, setFeeTypeStats] = useState([]);
  const [feeTypeStatsLoading, setFeeTypeStatsLoading] = useState(true);
  const [feeTypeStatsError, setFeeTypeStatsError] = useState("");

  useEffect(() => {
    setFeeTypeStatsLoading(true);
    setFeeTypeStatsError("");

    fetch("http://localhost:8386/payments/api/v1/feeTypeStats", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })
      .then(res => {
        if (!res.ok) {
          throw new Error("Không thể tải thống kê theo loại phí");
        }
        return res.json();
      })
      .then(data => setFeeTypeStats(data.data ?? []))
      .catch((error) => {
        setFeeTypeStats([]);
        setFeeTypeStatsError(error.message);
      })
      .finally(() => setFeeTypeStatsLoading(false));
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
                    <td>{moneyFormatter.format(Number(item.totalAmount || 0))} VNĐ</td>
                    <td>{moneyFormatter.format(getPaidAmount(item))} VNĐ</td>
                    <td>{getPercent(getPaidAmount(item), Number(item.totalAmount || 0))}%</td>
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
                {feeTypeStatsLoading && (
                  <tr><td colSpan={5} style={{ textAlign: "center", padding: "24px 0", color: "#999" }}>Đang tải dữ liệu...</td></tr>
                )}
                {!feeTypeStatsLoading && feeTypeStatsError && (
                  <tr><td colSpan={5} style={{ textAlign: "center", padding: "24px 0", color: "#ef4444" }}>{feeTypeStatsError}</td></tr>
                )}
                {!feeTypeStatsLoading && !feeTypeStatsError && feeTypeStats.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: "center", padding: "24px 0", color: "#999" }}>Chưa có dữ liệu</td></tr>
                )}
                {!feeTypeStatsLoading && !feeTypeStatsError && feeTypeStats.map((item) => (
                  <tr key={item.feeType}>
                    <td>{item.label}</td>
                    <td>{moneyFormatter.format(Number(item.totalAmount || 0))} VNĐ</td>
                    <td>{moneyFormatter.format(Number(item.paidAmount || 0))} VNĐ</td>
                    <td>{moneyFormatter.format(Number(item.unpaidAmount || 0))} VNĐ</td>
                    <td>{getPercent(Number(item.paidAmount || 0), Number(item.totalAmount || 0))}%</td>
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

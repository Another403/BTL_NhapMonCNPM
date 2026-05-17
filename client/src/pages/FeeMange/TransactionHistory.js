import "./style.css"
import { useState, useEffect } from "react"
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { DatePicker, Form, Empty } from 'antd';
import dayjs from 'dayjs';

function TransactionHistory(){
  const { household_id } = useParams();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(dayjs());

  useEffect(() => {
    fetch(`http://localhost:8386/payments/api/v1/history?household_id=${household_id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        setTransactions(data.array ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [household_id]);

  const filtered = transactions.filter(tx => {
    if (!selectedMonth || !tx.bill_time) return true;
    const t = dayjs(tx.bill_time);
    return t.month() === selectedMonth.month() && t.year() === selectedMonth.year();
  });

  return(
    <>
      <div className="details__fee">
        <div className="recentCt">
          <div className="cardHeader">
              <h2>Lịch sử giao dịch</h2>
              <div className="filter-month">
                <Form.Item label="Thời gian:">
                  <DatePicker
                    picker="month"
                    value={selectedMonth}
                    onChange={(date) => setSelectedMonth(date)}
                    format="MM/YYYY"
                  />
                </Form.Item>
              </div>
              <div className="all-button">
                <Link to={`/detail/${household_id}`} className="btn">Quay lại</Link>
              </div>
          </div>

          <table>
            <thead>
              <tr>
                <td>ID giao dịch</td>
                <td>Thời gian</td>
                <td>Khoản phí</td>
                <td>Tổng tiền</td>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={4} style={{ textAlign: "center", padding: "32px 0" }}>Đang tải...</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: "center", padding: "32px 0", color: "#999" }}>Chưa có giao dịch nào</td></tr>
              )}
              {!loading && filtered.map((tx) => (
                <tr key={tx.bill_id}>
                  <td>{tx.bill_id}</td>
                  <td>{tx.bill_time ? dayjs(tx.bill_time).format("DD/MM/YYYY HH:mm") : "—"}</td>
                  <td>{tx.payments.map(p => p.payment_name).join(", ")}</td>
                  <td>{tx.total_amount.toLocaleString("vi-VN")} VNĐ</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default TransactionHistory

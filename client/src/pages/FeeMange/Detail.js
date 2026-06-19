import "./style.css"
import {useState, useEffect} from "react"
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { useParams } from 'react-router-dom';
import { fetchFees, fetchHouseholdDetail } from "../../actions";
import { DatePicker, Form } from 'antd';
import dayjs from 'dayjs';
import { HistoryOutlined } from "@ant-design/icons";

function Detail(){
  const dispatch = useDispatch();
  const { household_id } = useParams();
  const fees = useSelector(state => state.feeDetailReducer.fees);
  const households = useSelector(state => state.householdDetailReducer.households.array);
  console.log(households);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const moneyFormatter = new Intl.NumberFormat("vi-VN");

  useEffect(() => {
    Promise.all([
      dispatch(fetchFees(household_id)),
      dispatch(fetchHouseholdDetail(household_id))
    ])
    .catch((error) => {
      console.error("Error in one or both API calls:", error);
    });
  }, [dispatch, household_id]);
  if (!fees || !households || households.length === 0) {
    return <div>Đang tải dữ liệu...</div>;
  }

  const filteredFees = fees.array?.filter((fee) => {
    if (!selectedMonth) return true;
    const feeMonth = dayjs(fee.payment_date);
    return feeMonth.month() === selectedMonth.month() && feeMonth.year() === selectedMonth.year();
  }) || [];

  const sortedFees = [...filteredFees].sort((a, b) => {
    if (a.status === 'Chưa thanh toán' && b.status === 'Đã thanh toán') {
      return -1;
    }
    if (a.status === 'Đã thanh toán' && b.status === 'Chưa thanh toán') {
      return 1;
    }
    return 0;
  });
    
  return (
    <>
      <div className="details__fee">
        <div className="recentCt">
          <div className="cardHeader">
              <h2>Chi tiết hoá đơn của hộ: {households[0]?.head || "Loading...."}</h2>
              <div className="filter-month">
                <Form.Item label="Thời gian:">
                <DatePicker 
                  picker="month" 
                  value={selectedMonth} 
                  onChange={(date) => setSelectedMonth(date)}
                  format="MM/YYYY"
                  placeholder="Tất cả tháng"
                  allowClear
                />
                </Form.Item>
              </div>
              <div className="all-button">
                <Link to={`/transactionHis/${household_id}`} className="btn"><HistoryOutlined /></Link>
                <Link to="/stats" className="btn">Quay lại</Link>
              </div>
          </div>

          <table>
            <thead>
              <tr>
                <td>Loại phí</td>
                <td>Số đơn vị</td>
                <td>Số tiền</td>
                <td>Hạn nộp</td>
                <td>Tình trạng</td>
                <td>Trạng thái</td>
              </tr>
            </thead>
            <tbody>
              {sortedFees.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "32px 0", color: "#999" }}>
                    Không có khoản thu phù hợp
                  </td>
                </tr>
              )}
              {sortedFees.map((fee, index) => (
                <tr key={index}>
                  <td>{fee.payment_name}</td>
                  <td>{fee.count || 1}</td>
                  <td> {moneyFormatter.format(Number(fee.amount || 0) * Number(fee.count || 1))} VNĐ</td>
                  <td>
                    {fee.payment_date ? dayjs(fee.payment_date).format("DD/MM/YYYY") : 'Chưa có ngày'}                                     
                  </td>
                  <td>
                    {fee.payment_date && new Date(fee.payment_date) <= new Date() ? 'Đến hạn thanh toán' : 'Chưa đến hạn thanh toán'}
                  </td>
                  <td>
                      <span className={fee.status === 'Đã thanh toán' ? 'status-paid' : 'status-unpaid'}>
                        {fee.status === 'Đã thanh toán' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                      </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
export default Detail

import "./stats.scss";
import profile from "./images/profile-1.jpg";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPayments, fetchTotalPayment } from "../../actions";

function Chart() {
  const dispatch = useDispatch();
  const payments = useSelector((state) => state.chartReducer.payments);
  const totalPaymentData = useSelector((state) => state.feeManageReducer1.totalPayment || []);
  const r = 30;
  const circumference = 2 * Math.PI * r;
  const moneyFormatter = new Intl.NumberFormat("vi-VN");

  const getPaidAmount = (item) => Math.max(Number(item.totalAmount || 0) - Number(item.unpaidAmount || 0), 0);
  const getPercent = (paid, expected) => {
    if (!expected) return 0;
    return Math.min(Math.floor((paid / expected) * 100), 100);
  };
  const getDashOffset = (percent) => circumference * (1 - percent / 100);

  const householdsWithFees = totalPaymentData.filter((item) => Number(item.totalAmount || 0) > 0);
  const payFull = householdsWithFees.reduce(
    (count, item) => (getPaidAmount(item) >= Number(item.totalAmount || 0) ? count + 1 : count),
    0
  );
  const paidTotal = totalPaymentData.reduce((sum, item) => sum + getPaidAmount(item), 0);
  const expectedTotal = totalPaymentData.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);
  const payFullPercent = getPercent(payFull, householdsWithFees.length);
  const paidTotalPercent = getPercent(paidTotal, expectedTotal);

  useEffect(() => {
    dispatch(fetchPayments());
    dispatch(fetchTotalPayment());
  }, [dispatch]);

  const mainRef = useRef(null);
  const recentUpdatesRef = useRef(null);

  const syncHeight = () => {
    if (mainRef.current && recentUpdatesRef.current) {
      recentUpdatesRef.current.style.height = `${mainRef.current.offsetHeight}px`;
    }
  };

  useEffect(() => {
    syncHeight();
    window.addEventListener("resize", syncHeight);
    return () => {
      window.removeEventListener("resize", syncHeight);
    };
  }, [totalPaymentData]);
  // if (!totalPaymentData.length) {
  //   return <p>Loading...</p>;
  // }
  return (
    <>
      {/* Insights Part */}
      <div className="container__header">
        <main>
          <h2>Biểu đồ</h2>
          <div className="insights">
            <div className="pay-full" ref={mainRef}>
              <span className="material-symbols-sharp">trending_up</span>
              <div className="middle">
                <div className="left">
                  <h3>Số hộ đã nộp đủ</h3>
                  <h1>
                    {payFull}/{householdsWithFees.length}
                  </h1>
                </div>
                <div className="progress">
                  <svg>
                    <circle
                      r={r}
                      cy="40"
                      cx="40"
                      strokeDasharray={circumference}
                      strokeDashoffset={getDashOffset(payFullPercent)}
                      transform={`rotate(-90, 40, 40)`}
                    ></circle>
                  </svg>
                  <div className="number">
                    <p>{payFullPercent}%</p>
                  </div>
                </div>
              </div>
              <small>Trong các hộ có khoản phải nộp</small>
            </div>

            <div className="payment">
              <span className="material-symbols-sharp">local_mall</span>
              <div className="middle">
                <div className="left">
                  <h3>Tổng thu</h3>
                  <h1>
                    {moneyFormatter.format(paidTotal)} VNĐ / {moneyFormatter.format(expectedTotal)} VNĐ
                  </h1>
                </div>
                <div className="progress">
                  <svg>
                    <circle
                      r={r}
                      cy="40"
                      cx="40"
                      strokeDasharray={circumference}
                      strokeDashoffset={getDashOffset(paidTotalPercent)}
                      transform={`rotate(-90, 40, 40)`}
                    ></circle>
                  </svg>
                  <div className="number">
                    <p>{paidTotalPercent}%</p>
                  </div>
                </div>
              </div>
              <small>Tổng quan</small>
            </div>
          </div>
        </main>
        {/* <!------------------
         end main Insights
        ------------------->
      <!----------------
        start right main 
      ----------------------> */}
        <div className="right">
          <h2>Cập nhật gần đây</h2>
          <div className="recent_updates" ref={recentUpdatesRef}>
            <div className="updates">
              {payments.array?.length > 0 ? payments.array.map((payment) => {
                const amount = Number(payment.amount || 0) * Number(payment.count || 1);

                return (
                  <div className="update" key={payment.payment_id || payment._id}>
                    <img src={profile} alt="" />
                    <div className="message">
                      <p>
                        <b>{payment.householdHead}</b> Đã đóng {moneyFormatter.format(amount)} VNĐ {payment.payment_name}
                      </p>
                    </div>
                  </div>
                );
              }) : (
                <p style={{ color: "#999", textAlign: "center", padding: "24px 0" }}>Chưa có giao dịch gần đây</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Chart;

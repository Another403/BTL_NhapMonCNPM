import "./asset/css/style.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { changePassword } from "../../actions";
import { message } from "antd";
import { 
  LockOutlined, 
  EyeOutlined, 
  EyeInvisibleOutlined, 
  SafetyCertificateOutlined, 
  CheckCircleFilled 
} from "@ant-design/icons";

function Password() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // State lưu giá trị input
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // State ẩn/hiện mật khẩu
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Biểu thức Regex kiểm tra mật khẩu
  const minLength = /.{8,}/;
  const hasUpperCase = /[A-Z]/;
  const hasLowerCase = /[a-z]/;
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;
  const hasNumber = /\d/;

  // State đánh giá tiêu chí
  const [isMinLengthValid, setMinLengthValid] = useState(false);
  const [isHasUpperCase, setIsHasUpperCase] = useState(false);
  const [isHasLowerCase, setIsHasLowerCase] = useState(false);
  const [isHasSpecialChar, setIsHasSpecialChar] = useState(false);
  const [isHasNumber, setIsHasNumber] = useState(false);
  const [isNewValid, setIsNewValid] = useState(false);

  // Xử lý thay đổi mật khẩu mới
  const handleNewPassword = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    
    // Đánh giá từng tiêu chí
    setMinLengthValid(minLength.test(value));
    setIsHasUpperCase(hasUpperCase.test(value));
    setIsHasLowerCase(hasLowerCase.test(value));
    setIsHasSpecialChar(hasSpecialChar.test(value));
    setIsHasNumber(hasNumber.test(value));

    // Đánh giá tổng thể
    setIsNewValid(
      minLength.test(value) &&
      hasUpperCase.test(value) &&
      hasLowerCase.test(value) &&
      hasSpecialChar.test(value) &&
      hasNumber.test(value)
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isNewValid) {
      message.error("Mật khẩu mới không hợp lệ. Vui lòng kiểm tra lại yêu cầu an toàn.");
      return;
    }
    if (newPassword !== confirmPassword) {
      message.error("Mật khẩu xác nhận không khớp.");
      return;
    }
    dispatch(changePassword(oldPassword, newPassword, navigate));
  };

  return (
    <div className="password-main">
      <section className="change-password">
        <div className="password-container">
          <div className="password-content">
            <div className="password-form-wrapper">
              <h2 className="password-form-title">Thiết lập mật khẩu mới</h2>
              <form onSubmit={handleSubmit} className="custom-password-form">
                
                {/* Mật khẩu hiện tại */}
                <div className="input-group">
                  <label>MẬT KHẨU HIỆN TẠI</label>
                  <div className="input-wrapper">
                    <LockOutlined className="icon-left" />
                    <input
                      type={showOld ? "text" : "password"}
                      placeholder="Nhập mật khẩu cũ"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                    />
                    <span className="icon-right" onClick={() => setShowOld(!showOld)}>
                      {showOld ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                    </span>
                  </div>
                </div>

                {/* Mật khẩu mới */}
                <div className="input-group">
                  <label>MẬT KHẨU MỚI</label>
                  <div className={`input-wrapper ${newPassword && (isNewValid ? "valid" : "invalid")}`}>
                    <LockOutlined className="icon-left" />
                    <input
                      type={showNew ? "text" : "password"}
                      placeholder="Nhập mật khẩu mới"
                      value={newPassword}
                      onChange={handleNewPassword}
                    />
                    <span className="icon-right" onClick={() => setShowNew(!showNew)}>
                      {showNew ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                    </span>
                  </div>
                </div>

                {/* Xác nhận mật khẩu mới */}
                <div className="input-group">
                  <label>XÁC NHẬN MẬT KHẨU MỚI</label>
                  <div className={`input-wrapper ${confirmPassword && (confirmPassword === newPassword ? "valid" : "invalid")}`}>
                    <LockOutlined className="icon-left" />
                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="Nhập lại mật khẩu mới"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <span className="icon-right" onClick={() => setShowConfirm(!showConfirm)}>
                      {showConfirm ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                    </span>
                  </div>
                </div>

                {/* Khối yêu cầu an toàn */}
                <div className="requirements-box">
                  <div className="req-header">
                    <SafetyCertificateOutlined className="req-icon" />
                    <span>YÊU CẦU AN TOÀN</span>
                  </div>
                  <p className="req-desc">Để bảo vệ tài khoản, mật khẩu của bạn cần đáp ứng các tiêu chí sau:</p>
                  <ul className="req-list">
                    <li className={isMinLengthValid ? "req-met" : ""}>
                      {isMinLengthValid ? <CheckCircleFilled className="check-icon" /> : <div className="empty-circle"></div>}
                      Có ít nhất <strong>8 ký tự</strong>
                    </li>
                    <li className={isHasUpperCase ? "req-met" : ""}>
                      {isHasUpperCase ? <CheckCircleFilled className="check-icon" /> : <div className="empty-circle"></div>}
                      Chứa ít nhất <strong>1 chữ in hoa</strong> (A-Z)
                    </li>
                    <li className={isHasLowerCase ? "req-met" : ""}>
                      {isHasLowerCase ? <CheckCircleFilled className="check-icon" /> : <div className="empty-circle"></div>}
                      Chứa ít nhất <strong>1 chữ in thường</strong> (a-z)
                    </li>
                    <li className={isHasNumber ? "req-met" : ""}>
                      {isHasNumber ? <CheckCircleFilled className="check-icon" /> : <div className="empty-circle"></div>}
                      Chứa ít nhất <strong>1 số</strong> (0-9)
                    </li>
                    <li className={isHasSpecialChar ? "req-met" : ""}>
                      {isHasSpecialChar ? <CheckCircleFilled className="check-icon" /> : <div className="empty-circle"></div>}
                      Chứa ít nhất <strong>1 ký tự đặc biệt</strong> (!@#$%^&*)
                    </li>
                  </ul>
                </div>

                {/* Nút thao tác */}
                <div className="action-buttons">
                  <button type="button" className="btn-cancel" onClick={() => navigate(-1)}>Hủy bỏ</button>
                  <button type="submit" className="btn-submit">Cập nhật mật khẩu</button>
                </div>

              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Password;
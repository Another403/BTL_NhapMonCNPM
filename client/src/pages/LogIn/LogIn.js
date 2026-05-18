import "./asset/css/material-design-iconic-font.min.css";
import "./asset/css/style.css";
import signInImg from "./asset/images/signin-image.jpg";
import signUpImg from "./asset/images/signup-image.jpg";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LogIn() {
  const [isSignUp, setIsSignUp] = useState(false);

  const [loginName, setLoginName] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [remember, setRemember] = useState(false);

  // Thêm state này để lưu lỗi đăng nhập
  const [loginError, setLoginError] = useState("");

  const [regFullname, setRegFullname] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  // LỖI TRỐNG THÔNG TIN 
  const [errFullname, setErrFullname] = useState("");
  const [errUsername, setErrUsername] = useState("");
  const [errPassword, setErrPassword] = useState("");
  const [errConfirm, setErrConfirm] = useState("");

  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError(""); // Xóa lỗi cũ khi bắt đầu gửi request mới

    fetch("http://localhost:8386/auth/api/v1/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: loginName, password: loginPassword, remember }),
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        if (data.message === "Login success") {
          navigate("/dashboard");
        } else {
          // Thay thế alert(data.message) bằng set state
          setLoginError("Tên đăng nhập hoặc mật khẩu không chính xác!");
        }
      });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    
    // 1. Xóa các lỗi cũ trước khi kiểm tra lại
    setErrFullname("");
    setErrUsername("");
    setErrPassword("");
    setErrConfirm("");

    let isValid = true;

    // 2. Kiểm tra từng trường dữ liệu
    if (!regFullname.trim()) {
      setErrFullname("Bạn tên gì?");
      isValid = false;
    }
    if (!regUsername.trim()) {
      setErrUsername("Vui lòng nhập địa chỉ email hợp lệ.");
      isValid = false;
    }
    if (!regPassword) {
      setErrPassword("Vui lòng nhập mật khẩu.");
      isValid = false;
    }
    if (!regConfirm) {
      setErrConfirm("Vui lòng nhập lại mật khẩu.");
      isValid = false;
    }

    if (!isValid) return;

    if (regPassword !== regConfirm) {
      setErrConfirm("Mật khẩu xác nhận không khớp!");
      return;
    }

    setRegLoading(true);
    fetch("http://localhost:8386/auth/api/v1/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: regUsername, name: regFullname, password: regPassword })
    })
      .then(res => res.json())
      .then(data => {
        setRegLoading(false);
        if (data.message === "Duplicate user") {
          setErrUsername("Tên đăng nhập đã tồn tại!"); 
        } else if (data._id) {
          alert("Đăng ký thành công! Vui lòng đăng nhập.");
          setIsSignUp(false);
          setRegFullname("");
          setRegUsername("");
          setRegPassword("");
          setRegConfirm("");
        } else {
          alert("Đăng ký thất bại, vui lòng thử lại.");
        }
      })
      .catch(() => {
        setRegLoading(false);
        alert("Lỗi kết nối server.");
      });
  };

  if (isSignUp) {
    return (
      <div className="main">
        <section className="signup">
          <div className="container">
            <div className="signup-content">
              <div className="signup-image">
                <figure><img src={signUpImg} alt="sign up" /></figure>
              </div>

              <div className="signup-form">
                <h2 className="form-title">Đăng ký</h2>
                <form onSubmit={handleRegister} className="register-form" noValidate>

                  {/* Ô 1: HỌ VÀ TÊN */}
                  <div className="form-group">
                    <label className="nabel"><i className="zmdi zmdi-face material-icons-name"></i></label>
                    <input
                      type="text"
                      placeholder="Họ và tên"
                      required
                      value={regFullname}
                      onChange={e => setRegFullname(e.target.value)}
                    />
                  </div>
                  <div style={{ color: 'red', fontSize: '13px', height: '20px', visibility: errFullname ? 'visible' : 'hidden', marginTop: '-25px', marginBottom: '10px' }}>
                    {errFullname}
                  </div>

                  {/* Ô 2: TÊN ĐĂNG NHẬP */}
                  <div className="form-group">
                    <label className="nabel"><i className="zmdi zmdi-account material-icons-name"></i></label>
                    <input
                      type="text"
                      placeholder="Tên đăng nhập"
                      required
                      value={regUsername}
                      onChange={e => setRegUsername(e.target.value)}
                    />
                  </div>
                  <div style={{ color: 'red', fontSize: '13px', height: '20px', visibility: errUsername ? 'visible' : 'hidden', marginTop: '-25px', marginBottom: '10px' }}>
                    {errUsername}
                  </div>

                  {/* Ô 3: MẬT KHẨU */}
                  <div className="form-group">
                    <label className="nabel"><i className="zmdi zmdi-lock"></i></label>
                    <input
                      type="password"
                      placeholder="Mật khẩu"
                      required
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                    />
                  </div>
                  <div style={{ color: 'red', fontSize: '13px', height: '20px', visibility: errPassword ? 'visible' : 'hidden', marginTop: '-25px', marginBottom: '10px' }}>
                    {errPassword}
                  </div>

                  {/* Ô 4: XÁC NHẬN MẬT KHẨU */}
                  <div className="form-group">
                    <label className="nabel"><i className="zmdi zmdi-lock-outline"></i></label>
                    <input
                      type="password"
                      placeholder="Xác nhận mật khẩu"
                      required
                      value={regConfirm}
                      onChange={e => setRegConfirm(e.target.value)}
                    />
                  </div>
                  <div style={{ color: 'red', fontSize: '13px', height: '20px', visibility: errConfirm ? 'visible' : 'hidden', marginTop: '-25px', marginBottom: '10px' }}>
                    {errConfirm}
                  </div>

                  {/* Nút Đăng ký */}
                  <div className="form-group form-button" style={{ marginTop: '-20px', marginBottom: '5px' }}> 
                    <input
                      type="submit"
                      className="form-submit"
                      value={regLoading ? "Đang xử lý..." : "Đăng ký"}
                      disabled={regLoading}
                      style={{ padding: '8px 45px', height: 'auto', width: '290px' }}
                    />
                  </div>

                  <div style={{ paddingLeft: '5px' }}>
                    <a href="#login" className="signup-image-link" onClick={e => { e.preventDefault(); setIsSignUp(false); }} style={{ position: 'static', margin: '0', display: 'inline-block' }}>
                      Đã có tài khoản ? Đăng nhập
                    </a>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="main">
      <section className="sign-in">
        <div className="container">
          <div className="signin-content">
            <div className="signin-image">
              <figure><img src={signInImg} alt="sign in" /></figure>
            </div>

            <div className="signin-form">
              <h2 className="form-title">Đăng nhập</h2>
              <form onSubmit={handleLogin} className="register-form" id="login-form">
                <div className="form-group">
                  <label htmlFor="your_name" className="nabel"><i className="zmdi zmdi-account material-icons-name"></i></label>
                  <input type="text" name="your_name" id="your_name" placeholder="Tên đăng nhập" 
                    onChange={e => { setLoginName(e.target.value); setLoginError(""); }} 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="your_pass" className="nabel"><i className="zmdi zmdi-lock"></i></label>
                  <input type="password" name="your_pass" id="your_pass" placeholder="Mật khẩu" 
                    onChange={e => { setLoginPassword(e.target.value); setLoginError(""); }} 
                  />
                </div>
                
                {/* --- KHUNG THÔNG BÁO LỖI --- */}
                  <div style={{ 
                    color: 'red', 
                    fontSize: '13px', 
                    height: '20px', 
                    visibility: loginError ? 'visible' : 'hidden', 
                    marginTop: '-23px', 
                    marginBottom: '0px'
                  }}>
                    {loginError}
                  </div>

                <div className="form-group">
                  <input type="checkbox" name="remember-me" id="remember-me" className="agree-term" onChange={e => setRemember(e.target.checked)} />
                  <label htmlFor="remember-me" className="label-agree-term"><span><span></span></span>Ghi nhớ</label>
                </div>
                <div className="form-group form-button" style={{ marginTop: '-30px', marginBottom: '5px' }}> 
                  <input 
                    type="submit" 
                    name="signin" 
                    id="signin" 
                    className="form-submit" 
                    value="Đăng nhập" 
                    style={{
                      padding: '8px 45px', 
                      height: 'auto',       
                      width: '300px'        
                    }}
                  />
                </div>

                <div style={{ paddingLeft: '5px' }}>
                  <a href="#register" className="signup-image-link" onClick={e => { e.preventDefault(); setIsSignUp(true); }} style={{ position: 'static', margin: '0', display: 'inline-block' }}>
                    Chưa có tài khoản ? Đăng ký
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LogIn;
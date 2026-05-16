import "./asset/css/material-design-iconic-font.min.css"
import "./asset/css/style.css"
import signInImg from "./asset/images/signin-image.jpg"
import signUpImg from "./asset/images/signup-image.jpg"
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LogIn() {
  const [isSignUp, setIsSignUp] = useState(false);

  const [loginName, setLoginName] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const [regFullname, setRegFullname] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
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
          alert(data.message);
        }
      });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (regPassword !== regConfirm) {
      alert("Mật khẩu xác nhận không khớp!");
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
          alert("Tên đăng nhập đã tồn tại!");
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
                <a href="#login" className="signup-image-link" onClick={e => { e.preventDefault(); setIsSignUp(false); }}>
                  Đã có tài khoản? Đăng nhập
                </a>
              </div>

              <div className="signup-form">
                <h2 className="form-title">Đăng ký</h2>
                <form onSubmit={handleRegister} className="register-form">
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
                  <div className="form-group form-button">
                    <input
                      type="submit"
                      className="form-submit"
                      value={regLoading ? "Đang xử lý..." : "Đăng ký"}
                      disabled={regLoading}
                    />
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
              <a href="#register" className="signup-image-link" onClick={e => { e.preventDefault(); setIsSignUp(true); }}>
                Chưa có tài khoản? Đăng ký
              </a>
            </div>

            <div className="signin-form">
              <h2 className="form-title">Đăng nhập</h2>
              <form onSubmit={handleLogin} className="register-form" id="login-form">
                <div className="form-group">
                  <label htmlFor="your_name" className="nabel"><i className="zmdi zmdi-account material-icons-name"></i></label>
                  <input type="text" name="your_name" id="your_name" placeholder="Tên đăng nhập" onChange={e => setLoginName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label htmlFor="your_pass" className="nabel"><i className="zmdi zmdi-lock"></i></label>
                  <input type="password" name="your_pass" id="your_pass" placeholder="Mật khẩu" onChange={e => setLoginPassword(e.target.value)} />
                </div>
                <div className="form-group">
                  <input type="checkbox" name="remember-me" id="remember-me" className="agree-term" onChange={e => setRemember(e.target.checked)} />
                  <label htmlFor="remember-me" className="label-agree-term"><span><span></span></span>Ghi nhớ</label>
                </div>
                <div className="form-group form-button">
                  <input type="submit" name="signin" id="signin" className="form-submit" value="Đăng nhập" />
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

import "./assets/css/style.scss"
import "https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.esm.js"
import customer01 from "./assets/imgs/customer01.jpg"
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom"
import { useRef, useEffect } from "react"
import { checkAuth } from "../../actions"

function LayoutDefault(){
    const navigationRef = useRef(null);
    const mainRef = useRef(null);
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const navActive = (paths) => paths.some(p => pathname.startsWith(p)) ? "hovered" : "";

    useEffect(() => {
        if(checkAuth())
            navigate("/login");
    }, [navigate]);

    const handleClick = () => {
        if (navigationRef.current && mainRef.current) {
          navigationRef.current.classList.toggle("active");
          mainRef.current.classList.toggle("active");
        }
    };

    const logout = () => {
        document.cookie = "token=; path=/; max-age=0";
        navigate("/");
    }

    return (
    <>
      <div className="layout-default">
        <div className="layout-default__sidebar">
          <div className="layout-default__sidebar--container">
            <div className="layout-default__sidebar--navigation" ref={navigationRef}>
              <ul>
              <li>
                    <Link to="dashboard">
                        <span className="icon">
                            <ion-icon name="business-sharp"></ion-icon>
                        </span>
                        <span className="title">BLUEMOON</span>
                    </Link>
                </li>

                {/* <li>
                    <Link to="dashboard">
                        <span className="icon">
                            <ion-icon name="home-outline"></ion-icon>
                        </span>
                        <span className="title">Trang chủ</span>
                    </Link>
                </li> */}

                <li className={navActive(["/dashboard", "/register_resident", "/view_all", "/household_infor", "/person_detail"])}>
                    <Link to="/dashboard">
                        <span className="icon">
                            <ion-icon name="people-outline"></ion-icon>
                        </span>
                        <span className="title">Quản lý cư dân</span>
                    </Link>
                </li>
                <li className={navActive(["/apartment_manage"])}>
                    <Link to="/apartment_manage">
                        <span className="icon">
                            <ion-icon name="home-outline"></ion-icon>
                        </span>
                        <span className="title">Quản lý căn hộ</span>
                    </Link>
                </li>
                <li className={navActive(["/vehicle_manage"])}>
                    <Link to="/vehicle_manage">
                        <span className="icon">
                            <ion-icon name="car-sport-outline"></ion-icon>
                        </span>
                        <span className="title">Quản lý phương tiện</span>
                    </Link>
                </li>
                <li className={navActive(["/fee_manage", "/fee_list", "/transactionHis", "/detail"])}>
                    <Link to="/fee_manage">
                        <span className="icon">
                            <ion-icon name="cash-outline"></ion-icon>
                        </span>
                        <span className="title">Quản lý thu phí chung cư</span>
                    </Link>
                </li>
                <li className={navActive(["/stats"])}>
                    <Link to="/stats">
                        <span className="icon">
                            <ion-icon name="stats-chart-outline"></ion-icon>
                        </span>
                        <span className="title">Thống kê</span>
                    </Link>
                </li>
                <li className={navActive(["/password"])}>
                    <Link to="/password">
                        <span className="icon">
                            <ion-icon name="lock-closed-outline"></ion-icon>
                        </span>
                        <span className="title">Đổi mật khẩu</span>
                    </Link>
                </li>

                <li>
                    <button type="button" onClick={logout} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center' }}>
                        <span className="icon">
                            <ion-icon name="log-out-outline"></ion-icon>
                        </span>
                        <span className="title">Đăng xuất</span>
                    </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
            {/* ----------------------Main ---------------------- */}
        <div className="layout-default__main" ref={mainRef}>
            <div className="layout-default__main--topbar">
                <div className="layout-default__main--toggle" onClick={handleClick}>
                    <ion-icon name="menu-outline"></ion-icon>
                </div>

                <div className="layout-default__main--search">
                    <label>
                        <input type="text" placeholder="Search here" />
                        <ion-icon name="search-outline"></ion-icon>
                    </label>
                </div>

                <Link to="/profile">
                    <div className="layout-default__main--user">
                        <img src={customer01} alt=""/>
                    </div>
                </Link>
            </div>
            <Outlet/>
        </div>
      </div>
    </>
  )
}

export default LayoutDefault
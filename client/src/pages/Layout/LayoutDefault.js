import "./assets/css/style.scss"
import "https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.esm.js"
import customer01 from "./assets/imgs/customer01.jpg"
import { Outlet, Link, useNavigate, useLocation, NavLink } from "react-router-dom"
import { useRef, useEffect } from "react"
import { checkAuth } from "../../actions"

function LayoutDefault(){
    const navigationRef = useRef(null);
    const mainRef = useRef(null);
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const navActive = (paths) => paths.some(p => pathname.startsWith(p)) ? "active" : "";

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
              <li className="sidebar-brand">
                <div className="brand-container">
                    <div className="brand-left">
                        <span className="icon">
                            <span class="icon-building"><ion-icon name="business-outline"></ion-icon></span>
                            <span class="icon-menu" onClick={handleClick}><ion-icon name="menu-outline"></ion-icon></span>
                        </span>
                        <span className="title">BLUEMOON</span>
                    </div>
                    
                    <div className="brand-right" onClick={handleClick}>
                        <ion-icon name="menu-outline"></ion-icon>
                    </div>
                </div>
            </li>

                {/* Menu Trang chủ */}
                <li className={pathname === "/dashboard" ? "active" : ""}>
                    <NavLink to="/dashboard" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
                        <span className="icon">
                            <ion-icon name="grid-outline"></ion-icon>
                        </span>
                        <span className="title">Trang chủ</span>
                    </NavLink>
                </li>

                <li className={navActive(["/resident_manage", "/register_resident", "/view_all", "/household_infor", "/person_detail"])}>
                    <NavLink to="/resident_manage" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
                        <span className="icon">
                            <ion-icon name="people-outline"></ion-icon>
                        </span>
                        <span className="title">Quản lý cư dân</span>
                    </NavLink>
                </li>
                <li className={navActive(["/apartment_manage"])}>
                    <NavLink to="/apartment_manage" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
                        <span className="icon">
                            <ion-icon name="home-outline"></ion-icon>
                        </span>
                        <span className="title">Quản lý căn hộ</span>
                    </NavLink>
                </li>
                <li className={navActive(["/vehicle_manage"])}>
                    <NavLink to="/vehicle_manage" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
                        <span className="icon">
                            <ion-icon name="car-sport-outline"></ion-icon>
                        </span>
                        <span className="title">Quản lý phương tiện</span>
                    </NavLink>
                </li>
                <li className={navActive(["/fee_manage", "/fee_list", "/transactionHis", "/detail"])}>
                    <NavLink to="/fee_manage" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
                        <span className="icon">
                            <ion-icon name="cash-outline"></ion-icon>
                        </span>
                        <span className="title">Quản lý thu phí chung cư</span>
                    </NavLink>
                </li>
                <li className={navActive(["/stats"])}>
                    <NavLink to="/stats" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
                        <span className="icon">
                            <ion-icon name="stats-chart-outline"></ion-icon>
                        </span>
                        <span className="title">Thống kê</span>
                    </NavLink>
                </li>
                <li className={navActive(["/password"])}>
                    <NavLink to="/password" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
                        <span className="icon">
                            <ion-icon name="lock-closed-outline"></ion-icon>
                        </span>
                        <span className="title">Đổi mật khẩu</span>
                    </NavLink>
                </li>

                <li className="sidebar-logout-item">
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
                {/* Thêm style để làm trong suốt và không cho click, nhằm giữ nguyên bố cục Topbar */}
                <div className="layout-default__main--toggle" style={{ opacity: 0, pointerEvents: 'none' }}>
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
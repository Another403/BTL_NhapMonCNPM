import "../ResidentManage/style.css"
import customer01 from "../Layout/assets/imgs/customer01.jpg"
import { Link } from "react-router-dom"
import React, { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux";
import { fetchDashboardData } from "../../actions";
import { Pagination, Tag } from "antd";
import { ExportOutlined } from '@ant-design/icons';

function Page1() {
    const [currentPage, setCurrentPage] = useState(1);
    const dispatch = useDispatch();
    const {
        recentCustomers,
        numApartment,
        numPerson,
        numTemporary,
        numAbsence,
    } = useSelector((state) => state.page1Reducer);

    const [households, setHouseholds] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [limitItem] = useState(8);

    useEffect(() => {
        dispatch(fetchDashboardData());
        
        const fetchHousehold = async () => {
            try {
                // Gọi API trực tiếp mỗi lần component render hoặc chuyển trang, KHÔNG dùng localStorage nữa
                const response = await fetch(`http://localhost:8386/household/api/v1/all?page=${currentPage}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                });
                const json = await response.json();
                
                // Cập nhật thẳng dữ liệu mới nhất vào State
                setHouseholds(json.array ?? []);
                setTotalItems(json.totalItems ?? 0);
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu hộ gia đình:", error);
            }
        };
        fetchHousehold();
    }, [dispatch, currentPage]);

    return (
        <>
            {/* KPI cards */}
            <div className="cardBox">
                <div className="card">
                    <div>
                        <div className="numbers">{numApartment}</div>
                        <div className="cardName">Căn hộ</div>
                    </div>
                    <div className="iconBx">
                        <ion-icon name="storefront-outline"></ion-icon>
                    </div>
                </div>

                <div className="card">
                    <div>
                        <div className="numbers">{numPerson}</div>
                        <div className="cardName">Dân cư</div>
                    </div>
                    <div className="iconBx">
                        <ion-icon name="people-circle-outline"></ion-icon>
                    </div>
                </div>

                <div className="card">
                    <div>
                        <div className="numbers">{numTemporary}</div>
                        <div className="cardName">Tạm trú</div>
                    </div>
                    <div className="iconBx">
                        <ion-icon name="person-add-outline"></ion-icon>
                    </div>
                </div>

                <div className="card">
                    <div>
                        <div className="numbers">{numAbsence}</div>
                        <div className="cardName">Tạm vắng</div>
                    </div>
                    <div className="iconBx">
                        <ion-icon name="person-remove-outline"></ion-icon>
                    </div>
                </div>
            </div>

            <div className="details">
    {/* Danh sách hộ gia đình */}
    <div className="recentCt">
        <div className="cardHeader">
            <h2>Danh sách hộ gia đình</h2>
        </div>

        <table>
            <thead>
                <tr>
                    <td>Tên chủ hộ</td>
                    <td>Liên hệ</td>
                    <td>Tầng</td>
                    <td>Số căn hộ</td>
                    <td>Trạng thái</td>
                    <td>Chi tiết</td>
                </tr>
            </thead>
            <tbody>
                {households.length === 0 && (
                    <tr>
                        <td colSpan={6} style={{ textAlign: "center", padding: "32px 0", color: "#999" }}>
                            Chưa có hộ gia đình nào
                        </td>
                    </tr>
                )}
                {households.map(household => (
                    <tr key={household.id}>
                        <td>{household.head}</td>
                        <td>{household.contact}</td>
                        <td>{household.floors}</td>
                        <td>{household.numbers}</td>
                        <td>
                            {(() => {
                                const color = household.status === "Thường trú" ? "green" : household.status === "Tạm trú" ? "yellow" : "red";
                                return <Tag color={color}>{household.status}</Tag>;
                            })()}
                        </td>
                        <td>
                            <Link to={`/household_infor?household_id=${household.id}`}>
                                <ExportOutlined className="status" />
                            </Link>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>

        {/* Giữ nguyên phần bọc Pagination vì nó đã hoạt động tốt */}
        {totalItems > 0 && (
            <div style={{ display: "block", width: "100%", textAlign: "center", marginTop: "20px", paddingTop: "10px", clear: "both", position: "relative", zIndex: 10 }}>
                <Pagination
                    current={currentPage}
                    pageSize={limitItem}
                    total={totalItems}
                    onChange={(page) => setCurrentPage(page)}
                    style={{ display: "inline-block" }}
                />
            </div>
        )}
    </div>

                {/* Cư dân mới tham gia */}
                <div className="recentCustomers">
                    <div className="cardHeader">
                        <h2>Danh sách dân cư</h2>
                    </div>
                    <table>
                        <tbody>
                            {recentCustomers?.map(customer => (
                                <tr key={customer._id ?? customer.name}>
                                    <td width="60px">
                                        <div className="imgBx"><img src={customer01} alt="" /></div>
                                    </td>
                                    <td>
                                        <h4>{customer.name}<br /><span>{customer.nation}</span></h4>
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

export default Page1;
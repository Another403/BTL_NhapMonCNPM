import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Form, Select, Row, Col, Pagination, Tag, Modal, Button, message, Spin, Input } from "antd";
import { ExportOutlined, DeleteOutlined, ExclamationCircleOutlined, UserOutlined } from "@ant-design/icons";
import "./style.css";
import axios from "axios";

function ResidentList() {
    const [residents, setResidents] = useState([]);
    const [apartments, setApartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);
    const [filters, setFilters] = useState({ name: "", status: "", floorNumber: "", roomNumber: "" });

    const fetchData = async (page, currentFilters) => {
        setLoading(true);
        try {
            const params = { page };
            if (currentFilters.name) params.name = currentFilters.name;
            if (currentFilters.status) params.status = currentFilters.status;
            if (currentFilters.floorNumber) params.floorNumber = currentFilters.floorNumber;
            if (currentFilters.roomNumber) params.roomNumber = currentFilters.roomNumber;

            const response = await axios.get("http://localhost:8386/person/api/v1/all", { params });
            setResidents(response.data.array ?? []);
            setTotal(response.data.totalItems ?? 0);
            setLimit(response.data.limitItem ?? 10);
        } catch {
            message.error("Không thể tải danh sách cư dân");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(currentPage, filters);
    }, [currentPage, filters]);

    useEffect(() => {
        const fetchApartments = async () => {
            try {
                const response = await axios.get("http://localhost:8386/apartments/api/v1/apartments");
                setApartments(response.data ?? []);
            } catch {
                message.error("Không thể tải danh sách căn hộ");
            }
        };

        fetchApartments();
    }, []);

    const handleDeletePerson = (resident) => {
        Modal.confirm({
            title: "Xác nhận xóa",
            icon: <ExclamationCircleOutlined />,
            content: `Xóa cư dân "${resident.name}" khỏi hệ thống?`,
            okText: "Xóa",
            okType: "danger",
            cancelText: "Hủy",
            centered: true,
            onOk: async () => {
                try {
                    const res = await fetch(`http://localhost:8386/person/api/v1/delete?id=${resident._id}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                    });
                    const data = await res.json();
                    if (data.message === "Delete complete") {
                        message.success("Xóa thành công");
                        fetchData(currentPage, filters);
                    } else {
                        message.error(data.message || "Xóa thất bại");
                    }
                } catch {
                    message.error("Lỗi kết nối máy chủ");
                }
            },
        });
    };

    const handleFilterChange = (key, value) => {
        setCurrentPage(1);
        setFilters(prev => ({ ...prev, [key]: value ?? "" }));
    };

    const floorOptions = useMemo(() => {
        const floors = new Set(apartments.map(apt => Math.floor(Number(apt.number) / 100)).filter(Boolean));
        return [
            { value: "", label: "Tất cả" },
            ...[...floors].sort((a, b) => a - b).map(floor => ({ value: String(floor), label: `Tầng ${floor}` })),
        ];
    }, [apartments]);

    const roomOptions = useMemo(() => {
        const rooms = apartments
            .map(apt => Number(apt.number))
            .filter(Boolean)
            .filter(number => !filters.floorNumber || Math.floor(number / 100) === Number(filters.floorNumber))
            .sort((a, b) => a - b);

        return [
            { value: "", label: "Tất cả" },
            ...rooms.map(number => ({ value: String(number), label: String(number) })),
        ];
    }, [apartments, filters.floorNumber]);

    return (
        <>
            <div className="details page2 resident-page">
                <div className="recentCt page2">
                    <div className="cardHeader">
                        <h2>Danh sách dân cư</h2>
                        <Link to="/register_resident" className="btn">Đăng kí</Link>
                    </div>

                    <div className="filter-person resident-filters">
                        <Form layout="vertical">
                            <Row gutter={[32, 16]}>
                                <Col className="gutter-row" xs={24} sm={12} lg={6}>
                                    <Form.Item label="Họ và tên">
                                        <Input
                                            allowClear
                                            placeholder="Tìm theo họ tên"
                                            onChange={(e) => handleFilterChange("name", e.target.value)}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col className="gutter-row" xs={24} sm={12} lg={6}>
                                    <Form.Item label="Trạng thái">
                                        <Select
                                            allowClear
                                            placeholder="Chọn trạng thái"
                                            options={[
                                                { value: "", label: "Tất cả" },
                                                { value: "Thường trú", label: "Thường trú" },
                                                { value: "Tạm trú", label: "Tạm trú" },
                                                { value: "Tạm vắng", label: "Tạm vắng" },
                                            ]}
                                            onChange={(val) => handleFilterChange("status", val)}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col className="gutter-row" xs={24} sm={12} lg={6}>
                                    <Form.Item label="Tầng">
                                        <Select
                                            allowClear
                                            placeholder="Chọn tầng"
                                            options={floorOptions}
                                            onChange={(val) => {
                                                setCurrentPage(1);
                                                setFilters(prev => ({ ...prev, floorNumber: val ?? "", roomNumber: "" }));
                                            }}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col className="gutter-row" xs={24} sm={12} lg={6}>
                                    <Form.Item label="Số căn hộ">
                                        <Select
                                            allowClear
                                            value={filters.roomNumber || undefined}
                                            placeholder="Chọn số căn hộ"
                                            options={roomOptions}
                                            onChange={(val) => handleFilterChange("roomNumber", val)}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <td>CCCD</td>
                                <td>Họ tên</td>
                                <td>Số điện thoại</td>
                                <td>Số tầng</td>
                                <td>Số căn hộ</td>
                                <td>Trạng thái</td>
                                <td>Chi tiết</td>
                                <td></td>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <tr><td colSpan={8} style={{ textAlign: "center", padding: "32px 0" }}><Spin /></td></tr>
                            )}
                            {!loading && residents.length === 0 && (
                                <tr><td colSpan={8} style={{ textAlign: "center", padding: "32px 0", color: "#999" }}>Chưa có cư dân nào</td></tr>
                            )}
                            {residents.map(resident => (
                                <tr key={resident._id}>
                                    <td>{resident.cic}</td>
                                    <td>{resident.name}</td>
                                    <td>{resident.contact_phone}</td>
                                    <td>{resident.floors?.join(", ")}</td>
                                    <td>{resident.numbers?.join(", ")}</td>
                                    <td>
                                        {(() => {
                                            const color = resident.status === "Thường trú" ? "green" : resident.status === "Tạm trú" ? "yellow" : "red";
                                            return <Tag color={color}>{resident.status}</Tag>;
                                        })()}
                                    </td>
                                    <td>
                                        <div className="resident-actions">
                                            <Link to={`/person_detail?id=${resident._id}`}>
                                                <UserOutlined title="Chi tiết cư dân" />
                                            </Link>
                                            {resident.householdId && (
                                                <Link to={`/household_infor?household_id=${resident.householdId}`}>
                                                    <ExportOutlined title="Xem hộ gia đình" />
                                                </Link>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <Button
                                            danger
                                            size="small"
                                            icon={<DeleteOutlined />}
                                            onClick={() => handleDeletePerson(resident)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {total > 0 && (
                        <div className="resident-pagination">
                            <Pagination
                                current={currentPage}
                                total={total}
                                pageSize={limit}
                                onChange={(page) => setCurrentPage(page)}
                            />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default ResidentList;

import { Link } from "react-router-dom"
import { useEffect, useMemo, useState } from "react"
import { Form, Select, Row, Col, Pagination, Tag, Modal, Button, message, Spin } from "antd";
import { ExportOutlined, DeleteOutlined, ExclamationCircleOutlined, UserOutlined } from '@ant-design/icons';
import "./style.css";
import axios from "axios";

function ResidentList(){
    const [residents, setResidents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);

    // Server-side filters (name, status) — reset page on change
    const [serverFilters, setServerFilters] = useState({ name: "", status: "" });

    // Client-side filters (floor, room — derived from returned page data)
    const [clientFilters, setClientFilters] = useState({ floorNumber: "", roomNumber: "" });

    const fetchData = async (page, filters) => {
        setLoading(true);
        try {
            const params = { page };
            if (filters.name) params.name = filters.name;
            if (filters.status) params.status = filters.status;
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
        fetchData(currentPage, serverFilters);
    }, [currentPage, serverFilters]);

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
                        fetchData(currentPage, serverFilters);
                    } else {
                        message.error(data.message || "Xóa thất bại");
                    }
                } catch {
                    message.error("Lỗi kết nối máy chủ");
                }
            }
        });
    };

    const handleServerFilterChange = (key, value) => {
        setCurrentPage(1);
        setServerFilters(prev => ({ ...prev, [key]: value ?? "" }));
    };

    // Build client-side filter options from current page data
    const floorOptions = useMemo(() => {
        const fl = new Set(residents.flatMap(r => r.floors ?? []));
        return [{ value: "", label: "Tất cả" }, ...[...fl].filter(Boolean).map(f => ({ value: f, label: f }))];
    }, [residents]);

    const roomOptions = useMemo(() => {
        const rm = new Set(residents.flatMap(r => r.numbers ?? []));
        return [{ value: "", label: "Tất cả" }, ...[...rm].filter(Boolean).map(r => ({ value: r, label: r }))];
    }, [residents]);

    const filteredPeople = useMemo(() => {
        return residents.filter(resident => {
            if (clientFilters.floorNumber && !resident.floors?.includes(clientFilters.floorNumber))
                return false;
            if (clientFilters.roomNumber && !resident.numbers?.includes(clientFilters.roomNumber))
                return false;
            return true;
        });
    }, [residents, clientFilters]);

    return (
    <>
        <div className="details page2">
            <div className="recentCt page2">
                <div className="cardHeader">
                    <h2>Danh sách dân cư</h2>
                    <Link to="/register_resident" className="btn">Đăng kí</Link>
                </div>
                <div className="filter-person">
                    <Form layout="vertical">
                        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                            <Col className="gutter-row" span={6}>
                                <Form.Item label="Họ và tên">
                                    <Select
                                        showSearch
                                        allowClear
                                        placeholder="Tìm theo họ tên"
                                        filterOption={false}
                                        onSearch={(val) => handleServerFilterChange("name", val)}
                                        onChange={(val) => handleServerFilterChange("name", val)}
                                        options={[]}
                                        notFoundContent={null}
                                    />
                                </Form.Item>
                            </Col>
                            <Col className="gutter-row" span={6}>
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
                                        onChange={(val) => handleServerFilterChange("status", val)}
                                    />
                                </Form.Item>
                            </Col>
                            <Col className="gutter-row" span={6}>
                                <Form.Item label="Tầng">
                                    <Select
                                        allowClear
                                        placeholder="Chọn tầng"
                                        options={floorOptions}
                                        onChange={(val) => setClientFilters(prev => ({ ...prev, floorNumber: val ?? "" }))}
                                    />
                                </Form.Item>
                            </Col>
                            <Col className="gutter-row" span={6}>
                                <Form.Item label="Số căn hộ">
                                    <Select
                                        allowClear
                                        placeholder="Chọn số căn hộ"
                                        options={roomOptions}
                                        onChange={(val) => setClientFilters(prev => ({ ...prev, roomNumber: val ?? "" }))}
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
                            <td>Số Điện Thoại</td>
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
                        {!loading && filteredPeople.length === 0 && (
                            <tr><td colSpan={8} style={{ textAlign: "center", padding: "32px 0", color: "#999" }}>Chưa có cư dân nào</td></tr>
                        )}
                        {filteredPeople.map(resident => (
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
                                <td style={{ display: "flex", gap: 8 }}>
                                    <Link to={`/person_detail?id=${resident._id}`}>
                                        <UserOutlined title="Chi tiết cư dân" />
                                    </Link>
                                    {resident.householdId && (
                                        <Link to={`/household_infor?household_id=${resident.householdId}`}>
                                            <ExportOutlined title="Xem hộ gia đình" />
                                        </Link>
                                    )}
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
                    <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
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
    )
}

export default ResidentList;

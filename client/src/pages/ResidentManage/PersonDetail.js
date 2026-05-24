import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, Descriptions, Tag, Button } from 'antd';
import "./style.css";

function PersonDetail() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:8386/person/api/v1/detail?id=${id}`, {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        if (data.message === "Success") setPerson(data.person);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ padding: 32 }}>Đang tải dữ liệu...</div>;
  if (!person) return <div style={{ padding: 32 }}>Không tìm thấy cư dân.</div>;

  const statusColor = person.status === "Thường trú" ? "green"
    : person.status === "Tạm trú" ? "yellow" : "red";

  const fmt = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : "—";

  return (
    <div className="description-container">
      <Card
        title="Thông tin cư dân"
        bordered={false}
        extra={
          <div style={{ display: "flex", gap: 8 }}>
            {person.householdId && (
              <Link to={`/household_infor?household_id=${person.householdId}`}>
                <Button>Xem hộ gia đình</Button>
              </Link>
            )}
            <Button onClick={() => window.history.back()}>Quay lại</Button>
          </div>
        }
      >
        <Descriptions column={3} bordered>
          <Descriptions.Item label="Họ và tên">{person.name}</Descriptions.Item>
          <Descriptions.Item label="CCCD">{person.cic}</Descriptions.Item>
          <Descriptions.Item label="Ngày sinh">{fmt(person.dob)}</Descriptions.Item>
          <Descriptions.Item label="Giới tính">{person.gender}</Descriptions.Item>
          <Descriptions.Item label="Quốc tịch">{person.nation}</Descriptions.Item>
          <Descriptions.Item label="Dân tộc">{person.ethnicity}</Descriptions.Item>
          <Descriptions.Item label="Quê quán">{person.hometown}</Descriptions.Item>
          <Descriptions.Item label="Nghề nghiệp">{person.occupation}</Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">{person.contact_phone}</Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={statusColor}>{person.status}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày đến">{fmt(person.movingIn)}</Descriptions.Item>
          <Descriptions.Item label="Ngày đi">
            {person.status !== "Thường trú" ? fmt(person.endTemporary) : "—"}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
}

export default PersonDetail;

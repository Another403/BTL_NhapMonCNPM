import { useState, useEffect } from 'react';
import { Input, message, DatePicker } from 'antd';
import { Link } from 'react-router-dom';
import { UserOutlined, MailOutlined, PhoneOutlined, CalendarOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import './style.css';

export default function PersonalProfile() {
  const [data, setData] = useState({
    fullname: "",
    email: "",
    dob: "",
    contact_phone: "",
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [tempData, setTempData] = useState({});

  useEffect(() => {
    fetch("http://localhost:8386/auth/api/v1/profile", {
      method: "GET",
      headers: {"Content-Type": "application/json"},
      credentials: "include"
    })
    .then((res) => res.json())
    .then((fetchedData) => {
      setData(fetchedData);
    })
  }, []);

  const handleEditClick = () => {
    setTempData(data); 
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false); 
  };

  const handleSaveClick = () => {
    fetch("http://localhost:8386/auth/api/v1/edit", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(tempData),
      credentials: "include"
    })
    .then((res) => res.json())
    .then((response) => {
      if(response.message && response.message === "Success") {
        message.success("Cập nhật thông tin thành công");
        setData(response.profile);
        setIsEditing(false);
      } else if (response.message) {
        alert(response.message);
      }
    })
  };

  const handleChange = (field, value) => {
    setTempData({
      ...tempData,
      [field]: value,
    });
  };

  const displayData = isEditing ? tempData : data;

  return (
    <div className="profile-page-container">
      <div className="profile-header-text">
        <h2>Hồ sơ cá nhân</h2>
      </div>

      <div className="profile-grid">
        
        {/* CỘT TRÁI */}
        <div className="profile-left-card">
          <div className="profile-cover"></div>
          <div className="profile-avatar-section">
            <div className="avatar-wrapper">
              <img src="https://api.dicebear.com/7.x/notionists/svg?seed=NguyenDu&backgroundColor=e0e7ff" alt="Avatar" />
            </div>
            <h3>{data.fullname || 'Admin'}</h3>
            <span className="role-badge">
              <SafetyCertificateOutlined /> Quản trị viên
            </span>
          </div>
          <div className="profile-actions">
            <Link to="/password" className="btn-change-password">
              Đổi mật khẩu
            </Link>
          </div>
        </div>

        {/* CỘT PHẢI */}
        <div className="profile-right-card">
          <div className="card-header">
            <h3>Thông tin liên hệ</h3>
            {!isEditing ? (
              <button className="btn-edit" onClick={handleEditClick}>Chỉnh sửa</button>
            ) : (
              <div className="edit-actions">
                <button className="btn-cancel" onClick={handleCancelClick}>Hủy bỏ</button>
                <button className="btn-save" onClick={handleSaveClick}>Lưu thay đổi</button>
              </div>
            )}
          </div>

          {/* GRID FORM (Sử dụng Inline Style chia cột) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px 30px' }}>
            
            {/* HỌ VÀ TÊN (Chiếm cả 2 cột) */}
            <div style={{ gridColumn: 'span 2' }}>
              {/* Tầng 1: Chứa duy nhất Label để ép ngắt dòng */}
              <div style={{ display: 'block', marginBottom: '0px' }}>
                <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '8px', margin: 0, fontWeight: 600, color: '#475569', fontSize: '14px' }}>
                  <UserOutlined /> Họ và tên
                </label>
              </div>
              
              {/* Tầng 2: Chứa Input/View Box */}
              <div style={{ display: 'block' }}>
                {isEditing ? (
                  <Input 
                    value={displayData.fullname} 
                    onChange={(e) => handleChange("fullname", e.target.value)} 
                    style={{ width: '100%', height: '46px', borderRadius: '12px' }}
                  />
                ) : (
                  <div style={{ width: '100%', minHeight: '46px', display: 'flex', alignItems: 'center', background: '#f8fafc', padding: '0 16px', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#1e293b', fontWeight: 500 }}>
                    {displayData.fullname || 'Nguyễn Du'}
                  </div>
                )}
              </div>
            </div>

            {/* EMAIL (Chiếm 1 cột) */}
            <div>
              <div style={{ display: 'block', marginBottom: '0px' }}>
                <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '8px', margin: 0, fontWeight: 600, color: '#475569', fontSize: '14px' }}>
                  <MailOutlined /> Địa chỉ Email
                </label>
              </div>
              <div style={{ display: 'block' }}>
                {isEditing ? (
                  <Input 
                    value={displayData.email} 
                    onChange={(e) => handleChange("email", e.target.value)} 
                    style={{ width: '100%', height: '46px', borderRadius: '12px' }}
                  />
                ) : (
                  <div style={{ width: '100%', minHeight: '46px', display: 'flex', alignItems: 'center', background: '#f8fafc', padding: '0 16px', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#1e293b', fontWeight: 500 }}>
                    {displayData.email || 'admin.nguyendu@bluemoon.com'}
                  </div>
                )}
              </div>
            </div>

            {/* SỐ ĐIỆN THOẠI (Chiếm 1 cột) */}
            <div>
              <div style={{ display: 'block', marginBottom: '0px' }}>
                <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '8px', margin: 0, fontWeight: 600, color: '#475569', fontSize: '14px' }}>
                  <PhoneOutlined /> Số điện thoại
                </label>
              </div>
              <div style={{ display: 'block' }}>
                {isEditing ? (
                  <Input 
                    value={displayData.contact_phone} 
                    onChange={(e) => handleChange("contact_phone", e.target.value)} 
                    style={{ width: '100%', height: '46px', borderRadius: '12px' }}
                  />
                ) : (
                  <div style={{ width: '100%', minHeight: '46px', display: 'flex', alignItems: 'center', background: '#f8fafc', padding: '0 16px', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#1e293b', fontWeight: 500 }}>
                    {displayData.contact_phone || '012345689'}
                  </div>
                )}
              </div>
            </div>

            {/* NGÀY SINH (Chiếm 1 cột) */}
            <div>
              <div style={{ display: 'block', marginBottom: '0px' }}>
                <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '8px', margin: 0, fontWeight: 600, color: '#475569', fontSize: '14px' }}>
                  <CalendarOutlined /> Ngày sinh
                </label>
              </div>
              <div style={{ display: 'block' }}>
                {isEditing ? (
                  <DatePicker 
                    value={displayData.dob ? dayjs(displayData.dob) : null} 
                    onChange={(date) => handleChange("dob", date ? date.toISOString() : "")} 
                    format="DD/MM/YYYY" 
                    style={{ width: '100%', height: '46px', borderRadius: '12px' }}
                  />
                ) : (
                  <div style={{ width: '100%', minHeight: '46px', display: 'flex', alignItems: 'center', background: '#f8fafc', padding: '0 16px', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#1e293b', fontWeight: 500 }}>
                    {displayData.dob ? dayjs(displayData.dob).format('DD/MM/YYYY') : '15/05/1990'}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
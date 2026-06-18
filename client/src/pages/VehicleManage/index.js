
import React, { useState } from 'react';
import './style.css'; 

export default function VehicleManage() {
  // Trạng thái bộ lọc
  const [filterLicensePlate, setFilterLicensePlate] = useState('');
  
  // Các trạng thái cho ô Chọn chủ hộ tùy chỉnh (Custom Dropdown)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedOwnerId, setSelectedOwnerId] = useState('');
  const [selectedOwnerName, setSelectedOwnerName] = useState('Chọn chủ hộ'); // Văn bản gợi ý mặc định

  // Danh sách dữ liệu chủ hộ (Dùng hiển thị cho danh sách mở rộng giống Ảnh 3)
  const ownerOptions = [
    { id: 'all', name: 'Tất cả chủ hộ' },
    { id: '1', name: 'Lê Việt Anh' },
    { id: '2', name: 'Nguyễn Du' },
    { id: '3', name: 'Trần Đức Bo' }
  ];

  // Hàm xử lý khi người dùng chọn một mục trong danh sách mở rộng
  const handleSelectOwner = (owner) => {
    setSelectedOwnerId(owner.id);
    setSelectedOwnerName(owner.name);
    setIsDropdownOpen(false); // Chọn xong tự động đóng menu
  };

  return (
    <div className="vm-wrapper">
      <div className="vm-card">
        
        {/* === HEADER === */}
        <div className="vm-header">
          <div className="vm-title-group">
            <div className="vm-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a2 2 0 0 0-1.6-.8H9.3a2 2 0 0 0-1.6.8L5 11l-5.16.86a1 1 0 0 0-.84.99V16h3m10 0a2 2 0 1 1-4 0m4 0a2 2 0 1 0-4 0m-10 0a2 2 0 1 1-4 0m4 0a2 2 0 1 0-4 0" />
              </svg>
            </div>
            <div>
              <h2 className="vm-title">Quản lý phương tiện</h2>
            </div>
          </div>
          
          <button className="vm-btn-add">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Thêm phương tiện
          </button>
        </div>

        {/* === BỘ LỌC (FILTERS) === */}
        <div className="vm-filters">
          
          {/* Ô CHỌN CHỦ HỘ ĐƯỢC THIẾT KẾ LẠI THEO ẢNH 1 & ẢNH 3 */}
          <div className="vm-filter-group">
            <label>Tên chủ hộ</label>
            <div className="vm-custom-dropdown-container">
              
              {/* Box kích hoạt (Trigger) - Giống Ảnh 1 */}
              <div 
                className={`vm-dropdown-trigger ${isDropdownOpen ? 'vm-active' : ''}`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className={selectedOwnerId === '' ? 'vm-select-placeholder' : 'vm-select-text'}>
                  {selectedOwnerName}
                </span>
                
                {/* Icon mở rộng có hiệu ứng xoay mượt mà */}
                <svg className={`vm-chevron-icon ${isDropdownOpen ? 'vm-rotate' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>

              {/* Menu danh sách sau khi mở rộng - Giống hệt thiết kế Ảnh 3 */}
              {isDropdownOpen && (
                <div className="vm-dropdown-menu-list">
                  {ownerOptions.map((owner) => (
                    <div 
                      key={owner.id}
                      className={`vm-dropdown-menu-item ${selectedOwnerId === owner.id ? 'vm-selected' : ''}`}
                      onClick={() => handleSelectOwner(owner)}
                    >
                      {owner.name}
                      {/* Hiển thị dấu tích ẩn nếu item đó đang được chọn */}
                      {selectedOwnerId === owner.id && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Ô NHẬP BIỂN SỐ XE */}
          <div className="vm-filter-group">
            <label>Biển số xe</label>
            <div className="vm-input-wrapper">
              <svg className="vm-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Nhập biển số xe cần tìm..."
                value={filterLicensePlate}
                onChange={(e) => setFilterLicensePlate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* === BẢNG DỮ LIỆU === */}
        <div className="vm-table-container">
          <table className="vm-table">
            <thead>
              <tr>
                <th>Tên chủ hộ</th>
                <th className="vm-text-center">Số lượng</th>
                <th className="vm-text-center">Tên phương tiện</th>
                <th className="vm-text-center">Biển số xe</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="4">
                  <div className="vm-empty-state">
                    <div className="vm-empty-icon">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
                        <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
                      </svg>
                    </div>
                    <p className="vm-empty-title">Chưa có phương tiện nào được đăng ký</p>
                    <p className="vm-empty-subtitle">Hãy nhấn "Thêm phương tiện" để tạo mới dữ liệu.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}


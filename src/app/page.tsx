'use client';

import { useEffect, useState } from 'react';
import { getAllPlates, createPlate, updatePlate, deletePlate, Plate } from '@/lib/plates';
import { Timestamp } from 'firebase/firestore';

export default function Home() {
  const [plates, setPlates] = useState<Plate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlate, setEditingPlate] = useState<Plate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    plateNumber: '',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    vehicleType: '',
    vehicleBrand: '',
    vehicleModel: '',
    vehicleColor: '',
    notes: '',
  });

  useEffect(() => {
    loadPlates();
  }, []);

  const loadPlates = async () => {
    try {
      const data = await getAllPlates();
      setPlates(data);
    } catch (error) {
      console.error('Error loading plates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPlate) {
        await updatePlate(editingPlate.id!, formData);
      } else {
        await createPlate(formData);
      }
      setShowForm(false);
      setEditingPlate(null);
      resetForm();
      loadPlates();
    } catch (error) {
      console.error('Error saving plate:', error);
    }
  };

  const handleEdit = (plate: Plate) => {
    setEditingPlate(plate);
    setFormData({
      plateNumber: plate.plateNumber,
      ownerName: plate.ownerName,
      ownerPhone: plate.ownerPhone || '',
      ownerEmail: plate.ownerEmail || '',
      vehicleType: plate.vehicleType || '',
      vehicleBrand: plate.vehicleBrand || '',
      vehicleModel: plate.vehicleModel || '',
      vehicleColor: plate.vehicleColor || '',
      notes: plate.notes || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa biển số này?')) {
      try {
        await deletePlate(id);
        loadPlates();
      } catch (error) {
        console.error('Error deleting plate:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      plateNumber: '',
      ownerName: '',
      ownerPhone: '',
      ownerEmail: '',
      vehicleType: '',
      vehicleBrand: '',
      vehicleModel: '',
      vehicleColor: '',
      notes: '',
    });
  };

  const filteredPlates = plates.filter(
    (plate) =>
      plate.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plate.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (timestamp: Timestamp | undefined) => {
    if (!timestamp) return '-';
    return timestamp.toDate().toLocaleDateString('vi-VN');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold">🚗 PlateSnap Admin</h1>
          <p className="text-blue-100">Quản lý biển số xe</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm biển số hoặc tên chủ xe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => {
              setEditingPlate(null);
              resetForm();
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Thêm biển số mới
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-500 text-sm">Tổng số biển số</p>
            <p className="text-3xl font-bold text-blue-600">{plates.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-500 text-sm">Kết quả tìm kiếm</p>
            <p className="text-3xl font-bold text-green-600">{filteredPlates.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-500 text-sm">Trạng thái</p>
            <p className="text-xl font-bold text-green-600">🟢 Hoạt động</p>
          </div>
        </div>

        {/* Modal Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">
                  {editingPlate ? 'Chỉnh sửa biển số' : 'Thêm biển số mới'}
                </h2>
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Biển số xe *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.plateNumber}
                        onChange={(e) =>
                          setFormData({ ...formData, plateNumber: e.target.value })
                        }
                        placeholder="VD: 51A-12345"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên chủ xe *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.ownerName}
                        onChange={(e) =>
                          setFormData({ ...formData, ownerName: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        value={formData.ownerPhone}
                        onChange={(e) =>
                          setFormData({ ...formData, ownerPhone: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.ownerEmail}
                        onChange={(e) =>
                          setFormData({ ...formData, ownerEmail: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Loại xe
                      </label>
                      <select
                        value={formData.vehicleType}
                        onChange={(e) =>
                          setFormData({ ...formData, vehicleType: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Chọn loại xe</option>
                        <option value="car">Ô tô</option>
                        <option value="motorcycle">Xe máy</option>
                        <option value="truck">Xe tải</option>
                        <option value="bus">Xe buýt</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hãng xe
                      </label>
                      <input
                        type="text"
                        value={formData.vehicleBrand}
                        onChange={(e) =>
                          setFormData({ ...formData, vehicleBrand: e.target.value })
                        }
                        placeholder="VD: Toyota, Honda..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dòng xe
                      </label>
                      <input
                        type="text"
                        value={formData.vehicleModel}
                        onChange={(e) =>
                          setFormData({ ...formData, vehicleModel: e.target.value })
                        }
                        placeholder="VD: Camry, Civic..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Màu xe
                      </label>
                      <input
                        type="text"
                        value={formData.vehicleColor}
                        onChange={(e) =>
                          setFormData({ ...formData, vehicleColor: e.target.value })
                        }
                        placeholder="VD: Trắng, Đen..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ghi chú
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData({ ...formData, notes: e.target.value })
                        }
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-4 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingPlate(null);
                        resetForm();
                      }}
                      className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      {editingPlate ? 'Cập nhật' : 'Thêm mới'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Đang tải...</div>
          ) : filteredPlates.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchTerm ? 'Không tìm thấy kết quả' : 'Chưa có biển số nào'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                      Biển số
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                      Chủ xe
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 hidden md:table-cell">
                      SĐT
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 hidden lg:table-cell">
                      Loại xe
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 hidden lg:table-cell">
                      Ngày tạo
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPlates.map((plate) => (
                    <tr key={plate.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {plate.plateNumber}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{plate.ownerName}</div>
                        {plate.ownerEmail && (
                          <div className="text-sm text-gray-500">{plate.ownerEmail}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-600">
                        {plate.ownerPhone || '-'}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {plate.vehicleType && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {plate.vehicleType === 'car' && '🚗 Ô tô'}
                            {plate.vehicleType === 'motorcycle' && '🏍️ Xe máy'}
                            {plate.vehicleType === 'truck' && '🚛 Xe tải'}
                            {plate.vehicleType === 'bus' && '🚌 Xe buýt'}
                            {plate.vehicleType === 'other' && '🚙 Khác'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-gray-600 text-sm">
                        {formatDate(plate.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleEdit(plate)}
                          className="text-blue-600 hover:text-blue-800 px-2 py-1"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(plate.id!)}
                          className="text-red-600 hover:text-red-800 px-2 py-1 ml-2"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          © 2025 PlateSnap Admin. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

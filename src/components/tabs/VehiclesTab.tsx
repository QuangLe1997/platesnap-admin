'use client';

import { useState, useEffect } from 'react';
import { Vehicle, Resident, Block, Apartment } from '@/lib/types';
import { getAllVehicles, createVehicle, updateVehicle, deleteVehicle } from '@/lib/db/vehicles';
import { getAllResidents } from '@/lib/db/residents';
import { getAllBlocks } from '@/lib/db/blocks';
import { getAllApartments } from '@/lib/db/apartments';

export default function VehiclesTab() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [formData, setFormData] = useState({
    plateNumber: '',
    residentId: '',
    residentName: '',
    blockId: '',
    blockCode: '',
    apartmentId: '',
    apartmentCode: '',
    vehicleType: 'car' as 'car' | 'motorcycle' | 'bicycle' | 'other',
    brand: '',
    model: '',
    color: '',
    parkingSlot: '',
    notes: '',
    isActive: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [vehiclesData, residentsData, blocksData, apartmentsData] = await Promise.all([
        getAllVehicles(),
        getAllResidents(),
        getAllBlocks(),
        getAllApartments(),
      ]);
      setVehicles(vehiclesData);
      setResidents(residentsData);
      setBlocks(blocksData);
      setApartments(apartmentsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVehicle) {
        await updateVehicle(editingVehicle.id!, formData);
      } else {
        await createVehicle(formData);
      }
      setShowForm(false);
      setEditingVehicle(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      plateNumber: vehicle.plateNumber,
      residentId: vehicle.residentId,
      residentName: vehicle.residentName,
      blockId: vehicle.blockId,
      blockCode: vehicle.blockCode,
      apartmentId: vehicle.apartmentId,
      apartmentCode: vehicle.apartmentCode,
      vehicleType: vehicle.vehicleType,
      brand: vehicle.brand || '',
      model: vehicle.model || '',
      color: vehicle.color || '',
      parkingSlot: vehicle.parkingSlot || '',
      notes: vehicle.notes || '',
      isActive: vehicle.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa phương tiện này?')) {
      try {
        await deleteVehicle(id);
        loadData();
      } catch (error) {
        console.error('Error deleting vehicle:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      plateNumber: '',
      residentId: '',
      residentName: '',
      blockId: '',
      blockCode: '',
      apartmentId: '',
      apartmentCode: '',
      vehicleType: 'car',
      brand: '',
      model: '',
      color: '',
      parkingSlot: '',
      notes: '',
      isActive: true,
    });
  };

  const handleResidentChange = (residentId: string) => {
    const resident = residents.find((r) => r.id === residentId);
    if (resident) {
      setFormData({
        ...formData,
        residentId,
        residentName: resident.fullName,
        blockId: resident.blockId,
        blockCode: resident.blockCode,
        apartmentId: resident.apartmentId,
        apartmentCode: resident.apartmentCode,
      });
    }
  };

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.residentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.apartmentCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || v.vehicleType === filterType;
    return matchesSearch && matchesType;
  });

  const vehicleTypeLabels = {
    car: '🚗 Ô tô',
    motorcycle: '🏍️ Xe máy',
    bicycle: '🚲 Xe đạp',
    other: '🚙 Khác',
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold">Quản lý Phương tiện</h2>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Tìm biển số, tên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg w-48"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Tất cả loại xe</option>
            <option value="car">Ô tô</option>
            <option value="motorcycle">Xe máy</option>
            <option value="bicycle">Xe đạp</option>
            <option value="other">Khác</option>
          </select>
          <button
            onClick={() => {
              setEditingVehicle(null);
              resetForm();
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + Thêm phương tiện
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">
                {editingVehicle ? 'Chỉnh sửa phương tiện' : 'Thêm phương tiện mới'}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Biển số xe *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.plateNumber}
                      onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                      placeholder="VD: 51A-12345"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chủ xe (Cư dân) *
                    </label>
                    <select
                      required
                      value={formData.residentId}
                      onChange={(e) => handleResidentChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Chọn cư dân</option>
                      {residents.map((resident) => (
                        <option key={resident.id} value={resident.id}>
                          {resident.fullName} - {resident.apartmentCode}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Loại xe *
                      </label>
                      <select
                        required
                        value={formData.vehicleType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            vehicleType: e.target.value as 'car' | 'motorcycle' | 'bicycle' | 'other',
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="car">Ô tô</option>
                        <option value="motorcycle">Xe máy</option>
                        <option value="bicycle">Xe đạp</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hãng xe
                      </label>
                      <input
                        type="text"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        placeholder="VD: Toyota, Honda"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dòng xe
                      </label>
                      <input
                        type="text"
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        placeholder="VD: Camry, SH"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Màu xe
                      </label>
                      <input
                        type="text"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        placeholder="VD: Trắng, Đen"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vị trí đỗ xe
                    </label>
                    <input
                      type="text"
                      value={formData.parkingSlot}
                      onChange={(e) => setFormData({ ...formData, parkingSlot: e.target.value })}
                      placeholder="VD: B1-A15"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ghi chú
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <label htmlFor="isActive" className="text-sm text-gray-700">
                      Đang hoạt động
                    </label>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingVehicle(null);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingVehicle ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Đang tải...</div>
        ) : filteredVehicles.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm || filterType ? 'Không tìm thấy kết quả' : 'Chưa có phương tiện nào'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Biển số</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Chủ xe</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Căn hộ</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Loại xe</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Thông tin</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className={`hover:bg-gray-50 ${!vehicle.isActive ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {vehicle.plateNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">{vehicle.residentName}</td>
                    <td className="px-4 py-3">
                      <span className="text-purple-600">{vehicle.apartmentCode}</span>
                    </td>
                    <td className="px-4 py-3">{vehicleTypeLabels[vehicle.vehicleType]}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {[vehicle.brand, vehicle.model, vehicle.color].filter(Boolean).join(' - ') || '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleEdit(vehicle)}
                        className="text-blue-600 hover:text-blue-800 px-2 py-1"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(vehicle.id!)}
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
    </div>
  );
}

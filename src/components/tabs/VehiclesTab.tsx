'use client';

import { useState, useEffect } from 'react';
import { Vehicle, Resident, Block, Apartment } from '@/lib/types';
import { getAllVehicles, createVehicle, updateVehicle, deleteVehicle } from '@/lib/db/vehicles';
import { getAllResidents } from '@/lib/db/residents';
import { getAllBlocks } from '@/lib/db/blocks';
import { getAllApartments } from '@/lib/db/apartments';
import {
  Car,
  Bike,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  X,
  Loader2,
  Building2,
  User,
  CheckCircle,
  XCircle,
  ParkingCircle,
  FileText,
  AlertTriangle
} from 'lucide-react';

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
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
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
    try {
      await deleteVehicle(id);
      setDeleteConfirm(null);
      loadData();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
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

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'car':
        return <Car className="w-5 h-5" />;
      case 'motorcycle':
        return <Bike className="w-5 h-5" />;
      default:
        return <Car className="w-5 h-5" />;
    }
  };

  const getVehicleLabel = (type: string) => {
    switch (type) {
      case 'car':
        return 'Ô tô';
      case 'motorcycle':
        return 'Xe máy';
      case 'bicycle':
        return 'Xe đạp';
      default:
        return 'Khác';
    }
  };

  const stats = {
    total: vehicles.length,
    cars: vehicles.filter(v => v.vehicleType === 'car').length,
    motorcycles: vehicles.filter(v => v.vehicleType === 'motorcycle').length,
    active: vehicles.filter(v => v.isActive).length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
              <div className="text-xs text-slate-500">Tổng phương tiện</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{stats.cars}</div>
              <div className="text-xs text-slate-500">Ô tô</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Bike className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{stats.motorcycles}</div>
              <div className="text-xs text-slate-500">Xe máy</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{stats.active}</div>
              <div className="text-xs text-slate-500">Đang hoạt động</div>
            </div>
          </div>
        </div>
      </div>

      {/* Header & Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Car className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Quản lý Phương tiện</h2>
              <p className="text-sm text-slate-500">Danh sách xe đã đăng ký</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm biển số, tên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg w-full lg:w-56 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-10 pr-8 py-2 border border-slate-200 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
              >
                <option value="">Tất cả loại xe</option>
                <option value="car">Ô tô</option>
                <option value="motorcycle">Xe máy</option>
                <option value="bicycle">Xe đạp</option>
                <option value="other">Khác</option>
              </select>
            </div>
            <button
              onClick={() => {
                setEditingVehicle(null);
                resetForm();
                setShowForm(true);
              }}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium text-sm shadow-lg shadow-indigo-200"
            >
              <Plus className="w-4 h-4" />
              Thêm mới
            </button>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">
                      {editingVehicle ? 'Chỉnh sửa phương tiện' : 'Thêm phương tiện mới'}
                    </h3>
                    <p className="text-sm text-blue-100">Nhập thông tin xe</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingVehicle(null);
                    resetForm();
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-160px)]">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Biển số xe <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.plateNumber}
                  onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value.toUpperCase() })}
                  placeholder="VD: 51A-12345"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition uppercase font-mono text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Chủ xe (Cư dân) <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.residentId}
                  onChange={(e) => handleResidentChange(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
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
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Loại xe <span className="text-red-500">*</span>
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
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  >
                    <option value="car">Ô tô</option>
                    <option value="motorcycle">Xe máy</option>
                    <option value="bicycle">Xe đạp</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Hãng xe
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="VD: Toyota, Honda"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Dòng xe
                  </label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="VD: Camry, SH"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Màu xe
                  </label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="VD: Trắng, Đen"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Vị trí đỗ xe
                </label>
                <div className="relative">
                  <ParkingCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={formData.parkingSlot}
                    onChange={(e) => setFormData({ ...formData, parkingSlot: e.target.value })}
                    placeholder="VD: B1-A15"
                    className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Ghi chú
                </label>
                <div className="relative">
                  <FileText className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                    placeholder="Ghi chú thêm..."
                    className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="isActive" className="text-sm text-slate-700 flex items-center gap-2">
                  {formData.isActive ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-slate-400" />
                  )}
                  Đang hoạt động
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingVehicle(null);
                    resetForm();
                  }}
                  className="px-5 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium flex items-center gap-2"
                >
                  {editingVehicle ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Cập nhật
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Thêm mới
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Xác nhận xóa</h3>
              <p className="text-slate-500 mb-6">Bạn có chắc muốn xóa phương tiện này? Hành động này không thể hoàn tác.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition font-medium"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
            <p className="text-slate-500">Đang tải dữ liệu...</p>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
              <Car className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium">
              {searchTerm || filterType ? 'Không tìm thấy kết quả' : 'Chưa có phương tiện nào'}
            </p>
            <p className="text-slate-400 text-sm mt-1">
              {searchTerm || filterType ? 'Thử thay đổi bộ lọc' : 'Bấm "Thêm mới" để thêm phương tiện'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Biển số</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Chủ xe</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Căn hộ</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Loại xe</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Thông tin</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
                        {vehicle.plateNumber}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-slate-700">{vehicle.residentName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-indigo-400" />
                        <span className="text-indigo-600 font-medium">{vehicle.apartmentCode}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${
                        vehicle.vehicleType === 'car'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {getVehicleIcon(vehicle.vehicleType)}
                        {getVehicleLabel(vehicle.vehicleType)}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm text-slate-500">
                        {[vehicle.brand, vehicle.model, vehicle.color].filter(Boolean).join(' • ') || (
                          <span className="text-slate-300 italic">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {vehicle.isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                          <XCircle className="w-3 h-3" />
                          Ngừng
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(vehicle)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(vehicle.id!)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer */}
        {filteredVehicles.length > 0 && (
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-sm text-slate-500">
            Hiển thị {filteredVehicles.length} / {vehicles.length} phương tiện
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Resident, Block, Apartment } from '@/lib/types';
import { getAllResidents, createResident, updateResident, deleteResident } from '@/lib/db/residents';
import { getAllBlocks } from '@/lib/db/blocks';
import { getAllApartments } from '@/lib/db/apartments';
import {
  Users,
  User,
  Phone,
  Mail,
  Building2,
  Home,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  X,
  Loader2,
  CreditCard,
  FileText,
  UserCheck,
  UserX,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export default function ResidentsTab() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBlock, setFilterBlock] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    idNumber: '',
    blockId: '',
    blockCode: '',
    apartmentId: '',
    apartmentCode: '',
    isOwner: false,
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [residentsData, blocksData, apartmentsData] = await Promise.all([
        getAllResidents(),
        getAllBlocks(),
        getAllApartments(),
      ]);
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
      if (editingResident) {
        await updateResident(editingResident.id!, formData);
      } else {
        await createResident(formData);
      }
      setShowForm(false);
      setEditingResident(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving resident:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  const handleEdit = (resident: Resident) => {
    setEditingResident(resident);
    setFormData({
      fullName: resident.fullName,
      phone: resident.phone,
      email: resident.email || '',
      idNumber: resident.idNumber || '',
      blockId: resident.blockId,
      blockCode: resident.blockCode,
      apartmentId: resident.apartmentId,
      apartmentCode: resident.apartmentCode,
      isOwner: resident.isOwner,
      notes: resident.notes || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteResident(id);
      setDeleteConfirm(null);
      loadData();
    } catch (error) {
      console.error('Error deleting resident:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      idNumber: '',
      blockId: '',
      blockCode: '',
      apartmentId: '',
      apartmentCode: '',
      isOwner: false,
      notes: '',
    });
  };

  const handleBlockChange = (blockId: string) => {
    const block = blocks.find((b) => b.id === blockId);
    setFormData({
      ...formData,
      blockId,
      blockCode: block?.code || '',
      apartmentId: '',
      apartmentCode: '',
    });
  };

  const handleApartmentChange = (apartmentId: string) => {
    const apartment = apartments.find((a) => a.id === apartmentId);
    setFormData({
      ...formData,
      apartmentId,
      apartmentCode: apartment?.code || '',
    });
  };

  const filteredResidents = residents.filter((r) => {
    const matchesSearch =
      r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.phone.includes(searchTerm) ||
      r.apartmentCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBlock = !filterBlock || r.blockId === filterBlock;
    return matchesSearch && matchesBlock;
  });

  const filteredApartments = formData.blockId
    ? apartments.filter((a) => a.blockId === formData.blockId)
    : apartments;

  const stats = {
    total: residents.length,
    owners: residents.filter(r => r.isOwner).length,
    members: residents.filter(r => !r.isOwner).length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
              <div className="text-xs text-slate-500">Tổng cư dân</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{stats.owners}</div>
              <div className="text-xs text-slate-500">Chủ hộ</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{stats.members}</div>
              <div className="text-xs text-slate-500">Thành viên</div>
            </div>
          </div>
        </div>
      </div>

      {/* Header & Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Quản lý Cư dân</h2>
              <p className="text-sm text-slate-500">Thông tin cư dân chung cư</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm tên, SĐT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg w-full lg:w-56 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
              />
            </div>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={filterBlock}
                onChange={(e) => setFilterBlock(e.target.value)}
                className="pl-10 pr-8 py-2 border border-slate-200 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
              >
                <option value="">Tất cả tòa nhà</option>
                {blocks.map((block) => (
                  <option key={block.id} value={block.id}>
                    {block.code}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => {
                setEditingResident(null);
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
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">
                      {editingResident ? 'Chỉnh sửa cư dân' : 'Thêm cư dân mới'}
                    </h3>
                    <p className="text-sm text-blue-100">Nhập thông tin cư dân</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingResident(null);
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
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Nguyễn Văn A"
                    className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="0901234567"
                      className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@example.com"
                      className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  CCCD/CMND
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={formData.idNumber}
                    onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                    placeholder="001234567890"
                    className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Tòa nhà <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      required
                      value={formData.blockId}
                      onChange={(e) => handleBlockChange(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition appearance-none"
                    >
                      <option value="">Chọn tòa nhà</option>
                      {blocks.map((block) => (
                        <option key={block.id} value={block.id}>
                          {block.code} - {block.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Căn hộ <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Home className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      required
                      value={formData.apartmentId}
                      onChange={(e) => handleApartmentChange(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition appearance-none disabled:bg-slate-50 disabled:text-slate-400"
                      disabled={!formData.blockId}
                    >
                      <option value="">Chọn căn hộ</option>
                      {filteredApartments.map((apt) => (
                        <option key={apt.id} value={apt.id}>
                          {apt.code}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <input
                  type="checkbox"
                  id="isOwner"
                  checked={formData.isOwner}
                  onChange={(e) => setFormData({ ...formData, isOwner: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="isOwner" className="text-sm text-slate-700 flex items-center gap-2">
                  {formData.isOwner ? (
                    <UserCheck className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <User className="w-4 h-4 text-slate-400" />
                  )}
                  Là chủ hộ
                </label>
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

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingResident(null);
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
                  {editingResident ? (
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
              <p className="text-slate-500 mb-6">Bạn có chắc muốn xóa cư dân này? Hành động này không thể hoàn tác.</p>
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
        ) : filteredResidents.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium">
              {searchTerm || filterBlock ? 'Không tìm thấy kết quả' : 'Chưa có cư dân nào'}
            </p>
            <p className="text-slate-400 text-sm mt-1">
              {searchTerm || filterBlock ? 'Thử thay đổi bộ lọc' : 'Bấm "Thêm mới" để thêm cư dân'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Cư dân</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Liên hệ</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Căn hộ</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Vai trò</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResidents.map((resident) => (
                  <tr key={resident.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                          resident.isOwner ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' : 'bg-gradient-to-br from-slate-400 to-slate-600'
                        }`}>
                          {resident.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-slate-700">{resident.fullName}</div>
                          {resident.idNumber && (
                            <div className="text-xs text-slate-400 flex items-center gap-1">
                              <CreditCard className="w-3 h-3" />
                              {resident.idNumber}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span className="text-slate-700">{resident.phone}</span>
                        </div>
                        {resident.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span className="text-slate-500">{resident.email}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-indigo-400" />
                        <span className="font-mono font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                          {resident.apartmentCode}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {resident.isOwner ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                          <UserCheck className="w-3 h-3" />
                          Chủ hộ
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                          <User className="w-3 h-3" />
                          Thành viên
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(resident)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(resident.id!)}
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
        {filteredResidents.length > 0 && (
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-sm text-slate-500">
            Hiển thị {filteredResidents.length} / {residents.length} cư dân
          </div>
        )}
      </div>
    </div>
  );
}

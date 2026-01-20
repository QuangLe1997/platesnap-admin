'use client';

import { useState, useEffect } from 'react';
import { Apartment, Block } from '@/lib/types';
import { getAllApartments, createApartment, updateApartment, deleteApartment } from '@/lib/db/apartments';
import { getAllBlocks } from '@/lib/db/blocks';
import {
  Home,
  Building2,
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  Layers,
  Maximize,
  Filter,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export default function ApartmentsTab() {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingApartment, setEditingApartment] = useState<Apartment | null>(null);
  const [filterBlock, setFilterBlock] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    blockId: '',
    blockCode: '',
    floor: 1,
    roomNumber: '',
    type: '',
    area: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [apartmentsData, blocksData] = await Promise.all([
        getAllApartments(),
        getAllBlocks(),
      ]);
      setApartments(apartmentsData);
      setBlocks(blocksData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingApartment) {
        await updateApartment(editingApartment.id!, formData);
      } else {
        await createApartment(formData);
      }
      setShowForm(false);
      setEditingApartment(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving apartment:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  const handleEdit = (apartment: Apartment) => {
    setEditingApartment(apartment);
    setFormData({
      blockId: apartment.blockId,
      blockCode: apartment.blockCode,
      floor: apartment.floor,
      roomNumber: apartment.roomNumber,
      type: apartment.type || '',
      area: apartment.area || 0,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteApartment(id);
      setDeleteConfirm(null);
      loadData();
    } catch (error) {
      console.error('Error deleting apartment:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      blockId: '',
      blockCode: '',
      floor: 1,
      roomNumber: '',
      type: '',
      area: 0,
    });
  };

  const handleBlockChange = (blockId: string) => {
    const block = blocks.find((b) => b.id === blockId);
    setFormData({
      ...formData,
      blockId,
      blockCode: block?.code || '',
    });
  };

  const filteredApartments = filterBlock
    ? apartments.filter((a) => a.blockId === filterBlock)
    : apartments;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Home className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Quản lý Căn hộ</h3>
            <p className="text-xs text-slate-500">{apartments.length} căn hộ</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={filterBlock}
              onChange={(e) => setFilterBlock(e.target.value)}
              className="pl-10 pr-8 py-2 border border-slate-200 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
            >
              <option value="">Tất cả tòa nhà</option>
              {blocks.map((block) => (
                <option key={block.id} value={block.id}>
                  {block.code} - {block.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => {
              setEditingApartment(null);
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Thêm mới
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Home className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">
                      {editingApartment ? 'Chỉnh sửa căn hộ' : 'Thêm căn hộ mới'}
                    </h3>
                    <p className="text-sm text-emerald-100">Nhập thông tin căn hộ</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingApartment(null);
                    resetForm();
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Tầng <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      required
                      min={1}
                      value={formData.floor}
                      onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) })}
                      className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Số phòng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    placeholder="VD: 101, 2501"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Loại căn hộ
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition appearance-none"
                  >
                    <option value="">Chọn loại</option>
                    <option value="Studio">Studio</option>
                    <option value="1BR">1 Phòng ngủ</option>
                    <option value="2BR">2 Phòng ngủ</option>
                    <option value="3BR">3 Phòng ngủ</option>
                    <option value="Penthouse">Penthouse</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Diện tích (m²)
                  </label>
                  <div className="relative">
                    <Maximize className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      min={0}
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: parseFloat(e.target.value) })}
                      className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingApartment(null);
                    resetForm();
                  }}
                  className="px-5 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-medium flex items-center gap-2"
                >
                  {editingApartment ? (
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
              <p className="text-slate-500 mb-6">Bạn có chắc muốn xóa căn hộ này?</p>
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
      <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mx-auto mb-2" />
            <p className="text-slate-500 text-sm">Đang tải...</p>
          </div>
        ) : filteredApartments.length === 0 ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-100 rounded-full mb-3">
              <Home className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium">Chưa có căn hộ nào</p>
            <p className="text-slate-400 text-sm mt-1">Bấm "Thêm mới" để thêm căn hộ</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white border-b border-slate-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Mã căn hộ</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tòa nhà</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tầng</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Loại</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Diện tích</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredApartments.map((apartment) => (
                  <tr key={apartment.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                        {apartment.code}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-indigo-400" />
                        <span className="text-slate-700">{apartment.blockCode}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-slate-600">Tầng {apartment.floor}</span>
                    </td>
                    <td className="px-4 py-3">
                      {apartment.type ? (
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                          {apartment.type}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {apartment.area ? (
                        <span className="text-slate-600">{apartment.area} m²</span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(apartment)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(apartment.id!)}
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
        {filteredApartments.length > 0 && (
          <div className="px-4 py-2 bg-white border-t border-slate-100 text-xs text-slate-500">
            Hiển thị {filteredApartments.length} / {apartments.length} căn hộ
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Block } from '@/lib/types';
import { getAllBlocks, createBlock, updateBlock, deleteBlock } from '@/lib/db/blocks';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  FileText,
  Layers,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export default function BlocksTab() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBlock, setEditingBlock] = useState<Block | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    totalFloors: 20,
    description: '',
  });

  useEffect(() => {
    loadBlocks();
  }, []);

  const loadBlocks = async () => {
    setIsLoading(true);
    try {
      const data = await getAllBlocks();
      setBlocks(data);
    } catch (error) {
      console.error('Error loading blocks:', error);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBlock) {
        await updateBlock(editingBlock.id!, formData);
      } else {
        await createBlock(formData);
      }
      setShowForm(false);
      setEditingBlock(null);
      resetForm();
      loadBlocks();
    } catch (error) {
      console.error('Error saving block:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  const handleEdit = (block: Block) => {
    setEditingBlock(block);
    setFormData({
      code: block.code,
      name: block.name,
      totalFloors: block.totalFloors,
      description: block.description || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBlock(id);
      setDeleteConfirm(null);
      loadBlocks();
    } catch (error) {
      console.error('Error deleting block:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      totalFloors: 20,
      description: '',
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Quản lý Tòa nhà</h3>
            <p className="text-xs text-slate-500">{blocks.length} tòa nhà</p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditingBlock(null);
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          Thêm mới
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">
                      {editingBlock ? 'Chỉnh sửa tòa nhà' : 'Thêm tòa nhà mới'}
                    </h3>
                    <p className="text-sm text-blue-100">Nhập thông tin tòa nhà</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingBlock(null);
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
                  Mã tòa nhà <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="VD: A, B, C"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition uppercase font-mono text-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Tên tòa nhà <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: Block A - Orchid Tower"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Số tầng <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.totalFloors}
                    onChange={(e) => setFormData({ ...formData, totalFloors: parseInt(e.target.value) })}
                    className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Mô tả
                </label>
                <div className="relative">
                  <FileText className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    placeholder="Mô tả tòa nhà..."
                    className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingBlock(null);
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
                  {editingBlock ? (
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
              <p className="text-slate-500 mb-6">Bạn có chắc muốn xóa tòa nhà này? Tất cả căn hộ và cư dân liên quan cũng sẽ bị ảnh hưởng.</p>
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
        ) : blocks.length === 0 ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-100 rounded-full mb-3">
              <Building2 className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium">Chưa có tòa nhà nào</p>
            <p className="text-slate-400 text-sm mt-1">Bấm "Thêm mới" để thêm tòa nhà</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-white border-b border-slate-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Mã</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tên tòa nhà</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Số tầng</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Mô tả</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {blocks.map((block) => (
                <tr key={block.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3">
                    <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                      {block.code}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">{block.name}</td>
                  <td className="px-4 py-3">
                    <span className="text-slate-600">{block.totalFloors} tầng</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-sm">{block.description || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleEdit(block)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(block.id!)}
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
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Block } from '@/lib/types';
import { getAllBlocks, createBlock, updateBlock, deleteBlock } from '@/lib/db/blocks';

export default function BlocksTab() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBlock, setEditingBlock] = useState<Block | null>(null);
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
    if (confirm('Bạn có chắc muốn xóa tòa nhà này? Tất cả căn hộ và cư dân liên quan cũng sẽ bị ảnh hưởng.')) {
      try {
        await deleteBlock(id);
        loadBlocks();
      } catch (error) {
        console.error('Error deleting block:', error);
        alert('Có lỗi xảy ra. Vui lòng thử lại.');
      }
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Quản lý Tòa nhà</h2>
        <button
          onClick={() => {
            setEditingBlock(null);
            resetForm();
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Thêm tòa nhà
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">
                {editingBlock ? 'Chỉnh sửa tòa nhà' : 'Thêm tòa nhà mới'}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mã tòa nhà *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="VD: A, B, C"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên tòa nhà *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="VD: Block A - Orchid Tower"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số tầng *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={formData.totalFloors}
                      onChange={(e) => setFormData({ ...formData, totalFloors: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mô tả
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingBlock(null);
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
                    {editingBlock ? 'Cập nhật' : 'Thêm mới'}
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
        ) : blocks.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Chưa có tòa nhà nào</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Mã</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Tên tòa nhà</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Số tầng</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Mô tả</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {blocks.map((block) => (
                <tr key={block.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {block.code}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">{block.name}</td>
                  <td className="px-4 py-3">{block.totalFloors} tầng</td>
                  <td className="px-4 py-3 text-gray-500">{block.description || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleEdit(block)}
                      className="text-blue-600 hover:text-blue-800 px-2 py-1"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(block.id!)}
                      className="text-red-600 hover:text-red-800 px-2 py-1 ml-2"
                    >
                      Xóa
                    </button>
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

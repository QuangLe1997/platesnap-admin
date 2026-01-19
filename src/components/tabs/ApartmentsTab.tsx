'use client';

import { useState, useEffect } from 'react';
import { Apartment, Block } from '@/lib/types';
import { getAllApartments, createApartment, updateApartment, deleteApartment } from '@/lib/db/apartments';
import { getAllBlocks } from '@/lib/db/blocks';

export default function ApartmentsTab() {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingApartment, setEditingApartment] = useState<Apartment | null>(null);
  const [filterBlock, setFilterBlock] = useState('');
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
    if (confirm('Bạn có chắc muốn xóa căn hộ này?')) {
      try {
        await deleteApartment(id);
        loadData();
      } catch (error) {
        console.error('Error deleting apartment:', error);
      }
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold">Quản lý Căn hộ</h2>
          <select
            value={filterBlock}
            onChange={(e) => setFilterBlock(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
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
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Thêm căn hộ
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">
                {editingApartment ? 'Chỉnh sửa căn hộ' : 'Thêm căn hộ mới'}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tòa nhà *
                    </label>
                    <select
                      required
                      value={formData.blockId}
                      onChange={(e) => handleBlockChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Chọn tòa nhà</option>
                      {blocks.map((block) => (
                        <option key={block.id} value={block.id}>
                          {block.code} - {block.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tầng *
                      </label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={formData.floor}
                        onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số phòng *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.roomNumber}
                        onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                        placeholder="VD: 101, 2501"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Loại căn hộ
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Diện tích (m²)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={formData.area}
                        onChange={(e) => setFormData({ ...formData, area: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingApartment(null);
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
                    {editingApartment ? 'Cập nhật' : 'Thêm mới'}
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
        ) : filteredApartments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Chưa có căn hộ nào</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Mã căn hộ</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Tòa nhà</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Tầng</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Loại</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Diện tích</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredApartments.map((apartment) => (
                  <tr key={apartment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                        {apartment.code}
                      </span>
                    </td>
                    <td className="px-4 py-3">{apartment.blockCode}</td>
                    <td className="px-4 py-3">Tầng {apartment.floor}</td>
                    <td className="px-4 py-3">{apartment.type || '-'}</td>
                    <td className="px-4 py-3">{apartment.area ? `${apartment.area} m²` : '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleEdit(apartment)}
                        className="text-blue-600 hover:text-blue-800 px-2 py-1"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(apartment.id!)}
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

'use client';

import { useState, useEffect } from 'react';
import { Resident, Block, Apartment } from '@/lib/types';
import { getAllResidents, createResident, updateResident, deleteResident } from '@/lib/db/residents';
import { getAllBlocks } from '@/lib/db/blocks';
import { getAllApartments } from '@/lib/db/apartments';

export default function ResidentsTab() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBlock, setFilterBlock] = useState('');
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
    if (confirm('Bạn có chắc muốn xóa cư dân này?')) {
      try {
        await deleteResident(id);
        loadData();
      } catch (error) {
        console.error('Error deleting resident:', error);
      }
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

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold">Quản lý Cư dân</h2>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg w-48"
          />
          <select
            value={filterBlock}
            onChange={(e) => setFilterBlock(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Tất cả tòa nhà</option>
            {blocks.map((block) => (
              <option key={block.id} value={block.id}>
                {block.code}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setEditingResident(null);
              resetForm();
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + Thêm cư dân
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">
                {editingResident ? 'Chỉnh sửa cư dân' : 'Thêm cư dân mới'}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số điện thoại *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CCCD/CMND
                    </label>
                    <input
                      type="text"
                      value={formData.idNumber}
                      onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Căn hộ *
                      </label>
                      <select
                        required
                        value={formData.apartmentId}
                        onChange={(e) => handleApartmentChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isOwner"
                      checked={formData.isOwner}
                      onChange={(e) => setFormData({ ...formData, isOwner: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <label htmlFor="isOwner" className="text-sm text-gray-700">
                      Là chủ hộ
                    </label>
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
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingResident(null);
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
                    {editingResident ? 'Cập nhật' : 'Thêm mới'}
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
        ) : filteredResidents.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm || filterBlock ? 'Không tìm thấy kết quả' : 'Chưa có cư dân nào'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Họ tên</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">SĐT</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Căn hộ</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Vai trò</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredResidents.map((resident) => (
                  <tr key={resident.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium">{resident.fullName}</div>
                      {resident.email && (
                        <div className="text-sm text-gray-500">{resident.email}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">{resident.phone}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-purple-600 bg-purple-50 px-2 py-1 rounded">
                        {resident.apartmentCode}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {resident.isOwner ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          Chủ hộ
                        </span>
                      ) : (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          Thành viên
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleEdit(resident)}
                        className="text-blue-600 hover:text-blue-800 px-2 py-1"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(resident.id!)}
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

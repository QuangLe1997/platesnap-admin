'use client';

import { useState, useRef } from 'react';
import { seedDatabase } from '@/lib/db/seed';
import { createBlock, getAllBlocks } from '@/lib/db/blocks';
import { createApartment, getAllApartments } from '@/lib/db/apartments';
import { createResident } from '@/lib/db/residents';
import { createVehicle } from '@/lib/db/vehicles';
import { Block, Apartment } from '@/lib/types';

type ImportType = 'blocks' | 'apartments' | 'residents' | 'vehicles';

export default function ImportTab() {
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const [selectedType, setSelectedType] = useState<ImportType>('blocks');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const text = await file.text();
      let data: Record<string, unknown>[];

      if (file.name.endsWith('.json')) {
        data = JSON.parse(text);
      } else if (file.name.endsWith('.csv')) {
        data = parseCSV(text);
      } else {
        throw new Error('Chỉ hỗ trợ file CSV hoặc JSON');
      }

      const result = await importData(selectedType, data);
      setImportResult(result);
    } catch (error) {
      setImportResult({
        success: 0,
        failed: 0,
        errors: [`Lỗi: ${error instanceof Error ? error.message : 'Không xác định'}`],
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const parseCSV = (text: string): Record<string, unknown>[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
    const result: Record<string, unknown>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
      const obj: Record<string, unknown> = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });
      result.push(obj);
    }

    return result;
  };

  const importData = async (
    type: ImportType,
    data: Record<string, unknown>[]
  ): Promise<{ success: number; failed: number; errors: string[] }> => {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    // Get existing data for lookups
    const blocks = await getAllBlocks();
    const apartments = await getAllApartments();
    const blockMap = new Map(blocks.map((b) => [b.code, b]));
    const apartmentMap = new Map(apartments.map((a) => [a.code, a]));

    for (const item of data) {
      try {
        switch (type) {
          case 'blocks':
            await createBlock({
              code: String(item.code || ''),
              name: String(item.name || ''),
              totalFloors: Number(item.totalFloors) || 20,
              description: String(item.description || ''),
            });
            break;

          case 'apartments': {
            const block = blockMap.get(String(item.blockCode || '').toUpperCase());
            if (!block) {
              throw new Error(`Block ${item.blockCode} không tồn tại`);
            }
            await createApartment({
              blockId: block.id!,
              blockCode: block.code,
              floor: Number(item.floor) || 1,
              roomNumber: String(item.roomNumber || ''),
              type: String(item.type || ''),
              area: Number(item.area) || 0,
            });
            break;
          }

          case 'residents': {
            const apartment = apartmentMap.get(String(item.apartmentCode || '').toUpperCase());
            if (!apartment) {
              throw new Error(`Căn hộ ${item.apartmentCode} không tồn tại`);
            }
            const block = blockMap.get(apartment.blockCode);
            await createResident({
              fullName: String(item.fullName || ''),
              phone: String(item.phone || ''),
              email: String(item.email || ''),
              idNumber: String(item.idNumber || ''),
              apartmentId: apartment.id!,
              apartmentCode: apartment.code,
              blockId: block?.id || '',
              blockCode: apartment.blockCode,
              isOwner: item.isOwner === 'true' || item.isOwner === true,
              notes: String(item.notes || ''),
            });
            break;
          }

          case 'vehicles': {
            // Need to find resident first
            // For simplicity, use apartmentCode to link
            const apartment = apartmentMap.get(String(item.apartmentCode || '').toUpperCase());
            if (!apartment) {
              throw new Error(`Căn hộ ${item.apartmentCode} không tồn tại`);
            }
            const block = blockMap.get(apartment.blockCode);
            await createVehicle({
              plateNumber: String(item.plateNumber || ''),
              residentId: String(item.residentId || ''),
              residentName: String(item.residentName || ''),
              apartmentId: apartment.id!,
              apartmentCode: apartment.code,
              blockId: block?.id || '',
              blockCode: apartment.blockCode,
              vehicleType: (item.vehicleType as 'car' | 'motorcycle' | 'bicycle' | 'other') || 'car',
              brand: String(item.brand || ''),
              model: String(item.model || ''),
              color: String(item.color || ''),
              parkingSlot: String(item.parkingSlot || ''),
              notes: String(item.notes || ''),
              isActive: item.isActive !== 'false' && item.isActive !== false,
            });
            break;
          }
        }
        success++;
      } catch (error) {
        failed++;
        errors.push(`Dòng ${success + failed}: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
      }
    }

    return { success, failed, errors };
  };

  const handleSeedData = async () => {
    if (!confirm('Bạn có chắc muốn tạo dữ liệu mẫu? Thao tác này sẽ thêm dữ liệu vào database.')) {
      return;
    }

    setIsImporting(true);
    try {
      const result = await seedDatabase();
      alert(result.message);
    } catch (error) {
      alert('Có lỗi xảy ra khi tạo dữ liệu mẫu');
    }
    setIsImporting(false);
  };

  const templates = {
    blocks: `code,name,totalFloors,description
A,Block A - Orchid Tower,30,Tòa nhà phía Đông
B,Block B - Lotus Tower,25,Tòa nhà phía Tây`,
    apartments: `blockCode,roomNumber,floor,type,area
A,101,1,Studio,45
A,102,1,1BR,65
A,201,2,2BR,85`,
    residents: `fullName,phone,email,apartmentCode,isOwner
Nguyễn Văn An,0901234567,an@email.com,A-101,true
Trần Thị Bích,0912345678,bich@email.com,A-101,false`,
    vehicles: `plateNumber,residentName,apartmentCode,vehicleType,brand,model,color
51A-12345,Nguyễn Văn An,A-101,car,Toyota,Camry,Trắng
51B-67890,Nguyễn Văn An,A-101,motorcycle,Honda,SH,Đen`,
  };

  const downloadTemplate = (type: ImportType) => {
    const content = templates[type];
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `template_${type}.csv`;
    link.click();
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Nhập liệu hàng loạt</h2>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Import Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Import từ file</h3>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn loại dữ liệu
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as ImportType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="blocks">Tòa nhà (Blocks)</option>
              <option value="apartments">Căn hộ (Apartments)</option>
              <option value="residents">Cư dân (Residents)</option>
              <option value="vehicles">Phương tiện (Vehicles)</option>
            </select>
          </div>

          <div className="mb-4">
            <button
              onClick={() => downloadTemplate(selectedType)}
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              📥 Tải file mẫu CSV
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn file (CSV hoặc JSON)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json"
              onChange={handleFileSelect}
              disabled={isImporting}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {isImporting && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Đang import...</p>
            </div>
          )}

          {importResult && (
            <div className={`p-4 rounded-lg ${importResult.failed > 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
              <p className="font-medium">
                ✅ Thành công: {importResult.success} | ❌ Thất bại: {importResult.failed}
              </p>
              {importResult.errors.length > 0 && (
                <div className="mt-2 max-h-32 overflow-y-auto">
                  {importResult.errors.map((error, i) => (
                    <p key={i} className="text-sm text-red-600">{error}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Seed Data Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Tạo dữ liệu mẫu</h3>

          <p className="text-gray-600 mb-4">
            Tạo nhanh dữ liệu mẫu để test hệ thống. Bao gồm:
          </p>

          <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
            <li>3 Tòa nhà (A, B, C)</li>
            <li>60 Căn hộ</li>
            <li>10 Cư dân</li>
            <li>10 Phương tiện</li>
            <li>2 Tài khoản Admin</li>
          </ul>

          <button
            onClick={handleSeedData}
            disabled={isImporting}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition"
          >
            {isImporting ? 'Đang tạo...' : '🌱 Tạo dữ liệu mẫu'}
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">Hướng dẫn Import</h4>
        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
          <li>Chọn loại dữ liệu cần import</li>
          <li>Tải file mẫu CSV để xem cấu trúc dữ liệu</li>
          <li>Điền dữ liệu vào file theo đúng format</li>
          <li>Upload file CSV hoặc JSON</li>
          <li><strong>Lưu ý:</strong> Import theo thứ tự: Tòa nhà → Căn hộ → Cư dân → Phương tiện</li>
        </ol>
      </div>
    </div>
  );
}

'use client';

import { useState, useRef } from 'react';
import { createBlock, getAllBlocks } from '@/lib/db/blocks';
import { createApartment, getAllApartments } from '@/lib/db/apartments';
import { createResident } from '@/lib/db/residents';
import { createVehicle } from '@/lib/db/vehicles';
import {
  Upload,
  Download,
  FileSpreadsheet,
  Building2,
  Home,
  Users,
  Car,
  Loader2,
  CheckCircle,
  AlertTriangle,
  X,
  FileJson,
  Info,
  ArrowRight,
  FolderOpen,
  Eye,
  Table
} from 'lucide-react';

type ImportType = 'blocks' | 'apartments' | 'residents' | 'vehicles';

export default function ImportTab() {
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const [selectedType, setSelectedType] = useState<ImportType>('blocks');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const importTypes = [
    { id: 'blocks' as ImportType, label: 'Tòa nhà', icon: Building2, color: 'indigo' },
    { id: 'apartments' as ImportType, label: 'Căn hộ', icon: Home, color: 'emerald' },
    { id: 'residents' as ImportType, label: 'Cư dân', icon: Users, color: 'blue' },
    { id: 'vehicles' as ImportType, label: 'Phương tiện', icon: Car, color: 'amber' },
  ];

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

  // Sample data for preview table
  const sampleData = {
    blocks: {
      headers: ['code', 'name', 'totalFloors', 'description'],
      rows: [
        ['A', 'Block A - Orchid Tower', '30', 'Tòa nhà phía Đông'],
        ['B', 'Block B - Lotus Tower', '25', 'Tòa nhà phía Tây'],
        ['C', 'Block C - Rose Tower', '20', 'Tòa nhà trung tâm'],
      ],
      descriptions: {
        code: 'Mã tòa nhà (VD: A, B, C)',
        name: 'Tên đầy đủ của tòa nhà',
        totalFloors: 'Tổng số tầng',
        description: 'Mô tả thêm (tùy chọn)',
      },
    },
    apartments: {
      headers: ['blockCode', 'roomNumber', 'floor', 'type', 'area'],
      rows: [
        ['A', '101', '1', 'Studio', '45'],
        ['A', '102', '1', '1BR', '65'],
        ['B', '201', '2', '2BR', '85'],
      ],
      descriptions: {
        blockCode: 'Mã tòa nhà (phải tồn tại)',
        roomNumber: 'Số phòng',
        floor: 'Tầng',
        type: 'Loại căn hộ (Studio, 1BR, 2BR...)',
        area: 'Diện tích (m²)',
      },
    },
    residents: {
      headers: ['fullName', 'phone', 'email', 'apartmentCode', 'isOwner'],
      rows: [
        ['Nguyễn Văn An', '0901234567', 'an@email.com', 'A-101', 'true'],
        ['Trần Thị Bích', '0912345678', 'bich@email.com', 'A-101', 'false'],
        ['Lê Minh Tuấn', '0923456789', 'tuan@email.com', 'B-201', 'true'],
      ],
      descriptions: {
        fullName: 'Họ và tên đầy đủ',
        phone: 'Số điện thoại',
        email: 'Email liên hệ',
        apartmentCode: 'Mã căn hộ (phải tồn tại)',
        isOwner: 'Chủ hộ (true/false)',
      },
    },
    vehicles: {
      headers: ['plateNumber', 'residentName', 'apartmentCode', 'vehicleType', 'brand', 'model', 'color'],
      rows: [
        ['51A-12345', 'Nguyễn Văn An', 'A-101', 'car', 'Toyota', 'Camry', 'Trắng'],
        ['51B-67890', 'Nguyễn Văn An', 'A-101', 'motorcycle', 'Honda', 'SH', 'Đen'],
        ['30H-11111', 'Lê Minh Tuấn', 'B-201', 'car', 'Mazda', 'CX-5', 'Đỏ'],
      ],
      descriptions: {
        plateNumber: 'Biển số xe',
        residentName: 'Tên chủ xe',
        apartmentCode: 'Mã căn hộ (phải tồn tại)',
        vehicleType: 'Loại xe (car, motorcycle, bicycle)',
        brand: 'Hãng xe',
        model: 'Model xe',
        color: 'Màu sắc',
      },
    },
  };

  const downloadTemplate = (type: ImportType) => {
    const content = templates[type];
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `template_${type}.csv`;
    link.click();
  };

  const currentSample = sampleData[selectedType];
  const currentTypeInfo = importTypes.find(t => t.id === selectedType)!;
  const TypeIcon = currentTypeInfo.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
          <Upload className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Nhập liệu hàng loạt</h2>
          <p className="text-sm text-slate-500">Import dữ liệu từ file CSV hoặc JSON</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Import Section */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold">Import từ file</h3>
                <p className="text-sm text-blue-100">CSV hoặc JSON format</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Import Type Selector */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Chọn loại dữ liệu
              </label>
              <div className="grid grid-cols-2 gap-2">
                {importTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = selectedType === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 transition ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Download Template */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-2">
                <FileJson className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-600">Tải file mẫu để xem cấu trúc</span>
              </div>
              <button
                onClick={() => downloadTemplate(selectedType)}
                className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                Tải mẫu
              </button>
            </div>

            {/* File Upload Area */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Chọn file upload
              </label>
              <div
                className={`relative border-2 border-dashed rounded-xl p-6 text-center transition ${
                  isImporting
                    ? 'border-indigo-300 bg-indigo-50'
                    : 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json"
                  onChange={handleFileSelect}
                  disabled={isImporting}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                {isImporting ? (
                  <div className="py-2">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-indigo-600 font-medium">Đang import...</p>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <FolderOpen className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-600 font-medium">
                      Kéo thả file hoặc click để chọn
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Hỗ trợ file .csv và .json
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Import Result */}
            {importResult && (
              <div className={`p-4 rounded-xl border ${
                importResult.failed > 0
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-emerald-50 border-emerald-200'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  {importResult.failed > 0 ? (
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  )}
                  <span className={`font-medium ${
                    importResult.failed > 0 ? 'text-amber-800' : 'text-emerald-800'
                  }`}>
                    Kết quả Import
                  </span>
                </div>
                <div className="flex gap-4 text-sm">
                  <span className="text-emerald-600 font-medium">
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    Thành công: {importResult.success}
                  </span>
                  <span className="text-red-600 font-medium">
                    <X className="w-4 h-4 inline mr-1" />
                    Thất bại: {importResult.failed}
                  </span>
                </div>
                {importResult.errors.length > 0 && (
                  <div className="mt-3 max-h-24 overflow-y-auto">
                    {importResult.errors.map((error, i) => (
                      <p key={i} className="text-xs text-red-600 py-0.5">{error}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sample Data Preview Section */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold">Xem dữ liệu mẫu</h3>
                <p className="text-sm text-emerald-100">Cấu trúc file {currentTypeInfo.label}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Current type indicator */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <TypeIcon className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-slate-700">{currentTypeInfo.label}</p>
                <p className="text-xs text-slate-500">{currentSample.headers.length} cột dữ liệu</p>
              </div>
            </div>

            {/* Column descriptions */}
            <div className="mb-4 p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Table className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">Mô tả các cột</span>
              </div>
              <div className="grid gap-1.5">
                {currentSample.headers.map((header) => (
                  <div key={header} className="flex items-start gap-2 text-xs">
                    <code className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono">
                      {header}
                    </code>
                    <span className="text-slate-600">
                      {currentSample.descriptions[header as keyof typeof currentSample.descriptions]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sample table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-100">
                    {currentSample.headers.map((header) => (
                      <th
                        key={header}
                        className="px-3 py-2 text-left text-xs font-semibold text-slate-600 whitespace-nowrap"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentSample.rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-slate-50">
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="px-3 py-2 text-slate-700 whitespace-nowrap"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Download button */}
            <button
              onClick={() => downloadTemplate(selectedType)}
              className="w-full mt-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-medium hover:from-emerald-700 hover:to-teal-700 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
            >
              <Download className="w-5 h-5" />
              Tải file mẫu {currentTypeInfo.label}
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3 bg-blue-100 border-b border-blue-200 flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600" />
          <h4 className="font-semibold text-blue-800">Hướng dẫn Import</h4>
        </div>
        <div className="p-5">
          <div className="grid gap-3 md:grid-cols-5">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-blue-700">1</span>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800">Chọn loại dữ liệu</p>
                <p className="text-xs text-blue-600">Tòa nhà, Căn hộ, Cư dân, hoặc Phương tiện</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-blue-700">2</span>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800">Tải file mẫu</p>
                <p className="text-xs text-blue-600">Xem cấu trúc dữ liệu chuẩn</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-blue-700">3</span>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800">Điền dữ liệu</p>
                <p className="text-xs text-blue-600">Theo đúng format CSV/JSON</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-blue-700">4</span>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800">Upload file</p>
                <p className="text-xs text-blue-600">Kéo thả hoặc chọn file</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-blue-700">5</span>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800">Kiểm tra kết quả</p>
                <p className="text-xs text-blue-600">Xem báo cáo import</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-blue-200">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">
                <span className="font-semibold">Lưu ý quan trọng:</span> Import theo thứ tự:
                <span className="inline-flex items-center gap-1 mx-1">
                  <Building2 className="w-3 h-3" /> Tòa nhà
                </span>
                <ArrowRight className="w-3 h-3 inline" />
                <span className="inline-flex items-center gap-1 mx-1">
                  <Home className="w-3 h-3" /> Căn hộ
                </span>
                <ArrowRight className="w-3 h-3 inline" />
                <span className="inline-flex items-center gap-1 mx-1">
                  <Users className="w-3 h-3" /> Cư dân
                </span>
                <ArrowRight className="w-3 h-3 inline" />
                <span className="inline-flex items-center gap-1 mx-1">
                  <Car className="w-3 h-3" /> Phương tiện
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

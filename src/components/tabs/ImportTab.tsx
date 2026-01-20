'use client';

import { useState, useRef } from 'react';
import { seedDatabase } from '@/lib/db/seed';
import { createBlock, getAllBlocks } from '@/lib/db/blocks';
import { createApartment, getAllApartments } from '@/lib/db/apartments';
import { createResident } from '@/lib/db/residents';
import { createVehicle } from '@/lib/db/vehicles';
import { Block, Apartment } from '@/lib/types';
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
  Database,
  FileJson,
  Info,
  ArrowRight,
  Sparkles,
  FolderOpen
} from 'lucide-react';

type ImportType = 'blocks' | 'apartments' | 'residents' | 'vehicles';

export default function ImportTab() {
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const [selectedType, setSelectedType] = useState<ImportType>('blocks');
  const [showSeedConfirm, setShowSeedConfirm] = useState(false);
  const [seedResult, setSeedResult] = useState<{ success: boolean; message: string } | null>(null);
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
    setShowSeedConfirm(false);
    setIsImporting(true);
    setSeedResult(null);
    try {
      const result = await seedDatabase();
      setSeedResult({ success: true, message: result.message });
    } catch (error) {
      setSeedResult({ success: false, message: 'Có lỗi xảy ra khi tạo dữ liệu mẫu' });
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

  const getSelectedTypeInfo = () => {
    return importTypes.find(t => t.id === selectedType)!;
  };

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

      {/* Seed Confirmation Modal */}
      {showSeedConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
                <Database className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Tạo dữ liệu mẫu?</h3>
              <p className="text-slate-500 mb-6">Thao tác này sẽ thêm dữ liệu mẫu vào database. Dữ liệu hiện có sẽ không bị ảnh hưởng.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSeedConfirm(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition font-medium"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSeedData}
                  className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-medium"
                >
                  Tạo dữ liệu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

        {/* Seed Data Section */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold">Tạo dữ liệu mẫu</h3>
                <p className="text-sm text-emerald-100">Dữ liệu test cho hệ thống</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <p className="text-slate-600 mb-4">
              Tạo nhanh bộ dữ liệu mẫu để test các tính năng của hệ thống:
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <div className="text-lg font-bold text-indigo-600">3</div>
                  <div className="text-xs text-slate-500">Tòa nhà</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Home className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <div className="text-lg font-bold text-emerald-600">60</div>
                  <div className="text-xs text-slate-500">Căn hộ</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-lg font-bold text-blue-600">10</div>
                  <div className="text-xs text-slate-500">Cư dân</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Car className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <div className="text-lg font-bold text-amber-600">10</div>
                  <div className="text-xs text-slate-500">Phương tiện</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowSeedConfirm(true)}
              disabled={isImporting}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-medium hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Database className="w-5 h-5" />
                  Tạo dữ liệu mẫu
                </>
              )}
            </button>

            {/* Seed Result */}
            {seedResult && (
              <div className={`mt-4 p-4 rounded-xl border ${
                seedResult.success
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-2">
                  {seedResult.success ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  )}
                  <span className={`font-medium text-sm ${
                    seedResult.success ? 'text-emerald-800' : 'text-red-800'
                  }`}>
                    {seedResult.message}
                  </span>
                </div>
              </div>
            )}
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

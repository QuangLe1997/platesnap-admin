'use client';

import { useState, useEffect } from 'react';
import { Vehicle, Resident, Block, Apartment } from '@/lib/types';
import { getAllVehicles } from '@/lib/db/vehicles';
import { getAllResidents } from '@/lib/db/residents';
import { getAllBlocks } from '@/lib/db/blocks';
import { getAllApartments } from '@/lib/db/apartments';
import {
  Search,
  Car,
  Bike,
  User,
  Building2,
  Phone,
  Mail,
  MapPin,
  X,
  AlertCircle,
  Loader2,
  Home,
  Users,
  ParkingCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface SearchResult {
  vehicle: Vehicle;
  resident?: Resident;
  apartment?: Apartment;
  block?: Block;
}

export default function MainSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);

  // All data for client-side search
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [v, r, b, a] = await Promise.all([
        getAllVehicles(),
        getAllResidents(),
        getAllBlocks(),
        getAllApartments(),
      ]);
      setVehicles(v);
      setResidents(r);
      setBlocks(b);
      setApartments(a);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setIsLoading(false);
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const term = searchTerm.toLowerCase().trim();

    // Search in vehicles, residents
    const matchedVehicles = vehicles.filter((v) => {
      const resident = residents.find((r) => r.id === v.residentId);
      return (
        v.plateNumber.toLowerCase().includes(term) ||
        v.residentName.toLowerCase().includes(term) ||
        (resident?.phone && resident.phone.includes(term))
      );
    });

    const searchResults: SearchResult[] = matchedVehicles.map((vehicle) => {
      const resident = residents.find((r) => r.id === vehicle.residentId);
      const apartment = apartments.find((a) => a.id === vehicle.apartmentId);
      const block = blocks.find((b) => b.id === vehicle.blockId);
      return { vehicle, resident, apartment, block };
    });

    setResults(searchResults);
    setIsSearching(false);
  };

  // Search on Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Search as user types (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        handleSearch();
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, vehicles, residents]);

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'car':
        return <Car className="w-6 h-6" />;
      case 'motorcycle':
        return <Bike className="w-6 h-6" />;
      default:
        return <Car className="w-6 h-6" />;
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-slate-500">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Box */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl mb-4 shadow-lg shadow-indigo-200">
              <Search className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Tra cứu phương tiện & cư dân
            </h2>
            <p className="text-slate-500">
              Tìm kiếm theo biển số xe, số điện thoại hoặc tên cư dân
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="VD: 51A-12345, 0901234567, Nguyễn Văn A..."
              className="w-full pl-14 pr-32 py-4 text-lg border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-slate-50 focus:bg-white"
              autoFocus
            />
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 font-medium flex items-center gap-2"
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Tìm kiếm
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <Car className="w-4 h-4 text-indigo-500" />
              Biển số xe
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-green-500" />
              Số điện thoại
            </span>
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-purple-500" />
              Tên cư dân
            </span>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {searchTerm && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-700">
                Kết quả tìm kiếm
              </h3>
              <span className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
                {results.length} phương tiện
              </span>
            </div>
          </div>

          {results.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                <AlertCircle className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium">Không tìm thấy kết quả</p>
              <p className="text-slate-400 text-sm mt-1">Thử tìm với từ khóa khác: "{searchTerm}"</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {results.map((result) => (
                <div
                  key={result.vehicle.id}
                  className="p-5 hover:bg-slate-50 cursor-pointer transition group"
                  onClick={() => setSelectedResult(result)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`
                        w-14 h-14 rounded-xl flex items-center justify-center
                        ${result.vehicle.vehicleType === 'car'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-emerald-100 text-emerald-600'}
                      `}>
                        {getVehicleIcon(result.vehicle.vehicleType)}
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-lg font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
                            {result.vehicle.plateNumber}
                          </span>
                          {result.vehicle.isActive ? (
                            <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                              <CheckCircle className="w-3 h-3" />
                              Hoạt động
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                              <XCircle className="w-3 h-3" />
                              Không hoạt động
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
                          {result.vehicle.brand && (
                            <span className="bg-slate-100 px-2 py-0.5 rounded">{result.vehicle.brand}</span>
                          )}
                          {result.vehicle.model && (
                            <span className="bg-slate-100 px-2 py-0.5 rounded">{result.vehicle.model}</span>
                          )}
                          {result.vehicle.color && (
                            <span className="bg-slate-100 px-2 py-0.5 rounded">{result.vehicle.color}</span>
                          )}
                          {!result.vehicle.brand && !result.vehicle.model && !result.vehicle.color && (
                            <span className="text-slate-400 italic">Chưa có thông tin chi tiết</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-slate-700">
                          {result.resident?.fullName || result.vehicle.residentName}
                        </span>
                      </div>
                      {result.resident?.phone && (
                        <div className="flex items-center gap-2 justify-end mt-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span className="text-sm text-slate-500">{result.resident.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 justify-end mt-1">
                        <Building2 className="w-3 h-3 text-indigo-400" />
                        <span className="text-sm font-medium text-indigo-600">{result.vehicle.apartmentCode}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-5 text-white">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                    {getVehicleIcon(selectedResult.vehicle.vehicleType)}
                  </div>
                  <div>
                    <div className="font-mono text-2xl font-bold">
                      {selectedResult.vehicle.plateNumber}
                    </div>
                    <div className="text-blue-100 text-sm mt-0.5">
                      {getVehicleLabel(selectedResult.vehicle.vehicleType)}
                      {selectedResult.vehicle.brand && ` • ${selectedResult.vehicle.brand}`}
                      {selectedResult.vehicle.model && ` ${selectedResult.vehicle.model}`}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedResult(null)}
                  className="p-2 hover:bg-white/20 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* Vehicle Info */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <Car className="w-4 h-4 text-indigo-600" />
                  Thông tin phương tiện
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-500">Loại xe</span>
                    <p className="font-medium text-slate-700">{getVehicleLabel(selectedResult.vehicle.vehicleType)}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Trạng thái</span>
                    <p className={`font-medium ${selectedResult.vehicle.isActive ? 'text-emerald-600' : 'text-red-600'}`}>
                      {selectedResult.vehicle.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                    </p>
                  </div>
                  {selectedResult.vehicle.brand && (
                    <div>
                      <span className="text-slate-500">Hãng xe</span>
                      <p className="font-medium text-slate-700">{selectedResult.vehicle.brand}</p>
                    </div>
                  )}
                  {selectedResult.vehicle.model && (
                    <div>
                      <span className="text-slate-500">Model</span>
                      <p className="font-medium text-slate-700">{selectedResult.vehicle.model}</p>
                    </div>
                  )}
                  {selectedResult.vehicle.color && (
                    <div>
                      <span className="text-slate-500">Màu sắc</span>
                      <p className="font-medium text-slate-700">{selectedResult.vehicle.color}</p>
                    </div>
                  )}
                  {selectedResult.vehicle.parkingSlot && (
                    <div>
                      <span className="text-slate-500">Vị trí đỗ</span>
                      <p className="font-medium text-slate-700 flex items-center gap-1">
                        <ParkingCircle className="w-4 h-4 text-amber-500" />
                        {selectedResult.vehicle.parkingSlot}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Owner Info */}
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                <h4 className="font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  Thông tin chủ xe
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-700">Họ tên</span>
                    <span className="font-medium text-slate-700">
                      {selectedResult.resident?.fullName || selectedResult.vehicle.residentName}
                    </span>
                  </div>
                  {selectedResult.resident?.phone && (
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-700 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> SĐT
                      </span>
                      <a href={`tel:${selectedResult.resident.phone}`} className="font-medium text-indigo-600 hover:underline">
                        {selectedResult.resident.phone}
                      </a>
                    </div>
                  )}
                  {selectedResult.resident?.email && (
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-700 flex items-center gap-1">
                        <Mail className="w-3 h-3" /> Email
                      </span>
                      <span className="font-medium text-slate-700">{selectedResult.resident.email}</span>
                    </div>
                  )}
                  {selectedResult.resident?.isOwner !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-700">Vai trò</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        selectedResult.resident.isOwner
                          ? 'bg-emerald-200 text-emerald-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {selectedResult.resident.isOwner ? 'Chủ hộ' : 'Thành viên'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Location Info */}
              <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                <h4 className="font-semibold text-indigo-800 mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  Thông tin căn hộ
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-indigo-700 flex items-center gap-1">
                      <Home className="w-3 h-3" /> Căn hộ
                    </span>
                    <span className="font-mono font-bold text-indigo-600 bg-white px-2 py-0.5 rounded">
                      {selectedResult.vehicle.apartmentCode}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-indigo-700 flex items-center gap-1">
                      <Building2 className="w-3 h-3" /> Tòa nhà
                    </span>
                    <span className="font-medium text-slate-700">
                      {selectedResult.block?.name || selectedResult.vehicle.blockCode}
                    </span>
                  </div>
                  {selectedResult.apartment?.floor && (
                    <div className="flex items-center justify-between">
                      <span className="text-indigo-700 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> Tầng
                      </span>
                      <span className="font-medium text-slate-700">{selectedResult.apartment.floor}</span>
                    </div>
                  )}
                  {selectedResult.apartment?.type && (
                    <div className="flex items-center justify-between">
                      <span className="text-indigo-700">Loại căn hộ</span>
                      <span className="font-medium text-slate-700">{selectedResult.apartment.type}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
              <button
                onClick={() => setSelectedResult(null)}
                className="w-full px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats when no search */}
      {!searchTerm && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Car className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">
                  {vehicles.filter((v) => v.vehicleType === 'car').length}
                </div>
                <div className="text-sm text-slate-500">Ô tô</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Bike className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">
                  {vehicles.filter((v) => v.vehicleType === 'motorcycle').length}
                </div>
                <div className="text-sm text-slate-500">Xe máy</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{residents.length}</div>
                <div className="text-sm text-slate-500">Cư dân</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Home className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{apartments.length}</div>
                <div className="text-sm text-slate-500">Căn hộ</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

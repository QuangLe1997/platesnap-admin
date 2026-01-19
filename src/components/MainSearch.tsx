'use client';

import { useState, useEffect } from 'react';
import { Vehicle, Resident, Block, Apartment } from '@/lib/types';
import { getAllVehicles, searchVehicleByPlate } from '@/lib/db/vehicles';
import { getAllResidents } from '@/lib/db/residents';
import { getAllBlocks } from '@/lib/db/blocks';
import { getAllApartments } from '@/lib/db/apartments';

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

  const vehicleTypeLabels = {
    car: '🚗 Ô tô',
    motorcycle: '🏍️ Xe máy',
    bicycle: '🚲 Xe đạp',
    other: '🚙 Khác',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Search Box */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-lg font-semibold text-center mb-4">
            Tìm kiếm phương tiện & cư dân
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập biển số xe, số điện thoại hoặc tên cư dân..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              autoFocus
            />
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isSearching ? '...' : '🔍 Tìm'}
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2 text-center">
            Tìm theo: biển số (51A-12345), SĐT (0901234567), hoặc tên (Nguyễn Văn A)
          </p>
        </div>
      </div>

      {/* Search Results */}
      {searchTerm && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="font-semibold">
              Kết quả tìm kiếm: {results.length} phương tiện
            </h3>
          </div>

          {results.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-4xl mb-2">🔍</p>
              <p>Không tìm thấy kết quả cho "{searchTerm}"</p>
            </div>
          ) : (
            <div className="divide-y">
              {results.map((result) => (
                <div
                  key={result.vehicle.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedResult(result)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">
                        {result.vehicle.vehicleType === 'car' ? '🚗' :
                         result.vehicle.vehicleType === 'motorcycle' ? '🏍️' : '🚙'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-lg font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded">
                            {result.vehicle.plateNumber}
                          </span>
                          {!result.vehicle.isActive && (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                              Không hoạt động
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {[result.vehicle.brand, result.vehicle.model, result.vehicle.color]
                            .filter(Boolean)
                            .join(' • ') || 'Chưa có thông tin xe'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{result.resident?.fullName || result.vehicle.residentName}</div>
                      <div className="text-sm text-gray-500">{result.resident?.phone}</div>
                      <div className="text-sm text-purple-600">{result.vehicle.apartmentCode}</div>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">Chi tiết phương tiện</h3>
                <button
                  onClick={() => setSelectedResult(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Vehicle Info */}
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="text-4xl">
                    {selectedResult.vehicle.vehicleType === 'car' ? '🚗' :
                     selectedResult.vehicle.vehicleType === 'motorcycle' ? '🏍️' : '🚙'}
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-2xl font-bold text-blue-600">
                      {selectedResult.vehicle.plateNumber}
                    </div>
                    <div className="text-sm text-gray-600">
                      {vehicleTypeLabels[selectedResult.vehicle.vehicleType]}
                    </div>
                  </div>
                </div>
                {(selectedResult.vehicle.brand || selectedResult.vehicle.model || selectedResult.vehicle.color) && (
                  <div className="mt-2 text-sm text-gray-600">
                    {[selectedResult.vehicle.brand, selectedResult.vehicle.model, selectedResult.vehicle.color]
                      .filter(Boolean)
                      .join(' • ')}
                  </div>
                )}
                {selectedResult.vehicle.parkingSlot && (
                  <div className="mt-1 text-sm text-gray-600">
                    Vị trí đỗ: {selectedResult.vehicle.parkingSlot}
                  </div>
                )}
              </div>

              {/* Owner Info */}
              <div className="bg-green-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-green-800 mb-2">👤 Thông tin chủ xe</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Họ tên:</span>
                    <span className="font-medium">{selectedResult.resident?.fullName || selectedResult.vehicle.residentName}</span>
                  </div>
                  {selectedResult.resident?.phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">SĐT:</span>
                      <a href={`tel:${selectedResult.resident.phone}`} className="font-medium text-blue-600">
                        {selectedResult.resident.phone}
                      </a>
                    </div>
                  )}
                  {selectedResult.resident?.email && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{selectedResult.resident.email}</span>
                    </div>
                  )}
                  {selectedResult.resident?.isOwner !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vai trò:</span>
                      <span className={`font-medium ${selectedResult.resident.isOwner ? 'text-green-600' : 'text-gray-600'}`}>
                        {selectedResult.resident.isOwner ? 'Chủ hộ' : 'Thành viên'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Location Info */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-semibold text-purple-800 mb-2">🏢 Thông tin căn hộ</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Căn hộ:</span>
                    <span className="font-mono font-bold text-purple-600">
                      {selectedResult.vehicle.apartmentCode}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tòa nhà:</span>
                    <span className="font-medium">
                      {selectedResult.block?.name || selectedResult.vehicle.blockCode}
                    </span>
                  </div>
                  {selectedResult.apartment?.floor && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tầng:</span>
                      <span className="font-medium">{selectedResult.apartment.floor}</span>
                    </div>
                  )}
                  {selectedResult.apartment?.type && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Loại căn hộ:</span>
                      <span className="font-medium">{selectedResult.apartment.type}</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => setSelectedResult(null)}
                className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
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
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl mb-1">🚗</div>
            <div className="text-2xl font-bold text-blue-600">
              {vehicles.filter((v) => v.vehicleType === 'car').length}
            </div>
            <div className="text-sm text-gray-500">Ô tô</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl mb-1">🏍️</div>
            <div className="text-2xl font-bold text-green-600">
              {vehicles.filter((v) => v.vehicleType === 'motorcycle').length}
            </div>
            <div className="text-sm text-gray-500">Xe máy</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl mb-1">👥</div>
            <div className="text-2xl font-bold text-purple-600">{residents.length}</div>
            <div className="text-sm text-gray-500">Cư dân</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl mb-1">🏠</div>
            <div className="text-2xl font-bold text-orange-600">{apartments.length}</div>
            <div className="text-sm text-gray-500">Căn hộ</div>
          </div>
        </div>
      )}
    </div>
  );
}

import { Timestamp } from 'firebase/firestore';
import { createBlock, getAllBlocks } from './blocks';
import { createApartment, getAllApartments } from './apartments';
import { createResident, getAllResidents } from './residents';
import { createVehicle, getAllVehicles } from './vehicles';
import { createAdmin, hasAnyAdmin } from './admins';

export async function seedDatabase(): Promise<{ success: boolean; message: string }> {
  try {
    // Check if data already exists
    const existingBlocks = await getAllBlocks();
    if (existingBlocks.length > 0) {
      return { success: false, message: 'Dữ liệu đã tồn tại. Không cần seed.' };
    }

    console.log('Seeding database...');

    // 1. Create Admin accounts
    const adminExists = await hasAnyAdmin();
    if (!adminExists) {
      await createAdmin(
        {
          username: 'admin',
          email: 'admin@platesnap.com',
          displayName: 'Administrator',
          role: 'superadmin',
        },
        'admin123'
      );

      await createAdmin(
        {
          username: 'manager',
          email: 'manager@platesnap.com',
          displayName: 'Manager',
          role: 'admin',
        },
        'manager123'
      );
      console.log('Created admin accounts');
    }

    // 2. Create Blocks
    const blocks = [
      { code: 'A', name: 'Block A - Orchid Tower', totalFloors: 30, description: 'Tòa nhà phía Đông' },
      { code: 'B', name: 'Block B - Lotus Tower', totalFloors: 25, description: 'Tòa nhà phía Tây' },
      { code: 'C', name: 'Block C - Jasmine Tower', totalFloors: 20, description: 'Tòa nhà phía Nam' },
    ];

    const blockIds: Record<string, string> = {};
    for (const block of blocks) {
      const id = await createBlock(block);
      blockIds[block.code] = id;
    }
    console.log('Created blocks:', Object.keys(blockIds));

    // 3. Create Apartments for each block
    const apartmentIds: Record<string, string> = {};
    for (const block of blocks) {
      const blockId = blockIds[block.code];
      // Create apartments on floors 1-5 for demo
      for (let floor = 1; floor <= 5; floor++) {
        for (let room = 1; room <= 4; room++) {
          const roomNumber = `${floor}0${room}`;
          const code = `${block.code}-${roomNumber}`;
          const types = ['Studio', '1BR', '2BR', '3BR'];
          const areas = [45, 65, 85, 120];

          const id = await createApartment({
            blockId,
            blockCode: block.code,
            floor,
            roomNumber,
            type: types[room - 1],
            area: areas[room - 1],
          });
          apartmentIds[code] = id;
        }
      }
    }
    console.log('Created apartments');

    // 4. Create Residents
    const residentData = [
      { name: 'Nguyễn Văn An', phone: '0901234567', apartment: 'A-101', isOwner: true },
      { name: 'Trần Thị Bích', phone: '0912345678', apartment: 'A-101', isOwner: false },
      { name: 'Lê Minh Cường', phone: '0923456789', apartment: 'A-102', isOwner: true },
      { name: 'Phạm Thị Dung', phone: '0934567890', apartment: 'B-101', isOwner: true },
      { name: 'Hoàng Văn Em', phone: '0945678901', apartment: 'B-102', isOwner: true },
      { name: 'Võ Thị Phương', phone: '0956789012', apartment: 'B-103', isOwner: true },
      { name: 'Đặng Quốc Gia', phone: '0967890123', apartment: 'C-101', isOwner: true },
      { name: 'Bùi Thị Hoa', phone: '0978901234', apartment: 'C-102', isOwner: true },
      { name: 'Đỗ Văn Inh', phone: '0989012345', apartment: 'C-103', isOwner: true },
      { name: 'Ngô Thị Kim', phone: '0990123456', apartment: 'A-201', isOwner: true },
    ];

    const residentIds: Record<string, string> = {};
    for (const r of residentData) {
      const apartmentId = apartmentIds[r.apartment];
      const blockCode = r.apartment.split('-')[0];
      const blockId = blockIds[blockCode];

      const id = await createResident({
        fullName: r.name,
        phone: r.phone,
        apartmentId,
        apartmentCode: r.apartment,
        blockId,
        blockCode,
        isOwner: r.isOwner,
      });
      residentIds[r.name] = id;
    }
    console.log('Created residents');

    // 5. Create Vehicles
    const vehicleData = [
      { plate: '51A-12345', resident: 'Nguyễn Văn An', type: 'car' as const, brand: 'Toyota', model: 'Camry', color: 'Trắng' },
      { plate: '51A-67890', resident: 'Nguyễn Văn An', type: 'motorcycle' as const, brand: 'Honda', model: 'SH', color: 'Đen' },
      { plate: '51B-11111', resident: 'Lê Minh Cường', type: 'car' as const, brand: 'Honda', model: 'CRV', color: 'Đen' },
      { plate: '51C-22222', resident: 'Phạm Thị Dung', type: 'car' as const, brand: 'Mazda', model: 'CX5', color: 'Đỏ' },
      { plate: '51D-33333', resident: 'Hoàng Văn Em', type: 'motorcycle' as const, brand: 'Yamaha', model: 'Exciter', color: 'Xanh' },
      { plate: '51E-44444', resident: 'Võ Thị Phương', type: 'car' as const, brand: 'VinFast', model: 'VF8', color: 'Xám' },
      { plate: '51F-55555', resident: 'Đặng Quốc Gia', type: 'car' as const, brand: 'Mercedes', model: 'C200', color: 'Bạc' },
      { plate: '51G-66666', resident: 'Bùi Thị Hoa', type: 'motorcycle' as const, brand: 'Honda', model: 'Vision', color: 'Trắng' },
      { plate: '51H-77777', resident: 'Đỗ Văn Inh', type: 'car' as const, brand: 'Hyundai', model: 'Tucson', color: 'Xanh' },
      { plate: '51K-88888', resident: 'Ngô Thị Kim', type: 'car' as const, brand: 'Kia', model: 'Seltos', color: 'Vàng' },
    ];

    for (const v of vehicleData) {
      const residentId = residentIds[v.resident];
      const resident = residentData.find((r) => r.name === v.resident)!;
      const apartmentId = apartmentIds[resident.apartment];
      const blockCode = resident.apartment.split('-')[0];
      const blockId = blockIds[blockCode];

      await createVehicle({
        plateNumber: v.plate,
        residentId,
        residentName: v.resident,
        apartmentId,
        apartmentCode: resident.apartment,
        blockId,
        blockCode,
        vehicleType: v.type,
        brand: v.brand,
        model: v.model,
        color: v.color,
        isActive: true,
      });
    }
    console.log('Created vehicles');

    return { success: true, message: 'Đã tạo dữ liệu mẫu thành công!' };
  } catch (error) {
    console.error('Seed error:', error);
    return { success: false, message: `Lỗi: ${error}` };
  }
}

// Get statistics
export async function getStats(): Promise<{
  blocks: number;
  apartments: number;
  residents: number;
  vehicles: number;
}> {
  const [blocks, apartments, residents, vehicles] = await Promise.all([
    getAllBlocks(),
    getAllApartments(),
    getAllResidents(),
    getAllVehicles(),
  ]);

  return {
    blocks: blocks.length,
    apartments: apartments.length,
    residents: residents.length,
    vehicles: vehicles.length,
  };
}

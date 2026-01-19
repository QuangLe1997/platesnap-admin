import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// Initialize Firebase Admin with project ID (uses default credentials)
initializeApp({
  projectId: 'plate-8f4d6',
});

const db = getFirestore();

// Simple hash function for password
function simpleHash(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

async function seedDatabase() {
  console.log('🌱 Starting database seed...\n');

  try {
    // Check if data already exists
    const blocksSnapshot = await db.collection('blocks').limit(1).get();
    if (!blocksSnapshot.empty) {
      console.log('⚠️  Database already has data. Skipping seed.');
      console.log('   To re-seed, delete all collections first.');
      process.exit(0);
    }

    // 1. Create Admin accounts
    console.log('👤 Creating admin accounts...');
    const adminsRef = db.collection('admins');

    await adminsRef.add({
      username: 'admin',
      email: 'admin@platesnap.com',
      displayName: 'Administrator',
      role: 'superadmin',
      passwordHash: simpleHash('admin123'),
      createdAt: Timestamp.now(),
    });

    await adminsRef.add({
      username: 'manager',
      email: 'manager@platesnap.com',
      displayName: 'Manager',
      role: 'admin',
      passwordHash: simpleHash('manager123'),
      createdAt: Timestamp.now(),
    });
    console.log('   ✅ Created 2 admin accounts');

    // 2. Create Blocks
    console.log('🏢 Creating blocks...');
    const blocks = [
      { code: 'A', name: 'Block A - Orchid Tower', totalFloors: 30, description: 'Tòa nhà phía Đông' },
      { code: 'B', name: 'Block B - Lotus Tower', totalFloors: 25, description: 'Tòa nhà phía Tây' },
      { code: 'C', name: 'Block C - Jasmine Tower', totalFloors: 20, description: 'Tòa nhà phía Nam' },
    ];

    const blockIds: Record<string, string> = {};
    for (const block of blocks) {
      const docRef = await db.collection('blocks').add({
        ...block,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      blockIds[block.code] = docRef.id;
    }
    console.log('   ✅ Created 3 blocks (A, B, C)');

    // 3. Create Apartments
    console.log('🏠 Creating apartments...');
    const apartmentIds: Record<string, string> = {};
    let apartmentCount = 0;

    for (const block of blocks) {
      const blockId = blockIds[block.code];
      for (let floor = 1; floor <= 5; floor++) {
        for (let room = 1; room <= 4; room++) {
          const roomNumber = `${floor}0${room}`;
          const code = `${block.code}-${roomNumber}`;
          const types = ['Studio', '1BR', '2BR', '3BR'];
          const areas = [45, 65, 85, 120];

          const docRef = await db.collection('apartments').add({
            code,
            blockId,
            blockCode: block.code,
            floor,
            roomNumber,
            type: types[room - 1],
            area: areas[room - 1],
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });
          apartmentIds[code] = docRef.id;
          apartmentCount++;
        }
      }
    }
    console.log(`   ✅ Created ${apartmentCount} apartments`);

    // 4. Create Residents
    console.log('👥 Creating residents...');
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

      const docRef = await db.collection('residents').add({
        fullName: r.name,
        phone: r.phone,
        apartmentId,
        apartmentCode: r.apartment,
        blockId,
        blockCode,
        isOwner: r.isOwner,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      residentIds[r.name] = docRef.id;
    }
    console.log(`   ✅ Created ${residentData.length} residents`);

    // 5. Create Vehicles
    console.log('🚗 Creating vehicles...');
    const vehicleData = [
      { plate: '51A12345', resident: 'Nguyễn Văn An', type: 'car', brand: 'Toyota', model: 'Camry', color: 'Trắng' },
      { plate: '51A67890', resident: 'Nguyễn Văn An', type: 'motorcycle', brand: 'Honda', model: 'SH', color: 'Đen' },
      { plate: '51B11111', resident: 'Lê Minh Cường', type: 'car', brand: 'Honda', model: 'CRV', color: 'Đen' },
      { plate: '51C22222', resident: 'Phạm Thị Dung', type: 'car', brand: 'Mazda', model: 'CX5', color: 'Đỏ' },
      { plate: '51D33333', resident: 'Hoàng Văn Em', type: 'motorcycle', brand: 'Yamaha', model: 'Exciter', color: 'Xanh' },
      { plate: '51E44444', resident: 'Võ Thị Phương', type: 'car', brand: 'VinFast', model: 'VF8', color: 'Xám' },
      { plate: '51F55555', resident: 'Đặng Quốc Gia', type: 'car', brand: 'Mercedes', model: 'C200', color: 'Bạc' },
      { plate: '51G66666', resident: 'Bùi Thị Hoa', type: 'motorcycle', brand: 'Honda', model: 'Vision', color: 'Trắng' },
      { plate: '51H77777', resident: 'Đỗ Văn Inh', type: 'car', brand: 'Hyundai', model: 'Tucson', color: 'Xanh' },
      { plate: '51K88888', resident: 'Ngô Thị Kim', type: 'car', brand: 'Kia', model: 'Seltos', color: 'Vàng' },
    ];

    for (const v of vehicleData) {
      const residentId = residentIds[v.resident];
      const resident = residentData.find((r) => r.name === v.resident)!;
      const apartmentId = apartmentIds[resident.apartment];
      const blockCode = resident.apartment.split('-')[0];
      const blockId = blockIds[blockCode];

      await db.collection('vehicles').add({
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
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }
    console.log(`   ✅ Created ${vehicleData.length} vehicles`);

    console.log('\n🎉 Database seeded successfully!\n');
    console.log('📋 Summary:');
    console.log('   • 2 Admin accounts (admin/admin123, manager/manager123)');
    console.log('   • 3 Blocks (A, B, C)');
    console.log(`   • ${apartmentCount} Apartments`);
    console.log(`   • ${residentData.length} Residents`);
    console.log(`   • ${vehicleData.length} Vehicles`);
    console.log('\n🔑 Login: https://webadmin-psi.vercel.app');
    console.log('   Username: admin');
    console.log('   Password: admin123');

  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seedDatabase().then(() => process.exit(0));

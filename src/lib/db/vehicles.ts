import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Vehicle, VehicleSearchResult, Resident, Apartment, Block } from '../types';

const COLLECTION_NAME = 'vehicles';

function normalizePlate(plate: string): string {
  return plate.toUpperCase().replace(/[\s-]/g, '');
}

export async function createVehicle(vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...vehicle,
    plateNumber: normalizePlate(vehicle.plateNumber),
    isActive: vehicle.isActive ?? true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function getAllVehicles(): Promise<Vehicle[]> {
  const q = query(collection(db, COLLECTION_NAME), orderBy('plateNumber', 'asc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Vehicle[];
}

export async function getVehiclesByResident(residentId: string): Promise<Vehicle[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('residentId', '==', residentId)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Vehicle[];
}

export async function getVehiclesByApartment(apartmentId: string): Promise<Vehicle[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('apartmentId', '==', apartmentId)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Vehicle[];
}

export async function getVehicleById(id: string): Promise<Vehicle | null> {
  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Vehicle;
  }
  return null;
}

export async function getVehicleByPlate(plateNumber: string): Promise<Vehicle | null> {
  const normalized = normalizePlate(plateNumber);
  const q = query(
    collection(db, COLLECTION_NAME),
    where('plateNumber', '==', normalized),
    where('isActive', '==', true)
  );
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return null;
  const docSnap = querySnapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() } as Vehicle;
}

// Search vehicle with full info - for mobile app
export async function searchVehicleByPlate(plateNumber: string): Promise<VehicleSearchResult> {
  const vehicle = await getVehicleByPlate(plateNumber);

  if (!vehicle) {
    return { found: false };
  }

  // Get related data
  let resident: Resident | undefined;
  let apartment: Apartment | undefined;
  let block: Block | undefined;

  if (vehicle.residentId) {
    const residentDoc = await getDoc(doc(db, 'residents', vehicle.residentId));
    if (residentDoc.exists()) {
      resident = { id: residentDoc.id, ...residentDoc.data() } as Resident;
    }
  }

  if (vehicle.apartmentId) {
    const apartmentDoc = await getDoc(doc(db, 'apartments', vehicle.apartmentId));
    if (apartmentDoc.exists()) {
      apartment = { id: apartmentDoc.id, ...apartmentDoc.data() } as Apartment;
    }
  }

  if (vehicle.blockId) {
    const blockDoc = await getDoc(doc(db, 'blocks', vehicle.blockId));
    if (blockDoc.exists()) {
      block = { id: blockDoc.id, ...blockDoc.data() } as Block;
    }
  }

  return {
    found: true,
    vehicle,
    resident,
    apartment,
    block,
  };
}

export async function updateVehicle(id: string, vehicle: Partial<Vehicle>): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    ...vehicle,
    ...(vehicle.plateNumber && { plateNumber: normalizePlate(vehicle.plateNumber) }),
    updatedAt: Timestamp.now(),
  });
}

export async function deleteVehicle(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}

// Deactivate vehicle instead of deleting
export async function deactivateVehicle(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    isActive: false,
    updatedAt: Timestamp.now(),
  });
}

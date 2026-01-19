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
  DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';

export interface Plate {
  id?: string;
  plateNumber: string;
  ownerName: string;
  ownerPhone?: string;
  ownerEmail?: string;
  vehicleType?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleColor?: string;
  notes?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

const COLLECTION_NAME = 'plates';

// Create a new plate
export async function createPlate(plate: Omit<Plate, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...plate,
    plateNumber: plate.plateNumber.toUpperCase().replace(/\s/g, ''),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
}

// Get all plates
export async function getAllPlates(): Promise<Plate[]> {
  const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Plate[];
}

// Get plate by ID
export async function getPlateById(id: string): Promise<Plate | null> {
  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Plate;
  }
  return null;
}

// Search plate by plate number
export async function searchPlateByNumber(plateNumber: string): Promise<Plate[]> {
  const normalizedPlate = plateNumber.toUpperCase().replace(/\s/g, '');
  const q = query(
    collection(db, COLLECTION_NAME),
    where('plateNumber', '==', normalizedPlate)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Plate[];
}

// Update plate
export async function updatePlate(id: string, plate: Partial<Plate>): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    ...plate,
    ...(plate.plateNumber && { plateNumber: plate.plateNumber.toUpperCase().replace(/\s/g, '') }),
    updatedAt: Timestamp.now(),
  });
}

// Delete plate
export async function deletePlate(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}

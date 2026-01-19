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
import { Apartment } from '../types';

const COLLECTION_NAME = 'apartments';

export async function createApartment(apartment: Omit<Apartment, 'id' | 'code' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const code = `${apartment.blockCode.toUpperCase()}-${apartment.roomNumber}`;
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...apartment,
    code,
    blockCode: apartment.blockCode.toUpperCase(),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function getAllApartments(): Promise<Apartment[]> {
  const q = query(collection(db, COLLECTION_NAME), orderBy('code', 'asc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Apartment[];
}

export async function getApartmentsByBlock(blockId: string): Promise<Apartment[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('blockId', '==', blockId),
    orderBy('floor', 'asc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Apartment[];
}

export async function getApartmentById(id: string): Promise<Apartment | null> {
  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Apartment;
  }
  return null;
}

export async function getApartmentByCode(code: string): Promise<Apartment | null> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('code', '==', code.toUpperCase())
  );
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return null;
  const doc = querySnapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Apartment;
}

export async function updateApartment(id: string, apartment: Partial<Apartment>): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  const updateData: Record<string, unknown> = { ...apartment, updatedAt: Timestamp.now() };

  if (apartment.blockCode && apartment.roomNumber) {
    updateData.code = `${apartment.blockCode.toUpperCase()}-${apartment.roomNumber}`;
  }

  await updateDoc(docRef, updateData);
}

export async function deleteApartment(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}

export async function bulkCreateApartments(apartments: Omit<Apartment, 'id' | 'code' | 'createdAt' | 'updatedAt'>[]): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const apartment of apartments) {
    try {
      await createApartment(apartment);
      success++;
    } catch {
      failed++;
    }
  }

  return { success, failed };
}

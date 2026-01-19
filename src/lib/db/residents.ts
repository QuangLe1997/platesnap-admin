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
import { Resident } from '../types';

const COLLECTION_NAME = 'residents';

export async function createResident(resident: Omit<Resident, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...resident,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function getAllResidents(): Promise<Resident[]> {
  const q = query(collection(db, COLLECTION_NAME), orderBy('fullName', 'asc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Resident[];
}

export async function getResidentsByApartment(apartmentId: string): Promise<Resident[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('apartmentId', '==', apartmentId)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Resident[];
}

export async function getResidentsByBlock(blockId: string): Promise<Resident[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('blockId', '==', blockId)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Resident[];
}

export async function getResidentById(id: string): Promise<Resident | null> {
  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Resident;
  }
  return null;
}

export async function searchResidents(searchTerm: string): Promise<Resident[]> {
  // Get all residents and filter client-side (Firestore doesn't support full-text search)
  const all = await getAllResidents();
  const term = searchTerm.toLowerCase();
  return all.filter(
    (r) =>
      r.fullName.toLowerCase().includes(term) ||
      r.phone.includes(term) ||
      r.apartmentCode.toLowerCase().includes(term)
  );
}

export async function updateResident(id: string, resident: Partial<Resident>): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    ...resident,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteResident(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}

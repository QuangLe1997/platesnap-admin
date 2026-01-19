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
import { Block } from '../types';

const COLLECTION_NAME = 'blocks';

export async function createBlock(block: Omit<Block, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...block,
    code: block.code.toUpperCase(),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function getAllBlocks(): Promise<Block[]> {
  const q = query(collection(db, COLLECTION_NAME), orderBy('code', 'asc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Block[];
}

export async function getBlockById(id: string): Promise<Block | null> {
  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Block;
  }
  return null;
}

export async function getBlockByCode(code: string): Promise<Block | null> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('code', '==', code.toUpperCase())
  );
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return null;
  const doc = querySnapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Block;
}

export async function updateBlock(id: string, block: Partial<Block>): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    ...block,
    ...(block.code && { code: block.code.toUpperCase() }),
    updatedAt: Timestamp.now(),
  });
}

export async function deleteBlock(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}

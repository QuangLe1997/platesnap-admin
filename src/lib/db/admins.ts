import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { AdminUser } from '../types';

const COLLECTION_NAME = 'admins';

// Simple hash function for password (in production, use bcrypt or similar)
function simpleHash(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

export async function createAdmin(
  admin: Omit<AdminUser, 'id' | 'createdAt'>,
  password: string
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...admin,
    passwordHash: simpleHash(password),
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function getAllAdmins(): Promise<AdminUser[]> {
  const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...rest } = data;
    return { id: doc.id, ...rest } as AdminUser;
  });
}

export async function getAdminById(id: string): Promise<AdminUser | null> {
  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...rest } = data;
    return { id: docSnap.id, ...rest } as AdminUser;
  }
  return null;
}

export async function authenticateAdmin(
  username: string,
  password: string
): Promise<AdminUser | null> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('username', '==', username)
  );
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const docSnap = querySnapshot.docs[0];
  const data = docSnap.data();

  if (data.passwordHash === simpleHash(password)) {
    // Update last login
    await updateDoc(doc(db, COLLECTION_NAME, docSnap.id), {
      lastLoginAt: Timestamp.now(),
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...rest } = data;
    return { id: docSnap.id, ...rest } as AdminUser;
  }

  return null;
}

export async function updateAdminPassword(id: string, newPassword: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    passwordHash: simpleHash(newPassword),
  });
}

// Check if any admin exists (for initial setup)
export async function hasAnyAdmin(): Promise<boolean> {
  const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
  return !querySnapshot.empty;
}

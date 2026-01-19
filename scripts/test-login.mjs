import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { config } from 'dotenv';

config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function simpleHash(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

async function testLogin() {
  console.log('🔍 Testing login...\n');

  // 1. Check if admins collection exists
  const adminsSnapshot = await getDocs(collection(db, 'admins'));
  console.log(`📊 Total admins in DB: ${adminsSnapshot.size}`);

  adminsSnapshot.docs.forEach((doc, i) => {
    const data = doc.data();
    console.log(`\nAdmin ${i + 1}:`);
    console.log(`  - ID: ${doc.id}`);
    console.log(`  - Username: ${data.username}`);
    console.log(`  - Email: ${data.email}`);
    console.log(`  - Password Hash in DB: ${data.passwordHash}`);
  });

  // 2. Test password hash
  const testPassword = 'admin123';
  const computedHash = simpleHash(testPassword);
  console.log(`\n🔐 Testing password "admin123":`);
  console.log(`  - Computed hash: ${computedHash}`);

  // 3. Query for admin user
  const q = query(collection(db, 'admins'), where('username', '==', 'admin'));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    console.log('\n❌ No admin user found with username "admin"');
  } else {
    const adminDoc = querySnapshot.docs[0];
    const adminData = adminDoc.data();
    console.log(`\n✅ Found admin user:`);
    console.log(`  - Username: ${adminData.username}`);
    console.log(`  - DB Hash: ${adminData.passwordHash}`);
    console.log(`  - Computed Hash: ${computedHash}`);
    console.log(`  - Match: ${adminData.passwordHash === computedHash ? '✅ YES' : '❌ NO'}`);
  }
}

testLogin().then(() => process.exit(0)).catch(e => {
  console.error('Error:', e);
  process.exit(1);
});


'use server';

import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc 
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { Shop } from '@/app/lib/types';
import { revalidatePath } from 'next/cache';

/**
 * @fileOverview Server Actions for Shop management using Firestore.
 */

const { firestore } = initializeFirebase();

export async function getShops() {
  const shopsRef = collection(firestore, 'vendorProfiles');
  const snapshot = await getDocs(shopsRef);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Shop));
}

export async function getShopById(id: string) {
  const shopRef = doc(firestore, 'vendorProfiles', id);
  const snapshot = await getDoc(shopRef);
  if (!snapshot.exists()) return null;
  return { ...snapshot.data(), id: snapshot.id } as Shop;
}

export async function updateShopProfile(id: string, data: Partial<Shop>) {
  const shopRef = doc(firestore, 'vendorProfiles', id);
  await updateDoc(shopRef, data);
  
  revalidatePath('/shops');
  revalidatePath('/vendor/dashboard');
  
  const updated = await getDoc(shopRef);
  return updated.exists() ? { ...updated.data(), id: updated.id } as Shop : null;
}

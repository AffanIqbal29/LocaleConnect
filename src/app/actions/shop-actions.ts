
'use client';

import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc,
  Firestore 
} from 'firebase/firestore';
import { Shop } from '@/app/lib/types';

/**
 * @fileOverview Client-side utilities for Shop management using Firestore.
 */

export async function getShops(db: Firestore) {
  const shopsRef = collection(db, 'vendorProfiles');
  const snapshot = await getDocs(shopsRef);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Shop));
}

export async function getShopById(db: Firestore, id: string) {
  const shopRef = doc(db, 'vendorProfiles', id);
  const snapshot = await getDoc(shopRef);
  if (!snapshot.exists()) return null;
  return { ...snapshot.data(), id: snapshot.id } as Shop;
}

export async function updateShopProfile(db: Firestore, id: string, data: Partial<Shop>) {
  const shopRef = doc(db, 'vendorProfiles', id);
  await updateDoc(shopRef, data);
  
  const updated = await getDoc(shopRef);
  return updated.exists() ? { ...updated.data(), id: updated.id } as Shop : null;
}

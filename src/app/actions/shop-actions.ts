
'use client';

import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc,
  query,
  where,
  setDoc,
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

export async function getShopByOwnerId(db: Firestore, ownerUserId: string) {
  const shopsRef = collection(db, 'vendorProfiles');
  const q = query(shopsRef, where('ownerUserId', '==', ownerUserId));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) return null;
  return { ...snapshot.docs[0].data(), id: snapshot.docs[0].id } as Shop;
}

export async function createInitialShop(db: Firestore, ownerUserId: string, name: string) {
  const shopId = `shop_${Math.random().toString(36).substr(2, 9)}`;
  const shopRef = doc(db, 'vendorProfiles', shopId);
  
  const newShop: Shop = {
    id: shopId,
    vendorId: ownerUserId,
    ownerUserId: ownerUserId,
    name: name || "My Local Shop",
    type: "Boutique",
    description: "Welcome to our neighborhood shop! We are excited to serve our community.",
    location: "Neighborhood Square",
    hours: "9 AM - 6 PM",
    rating: 5.0,
    imageUrl: `https://picsum.photos/seed/${shopId}/600/400`,
    createdAt: new Date(),
  } as any;
  
  await setDoc(shopRef, newShop);
  return newShop;
}

export async function updateShopProfile(db: Firestore, id: string, data: Partial<Shop>) {
  const shopRef = doc(db, 'vendorProfiles', id);
  await updateDoc(shopRef, data);
  
  const updated = await getDoc(shopRef);
  return updated.exists() ? { ...updated.data(), id: updated.id } as Shop : null;
}

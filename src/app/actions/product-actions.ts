'use client';

import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  collectionGroup
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { Product, Review } from '@/app/lib/types';

/**
 * @fileOverview Client-side utilities for Product management using Firestore.
 */

const { firestore } = initializeFirebase();

export async function getProducts() {
  const productsQuery = query(collectionGroup(firestore, 'products'), where('isActive', '==', true));
  const snapshot = await getDocs(productsQuery);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product));
}

export async function getProductById(id: string) {
  const productsQuery = query(collectionGroup(firestore, 'products'), where('id', '==', id));
  const snapshot = await getDocs(productsQuery);
  if (snapshot.empty) return null;
  return { ...snapshot.docs[0].data(), id: snapshot.docs[0].id } as Product;
}

export async function getReviewsByShopId(shopId: string) {
  const reviewsRef = collection(firestore, 'reviews');
  const q = query(reviewsRef, where('shopId', '==', shopId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Review));
}

export async function addProduct(data: Partial<Product>) {
  const vendorProfileId = data.shopId || 's1';
  const productId = `p${Math.random().toString(36).substr(2, 9)}`;
  
  const productRef = doc(firestore, 'vendorProfiles', vendorProfileId, 'products', productId);
  
  const newProduct: Product = {
    id: productId,
    shopId: vendorProfileId,
    name: data.name || 'Untitled Product',
    description: data.description || '',
    price: data.price || 0,
    discountPrice: data.discountPrice,
    category: data.category || 'General',
    imageUrl: data.imageUrl || `https://picsum.photos/seed/${productId}/400/400`,
    stockQuantity: data.stockQuantity || 0,
    isActive: true,
    rating: data.rating || 0,
    createdAt: new Date(),
  };
  
  await setDoc(productRef, newProduct);
  return newProduct;
}

export async function updateProduct(id: string, data: Partial<Product>) {
  const shopId = data.shopId || 's1';
  const productRef = doc(firestore, 'vendorProfiles', shopId, 'products', id);
  
  await updateDoc(productRef, data);
  
  const updated = await getDoc(productRef);
  return updated.exists() ? { ...updated.data(), id: updated.id } as Product : null;
}

export async function deleteProduct(id: string) {
  const productRef = doc(firestore, 'vendorProfiles', 's1', 'products', id);
  await deleteDoc(productRef);
  return true;
}

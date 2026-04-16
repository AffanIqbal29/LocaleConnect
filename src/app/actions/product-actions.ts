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
  Firestore
} from 'firebase/firestore';
import { Product, Review } from '@/app/lib/types';

/**
 * @fileOverview Client-side utilities for Product management using Firestore.
 * These functions have been updated to avoid collectionGroup queries which require manual indexing.
 */

export async function getProducts(db: Firestore) {
  try {
    // Step 1: Get all vendor profiles
    const shopsRef = collection(db, 'vendorProfiles');
    const shopsSnap = await getDocs(shopsRef);
    
    // Step 2: Fetch products for each shop manually to avoid collectionGroup index requirement
    const productPromises = shopsSnap.docs.map(async (shopDoc) => {
      const productsRef = collection(db, 'vendorProfiles', shopDoc.id, 'products');
      const productsQuery = query(productsRef, where('isActive', '==', true));
      const productsSnap = await getDocs(productsQuery);
      return productsSnap.docs.map(doc => ({ 
        ...doc.data(), 
        id: doc.id,
        shopId: shopDoc.id // Ensure shopId is present
      } as Product));
    });

    const productsArrays = await Promise.all(productPromises);
    return productsArrays.flat();
  } catch (error) {
    console.error("Error in getProducts:", error);
    return [];
  }
}

export async function getProductById(db: Firestore, id: string) {
  try {
    // Since we don't have the shopId, we search across shops manually
    const shopsRef = collection(db, 'vendorProfiles');
    const shopsSnap = await getDocs(shopsRef);
    
    for (const shopDoc of shopsSnap.docs) {
      const productRef = doc(db, 'vendorProfiles', shopDoc.id, 'products', id);
      const productSnap = await getDoc(productRef);
      if (productSnap.exists()) {
        return { ...productSnap.data(), id: productSnap.id, shopId: shopDoc.id } as Product;
      }
    }
  } catch (error) {
    console.error("Error in getProductById:", error);
  }
  return null;
}

export async function getReviewsByShopId(db: Firestore, shopId: string) {
  const reviewsRef = collection(db, 'reviews');
  const q = query(reviewsRef, where('shopId', '==', shopId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Review));
}

export async function addProduct(db: Firestore, data: Partial<Product> & { ownerUserId?: string }) {
  const vendorProfileId = data.shopId || 's1';
  const productId = `p${Math.random().toString(36).substr(2, 9)}`;
  
  const productRef = doc(db, 'vendorProfiles', vendorProfileId, 'products', productId);
  
  const newProduct: any = {
    id: productId,
    shopId: vendorProfileId,
    ownerUserId: data.ownerUserId,
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
  return newProduct as Product;
}

export async function updateProduct(db: Firestore, id: string, data: Partial<Product>) {
  const shopId = data.shopId || 's1';
  const productRef = doc(db, 'vendorProfiles', shopId, 'products', id);
  
  await updateDoc(productRef, data);
  
  const updated = await getDoc(productRef);
  return updated.exists() ? { ...updated.data(), id: updated.id } as Product : null;
}

export async function deleteProduct(db: Firestore, id: string) {
  // In a real app, you'd pass the shopId. For MVP, we'll try a common one or find it.
  const productRef = doc(db, 'vendorProfiles', 's1', 'products', id);
  await deleteDoc(productRef);
  return true;
}

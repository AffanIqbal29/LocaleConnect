
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
 */

export async function getProducts(db: Firestore) {
  try {
    const shopsRef = collection(db, 'vendorProfiles');
    const shopsSnap = await getDocs(shopsRef);
    
    const productPromises = shopsSnap.docs.map(async (shopDoc) => {
      const productsRef = collection(db, 'vendorProfiles', shopDoc.id, 'products');
      const productsQuery = query(productsRef, where('isActive', '==', true));
      const productsSnap = await getDocs(productsQuery);
      return productsSnap.docs.map(doc => {
        const data = doc.data();
        return { 
          ...data, 
          id: doc.id,
          shopId: shopDoc.id,
          // Robust image handling: check both imageUrl and imageUrls[0]
          imageUrl: data.imageUrl || (data.imageUrls && data.imageUrls[0]) || `https://picsum.photos/seed/${doc.id}/400/400`
        } as Product;
      });
    });

    const productsArrays = await Promise.all(productPromises);
    return productsArrays.flat();
  } catch (error) {
    console.error("Error in getProducts:", error);
    return [];
  }
}

export async function getProductsByShopId(db: Firestore, shopId: string) {
  try {
    const productsRef = collection(db, 'vendorProfiles', shopId, 'products');
    const productsSnap = await getDocs(productsRef);
    return productsSnap.docs.map(doc => {
      const data = doc.data();
      return { 
        ...data, 
        id: doc.id,
        shopId: shopId,
        imageUrl: data.imageUrl || (data.imageUrls && data.imageUrls[0]) || `https://picsum.photos/seed/${doc.id}/400/400`
      } as Product;
    });
  } catch (error) {
    console.error("Error in getProductsByShopId:", error);
    return [];
  }
}

export async function getProductById(db: Firestore, id: string) {
  try {
    const shopsRef = collection(db, 'vendorProfiles');
    const shopsSnap = await getDocs(shopsRef);
    
    for (const shopDoc of shopsSnap.docs) {
      const productRef = doc(db, 'vendorProfiles', shopDoc.id, 'products', id);
      const productSnap = await getDoc(productRef);
      if (productSnap.exists()) {
        const data = productSnap.data();
        return { 
          ...data, 
          id: productSnap.id, 
          shopId: shopDoc.id,
          imageUrl: data.imageUrl || (data.imageUrls && data.imageUrls[0]) || `https://picsum.photos/seed/${productSnap.id}/400/400`
        } as Product;
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
  if (!data.shopId) throw new Error("Shop ID is required to add a product.");
  
  const productId = `p${Math.random().toString(36).substr(2, 9)}`;
  const productRef = doc(db, 'vendorProfiles', data.shopId, 'products', productId);
  
  const newProduct: any = {
    id: productId,
    shopId: data.shopId,
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

export async function updateProduct(db: Firestore, id: string, shopId: string, data: Partial<Product>) {
  const productRef = doc(db, 'vendorProfiles', shopId, 'products', id);
  await updateDoc(productRef, data);
  const updated = await getDoc(productRef);
  return updated.exists() ? { ...updated.data(), id: updated.id, shopId } as Product : null;
}

export async function deleteProduct(db: Firestore, id: string, shopId: string) {
  const productRef = doc(db, 'vendorProfiles', shopId, 'products', id);
  await deleteDoc(productRef);
  return true;
}

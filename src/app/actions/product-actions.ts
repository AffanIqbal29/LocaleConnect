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
  Firestore,
  serverTimestamp,
  collectionGroup,
  addDoc
} from 'firebase/firestore';
import { Product, Review } from '@/app/lib/types';

/**
 * @fileOverview Client-side utilities for Product management using Firestore.
 */

/**
 * Fetches all products across ALL vendor profiles using collectionGroup.
 */
export async function getProducts(db: Firestore) {
  try {
    const productsQuery = collectionGroup(db, 'products');
    const snapshot = await getDocs(productsQuery);
    
    if (snapshot.empty) return [];

    const allProducts = snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      const vendorId = docSnap.ref.parent.parent?.id || 'unknown';
      
      return { 
        ...data, 
        id: docSnap.id,
        shopId: vendorId,
        imageUrl: data.imageUrl || (data.imageUrls && data.imageUrls[0]) || `https://picsum.photos/seed/${docSnap.id}/400/400`,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now())
      } as Product;
    });

    return allProducts.filter(p => p.isActive === true);
  } catch (error) {
    console.error("Error in getProducts:", error);
    return [];
  }
}

/**
 * Fetches products for a specific shop ID.
 */
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
        imageUrl: data.imageUrl || (data.imageUrls && data.imageUrls[0]) || `https://picsum.photos/seed/${doc.id}/400/400`,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now())
      } as Product;
    });
  } catch (error) {
    console.error("Error in getProductsByShopId:", error);
    return [];
  }
}

/**
 * Fetches a single product by ID.
 */
export async function getProductById(db: Firestore, id: string) {
  try {
    const productsQuery = collectionGroup(db, 'products');
    const snapshot = await getDocs(productsQuery);
    const docSnap = snapshot.docs.find(d => d.id === id);
    if (docSnap) {
      const data = docSnap.data();
      return { 
        ...data, 
        id: docSnap.id, 
        shopId: docSnap.ref.parent.parent?.id || 'unknown',
        imageUrl: data.imageUrl || (data.imageUrls && data.imageUrls[0]) || `https://picsum.photos/seed/${docSnap.id}/400/400`,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now())
      } as Product;
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
  return snapshot.docs.map(doc => ({ 
    ...doc.data(), 
    id: doc.id,
    createdAt: (doc.data() as any).createdAt?.toDate ? (doc.data() as any).createdAt.toDate() : new Date((doc.data() as any).createdAt || Date.now())
  } as Review));
}

/**
 * Adds a new product to a shop's subcollection.
 */
export async function addProduct(db: Firestore, data: Partial<Product> & { ownerUserId?: string }) {
  if (!data.shopId) throw new Error("Shop ID is required to add a product.");
  
  try {
    const productsRef = collection(db, 'vendorProfiles', data.shopId, 'products');
    
    const newProductData = {
      name: data.name || 'Untitled Product',
      description: data.description || '',
      price: data.price || 0,
      discountPrice: data.discountPrice || null,
      category: data.category || 'General',
      imageUrl: data.imageUrl || `https://picsum.photos/seed/${Math.random()}/400/400`,
      stockQuantity: data.stockQuantity || 0,
      isActive: data.isActive !== undefined ? data.isActive : true,
      rating: data.rating || 5.0,
      ownerUserId: data.ownerUserId || 'system',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(productsRef, newProductData);
    return { ...newProductData, id: docRef.id, createdAt: new Date() } as Product;
  } catch (error) {
    console.error("Error adding product to Firestore:", error);
    throw error;
  }
}

export async function updateProduct(db: Firestore, id: string, shopId: string, data: Partial<Product>) {
  const productRef = doc(db, 'vendorProfiles', shopId, 'products', id);
  await updateDoc(productRef, { ...data, updatedAt: serverTimestamp() });
}

export async function deleteProduct(db: Firestore, id: string, shopId: string) {
  const productRef = doc(db, 'vendorProfiles', shopId, 'products', id);
  await deleteDoc(productRef);
  return true;
}

/**
 * Seeds sample data into Firestore.
 */
export async function seedSampleData(db: Firestore, currentUserId?: string) {
  const ownerId = currentUserId || 'system_seed';
  
  const sampleShops = [
    {
      id: 'shop_bakery',
      name: "Bloom Bakery",
      type: "Bakery",
      description: "Artisan sourdough and neighborhood favorites baked fresh daily using locally sourced organic ingredients.",
      location: "123 Maple St, Old Town",
      hours: "8 AM - 6 PM",
      rating: 4.8,
      imageUrl: "https://picsum.photos/seed/bakery/600/400",
      ownerUserId: ownerId
    },
    {
      id: 'shop_pottery',
      name: "Clay Creations",
      type: "Pottery",
      description: "Handcrafted ceramics made right here in the neighborhood. Unique pieces for your home.",
      location: "101 River Road",
      hours: "11 AM - 4 PM",
      rating: 5.0,
      imageUrl: "https://picsum.photos/seed/pottery/600/400",
      ownerUserId: ownerId
    }
  ];

  const sampleProducts = [
    {
      shopId: 'shop_bakery',
      name: "Wildflower Honey",
      description: "Pure, raw honey collected from local wildflowers.",
      price: 125.50,
      category: "Food",
      imageUrl: "https://picsum.photos/seed/honey/400/400",
      stockQuantity: 25,
      rating: 4.7,
      isActive: true
    },
    {
      shopId: 'shop_bakery',
      name: "Sourdough Bread",
      description: "Naturally leavened bread with a crisp crust and airy interior.",
      price: 80.00,
      category: "Food",
      imageUrl: "https://picsum.photos/seed/bread/400/400",
      stockQuantity: 10,
      rating: 4.9,
      isActive: true
    },
    {
      shopId: 'shop_pottery',
      name: "Handcrafted Ceramic Mug",
      description: "A beautiful, hand-thrown ceramic mug with a unique glaze finish.",
      price: 240.00,
      category: "Home",
      imageUrl: "https://picsum.photos/seed/mug/400/400",
      stockQuantity: 12,
      rating: 4.9,
      isActive: true
    }
  ];

  try {
    // 1. Create Shops
    for (const shop of sampleShops) {
      const shopRef = doc(db, 'vendorProfiles', shop.id);
      await setDoc(shopRef, { 
        ...shop, 
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
    }

    // 2. Create Products
    for (const prod of sampleProducts) {
      await addProduct(db, { ...prod, ownerUserId: ownerId });
    }

    console.log("Database seeded successfully!");
    return true;
  } catch (error) {
    console.error("Error seeding data:", error);
    throw error;
  }
}

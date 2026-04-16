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
  collectionGroup
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
    // Fetch all products across all vendors using collectionGroup
    // This allows querying subcollections regardless of their parent document
    const productsQuery = collectionGroup(db, 'products');
    const snapshot = await getDocs(productsQuery);
    
    if (snapshot.empty) return [];

    const allProducts = snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      // In a collectionGroup query, the parent of the parent is the vendorProfile document
      const vendorId = docSnap.ref.parent.parent?.id || 'unknown';
      
      return { 
        ...data, 
        id: docSnap.id,
        shopId: vendorId,
        imageUrl: data.imageUrl || (data.imageUrls && data.imageUrls[0]) || `https://picsum.photos/seed/${docSnap.id}/400/400`,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now())
      } as Product;
    });

    // Filter active products in memory to avoid requiring a specific Collection Group index for isActive
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
 * Fetches a single product by ID by searching across all shops.
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

export async function addProduct(db: Firestore, data: Partial<Product> & { ownerUserId?: string }) {
  if (!data.shopId) throw new Error("Shop ID is required to add a product.");
  
  const productId = data.id || `p_${Math.random().toString(36).substr(2, 9)}`;
  const productRef = doc(db, 'vendorProfiles', data.shopId, 'products', productId);
  
  const newProduct: any = {
    id: productId,
    shopId: data.shopId,
    ownerUserId: data.ownerUserId || 'system',
    name: data.name || 'Untitled Product',
    description: data.description || '',
    price: data.price || 0,
    discountPrice: data.discountPrice,
    category: data.category || 'General',
    imageUrl: data.imageUrl || `https://picsum.photos/seed/${productId}/400/400`,
    stockQuantity: data.stockQuantity || 0,
    isActive: true,
    rating: data.rating || 0,
    createdAt: serverTimestamp(),
  };
  
  await setDoc(productRef, newProduct);
  return { ...newProduct, createdAt: new Date() } as Product;
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

export async function seedSampleData(db: Firestore) {
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
      ownerUserId: 'system_seed'
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
      ownerUserId: 'system_seed'
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

  // Await all shop creations
  for (const shop of sampleShops) {
    const shopRef = doc(db, 'vendorProfiles', shop.id);
    await setDoc(shopRef, { ...shop, createdAt: serverTimestamp() });
  }

  // Await all product creations
  for (const prod of sampleProducts) {
    await addProduct(db, { ...prod, ownerUserId: 'system_seed' });
  }
}

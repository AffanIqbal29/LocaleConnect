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
  addDoc
} from 'firebase/firestore';
import { Product, Review } from '@/app/lib/types';

/**
 * @fileOverview Client-side utilities for Product management using Firestore.
 */

/**
 * Fetches all products across ALL vendor profiles.
 * To avoid the need for a Collection Group Index, we fetch all vendors first,
 * then fetch products for each vendor. This is safer for prototyping.
 */
export async function getProducts(db: Firestore) {
  try {
    const shopsRef = collection(db, 'vendorProfiles');
    const shopsSnap = await getDocs(shopsRef);
    
    if (shopsSnap.empty) return [];

    const allProductsPromises = shopsSnap.docs.map(async (shopDoc) => {
      const shopId = shopDoc.id;
      const productsRef = collection(db, 'vendorProfiles', shopId, 'products');
      const productsQuery = query(productsRef, where('isActive', '==', true));
      const productsSnap = await getDocs(productsQuery);
      
      return productsSnap.docs.map(docSnap => {
        const data = docSnap.data();
        return { 
          ...data, 
          id: docSnap.id,
          shopId: shopId,
          imageUrl: data.imageUrl || `https://picsum.photos/seed/${docSnap.id}/400/400`,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now())
        } as Product;
      });
    });

    const productsArrays = await Promise.all(allProductsPromises);
    return productsArrays.flat();
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
        imageUrl: data.imageUrl || `https://picsum.photos/seed/${doc.id}/400/400`,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now())
      } as Product;
    });
  } catch (error) {
    console.error("Error in getProductsByShopId:", error);
    return [];
  }
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
      price: Number(data.price) || 0,
      discountPrice: data.discountPrice ? Number(data.discountPrice) : null,
      category: data.category || 'General',
      imageUrl: data.imageUrl || `https://picsum.photos/seed/${Math.random()}/400/400`,
      stockQuantity: Number(data.stockQuantity) || 0,
      isActive: data.isActive !== undefined ? data.isActive : true,
      rating: data.rating || 5.0,
      ownerUserId: data.ownerUserId || 'system',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(productsRef, newProductData);
    console.log(`Product added with ID: ${docRef.id} to shop: ${data.shopId}`);
    return { ...newProductData, id: docRef.id, createdAt: new Date() } as Product;
  } catch (error) {
    console.error("Error adding product to Firestore:", error);
    throw error;
  }
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
 * Seeds sample data into Firestore with 3 shops and 10+ products.
 */
export async function seedSampleData(db: Firestore, currentUserId?: string) {
  const ownerId = currentUserId || 'system_seed';
  console.log("Starting database seed with ownerId:", ownerId);

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
    },
    {
      id: 'shop_boutique',
      name: "The Velvet Hanger",
      type: "Boutique",
      description: "Curated vintage finds and modern sustainable fashion for the conscious shopper.",
      location: "456 Oak Avenue",
      hours: "10 AM - 8 PM",
      rating: 4.9,
      imageUrl: "https://picsum.photos/seed/boutique/600/400",
      ownerUserId: ownerId
    }
  ];

  const sampleProducts = [
    // Shop 1: Bakery
    { shopId: 'shop_bakery', name: "Wildflower Honey", price: 125.50, category: "Food", imageUrl: "https://picsum.photos/seed/honey/400/400", stockQuantity: 25, rating: 4.7, isActive: true, description: "Pure, raw honey collected from local wildflowers." },
    { shopId: 'shop_bakery', name: "Sourdough Bread", price: 80.00, category: "Food", imageUrl: "https://picsum.photos/seed/bread/400/400", stockQuantity: 10, rating: 4.9, isActive: true, description: "Naturally leavened bread with a crisp crust and airy interior." },
    { shopId: 'shop_bakery', name: "Cinnamon Rolls", price: 45.00, category: "Food", imageUrl: "https://picsum.photos/seed/roll/400/400", stockQuantity: 15, rating: 4.8, isActive: true, description: "Warm, gooey cinnamon rolls with cream cheese frosting." },
    { shopId: 'shop_bakery', name: "Organic Granola", price: 110.00, category: "Food", imageUrl: "https://picsum.photos/seed/granola/400/400", stockQuantity: 20, rating: 4.6, isActive: true, description: "Crunchy oat granola with nuts and dried fruits." },
    
    // Shop 2: Pottery
    { shopId: 'shop_pottery', name: "Ceramic Mug", price: 240.00, category: "Home", imageUrl: "https://picsum.photos/seed/mug/400/400", stockQuantity: 12, rating: 4.9, isActive: true, description: "Hand-thrown ceramic mug with a unique glaze." },
    { shopId: 'shop_pottery', name: "Pasta Bowl", price: 350.00, category: "Home", imageUrl: "https://picsum.photos/seed/bowl/400/400", stockQuantity: 8, rating: 5.0, isActive: true, description: "Large ceramic bowl perfect for family pasta nights." },
    { shopId: 'shop_pottery', name: "Flower Vase", price: 420.00, category: "Home", imageUrl: "https://picsum.photos/seed/vase/400/400", stockQuantity: 5, rating: 4.8, isActive: true, description: "Elegant stoneware vase for fresh neighborhood blooms." },
    { shopId: 'shop_pottery', name: "Incense Holder", price: 95.00, category: "Home", imageUrl: "https://picsum.photos/seed/incense/400/400", stockQuantity: 15, rating: 4.7, isActive: true, description: "Minimalist ceramic holder for your favorite scents." },

    // Shop 3: Boutique
    { shopId: 'shop_boutique', name: "Vintage Denim Jacket", price: 650.00, category: "Clothing", imageUrl: "https://picsum.photos/seed/jacket/400/400", stockQuantity: 1, rating: 4.6, isActive: true, description: "Classic vintage denim jacket, hand-selected for quality." },
    { shopId: 'shop_boutique', name: "Canvas Market Tote", price: 150.00, category: "Clothing", imageUrl: "https://picsum.photos/seed/tote/400/400", stockQuantity: 20, rating: 4.7, isActive: true, description: "Durable tote bag for your local market trips." },
    { shopId: 'shop_boutique', name: "Alpaca Scarf", price: 850.00, category: "Clothing", imageUrl: "https://picsum.photos/seed/scarf/400/400", stockQuantity: 5, rating: 4.9, isActive: true, description: "Luxuriously soft scarf knitted from pure alpaca wool." },
    { shopId: 'shop_boutique', name: "Handmade Leather Belt", price: 320.00, category: "Clothing", imageUrl: "https://picsum.photos/seed/belt/400/400", stockQuantity: 10, rating: 4.8, isActive: true, description: "Durable leather belt with a brass buckle." }
  ];

  try {
    // 1. Create Shops
    for (const shop of sampleShops) {
      console.log(`Seeding shop: ${shop.name}`);
      const shopRef = doc(db, 'vendorProfiles', shop.id);
      await setDoc(shopRef, { 
        ...shop, 
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
    }

    // 2. Create Products in subcollections
    for (const prod of sampleProducts) {
      console.log(`Seeding product: ${prod.name} for shop: ${prod.shopId}`);
      await addProduct(db, { ...prod, ownerUserId: ownerId });
    }

    console.log("Database seeded successfully with 3 shops and 12 products!");
    return true;
  } catch (error: any) {
    console.error("Critical error seeding data:", error);
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

export async function getProductById(db: Firestore, id: string) {
  try {
    // Since products are nested, finding one by ID without knowing the shop is tricky without collectionGroup.
    // For specific product pages, we usually pass shopId in the URL, but here we scan shops if needed.
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
          imageUrl: data.imageUrl || `https://picsum.photos/seed/${productSnap.id}/400/400`,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now())
        } as Product;
      }
    }
  } catch (error) {
    console.error("Error in getProductById:", error);
  }
  return null;
}

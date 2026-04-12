
'use server';

import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  where,
  addDoc
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { Order } from '@/app/lib/types';

/**
 * @fileOverview Server Actions for Order management using Firestore.
 */

const { firestore } = initializeFirebase();

export async function getOrdersByCustomerId(customerId: string) {
  const ordersRef = collection(firestore, 'users', customerId, 'orders');
  const snapshot = await getDocs(ordersRef);
  
  const orders = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Order));
  
  // Enhance with shop names
  const enhancedOrders = await Promise.all(orders.map(async (order) => {
    const shopRef = doc(firestore, 'vendorProfiles', order.shopId);
    const shopSnap = await getDoc(shopRef);
    return {
      ...order,
      shopName: shopSnap.exists() ? (shopSnap.data() as any).name : 'Local Shop'
    };
  }));
  
  return enhancedOrders;
}

export async function getOrderById(customerId: string, orderId: string) {
  const orderRef = doc(firestore, 'users', customerId, 'orders', orderId);
  const snapshot = await getDoc(orderRef);
  
  if (!snapshot.exists()) return null;
  
  const order = { ...snapshot.data(), id: snapshot.id } as Order;
  const shopRef = doc(firestore, 'vendorProfiles', order.shopId);
  const shopSnap = await getDoc(shopRef);
  
  return {
    ...order,
    shopName: shopSnap.exists() ? (shopSnap.data() as any).name : 'Local Shop'
  };
}

export async function createOrder(orderData: Partial<Order>) {
  if (!orderData.customerId) throw new Error("Customer ID is required");
  
  const ordersRef = collection(firestore, 'users', orderData.customerId, 'orders');
  const docRef = await addDoc(ordersRef, {
    ...orderData,
    createdAt: new Date(),
    status: 'pending'
  });
  
  return docRef.id;
}

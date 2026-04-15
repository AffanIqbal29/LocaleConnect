
'use client';

import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc,
  Firestore
} from 'firebase/firestore';
import { Order } from '@/app/lib/types';

/**
 * @fileOverview Client-side utilities for Order management using Firestore.
 */

export async function getOrdersByCustomerId(db: Firestore, customerId: string) {
  const ordersRef = collection(db, 'users', customerId, 'orders');
  const snapshot = await getDocs(ordersRef);
  
  const orders = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Order));
  
  const enhancedOrders = await Promise.all(orders.map(async (order) => {
    const shopRef = doc(db, 'vendorProfiles', order.shopId);
    const shopSnap = await getDoc(shopRef);
    return {
      ...order,
      shopName: shopSnap.exists() ? (shopSnap.data() as any).name : 'Local Shop'
    };
  }));
  
  return enhancedOrders;
}

export async function getOrderById(db: Firestore, customerId: string, orderId: string) {
  const orderRef = doc(db, 'users', customerId, 'orders', orderId);
  const snapshot = await getDoc(orderRef);
  
  if (!snapshot.exists()) return null;
  
  const order = { ...snapshot.data(), id: snapshot.id } as Order;
  const shopRef = doc(db, 'vendorProfiles', order.shopId);
  const shopSnap = await getDoc(shopRef);
  
  return {
    ...order,
    shopName: shopSnap.exists() ? (shopSnap.data() as any).name : 'Local Shop'
  };
}

export async function createOrder(db: Firestore, orderData: Partial<Order>) {
  if (!orderData.customerId) throw new Error("Customer ID is required");
  
  const ordersRef = collection(db, 'users', orderData.customerId, 'orders');
  const docRef = await addDoc(ordersRef, {
    ...orderData,
    createdAt: new Date(),
    status: 'pending'
  });
  
  return docRef.id;
}

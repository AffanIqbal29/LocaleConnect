'use server';

import { orders, shops } from '@/lib/db';
import { Order } from '@/app/lib/types';

/**
 * @fileOverview Server Actions for Order management.
 */

export async function getOrdersByCustomerId(customerId: string) {
  // In a real app, this would filter by customerId in Firestore
  // For the prototype, we return all orders since we're simulating one user session
  return orders.map(order => {
    const shop = shops.find(s => s.id === order.shopId);
    return {
      ...order,
      shopName: shop?.name || 'Local Shop'
    };
  });
}

export async function getOrderById(id: string) {
  const order = orders.find(o => o.id === id);
  if (!order) return null;
  const shop = shops.find(s => s.id === order.shopId);
  return {
    ...order,
    shopName: shop?.name || 'Local Shop'
  };
}

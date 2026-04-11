
'use server';

import { shops } from '@/lib/db';
import { Shop } from '@/app/lib/types';
import { revalidatePath } from 'next/cache';

/**
 * @fileOverview Server Actions for Shop management.
 */

export async function getShops() {
  return shops;
}

export async function getShopById(id: string) {
  return shops.find(s => s.id === id);
}

export async function updateShopProfile(id: string, data: Partial<Shop>) {
  const index = shops.findIndex(s => s.id === id);
  if (index !== -1) {
    shops[index] = { ...shops[index], ...data };
    revalidatePath('/shops');
    revalidatePath('/vendor/dashboard');
    return shops[index];
  }
  return null;
}


'use server';

import { products, shops } from '@/lib/db';
import { Product } from '@/app/lib/types';
import { revalidatePath } from 'next/cache';

/**
 * @fileOverview Server Actions for Product management.
 */

export async function getProducts() {
  return products;
}

export async function getProductById(id: string) {
  return products.find(p => p.id === id);
}

export async function addProduct(data: Partial<Product>) {
  const newProduct: Product = {
    id: `p${Math.random().toString(36).substr(2, 9)}`,
    shopId: data.shopId || 's1',
    name: data.name || 'Untitled Product',
    description: data.description || '',
    price: data.price || 0,
    category: data.category || 'General',
    imageUrl: data.imageUrl || 'https://picsum.photos/seed/newprod/400',
    stockQuantity: data.stockQuantity || 0,
    isActive: true,
    createdAt: new Date(),
  };
  
  products.push(newProduct);
  revalidatePath('/products');
  revalidatePath('/vendor/dashboard');
  return newProduct;
}

export async function deleteProduct(id: string) {
  const index = products.findIndex(p => p.id === id);
  if (index !== -1) {
    products.splice(index, 1);
    revalidatePath('/products');
    revalidatePath('/vendor/dashboard');
    return true;
  }
  return false;
}

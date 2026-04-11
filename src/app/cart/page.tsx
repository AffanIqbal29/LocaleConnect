
"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/components/cart-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, CreditCard } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function CartPage() {
  const { items, totalPrice, updateQuantity, removeFromCart, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center space-y-6">
        <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
          <ShoppingBag className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-4xl font-headline">Your cart is empty</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          It looks like you haven't added any unique local items to your cart yet.
        </p>
        <Link href="/products" className="inline-block mt-4">
          <Button size="lg" className="h-14 px-8 shadow-lg">
            Browse Local Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center gap-4 mb-10">
        <Link href="/products">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-4xl font-headline">Your Shopping Cart</h1>
        <span className="ml-auto text-muted-foreground font-medium">{totalItems} items</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="relative h-24 w-24 sm:h-32 sm:w-32 flex-shrink-0 bg-muted rounded-lg overflow-hidden">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-grow flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-primary text-[10px] font-bold uppercase tracking-widest">{item.shopName}</p>
                          <h3 className="text-xl font-headline mt-1">{item.name}</h3>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-end mt-4">
                      <div className="flex items-center border rounded-full p-1 bg-muted/50">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-full"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-full"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xl font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <Card className="shadow-lg border-primary/10">
            <CardContent className="p-8 space-y-6">
              <h2 className="text-2xl font-headline border-b pb-4">Order Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Local Delivery</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Processing Fee</span>
                  <span className="font-medium">₹15.00</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-end">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-3xl font-bold text-primary">₹{(totalPrice + 15).toFixed(2)}</span>
              </div>
              
              <Button className="w-full h-14 text-lg font-medium shadow-xl">
                Proceed to Checkout <CreditCard className="ml-2 h-5 w-5" />
              </Button>
              
              <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                <ShoppingBag className="h-3 w-3" /> Secure Checkout by LocaleConnect
              </div>
            </CardContent>
          </Card>
          
          <div className="bg-primary/5 p-6 rounded-xl border border-primary/10 text-sm space-y-3">
            <p className="font-semibold text-primary">Support Local Impact</p>
            <p className="text-muted-foreground leading-relaxed">
              This order supports <strong>{new Set(items.map(i => i.shopName)).size}</strong> local independent businesses in your community. Thank you for making a difference!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

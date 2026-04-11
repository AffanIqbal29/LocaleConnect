
"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, ShoppingBag, ArrowRight, Heart } from 'lucide-react';

export default function CheckoutSuccessPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-24">
      <Card className="border-none shadow-2xl overflow-hidden">
        <div className="bg-primary h-2 w-full" />
        <CardContent className="p-12 text-center space-y-8">
          <div className="flex justify-center">
            <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <CheckCircle2 className="h-12 w-12" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-4xl font-headline">Order Placed Successfully!</h1>
            <p className="text-muted-foreground text-lg">
              Thank you for your purchase. We've notified the local shops and they are preparing your unique items.
            </p>
          </div>

          <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 flex items-center gap-4 text-left max-w-md mx-auto">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
              <Heart className="h-5 w-5 fill-current" />
            </div>
            <div>
              <p className="font-semibold text-sm">Community Impact</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your purchase directly supports independent artisans and small businesses in your neighborhood.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/products">
              <Button size="lg" className="h-12 px-8">
                Continue Shopping <ShoppingBag className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/account">
              <Button variant="outline" size="lg" className="h-12 px-8">
                View My Orders <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      
      <p className="text-center mt-12 text-sm text-muted-foreground">
        Order confirmation details have been sent to your registered email.
      </p>
    </div>
  );
}


"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Store, Zap, Heart, ArrowRight } from 'lucide-react';

export default function RegisterShopPage() {
  const benefits = [
    {
      title: "Reach Local Customers",
      description: "Connect with people in your neighborhood who want to support local businesses.",
      icon: <Store className="h-6 w-6 text-primary" />
    },
    {
      title: "AI-Powered Tools",
      description: "Generate professional product descriptions and shop profiles in seconds.",
      icon: <Zap className="h-6 w-6 text-primary" />
    },
    {
      title: "Easy Management",
      description: "A simple dashboard to manage your inventory, orders, and shop details.",
      icon: <CheckCircle2 className="h-6 w-6 text-primary" />
    },
    {
      title: "Community Growth",
      description: "Join a network of local artisans and vendors helping each other thrive.",
      icon: <Heart className="h-6 w-6 text-primary" />
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="text-center space-y-4 mb-16">
        <h1 className="text-5xl font-headline">Grow Your Local Business</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
          Join LocaleConnect and start selling your unique products to your neighbors today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {benefits.map((benefit, index) => (
          <Card key={index} className="border-none shadow-sm bg-primary/5">
            <CardContent className="p-8 flex gap-6">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                  {benefit.icon}
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-headline">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-2xl border-primary/20 overflow-hidden">
        <div className="md:flex">
          <div className="p-8 md:p-12 md:w-1/2 space-y-6">
            <h2 className="text-3xl font-headline">Ready to start?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Setting up your shop takes less than 5 minutes. You'll get access to our vendor dashboard immediately.
            </p>
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="h-5 w-5 rounded-full bg-green-500/20 text-green-600 flex items-center justify-center">
                  <CheckCircle2 className="h-3 w-3" />
                </div>
                <span>No setup fees or hidden costs</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="h-5 w-5 rounded-full bg-green-500/20 text-green-600 flex items-center justify-center">
                  <CheckCircle2 className="h-3 w-3" />
                </div>
                <span>Cancel any time</span>
              </div>
            </div>
            <Link href="/vendor/dashboard" className="inline-block pt-6">
              <Button size="lg" className="h-14 px-10 text-lg shadow-xl">
                Open Your Shop Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          <div className="hidden md:block md:w-1/2 bg-muted relative">
             <img 
               src="https://picsum.photos/seed/vendor-reg/800/800" 
               alt="Happy Vendor" 
               className="absolute inset-0 object-cover h-full w-full"
               data-ai-hint="local vendor"
             />
          </div>
        </div>
      </Card>
    </div>
  );
}

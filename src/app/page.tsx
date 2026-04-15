
"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, MapPin, Star, ShoppingBag, Eye, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { getProducts } from '@/app/actions/product-actions';
import { getShops } from '@/app/actions/shop-actions';
import { Product, Shop } from '@/app/lib/types';
import { useFirestore } from '@/firebase';

export default function Home() {
  const [featuredShops, setFeaturedShops] = useState<Shop[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const db = useFirestore();

  useEffect(() => {
    async function loadData() {
      if (!db) return;
      setIsLoading(true);
      try {
        const [products, shops] = await Promise.all([
          getProducts(db),
          getShops(db)
        ]);
        setTrendingProducts(products.slice(0, 3));
        setFeaturedShops(shops.slice(0, 3));
      } catch (error) {
        console.error("Failed to load home page data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [db]);

  const heroImg = PlaceHolderImages.find(img => img.id === 'hero-local');

  return (
    <div className="flex flex-col gap-12 md:gap-24 pb-20">
      {/* Hero Section */}
      <section className="relative h-[500px] md:h-[700px] flex items-center justify-center overflow-hidden">
        <Image
          src={heroImg?.imageUrl || "https://picsum.photos/seed/locale1/1200/600"}
          alt="Local Market"
          fill
          className="object-cover brightness-50"
          priority
          data-ai-hint="local market"
        />
        <div className="relative z-10 text-center px-6 max-w-4xl space-y-6 md:space-y-10">
          <h1 className="text-4xl md:text-7xl font-headline text-white leading-tight">
            Connecting You to the <span className="text-primary italic">Heart</span> of Your Community
          </h1>
          <p className="text-lg md:text-2xl text-white/90 max-w-2xl mx-auto font-light leading-relaxed">
            Discover and shop from unique local vendors, artisans, and boutiques in your neighborhood.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/products" className="w-full sm:w-auto">
              <Button size="lg" className="w-full h-14 md:h-16 px-8 text-lg font-medium shadow-xl">
                Start Shopping <ShoppingBag className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/register-shop" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full h-14 md:h-16 px-8 text-lg font-medium bg-white/10 text-white border-white/40 backdrop-blur-md hover:bg-white hover:text-black">
                Become a Vendor
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Shops */}
      <section className="max-w-7xl mx-auto px-6 w-full space-y-8 md:space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-5xl font-headline">Featured Neighborhood Shops</h2>
            <p className="text-muted-foreground md:text-lg">Hand-picked gems from your local community.</p>
          </div>
          <Link href="/shops" className="flex items-center text-primary font-medium hover:underline">
            View all shops <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            {featuredShops.map((shop) => (
              <Card key={shop.id} className="group overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-300">
                <div className="relative h-56 md:h-72">
                  <Image
                    src={shop.imageUrl || "https://picsum.photos/seed/shop/600/400"}
                    alt={shop.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <Badge className="absolute top-4 right-4 bg-white/90 text-black hover:bg-white backdrop-blur-sm">
                    {shop.type}
                  </Badge>
                </div>
                <CardContent className="p-6 space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl md:text-2xl font-headline">{shop.name}</h3>
                    <div className="flex items-center text-amber-500 text-sm font-semibold">
                      <Star className="h-4 w-4 fill-current mr-1" /> {shop.rating}
                    </div>
                  </div>
                  <div className="flex items-center text-muted-foreground text-sm">
                    <MapPin className="h-4 w-4 mr-1 text-primary" /> {shop.location}
                  </div>
                  <Link href={`/shops`}>
                    <Button variant="secondary" className="w-full mt-4 group">
                      Visit Shop <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Trending Products */}
      <section className="max-w-7xl mx-auto px-6 w-full space-y-8 md:space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-5xl font-headline">Trending Locally</h2>
            <p className="text-muted-foreground md:text-lg">What your neighbors are buying right now.</p>
          </div>
          <Link href="/products" className="flex items-center text-primary font-medium hover:underline">
            View all products <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            {trendingProducts.map((product) => (
              <Link href={`/products/${product.id}`} key={product.id}>
                <Card className="group border-none shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden h-full flex flex-col">
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={product.imageUrl || "https://picsum.photos/seed/product/400/400"}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Button variant="secondary" className="rounded-full h-12 w-12 p-0 shadow-lg">
                        <Eye className="h-6 w-6" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                      <p className="text-primary text-xs font-bold uppercase tracking-widest mb-1">{product.category}</p>
                      <h3 className="text-lg md:text-xl font-headline mb-2 line-clamp-2">{product.name}</h3>
                    </div>
                    <p className="text-xl md:text-2xl font-semibold text-foreground mt-2">₹{product.price.toFixed(2)}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}


"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, MapPin, Star, ShoppingBag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const featuredShops = [
  {
    id: 's1',
    name: "Bloom Bakery",
    type: "Bakery",
    rating: 4.8,
    distance: "0.5 miles",
    image: PlaceHolderImages.find(img => img.id === 'bakery-shop')?.imageUrl || "",
  },
  {
    id: 's2',
    name: "The Velvet Hanger",
    type: "Boutique",
    rating: 4.9,
    distance: "1.2 miles",
    image: PlaceHolderImages.find(img => img.id === 'boutique-shop')?.imageUrl || "",
  },
  {
    id: 's3',
    name: "Steam & Bean",
    type: "Cafe",
    rating: 4.7,
    distance: "0.8 miles",
    image: PlaceHolderImages.find(img => img.id === 'cafe-shop')?.imageUrl || "",
  }
];

const trendingProducts = [
  {
    id: 'p1',
    name: "Handcrafted Ceramic Mug",
    shop: "Clay Creations",
    price: 240.00,
    image: PlaceHolderImages.find(img => img.id === 'product-pottery')?.imageUrl || "",
  },
  {
    id: 'p2',
    name: "Wildflower Honey",
    shop: "Bloom Bakery",
    price: 125.50,
    image: PlaceHolderImages.find(img => img.id === 'product-honey')?.imageUrl || "",
  },
  {
    id: 'p3',
    name: "Artisan Coffee Blend",
    shop: "Steam & Bean",
    price: 180.00,
    image: PlaceHolderImages.find(img => img.id === 'product-coffee')?.imageUrl || "",
  }
];

export default function Home() {
  const heroImg = PlaceHolderImages.find(img => img.id === 'hero-local');

  return (
    <div className="flex flex-col gap-16 pb-20">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <Image
          src={heroImg?.imageUrl || ""}
          alt="Local Market"
          fill
          className="object-cover brightness-50"
          priority
          data-ai-hint="local market"
        />
        <div className="relative z-10 text-center px-4 max-w-4xl space-y-6">
          <h1 className="text-5xl md:text-7xl font-headline text-white leading-tight">
            Connecting You to the <span className="text-primary italic">Heart</span> of Your Community
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto font-light">
            Discover and shop from unique local vendors, artisans, and boutiques in your neighborhood.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/products">
              <Button size="lg" className="h-14 px-8 text-lg font-medium shadow-xl">
                Start Shopping <ShoppingBag className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/register-shop">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-medium bg-white/10 text-white border-white/40 backdrop-blur-md hover:bg-white hover:text-black">
                Become a Vendor
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Shops */}
      <section className="max-w-7xl mx-auto px-6 w-full space-y-8">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <h2 className="text-4xl font-headline">Featured Neighborhood Shops</h2>
            <p className="text-muted-foreground">Hand-picked gems from your local community.</p>
          </div>
          <Link href="/shops" className="hidden sm:flex items-center text-primary font-medium hover:underline">
            View all shops <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredShops.map((shop) => (
            <Card key={shop.id} className="group overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="relative h-64">
                <Image
                  src={shop.image}
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
                  <h3 className="text-2xl font-headline">{shop.name}</h3>
                  <div className="flex items-center text-amber-500 text-sm font-semibold">
                    <Star className="h-4 w-4 fill-current mr-1" /> {shop.rating}
                  </div>
                </div>
                <div className="flex items-center text-muted-foreground text-sm">
                  <MapPin className="h-4 w-4 mr-1 text-primary" /> {shop.distance} from you
                </div>
                <Button variant="secondary" className="w-full mt-4 group">
                  Visit Shop <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Why Choose LocaleConnect */}
      <section className="bg-primary/5 py-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="space-y-4">
            <div className="h-16 w-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-headline">Support Local</h3>
            <p className="text-muted-foreground">Keep your community thriving by supporting small businesses and local artisans directly.</p>
          </div>
          <div className="space-y-4">
            <div className="h-16 w-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-headline">Fast Delivery</h3>
            <p className="text-muted-foreground">Get your items delivered within hours or pick them up from the store at your convenience.</p>
          </div>
          <div className="space-y-4">
            <div className="h-16 w-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-6">
              <Star className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-headline">Unique Finds</h3>
            <p className="text-muted-foreground">Discover one-of-a-kind products that you won't find in big-box retail stores.</p>
          </div>
        </div>
      </section>

      {/* Trending Products */}
      <section className="max-w-7xl mx-auto px-6 w-full space-y-8">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <h2 className="text-4xl font-headline">Trending Locally</h2>
            <p className="text-muted-foreground">What your neighbors are buying right now.</p>
          </div>
          <Link href="/products" className="hidden sm:flex items-center text-primary font-medium hover:underline">
            View all products <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {trendingProducts.map((product) => (
            <Card key={product.id} className="group border-none shadow-md hover:shadow-xl transition-all duration-300">
              <div className="relative aspect-square overflow-hidden rounded-t-lg">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <Button size="icon" className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ShoppingBag className="h-5 w-5" />
                </Button>
              </div>
              <CardContent className="p-6">
                <p className="text-primary text-xs font-bold uppercase tracking-widest mb-1">{product.shop}</p>
                <h3 className="text-xl font-headline mb-2">{product.name}</h3>
                <p className="text-2xl font-semibold text-foreground">₹{product.price.toFixed(2)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

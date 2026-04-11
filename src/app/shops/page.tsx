
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Star, ArrowRight } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const allShops = [
  {
    id: 's1',
    name: "Bloom Bakery",
    type: "Bakery",
    rating: 4.8,
    distance: "0.5 miles",
    image: PlaceHolderImages.find(img => img.id === 'bakery-shop')?.imageUrl || "",
    description: "Artisan sourdough and neighborhood favorites baked fresh daily."
  },
  {
    id: 's2',
    name: "The Velvet Hanger",
    type: "Boutique",
    rating: 4.9,
    distance: "1.2 miles",
    image: PlaceHolderImages.find(img => img.id === 'boutique-shop')?.imageUrl || "",
    description: "Curated vintage finds and modern sustainable fashion."
  },
  {
    id: 's3',
    name: "Steam & Bean",
    type: "Cafe",
    rating: 4.7,
    distance: "0.8 miles",
    image: PlaceHolderImages.find(img => img.id === 'cafe-shop')?.imageUrl || "",
    description: "Your local destination for specialty coffee and community vibes."
  },
  {
    id: 's4',
    name: "Clay Creations",
    type: "Pottery",
    rating: 5.0,
    distance: "1.5 miles",
    image: PlaceHolderImages.find(img => img.id === 'product-pottery')?.imageUrl || "",
    description: "Handcrafted ceramics made right here in the neighborhood."
  }
];

export default function ShopsPage() {
  const [search, setSearch] = useState("");

  const filteredShops = allShops.filter(shop => 
    shop.name.toLowerCase().includes(search.toLowerCase()) || 
    shop.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-headline">Local Shops</h1>
          <p className="text-muted-foreground text-lg">Support the independent creators in your community.</p>
        </div>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search by name or category..." 
            className="pl-10 h-12 rounded-full border-primary/20 shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredShops.map((shop) => (
          <Card key={shop.id} className="group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col sm:flex-row">
              <div className="relative w-full sm:w-1/3 aspect-square sm:aspect-auto sm:h-auto overflow-hidden">
                <Image
                  src={shop.image}
                  alt={shop.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <CardContent className="p-6 sm:w-2/3 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge variant="secondary" className="mb-2">{shop.type}</Badge>
                    <h3 className="text-2xl font-headline">{shop.name}</h3>
                  </div>
                  <div className="flex items-center text-amber-500 text-sm font-semibold">
                    <Star className="h-4 w-4 fill-current mr-1" /> {shop.rating}
                  </div>
                </div>
                <p className="text-muted-foreground text-sm line-clamp-2">
                  {shop.description}
                </p>
                <div className="flex items-center text-muted-foreground text-sm">
                  <MapPin className="h-4 w-4 mr-1 text-primary" /> {shop.distance} from you
                </div>
                <div className="pt-2">
                  <Button variant="outline" className="w-full sm:w-auto group">
                    Visit Shop <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>

      {filteredShops.length === 0 && (
        <div className="py-24 text-center">
          <p className="text-xl text-muted-foreground">No shops found matching your search.</p>
          <Button variant="link" onClick={() => setSearch("")}>Show all shops</Button>
        </div>
      )}
    </div>
  );
}

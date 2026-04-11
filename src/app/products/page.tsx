
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, SlidersHorizontal, ShoppingBag, Plus } from 'lucide-react';
import { useCart } from '@/components/cart-provider';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const allProducts = [
  { id: 'p1', name: "Handcrafted Ceramic Mug", shop: "Clay Creations", price: 240.0, category: "Home", image: PlaceHolderImages.find(img => img.id === 'product-pottery')?.imageUrl || "" },
  { id: 'p2', name: "Wildflower Honey", shop: "Bloom Bakery", price: 125.5, category: "Food", image: PlaceHolderImages.find(img => img.id === 'product-honey')?.imageUrl || "" },
  { id: 'p3', name: "Artisan Coffee Blend", shop: "Steam & Bean", price: 180.0, category: "Food", image: PlaceHolderImages.find(img => img.id === 'product-coffee')?.imageUrl || "" },
  { id: 'p4', name: "Sourdough Bread", shop: "Bloom Bakery", price: 80.0, category: "Food", image: PlaceHolderImages.find(img => img.id === 'bakery-shop')?.imageUrl || "" },
  { id: 'p5', name: "Vintage Denim Jacket", shop: "The Velvet Hanger", price: 650.0, category: "Clothing", image: PlaceHolderImages.find(img => img.id === 'boutique-shop')?.imageUrl || "" },
  { id: 'p6', name: "Silk Scarf", shop: "The Velvet Hanger", price: 320.0, category: "Clothing", image: "https://picsum.photos/seed/scarf/400" },
];

export default function ProductsPage() {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Food", "Clothing", "Home", "Jewelry"];

  const filteredProducts = allProducts.filter(p => 
    (selectedCategory === "All" || p.category === selectedCategory) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.shop.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAddToCart = (product: typeof allProducts[0]) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      shopName: product.shop,
      imageUrl: product.image
    });
    toast({
      title: "Added to cart!",
      description: `${product.name} from ${product.shop} has been added.`
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-headline">Discover Locally</h1>
          <p className="text-muted-foreground text-lg">Unique products from independent neighborhood shops.</p>
        </div>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search products or shops..." 
            className="pl-10 h-12 rounded-full border-primary/20 focus:ring-primary/20 shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-10 overflow-x-auto pb-2 scrollbar-hide">
        <Button variant="outline" size="sm" className="rounded-full gap-2">
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </Button>
        {categories.map(cat => (
          <Button 
            key={cat} 
            variant={selectedCategory === cat ? "default" : "secondary"}
            size="sm"
            className="rounded-full px-6"
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="group border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden flex flex-col h-full">
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3">
                <Badge className="bg-white/90 text-black hover:bg-white backdrop-blur-sm border-none shadow-sm">
                  {product.category}
                </Badge>
              </div>
              <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-colors" />
              <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                <Button 
                  className="w-full h-11 bg-primary text-white shadow-xl"
                  onClick={() => handleAddToCart(product)}
                >
                  Add to Cart <Plus className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardContent className="p-5 flex-grow flex flex-col justify-between">
              <div>
                <p className="text-primary text-[10px] font-bold uppercase tracking-widest mb-1">{product.shop}</p>
                <h3 className="text-lg font-headline line-clamp-2 mb-2 group-hover:text-primary transition-colors">{product.name}</h3>
              </div>
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-muted/30">
                <p className="text-2xl font-bold">₹{product.price.toFixed(2)}</p>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary">
                   <ShoppingBag className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="py-24 text-center">
          <p className="text-xl text-muted-foreground">No products found matching your search.</p>
          <Button variant="link" onClick={() => {setSearch(""); setSelectedCategory("All");}}>Clear all filters</Button>
        </div>
      )}
    </div>
  );
}

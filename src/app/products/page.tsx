"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, SlidersHorizontal, ShoppingBag, Plus, Loader2, Tag, Star, Eye } from 'lucide-react';
import { useCart } from '@/components/cart-provider';
import { useToast } from '@/hooks/use-toast';
import { getProducts } from '@/app/actions/product-actions';
import { Product } from '@/app/lib/types';
import { shops } from '@/lib/db';

export default function ProductsPage() {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      const data = await getProducts();
      setProducts(data);
      setIsLoading(false);
    }
    loadProducts();
  }, []);

  const categories = ["All", "Food", "Clothing", "Home", "Jewelry"];

  const filteredProducts = products.filter(p => {
    const shop = shops.find(s => s.id === p.shopId);
    return (selectedCategory === "All" || p.category === selectedCategory) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || (shop?.name.toLowerCase().includes(search.toLowerCase()) || ""));
  });

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    const shop = shops.find(s => s.id === product.shopId);
    const finalPrice = product.discountPrice || product.price;
    
    addToCart({
      id: product.id,
      name: product.name,
      price: finalPrice,
      quantity: 1,
      shopName: shop?.name || "Local Shop",
      imageUrl: product.imageUrl
    });
    
    toast({
      title: "Added to cart!",
      description: `${product.name} has been added.`
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

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading neighborhood treasures...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product) => {
            const shop = shops.find(s => s.id === product.shopId);
            const hasDiscount = product.discountPrice && product.discountPrice < product.price;
            
            return (
              <Card key={product.id} className="group border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden flex flex-col h-full relative">
                <Link href={`/products/${product.id}`} className="flex flex-col h-full">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      <Badge className="bg-white/90 text-black hover:bg-white backdrop-blur-sm border-none shadow-sm">
                        {product.category}
                      </Badge>
                      {hasDiscount && (
                        <Badge className="bg-accent text-white border-none shadow-sm flex items-center gap-1">
                          <Tag className="h-3 w-3" /> Sale
                        </Badge>
                      )}
                    </div>
                    {product.stockQuantity < 5 && (
                      <div className="absolute top-3 right-3">
                         <Badge variant="destructive" className="h-5 text-[10px]">Only {product.stockQuantity} Left</Badge>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-colors" />
                    
                    {/* Hover Actions */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[2px]">
                      <Button 
                        className="w-[80%] h-11 bg-primary text-white shadow-xl font-bold"
                        onClick={(e) => handleAddToCart(e, product)}
                        disabled={product.stockQuantity <= 0}
                      >
                        {product.stockQuantity > 0 ? (
                          <><ShoppingBag className="mr-2 h-4 w-4" /> Quick Add</>
                        ) : (
                          "Out of Stock"
                        )}
                      </Button>
                      <Button variant="secondary" className="w-[80%] h-11 font-bold">
                        <Eye className="mr-2 h-4 w-4" /> View Details
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-5 flex-grow flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-primary text-[10px] font-bold uppercase tracking-widest">{shop?.name || 'Local Shop'}</p>
                        {product.rating && (
                          <div className="flex items-center text-amber-500 text-[10px] font-bold">
                            <Star className="h-3 w-3 fill-current mr-0.5" /> {product.rating}
                          </div>
                        )}
                      </div>
                      <h3 className="text-lg font-headline line-clamp-2 mb-2 group-hover:text-primary transition-colors">{product.name}</h3>
                    </div>
                    <div className="flex flex-col mt-auto pt-4 border-t border-muted/30">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          {hasDiscount ? (
                            <>
                              <p className="text-2xl font-bold text-accent">₹{product.discountPrice?.toFixed(2)}</p>
                              <p className="text-sm text-muted-foreground line-through">₹{product.price.toFixed(2)}</p>
                            </>
                          ) : (
                            <p className="text-2xl font-bold">₹{product.price.toFixed(2)}</p>
                          )}
                        </div>
                        <div className="h-8 w-8 rounded-full border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                          <Eye className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            );
          })}
        </div>
      )}

      {!isLoading && filteredProducts.length === 0 && (
        <div className="py-24 text-center">
          <p className="text-xl text-muted-foreground">No products found matching your search.</p>
          <Button variant="link" onClick={() => {setSearch(""); setSelectedCategory("All");}}>Clear all filters</Button>
        </div>
      )}
    </div>
  );
}

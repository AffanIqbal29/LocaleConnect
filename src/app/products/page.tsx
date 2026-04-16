"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  SlidersHorizontal, 
  ShoppingBag, 
  Loader2, 
  Tag, 
  Star, 
  Eye, 
  XCircle,
  ChevronDown,
  Database
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCart } from '@/components/cart-provider';
import { useToast } from '@/hooks/use-toast';
import { Product, Shop } from '@/app/lib/types';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { getProducts, seedSampleData } from '@/app/actions/product-actions';

export default function ProductsPage() {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const db = useFirestore();
  
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [isSeeding, setIsSeeding] = useState(false);
  
  const [products, setProducts] = useState<Product[] | null>(null);
  const [productsLoading, setProductsLoading] = useState(true);

  // Use real-time listener for shops to keep UI in sync
  const shopsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'vendorProfiles');
  }, [db]);
  const { data: shops, isLoading: shopsLoading } = useCollection<Shop>(shopsQuery);

  const fetchProducts = async () => {
    if (!db) return;
    setProductsLoading(true);
    try {
      const data = await getProducts(db);
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setProductsLoading(false);
    }
  };

  // Refetch products when shops change or component mounts
  useEffect(() => {
    fetchProducts();
  }, [db, shops]);

  const categories = ["All", "Food", "Clothing", "Home", "Jewelry"];

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    let result = products.filter(p => {
      const shop = shops?.find(s => s.id === p.shopId);
      const categoryMatch = selectedCategory === "All" || p.category.toLowerCase() === selectedCategory.toLowerCase();
      const searchLower = search.toLowerCase();
      const nameMatch = p.name.toLowerCase().includes(searchLower);
      const shopMatch = shop?.name.toLowerCase().includes(searchLower) ?? false;
      const categoryTextMatch = p.category.toLowerCase().includes(searchLower);

      return categoryMatch && (nameMatch || shopMatch || categoryTextMatch);
    });

    if (sortBy === "price-low") {
      result.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    } else if (sortBy === "price-high") {
      result.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    } else if (sortBy === "rating") {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
      result.sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt : (a.createdAt as any)?.toDate?.() || new Date(a.createdAt);
        const dateB = b.createdAt instanceof Date ? b.createdAt : (b.createdAt as any)?.toDate?.() || new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
    }

    return result;
  }, [products, shops, search, selectedCategory, sortBy]);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    const shop = shops?.find(s => s.id === product.shopId);
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

  const handleSeedData = async () => {
    if (!db) return;
    setIsSeeding(true);
    try {
      await seedSampleData(db);
      toast({
        title: "Database Seeded!",
        description: "Initial neighborhood treasures have been added.",
      });
      // fetchProducts is triggered automatically by the useEffect listening to 'shops'
    } catch (err) {
      toast({
        title: "Seed Failed",
        description: "Could not add sample data.",
        variant: "destructive"
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("All");
    setSortBy("newest");
  };

  const isLoading = productsLoading && !products;

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
            placeholder="Search products, shops, or categories..." 
            className="pl-10 h-12 rounded-full border-primary/20 focus:ring-primary/20 shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button 
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
            >
              <XCircle className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
        <div className="flex flex-wrap items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <Button 
              key={cat} 
              variant={selectedCategory === cat ? "default" : "secondary"}
              size="sm"
              className="rounded-full px-6 transition-all"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-full gap-2">
              <SlidersHorizontal className="h-4 w-4" /> 
              Sort By
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Sort Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
              <DropdownMenuRadioItem value="newest">Newest Arrivals</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="price-low">Price: Low to High</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="price-high">Price: High to Low</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="rating">Top Rated</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading neighborhood treasures...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => {
              const shop = shops?.find(s => s.id === product.shopId);
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
                      
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[2px]">
                        <Button 
                          className="w-[80%] h-11 bg-primary text-white shadow-xl font-bold"
                          onClick={(e) => handleAddToCart(e, product)}
                          disabled={product.stockQuantity <= 0}
                        >
                          {product.stockQuantity > 0 ? (
                            <><ShoppingBag className="mr-2 h-4 w-4" /> Quick Add</>
                          ) : (
                            "Notify Me"
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
                          {product.rating !== undefined && (
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

          {(products?.length === 0 || filteredProducts.length === 0) && (
            <div className="py-32 text-center space-y-6">
              <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-headline">No neighborhood treasures found</h3>
              <p className="text-muted-foreground max-w-xs mx-auto text-sm">
                We couldn't find any products in the database. You can seed some sample data to see the marketplace in action.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button variant="outline" onClick={clearFilters} className="rounded-full">
                  Clear all filters
                </Button>
                
                <Button 
                  variant="default" 
                  onClick={handleSeedData} 
                  disabled={isSeeding}
                  className="rounded-full shadow-lg h-12 px-8"
                >
                  {isSeeding ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Database className="h-4 w-4 mr-2" />
                  )}
                  {isSeeding ? "Seeding..." : "Seed Sample Data"}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

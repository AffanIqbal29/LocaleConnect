
"use client";

import React, { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Star, 
  ShoppingBag, 
  ArrowLeft, 
  ShieldCheck, 
  Truck, 
  Store, 
  MessageSquare,
  Plus,
  Minus,
  Loader2
} from 'lucide-react';
import { useCart } from '@/components/cart-provider';
import { useToast } from '@/hooks/use-toast';
import { getProductById, getProducts, getReviewsByShopId } from '@/app/actions/product-actions';
import { getShopById } from '@/app/actions/shop-actions';
import { Product, Shop, Review } from '@/app/lib/types';
import { useFirestore } from '@/firebase';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const db = useFirestore();

  const [product, setProduct] = useState<Product | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    async function loadData() {
      if (!db) return;
      setIsLoading(true);
      try {
        const prod = await getProductById(db, id);
        if (prod) {
          setProduct(prod);
          const [shopData, reviewsData, allProducts] = await Promise.all([
            getShopById(db, prod.shopId),
            getReviewsByShopId(db, prod.shopId),
            getProducts(db)
          ]);
          setShop(shopData || null);
          setReviews(reviewsData);
          setSimilarProducts(allProducts.filter(p => p.category === prod.category && p.id !== prod.id).slice(0, 4));
        }
      } catch (err) {
        console.error("Error loading product detail:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id, db]);

  const handleAddToCart = () => {
    if (!product) return;
    const finalPrice = product.discountPrice || product.price;
    addToCart({
      id: product.id,
      name: product.name,
      price: finalPrice,
      quantity: quantity,
      shopName: shop?.name || "Local Shop",
      imageUrl: product.imageUrl
    });
    toast({
      title: "Added to cart!",
      description: `${quantity} x ${product.name} added.`
    });
  };

  const parseDate = (dateVal: any) => {
    if (!dateVal) return new Date();
    if (dateVal instanceof Date) return dateVal;
    if (typeof dateVal.toDate === 'function') return dateVal.toDate();
    return new Date(dateVal);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center space-y-6">
        <h1 className="text-4xl font-headline">Product Not Found</h1>
        <p className="text-muted-foreground">The item you are looking for doesn't exist or has been removed.</p>
        <Link href="/products">
          <Button variant="default">Back to Products</Button>
        </Link>
      </div>
    );
  }

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <Button 
        variant="ghost" 
        className="mb-8 gap-2 hover:bg-primary/10 hover:text-primary transition-colors"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        {/* Product Images */}
        <div className="space-y-6">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-muted shadow-2xl">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
            {hasDiscount && (
              <Badge className="absolute top-6 left-6 bg-accent text-white px-4 py-1.5 text-sm shadow-lg border-none">
                Special Offer
              </Badge>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Link href={`/shops`} className="text-primary font-bold uppercase tracking-widest text-xs hover:underline">
                {shop?.name || 'Local Shop'}
              </Link>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground text-xs">{product.category}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-headline leading-tight">{product.name}</h1>
            
            <div className="flex items-center gap-4 py-2">
              <div className="flex items-center text-amber-500 font-bold">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-5 w-5 ${i < Math.floor(product.rating || 0) ? "fill-current" : "text-muted"}`} 
                  />
                ))}
                <span className="ml-2 text-foreground">{product.rating || 0}</span>
              </div>
              <span className="text-muted-foreground text-sm">({reviews.length} Customer Reviews)</span>
            </div>
          </div>

          <div className="mt-8 space-y-1">
            {hasDiscount ? (
              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold text-accent">₹{product.discountPrice?.toFixed(2)}</span>
                <span className="text-xl text-muted-foreground line-through">₹{product.price.toFixed(2)}</span>
              </div>
            ) : (
              <span className="text-4xl font-bold">₹{product.price.toFixed(2)}</span>
            )}
            <p className="text-green-600 text-sm font-medium">In stock and ready for local delivery</p>
          </div>

          <p className="mt-8 text-muted-foreground leading-relaxed text-lg">
            {product.description}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center gap-6">
            <div className="flex items-center border-2 border-primary/20 rounded-full p-1 bg-white">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 rounded-full hover:bg-primary/10"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-bold text-lg">{quantity}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 rounded-full hover:bg-primary/10"
                onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              className="w-full sm:flex-1 h-14 text-lg font-bold shadow-xl shadow-primary/20"
              onClick={handleAddToCart}
              disabled={product.stockQuantity <= 0}
            >
              <ShoppingBag className="mr-2 h-5 w-5" /> Add to Cart
            </Button>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-muted/30 border border-muted flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-tighter">Fast Delivery</p>
                <p className="text-[10px] text-muted-foreground">Within neighborhood</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-muted/30 border border-muted flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-tighter">Local Trusted</p>
                <p className="text-[10px] text-muted-foreground">Artisan quality</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-24" />

      {/* Reviews Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="space-y-6">
          <h2 className="text-3xl font-headline flex items-center gap-3">
            <MessageSquare className="h-6 w-6 text-primary" /> Customer Reviews
          </h2>
          <div className="bg-primary/5 p-8 rounded-3xl space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-5xl font-bold">{product.rating || 0}</span>
              <div className="space-y-1">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating || 0) ? "fill-current" : "text-muted"}`} />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Based on {reviews.length} reviews</p>
              </div>
            </div>
            <Button variant="outline" className="w-full h-12 rounded-xl">Write a Review</Button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="border-b pb-8 last:border-0">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex text-amber-500 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < review.rating ? "fill-current" : "text-muted"}`} />
                      ))}
                    </div>
                    <p className="font-semibold">Local Neighbor</p>
                    <p className="text-xs text-muted-foreground">{parseDate(review.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className="text-muted-foreground italic leading-relaxed">"{review.comment}"</p>
              </div>
            ))
          ) : (
            <div className="py-12 text-center border-2 border-dashed rounded-3xl">
              <p className="text-muted-foreground">No reviews yet for this product. Be the first to share your experience!</p>
            </div>
          )}
        </div>
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <div className="mt-32 space-y-10">
          <div className="flex justify-between items-end">
            <div className="space-y-2">
              <h2 className="text-3xl font-headline">Similar Treasures</h2>
              <p className="text-muted-foreground">Other items in {product.category} you might love.</p>
            </div>
            <Link href="/products">
              <Button variant="link" className="text-primary font-bold">View All</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {similarProducts.map((p) => (
              <Link href={`/products/${p.id}`} key={p.id}>
                <Card className="group border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={p.imageUrl}
                      alt={p.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <h4 className="font-headline text-lg group-hover:text-primary transition-colors truncate">{p.name}</h4>
                    <p className="font-bold">₹{p.price.toFixed(2)}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

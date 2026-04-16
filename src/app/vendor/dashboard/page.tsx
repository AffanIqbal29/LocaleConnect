
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Store, 
  Package, 
  Wand2, 
  Settings, 
  Clock, 
  MapPin, 
  Smartphone,
  Trash2,
  Tag,
  Box,
  Loader2,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';
import { generateProductDescription } from '@/ai/flows/generate-product-description-flow';
import { generateShopProfileDescription } from '@/ai/flows/generate-shop-profile-description';
import { useToast } from '@/hooks/use-toast';
import { getProductsByShopId, addProduct, deleteProduct, updateProduct } from '@/app/actions/product-actions';
import { updateShopProfile, getShopByOwnerId, createInitialShop } from '@/app/actions/shop-actions';
import { Product, Shop } from '@/app/lib/types';
import { useFirestore, useUser } from '@/firebase';

export default function VendorDashboard() {
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('products');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [vendorProducts, setVendorProducts] = useState<Product[]>([]);
  const [shopInfo, setShopInfo] = useState<Shop | null>(null);

  const [newProductForm, setNewProductForm] = useState({
    name: "",
    price: "",
    discountPrice: "",
    stockQuantity: "10",
    keywords: "",
    details: "",
    description: "",
    category: "General",
    imageUrl: ""
  });

  useEffect(() => {
    async function loadData() {
      if (!db || !user) return;
      setIsLoading(true);
      try {
        let shop = await getShopByOwnerId(db, user.uid);
        
        // If no shop exists for this user, create an initial one
        if (!shop) {
          shop = await createInitialShop(db, user.uid, `${user.displayName}'s Shop`);
          toast({
            title: "Shop Initialized",
            description: "We've created a starter profile for your new shop!",
          });
        }
        
        setShopInfo(shop);
        const products = await getProductsByShopId(db, shop.id);
        setVendorProducts(products);
      } catch (error) {
        console.error("Dashboard data load error:", error);
        toast({
          title: "Connection Error",
          description: "Could not load shop details. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [db, user, toast]);

  const handleAiDescription = async () => {
    if (!newProductForm.name || !newProductForm.keywords) {
      toast({
        title: "Missing info",
        description: "Please enter a product name and some keywords first.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateProductDescription({
        productName: newProductForm.name,
        keywords: newProductForm.keywords.split(',').map(k => k.trim()),
        productDetails: newProductForm.details
      });
      setNewProductForm(prev => ({ ...prev, description: result.description }));
    } catch (error) {
      toast({ title: "AI Error", description: "Failed to generate description.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAiShopDescription = async () => {
    if (!shopInfo) return;
    setIsGenerating(true);
    try {
      const result = await generateShopProfileDescription({
        shopName: shopInfo.name,
        shopType: shopInfo.type,
        location: shopInfo.location,
        uniqueSellingPoints: ["Fresh daily", "Family owned", "Organic ingredients"]
      });
      setShopInfo(prev => prev ? ({ ...prev, description: result.shopDescription }) : null);
    } catch (error) {
      toast({ title: "AI Error", description: "Failed to generate shop description.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddProduct = async () => {
    if (!db || !user || !shopInfo) return;
    if (!newProductForm.name || !newProductForm.price) {
      toast({ title: "Validation", description: "Name and price are required.", variant: "destructive" });
      return;
    }

    try {
      const prod = await addProduct(db, {
        name: newProductForm.name,
        price: parseFloat(newProductForm.price),
        discountPrice: newProductForm.discountPrice ? parseFloat(newProductForm.discountPrice) : undefined,
        stockQuantity: parseInt(newProductForm.stockQuantity),
        description: newProductForm.description,
        category: newProductForm.category,
        imageUrl: newProductForm.imageUrl || undefined,
        shopId: shopInfo.id,
        ownerUserId: user.uid
      });
      setVendorProducts(prev => [...prev, prod]);
      setNewProductForm({ 
        name: "", 
        price: "", 
        discountPrice: "", 
        stockQuantity: "10", 
        keywords: "", 
        details: "", 
        description: "", 
        category: "General",
        imageUrl: ""
      });
      toast({ title: "Success", description: "Product added to your inventory." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to add product.", variant: "destructive" });
    }
  };

  const handleUpdateStock = async (id: string, newStock: number) => {
    if (!db || !shopInfo) return;
    const updated = await updateProduct(db, id, shopInfo.id, { stockQuantity: newStock });
    if (updated) {
      setVendorProducts(prev => prev.map(p => p.id === id ? updated : p));
    }
  };

  const handleDelete = async (id: string) => {
    if (!db || !shopInfo) return;
    const ok = await deleteProduct(db, id, shopInfo.id);
    if (ok) {
      setVendorProducts(prev => prev.filter(p => p.id !== id));
      toast({ title: "Deleted", description: "Product removed from inventory." });
    }
  };

  const handleSaveShop = async () => {
    if (!db || !shopInfo) return;
    await updateShopProfile(db, shopInfo.id, shopInfo);
    toast({ title: "Profile Updated", description: "Your shop details have been saved." });
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse font-medium tracking-wide uppercase text-xs">Syncing Shop Data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-headline mb-2">Vendor Dashboard</h1>
          <p className="text-muted-foreground">Manage {shopInfo?.name}&apos;s inventory and neighborhood presence.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium text-primary uppercase tracking-tighter">Shop Online</span>
        </div>
      </div>

      <Tabs defaultValue="products" value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full max-w-md grid-cols-3 bg-white border h-12 shadow-sm p-1">
          <TabsTrigger value="products" className="data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
            <Package className="h-4 w-4 mr-2" /> Inventory
          </TabsTrigger>
          <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
            <Store className="h-4 w-4 mr-2" /> Shop Profile
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
            <Settings className="h-4 w-4 mr-2" /> Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 shadow-sm border-none bg-white">
              <CardHeader>
                <CardTitle>Inventory Management</CardTitle>
                <CardDescription>Track stock levels and adjust your neighborhood offerings.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {vendorProducts.length > 0 ? vendorProducts.map((p) => (
                    <div key={p.id} className="py-6 flex items-center justify-between group">
                      <div className="flex items-center gap-6">
                        <div className="h-24 w-24 bg-muted rounded-2xl overflow-hidden relative shadow-inner border">
                           <Image 
                            src={p.imageUrl} 
                            alt={p.name} 
                            fill
                            className="object-cover"
                           />
                           {p.discountPrice && (
                             <div className="absolute top-0 right-0 bg-accent text-white p-1 rounded-bl-lg">
                               <Tag className="h-3 w-3" />
                             </div>
                           )}
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-headline text-xl">{p.name}</h4>
                          <div className="flex items-center gap-3">
                            {p.discountPrice ? (
                              <div className="flex items-center gap-2">
                                <span className="text-primary font-bold">₹{p.discountPrice.toFixed(2)}</span>
                                <span className="text-xs text-muted-foreground line-through">₹{p.price.toFixed(2)}</span>
                              </div>
                            ) : (
                              <span className="font-bold text-lg">₹{p.price.toFixed(2)}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                              <Box className="h-3 w-3" />
                              <span className={p.stockQuantity < 5 ? "text-destructive font-bold" : ""}>
                                {p.stockQuantity} in stock
                              </span>
                            </div>
                            {p.stockQuantity < 5 && (
                              <Badge variant="destructive" className="h-5 text-[9px] uppercase tracking-tighter">Low Stock</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-9 rounded-full px-4"
                            onClick={() => handleUpdateStock(p.id, p.stockQuantity + 5)}
                          >
                            Restock
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" 
                            onClick={() => handleDelete(p.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="py-24 text-center space-y-4">
                      <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed">
                        <Package className="h-10 w-10 text-muted-foreground/30" />
                      </div>
                      <h3 className="text-2xl font-headline">Empty Store Front</h3>
                      <p className="text-muted-foreground max-w-xs mx-auto text-sm">
                        You haven&apos;t added any products to your shop yet. Use the form to list your first treasure!
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-2xl border-primary/20 h-fit sticky top-24 bg-white overflow-hidden">
              <div className="bg-primary/5 p-6 border-b border-primary/10">
                <CardTitle className="flex items-center gap-2 text-2xl font-headline">
                  <Plus className="h-6 w-6 text-primary" /> List New Product
                </CardTitle>
                <CardDescription>Add a new unique item to your neighborhood catalog.</CardDescription>
              </div>
              <CardContent className="p-6 space-y-6">
                {/* Image Preview Area */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Product Preview</Label>
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-muted border-2 border-dashed border-primary/20 flex items-center justify-center group">
                    {newProductForm.imageUrl ? (
                      <Image 
                        src={newProductForm.imageUrl} 
                        alt="Preview" 
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="text-center space-y-2">
                        <ImageIcon className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Enter URL for preview</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Basic Information</Label>
                    <Input 
                      placeholder="Product Name (e.g., Artisanal Sourdough)" 
                      className="h-11"
                      value={newProductForm.name}
                      onChange={(e) => setNewProductForm({...newProductForm, name: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Price (₹)</Label>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        className="h-11"
                        value={newProductForm.price}
                        onChange={(e) => setNewProductForm({...newProductForm, price: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Stock Level</Label>
                      <Input 
                        type="number" 
                        placeholder="10" 
                        className="h-11"
                        value={newProductForm.stockQuantity}
                        onChange={(e) => setNewProductForm({...newProductForm, stockQuantity: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Image URL</Label>
                    <Input 
                      placeholder="https://..." 
                      className="h-11 text-xs font-mono"
                      value={newProductForm.imageUrl}
                      onChange={(e) => setNewProductForm({...newProductForm, imageUrl: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2 pt-2 border-t border-primary/5">
                    <div className="flex justify-between items-center mb-1">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">AI Description</Label>
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="sm" 
                        onClick={handleAiDescription}
                        disabled={isGenerating}
                        className="h-7 text-[10px] font-bold uppercase tracking-tighter bg-primary/5 text-primary hover:bg-primary/10"
                      >
                        {isGenerating ? "Thinking..." : <><Wand2 className="h-3 w-3 mr-1" /> Magic Write</>}
                      </Button>
                    </div>
                    <Input 
                      placeholder="Keywords (e.g. crusty, organic, wheat)" 
                      className="h-10 text-xs mb-2"
                      value={newProductForm.keywords}
                      onChange={(e) => setNewProductForm({...newProductForm, keywords: e.target.value})}
                    />
                    <Textarea 
                      placeholder="Detailed product story..." 
                      className="min-h-[100px] text-sm resize-none"
                      value={newProductForm.description}
                      onChange={(e) => setNewProductForm({...newProductForm, description: e.target.value})}
                    />
                  </div>
                </div>
                <Button className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20 rounded-2xl" onClick={handleAddProduct}>
                  List Product Locally
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profile" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <Card className="shadow-sm border-none bg-white">
            <CardHeader>
              <CardTitle>Shop Front Presentation</CardTitle>
              <CardDescription>How neighbors see your business in the marketplace.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {shopInfo ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Business Name</Label>
                      <Input className="h-11" value={shopInfo.name} onChange={(e) => setShopInfo({...shopInfo, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Category</Label>
                      <Input className="h-11" value={shopInfo.type} onChange={(e) => setShopInfo({...shopInfo, type: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Shop Biography</Label>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleAiShopDescription}
                        disabled={isGenerating}
                        className="h-7 text-[10px] font-bold uppercase tracking-tighter text-primary hover:bg-primary/10"
                      >
                        <Wand2 className="h-3 w-3 mr-1" /> AI Refresh
                      </Button>
                    </div>
                    <Textarea 
                      className="min-h-[200px] text-sm leading-relaxed resize-none p-4" 
                      value={shopInfo.description}
                      onChange={(e) => setShopInfo({...shopInfo, description: e.target.value})}
                    />
                  </div>
                  <Button className="w-full h-12 font-bold" onClick={handleSaveShop}>Sync Storefront</Button>
                </>
              ) : (
                <div className="p-20 text-center space-y-4 border-2 border-dashed rounded-3xl">
                  <Store className="h-12 w-12 text-muted-foreground/20 mx-auto" />
                  <p className="text-muted-foreground font-medium">Initializing shop profile...</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm border-none bg-white">
            <CardHeader>
              <CardTitle>Logistics & Presence</CardTitle>
              <CardDescription>Manage your physical location and availability.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
               {shopInfo && (
                 <div className="space-y-6">
                  <div className="flex items-center gap-5 p-4 bg-muted/30 rounded-2xl border border-muted">
                    <div className="bg-primary/10 p-3 rounded-full text-primary shadow-sm"><MapPin className="h-6 w-6" /></div>
                    <div className="flex-1">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Location</Label>
                      <Input className="h-10 border-none bg-transparent p-0 focus-visible:ring-0 text-base font-medium" value={shopInfo.location} onChange={(e) => setShopInfo({...shopInfo, location: e.target.value})} />
                    </div>
                  </div>
                  <div className="flex items-center gap-5 p-4 bg-muted/30 rounded-2xl border border-muted">
                    <div className="bg-primary/10 p-3 rounded-full text-primary shadow-sm"><Clock className="h-6 w-6" /></div>
                    <div className="flex-1">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Opening Hours</Label>
                      <Input className="h-10 border-none bg-transparent p-0 focus-visible:ring-0 text-base font-medium" value={shopInfo.hours} onChange={(e) => setShopInfo({...shopInfo, hours: e.target.value})} />
                    </div>
                  </div>
                  <div className="flex items-center gap-5 p-4 bg-muted/30 rounded-2xl border border-muted">
                    <div className="bg-primary/10 p-3 rounded-full text-primary shadow-sm"><Smartphone className="h-6 w-6" /></div>
                    <div className="flex-1">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Direct Contact</Label>
                      <Input className="h-10 border-none bg-transparent p-0 focus-visible:ring-0 text-base font-medium" placeholder="+91 98765 43210" />
                    </div>
                  </div>
                </div>
               )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="border-none bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Merchant Settings</CardTitle>
              <CardDescription>Payouts, notifications, and advanced configurations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4 p-5 border rounded-2xl bg-amber-50/50 border-amber-100">
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-amber-900">Payment Integration Preview</p>
                  <p className="text-sm text-amber-800/80 leading-relaxed">Your shop is currently in prototype mode. Sales will be recorded but not actually charged to cards.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-14 rounded-2xl border-dashed">Connect Bank Account</Button>
                <Button variant="outline" className="h-14 rounded-2xl border-dashed">Configure Tax Rates</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

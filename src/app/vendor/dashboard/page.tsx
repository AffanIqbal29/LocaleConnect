
"use client";

import React, { useState, useEffect } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { generateProductDescription } from '@/ai/flows/generate-product-description-flow';
import { generateShopProfileDescription } from '@/ai/flows/generate-shop-profile-description';
import { useToast } from '@/hooks/use-toast';
import { getProducts, addProduct, deleteProduct, updateProduct } from '@/app/actions/product-actions';
import { updateShopProfile, getShopById } from '@/app/actions/shop-actions';
import { Product, Shop } from '@/app/lib/types';
import { useFirestore } from '@/firebase';

export default function VendorDashboard() {
  const { toast } = useToast();
  const db = useFirestore();
  const [activeTab, setActiveTab] = useState('products');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [vendorProducts, setVendorProducts] = useState<Product[]>([]);

  // Shop state (hardcoded to s1 for demo)
  const [shopInfo, setShopInfo] = useState<Shop | null>(null);

  // Product form state
  const [newProductForm, setNewProductForm] = useState({
    name: "",
    price: "",
    discountPrice: "",
    stockQuantity: "10",
    keywords: "",
    details: "",
    description: "",
    category: "General"
  });

  useEffect(() => {
    async function loadData() {
      if (!db) return;
      setIsLoading(true);
      try {
        const [allProducts, shop] = await Promise.all([
          getProducts(db),
          getShopById(db, 's1')
        ]);
        setVendorProducts(allProducts.filter(p => p.shopId === 's1'));
        if (shop) setShopInfo(shop);
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
  }, [db, toast]);

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
    if (!db) return;
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
        shopId: 's1'
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
        category: "General" 
      });
      toast({ title: "Success", description: "Product added to your inventory." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to add product.", variant: "destructive" });
    }
  };

  const handleUpdateStock = async (id: string, newStock: number) => {
    if (!db) return;
    const updated = await updateProduct(db, id, { stockQuantity: newStock });
    if (updated) {
      setVendorProducts(prev => prev.map(p => p.id === id ? updated : p));
    }
  };

  const handleDelete = async (id: string) => {
    if (!db) return;
    const ok = await deleteProduct(db, id);
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
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-headline mb-2">Vendor Dashboard</h1>
          <p className="text-muted-foreground">Manage your neighborhood shop and inventory levels.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium text-primary">Store Front Active</span>
        </div>
      </div>

      <Tabs defaultValue="products" value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full max-w-md grid-cols-3 bg-white border h-12 shadow-sm">
          <TabsTrigger value="products" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <Package className="h-4 w-4 mr-2" /> Inventory
          </TabsTrigger>
          <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <Store className="h-4 w-4 mr-2" /> Shop Profile
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <Settings className="h-4 w-4 mr-2" /> Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 shadow-sm">
              <CardHeader>
                <CardTitle>Product Management</CardTitle>
                <CardDescription>Monitor stock and adjust pricing for your customers.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {vendorProducts.map((p) => (
                    <div key={p.id} className="py-6 flex items-center justify-between group">
                      <div className="flex items-center gap-6">
                        <div className="h-20 w-20 bg-muted rounded-xl overflow-hidden relative shadow-inner">
                           <img 
                            src={p.imageUrl} 
                            alt={p.name} 
                            className="object-cover h-full w-full"
                           />
                           {p.discountPrice && (
                             <div className="absolute top-0 right-0 bg-accent text-white p-1 rounded-bl-lg">
                               <Tag className="h-3 w-3" />
                             </div>
                           )}
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-semibold text-lg">{p.name}</h4>
                          <div className="flex items-center gap-3">
                            {p.discountPrice ? (
                              <div className="flex items-center gap-2">
                                <span className="text-primary font-bold">₹{p.discountPrice.toFixed(2)}</span>
                                <span className="text-xs text-muted-foreground line-through">₹{p.price.toFixed(2)}</span>
                                <Badge variant="outline" className="text-[10px] text-accent border-accent">Discount Active</Badge>
                              </div>
                            ) : (
                              <span className="font-medium">₹{p.price.toFixed(2)}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Box className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className={p.stockQuantity < 5 ? "text-destructive font-bold" : "text-muted-foreground"}>
                                {p.stockQuantity} in stock
                              </span>
                            </div>
                            {p.stockQuantity < 5 && (
                              <Badge variant="destructive" className="h-5 text-[10px]">Low Stock</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8"
                            onClick={() => handleUpdateStock(p.id, p.stockQuantity + 5)}
                          >
                            Restock
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:bg-destructive/10" 
                            onClick={() => handleDelete(p.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {vendorProducts.length === 0 && (
                    <div className="py-12 text-center space-y-3">
                      <Package className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                      <p className="text-muted-foreground italic">Your inventory is currently empty.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-primary/20 h-fit sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" /> New Product
                </CardTitle>
                <CardDescription>List a new item from your shop.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Product Name</Label>
                  <Input 
                    placeholder="e.g., Artisanal Sourdough" 
                    value={newProductForm.name}
                    onChange={(e) => setNewProductForm({...newProductForm, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Regular Price (₹)</Label>
                    <Input 
                      type="number" 
                      placeholder="0.00" 
                      value={newProductForm.price}
                      onChange={(e) => setNewProductForm({...newProductForm, price: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Stock Qty</Label>
                    <Input 
                      type="number" 
                      placeholder="10" 
                      value={newProductForm.stockQuantity}
                      onChange={(e) => setNewProductForm({...newProductForm, stockQuantity: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5 text-accent">
                    <Tag className="h-3.5 w-3.5" /> Sale Price (Optional)
                  </Label>
                  <Input 
                    type="number" 
                    placeholder="Discounted price" 
                    value={newProductForm.discountPrice}
                    onChange={(e) => setNewProductForm({...newProductForm, discountPrice: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex justify-between">
                    AI Keywords 
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Powered by Genkit</span>
                  </Label>
                  <Input 
                    placeholder="handmade, local, crusty..." 
                    value={newProductForm.keywords}
                    onChange={(e) => setNewProductForm({...newProductForm, keywords: e.target.value})}
                  />
                </div>
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center">
                    <Label>Description</Label>
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm" 
                      onClick={handleAiDescription}
                      disabled={isGenerating}
                      className="text-[10px] h-7 bg-primary/5 text-primary border-primary/20 hover:bg-primary/10"
                    >
                      {isGenerating ? "Thinking..." : <><Wand2 className="h-3 w-3 mr-1" /> Magic Write</>}
                    </Button>
                  </div>
                  <Textarea 
                    placeholder="Tell your customers about this item..." 
                    className="min-h-[100px] text-sm"
                    value={newProductForm.description}
                    onChange={(e) => setNewProductForm({...newProductForm, description: e.target.value})}
                  />
                </div>
                <Button className="w-full h-12 mt-4 shadow-xl" onClick={handleAddProduct}>Add to Shop</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profile" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Shop Front Details</CardTitle>
              <CardDescription>Customize your shop's appearance in the marketplace.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {shopInfo ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Shop Name</Label>
                      <Input value={shopInfo.name} onChange={(e) => setShopInfo({...shopInfo, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Shop Type</Label>
                      <Input value={shopInfo.type} onChange={(e) => setShopInfo({...shopInfo, type: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex justify-between items-center">
                      About Your Shop
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleAiShopDescription}
                        disabled={isGenerating}
                        className="text-[10px] text-primary hover:bg-primary/10"
                      >
                        <Wand2 className="h-3 w-3 mr-1" /> Refresh AI Bio
                      </Button>
                    </Label>
                    <Textarea 
                      className="min-h-[150px] text-sm leading-relaxed" 
                      value={shopInfo.description}
                      onChange={(e) => setShopInfo({...shopInfo, description: e.target.value})}
                    />
                  </div>
                  <Button className="w-full" onClick={handleSaveShop}>Save Changes</Button>
                </>
              ) : (
                <div className="p-12 text-center space-y-4 border-2 border-dashed rounded-xl">
                  <Store className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                  <p className="text-muted-foreground">No shop profile found. Create one to get started.</p>
                  <Button variant="outline">Initialize Shop</Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Logistics & Availability</CardTitle>
              <CardDescription>Manage your physical store presence.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               {shopInfo && (
                 <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-2 rounded-full text-primary"><MapPin className="h-5 w-5" /></div>
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">Store Address</Label>
                      <Input value={shopInfo.location} onChange={(e) => setShopInfo({...shopInfo, location: e.target.value})} />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-2 rounded-full text-primary"><Clock className="h-5 w-5" /></div>
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">Operating Hours</Label>
                      <Input value={shopInfo.hours} onChange={(e) => setShopInfo({...shopInfo, hours: e.target.value})} />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-2 rounded-full text-primary"><Smartphone className="h-5 w-5" /></div>
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">Contact Phone</Label>
                      <Input placeholder="+91 98765 43210" />
                    </div>
                  </div>
                </div>
               )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Business Settings</CardTitle>
              <CardDescription>Manage payouts and neighborhood notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-4 border rounded-xl bg-muted/20">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <p className="text-sm">Payment integration is in preview. Your earnings will be tracked and cleared weekly.</p>
              </div>
              <Button variant="outline">Connect Bank Account</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Edit,
  Loader2
} from 'lucide-react';
import { generateProductDescription } from '@/ai/flows/generate-product-description-flow';
import { generateShopProfileDescription } from '@/ai/flows/generate-shop-profile-description';
import { useToast } from '@/hooks/use-toast';
import { getProducts, addProduct, deleteProduct } from '@/app/actions/product-actions';
import { updateShopProfile, getShopById } from '@/app/actions/shop-actions';
import { Product, Shop } from '@/app/lib/types';

export default function VendorDashboard() {
  const { toast } = useToast();
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
    keywords: "",
    details: "",
    description: "",
    category: "General"
  });

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const [allProducts, shop] = await Promise.all([
        getProducts(),
        getShopById('s1')
      ]);
      setVendorProducts(allProducts.filter(p => p.shopId === 's1'));
      if (shop) setShopInfo(shop);
      setIsLoading(false);
    }
    loadData();
  }, []);

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
    if (!newProductForm.name || !newProductForm.price) {
      toast({ title: "Validation", description: "Name and price are required.", variant: "destructive" });
      return;
    }

    try {
      const prod = await addProduct({
        name: newProductForm.name,
        price: parseFloat(newProductForm.price),
        description: newProductForm.description,
        category: newProductForm.category,
        shopId: 's1'
      });
      setVendorProducts(prev => [...prev, prod]);
      setNewProductForm({ name: "", price: "", keywords: "", details: "", description: "", category: "General" });
      toast({ title: "Success", description: "Product added to your shop." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to add product.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await deleteProduct(id);
    if (ok) {
      setVendorProducts(prev => prev.filter(p => p.id !== id));
      toast({ title: "Deleted", description: "Product removed." });
    }
  };

  const handleSaveShop = async () => {
    if (!shopInfo) return;
    await updateShopProfile(shopInfo.id, shopInfo);
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
          <p className="text-muted-foreground">Manage your shop and connect with your local customers.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium text-primary">Shop Online</span>
        </div>
      </div>

      <Tabs defaultValue="products" value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full max-w-md grid-cols-3 bg-white border h-12 shadow-sm">
          <TabsTrigger value="products" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <Package className="h-4 w-4 mr-2" /> Products
          </TabsTrigger>
          <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <Store className="h-4 w-4 mr-2" /> Profile
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <Settings className="h-4 w-4 mr-2" /> Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Current Products</CardTitle>
                  <CardDescription>Manage your store inventory.</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {vendorProducts.map((p) => (
                    <div key={p.id} className="py-4 flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 bg-muted rounded-md overflow-hidden relative">
                           <img 
                            src={p.imageUrl} 
                            alt={p.name} 
                            className="object-cover h-full w-full"
                           />
                        </div>
                        <div>
                          <h4 className="font-semibold">{p.name}</h4>
                          <p className="text-sm text-muted-foreground">₹{p.price.toFixed(2)} • {p.stockQuantity} in stock</p>
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
                  {vendorProducts.length === 0 && <p className="py-8 text-center text-muted-foreground">No products added yet.</p>}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" /> New Product
                </CardTitle>
                <CardDescription>Add a product to your catalog.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Product Name</Label>
                  <Input 
                    placeholder="e.g., Organic Honey" 
                    value={newProductForm.name}
                    onChange={(e) => setNewProductForm({...newProductForm, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price (₹)</Label>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    value={newProductForm.price}
                    onChange={(e) => setNewProductForm({...newProductForm, price: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex justify-between">
                    Keywords 
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">AI Ready</span>
                  </Label>
                  <Input 
                    placeholder="local, organic, sweet..." 
                    value={newProductForm.keywords}
                    onChange={(e) => setNewProductForm({...newProductForm, keywords: e.target.value})}
                  />
                </div>
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center">
                    <Label>Product Description</Label>
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm" 
                      onClick={handleAiDescription}
                      disabled={isGenerating}
                      className="text-[10px] h-7 bg-primary/5 text-primary border-primary/20 hover:bg-primary/10"
                    >
                      {isGenerating ? "Magic..." : <><Wand2 className="h-3 w-3 mr-1" /> Generate with AI</>}
                    </Button>
                  </div>
                  <Textarea 
                    placeholder="Describe your product..." 
                    className="min-h-[120px]"
                    value={newProductForm.description}
                    onChange={(e) => setNewProductForm({...newProductForm, description: e.target.value})}
                  />
                </div>
                <Button className="w-full h-12 mt-4 shadow-lg" onClick={handleAddProduct}>Add Product</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profile" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Shop Details</CardTitle>
              <CardDescription>Update how customers see your store.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {shopInfo && (
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
                      Shop Description
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleAiShopDescription}
                        disabled={isGenerating}
                        className="text-[10px] text-primary hover:bg-primary/10"
                      >
                        <Wand2 className="h-3 w-3 mr-1" /> Refresh with AI
                      </Button>
                    </Label>
                    <Textarea 
                      className="min-h-[150px]" 
                      value={shopInfo.description}
                      onChange={(e) => setShopInfo({...shopInfo, description: e.target.value})}
                    />
                  </div>
                </>
              )}
              <Button className="w-full" onClick={handleSaveShop}>Save Profile Changes</Button>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Location & Contact</CardTitle>
              <CardDescription>Help customers find and reach you.</CardDescription>
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
                      <Label className="text-xs text-muted-foreground">Opening Hours</Label>
                      <Input value={shopInfo.hours} onChange={(e) => setShopInfo({...shopInfo, hours: e.target.value})} />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-2 rounded-full text-primary"><Smartphone className="h-5 w-5" /></div>
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">Contact Phone</Label>
                      <Input placeholder="+91 00000 00000" />
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
              <CardTitle>Vendor Settings</CardTitle>
              <CardDescription>Manage your account and preferences.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground italic">Payment integration and delivery region settings are being finalized.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

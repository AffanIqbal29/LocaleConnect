
"use client";

import React, { useState } from 'react';
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
  Edit
} from 'lucide-react';
import { generateProductDescription } from '@/ai/flows/generate-product-description-flow';
import { generateShopProfileDescription } from '@/ai/flows/generate-shop-profile-description';
import { useToast } from '@/hooks/use-toast';

export default function VendorDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('products');
  const [isGenerating, setIsGenerating] = useState(false);

  // Shop state
  const [shopInfo, setShopInfo] = useState({
    name: "Bloom Bakery",
    type: "Bakery",
    location: "123 Maple St, Old Town",
    description: "Our little neighborhood bakery specializing in sourdough and sweet treats.",
    hours: "8 AM - 6 PM",
  });

  // Product form state
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    keywords: "",
    details: "",
    description: ""
  });

  const handleAiDescription = async () => {
    if (!newProduct.name || !newProduct.keywords) {
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
        productName: newProduct.name,
        keywords: newProduct.keywords.split(',').map(k => k.trim()),
        productDetails: newProduct.details
      });
      setNewProduct(prev => ({ ...prev, description: result.description }));
    } catch (error) {
      toast({ title: "AI Error", description: "Failed to generate description.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAiShopDescription = async () => {
    setIsGenerating(true);
    try {
      const result = await generateShopProfileDescription({
        shopName: shopInfo.name,
        shopType: shopInfo.type,
        location: shopInfo.location,
        uniqueSellingPoints: ["Fresh daily", "Family owned", "Organic ingredients"]
      });
      setShopInfo(prev => ({ ...prev, description: result.shopDescription }));
    } catch (error) {
      toast({ title: "AI Error", description: "Failed to generate shop description.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

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
                <Button size="sm" variant="outline" className="text-xs h-8">
                  <Plus className="h-4 w-4 mr-1" /> Add Batch
                </Button>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="py-4 flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 bg-muted rounded-md overflow-hidden relative">
                           <img 
                            src={`https://picsum.photos/seed/prod${i}/100`} 
                            alt="Product" 
                            className="object-cover h-full w-full"
                           />
                        </div>
                        <div>
                          <h4 className="font-semibold">Product Item #{i}</h4>
                          <p className="text-sm text-muted-foreground">₹120.00 • 15 in stock</p>
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
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
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price (₹)</Label>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex justify-between">
                    Keywords 
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">AI Ready</span>
                  </Label>
                  <Input 
                    placeholder="local, organic, sweet..." 
                    value={newProduct.keywords}
                    onChange={(e) => setNewProduct({...newProduct, keywords: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Additional Details</Label>
                  <Textarea 
                    placeholder="Any specific features..." 
                    className="min-h-[80px]"
                    value={newProduct.details}
                    onChange={(e) => setNewProduct({...newProduct, details: e.target.value})}
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
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  />
                </div>
                <Button className="w-full h-12 mt-4 shadow-lg">Add Product</Button>
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
              <Button className="w-full">Save Profile Changes</Button>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Location & Contact</CardTitle>
              <CardDescription>Help customers find and reach you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
              <div className="pt-6">
                <h4 className="font-semibold mb-3 text-sm">Shop Media</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="aspect-square bg-muted rounded-md flex items-center justify-center border-2 border-dashed border-muted-foreground/20 cursor-pointer hover:bg-muted/80 transition-colors">
                    <Plus className="h-6 w-6 text-muted-foreground/40" />
                  </div>
                  <div className="aspect-square bg-muted rounded-md relative overflow-hidden group">
                     <img src="https://picsum.photos/seed/locale2/200" className="object-cover h-full w-full" />
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Trash2 className="h-5 w-5 text-white" />
                     </div>
                  </div>
                </div>
              </div>
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
              <p className="text-muted-foreground italic">Coming soon: Payment integration and delivery region settings.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

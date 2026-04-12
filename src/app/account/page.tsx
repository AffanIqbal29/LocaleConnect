"use client";

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Package, MapPin, CreditCard, Shield, ExternalLink } from 'lucide-react';

export default function AccountPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex justify-between items-end mb-8">
        <h1 className="text-4xl font-headline">My Account</h1>
        <Link href="/orders">
          <Button variant="link" className="text-primary font-bold">
            Full Order History <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-white border h-12 w-full justify-start p-1 shadow-sm">
          <TabsTrigger value="profile" className="flex-1 sm:flex-none"><User className="h-4 w-4 mr-2" /> Profile</TabsTrigger>
          <TabsTrigger value="orders" className="flex-1 sm:flex-none"><Package className="h-4 w-4 mr-2" /> Orders</TabsTrigger>
          <TabsTrigger value="addresses" className="flex-1 sm:flex-none"><MapPin className="h-4 w-4 mr-2" /> Addresses</TabsTrigger>
          <TabsTrigger value="payment" className="flex-1 sm:flex-none"><CreditCard className="h-4 w-4 mr-2" /> Payment</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details and how we contact you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input defaultValue="Alex" />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input defaultValue="Neighbor" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input defaultValue="alex@example.com" />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input defaultValue="+91 98765 43210" />
              </div>
              <Button className="mt-4 shadow-lg">Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>View and track your most recent neighborhood purchases.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 space-y-6">
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <p className="text-muted-foreground">Manage your orders and track local deliveries in real-time.</p>
                </div>
                <Link href="/orders">
                  <Button variant="outline" className="rounded-full shadow-sm">Go to My Orders</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addresses">
           <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Shipping Addresses</CardTitle>
              <CardDescription>Manage your delivery locations for local shipping.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-xl p-5 flex justify-between items-start bg-muted/20">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold">Home</span>
                    <span className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded uppercase font-bold">Default</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">123 Neighborhood Way<br />Your Town, ST 12345</p>
                </div>
                <Button variant="ghost" size="sm" className="h-8 text-primary font-bold">Edit</Button>
              </div>
              <Button variant="outline" className="w-full mt-4 h-12 border-dashed rounded-xl">Add New Address</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Manage your saved cards and payment preferences.</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="text-center py-12 space-y-4">
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <Shield className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">Your financial data is protected and never stored on our servers.</p>
                <Button variant="outline" className="rounded-full">Add Payment Method</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

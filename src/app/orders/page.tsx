"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ShoppingBag,
  MapPin,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { getOrdersByCustomerId } from '@/app/actions/order-actions';
import { Order } from '@/app/lib/types';
import { useAuth } from '@/components/auth-provider';

type OrderWithShop = Order & { shopName: string };

export default function MyOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderWithShop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      if (user) {
        setIsLoading(true);
        const data = await getOrdersByCustomerId(user.uid);
        setOrders(data as OrderWithShop[]);
        setIsLoading(false);
      }
    }
    loadOrders();
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'processing': return <Clock className="h-4 w-4 text-amber-500" />;
      case 'pending': return <Package className="h-4 w-4 text-blue-500" />;
      default: return <Truck className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'processing': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'pending': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Retrieving your order history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-headline">My Orders</h1>
          <p className="text-muted-foreground">Track and manage your neighborhood purchases.</p>
        </div>
        <Link href="/products">
          <Button variant="outline" className="rounded-full">
            <ShoppingBag className="mr-2 h-4 w-4" /> Shop More
          </Button>
        </Link>
      </div>

      {orders.length === 0 ? (
        <Card className="border-dashed border-2 py-20">
          <CardContent className="flex flex-col items-center gap-4 text-center">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-semibold">No orders found</h3>
              <p className="text-muted-foreground">You haven't placed any orders with our local partners yet.</p>
            </div>
            <Link href="/products" className="mt-4">
              <Button>Discover Local Products</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((order) => (
            <Card key={order.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow border-none">
              <div className="bg-muted/30 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Order Date</p>
                    <p className="text-sm font-semibold">{new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Total</p>
                    <p className="text-sm font-bold text-primary">₹{order.totalAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Order #</p>
                    <p className="text-sm font-mono text-muted-foreground uppercase">{order.id}</p>
                  </div>
                </div>
                <Badge className={`${getStatusColor(order.status)} border px-3 py-1 flex items-center gap-2 capitalize`}>
                  {getStatusIcon(order.status)} {order.status}
                </Badge>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 space-y-4">
                    <div className="flex items-center gap-2 text-primary">
                      <Store className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">{order.shopName}</span>
                    </div>
                    <div className="space-y-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center group">
                          <div className="flex items-center gap-3">
                            <span className="h-8 w-8 rounded bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                              {item.quantity}x
                            </span>
                            <span className="font-medium text-sm">{item.name}</span>
                          </div>
                          <span className="text-sm font-semibold">₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
                      <h4 className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Truck className="h-3 w-3" /> Delivery Detail
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-3.5 w-3.5 text-primary mt-0.5" />
                          <p className="text-xs text-muted-foreground">Standard Local Delivery</p>
                        </div>
                        <Separator className="bg-primary/10" />
                        <p className="text-[10px] leading-relaxed italic text-muted-foreground/80">
                          {order.status === 'completed' 
                            ? "This order was delivered by a neighborhood partner." 
                            : "Your neighbor partner is currently preparing your unique treasures for local transit."}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" className="w-full justify-between text-xs font-bold group" size="sm">
                      View Order Receipt <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

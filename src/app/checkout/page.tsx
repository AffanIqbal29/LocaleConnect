
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/cart-provider';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  CreditCard, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Loader2,
  Smartphone,
  Truck
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type CheckoutStep = 'address' | 'payment' | 'review';

export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  
  const [step, setStep] = useState<CheckoutStep>('address');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [address, setAddress] = useState({
    fullName: user?.displayName || '',
    street: '',
    city: '',
    state: '',
    zip: '',
    phone: ''
  });
  
  const [paymentMethod, setPaymentMethod] = useState('card');

  const handleNext = () => {
    if (step === 'address') {
      if (!address.street || !address.city || !address.zip) {
        toast({ title: "Missing Info", description: "Please provide complete address details.", variant: "destructive" });
        return;
      }
      setStep('payment');
    } else if (step === 'payment') {
      setStep('review');
    }
  };

  const handleBack = () => {
    if (step === 'payment') setStep('address');
    if (step === 'review') setStep('payment');
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Payment Successful",
      description: "Your order has been confirmed with our local partners.",
    });

    clearCart();
    router.push('/checkout/success');
  };

  if (items.length === 0 && !isProcessing) {
    router.push('/cart');
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-headline mb-10">Checkout</h1>

      {/* Progress Stepper */}
      <div className="flex items-center justify-between mb-12 max-w-2xl mx-auto">
        <div className={`flex flex-col items-center gap-2 ${step === 'address' ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 ${step === 'address' ? 'border-primary bg-primary/10' : 'border-muted'}`}>
            <MapPin className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-tighter">Address</span>
        </div>
        <div className="h-[2px] flex-1 bg-muted mx-4" />
        <div className={`flex flex-col items-center gap-2 ${step === 'payment' ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 ${step === 'payment' ? 'border-primary bg-primary/10' : 'border-muted'}`}>
            <CreditCard className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-tighter">Payment</span>
        </div>
        <div className="h-[2px] flex-1 bg-muted mx-4" />
        <div className={`flex flex-col items-center gap-2 ${step === 'review' ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 ${step === 'review' ? 'border-primary bg-primary/10' : 'border-muted'}`}>
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-tighter">Confirm</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          {step === 'address' && (
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Delivery Address</CardTitle>
                <CardDescription>Where should we deliver your local treasures?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName" 
                    value={address.fullName} 
                    onChange={e => setAddress({...address, fullName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input 
                    id="street" 
                    placeholder="123 Neighborhood Way"
                    value={address.street} 
                    onChange={e => setAddress({...address, street: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input 
                      id="city" 
                      value={address.city} 
                      onChange={e => setAddress({...address, city: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP / Pin Code</Label>
                    <Input 
                      id="zip" 
                      value={address.zip} 
                      onChange={e => setAddress({...address, zip: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    placeholder="+91"
                    value={address.phone} 
                    onChange={e => setAddress({...address, phone: e.target.value})}
                  />
                </div>
                <Button className="w-full h-12 mt-6" onClick={handleNext}>
                  Proceed to Payment <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 'payment' && (
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Choose how you'd like to pay for your local order.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup defaultValue={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                  <div className="flex items-center space-x-4 border rounded-xl p-4 cursor-pointer hover:bg-muted/30 transition-colors">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex-1 flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-primary" />
                        <span className="font-semibold">Credit / Debit Card</span>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-4 border rounded-xl p-4 cursor-pointer hover:bg-muted/30 transition-colors">
                    <RadioGroupItem value="upi" id="upi" />
                    <Label htmlFor="upi" className="flex-1 flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-5 w-5 text-primary" />
                        <span className="font-semibold">UPI / Digital Wallet</span>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-4 border rounded-xl p-4 cursor-pointer hover:bg-muted/30 transition-colors">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex-1 flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Truck className="h-5 w-5 text-primary" />
                        <span className="font-semibold">Cash on Delivery</span>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
                
                <div className="flex gap-4 pt-4">
                  <Button variant="outline" className="flex-1 h-12" onClick={handleBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button className="flex-[2] h-12" onClick={handleNext}>
                    Proceed to Review <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 'review' && (
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Review Your Order</CardTitle>
                <CardDescription>Double check everything before placing your order.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <h4 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Delivery To</h4>
                    <p className="font-medium">{address.fullName}</p>
                    <p className="text-sm text-muted-foreground">{address.street}, {address.city}, {address.zip}</p>
                    <Button variant="link" className="p-0 h-auto text-primary" onClick={() => setStep('address')}>Change</Button>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Payment Method</h4>
                    <p className="font-medium capitalize">{paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod}</p>
                    <Button variant="link" className="p-0 h-auto text-primary" onClick={() => setStep('payment')}>Change</Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Order Items</h4>
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between items-center py-1">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-primary">{item.quantity}x</span>
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 pt-6">
                  <Button variant="outline" className="flex-1 h-12" onClick={handleBack} disabled={isProcessing}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button 
                    className="flex-[2] h-14 text-lg font-bold shadow-xl" 
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</>
                    ) : (
                      "Place Order Now"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="bg-primary/5 border-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Fees</span>
                  <span>₹15.00</span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between items-end">
                <span className="font-bold">Total</span>
                <span className="text-2xl font-bold text-primary">₹{(totalPrice + 15).toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

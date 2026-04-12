
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
  Truck,
  ShieldCheck,
  QrCode,
  Lock,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type CheckoutStep = 'address' | 'payment' | 'review' | 'processing';

export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  
  const [step, setStep] = useState<CheckoutStep>('address');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("Verifying payment details...");
  
  const [address, setAddress] = useState({
    fullName: user?.displayName || '',
    street: '',
    city: '',
    state: '',
    zip: '',
    phone: ''
  });
  
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    nameOnCard: ''
  });
  const [upiDetails, setUpiDetails] = useState({
    app: 'gpay',
    id: ''
  });

  const handleNext = () => {
    if (step === 'address') {
      if (!address.street || !address.city || !address.zip) {
        toast({ title: "Missing Info", description: "Please provide complete address details.", variant: "destructive" });
        return;
      }
      setStep('payment');
    } else if (step === 'payment') {
      if (paymentMethod === 'card') {
        if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv) {
          toast({ title: "Invalid Card", description: "Please fill in all card details.", variant: "destructive" });
          return;
        }
      } else if (paymentMethod === 'upi') {
        if (!upiDetails.id || !upiDetails.id.includes('@')) {
          toast({ title: "Invalid UPI ID", description: "Please enter a valid UPI ID (e.g. name@upi).", variant: "destructive" });
          return;
        }
      }
      setStep('review');
    }
  };

  const handleBack = () => {
    if (step === 'payment') setStep('address');
    if (step === 'review') setStep('payment');
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    setStep('processing');
    
    // Step 1: Simulated Handshake
    await new Promise(resolve => setTimeout(resolve, 1500));
    setProcessingStatus("Authorizing transaction with bank...");
    
    // Step 2: Simulated Security Check
    await new Promise(resolve => setTimeout(resolve, 1500));
    setProcessingStatus("Performing security audit...");
    
    // Step 3: Confirmation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Payment Successful",
      description: "Transaction authorized in Sandbox Mode.",
    });

    clearCart();
    router.push('/checkout/success');
  };

  if (items.length === 0 && !isProcessing) {
    router.push('/cart');
    return null;
  }

  if (step === 'processing') {
    return (
      <div className="max-w-xl mx-auto px-6 py-32 text-center space-y-8">
        <div className="relative h-24 w-24 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse" />
          <Loader2 className="h-24 w-24 text-primary animate-spin" />
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-headline">{processingStatus}</h2>
          <p className="text-muted-foreground">Please do not refresh the page or click back.</p>
        </div>
        <div className="bg-muted p-4 rounded-xl flex items-center justify-center gap-3 text-xs font-mono uppercase tracking-widest text-muted-foreground">
          <Lock className="h-4 w-4" /> Secure Sandbox Environment
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <h1 className="text-4xl font-headline">Checkout</h1>
        <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 w-fit">
          <Shield className="h-3 w-3" /> Sandbox Mode - No real charges
        </div>
      </div>

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
                  {/* Card Payment Option */}
                  <div className={`space-y-4 border rounded-xl p-4 transition-all ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'hover:bg-muted/30'}`}>
                    <div className="flex items-center space-x-4 cursor-pointer">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex-1 flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-5 w-5 text-primary" />
                          <span className="font-semibold">Credit / Debit Card</span>
                        </div>
                        <div className="flex gap-1 opacity-60">
                          <div className="h-4 w-6 bg-slate-200 rounded-sm" />
                          <div className="h-4 w-6 bg-slate-300 rounded-sm" />
                        </div>
                      </Label>
                    </div>
                    
                    {paymentMethod === 'card' && (
                      <div className="grid gap-4 pl-8 animate-in fade-in slide-in-from-top-2">
                        <div className="space-y-2">
                          <Label htmlFor="cardName" className="text-xs uppercase font-bold text-muted-foreground">Name on Card</Label>
                          <Input 
                            id="cardName" 
                            placeholder="John Doe" 
                            value={cardDetails.nameOnCard}
                            onChange={e => setCardDetails({...cardDetails, nameOnCard: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cardNumber" className="text-xs uppercase font-bold text-muted-foreground">Card Number</Label>
                          <Input 
                            id="cardNumber" 
                            placeholder="0000 0000 0000 0000" 
                            value={cardDetails.number}
                            onChange={e => setCardDetails({...cardDetails, number: e.target.value})}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="expiry" className="text-xs uppercase font-bold text-muted-foreground">Expiry (MM/YY)</Label>
                            <Input 
                              id="expiry" 
                              placeholder="MM/YY" 
                              value={cardDetails.expiry}
                              onChange={e => setCardDetails({...cardDetails, expiry: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cvv" className="text-xs uppercase font-bold text-muted-foreground">CVV</Label>
                            <Input 
                              id="cvv" 
                              placeholder="123" 
                              type="password"
                              maxLength={3}
                              value={cardDetails.cvv}
                              onChange={e => setCardDetails({...cardDetails, cvv: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* UPI Payment Option */}
                  <div className={`space-y-4 border rounded-xl p-4 transition-all ${paymentMethod === 'upi' ? 'border-primary bg-primary/5' : 'hover:bg-muted/30'}`}>
                    <div className="flex items-center space-x-4 cursor-pointer">
                      <RadioGroupItem value="upi" id="upi" />
                      <Label htmlFor="upi" className="flex-1 flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Smartphone className="h-5 w-5 text-primary" />
                          <span className="font-semibold">UPI / Digital Wallet</span>
                        </div>
                        <div className="flex gap-2">
                          <QrCode className="h-4 w-4 opacity-40" />
                        </div>
                      </Label>
                    </div>

                    {paymentMethod === 'upi' && (
                      <div className="grid gap-4 pl-8 animate-in fade-in slide-in-from-top-2">
                        <div className="space-y-2">
                          <Label className="text-xs uppercase font-bold text-muted-foreground">Select App</Label>
                          <div className="grid grid-cols-3 gap-2">
                            {['Google Pay', 'PhonePe', 'Paytm'].map((appName) => (
                              <Button 
                                key={appName}
                                type="button"
                                variant={upiDetails.app === appName.toLowerCase().replace(' ', '') ? "default" : "outline"}
                                className="h-10 text-xs px-2"
                                onClick={() => setUpiDetails({...upiDetails, app: appName.toLowerCase().replace(' ', '')})}
                              >
                                {appName}
                              </Button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="upiId" className="text-xs uppercase font-bold text-muted-foreground">UPI ID</Label>
                          <div className="relative">
                            <Smartphone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                              id="upiId" 
                              placeholder="username@bank" 
                              className="pl-10"
                              value={upiDetails.id}
                              onChange={e => setUpiDetails({...upiDetails, id: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* COD Payment Option */}
                  <div className={`flex items-center space-x-4 border rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'hover:bg-muted/30'}`}>
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex-1 flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Truck className="h-5 w-5 text-primary" />
                        <span className="font-semibold">Cash on Delivery</span>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
                
                <div className="bg-primary/5 p-4 rounded-xl flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Your payment information is encrypted and processed securely using simulated merchant accounts for prototyping.
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button variant="outline" className="flex-1 h-12" onClick={handleBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button className="flex-[2] h-12 shadow-lg" onClick={handleNext}>
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
                  <div className="space-y-2 p-4 rounded-xl bg-muted/30">
                    <h4 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Delivery To</h4>
                    <p className="font-medium">{address.fullName}</p>
                    <p className="text-sm text-muted-foreground">{address.street}, {address.city}, {address.zip}</p>
                    <Button variant="link" className="p-0 h-auto text-primary text-xs font-bold" onClick={() => setStep('address')}>Change Address</Button>
                  </div>
                  <div className="space-y-2 p-4 rounded-xl bg-muted/30">
                    <h4 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Payment Method</h4>
                    <p className="font-medium capitalize">
                      {paymentMethod === 'cod' ? 'Cash on Delivery' : 
                       paymentMethod === 'card' ? `Card (Ending in ${cardDetails.number.slice(-4)})` : 
                       `UPI (${upiDetails.app})`}
                    </p>
                    <Button variant="link" className="p-0 h-auto text-primary text-xs font-bold" onClick={() => setStep('payment')}>Change Payment</Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Order Items</h4>
                  <div className="space-y-3">
                    {items.map(item => (
                      <div key={item.id} className="flex justify-between items-center py-1">
                        <div className="flex items-center gap-3">
                          <span className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                            {item.quantity}
                          </span>
                          <span className="text-sm font-medium">{item.name}</span>
                        </div>
                        <span className="text-sm font-bold">₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
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
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Finalizing...</>
                    ) : (
                      "Confirm & Pay Securely"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="bg-primary/5 border-primary/10 shadow-sm sticky top-24">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="text-green-600 font-bold uppercase text-[10px]">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Platform Fees</span>
                  <span className="font-medium">₹15.00</span>
                </div>
              </div>
              <Separator className="bg-primary/10" />
              <div className="flex justify-between items-end">
                <span className="font-bold">Total Payable</span>
                <span className="text-3xl font-bold text-primary">₹{(totalPrice + 15).toFixed(2)}</span>
              </div>
              <div className="pt-4 flex items-center justify-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                 <ShieldCheck className="h-3 w-3" /> Secure Merchant Verification
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

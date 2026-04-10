
import type {Metadata} from 'next';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { CartProvider } from '@/components/cart-provider';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'LocaleConnect | Support Local Shops',
  description: 'Connect with your local community and shop from neighborhood vendors easily.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Belleza&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        <CartProvider>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <footer className="bg-white border-t py-12 px-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-4">
                <h3 className="font-headline text-2xl text-primary">LocaleConnect</h3>
                <p className="text-muted-foreground text-sm">Empowering local communities by bringing neighborhood shops to your fingertips.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">For Customers</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="/products" className="hover:text-primary transition-colors">Browse Products</a></li>
                  <li><a href="/shops" className="hover:text-primary transition-colors">Local Shops</a></li>
                  <li><a href="/cart" className="hover:text-primary transition-colors">Shopping Cart</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">For Vendors</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="/vendor/dashboard" className="hover:text-primary transition-colors">Vendor Dashboard</a></li>
                  <li><a href="/register-shop" className="hover:text-primary transition-colors">Register Your Shop</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Connect</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>About Us</li>
                  <li>Privacy Policy</li>
                  <li>Contact Support</li>
                </ul>
              </div>
            </div>
          </footer>
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}

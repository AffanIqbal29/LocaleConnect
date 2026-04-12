"use client";

import Link from 'next/link';
import { useCart } from './cart-provider';
import { useAuth } from './auth-provider';
import { ShoppingCart, User, Store, Search, Menu, LogOut, Settings, Package, Home, ShoppingBag } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from 'react';

export function Navbar() {
  const { totalItems } = useCart();
  const { user, profile, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const NavLinks = () => (
    <>
      <Link 
        href="/products" 
        className="text-sm font-medium hover:text-primary transition-colors py-2 md:py-0"
        onClick={() => setIsMobileMenuOpen(false)}
      >
        Products
      </Link>
      <Link 
        href="/shops" 
        className="text-sm font-medium hover:text-primary transition-colors py-2 md:py-0"
        onClick={() => setIsMobileMenuOpen(false)}
      >
        Shops
      </Link>
    </>
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4 md:gap-8">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="text-left font-headline text-primary">LocaleConnect</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-8">
                  <Link href="/" className="flex items-center gap-2 text-lg font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                    <Home className="h-5 w-5" /> Home
                  </Link>
                  <Link href="/products" className="flex items-center gap-2 text-lg font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                    <ShoppingBag className="h-5 w-5" /> Products
                  </Link>
                  <Link href="/shops" className="flex items-center gap-2 text-lg font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                    <Store className="h-5 w-5" /> Shops
                  </Link>
                  <hr className="my-2" />
                  {!user && (
                    <div className="flex flex-col gap-2">
                      <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full">Sign In</Button>
                      </Link>
                      <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button className="w-full">Get Started</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl md:text-2xl font-headline font-bold text-primary">LocaleConnect</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6">
              <NavLinks />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden lg:flex items-center relative max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search products..."
                className="pl-9 h-9 w-full rounded-full border bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]" variant="default">
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                    <Avatar className="h-8 w-8 border">
                      <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
                      <AvatarFallback className="bg-primary/10 text-primary uppercase text-xs">
                        {user.displayName?.charAt(0) || user.email?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none truncate">{user.displayName || 'Neighbor'}</p>
                      <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
                      <Badge variant="secondary" className="mt-1 w-fit text-[10px] uppercase font-bold tracking-tight">
                        {profile?.role || 'User'}
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account" className="flex items-center gap-2 cursor-pointer">
                      <User className="h-4 w-4" /> My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="flex items-center gap-2 cursor-pointer">
                      <Package className="h-4 w-4" /> My Orders
                    </Link>
                  </DropdownMenuItem>
                  {profile?.role === 'vendor' && (
                    <DropdownMenuItem asChild>
                      <Link href="/vendor/dashboard" className="flex items-center gap-2 cursor-pointer">
                        <Store className="h-4 w-4" /> Vendor Portal
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-destructive focus:bg-destructive focus:text-destructive-foreground cursor-pointer"
                    onClick={() => logout()}
                  >
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

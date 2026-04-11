
import { Product, Shop } from '@/app/lib/types';
import { PlaceHolderImages } from './placeholder-images';

/**
 * @fileOverview Mock Database for LocaleConnect Prototyping.
 * In a production app, this would be replaced by Firestore or a SQL DB.
 */

export let shops: Shop[] = [
  {
    id: 's1',
    vendorId: 'v1',
    name: "Bloom Bakery",
    type: "Bakery",
    description: "Artisan sourdough and neighborhood favorites baked fresh daily using locally sourced organic ingredients.",
    location: "123 Maple St, Old Town",
    hours: "8 AM - 6 PM",
    rating: 4.8,
    imageUrl: PlaceHolderImages.find(img => img.id === 'bakery-shop')?.imageUrl || "",
    createdAt: new Date(),
  },
  {
    id: 's2',
    vendorId: 'v2',
    name: "The Velvet Hanger",
    type: "Boutique",
    description: "Curated vintage finds and modern sustainable fashion for the conscious shopper.",
    location: "456 Oak Avenue",
    hours: "10 AM - 8 PM",
    rating: 4.9,
    imageUrl: PlaceHolderImages.find(img => img.id === 'boutique-shop')?.imageUrl || "",
    createdAt: new Date(),
  },
  {
    id: 's3',
    vendorId: 'v3',
    name: "Steam & Bean",
    type: "Cafe",
    description: "Your local destination for specialty coffee and community vibes. We roast our own beans weekly.",
    location: "789 Pine Lane",
    hours: "7 AM - 5 PM",
    rating: 4.7,
    imageUrl: PlaceHolderImages.find(img => img.id === 'cafe-shop')?.imageUrl || "",
    createdAt: new Date(),
  },
  {
    id: 's4',
    vendorId: 'v4',
    name: "Clay Creations",
    type: "Pottery",
    description: "Handcrafted ceramics made right here in the neighborhood. Unique pieces for your home.",
    location: "101 River Road",
    hours: "11 AM - 4 PM",
    rating: 5.0,
    imageUrl: PlaceHolderImages.find(img => img.id === 'product-pottery')?.imageUrl || "",
    createdAt: new Date(),
  }
];

export let products: Product[] = [
  {
    id: 'p1',
    shopId: 's4',
    name: "Handcrafted Ceramic Mug",
    description: "A beautiful, hand-thrown ceramic mug with a unique glaze finish.",
    price: 240.00,
    category: "Home",
    imageUrl: PlaceHolderImages.find(img => img.id === 'product-pottery')?.imageUrl || "",
    stockQuantity: 12,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: 'p2',
    shopId: 's1',
    name: "Wildflower Honey",
    description: "Pure, raw honey collected from local wildflowers.",
    price: 125.50,
    category: "Food",
    imageUrl: PlaceHolderImages.find(img => img.id === 'product-honey')?.imageUrl || "",
    stockQuantity: 25,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: 'p3',
    shopId: 's3',
    name: "Artisan Coffee Blend",
    description: "Our signature medium roast blend with notes of chocolate and citrus.",
    price: 180.00,
    category: "Food",
    imageUrl: PlaceHolderImages.find(img => img.id === 'product-coffee')?.imageUrl || "",
    stockQuantity: 40,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: 'p4',
    shopId: 's1',
    name: "Sourdough Bread",
    description: "Naturally leavened bread with a crisp crust and airy interior.",
    price: 80.00,
    category: "Food",
    imageUrl: PlaceHolderImages.find(img => img.id === 'bakery-shop')?.imageUrl || "",
    stockQuantity: 10,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: 'p5',
    shopId: 's2',
    name: "Vintage Denim Jacket",
    description: "Classic vintage denim jacket, hand-selected for quality.",
    price: 650.00,
    category: "Clothing",
    imageUrl: PlaceHolderImages.find(img => img.id === 'boutique-shop')?.imageUrl || "",
    stockQuantity: 1,
    isActive: true,
    createdAt: new Date(),
  }
];

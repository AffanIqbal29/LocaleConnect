# LocaleConnect Database Schema

This document outlines the data structures for LocaleConnect, optimized for a NoSQL (Firestore-style) or Relational database.

## 1. Users (Shared)
Represents both customers and vendors.
- `uid`: String (Primary Key)
- `email`: String
- `displayName`: String
- `photoURL`: String
- `role`: Enum ('customer', 'vendor')
- `createdAt`: Timestamp

## 2. Shops (Vendor POV)
Owned by a user with the 'vendor' role.
- `id`: String (Primary Key)
- `vendorId`: String (Foreign Key -> Users.uid)
- `name`: String
- `type`: String (e.g., 'Bakery', 'Boutique')
- `description`: String (AI-generated or manual)
- `location`: String (Address or neighborhood)
- `hours`: String
- `rating`: Number
- `imageUrl`: String
- `createdAt`: Timestamp

## 3. Products (Vendor/Customer POV)
Items listed by a specific shop.
- `id`: String (Primary Key)
- `shopId`: String (Foreign Key -> Shops.id)
- `name`: String
- `description`: String (AI-generated or manual)
- `price`: Number
- `category`: String
- `imageUrl`: String
- `stockQuantity`: Number
- `isActive`: Boolean
- `createdAt`: Timestamp

## 4. Orders (Customer/Vendor POV)
Transaction records.
- `id`: String (Primary Key)
- `customerId`: String (Foreign Key -> Users.uid)
- `shopId`: String (Foreign Key -> Shops.id)
- `status`: Enum ('pending', 'processing', 'completed', 'cancelled')
- `totalAmount`: Number
- `items`: Array of:
  - `productId`: String
  - `name`: String
  - `price`: Number
  - `quantity`: Number
- `createdAt`: Timestamp

## 5. Reviews (Customer POV)
Feedback for shops.
- `id`: String (Primary Key)
- `customerId`: String (Foreign Key -> Users.uid)
- `shopId`: String (Foreign Key -> Shops.id)
- `rating`: Number (1-5)
- `comment`: String
- `createdAt`: Timestamp

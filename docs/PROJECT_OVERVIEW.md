# LocaleConnect: Project Overview & Technical Specification

LocaleConnect is a hyper-local marketplace platform designed to connect neighborhood residents with local artisans and independent shops.

## 1. Core Purpose
To empower small businesses by providing them with a digital storefront, AI-powered marketing tools, and a centralized discovery platform for local customers.

## 2. Tech Stack
- **Framework**: Next.js 15 (App Router) with React 19.
- **Language**: TypeScript (End-to-end type safety).
- **Styling**: Tailwind CSS + ShadCN UI (Modern, responsive, utility-first UI).
- **Database**: Firebase Firestore (NoSQL, real-time document storage).
- **Authentication**: Firebase Auth (Supports Email/Password and Anonymous sessions).
- **AI/GenAI**: Genkit with Google Gemini 2.5 Flash (Used for content generation).

## 3. Data Model (Firestore)
- `/users/{userId}`: Profiles for customers and vendors.
- `/vendorProfiles/{vendorProfileId}`: Shop details (name, type, location, logo).
- `/vendorProfiles/{vendorProfileId}/products/{productId}`: Inventory items. Includes `ownerUserId` for security and `isActive` for discovery.
- `/users/{userId}/orders/{orderId}`: Historical purchase data.
- `/categories/{categoryId}`: Global organization for product discovery.

## 4. Key Features & AI Integration
### Vendor Tools
- **Magic Write (Genkit)**: Vendors can input basic keywords (e.g., "handmade", "sourdough"), and the AI generates compelling, professional product descriptions and "About Us" shop bios.
- **Inventory Management**: Real-time stock updates, price adjustments, and product lifecycle management (active/inactive).

### Customer Experience
- **Hyper-Local Discovery**: A unified "Discover Locally" page where products from all neighborhood shops are aggregated, searchable, and filterable by category.
- **Real-time Cart**: A global shopping cart that supports items from multiple vendors simultaneously.
- **Simulated Checkout**: A multi-step flow (Address -> Payment -> Review) designed for prototyping authentic payment experiences.
- **Order Tracking**: Comprehensive order history with status badges (Pending, Processing, Completed).

## 5. Security Architecture
- **Firestore Rules**: Currently configured for `allow read, write: if true` for rapid prototyping. The architecture is designed for ABAC (Attribute-Based Access Control) using `ownerUserId` fields.
- **Client-Side SDK**: All Firebase operations are performed using the client-side SDK within `'use client'` components to ensure a fast, reactive UX.

## 6. Project Structure
- `src/app/`: Next.js pages and layouts.
- `src/ai/`: Genkit flows and AI prompt definitions.
- `src/firebase/`: Real-time hooks (`useCollection`, `useDoc`) and SDK initialization.
- `src/components/`: Reusable UI components and global Context Providers (Auth, Cart).
- `src/app/actions/`: Client-side data utility functions for interacting with Firestore.

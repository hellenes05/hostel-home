# Hostel/Home Management Implementation Guide

## Project Setup & Foundation

### Tech Stack Overview
- **Frontend**: Next.js 14 + TypeScript
- **UI Library**: Shadcn UI + Tailwind CSS
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js with JWT
- **State Management**: TanStack Query
- **Testing**: Jest + React Testing Library

### Initial Setup Steps
1. Initialize Next.js app with TypeScript:
```bash
npx create-next-app@latest --typescript
```

2. Install UI dependencies:
```bash
npm install shadcn-ui tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

3. Configure Drizzle ORM:
```bash
npm install drizzle-orm postgres @vercel/postgres
npm install -D drizzle-kit
```

4. Set up ESLint and Prettier:
```bash
npm install -D eslint prettier eslint-config-prettier
```

## Module Implementation Roadmap

### 1. Authentication System (Week 3)
**Implementation Steps:**
1. Install NextAuth.js:
```bash
npm install next-auth@latest
```

2. Configure NextAuth.js with JWT strategy in `/app/api/auth/[...nextauth]/route.ts`:
```ts
import NextAuth from 'next-auth';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GithubProvider from 'next-auth/providers/github';
import { db } from '@/lib/db';

export const authOptions = {
  adapter: DrizzleAdapter(db),
  providers: [
    CredentialsProvider({
      // Configuration for credentials login
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    // JWT and session callbacks
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

3. Create `/app/(auth)/login/page.tsx` with:
```tsx
import { AuthForm } from '@/components/auth/auth-form';

export default function LoginPage() {
  return (
    <AuthForm 
      strategy="jwt"
      socialLogins={['google', 'github']}
    />
  );
}
```

4. Implement role-based access control middleware in `/middleware.ts`:
```ts
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req) {
  const token = await getToken({ req });
  const isAuthenticated = !!token;
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
  
  if (isAdminRoute && (!isAuthenticated || token.role !== 'ADMIN')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/properties/:path*'],
};
```

### 2. Property Management (Week 4-5)
**Component Structure:**
1. Create property schema in Drizzle:
```ts
// lib/schema.ts
import { pgTable, text, real, timestamp, varchar, boolean } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';
import { users } from './auth/schema';

export const propertyTypes = pgEnum('property_type', ['HOSTEL', 'HOTEL', 'HOUSE', 'APARTMENT']);
export const propertyStatuses = pgEnum('property_status', ['AVAILABLE', 'BOOKED', 'MAINTENANCE']);

export const properties = pgTable('properties', {
  id: varchar('id').primaryKey().$defaultFn(() => createId()),
  title: varchar('title').notNull(),
  description: text('description').notNull(),
  price: real('price').notNull(),
  address: varchar('address').notNull(),
  amenities: text('amenities').array().notNull(),
  type: propertyTypes('type').notNull(),
  status: propertyStatuses('status').default('AVAILABLE').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  ownerId: varchar('owner_id').notNull().references(() => users.id),
});

export const images = pgTable('images', {
  id: varchar('id').primaryKey().$defaultFn(() => createId()),
  url: varchar('url').notNull(),
  propertyId: varchar('property_id').notNull().references(() => properties.id),
});

export const propertiesRelations = relations(properties, ({ many, one }) => ({
  images: many(images),
  bookings: many(bookings),
  owner: one(users, {
    fields: [properties.ownerId],
    references: [users.id],
  }),
}));

export const imagesRelations = relations(images, ({ one }) => ({
  property: one(properties, {
    fields: [images.propertyId],
    references: [properties.id],
  }),
}));
```

2. Create `/app/(admin)/properties/page.tsx` - CRUD interface:
```tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PropertyForm } from '@/components/property/property-form';
import { PropertyList } from '@/components/property/property-list';

export default function PropertiesAdminPage() {
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();
  
  const { data: properties, isLoading } = useQuery({
    queryKey: ['properties', { admin: true }],
    queryFn: () => fetch('/api/properties').then(res => res.json()),
  });
  
  const createMutation = useMutation({
    mutationFn: (newProperty) => {
      return fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProperty),
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      setIsCreating(false);
    },
  });
  
  // Rest of the component implementation
}
```

3. Create `/app/_components/property-card.tsx` - Listing display:
```tsx
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PropertyType } from '@/lib/schema';

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    description: string;
    price: number;
    images: { url: string }[];
    type: PropertyType;
    amenities: string[];
  };
  onBookClick?: (id: string) => void;
}

export function PropertyCard({ property, onBookClick }: PropertyCardProps) {
  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="relative h-48 w-full">
        <Image 
          src={property.images[0]?.url || '/placeholder.jpg'} 
          alt={property.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold">{property.title}</h3>
          <Badge>{property.type}</Badge>
        </div>
        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{property.description}</p>
        <div className="mt-4 flex justify-between items-center">
          <p className="font-bold">${property.price}/night</p>
          {onBookClick && (
            <Button onClick={() => onBookClick(property.id)}>Book Now</Button>
          )}
        </div>
      </div>
    </div>
  );
}
```

4. Create `/app/api/properties/route.ts` - API endpoints:
```ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { properties, images } from '@/lib/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  
  let query = db.select().from(properties);
  
  if (type) {
    query = query.where(eq(properties.type, type));
  }
  
  if (minPrice) {
    query = query.where(gte(properties.price, parseFloat(minPrice)));
  }
  
  if (maxPrice) {
    query = query.where(lte(properties.price, parseFloat(maxPrice)));
  }
  
  const propertiesList = await query;
  
  // Fetch images for each property
  const propertiesWithImages = await Promise.all(
    propertiesList.map(async (property) => {
      const propertyImages = await db
        .select({ url: images.url })
        .from(images)
        .where(eq(images.propertyId, property.id));
      
      return {
        ...property,
        images: propertyImages,
      };
    })
  );
  
  return NextResponse.json(propertiesWithImages);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const data = await request.json();
  
  // Insert property
  const [property] = await db.insert(properties).values({
    ...data,
    ownerId: session.user.id,
  }).returning();
  
  // Insert images if provided
  if (data.images && data.images.length > 0) {
    await db.insert(images).values(
      data.images.map(image => ({
        url: image.url,
        propertyId: property.id,
      }))
    );
  }
  
  return NextResponse.json(property);
}
```

### 3. State Management with TanStack Query
**Implementation Steps:**
1. Install required packages:
```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

2. Create `lib/react-query.ts`:
```ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 2
    }
  }
});
```

3. Wrap app with QueryProvider in `app/layout.tsx`:
```tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/react-query';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </body>
    </html>
  );
}
```

**Team Rules:**
- ✅ Use query keys array format: `['bookings', { filter }]`
- ✅ Always define TS types for API responses
- ✅ Use `keepPreviousData` for pagination
- ✅ Handle errors in `onError` callbacks
- ❌ Never mutate cache directly - use queryClient methods
- ❌ Avoid `enabled: false` - prefer initialData

**Booking System Example:**
```ts
interface Booking {
  id: string;
  propertyId: string;
  userId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
}

const { data: bookings, isLoading, error } = useQuery<Booking[]>({
  queryKey: ['bookings'],
  queryFn: () => fetch('/api/bookings').then(res => res.json()),
  onError: (error) => {
    toast.error(`Failed to load bookings: ${error.message}`);
  }
});
```

### 4. Booking Engine (Week 6)
**Implementation Steps:**
1. Create booking schema in Drizzle:
```ts
// lib/schema.ts
import { pgTable, text, real, timestamp, varchar, pgEnum } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const bookingStatuses = pgEnum('booking_status', ['PENDING', 'CONFIRMED', 'CANCELLED']);

export const bookings = pgTable('bookings', {
  id: varchar('id').primaryKey().$defaultFn(() => createId()),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  totalPrice: real('total_price').notNull(),
  status: bookingStatuses('status').default('PENDING').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  propertyId: varchar('property_id').notNull().references(() => properties.id),
  userId: varchar('user_id').notNull().references(() => users.id),
  paymentId: varchar('payment_id').references(() => payments.id),
});

export const bookingsRelations = relations(bookings, ({ one }) => ({
  property: one(properties, {
    fields: [bookings.propertyId],
    references: [properties.id],
  }),
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  payment: one(payments, {
    fields: [bookings.paymentId],
    references: [payments.id],
  }),
}));
```

2. Create availability calendar component:
```tsx
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { useQuery } from '@tanstack/react-query';

interface AvailabilityCalendarProps {
  propertyId: string;
  onDateSelect: (startDate: Date, endDate: Date) => void;
}

export function AvailabilityCalendar({ propertyId, onDateSelect }: AvailabilityCalendarProps) {
  const [selectedRange, setSelectedRange] = useState<{ from: Date; to?: Date }>({ from: new Date() });
  
  const { data: bookedDates } = useQuery({
    queryKey: ['property-bookings', propertyId],
    queryFn: () => fetch(`/api/properties/${propertyId}/bookings`).then(res => res.json()),
  });
  
  const handleSelect = (range) => {
    setSelectedRange(range);
    if (range.from && range.to) {
      onDateSelect(range.from, range.to);
    }
  };
  
  // Disable dates that are already booked
  const disabledDates = bookedDates?.map(booking => ({
    from: new Date(booking.startDate),
    to: new Date(booking.endDate),
  })) || [];
  
  return (
    <Calendar
      mode="range"
      selected={selectedRange}
      onSelect={handleSelect}
      disabled={{
        before: new Date(),
        dates: disabledDates,
      }}
      numberOfMonths={2}
    />
  );
}
```

3. Implement booking creation API:
```ts
// app/api/bookings/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { bookings } from '@/lib/schema';
import { eq, and, or, lte, gte, ne } from 'drizzle-orm';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { propertyId, startDate, endDate, totalPrice } = await request.json();
  
  // Check if property is available for these dates
  const existingBookings = await db.select()
    .from(bookings)
    .where(
      and(
        eq(bookings.propertyId, propertyId),
        ne(bookings.status, 'CANCELLED'),
        or(
          and(
            lte(bookings.startDate, new Date(endDate)),
            gte(bookings.endDate, new Date(startDate))
          )
        )
      )
    );
  
  if (existingBookings.length > 0) {
    return NextResponse.json(
      { error: 'Property is not available for selected dates' },
      { status: 400 }
    );
  }
  
  // Create booking
  const [booking] = await db.insert(bookings)
    .values({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      totalPrice,
      userId: session.user.id,
      propertyId,
    })
    .returning();
  
  return NextResponse.json(booking);
}
```

### 5. Payments Integration
**Implementation Steps:**
1. Install Stripe packages:
```bash
npm install stripe @stripe/stripe-js
```

2. Create payment schema in Drizzle:
```ts
// lib/schema.ts
import { pgTable, text, real, timestamp, varchar, pgEnum } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const paymentStatuses = pgEnum('payment_status', ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']);

export const payments = pgTable('payments', {
  id: varchar('id').primaryKey().$defaultFn(() => createId()),
  amount: real('amount').notNull(),
  currency: varchar('currency').default('USD').notNull(),
  status: paymentStatuses('status').default('PENDING').notNull(),
  provider: varchar('provider').default('stripe').notNull(),
  providerId: varchar('provider_id'),  // Stripe payment intent ID
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const paymentsRelations = relations(payments, ({ many }) => ({
  bookings: many(bookings),
}));
```

3. Create Stripe payment API:
```ts
// app/api/payments/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { payments, bookings } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { bookingId } = await request.json();
  
  // Get booking details
  const [booking] = await db.select()
    .from(bookings)
    .where(eq(bookings.id, bookingId));
  
  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }
  
  if (booking.userId !== session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Create a payment intent with Stripe
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(booking.totalPrice * 100), // Stripe uses cents
    currency: 'usd',
    metadata: {
      bookingId: booking.id,
      propertyId: booking.propertyId,
      userId: booking.userId,
    },
  });
  
  // Create a payment record in the database
  const [payment] = await db.insert(payments)
    .values({
      amount: booking.totalPrice,
      providerId: paymentIntent.id,
    })
    .returning();
  
  // Update booking with payment ID
  await db.update(bookings)
    .set({ paymentId: payment.id })
    .where(eq(bookings.id, bookingId));
  
  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
    paymentId: payment.id,
  });
}
```

4. Create webhook handler for Stripe events:
```ts
// app/api/payments/webhook/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { payments, bookings } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
  }
  
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    
    // Update payment status in database
    await db.update(payments)
      .set({ status: 'COMPLETED' })
      .where(eq(payments.providerId, paymentIntent.id));
    
    // Find related booking and update its status
    const [payment] = await db.select()
      .from(payments)
      .where(eq(payments.providerId, paymentIntent.id));
    
    if (payment) {
      const [relatedBooking] = await db.select()
        .from(bookings)
        .where(eq(bookings.paymentId, payment.id));
      
      if (relatedBooking) {
        await db.update(bookings)
          .set({ status: 'CONFIRMED' })
          .where(eq(bookings.id, relatedBooking.id));
      }
    }
  }
  
  return NextResponse.json({ received: true });
}
```

**API Contract:**
```ts
POST /api/payments/webhook
{
  amount: number;
  currency: 'USD' | 'EUR';
  paymentMethod: string;
}
```

## Coding Standards & Best Practices

### TypeScript Usage
- Always define interfaces for component props
- Use enums for fixed sets of values
- Leverage discriminated unions for complex state

### Component Structure
- Use the Container/Presenter pattern for complex components
- Keep components focused on a single responsibility
- Extract reusable logic into custom hooks

### API Design
- Use RESTful conventions for API endpoints
- Implement proper error handling and status codes
- Validate input data with Zod or similar libraries

### Testing Strategy
- Write unit tests for utility functions
- Create component tests for UI elements
- Implement integration tests for critical user flows

## Phase 3 Checklist
✅ Implement booking calendar component
✅ Configure Stripe payment webhooks
✅ Add role validation middleware
✅ Create lease agreement PDF generator

## Deployment Guidelines
1. Set up environment variables in Vercel
2. Configure PostgreSQL database connection
3. Set up Stripe webhook endpoints
4. Deploy frontend to Vercel
5. Monitor application with Sentry

**NB**: The doc has both the frontend and backend code samples. so dont be confused. It's just a guide. I will will be making changes to it as we go along.
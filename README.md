# Inventory Backend (Express + MongoDB + Prisma)

Backend service for inventory, transactions, alerts, and low-stock notifications.

## Features

- Product management (create/list)
- Transaction management (create/list)
- Automatic inventory updates on transaction events
- Low-stock alert lifecycle (ACTIVE -> RESOLVED)
- Notifications for low stock via:
  - Email (Resend)
  - SMS (MSG91)
  - Socket.IO real-time events
- Health check endpoint
- Prisma test route for PostgreSQL connectivity

## Tech Stack

- Node.js + Express
- MongoDB (Mongoose models for products, transactions, alerts)
- PostgreSQL (Prisma client and schema present)
- Socket.IO
- Resend (email)
- MSG91 (SMS)

## Project Structure

- `app.js` - app bootstrap and route registration
- `src/config/db.js` - MongoDB connection
- `src/config/prisma.js` - Prisma client adapter setup
- `src/routes/inventoryRoutes.js` - products and alerts APIs
- `src/routes/transactionRoutes.js` - transaction APIs
- `src/events/eventListner.js` - business event flow and notifications
- `src/socket/socketServer.js` - Socket.IO server
- `prisma/schema.prisma` - Prisma schema for PostgreSQL models

## Prerequisites

- Node.js 18+
- npm
- MongoDB running locally or hosted(in production)
- PostgreSQL URL (for Prisma route usage)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` in the project root (same folder as `app.js`):

```env
PORT=3000

# MongoDB (used by main product/transaction/alert APIs)
MONGODB_URI=mongodb://127.0.0.1:27017/inventory_db

# PostgreSQL (used by Prisma route: /test-prisma)
DATABASE_URL=postgresql://USER:PASSWORD@HOST:HOST/DB_NAME

# Email alerts
RESEND_API_KEY=your_resend_api_key
ALERT_EMAIL=you@example.com

# SMS alerts
MSG91_AUTH_KEY=your_msg91_auth_key
MSG91_FLOW_ID=your_msg91_flow_id
ALERT_MOBILE=9198XXXXXXXX
```

3. Start server:

```bash
npm start
```

Server runs on `http://localhost:3000` by default.

## NPM Scripts

- `npm start` - start backend with nodemon
- `npm test` - placeholder script (currently not implemented)

## API Endpoints

### Health

- `GET /health` - app health + MongoDB connection state
- `GET /` - hello route

### Inventory Routes (`/api`)

- `GET /api/products` - list all products
- `POST /api/products` - create product
- `GET /api/alerts` - list alerts
- `POST /api/alerts` - create alert

### Transaction Routes (`/api/transactions`)

- `GET /api/transactions` - list transactions
- `POST /api/transactions` - create transaction

Example payload for `POST /api/transactions`:

```json
{
  "productId": "64f0b2d9e1c123456789abcd",
  "type": "SALE",
  "quantity": 2,
  "note": "Counter sale"
}
```

### Prisma Test Route

- `GET /test-prisma` - reads products via Prisma (PostgreSQL)

## Event Flow

1. Transaction created
2. `transactionCreated` event updates product stock
3. `inventoryUpdated` decides low-stock vs resolved state
4. If low-stock:
   - Creates/updates active alert
   - Triggers email, SMS, socket notification, and WhatsApp log

## Socket.IO

Connect to the server and listen to event:

- `lowStockAlert`

Payload contains product, stock levels, message, and timestamp.

## Notes

- Main APIs currently rely on MongoDB models.
- Prisma/PostgreSQL is present and used in `/test-prisma`.
- Keep `.env` private and never commit secrets.

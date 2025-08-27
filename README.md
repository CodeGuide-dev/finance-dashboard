# Financial Management Dashboard

A comprehensive financial management application built with Next.js, Drizzle ORM, and PostgreSQL.

## Features

- **Dashboard**: Overview of financial metrics
- **Expense Management**: Track and categorize business expenses
- **Income Tracking**: Monitor revenue streams
- **Asset Management**: Catalog and track company assets
- **Investment Portfolio**: Manage investments and track performance
- **Document Storage**: Store and organize financial documents

## Tech Stack

- **Frontend**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with shadcn/ui components
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth
- **Deployment**: Docker

## Getting Started

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- PostgreSQL (via Docker)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd finance-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Update .env with your configuration
   ```

4. Start the database:
   ```bash
   npm run db:up
   ```

5. Run database migrations:
   ```bash
   npm run db:push
   ```

6. Seed the database with initial data:
   ```bash
   npm run db:seed
   ```

7. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at http://localhost:3000

## Project Structure

```
├── app/                 # Next.js app router pages
│   ├── dashboard/       # Dashboard pages
│   ├── sign-in/         # Sign in page
│   ├── sign-up/         # Sign up page
│   └── api/             # API routes
├── components/          # React components
├── db/                  # Database schema and utilities
├── lib/                 # Utility functions
├── scripts/             # Helper scripts
├── public/              # Static assets
├── styles/              # Global styles
└── drizzle/            # Database migrations
```

## Database Schema

The application uses the following tables:

- `user`: User authentication and profiles
- `category`: Categorization for transactions, assets, and investments
- `transaction`: Income and expense records
- `asset`: Company assets (equipment, property, etc.)
- `investment`: Investment portfolio
- `document`: Financial documents

## API Endpoints

- `GET /api/dashboard` - Get financial summary
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create a new category
- `GET /api/categories/:id` - Get a specific category
- `PUT /api/categories/:id` - Update a category
- `DELETE /api/categories/:id` - Delete a category
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create a new transaction
- `GET /api/transactions/:id` - Get a specific transaction
- `PUT /api/transactions/:id` - Update a transaction
- `DELETE /api/transactions/:id` - Delete a transaction
- `GET /api/assets` - Get all assets
- `POST /api/assets` - Create a new asset
- `GET /api/assets/:id` - Get a specific asset
- `PUT /api/assets/:id` - Update an asset
- `DELETE /api/assets/:id` - Delete an asset
- `GET /api/investments` - Get all investments
- `POST /api/investments` - Create a new investment
- `GET /api/investments/:id` - Get a specific investment
- `PUT /api/investments/:id` - Update an investment
- `DELETE /api/investments/:id` - Delete an investment
- `GET /api/documents` - Get all documents
- `POST /api/documents` - Create a new document
- `GET /api/documents/:id` - Get a specific document
- `PUT /api/documents/:id` - Update a document
- `DELETE /api/documents/:id` - Delete a document

## Deployment

### Using Docker

1. Build the Docker image:
   ```bash
   npm run docker:build
   ```

2. Start the application:
   ```bash
   npm run docker:up
   ```

3. Stop the application:
   ```bash
   npm run docker:down
   ```

## Development

### Database Management

- Generate migrations: `npm run db:generate`
- Push schema changes: `npm run db:push`
- Start database studio: `npm run db:studio`

### Code Quality

- Lint code: `npm run lint`
- Format code: `npm run format` (if configured)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License.
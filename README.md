# Castle-Viz


## Features

### Dashboard Overview
- Real-time financial metrics
- Monthly expense trends with charts
- Quick access to recent transactions
- Categorized spending breakdowns

### Expense Management
- Track payments and bills in one place
- Organize expenses by categories and vendors
- Filter and search through your financial history
- Bulk operations for efficient data management

### Reports & Analytics
- Visual insights into spending patterns
- Date range filtering for detailed analysis
- Category-wise expense breakdowns
- Export capabilities for external analysis

### User Management
- Secure authentication with NextAuth.js
- User-specific data isolation
- Password encryption with bcrypt

## Tech Stack

### Frontend
- **Next.js**
- **TypeScript**
- **Tailwind CSS** 
- **Recharts** 
- **NextAuth.js**

### Backend
- **FastAPI**
- **SQLAlchemy**
- **PostgreSQL** 
- **Pydantic** 
- **Uvicorn**

### Infrastructure
- **Vercel** - Frontend deployment and hosting
- **Railway** - Backend deployment and database hosting

## Database Schema

![Database Schema](https://drive.google.com/uc?export=view&id=1gB3INhMJSI_o13OASkb37O8P6xM2lANc)

### Tables Overview

- **Users** - Stores user authentication and profile information
- **Payments** - Records completed financial transactions
- **Bills** - Tracks pending and paid bills with status management
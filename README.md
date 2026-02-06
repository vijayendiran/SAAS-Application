# Multi-Tenant SaaS Backend

This is a multi-tenant SaaS backend built with Node.js, Express, and MongoDB (via Prisma). It features tenant isolation using subdomains, JWT-based authentication, and Role-Based Access Control (RBAC).

## Features

- **Multi-Tenancy**: Tenant resolution via subdomain (e.g., `company.saas.com`).
- **Authentication**: Secure JWT authentication with BCrypt password hashing.
- **Authorization**: Role-based access control (Admin vs Member).
- **Audit Logging**: Tracks critical actions like Login and User Invites.
- **Rate Limiting**: Protects authentication endpoints from brute-force attacks.
- **Global Error Handling**: Centralized error management.
- **API Versioning**: Scalable API structure (`/api/v1`).

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **ORM**: Prisma
- **Auth**: JSON Web Tokens (JWT)

## Architecture

The project follows a modular MVC-like structure but optimized for Express:
- `src/controllers`: Handles business logic.
- `src/middlewares`: Global and route-specific middleware (Auth, Tenant Resolution, Error Handling).
- `src/routes`: API route definitions.
- `src/utils`: Helper utilities (Audit Logger).
- `prisma/schema.prisma`: Database schema definition.

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB connection string

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd saas-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   DATABASE_URL="mongodb+srv://..."
   JWT_SECRET="your_super_secret_key"
   ```

4. **Database Setup**
   Generate Prisma Client:
   ```bash
   npx prisma generate
   ```
   *Note: Ensure your MongoDB is running or the connection string is valid.*

5. **Run the Server**
   ```bash
   npm run dev
   ```

## API Documentation (v1)

### Authentication (`/api/v1/auth`)

- **POST** `/signup`: Register a new tenant and admin user.
  - Body: `{ "companyName": "...", "subdomain": "...", "name": "...", "email": "...", "password": "..." }`
- **POST** `/login`: Login user.
  - Body: `{ "email": "...", "password": "..." }`

### Users (`/api/v1/users`)

- **POST** `/invite`: Invite a new member (Admin only).
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "name": "...", "email": "...", "password": "..." }`

## Security Features

1. **JWT Authentication**:Stateless authentication mechanism.
2. **Password Hashing**: Passwords are never stored in plain text (using BCrypt).
3. **Rate Limiting**: Limits repeated requests to public APIs (100 req per 15 min).
4. **Tenant Isolation**: Data is logically separated by `tenantId`.

## Audit Logging

Critical actions are logged in the `AuditLog` collection.
- **Login**: Logs successful logins with IP address.
- **User Invite**: Logs who invited whom and when.

## Limitations & Future Scope

- **Email Service**: Currently, user invites do not send real emails. Future work involves integrating SendGrid or AWS SES.
- **Pagination**: API endpoints should implement pagination for scaling.
- **Advanced RBAC**: Granular permissions beyond Admin/Member.

---

## API Reference

## URL's with payload

SIGNUPURL=http://localhost:3000/api/v1/auth/signup
 {
    "companyName": "Gym Two",
    "subdomain": "gym2",
    "name": "Admin User",
    "email": "admin@gym2.com",
    "password": "password123"
}

LOGINURL=http://localhost:3000/api/v1/auth/login
{
    "email": "admin@gym2.com",
    "password": "password123"
}
{
    {
    "token": "eyJhbGci..."
}
}

INVITEURL=http://gym2.localhost:3000/api/v1/users/invite
{
    {
    "name": "New Member",
    "email": "member@gym2.com",
    "password": "securepassword"
}
}
--

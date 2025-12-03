<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

NestJS backend application with authentication module, built with clean architecture principles. This project uses PostgreSQL database, Drizzle ORM, Fastify, and supports multiple authentication methods (Email, Firebase, Code, Guest).

## Features

- 🔐 **Multiple Authentication Methods**: Email/Password, Firebase, Premium Code, and Guest authentication
- 🍪 **HTTP-only Cookie Support**: Secure cookie-based authentication for web clients
- 🔄 **Token Refresh**: JWT access and refresh token mechanism
- 🗄️ **PostgreSQL Database**: Using Drizzle ORM for type-safe database operations
- 📚 **Swagger Documentation**: Auto-generated API documentation
- 🏗️ **Clean Architecture**: Domain, Application, Infrastructure, and Presentation layers
- ⚡ **Fastify**: High-performance HTTP server

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [PostgreSQL](https://www.postgresql.org/download/) (v12 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## Project Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd backend-2.0
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables Setup

Create a `.env` file in the root directory of the project:

```bash
cp .env.example .env  # If you have an example file
# Or create a new .env file
```

#### Required Environment Variables

Add the following environment variables to your `.env` file:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_ACCESS_TOKEN_EXPIRES_IN=3600000
JWT_REFRESH_TOKEN_EXPIRES_IN=86400000

# Firebase Configuration (Optional - only if using Firebase authentication)
FIREBASE_SERVICE_ACCOUNT_PATH=./src/core/config/firebase.admin.json
# OR use individual credentials:
# FIREBASE_PROJECT_ID=your-project-id
# FIREBASE_PRIVATE_KEY=your-private-key
# FIREBASE_CLIENT_EMAIL=your-client-email
```

#### Environment Variables Explanation

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port number | No | `3001` |
| `NODE_ENV` | Environment mode (`development`, `production`) | No | `development` |
| `DATABASE_URL` | PostgreSQL connection string | **Yes** | - |
| `JWT_SECRET` | Secret key for JWT token signing | **Yes** | `jwt-secret` |
| `JWT_ACCESS_TOKEN_EXPIRES_IN` | Access token expiration time in milliseconds or format like `1h`, `24h`, `30d` | No | `3600000` (1 hour) |
| `JWT_REFRESH_TOKEN_EXPIRES_IN` | Refresh token expiration time in milliseconds or format like `1h`, `24h`, `30d` | No | `86400000` (24 hours) |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | Path to Firebase service account JSON file | No* | - |

\* Required only if using Firebase authentication

### 4. PostgreSQL Database Setup

#### Option A: Using Local PostgreSQL

1. **Install PostgreSQL** (if not already installed):
   ```bash
   # macOS (using Homebrew)
   brew install postgresql@14
   brew services start postgresql@14

   # Ubuntu/Debian
   sudo apt-get update
   sudo apt-get install postgresql postgresql-contrib

   # Windows
   # Download and install from https://www.postgresql.org/download/windows/
   ```

2. **Create a Database**:
   ```bash
   # Connect to PostgreSQL
   psql -U postgres

   # Create database
   CREATE DATABASE your_database_name;

   # Create user (optional)
   CREATE USER your_username WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE your_database_name TO your_username;

   # Exit psql
   \q
   ```

3. **Update DATABASE_URL in .env**:
   ```env
   DATABASE_URL=postgresql://your_username:your_password@localhost:5432/your_database_name
   ```

#### Option B: Using Docker PostgreSQL

1. **Run PostgreSQL in Docker**:
   ```bash
   docker run --name postgres-backend \
     -e POSTGRES_USER=your_username \
     -e POSTGRES_PASSWORD=your_password \
     -e POSTGRES_DB=your_database_name \
     -p 5432:5432 \
     -d postgres:14
   ```

2. **Update DATABASE_URL in .env**:
   ```env
   DATABASE_URL=postgresql://your_username:your_password@localhost:5432/your_database_name
   ```

#### Option C: Using Cloud PostgreSQL (Recommended for Production)

Use services like:
- [AWS RDS](https://aws.amazon.com/rds/postgresql/)
- [Google Cloud SQL](https://cloud.google.com/sql/docs/postgres)
- [Azure Database for PostgreSQL](https://azure.microsoft.com/services/postgresql/)
- [Supabase](https://supabase.com/)
- [Neon](https://neon.tech/)

Update `DATABASE_URL` with your cloud database connection string.

### 5. Database Migrations

After setting up PostgreSQL, run database migrations:

```bash
# Generate migration files (if schema changed)
npm run db:generate

# Run migrations
npm run db:migrate
```

### 6. Firebase Setup (Optional)

If you're using Firebase authentication:

1. **Get Firebase Service Account Key**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file

2. **Place the JSON file**:
   ```bash
   # Place it in the specified path from FIREBASE_SERVICE_ACCOUNT_PATH
   # Default: src/core/config/firebase.admin.json
   ```

3. **Add to .gitignore** (already included):
   ```
   src/core/config/firebase.admin.json
   ```

## Running the Application

### Development Mode

```bash
npm run start:dev
```

The application will start on `http://localhost:3001` (or the port specified in `PORT`).

### Production Mode

```bash
# Build the application
npm run build

# Start in production mode
npm run start:prod
```

### Debug Mode

```bash
npm run start:debug
```

## API Documentation

Once the application is running, access the Swagger API documentation at:

```
http://localhost:3001/api
```

## Database Commands

```bash
# Generate migration files from schema changes
npm run db:generate

# Run pending migrations
npm run db:migrate
```

## Project Structure

```
src/
├── core/                    # Core utilities and configurations
│   ├── config/             # Configuration files (Swagger, CORS)
│   ├── dto/                # Base DTOs
│   ├── exceptions/        # Global exception handling
│   └── utils/              # Utility functions
├── infra/                   # Infrastructure layer
│   └── db/                 # Database configuration and schemas
├── modules/                # Feature modules
│   └── authentication/     # Authentication module
│       ├── application/    # Use cases (business logic)
│       ├── domain/          # Domain entities and contracts
│       ├── infrastructure/ # External services (repositories, providers)
│       └── presentation/    # HTTP controllers and DTOs
└── main.ts                 # Application entry point
```

## Authentication Endpoints

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user information

See Swagger documentation at `/api` for detailed endpoint documentation.

## Testing

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## Troubleshooting

### Database Connection Issues

1. **Check PostgreSQL is running**:
   ```bash
   # macOS/Linux
   pg_isready

   # Or check service status
   brew services list  # macOS
   sudo systemctl status postgresql  # Linux
   ```

2. **Verify DATABASE_URL format**:
   ```
   postgresql://username:password@host:port/database_name
   ```

3. **Check firewall/network settings** if using remote database

### JWT Token Issues

- Ensure `JWT_SECRET` is set and is a strong, random string
- Check token expiration times are set correctly
- Verify tokens are being sent in requests (cookies or headers)

### Firebase Authentication Issues

- Verify `firebase.admin.json` file exists and is valid
- Check `FIREBASE_SERVICE_ACCOUNT_PATH` points to the correct file
- Ensure Firebase project has Authentication enabled

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

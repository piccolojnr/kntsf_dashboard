# Permit Management System

Welcome to the Permit Management System – a modern web application designed to
streamline the process of creating, tracking, and managing permits for students,
staff, and administrators.


## What is this app?


This system helps organizations efficiently handle permit requests, approvals,
and renewals. It also provides tools for managing students, events, news,
newsletters, and more, all in one place.


## Key Features

- **Secure Management:** Advanced authentication and authorization to keep your
  data safe.
- **Real-time Tracking:** Instantly see the status of permits, expiration dates,
  and receive renewal notifications.
- **Easy Verification:** Quickly verify permits to reduce administrative
  overhead.
- **Student Management:** Add, update, and manage student records.
- **Document Management:** Upload, preview, and manage important documents.
- **Event Management:** Create, edit, and promote events.
- **News & Announcements:** Publish news articles and updates.
- **Newsletter System:** Manage subscribers, send newsletters, and track
  engagement.
- **Payments:** Integrated payment processing for permit fees.
- **Admin Dashboard:** Powerful tools for administrators to manage users, roles,
  settings, and reports.

## How to Get Started

1. **Clone the repository** and install dependencies:
   ```bash
   npm install
   ```
2. **Start the development server:**
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

> For more details on configuration, database setup, and deployment, see the
> documentation in the `docs/` folder.

## Development Mobile Test Credentials

After running `pnpm prisma:seed`, these development credentials are available for
testing the mobile API:

| Role | Username | Password |
| --- | --- | --- |
| Admin | `admin` | `admin123` |
| Staff | `abdulai.abdulai` | `exec123` |
| Student | `student` | `student123` |

These credentials are for local development only. Do not use them in production
or shared staging databases.

## Windows Prisma Generate Troubleshooting

If `pnpm prisma generate` fails on Windows with an `EPERM` error while renaming
`query_engine-windows.dll.node`, a running process is usually locking Prisma's
generated client files.

1. Stop the Next.js development server.
2. Stop Prisma Studio if it is open.
3. Stop any other Node.js process using this project.
4. Rerun `pnpm prisma generate`.

## Project Structure

- **src/app/** – Main application pages and API routes.
- **src/components/** – Reusable UI components and feature modules.
- **src/lib/** – Utilities, services, and backend integrations.
- **prisma/** – Database schema and migration files.
- **docs/** – Additional documentation.

## Technologies Used

- **Next.js** – Modern React framework for web apps.
- **Prisma** – Type-safe database ORM (MySQL).
- **Tailwind CSS** – Utility-first CSS framework.
- **Paystack** – Payment integration.
- **Cloudinary** – Image and file management.
- **Other:** Modern authentication, role-based access, and more.

## Support & Contact

For questions, support, or to contribute, please open an issue or contact the
project maintainers.

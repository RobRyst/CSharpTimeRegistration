#Time Registration

A full-stack application for tracking time, managing projects, and generating statistics with PDF exports.
Built with ASP.NET Core, Entity Framework, React, and modern UI libraries.

##📌 Project Overview

TimeTrackPro is a full-stack time registration system that enables:

👤 User management with role-based access (Admin vs. User)

⏱️ Time registration with daily start/end tracking & comments

📊 Project tracking with hours logged, statuses, and assignments

🗂️ Statistics & Reporting with weekly/monthly summaries and per-user breakdowns

🧾 PDF export of project overviews and filtered time registration reports

🗑️ Edit & delete capabilities with role-aware restrictions

##🚀 Tech Stack
###⚙️ Backend (API)

- .NET 8 / C# – ASP.NET Core Web API

- Entity Framework Core – Persistence with SQL Server / SQLite

- Identity + JWT Authentication – Role-based access (Admin/User)

- Swashbuckle / Swagger – API exploration

- ILogger – Centralized error logging

##💻 Frontend (Web App)

- React 18 + Vite – Fast SPA frontend

- Ag-Grid – Interactive data grid for time registrations

- AG Charts – Statistics visualization (weekly/monthly per user/project)

- SweetAlert2 – Modern dialogs for edit/delete/confirm actions

- Axios – API communication with JWT headers

- Tailwind CSS + shadcn/ui – Modern UI components & styling

##✨ Features
###⏱️ Time Registration

- Add, edit, and delete time entries (with role restrictions)

- Track daily hours with start/end times & comments

- Validation (only ±30 days for regular users, unlimited for admins)

##📦 Project Management

- Create, update, and delete projects

- Restrict deletion if linked time registrations exist

- Status-based filtering (Pending, Ongoing, Completed, Cancelled)

##📊 Statistics & Reporting

- Hours per project (all-time, monthly, weekly)

- User breakdown within projects

- Single-user detailed totals

- Visual charts with AG Charts

##🧾 PDF Export

- Export all projects overview

- Export filtered time registrations (per user, project, status, timeline)

- Download user/project statistics

##⚠️ Logging & Error Handling

- Full error messages displayed in SweetAlert2 dialogs

- Backend logging for failed operations (e.g., project deletion conflicts)

- User-friendly validation messages

##🧱 Architecture

- Service Layer – TimeRegistrationService, ProjectService, UserService

- Repository/EF Layer – Persistence with SQL migrations

- Integration Layer (API) – REST endpoints for CRUD, filtering, and statistics

- Frontend Layer – React components with grids, charts, and dropdown filters

##🧠 What I Learned

- This project deepened my skills in full-stack app development with a focus on productivity tooling and analytics.

- ASP.NET Core API & Authentication

- Built a secure API with JWT + role-based claims (Admin vs. User).

- Implemented business rules (e.g., project deletion constraints, ±30-day edit window).

- Entity Framework Core

- Designed relational models for Users, Projects, TimeRegistrations.

- Applied query filtering & aggregation for statistics.

- React + Ag-Grid

- Learned to build highly interactive tables with custom cell renderers for editing, deleting, and status updates.

- AG Charts for Data Visualization

- Created weekly/monthly charts of project and user hours.

- Enhanced UX with drill-down (project → users → single user).

- PDF Export & Data Filtering

- Implemented server-side PDF report generation with query filters.

- Synced frontend dropdown filters with backend queries.

- Clean Architecture & Error Handling

- Enforced separation of concerns with services & DTOs.

- Strengthened handling of conflicts (e.g., blocking deletion of referenced projects).

- Improved error reporting with clear SweetAlert2 modals.

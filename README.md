# Smart Campus Operations Hub

A full-stack web application built for the PAF assignment to manage campus resources, bookings, support tickets, and user administration.

## Project Structure

- `frontend` - React + Vite client application
- `backend` - Spring Boot REST API

## Core Features

- **User Authentication**: Secure login via OAuth 2.0 (Google Sign-In) and role-based access control.
- **Resource Management**: Comprehensive Facilities & Assets Catalogue for lecture halls, labs, and equipment.
- **Booking Management**: Streamlined workflow for creating requests with conflict detection and admin approval.
- **Incident Ticketing**: Robust maintenance ticketing system with image attachments and status tracking.
- **Notifications**: Real-time updates for approvals, status changes, and system alerts.

## Tech Stack

- **Frontend**: React, Vite, React Router, Axios, Tailwind CSS
- **Backend**: Spring Boot, Spring Security, Spring Data JPA, Maven
- **Database**: MySQL (primary), H2 (local development profile)

## Group Members & Responsibilities

| Student ID | Name | Responsibilities |
|------------|------|------------------|
| **IT23293144** | **R.A.N.G. Ranathunga** | **Authentication, Profile & Notifications**: Implemented OAuth 2.0 (Google Sign-In), role-based access control, user profile management, and a real-time notification system. |
| **IT23282322** | **K.D.C. Manubasha** | **Facilities & Assets Catalogue**: Developed the resource management module (CRUD operations) for lecture halls, labs, and equipment, including advanced search and status management. |
| **IT23273412** | **D.G.A. Indeepa** | **Booking Management**: Created the complete booking workflow, including conflict detection for overlapping time slots and the administrator approval/rejection process. |
| **IT23280656** | **Sayumi Halwala** | **Maintenance & Incident Ticketing**: Implemented the ticketing system with image attachments, technician assignment, status lifecycle management, and resolution notes. |

## Running the Project

### 1) Start Backend

```bash
cd backend
./mvnw spring-boot:run
```

Backend runs on `http://localhost:8080`.

### 2) Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

---
*Smart Campus Operations Hub - 2026*

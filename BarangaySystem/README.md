# Barangay Resident and Request System (Linkod Bayan)

A full-stack web application that helps a barangay office manage its residents and the document requests they file.

**Live link:** https://barangaysystemrepo.onrender.com
(Hosted on Render's free tier, so the first load can take up to a minute.)

**GitHub repository:** https://github.com/sevillaaa919/BarangaySystemRepo

**Built with:** MongoDB Atlas + Mongoose, Node.js + Express, and plain HTML, CSS, and JavaScript with `fetch` (no frameworks).

## Group Information

- **Group number:** Group 3
- **System topic:** Barangay Resident and Request System

| Member | Role |
|---|---|
| Cura, John Benedict | Frontend, Backend |
| Cuchapin, Joe Allen | Backend, Database |
| Espino, Agile Andre | Frontend, Database |

## Features

- Register, view, edit, and delete residents
- File a document request (Barangay Clearance, Certificate of Residency, or Certificate of Indigency) for a resident
- Update the status of a request (Pending, Approved, Released, Cancelled)
- Search residents by name, and filter by purok and sex
- Filter requests by type and status
- Dashboard with counts of residents and pending, approved, and released requests
- Extras: printable certificate, CSV export of residents, announcements, and admin login

## Database

| Collection | Fields |
|---|---|
| `residents` | firstName, lastName, birthdate, sex, purok, address, contactNumber |
| `requests` | resident (reference to a resident), type, purpose, status |

The system also has `announcements` and `admins` collections.

## REST API

All routes return JSON and need the admin to be logged in (otherwise 401).

| Method | Route | Purpose |
|---|---|---|
| GET | `/residents` | Get all residents |
| GET | `/residents/:id` | Get one resident |
| POST | `/residents` | Add a resident |
| PUT | `/residents/:id` | Update a resident |
| DELETE | `/residents/:id` | Delete a resident and their requests |
| GET | `/requests` | Get all requests |
| POST | `/requests` | File a new request |
| PUT | `/requests/:id` | Update the status of a request |
| GET | `/stats` | Get the dashboard counts |

Status codes used: 200, 201, 400, 401, 404, and 500.

## Validation

- Required fields are checked for residents, requests, and announcements
- Birthdate cannot be in the future, and the contact number must be a valid format
- The same resident cannot be registered twice
- Success and error messages show as pop-ups on the page

## How to Run on Your Computer

1. Create a file named `.env` in the main project folder (beside `backend` and `frontend`):

   ```
   MONGO_URI=your_mongodb_connection_string
   PORT=3000
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your_admin_password
   SESSION_SECRET=any_long_random_text
   ```

2. Open a terminal and run:

   ```
   cd backend
   npm install
   npm start
   ```

3. Open http://localhost:3000 and log in with the admin username and password from your `.env` file. The admin account is created automatically on the first start.

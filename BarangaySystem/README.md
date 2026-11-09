# Barangay Resident and Request System (Linkod Bayan)

A full-stack web application that helps a barangay office manage its residents, the document requests they file, and the office announcements in one place.

**Live link:** https://barangaysystemrepo.onrender.com

> The app is hosted on Render's free tier, so it goes to sleep when it is not used. The first load can take up to a minute.

**GitHub repository:** https://github.com/sevillaaa919/BarangaySystemRepo

## Group Information

- **Group number:** Group 3
- **System topic:** Barangay Resident and Request System
- **Course:** Web Development, Final Project

| Member | Role |
|---|---|
| Cura, John Benedict | Frontend, Backend |
| Cuchapin, Joe Allen | Backend, Database |
| Espino, Agile Andre | Frontend, Database |

## Tech Stack

- **Database:** MongoDB Atlas, accessed through Mongoose
- **Back end:** Node.js and Express (REST API that returns JSON)
- **Front end:** HTML, CSS, and plain JavaScript only, using `fetch` (no frameworks)
- **Hosting:** Render (app) and MongoDB Atlas (database)

## Features

- **Register residents** and view them in a table
- **Edit and delete residents** (deleting a resident also removes their requests)
- **File a document request** (Barangay Clearance, Certificate of Residency, or Certificate of Indigency) for a resident
- **Update the status of a request** (Pending, Approved, Released, Cancelled)
- **Search a resident** by name
- **Filters:** residents by purok and sex, and requests by type and status
- **Dashboard counts:** total residents, pending, approved and released requests, residents by sex, top puroks, and recent requests
- **Extras:** printable certificate for approved or released requests, CSV export of residents, announcements, and an admin login

## Database Design

The system has two main related collections. The `requests` collection points to the `residents` collection through the `resident` field.

| Collection | Fields |
|---|---|
| `residents` | firstName, lastName, birthdate, sex, purok, address, contactNumber, createdAt, updatedAt |
| `requests` | resident (reference to a resident), type, purpose, status, createdAt, updatedAt |
| `announcements` | title, message, author, createdAt, updatedAt |
| `admins` | username, passwordHash (the password is hashed with bcrypt) |

## REST API

All routes return JSON. Every route except `/login` and `/logout` needs the admin to be logged in, otherwise the server answers with 401.

| Method | Route | Purpose |
|---|---|---|
| POST | `/login` | Log in as admin |
| POST | `/logout` | Log out |
| GET | `/me` | Check who is logged in |
| GET | `/residents` | Get all residents |
| GET | `/residents/:id` | Get one resident |
| POST | `/residents` | Add a resident |
| PUT | `/residents/:id` | Update a resident |
| DELETE | `/residents/:id` | Delete a resident and their requests |
| GET | `/requests` | Get all requests (with the resident's name) |
| GET | `/requests/:id` | Get one request |
| POST | `/requests` | File a new request |
| PUT | `/requests/:id` | Update the status of a request |
| GET | `/stats` | Get the counts shown in the dashboard |
| GET | `/announcements` | Get all announcements |
| POST | `/announcements` | Post an announcement |
| DELETE | `/announcements/:id` | Delete an announcement |

**Status codes used:** 200 (success), 201 (created), 400 (invalid data or bad id), 401 (not logged in or wrong login), 404 (record not found), and 500 (server error).

## Validation and Error Handling

- Required fields: first name, last name, birthdate, sex, and purok for residents; resident and type for requests; title and message for announcements
- Birthdate cannot be in the future
- Sex must be Male or Female
- Contact number must contain only numbers, spaces, plus, or dash, with 7 to 15 characters
- Request type and status must be one of the allowed values
- The same resident (same name and birthdate) cannot be registered twice
- A request can only be filed for a resident that exists
- Success and error messages appear as pop-up messages on the page, and deleting asks for confirmation first

## Folder Structure

```
BarangaySystem/
├── backend/
│   ├── server.js        Express server, Mongoose models, and routes
│   └── package.json
├── frontend/
│   ├── index.html       Main page
│   ├── style.css        Styles
│   ├── script.js        Shared functions (fetch helper, routing, messages)
│   ├── login.js         Login page
│   ├── dashboard.js     Dashboard page
│   ├── residents.js     Residents page
│   ├── requests.js      Requests page
│   ├── certificate.js   Printable certificate
│   └── sources/
│       └── images.js    Logo and background image links
├── .gitignore
└── README.md
```

## How to Run on Your Computer

1. Install Node.js and create a free cluster on MongoDB Atlas.
2. Create a file named `.env` in the main project folder (the folder beside `backend` and `frontend`) and put the following inside it:

   ```
   MONGO_URI=your_mongodb_connection_string
   PORT=3000
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your_admin_password
   SESSION_SECRET=any_long_random_text
   ```

3. Open a terminal and go to the backend folder:

   ```
   cd backend
   ```

4. Install the packages:

   ```
   npm install
   ```

5. Start the server:

   ```
   npm start
   ```

6. Open http://localhost:3000 in your browser and log in with the admin username and password from your `.env` file. The admin account is created automatically the first time the server starts.

## Deployment

The system is deployed online using MongoDB Atlas and Render.

1. Push the project to GitHub (the `.env` file is not uploaded because it is in `.gitignore`).
2. In Render, create a new **Web Service** from the GitHub repository.
3. Set **Root Directory** to `backend`, **Build Command** to `npm install`, and **Start Command** to `npm start`.
4. Add the environment variables `MONGO_URI`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `SESSION_SECRET` in Render.
5. In MongoDB Atlas, under Network Access, allow access from `0.0.0.0/0` so Render can connect to the database.
6. Deploy. Render gives the live link shown at the top of this file.

## Admin Login

The system is for the barangay admin only. Use the admin username and password that were set in the `ADMIN_USERNAME` and `ADMIN_PASSWORD` environment variables. Ask the group for the login details for the demo.

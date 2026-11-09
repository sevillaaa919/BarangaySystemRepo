Barangay Resident and Request System

This is a full-stack web application that helps a barangay office manage the records of its residents, the document requests that they file, and the announcements of the office in one place. The front end is built with HTML, CSS, and JavaScript, the back end is built with Node.js and Express, and the data is stored in MongoDB Atlas through Mongoose.

How to run the system

1. Create a file named .env in the main project folder, which is the folder beside the backend and frontend folders, and put the following inside it. For example, the MONGO_URI is the connection string from your MongoDB Atlas account, and the ADMIN_PASSWORD is the password that you want to use for the admin.

   MONGO_URI=your_mongodb_connection_string
   PORT=3000
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your_admin_password
   SESSION_SECRET=any_long_random_text

2. Open a terminal and go to the backend folder by typing: cd backend
3. Install the packages that the system needs by typing: npm install
4. Start the server by typing: npm start
5. Open http://localhost:3000 in your browser.

Folders

The backend folder contains server.js, which has the Express server, the Mongoose models, and the routes of the system. The frontend folder contains index.html, script.js, style.css, and one file for each page of the system. Inside the frontend folder there is also a sources folder, where images.js holds the image links for the logo and the page backgrounds. For example, you can paste a link between the quotes to show an image, and if you leave it empty then no image will be shown.

Routes

The system uses the following routes, which allow the front end to get and save the information in the database.
- /residents is used to get, add, update, and delete resident records.
- /requests is used to get, add, and update document requests.
- /announcements is used to get, add, and delete announcements.
- /stats is used to get the counts that are shown in the dashboard.
- /me is used to check who is currently logged in.

Group members and roles

Group number: Group 3
System topic: Barangay Resident and Request System

- Cura, John Benedict - frontend, backend
- Cuchapin, Joe Allen - backend, database
- Espino, Agile Andre - frontend, database
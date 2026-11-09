const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const bcrypt = require("bcryptjs");

const app = express();

app.use(express.json());

app.use(express.static(path.join(__dirname, "..", "frontend")));

const residentSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  birthdate: { type: Date, required: true, max: [Date.now, "Birthdate cannot be in the future"] },
  sex: { type: String, enum: ["Male", "Female"], required: true },
  purok: { type: String, required: true, trim: true },
  address: { type: String, trim: true },
  contactNumber: { type: String, trim: true, match: [/^[0-9+\-\s]{7,15}$/, "Invalid contact number"] }
}, { timestamps: true });

const requestSchema = new mongoose.Schema({
  resident: { type: mongoose.Schema.Types.ObjectId, ref: "Resident", required: true },
  type: { type: String, required: true, enum: ["Barangay Clearance", "Certificate of Residency", "Certificate of Indigency"] },
  purpose: { type: String, trim: true },
  status: { type: String, enum: ["Pending", "Approved", "Released", "Cancelled"], default: "Pending" }
}, { timestamps: true });

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true }
});

const Resident = mongoose.model("Resident", residentSchema);
const DocRequest = mongoose.model("Request", requestSchema);
const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  author: { type: String }
}, { timestamps: true });

const Admin = mongoose.model("Admin", adminSchema);
const Announcement = mongoose.model("Announcement", announcementSchema);

app.use(session({
  secret: process.env.SESSION_SECRET || "dev-secret-change-me",
  resave: false,
  saveUninitialized: false
}));

app.post("/login", async (req, res) => {
  try {
    const admin = await Admin.findOne({ username: String(req.body.username || "") });
    const match = admin && await bcrypt.compare(String(req.body.password || ""), admin.passwordHash);

    if (!match) {
      return res.status(401).json({ error: "Wrong username or password" });
    }
    req.session.admin = admin.username;
    res.json({ username: admin.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

function needLogin(req, res, next) {
  if (req.session.admin) {
    next();
  } else {
    res.status(401).json({ error: "Please log in" });
  }
}
app.use(["/residents", "/requests", "/stats", "/announcements", "/me"], needLogin);
app.get("/residents", async (req, res) => {
  try {
    const residents = await Resident.find().sort({ lastName: 1 });
    res.json(residents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/residents/:id", async (req, res) => {
  try {
    const resident = await Resident.findById(req.params.id);
    if (!resident) {
      return res.status(404).json({ error: "Resident not found" });
    }
    res.json(resident);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/residents", async (req, res) => {
  try {
    const same = await Resident.exists({
      firstName: String(req.body.firstName || "").trim(),
      lastName: String(req.body.lastName || "").trim(),
      birthdate: req.body.birthdate
    }).collation({ locale: "en", strength: 2 });

    if (same) {
      return res.status(400).json({ error: "This resident is already registered" });
    }

    const newResident = new Resident({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      birthdate: req.body.birthdate,
      sex: req.body.sex,
      purok: req.body.purok,
      address: req.body.address,
      contactNumber: req.body.contactNumber
    });
    const saved = await newResident.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put("/residents/:id", async (req, res) => {
  try {
    const updated = await Resident.findByIdAndUpdate(
      req.params.id,
      {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        birthdate: req.body.birthdate,
        sex: req.body.sex,
        purok: req.body.purok,
        address: req.body.address,
        contactNumber: req.body.contactNumber
      },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ error: "Resident not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/residents/:id", async (req, res) => {
  try {
    const deleted = await Resident.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Resident not found" });
    }
    await DocRequest.deleteMany({ resident: req.params.id });
    res.json(deleted);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/requests", async (req, res) => {
  try {
    const requests = await DocRequest.find()
      .populate("resident", "firstName lastName")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/requests/:id", async (req, res) => {
  try {
    const request = await DocRequest.findById(req.params.id).populate("resident");
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }
    res.json(request);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/requests", async (req, res) => {
  try {
    const residentExists = await Resident.exists({ _id: req.body.resident });
    if (!residentExists) {
      return res.status(400).json({ error: "Choose a valid resident" });
    }

    const newRequest = new DocRequest({
      resident: req.body.resident,
      type: req.body.type,
      purpose: req.body.purpose
    });
    const saved = await newRequest.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put("/requests/:id", async (req, res) => {
  try {
    const updated = await DocRequest.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ error: "Request not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/me", (req, res) => {
  res.json({ username: req.session.admin });
});

app.get("/stats", async (req, res) => {
  try {
    const residents = await Resident.countDocuments();
    const pending = await DocRequest.countDocuments({ status: "Pending" });
    const approved = await DocRequest.countDocuments({ status: "Approved" });
    const released = await DocRequest.countDocuments({ status: "Released" });
    const male = await Resident.countDocuments({ sex: "Male" });
    const female = await Resident.countDocuments({ sex: "Female" });
    const puroks = await Resident.aggregate([
      { $group: { _id: "$purok", total: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: 6 }
    ]);
    const recent = await DocRequest.find()
      .populate("resident", "firstName lastName")
      .sort({ createdAt: -1 })
      .limit(5);
    res.json({ residents, pending, approved, released, male, female, puroks, recent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/announcements", async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/announcements", async (req, res) => {
  try {
    const newAnnouncement = new Announcement({
      title: req.body.title,
      message: req.body.message,
      author: req.session.admin
    });
    const saved = await newAnnouncement.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/announcements/:id", async (req, res) => {
  try {
    const deleted = await Announcement.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Announcement not found" });
    }
    res.json(deleted);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB");

        if (process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
      const exists = await Admin.exists({ username: process.env.ADMIN_USERNAME });
      if (!exists) {
        await Admin.create({
          username: process.env.ADMIN_USERNAME,
          passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10)
        });
        console.log("Admin account created: " + process.env.ADMIN_USERNAME);
      }
    } else if (!(await Admin.exists({}))) {
      console.log("No admin yet: set ADMIN_USERNAME and ADMIN_PASSWORD in .env, then restart");
    }
    app.listen(PORT, () => {
      console.log("port " + PORT + " is running...");
    });
  })
  .catch((err) => console.log("MongoDB connection failed:", err.message));

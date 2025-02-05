const express = require("express");
const multer = require("multer");
const Note = require("../models/Note");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Add a new note
router.post("/add", authMiddleware, upload.fields([{ name: "image" }, { name: "audio" }]), async (req, res) => {
  try {
    console.log("Request to add note received", { body: req.body, files: req.files });

    if (!req.body.title || !req.body.text) {
      return res.status(400).json({ error: "Title and text are required" });
    }

    const image = req.files?.image?.[0]?.path || null;
    const audio = req.files?.audio?.[0]?.path || null;

    const newNote = new Note({
      title: req.body.title,
      text: req.body.text,
      image,
      audio,
      user: req.user.id,
    });

    await newNote.save();
    console.log("Note successfully saved:", newNote);
    res.status(201).json(newNote);
  } catch (err) {
    console.error("Error adding note:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Fetch all notes for the authenticated user
router.get("/", authMiddleware, async (req, res) => {
  try {
    console.log("Fetching notes for user:", req.user.id);
    const notes = await Note.find({ user: req.user.id });

    console.log("Notes found:", notes.length);
    res.json(notes);
  } catch (err) {
    console.error("Error fetching notes:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Fetch a single note by ID
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    console.log(`Fetching note with ID: ${req.params.id}`);

    const note = await Note.findById(req.params.id);
    if (!note) {
      console.warn("Note not found:", req.params.id);
      return res.status(404).json({ error: "Note not found" });
    }

    if (note.user.toString() !== req.user.id) {
      console.warn("Unauthorized access attempt by user:", req.user.id);
      return res.status(403).json({ error: "Unauthorized" });
    }

    console.log("Note found:", note);
    res.json(note);
  } catch (err) {
    console.error("Error fetching note:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Delete a note
router.delete("/delete/:id", authMiddleware, async (req, res) => {
  try {
    console.log(`Request to delete note with ID: ${req.params.id}`);

    const note = await Note.findById(req.params.id);
    if (!note) {
      console.warn("Attempt to delete non-existing note:", req.params.id);
      return res.status(404).json({ error: "Note not found" });
    }

    if (note.user.toString() !== req.user.id) {
      console.warn("Unauthorized delete attempt by user:", req.user.id);
      return res.status(403).json({ error: "Unauthorized" });
    }

    await Note.findByIdAndDelete(req.params.id);
    console.log("Note deleted successfully:", req.params.id);
    res.json({ message: "Note deleted successfully" });
  } catch (err) {
    console.error("Error deleting note:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

module.exports = router;

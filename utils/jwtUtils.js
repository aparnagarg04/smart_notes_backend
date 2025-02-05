const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

const verifyToken = (req, res, next) => {
  const authHeader = req.header("Authorization");
  
  console.log("Received Authorization Header:", authHeader); // Debugging

  if (!authHeader) {
      return res.status(403).json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1]; // Extract token from "Bearer <token>"

  if (!token) {
      return res.status(403).json({ message: "Invalid token format." });
  }

  try {
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      req.user = verified;
      next();
  } catch (err) {
      res.status(401).json({ message: "Invalid token." });
  }
};

module.exports = { generateToken, verifyToken };
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  console.log("Protect middleware called for:", req.method, req.path);
  let token;
  console.log("Authorization header:", req.headers.authorization);
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log("Extracted token:", token);
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "defaultsecret");
      console.log("Decoded token:", decoded);
req.user = await User.findById(decoded.id || decoded._id).select("-password");

      console.log("User found:", req.user ? req.user._id : "No user");
      next();
    } catch (err) {
      console.error("Token verification error:", err.message);
      return res.status(401).json({ error: "Not authorized" });
    }
  } else {
    console.log("No Authorization header or not Bearer");
    return res.status(401).json({ error: "No token, not authorized" });
  }
};

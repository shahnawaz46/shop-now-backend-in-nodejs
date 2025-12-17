import { verifyAccessToken } from "../utils/generateToken.js";

export const verification = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const decodedToken = verifyAccessToken(token);
    req.data = decodedToken;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Authentication required" });
  }
};

export const userMiddleware = (req, res, next) => {
  if (req.data.role !== "user") {
    return res.status(401).json({ msg: "Access denied" });
  }
  next();
};

export const adminMiddleware = (req, res, next) => {
  if (req.data.role !== "admin") {
    return res.status(401).json({ msg: "Access denied" });
  }
  next();
};

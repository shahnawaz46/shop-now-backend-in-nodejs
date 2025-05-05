import jwt from 'jsonwebtoken';

export const verification = (token) => {
  return (req, res, next) => {
    try {
      const getToken = req.cookies[token];
      const verified = jwt.verify(getToken, process.env.JWT_SECRET);
      req.data = verified;
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Authorization denied' });
    }
  };
};

export const userMiddleware = (req, res, next) => {
  if (req.data.role !== 'user') {
    return res.status(401).json({ msg: 'Access denied' });
  }
  next();
};

export const adminMiddleware = (req, res, next) => {
  if (req.data.role !== 'admin') {
    return res.status(401).json({ msg: 'Access denied' });
  }
  next();
};

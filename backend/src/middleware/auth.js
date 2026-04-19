const { verifyToken } = require('../utils/auth');
const { User, Student } = require('../models');

function getAuthUser(req) {
  if (!req.user) {
    throw new Error('User not authenticated');
  }
  return req.user;
}

function getTokenFromRequest(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const cookies = cookieHeader.split(';');
    for (const c of cookies) {
      const [key, value] = c.trim().split('=');
      if (key === 'token') {
        return decodeURIComponent(value);
      }
    }
  }

  return null;
}

async function authMiddleware(req, res, next) {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      res.status(401).json({ error: 'Authentication token missing' });
      return;
    }

    const decoded = verifyToken(token);

    if (!decoded || !decoded.sub) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    // Try User collection first
    let user = await User.findById(decoded.sub).lean();

    if (user) {
      req.user = {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        meta: user.meta,
      };
      req.decoded = decoded;
      return next();
    }

    // Fallback: check Student collection
    const student = await Student.findById(decoded.sub).lean();

    if (student) {
      req.user = {
        _id: student._id.toString(),
        name: student.name,
        email: student.studentEmail,
        role: 'student',
        meta: { class: student.className },
      };
      req.decoded = decoded;
      return next();
    }

    res.status(401).json({ error: 'User no longer exists' });
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Access denied',
        requiredRoles: roles,
        userRole: req.user.role,
      });
      return;
    }

    next();
  };
}

const requireAdmin = requireRole('admin');
const requireTeacherOrAdmin = requireRole('teacher', 'admin');
const requireUserAccess = requireRole('student', 'parent', 'admin');

module.exports = {
  getAuthUser,
  authMiddleware,
  requireRole,
  requireAdmin,
  requireTeacherOrAdmin,
  requireUserAccess,
};

const { User, Student } = require('../models');
const { comparePasswords, signToken, toClientUser, hashPassword, getMetaValue } = require('../utils/auth');

async function login(req, res) {
  try {
    if (!req.body.username || !req.body.password) {
      res.status(400).json({ error: 'Username and password are required' });
      return;
    }

    const { username, password, role } = req.body;

    // First check Users collection (teacher, parent, admin)
    const user = await User.findOne({ username }).select('+passwordHash');

    if (user) {
      if (role && user.role !== role) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      if (user.isActive === false) {
        res.status(403).json({ error: 'Account is deactivated' });
        return;
      }

      const isValidPassword = await comparePasswords(password, user.passwordHash);
      if (!isValidPassword) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const token = signToken(user._id.toString(), user.role);
      const clientUser = toClientUser(user);

      res.json({ user: clientUser, token });
      return;
    }

    // Not found in Users — check Students collection
    const student = await Student.findOne({ username });

    if (student) {
      if (role && role !== 'student') {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      if (student.isActive === false) {
        res.status(403).json({ error: 'Account is deactivated' });
        return;
      }

      if (!student.passwordHash) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const isValidPassword = await comparePasswords(password, student.passwordHash);
      if (!isValidPassword) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const token = signToken(student._id.toString(), 'student');
      const clientUser = {
        id: student._id.toString(),
        name: student.name,
        username: student.username,
        email: student.studentEmail,
        role: 'student',
        avatar: null,
        meta: { class: student.className },
      };

      res.json({ user: clientUser, token });
      return;
    }

    // Not found in either collection
    res.status(401).json({ error: 'Invalid credentials' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      error: 'Login failed',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
}

async function getMe(req, res) {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Check User collection first
    const user = await User.findById(req.user._id);

    if (user) {
      if (user.isActive === false) {
        res.status(403).json({ error: 'Account is deactivated' });
        return;
      }
      res.json({ user: toClientUser(user) });
      return;
    }

    // Fallback: check Student collection
    const student = await Student.findById(req.user._id);

    if (student) {
      if (student.isActive === false) {
        res.status(403).json({ error: 'Account is deactivated' });
        return;
      }
      res.json({
        user: {
          id: student._id.toString(),
          name: student.name,
          username: student.username,
          email: student.studentEmail,
          role: 'student',
          avatar: null,
          meta: { class: student.className },
        },
      });
      return;
    }

    res.status(404).json({ error: 'User not found' });
  } catch (err) {
    console.error('GetMe error:', err);
    res.status(500).json({
      error: 'Failed to fetch user profile',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
}

async function refreshToken(req, res) {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Check User collection first
    const user = await User.findById(req.user._id);
    if (user) {
      if (user.isActive === false) {
        res.status(403).json({ error: 'Account is deactivated' });
        return;
      }
      const token = signToken(user._id.toString(), user.role);
      const clientUser = toClientUser(user);
      res.json({ user: clientUser, token, message: 'Token refreshed successfully' });
      return;
    }

    // Fallback: check Student collection
    const student = await Student.findById(req.user._id);
    if (student) {
      if (student.isActive === false) {
        res.status(403).json({ error: 'Account is deactivated' });
        return;
      }
      const token = signToken(student._id.toString(), 'student');
      const clientUser = {
        id: student._id.toString(),
        name: student.name,
        username: student.username,
        email: student.studentEmail,
        role: 'student',
        avatar: null,
        meta: { class: student.className },
      };
      res.json({ user: clientUser, token, message: 'Token refreshed successfully' });
      return;
    }

    res.status(404).json({ error: 'User not found' });
  } catch (err) {
    console.error('RefreshToken error:', err);
    res.status(500).json({
      error: 'Failed to refresh token',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
}


async function resetPassword(req, res) {
  try {
    const { email, name, dob, newPassword, role } = req.body;
    if (!email || !name || !newPassword || newPassword.length < 4) {
      res.status(400).json({ error: 'Missing required fields or password too short' });
      return;
    }

    const query = { email, name };
    if (role) {
      query.role = role;
    }

    const user = await User.findOne(query);
    if (!user) {
      res.status(404).json({ error: 'User not found with matching details' });
      return;
    }

    user.passwordHash = await hashPassword(newPassword);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
}

module.exports = {
  login,
  getMe,
  refreshToken,
  resetPassword,
};

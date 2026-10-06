import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/database.js';
import { authenticateToken, AuthRequest, JWT_SECRET } from '../middleware/auth.js';

const router = Router();

// 1. Customer Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ Họ tên, Email và Mật khẩu' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Định dạng Email không hợp lệ' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Mật khẩu phải chứa ít nhất 8 ký tự' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Xác nhận mật khẩu không khớp' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = db.findUserByEmail(cleanEmail);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email này đã được đăng ký trong hệ thống' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = db.createUser({
      name: name.trim(),
      email: cleanEmail,
      phone: phone ? phone.trim() : '',
      address: address ? address.trim() : '',
      passwordHash,
      role: 'CUSTOMER',
      status: 'ACTIVE',
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const safeUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone || '',
      address: newUser.address || '',
      role: newUser.role,
      avatar: newUser.avatar || '',
      status: newUser.status,
      createdAt: newUser.createdAt,
    };

    return res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công',
      token,
      user: safeUser,
      data: {
        token,
        user: safeUser,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi đăng ký', error: error.message });
  }
});

// 2. Customer Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập Email và Mật khẩu' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = db.findUserByEmail(cleanEmail);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác' });
    }

    if (user.status === 'BLOCKED') {
      return res.status(403).json({ success: false, message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ cửa hàng.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      address: user.address || '',
      role: user.role,
      avatar: user.avatar || '',
      status: user.status,
      createdAt: user.createdAt,
    };

    return res.json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      user: safeUser,
      data: {
        token,
        user: safeUser,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi đăng nhập', error: error.message });
  }
});

// 3. Dedicated Admin Login (Strict role check)
router.post('/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập Email và Mật khẩu quản trị' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = db.findUserByEmail(cleanEmail);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu quản trị không chính xác' });
    }

    if (user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Từ chối truy cập: Tài khoản này không có thẩm quyền Quản trị viên (Admin).',
      });
    }

    if (user.status === 'BLOCKED') {
      return res.status(403).json({ success: false, message: 'Tài khoản quản trị này đã bị khóa' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu quản trị không chính xác' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      address: user.address || '',
      role: user.role,
      avatar: user.avatar || '',
      status: user.status,
      createdAt: user.createdAt,
    };

    return res.json({
      success: true,
      message: 'Xác thực Quản Trị Viên thành công',
      token,
      user: safeUser,
      data: {
        token,
        user: safeUser,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi xác thực Admin', error: error.message });
  }
});

// 4. Current Profile
router.get('/me', authenticateToken, (req: AuthRequest, res: Response) => {
  const user = db.findUserById(req.user!.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin người dùng' });
  }

  return res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address || '',
      role: user.role,
      avatar: user.avatar,
      status: user.status,
      createdAt: user.createdAt,
    },
  });
});

// 5. Update Profile
router.put('/profile', authenticateToken, (req: AuthRequest, res: Response) => {
  const { name, phone, avatar, address } = req.body;
  const updated = db.updateUser(req.user!.id, {
    ...(name && { name: name.trim() }),
    ...(phone !== undefined && { phone: phone.trim() }),
    ...(avatar && { avatar: avatar.trim() }),
    ...(address !== undefined && { address: address.trim() }),
  });

  if (!updated) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
  }

  const safeUser = {
    id: updated.id,
    name: updated.name,
    email: updated.email,
    phone: updated.phone,
    address: updated.address || '',
    role: updated.role,
    avatar: updated.avatar,
    status: updated.status,
    createdAt: updated.createdAt,
  };

  return res.json({
    success: true,
    message: 'Cập nhật thông tin thành công',
    user: safeUser,
    data: safeUser,
  });
});

// 6. Change Password
router.post('/change-password', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập mật khẩu hiện tại và mật khẩu mới' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 8 ký tự' });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Xác nhận mật khẩu mới không khớp' });
    }

    const result = db.changePassword(req.user!.id, currentPassword, newPassword);
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }

    return res.json({ success: true, message: result.message });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi đổi mật khẩu', error: error.message });
  }
});

export default router;

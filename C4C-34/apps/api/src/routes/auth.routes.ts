import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { generateToken, authRequired } from '../middleware/auth';

const router = Router();

// In-memory user store for development
interface StoreUser {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string | null;
  address: string | null;
  avatarUrl: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

const users = new Map<string, StoreUser>();

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(128),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = registerSchema.parse(req.body);
    const existing = Array.from(users.values()).find(u => u.email === data.email);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: { message: 'Email already registered', code: 'EMAIL_EXISTS' },
      });
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user: StoreUser = {
      id: crypto.randomUUID(),
      name: data.name,
      email: data.email,
      password: hashedPassword,
      phone: data.phone || null,
      address: null,
      avatarUrl: null,
      role: 'buyer',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    users.set(user.id, user);
    const token = generateToken({ userId: user.id, email: user.email, role: user.role });

    res.status(201).json({
      success: true,
      data: {
        user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, createdAt: user.createdAt },
        token,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation error', details: err.issues, code: 'VALIDATION' },
      });
    }
    next(err);
  }
});

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = Array.from(users.values()).find(u => u.email === data.email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid email or password', code: 'INVALID_CREDENTIALS' },
      });
    }

    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid email or password', code: 'INVALID_CREDENTIALS' },
      });
    }

    const token = generateToken({ userId: user.id, email: user.email, role: user.role });

    res.json({
      success: true,
      data: {
        user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, createdAt: user.createdAt },
        token,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation error', details: err.issues, code: 'VALIDATION' },
      });
    }
    next(err);
  }
});

router.get('/me', authRequired, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = users.get(req.user!.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found', code: 'NOT_FOUND' },
      });
    }
    res.json({
      success: true,
      data: {
        user: { id: user.id, name: user.name, email: user.email, phone: user.phone, address: user.address, avatarUrl: user.avatarUrl, role: user.role, createdAt: user.createdAt },
      },
    });
  } catch (err) {
    next(err);
  }
});

router.put('/profile', authRequired, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      name: z.string().min(2).max(100).optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
    });

    const data = schema.parse(req.body);
    const user = users.get(req.user!.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found', code: 'NOT_FOUND' },
      });
    }

    if (data.name) user.name = data.name;
    if (data.phone !== undefined) user.phone = data.phone;
    if (data.address !== undefined) user.address = data.address;

    res.json({
      success: true,
      data: {
        user: { id: user.id, name: user.name, email: user.email, phone: user.phone, address: user.address, role: user.role },
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation error', details: err.issues, code: 'VALIDATION' },
      });
    }
    next(err);
  }
});

export default router;

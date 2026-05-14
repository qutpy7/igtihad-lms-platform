import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(16).toString('hex');
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage,
    limits: {
        fileSize: 500 * 1024 * 1024 // 🔒 500MB limit for videos and large files
    },
    fileFilter: (req, file, cb) => {
        // 🔒 Allow images, videos, audio, documents, and archives
        const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|mp4|webm|mkv|avi|mp3|wav|doc|docx|zip|rar|txt|jfif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            return cb(new Error('Only images and PDF files are allowed!'));
        }
    }
});

// Upload endpoint
router.post('/', authenticate, upload.single('file'), (req: AuthRequest, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // Return the path as expected by the client
    res.json({
        filePath: req.file.filename,
        message: 'File uploaded successfully'
    });
});

// Delete endpoint
router.delete('/', authenticate, (req, res) => {
    const { path: filePath } = req.body;
    if (!filePath) return res.status(400).json({ error: 'Path required' });

    // 🔒 Security Fix: Prevent Path Traversal by taking ONLY the filename
    const safeFilename = path.basename(filePath);
    const fullPath = path.join(process.cwd(), 'uploads', safeFilename);
    
    if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        return res.json({ message: 'File deleted' });
    }
    res.status(404).json({ error: 'File not found' });
});

export default router;

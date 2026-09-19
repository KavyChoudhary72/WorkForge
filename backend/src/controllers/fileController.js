import fs from 'fs';
import path from 'path';
import multer from 'multer';
import FileAsset from '../models/FileAsset.js';
import { logActivity } from '../middleware/activityLogger.js';
import { emitTenantEvent } from '../config/socket.js';

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB max
}).single('file');

export const getFiles = async (req, res, next) => {
  try {
    const filter = req.user.role === 'SUPER_ADMIN' ? {} : { organizationId: req.user.organizationId };
    if (req.query.category && req.query.category !== 'All') {
      filter.category = req.query.category;
    }
    const files = await FileAsset.find(filter).sort({ createdAt: -1 });
    res.json(files);
  } catch (error) {
    next(error);
  }
};

export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file && !req.body.name) {
      return res.status(400).json({ message: 'No file provided for upload.' });
    }

    let fileUrl = '';
    let sizeBytes = 0;
    let fileName = '';
    let mimeType = 'application/octet-stream';

    if (req.file) {
      fileName = req.file.originalname;
      sizeBytes = req.file.size;
      mimeType = req.file.mimetype;
      // Host URL
      fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    } else {
      fileName = req.body.name;
      sizeBytes = req.body.sizeBytes || 0;
      mimeType = req.body.type || 'application/octet-stream';
      fileUrl = req.body.url || '';
    }

    let formattedSize = '0 KB';
    if (sizeBytes > 1024 * 1024) {
      formattedSize = (sizeBytes / (1024 * 1024)).toFixed(1) + ' MB';
    } else {
      formattedSize = Math.max(1, Math.round(sizeBytes / 1024)) + ' KB';
    }

    const category = req.body.category || 'Operations';
    const folder = req.body.folder || 'General';
    const permissions = req.body.permissions || 'Team Only';

    const fileAsset = await FileAsset.create({
      organizationId: req.user.organizationId,
      uploaderId: req.user.id,
      uploaderName: req.user.name,
      name: fileName,
      sizeBytes,
      formattedSize,
      type: mimeType,
      url: fileUrl,
      category,
      folder,
      permissions,
      versionHistory: [
        {
          version: 1,
          url: fileUrl,
          sizeBytes,
          uploadedAt: new Date()
        }
      ]
    });

    await logActivity({
      organizationId: req.user.organizationId,
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'FileUpload',
      details: `File '${fileName}' (${formattedSize}) uploaded to category '${category}'.`,
      req
    });

    emitTenantEvent(req.user.organizationId, 'file_uploaded', fileAsset);

    res.status(201).json(fileAsset);
  } catch (error) {
    next(error);
  }
};

export const createFile = async (req, res, next) => {
  return uploadFile(req, res, next);
};

export const deleteFile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const filter = req.user.role === 'SUPER_ADMIN' ? { _id: id } : { _id: id, organizationId: req.user.organizationId };
    
    const file = await FileAsset.findOneAndDelete(filter);
    if (!file) {
      return res.status(404).json({ message: 'File not found or access denied.' });
    }

    await logActivity({
      organizationId: req.user.organizationId,
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'FileDeleted',
      details: `File '${file.name}' was removed.`,
      req
    });

    emitTenantEvent(req.user.organizationId, 'file_deleted', { id });
    
    res.json({ message: 'File removed successfully.' });
  } catch (error) {
    next(error);
  }
};

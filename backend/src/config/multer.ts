import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { env } from './env';
import { ValidationError } from '../shared/errors';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    let subdir = 'misc';
    if (['.pdf', '.doc', '.docx'].includes(ext)) subdir = 'reports';
    else if (['.ppt', '.pptx'].includes(ext)) subdir = 'presentations';
    else if (['.zip'].includes(ext)) subdir = 'source';
    else if (['.csv'].includes(ext)) subdir = 'imports';
    cb(null, path.join(env.UPLOAD_DIR, subdir));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter: multer.Options['fileFilter'] = (req, file, cb) => {
  const allowed = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.zip', '.csv'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new ValidationError(`File type ${ext} not allowed. Allowed: ${allowed.join(', ')}`));
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.MAX_FILE_SIZE },
});
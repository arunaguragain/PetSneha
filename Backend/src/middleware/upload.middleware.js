const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadsRoot = path.join(process.cwd(), 'uploads');
const uploadFolders = {
  pets: path.join(uploadsRoot, 'pets'),
  products: path.join(uploadsRoot, 'products'),
  articles: path.join(uploadsRoot, 'articles'),
  vets: path.join(uploadsRoot, 'vets'),
  users: path.join(uploadsRoot, 'users'),
};

Object.values(uploadFolders).forEach((folder) => {
  fs.mkdirSync(folder, { recursive: true });
});

/**
 * Creates a multer uploader for a target folder.
 * @param {string} folderKey
 * @returns {import('multer').Multer}
 */
function createUploader(folderKey) {
  return multer({
    storage: multer.diskStorage({
      destination: (req, file, callback) => callback(null, uploadFolders[folderKey]),
      filename: (req, file, callback) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        callback(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, callback) => {
      const allowed = ['image/jpeg', 'image/png'];
      if (!allowed.includes(file.mimetype)) {
        return callback(new Error('Only JPEG and PNG images are allowed.'));
      }

      callback(null, true);
    },
    limits: { 
      fileSize: 50 * 1024 * 1024,           // 50MB for file uploads
      fieldSize: 50 * 1024 * 1024,          // 50MB for individual form fields
      fields: 100,                          // 100 form fields max
      fieldNameSize: 100,                   // 100 bytes for field names
      files: 10,                            // 10 files max
    },
  });
}

const petUpload = createUploader('pets');
const productUpload = createUploader('products');
const articleUpload = createUploader('articles');
const vetUpload = createUploader('vets');

// Middleware to clean up form fields after multer processes the multipart upload.
// multer populates req.files with actual file objects; req.body contains all non-file fields.
// Any "images" key in req.body is always garbage (a mangled FileList or empty object)
// because the real image data lives in req.files — so we delete it here.
function parseFormFields(req, res, next) {
  // Remove any stray images field from body — multer already handled files in req.files
  delete req.body.images;

  // Selectively parse JSON for known array fields (e.g. petType sent as multiple values)
  // multer already correctly handles repeated fields as arrays, so this is mostly a no-op
  // but we sanitize string fields just in case
  Object.keys(req.body).forEach(key => {
    const val = req.body[key];
    if (typeof val === 'string') {
      try {
        // Only parse if it looks like a JSON array/object AND the key is a known safe field
        const safeJsonKeys = ['petType', 'tags'];
        if (safeJsonKeys.includes(key) && (val.startsWith('{') || val.startsWith('['))) {
          req.body[key] = JSON.parse(val);
        }
      } catch (err) {
        // Not valid JSON, leave as string
      }
    }
  });

  next();
}

module.exports = { createUploader, petUpload, productUpload, articleUpload, vetUpload, parseFormFields };
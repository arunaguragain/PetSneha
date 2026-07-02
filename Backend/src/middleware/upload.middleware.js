const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadsRoot = path.join(process.cwd(), 'uploads');
const uploadFolders = {
  pets: path.join(uploadsRoot, 'pets'),
  products: path.join(uploadsRoot, 'products'),
  articles: path.join(uploadsRoot, 'articles'),
  vets: path.join(uploadsRoot, 'vets'),
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

// Middleware to parse form fields after multer processes the file
function parseFormFields(req, res, next) {
  console.log('parseFormFields called');
  console.log('req.body keys:', Object.keys(req.body));
  Object.keys(req.body).forEach(key => {
    const val = req.body[key];
    if (typeof val === 'string') {
      console.log(`  ${key}: ${val.length} chars`);
    } else if (typeof val === 'object') {
      console.log(`  ${key}: object`);
    }
  });
  
  // Multer already populated req.body with non-file fields
  // Parse any stringified JSON fields
  Object.keys(req.body).forEach(key => {
    if (typeof req.body[key] === 'string') {
      try {
        // Try to parse as JSON if it looks like JSON
        if (req.body[key].startsWith('{') || req.body[key].startsWith('[')) {
          req.body[key] = JSON.parse(req.body[key]);
        }
      } catch (err) {
        // Not JSON, leave as is
      }
    }
  });
  console.log('parseFormFields completed');
  next();
}

module.exports = { createUploader, petUpload, productUpload, articleUpload, vetUpload, parseFormFields };
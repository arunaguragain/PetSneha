const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadsRoot = path.join(process.cwd(), 'uploads');
const uploadFolders = {
  pets: path.join(uploadsRoot, 'pets'),
  products: path.join(uploadsRoot, 'products'),
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
    limits: { fileSize: 5 * 1024 * 1024 },
  });
}

const petUpload = createUploader('pets');
const productUpload = createUploader('products');

module.exports = { createUploader, petUpload, productUpload };
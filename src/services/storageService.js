const path = require('path');
const fs = require('fs');

// Local storage for now, swap to R2/S3 later
function getPhotoUrl(filename) {
  return `/uploads/${filename}`;
}

function deletePhoto(filename) {
  const filepath = path.join(__dirname, '../../uploads', filename);
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
  }
}

module.exports = { getPhotoUrl, deletePhoto };

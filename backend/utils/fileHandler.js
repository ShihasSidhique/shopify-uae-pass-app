const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class FileHandler {
    constructor(uploadDir = process.env.UPLOAD_DIR || './uploads') {
          this.uploadDir = uploadDir;
    }

  async initialize() {
        try {
                await fs.mkdir(this.uploadDir, { recursive: true });
        } catch (error) {
                console.error('Error creating upload directory:', error);
        }
  }

  generateHash(data) {
        return crypto.createHash('sha256').update(data).digest('hex');
  }

  async saveFile(file) {
        try {
                const timestamp = Date.now();
                const randomString = crypto.randomBytes(6).toString('hex');
                const fileName = `${timestamp}-${randomString}-${file.originalname}`;
                const filePath = path.join(this.uploadDir, fileName);

          await fs.writeFile(filePath, file.buffer);

          return {
                    fileName,
                    filePath: `/uploads/${fileName}`,
                    fileSize: file.size,
                    mimeType: file.mimetype,
                    hash: this.generateHash(file.buffer),
          };
        } catch (error) {
                throw new Error(`File save failed: ${error.message}`);
        }
  }

  async deleteFile(fileName) {
        try {
                const filePath = path.join(this.uploadDir, fileName);
                await fs.unlink(filePath);
                return true;
        } catch (error) {
                console.error('Error deleting file:', error);
                return false;
        }
  }

  async getFile(fileName) {
        try {
                const filePath = path.join(this.uploadDir, fileName);
                return await fs.readFile(filePath);
        } catch (error) {
                throw new Error(`File read failed: ${error.message}`);
        }
  }

  isValidFileType(mimeType) {
        const allowed = process.env.ALLOWED_FILE_TYPES.split(',');
        const ext = mimeType.split('/')[1];
        return allowed.includes(ext);
  }
}

module.exports = FileHandler;

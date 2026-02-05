const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
    },
    documentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Document',
    },
    action: {
          type: String,
          enum: ['upload', 'download', 'sign', 'verify', 'share', 'delete', 'login', 'logout'],
          required: true,
    },
    resource: String,
    resourceId: String,
    changes: mongoose.Schema.Types.Mixed,
    ipAddress: String,
    userAgent: String,
    status: {
          type: String,
          enum: ['success', 'failure'],
      default: 'success',
    },
    errorMessage: String,
    timestamp: {
          type: Date,
      default: Date.now,
          index: true,
    },
});

module.exports = mongoose.model('AuditLog', auditLogSchema);

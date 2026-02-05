const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const documentSchema = new mongoose.Schema({
    documentId: {
          type: String,
      default: () => uuidv4(),
          unique: true,
    },
    customerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
    },
    shopifyOrderId: String,

    // Document Details
    fileName: {
          type: String,
          required: true,
    },
    originalFileName: {
          type: String,
          required: true,
    },
    documentType: {
          type: String,
          enum: ['invoice', 'quote', 'contract', 'agreement', 'receipt', 'other'],
      default: 'other',
    },
    filePath: {
          type: String,
          required: true,
    },
    fileSize: Number,
    mimeType: String,
    fileHash: String, // For integrity verification

    // Signature Information
    signature: {
          status: {
                  type: String,
                  enum: ['pending', 'signed', 'rejected', 'expired'],
            default: 'pending',
          },
          signedAt: Date,
          signatureData: mongoose.Schema.Types.Mixed,
          signatureTransaction: String, // UAE Pass transaction ID
          signedBy: String,
          certificateSerialNumber: String,
    },

    // Audit Trail
    status: {
          type: String,
          enum: ['draft', 'pending_signature', 'signed', 'archived', 'cancelled'],
      default: 'draft',
    },
    statusHistory: [{
          status: String,
          changedAt: {
                  type: Date,
            default: Date.now,
          },
          changedBy: String,
          notes: String,
    }],

    // Expiration
    expiresAt: Date,
    isExpired: {
          type: Boolean,
      default: false,
    },

    // Metadata
    tags: [String],
    description: String,
    metadata: mongoose.Schema.Types.Mixed,

    // Timestamps
    uploadedAt: {
          type: Date,
      default: Date.now,
    },
    createdAt: {
          type: Date,
      default: Date.now,
    },
    updatedAt: {
          type: Date,
      default: Date.now,
    },
});

// Index for common queries
documentSchema.index({ customerId: 1, createdAt: -1 });
documentSchema.index({ status: 1 });
documentSchema.index({ 'signature.status': 1 });

module.exports = mongoose.model('Document', documentSchema);

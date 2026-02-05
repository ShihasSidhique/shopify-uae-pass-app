const express = require('express');
const Document = require('../models/Document');
const AuditLog = require('../models/AuditLog');
const auth = require('../middleware/auth');
const fileHandler = require('../utils/fileHandler');
const logger = require('../utils/logger');

const router = express.Router();

// Create a new document for signing
router.post('/create', auth, async (req, res, next) => {
    try {
          const { title, description, fileUrl, signatureRequired } = req.body;

      if (!title || !fileUrl) {
              return res.status(400).json({ error: 'Title and file URL are required' });
      }

      const document = new Document({
              userId: req.user.userId,
              title,
              description,
              fileUrl,
              signatureRequired: signatureRequired || true,
              status: 'pending',
      });

      await document.save();

      // Log the action
      await AuditLog.create({
              userId: req.user.userId,
              action: 'DOCUMENT_CREATED',
              documentId: document._id,
              details: `Document '${title}' created for signing`,
      });

      logger.log(`Document created: ${document._id} by user ${req.user.userId}`);

      res.status(201).json({
              message: 'Document created successfully',
              document,
      });
    } catch (error) {
          logger.error(`Create document error: ${error.message}`);
          next(error);
    }
});

// Get user's documents
router.get('/my-documents', auth, async (req, res, next) => {
    try {
          const documents = await Document.find({ userId: req.user.userId }).sort({
                  createdAt: -1,
          });

      res.json({
              message: 'Documents retrieved successfully',
              documents,
      });
    } catch (error) {
          logger.error(`Get documents error: ${error.message}`);
          next(error);
    }
});

// Get a specific document
router.get('/:id', auth, async (req, res, next) => {
    try {
          const document = await Document.findById(req.params.id);

      if (!document) {
              return res.status(404).json({ error: 'Document not found' });
      }

      if (document.userId.toString() !== req.user.userId) {
              return res.status(403).json({ error: 'Access denied' });
      }

      res.json({
              message: 'Document retrieved successfully',
              document,
      });
    } catch (error) {
          logger.error(`Get document error: ${error.message}`);
          next(error);
    }
});

// Sign a document with UAE Pass
router.post('/:id/sign', auth, async (req, res, next) => {
    try {
          const { signatureData, uaePassId } = req.body;

      const document = await Document.findById(req.params.id);

      if (!document) {
              return res.status(404).json({ error: 'Document not found' });
      }

      if (document.userId.toString() !== req.user.userId) {
              return res.status(403).json({ error: 'Access denied' });
      }

      // Update document with signature
      document.signatureData = signatureData;
          document.uaePassId = uaePassId;
          document.status = 'signed';
          document.signedAt = new Date();

      await document.save();

      // Log the signing action
      await AuditLog.create({
              userId: req.user.userId,
              action: 'DOCUMENT_SIGNED',
              documentId: document._id,
              details: `Document '${document.title}' signed with UAE Pass ID: ${uaePassId}`,
      });

      logger.log(`Document signed: ${document._id}`);

      res.json({
              message: 'Document signed successfully',
              document,
      });
    } catch (error) {
          logger.error(`Sign document error: ${error.message}`);
          next(error);
    }
});

// Verify document signature
router.post('/:id/verify', async (req, res, next) => {
    try {
          const document = await Document.findById(req.params.id);

      if (!document) {
              return res.status(404).json({ error: 'Document not found' });
      }

      if (document.status !== 'signed') {
              return res.status(400).json({ error: 'Document is not signed' });
      }

      res.json({
              message: 'Document signature verified',
              verified: true,
              document,
      });
    } catch (error) {
          logger.error(`Verify document error: ${error.message}`);
          next(error);
    }
});

// Delete a document
router.delete('/:id', auth, async (req, res, next) => {
    try {
          const document = await Document.findById(req.params.id);

      if (!document) {
              return res.status(404).json({ error: 'Document not found' });
      }

      if (document.userId.toString() !== req.user.userId) {
              return res.status(403).json({ error: 'Access denied' });
      }

      await Document.findByIdAndDelete(req.params.id);

      // Log the deletion
      await AuditLog.create({
              userId: req.user.userId,
              action: 'DOCUMENT_DELETED',
              documentId: req.params.id,
              details: `Document '${document.title}' deleted`,
      });

      logger.log(`Document deleted: ${req.params.id}`);

      res.json({ message: 'Document deleted successfully' });
    } catch (error) {
          logger.error(`Delete document error: ${error.message}`);
          next(error);
    }
});

module.exports = router;

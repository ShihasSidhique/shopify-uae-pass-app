const AuditLog = require('../models/AuditLog');

class Logger {
    static async log(logData) {
          try {
                  await AuditLog.create({
                            ...logData,
                            timestamp: new Date(),
                  });
          } catch (error) {
                  console.error('Logging error:', error);
          }
    }

  static async logAction({
        userId,
        documentId,
        action,
        resource,
        resourceId,
        changes,
        ipAddress,
        userAgent,
        status = 'success',
        errorMessage = null,
  }) {
        return this.log({
                userId,
                documentId,
                action,
                resource,
                resourceId,
                changes,
                ipAddress,
                userAgent,
                status,
                errorMessage,
        });
  }
}

module.exports = Logger;

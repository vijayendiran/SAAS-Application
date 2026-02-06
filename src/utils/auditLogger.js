import prisma from '../lib/prisma.js';

export const logAudit = async (tenantId, userId, action, details = {}) => {
    try {
        // Ensure we have IDs (sometimes tenantId might be missing in failed requests, but for critical actions we should have it)
        if (!tenantId || !userId) {
            console.warn("Audit Log skipped: Missing tenantId or userId", { tenantId, userId, action });
            return;
        }

        await prisma.auditLog.create({
            data: {
                tenantId,
                userId,
                action,
                details
            }
        });
    } catch (error) {
        console.error("Failed to log audit:", error);
        // Fail silently to not disrupt user flow
    }
};

import prisma from "../lib/prisma.js";
import { logAudit } from "../utils/auditLogger.js";

export const inviteUser = async (req, res) => {
  try {
    const { name, email } = req.body;

    // Safety check
    if (!req.tenantId) {
      return res.status(400).json({ message: "Tenant context missing" });
    }

    // Prevent duplicate users
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }



    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: "LOGTO_MANAGED_AUTH", // Auth is handled by Logto
        role: "member",
        tenantId: req.tenantId,
        createdBy: req.userId
      }
    });

    // Log Audit
    await logAudit(req.tenantId, req.userId, "USER_INVITE", { invitedEmail: email, invitedUserId: user.id });

    res.status(201).json({
      message: "User invited successfully. Please ensure they are also invited in Logto Console.",
      userId: user.id
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

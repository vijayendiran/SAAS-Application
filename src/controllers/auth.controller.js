import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { logAudit } from "../utils/auditLogger.js";

export const signup = async (req, res) => {
  try {
    const { companyName, subdomain, name, email, password } = req.body;

    // 1️⃣ Basic validation
    if (!companyName || !subdomain || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 2️⃣ Check subdomain uniqueness
    const existingTenant = await prisma.tenant.findUnique({
      where: { subdomain }
    });

    if (existingTenant) {
      return res.status(409).json({ message: "Subdomain already taken" });
    }

    // 3️⃣ Check email uniqueness
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // 4️⃣ Create tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: companyName,
        subdomain
      }
    });

    // 5️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6️⃣ Create admin user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "admin",
        tenantId: tenant.id
      }
    });

    res.status(201).json({
      message: "Signup successful",
      tenant: {
        id: tenant.id,
        subdomain: tenant.subdomain
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const login = async (req, res) => {
  console.log("Signing token with JWT_SECRET prefix:", process.env.JWT_SECRET?.substring(0, 4));
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }


  const token = jwt.sign(
    {
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  // Audit Log
  await logAudit(user.tenantId, user.id, "LOGIN", { ip: req.ip });

  res.json({ token });
};

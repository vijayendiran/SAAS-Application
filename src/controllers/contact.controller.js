import prisma from "../lib/prisma.js";

/**
 * POST /contacts
 * Create a contact for the current tenant
 */ 

export const createContact = async (req, res) => {
    try {
        // 1. Safety check - tenant context
        if (!req.tenant || !req.tenant.id) {
            return res.status(400).json({
                error: "Tenant context missing",
            });
        }

        // 2. Extract data from request body
        const { name, email, phone } = req.body;

        // 3. Validate required fields
        if (!name || !name.trim()) {
            return res.status(400).json({
                error: "Name is required",
            });
        }

        // Optional: Validate email format
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                error: "Invalid email format",
            });
        }

        // 4. Create contact (TENANT-SCOPED)
        const contact = await prisma.contact.create({
            data: {
                tenantId: req.tenant.id,
                name: name.trim(), 
                email: email?.trim() || null,
                phone: phone?.trim() || null,
            },
        });

        // 5. Respond with created contact
        return res.status(201).json(contact);

    } catch (err) {
        console.error("create contact error", err);
        return res.status(500).json({
            error: "Internal server error",
        });
    }
};


/**
 * GET /contacts
 * Fetch all contacts for the current tenant
 */

export const getContacts = async (req, res) => {
  try {
    if (!req.tenant) {
      return res.status(400).json({
        error: "Tenant context missing",
      });
    }

    // 1. Fetch contacts ONLY for this tenant
    const contacts = await prisma.contact.findMany({
      where: {
        tenantId: req.tenant.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 2. Respond
    return res.json(contacts);
  } catch (error) {
    console.error("Get contacts error:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
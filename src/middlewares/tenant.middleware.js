import prisma from "../lib/prisma.js";

export const tenantMiddleware = async (req, res, next) => {
    try {
        console.log("HOST HEADER:", req.headers.host);
        const host = req.headers.host;

        // 1. Get host header
        if (!host) {
            return res.status(400).json({
                error: "Host header missing",
            });
        }
        //2 Remove port (localhost:3000 -> localhost)
        const hostname = host.split(":")[0];

        //3 Extract subdomain (gym1.localhost -> gym1)
        const parts = hostname.split(".");

        //we expect at lead : subdomain.name

        if (parts.length < 2) {
            return res.status(400).json({
                error: "Invalid host format",
            });
        }

        const subdomain = parts[0];

        //4 find tenant in Db
        const tenant = await prisma.tenant.findUnique({
            where: { subdomain },

        });

        if (!tenant) {
            return res.status(404).json({
                error: "Tenant not found",
            });
        }

        // 5. Attach tenant to request
        req.tenant = tenant;
        req.tenantId = tenant.id;

        next();

    } catch (error) {
        console.error("Tenant middleware error", error);
        return res.status(500).json({
            error: "Internal server error",
        });
    }
};

export const resolveTenant = async (req, res, next) => {
    try {
        const host = req.headers.host; //gym2.localhost:3000
        if (!host) {
            return res.status(400).json({ mesagge: "Host header is missing" });

        }
        const subdomain = host.split(".")[0];

        //handle localhost without subdomain

        if (subdomain === "localhost") {
            return res.status(400).json({ message: "Tenant subdomain required" });

        }
        const tenant = await prisma.tenant.findUnique({
            where: { subdomain }
        });

        if (tenant.status !== "active") {
            return res.status(403).json({
                mesagge: "Tenant is active"
            })
        }

        //Attach the tenant to request
        req.tenant = tenant;
        req.tenantId = tenant.id;
        next();
    } catch (error) {
        res.status(500).json({ message: "Tenannt resolution failed" })
    }
};
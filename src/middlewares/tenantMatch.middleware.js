export const tenantMatch = (req, res, next) => {
    console.log(`Tenant Match Check: URL(${req.tenantId}) vs Token(${req.userTenantId})`);

    if (!req.tenantId || !req.userTenantId) {
        return res.status(400).json({ message: "Tenant context missing for verification" });
    }

    if (req.tenantId !== req.userTenantId) {
        return res.status(403).json({ message: "Access denied: Tenant mismatch" });
    }

    next();
};

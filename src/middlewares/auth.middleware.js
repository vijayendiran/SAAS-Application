import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Authorization token Missing" });
    }

    const token = authHeader.split(/\s+/)[1]?.replace(/[<>"]/g, '');
    console.log("Token value being verified (first 10 chars):", token?.substring(0, 10));

    if (!token) {
        return res.status(401).json({ message: "Token format invalid" });
    }

    if (!process.env.JWT_SECRET) {
        console.error("CRITICAL ERROR: JWT_SECRET is not defined in environment variables.");
        return res.status(500).json({ message: "Server configuration error" });
    }

    console.log("Verifying token with JWT_SECRET prefix:", process.env.JWT_SECRET.substring(0, 4));

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;
        req.userId = decoded.userId;
        req.userTenantId = decoded.tenantId;
        req.role = decoded.role;
        next();
    } catch (err) {
        console.error("JWT Verification failed for token:", token.substring(0, 10) + "...");
        console.error("Error name:", err.name);
        console.error("Error message:", err.message);

        return res.status(401).json({
            message: "Invalid or Expired Token",
            error: err.message,
            tokenStatus: err.name === 'TokenExpiredError' ? 'expired' : 'invalid'
        });
    }
};
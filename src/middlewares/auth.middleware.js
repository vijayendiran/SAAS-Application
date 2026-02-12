import { createRemoteJWKSet, jwtVerify } from 'jose';
import prisma from '../lib/prisma.js';

// Configuration
const LOGTO_ENDPOINT = process.env.LOGTO_ENDPOINT;
const LOGTO_API_RESOURCE = process.env.LOGTO_API_RESOURCE;

// Create a remote JWK Set (caches keys automatically)
const JWKS = createRemoteJWKSet(new URL(`${LOGTO_ENDPOINT}/oidc/jwks`));

export const authMiddleware = async (req, res, next) => {
    let token;

    // 1. Check Authorization Header (Bearer)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }
    // 2. Check Cookie (for Traditional Web App flow)
    else if (req.cookies && req.cookies.access_token) {
        token = req.cookies.access_token;
    }

    if (!token) {
        // Stateless: No token = No user
        req.user = null;
        return next();
    }




    try {
        // Validate Token: Signature, Expiration, Issuer, Audience
        const { payload } = await jwtVerify(token, JWKS, {
            issuer: `${LOGTO_ENDPOINT}/oidc`,
            audience: LOGTO_API_RESOURCE,
        });

        // Token is valid

        req.user = payload;

        // Attempt to link to local DB User for permissions/tenancy
        if (payload.email) {
            const dbUser = await prisma.user.findUnique({
                where: { email: payload.email },
                include: { tenant: true }
            });

            if (dbUser) {
                req.dbUser = dbUser;
                req.userId = dbUser.id; // Use local ObjectId for DB compatibility
                req.userTenantId = dbUser.tenantId; // For tenant matching
                req.role = dbUser.role; // For legacy admin middleware
            } else {
                req.userId = payload.sub; // Fallback to Logto ID
                // User is authenticated but not yet in local DB (needs onboarding?)
            }
        } else {
            req.userId = payload.sub;
        }

        next();
    } catch (error) {
        console.error('JWT Validation Failed:', error.message);
        // If token is present but invalid, we can choose to reject immediately or pass null
        // For security, if they TRIED to authenticate and failed, we should probably warn or reject?
        // But to keep consistent with "optional auth" pattern in middleware, we'll set user=null.
        // Error details can be useful for debugging but shouldn't leak to client in production.
        req.user = null;
        req.authError = error.message; // valid for debugging
        next();
    }
};

export const requireAuth = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            message: 'Unauthorized',
            error: req.authError || 'Authentication required',
        });
    }
    next();
};

export const requireScopes = (requiredScopes) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const tokenScopes = (req.user.scope || '').split(' ');
        const hasAllScopes = requiredScopes.every(scope => tokenScopes.includes(scope));

        if (!hasAllScopes) {
            return res.status(403).json({
                message: 'Forbidden: Insufficient permissions',
                required: requiredScopes,
            });
        }
        next();
    };
};


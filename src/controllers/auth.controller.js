import axios from 'axios';

// Logto Configuration variables
const LOGTO_ENDPOINT = process.env.LOGTO_ENDPOINT;
const LOGTO_APP_ID = process.env.LOGTO_APP_ID;
const LOGTO_APP_SECRET = process.env.LOGTO_APP_SECRET;
const LOGTO_REDIRECT_URI = process.env.LOGTO_REDIRECT_URI;
const LOGTO_POST_LOGOUT_URI = process.env.LOGTO_POST_LOGOUT_URI;
const LOGTO_API_RESOURCE = process.env.LOGTO_API_RESOURCE;
const SCOPES = 'openid profile email read:users write:users offline_access'; // added offline_access for refresh tokens if needed

/**
 * 1. Redirect to Logto for Authentication
 */
export const login = (req, res) => {
    const authUrl = new URL(`${LOGTO_ENDPOINT}/oidc/auth`);
    authUrl.searchParams.append('client_id', LOGTO_APP_ID);
    authUrl.searchParams.append('redirect_uri', LOGTO_REDIRECT_URI);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', SCOPES);
    authUrl.searchParams.append('resource', LOGTO_API_RESOURCE);
    authUrl.searchParams.append('prompt', 'consent');

    // In a real app, generate a random state/nonce and store it in a cookie to prevent CSRF
    // const state = generateRandomString();
    // res.cookie('auth_state', state, { httpOnly: true, secure: true });
    // authUrl.searchParams.append('state', state);

    res.redirect(authUrl.toString());
};

/**
 * 2. Handle Callback - Exchange Code for Token
 */
export const callback = async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).send('Authorization code missing');
    }

    try {
        const params = new URLSearchParams();
        params.append('grant_type', 'authorization_code');
        params.append('code', code);
        params.append('redirect_uri', LOGTO_REDIRECT_URI);
        params.append('client_id', LOGTO_APP_ID);
        params.append('client_secret', LOGTO_APP_SECRET);
        params.append('resource', LOGTO_API_RESOURCE);

        const response = await axios.post(`${LOGTO_ENDPOINT}/oidc/token`, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const { access_token, id_token, refresh_token, expires_in } = response.data;

        // "Stateless" Approach (Cookie-based Session):
        // Store the access_token in a secure, httpOnly cookie.
        // This allows the browser to include it automatically in subsequent requests (if configured)
        // OR simply display it to the user if this is a developer flow.
        // Since the user asked for "Traditional Web App" + "Stateless", we usually mean cookies.

        // Set Access Token Cookie
        res.cookie('access_token', access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: expires_in * 1000
        });

        // Redirect to Home or meaningful page
        // res.redirect('/');
        res.json({ message: "Login Successful", tokens: response.data });

    } catch (error) {
        console.error('Token Exchange Error:', error.response?.data || error.message);
        res.status(500).json({
            message: 'Authentication failed',
            details: error.response?.data || error.message
        });
    }
};

/**
 * 3. Logout
 */
export const logout = (req, res) => {
    res.clearCookie('access_token');
    const logoutUrl = `${LOGTO_ENDPOINT}/oidc/session/end?client_id=${LOGTO_APP_ID}&post_logout_redirect_uri=${LOGTO_POST_LOGOUT_URI}`;
    res.redirect(logoutUrl);
};

export const me = (req, res) => {
    // If we assume authMiddleware has run
    if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(req.user);
};

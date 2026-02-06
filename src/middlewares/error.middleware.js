export const errorHandler = (err, req, res, next) => {
    console.error(`[Error] ${err.message}`);

    // Log full stack if not in production (optional, but good for debugging)
    if (process.env.NODE_ENV !== 'production') {
        console.error(err.stack);
    }

    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(statusCode).json({
        success: false,
        message
    });
};

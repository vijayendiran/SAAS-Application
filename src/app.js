import express from 'express';
import { tenantMiddleware } from './middlewares/tenant.middleware.js';
import tenantRoutes from "./routes/tenant.routes.js"
import contactRoutes from "./routes/contact.routes.js"

const app = express();

app.use(express.json());

// Global routes (NO tenant)
app.use("/tenants", tenantRoutes);
app.get("/health", (req, res) => {
    res.send("ok");
})




// Tenant-scoped routes
app.use(tenantMiddleware);
app.use("/contacts",contactRoutes)




export default app;
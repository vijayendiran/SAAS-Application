import prisma from "../lib/prisma.js";

export const createTeneant = async (req, res) => {
    try {
        const { name, subdomain } = req.body;

        //1 validate input
        if (!name || !subdomain) {
            return res.status(400).json({
                error: "name and subdomain are required"
            });
        }

        //2 Create tenant 
        const tenant = await prisma.tenant.create({
            data: {
                name,
                subdomain
            }
        });

        // 3 Respond 
        return res.status(201).json(tenant);
    }
    catch (error) {
        if (error.code === "P2002") {
            return res.status(409).json({
                error: "subdomain already exsists"
            });
        }
        console.log(error);
        return res.status(500).json({
            error: "Internal server error"
        })
    }
}
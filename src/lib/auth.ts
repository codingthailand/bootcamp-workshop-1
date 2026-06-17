import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
// If your Prisma file is located elsewhere, you can change the path
import { prisma } from "./prisma";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "mysql", // or "mysql", "postgresql", ...etc
    }),
    emailAndPassword: {
        enabled: true,
        autoSignIn: false,
        requireEmailVerification: false,
        minPasswordLength: 6
    },
    user: {
        additionalFields: {
            role: {
                type: 'string',
                required: false,
                defaultValue: 'user',
                input: false,
            }
        }
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // session จะหมดอายุ 7 วัน หน่วยเป็นวินาที
        updateAge: 60 * 60 * 24 * 1, // ถ้าเกิน 1 วัน ระบบจะต่อายุ session expiration ใหม่
    }
});
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/src/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: 60 * 60 * 2, // 2 horas
    updateAge: 60 * 30,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
      strategy: "compact"
    }
  },
  user: {
    additionalFields: {
      sector: {
        type: "string",
        required: false,
      },
      registration: {
        type: "string",
        required: false,
      },
    },
  }
});

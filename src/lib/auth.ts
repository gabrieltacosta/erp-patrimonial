import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/db";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: false,
  },
  callbacks: {
    session: async ({ session, user }: { session: any; user: any }) => {
      const dbUser = await prisma.user.findUnique({
        where: {
          id: user.id,
        },
        select: {
          ativo: true,
        },
      });

      if (dbUser && dbUser.ativo === false) {
        throw new Error("account_suspended");
      }
      return { session, user };
    },
  },
  plugins: [nextCookies()],
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "USUARIO",
      },
      empresaId: {
        type: "string",
      },
      filialId: {
        type: "string",
      },
    },
  },
});

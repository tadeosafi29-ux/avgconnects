import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/mongo";
import type { UserRole } from "@/models/User";

const googleProvider =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? [
        GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
      ]
    : [];

export const authOptions: AuthOptions = {
  providers: [
    ...googleProvider,
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email y contraseña son obligatorios");
        }

        const db = await getDb();
        const user = await db
          .collection("users")
          .findOne({ email: credentials.email.trim().toLowerCase() });

        if (!user) {
          throw new Error("Usuario no encontrado");
        }

        if (typeof user.password !== "string") {
          throw new Error("Esta cuenta se creó con Google. Inicia sesión con Google.");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Contraseña incorrecta");
        }

        await db.collection("users").updateOne(
          { _id: user._id },
          { $set: { lastLoginAt: new Date(), updatedAt: new Date() } }
        );

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name ?? "",
          role: user.role as UserRole,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/mi-cuenta",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const db = await getDb();
        const users = db.collection("users");

        const existing = await users.findOne({ email: user.email });

        if (!existing) {
          await users.insertOne({
            email: user.email,
            name: user.name ?? "",
            image: user.image ?? null,
            password: null,
            role: "customer",
            createdAt: new Date(),
          });
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

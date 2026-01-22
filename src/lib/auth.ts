import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        // Google OAuth for individual users
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        }),

        // Microsoft OAuth for individual users
        AzureADProvider({
            clientId: process.env.MICROSOFT_CLIENT_ID || '',
            clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
            tenantId: 'common', // Allows personal and work accounts
        }),

        // Credentials for organization users
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Please provide email and password");
                }

                await dbConnect();

                // Find user and select password (as it is excluded by default)
                const user = await User.findOne({ email: credentials.email }).select("+password");

                if (!user) {
                    throw new Error("Invalid email or password");
                }

                const isMatch = await bcrypt.compare(credentials.password, user.password);

                if (!isMatch) {
                    throw new Error("Invalid email or password");
                }

                return { id: user._id.toString(), name: user.name, email: user.email, role: user.role };
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            // Handle OAuth sign-in (Google/Microsoft)
            if (account?.provider === 'google' || account?.provider === 'azure-ad') {
                await dbConnect();

                // Check if user exists
                let existingUser = await User.findOne({ email: user.email });

                if (!existingUser) {
                    // Create new individual user
                    existingUser = await User.create({
                        name: user.name,
                        email: user.email,
                        role: 'user', // Individual user role
                        organizationId: null, // No organization
                        oauthProvider: account.provider,
                        oauthId: account.providerAccountId,
                    });

                    console.log(`[OAuth] New user created: ${user.email} via ${account.provider}`);
                }

                // Store user ID for session
                user.id = existingUser._id.toString();
                // @ts-ignore
                user.role = existingUser.role;
            }

            return true;
        },
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id;
                // @ts-ignore
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                // @ts-ignore
                session.user.id = token.id;
                // @ts-ignore
                session.user.role = token.role;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

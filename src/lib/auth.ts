import {NextAuthOptions, getServerSession} from 'next-auth';
import {redirect} from 'next/navigation';

import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import {prisma} from './prisma';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string; // or number if that's what your DB uses
            name?: string | null;
            email?: string | null;
            image?: string | null;
        }
    }

    interface User {
        id: string; // or number
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string; // or number
    }
}

export const authConfig: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Sign in",
            credentials: {
                email: {
                    label: "Email",
                    type: "email",
                    placeholder: "example@example.com",
                },
                password: {label: "Password", type: "password"},
            },
            async authorize(credentials) {
                if (!credentials || !credentials.email || !credentials.password)
                    return null;

                const dbUser = await prisma.user.findFirst({
                    where: { email: credentials.email },
                });

                //Verify Password here
                //We are going to use a simple === operator
                //In production DB, passwords should be encrypted using something like bcrypt...
                if (dbUser && dbUser.password === credentials.password) {
                    return {
                        id: dbUser.id.toString(),
                        name: dbUser.name ?? dbUser.email,
                        email: dbUser.email,
                    };
                }

                return null;
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        })
    ],

    session: {
        strategy: 'jwt',
    },

    secret: process.env.NEXTAUTH_SECRET,

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id; // Save ID in the token
            }
            return token;
        },

        async session({ session, token }) {
            if (session.user && token) {
                session.user.id = token.id; // Attach ID to the session
            }
            return session;
        },

        async signIn({user, account}) {
            if (account?.provider === 'google') {
                const existingUser = await prisma.user.findUnique({
                    where: {email: user.email!},
                });

                if (!existingUser) {
                    await prisma.user.create({
                        data: {
                            id: user.id,
                            name: user.name!,
                            email: user.email!,
                            password: 'google-oauth', // or leave undefined if not in schema
                        },
                    });
                }
            }

            return true;
        },
    },
};

export async function loginIsRequiredServer() {
    const session = await getServerSession(authConfig);
    if (!session) return redirect("/");
}


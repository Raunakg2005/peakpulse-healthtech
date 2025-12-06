import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import clientPromise from '@/lib/mongodbAdapter';
import type { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
    adapter: MongoDBAdapter(clientPromise) as any,
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        }),
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                await connectDB();

                const user = await User.findOne({ email: credentials.email }).select('+password');

                if (!user || !user.password) {
                    return null;
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordValid) {
                    return null;
                }

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                    image: user.avatar || undefined,
                };
            }
        })
    ],
    session: {
        strategy: 'jwt',
    },
    pages: {
        signIn: '/signin',
        error: '/signin',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            // Always fetch latest data for id, points and avatar
            if (token.id) {
                try {
                    await connectDB();
                    const dbUser = await User.findById(token.id).select('stats.totalPoints avatar');
                    if (dbUser) {
                        token.totalPoints = dbUser.stats?.totalPoints || 0;
                        token.avatar = dbUser.avatar;
                    }
                } catch (e) {
                    console.error('Failed to fetch user data for token', e);
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session?.user) {
                (session.user as any).id = token.id;
                (session.user as any).totalPoints = token.totalPoints;
                (session.user as any).avatar = token.avatar;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

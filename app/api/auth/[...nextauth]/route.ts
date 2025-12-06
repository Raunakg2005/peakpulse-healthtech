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
            // Always fetch latest data for id, points and avatar
            if (token.id) {
                try {
                    await connectDB();
                    const dbUser = await User.findById(token.id);

                    if (dbUser) {
                        token.totalPoints = dbUser.stats?.totalPoints || 0;
                        token.avatar = dbUser.avatar;

                        // Streak Logic
                        const today = new Date();
                        const lastActive = dbUser.stats?.lastActiveDate ? new Date(dbUser.stats.lastActiveDate) : null;

                        // Check if we need to update streak (if last active was not today)
                        if (!lastActive || lastActive.toDateString() !== today.toDateString()) {
                            const yesterday = new Date(today);
                            yesterday.setDate(yesterday.getDate() - 1);

                            if (lastActive && lastActive.toDateString() === yesterday.toDateString()) {
                                // Consecutive day, increment streak
                                dbUser.stats.currentStreak = (dbUser.stats.currentStreak || 0) + 1;
                            } else if (!lastActive || lastActive < yesterday) {
                                // Missed a day or first login, reset streak
                                // Note: if lastActive is significantly in the past (before yesterday), reset.
                                // If lastActive is null, it's day 1.
                                dbUser.stats.currentStreak = 1;
                            }

                            // Update longest streak if needed
                            if (dbUser.stats.currentStreak > (dbUser.stats.longestStreak || 0)) {
                                dbUser.stats.longestStreak = dbUser.stats.currentStreak;
                            }

                            dbUser.stats.lastActiveDate = today;
                            await dbUser.save();
                        }
                    }
                } catch (e) {
                    console.error('Failed to update user data/streak', e);
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

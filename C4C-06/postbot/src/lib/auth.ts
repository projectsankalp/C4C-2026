import { NextAuthOptions } from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";
import LinkedInProvider from "next-auth/providers/linkedin";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any, // Type cast to resolve auth.js vs next-auth mismatches
  providers: [
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID as string,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET as string,
      client: { token_endpoint_auth_method: 'client_secret_post' },
      issuer: 'https://www.linkedin.com',
      wellKnown: "https://www.linkedin.com/oauth/.well-known/openid-configuration",
      authorization: {
        params: { scope: 'openid profile email w_member_social' },
      },
      profile(profile) {
        const defaultImage =
          'https://cdn-icons-png.flaticon.com/512/174/174857.png';
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture ?? defaultImage,
        };
      },
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID as string,
      clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
      version: "2.0",
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "database",
  },
  callbacks: {
    async session({ session, user }) {
      if (session?.user && user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  debug: true,
};

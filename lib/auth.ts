import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { authApi } from "./api"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          const response = await authApi.login(credentials.email, credentials.password)

          if (response.data.status && response.data.data) {
            const { user, accessToken, storeId } = response.data.data

            // 👇 This object becomes `user` in the jwt callback
            return {
              id: user._id,
              _id: user._id, // convenience
              email: user.email,
              name: user.name, // might be undefined but safe
              role: user.role,
              accessToken,
              image: user.profileImage,
              storeId: storeId || user.vendorRequest?.store,
            } as any
          }

          return null
        } catch (error) {
          return null
        }
      },
    }),
  ],
  callbacks: {
    // 🧠 Put everything you need into the JWT
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken
        token.role = (user as any).role
        token.storeId = (user as any).storeId
        token.userId = (user as any).id || (user as any)._id
        token.image = (user as any).image
      }
      return token
    },

    // 🧾 Expose those values on `session.user`
    async session({ session, token }) {
      session.user = {
        // keep whatever NextAuth gives (name/email/image)
        ...(session.user || {}),
        // our extras:
        id: (token as any).userId,
        _id: (token as any).userId,
        role: (token as any).role,
        accessToken: (token as any).accessToken,
        storeId: (token as any).storeId,
        image: session.user?.image || (token as any).image,
      } as any

      return session
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
}

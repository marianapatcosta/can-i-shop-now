import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/api-utils/lib/prisma'
import { getUser } from '@/api-utils/repositories/users/getUser'
import { MySession } from '@/types'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    session: async ({ session, token }): Promise<MySession> => {
      const mySession = { ...session } as MySession
      if (mySession?.user) {
        const userData = await getUser(token.uid as string)
        mySession.user.id = token.uid as string
        mySession.user.city = userData.city || ''
        mySession.user.zipCode = userData.zipCode || ''
      }
      return mySession
    },
    jwt: async ({ user, token }) => {
      if (user) {
        token.uid = user.id
      }
      return token
    },
  },
}

export default NextAuth(authOptions)

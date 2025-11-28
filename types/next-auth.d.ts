import NextAuth, { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      referralCode: string
    } & DefaultSession['user']
  }

  interface User {
    referralCode: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    referralCode: string
  }
}

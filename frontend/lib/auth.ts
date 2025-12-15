import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { api } from "./api";
import { TokenResponse, User } from "./types";

export const authConfig = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Login via FastAPI
          const formData = new URLSearchParams();
          formData.append("email", credentials.email as string);
          formData.append("password", credentials.password as string);

          const loginResponse = await api.post<TokenResponse>(
            "/auth/login",
            formData,
            {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
            }
          );

          const { access_token } = loginResponse.data;

          // Get user info
          const userResponse = await api.get<User>("/auth/me", {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          });

          const user = userResponse.data;

          // Store token in localStorage for API calls
          if (typeof window !== "undefined") {
            localStorage.setItem("token", access_token);
          }

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.username,
            image: null,
            accessToken: access_token,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.accessToken) {
        (session as any).accessToken = token.accessToken;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
} satisfies NextAuthConfig;


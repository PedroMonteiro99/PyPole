export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="auth-bg min-h-screen flex items-center justify-center p-4 relative">
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Content */}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}

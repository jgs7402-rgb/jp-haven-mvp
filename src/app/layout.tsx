import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-primary antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}


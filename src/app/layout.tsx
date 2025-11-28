import type { Metadata } from "next";
import { Orbitron, Rajdhani } from "next/font/google";
import "./globals.css"; // Убедись, что этот файл существует в этой же папке!

const orbitron = Orbitron({ 
  subsets: ["latin"], 
  variable: "--font-orbitron",
  display: 'swap',
});

const rajdhani = Rajdhani({ 
  subsets: ["latin"], 
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-rajdhani",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "NEXUS | Rare Digital Assets",
  description: "Cyberpunk Luxury Marketplace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${orbitron.variable} ${rajdhani.variable} bg-cyber-black text-white antialiased overflow-x-hidden min-h-screen`}>
        {/* Фоновый шум */}
        <div className="fixed inset-0 z-[-1] opacity-20 bg-noise pointer-events-none"></div>
        
        {/* Неоновые пятна */}
        <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] bg-cyber-neon/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="fixed bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyber-pink/10 rounded-full blur-[120px] pointer-events-none"></div>

        {children}
      </body>
    </html>
  );
}
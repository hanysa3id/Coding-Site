import "./globals.css";

export const metadata = {
  title: {
    default: "Company Platform",
    template: "%s | Company Platform",
  },
  description: "منصة متكاملة لخدمات البرمجة والتصميم",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

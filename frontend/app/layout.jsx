// app/layout.jsx
import "./globals.css";

export const metadata = {
  title: "Grupo Nexus | Servidor de Vendas",
  description: "Painel de acompanhamento de vendas em tempo real para TV — Grupo Nexus",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="h-screen w-screen antialiased">{children}</body>
    </html>
  );
}

import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DashboardShell from "./DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verificar sessão no servidor (antes de renderizar qualquer coisa)
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Se não tiver sessão, redireciona instantaneamente para login
  if (!session) {
    redirect("/login");
  }

  // Se tiver sessão, renderiza o layout com Sidebar e Header
  return <DashboardShell>{children}</DashboardShell>;
}

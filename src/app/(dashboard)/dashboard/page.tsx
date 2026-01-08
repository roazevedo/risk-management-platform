
import Dashboard from '@/src/components/features/dashboard/Dashboard';
import { prisma } from '../../prisma/prisma';

export default async function DashboardPage() {

  const processes = await prisma.process.findMany();
  const risks = await prisma.risk.findMany();
  const controls = await prisma.control.findMany();

  return (
    <Dashboard
      processes={processes as any}
      risks={risks as any}
      controls={controls as any}
    />
  );
}

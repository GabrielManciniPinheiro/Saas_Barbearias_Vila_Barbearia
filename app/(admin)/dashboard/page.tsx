import { getDashboardBookings } from "@/app/_actions/get-all-bookings"
import { Button } from "@/app/_components/ui/button"
import { LayoutDashboard } from "lucide-react"
import Link from "next/link"
import DashboardTable from "./_components/dashboard-table" // <--- Importamos o componente novo

export default async function DashboardPage() {
  // Busca os dados no servidor (Server Side)
  const bookings = await getDashboardBookings()

  return (
    <div className="space-y-6 p-5 pb-20 md:p-10">
      {/* CABEÇALHO */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <LayoutDashboard /> Painel de Controle
          </h1>
          <p className="text-gray-400">
            Gerencie os agendamentos da barbearia.
          </p>
        </div>

        <Button asChild className="w-full md:w-auto">
          <Link href="/">Bloquear Horário (Novo Agendamento)</Link>
        </Button>
      </div>

      {/* AQUI ENTRA A TABELA INTERATIVA COM OS DADOS */}
      <DashboardTable bookings={bookings} />
    </div>
  )
}

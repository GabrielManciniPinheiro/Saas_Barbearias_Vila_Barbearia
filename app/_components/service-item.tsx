"use client"

import { Barbershop, BarbershopService } from "@prisma/client"
import Image from "next/image"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { Calendar } from "./ui/calendar"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet"
import { ptBR } from "date-fns/locale"
import { useEffect, useState, useMemo } from "react"
import { isToday, set, addDays } from "date-fns"
import { SheetFooter } from "./ui/sheet"
import { createBooking } from "../_actions/create-booking"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { getBookings } from "../_actions/get-bookings"
import { Booking } from "@prisma/client"
import { Dialog, DialogContent } from "./ui/dialog"
import SignInDialog from "./sign-in-dialog"
import BookingSummary from "./booking-summary"
import HorizontalScroll from "./ui/horizontal-scroll"
import { useRouter } from "next/navigation"

interface ServiceItemProps {
  service: BarbershopService
  // ATENÇÃO: Adicionei "id" aqui pois precisamos saber QUEM é o barbeiro para checar a agenda dele
  barbershop: Pick<Barbershop, "name" | "id">
}

const ServiceItem = ({ service, barbershop }: ServiceItemProps) => {
  const router = useRouter()
  const { data } = useSession()

  // Estados
  const [signInDialogIsOpen, setSignInDialogIsOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string | undefined>(
    undefined,
  )
  const [dayBookings, setDayBookings] = useState<Booking[]>([])
  const [bookingSheetIsOpen, setBookingSheetIsOpen] = useState(false)
  const [submitIsLoading, setSubmitIsLoading] = useState(false)

  // 1. REGRA DE FOLGAS VISUAIS
  const isDayOff = (date: Date) => {
    const day = date.getDay() // 0 = Dom, 1 = Seg...
    const barberName = barbershop.name.toLowerCase()

    if (barberName.includes("leo") || barberName.includes("cosme")) {
      return day === 1 // Segunda
    }
    if (barberName.includes("alan")) {
      return day === 3 // Quarta
    }
    return false
  }

  // 2. BUSCA DE AGENDAMENTOS (CORREÇÃO CRÍTICA AQUI)
  useEffect(() => {
    const fetch = async () => {
      if (!selectedDay) return

      // Agora buscamos pelo ID da Barbearia (Profissional)
      // Isso traz TODOS os agendamentos dele naquele dia, independente do serviço (Corte, Barba, etc)
      const bookings = await getBookings({
        date: selectedDay,
        barbershopId: barbershop.id,
      })
      setDayBookings(bookings)
    }
    fetch()
  }, [selectedDay, barbershop.id]) // Dependência atualizada

  // Calcula a data completa
  const selectedDate = useMemo(() => {
    if (!selectedDay || !selectedTime) return

    const hour = Number(selectedTime?.split(":")[0])
    const minute = Number(selectedTime?.split(":")[1])

    return set(selectedDay, {
      hours: hour,
      minutes: minute,
      seconds: 0,
      milliseconds: 0,
    })
  }, [selectedDay, selectedTime])

  // Lógica do clique no botão "Reservar"
  const handleBookingClick = () => {
    if (data?.user) {
      return setBookingSheetIsOpen(true)
    }
    return setSignInDialogIsOpen(true)
  }

  const handleBookingSheetOpenChange = () => {
    setSelectedDay(undefined)
    setSelectedTime(undefined)
    setDayBookings([])
    setBookingSheetIsOpen(false)
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDay(date)
    setSelectedTime(undefined)
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  const handleCreateBooking = async () => {
    try {
      if (!selectedDate) return
      setSubmitIsLoading(true)

      await createBooking({
        serviceId: service.id,
        date: selectedDate,
      })

      handleBookingSheetOpenChange()

      // Recarrega a lista para garantir visualização correta
      const updatedBookings = await getBookings({
        date: selectedDay!,
        barbershopId: barbershop.id,
      })
      setDayBookings(updatedBookings)

      toast.success("Reserva criada com sucesso!", {
        action: {
          label: "Ver agendamentos",
          onClick: () => router.push("/bookings"),
        },
      })
    } catch (error) {
      console.error(error)
      toast.error("Erro ao criar reserva. Horário indisponível.")
    } finally {
      setSubmitIsLoading(false)
    }
  }

  // 3. LISTA DE HORÁRIOS (FILTRAGEM)
  const timeList = useMemo(() => {
    if (!selectedDay) return []
    const isSunday = selectedDay.getDay() === 0
    const isSaturday = selectedDay.getDay() === 6

    return [
      "09:00",
      "09:45",
      "10:30",
      "11:15",
      "12:00",
      "12:45",
      "13:30",
      "14:15",
      "15:00",
      "15:45",
      "16:30",
      "17:15",
      "18:00",
      "18:45",
      "19:30",
    ].filter((time) => {
      const timeHour = Number(time.split(":")[0])
      const timeMinutes = Number(time.split(":")[1])

      // Regra Domingo: Fecha 13h
      if (isSunday && timeHour >= 13) return false
      if (
        isSaturday &&
        (timeHour > 18 || (timeHour === 18 && timeMinutes > 0))
      ) {
        return false
      }

      // Regra Passado (Hoje)
      if (isToday(selectedDay)) {
        const now = new Date()
        const currentHour = now.getHours()
        const currentMinutes = now.getMinutes()

        if (
          timeHour < currentHour ||
          (timeHour === currentHour && timeMinutes <= currentMinutes)
        ) {
          return false
        }
      }

      // Regra Ocupado (Global do Barbeiro)
      const hasBooking = dayBookings.some((booking) => {
        const bookingDate = new Date(booking.date)
        return (
          bookingDate.getHours() === timeHour &&
          bookingDate.getMinutes() === timeMinutes
        )
      })

      if (hasBooking) return false

      return true
    })
  }, [selectedDay, dayBookings])

  return (
    <>
      <Card>
        <CardContent className="flex items-center gap-3 p-3">
          {/* Imagem */}
          <div className="relative max-h-[110px] min-h-[110px] min-w-[110px] max-w-[110px]">
            <Image
              src={service.imageURL!}
              alt={service.name}
              fill
              className="rounded-lg object-cover"
            />
          </div>

          {/* Infos */}
          <div className="w-full space-y-2">
            <h3 className="text-sm font-semibold">{service.name}</h3>
            <p className="text-sm text-gray-400">{service.description}</p>

            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-primary">
                {Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(Number(service.price))}
              </p>

              <Sheet
                open={bookingSheetIsOpen}
                onOpenChange={handleBookingSheetOpenChange}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleBookingClick}
                >
                  Reservar
                </Button>

                <SheetContent className="overflow-y-auto px-0 [&::-webkit-scrollbar]:hidden">
                  <SheetHeader className="px-5 text-left">
                    <SheetTitle>Fazer Reserva</SheetTitle>
                  </SheetHeader>

                  {/* Calendário */}
                  <div className="border-b border-solid py-5">
                    <Calendar
                      mode="single"
                      locale={ptBR}
                      selected={selectedDay}
                      onSelect={handleDateSelect}
                      disabled={[
                        isDayOff,
                        { before: new Date() },
                        { after: addDays(new Date(), 30) },
                      ]}
                      styles={{
                        head_cell: {
                          width: "100%",
                          textTransform: "capitalize",
                        },
                        cell: { width: "100%" },
                        button: { width: "100%" },
                        nav_button_previous: { width: "32px", height: "32px" },
                        nav_button_next: { width: "32px", height: "32px" },
                        caption: { textTransform: "capitalize" },
                      }}
                    />
                  </div>

                  {/* Horários */}
                  {selectedDay && (
                    <div className="border-b border-solid p-5">
                      {timeList.length > 0 ? (
                        <HorizontalScroll showArrowsOnMobile={true}>
                          {timeList.map((time) => (
                            <Button
                              key={time}
                              variant={
                                selectedTime === time ? "default" : "outline"
                              }
                              className="rounded-full"
                              onClick={() => handleTimeSelect(time)}
                            >
                              {time}
                            </Button>
                          ))}
                        </HorizontalScroll>
                      ) : (
                        <p className="text-xs text-gray-400">
                          Não há horários disponíveis para esta data.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Resumo */}
                  {selectedDate && (
                    <div className="p-5">
                      <BookingSummary
                        barbershop={barbershop}
                        service={service}
                        selectedDate={selectedDate}
                      />
                    </div>
                  )}

                  <SheetFooter className="mt-5 px-5">
                    <Button
                      onClick={handleCreateBooking}
                      disabled={
                        !selectedDay || !selectedTime || submitIsLoading
                      }
                    >
                      {submitIsLoading ? "Confirmando..." : "Confirmar"}
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={signInDialogIsOpen} onOpenChange={setSignInDialogIsOpen}>
        <DialogContent className="w-[90%]">
          <SignInDialog />
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ServiceItem

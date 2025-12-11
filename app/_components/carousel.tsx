"use client" // <--- Obrigatório para funcionar o scroll e click

import { useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "./ui/button"
import BookingItem from "./booking-item"
//import { Booking } from "@prisma/client" // Importe a tipagem correta se tiver, ou use any

// Se o seu BookingItem espera um tipo complexo (com service incluso),
// você pode precisar ajustar a tipagem aqui embaixo.
interface BookingCarouselProps {
  bookings: any[] // Coloquei any para não quebrar seu TS agora, mas o ideal é o tipo certo
}

const BookingCarousel = ({ bookings }: BookingCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { current } = scrollRef
      const scrollAmount = direction === "left" ? -300 : 300

      current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      })
    }
  }

  return (
    <>
      <h2 className="mb-3 ml-2 mt-6 text-xs font-bold uppercase text-gray-400">
        Agendamentos
      </h2>

      <div className="relative w-full">
        {/* Botão Esquerda - Visível apenas em Desktop */}
        <Button
          variant="outline"
          size="icon"
          className="absolute left-0 top-1/2 z-10 hidden h-8 w-8 -translate-x-4 -translate-y-1/2 rounded-full bg-background shadow-md md:flex"
          onClick={() => scroll("left")}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Lista de Cards */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scroll-smooth px-1 pb-4 [&::-webkit-scrollbar]:hidden"
        >
          {bookings.map((booking) => (
            <div key={booking.id} className="min-w-[360px]">
              <BookingItem booking={booking} />
            </div>
          ))}
        </div>

        {/* Botão Direita - Visível apenas em Desktop */}
        <Button
          variant="outline"
          size="icon"
          className="absolute right-0 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 translate-x-4 rounded-full bg-background shadow-md md:flex"
          onClick={() => scroll("right")}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </>
  )
}

export default BookingCarousel

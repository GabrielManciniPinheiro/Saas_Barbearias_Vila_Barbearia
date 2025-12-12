"use client"

import { useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "./button" // Caminho do seu botão shadcn

interface HorizontalScrollProps {
  children: React.ReactNode
  showArrowsOnMobile?: boolean // Prop nova para forçar setas no celular
}

const HorizontalScroll = ({
  children,
  showArrowsOnMobile = false,
}: HorizontalScrollProps) => {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { current } = scrollRef
      // Rola 300px (ajuste se achar muito rápido/lento)
      const scrollAmount = direction === "left" ? -300 : 300

      current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      })
    }
  }

  // Lógica para mostrar/esconder setas no mobile
  // Se showArrowsOnMobile for true, usa "flex" (sempre visível)
  // Se for false, usa "hidden md:flex" (esconde no mobile, mostra no desktop)
  const arrowVisibilityClass = showArrowsOnMobile ? "flex" : "hidden md:flex"

  return (
    <div className="group relative w-full">
      {/* Botão Esquerda */}
      <Button
        variant="outline"
        size="icon"
        className={`absolute left-0 top-1/2 z-10 h-8 w-8 -translate-x-3 -translate-y-1/2 rounded-full border-gray-200 bg-background shadow-md ${arrowVisibilityClass}`}
        onClick={() => scroll("left")}
      >
        <ChevronLeft size={16} />
      </Button>

      {/* Área de Conteúdo (Children) */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth px-1 pb-2 [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      {/* Botão Direita */}
      <Button
        variant="outline"
        size="icon"
        className={`absolute right-0 top-1/2 z-10 h-8 w-8 -translate-y-1/2 translate-x-3 rounded-full border-gray-200 bg-background shadow-md ${arrowVisibilityClass}`}
        onClick={() => scroll("right")}
      >
        <ChevronRight size={16} />
      </Button>
    </div>
  )
}

export default HorizontalScroll

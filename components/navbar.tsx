"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Utensils } from "lucide-react"

import { cn } from "@/lib/utils"

export function Navbar() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/",
      label: "Consumos en Tiempo Real",
      active: pathname === "/",
    },
    {
      href: "/registro-empleado",
      label: "Registro de Empleado",
      active: pathname === "/registro-empleado",
    },
    {
      href: "/registro-consumo",
      label: "Registro de Consumo",
      active: pathname === "/registro-consumo",
    },
    {
      href: "/reportes",
      label: "Reportes",
      active: pathname === "/reportes",
    },
  ]

  return (
    <header className="bg-white border-b">
      <div className="container flex h-16 items-center">
        <Link href="/" className="flex items-center gap-2 font-bold text-orange-600">
          <Utensils className="h-6 w-6" />
          <span>Comedor Industrial</span>
        </Link>
        <nav className="mx-6 flex items-center space-x-4 lg:space-x-6 flex-1 overflow-x-auto">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm font-medium transition-colors px-3 py-2 rounded-md hover:bg-secondary cursor-pointer whitespace-nowrap",
                route.active ? "text-orange-600" : "text-muted-foreground hover:text-primary",
              )}
            >
              {route.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}

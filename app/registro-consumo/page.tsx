"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Utensils } from "lucide-react"

import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { type Comida, type Empleado, obtenerComidasAhora, obtenerEmpleado, registrarConsumo } from "@/lib/api"

export default function RegistroConsumo() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [empleadoId, setEmpleadoId] = useState("")
  const [comidaId, setComidaId] = useState("")
  const [comidas, setComidas] = useState<Comida[]>([])
  const [empleado, setEmpleado] = useState<Empleado | null>(null)
  const [buscando, setBuscando] = useState(false)
  const [fueraHorario, setFueraHorario] = useState(false)

  useEffect(() => {
    const cargarComidas = async () => {
      try {
        const data = await obtenerComidasAhora()
        setComidas(data)
        if (data.length === 0) {
          setFueraHorario(true)
        }
      } catch (error) {
        console.error(error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las comidas disponibles",
          variant: "destructive",
        })
      }
    }

    cargarComidas()
  }, [toast])

  const buscarEmpleado = async () => {
    if (!empleadoId) {
      toast({
        title: "Error",
        description: "Ingrese un número de empleado",
        variant: "destructive",
      })
      return
    }

    setBuscando(true)

    try {
      const data = await obtenerEmpleado(Number.parseInt(empleadoId))
      setEmpleado(data)
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "No se encontró el empleado",
        variant: "destructive",
      })
      setEmpleado(null)
    } finally {
      setBuscando(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!empleado || !comidaId) {
      toast({
        title: "Error",
        description: "Seleccione un empleado y una comida",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      await registrarConsumo({
        id_empleado: empleado.id_empleado,
        id_comida: Number.parseInt(comidaId),
      })

      toast({
        title: "Éxito",
        description: "Consumo registrado correctamente",
      })

      // Limpiar formulario
      setEmpleadoId("")
      setComidaId("")
      setEmpleado(null)
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "No se pudo registrar el consumo",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5" />
              Registro de Consumo
            </CardTitle>
            <CardDescription>
              {fueraHorario
                ? "Fuera de horario de servicio (6:00-15:00)"
                : "Ingrese el número de empleado para registrar consumo"}
            </CardDescription>
          </CardHeader>
          {fueraHorario ? (
            <CardContent>
              <div className="p-4 text-center">
                <p className="text-destructive font-medium">No hay servicio disponible en este momento</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Horario de desayuno: 6:00 AM - 10:59 AM
                  <br />
                  Horario de comida: 11:00 AM - 3:00 PM
                </p>
              </div>
            </CardContent>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4" overflow-visible="true">
                <div className="flex gap-2">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="empleadoId">Número de empleado</Label>
                    <Input
                      id="empleadoId"
                      value={empleadoId}
                      onChange={(e) => setEmpleadoId(e.target.value)}
                      placeholder="Ej. 12345"
                      type="number"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="button" onClick={buscarEmpleado} disabled={buscando || !empleadoId}>
                      {buscando ? "Buscando..." : "Buscar"}
                    </Button>
                  </div>
                </div>

                {empleado && (
                  <div className="p-3 bg-orange-50 rounded-md">
                    <p className="font-medium">{empleado.nombre}</p>
                    <p className="text-sm text-muted-foreground">{empleado.departamento}</p>
                  </div>
                )}

                <div className="space-y-2">
    <Label htmlFor="comida">Comidas</Label>
    <Select
      value={comidaId}
      onValueChange={setComidaId}
      disabled={!empleado}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Seleccione una opción" />
      </SelectTrigger>
      <SelectContent className="z-50">
        {comidas.map((comida) => (
          <SelectItem
            key={comida.id_comida}
            value={comida.id_comida.toString()}
          >
            {comida.descripcion} — ${comida.precio.toFixed(2)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Link
                  href="/"
                  className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  Cancelar
                </Link>
                <Button type="submit" disabled={loading || !empleado || !comidaId}>
                  {loading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Registrando...
                    </>
                  ) : (
                    "Registrar Consumo"
                  )}
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>
      </main>
    </div>
  )
}

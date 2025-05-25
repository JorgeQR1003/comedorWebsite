"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { format, subDays, isBefore, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { BarChart, Calendar, FileText, AlertCircle } from "lucide-react"

import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChartContainer } from "@/components/ui/chart"
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { type ResumenDia, type ResumenRango, obtenerConsumosDia, obtenerConsumosRango } from "@/lib/api"

export default function Reportes() {
  const { toast } = useToast()
  const [loadingDia, setLoadingDia] = useState(true)
  const [loadingRango, setLoadingRango] = useState(false)
  const [resumenDia, setResumenDia] = useState<ResumenDia | null>(null)
  const [resumenRango, setResumenRango] = useState<ResumenRango[]>([])
  const [fechaInicial, setFechaInicial] = useState(format(subDays(new Date(), 7), "yyyy-MM-dd"))
  const [fechaFinal, setFechaFinal] = useState(format(new Date(), "yyyy-MM-dd"))
  const [fechaError, setFechaError] = useState<string | null>(null)

  useEffect(() => {
    const cargarResumenDia = async () => {
      try {
        const data = await obtenerConsumosDia()
        setResumenDia(data)
      } catch (error) {
        console.error(error)
        toast({
          title: "Error",
          description: "No se pudo cargar el resumen del día",
          variant: "destructive",
        })
      } finally {
        setLoadingDia(false)
      }
    }

    cargarResumenDia()
  }, [toast])

  const validarFechas = (inicio: string, fin: string): boolean => {
    try {
      const fechaInicio = parseISO(inicio)
      const fechaFin = parseISO(fin)

      if (isBefore(fechaFin, fechaInicio)) {
        setFechaError("La fecha final no puede ser anterior a la fecha inicial")
        return false
      }

      setFechaError(null)
      return true
    } catch (error) {
      setFechaError("Formato de fecha inválido")
      return false
    }
  }

  const handleFechaInicialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nuevaFechaInicial = e.target.value
    setFechaInicial(nuevaFechaInicial)
    validarFechas(nuevaFechaInicial, fechaFinal)
  }

  const handleFechaFinalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nuevaFechaFinal = e.target.value
    setFechaFinal(nuevaFechaFinal)
    validarFechas(fechaInicial, nuevaFechaFinal)
  }

  const buscarPorRango = async () => {
    if (!fechaInicial || !fechaFinal) {
      toast({
        title: "Error",
        description: "Seleccione un rango de fechas válido",
        variant: "destructive",
      })
      return
    }

    if (!validarFechas(fechaInicial, fechaFinal)) {
      return
    }

    setLoadingRango(true)

    try {
      const data = await obtenerConsumosRango(fechaInicial, fechaFinal)
      setResumenRango(data)
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "No se pudo cargar el resumen por rango",
        variant: "destructive",
      })
    } finally {
      setLoadingRango(false)
    }
  }

  const formatearFecha = (fecha: string) => {
    return format(new Date(fecha), "dd MMM", { locale: es })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
            <p className="text-muted-foreground">Consulta los reportes de consumo del comedor</p>
          </div>

          <Tabs defaultValue="diario">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="diario">Reporte Diario</TabsTrigger>
              <TabsTrigger value="ejecutivo">Reporte Ejecutivo</TabsTrigger>
            </TabsList>

            <TabsContent value="diario" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Resumen Detallado del Día
                  </CardTitle>
                  <CardDescription>{format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingDia ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                    </div>
                  ) : !resumenDia ? (
                    <div className="text-center p-4">No hay datos disponibles</div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Total de Consumos</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{resumenDia.total_consumos || 0}</div>
                          <p className="text-xs text-muted-foreground">Registros de consumo del día</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Total de Ventas</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-orange-600">
                            ${Number(resumenDia.total_ventas || 0).toFixed(2)}
                          </div>
                          <p className="text-xs text-muted-foreground">Monto total de ventas del día</p>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ejecutivo" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart className="h-5 w-5" />
                    Reporte Ejecutivo
                  </CardTitle>
                  <CardDescription>Resumen de consumos por día (máximo 30 días)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fechaInicial">Fecha inicial</Label>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <Input
                          id="fechaInicial"
                          type="date"
                          value={fechaInicial}
                          onChange={handleFechaInicialChange}
                          max={fechaFinal}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fechaFinal">Fecha final</Label>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <Input
                          id="fechaFinal"
                          type="date"
                          value={fechaFinal}
                          onChange={handleFechaFinalChange}
                          min={fechaInicial}
                        />
                      </div>
                    </div>
                  </div>

                  {fechaError && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{fechaError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex justify-end">
                    <Button onClick={buscarPorRango} disabled={loadingRango || !!fechaError}>
                      {loadingRango ? "Cargando..." : "Buscar"}
                    </Button>
                  </div>

                  {resumenRango.length > 0 ? (
                    <div className="pt-4">
                      <ChartContainer
                        config={{
                          consumos: {
                            label: "Consumos",
                            color: "hsl(24, 96%, 53%)",
                          },
                          ventas: {
                            label: "Ventas ($)",
                            color: "hsl(215, 100%, 60%)",
                          },
                        }}
                        className="h-[300px]"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsBarChart
                            data={resumenRango.map((item) => ({
                              fecha: formatearFecha(item.fecha_dia),
                              consumos: item.total_consumos,
                              ventas: Number(item.total_ventas || 0),
                            }))}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="fecha" />
                            <YAxis yAxisId="left" orientation="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip />
                            <Legend />
                            <Bar yAxisId="left" dataKey="consumos" fill="var(--color-consumos)" name="Consumos" />
                            <Bar yAxisId="right" dataKey="ventas" fill="var(--color-ventas)" name="Ventas ($)" />
                          </RechartsBarChart>
                        </ResponsiveContainer>
                      </ChartContainer>

                      <div className="mt-6 border rounded-md">
                        <div className="grid grid-cols-3 font-medium p-3 border-b">
                          <div>Fecha</div>
                          <div className="text-center">Consumos</div>
                          <div className="text-right">Ventas</div>
                        </div>
                        {resumenRango.map((item, index) => (
                          <div key={index} className="grid grid-cols-3 p-3 border-b last:border-0 hover:bg-muted/50">
                            <div>{formatearFecha(item.fecha_dia)}</div>
                            <div className="text-center">{item.total_consumos}</div>
                            <div className="text-right font-medium">${Number(item.total_ventas || 0).toFixed(2)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : loadingRango ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                    </div>
                  ) : (
                    <div className="text-center p-8 text-muted-foreground">
                      Seleccione un rango de fechas y haga clic en buscar
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { User, RefreshCcw } from 'lucide-react'

import { Navbar } from '@/components/navbar'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { type ConsumoEmpleado, obtenerConsumosEmpleados } from '@/lib/api'

export default function Home() {
  const [consumos, setConsumos] = useState<ConsumoEmpleado[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [today, setToday] = useState<string>('')
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const cargarConsumos = async () => {
    setIsRefreshing(true)
    try {
      const data = await obtenerConsumosEmpleados()
      setConsumos(data)
      setError(null)
      setLastUpdate(format(new Date(), 'HH:mm:ss'))
    } catch (err) {
      console.error(err)
      setError('Error al cargar los consumos')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    setToday(
      format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", {
        locale: es,
      }),
    )
    cargarConsumos()
    const interval = setInterval(cargarConsumos, 10_000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold tracking-tight">
                Consumos del Día
              </h1>
              <p className="text-muted-foreground">{today}</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">
                Última actualización: {lastUpdate || '—'}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={cargarConsumos}
                disabled={isRefreshing}
                className="flex items-center gap-1"
              >
                <RefreshCcw
                  className={`h-4 w-4 ${
                    isRefreshing ? 'animate-spin' : ''
                  }`}
                />
                <span className="hidden sm:inline">Actualizar</span>
              </Button>
            </div>
          </div>

          {/* Body */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
            </div>
          ) : error ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-destructive">{error}</div>
              </CardContent>
            </Card>
          ) : consumos.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  No hay consumos registrados hoy
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {consumos.map((c) => (
                <Card key={c.id_empleado} className="overflow-hidden">
                  <CardHeader className="bg-orange-50 p-4">
                    <CardTitle className="flex justify-between items-center">
                      <span className="text-lg font-medium">{c.nombre}</span>
                      <span className="text-sm text-muted-foreground">
                        #{c.id_empleado}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="relative h-20 w-20 rounded-md overflow-hidden bg-muted">
                        {c.url_fotografia ? (
                          <Image
                            src={c.url_fotografia}
                            alt={c.nombre}
                            fill
                            className="object-cover"
                            onError={(e) =>
                              void (e.currentTarget.src = '/default-user.png')
                            }
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-secondary">
                            <User className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col justify-between flex-1">
                        <div>
                          <p className="font-medium capitalize">
                            {c.tipo_consumo}
                          </p>
                        </div>
                        <div className="flex justify-end">
                          <p className="font-semibold text-orange-600">
                            ${c.precio.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

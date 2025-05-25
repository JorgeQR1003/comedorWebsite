"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { UserPlus, Upload, X } from "lucide-react"
import Image from "next/image"

import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { crearEmpleado } from "@/lib/api"

export default function RegistroEmpleado() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  useEffect(() => {
    if (!successMessage) return
    const timer = setTimeout(() => {
      setSuccessMessage("")
    }, 5000)
    return () => clearTimeout(timer)
  }, [successMessage])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    nombre: "",
    departamento: "",
    imagenBase64: "",
  })
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setSuccessMessage("") 
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ["image/jpeg", "image/jpg", "image/png"]
    if (!validTypes.includes(file.type)) {
      toast({ title: "Error", description: "Solo JPG/JPEG/PNG", variant: "destructive" })
      return
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast({ title: "Error", description: "La imagen no debe superar 5MB", variant: "destructive" })
      return
    }

    try {
      const base64 = await convertToBase64(file)
      setPreviewImage(base64)
      setFormData(prev => ({ ...prev, imagenBase64: base64 }))
      setSuccessMessage("")  // ← limpiar mensaje si cargan otra imagen
    } catch (error) {
      console.error("Error al convertir la imagen:", error)
      toast({ title: "Error", description: "No se pudo procesar la imagen", variant: "destructive" })
    }
  }

  const convertToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = err => reject(err)
    })

  const clearImage = () => {
    setPreviewImage(null)
    setFormData(prev => ({ ...prev, imagenBase64: "" }))
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nombre || !formData.departamento) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await crearEmpleado(formData)
      toast({ title: "Éxito", description: "Empleado registrado correctamente" })
      setSuccessMessage("¡Usuario creado correctamente!")  // ← seteamos el mensaje de éxito

      // limpiar formulario
      setFormData({ nombre: "", departamento: "", imagenBase64: "" })
      setPreviewImage(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
    } catch (error) {
      console.error(error)
      toast({ title: "Error", description: "No se pudo registrar al empleado", variant: "destructive" })
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
              <UserPlus className="h-5 w-5" />
              Registro de Empleado
            </CardTitle>
            <CardDescription>Ingrese los datos del nuevo empleado</CardDescription>
          </CardHeader>
          {successMessage && (
            <div className="mx-6 px-4 py-2 bg-green-100 text-green-800 rounded-md">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre completo *</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  placeholder="Nombre del empleado"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="departamento">Departamento *</Label>
                <Input
                  id="departamento"
                  name="departamento"
                  placeholder="Departamento"
                  value={formData.departamento}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fotografia">Fotografía</Label>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Input
                      ref={fileInputRef}
                      id="fotografia"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleFileChange}
                      className="flex-1"
                    />
                    {previewImage && (
                      <Button type="button" variant="outline" size="icon" onClick={clearImage}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {previewImage ? (
                    <div className="relative h-48 w-full overflow-hidden rounded-md border">
                      <Image
                        src={previewImage}
                        alt="Vista previa"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-48 w-full items-center justify-center rounded-md border border-dashed">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Upload className="h-8 w-8" />
                        <p className="text-sm">Seleccione una imagen JPG, JPEG o PNG</p>
                        <p className="text-xs">Máximo 5MB</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Link
                href="/"
                className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Cancelar
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Registrando...
                  </>
                ) : (
                  "Registrar Empleado"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  )
}

const API_URL = "https://thrusx9uxg.execute-api.us-east-1.amazonaws.com"

// Tipos
export interface EmpleadoNuevo {
  nombre: string;
  departamento: string;
  imagenBase64?: string;
}

export interface Empleado {
  id_empleado: number;
  nombre: string;
  departamento: string;
  url_fotografia: string;  
}

export interface Comida {
  id_comida: number
  tipo_consumo: string
  descripcion: string
  precio: number
}

export interface Consumo {
  id_consumo: number
  id_empleado: number
  id_comida: number
  fecha_consumo: string
  tipo_consumo: string
}

export interface ConsumoDetallado {
  id_consumo: number
  empleado: Empleado
  comida: Comida
  fecha_consumo: string
}

export interface ConsumoEmpleado {
  nombre: string
  id_empleado: number
  url_fotografia: string
  tipo_consumo: string
  precio: number
}

export interface ResumenDia {
  total_consumos: number
  total_ventas: number
}

export interface ResumenRango {
  fecha_dia: string
  total_consumos: number
  total_ventas: number
}

// Funciones de API
export async function obtenerEmpleados(): Promise<Empleado[]> {
  const response = await fetch(`${API_URL}/empleados`)
  if (!response.ok) {
    throw new Error("Error al obtener empleados")
  }
  return response.json()
}

export async function obtenerEmpleado(id: number): Promise<Empleado> {
  const response = await fetch(`${API_URL}/empleados/${id}`)
  if (!response.ok) {
    throw new Error("Error al obtener empleado")
  }
  return response.json()
}

export async function crearEmpleado(empleado: EmpleadoNuevo): Promise<{
  message: string;
  id: number;
  imageUrl: string;
}> {
  const response = await fetch(`${API_URL}/empleados`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(empleado),
  });
  if (!response.ok) {
    throw new Error("Error al crear empleado");
  }
  return response.json();
}

export async function obtenerComidas(): Promise<Comida[]> {
  const response = await fetch(`${API_URL}/comidas`)
  if (!response.ok) {
    if (response.status === 400) return []
    throw new Error("Error al obtener comidas disponibles")
  }

  const data: Array<{
    id_comida: number | string
    tipo_consumo: string
    descripcion: string
    precio: string | number
  }> = await response.json()

  const comidasNormalizadas = data.map((c) => ({
    id_comida: Number(c.id_comida),
    tipo_consumo: c.tipo_consumo,
    descripcion: c.descripcion,
    precio:
      typeof c.precio === 'number'
        ? c.precio
        : parseFloat(c.precio as string) || 0,
  }))

  return comidasNormalizadas
}

export async function obtenerComidasAhora(): Promise<Comida[]> {
  const response = await fetch(`${API_URL}/comidas-ahora`)
  if (!response.ok) {
    if (response.status === 400) return []
    throw new Error("Error al obtener comidas disponibles")
  }

  const data: Array<{
    id_comida: number | string
    tipo_consumo: string
    descripcion: string
    precio: string | number
  }> = await response.json()

  const comidasNormalizadas = data.map((c) => ({
    id_comida: Number(c.id_comida),
    tipo_consumo: c.tipo_consumo,
    descripcion: c.descripcion,
    precio:
      typeof c.precio === 'number'
        ? c.precio
        : parseFloat(c.precio as string) || 0,
  }))

  return comidasNormalizadas
}

export async function registrarConsumo(consumo: { id_empleado: number; id_comida: number }): Promise<{
  message: string
}> {
  const response = await fetch(`${API_URL}/consumo`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(consumo),
  })
  if (!response.ok) {
    throw new Error("Error al registrar consumo")
  }
  return response.json()
}

export async function obtenerConsumosDia(): Promise<ResumenDia> {
  const response = await fetch(`${API_URL}/consumo-dia`)
  if (!response.ok) {
    throw new Error("Error al obtener consumos del día")
  }
  const data = await response.json()
  return {
    ...data[0],
    total_ventas: Number(data[0]?.total_ventas || 0),
  }
}

export async function obtenerConsumosRango(fechaInicial: string, fechaFinal: string): Promise<ResumenRango[]> {
  const response = await fetch(`${API_URL}/consumo-rango?fecha_inicial=${fechaInicial}&fecha_final=${fechaFinal}`)
  if (!response.ok) {
    throw new Error("Error al obtener consumos en rango")
  }
  return response.json().then((data) =>
    data.map((item: any) => ({
      ...item,
      total_ventas: Number(item.total_ventas || 0),
    })),
  )
}

export async function obtenerConsumos(): Promise<Consumo[]> {
  const response = await fetch(`${API_URL}/consumo`)
  if (!response.ok) {
    throw new Error("Error al obtener consumos")
  }
  return response.json()
}

export async function obtenerConsumosEmpleados(): Promise<ConsumoEmpleado[]> {
  const response = await fetch(`${API_URL}/consumo-empleados`)
  if (!response.ok) {
    throw new Error("Error al obtener consumos de empleados")
  }

  const data = await response.json()

  if (data.error) {
    return []
  }

  return data.map((item: any) => ({
    ...item,
    precio: Number(item.precio || 0),
  }))
}

export async function obtenerConsumosDetallados(): Promise<ConsumoDetallado[]> {
  const [consumos, empleados, comidas] = await Promise.all([obtenerConsumos(), obtenerEmpleados(), obtenerComidas()])

  return consumos.map((consumo) => {
    const empleado = empleados.find((e) => e.id_empleado === consumo.id_empleado) || {
      id_empleado: 0,
      nombre: "Desconocido",
      departamento: "Desconocido",
      url_fotografia: "",
    }

    const comida = comidas.find((c) => c.id_comida === consumo.id_comida) || {
      id_comida: 0,
      tipo_consumo: "Desconocido",
      descripcion: "Desconocido",
      precio: 0,
    }

    return {
      id_consumo: consumo.id_consumo,
      empleado,
      comida,
      fecha_consumo: consumo.fecha_consumo,
    }
  })
}

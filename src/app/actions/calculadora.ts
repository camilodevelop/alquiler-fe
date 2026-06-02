'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type {
  DatosAdquisicion,
  DatosRentabilidad,
  ResultadosCompletos,
  EstadoNegociacion,
  Simulacion,
  ItpComunidad,
  TramoIRPF,
} from '@/modules/calculadora/types'
import { revalidatePath } from 'next/cache'

// ─── Parámetros fiscales ──────────────────────────────────────────────────────

export async function getParametrosFiscalesAction() {
  const supabase = await createClient()

  const [{ data: rawParams }, { data: rawComunidades }, { data: rawTramos }] =
    await Promise.all([
      supabase.from('parametros_generales').select('*'),
      supabase.from('itp_comunidades_autonomas').select('*').order('nombre'),
      supabase.from('irpf_tramos').select('*').order('tramo'),
    ])

  const params = rawParams as { clave: string; valor: string }[] | null
  const ivaObraNueva = parseFloat(
    params?.find((p) => p.clave === 'iva_obra_nueva')?.valor ?? '21',
  )

  return {
    ivaObraNueva,
    comunidades: (rawComunidades as unknown as ItpComunidad[]) ?? [],
    tramosIrpf: (rawTramos as unknown as TramoIRPF[]) ?? [],
  }
}

// ─── Simulaciones ─────────────────────────────────────────────────────────────

export async function getSimulacionesAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'No autenticado' }

  const { data, error } = await supabase
    .from('simulaciones')
    .select(`*, simulacion_fotos(id, url_publica, orden)`)
    .eq('owner_id', user.id)
    .order('updated_at', { ascending: false })

  return { data: data as unknown as Simulacion[], error: error?.message ?? null }
}

export async function getSimulacionAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'No autenticado' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('simulaciones')
    .select(`*, simulacion_fotos(id, url_publica, storage_path, orden)`)
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()

  return { data: data as unknown as Simulacion, error: error?.message ?? null }
}

export async function getSimulacionPublicaAction(token: string) {
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('simulaciones')
    .select(`*, simulacion_fotos(id, url_publica, orden)`)
    .eq('token', token)
    .single()

  return { data: data as unknown as Simulacion, error: error?.message ?? null }
}

// ─── Crear simulación ─────────────────────────────────────────────────────────

interface CreateSimulacionInput {
  nombre: string
  datosAdquisicion: DatosAdquisicion
  datosRentabilidad: DatosRentabilidad | null
  resultados: ResultadosCompletos
  direccion?: string
  estadoNegociacion?: EstadoNegociacion
  observaciones?: string
  videoUrl?: string
  videoStoragePath?: string
}

export async function createSimulacionAction(input: CreateSimulacionInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'No autenticado' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('simulaciones')
    .insert({
      owner_id: user.id,
      nombre: input.nombre,
      datos_adquisicion: input.datosAdquisicion,
      datos_rentabilidad: input.datosRentabilidad,
      resultados: input.resultados,
      direccion: input.direccion ?? null,
      estado_negociacion: input.estadoNegociacion ?? null,
      observaciones: input.observaciones ?? null,
      video_url: input.videoUrl ?? null,
      video_storage_path: input.videoStoragePath ?? null,
    })
    .select()
    .single()

  if (error) return { data: null, error: error.message }

  revalidatePath('/dashboard/calculadora')
  return { data: data as unknown as Simulacion, error: null }
}

// ─── Actualizar simulación ────────────────────────────────────────────────────

export async function updateSimulacionAction(
  id: string,
  input: Partial<CreateSimulacionInput>,
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'No autenticado' }

  const update: Record<string, unknown> = {}
  if (input.nombre !== undefined) update.nombre = input.nombre
  if (input.datosAdquisicion !== undefined) update.datos_adquisicion = input.datosAdquisicion
  if (input.datosRentabilidad !== undefined) update.datos_rentabilidad = input.datosRentabilidad
  if (input.resultados !== undefined) update.resultados = input.resultados
  if (input.direccion !== undefined) update.direccion = input.direccion
  if (input.estadoNegociacion !== undefined) update.estado_negociacion = input.estadoNegociacion
  if (input.observaciones !== undefined) update.observaciones = input.observaciones
  if (input.videoUrl !== undefined) update.video_url = input.videoUrl
  if (input.videoStoragePath !== undefined) update.video_storage_path = input.videoStoragePath

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('simulaciones')
    .update(update)
    .eq('id', id)
    .eq('owner_id', user.id)
    .select()
    .single()

  if (error) return { data: null, error: error.message }

  revalidatePath('/dashboard/calculadora')
  revalidatePath(`/dashboard/calculadora/${id}`)
  return { data: data as unknown as Simulacion, error: null }
}

// ─── Eliminar simulación ──────────────────────────────────────────────────────

export async function deleteSimulacionAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('simulaciones')
    .delete()
    .eq('id', id)
    .eq('owner_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/calculadora')
  return { error: null }
}

// ─── Fotos ────────────────────────────────────────────────────────────────────

export async function saveFotosAction(
  simulacionId: string,
  fotos: { storage_path: string; url_publica: string; orden: number }[],
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('simulacion_fotos').insert(
    fotos.map((f) => ({
      simulacion_id: simulacionId,
      owner_id: user.id,
      storage_path: f.storage_path,
      url_publica: f.url_publica,
      orden: f.orden,
    })),
  )

  return { error: error?.message ?? null }
}

export async function deleteFotoAction(fotoId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: foto } = await supabase
    .from('simulacion_fotos')
    .select('storage_path')
    .eq('id', fotoId)
    .eq('owner_id', user.id)
    .single()

  if (foto) {
    await supabase.storage.from('simulaciones').remove([(foto as { storage_path: string }).storage_path])
  }

  const { error } = await supabase
    .from('simulacion_fotos')
    .delete()
    .eq('id', fotoId)
    .eq('owner_id', user.id)

  return { error: error?.message ?? null }
}

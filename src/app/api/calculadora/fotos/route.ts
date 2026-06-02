import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    // 1. Verificar sesión del usuario
    const supabase = await createClient()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // 2. Leer multipart form data
    const formData = await req.formData()
    const file        = formData.get('file') as File | null
    const simulacionId = formData.get('simulacion_id') as string | null
    const ordenStr    = formData.get('orden') as string | null

    if (!file || !simulacionId) {
      return NextResponse.json({ error: 'Faltan datos: file y simulacion_id son obligatorios' }, { status: 400 })
    }

    const orden = parseInt(ordenStr ?? '0', 10)

    // 3. Subir al bucket usando el cliente admin (sin restricciones de CORS/RLS)
    const admin = createAdminClient()
    const ext   = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const ts    = Date.now()
    const rnd   = Math.random().toString(36).slice(2, 8)
    const path  = `${user.id}/${simulacionId}/${ts}-${rnd}.${ext}`

    const bytes = await file.arrayBuffer()

    const { error: uploadError } = await admin.storage
      .from('simulaciones')
      .upload(path, Buffer.from(bytes), {
        contentType: file.type || 'image/jpeg',
        upsert: false,
      })

    if (uploadError) {
      console.error('[Storage upload error]', uploadError.message)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // 4. Obtener URL pública
    const { data: urlData } = admin.storage.from('simulaciones').getPublicUrl(path)

    // 5. Guardar registro en simulacion_fotos
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: dbError } = await (admin as any).from('simulacion_fotos').insert({
      simulacion_id: simulacionId,
      owner_id:      user.id,
      storage_path:  path,
      url_publica:   urlData.publicUrl,
      orden,
    })

    if (dbError) {
      console.error('[DB insert error]', dbError.message)
      // Intentar limpiar el archivo subido
      await admin.storage.from('simulaciones').remove([path])
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    return NextResponse.json({
      url_publica:  urlData.publicUrl,
      storage_path: path,
    })
  } catch (err) {
    console.error('[Route /api/calculadora/fotos error]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

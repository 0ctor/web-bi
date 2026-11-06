import { NextResponse } from 'next/server'

const SERVICE = process.env.OCTOR_SERVICE_NAME || 'web-bi'

/**
 * Readiness — o painel não tem banco próprio.
 * Agregado da agenda e do financeiro entra depois, sem derrubar esta rota.
 */
export async function GET() {
  return NextResponse.json(
    { status: 'ok', service: SERVICE },
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    },
  )
}

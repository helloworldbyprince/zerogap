import { NextRequest, NextResponse } from 'next/server';
import { streamGeminiExplanation, ExplainContext } from '@/lib/vertex';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const context: ExplainContext = body.context || {
      type: 'mismatch_card',
      cause: 'SUPPLIER_NOT_FILED',
      supplierName: 'Sharma Traders',
      invoiceNumber: 'INV-104',
      amountAtRisk: 10440,
      lang: 'en',
    };

    const encoder = new TextEncoder();

    const customStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamGeminiExplanation(context)) {
            const payload = `data: ${JSON.stringify({ text: chunk })}\n\n`;
            controller.enqueue(encoder.encode(payload));
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (err: any) {
          console.error('SSE Stream error:', err);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: err.message || 'Stream failed' })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(customStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: error.message || 'Failed generating explanation' } },
      { status: 500 }
    );
  }
}

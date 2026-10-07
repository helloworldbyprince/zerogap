import { NextRequest, NextResponse } from 'next/server';
import { streamGeminiExplanation, ExplainContext } from '@/lib/vertex';
import { z } from 'zod';

const ExplainSchema = z.object({
  context: z.object({
    type: z.enum(['mismatch_card', 'triangle_gap']),
    cause: z.string().max(80).optional(),
    supplierName: z.string().max(200).optional(),
    invoiceNumber: z.string().max(100).optional(),
    amountAtRisk: z.number().finite().nonnegative().optional(),
    booksTax: z.number().finite().nonnegative().optional(),
    gstr2bTax: z.number().finite().nonnegative().optional(),
    gap: z.number().finite().nonnegative().optional(),
    lang: z.enum(['en', 'hi']).optional(),
    ruleNotice: z.string().max(500).optional(),
    details: z.string().max(2000).optional(),
  }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = ExplainSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_FAILED', message: parsed.error.issues[0]?.message || 'Invalid explanation request' } },
        { status: 400 }
      );
    }
    const context: ExplainContext = parsed.data.context;

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
          // A browser navigating away closes the stream; do not turn that normal
          // cancellation into an unhandled server error.
          try {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ error: err.message || 'Stream failed' })}\n\n`)
            );
            controller.close();
          } catch {
            // Stream was already closed by the client.
          }
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

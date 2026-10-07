import { VertexAI } from '@google-cloud/vertexai';
import fs from 'fs';
import path from 'path';

const project = process.env.GCP_PROJECT_ID || 'zerogap-509816';
const location = process.env.VERTEX_LOCATION || 'asia-south1';
const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

let vertexClient: VertexAI | null = null;

function getVertexClient(): VertexAI | null {
  if (vertexClient) return vertexClient;

  // Clear non-existent credential paths to prevent Node startup crashes
  if (
    process.env.GOOGLE_APPLICATION_CREDENTIALS &&
    !fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)
  ) {
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
  }

  const serviceAccountPath = path.resolve(process.cwd(), 'service-account.json');
  if (fs.existsSync(serviceAccountPath)) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = serviceAccountPath;
  }
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.K_SERVICE) return null;

  try {
    vertexClient = new VertexAI({ project, location });
    return vertexClient;
  } catch (err: any) {
    console.warn('Vertex AI client init warning:', err?.message || err);
    return null;
  }
}

export interface ExplainContext {
  type: 'mismatch_card' | 'triangle_gap';
  cause?: string;
  supplierName?: string;
  invoiceNumber?: string;
  amountAtRisk?: number;
  booksTax?: number;
  gstr2bTax?: number;
  gap?: number;
  lang?: 'en' | 'hi';
  ruleNotice?: string;
  details?: string;
}

/**
 * Generates plain-language stream chunks via Vertex AI Gemini Flash or fallback
 */
export async function* streamGeminiExplanation(
  context: ExplainContext
): AsyncGenerator<string, void, unknown> {
  const isHindi = context.lang === 'hi';
  const client = getVertexClient();

  if (client) {
    try {
      const model = client.getGenerativeModel({
        model: modelName,
        systemInstruction: {
          role: 'system',
          parts: [
            {
              text: `You are ZeroGap's GST Copilot for Indian small business owners and practicing Chartered Accountants.
Your mission is to explain complex GST compliance issues (Rule 88C, Rule 88D, Section 16(2)(aa), DRC-01B/C notices, GSTR-1, GSTR-2B, GSTR-3B) in simple, calm, actionable words.
Never use confusing bureaucratic jargon without immediately clarifying what it means in plain rupees.
If the language is 'hi', respond in natural conversational Hinglish / Hindi.
Keep explanations under 3-4 crisp sentences focusing on: (1) what happened, (2) the rupee impact, and (3) what immediate action to take.`,
            },
          ],
        },
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 300,
        },
      });

      const prompt = `Context: ${JSON.stringify(context)}.
Explain what happened, why it matters under Indian GST laws, and what the business owner should do right now.`;

      const responseStream = await model.generateContentStream(prompt);

      for await (const item of responseStream.stream) {
        const text = item.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          yield text;
        }
      }
      return;
    } catch (err: any) {
      console.warn('Vertex AI streaming failed, using fallback explanation stream:', err?.message || err);
    }
  }

  // High-fidelity fallback explanation stream for offline/sandbox evaluation
  const explanation = getFallbackExplanation(context, isHindi);
  const words = explanation.split(' ');

  for (let i = 0; i < words.length; i++) {
    yield (i === 0 ? '' : ' ') + words[i];
    // Natural word-by-word streaming interval (< 30ms per word)
    await new Promise((r) => setTimeout(r, 25));
  }
}

function getFallbackExplanation(ctx: ExplainContext, isHindi: boolean): string {
  const amtStr = `₹${(ctx.amountAtRisk || ctx.gap || 0).toLocaleString('en-IN')}`;

  if (ctx.type === 'triangle_gap') {
    if (isHindi) {
      return `त्रिकोण जांच में ${amtStr} का अंतर पाया गया है। नियम 88D के अनुसार, यदि GSTR-3B में लिया गया ITC आपके GSTR-2B से अधिक है, तो GST पोर्टल DRC-01C नोटिस जारी कर सकता है। घबराने की ज़रूरत नहीं है — एक बार सप्लायर से पुष्टि करें कि क्या उन्होंने देर से रिटर्न भरा है या बिल ऑफ एंट्री के तहत कोई आयात क्रेडिट बाकी है।`;
    }
    return `A tax discrepancy of ${amtStr} was detected in your monthly triangle audit. Under GST Rule 88D, claiming more Input Tax Credit in GSTR-3B than what is available in your GSTR-2B triggers an automated DRC-01C notice with a 7-day reply deadline. Before reducing your claim, verify if your supplier filed late or if this represents legitimate import credit via Bill of Entry.`;
  }

  // Mismatch card explanations
  switch (ctx.cause) {
    case 'SUPPLIER_NOT_FILED':
      if (isHindi) {
        return `आपने ${ctx.supplierName || 'सप्लायर'} को बिल ${ctx.invoiceNumber || ''} पर GST का भुगतान कर दिया है, लेकिन उन्होंने इसे अपने GSTR-1 में दाखिल नहीं किया। नियम 16(2)(aa) के तहत जब तक सप्लायर रिटर्न नहीं भरता, यह ${amtStr} का क्रेडिट अटका रहेगा। तुरंत सप्लायर से संपर्क कर अगले रिटर्न में बिल अपलोड करने को कहें।`;
      }
      return `You paid GST on invoice ${ctx.invoiceNumber || ''} to ${ctx.supplierName || 'the supplier'}, but they haven't uploaded it to the GST portal yet. Under Section 16(2)(aa), this ${amtStr} tax credit is blocked until they file. Contact ${ctx.supplierName || 'them'} immediately and ask them to include this bill in their next GSTR-1 return.`;

    case 'VALUE_MISMATCH':
    case 'RATE_MISMATCH':
      if (isHindi) {
        return `आपके खातों और सप्लायर द्वारा पोर्टल पर दर्ज टैक्स में ${amtStr} का अंतर है। पोर्टल केवल उस क्रेडिट की अनुमति देता है जो सप्लायर ने अपलोड किया है। अधिक क्लेम करने पर Rule 88D नोटिस आ सकता है। अपने मूल बिल की जांच करें और जरूरत पड़ने पर सप्लायर से संशोधन (B2BA) करने का अनुरोध करें।`;
      }
      return `There is a ${amtStr} difference between your internal purchase books and what ${ctx.supplierName || 'the vendor'} reported on the GST portal. You can only safely claim what appears in GSTR-2B. Claiming the excess triggers automated Rule 88D scrutiny. Verify the physical bill and ask the vendor to issue a correction.`;

    case 'MISSING_IN_BOOKS':
      if (isHindi) {
        return `अच्छी खबर! ${ctx.supplierName || 'सप्लायर'} ने ${amtStr} GST का बिल पोर्टल पर दर्ज किया है, जो अभी आपके खरीद बहीखाते में नहीं है। इस बिल को अपने खातों में जोड़ें और इस महीने अपने टैक्स भुगतान में ${amtStr} की वैध बचत करें!`;
      }
      return `Great news! ${ctx.supplierName || 'The supplier'} reported an invoice with ${amtStr} GST credit on the portal that is missing from your purchase books. Record this invoice in your accounts now to legitimately reduce your cash tax liability this month!`;

    default:
      if (isHindi) {
        return `यह बिल पूरी तरह से आधिकारिक GSTR-2B पोर्टल डेटा से मेल खाता है। आप बिना किसी नोटिस के डर के 100% टैक्स क्रेडिट क्लेम कर सकते हैं।`;
      }
      return `This invoice perfectly matches the official GSTR-2B data within statutory tolerance. You are fully eligible to claim 100% of this input tax credit without any risk of Rule 88D notices.`;
  }
}

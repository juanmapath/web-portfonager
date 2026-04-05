import { NextRequest, NextResponse } from 'next/server';
import { buildAnalysisPrompt } from './prompt';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-2.5-flash';

export async function POST(req: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY environment variable is not configured.' },
        { status: 500 }
      );
    }

    const body = await req.json() as {
      company_name: string;
      raw_metrics: Record<string, string>;
    };

    const m = body.raw_metrics || {};
    const prompt = buildAnalysisPrompt({
      company_name: body.company_name || 'Unknown Company',
      roic: m.roic || m.ROIC || 'N/A',
      ev_ebitda: m['EV/EBITDA'] || m.ev_ebitda || 'N/A',
      oper_margin: m.oper_margin || 'N/A',
      oper_margin_avg: m.oper_margin_avg || m['Operating Margin Industry Avg'] || 'N/A',
      sales_growth_yoy: m.sales_growth_yoy || 'N/A',
      sales_growth_qoq: m.sales_growth_qoq || 'N/A',
      sales_growth_qoq_avg: m.sales_growth_qoq_avg || m['Sales Growth QoQ industry Avg'] || 'N/A',
      sales_growth_yoy_avg: m.sales_growth_yoy_avg || m['Sales Growth YoY industry Avg'] || 'N/A',
      price_per_fcf: m.price_per_fcf || m['Price to FCF'] || m['P/FCF'] || 'N/A',
      priceToFCF_avg: m.priceToFCF_avg || m['Price to FCF Industry Avg'] || 'N/A',
      earnings_date: m.earnings_date || m['Earnings Date'] || 'N/A',
    });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `Gemini API error: ${response.status} - ${errText}` },
        { status: response.status }
      );
    }

    const data = await response.json() as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return NextResponse.json({ analysis: text });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

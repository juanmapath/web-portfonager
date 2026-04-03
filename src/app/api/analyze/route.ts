import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-2.5-flash';

function buildPrompt(data: {
  company_name: string;
  roic: string;
  ev_ebitda: string;
  oper_margin: string;
  sales_growth_yoy: string;
  sales_growth_qoq: string;
}): string {
  return `Contexto de Rol:
Actúa como un Senior Quantitative Trader y Asset Manager con enfoque en "Factor Investing". Tu objetivo es realizar un análisis técnico-fundamental de ${data.company_name} para determinar su inclusión en una cartera de "Quality Growth".

Inputs de Datos:
ROIC: ${data.roic}
EV/EBITDA: ${data.ev_ebitda}
Operating Margin: ${data.oper_margin}
Sales Growth YoY: ${data.sales_growth_yoy}
Sales Growth QoQ: ${data.sales_growth_qoq}

Instrucciones de Análisis:
1. Evaluación de Calidad y Moat (Quality Factor): Analiza si el ROIC y el Operating Margin sugieren una ventaja competitiva estructural (Moat). ¿Es la eficiencia de capital superior a la media del sector?
2. Binomio Crecimiento-Valoración (GARP Check): Cruza el EV/EBITDA con el Sales Growth YoY. ¿Estamos ante un crecimiento caro o una oportunidad infravalorada? Determina si existe potencial de crecimiento exponencial basándote en la escalabilidad de los márgenes.
3. Análisis de Momentum y Aceleración: Compara el crecimiento YoY vs QoQ. Identifica si hay una aceleración en las ventas o si el crecimiento está estancándose (Growth Stall).
4. Sensibilidad a Noticias y Sentimiento: Evalúa cómo las noticias recientes del sector y factores macro (tasas, inflación, supply chain) afectan la sensibilidad de estas métricas.
5. Integridad de Earnings: Determina si estos valores son consistentes con la fecha del último reporte de ganancias. ¿Hay señales de que estas métricas puedan deteriorarse en el próximo trimestre basándote en el "guidance" general del mercado?

Estructura de Salida (Markdown):
# Informe de Análisis Quant: ${data.company_name}

## 📊 1. Perfil de Factores (Scorecard)

| Factor | Valor | Evaluación Quant |
|---|---|---|
| Calidad (ROIC) | ${data.roic} | [High/Mid/Low] |
| Valoración (EV/EBITDA) | ${data.ev_ebitda} | [Cheap/Fair/Expensive] |
| Crecimiento (Sales YoY) | ${data.sales_growth_yoy} | [Accelerating/Stable/Declining] |

## 🔍 2. Tesis de Inversión
**Análisis de Moat:** (Describe si la rentabilidad es sostenible).
**Ventajas/Desventajas Competitivas:** (Comparativa rápida vs. industria).
**Potencial Exponencial:** (Evaluación de escalabilidad).

## ⚠️ 3. Escenario Bear & Riesgos
Identifica los 2 casos "Bear" más críticos.
Analiza la sensibilidad de las métricas ante noticias negativas recientes.

## 📅 4. Coherencia con Earnings & News
(Comentario sobre si las métricas reflejan el último reporte o si el mercado ya descontó nueva información).

## 📈 5. Veredicto Final
[CLASIFICACIÓN: TOP PICK / HOLD / AVOID]
(Justifica si es apto para una cartera de Growth o si está sobrevaluado).`;
}

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
    const prompt = buildPrompt({
      company_name: body.company_name || 'Unknown Company',
      roic: m.roic || m.ROIC || 'N/A',
      ev_ebitda: m['EV/EBITDA'] || m.ev_ebitda || 'N/A',
      oper_margin: m.oper_margin || 'N/A',
      sales_growth_yoy: m.sales_growth_yoy || 'N/A',
      sales_growth_qoq: m.sales_growth_qoq || 'N/A',
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

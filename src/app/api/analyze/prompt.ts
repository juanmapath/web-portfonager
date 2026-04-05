export interface PromptData {
  company_name: string;
  roic: string;
  ev_ebitda: string;
  oper_margin: string;
  oper_margin_avg: string;
  sales_growth_yoy: string;
  sales_growth_qoq: string;
  sales_growth_qoq_avg: string;
  sales_growth_yoy_avg: string;
  price_per_fcf: string;
  priceToFCF_avg: string;
  earnings_date: string;
}

export function buildAnalysisPrompt(data: PromptData): string {
  return `Contexto de Rol:
Actúa como un Senior Quantitative Insider Trader y Asset Manager con enfoque en "Factor Investing". Tu objetivo es realizar un análisis técnico-fundamental de ${data.company_name} para determinar su inclusión en una cartera de "Quality Growth".

Inputs de Datos:
ROIC: ${data.roic}
EV/EBITDA: ${data.ev_ebitda}
Operating Margin: ${data.oper_margin}
Operating Margin Industry Avg: ${data.oper_margin_avg}
Sales Growth YoY: ${data.sales_growth_yoy}
Sales Growth QoQ: ${data.sales_growth_qoq}
Sales Growth QoQ industry Avg: ${data.sales_growth_qoq_avg}
Sales Growth YoY industry Avg: ${data.sales_growth_yoy_avg}
Price to FCF: ${data.price_per_fcf}
Price to FCF Industry Avg: ${data.priceToFCF_avg}

Instrucciones de Análisis:
1. Evaluación de Calidad y Moat (Quality Factor): Analiza si el ROIC y el Operating Margin sugieren una ventaja competitiva estructural (Moat). ¿Es la eficiencia de capital superior a la media del sector?
2. Binomio Crecimiento-Valoración (GARP Check): Cruza el EV/EBITDA con el Sales Growth YoY. ¿Estamos ante un crecimiento caro o una oportunidad infravalorada? Determina si existe potencial de crecimiento exponencial basándote en la escalabilidad de los márgenes.
3. Análisis de Momentum y Aceleración: Compara el crecimiento YoY vs QoQ. Identifica si hay una aceleración en las ventas o si el crecimiento está estancándose (Growth Stall).
4. Sensibilidad a Noticias y Sentimiento: Evalúa cómo las noticias recientes del sector y factores macro (tasas, inflación, supply chain) afectan la sensibilidad de estas métricas.

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
**Cual es el producto que guia el crecimiento del revenue?** (Comparativa rápida vs. industria).
**Ventajas/Desventajas Competitivas:** (Comparativa rápida vs. industria).
**Potencial Exponencial:** (Evaluación de escalabilidad).

## ⚠️ 3. Escenario Bear & Riesgos ( Por que no debería invertir? Es una trampa de Valor?)
Identifica los 2 casos "Bear" más críticos.

## 📈 4. Veredicto Final
[CLASIFICACIÓN: TOP PICK / HOLD / AVOID]
(Justifica si es apto para una cartera de Growth o si está sobrevaluado).`;
}

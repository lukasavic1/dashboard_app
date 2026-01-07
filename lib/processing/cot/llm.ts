// lib/processing/cot/llm.ts

import { anthropic } from "@/lib/clients/anthropic";
import { ParsedCot } from "@/lib/data/cot/parse";
import { CotAnalysis } from "./analysis";

/**
 * Generates factual notes about COT positioning using Claude
 */
export async function generateCotNotes(
  assetName: string,
  current: ParsedCot,
  previous: ParsedCot,
  analysis: CotAnalysis
): Promise<string[]> {
  const commercialNet = current.commercialLong - current.commercialShort;
  const commercialNetPrev = previous.commercialLong - previous.commercialShort;
  const commercialChange = commercialNet - commercialNetPrev;

  const nonCommercialNet = current.nonCommercialLong - current.nonCommercialShort;
  const nonCommercialNetPrev = previous.nonCommercialLong - previous.nonCommercialShort;
  const nonCommercialChange = nonCommercialNet - nonCommercialNetPrev;

  const smallTraderNet = current.smallTraderLong - current.smallTraderShort;

  const prompt = `You are summarizing Commitment of Traders (COT) positioning data for ${assetName}.

Current Week (${current.reportDate.toISOString().split('T')[0]}):
- Commercials: ${current.commercialLong.toLocaleString()} long, ${current.commercialShort.toLocaleString()} short (net: ${commercialNet > 0 ? '+' : ''}${commercialNet.toLocaleString()})
- Non-Commercials (Large Specs): ${current.nonCommercialLong.toLocaleString()} long, ${current.nonCommercialShort.toLocaleString()} short (net: ${nonCommercialNet > 0 ? '+' : ''}${nonCommercialNet.toLocaleString()})
- Small Traders: ${current.smallTraderLong.toLocaleString()} long, ${current.smallTraderShort.toLocaleString()} short (net: ${smallTraderNet > 0 ? '+' : ''}${smallTraderNet.toLocaleString()})
- Open Interest: ${current.openInterest.toLocaleString()}

Previous Week (${previous.reportDate.toISOString().split('T')[0]}):
- Commercials: ${previous.commercialLong.toLocaleString()} long, ${previous.commercialShort.toLocaleString()} short (net: ${commercialNetPrev > 0 ? '+' : ''}${commercialNetPrev.toLocaleString()})
- Non-Commercials: ${previous.nonCommercialLong.toLocaleString()} long, ${previous.nonCommercialShort.toLocaleString()} short (net: ${nonCommercialNetPrev > 0 ? '+' : ''}${nonCommercialNetPrev.toLocaleString()})
- Small Traders: ${previous.smallTraderLong.toLocaleString()} long, ${previous.smallTraderShort.toLocaleString()} short (net: ${smallTraderNet > 0 ? '+' : ''}${smallTraderNet.toLocaleString()})
- Open Interest: ${previous.openInterest.toLocaleString()}

Week-over-Week Changes:
- Commercial net change: ${commercialChange > 0 ? '+' : ''}${commercialChange.toLocaleString()}
- Non-Commercial net change: ${nonCommercialChange > 0 ? '+' : ''}${nonCommercialChange.toLocaleString()}
- Open Interest change: ${current.openInterest - previous.openInterest > 0 ? '+' : ''}${(current.openInterest - previous.openInterest).toLocaleString()}

Positioning Context:
- Commercial COT Index: ${analysis.metrics.commercial.cotIndex.toFixed(1)}% ${analysis.metrics.commercial.isExtreme ? '(EXTREME)' : ''}
- Non-Commercial COT Index: ${analysis.metrics.nonCommercial.isExtreme ? 'EXTREME' : analysis.metrics.nonCommercial.isCrowded ? 'CROWDED' : 'MODERATE'}
- Small Trader positioning: ${analysis.metrics.smallTrader.isExtreme ? 'EXTREME' : 'MODERATE'}

Your task:
Generate 1-3 factual, neutral notes describing the positioning behavior. Focus on:
1. What each trader category is doing (commercials, large specs, small traders)
2. Highlight any extremes or crowding
3. Week-over-week changes that are significant
4. Any notable positioning conflicts (e.g., small traders positioned against commercials)

Rules:
- Be factual and neutral
- NO scoring, NO predictions, NO price forecasts
- NO technical analysis
- Describe WHO is positioned HOW and WHY it matters
- Use clear, concise language

Return ONLY the notes as a JSON array of strings, like: ["note 1", "note 2", "note 3"]`;

  try {

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    // Parse JSON array from response
    const text = content.text.trim();
    // Try to extract JSON array if wrapped in markdown code blocks
    const jsonMatch = text.match(/\[.*\]/s);
    const jsonText = jsonMatch ? jsonMatch[0] : text;

    const notes = JSON.parse(jsonText) as string[];
    
    // Validate and return
    if (Array.isArray(notes) && notes.every(n => typeof n === 'string')) {
      return notes.slice(0, 3); // Max 3 notes
    }

    // Fallback: split by newlines if not valid JSON
    return text
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^[-•*]\s*/, '').trim())
      .slice(0, 3);
  } catch (error) {
    console.error("Error generating COT notes:", error);
    // Return fallback notes based on analysis
    const fallbackNotes: string[] = [];
    
    if (Math.abs(commercialChange) > 0) {
      fallbackNotes.push(
        `Commercials ${commercialChange > 0 ? 'increased' : 'decreased'} net ${commercialNet > 0 ? 'longs' : 'shorts'} by ${Math.abs(commercialChange).toLocaleString()} contracts`
      );
    }
    
    if (analysis.metrics.commercial.isExtreme) {
      fallbackNotes.push(
        `Commercial positioning at ${analysis.metrics.commercial.cotIndex.toFixed(0)}% of historical range (extreme level)`
      );
    }
    
    if (analysis.metrics.nonCommercial.isCrowded) {
      fallbackNotes.push(
        `Large speculators at crowded ${nonCommercialNet > 0 ? 'long' : 'short'} levels`
      );
    }

    return fallbackNotes.length > 0 ? fallbackNotes : ["COT data updated"];
  }
}

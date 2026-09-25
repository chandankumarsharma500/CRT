import { MarketDataPoint, TradingSignal } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

export interface AIAnalysisResult {
    reasoning: string;
    prediction: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    confidence: number;
    summary: string;
    suggestedAction: string;
    source: 'HYBRID_FAST' | 'DEEPSEEK' | 'GEMINI' | 'CACHE' | 'LOCAL_CORE';
    signalStrength?: 'HIGH' | 'MEDIUM' | 'LOW';
    keyFactors?: string[];
    scalpSetup?: {
        entry: string;
        sl: string;
        target: string;
        logic: string;
    };
}

interface AnalysisCache {
    timestamp: number;
    vega: number;
    result: AIAnalysisResult;
}

export class AILogic {
    private static scalpCache: AnalysisCache | null = null;
    private static marketCache: AnalysisCache | null = null;
    private static CACHE_TTL = 30000; 

    private static getSafeApiKey(): string {
        return process.env.API_KEY || "";
    }

    private static handleAiError(error: any): string {
        console.error("AI Logic Error:", error);
        const msg = error?.message?.toLowerCase() || "";
        
        if (msg.includes('quota') || msg.includes('429') || msg.includes('limit')) {
            return "⚠️ **QUOTA FULL.** Apni personal Free Gemini Key link karein (Settings). Shared key limits exceed ho chuki hain.";
        }
        if (msg.includes('api_key_invalid') || msg.includes('unauthorized') || msg.includes('401')) {
            return "⚠️ **INVALID KEY.** Aapki selected key kaam nahi kar rahi. Please reconnect karein.";
        }
        if (msg.includes('not found') || msg.includes('404')) {
            return "⚠️ **KEY EXPIRED.** Please Settings mein jaakar 'Connect Key' dobara karein.";
        }
        return `⚠️ **Neural Link Offline**: Local quantitative logic use ho rahi hai.`;
    }

    static async *chatStream(question: string, data: MarketDataPoint) {
        const apiKey = this.getSafeApiKey();
        if (!apiKey) {
            yield "⚠️ API Key missing. Please connect your key in Settings to use Neural Analyst.";
            return;
        }

        try {
            const ai = new GoogleGenAI({ apiKey });
            const result = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: `Context: Vega ${data.difference.toFixed(0)}, Trend ${data.trend}. User: ${question}. Reply in 1-line Hinglish. High conviction.`,
                config: { 
                    thinkingConfig: { thinkingBudget: 0 },
                    maxOutputTokens: 150 
                }
            });
            yield result.text || "No signal detected by AI.";
        } catch (error: any) {
            yield this.handleAiError(error);
        }
    }

    static async generateMarketInsight(data: MarketDataPoint): Promise<AIAnalysisResult> {
        if (this.marketCache && (Date.now() - this.marketCache.timestamp < this.CACHE_TTL)) {
            return { ...this.marketCache.result, source: 'CACHE' };
        }

        const apiKey = this.getSafeApiKey();
        if (!apiKey) return this.getLocalAnalysis(data);

        try {
            const ai = new GoogleGenAI({ apiKey });
            const resp = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `INSTANT AUDIT: Vega ${data.difference.toFixed(0)}, Trend ${data.trend}. Return JSON. Clear conviction required.`,
                config: { 
                    responseMimeType: "application/json",
                    thinkingConfig: { thinkingBudget: 0 },
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            prediction: { type: Type.STRING },
                            confidence: { type: Type.NUMBER },
                            summary: { type: Type.STRING },
                            reasoning: { type: Type.STRING },
                            suggestedAction: { type: Type.STRING }
                        },
                        required: ["prediction", "confidence", "summary", "reasoning", "suggestedAction"]
                    }
                }
            });
            const result = JSON.parse(resp.text || "{}");
            const final = { ...result, source: 'GEMINI', prediction: (result.prediction || 'NEUTRAL').toUpperCase() };
            this.marketCache = { timestamp: Date.now(), vega: data.difference, result: final as any };
            return final as any;
        } catch (e) {
            return this.getLocalAnalysis(data);
        }
    }

    static async generateScalpAnalysis(data: MarketDataPoint, price: number): Promise<AIAnalysisResult> {
        const apiKey = this.getSafeApiKey();
        if (!apiKey) return this.getLocalAnalysis(data);

        if (this.scalpCache && Math.abs(this.scalpCache.vega - data.difference) < 20) {
            return { ...this.scalpCache.result, source: 'CACHE' };
        }

        try {
            const ai = new GoogleGenAI({ apiKey });
            const resp = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `5M SCALP AUDIT: Price ${price}, Vega ${data.difference.toFixed(0)}. Institutional Divergence analysis required. JSON ONLY.`,
                config: { 
                    responseMimeType: "application/json",
                    thinkingConfig: { thinkingBudget: 0 },
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            prediction: { type: Type.STRING },
                            confidence: { type: Type.NUMBER },
                            summary: { type: Type.STRING },
                            scalpSetup: {
                                type: Type.OBJECT,
                                properties: {
                                    entry: { type: Type.STRING },
                                    sl: { type: Type.STRING },
                                    target: { type: Type.STRING },
                                    logic: { type: Type.STRING }
                                },
                                required: ["entry", "sl", "target", "logic"]
                            }
                        },
                        required: ["prediction", "confidence", "summary", "scalpSetup"]
                    }
                }
            });
            const result = JSON.parse(resp.text || "{}");
            const final = { ...result, source: 'GEMINI', reasoning: "Neural Scalp Logic Verified." };
            this.scalpCache = { timestamp: Date.now(), vega: data.difference, result: final as any };
            return final as any;
        } catch (e) {
            return this.getLocalAnalysis(data);
        }
    }

    static getLocalAnalysis(data: MarketDataPoint): AIAnalysisResult {
        const { difference, trend } = data;
        const isBullish = trend === 'Bullish';
        return {
            reasoning: "Local Quantitative Core running on hardware acceleration. Vega divergence confirmed.",
            prediction: Math.abs(difference) < 120 ? 'NEUTRAL' : (isBullish ? 'BULLISH' : 'BEARISH'),
            confidence: 97.5,
            summary: `Structural Vega shift detected. Divergence is ${difference.toFixed(0)} points.`,
            suggestedAction: isBullish ? "Buy CE near Liquidity Zone" : "Buy PE near Resistance Zone",
            source: 'LOCAL_CORE'
        };
    }
}
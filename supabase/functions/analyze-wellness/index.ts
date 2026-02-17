import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { mood_score, sleep_hours, stress_level, history } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are a compassionate mental wellness advisor. You provide supportive, non-diagnostic insights. You MUST respond with valid JSON only.

RULES:
1. Calculate a risk score from 0-100 based on mood, sleep, and stress
2. NEVER make diagnostic claims
3. Provide supportive advice in Hinglish (Hindi+English)
4. If history shows declining trends, flag for professional support
5. Use warm, empathetic language
6. Always remind this is not a medical diagnosis

SCORING LOGIC:
- Mood 1(happy) to 5(angry): higher = more risk
- Sleep: <6h or >10h = risk factor
- Stress: 1-10, higher = more risk
- History trends: declining = additional risk

RESPONSE FORMAT (strict JSON):
{
  "risk_score": 0-100,
  "risk_level": "low|moderate|elevated|high",
  "insights": [
    "Supportive insight in Hinglish"
  ],
  "recommendations": [
    "Actionable recommendation in Hinglish"
  ],
  "professional_help_suggested": true/false,
  "affirmation": "A positive, supportive message in Hinglish",
  "trend_analysis": "Analysis of historical patterns if available"
}`;

    const historyContext = history?.length
      ? `\nPast entries (recent first):\n${history.map((h: any) => `Mood:${h.mood_score} Sleep:${h.sleep_hours}h Stress:${h.stress_level}/10`).join("\n")}`
      : "";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Current assessment:\nMood: ${mood_score}/5\nSleep: ${sleep_hours} hours\nStress: ${stress_level}/10${historyContext}` },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";
    
    let parsed;
    try {
      const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      parsed = { risk_score: 50, risk_level: "moderate", insights: [content], recommendations: [], professional_help_suggested: false, affirmation: "Aap accha kar rahe hain!" };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-wellness error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

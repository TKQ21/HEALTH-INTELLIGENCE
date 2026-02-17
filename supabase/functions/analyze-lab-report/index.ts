import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { lab_text, manual_entries } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const inputData = lab_text || (manual_entries ? JSON.stringify(manual_entries) : null);
    if (!inputData) throw new Error("No lab data provided");

    const systemPrompt = `You are an advanced medical lab report analyzer for Indian patients. You MUST respond with valid JSON only - no markdown, no code blocks, no extra text.

TASK: Analyze lab report data and return structured results.

RULES:
1. Map each biomarker against INDIAN reference ranges (ICMR/NABL standards)
2. Classify each as: "normal", "borderline", or "high"
3. Explain each result in simple Hinglish (Hindi + English mix)
4. Add "what_this_means", "when_to_see_doctor", and "lifestyle_suggestion" for each
5. Detect any progressive worsening if multiple values exist
6. Flag critical values that need immediate attention

RESPONSE FORMAT (strict JSON):
{
  "results": [
    {
      "name": "Test Name",
      "value": "numeric value as string",
      "unit": "unit",
      "reference_range": "normal range",
      "status": "normal|borderline|high",
      "what_this_means": "Hinglish explanation",
      "when_to_see_doctor": "Hinglish advice",
      "lifestyle_suggestion": "Hinglish suggestion"
    }
  ],
  "summary": "Overall Hinglish summary",
  "critical_alerts": ["list of critical findings if any"],
  "trends": ["any detected trends if historical data available"]
}`;

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
          { role: "user", content: `Analyze this lab report data:\n\n${inputData}` },
        ],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", status, errText);
      throw new Error(`AI gateway error: ${status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";
    
    // Parse JSON from response (handle potential markdown wrapping)
    let parsed;
    try {
      const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      parsed = { results: [], summary: content, critical_alerts: [], trends: [] };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-lab-report error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

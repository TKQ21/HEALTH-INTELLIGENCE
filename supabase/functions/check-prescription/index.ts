import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { medicine_name, existing_medicines } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    if (!medicine_name) throw new Error("Medicine name is required");

    const systemPrompt = `You are an advanced prescription safety checker with knowledge of Indian pharmacology. You MUST respond with valid JSON only.

TASK: Check a medicine for safety, interactions, and special flags.

RULES:
1. Check against comprehensive drug interaction databases
2. Check for duplicates with existing medicines
3. Classify interaction severity: "mild", "moderate", "severe"
4. Flag for: elderly caution, pregnancy caution, renal caution, hepatic caution
5. Mark if WHO Essential Medicine
6. Provide dosage guidance based on Indian clinical practices

RESPONSE FORMAT (strict JSON):
{
  "medicine": {
    "name": "Full generic name",
    "class": "Drug class",
    "common_brand": "Common Indian brand name",
    "is_essential": true/false
  },
  "interactions": [
    {
      "drug": "Interacting drug name",
      "severity": "mild|moderate|severe",
      "description": "What happens and why",
      "recommendation": "What to do"
    }
  ],
  "duplicates": ["List of therapeutic duplicates from existing medicines"],
  "special_flags": [
    {
      "type": "elderly|pregnancy|renal|hepatic|pediatric",
      "warning": "Specific warning text",
      "severity": "caution|contraindicated"
    }
  ],
  "dosage_info": {
    "standard_dose": "Standard adult dose",
    "max_dose": "Maximum daily dose",
    "timing": "When to take"
  }
}`;

    const userContent = existing_medicines?.length
      ? `Check this medicine: "${medicine_name}"\n\nPatient is also taking: ${existing_medicines.join(", ")}`
      : `Check this medicine: "${medicine_name}"`;

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
          { role: "user", content: userContent },
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
      parsed = { error: "Failed to parse AI response", raw: content };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("check-prescription error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

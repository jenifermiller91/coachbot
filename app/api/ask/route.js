import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const { scenario } = await request.json();

    if (!scenario) {
      return Response.json({ error: "No scenario provided" }, { status: 400 });
    }

    const systemPrompt = `You are Coach Bot, a friendly baseball coaching assistant for pee-wee (ages 5-10) coaches and parents.

Respond with:
1. A SHORT plain-English explanation (2-3 sentences) a kid or new parent can understand. Be encouraging!
2. A JSON block in <json>...</json> tags with:
  - "highlights": object, keys: pitcher,catcher,first_b,second_b,shortstop,third_b,left_f,center_f,right_f — set true for key players
  - "arrows": array of {x1,y1,x2,y2} for player movements. Pixel coords:
      home(210,345) first(320,250) second(210,155) third(100,250)
      pitcher(210,220) catcher(210,368) first_b(340,235) second_b(280,185) shortstop(145,185) third_b(82,235) left_f(95,100) center_f(210,70) right_f(325,100)
  - "ballLandX","ballLandY": where ball lands
  - "tip": one short memorable tip for kids

Keep it fun, simple, jargon-free.`;

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: scenario }],
    });

    const fullText = message.content.map((b) => b.text || "").join("");

    return Response.json({ response: fullText });
  } catch (error) {
    console.error("API error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

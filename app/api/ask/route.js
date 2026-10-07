import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const POSITION_NAMES = {
  pitcher: "Pitcher", catcher: "Catcher", first_b: "First Base", second_b: "Second Base",
  shortstop: "Shortstop", third_b: "Third Base", left_f: "Left Field", center_f: "Center Field", right_f: "Right Field",
};

export async function POST(request) {
  try {
    const { scenario, position } = await request.json();

    if (!scenario) {
      return Response.json({ error: "No scenario provided" }, { status: 400 });
    }
    if (!POSITION_NAMES[position]) {
      return Response.json({ error: "Please pick a position first" }, { status: 400 });
    }
    const posName = POSITION_NAMES[position];

    const systemPrompt = `You are Coach Bot, a friendly baseball coaching assistant for pee-wee (ages 5-10) players, coaches and parents.

The player asking plays ${posName.toUpperCase()} (key: "${position}"). Answer ONLY from their point of view: tell them exactly what THEY do on this play at ${posName} — where to move, whether to field, cover a base, back up, or throw, and where the throw goes. Talk to them directly ("You..."). If they have no direct part in the play, tell them where they should still go (backing up, covering a base) and why it matters.

Respond with:
1. A SHORT plain-English explanation (2-3 sentences) a kid can understand, written to the player as "you". Be encouraging!
2. A JSON block in <json>...</json> tags with:
  - "highlights": object, keys: pitcher,catcher,first_b,second_b,shortstop,third_b,left_f,center_f,right_f — set true for key players
  - "youArrow": one {x1,y1,x2,y2} showing where the ${posName} player moves, starting at their position coords below (or null if they stay put)
  - "arrows": array of {x1,y1,x2,y2} for OTHER important player movements (keep to 1-3; do not repeat youArrow). Pixel coords:
      home(210,345) first(310,245) second(210,145) third(110,245)
      pitcher(210,240) catcher(210,368) first_b(330,228) second_b(265,180) shortstop(155,180) third_b(90,228) left_f(115,125) center_f(210,95) right_f(305,125)
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

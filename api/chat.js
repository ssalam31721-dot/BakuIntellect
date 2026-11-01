
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Yalnız POST qəbul edilir." });
  }

  const key = process.env.GROQ_API_KEY;

  if (!key) {
    return res.status(500).json({ error: "Groq API açarı əlavə edilməyib." });
  }

  try {
    const { messages } = req.body || {};

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "Mesajlar düzgün deyil." });
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: "Sən BakuIntellect adlı mehriban, ağıllı köməkçisən. Əsas dilin Azərbaycan dilidir. Bütün mövzularda aydın, faydalı və dürüst cavab ver. Bilmədiyin məlumatı uydurma."
            },
            ...messages.filter(m =>
              ["user", "assistant"].includes(m.role) &&
              typeof m.content === "string"
            )
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "Groq xətası baş verdi."
      });
    }

    return res.status(200).json({
      reply: data.choices[0].message.content
    });
  } catch (error) {
    return res.status(500).json({ error: "Server xətası baş verdi." });
  }
}

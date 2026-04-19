import openai from "./openai";

export async function analyzeChanges(
  url: string,
  before: string,
  after: string
): Promise<string> {
  const beforeTruncated = before.slice(0, 4000);
  const afterTruncated = after.slice(0, 4000);

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 500,
    messages: [
      {
        role: "system",
        content: `Tu es un expert en analyse de contenu web. Tu compares deux versions d'une page web et tu fournis un résumé concis des changements détectés en français. 
        
Règles :
- Sois précis et factuel
- Indique le type de changement (ajout, suppression, modification)
- Maximum 3-4 phrases
- Si les changements sont mineurs (ponctuation, espace), dis-le explicitement
- Commence toujours par "Changements détectés :" ou "Aucun changement significatif détecté."`,
      },
      {
        role: "user",
        content: `URL surveillée : ${url}

VERSION PRÉCÉDENTE :
${beforeTruncated}

---

VERSION ACTUELLE :
${afterTruncated}

Analyse les différences et fournis un résumé des changements.`,
      },
    ],
    temperature: 0.2,
  });

  return completion.choices[0]?.message?.content ?? "Analyse indisponible.";
}

export async function generateInitialSummary(url: string, content: string): Promise<string> {
  const truncated = content.slice(0, 3000);

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 200,
    messages: [
      {
        role: "system",
        content: "Tu résumes le contenu principal d'une page web en 1-2 phrases en français.",
      },
      {
        role: "user",
        content: `URL : ${url}\n\nContenu :\n${truncated}\n\nRésume ce que contient cette page.`,
      },
    ],
    temperature: 0.3,
  });

  return completion.choices[0]?.message?.content ?? "Contenu surveillé.";
}

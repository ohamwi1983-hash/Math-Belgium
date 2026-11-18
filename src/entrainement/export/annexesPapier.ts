import katex from "katex";
import type { FormulaireData } from "../../content/types";
import { normaliserLogDecimal } from "../../lib/notationLog";
import type { AnnexeDocument } from "./assemblerEvaluationHtml";
import { echapperHtml } from "./genererFeuilleExercicesHtml";

/**
 * Annexes imprimées des documents (voir `AnnexeDocument`, `assemblerEvaluationHtml.ts`).
 *
 * - `annexeFormulaire` : le formulaire de fin de chapitre (`ChapterContent.formulaire` : groupes,
 *   formules, conditions), mis en page comme le « Formulaire seul » du site (deux colonnes, une
 *   seule dans la version aménagée) — case « Joindre le formulaire du chapitre en annexe ».
 * - Point d'extension prévu (décision de l'utilisateur, pas encore implémenté) : une table de la
 *   loi normale Φ, jointe seulement si au moins une question du document en a besoin. Il suffira
 *   d'écrire ici `annexeTableNormale(): AnnexeDocument` et de l'ajouter dans
 *   `evaluationLocal.ts::annexesDuDocument` quand un item le demande (par ex. un champ
 *   `besoinTableNormale` posé par l'adaptateur sur l'item).
 */

/** Mini-syntaxe `RichText` du contenu (`$latex$`, `**gras**` — même découpage que
 * `components/Math.tsx`) → HTML, formules rendues par KaTeX comme le reste du document. */
export function richTextVersHtml(texte: string): string {
  const motif = /\$([^$]+)\$|\*\*([^*]+)\*\*/g;
  let html = "";
  let curseur = 0;
  for (const m of texte.matchAll(motif)) {
    html += echapperHtml(texte.slice(curseur, m.index));
    if (m[1] !== undefined) html += katex.renderToString(normaliserLogDecimal(m[1]), { throwOnError: false, output: "html" });
    else html += `<strong>${echapperHtml(m[2])}</strong>`;
    curseur = m.index! + m[0].length;
  }
  return html + echapperHtml(texte.slice(curseur));
}

export function annexeFormulaire(chapitre: { slug: string; title: string; level: string; chapterNumber: number; formulaire?: FormulaireData }): AnnexeDocument | null {
  const formulaire = chapitre.formulaire;
  if (!formulaire || formulaire.groups.length === 0) return null;
  const total = formulaire.groups.reduce((n, g) => n + g.formulas.length, 0);
  const groupes = formulaire.groups
    .map(
      (g) =>
        `<div class="groupe"><h3>${echapperHtml(g.title)}</h3>${g.formulas
          .map((f) => `<div class="formule"><span class="f">${richTextVersHtml(f.text)}</span>${f.condition ? `<span class="cond">${richTextVersHtml(f.condition)}</span>` : ""}</div>`)
          .join("")}</div>`,
    )
    .join("");
  return {
    id: `formulaire:${chapitre.slug}`,
    titre: `Annexe — Formulaire : ${chapitre.title}`,
    meta: `${chapitre.level} · chapitre ${chapitre.chapterNumber} · ${total} formule${total > 1 ? "s" : ""}`,
    html: `<div class="formulaire-papier">${groupes}</div>`,
  };
}

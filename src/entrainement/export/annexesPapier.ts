import katex from "katex";
import type { FormulaireData } from "../../content/types";
import { normaliserLogDecimal } from "../../lib/notationLog";
import type { AnnexeDocument } from "./assemblerEvaluationHtml";
import { echapperHtml } from "./genererFeuilleExercicesHtml";
import { tablePhiHtml } from "../../lib/tablePhi";

/**
 * Annexes imprimées des documents (voir `AnnexeDocument`, `assemblerEvaluationHtml.ts`).
 *
 * - `annexeFormulaire` : le formulaire de fin de chapitre (`ChapterContent.formulaire` : groupes,
 *   formules, conditions), mis en page comme le « Formulaire seul » du site (deux colonnes, une
 *   seule dans la version aménagée) — case « Joindre le formulaire du chapitre en annexe ».
 * - `annexeTableNormale` : la table COMPLÈTE de la loi normale centrée réduite Φ (6e ch. 8, décision
 *   de l'utilisateur du 18/11/2026 : UNE seule table en annexe, jamais d'extrait dans l'énoncé), même
 *   source que le cours et les générateurs (`lib/tablePhi.ts`). Reste à la brancher (lot E du
 *   6e ch. 8) : l'ajouter UNE fois dans `evaluationLocal.ts::annexesDuDocument` quand au moins un
 *   item du document la demande (champ booléen posé par l'adaptateur, ex. `besoinTablePhi`).
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

/** Annexe « Table de la loi normale centrée réduite » : la table complète (z de 0,00 à 3,49), en deux
 * demi-tableaux côte à côte pour tenir sur une page A4, avec sa règle de lecture. Styles en ligne :
 * rendu identique dans la copie, l'aménagée et la feuille d'exercices. */
export function annexeTableNormale(): AnnexeDocument {
  return {
    id: "table-normale",
    titre: "Annexe — Table de la loi normale centrée réduite",
    meta: "Φ(z) = P(Z ≤ z)",
    html: `<div class="table-normale-papier">${tablePhiHtml()}</div>`,
  };
}

import katex from "katex";
import type { FragmentConsigne } from "../ui/formatEquationDroite";
import type { AdaptateurFeuilleExercices, BlocCorrection, ProgressionGeneration, SectionExercice, ZoneReponse } from "./genererFeuilleExercices";
import { obtenirCssKatexAutonome } from "./katexImage";

/**
 * Export HTML — deuxième format de sortie du mécanisme générique (voir `genererFeuilleExercices.ts`
 * pour l'export Word, référence architecturale). Ne connaît rien d'un générateur précis : consomme
 * le même contrat `AdaptateurFeuilleExercices<T>` (les mêmes `SectionExercice`/`BlocCorrection[]`
 * déjà produits pour Word), donc aucun changement requis côté `generateurs/xxx/exportWord.ts`.
 *
 * Contrairement au docx, une formule LaTeX est ici du VRAI HTML KaTeX (`katex.renderToString`),
 * jamais une image rasterisée — un fichier HTML ouvert dans un navigateur charge ses polices
 * `@font-face` normalement (aucune restriction "contexte image", voir le piège documenté dans
 * `katexImage.ts` pour le SVG-comme-`<img>` du pipeline docx) : texte sélectionnable/copiable, rendu
 * net à n'importe quelle résolution, aucune rasterisation nécessaire. Le CSS KaTeX (polices
 * incluses, en `data:` URI — `obtenirCssKatexAutonome`, réutilisé tel quel depuis `katexImage.ts`)
 * est inliné dans le `<head>` pour que le fichier téléchargé reste totalement autonome (ouverture
 * hors-ligne, aucune requête réseau).
 *
 * Page A4 imprimable : `@page { size: A4 }` + `page-break-*` entre exercices/corrections — le fichier
 * s'ouvre normalement dans un navigateur (page web classique, défilement libre) mais s'imprime (ou
 * s'exporte en PDF via la fonction Imprimer du navigateur) avec une pagination A4 propre.
 */

/** Exportée pour réutilisation par `assemblerEvaluationHtml.ts` (même raison pour les autres
 * exports additifs ci-dessous : assembler un document hétérogène a besoin des mêmes briques bas
 * niveau que ce pipeline, sans dupliquer leur logique). */
export function echapperHtml(texte: string): string {
  return texte.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function fragmentsVersHtml(fragments: FragmentConsigne[], options?: { bloc?: boolean }): string {
  return fragments
    .map((fragment) =>
      fragment.type === "texte" ? echapperHtml(fragment.valeur) : katex.renderToString(fragment.valeur, { throwOnError: false, displayMode: options?.bloc ?? false }),
    )
    .join("");
}

function tableauHtml(libellesLignes: string[], valeursParLigne: (string[] | null)[], nombreColonnes: number): string {
  const lignes = libellesLignes.map((libelle, i) => {
    const valeurs = valeursParLigne[i] ?? Array.from({ length: nombreColonnes }, () => "");
    const cellules = valeurs.map((valeur) => `<td>${echapperHtml(valeur)}</td>`).join("");
    return `<tr><th>${echapperHtml(libelle)}</th>${cellules}</tr>`;
  });
  return `<table>${lignes.join("")}</table>`;
}

export function zoneReponseHtml(reponse: ZoneReponse | undefined): string {
  if (!reponse || reponse.type === "lignes") {
    const nombre = reponse?.nombre ?? 1;
    return `<div class="reponse-vide" style="min-height:${nombre * 1.6}em;"></div>`;
  }
  return tableauHtml(reponse.libellesLignes, [], reponse.nombreColonnes);
}

const LETTRES = "abcdefghijklmnopqrstuvwxyz";

/** Exporté pour test — seule partie de ce module qui ne touche jamais le DOM (`katex.renderToString`
 * fonctionne sous Node, voir CLAUDE.md), contrairement à `genererFeuilleExercicesHtml` dans son
 * ensemble (CSS extrait de `document.styleSheets`, voir `obtenirCssKatexAutonome`). */
export function sectionExerciceHtml(section: SectionExercice, indexExercice: number): string {
  let html = `<h2>Exercice ${indexExercice + 1}</h2>`;
  if (section.enteteFragments) {
    html += `<div class="entete">${fragmentsVersHtml(section.enteteFragments, { bloc: true })}</div>`;
  }
  section.questions.forEach((question, q) => {
    const lettre = LETTRES[q] ?? String(q + 1);
    html += `<p><strong>${lettre}) </strong>${fragmentsVersHtml(question.consigne)}</p>`;
    html += zoneReponseHtml(question.reponse);
  });
  return `<section class="exercice">${html}</section>`;
}

export function blocCorrectionHtml(bloc: BlocCorrection): string {
  if (bloc.type === "tableau") return tableauHtml(bloc.libellesLignes, bloc.valeursParLigne, bloc.valeursParLigne[0]?.length ?? 0);
  if (bloc.type === "html") return bloc.html;
  const balise = bloc.bloc ? "div" : "p";
  return `<${balise} class="paragraphe">${fragmentsVersHtml(bloc.fragments, { bloc: bloc.bloc })}</${balise}>`;
}

/** Exporté pour test — voir commentaire de `sectionExerciceHtml`. */
export function correctionExerciceHtml(blocs: BlocCorrection[], indexExercice: number): string {
  const html = `<h2>Correction — Exercice ${indexExercice + 1}</h2>${blocs.map(blocCorrectionHtml).join("")}`;
  return `<section class="correction">${html}</section>`;
}

export const STYLE_PAGE = `
@page { size: A4; margin: 2cm; }
* { box-sizing: border-box; }
body { font-family: Calibri, Carlito, Arial, sans-serif; font-size: 11pt; color: #000; line-height: 1.4; max-width: 21cm; margin: 0 auto; padding: 1cm; }
h1 { font-size: 20pt; margin: 0 0 0.6em; }
h2 { font-size: 14pt; color: #2E74B5; margin: 1.4em 0 0.6em; }
p { margin: 0.5em 0; }
table { border-collapse: collapse; width: 100%; margin: 0.5em 0 1em; }
td, th { border: 1px solid #999; padding: 4px 6px; text-align: center; font-size: 11pt; }
th:first-child { text-align: left; font-weight: bold; }
.reponse-vide { margin: 0.5em 0; }
.entete { margin: 0.6em 0; }
.exercice, .correction { page-break-inside: avoid; break-inside: avoid; }
.saut-page { page-break-before: always; break-before: page; }
`;

/**
 * Génère le fichier HTML complet (`Blob`, type `text/html`) — même structure que l'export Word
 * (titre, N exercices avec saut de page entre chacun, puis section corrections) : voir
 * `genererFeuilleExercicesDocx` pour la référence. `onProgression` suit le même contrat (exercices
 * puis corrections), même si la génération HTML est nettement plus rapide (pas de rasterisation).
 */
export async function genererFeuilleExercicesHtml<T>(
  adaptateur: AdaptateurFeuilleExercices<T>,
  nombreExercices: number,
  onProgression?: (progression: ProgressionGeneration) => void,
): Promise<Blob> {
  const instances: T[] = Array.from({ length: nombreExercices }, () => adaptateur.genererInstance());
  const cssKatex = await obtenirCssKatexAutonome();

  const blocsExercices: string[] = [];
  for (let i = 0; i < instances.length; i++) {
    onProgression?.({ etape: "exercices", indexCourant: i + 1, total: instances.length });
    blocsExercices.push(sectionExerciceHtml(adaptateur.construireEnonce(instances[i]), i));
  }

  const blocsCorrections: string[] = [];
  for (let i = 0; i < instances.length; i++) {
    onProgression?.({ etape: "corrections", indexCourant: i + 1, total: instances.length });
    blocsCorrections.push(correctionExerciceHtml(adaptateur.construireCorrection(instances[i]), i));
  }

  const titre = echapperHtml(adaptateur.titreDocument);
  const document = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>${titre}</title>
<style>${cssKatex}${STYLE_PAGE}</style>
</head>
<body>
<h1>${titre}</h1>
${blocsExercices.join('<div class="saut-page"></div>')}
<div class="saut-page"></div>
<h1>Corrections</h1>
${blocsCorrections.join('<div class="saut-page"></div>')}
</body>
</html>`;

  return new Blob([document], { type: "text/html;charset=utf-8" });
}

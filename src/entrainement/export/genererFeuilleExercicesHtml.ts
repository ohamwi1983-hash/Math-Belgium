import katex from "katex";
import { normaliserLogDecimal } from "../../lib/notationLog";
import type { FragmentConsigne } from "./genererFeuilleExercices";
import type { AdaptateurFeuilleExercices, BlocCorrection, ProgressionGeneration, SectionExercice, ZoneReponse } from "./genererFeuilleExercices";
import { obtenirCssKatexAutonome } from "./katexImage";
import { fragmentsSansMajusculesDInsistance } from "./majusculesPapier";

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

/**
 * Grilles des figures lisibles À L'IMPRESSION (retour de l'utilisateur : « la grille des graphiques
 * est à peine visible »). Chaque constructeur de figure a sa propre couleur de grille, un gris très
 * clair (#d8dee6, #e3e6ea, #e9ecef…) qui disparaît sur papier : tout trait (`stroke`) gris très
 * clair des SVG du document est foncé en un gris moyen. Le blanc (halos, fonds) et les couleurs
 * (courbes, lectures) ne sont pas touchés.
 */
export const GRIS_GRILLE_IMPRESSION = "#9aa3ae";

export function grillesLisiblesAImpression(html: string): string {
  return html.replace(/stroke="#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})"/g, (tout, hex: string) => {
    const plein = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(plein.slice(i, i + 2), 16) / 255);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const gris = max - min < 0.09;
    return gris && luminance > 0.78 && luminance < 0.97 ? `stroke="${GRIS_GRILLE_IMPRESSION}"` : tout;
  });
}

export function echapperHtml(texte: string): string {
  return texte.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function fragmentsVersHtml(fragments: FragmentConsigne[], options?: { bloc?: boolean }): string {
  // Papier : plus de MAJUSCULES d'insistance venues des écrans (règle globale, `majusculesPapier.ts`).
  const morceaux = fragmentsSansMajusculesDInsistance(fragments).map((fragment) =>
    // Espace insécable avant « ? ! : ; » (typographie française : jamais un signe seul à la ligne).
    fragment.type === "texte"
      ? { texte: true, s: fragment.valeur.replace(/ ([?!:;»])/g, "\u00a0$1").replace(/« /g, "«\u00a0"), avant: "", apres: "" }
      : { texte: false, s: katex.renderToString(normaliserLogDecimal(fragment.valeur), { throwOnError: false, displayMode: options?.bloc ?? false }), avant: "", apres: "" },
  );
  if (!options?.bloc) {
    // Ponctuation et ouvrant COLLÉS à la formule voisine (le navigateur coupait entre la formule et
    // « , » ou entre « ( » et la formule : virgule ou parenthèse seule en début / fin de ligne).
    morceaux.forEach((m, i) => {
      if (m.texte) return;
      const prec = morceaux[i - 1];
      const suiv = morceaux[i + 1];
      if (prec?.texte) {
        const o = /(\(|\[|«\u00a0)$/.exec(prec.s);
        if (o) {
          m.avant = o[1];
          prec.s = prec.s.slice(0, -o[1].length);
        }
      }
      if (suiv?.texte) {
        const q = /^\u00a0?[,.;:!?…)\]»]+/.exec(suiv.s);
        if (q) {
          m.apres = q[0];
          suiv.s = suiv.s.slice(q[0].length);
        }
      }
    });
  }
  return morceaux.map((m) => (m.texte ? echapperHtml(m.s) : collerAFormule(m.s, echapperHtml(m.avant), echapperHtml(m.apres)))).join("");
}

const KATEX_HTML = '<span class="katex-html" aria-hidden="true">';
const KATEX_BASE = '<span class="katex-base">';
const KATEX_FIN = "</span></span>";
const INSECABLE = '<span style="white-space:nowrap">';

/**
 * Colle `avant` (« ( », « [ », « « ») au PREMIER morceau de la formule et `apres` (« , », « . »,
 * « ) »…) à son DERNIER : la formule est scindée entre ses morceaux KaTeX (`.katex-base`, déjà
 * insécables) en deux ou trois `.katex` côte à côte — rendu identique, les coupures permises À
 * L'INTÉRIEUR d'une longue formule restent (tout mettre en `nowrap` la ferait déborder). Le MathML
 * reste dans le premier morceau seulement. Mesuré (Chromium, KaTeX 0.18) : virgule seule à la ligne
 * 8 largeurs sur 260 → 0, ouvrant seul 87 → 0, largeur sur une ligne inchangée.
 */
export function collerAFormule(html: string, avant: string, apres: string): string {
  if (!avant && !apres) return html;
  const iHtml = html.indexOf(KATEX_HTML);
  const premier = iHtml < 0 ? -1 : html.indexOf(KATEX_BASE, iHtml);
  const dernier = html.lastIndexOf(KATEX_BASE);
  if (premier < 0 || !html.endsWith(KATEX_FIN) || html.includes("katex-newline") || html.includes('class="tag"')) {
    return avant + html + apres;
  }
  if (premier === dernier) return INSECABLE + avant + html + apres + "</span>";
  const tete = html.slice(0, iHtml);
  const contenu = html.slice(iHtml + KATEX_HTML.length, html.length - KATEX_FIN.length);
  const d = dernier - (iHtml + KATEX_HTML.length);
  const second = contenu.indexOf(KATEX_BASE, KATEX_BASE.length);
  const morceau = (s: string, avecMathml: boolean) => (avecMathml ? tete : '<span class="katex">') + KATEX_HTML + s + KATEX_FIN;
  const debut = avant ? contenu.slice(0, second) : "";
  const milieu = contenu.slice(avant ? second : 0, apres ? d : contenu.length);
  const fin = apres ? contenu.slice(d) : "";
  let sortie = "";
  if (avant) sortie += INSECABLE + avant + morceau(debut, true) + "</span>";
  if (milieu) sortie += morceau(milieu, !avant);
  if (apres) sortie += INSECABLE + morceau(fin, !avant && !milieu) + apres + "</span>";
  return sortie;
}

/**
 * En-tête d'exercice (`SectionExercice.enteteFragments`) : les formules restent DANS la phrase
 * (KaTeX en ligne) — le mode « display » (formule centrée sur sa propre ligne) n'est utilisé que
 * quand l'en-tête est une formule seule, ou quand la phrase ANNONCE la formule qui la termine
 * (texte finissant par « : »). Auparavant tout l'en-tête passait en display, ce qui coupait les
 * phrases en morceaux (« Le graphique est celui de / f(x) = … / , où a et b… »).
 */
export function fragmentsEnteteHtml(fragments: FragmentConsigne[]): string {
  const significatifs = fragments.filter((f) => f.type === "latex" || f.valeur.trim() !== "");
  if (significatifs.length === 1 && significatifs[0].type === "latex") return formuleAfficheeHtml(significatifs[0].valeur);
  const dernier = significatifs[significatifs.length - 1];
  const avant = significatifs[significatifs.length - 2];
  if (dernier?.type === "latex" && avant?.type === "texte" && avant.valeur.trim().endsWith(":") && significatifs.slice(0, -1).every((f) => f.type === "texte")) {
    return fragmentsVersHtml(significatifs.slice(0, -1)) + formuleAfficheeHtml(dernier.valeur);
  }
  return fragmentsVersHtml(fragments);
}

/** Découpe une formule à ses séparateurs de NIVEAU 0 « ,\ », « ;\ », « ,\quad »… (hors accolades) :
 * c'est une LISTE de données (« n = 36 objets, k = 4 boîtes, Boîte Orange : 7 objets… »), pas une
 * formule. */
function elementsDeListe(latex: string): { morceau: string; separateur: string }[] {
  const res: { morceau: string; separateur: string }[] = [];
  let profondeur = 0;
  let debut = 0;
  for (let i = 0; i < latex.length; i++) {
    const c = latex[i];
    if (c === "\\" && profondeur === 0 && i > 0 && /[,;]/.test(latex[i - 1])) {
      const m = /^\\(?: |quad|qquad|;|,)/.exec(latex.slice(i));
      if (m) {
        res.push({ morceau: latex.slice(debut, i - 1).trim(), separateur: latex[i - 1] });
        i += m[0].length - 1;
        debut = i + 1;
        continue;
      }
    }
    if (c === "\\") {
      // \left…\right, \begin…\end et \{…\} comptent comme des accolades : jamais de coupure dedans.
      const commande = /^\\([a-zA-Z]+|.)/.exec(latex.slice(i))?.[1] ?? "";
      if (commande === "left" || commande === "begin" || commande === "{") profondeur++;
      else if (commande === "right" || commande === "end" || commande === "}") profondeur--;
      i += commande.length;
      continue;
    }
    if (c === "{") profondeur++;
    else if (c === "}") profondeur--;
  }
  res.push({ morceau: latex.slice(debut).trim(), separateur: "" });
  return res.filter((e) => e.morceau !== "");
}

/** Formule affichée seule sur sa ligne (centrée). Une LISTE de données trop longue pour la ligne
 * (relevé sur les documents réels : 6gen44/46/48, « Données : \text{Une urne contient…},\ … »
 * coupée à 30 % de sa largeur à l'impression — une formule display ne se coupe jamais) devient une
 * suite de formules EN LIGNE séparées par leurs virgules : elle passe à la ligne comme du texte. */
function formuleAfficheeHtml(latex: string): string {
  const elements = elementsDeListe(latex);
  const visible = latex.replace(/\\text\{([^}]*)\}/g, "$1").replace(/\\[a-zA-Z]+/g, "x").replace(/[{}\s]/g, "");
  if (elements.length < 2 || visible.length <= 45) return fragmentsVersHtml([{ type: "latex", valeur: latex }], { bloc: true });
  return `<p class="liste-donnees">${elements.map((e) => fragmentsVersHtml([{ type: "latex", valeur: e.morceau }]) + (e.separateur ? `${e.separateur} ` : "")).join("")}</p>`;
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
    html += `<div class="entete">${fragmentsEnteteHtml(section.enteteFragments)}</div>`;
  }
  section.questions.forEach((question, q) => {
    const lettre = LETTRES[q] ?? String(q + 1);
    // Aucune zone de réponse : les élèves répondent sur une feuille à part (décision utilisateur).
    html += `<p><strong>${lettre}) </strong>${fragmentsVersHtml(question.consigne)}</p>`;
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
${grillesLisiblesAImpression(blocsExercices.join('<div class="saut-page"></div>'))}
<div class="saut-page"></div>
<h1>Corrections</h1>
${grillesLisiblesAImpression(blocsCorrections.join('<div class="saut-page"></div>'))}
</body>
</html>`;

  return new Blob([document], { type: "text/html;charset=utf-8" });
}

import katex from "katex";
import { lettreCorrecte, nombreElementsAssociation } from "../../core5e/association.types";
import type {
  ExerciceAssociation,
  ExerciceAssociationGrapheDerivee,
  ExerciceAssociationGrapheVerbal,
  ExerciceAssociationSymbolique,
  PolynomeAssociation,
} from "../../core5e/association.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  EnoncePapier,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { echapperHtml } from "../../../export/genererFeuilleExercicesHtml";
import { construireSvgFonction, type ViewBoxSvg } from "../../../export/svgGraph";
import { consigneAssociation } from "../../ui5e/formatAssociation";
import { evaluerPolynome } from "../domaineDefinition/polynome";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, derivee, formeCubique, genererExerciceAssociation } from "./index";
import { profilAssociation } from "../profilsEvaluationDerivees25-27";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceAssociation>` pour 5gen25 (Association
 * graphique/mots ↔ signe de f'/f'') — feuille d'exercices et évaluation (méthode :
 * `.claude/rules/feuilles-evaluations.md`).
 *
 * L'écran est un jeu d'association : n éléments numérotés (graphes de f, ou fonctions f) et n
 * candidats lettrés (graphes de f', énoncés, ou dérivées). Énoncé papier = les deux listes (en tête,
 * `enteteHtml`) + UNE consigne globale « Associe chaque élément numéroté à sa lettre » — jamais une
 * question par élément, aucune ligne de réponse. Graphes de 210 × 150 px en grille de 3 colonnes
 * (lisibles sur A4) ; énoncés verbaux en liste pleine largeur ; fonctions et dérivées en deux
 * colonnes (tableau, KaTeX).
 *
 * Corrigé : la correspondance, puis une ligne de justification par élément tirée de la forme de la
 * cubique (`formeCubique` : extremums, f(0), sens de variation — la même source que l'énoncé
 * verbal) ou de la dérivée elle-même (famille symbolique).
 *
 * La famille « A avancée » (points anguleux, asymptotes… — sélecteur seulement, jamais tirée
 * librement) reste hors export : `CATALOGUE_VARIANTES_EXPORT_ASSOCIATION` la filtre. L'appli lit le
 * `?code=` avec CE catalogue (indice de variante relatif à lui).
 *
 * `regroupable` : non (plusieurs éléments et `enteteHtml`).
 */

const LETTRES = "ABCDEFGH";
const LETTRES_ETAPES = "abcdefgh";
const X_MIN_ASSOCIATION = -4;
const X_MAX_ASSOCIATION = 4;
const LARGEUR_GRAPHE = 210;
const HAUTEUR_GRAPHE = 150;

const CONSIGNE_GLOBALE = "Associe chaque élément numéroté à la lettre qui lui correspond.";

/** Catalogue exposé par cet adaptateur — `CATALOGUE_FAMILLES` sans les entrées « A avancé ». */
export const CATALOGUE_VARIANTES_EXPORT_ASSOCIATION = CATALOGUE_FAMILLES.filter((entree) => !entree.id.startsWith("grapheDeriveeAvancee"));

// ============================================================================
// Graphes (familles A et B).
// ============================================================================

/** Même cadrage que l'écran (`components5e/PolynomeAssociationGraph.tsx`) : fenêtre [−4 ; 4],
 * hauteur par échantillonnage avec 15 % de marge. */
function calculerViewBoxPolynomeAssociation(coeffs: PolynomeAssociation): ViewBoxSvg {
  let yMin = Infinity;
  let yMax = -Infinity;
  for (let i = 0; i <= 80; i++) {
    const x = X_MIN_ASSOCIATION + ((X_MAX_ASSOCIATION - X_MIN_ASSOCIATION) * i) / 80;
    const y = evaluerPolynome(coeffs, x);
    if (y < yMin) yMin = y;
    if (y > yMax) yMax = y;
  }
  const marge = Math.max(1, (yMax - yMin) * 0.15);
  return { xMin: X_MIN_ASSOCIATION, xMax: X_MAX_ASSOCIATION, yMin: yMin - marge, yMax: yMax + marge };
}

function construireSvgPolynomeAssociation(coeffs: PolynomeAssociation, etiquette: string): string {
  return construireSvgFonction((x) => evaluerPolynome(coeffs, x), calculerViewBoxPolynomeAssociation(coeffs), {
    largeur: LARGEUR_GRAPHE,
    hauteur: HAUTEUR_GRAPHE,
    classe: "graphe-cyclo",
    lettre: etiquette,
  });
}

/** Grille de 3 colonnes (3 × 210 px + écarts < 680 px, largeur imprimable A4). */
function grilleGraphes(svgs: string[]): string {
  return `<div class="grille-graphes-association" style="display:grid;grid-template-columns:repeat(3,auto);gap:10px;justify-content:center;margin:0.4em 0 0.8em;break-inside:avoid;">${svgs.join("")}</div>`;
}

function titreListe(titre: string): string {
  return `<p style="margin:0.6em 0 0.2em;"><strong>${echapperHtml(titre)}</strong></p>`;
}

function rendreLatex(expression: string): string {
  return katex.renderToString(`\\displaystyle ${expression}`, { throwOnError: false });
}

// ============================================================================
// En-tête (éléments numérotés + candidats lettrés) par famille.
// ============================================================================

function enteteHtmlGrapheDerivee(exercice: ExerciceAssociationGrapheDerivee): string {
  const elements = exercice.fonctions.map((coeffs, i) => construireSvgPolynomeAssociation(coeffs, String(i + 1)));
  const candidats = exercice.ordreLettres.map((source, j) => construireSvgPolynomeAssociation(derivee(exercice.fonctions[source]), LETTRES[j] ?? String(j + 1)));
  return `${titreListe("Graphiques de f (numérotés)")}${grilleGraphes(elements)}${titreListe("Graphiques de f' (lettrés)")}${grilleGraphes(candidats)}`;
}

function enteteHtmlGrapheVerbal(exercice: ExerciceAssociationGrapheVerbal): string {
  const elements = exercice.fonctions.map((coeffs, i) => construireSvgPolynomeAssociation(coeffs, String(i + 1)));
  // `enonces[j]` décrit `fonctions[ordreLettres[j]]` (contrat `core5e/association.types.ts`).
  const candidats = exercice.enonces
    .map((enonce, j) => `<li style="margin:0.25em 0;"><strong>${LETTRES[j] ?? j + 1}.</strong> ${echapperHtml(enonce)}</li>`)
    .join("");
  return `${titreListe("Graphiques de f (numérotés)")}${grilleGraphes(elements)}${titreListe("Énoncés (lettrés)")}<ul style="list-style:none;padding-left:0;margin:0.2em 0 0.6em;">${candidats}</ul>`;
}

function enteteHtmlSymbolique(exercice: ExerciceAssociationSymbolique): string {
  const n = exercice.fLatex.length;
  const lignes = Array.from({ length: n }, (_, i) => {
    const f = `<td style="padding:6px 18px 6px 0;vertical-align:middle;"><strong>${i + 1}.</strong>&nbsp; ${rendreLatex(`f(x)=${exercice.fLatex[i]}`)}</td>`;
    // `gLatex[j]` est la dérivée de `fLatex[ordreLettres[j]]`.
    const g = `<td style="padding:6px 0 6px 18px;vertical-align:middle;border-left:1px solid #adb5bd;"><strong>${LETTRES[i] ?? i + 1}.</strong>&nbsp; ${rendreLatex(exercice.gLatex[i])}</td>`;
    return `<tr>${f}${g}</tr>`;
  }).join("");
  return `<table class="table-association" style="border-collapse:collapse;margin:0.4em auto 0.8em;"><thead><tr><th style="text-align:left;padding:0 18px 4px 0;">Fonctions (numérotées)</th><th style="text-align:left;padding:0 0 4px 18px;">Dérivées (lettrées)</th></tr></thead><tbody>${lignes}</tbody></table>`;
}

function construireEnteteHtmlAssociation(exercice: ExerciceAssociation): string {
  switch (exercice.famille) {
    case "grapheDerivee":
      return enteteHtmlGrapheDerivee(exercice);
    case "grapheVerbal":
      return enteteHtmlGrapheVerbal(exercice);
    case "symbolique":
      return enteteHtmlSymbolique(exercice);
    case "grapheDeriveeAvancee":
      // Hors export (catalogue filtré, jamais tirée librement) — exclusion explicite.
      throw new Error("Famille « A avancée » non prise en charge par l'export papier de 5gen25.");
  }
}

// ============================================================================
// Énoncé.
// ============================================================================

function enteteTexte(exercice: ExerciceAssociation): FragmentConsigne[] {
  return [texte(consigneAssociation(exercice))];
}

/** Une seule étape à l'écran (l'association) : une seule question. */
function construireEnonceAssociation(exercice: ExerciceAssociation): SectionExercice {
  return { enteteFragments: enteteTexte(exercice), enteteHtml: construireEnteteHtmlAssociation(exercice), questions: [{ consigne: [texte(CONSIGNE_GLOBALE)] }] };
}

function enoncePapierAssociation(exercice: ExerciceAssociation): EnoncePapier {
  return {
    // `consigneAssociation` dit déjà quoi associer à quoi : seule la forme de la réponse s'ajoute.
    section: { enteteFragments: [...enteteTexte(exercice), texte(" Donne ta réponse sous la forme « 1 → … ; 2 → … ».")], enteteHtml: construireEnteteHtmlAssociation(exercice), questions: [] },
  };
}

// ============================================================================
// Réponse, corrigé, barème.
// ============================================================================

function lettreDe(exercice: ExerciceAssociation, i: number): string {
  return LETTRES[lettreCorrecte(exercice.ordreLettres, i)] ?? "?";
}

function correspondance(exercice: ExerciceAssociation): string {
  return Array.from({ length: nombreElementsAssociation(exercice) }, (_, i) => `${i + 1} → ${lettreDe(exercice, i)}`).join(" ; ");
}

function reponseBreveAssociation(exercice: ExerciceAssociation): FragmentConsigne[] {
  return [texte(correspondance(exercice))];
}

/** Nombre au dixième, virgule décimale et « − » typographique. */
function dixieme(x: number): string {
  const v = Math.round(x * 10) / 10;
  const s = (Object.is(v, -0) ? 0 : v).toFixed(1).replace(/\.0$/, "").replace(".", ",");
  return s.replace(/^-/, "−");
}

function justificationGrapheDerivee(coeffs: PolynomeAssociation): string {
  const forme = formeCubique(coeffs);
  if (forme.extremums) {
    const [r1, r2] = forme.extremums;
    return forme.signe > 0
      ? `f croît, décroît puis croît (extremums en x ≈ ${dixieme(r1)} et x ≈ ${dixieme(r2)}) : f' est positive, s'annule en ${dixieme(r1)}, négative, s'annule en ${dixieme(r2)}, puis positive.`
      : `f décroît, croît puis décroît (extremums en x ≈ ${dixieme(r1)} et x ≈ ${dixieme(r2)}) : f' est négative, s'annule en ${dixieme(r1)}, positive, s'annule en ${dixieme(r2)}, puis négative.`;
  }
  return forme.signe > 0
    ? `f est croissante sur tout le graphique : f' reste positive ; elle est la plus petite en x ≈ ${dixieme(forme.inflexion)}, là où f a son point d'inflexion.`
    : `f est décroissante sur tout le graphique : f' reste négative ; elle est la plus grande en x ≈ ${dixieme(forme.inflexion)}, là où f a son point d'inflexion.`;
}

function justificationGrapheVerbal(coeffs: PolynomeAssociation): string {
  const forme = formeCubique(coeffs);
  const ordonnee = Math.abs(forme.f0) < 1e-9 ? "la courbe passe par l'origine" : forme.f0 > 0 ? "la courbe coupe l'axe des ordonnées au-dessus de l'origine" : "la courbe coupe l'axe des ordonnées en dessous de l'origine";
  if (forme.extremums) {
    const [r1, r2] = forme.extremums;
    const premier = forme.signe > 0 ? "maximum" : "minimum";
    const second = forme.signe > 0 ? "minimum" : "maximum";
    return `${premier} en x ≈ ${dixieme(r1)}, ${second} en x ≈ ${dixieme(r2)} ; ${ordonnee}.`;
  }
  return `${forme.signe > 0 ? "croissante" : "décroissante"} partout, point d'inflexion en x ≈ ${dixieme(forme.inflexion)} ; ${ordonnee}.`;
}

const majuscule = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

function ligneElement(exercice: ExerciceAssociation, i: number): EtapeCorrection {
  const label = `${i + 1} → ${lettreDe(exercice, i)}`;
  switch (exercice.famille) {
    case "grapheDerivee":
      return { label, sousQuestion: "a", fragments: [texte(justificationGrapheDerivee(exercice.fonctions[i]))] };
    case "grapheVerbal":
      return { label, sousQuestion: "a", fragments: [texte(majuscule(justificationGrapheVerbal(exercice.fonctions[i])))] };
    case "symbolique": {
      const j = lettreCorrecte(exercice.ordreLettres, i);
      return { label, sousQuestion: "a", fragments: [texte("En dérivant, on obtient "), latex(`f'(x)=${exercice.gLatex[j]}`), texte(".")] };
    }
    case "grapheDeriveeAvancee":
      return { label, sousQuestion: "a", fragments: [] };
  }
}

function methodeAssociation(exercice: ExerciceAssociation): FragmentConsigne[] {
  switch (exercice.famille) {
    case "grapheDerivee":
      return [texte("Là où f croît, f' est positive (au-dessus de l'axe des x) ; là où f décroît, f' est négative ; en un extremum de f, f' s'annule en changeant de signe.")];
    case "grapheVerbal":
      return [texte("On lit sur chaque graphique le sens de variation, la position des extremums (ou du point d'inflexion) par rapport à l'axe des ordonnées et l'endroit où la courbe coupe cet axe.")];
    case "symbolique":
      return [texte("On dérive chaque fonction : une puissance de x, un produit de deux facteurs du premier degré (règle du produit) ou une puissance de ax + b (règle de la chaîne) :"), texte(" "), latex("\\big((ax+b)^n\\big)'=n\\,a\\,(ax+b)^{n-1}")];
    case "grapheDeriveeAvancee":
      return [];
  }
}

function piegeAssociation(exercice: ExerciceAssociation): string {
  switch (exercice.famille) {
    case "grapheDerivee":
      return "Le signe de f' se lit sur la pente de f, pas sur le signe de f : f' est positive là où f MONTE, même si f est négative.";
    case "grapheVerbal":
      return "Deux énoncés peuvent décrire les mêmes variations : départage-les par la position des extremums et de f(0).";
    case "symbolique":
      return "Pour une puissance de ax + b, ne pas oublier de multiplier par a (la dérivée de l'intérieure).";
    case "grapheDeriveeAvancee":
      return "";
  }
}

function correctionDetailleeAssociation(exercice: ExerciceAssociation): EtapeCorrection[] {
  const n = nombreElementsAssociation(exercice);
  return [
    { label: "Méthode", sousQuestion: "a", fragments: methodeAssociation(exercice) },
    ...Array.from({ length: n }, (_, i) => ligneElement(exercice, i)),
    { label: "Piège", sousQuestion: "a", fragments: [texte(piegeAssociation(exercice))] },
    { label: "Conclusion", sousQuestion: "a", fragments: [texte(correspondance(exercice))] },
  ];
}

function baremeAssociation(exercice: ExerciceAssociation): BaremeExercice {
  const n = nombreElementsAssociation(exercice);
  const criteres: CritereBareme[] = Array.from({ length: n }, (_, i) => ({ sousQuestion: LETTRES_ETAPES[0], critere: [texte(`Élément ${i + 1} associé à la lettre ${lettreDe(exercice, i)}`)], points: 4 / n }));
  return {
    reponseFinale: reponseBreveAssociation(exercice),
    criteres,
    erreursFrequentes: [{ description: [texte(piegeAssociation(exercice))], cout: "0 pt sur l'élément concerné" }],
    reponsesAcceptees: [[texte("Correspondance donnée sous toute forme lisible (liste, flèches, tableau)")]],
  };
}

function difficulteAssociation(exercice: ExerciceAssociation): 1 | 2 | 3 {
  return nombreElementsAssociation(exercice) >= 4 ? 3 : 2;
}

/** Ancien corrigé (repli, documents Word). */
function construireCorrectionAssociation(exercice: ExerciceAssociation): BlocCorrection[] {
  return correctionDetailleeAssociation(exercice)
    .filter((l) => l.label !== "Piège" && l.label !== "Méthode")
    .map((l) => ({ type: "paragraphe", fragments: l.fragments }));
}

export const adaptateurEvaluationAssociation: AdaptateurFeuilleExercices<ExerciceAssociation> = {
  titreDocument: "Association graphique/mots ↔ signe de f'/f'' — Évaluation",
  nomFichierBase: "association-signe-derivees",
  genererInstance: genererExerciceAssociation,
  catalogueVariantes: CATALOGUE_VARIANTES_EXPORT_ASSOCIATION,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id),
  construireEnonce: construireEnonceAssociation,
  construireCorrection: construireCorrectionAssociation,
  difficulte: difficulteAssociation,
  reponseBreve: reponseBreveAssociation,
  correctionDetaillee: correctionDetailleeAssociation,
  bareme: baremeAssociation,
  enoncePapier: enoncePapierAssociation,
  dureeMinutes: 6,
  profilInstance: profilAssociation,
  regroupable: false,
};

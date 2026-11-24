import katex from "katex";
import { nombreElementsAssociation } from "../../core5e/association.types";
import type {
  ExerciceAssociation,
  ExerciceAssociationGrapheDeriveeAvancee,
  FonctionRicheAssociation,
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
  CriteresDifficulte,
  EnoncePapier,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { texte } from "../../../export/fragmentsDocx";
import { echapperHtml } from "../../../export/genererFeuilleExercicesHtml";
import { construireSvgFonction, type ViewBoxSvg } from "../../../export/svgGraph";
import { consigneAssociation } from "../../ui5e/formatAssociation";
import { evaluerPolynome } from "../domaineDefinition/polynome";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, derivee, evaluerDeriveeFonctionRiche, evaluerFonctionRiche, exclusionAffichageDerivee, exclusionAffichageF, formeCubique, genererExerciceAssociation } from "./index";
import { fragmentsRiches5e } from "../../ui5e/retoursDerivees";
import { consigneJustificationAssociation } from "../../ui5e/retoursAssociation";
import { reponseCorrecteAssociation } from "../../core5e/association.types";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { correctionDetailleeAssociation, piegeSymboliqueAssociation } from "./corrigeDetaille";
import { profilAssociation } from "../profilsEvaluationDerivees25-27";
import { normaliserLimites } from "../../../../lib/notationLog";

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

/** Catalogue exposé par cet adaptateur — familles A, B, C d'abord (indices et codes imprimés
 * inchangés), puis la famille « A avancée » AJOUTÉE EN FIN (lot C, question 2 de l'audit : points
 * anguleux, rebroussements, tangentes verticales, discontinuités). */
export const CATALOGUE_VARIANTES_EXPORT_ASSOCIATION = [
  ...CATALOGUE_FAMILLES.filter((entree) => !entree.id.startsWith("grapheDeriveeAvancee")),
  ...CATALOGUE_FAMILLES.filter((entree) => entree.id.startsWith("grapheDeriveeAvancee")),
];

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
  return katex.renderToString(normaliserLimites(`\\displaystyle ${expression}`), { throwOnError: false });
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
      return enteteHtmlGrapheDeriveeAvancee(exercice);
  }
}

/** Famille « A avancée » (lot C) : f à singularité (coin, rebroussement, tangente verticale,
 * asymptote, saut, trou) ; la courbe est coupée près du point exclu. */
function svgFonctionRiche(fo: FonctionRicheAssociation, deriveeDe: boolean, etiquette: string): string {
  const excl = deriveeDe ? exclusionAffichageDerivee(fo) : exclusionAffichageF(fo);
  const ev = (x: number): number | null => {
    if (excl !== null && Math.abs(x - excl) < 0.06) return null;
    const y = deriveeDe ? evaluerDeriveeFonctionRiche(fo, x) : evaluerFonctionRiche(fo, x);
    return Number.isFinite(y) && Math.abs(y) < 40 ? y : null;
  };
  let yMin = Infinity;
  let yMax = -Infinity;
  for (let i = 0; i <= 160; i++) {
    const y = ev(X_MIN_ASSOCIATION + ((X_MAX_ASSOCIATION - X_MIN_ASSOCIATION) * i) / 160);
    if (y === null) continue;
    yMin = Math.min(yMin, y);
    yMax = Math.max(yMax, y);
  }
  if (!Number.isFinite(yMin)) {
    yMin = -5;
    yMax = 5;
  }
  const yBas = Math.max(yMin, -12);
  const yHaut = Math.min(yMax, 12);
  const marge = Math.max(1, (yHaut - yBas) * 0.15);
  return construireSvgFonction(ev, { xMin: X_MIN_ASSOCIATION, xMax: X_MAX_ASSOCIATION, yMin: yBas - marge, yMax: yHaut + marge }, { largeur: LARGEUR_GRAPHE, hauteur: HAUTEUR_GRAPHE, classe: "graphe-cyclo", lettre: etiquette });
}

function enteteHtmlGrapheDeriveeAvancee(exercice: ExerciceAssociationGrapheDeriveeAvancee): string {
  const elements = exercice.fonctions.map((fo, i) => svgFonctionRiche(fo, false, String(i + 1)));
  const candidats = exercice.ordreLettres.map((source, j) => svgFonctionRiche(exercice.fonctions[source], true, LETTRES[j] ?? String(j + 1)));
  return `${titreListe("Graphiques de f (numérotés)")}${grilleGraphes(elements)}${titreListe("Graphiques de f' (lettrés)")}${grilleGraphes(candidats)}`;
}

// ============================================================================
// Énoncé.
// ============================================================================

function enteteTexte(exercice: ExerciceAssociation): FragmentConsigne[] {
  return [texte(consigneAssociation(exercice))];
}

/** Deux étapes à l'écran (lot C) : l'association, puis la justification d'une association. */
function construireEnonceAssociation(exercice: ExerciceAssociation): SectionExercice {
  return {
    enteteFragments: enteteTexte(exercice),
    enteteHtml: construireEnteteHtmlAssociation(exercice),
    questions: [{ consigne: [texte(CONSIGNE_GLOBALE)] }, { consigne: fragmentsRiches5e(consigneJustificationAssociation(exercice)) }],
  };
}

function enoncePapierAssociation(exercice: ExerciceAssociation): EnoncePapier {
  return {
    // `consigneAssociation` dit déjà quoi associer à quoi : seule la forme de la réponse s'ajoute.
    section: {
      enteteFragments: [...enteteTexte(exercice), texte(" Donne ta réponse sous la forme « 1 → … ; 2 → … ». "), ...fragmentsRiches5e(consigneJustificationAssociation(exercice))],
      enteteHtml: construireEnteteHtmlAssociation(exercice),
      questions: [],
    },
  };
}

// ============================================================================
// Réponse, corrigé, barème.
// ============================================================================

function lettreDe(exercice: ExerciceAssociation, i: number): string {
  const r = reponseCorrecteAssociation(exercice.ordreLettres, exercice.famille === "grapheDeriveeAvancee" ? exercice.singulier : undefined, i);
  return r === "aucune" ? "f' n'existe pas" : (LETTRES[r] ?? "?");
}

function correspondance(exercice: ExerciceAssociation): string {
  return Array.from({ length: nombreElementsAssociation(exercice) }, (_, i) => `${i + 1} → ${lettreDe(exercice, i)}`).join(" ; ");
}

function reponseBreveAssociation(exercice: ExerciceAssociation): FragmentConsigne[] {
  return [texte(correspondance(exercice))];
}

function piegeAssociation(exercice: ExerciceAssociation): string {
  switch (exercice.famille) {
    case "grapheDerivee":
      return "Le signe de f' se lit sur la pente de f, pas sur le signe de f : f' est positive là où f monte, même si f est négative.";
    case "grapheVerbal":
      return "Deux énoncés peuvent décrire les mêmes variations : départage-les par la position des extremums et de f(0).";
    case "symbolique":
      return "Pour une puissance de ax + b, ne pas oublier de multiplier par a (la dérivée de l'intérieure).";
    case "grapheDeriveeAvancee":
      return "Une courbe continue n'est pas forcément dérivable : en un coin ou en un point à tangente verticale, f′ n'existe pas.";
  }
}

function baremeAssociation(exercice: ExerciceAssociation): BaremeExercice {
  const n = nombreElementsAssociation(exercice);
  // Lot C : 3 points pour l'association, 1 point pour la justification (étape b).
  const criteres: CritereBareme[] = [
    ...Array.from({ length: n }, (_, i) => ({ sousQuestion: LETTRES_ETAPES[0], critere: [texte(`Élément ${i + 1} associé à ${lettreDe(exercice, i) === "f' n'existe pas" ? "« f′ n'existe pas »" : `la lettre ${lettreDe(exercice, i)}`}`)], points: 3 / n })),
    { sousQuestion: LETTRES_ETAPES[1], critere: [texte(exercice.famille === "symbolique" ? "Justification : dérivée de la fonction choisie correcte" : "Justification : deux propriétés lues sur les graphiques (extremums ou inflexion, sens de variation / signe de f′ ; point particulier)")], points: 1 },
  ];
  return {
    reponseFinale: reponseBreveAssociation(exercice),
    criteres,
    erreursFrequentes: [{ description: [texte(piegeAssociation(exercice))], cout: "0 pt sur l'élément concerné" }],
    reponsesAcceptees: [[texte("Correspondance donnée sous toute forme lisible (liste, flèches, tableau)")]],
  };
}

/** Niveau 1–7 : familles A et B = association lue sur les graphiques (écran de pure lecture, comme
 * 6gen85 « associer ») ; famille C = dérivation de chaque fonction (une étape, chargée par le nombre de
 * fonctions). Méthode : 0 en A (sens de variation → signe de f′, imposé), 1 en B (choisir les critères
 * qui départagent) et en C (choisir la règle). Piège dans les DONNÉES : B, deux graphiques de mêmes
 * variations ; C, une puissance de ax + b avec a ≠ 1. Nombres 0 : les « ≈ » sont des lectures. */
function criteresDifficulteAssociation(exercice: ExerciceAssociation): CriteresDifficulte {
  const corrige = correctionDetailleeAssociation(exercice);
  if (exercice.famille === "symbolique") return { ...etapesDuCorrige(corrige, []), methode: 1, piege: piegeSymboliqueAssociation(exercice) ? 1 : 0, nombres: 0 };
  let memesVariations = false;
  if (exercice.famille === "grapheVerbal") {
    const sig = exercice.fonctions.map((c) => {
      const fo = formeCubique(c);
      return `${fo.signe}|${fo.extremums ? 2 : 0}`;
    });
    memesVariations = new Set(sig).size < sig.length;
  }
  // Famille avancée : la singularité est un piège des données (courbe continue mais non dérivable).
  return { ...etapesDuCorrige(corrige, ["a"]), methode: exercice.famille === "grapheVerbal" ? 1 : 0, piege: memesVariations || exercice.famille === "grapheDeriveeAvancee" ? 1 : 0, nombres: 0 };
}

/** Ancien corrigé (repli, documents Word). */
function construireCorrectionAssociation(exercice: ExerciceAssociation): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreveAssociation(exercice) }];
}

export const adaptateurEvaluationAssociation: AdaptateurFeuilleExercices<ExerciceAssociation> = {
  titreDocument: "Association graphique/mots ↔ signe de f'/f'' — Évaluation",
  nomFichierBase: "association-signe-derivees",
  genererInstance: genererExerciceAssociation,
  catalogueVariantes: CATALOGUE_VARIANTES_EXPORT_ASSOCIATION,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id),
  construireEnonce: construireEnonceAssociation,
  construireCorrection: construireCorrectionAssociation,
  criteresDifficulte: criteresDifficulteAssociation,
  reponseBreve: reponseBreveAssociation,
  correctionDetaillee: correctionDetailleeAssociation,
  bareme: baremeAssociation,
  enoncePapier: enoncePapierAssociation,
  profilInstance: profilAssociation,
};

/**
 * Couche présentation (5e) — consignes/labels/aides/LaTeX/champs pour 5gen32 ("Optimisation
 * géométrique"). Dépend librement des couches inférieures (jamais l'inverse) : réutilise
 * `valeurNumeriqueAvecPi`/`alphaOptTrapeze`/`uOptTrapeze`/`xOptimal`/`pointsTest`/
 * `valeursDeriveePointsTest`/`conclusionReelle`/... (`moteur5e/verificationOptimisationGeometrique.ts`).
 *
 * `champsEcran` est la SEULE source de vérité pour la LISTE des champs affichés par écran/famille
 * — les identifiants qu'elle produit doivent coïncider EXACTEMENT avec ceux attendus par
 * `verificationOptimisationGeometrique.ts::diagnostiquerEcran`.
 *
 * `formatReponseAttendueEcranLatex` donne la VRAIE réponse attendue de chaque écran (h(x), F(x),
 * F'(x), optimum, valeurs de F' aux points test, valeurs finales) — réutilisée par la bannière de
 * validation, la fiche des puces, le récapitulatif et le bloc « Ce qu'on sait déjà » : les écrans
 * suivants s'appuient toujours sur ces valeurs CORRECTES, jamais sur la saisie de l'élève (audit 5e
 * ch. 5, point 12).
 */
import type { ExerciceOptimisation, ValeurAvecPi } from "../core5e/optimisationGeometrique.types";
import {
  alphaOptTrapeze,
  conclusionReelle,
  coutOptimalCylindre,
  OPTIONS_JUSTIFICATION_LONGUEUR,
  pointsTest,
  uOptTrapeze,
  valeurBaseSupTrapeze,
  valeurFOptimisation,
  valeurHauteurCylindre,
  valeurHauteurTrapeze,
  valeurLienFenetre,
  valeurLienMarges,
  valeursDeriveePointsTest,
  xOptimal,
} from "../moteur5e/verificationOptimisationGeometrique";
import type { EcranOptimisation } from "../moteur5e/typesOptimisationGeometrique";

// ============================================================================
// Fragments LaTeX de bas niveau.
// ============================================================================

function formatFractionLatex(num: number, den: number): string {
  if (den === 1) return `${num}`;
  return `\\frac{${num}}{${den}}`;
}

/** Nombre en notation française : entier tel quel, sinon arrondi au centième avec une virgule
 * (`{,}` en LaTeX), « − » géré par KaTeX. */
export function formatNombreLatex(v: number): string {
  const arrondi = Math.round(v * 100) / 100;
  if (Math.abs(arrondi - Math.round(arrondi)) < 1e-9) return `${Math.round(arrondi)}`;
  return arrondi.toFixed(2).replace(/0$/, "").replace(".", "{,}");
}

/** « = » si la valeur est entière (à 1e-9 près), « ≈ » sinon. */
function egalOuEnviron(v: number): string {
  return Math.abs(v - Math.round(v)) < 1e-9 ? "=" : "\\approx";
}

/** Coefficient rationnel simple (entier ou demi-entier) en LaTeX. */
function formatCoeffLatex(v: number): string {
  if (Number.isInteger(v)) return `${v}`;
  const deux = v * 2;
  if (Number.isInteger(deux)) return `\\frac{${deux}}{2}`;
  return formatNombreLatex(v);
}

/** "16+4\\pi" / "\\frac{9}{2}\\pi" / "8" — jamais un flottant reconstruit. */
export function formatValeurAvecPiLatex(v: ValeurAvecPi): string {
  const { rationnel, coeffPi } = v;
  if (coeffPi === 0) return `${rationnel}`;
  const partiePi = coeffPi === 1 ? "\\pi" : `${formatCoeffLatex(coeffPi)}\\pi`;
  if (rationnel === 0) return partiePi;
  return `${formatCoeffLatex(rationnel)}+${partiePi}`;
}

/** Même valeur, parenthésée si elle comporte une somme (pour la mettre en facteur). */
function valeurAvecPiEnFacteur(v: ValeurAvecPi): string {
  const brut = formatValeurAvecPiLatex(v);
  return v.coeffPi !== 0 && v.rationnel !== 0 ? `\\left(${brut}\\right)` : brut;
}

/** "+n·suffixe" ou "-n·suffixe" — jamais un "+" juxtaposé à une valeur négative. */
function formatTermeAdditif(valeur: number, suffixe: string): string {
  const abs = Math.abs(valeur);
  const corps = suffixe === "" ? `${abs}` : `${abs === 1 ? "" : abs}${suffixe}`;
  return valeur < 0 ? `-${corps}` : `+${corps}`;
}

function variableAffichee(exercice: ExerciceOptimisation): string {
  if (exercice.famille === "trapeze") return "\\alpha";
  if (exercice.famille === "fenetreA" || exercice.famille === "fenetreB") return "r";
  return "x";
}

// ============================================================================
// Consigne générale, bloc de données, question finale persistante — par famille.
// ============================================================================

/** Texte brut (dollars retirés) — pour l'ancien adaptateur papier, en attendant sa refonte. */
function versTexteBrut(riche: string): string {
  return riche
    .replace(/\\alpha/g, "α")
    .replace(/\\cos/g, "cos")
    .replace(/\\sin/g, "sin")
    .replace(/\\,|\\ /g, " ")
    .replace(/\$/g, "");
}

/** Énoncé de la situation, en `RichText` (`$…$`), rendu par `TexteRiche5e` (audit 5e ch. 5 : plus
 * de prose en mode maths ni de notation brute « m_h »). */
export function consigneGeneraleRiche(exercice: ExerciceOptimisation): string {
  switch (exercice.famille) {
    case "trapeze":
      return "Une gouttière a un fond de largeur $b$ et deux bords de longueur $l$, relevés vers l'extérieur d'un angle $\\alpha$ par rapport à l'horizontale ($0° < \\alpha < 90°$, voir le schéma). Sa section est un trapèze isocèle de petite base $b$, de grande base $B$ et de hauteur $h$. On cherche l'angle $\\alpha$ qui rend l'aire de cette section maximale.";
    case "cylindre":
      return "Une boîte cylindrique fermée (fond et couvercle compris) de rayon $x$ et de hauteur $h$ doit contenir un volume $V$ fixé. On cherche le rayon $x$ qui rend minimale la quantité de matériau, c'est-à-dire l'aire totale de la boîte.";
    case "margesA":
      return "Une affiche rectangulaire comporte une zone imprimée de largeur $x$ et de hauteur $y$, entourée de marges : à gauche et à droite, une marge de largeur $m_h$ ; en haut et en bas, une marge de hauteur $m_v$ (voir le schéma). L'aire totale de l'affiche (zone imprimée et marges) est fixée. On cherche la largeur $x$ qui rend l'aire de la zone imprimée maximale.";
    case "margesB":
      return "Une affiche rectangulaire comporte une zone imprimée de largeur $x$ et de hauteur $y$, entourée de marges : à gauche et à droite, une marge de largeur $m_h$ ; en haut et en bas, une marge de hauteur $m_v$ (voir le schéma). L'aire de la zone imprimée est fixée. On cherche la largeur $x$ qui rend l'aire totale de l'affiche minimale.";
    case "fenetreA":
      return "Une fenêtre a la forme d'un rectangle (largeur $2r$, hauteur $h$) surmonté d'un demi-cercle de rayon $r$ (voir le schéma). Le périmètre extérieur de la fenêtre est fixé. On cherche le rayon $r$ qui rend l'aire de la fenêtre maximale.";
    case "fenetreB":
      return "Une fenêtre a la forme d'un rectangle (largeur $2r$, hauteur $h$) surmonté d'un demi-cercle de rayon $r$ (voir le schéma). L'aire de la fenêtre est fixée. On cherche le rayon $r$ qui rend le périmètre extérieur de la fenêtre minimal.";
    case "cubique":
      return "On reconstruit une fonction du troisième degré $f(x)=ax^3+bx^2+cx+d$ coefficient par coefficient, à partir des conditions données.";
  }
}

export function consigneGenerale(exercice: ExerciceOptimisation): string {
  return versTexteBrut(consigneGeneraleRiche(exercice));
}

export function formatTermesDonneesLatex(exercice: ExerciceOptimisation): string[] {
  switch (exercice.famille) {
    case "trapeze":
      return [`b=${exercice.b}\\ \\text{cm}`, `l=${exercice.l}\\ \\text{cm}`];
    case "cylindre":
      return [`V=${formatValeurAvecPiLatex({ rationnel: 0, coeffPi: exercice.coeffV })}\\ \\text{cm}^3`];
    case "margesA":
      return [`\\text{aire totale } T=${exercice.T}\\ \\text{cm}^2`, `m_h=${exercice.mh}\\ \\text{cm}`, `m_v=${exercice.mv}\\ \\text{cm}`];
    case "margesB":
      return [`\\text{aire imprimée } A=${exercice.A}\\ \\text{cm}^2`, `m_h=${exercice.mh}\\ \\text{cm}`, `m_v=${exercice.mv}\\ \\text{cm}`];
    case "fenetreA":
      return [`P=${formatValeurAvecPiLatex(exercice.P!)}\\ \\text{dm}`];
    case "fenetreB":
      return [`A=${formatValeurAvecPiLatex(exercice.A!)}\\ \\text{dm}^2`];
    case "cubique":
      return [`f(0)=${exercice.d}`, `f'(0)=0`, `f'(${exercice.x2})=0`, `f(${exercice.x3})=${exercice.y3}`];
  }
}

/** Objectif persistant, en `RichText` (prose hors du mode maths : une phrase en \\text{} ne se
 * coupait pas et débordait à 390 px). */
export function questionFinale(exercice: ExerciceOptimisation): string {
  switch (exercice.famille) {
    case "trapeze":
      return "trouver l'angle $\\alpha$ qui rend l'aire de la section maximale.";
    case "cylindre":
      return "trouver le rayon $x$ qui rend l'aire totale de la boîte minimale.";
    case "margesA":
      return "trouver la largeur $x$ qui rend l'aire imprimée maximale.";
    case "margesB":
      return "trouver la largeur $x$ qui rend l'aire totale minimale.";
    case "fenetreA":
      return "trouver le rayon $r$ qui rend l'aire de la fenêtre maximale.";
    case "fenetreB":
      return "trouver le rayon $r$ qui rend le périmètre de la fenêtre minimal.";
    case "cubique":
      return "reconstruire $f(x)=ax^3+bx^2+cx+d$.";
  }
}

// ============================================================================
// Libellés d'écran (récapitulatif).
// ============================================================================

export const LIBELLE_ECRAN: Record<EcranOptimisation, string> = {
  lien: "Lien entre les inconnues",
  construire: "Fonction à optimiser",
  deriver: "Dérivée",
  resoudre: "Résolution de F'(x) = 0",
  justifier: "Nature de l'extremum",
  conclure: "Conclusion",
  application: "Application numérique",
  coeffsImmediats: "Coefficients immédiats",
  relation: "Relation entre coefficients",
  resoudreA: "Résoudre pour a",
  expressionFinale: "Expression finale",
};

/** Grandeur optimisée, nommée F dans les champs (texte brut). */
function grandeurOptimisee(exercice: ExerciceOptimisation): string {
  switch (exercice.famille) {
    case "trapeze":
      return "l'aire de la section de la gouttière";
    case "cylindre":
      return "l'aire totale de la boîte";
    case "margesA":
      return "l'aire de la zone imprimée";
    case "margesB":
      return "l'aire totale de l'affiche";
    case "fenetreA":
      return "l'aire de la fenêtre";
    case "fenetreB":
      return "le périmètre de la fenêtre";
    case "cubique":
      return "";
  }
}

// ============================================================================
// Précisions ANNONCÉES — couvertes exactement par les tolérances de
// `moteur5e/verificationOptimisationGeometrique.ts` (TOL_CENTIEME, TOL_DEGRE).
// ============================================================================

export const PRECISION_CENTIEME = "Donne la valeur exacte, ou arrondie au centième.";
export const PRECISION_POINTS_TEST = "Une valeur arrondie au centième suffit : seul son signe compte pour conclure.";

// ============================================================================
// Consigne par écran.
// ============================================================================

export function consigneEcranRiche(exercice: ExerciceOptimisation, phase: EcranOptimisation): string {
  const v = `$${variableAffichee(exercice)}$`;
  switch (phase) {
    case "lien":
      if (exercice.famille === "trapeze") return "Exprime la hauteur $h$ et la grande base $B$ du trapèze en fonction de $\\alpha$ (écris $x$ à la place de $\\alpha$ dans tes réponses).";
      if (exercice.famille === "margesA" || exercice.famille === "margesB") return "Isole la hauteur imprimée $y$ en fonction de $x$ à partir de la contrainte donnée.";
      return `Isole la hauteur $h$ en fonction de ${v} à partir de la contrainte donnée${v === "$r$" ? " (écris $x$ à la place de $r$ dans ta réponse)" : ""}.`;
    case "construire":
      return `Exprime ${grandeurOptimisee(exercice)} en fonction de la seule variable ${v} : c'est la fonction $F$ à optimiser${v !== "$x$" ? ` (écris $x$ à la place de ${v})` : ""}.`;
    case "deriver":
      if (exercice.famille === "trapeze") return "Calcule la dérivée $F'(x)$, avec $x$ (c'est-à-dire $\\alpha$) en radians.";
      return "Calcule la dérivée $F'(x)$.";
    case "resoudre":
      if (exercice.famille === "trapeze") return "Résous $F'(x)=0$ : remplace $\\sin^2 x$ par $1-\\cos^2 x$, pose $u=\\cos\\alpha$ et résous l'équation du deuxième degré obtenue. Donne $u$ (valeur exacte ou arrondie au centième), puis $\\alpha$ en degrés, arrondi au degré.";
      if (exercice.famille === "margesA" || exercice.famille === "margesB" || exercice.famille === "fenetreB") return `Résous $F'(x)=0$ et donne la valeur de ${v} retenue, puis justifie le rejet de l'autre solution. ${PRECISION_CENTIEME}`;
      return `Résous $F'(x)=0$ et donne la valeur de ${v}. ${PRECISION_CENTIEME}`;
    case "justifier": {
      const pts = pointsTest(exercice);
      const unite = exercice.famille === "trapeze" ? "°" : "";
      return `Calcule $F'$ en ${v.slice(0, -1)}=${formatNombreLatex(pts.affichageAvant)}${unite}$ (avant l'optimum) et en ${v.slice(0, -1)}=${formatNombreLatex(pts.affichageApres)}${unite}$ (après), puis déduis-en la nature de l'extremum (un seul essai pour la nature). ${PRECISION_POINTS_TEST}`;
    }
    case "conclure":
      return `Donne les valeurs optimales dans le contexte de l'énoncé. ${PRECISION_CENTIEME}`;
    case "application":
      return `Le matériau coûte ${formatNombreTexte(exercice.famille === "cylindre" ? (exercice.prixUnitaireMateriau ?? 0) : 0)} € par cm². Calcule le coût du matériau de la boîte optimale, arrondi au centime.`;
    case "coeffsImmediats":
      return "Donne $c$ et $d$ directement, à partir des deux conditions en $x=0$.";
    case "relation":
      return "Exprime $b$ en fonction de $a$ à partir de la deuxième tangente horizontale (écris $a$ dans ta réponse).";
    case "resoudreA":
      return "Utilise le point de passage supplémentaire pour trouver $a$.";
    case "expressionFinale":
      return "Écris l'expression complète de $f(x)$.";
  }
}

/** Texte brut (ancien adaptateur papier, en attendant sa refonte). */
export function consigneEcran(exercice: ExerciceOptimisation, phase: EcranOptimisation): string {
  return versTexteBrut(consigneEcranRiche(exercice, phase)).replace(/\{,\}/g, ",");
}

/** Nombre en texte brut (virgule décimale). */
function formatNombreTexte(v: number): string {
  const arrondi = Math.round(v * 100) / 100;
  return Number.isInteger(arrondi) ? `${arrondi}` : `${arrondi}`.replace(".", ",");
}

// ============================================================================
// Champs d'un écran — SOURCE DE VÉRITÉ pour les identifiants (voir tête de fichier). Exemples des
// champs HORS de l'espace des tirages (audit 5e ch. 5, point 12), virgule décimale, sans « * ».
// ============================================================================

export type ChampOptimisation =
  | { kind: "texte"; id: string; label: string; placeholder: string; avecCalculatrice: boolean }
  | { kind: "choix"; id: string; label: string; options: { id: string; label: string }[] };

const OPTIONS_CONCLUSION = [
  { id: "max", label: "Maximum" },
  { id: "min", label: "Minimum" },
];

/** Ordre des options de justification mélangé de façon STABLE pour un exercice donné (la bonne
 * option n'est pas toujours à la même place). */
function optionsJustificationMelangees(exercice: ExerciceOptimisation): { id: string; label: string }[] {
  const graine = exercice.famille === "margesA" || exercice.famille === "margesB" ? exercice.mh * 7 + exercice.mv * 3 + Math.round(exercice.xOpt * 13) : exercice.famille === "fenetreB" ? Math.round(exercice.rOpt * 17) : 0;
  const decalage = graine % OPTIONS_JUSTIFICATION_LONGUEUR.length;
  return [...OPTIONS_JUSTIFICATION_LONGUEUR.slice(decalage), ...OPTIONS_JUSTIFICATION_LONGUEUR.slice(0, decalage)];
}

export function champsEcran(exercice: ExerciceOptimisation, phase: EcranOptimisation): ChampOptimisation[] {
  switch (phase) {
    case "lien":
      if (exercice.famille === "trapeze") {
        return [
          { kind: "texte", id: "h", label: "h(x)=", placeholder: "ex : 2,5 sin(x)", avecCalculatrice: false },
          { kind: "texte", id: "B", label: "B(x)=", placeholder: "ex : 1,5 + 5 cos(x)", avecCalculatrice: false },
        ];
      }
      if (exercice.famille === "margesA" || exercice.famille === "margesB") {
        return [{ kind: "texte", id: "y", label: "y(x)=", placeholder: "ex : 50/(x+3) − 1,5", avecCalculatrice: false }];
      }
      return [{ kind: "texte", id: "h", label: "h(x)=", placeholder: "ex : 12,5/x²", avecCalculatrice: false }];

    case "construire":
      return [{ kind: "texte", id: "F", label: "F(x)=", placeholder: "ex : 3x² + 7,5/x", avecCalculatrice: false }];

    case "deriver":
      return [{ kind: "texte", id: "Fprime", label: "F'(x)=", placeholder: "ex : 6x − 7,5/x²", avecCalculatrice: false }];

    case "resoudre":
      if (exercice.famille === "trapeze") {
        return [
          { kind: "texte", id: "u", label: "u=\\cos\\alpha=", placeholder: "ex : 0,95", avecCalculatrice: true },
          { kind: "texte", id: "alpha", label: "\\alpha\\ (\\text{en degrés})=", placeholder: "ex : 12", avecCalculatrice: true },
        ];
      }
      {
        const idRacine = exercice.famille === "fenetreA" || exercice.famille === "fenetreB" ? "r" : "x";
        const champs: ChampOptimisation[] = [{ kind: "texte", id: idRacine, label: `${idRacine}=`, placeholder: "ex : 0,5", avecCalculatrice: true }];
        if (exercice.famille === "margesA" || exercice.famille === "margesB" || exercice.famille === "fenetreB") {
          champs.push({ kind: "choix", id: "justification", label: "Pourquoi rejette-t-on l'autre solution ?", options: optionsJustificationMelangees(exercice) });
        }
        return champs;
      }

    case "justifier": {
      const pts = pointsTest(exercice);
      const unite = exercice.famille === "trapeze" ? "°" : "";
      return [
        { kind: "texte", id: "deriveeAvant", label: `F'(${formatNombreLatex(pts.affichageAvant)}${unite})=`, placeholder: "valeur approchée", avecCalculatrice: true },
        { kind: "texte", id: "deriveeApres", label: `F'(${formatNombreLatex(pts.affichageApres)}${unite})=`, placeholder: "valeur approchée", avecCalculatrice: true },
        { kind: "choix", id: "conclusion", label: "Nature de l'extremum", options: OPTIONS_CONCLUSION },
      ];
    }

    case "conclure":
      if (exercice.famille === "trapeze") {
        return [
          { kind: "texte", id: "hauteur", label: "h_{\\text{opt}}=", placeholder: "ex : 0,5", avecCalculatrice: true },
          { kind: "texte", id: "baseSup", label: "B_{\\text{opt}}=", placeholder: "ex : 0,5", avecCalculatrice: true },
          { kind: "texte", id: "aire", label: "\\text{Aire}_{\\max}=", placeholder: "ex : 0,75", avecCalculatrice: true },
        ];
      }
      if (exercice.famille === "cylindre") {
        return [
          { kind: "texte", id: "hauteur", label: "h_{\\text{opt}}=", placeholder: "ex : 0,5", avecCalculatrice: true },
          { kind: "texte", id: "aire", label: "\\text{Aire}_{\\min}=", placeholder: "ex : 0,75", avecCalculatrice: true },
        ];
      }
      if (exercice.famille === "margesA") {
        return [
          { kind: "texte", id: "y", label: "y_{\\text{opt}}=", placeholder: "ex : 0,5", avecCalculatrice: true },
          { kind: "texte", id: "aireImprimee", label: "\\text{Aire imprimée}_{\\max}=", placeholder: "ex : 0,75", avecCalculatrice: true },
        ];
      }
      if (exercice.famille === "margesB") {
        return [
          { kind: "texte", id: "y", label: "y_{\\text{opt}}=", placeholder: "ex : 0,5", avecCalculatrice: true },
          { kind: "texte", id: "aireTotale", label: "\\text{Aire totale}_{\\min}=", placeholder: "ex : 0,75", avecCalculatrice: true },
        ];
      }
      if (exercice.famille === "fenetreA") {
        return [
          { kind: "texte", id: "hauteur", label: "h_{\\text{opt}}=", placeholder: "ex : 0,5", avecCalculatrice: true },
          { kind: "texte", id: "aire", label: "\\text{Aire}_{\\max}=", placeholder: "ex : 0,75", avecCalculatrice: true },
        ];
      }
      return [
        { kind: "texte", id: "hauteur", label: "h_{\\text{opt}}=", placeholder: "ex : 0,5", avecCalculatrice: true },
        { kind: "texte", id: "perimetre", label: "\\text{Périmètre}_{\\min}=", placeholder: "ex : 0,75", avecCalculatrice: true },
      ];

    case "application":
      return [{ kind: "texte", id: "cout", label: "\\text{Coût (en euros)}=", placeholder: "ex : 0,12", avecCalculatrice: true }];

    case "coeffsImmediats":
      return [
        { kind: "texte", id: "c", label: "c=", placeholder: "ex : 7", avecCalculatrice: false },
        { kind: "texte", id: "d", label: "d=", placeholder: "ex : 6", avecCalculatrice: false },
      ];
    case "relation":
      return [{ kind: "texte", id: "b", label: "b=", placeholder: "ex : 5a", avecCalculatrice: false }];
    case "resoudreA":
      return [{ kind: "texte", id: "a", label: "a=", placeholder: "ex : 4", avecCalculatrice: true }];
    case "expressionFinale":
      return [{ kind: "texte", id: "f", label: "f(x)=", placeholder: "ex : x³ − 4x² + 7", avecCalculatrice: false }];
  }
}

// ============================================================================
// Aides (2 niveaux) — texte en français d'un côté, formule KaTeX de l'autre (jamais de formule
// écrite au clavier dans le texte). Le niveau 2 donne au plus l'équation substituée, jamais la
// réponse finale.
// ============================================================================

export interface AideFragmentee {
  texte: string;
  latex: string | null;
}

export function texteAideNiveau1(exercice: ExerciceOptimisation, phase: EcranOptimisation): AideFragmentee {
  switch (phase) {
    case "lien":
      switch (exercice.famille) {
        case "trapeze":
          return { texte: "Dans le triangle rectangle formé par un côté oblique, la hauteur et sa projection sur la grande base :", latex: "h=l\\sin\\alpha \\qquad \\text{projection}=l\\cos\\alpha" };
        case "cylindre":
          return { texte: "Le volume d'un cylindre de rayon $x$ et de hauteur $h$ vaut :", latex: "V=\\pi x^2 h" };
        case "margesA":
          return { texte: "Les dimensions totales de l'affiche sont $x+2m_h$ et $y+2m_v$, donc :", latex: "T=(x+2m_h)(y+2m_v)" };
        case "margesB":
          return { texte: "La zone imprimée est un rectangle de dimensions $x$ et $y$ :", latex: "A=x\\,y" };
        case "fenetreA":
          return { texte: "Le périmètre extérieur comprend la base, les deux côtés verticaux et le demi-cercle :", latex: "P=2r+2h+\\pi r" };
        case "fenetreB":
          return { texte: "L'aire de la fenêtre est celle du rectangle plus celle du demi-cercle :", latex: "A=2r\\,h+\\dfrac{\\pi r^2}{2}" };
        case "cubique":
          return { texte: "", latex: null };
      }
      break;
    case "construire":
      switch (exercice.famille) {
        case "trapeze":
          return { texte: "L'aire d'un trapèze est la demi-somme des bases multipliée par la hauteur :", latex: "\\text{Aire}=\\dfrac{b+B}{2}\\cdot h" };
        case "cylindre":
          return { texte: "L'aire totale comprend les deux disques et la surface latérale :", latex: "S=2\\pi x^2+2\\pi x\\,h" };
        case "margesA":
          return { texte: "L'aire imprimée vaut $x\\cdot y$ ; remplace $y$ par l'expression trouvée à l'écran précédent.", latex: null };
        case "margesB":
          return { texte: "L'aire totale vaut le produit des dimensions totales ; remplace $y$ par l'expression trouvée :", latex: "(x+2m_h)(y+2m_v)" };
        case "fenetreA":
          return { texte: "Remplace $h$ dans la formule de l'aire :", latex: "\\text{Aire}=2r\\,h+\\dfrac{\\pi r^2}{2}" };
        case "fenetreB":
          return { texte: "Remplace $h$ dans la formule du périmètre :", latex: "P=2r+2h+\\pi r" };
        case "cubique":
          return { texte: "", latex: null };
      }
      break;
    case "deriver":
      if (exercice.famille === "trapeze") return { texte: "Développe puis dérive terme à terme, avec la règle du produit pour $\\sin x\\cdot\\cos x$ :", latex: "(\\sin x)'=\\cos x \\qquad (\\cos x)'=-\\sin x" };
      return { texte: "Dérive terme à terme ; pour un terme en $\\dfrac{1}{x}$ ou $\\dfrac{1}{x^2}$, utilise :", latex: "\\left(\\dfrac{k}{x}\\right)'=-\\dfrac{k}{x^2} \\qquad \\left(\\dfrac{k}{x^2}\\right)'=-\\dfrac{2k}{x^3}" };
    case "resoudre":
      if (exercice.famille === "trapeze") return { texte: "Remplace $\\sin^2 x$ par $1-\\cos^2 x$ pour n'avoir plus que des cosinus, puis pose $u=\\cos x$ :", latex: "\\sin^2 x=1-\\cos^2 x" };
      if (exercice.famille === "fenetreA") return { texte: "$F'(x)$ est une expression du premier degré : isole $x$.", latex: null };
      return { texte: "Réduis au même dénominateur ou isole le terme en x, puis extrais la racine. Une longueur ne peut pas être négative.", latex: null };
    case "justifier":
      return { texte: "Si $F'$ est positive avant l'optimum et négative après, $F$ passe par un maximum ; dans le cas contraire, par un minimum.", latex: null };
    case "conclure":
      return { texte: "Remplace la variable par sa valeur optimale dans les expressions des écrans précédents.", latex: null };
    case "application":
      return { texte: "Ce n'est pas une nouvelle optimisation : multiplie le prix au cm² par l'aire minimale trouvée.", latex: null };
    case "coeffsImmediats":
      return { texte: "$f(0)$ donne directement $d$ ; comme $f'(x)=3ax^2+2bx+c$, la condition $f'(0)=0$ donne directement $c$.", latex: null };
    case "relation":
      return { texte: "Calcule $f'(x)$, remplace $c$ par $0$ et $x$ par $x_2$, puis isole $b$ (on peut simplifier par $x_2$, non nul) :", latex: "f'(x)=3ax^2+2bx+c" };
    case "resoudreA":
      return { texte: "Remplace $b$ (en fonction de $a$), $c=0$ et $d$ dans la condition de passage, puis résous l'équation du premier degré en $a$.", latex: null };
    case "expressionFinale":
      return { texte: "Rassemble les quatre coefficients trouvés aux écrans précédents.", latex: null };
  }
  return { texte: "", latex: null };
}

export function texteAideNiveau2(exercice: ExerciceOptimisation, phase: EcranOptimisation): AideFragmentee | null {
  switch (phase) {
    case "lien":
      switch (exercice.famille) {
        case "trapeze":
          return { texte: "La grande base dépasse le fond de deux projections horizontales, chacune égale à :", latex: `${exercice.l}\\cos x` };
        case "cylindre":
          return { texte: "Avec les données :", latex: `${formatValeurAvecPiLatex({ rationnel: 0, coeffPi: exercice.coeffV })}=\\pi x^2 h` };
        case "margesA":
          return { texte: "Avec les données :", latex: `${exercice.T}=(x+${2 * exercice.mh})(y+${2 * exercice.mv})` };
        case "margesB":
          return { texte: "Avec les données :", latex: `${exercice.A}=x\\,y` };
        case "fenetreA":
          return { texte: "Avec les données :", latex: `${formatValeurAvecPiLatex(exercice.P!)}=2x+2h+\\pi x` };
        case "fenetreB":
          return { texte: "Avec les données :", latex: `${formatValeurAvecPiLatex(exercice.A!)}=2x\\,h+\\dfrac{\\pi x^2}{2}` };
        case "cubique":
          return null;
      }
      break;
    case "construire":
      return { texte: "Après substitution, il ne doit plus rester qu'une seule variable : vérifie qu'aucune autre inconnue n'apparaît.", latex: null };
    case "deriver":
      return { texte: "Vérifie ta dérivée terme par terme, en particulier le signe des termes en $\\dfrac{1}{x}$.", latex: null };
    case "resoudre":
      switch (exercice.famille) {
        case "trapeze":
          return { texte: "On obtient une équation du deuxième degré en $u$ (garde la solution comprise entre $0$ et $1$) :", latex: `${2 * exercice.l}u^2+${exercice.b}u-${exercice.l}=0` };
        case "cylindre":
          return { texte: "$F'(x)=0$ donne :", latex: `4\\pi x^3=${2 * exercice.coeffV}\\pi` };
        case "margesA":
          return { texte: "$F'(x)=0$ donne :", latex: `(x+${2 * exercice.mh})^2=\\dfrac{${2 * exercice.mh * (exercice.T as number)}}{${2 * exercice.mv}}` };
        case "margesB":
          return { texte: "$F'(x)=0$ donne :", latex: `${2 * exercice.mv}\\,x^2=${2 * exercice.mh * (exercice.A as number)}` };
        case "fenetreA":
          return { texte: "$F'(x)=0$ donne :", latex: `(4+\\pi)\\,x=${formatValeurAvecPiLatex(exercice.P!)}` };
        case "fenetreB":
          return { texte: "$F'(x)=0$ donne :", latex: `\\left(2+\\dfrac{\\pi}{2}\\right)x^2=${formatValeurAvecPiLatex(exercice.A!)}` };
        case "cubique":
          return null;
      }
      break;
    case "justifier":
      return { texte: "Remplace $x$ par chaque point test dans ton expression de $F'(x)$" + (exercice.famille === "trapeze" ? " (calculatrice en degrés : seule la valeur du cosinus et du sinus compte)." : "."), latex: null };
    case "conclure":
      return { texte: "Les unités : une longueur en cm ou dm, une aire en cm² ou dm².", latex: null };
    case "application":
      return { texte: "Coût = prix au cm² × aire minimale.", latex: null };
    case "coeffsImmediats":
      return { texte: "La tangente en $x=0$ est horizontale : la pente $f'(0)$ est nulle.", latex: null };
    case "relation":
      return exercice.famille === "cubique" ? { texte: "Avec $c=0$ et $x_2$ :", latex: `3a\\cdot(${exercice.x2})^2+2b\\cdot(${exercice.x2})=0` } : null;
    case "resoudreA":
      return exercice.famille === "cubique" ? { texte: "La condition de passage s'écrit :", latex: `a\\cdot(${exercice.x3})^3+b\\cdot(${exercice.x3})^2+${exercice.d < 0 ? `(${exercice.d})` : exercice.d}=${exercice.y3}` } : null;
    case "expressionFinale":
      return { texte: "Le coefficient $c$ est nul : le terme en $x$ n'apparaît pas.", latex: null };
  }
  return null;
}

// ============================================================================
// Réponse ATTENDUE par écran — vraie valeur, jamais un texte vague (audit 5e ch. 5, point 12).
// ============================================================================

function formatLienLatex(exercice: ExerciceOptimisation): string {
  switch (exercice.famille) {
    case "trapeze":
      return `h(x)=${exercice.l}\\sin x,\\ B(x)=${exercice.b}+${2 * exercice.l}\\cos x`;
    case "cylindre":
      return `h(x)=\\dfrac{${exercice.coeffV}}{x^2}`;
    case "margesA":
      return `y(x)=\\dfrac{${exercice.T}}{x+${2 * exercice.mh}}-${2 * exercice.mv}`;
    case "margesB":
      return `y(x)=\\dfrac{${exercice.A}}{x}`;
    case "fenetreA":
      return `h(x)=\\dfrac{${formatValeurAvecPiLatex(exercice.P!)}-(2+\\pi)x}{2}`;
    case "fenetreB":
      return `h(x)=\\dfrac{${formatValeurAvecPiLatex(exercice.A!)}}{2x}-\\dfrac{\\pi x}{4}`;
    case "cubique":
      return "";
  }
}

function formatFonctionLatex(exercice: ExerciceOptimisation): string {
  switch (exercice.famille) {
    case "trapeze":
      return `F(x)=(${exercice.b}+${exercice.l}\\cos x)\\cdot ${exercice.l}\\sin x`;
    case "cylindre":
      return `F(x)=2\\pi x^2+\\dfrac{${2 * exercice.coeffV}\\pi}{x}`;
    case "margesA":
      return `F(x)=\\dfrac{${exercice.T}x}{x+${2 * exercice.mh}}-${2 * exercice.mv}x`;
    case "margesB": {
      const A = exercice.A as number;
      return `F(x)=${A + 4 * exercice.mh * exercice.mv}+${2 * exercice.mv}x+\\dfrac{${2 * exercice.mh * A}}{x}`;
    }
    case "fenetreA":
      return `F(x)=${valeurAvecPiEnFacteur(exercice.P!)}x-\\left(2+\\dfrac{\\pi}{2}\\right)x^2`;
    case "fenetreB":
      return `F(x)=\\left(2+\\dfrac{\\pi}{2}\\right)x+\\dfrac{${formatValeurAvecPiLatex(exercice.A!)}}{x}`;
    case "cubique":
      return "";
  }
}

function formatDeriveeLatex(exercice: ExerciceOptimisation): string {
  switch (exercice.famille) {
    case "trapeze":
      return `F'(x)=${exercice.l * exercice.b}\\cos x+${exercice.l * exercice.l}(\\cos^2 x-\\sin^2 x)`;
    case "cylindre":
      return `F'(x)=4\\pi x-\\dfrac{${2 * exercice.coeffV}\\pi}{x^2}`;
    case "margesA":
      return `F'(x)=\\dfrac{${2 * exercice.mh * (exercice.T as number)}}{(x+${2 * exercice.mh})^2}-${2 * exercice.mv}`;
    case "margesB":
      return `F'(x)=${2 * exercice.mv}-\\dfrac{${2 * exercice.mh * (exercice.A as number)}}{x^2}`;
    case "fenetreA":
      return `F'(x)=${formatValeurAvecPiLatex(exercice.P!)}-(4+\\pi)x`;
    case "fenetreB":
      return `F'(x)=2+\\dfrac{\\pi}{2}-\\dfrac{${formatValeurAvecPiLatex(exercice.A!)}}{x^2}`;
    case "cubique":
      return "";
  }
}

function formatValeurOptimale(nom: string, v: number): string {
  return `${nom}${egalOuEnviron(v)}${formatNombreLatex(v)}`;
}

function formatConclureLatex(exercice: ExerciceOptimisation): string {
  switch (exercice.famille) {
    case "trapeze": {
      const a = alphaOptTrapeze(exercice);
      return [formatValeurOptimale("h_{\\text{opt}}", valeurHauteurTrapeze(exercice, a)), formatValeurOptimale("B_{\\text{opt}}", valeurBaseSupTrapeze(exercice, a)), formatValeurOptimale("\\text{Aire}_{\\max}", valeurFOptimisation(exercice, a))].join(",\\ ");
    }
    case "cylindre":
      return [formatValeurOptimale("h_{\\text{opt}}", valeurHauteurCylindre(exercice, exercice.xOpt)), formatValeurOptimale("\\text{Aire}_{\\min}", valeurFOptimisation(exercice, exercice.xOpt))].join(",\\ ");
    case "margesA":
      return [formatValeurOptimale("y_{\\text{opt}}", valeurLienMarges(exercice, exercice.xOpt)), formatValeurOptimale("\\text{Aire imprimée}_{\\max}", valeurFOptimisation(exercice, exercice.xOpt))].join(",\\ ");
    case "margesB":
      return [formatValeurOptimale("y_{\\text{opt}}", valeurLienMarges(exercice, exercice.xOpt)), formatValeurOptimale("\\text{Aire totale}_{\\min}", valeurFOptimisation(exercice, exercice.xOpt))].join(",\\ ");
    case "fenetreA":
      return [formatValeurOptimale("h_{\\text{opt}}", valeurLienFenetre(exercice, exercice.rOpt)), formatValeurOptimale("\\text{Aire}_{\\max}", valeurFOptimisation(exercice, exercice.rOpt))].join(",\\ ");
    case "fenetreB":
      return [formatValeurOptimale("h_{\\text{opt}}", valeurLienFenetre(exercice, exercice.rOpt)), formatValeurOptimale("\\text{Périmètre}_{\\min}", valeurFOptimisation(exercice, exercice.rOpt))].join(",\\ ");
    case "cubique":
      return "";
  }
}

function formatPolynomeCubiqueLatex(a: number, b: number, d: number): string {
  const premier = a === 1 ? "x^3" : a === -1 ? "-x^3" : `${a}x^3`;
  return `${premier}${formatTermeAdditif(b, "x^2")}${formatTermeAdditif(d, "")}`;
}

export function formatReponseAttendueEcranLatex(exercice: ExerciceOptimisation, phase: EcranOptimisation): string {
  if (exercice.famille === "cubique") {
    switch (phase) {
      case "coeffsImmediats":
        return `c=0,\\ d=${exercice.d}`;
      case "relation": {
        const k = (-3 * exercice.x2) / 2;
        return `b=${k === 1 ? "" : k === -1 ? "-" : k}a`;
      }
      case "resoudreA":
        return `a=${exercice.a}`;
      case "expressionFinale":
        return `f(x)=${formatPolynomeCubiqueLatex(exercice.a, exercice.b, exercice.d)}`;
      default:
        return "";
    }
  }
  const v = variableAffichee(exercice);
  switch (phase) {
    case "lien":
      return formatLienLatex(exercice);
    case "construire":
      return formatFonctionLatex(exercice);
    case "deriver":
      return formatDeriveeLatex(exercice);
    case "resoudre": {
      if (exercice.famille === "trapeze") {
        const u = exercice.u ? formatFractionLatex(exercice.u.num, exercice.u.den) : formatNombreLatex(uOptTrapeze(exercice));
        const alphaDeg = (alphaOptTrapeze(exercice) * 180) / Math.PI;
        return `u${exercice.u ? "=" : "\\approx"}${u},\\ \\alpha${egalOuEnviron(alphaDeg)}${Math.round(alphaDeg)}°`;
      }
      const opt = xOptimal(exercice);
      const rejet = exercice.famille === "margesA" || exercice.famille === "margesB" || exercice.famille === "fenetreB" ? "\\ \\text{(l'autre solution, négative, est rejetée : une longueur est positive)}" : "";
      return `${v === "r" ? "r" : "x"}${egalOuEnviron(opt)}${formatNombreLatex(opt)}${rejet}`;
    }
    case "justifier": {
      const pts = pointsTest(exercice);
      const valeurs = valeursDeriveePointsTest(exercice);
      const unite = exercice.famille === "trapeze" ? "°" : "";
      const nature = conclusionReelle(exercice) === "max" ? "maximum" : "minimum";
      const signe = (x: number) => (x > 0 ? ">0" : "<0");
      return `F'(${formatNombreLatex(pts.affichageAvant)}${unite})\\approx ${formatNombreLatex(valeurs.avant)}${signe(valeurs.avant)},\\ F'(${formatNombreLatex(pts.affichageApres)}${unite})\\approx ${formatNombreLatex(valeurs.apres)}${signe(valeurs.apres)} \\Rightarrow \\text{${nature}}`;
    }
    case "conclure":
      return formatConclureLatex(exercice);
    case "application": {
      if (exercice.famille !== "cylindre") return "";
      const cout = coutOptimalCylindre(exercice);
      return `\\text{Coût}\\approx ${formatNombreLatex(cout)}\\ \\text{euros}`;
    }
    default:
      return "";
  }
}

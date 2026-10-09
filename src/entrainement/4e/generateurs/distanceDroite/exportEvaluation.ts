import type { ExerciceDistanceDroite, ExerciceDistanceParalleles, ExerciceDistancePoint } from "../../core/distanceDroite.types";
import type { DroiteImplicite } from "../../core/droite.types";
import type { Point } from "../../core/vecteur.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { formatEquationImpliciteLatex } from "../../ui/formatEquationDroite";
import {
  CONSIGNE_DISTANCE_PQ,
  CONSIGNE_INTERSECTION_Q,
  consigneChoixPoint,
  formatAideDistancePQNiveau2Latex,
  formatAideEquationBNiveau2Latex,
  formatAideIntersectionQNiveau2Latex,
  formatDistanceAttendueLatex,
  formatEnonceLatex,
  formatPointLatex,
  segmentsConsigneEquationB,
  segmentsConsigneGeneraleDistanceDroite,
} from "../../ui/formatDistanceDroite";
import { implicteDepuisPointVecteur, intersectionDeuxDroites } from "../droite/geometrieDroite";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceDistanceDroite } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceDistanceDroite>` pour gen47 (Distance
 * point-droite et droite-droite, `AppDistanceDroite.tsx`/`moteur/sessionDistanceDroite.ts`) — voir
 * `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence.
 *
 * ⚠️ gen47 est délibérément un exercice de SYNTHÈSE "SANS formule" (voir l'en-tête de
 * `core/distanceDroite.types.ts`/`generateurs/distanceDroite/index.ts`) : il ne demande JAMAIS la
 * formule directe `|a·x₀+b·y₀+c|/√(a²+b²)`, mais fait reconstruire la distance en 3 étapes
 * géométriques enchaînées — même enchaînement que l'écran interactif
 * (`sessionDistanceDroite.ts`, phases `[choixPoint] → equationB → intersectionQ → distancePQ`) :
 *   - Écran "equationB" (les deux variantes) → question "Construis l'équation cartésienne de
 *     b ⊥ d passant par P" (b = la perpendiculaire à la droite cible, passant par le point donné/
 *     choisi).
 *   - Écran "intersectionQ" (les deux variantes) → question "Résous le système {b;d} pour trouver
 *     Q = b ∩ d".
 *   - Écran "distancePQ" (les deux variantes, toujours la phase terminale) → question "Calcule la
 *     distance PQ".
 *   - Écran "choixPoint" (variante "paralleles" UNIQUEMENT, avant les 3 précédents) → question
 *     "Choisis un point à coordonnées entières sur la droite désignée". N'existe pas pour la
 *     variante "point" (le point P est déjà donné dans l'énoncé) — voir `etatInitial` dans
 *     `sessionDistanceDroite.ts`.
 * Consignes textuelles réutilisées TELLES QUELLES depuis `ui/formatDistanceDroite.ts`
 * (`segmentsConsigneEquationB`, `CONSIGNE_INTERSECTION_Q`, `CONSIGNE_DISTANCE_PQ`,
 * `consigneChoixPoint`) — jamais reformulées, pour rester fidèles à l'écran interactif.
 *
 * Correction RESYNTHÉTISÉE depuis les valeurs déjà connues/construites de l'instance tirée, jamais
 * recalculée indépendamment : réutilise directement les fonctions de SUBSTITUTION déjà utilisées
 * côté écran pour l'aide de niveau 2 de chaque écran (`formatAideEquationBNiveau2Latex`,
 * `formatAideIntersectionQNiveau2Latex`, `formatAideDistancePQNiveau2Latex` —
 * `ui/formatDistanceDroite.ts`), qui substituent déjà les vraies valeurs de l'exercice sans
 * calculer le résultat final à la place de l'élève — le résultat final est ajouté ici pour
 * compléter la démonstration (la correction papier, contrairement à l'aide écran, doit montrer la
 * résolution complète).
 *
 * Variante "paralleles" — le point choisi par l'élève à l'écran "choixPoint" n'est PAS mémorisé
 * dans `ExerciceDistanceParalleles` (voir le commentaire de tête de `core/distanceDroite.types.ts` :
 * `point`/`bAttendue`/`q` sont recalculés dynamiquement en Couche B à partir du point RÉELLEMENT
 * choisi). Cette correction en choisit donc un elle-même — `pointEntierSurDroite` ci-dessous,
 * n'IMPORTE JAMAIS `moteur/verificationDroite.ts::pointEntierAleatoireImpliciteDroite` (règle
 * Couche A ↔ Couche B non négociable, CLAUDE.md), mais en DUPLIQUE la même construction
 * (Euclide étendu), sans le décalage aléatoire final : cette correction habille UNE instance déjà
 * tirée aléatoirement par `genererInstance`, un second tirage aléatoire à l'intérieur de la
 * correction n'apporterait rien de plus — un point déterministe (le plus proche de l'origine)
 * suffit et reste reproductible pour l'utilisateur qui régénère la même feuille. `b`/`Q` sont
 * ensuite reconstruits avec les MÊMES primitives Couche A que `generateurs/distanceDroite/index.ts`
 * (`implicteDepuisPointVecteur`, `intersectionDeuxDroites` de `generateurs/droite/geometrieDroite.ts`)
 * — jamais une seconde logique de construction géométrique. La distance finale affichée reste
 * `instance.distance` (jamais recalculée depuis ce point choisi ici) — propriété géométrique des
 * parallèles : elle est la même quel que soit le point choisi sur la droite source (voir le
 * commentaire de tête de `ExerciceDistanceParalleles`), exactement le principe déjà énoncé par
 * `soumettreReponseDistancePQ` (`sessionDistanceDroite.ts` : toujours comparée à `exercice.distance`,
 * jamais recalculée depuis les réponses précédentes).
 */

function estVariantePoint(instance: ExerciceDistanceDroite): instance is ExerciceDistancePoint {
  return instance.variante === "point";
}

// ============================================================================
// Point entier sur une droite implicite (a,b,c entiers) — duplication assumée de
// `moteur/verificationDroite.ts::pointEntierAleatoireImpliciteDroite`, voir le commentaire de tête.
// ============================================================================

function pgcdEtendu(a: number, b: number): { g: number; x: number; y: number } {
  let [oldR, r] = [a, b];
  let [oldS, s] = [1, 0];
  let [oldT, t] = [0, 1];
  while (r !== 0) {
    const q = Math.floor(oldR / r);
    [oldR, r] = [r, oldR - q * r];
    [oldS, s] = [s, oldS - q * s];
    [oldT, t] = [t, oldT - q * t];
  }
  return oldR < 0 ? { g: -oldR, x: -oldS, y: -oldT } : { g: oldR, x: oldS, y: oldT };
}

/** Un point ENTIER de la droite `ax+by+c=0`, le plus proche de l'origine (déterministe — voir le
 * commentaire de tête pour pourquoi jamais aléatoire ici, contrairement au repli de révélation côté
 * écran). Droite horizontale/verticale (`a=0`/`b=0`) : l'autre coordonnée vaut `0` directement. */
function pointEntierSurDroite(d: DroiteImplicite): Point {
  const { a, b, c } = d;
  if (a === 0) return { x: 0, y: -c / b };
  if (b === 0) return { x: -c / a, y: 0 };
  const { g, x: x0, y: y0 } = pgcdEtendu(a, b);
  const k = -c / g;
  const baseX = x0 * k;
  const baseY = y0 * k;
  const dirX = -b / g;
  const dirY = a / g;
  const t = Math.round(-(baseX * dirX + baseY * dirY) / (dirX * dirX + dirY * dirY));
  return { x: baseX + t * dirX, y: baseY + t * dirY };
}

// ============================================================================
// Énoncé — bloc de données (`formatEnonceLatex`, réutilisé tel quel) précédé de la consigne
// générale (`segmentsConsigneGeneraleDistanceDroite`), puis les questions écran par écran.
// ============================================================================

const QUESTION_EQUATION_B = { consigne: segmentsConsigneEquationB(), reponse: { type: "lignes", nombre: 3 } as const };
const QUESTION_INTERSECTION_Q = { consigne: [texte(CONSIGNE_INTERSECTION_Q)], reponse: { type: "lignes", nombre: 3 } as const };
const QUESTION_DISTANCE_PQ = { consigne: [texte(CONSIGNE_DISTANCE_PQ)], reponse: { type: "lignes", nombre: 2 } as const };

function construireEnonceDistanceDroite(instance: ExerciceDistanceDroite): SectionExercice {
  // `enteteFragments` est toujours rendu en mode KaTeX "bloc" (`assemblerEvaluationHtml.ts`) : n'y
  // mettre que le bloc de données lui-même — la consigne générale (`segmentsConsigneGeneraleDistanceDroite`,
  // des segments texte/latex courts pensés pour un rendu EN LIGNE) est préfixée à la consigne de la
  // première question à la place, où `question.consigne` est rendu en mode inline.
  const enteteFragments = [latex(formatEnonceLatex(instance))];
  const consigneGenerale = segmentsConsigneGeneraleDistanceDroite(instance);

  if (estVariantePoint(instance)) {
    const premiereQuestion = { consigne: [...consigneGenerale, texte(" "), ...QUESTION_EQUATION_B.consigne], reponse: QUESTION_EQUATION_B.reponse };
    return { enteteFragments, questions: [premiereQuestion, QUESTION_INTERSECTION_Q, QUESTION_DISTANCE_PQ] };
  }

  const questionChoixPoint = {
    consigne: [...consigneGenerale, texte(" "), texte(consigneChoixPoint(instance))],
    reponse: { type: "lignes", nombre: 1 } as const,
  };
  return { enteteFragments, questions: [questionChoixPoint, QUESTION_EQUATION_B, QUESTION_INTERSECTION_Q, QUESTION_DISTANCE_PQ] };
}

// ============================================================================
// Correction — resynthétisée depuis les valeurs connues/reconstruites de l'instance (voir le
// commentaire de tête). `lettres` décale les préfixes a)/b)/c) selon la variante (4 questions pour
// "paralleles", 3 pour "point" — jamais de lettre codée en dur dans `blocsSynthese`).
// ============================================================================

function blocsSynthese(point: Point, droiteCible: DroiteImplicite, bAttendue: DroiteImplicite, q: Point, distance: number, lettres: [string, string, string]): BlocCorrection[] {
  const [lettreEquationB, lettreIntersection, lettreDistance] = lettres;
  const equationBLatex = `b \\equiv ${formatEquationImpliciteLatex(bAttendue.a, bAttendue.b, bAttendue.c)}`;
  const equationCibleLatex = `d \\equiv ${formatEquationImpliciteLatex(droiteCible.a, droiteCible.b, droiteCible.c)}`;

  return [
    {
      type: "paragraphe",
      fragments: [
        texte(`${lettreEquationB}) `),
        latex(formatAideEquationBNiveau2Latex(droiteCible)),
        texte(" — donc "),
        latex(equationBLatex),
        texte("."),
      ],
    },
    {
      type: "paragraphe",
      fragments: [
        texte(`${lettreIntersection}) Système `),
        latex(`\\begin{cases} ${equationBLatex} \\\\ ${equationCibleLatex} \\end{cases}`),
        texte(" — élimination d'une inconnue : "),
        latex(formatAideIntersectionQNiveau2Latex(bAttendue, droiteCible)),
        texte(", d'où "),
        latex(`Q${formatPointLatex(q)}`),
        texte("."),
      ],
    },
    {
      type: "paragraphe",
      fragments: [texte(`${lettreDistance}) `), latex(`PQ = ${formatAideDistancePQNiveau2Latex(point, q)} = ${formatDistanceAttendueLatex(distance)}`), texte(".")],
    },
  ];
}

function construireCorrectionPoint(instance: ExerciceDistancePoint): BlocCorrection[] {
  return blocsSynthese(instance.point, instance.d, instance.bAttendue, instance.q, instance.distance, ["a", "b", "c"]);
}

function construireCorrectionParalleles(instance: ExerciceDistanceParalleles): BlocCorrection[] {
  const droiteSource = instance.droiteSource === "d1" ? instance.d1 : instance.d2;
  const droiteCible = instance.droiteSource === "d1" ? instance.d2 : instance.d1;
  const point = pointEntierSurDroite(droiteSource);
  const bAttendue = implicteDepuisPointVecteur(point, instance.vecteurNormal);
  // b (perpendiculaire à la direction commune de d1/d2) est toujours sécante à droiteCible — jamais
  // null, même garantie géométrique que `generateurs/distanceDroite/index.ts::construireParalleles`.
  const q = intersectionDeuxDroites(bAttendue, droiteCible)!;

  const labelSource = instance.droiteSource === "d1" ? "d_1" : "d_2";
  const blocChoixPoint: BlocCorrection = {
    type: "paragraphe",
    fragments: [
      texte("a) N'importe quel point à coordonnées entières de "),
      latex(labelSource),
      texte(" convient — par exemple "),
      latex(`P${formatPointLatex(point)}`),
      texte(" (la distance obtenue ne dépend pas du point choisi sur "),
      latex(labelSource),
      texte(", voir d))."),
    ],
  };

  return [blocChoixPoint, ...blocsSynthese(point, droiteCible, bAttendue, q, instance.distance, ["b", "c", "d"])];
}

function construireCorrectionDistanceDroite(instance: ExerciceDistanceDroite): BlocCorrection[] {
  return estVariantePoint(instance) ? construireCorrectionPoint(instance) : construireCorrectionParalleles(instance);
}

export const adaptateurEvaluationDistanceDroite: AdaptateurFeuilleExercices<ExerciceDistanceDroite> = {
  titreDocument: "Distance point-droite et droite-droite — Évaluation",
  nomFichierBase: "distance-point-droite",
  genererInstance: genererExerciceDistanceDroite,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceDistanceDroite,
  construireCorrection: construireCorrectionDistanceDroite,
  // PAS `regroupable` : jusqu'à 4 questions substantielles par instance (choixPoint pour
  // "paralleles", equationB, intersectionQ, distancePQ — jamais un unique écran générique par
  // instance), même raison que `simplification/exportEvaluation.ts` (voir son commentaire de tête).
};

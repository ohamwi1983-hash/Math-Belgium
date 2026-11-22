import type { ExerciceDistanceDroite, ExerciceDistanceParalleles, ExerciceDistancePoint } from "../../core/distanceDroite.types";
import type { DroiteImplicite } from "../../core/droite.types";
import type { Point } from "../../core/vecteur.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import {
  CONSIGNE_DISTANCE_PQ,
  consigneChoixPoint,
  consigneIntersectionQ,
  formatAideDistancePQNiveau2Latex,
  formatAideEquationBNiveau2Latex,
  formatAideIntersectionQNiveau2Latex,
  formatDistanceAttendueLatex,
  formatDroiteLatex,
  formatEnonceLatex,
  formatPointLatex,
  nomDroiteCible,
  segmentsConsigneEquationB,
  segmentsConsigneGeneraleDistanceDroite,
} from "../../ui/formatDistanceDroite";
import { implicteDepuisPointVecteur, intersectionDeuxDroites } from "../droite/geometrieDroite";
import { correctionDetailleeDistanceDroite, donneesResolution, pointEntierSurDroite } from "./corrigeDetaille";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceDistanceDroite } from "./index";
import { LIBELLE_CAS_PARALLELE_AXE, profilDistanceDroite } from "../profilsEvaluation4eCh7Droites";

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

// ============================================================================
// Énoncé — bloc de données (`formatEnonceLatex`, réutilisé tel quel) précédé de la consigne
// générale (`segmentsConsigneGeneraleDistanceDroite`), puis les questions écran par écran.
// ============================================================================

// Étapes du corrigé (une par écran), sans place de réponse ni tournure de saisie (« fraction
// acceptée, par exemple 7/2 »).
const QUESTION_DISTANCE_PQ = { consigne: [texte(CONSIGNE_DISTANCE_PQ.replace(", par exemple 2√5", ""))] };

function questionEquationB(instance: ExerciceDistanceDroite) {
  return { consigne: segmentsConsigneEquationB(instance) };
}

function questionIntersectionQ(instance: ExerciceDistanceDroite) {
  return { consigne: [texte(consigneIntersectionQ(instance).replace(" (fraction acceptée, par exemple 7/2)", ""))] };
}

function construireEnonceDistanceDroite(instance: ExerciceDistanceDroite): SectionExercice {
  const enteteFragments = [...segmentsConsigneGeneraleDistanceDroite(instance), texte(" "), latex(formatEnonceLatex(instance))];
  if (estVariantePoint(instance)) {
    return { enteteFragments, questions: [questionEquationB(instance), questionIntersectionQ(instance), QUESTION_DISTANCE_PQ] };
  }
  return { enteteFragments, questions: [{ consigne: [texte(consigneChoixPoint(instance))] }, questionEquationB(instance), questionIntersectionQ(instance), QUESTION_DISTANCE_PQ] };
}

// ============================================================================
// Correction — resynthétisée depuis les valeurs connues/reconstruites de l'instance (voir le
// commentaire de tête). `lettres` décale les préfixes a)/b)/c) selon la variante (4 questions pour
// "paralleles", 3 pour "point" — jamais de lettre codée en dur dans `blocsSynthese`).
// ============================================================================

function blocsSynthese(
  point: Point,
  droiteCible: DroiteImplicite,
  nomCible: string,
  bAttendue: DroiteImplicite,
  q: Point,
  distanceCarree: number,
  lettres: [string, string, string],
): BlocCorrection[] {
  const [lettreEquationB, lettreIntersection, lettreDistance] = lettres;
  const equationBLatex = formatDroiteLatex("b", bAttendue);
  const equationCibleLatex = formatDroiteLatex(nomCible, droiteCible);

  return [
    {
      type: "paragraphe",
      fragments: [
        texte(`${lettreEquationB}) `),
        latex(formatAideEquationBNiveau2Latex(droiteCible, nomCible)),
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
      fragments: [texte(`${lettreDistance}) `), latex(`PQ = ${formatAideDistancePQNiveau2Latex(point, q)} = ${formatDistanceAttendueLatex(distanceCarree)}`), texte(".")],
    },
  ];
}

function construireCorrectionPoint(instance: ExerciceDistancePoint): BlocCorrection[] {
  return blocsSynthese(instance.point, instance.d, "d", instance.bAttendue, instance.q, instance.distanceCarree, ["a", "b", "c"]);
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

  return [blocChoixPoint, ...blocsSynthese(point, droiteCible, nomDroiteCible(instance).latex, bAttendue, q, instance.distanceCarree, ["b", "c", "d"])];
}

function construireCorrectionDistanceDroite(instance: ExerciceDistanceDroite): BlocCorrection[] {
  return estVariantePoint(instance) ? construireCorrectionPoint(instance) : construireCorrectionParalleles(instance);
}

// --- Papier (refonte `.claude/rules/feuilles-evaluations.md`) ---
// Les écrans (point de d₁ choisi, perpendiculaire b, pied Q, distance PQ) sont les étapes
// d'APPRENTISSAGE : sur papier, l'énoncé donne la (les) droite(s) et UNE consigne — la distance,
// en valeur exacte. Le corrigé reprend la méthode du cours (perpendiculaire, pied, longueur) avec
// les valeurs de l'instance, et le raccourci quand la droite est horizontale ou verticale.

function enoncePapier(instance: ExerciceDistanceDroite): EnoncePapier {
  const consigne: FragmentConsigne[] = estVariantePoint(instance)
    ? [texte("Calcule la distance du point "), latex("P"), texte(" à la droite "), latex("d"), texte(" (valeur exacte).")]
    : [texte("Les droites "), latex("d_1"), texte(" et "), latex("d_2"), texte(" sont parallèles. Calcule la distance entre ces deux droites (valeur exacte).")];
  return {
    section: { enteteFragments: [texte("On donne :"), latex(formatEnonceLatex(instance))], questions: [{ consigne }] },
    etapesParQuestion: [estVariantePoint(instance) ? ["a", "b", "c"] : ["a", "b", "c", "d"]],
  };
}

function reponseBreve(instance: ExerciceDistanceDroite): FragmentConsigne[] {
  const nom = estVariantePoint(instance) ? "\\operatorname{dist}(P, d)" : "\\operatorname{dist}(d_1, d_2)";
  return [latex(`${nom} = ${formatDistanceAttendueLatex(instance.distanceCarree)}`)];
}

function bareme(instance: ExerciceDistanceDroite): BaremeExercice {
  const { b, q, nomCible } = donneesResolution(instance);
  const point = estVariantePoint(instance);
  const [lB, lQ, lD] = point ? ["a", "b", "c"] : ["b", "c", "d"];
  const criteres = [
    ...(point ? [] : [{ sousQuestion: "a", critere: [texte("Point à coordonnées entières de la droite de départ")], points: 0.5 }]),
    { sousQuestion: lB, critere: [texte("Perpendiculaire b passant par P : "), latex(formatDroiteLatex("b", b))], points: point ? 1.5 : 1 },
    { sousQuestion: lQ, critere: [texte("Pied de la perpendiculaire : "), latex(`Q${formatPointLatex(q)}`)], points: point ? 1.5 : 1.5 },
    { sousQuestion: lD, critere: [texte("Distance exacte simplifiée : "), latex(formatDistanceAttendueLatex(instance.distanceCarree))], points: point ? 1 : 1 },
  ];
  return {
    reponseFinale: reponseBreve(instance),
    criteres,
    erreursFrequentes: [
      { description: [texte("Droite parallèle à "), latex(nomCible), texte(" au lieu de la perpendiculaire")], cout: `0 pt sur ${lB}) et ${lQ})` },
      { description: [texte("Radical non simplifié ou valeur approchée seule")], cout: "−0,5" },
    ],
    reponsesAcceptees: [[texte("Formule de la distance d'un point à une droite, si elle a été vue au cours, appliquée correctement")]],
  };
}

/** Niveau : une lettre par écran (3 pour un point, 4 pour deux parallèles) ; méthode imposée par le
 * cours (perpendiculaire, pied, longueur) ; aucun piège dans les données (une droite parallèle à un
 * axe raccourcit le calcul et se voit sur l'équation). */
function criteresDifficulte(instance: ExerciceDistanceDroite): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeDistanceDroite(instance)), methode: 0, piege: 0, nombres: 0 };
}

export const adaptateurEvaluationDistanceDroite: AdaptateurFeuilleExercices<ExerciceDistanceDroite> = {
  titreDocument: "Distance point-droite et droite-droite — Évaluation",
  nomFichierBase: "distance-point-droite",
  genererInstance: genererExerciceDistanceDroite,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceDistanceDroite,
  construireCorrection: construireCorrectionDistanceDroite,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: (e: ExerciceDistanceDroite) => correctionDetailleeDistanceDroite(e),
  bareme,
  enoncePapier,
  profilInstance: profilDistanceDroite,
  libelleCasParticulier: LIBELLE_CAS_PARALLELE_AXE,
  // PAS `regroupable` : jusqu'à 4 questions substantielles par instance (choixPoint pour
  // "paralleles", equationB, intersectionQ, distancePQ — jamais un unique écran générique par
  // instance), même raison que `simplification/exportEvaluation.ts` (voir son commentaire de tête).
};

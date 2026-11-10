/**
 * Profils d'instance (tirage équilibré des évaluations, `AdaptateurFeuilleExercices.profilInstance`)
 * des générateurs du chapitre 1 de 4e (« La fonction du second degré »). Décisions de l'utilisateur
 * (voir `.claude/rules/feuilles-evaluations.md`, « Tirage équilibré ») : par défaut une évaluation ne
 * tire que des exercices COMPLETS ; les paramètres neutres sont au choix du professeur (cases
 * « Paramètres à inclure ») ; la série A fixe la structure (forme) que reproduisent les autres séries.
 *
 * Mesures (5 000 tirages par variante, `scratchpad/refonte-4e-ch1/mesure0.txt`) :
 * - gen8 / gen9 (p, q ∈ [−5 ; 5], EV, CV ∈ [1 ; 5]) : p = 0 ≈ 9 %, q = 0 ≈ 9 %, |a| = 1 (EV = CV)
 *   20 %, a entier ≠ ±1 20 %, a fractionnaire 60 %.
 * - gen7 : aucun raccourci (la variante EST la méthode de factorisation ; a = ±1 ≈ 17 % n'abrège
 *   aucune étape) → pas de profil.
 * - gen55 : le sommet hors du domaine (≈ 25 % des familles « fonction donnée », jamais pour les
 *   familles « modélisation ») est un VERDICT (« le sommet appartient-il au domaine ? ») : jamais un
 *   cas particulier ni une forme. La forme est le MODE de la famille (configuration de la clôture,
 *   triangle rectangle, sous-habillage) : il change la relation à poser et la fonction obtenue.
 * - gen57 : racines rejetées (≈ 50 %) et intervalle coupé par le domaine (≈ 50 %) sont des verdicts
 *   (étape « validation ») → pas de cas particulier. Les familles A (fonction donnée) ont toujours
 *   des coefficients décimaux (seuil décimal dans plus de 93 % des cas) : calculatrice indispensable.
 *
 * `calcul` est absent partout : soit tout est exact (gen7, gen8, gen9, gen55, gen57 hors familles
 * A), soit la calculatrice est toujours nécessaire (familles A de gen57, `calculatriceIndispensable`).
 */
import type { ProfilInstance } from "../../export/genererFeuilleExercices";
import type { ExerciceTransformationGraphique } from "../core/transformationsGraphiques.types";
import type { ExerciceFormeCanoniqueTransformation } from "../core/formeCanoniqueTransformations.types";
import type { ExerciceOptimisation } from "../core/optimisation.types";

function cas(liste: (string | false)[]): string | null {
  const presents = liste.filter((c): c is string => !!c);
  return presents.length === 0 ? null : presents.join("+");
}

// ---------------------------------------------------------------------------------------------
// gen8 / gen9 — parabole y = a(x − p)² + q, |a| = EV/CV
// ---------------------------------------------------------------------------------------------

/** Paramètres que le professeur choisit d'inclure (cases cochées par défaut). Une case décochée
 * impose ce paramètre ABSENT dans toutes les questions de la ligne et toutes les séries :
 * translation horizontale (p = 0), verticale (q = 0), étirement ou compression (|a| = 1),
 * coefficient fractionnaire (a entier). */
export const PARAMETRES_PARABOLE = [
  { id: "sans-translation-horizontale", label: "Translation horizontale" },
  { id: "sans-translation-verticale", label: "Translation verticale" },
  { id: "sans-etirement", label: "Étirement ou compression (|a| ≠ 1)" },
  { id: "a-entier", label: "Coefficient a fractionnaire" },
];

function profilParabole(p: number, q: number, ev: number, cv: number): ProfilInstance {
  const sansEtirement = ev === cv;
  return {
    casParticulier: cas([p === 0 && "sans-translation-horizontale", q === 0 && "sans-translation-verticale", sansEtirement && "sans-etirement", ev % cv === 0 && "a-entier"]),
    // |a| = 1 : la question « a fractionnaire ou entier » est sans objet (déjà réglée par la case
    // « étirement ou compression »).
    parametresNonApplicables: sansEtirement ? ["a-entier"] : undefined,
  };
}

/** gen8 — lire l'équation d'une parabole sur son graphique. */
export function profilTransformationsGraphiques(e: ExerciceTransformationGraphique): ProfilInstance {
  return profilParabole(e.p, e.q, e.ev, e.cv);
}

/** gen9 — forme canonique d'un trinôme (sommet S(xS ; yS)). */
export function profilFormeCanoniqueTransformations(e: ExerciceFormeCanoniqueTransformation): ProfilInstance {
  return profilParabole(e.xS, e.yS, e.ev, e.cv);
}

// ---------------------------------------------------------------------------------------------
// gen55 — problèmes d'optimisation
// ---------------------------------------------------------------------------------------------

/** Mode de la famille, reproduit d'une série à l'autre (`ProfilInstance.forme`). */
export function formeOptimisation(e: ExerciceOptimisation): string {
  const croquis = e.contexte.croquis;
  switch (e.famille) {
    case "aireEnclos":
      // Clôture (4 côtés, 1 mur ou 2 murs : 2x + 2y, 2x + y ou x + y), somme donnée directement, ou
      // triangle rectangle (aire x·y/2, seul cas où a = −1/2).
      if (croquis?.type === "aireEnclosCloture") return `cloture-${croquis.configuration}`;
      return e.fonction.a === -0.5 ? "triangle-rectangle" : "somme-directe";
    case "sommeDeuxCarres":
      // Fil coupé en carré + triangle (croquis) ou pierre précieuse (valeur ∝ carré de la masse).
      return croquis ? "fil-carre-triangle" : "valeur-carre";
    case "grandeurTemps":
      return e.contexte.uniteGrandeur === "°C" ? "temperature" : "benefice";
    case "formeParabolique":
      return e.contexte.labelVariable === "t" ? "trajectoire" : "arche";
    default:
      return e.famille;
  }
}

export function profilOptimisation(e: ExerciceOptimisation): ProfilInstance {
  return { casParticulier: null, forme: formeOptimisation(e) };
}

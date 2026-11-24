/**
 * Profils d'instance (tirage équilibré des évaluations, `AdaptateurFeuilleExercices.profilInstance`)
 * des générateurs du chapitre 2 de 5e (« Trigonométrie »). Décisions de l'utilisateur :
 * - par défaut, une évaluation ne tire que des exercices COMPLETS (tous les paramètres présents,
 *   toutes les étapes à faire) ; un cas particulier ne sort que si le professeur coche « inclure un
 *   cas particulier » pour la ligne, et c'est alors le même cas dans toutes les séries ;
 * - calculatrice interdite → seulement des valeurs exactes / remarquables ; autorisée → seulement des
 *   cas qui exigent la calculatrice (`calcul`).
 * Les générateurs interactifs (écran) ne sont pas concernés : ils gardent toute leur variété.
 *
 * Plusieurs caractéristiques à la fois → identifiants joints par « + ». Sinusoïdes (5gen8, 5gen9,
 * 5gen11) : le professeur coche les paramètres à inclure (`parametresAuChoix`) ; les autres
 * générateurs ont la case « inclure un cas particulier ».
 */
import type { ProfilInstance } from "../../export/genererFeuilleExercices";
import type { ExerciceArcSecteur } from "../core5e/arcsSecteurs.types";
import type { ExerciceParametresSinusoide } from "../core5e/parametresSinusoide.types";
import type { ExerciceParametresSinusoideGraphique } from "../core5e/parametresSinusoideGraphique.types";
import type { ExerciceExtremumsSinusoide } from "../core5e/extremumsSinusoide.types";
import type { ExerciceModelisationSinusoide } from "../core5e/modelisationSinusoide.types";

interface RationnelLike {
  numerateur: number;
  denominateur: number;
  degrePi?: number;
}

const estNul = (r: RationnelLike | null | undefined) => !!r && r.numerateur === 0;
const estUn = (r: RationnelLike | null | undefined) => !!r && r.numerateur === r.denominateur && (r.degrePi ?? 0) === 0;

function cas(liste: (string | false)[]): string | null {
  const presents = liste.filter((c): c is string => !!c);
  return presents.length === 0 ? null : presents.join("+");
}

/** Amplitude ±1 (sans radical) : rien à lire ni à calculer pour A. */
function amplitudeUn(a: { rationnelle: RationnelLike | null; radicande: unknown } | undefined): boolean {
  return !!a && !a.radicande && estUn(a.rationnelle);
}

/** Paramètres que le professeur choisit d'inclure (cases du panneau, toutes cochées par défaut) :
 * une case décochée impose ce paramètre NEUTRE dans toutes les questions de la ligne. L'`id` est le
 * marqueur d'absence renvoyé par le profil. */
export const PARAMETRES_SINUSOIDE = [
  { id: "amplitude-1", label: "Amplitude ≠ 1" },
  { id: "pulsation-1", label: "Pulsation ≠ 1" },
  { id: "sans-dephasage", label: "Déphasage (décalage horizontal)" },
  { id: "sans-decalage-vertical", label: "Décalage vertical" },
];
/** Lecture graphique (5gen9) : la pulsation se déduit toujours de la période lue, pas de case. */
export const PARAMETRES_SINUSOIDE_GRAPHIQUE = PARAMETRES_SINUSOIDE.filter((p) => p.id !== "pulsation-1");

/** 5gen8 — paramètres de A·sin(Bx + C) + b (forme développée ou préfactorisée). */
export function profilParametresSinusoide(e: ExerciceParametresSinusoide): ProfilInstance {
  return {
    casParticulier: cas([
      (estNul(e.phi) || estNul((e as { C?: RationnelLike }).C)) && "sans-dephasage",
      e.b === 0 && "sans-decalage-vertical",
      amplitudeUn(e.A) && "amplitude-1",
      estUn((e as { B?: RationnelLike }).B) && "pulsation-1",
    ]),
  };
}

/** 5gen9 — mêmes paramètres, lus sur le graphique. */
export function profilParametresSinusoideGraphique(e: ExerciceParametresSinusoideGraphique): ProfilInstance {
  return {
    casParticulier: cas([estNul(e.phi) && "sans-dephasage", e.b === 0 && "sans-decalage-vertical", amplitudeUn(e.A) && "amplitude-1"]),
  };
}

/** 5gen11 — extremums de A·sin(ax + b) + d. `forme` = le type de question (maximums, minimums ou
 * tous les extremums) : la série B pose la même question que la série A (audit 5e ch. 2, V5). */
export function profilExtremumsSinusoide(e: ExerciceExtremumsSinusoide): ProfilInstance {
  return {
    forme: e.mode,
    casParticulier: cas([
      estNul(e.bArg) && "sans-dephasage",
      e.decalageVertical === 0 && "sans-decalage-vertical",
      amplitudeUn(e.amplitude) && "amplitude-1",
      estUn(e.a) && "pulsation-1",
    ]),
  };
}

export const LIBELLE_CAS_EQUATIONS = "Inclure un cas particulier (équation sans solution, ou sin, cos = 0 ou ±1)";

/** 5gen10 : la variante EST la réponse de l'écran « Reconnais la technique » — groupe à verdict
 * (panneau d'évaluation seulement ; décision de l'utilisateur, audit 5e ch. 2, V4). */
export const GROUPES_VERDICT_EQUATIONS = [
  { id: "groupe_technique", label: "Technique à reconnaître (application directe, produit, substitution pythagoricienne ou égalité, au hasard)", variantes: ["directe", "produit", "pythagoricienne", "egalite"] },
];

interface ResolutionLike {
  regime: "exact" | "decimal";
  aucuneSolution: boolean;
  casSpecial: boolean;
}

/** Toutes les résolutions élémentaires (cos u = k, sin u = k, tan u = k) d'une instance de 5gen10,
 * quelle que soit sa famille (directe, produit, pythagoricienne, égalité). */
function resolutions(valeur: unknown, acc: ResolutionLike[] = []): ResolutionLike[] {
  if (Array.isArray(valeur)) {
    for (const v of valeur) resolutions(v, acc);
  } else if (valeur && typeof valeur === "object") {
    const o = valeur as Record<string, unknown>;
    if (typeof o.aucuneSolution === "boolean" && typeof o.casSpecial === "boolean" && (o.regime === "exact" || o.regime === "decimal")) acc.push(o as unknown as ResolutionLike);
    for (const v of Object.values(o)) resolutions(v, acc);
  }
  return acc;
}

/** 5gen10 — équations trigonométriques. Ni une racine rejetée (|t| > 1) de la famille
 * pythagoricienne, ni un facteur impossible d'un produit (l'autre facteur donne les solutions) ne
 * sont des cas particuliers : c'est une étape de plus, pas un raccourci (décision de l'utilisateur,
 * audit 5e ch. 2, V1). « Aucune solution » pour toute l'équation reste un cas particulier. */
export function profilEquationTrig(e: unknown): ProfilInstance {
  const r = resolutions(e);
  const valides = r.filter((x) => !x.aucuneSolution);
  return {
    casParticulier: valides.length === 0 && r.length > 0 ? "aucune-solution" : cas([valides.some((x) => x.casSpecial) && "valeur-remarquable-0-1"]),
    // `exacte` seulement pour « directe » et « produit » (valeurs remarquables : mode « calculatrice
    // interdite », leurs instances décimales sont `calculatrice`). Pythagoricienne et égalité de deux
    // expressions (toujours exactes) : pas de `calcul` — la calculatrice ne fait pas la résolution,
    // elles sont tirées interdite ou autorisée (revue des profils, décision du 24/11/2026).
    calcul: valides.some((x) => x.regime === "decimal") ? "calculatrice" : valides.length > 0 && !SANS_PROFIL_EXACTE.has((e as { famille?: string }).famille ?? "") ? "exacte" : undefined,
  };
}

/** Familles de 5gen10 toujours exactes mais sans profil `exacte` (la calculatrice n'y donne pas la réponse). */
const SANS_PROFIL_EXACTE = new Set(["pythagoricienne", "egalite"]);

export const LIBELLE_CAS_MODELISATION = "Inclure un cas particulier (2e partie sans solution, ou inéquation toujours vraie / toujours fausse)";

/** 5gen13 — modéliser en contexte : la 2e partie peut finir par « aucune solution » ou par une
 * inéquation toujours vraie / toujours fausse (|m| > 1, conclue directement) — même raccourci, donc
 * cas particulier (décision de l'utilisateur, audit 5e ch. 2, V3). `forme` = le type de 2e partie
 * (résoudre, extremums, inéquation ou aucune) : la série B pose la même question (V5). Toujours des
 * valeurs décimales (contexte réel) : `calcul` sans objet. */
export function profilModelisationSinusoide(e: ExerciceModelisationSinusoide): ProfilInstance {
  const phase2 = e.phase2;
  const particulier = phase2 === null ? null : phase2.type === "resoudre" && phase2.aucuneSolution ? "aucune-solution" : phase2.type === "inequation" && phase2.casSpecial !== null ? "inequation-triviale" : null;
  return { casParticulier: particulier, forme: phase2 === null ? "aucune" : phase2.type };
}

/** 5gen7 — polygones, arcs et secteurs : toutes les réponses sont exactes en π (valeur exacte
 * acceptée sur papier) ; aucun raccourci possible (audit 5e ch. 2, P8). Pas de `calcul` : la
 * calculatrice ne donne ni l'arc ni le secteur (formules du cercle) — tiré interdite ou autorisée
 * (revue des profils, 24/11/2026). */
export function profilPolygonesArcsSecteurs(): ProfilInstance {
  return { casParticulier: null };
}

/** 5gen12 — géométrie du cercle : arccos ou aire arrondie à l'unité, la calculatrice est toujours
 * nécessaire ; aucun raccourci (V6). */
export function profilGeometrieCercle(): ProfilInstance {
  return { casParticulier: null, calcul: "calculatrice" };
}

/** 5gen6 — conversion « exacte » (angle remarquable, sans calculatrice) ou « décimale »
 * (calculatrice) ; le mode « deux vers trois » est sans objet pour la calculatrice. */
export function profilArcSecteur(e: ExerciceArcSecteur): ProfilInstance {
  if (e.mode === "conversion") return { casParticulier: null, calcul: e.type === "exacte" ? "exacte" : "calculatrice" };
  return { casParticulier: null };
}

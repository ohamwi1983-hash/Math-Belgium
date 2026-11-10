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

/** 5gen11 — extremums de A·sin(ax + b) + d. */
export function profilExtremumsSinusoide(e: ExerciceExtremumsSinusoide): ProfilInstance {
  return {
    casParticulier: cas([
      estNul(e.bArg) && "sans-dephasage",
      e.decalageVertical === 0 && "sans-decalage-vertical",
      amplitudeUn(e.amplitude) && "amplitude-1",
      estUn(e.a) && "pulsation-1",
    ]),
  };
}

export const LIBELLE_CAS_EQUATIONS = "Inclure un cas particulier (équation sans solution, ou sin, cos = 0 ou ±1)";

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

/** 5gen10 — équations trigonométriques. Une racine rejetée (|t| > 1) dans la famille
 * pythagoricienne n'est PAS un cas particulier : c'est une étape de plus, pas un raccourci. */
export function profilEquationTrig(e: unknown): ProfilInstance {
  const r = resolutions(e);
  const valides = r.filter((x) => !x.aucuneSolution);
  return {
    casParticulier:
      valides.length === 0 && r.length > 0
        ? "aucune-solution"
        : cas([r.some((x) => x.aucuneSolution) && "facteur-impossible", valides.some((x) => x.casSpecial) && "valeur-remarquable-0-1"]),
    calcul: valides.some((x) => x.regime === "decimal") ? "calculatrice" : valides.length > 0 ? "exacte" : undefined,
  };
}

export const LIBELLE_CAS_MODELISATION = "Inclure un cas particulier (équation de la 2e partie sans solution)";

/** 5gen13 — modéliser en contexte : la 2e partie peut finir par « aucune solution ». Toujours des
 * valeurs décimales (contexte réel) : `calcul` sans objet. */
export function profilModelisationSinusoide(e: ExerciceModelisationSinusoide): ProfilInstance {
  const phase2 = (e as { phase2?: { aucuneSolution?: boolean } }).phase2;
  return { casParticulier: phase2?.aucuneSolution ? "aucune-solution" : null };
}

/** 5gen6 — conversion « exacte » (angle remarquable, sans calculatrice) ou « décimale »
 * (calculatrice) ; le mode « deux vers trois » est sans objet pour la calculatrice. */
export function profilArcSecteur(e: ExerciceArcSecteur): ProfilInstance {
  if (e.mode === "conversion") return { casParticulier: null, calcul: e.type === "exacte" ? "exacte" : "calculatrice" };
  return { casParticulier: null };
}

import { coefficientGini, nettoyer } from "../../core6e/lorenzGini";
import type { ContexteRepartition, CourbeLorenz, ExerciceLorenzComparaison, ExerciceLorenzGini, ExerciceLorenzLecture, ExerciceLorenzParametre, FamilleLorenz } from "../../core6e/lorenzGini";

/**
 * Couche A (6e) — générateur de `6gen82` « Inégalités de revenus : courbe de Lorenz et coefficient
 * de Gini ». N'utilise QUE `Math.random()` : le `?code=` (`export/codeExercice.ts::avecGraine`)
 * rejoue exactement le même tirage, ici comme dans l'adaptateur de feuilles (`exportEvaluation.ts`).
 *
 * Contextes : pays FICTIFS uniquement (jamais un vrai pays nommé avec de faux chiffres), une
 * entreprise sans nom, un pays avant/après une réforme fiscale.
 *
 * Verdicts (comparaison) : l'ordre des deux courbes est tiré au hasard APRÈS le tirage des familles,
 * donc « la répartition 1 est la plus inégalitaire » sort une fois sur deux, quelle que soit la
 * `forme` (familles triées) que la série A impose aux autres séries.
 */

export const PAYS_FICTIFS = ["Valdorie", "Belmarie", "Corvanie", "Mirandie", "Norvalie", "Pellavie", "Kestrie", "Zéphirie", "Taranie", "Estrévie"];

function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function parmi<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)];
}

function melange(n: number): number[] {
  const t = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [t[i], t[j]] = [t[j], t[i]];
  }
  return t;
}

/** Courbe de la famille donnée, paramètre tiré : n ∈ {2 ; 3 ; 4}, a ∈ {0,2 ; … ; 0,9}, k ∈ {1 ; 2 ; 3}. */
export function tirerCourbe(famille: FamilleLorenz): CourbeLorenz {
  switch (famille) {
    case "puissance":
      return { famille, parametre: entier(2, 4) };
    case "mixte2":
    case "mixte3":
      return { famille, parametre: entier(2, 9) / 10 };
    case "expo":
      return { famille, parametre: entier(1, 3) };
  }
}

function contexteRepartition(): ContexteRepartition {
  return Math.random() < 0.6 ? "pays" : "entreprise";
}

function construireLecture(familles: FamilleLorenz[]): ExerciceLorenzLecture {
  return {
    variante: "lecture",
    contexte: contexteRepartition(),
    nomPays: parmi(PAYS_FICTIFS),
    courbe: tirerCourbe(parmi(familles)),
    p: Math.random() < 0.5 ? 0.5 : 0.8,
    ordreInterpretation: melange(4),
  };
}

/** Familles des courbes comparées : polynômes surtout, exponentielle (calculatrice) parfois. */
function tirerFamilleComparaison(): FamilleLorenz {
  const r = Math.random();
  return r < 0.3 ? "puissance" : r < 0.6 ? "mixte2" : r < 0.85 ? "mixte3" : "expo";
}

/** Écart minimal entre les deux coefficients de Gini : le verdict ne se joue jamais à l'arrondi. */
export const ECART_GINI_MIN = 0.05;

function construireComparaison(contexte: "pays" | "reforme"): ExerciceLorenzComparaison {
  let c1: CourbeLorenz;
  let c2: CourbeLorenz;
  do {
    c1 = tirerCourbe(tirerFamilleComparaison());
    c2 = tirerCourbe(tirerFamilleComparaison());
  } while (Math.abs(coefficientGini(c1) - coefficientGini(c2)) < ECART_GINI_MIN);
  // Ordre tiré APRÈS les familles : verdict équilibré.
  const courbes: [CourbeLorenz, CourbeLorenz] = Math.random() < 0.5 ? [c1, c2] : [c2, c1];
  const i = entier(0, PAYS_FICTIFS.length - 1);
  let j = entier(0, PAYS_FICTIFS.length - 2);
  if (j >= i) j++;
  const noms: [string, string] = contexte === "pays" ? [PAYS_FICTIFS[i], PAYS_FICTIFS[j]] : [PAYS_FICTIFS[i], PAYS_FICTIFS[i]];
  return { variante: "comparaison", contexte, noms, courbes, ordreVerdict: melange(2) };
}

/** Coefficients de Gini visés : a = 3G (mixte2) ou a = 2G (mixte3) reste un décimal de ]0 ; 1[. */
const GINI_VISES: Record<"mixte2" | "mixte3", number[]> = {
  mixte2: [0.1, 0.12, 0.15, 0.18, 0.2, 0.24, 0.25, 0.27, 0.3],
  mixte3: [0.1, 0.12, 0.15, 0.18, 0.2, 0.24, 0.25, 0.3, 0.35, 0.4, 0.45],
};

function construireParametre(): ExerciceLorenzParametre {
  const famille = Math.random() < 0.5 ? "mixte2" : "mixte3";
  const giniVise = parmi(GINI_VISES[famille]);
  const a = nettoyer(famille === "mixte2" ? 3 * giniVise : 2 * giniVise);
  return { variante: "parametre", contexte: contexteRepartition(), nomPays: parmi(PAYS_FICTIFS), famille, a, giniVise };
}

export type IdVarianteLorenzGini = "lecture-puissance" | "lecture-mixte" | "lecture-expo" | "comparer-pays" | "comparer-reforme" | "parametre";

export const CATALOGUE_VARIANTES: { id: IdVarianteLorenzGini; label: string }[] = [
  { id: "lecture-puissance", label: "Lecture, aire et Gini — L(x) = xⁿ" },
  { id: "lecture-mixte", label: "Lecture, aire et Gini — L(x) = a·x² + (1 − a)·x ou a·x³ + (1 − a)·x" },
  { id: "lecture-expo", label: "Lecture, aire et Gini — exponentielle (calculatrice)" },
  { id: "comparer-pays", label: "Comparer deux pays (deux Gini, verdict)" },
  { id: "comparer-reforme", label: "Avant/après une réforme fiscale (deux Gini, verdict)" },
  { id: "parametre", label: "Retrouver a pour un Gini visé" },
];

export function construireAvecVarianteId(id: IdVarianteLorenzGini): ExerciceLorenzGini {
  switch (id) {
    case "lecture-puissance":
      return construireLecture(["puissance"]);
    case "lecture-mixte":
      return construireLecture(["mixte2", "mixte3"]);
    case "lecture-expo":
      return construireLecture(["expo"]);
    case "comparer-pays":
      return construireComparaison("pays");
    case "comparer-reforme":
      return construireComparaison("reforme");
    case "parametre":
      return construireParametre();
  }
}

/** Tirage libre : lecture 45 % (puissance, mixte, exponentielle), comparaison 35 %, paramètre 20 %. */
export function genererExerciceLorenzGini(): ExerciceLorenzGini {
  const r = Math.random();
  if (r < 0.45) {
    const s = Math.random();
    return construireAvecVarianteId(s < 0.4 ? "lecture-puissance" : s < 0.8 ? "lecture-mixte" : "lecture-expo");
  }
  if (r < 0.8) return construireAvecVarianteId(Math.random() < 0.5 ? "comparer-pays" : "comparer-reforme");
  return construireAvecVarianteId("parametre");
}

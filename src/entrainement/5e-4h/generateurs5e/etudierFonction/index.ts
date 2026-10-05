/**
 * Couche A (5e) — génération pour 5gen31 ("Étudier une fonction", CAPSTONE du chapitre "Dérivées et
 * applications"). N'importe jamais rien de `moteur5e/`.
 *
 * Branche "etudeLocale" : DÉLÈGUE la génération à 5gen29 (`genererPolynomiale`/`construireRationnelle`,
 * import direct Couche A ↔ Couche A), en forçant `niveau="avance"` pour "polynomiale"/
 * "rationnelleSansCE" (le pipeline de CE générateur montre TOUJOURS le tableau f''/concavité, jamais
 * conditionné par `niveau` comme dans 5gen29) — sauf "rationnelleAvecCE", où `niveau="avance"` est
 * structurellement IMPOSSIBLE (k≤0 ⟹ f''(x)=0 sans solution réelle, voir 5gen29) : reste forcé
 * "base", le tableau f''/concavité est alors affiché SANS colonne racine (aucun PI, accepté).
 * Régénère (rejet borné) si `0` tombe dans `exclusionsCE` — ce générateur demande TOUJOURS f(0) à
 * l'écran 8, qui doit donc toujours être défini.
 *
 * Branche "rationnelleAO" (NOUVELLE, absente de 5gen29) : f(x)=a·x+b+c/(x-e) — construction "À
 * L'ENVERS" du nombre d'extremums (jamais generate-then-reject) :
 * f'(x)=a-c/(x-e)² ⟺ (x-e)²=c/a. Puisque a≠0 est choisi EN PREMIER, poser c=a·Δ² (Δ entier positif,
 * racine EXACTE) ou c=a·radicande (radicande non-carré-parfait, racine IRRATIONNELLE) garantit
 * c/a=Δ²>0 ou c/a=radicande>0 — TOUJOURS 2 racines réelles distinctes symétriques `e±Δ` par
 * construction, JAMAIS une racine double (Δ>0 strict, contrairement à 5gen29 "polynomiale-double"
 * qui choisit délibérément une racine unique). Pour couvrir aussi le cas "0 extremum" (fréquence non
 * nulle, comme demandé), poser c=-a·k (k>0) donne c/a=-k<0 ⟹ (x-e)²=c/a n'a aucune solution réelle
 * — f' ne s'annule jamais.
 *
 * Classification MAX/min par le signe de f' de part et d'autre (calcul direct, prouvé par étude de
 * signe, RE-VÉRIFIÉ empiriquement par différence finie dans `index.test.ts`) :
 * f'(x)=a-c/(x-e)². Avec c/a>0, donc c de même signe que a :
 * - `a>0` (⟹ c>0) : |x-e|>Δ ⟹ c/(x-e)²<c/Δ²=a ⟹ f'>0 ; |x-e|<Δ ⟹ f'<0. Donc f' passe +→- en
 *   x=e-Δ (MAX) puis -→+ en x=e+Δ (min).
 * - `a<0` (⟹ c<0) : signes inversés — f' passe -→+ en x=e-Δ (min) puis +→- en x=e+Δ (MAX).
 * Donc : racine e-Δ ⟹ "max" si a>0 sinon "min" ; racine e+Δ ⟹ "min" si a>0 sinon "max" — EXACTEMENT
 * le même patron que `genererPolynomialeSimple` (5gen29), qui dérive aussi la classification du
 * seul signe de son coefficient dominant.
 */
import type { ClassificationExtremum, RacineEtudeLocale } from "../../core5e/etudeLocale.types";
import type { ExerciceEtudierFonction, ExerciceRationnelleAO } from "../../core5e/etudierFonction.types";
import { construireRationnelle, genererPolynomiale } from "../etudeLocale/index";
import { entierAleatoire, entierNonNul } from "../limites/fraction";

// ============================================================================
// Branche "etudeLocale" — délègue à 5gen29, niveau forcé (voir tête de fichier).
// ============================================================================

const NATURES = ["simple", "double", "irrationnelle"] as const;
function tirerNature() {
  return NATURES[entierAleatoire(0, NATURES.length - 1)];
}

const NOMBRE_TENTATIVES_REJET_ZERO = 50;

function genererNoyauEtudeLocaleCapstone() {
  // Poids similaires à 5gen29 (~40% polynomiale / ~30% rationnelleSansCE / ~30% rationnelleAvecCE).
  const tirage = Math.random();
  for (let essai = 0; essai < NOMBRE_TENTATIVES_REJET_ZERO; essai++) {
    const noyau = tirage < 0.4 ? genererPolynomiale(tirerNature(), "avance") : tirage < 0.7 ? construireRationnelle("rationnelleSansCE", "avance") : construireRationnelle("rationnelleAvecCE", "base");
    if (!noyau.exclusionsCE.includes(0)) return noyau;
  }
  // Repli déterministe ultime (extrêmement improbable d'être atteint) : polynomiale, jamais de CE.
  return genererPolynomiale(tirerNature(), "avance");
}

export function genererEtudeLocaleCapstone(): ExerciceEtudierFonction {
  return { famille: "etudeLocale", noyau: genererNoyauEtudeLocaleCapstone() };
}

// ============================================================================
// Branche "rationnelleAO" — voir tête de fichier pour la preuve complète.
// ============================================================================

const A_VALUES = [-2, -1, 1, 2];
const RADICANDES_NON_CARRES = [2, 3, 5, 6, 7, 8];

function racineExacteEntiere(valeur: number): RacineEtudeLocale {
  return { exact: true, valeur: { num: valeur, den: 1 } };
}

export function genererRationnelleAO(): ExerciceRationnelleAO {
  const a = A_VALUES[entierAleatoire(0, A_VALUES.length - 1)];
  const b = entierNonNul(4);
  const e = entierNonNul(3);
  const avecExtrema = Math.random() < 0.6;

  let c: number;
  let racinesFPrime: RacineEtudeLocale[] = [];
  let classificationFPrime: ClassificationExtremum[] = [];

  if (avecExtrema) {
    const exact = Math.random() < 0.5;
    let petite: RacineEtudeLocale;
    let grande: RacineEtudeLocale;
    if (exact) {
      const delta = entierAleatoire(1, 3);
      c = a * delta * delta;
      petite = racineExacteEntiere(e - delta);
      grande = racineExacteEntiere(e + delta);
    } else {
      const radicande = RADICANDES_NON_CARRES[entierAleatoire(0, RADICANDES_NON_CARRES.length - 1)];
      c = a * radicande;
      petite = { exact: false, centre: e, radicande, signe: -1 };
      grande = { exact: false, centre: e, radicande, signe: 1 };
    }
    racinesFPrime = [petite, grande];
    const classePetite: ClassificationExtremum = a > 0 ? "max" : "min";
    const classeGrande: ClassificationExtremum = a > 0 ? "min" : "max";
    classificationFPrime = [classePetite, classeGrande];
  } else {
    const k = entierAleatoire(1, 5);
    c = -a * k;
  }

  return { famille: "rationnelleAO", a, b, e, c, racinesFPrime, classificationFPrime };
}

// ============================================================================
// Évaluation numérique pure (nécessaire à la génération/l'affichage ET, RÉPLIQUÉE, à la
// vérification côté moteur5e — même patron que `generateurs5e/etudeLocale/index.ts`).
// ============================================================================

export function valeurFRationnelleAO(exercice: ExerciceRationnelleAO, x: number): number {
  return exercice.a * x + exercice.b + exercice.c / (x - exercice.e);
}

export function deriveeFRationnelleAO(exercice: ExerciceRationnelleAO, x: number): number {
  return exercice.a - exercice.c / (x - exercice.e) ** 2;
}

export function deriveeSecondeFRationnelleAO(exercice: ExerciceRationnelleAO, x: number): number {
  return (2 * exercice.c) / (x - exercice.e) ** 3;
}

// ============================================================================
// Dispatch pondéré + panneau dev.
// ============================================================================

/** ~25% "rationnelleAO" (seule famille couvrant l'asymptote oblique), ~75% "etudeLocale" (les 3
 * sous-familles héritées de 5gen29, mêmes poids relatifs qu'à l'origine). Ratio documenté, choisi
 * pour que l'AO reste notable sans dominer le panel des 4 comportements asymptotiques couverts. */
export function genererExerciceEtudierFonction(): ExerciceEtudierFonction {
  return Math.random() < 0.25 ? genererRationnelleAO() : genererEtudeLocaleCapstone();
}

export const CATALOGUE_VARIANTES: { id: string; label: string }[] = [
  { id: "polynomiale-simple", label: "Polynomiale — racines simples (aucune asymptote)" },
  { id: "polynomiale-double", label: "Polynomiale — racine double (aucune asymptote)" },
  { id: "polynomiale-irrationnelle", label: "Polynomiale — racines irrationnelles (aucune asymptote)" },
  { id: "rationnelleSansCE", label: "Rationnelle sans CE (AH y=0)" },
  { id: "rationnelleAvecCE", label: "Rationnelle avec CE (AH y=0 + 2×AV)" },
  { id: "rationnelleAO-exacte", label: "Rationnelle — asymptote oblique (racines exactes)" },
  { id: "rationnelleAO-irrationnelle", label: "Rationnelle — asymptote oblique (racines irrationnelles)" },
  { id: "rationnelleAO-sansExtremum", label: "Rationnelle — asymptote oblique (aucun extremum)" },
];

function genererRationnelleAOAvecVariante(variante: "exacte" | "irrationnelle" | "sansExtremum"): ExerciceRationnelleAO {
  const NOMBRE_TENTATIVES_MAX = 50;
  for (let essai = 0; essai < NOMBRE_TENTATIVES_MAX; essai++) {
    const ex = genererRationnelleAO();
    const aExtremum = ex.racinesFPrime.length > 0;
    if (variante === "sansExtremum" && !aExtremum) return ex;
    if (variante !== "sansExtremum" && aExtremum) {
      const estExacte = ex.racinesFPrime[0].exact;
      if ((variante === "exacte") === estExacte) return ex;
    }
  }
  throw new Error(`genererRationnelleAOAvecVariante : aucun tirage "${variante}" trouvé après ${NOMBRE_TENTATIVES_MAX} essais`);
}

export function construireAvecVarianteId(id: string): ExerciceEtudierFonction {
  switch (id) {
    case "polynomiale-simple":
      return { famille: "etudeLocale", noyau: genererPolynomiale("simple", "avance") };
    case "polynomiale-double":
      return { famille: "etudeLocale", noyau: genererPolynomiale("double", "avance") };
    case "polynomiale-irrationnelle":
      return { famille: "etudeLocale", noyau: genererPolynomiale("irrationnelle", "avance") };
    case "rationnelleSansCE":
      return { famille: "etudeLocale", noyau: construireRationnelle("rationnelleSansCE", "avance") };
    case "rationnelleAvecCE": {
      for (let essai = 0; essai < NOMBRE_TENTATIVES_REJET_ZERO; essai++) {
        const noyau = construireRationnelle("rationnelleAvecCE", "base");
        if (!noyau.exclusionsCE.includes(0)) return { famille: "etudeLocale", noyau };
      }
      throw new Error('construireAvecVarianteId : impossible de générer "rationnelleAvecCE" avec f(0) défini');
    }
    case "rationnelleAO-exacte":
      return genererRationnelleAOAvecVariante("exacte");
    case "rationnelleAO-irrationnelle":
      return genererRationnelleAOAvecVariante("irrationnelle");
    case "rationnelleAO-sansExtremum":
      return genererRationnelleAOAvecVariante("sansExtremum");
    default:
      throw new Error(`construireAvecVarianteId : id inconnu "${id}"`);
  }
}

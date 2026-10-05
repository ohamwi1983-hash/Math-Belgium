/**
 * Couche A (5e) — génération pour 5gen29 ("Étude locale (extremums et points critiques)"), 6e
 * générateur du chapitre "Dérivées et applications". 3 familles STRUCTURELLEMENT DISJOINTES tirées
 * à fréquence pondérée (~40% "polynomiale" / ~30% "rationnelleSansCE" / ~30% "rationnelleAvecCE")
 * — voir `core5e/etudeLocale.types.ts` pour le contrat complet. N'importe jamais rien de
 * `moteur5e/`.
 *
 * "polynomiale" est construite "à l'envers" à partir des racines CHOISIES de f'(x)=0 — exactement
 * la technique de 5gen28 variante B (`generateurs5e/tangentes/index.ts::construireHorizontaleAvecRacines`) :
 * f'(x)=3a(x-r1)(x-r2) identifié à 3ax²+2bx+c donne b=-3a(r1+r2)/2 (entier si `a` est PAIR, d'où
 * `a∈{-2,2}` pour les sous-cas "simple"/"double") et c=3a·r1·r2. Le sous-cas "irrationnelle"
 * construit directement f'(x)=3a(x-e)²-m (a>0, pour que le radicande m/(3a) reste positif) —
 * développé, 2b=-6ae donc b=-3ae (TOUJOURS entier, quelle que soit la parité de `a` ici), c=3ae²-m.
 *
 * "rationnelleSansCE"/"rationnelleAvecCE" : f(x)=c/D(x), D(x)=(x-e)²+k, N(x)=c CONSTANT — ce qui
 * réduit f'/f'' à des formes fermées simples (voir `deriveeFEtudeLocale`/`deriveeSecondeEtudeLocale`
 * ci-dessous, revérifiées empiriquement par différences finies dans `index.test.ts`) :
 *   f'(x)  = -2c(x-e)/D²   — UN SEUL zéro réel, toujours x=e (jamais 2, jamais de racine double —
 *            asymmetrie DÉLIBÉRÉE vs "polynomiale", qui seule porte la richesse simple/double/
 *            irrationnelle de ce générateur).
 *   f''(x) = 2c[3(x-e)²-k]/D³ — racine(s) réelle(s) ssi k>0 (`rationnelleSansCE`) : alors 2 racines
 *            e±√(k/3), généralement irrationnelles. Si k≤0 (`rationnelleAvecCE`), AUCUNE racine
 *            réelle — c'est pourquoi `niveau="avance"` n'est JAMAIS combiné avec
 *            "rationnelleAvecCE" (exclusion structurelle, pas un cas particulier côté UI).
 */
import type {
  ClassificationExtremum,
  ClassificationInflexion,
  ExerciceEtudeLocale,
  ExerciceEtudeLocalePolynomiale,
  ExerciceEtudeLocaleRationnelle,
  NatureRacinesEtudeLocale,
  NiveauEtudeLocale,
  RacineEtudeLocale,
  TypeFonctionEtudeLocale,
} from "../../core5e/etudeLocale.types";
import { entierAleatoire, entierNonNul, reduireFraction } from "../limites/fraction";

function melanger<T>(arr: T[]): T[] {
  const copie = [...arr];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

function plage(min: number, max: number): number[] {
  const out: number[] = [];
  for (let i = min; i <= max; i++) out.push(i);
  return out;
}

/** 2 valeurs DISTINCTES tirées parmi `candidats` (≥2 éléments) — même patron que
 * `generateurs5e/tangentes/index.ts::tirerDeuxDistincts`. */
function tirerDeuxDistincts(candidats: number[]): [number, number] {
  const melange = melanger(candidats);
  return [melange[0], melange[1]];
}

function racineExacteEntiere(valeur: number): RacineEtudeLocale {
  return { exact: true, valeur: { num: valeur, den: 1 } };
}

function racineExacteFraction(num: number, den: number): RacineEtudeLocale {
  return { exact: true, valeur: reduireFraction(num, den) };
}

/** Valeur numérique réelle d'une racine — RÉPLIQUÉE (jamais importée) dans `moteur5e/`
 * (`verificationEtudeLocale.ts`), voir CLAUDE.md, règle non négociable moteur5e ↔ generateurs5e. */
export function valeurNumeriqueRacineEtudeLocale(r: RacineEtudeLocale): number {
  return r.exact ? r.valeur.num / r.valeur.den : r.centre + r.signe * Math.sqrt(r.radicande);
}

// ============================================================================
// Évaluation numérique pure de f/f'/f'' — nécessaire à la génération/l'affichage ET, RÉPLIQUÉE, à
// la vérification côté moteur5e.
// ============================================================================

export function valeurFEtudeLocale(exercice: ExerciceEtudeLocale, x: number): number {
  if (exercice.type === "polynomiale") return exercice.a * x ** 3 + exercice.b * x ** 2 + exercice.c * x + exercice.d;
  const D = (x - exercice.e) ** 2 + exercice.k;
  return exercice.c / D;
}

export function deriveeFEtudeLocale(exercice: ExerciceEtudeLocale, x: number): number {
  if (exercice.type === "polynomiale") return 3 * exercice.a * x ** 2 + 2 * exercice.b * x + exercice.c;
  const D = (x - exercice.e) ** 2 + exercice.k;
  return (-2 * exercice.c * (x - exercice.e)) / (D * D);
}

export function deriveeSecondeEtudeLocale(exercice: ExerciceEtudeLocale, x: number): number {
  if (exercice.type === "polynomiale") return 6 * exercice.a * x + 2 * exercice.b;
  const D = (x - exercice.e) ** 2 + exercice.k;
  return (2 * exercice.c * (3 * (x - exercice.e) ** 2 - exercice.k)) / (D * D * D);
}

// ============================================================================
// Famille "polynomiale" — 3 sous-cas ("simple"/"double"/"irrationnelle"), uniformes en fréquence.
// ============================================================================

const A_COEF = [-2, 2];

function finaliserPolynomiale(
  nature: NatureRacinesEtudeLocale,
  a: number,
  b: number,
  c: number,
  d: number,
  racinesFPrime: RacineEtudeLocale[],
  classificationFPrime: ClassificationExtremum[],
  niveau: NiveauEtudeLocale,
): ExerciceEtudeLocalePolynomiale {
  let racinesFSeconde: RacineEtudeLocale[] = [];
  let classificationFSeconde: ClassificationInflexion[] = [];
  if (niveau === "avance") {
    // f''(x)=6ax+2b, TOUJOURS exactement 1 racine réelle x=-b/(3a), TOUJOURS un vrai changement de
    // signe (f'' linéaire de pente 6a≠0) — donc TOUJOURS un vrai point d'inflexion, jamais sauté.
    racinesFSeconde = [racineExacteFraction(-b, 3 * a)];
    classificationFSeconde = ["pi"];
  }
  return { type: "polynomiale", niveau, natureRacines: nature, a, b, c, d, racinesFPrime, classificationFPrime, racinesFSeconde, classificationFSeconde, exclusionsCE: [] };
}

/** 2 racines DISTINCTES rationnelles (ici entières). 3a>0 : f' change de + à - en r1 (MAX) puis de
 * - à + en r2 (min) ; 3a<0 : l'inverse. */
export function genererPolynomialeSimple(niveau: NiveauEtudeLocale): ExerciceEtudeLocalePolynomiale {
  const a = A_COEF[entierAleatoire(0, A_COEF.length - 1)];
  const [x1, x2] = tirerDeuxDistincts(plage(-3, 3));
  const r1 = Math.min(x1, x2);
  const r2 = Math.max(x1, x2);
  const b = (-3 * a * (r1 + r2)) / 2;
  const c = 3 * a * r1 * r2;
  const d = entierAleatoire(-5, 5);
  const classePetite: ClassificationExtremum = a > 0 ? "max" : "min";
  const classeGrande: ClassificationExtremum = a > 0 ? "min" : "max";
  return finaliserPolynomiale("simple", a, b, c, d, [racineExacteEntiere(r1), racineExacteEntiere(r2)], [classePetite, classeGrande], niveau);
}

/** 1 racine DOUBLE — f' TOUCHE zéro sans changer de signe : jamais un extremum, TOUJOURS
 * "ni_lun_ni_lautre" — le piège central de ce générateur. */
export function genererPolynomialeDouble(niveau: NiveauEtudeLocale): ExerciceEtudeLocalePolynomiale {
  const a = A_COEF[entierAleatoire(0, A_COEF.length - 1)];
  const r = entierAleatoire(-3, 3);
  const b = -3 * a * r;
  const c = 3 * a * r * r;
  const d = entierAleatoire(-5, 5);
  return finaliserPolynomiale("double", a, b, c, d, [racineExacteEntiere(r)], ["ni_lun_ni_lautre"], niveau);
}

/** Radicandes non-carrés-parfaits (2,3,5,6,7,8) — garantit des racines IRRATIONNELLES à coup sûr,
 * jamais une régénération. */
const RADICANDES_NON_CARRES = [2, 3, 5, 6, 7, 8];

/** 2 racines IRRATIONNELLES symétriques autour d'un centre entier `e` — f'(x)=3a(x-e)²-m,
 * `a>0` strictement (nécessaire pour que le radicande m/(3a) reste positif, voir tête de fichier).
 * Même comportement de signe que "simple" (3a>0 ⟹ petite racine=MAX, grande=min), car `a` est ici
 * toujours positif. */
export function genererPolynomialeIrrationnelle(niveau: NiveauEtudeLocale): ExerciceEtudeLocalePolynomiale {
  const a = entierAleatoire(1, 2);
  const e = entierAleatoire(-3, 3);
  const radicande = RADICANDES_NON_CARRES[entierAleatoire(0, RADICANDES_NON_CARRES.length - 1)];
  const m = 3 * a * radicande;
  const b = -3 * a * e;
  const c = 3 * a * e * e - m;
  const d = entierAleatoire(-5, 5);
  const petite: RacineEtudeLocale = { exact: false, centre: e, radicande, signe: -1 };
  const grande: RacineEtudeLocale = { exact: false, centre: e, radicande, signe: 1 };
  return finaliserPolynomiale("irrationnelle", a, b, c, d, [petite, grande], ["max", "min"], niveau);
}

export function genererPolynomiale(nature: NatureRacinesEtudeLocale, niveau: NiveauEtudeLocale): ExerciceEtudeLocalePolynomiale {
  switch (nature) {
    case "simple":
      return genererPolynomialeSimple(niveau);
    case "double":
      return genererPolynomialeDouble(niveau);
    case "irrationnelle":
      return genererPolynomialeIrrationnelle(niveau);
  }
}

// ============================================================================
// Familles "rationnelleSansCE"/"rationnelleAvecCE" — même construction f(x)=c/((x-e)²+k), seul le
// signe de `k` change la famille (k>0 ⟹ sansCE, k=-m² ⟹ avecCE, exclusions e±m).
// ============================================================================

/** Radicandes non-carrés-parfaits pour f''(x)=0 (famille "rationnelleSansCE"+avancé) — `k=3·r`
 * garantit k/3=r EXACTEMENT (jamais une division flottante approximative), prêt qu'on tire ensuite
 * `niveau="avance"` ou non. */
const RADICANDES_FSECONDE = [2, 3, 5, 6];

export function construireRationnelle(type: "rationnelleSansCE" | "rationnelleAvecCE", niveauDemande: NiveauEtudeLocale): ExerciceEtudeLocaleRationnelle {
  const c = entierNonNul(4);
  const e = entierAleatoire(-3, 3);
  let k: number;
  let exclusionsCE: number[] = [];
  // "rationnelleAvecCE"+"avance" est structurellement EXCLU (k≤0 ⟹ f''(x)=0 n'a aucune racine
  // réelle, voir tête de fichier) — jamais un cas particulier côté UI, simplement jamais généré.
  let niveau: NiveauEtudeLocale = type === "rationnelleAvecCE" ? "base" : niveauDemande;

  if (type === "rationnelleAvecCE") {
    const m = entierAleatoire(1, 3);
    k = -(m * m);
    exclusionsCE = [e - m, e + m].sort((x, y) => x - y);
  } else {
    const r = RADICANDES_FSECONDE[entierAleatoire(0, RADICANDES_FSECONDE.length - 1)];
    k = 3 * r;
  }

  const racinesFPrime: RacineEtudeLocale[] = [racineExacteEntiere(e)];
  const classificationFPrime: ClassificationExtremum[] = [c > 0 ? "max" : "min"];

  let racinesFSeconde: RacineEtudeLocale[] = [];
  let classificationFSeconde: ClassificationInflexion[] = [];
  if (niveau === "avance") {
    const radicande = k / 3;
    racinesFSeconde = [
      { exact: false, centre: e, radicande, signe: -1 },
      { exact: false, centre: e, radicande, signe: 1 },
    ];
    // k>0 ⟹ les 2 racines de 3(x-e)²=k sont TOUJOURS un vrai changement de signe de f'' (parabole
    // 3(x-e)²-k, signe constant hors racines, D³>0 partout sur ce domaine) — TOUJOURS un vrai PI,
    // jamais dégénéré (revérifié empiriquement dans index.test.ts).
    classificationFSeconde = ["pi", "pi"];
  }

  return { type, niveau, c, e, k, racinesFPrime, classificationFPrime, racinesFSeconde, classificationFSeconde, exclusionsCE };
}

// ============================================================================
// Dispatch pondéré + panneau dev.
// ============================================================================

const POIDS_TYPE: Record<TypeFonctionEtudeLocale, number> = { polynomiale: 40, rationnelleSansCE: 30, rationnelleAvecCE: 30 };
const TOTAL_POIDS_TYPE = Object.values(POIDS_TYPE).reduce((a, b) => a + b, 0);

function tirerType(): TypeFonctionEtudeLocale {
  let tirage = Math.random() * TOTAL_POIDS_TYPE;
  for (const [type, poids] of Object.entries(POIDS_TYPE) as [TypeFonctionEtudeLocale, number][]) {
    if (tirage < poids) return type;
    tirage -= poids;
  }
  return "polynomiale";
}

const NATURES: NatureRacinesEtudeLocale[] = ["simple", "double", "irrationnelle"];
function tirerNature(): NatureRacinesEtudeLocale {
  return NATURES[entierAleatoire(0, NATURES.length - 1)];
}

function tirerNiveau(): NiveauEtudeLocale {
  return Math.random() < 0.5 ? "base" : "avance";
}

export function genererExerciceEtudeLocale(): ExerciceEtudeLocale {
  const type = tirerType();
  if (type === "polynomiale") return genererPolynomiale(tirerNature(), tirerNiveau());
  if (type === "rationnelleSansCE") return construireRationnelle("rationnelleSansCE", tirerNiveau());
  return construireRationnelle("rationnelleAvecCE", "base");
}

export const CATALOGUE_VARIANTES: { id: string; label: string }[] = [
  { id: "polynomiale-simple-base", label: "Polynomiale — racines simples (base)" },
  { id: "polynomiale-simple-avance", label: "Polynomiale — racines simples (avancé)" },
  { id: "polynomiale-double-base", label: "Polynomiale — racine double (base)" },
  { id: "polynomiale-double-avance", label: "Polynomiale — racine double (avancé)" },
  { id: "polynomiale-irrationnelle-base", label: "Polynomiale — racines irrationnelles (base)" },
  { id: "polynomiale-irrationnelle-avance", label: "Polynomiale — racines irrationnelles (avancé)" },
  { id: "rationnelleSansCE-base", label: "Rationnelle sans CE (base)" },
  { id: "rationnelleSansCE-avance", label: "Rationnelle sans CE (avancé)" },
  { id: "rationnelleAvecCE-base", label: "Rationnelle avec CE (base)" },
];

export function construireAvecVarianteId(id: string): ExerciceEtudeLocale {
  switch (id) {
    case "polynomiale-simple-base":
      return genererPolynomiale("simple", "base");
    case "polynomiale-simple-avance":
      return genererPolynomiale("simple", "avance");
    case "polynomiale-double-base":
      return genererPolynomiale("double", "base");
    case "polynomiale-double-avance":
      return genererPolynomiale("double", "avance");
    case "polynomiale-irrationnelle-base":
      return genererPolynomiale("irrationnelle", "base");
    case "polynomiale-irrationnelle-avance":
      return genererPolynomiale("irrationnelle", "avance");
    case "rationnelleSansCE-base":
      return construireRationnelle("rationnelleSansCE", "base");
    case "rationnelleSansCE-avance":
      return construireRationnelle("rationnelleSansCE", "avance");
    case "rationnelleAvecCE-base":
      return construireRationnelle("rationnelleAvecCE", "base");
    default:
      throw new Error(`construireAvecVarianteId : id inconnu "${id}"`);
  }
}

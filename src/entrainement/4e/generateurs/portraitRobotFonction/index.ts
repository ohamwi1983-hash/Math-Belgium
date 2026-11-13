import type {
  CasComparaison,
  ComparaisonImages,
  ComparaisonValeur,
  ConditionPortrait,
  ExerciceCourbe,
  ExerciceDeduction,
  ExerciceExpression,
  ExercicePortraitRobot,
  FonctionTransformee,
  GroupeExpression,
  SensVariation,
  TypeCondition,
  VerdictComparaison,
} from "../../core/portraitRobotFonction.types";
import type { FamilleReference } from "../../core/fonctionsReference.types";
import {
  asymptoteHorizontale,
  domaineFonction,
  egalesFonctions,
  evaluerFonction,
  imageFonction,
  pariteFonction,
  respecte,
  sensSur,
} from "../../moteur/modelePortraitRobot";

/**
 * Générateur de « Le portrait-robot d'une fonction » (gen71). Tout le hasard passe par
 * `Math.random` (jamais une autre source) : `genererAvecCode` (`export/codeExercice.ts`) remplace
 * `Math.random` par une graine, et le QR code d'une feuille rouvre ainsi le MÊME exercice.
 *
 * Garanties (vérifiées par tirages massifs) :
 * - A : une seule fonction de référence transformée respecte toutes les conditions données ;
 * - B : le verdict de chaque comparaison découle des seules données (parité, monotonie stricte sur
 *   [0 ; m], f(p) = v), « on ne peut pas savoir » dès qu'un nombre sort de [−m ; m] ;
 * - C : la cible est la seule des 4 courbes à respecter les 3 conditions, et chaque courbe écartée
 *   en viole EXACTEMENT une, lisiblement (écart d'au moins une unité de la grille).
 */

// ---------------------------------------------------------------------------------------------
// Hasard
// ---------------------------------------------------------------------------------------------

function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function choisir<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)]!;
}

function melanger<T>(liste: readonly T[]): T[] {
  const copie = [...liste];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j]!, copie[i]!];
  }
  return copie;
}

function diviseursSignes(n: number): number[] {
  const absolu = Math.abs(n);
  const resultat: number[] = [];
  for (let d = 1; d <= absolu; d++) if (absolu % d === 0) resultat.push(d, -d);
  return resultat;
}

// ---------------------------------------------------------------------------------------------
// Famille A — retrouver l'expression
// ---------------------------------------------------------------------------------------------

function genererAsymptotes(): ExerciceExpression {
  const a = choisir([-6, -4, -3, -2, -1, 1, 2, 3, 4, 6]);
  const h = entier(-5, 5);
  const k = entier(-5, 5);
  const diviseurs = diviseursSignes(a);
  // Une fois sur deux, le point donné est un zéro de f quand c'est possible (exemple du cours).
  const dZero = k !== 0 && Number.isInteger(-a / k) && diviseurs.includes(-a / k) ? -a / k : null;
  const d = dZero !== null && Math.random() < 0.5 ? dZero : choisir(diviseurs);
  const dControle = choisir(diviseurs.filter((x) => x !== d));
  const cible: FonctionTransformee = { famille: "inverse", a, h, k };
  return {
    famille: "expression",
    groupe: "asymptotes",
    cible,
    conditions: [
      { type: "domaine", ensemble: { type: "Rprive", valeur: h } },
      { type: "asymptoteH", k },
      { type: "point", x: h + d, y: k + a / d, forme: "point" },
    ],
    controle: { x: h + dControle, y: k + a / dControle },
  };
}

function genererRacine(): ExerciceExpression {
  const a = choisir([-3, -2, -1, 1, 2, 3]);
  const h = entier(-5, 5);
  const k = entier(-5, 5);
  const d = entier(1, 3);
  const dControle = choisir([1, 2, 3].filter((x) => x !== d));
  return {
    famille: "expression",
    groupe: "racine",
    cible: { famille: "racine_carree", a, h, k },
    conditions: [
      { type: "domaine", ensemble: { type: "demi", borne: h, vers: "plus" } },
      { type: "point", x: h, y: k, forme: "valeur" },
      { type: "point", x: h + d * d, y: k + a * d, forme: "point" },
    ],
    controle: { x: h + dControle * dControle, y: k + a * dControle },
  };
}

function genererExtremum(): ExerciceExpression {
  const famille: FamilleReference = choisir(["carre", "valeur_absolue"] as const);
  const a = choisir([-3, -2, -1, 1, 2, 3]);
  const h = entier(-4, 4);
  const k = entier(-5, 5);
  const cible: FonctionTransformee = { famille, a, h, k };
  const d1 = choisir([-1, 1]);
  const d2 = choisir([-3, -2, 2, 3]);
  const valeur = (d: number) => evaluerFonction(cible, h + d)!;
  const nature = a > 0 ? "minimum" : "maximum";
  const avecParite = h === 0 && Math.random() < 0.5;
  const conditions: ConditionPortrait[] = avecParite
    ? [
        { type: "domaine", ensemble: { type: "R" } },
        { type: "parite", parite: "paire" },
        { type: "extremum", nature, valeur: k, en: null },
      ]
    : [
        { type: "domaine", ensemble: { type: "R" } },
        { type: "extremum", nature, valeur: k, en: h },
      ];
  const [premier, second] = melanger([d1, d2]) as [number, number];
  conditions.push({ type: "point", x: h + premier, y: valeur(premier), forme: "point" });
  conditions.push({ type: "point", x: h + second, y: valeur(second), forme: "point" });
  const dControle = choisir([-4, -3, -2, -1, 1, 2, 3, 4].filter((d) => d !== d1 && d !== d2));
  return { famille: "expression", groupe: "extremum", cible, conditions, controle: { x: h + dControle, y: valeur(dControle) } };
}

function genererSymetrie(): ExerciceExpression {
  const famille: FamilleReference = choisir(["cube", "racine_cubique"] as const);
  const a = famille === "cube" ? choisir([-2, -1, 1, 2]) : choisir([-3, -2, -1, 1, 2, 3]);
  const h = entier(-4, 4);
  const k = entier(-5, 5);
  const cible: FonctionTransformee = { famille, a, h, k };
  const ecarts = famille === "cube" ? [-2, -1, 1, 2] : [-8, -1, 1, 8];
  const d1 = choisir(ecarts.filter((d) => Math.abs(d) === 1));
  const d2 = choisir(ecarts.filter((d) => Math.abs(d) !== 1));
  const valeur = (d: number) => Math.round(evaluerFonction(cible, h + d)!);
  const avecParite = h === 0 && k === 0 && Math.random() < 0.5;
  const conditions: ConditionPortrait[] = [
    { type: "domaine", ensemble: { type: "R" } },
    { type: "image", ensemble: { type: "R" } },
    avecParite ? { type: "parite", parite: "impaire" } : { type: "centre", x: h, y: k },
  ];
  const [premier, second] = melanger([d1, d2]) as [number, number];
  conditions.push({ type: "point", x: h + premier, y: valeur(premier), forme: "point" });
  conditions.push({ type: "point", x: h + second, y: valeur(second), forme: "point" });
  const dControle = choisir(ecarts.filter((d) => d !== d1 && d !== d2));
  return { famille: "expression", groupe: "symetrie", cible, conditions, controle: { x: h + dControle, y: valeur(dControle) } };
}

export function genererExpression(groupe?: GroupeExpression): ExerciceExpression {
  const g = groupe ?? choisir(["asymptotes", "racine", "extremum", "symetrie"] as const);
  switch (g) {
    case "asymptotes":
      return genererAsymptotes();
    case "racine":
      return genererRacine();
    case "extremum":
      return genererExtremum();
    case "symetrie":
      return genererSymetrie();
  }
}

// ---------------------------------------------------------------------------------------------
// Famille B — raisonner sans expression
// ---------------------------------------------------------------------------------------------

/** Rang d'un nombre de [−m ; m] dans l'ordre des images (f(x) < f(y) ⟺ rang(x) < rang(y)) — défini
 * seulement quand f y est connue par les données. */
export function rangDeduction(e: Pick<ExerciceDeduction, "parite" | "sens">, x: number): number {
  const base = e.parite === "paire" ? Math.abs(x) : x;
  return e.sens === "croissante" ? base : -base;
}

function verdictEntre(e: Pick<ExerciceDeduction, "parite" | "sens" | "m">, x1: number, x2: number): VerdictComparaison {
  if (Math.abs(x1) > e.m || Math.abs(x2) > e.m) return "indetermine";
  return rangDeduction(e, x1) < rangDeduction(e, x2) ? "inferieur" : "superieur";
}

function nombreHors(m: number): number {
  return choisir([-1, 1]) * entier(m + 1, m + 3);
}

function genererComparaisonImages(base: Pick<ExerciceDeduction, "parite" | "sens" | "m">): ComparaisonImages {
  const { m } = base;
  const cas: CasComparaison = choisir(["memeCote", "deuxCotes", "horsIntervalle"] as const);
  let x1: number;
  let x2: number;
  if (cas === "memeCote") {
    x1 = -entier(1, m);
    do x2 = -entier(1, m);
    while (x2 === x1);
  } else if (cas === "deuxCotes") {
    const positif = entier(1, m);
    let negatif: number;
    do negatif = -entier(1, m);
    while (-negatif === positif);
    [x1, x2] = Math.random() < 0.5 ? [positif, negatif] : [negatif, positif];
  } else {
    const dehors = nombreHors(m);
    const dedans = choisir([-1, 1]) * entier(1, m);
    [x1, x2] = Math.random() < 0.5 ? [dehors, dedans] : [dedans, dehors];
  }
  return { x1, x2, cas, verdict: verdictEntre(base, x1, x2) };
}

function genererComparaisonValeur(base: Pick<ExerciceDeduction, "parite" | "sens" | "m" | "p">): ComparaisonValeur {
  const { m, p } = base;
  const tirage = Math.random();
  const cas: CasComparaison = tirage < 1 / 6 ? "memeCote" : tirage < 2 / 3 ? "deuxCotes" : "horsIntervalle";
  let x: number;
  if (cas === "memeCote") {
    do x = entier(1, m);
    while (x === p);
  } else if (cas === "deuxCotes") {
    do x = -entier(1, m);
    while (x === -p);
  } else {
    x = nombreHors(m);
  }
  return { x, cas, verdict: verdictEntre(base, x, p) };
}

export function genererDeduction(): ExerciceDeduction {
  const parite = choisir(["paire", "impaire"] as const);
  const sens: SensVariation = choisir(["croissante", "decroissante"] as const);
  const m = entier(3, 6);
  const p = entier(1, m - 1);
  // Impaire : f(0) = 0, donc f(p) a le signe imposé par le sens de variation sur [0 ; m].
  const v = parite === "impaire" ? (sens === "croissante" ? 1 : -1) * entier(1, 9) : choisir([-1, 1]) * entier(1, 9);
  const base = { parite, sens, m, p };
  return {
    famille: "deduction",
    parite,
    sens,
    m,
    p,
    v,
    comparaisonImages: genererComparaisonImages(base),
    comparaisonValeur: genererComparaisonValeur(base),
  };
}

/** f(−p) déduite de la parité. */
export function valeurOpposee(e: ExerciceDeduction): number {
  return e.parite === "paire" ? e.v : -e.v;
}

/** Sens de variation STRICT de f sur [−m ; 0] : le symétrique de celui sur [0 ; m]. */
export function sensSymetrique(e: ExerciceDeduction): SensVariation {
  if (e.parite === "impaire") return e.sens;
  return e.sens === "croissante" ? "decroissante" : "croissante";
}

// ---------------------------------------------------------------------------------------------
// Famille C — choisir la courbe
// ---------------------------------------------------------------------------------------------

const COEFFICIENTS: Record<FamilleReference, number[]> = {
  carre: [-2, -1, 1, 2],
  cube: [-1, 1],
  racine_carree: [-2, -1, 1, 2],
  racine_cubique: [-2, -1, 1, 2],
  inverse: [-4, -2, -1, 1, 2, 4],
  valeur_absolue: [-2, -1, 1, 2],
};

const FAMILLES: FamilleReference[] = ["carre", "cube", "racine_carree", "racine_cubique", "inverse", "valeur_absolue"];

/** Toutes les courbes candidates (fenêtre [−6 ; 6] : TH, TV dans [−3 ; 3]). Ordre déterministe. */
export const ESPACE_COURBES: FonctionTransformee[] = FAMILLES.flatMap((famille) =>
  COEFFICIENTS[famille].flatMap((a) => [-3, -2, -1, 0, 1, 2, 3].flatMap((h) => [-3, -2, -1, 0, 1, 2, 3].map((k) => ({ famille, a, h, k })))),
);

function definieSur(f: FonctionTransformee, u: number, v: number): boolean {
  if (f.famille === "racine_carree") return f.h <= u;
  if (f.famille === "inverse") return f.h < u || f.h > v;
  return true;
}

/** Une courbe qui viole `condition` doit le faire LISIBLEMENT sur la grille. */
export function violationLisible(condition: ConditionPortrait, f: FonctionTransformee): boolean {
  if (condition.type === "point") {
    const y = evaluerFonction(f, condition.x);
    return y === null || Math.abs(y - condition.y) >= 1 - 1e-9;
  }
  if (condition.type === "monotonie") return definieSur(f, condition.u, condition.v);
  return true;
}

function conditionsPossibles(cible: FonctionTransformee): Partial<Record<TypeCondition, ConditionPortrait>> {
  const pool: Partial<Record<TypeCondition, ConditionPortrait>> = {
    domaine: { type: "domaine", ensemble: domaineFonction(cible) },
    image: { type: "image", ensemble: imageFonction(cible) },
  };
  const k = asymptoteHorizontale(cible);
  if (k !== null) pool.asymptoteH = { type: "asymptoteH", k };
  const points: { x: number; y: number }[] = [];
  for (let x = -5; x <= 5; x++) {
    if (x === cible.h) continue;
    const y = evaluerFonction(cible, x);
    if (y !== null && Number.isInteger(Math.round(y * 1e9) / 1e9) && Math.abs(y) <= 5) points.push({ x, y: Math.round(y) });
  }
  if (points.length > 0) {
    const pt = choisir(points);
    pool.point = { type: "point", x: pt.x, y: pt.y, forme: "point" };
  }
  const intervalles: { u: number; v: number; sens: SensVariation }[] = [];
  for (let u = -5; u <= 3; u++) {
    for (let v = u + 2; v <= Math.min(5, u + 4); v++) {
      const sens = sensSur(cible, u, v);
      if (sens) intervalles.push({ u, v, sens });
    }
  }
  if (intervalles.length > 0) {
    const iv = choisir(intervalles);
    pool.monotonie = { type: "monotonie", sens: iv.sens, u: iv.u, v: iv.v };
  }
  const parite = pariteFonction(cible);
  if (parite) pool.parite = { type: "parite", parite };
  return pool;
}

function tenterCourbe(): ExerciceCourbe | null {
  const famille = choisir(FAMILLES);
  const cible = choisir(ESPACE_COURBES.filter((f) => f.famille === famille));
  const pool = conditionsPossibles(cible);
  const types = Object.keys(pool) as TypeCondition[];
  if (types.length < 3) return null;
  for (let essai = 0; essai < 12; essai++) {
    const conditions = melanger(types)
      .slice(0, 3)
      .map((t) => pool[t]!);
    const distracteurs: FonctionTransformee[] = [];
    for (let i = 0; i < 3; i++) {
      const candidats = ESPACE_COURBES.filter(
        (f) =>
          !egalesFonctions(f, cible) &&
          conditions.every((c, j) => (j === i ? !respecte(c, f) : respecte(c, f))) &&
          violationLisible(conditions[i]!, f),
      );
      if (candidats.length === 0) break;
      distracteurs.push(choisir(candidats));
    }
    if (distracteurs.length < 3) continue;
    const ordre = melanger([0, 1, 2, 3]);
    const toutes = [cible, ...distracteurs];
    const courbes = ordre.map((i) => toutes[i]!);
    const violations = ordre.map((i) => (i === 0 ? null : i - 1));
    return { famille: "courbe", cible, conditions, courbes, indexCorrect: ordre.indexOf(0), violations };
  }
  return null;
}

export function genererCourbe(): ExerciceCourbe {
  for (;;) {
    const exercice = tenterCourbe();
    if (exercice) return exercice;
  }
}

// ---------------------------------------------------------------------------------------------
// Catalogue de variantes (SelecteurVarianteDev, `?code=`, adaptateur de feuilles)
// ---------------------------------------------------------------------------------------------

export const CATALOGUE_VARIANTES: { id: string; label: string }[] = [
  { id: "expression-asymptotes", label: "Retrouver l'expression — asymptotes (inverse)" },
  { id: "expression-racine", label: "Retrouver l'expression — point de départ (racine carrée)" },
  { id: "expression-extremum", label: "Retrouver l'expression — extremum (carré ou valeur absolue)" },
  { id: "expression-symetrie", label: "Retrouver l'expression — centre de symétrie (cube ou racine cubique)" },
  { id: "deduction", label: "Raisonner sans expression (parité et variations)" },
  { id: "courbe", label: "Choisir la courbe" },
];

export function construireAvecVariante(id: string): ExercicePortraitRobot {
  switch (id) {
    case "expression-asymptotes":
      return genererExpression("asymptotes");
    case "expression-racine":
      return genererExpression("racine");
    case "expression-extremum":
      return genererExpression("extremum");
    case "expression-symetrie":
      return genererExpression("symetrie");
    case "deduction":
      return genererDeduction();
    case "courbe":
      return genererCourbe();
    default:
      return genererExercicePortraitRobot();
  }
}

/** Tirage libre : une famille sur trois (A, B, C), puis un groupe au hasard pour A. */
export function genererExercicePortraitRobot(): ExercicePortraitRobot {
  const famille = choisir(["expression", "deduction", "courbe"] as const);
  if (famille === "expression") return genererExpression();
  if (famille === "deduction") return genererDeduction();
  return genererCourbe();
}

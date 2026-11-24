/**
 * 5gen25 — fonctions « variées » des familles A et B (lot C de l'audit du 5e ch. 5, G18) : rationnelles
 * simples, racines et trigonométriques simples, à la place des seules cubiques. Contrat et formes :
 * `core5e/association.types.ts` (`FonctionVarieeAssociation`). Couche A : génération, évaluation,
 * lecture (extremums, sens de variation, f(0)), énoncés verbaux — une seule source pour l'écran, le
 * papier, la justification et le corrigé.
 *
 * Toutes les abscisses à LIRE (extremums, asymptote verticale, début du domaine) sont entières : elles
 * tombent sur les lignes du quadrillage d'une unité, à l'écran comme sur papier.
 */
import type { ExerciceAssociationGrapheDeriveeVariee, ExerciceAssociationGrapheVerbalVarie, FonctionVarieeAssociation } from "../../core5e/association.types";

export const X_MIN_VARIEE = -4;
export const X_MAX_VARIEE = 4;

function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function parmi<T>(valeurs: readonly T[]): T {
  return valeurs[entier(0, valeurs.length - 1)];
}

function melanger<T>(arr: T[]): T[] {
  const copie = [...arr];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

// ============================================================================
// Évaluation.
// ============================================================================

/** f(x), ou `null` hors du domaine (avant le début d'une racine, sur l'asymptote d'une rationnelle). */
export function evaluerVariee(f: FonctionVarieeAssociation, x: number): number | null {
  switch (f.type) {
    case "rationnelle": {
      const u = x - f.c;
      if (Math.abs(u) < 1e-9) return null;
      return f.a * (u + f.k / u) + f.q;
    }
    case "cloche":
      return f.a / ((x - f.c) ** 2 + 1) + f.q;
    case "racine": {
      const u = x - f.p;
      if (u < 0) return null;
      return f.a * (u - 2 * f.m * Math.sqrt(u)) + f.q;
    }
    case "trig":
      return f.a * Math.sin((Math.PI * (x - f.c)) / 4) + f.q;
  }
}

/** f′(x), ou `null` là où f′ n'existe pas (asymptote, début d'une racine). */
export function deriveeVariee(f: FonctionVarieeAssociation, x: number): number | null {
  switch (f.type) {
    case "rationnelle": {
      const u = x - f.c;
      if (Math.abs(u) < 1e-9) return null;
      return f.a * (1 - f.k / (u * u));
    }
    case "cloche": {
      const u = x - f.c;
      return (-2 * f.a * u) / (u * u + 1) ** 2;
    }
    case "racine": {
      const u = x - f.p;
      if (u <= 0) return null;
      return f.a * (1 - f.m / Math.sqrt(u));
    }
    case "trig":
      return ((f.a * Math.PI) / 4) * Math.cos((Math.PI * (x - f.c)) / 4);
  }
}

/** Abscisse exclue (asymptote verticale de f ET de f′), sinon `null`. */
export function exclusionVariee(f: FonctionVarieeAssociation): number | null {
  return f.type === "rationnelle" ? f.c : null;
}

/** Domaine tracé (dans la fenêtre [−4 ; 4]) : une racine commence en x = p. */
export function domaineVariee(f: FonctionVarieeAssociation): [number, number] {
  return f.type === "racine" ? [f.p, X_MAX_VARIEE] : [X_MIN_VARIEE, X_MAX_VARIEE];
}

export interface ExtremumVariee {
  x: number;
  nature: "max" | "min";
}

/** Extremums dans la fenêtre, triés (abscisses entières par construction). */
export function extremumsVariee(f: FonctionVarieeAssociation): ExtremumVariee[] {
  const haut = f.a > 0;
  switch (f.type) {
    case "rationnelle": {
      const r = Math.sqrt(f.k);
      return [
        { x: f.c - r, nature: haut ? "max" : "min" },
        { x: f.c + r, nature: haut ? "min" : "max" },
      ];
    }
    case "cloche":
      return [{ x: f.c, nature: haut ? "max" : "min" }];
    case "racine":
      return [{ x: f.p + f.m * f.m, nature: haut ? "min" : "max" }];
    case "trig":
      return [
        { x: f.c - 2, nature: haut ? "min" : "max" },
        { x: f.c + 2, nature: haut ? "max" : "min" },
      ];
  }
}

/** Morceau de lecture de la justification : premier extremum, puis l'intervalle qui le suit jusqu'au
 * point remarquable suivant (autre extremum, asymptote ou bord du graphique) — f y est monotone. */
export function intervalleApresPremierExtremum(f: FonctionVarieeAssociation): { de: number; a: number; croissante: boolean } {
  const ex = extremumsVariee(f);
  const de = ex[0].x;
  const bornes = [ex[1]?.x, exclusionVariee(f), X_MAX_VARIEE].filter((v): v is number => v !== undefined && v !== null && v > de);
  return { de, a: Math.min(...bornes), croissante: ex[0].nature === "min" };
}

/** Cadrage vertical commun à l'écran et au papier : extrema de f (ou de f′) sur la fenêtre, loin de ce
 * qui part à l'infini — à √k / 1,6 au moins de l'asymptote d'une rationnelle (f y reste à 1,1 fois la
 * hauteur de ses sommets, f′ à −1,6·a : les sommets restent bien visibles, les branches sortent du
 * cadre), à m²/4 au moins du début d'une racine pour f′ (f′ = −a) ; 15 % de marge. */
export function cadrageVariee(f: FonctionVarieeAssociation, derivee: boolean): { yMin: number; yMax: number } {
  const [d0, d1] = domaineVariee(f);
  const excl = exclusionVariee(f);
  const ecartAsymptote = f.type === "rationnelle" ? Math.sqrt(f.k) / 1.6 : 0;
  let yMin = Infinity;
  let yMax = -Infinity;
  for (let i = 0; i <= 320; i++) {
    const x = d0 + ((d1 - d0) * i) / 320;
    if (excl !== null && Math.abs(x - excl) < ecartAsymptote) continue;
    if (derivee && f.type === "racine" && x - f.p < (f.m * f.m) / 4) continue;
    const y = derivee ? deriveeVariee(f, x) : evaluerVariee(f, x);
    if (y === null || !Number.isFinite(y)) continue;
    yMin = Math.min(yMin, y);
    yMax = Math.max(yMax, y);
  }
  if (!Number.isFinite(yMin)) return { yMin: -5, yMax: 5 };
  yMin = Math.min(yMin, 0);
  yMax = Math.max(yMax, 0);
  const marge = Math.max(1, (yMax - yMin) * 0.15);
  return { yMin: yMin - marge, yMax: yMax + marge };
}

// ============================================================================
// Génération.
// ============================================================================

export const TYPES_VARIEES = ["rationnelle", "cloche", "racine", "trig"] as const;

/** Ordonnée à l'origine nettement au-dessus, en dessous, ou exactement à l'origine (un tiers chacun),
 * comme les cubiques : la phrase « coupe l'axe des ordonnées au-dessus de l'origine » se lit. */
function decalagePourF0(sansQ: (x: number) => number | null, etendue: number): number {
  const f0 = sansQ(0) ?? 0;
  const signe = entier(-1, 1);
  if (signe === 0) return -f0;
  return -f0 + signe * Math.max(1, Math.round(etendue * (0.15 + 0.15 * Math.random())));
}

function etendue(f: FonctionVarieeAssociation): number {
  const { yMin, yMax } = cadrageVariee({ ...f, q: 0 }, false);
  return (yMax - yMin) / 1.3;
}

/** `pourB` : f(0) doit exister (famille B : « coupe l'axe des ordonnées… ») — pas d'asymptote en 0. */
export function tirerFonctionVariee(type: (typeof TYPES_VARIEES)[number], pourB: boolean): FonctionVarieeAssociation {
  let f: FonctionVarieeAssociation;
  switch (type) {
    case "rationnelle": {
      const k = parmi([1, 4] as const);
      const c = pourB ? parmi([-1, 1]) : parmi([-1, 0, 1]);
      f = { type, a: parmi([-1, -0.5, 0.5, 1]), c, k, q: 0 };
      break;
    }
    case "cloche":
      f = { type, a: parmi([-4, -3, 3, 4]), c: entier(-2, 2), q: 0 };
      break;
    case "racine": {
      const [p, m] = parmi([[-4, 1], [-4, 2], [-3, 1], [-3, 2]] as const);
      f = { type, a: parmi([-2, -1, 1, 2]), p, m, q: 0 };
      break;
    }
    case "trig":
      f = { type, a: parmi([-3, -2, 2, 3]), c: entier(-1, 1), q: 0 };
      break;
  }
  const base = f;
  return { ...f, q: decalagePourF0((x) => evaluerVariee(base, x), etendue(base)) };
}

/** Deux fonctions de même dérivée (même forme, seul q change) sont indiscernables en famille A. */
function signatureDerivee(f: FonctionVarieeAssociation): string {
  return JSON.stringify({ ...f, q: 0 });
}

/** Types de l'exercice : les quatre se succèdent dans un ordre mélangé (au moins trois différents). */
function typesExercice(n: number): (typeof TYPES_VARIEES)[number][] {
  const ordre = melanger([...TYPES_VARIEES]);
  return Array.from({ length: n }, (_, i) => ordre[i % ordre.length]);
}

function tirerFonctionsDistinctes(n: number, pourB: boolean, signature: (f: FonctionVarieeAssociation) => string): FonctionVarieeAssociation[] {
  const types = typesExercice(n);
  const out: FonctionVarieeAssociation[] = [];
  const vues = new Set<string>();
  for (const type of types) {
    let f = tirerFonctionVariee(type, pourB);
    for (let essai = 0; essai < 200 && vues.has(signature(f)); essai++) f = tirerFonctionVariee(type, pourB);
    vues.add(signature(f));
    out.push(f);
  }
  return out;
}

export function genererFonctionsGrapheDeriveeVariee(n: number, derangement: (n: number) => number[]): ExerciceAssociationGrapheDeriveeVariee {
  return { famille: "grapheDeriveeVariee", fonctions: tirerFonctionsDistinctes(n, false, signatureDerivee), ordreLettres: derangement(n) };
}

export function genererFonctionsGrapheVerbalVarie(n: number, derangement: (n: number) => number[]): ExerciceAssociationGrapheVerbalVarie {
  const fonctions = tirerFonctionsDistinctes(n, true, enonceVerbalVariee);
  const ordreLettres = derangement(n);
  return { famille: "grapheVerbalVarie", fonctions, enonces: ordreLettres.map((i) => enonceVerbalVariee(fonctions[i])), ordreLettres };
}

// ============================================================================
// Lecture en mots (famille B) — énoncé VRAI et discriminant : deux éléments d'un exercice n'ont jamais
// le même texte (rejet au tirage), et chaque phrase décrit une propriété lue sur le graphique.
// ============================================================================

const SENS = { croit: "croît", decroit: "décroît" };

function cote(x: number): string {
  return x < 0 ? "à gauche de l'axe des ordonnées" : x > 0 ? "à droite de l'axe des ordonnées" : "sur l'axe des ordonnées";
}

export function nombreTexte(x: number): string {
  return `${x}`.replace(".", ",").replace(/^-/, "−");
}

export function enonceVerbalVariee(f: FonctionVarieeAssociation): string {
  const ex = extremumsVariee(f);
  const montant = (e: ExtremumVariee) => (e.nature === "max" ? SENS.croit : SENS.decroit);
  const apres = (e: ExtremumVariee) => (e.nature === "max" ? SENS.decroit : SENS.croit);
  const nom = (e: ExtremumVariee) => (e.nature === "max" ? "maximum" : "minimum");
  const phrases: string[] = [];
  switch (f.type) {
    case "rationnelle":
      phrases.push(`f n'est pas définie en x = ${nombreTexte(f.c)} : sa courbe a une asymptote verticale d'équation x = ${nombreTexte(f.c)}.`);
      phrases.push(
        `De gauche à droite, f ${montant(ex[0])} jusqu'à un ${nom(ex[0])}, puis ${apres(ex[0])} jusqu'à l'asymptote ; de l'autre côté, elle ${montant(ex[1])} jusqu'à un ${nom(ex[1])}, puis ${apres(ex[1])}.`,
      );
      break;
    case "racine":
      phrases.push(`f n'est définie qu'à partir de x = ${nombreTexte(f.p)}, où sa courbe commence.`);
      phrases.push(`À partir de là, f ${montant(ex[0])} jusqu'à un ${nom(ex[0])}, puis ${apres(ex[0])}.`);
      break;
    case "cloche":
      phrases.push(`De gauche à droite, f ${montant(ex[0])} jusqu'à un ${nom(ex[0])}, puis ${apres(ex[0])}.`);
      break;
    case "trig":
      phrases.push(`De gauche à droite, f ${montant(ex[0])} jusqu'à un ${nom(ex[0])}, ${apres(ex[0])} jusqu'à un ${nom(ex[1])}, puis ${apres(ex[1])} à nouveau.`);
      break;
  }
  if (ex.length === 1) phrases.push(`Son ${nom(ex[0])} est ${cote(ex[0].x)}.`);
  else {
    const [e1, e2] = ex;
    if (e1.x < 0 && e2.x < 0) phrases.push("Ses deux extremums sont situés à gauche de l'axe des ordonnées.");
    else if (e1.x > 0 && e2.x > 0) phrases.push("Ses deux extremums sont situés à droite de l'axe des ordonnées.");
    else phrases.push(`Son ${nom(e1)} est ${cote(e1.x)}, son ${nom(e2)} ${cote(e2.x)}.`);
  }
  const f0 = evaluerVariee(f, 0) ?? 0;
  phrases.push(
    Math.abs(f0) < 1e-9
      ? "Sa courbe passe par l'origine du repère."
      : f0 > 0
        ? "Sa courbe coupe l'axe des ordonnées au-dessus de l'origine."
        : "Sa courbe coupe l'axe des ordonnées en dessous de l'origine.",
  );
  return phrases.join(" ");
}

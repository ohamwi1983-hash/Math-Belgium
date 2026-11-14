import type {
  Comb,
  ContactTangente,
  ExerciceTangenteOrigine,
  ExerciceTangenteParallele,
  ExerciceTangentePoint,
  ExerciceTangentesLog,
  FamilleTangenteLog,
  FonctionTangente,
  VarianteTangentesLog,
} from "../../core6e/tangentesLogarithmiques.types";
import {
  ATOME_INV_RACINE_E,
  ATOME_RACINE_E,
  atomeE,
  atomeInvE,
  atomeInvELn,
  atomeInvLn,
  atomeLn,
  comb,
  entier,
  latexComb,
  oppose,
  rationnel,
  terme,
  valeur,
} from "./exact";
import {
  affine,
  coefLn,
  constSigne,
  fonctionLnAffine,
  fonctionLnInverse,
  fonctionLnQuad,
  fonctionLnSimple,
  fonctionLnSurX,
  fonctionLogBase,
  fonctionPolyLn,
  fonctionXLnX,
  logLatex,
} from "./familles";

/**
 * Couche A (6e) — générateur de `6gen87` « Tangentes aux courbes logarithmiques ». N'utilise QUE
 * `Math.random()` : le `?code=` (`export/codeExercice.ts::avecGraine`) rejoue exactement le même
 * tirage, ici comme dans l'adaptateur de feuilles (`exportEvaluation.ts`).
 *
 * - `point` : 5 familles (k ln(bx + c) + d, log_b(x), x ln(x) + cx, k ln(x)/x, k ln(x² + q)).
 * - `parallele` : le NOMBRE de tangentes (1 ou 2) est tiré à 50/50 AVANT la famille — c'est un
 *   verdict, jamais fixé par `forme`. Deux familles où les deux issues existent, avec le même jeu
 *   de racines : k ln(x) + c/x et x²/2 + bx + c ln(x) (deux racines positives ; ou une racine
 *   négative REJETÉE par le domaine, ou une racine double). k ln(x² + q) est écartée ici : ses deux
 *   points de même pente encadrent toujours un point d'inflexion et leurs tangentes sont presque
 *   confondues (écart d'ordonnée à l'origine < 0,4).
 * - `origine` : 4 familles (k ln(x) + d, x ln(x) + cx, log_b(x), k ln(x)/x + d) ; P(0 ; p) choisi
 *   pour que l'abscisse a du point de contact soit exacte (1, e, e², 1/e, 2, 3, b·e, √e…).
 */

function hasard<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)];
}

function contact(x0: Comb, fx0: Comb, dfx0: Comb, p: Comb): ContactTangente {
  return { x0, fx0, dfx0, m: dfx0, p };
}

// ============================================================================
// Tangente en un point.
// ============================================================================

export const FAMILLES_POINT = ["lnAffine", "logBase", "xlnx", "lnSurX", "lnQuad"] as const;
export const FAMILLES_PARALLELE = ["lnInverse", "polyLn"] as const;
export const FAMILLES_ORIGINE = ["lnSimple", "xlnx", "logBase", "lnSurX"] as const;

function pointLnAffine(): { fonction: FonctionTangente; c: ContactTangente } {
  const b = hasard([1, 2, 3, -1]);
  let x0 = 0;
  let u0 = 1;
  let c = 0;
  do {
    x0 = hasard([-2, -1, 0, 1, 2, 3]);
    u0 = hasard([1, 2, 3, 4, 5]);
    c = u0 - b * x0;
  } while (c === 0 || Math.abs(c) > 7);
  const k = hasard([1, 2, 3, -1, -2]);
  const d = hasard([-2, -1, 0, 1, 2, 3]);
  const lnU = u0 === 1 ? [] : [terme(k, 1, atomeLn(u0))];
  return {
    fonction: fonctionLnAffine(k, b, c, d),
    c: contact(entier(x0), comb(terme(d, 1), ...lnU), rationnel(k * b, u0), comb(terme(d * u0 - k * b * x0, u0), ...lnU)),
  };
}

function pointLogBase(): { fonction: FonctionTangente; c: ContactTangente } {
  const base = hasard([2, 3, 5, 10]);
  const n = hasard([-1, 0, 1, 2]);
  const x0 = n >= 0 ? entier(base ** n) : rationnel(1, base);
  const dfx0 = n >= 0 ? comb(terme(1, base ** n, atomeInvLn(base))) : comb(terme(base, 1, atomeInvLn(base)));
  return { fonction: fonctionLogBase(base), c: contact(x0, entier(n), dfx0, comb(terme(n, 1), terme(-1, 1, atomeInvLn(base)))) };
}

function pointXLnX(): { fonction: FonctionTangente; c: ContactTangente } {
  const c = hasard([-2, -1, 0, 1, 2]);
  const choix = hasard(["1", "e", "e2", "ie", "2"] as const);
  const fonction = fonctionXLnX(c);
  switch (choix) {
    case "1":
      return { fonction, c: contact(entier(1), entier(c), entier(1 + c), entier(-1)) };
    case "e":
      return { fonction, c: contact(comb(terme(1, 1, atomeE(1))), comb(terme(1 + c, 1, atomeE(1))), entier(2 + c), comb(terme(-1, 1, atomeE(1)))) };
    case "e2":
      return { fonction, c: contact(comb(terme(1, 1, atomeE(2))), comb(terme(2 + c, 1, atomeE(2))), entier(3 + c), comb(terme(-1, 1, atomeE(2)))) };
    case "ie":
      return { fonction, c: contact(comb(terme(1, 1, atomeInvE(1))), comb(terme(c - 1, 1, atomeInvE(1))), entier(c), comb(terme(-1, 1, atomeInvE(1)))) };
    case "2":
      return { fonction, c: contact(entier(2), comb(terme(2 * c, 1), terme(2, 1, atomeLn(2))), comb(terme(1 + c, 1), terme(1, 1, atomeLn(2))), entier(-2)) };
  }
}

function pointLnSurX(): { fonction: FonctionTangente; c: ContactTangente } {
  const k = hasard([1, 2, 3]);
  const fonction = fonctionLnSurX(k, 0);
  switch (hasard(["1", "e", "e2", "ie"] as const)) {
    case "1":
      return { fonction, c: contact(entier(1), [], entier(k), entier(-k)) };
    case "e":
      return { fonction, c: contact(comb(terme(1, 1, atomeE(1))), comb(terme(k, 1, atomeInvE(1))), [], comb(terme(k, 1, atomeInvE(1)))) };
    case "e2":
      return { fonction, c: contact(comb(terme(1, 1, atomeE(2))), comb(terme(2 * k, 1, atomeInvE(2))), comb(terme(-k, 1, atomeInvE(4))), comb(terme(3 * k, 1, atomeInvE(2)))) };
    case "ie":
      return { fonction, c: contact(comb(terme(1, 1, atomeInvE(1))), comb(terme(-k, 1, atomeE(1))), comb(terme(2 * k, 1, atomeE(2))), comb(terme(-3 * k, 1, atomeE(1)))) };
  }
}

function pointLnQuad(): { fonction: FonctionTangente; c: ContactTangente } {
  const k = hasard([1, 2, -1]);
  const q = hasard([1, 2, 3, 4, 5]);
  const x0 = hasard([-2, -1, 1, 2]);
  const u0 = x0 * x0 + q;
  return {
    fonction: fonctionLnQuad(k, q),
    c: contact(entier(x0), comb(terme(k, 1, atomeLn(u0))), rationnel(2 * k * x0, u0), comb(terme(-2 * k * x0 * x0, u0), terme(k, 1, atomeLn(u0)))),
  };
}

export function construirePoint(famille?: (typeof FAMILLES_POINT)[number]): ExerciceTangentePoint {
  const f = famille ?? hasard(FAMILLES_POINT);
  const r =
    f === "lnAffine" ? pointLnAffine() : f === "logBase" ? pointLogBase() : f === "xlnx" ? pointXLnX() : f === "lnSurX" ? pointLnSurX() : pointLnQuad();
  return { variante: "point", fonction: r.fonction, contacts: [r.c] };
}

// ============================================================================
// Tangente(s) parallèle(s) à une droite.
// ============================================================================

/** « x^{2}-3x+2=0 » pour x² − S x + P = 0. */
function trinome(S: number, P: number): string {
  const lin = S === 0 ? "" : `${S > 0 ? "-" : "+"}${Math.abs(S) === 1 ? "" : Math.abs(S)}x`;
  return `x^{2}${lin}${constSigne(P)}=0`;
}

/**
 * Racines (r₁ ; r₂) de l'équation du second degré. Deux tangentes : deux racines positives assez
 * ÉCARTÉES — deux points de même pente proches l'un de l'autre encadrent un point d'inflexion et
 * leurs tangentes sont presque confondues (figure illisible, ex. (1 ; 2) pour x²/2 + 2 ln(x)). Une
 * tangente : une racine négative rejetée par le domaine, ou une racine double.
 */
const RACINES_DEUX = [[1, 4], [1, 5], [1, 6], [2, 6]] as const;
const RACINES_UNE = [[-1, 2], [-1, 3], [-2, 1], [-1, 4], [-2, 3], [-3, 1], [1, 1], [2, 2]] as const;

function racinesDistinctes(r1: number, r2: number): number[] {
  return [...new Set([r1, r2])].sort((x, y) => x - y);
}

function paralleleLnInverse(nombre: 1 | 2): Omit<ExerciceTangenteParallele, "h"> {
  const m = hasard([1, 2, 3]);
  const [r1, r2] = nombre === 2 ? hasard(RACINES_DEUX) : hasard(RACINES_UNE);
  const S = r1 + r2;
  const P = r1 * r2;
  const k = m * S;
  const c = m * P;
  const fonction = fonctionLnInverse(k, c);
  const racines = racinesDistinctes(r1, r2);
  const contacts = racines
    .filter((r) => r > 0)
    .map((r) => {
      const lnR = r === 1 ? [] : [terme(k, 1, atomeLn(r))];
      return contact(entier(r), comb(terme(c, r), ...lnR), entier(m), comb(terme(c - m * r * r, r), ...lnR));
    });
  const equation = trinome(S, P);
  return {
    variante: "parallele",
    fonction,
    contacts,
    m: entier(m),
    chaineEquation: `${fonction.dfLatex}=${m}\\iff ${affine(k, -c, "x")}=${m === 1 ? "" : m}x^{2}\\iff ${equation}`,
    equationSecondDegre: equation,
    racines,
    rejetees: racines.filter((r) => r <= 0),
    double: r1 === r2,
  };
}

function parallelePolyLn(nombre: 1 | 2): Omit<ExerciceTangenteParallele, "h"> {
  const b = hasard([-2, -1, 0, 1, 2]);
  const [r1, r2] = nombre === 2 ? hasard(RACINES_DEUX) : hasard(RACINES_UNE);
  const c = r1 * r2;
  const S = r1 + r2;
  const mEntier = S + b;
  const m = entier(mEntier);
  const fonction = fonctionPolyLn(b, c);
  const racines = racinesDistinctes(r1, r2);
  const positives = racines.filter((r) => r > 0);
  const contacts = positives.map((r) => {
    const lnR = r === 1 ? [] : [terme(c, 1, atomeLn(r))];
    return contact(entier(r), comb(terme(r * r + 2 * b * r, 2), ...lnR), m, comb(terme(r * r + 2 * b * r - 2 * mEntier * r, 2), ...lnR));
  });
  const equation = trinome(S, c);
  return {
    variante: "parallele",
    fonction,
    contacts,
    m,
    chaineEquation: `${fonction.dfLatex}=${latexComb(m)}\\iff x^{2}${b === 0 ? "" : b > 0 ? "+x" : "-x"}${constSigne(c)}=${mEntier === 0 ? "0" : `${mEntier === 1 ? "" : mEntier === -1 ? "-" : mEntier}x`}\\iff ${equation}`,
    equationSecondDegre: equation,
    racines,
    rejetees: racines.filter((r) => r <= 0),
    double: r1 === r2,
  };
}

export function construireParallele(famille?: (typeof FAMILLES_PARALLELE)[number], nombreImpose?: 1 | 2): ExerciceTangenteParallele {
  // Verdict (une ou deux tangentes) tiré AVANT la famille, jamais par le profil.
  const nombre = nombreImpose ?? hasard([1, 2] as const);
  const f = famille ?? hasard(FAMILLES_PARALLELE);
  const base = f === "lnInverse" ? paralleleLnInverse(nombre) : parallelePolyLn(nombre);
  // h DÉTERMINÉ par f et la pente (première valeur qui n'est pas l'ordonnée à l'origine d'une
  // tangente) : deux instances de même f et même pente ont le même énoncé, et l'anti-doublon des
  // séries (empreinte de l'énoncé) les écarte au lieu de les laisser passer à une droite d près.
  const h = [1, -1, 2, -2, 3, 0].find((v) => base.contacts.every((c) => Math.abs(valeur(c.p) - v) > 0.1)) ?? 4;
  return { ...base, h };
}

// ============================================================================
// Tangente passant par P(0 ; p).
// ============================================================================

/** Terme ajouté : « +s », ou « s » s'il commence déjà par un signe moins. */
function plus(s: string): string {
  return s.startsWith("-") ? s : `+${s}`;
}

function origineLnSimple(): ExerciceTangenteOrigine {
  const k = hasard([1, 2, 3, -1, -2]);
  const d = hasard([-2, -1, 0, 1, 2]);
  const n = hasard([0, 1, 2, -1]);
  const p = d + k * (n - 1);
  const fonction = fonctionLnSimple(k, d);
  const a = n === 0 ? entier(1) : n > 0 ? comb(terme(1, 1, atomeE(n))) : comb(terme(1, 1, atomeInvE(1)));
  const dfa = n === 0 ? entier(k) : n > 0 ? comb(terme(k, 1, atomeInvE(n))) : comb(terme(k, 1, atomeE(1)));
  const aLatex = latexComb(a);
  const membre = p + k - d;
  return {
    variante: "origine",
    fonction,
    contacts: [contact(a, entier(k * n + d), dfa, entier(p))],
    pP: entier(p),
    equationEnA: `y=${fonction.dfDe("a")}(x-a)${plus(fonction.fDe("a"))}`,
    substitution: `${p}=${fonction.dfDe("a")}(0-a)${plus(fonction.fDe("a"))}`,
    texteSimplifiee: "Après simplification (le produit vaut une constante), il reste :",
    simplifiee: `${coefLn(k)}\\ln(a)=${membre}`,
    resolution: `${p}=${-k}${plus(`${coefLn(k)}\\ln(a)`)}${constSigne(d)}\\iff ${coefLn(k)}\\ln(a)=${membre}\\iff \\ln(a)=${n}\\iff a=${aLatex}`,
    faLatex: fonction.fDe("a"),
    dfaLatex: fonction.dfDe("a"),
  };
}

function origineXLnX(): ExerciceTangenteOrigine {
  const c = hasard([-2, -1, 0, 1, 2]);
  const choix = hasard([1, 2, 3, "e"] as const);
  const fonction = fonctionXLnX(c);
  let a: Comb;
  let fa: Comb;
  let dfa: Comb;
  if (choix === "e") {
    a = comb(terme(1, 1, atomeE(1)));
    fa = comb(terme(1 + c, 1, atomeE(1)));
    dfa = entier(2 + c);
  } else {
    a = entier(choix);
    const lnA = choix === 1 ? [] : [terme(choix, 1, atomeLn(choix))];
    fa = comb(terme(c * choix, 1), ...lnA);
    dfa = comb(terme(1 + c, 1), ...(choix === 1 ? [] : [terme(1, 1, atomeLn(choix))]));
  }
  const p = oppose(a);
  const pLatex = latexComb(p);
  const aLatex = latexComb(a);
  const termeA = (k: number) => (k === 0 ? "" : `${k > 0 ? "+" : "-"}${Math.abs(k) === 1 ? "" : Math.abs(k)}a`);
  const developpe = `-a\\ln(a)${termeA(-(1 + c))}+a\\ln(a)${termeA(c)}`;
  return {
    variante: "origine",
    fonction,
    contacts: [contact(a, fa, dfa, p)],
    pP: p,
    equationEnA: `y=\\left(${fonction.dfDe("a")}\\right)(x-a)+${fonction.fDe("a")}`,
    substitution: `${pLatex}=\\left(${fonction.dfDe("a")}\\right)(0-a)+${fonction.fDe("a")}`,
    texteSimplifiee: "Développe le produit ; certains de ses termes se compensent avec ceux de f(a) :",
    simplifiee: `\\left(${fonction.dfDe("a")}\\right)(0-a)=-a\\ln(a)${termeA(-(1 + c))}`,
    resolution: `${pLatex}=${developpe}\\iff ${pLatex}=-a\\iff a=${aLatex}`,
    faLatex: fonction.fDe("a"),
    dfaLatex: fonction.dfDe("a"),
  };
}

function origineLogBase(): ExerciceTangenteOrigine {
  const base = hasard([2, 3, 10]);
  const pp = hasard([-1, 0, 1]);
  const fonction = fonctionLogBase(base);
  const a = pp === 0 ? comb(terme(1, 1, atomeE(1))) : pp === 1 ? comb(terme(base, 1, atomeE(1))) : comb(terme(1, base, atomeE(1)));
  const fa = comb(terme(pp, 1), terme(1, 1, atomeInvLn(base)));
  const dfa = pp === 0 ? comb(terme(1, 1, atomeInvELn(base))) : pp === 1 ? comb(terme(1, base, atomeInvELn(base))) : comb(terme(base, 1, atomeInvELn(base)));
  const lnB = `\\ln(${base})`;
  const droite = pp === 0 ? "1" : pp === 1 ? `1+${lnB}` : `1-${lnB}`;
  return {
    variante: "origine",
    fonction,
    contacts: [contact(a, fa, dfa, entier(pp))],
    pP: entier(pp),
    equationEnA: `y=${fonction.dfDe("a")}(x-a)+${fonction.fDe("a")}`,
    substitution: `${pp}=${fonction.dfDe("a")}(0-a)+${fonction.fDe("a")}`,
    texteSimplifiee: "Après simplification du produit, il reste :",
    simplifiee: `${logLatex(base, "a")}=${pp === 0 ? "" : `${pp}+`}\\dfrac{1}{${lnB}}`,
    resolution: `${pp}=-\\dfrac{1}{${lnB}}+\\dfrac{\\ln(a)}{${lnB}}\\iff \\ln(a)=${droite}\\iff a=${latexComb(a)}`,
    faLatex: fonction.fDe("a"),
    dfaLatex: fonction.dfDe("a"),
  };
}

function origineLnSurX(): ExerciceTangenteOrigine {
  const k = hasard([1, 2, 3]);
  const d = hasard([-2, -1, 0, 1, 2]);
  const fonction = fonctionLnSurX(k, d);
  const a = comb(terme(1, 1, ATOME_RACINE_E));
  const fa = comb(terme(d, 1), terme(k, 2, ATOME_INV_RACINE_E));
  const dfa = comb(terme(k, 2, atomeInvE(1)));
  const k1 = k === 1 ? "" : `${k}`;
  const fraction = `\\dfrac{${2 * k}\\ln(a)-${k}}{a}=0`;
  return {
    variante: "origine",
    fonction,
    contacts: [contact(a, fa, dfa, entier(d))],
    pP: entier(d),
    equationEnA: `y=${fonction.dfDe("a")}(x-a)+${fonction.fDe("a")}`,
    substitution: `${d}=${fonction.dfDe("a")}(0-a)+${fonction.fDe("a")}`,
    texteSimplifiee: "Après simplification (les constantes se compensent), au même dénominateur :",
    simplifiee: fraction,
    resolution: `${d}=-\\dfrac{${k}-${k1}\\ln(a)}{a}+\\dfrac{${k1}\\ln(a)}{a}${constSigne(d)}\\iff ${fraction}\\iff \\ln(a)=\\dfrac{1}{2}\\iff a=\\sqrt{e}`,
    faLatex: fonction.fDe("a"),
    dfaLatex: fonction.dfDe("a"),
  };
}

export function construireOrigine(famille?: (typeof FAMILLES_ORIGINE)[number]): ExerciceTangenteOrigine {
  const f = famille ?? hasard(FAMILLES_ORIGINE);
  return f === "lnSimple" ? origineLnSimple() : f === "xlnx" ? origineXLnX() : f === "logBase" ? origineLogBase() : origineLnSurX();
}

// ============================================================================
// Catalogue (sélecteur de variante, feuilles d'exercices).
// ============================================================================

export type IdVarianteTangentesLog = VarianteTangentesLog;

export const CATALOGUE_VARIANTES: { id: IdVarianteTangentesLog; label: string }[] = [
  { id: "point", label: "Tangente en un point" },
  { id: "parallele", label: "Tangente parallèle à une droite" },
  { id: "origine", label: "Tangente passant par un point extérieur" },
];

export function construireAvecVarianteId(id: IdVarianteTangentesLog): ExerciceTangentesLog {
  switch (id) {
    case "point":
      return construirePoint();
    case "parallele":
      return construireParallele();
    case "origine":
      return construireOrigine();
  }
}

/** Tirage libre : les trois variantes équiprobables. */
export function genererExerciceTangentesLog(): ExerciceTangentesLog {
  return construireAvecVarianteId(hasard(CATALOGUE_VARIANTES).id);
}

export function familleDe(e: ExerciceTangentesLog): FamilleTangenteLog {
  return e.fonction.famille;
}

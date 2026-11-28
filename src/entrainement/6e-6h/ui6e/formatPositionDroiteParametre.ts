import type { AideEcran, ChampEcran, DefinitionEcrans, Frag, OptionEcran } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { ExercicePD, PhasePD, VerdictPD } from "../core6e/positionDroiteParametre";
import { coefs, degreChute, PHASES_PD, points, valeursTangence, VERDICTS } from "../core6e/positionDroiteParametre";
import type { Pt } from "./outilsConiquesLotH2";
import { branchesConique, COULEURS, coefL, equationConiqueL, fenetrePoints, figureConiqueRepere, l, nL, pgcd, t, termeL, valeursL } from "./outilsConiquesLotH2";
import { listeL } from "./outilsLieuxLotH2";
import { approchee, diagnostiquer, messageIllisible, piege } from "../moteur6e/verificationPositionDroiteParametre";
import { correctionDetailleePD } from "../generateurs6e/positionDroiteParametre/corrigeDetaille";

/**
 * Couche C — textes de `6gen139` « Position d'une droite et d'une conique selon un paramètre » : énoncé,
 * consignes, aides à deux niveaux, réponses, écritures entières de l'équation en x et de Δ(k), figure
 * (la conique seule tant que la position n'est pas trouvée — la droite d_{k₀} trahirait le verdict —,
 * puis d_{k₀}, ses points communs et les tangentes de la famille). Source unique écran / papier / corrigé.
 */

type E = ExercicePD;

export const nomConique = (e: E): string => ({ ellipse: "l'ellipse", hyperbole: "l'hyperbole", parabole: "la parabole" })[e.variante];

/** Second membre de y = mx + k (« 2x+k », « k », « -\dfrac12x+k »). */
export function membreDroite(m: number, k: string): string {
  if (m === 0) return k;
  return `${coefL(m)}x${k.startsWith("-") ? k : `+${k}`}`;
}
export const droiteKL = (e: E): string => `d_k:\\ y=${membreDroite(e.m, "k")}`;
export const droiteK0L = (e: E): string => `y=${membreDroite(e.m, nL(e.k0)).replace(/\+0$/, "")}`;

export function situation(e: E): Frag[] {
  return [
    t("Dans un repère orthonormé, on donne "),
    t(nomConique(e)),
    t(" "),
    l(`\\Gamma:\\ ${equationConiqueL(e.conique)}`),
    t(" et, pour tout réel "),
    l("k"),
    t(", la droite "),
    l(droiteKL(e)),
    t(". On étudie en particulier la droite "),
    l(`d_{${nL(e.k0)}}`),
    t(", obtenue pour "),
    l(`k=${nL(e.k0)}`),
    t("."),
  ];
}
export const consigneGenerale = situation;

// ---------------------------------------------------------------------------------------------
// Écritures entières
// ---------------------------------------------------------------------------------------------

/** Facteur S rendant entiers les coefficients de l'équation en x. */
export function facteurEntier(e: E): number {
  const c = coefs(e);
  const vals = [c.A, c.B1, c.B0, c.C2, c.C0];
  for (let s = 1; s <= 144; s++) if (vals.every((v) => Math.abs(v * s - Math.round(v * s)) < 1e-9)) return s;
  return 1;
}

/** Coefficients entiers, premiers entre eux, premier non nul positif. */
export function coefsEntiers(e: E): [number, number, number, number, number] {
  const c = coefs(e);
  const s = facteurEntier(e);
  const v = [c.A, c.B1, c.B0, c.C2, c.C0].map((x) => Math.round(x * s));
  const g = v.reduce((a, b) => pgcd(a, b), 0) || 1;
  const premier = v.find((x) => x !== 0) ?? 1;
  const sg = premier < 0 ? -1 : 1;
  return v.map((x) => (sg * x) / g) as [number, number, number, number, number];
}

/** Équation en x (paramètre k), forme entière ordonnée. */
export function equationXL(e: E): string {
  const [A, B1, B0, C2, C0] = coefsEntiers(e);
  let s = "";
  for (const [c, p] of [
    [A, "x^2"],
    [B1, "kx"],
    [B0, "x"],
    [C2, "k^2"],
    [C0, ""],
  ] as [number, string][]) {
    s += termeL(c, p, s === "");
  }
  return `${s || "0"}=0`;
}

/** Équation en x pour k = k₀ (forme entière). */
export function equationXk0(e: E): { A: number; B: number; C: number; latex: string } {
  const [A, B1, B0, C2, C0] = coefsEntiers(e);
  const B = B1 * e.k0 + B0;
  const C = C2 * e.k0 * e.k0 + C0;
  let s = termeL(A, "x^2", true);
  s += termeL(B, "x", s === "");
  s += termeL(C, "", s === "");
  return { A, B, C, latex: `${s || "0"}=0` };
}

/** Δ(k) de l'équation entière : D2 k² + D1 k + D0 (et son pgcd). */
export function deltaEntier(e: E): { D2: number; D1: number; D0: number } {
  const [A, B1, B0, C2, C0] = coefsEntiers(e);
  return { D2: B1 * B1 - 4 * A * C2, D1: 2 * B1 * B0, D0: B0 * B0 - 4 * A * C0 };
}
export function deltaL(e: E): string {
  const { D2, D1, D0 } = deltaEntier(e);
  let s = termeL(D2, "k^2", true);
  s += termeL(D1, "k", s === "");
  s += termeL(D0, "", s === "");
  return s || "0";
}
export const deltaEntierEn = (e: E, k: number): number => {
  const { D2, D1, D0 } = deltaEntier(e);
  return D2 * k * k + D1 * k + D0;
};

// ---------------------------------------------------------------------------------------------
// Réponses
// ---------------------------------------------------------------------------------------------

export const LIBELLES_VERDICT: Record<VerdictPD, string> = {
  secante: "Sécante : deux points communs",
  tangente: "Tangente : un point de contact (point double)",
  exterieure: "Extérieure : aucun point commun",
  unPoint: "Un seul point commun, sans être tangente",
};

export const valeursTangenceL = (e: E): string => valeursL(valeursTangence(e), "k");
/** Valeurs de tangence en fragments (« aucune valeur de k » écrit en texte). */
export function valeursTangenceFr(e: E): Frag[] {
  return valeursTangence(e).length ? [l(valeursTangenceL(e))] : [t("aucune valeur de "), l("k"), t(" (aucune droite de la famille n'est tangente)")];
}
export const pointsL = (e: E): string => listeL(points(e));
/** Points communs en fragments (« aucun point commun » en texte). */
export const pointsFr = (e: E): Frag[] => (points(e).length ? [l(pointsL(e))] : [t("aucun point commun")]);

export function reponse(e: E, p: PhasePD): Frag[] {
  if (p === "equation") return [l(equationXL(e))];
  if (p === "condition") return valeursTangenceFr(e).map((f, i) => (i === 0 && f.type === "texte" ? { ...f, valeur: "Aucune valeur de " } : f));
  if (p === "position") return [t(LIBELLES_VERDICT[e.verdict])];
  return points(e).length ? [l(pointsL(e))] : [t("Aucun point commun")];
}
export const recap = reponse;

export function libelle(_e: E, p: PhasePD): string {
  return { equation: "Équation en x", condition: "Tangence", position: "Position de la droite", points: "Points communs" }[p];
}

export function consigne(e: E, p: PhasePD): Frag[] {
  if (p === "equation") return [t("Remplace "), l("y"), t(" dans l'équation de "), l("\\Gamma"), t(" : écris l'équation en "), l("x"), t(" obtenue, en fonction de "), l("k"), t(".")];
  if (p === "condition") return [t("Pour quelles valeurs de "), l("k"), t(" la droite "), l("d_k"), t(" est-elle tangente à "), l("\\Gamma"), t(" ?")];
  if (p === "position") return [t("Quelle est la position de la droite "), l(`d_{${nL(e.k0)}}`), t(" par rapport à "), l("\\Gamma"), t(" ?")];
  return [t("Donne les coordonnées des points communs à "), l(`d_{${nL(e.k0)}}`), t(" et à "), l("\\Gamma"), t(" (« aucun » s'il n'y en a pas).")];
}

export function champs(_e: E, p: PhasePD): ChampEcran[] {
  if (p === "equation") return [{ label: "Équation en x et k", placeholder: "équation en x et k" }];
  if (p === "condition") return [{ label: "Valeurs de k", labelLatex: "k=", placeholder: "… ; … ou « aucune »" }];
  return [{ label: "Points communs", placeholder: "(… ; …) ; (… ; …) ou « aucun »" }];
}

export function optionsPosition(): OptionEcran[] {
  return VERDICTS.map((v) => ({ id: v, fragments: [t(LIBELLES_VERDICT[v])] }));
}

// ---------------------------------------------------------------------------------------------
// Aides
// ---------------------------------------------------------------------------------------------

export function aide1(e: E, p: PhasePD): AideEcran {
  if (p === "equation") return { texte: [t("Intersection d'une droite et d'une conique (cours, point 4) : remplace "), l("y"), t(" par "), l(membreDroite(e.m, "k")), t(" dans l'équation de "), l("\\Gamma"), t(", puis ordonne selon les puissances de "), l("x"), t(".")] };
  if (p === "condition") return { texte: [t("Si l'équation est du second degré, la droite est tangente quand elle a une racine double (cours, points 4 et 5) :")], latex: "\\Delta=0" };
  if (p === "position") return { texte: [t("Remplace "), l("k"), t(" par "), l(nL(e.k0)), t(" : le signe de "), l("\\Delta"), t(" donne le nombre de points ; mais si le coefficient de "), l("x^2"), t(" est nul, l'équation est du premier degré.")] };
  return { texte: [t("Résous l'équation en "), l("x"), t(" pour "), l(`k=${nL(e.k0)}`), t(", puis calcule "), l(`y=${membreDroite(e.m, nL(e.k0)).replace(/\+0$/, "")}`), t(".")] };
}

export function aide2(e: E, p: PhasePD): AideEcran | null {
  const c = coefs(e);
  if (p === "equation") {
    if (e.m === 0) return { texte: [t("Ici la droite est horizontale : "), l("y=k"), t(", donc "), l("y^2=k^2"), t(".")] };
    return { texte: [t("Développe d'abord :")], latex: `\\left(${membreDroite(e.m, "k")}\\right)^2=${termeL(e.m * e.m, "x^2", true)}${termeL(2 * e.m, "kx")}+k^2` };
  }
  if (p === "condition") {
    if (Math.abs(c.A) < 1e-9) return { texte: [t("Regarde le coefficient de "), l("x^2"), t(" dans ton équation : que vaut-il ?")] };
    return { texte: [t("Avec "), l("ax^2+bx+c=0"), t(" où "), l("b"), t(" et "), l("c"), t(" dépendent de "), l("k"), t(" : écris "), l("\\Delta=b^2-4ac"), t(" en fonction de "), l("k"), t(", puis résous "), l("\\Delta=0"), t(".")] };
  }
  if (p === "position") {
    if (degreChute(e)) return { texte: [t("Le coefficient de "), l("x^2"), t(" vaut "), l("0"), t(" pour tout "), l("k"), t(" : compare la pente "), l(nL(e.m)), t(" aux pentes des asymptotes (ou à l'axe de la parabole).")] };
    return { texte: [t("Ici "), l(`\\Delta=${deltaL(e)}`), t(" : remplace "), l("k"), t(" par "), l(nL(e.k0)), t(".")] };
  }
  return { texte: [t("Pour "), l(`k=${nL(e.k0)}`), t(", l'équation devient :")], latex: equationXk0(e).latex };
}

export function explicationChoix(e: E, p: PhasePD): string {
  if (p !== "position") return "";
  if (e.verdict === "unPoint") return "Le coefficient du terme du second degré est nul : l'équation est du premier degré, un seul point commun, et la droite traverse la conique sans la toucher (elle n'est pas tangente).";
  if (e.verdict === "tangente") return "Pour cette valeur de k, Δ = 0 : une racine double, la droite est tangente.";
  return e.verdict === "secante" ? "Pour cette valeur de k, Δ > 0 : deux points communs." : "Pour cette valeur de k, Δ < 0 : aucun point commun.";
}

// ---------------------------------------------------------------------------------------------
// Figure
// ---------------------------------------------------------------------------------------------

export function fenetrePD(e: E) {
  const c = e.conique;
  const cadre: Pt[] = [...points(e)];
  if (c.type === "parabole") cadre.push({ x: -1, y: -4 }, { x: 6, y: 4 });
  else cadre.push({ x: c.a + 1, y: c.b + 1 }, { x: -c.a - 1, y: -c.b - 1 });
  return fenetrePoints(cadre, 1, 8);
}

/** Figure : la conique ; `complete` : d_{k₀}, ses points communs, tangentes de la famille et asymptotes. */
export function figurePD(e: E, complete: boolean): string {
  const fen = fenetrePD(e);
  const c = e.conique;
  const droites = [] as { d: { a: number; b: number; c: number }; couleur?: string; pointille?: boolean; label?: string }[];
  if (complete) {
    if (c.type === "hyperbole") for (const s of [1, -1]) droites.push({ d: { a: (s * c.b) / c.a, b: -1, c: 0 }, couleur: "#9aa1ab", pointille: true });
    for (const k of valeursTangence(e)) if (Math.abs(k - e.k0) > 1e-9) droites.push({ d: { a: e.m, b: -1, c: k }, couleur: COULEURS.vert, pointille: true });
    droites.push({ d: { a: e.m, b: -1, c: e.k0 }, couleur: COULEURS.accent, label: "d" });
  }
  return figureConiqueRepere({
    fenetre: fen,
    courbes: branchesConique(c, fen).map((pts) => ({ points: pts, couleur: COULEURS.bleu })),
    droites,
    points: complete ? points(e).map((P) => ({ P, couleur: COULEURS.accent })) : [],
  });
}

export function figure(e: E, p: PhasePD): string {
  return figurePD(e, p === "points");
}

// ---------------------------------------------------------------------------------------------
// Définition
// ---------------------------------------------------------------------------------------------

/** `6gen139` : équation en x (champ), valeurs de tangence (champ), position (choix jugé), points (champ). */
export const DEFINITION_PD: DefinitionEcrans<E, PhasePD> = {
  phases: () => PHASES_PD,
  estChoix: (_e, p) => p === "position",
  mode: (e, p) => (p === "position" ? { type: "choix", options: optionsPosition() } : { type: "champs", champs: champs(e, p) }),
  libelle,
  consigneGenerale,
  figure,
  consigne,
  approchee,
  aide1,
  aide2,
  diagnostiquer,
  piege,
  piegeChoixRevele: true,
  bonneOption: (e) => e.verdict,
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  explicationChoix,
  correction: correctionDetailleePD,
  apercuEnonce: (e) => [l(`\\Gamma:\\ ${equationConiqueL(e.conique)}`), t(" et "), l(droiteKL(e))],
};


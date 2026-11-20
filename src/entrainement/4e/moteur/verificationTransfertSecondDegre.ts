import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { evaluerExpressionGenerale } from "./expressionGenerale";
import { controlerForme, sansPrefixeFonction } from "./formeEcriturePolynome";
import type { EtatMorceau } from "../ui/morceauIntervalle";
import type { Champ, ChampEnsemble, ChampEquation, ChampExpression, ChampListe, ChampNombre, ChampRelation, Variable } from "../ui/ecransTransfertSecondDegre";
import {
  complementaire,
  ensembleRelation,
  ensemblesEgaux,
  memesBornes,
  net,
  normaliserEnsemble,
  proches,
  type Ensemble,
  type Intervalle,
  type Poly2,
  type Relation,
} from "./algebreTransfertSecondDegre";

/**
 * Vérification des champs des écrans « transfert » du chapitre 2 de 4e (voir
 * `ui/ecransTransfertSecondDegre.ts`). Jamais de blocage de frappe : la saisie est lue telle quelle
 * (signes moins typographiques, exposants « ² », « √ », virgule décimale, « × » et « · » tolérés).
 *
 * Statuts : `parse_error` (illisible — aucune tentative comptée, c'est l'appli qui ne l'envoie pas),
 * `piege` (erreur typique reconnue, message ciblé), `faux`, `correct`.
 */

/** `forme` : écriture JUSTE mais pas dans la forme demandée (gen126) — comme `parse_error`, aucune
 * tentative n'est comptée ; le message dit quelle forme est attendue. */
export type EtatChamp = "correct" | "faux" | "piege" | "parse_error" | "forme";

export interface StatutChamp {
  etat: EtatChamp;
  message?: string;
}

const EXPOSANTS: Record<string, string> = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9" };

/** Écriture clavier lisible par l'évaluateur : « − » → « - », « x² » → « x^2 », « √2 » → « sqrt(2) », « × » → « * ». */
export function normaliserExpression(saisie: string): string {
  let s = normaliserSigneMoins(saisie).replace(/[×·]/g, "*").replace(/÷/g, "/").replace(/ | /g, " ");
  s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, (m) => `^${[...m].map((c) => EXPOSANTS[c]).join("")}`);
  // √(…) → sqrt(…) ; √12 / √x → sqrt(12) / sqrt(x)
  s = s.replace(/√\s*\(/g, "sqrt(").replace(/√\s*([0-9.,]+|[a-zA-Z])/g, "sqrt($1)");
  return s.trim();
}

// ---------------------------------------------------------------------------------------------
// Nombres
// ---------------------------------------------------------------------------------------------

/** Constante écrite par l'élève (« −3 », « 5/2 », « 2,5 », « √2 », « -2√3 »), `null` si illisible. */
export function lireNombre(saisie: string): number | null {
  const s = normaliserExpression(saisie).replace(/\s+/g, "");
  if (s === "" || /[a-zA-Z]/.test(s.replace(/sqrt/g, ""))) return null;
  try {
    const v = evaluerExpressionGenerale(s, 0);
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

/** Retire un préfixe recopié (« x = », « t₁ = », « S = », « m= ») et des accolades. */
function sansPrefixe(s: string): string {
  return s
    .trim()
    .replace(/^[a-zA-Z][a-zA-Z0-9_₀-₉]*\s*=\s*/, "")
    .replace(/^[{]|[}]$/g, "")
    .trim();
}

const MOTS_VIDE = /^(aucune?s?( solution| valeur)?s?|pas de solution|rien|vide|∅|\{\s*\}|ø|Ø)$/i;

/** Liste de nombres séparés par « ; » (ou « et », « ou ») ; `[]` pour « aucune » ; `null` si illisible. */
export function lireListe(saisie: string): number[] | null {
  const s = sansPrefixe(saisie);
  if (MOTS_VIDE.test(s)) return [];
  const morceaux = s
    .replace(/[{}]/g, "")
    .split(/;|\bet\b|\bou\b|\n/)
    .map((m) => sansPrefixe(m))
    .filter((m) => m !== "");
  if (morceaux.length === 0) return null;
  const valeurs: number[] = [];
  for (const m of morceaux) {
    // « ±√3 », « +-2 » : les deux valeurs opposées.
    const pm = /^(±|\+-|\+\/-)\s*(.+)$/.exec(m);
    const v = lireNombre(pm ? pm[2]! : m);
    if (v === null) return null;
    valeurs.push(v);
    if (pm) valeurs.push(-v);
  }
  return valeurs;
}

function memesValeurs(a: number[], b: number[]): boolean {
  const ua = a.filter((v, i) => a.findIndex((w) => proches(v, w)) === i);
  const ub = b.filter((v, i) => b.findIndex((w) => proches(v, w)) === i);
  if (ua.length !== ub.length) return false;
  return ua.every((v) => ub.some((w) => proches(v, w)));
}

// ---------------------------------------------------------------------------------------------
// Polynômes (degré ≤ 2) et relations
// ---------------------------------------------------------------------------------------------

const POINTS_CONTROLE = [2, -2, 3, 0.5, -1.5];

function evaluerEn(s: string, variable: Variable, v: number): number {
  if (variable === "x") return evaluerExpressionGenerale(s, v);
  return evaluerExpressionGenerale(s, Number.NaN, { [variable]: v });
}

export type LecturePoly = { poly: Poly2 } | { erreur: "illisible" | "degre" | "lettre" };

/** Coefficients d'une expression de degré ≤ 2 en `variable` (interpolation en 0, 1, −1 puis contrôle). */
export function lirePolynome(saisie: string, variable: Variable): LecturePoly {
  const s = normaliserExpression(saisie);
  if (s === "") return { erreur: "illisible" };
  let f0: number, f1: number, fm1: number;
  try {
    f0 = evaluerEn(s, variable, 0);
    f1 = evaluerEn(s, variable, 1);
    fm1 = evaluerEn(s, variable, -1);
  } catch {
    return { erreur: "illisible" };
  }
  if (![f0, f1, fm1].every(Number.isFinite)) return { erreur: variable !== "x" && /x/i.test(s) ? "lettre" : "illisible" };
  const c = f0;
  const a = (f1 + fm1) / 2 - c;
  const b = (f1 - fm1) / 2;
  const p: Poly2 = [net(a), net(b), net(c)];
  for (const v of POINTS_CONTROLE) {
    const y = evaluerEn(s, variable, v);
    if (!Number.isFinite(y) || !proches(y, p[0] * v * v + p[1] * v + p[2], 1e-7)) return { erreur: "degre" };
  }
  return { poly: p };
}

const SYMBOLES: [RegExp, Relation][] = [
  [/<=|=<|≤|⩽/, "≤"],
  [/>=|=>|≥|⩾/, "≥"],
  [/</, "<"],
  [/>/, ">"],
  [/=/, "="],
];

export type LectureRelation = { gauche: Poly2; droite: Poly2; symbole: Relation } | { erreur: "illisible" | "degre" | "lettre" | "relation" };

/** « membre ◇ membre » avec exactement un symbole de relation. */
export function lireRelation(saisie: string, variable: Variable): LectureRelation {
  const s = normaliserSigneMoins(saisie);
  for (const [re, symbole] of SYMBOLES) {
    const m = re.exec(s);
    if (!m) continue;
    const gaucheTexte = s.slice(0, m.index);
    const droiteTexte = s.slice(m.index + m[0].length);
    if (SYMBOLES.some(([r]) => r.test(droiteTexte)) || gaucheTexte.trim() === "" || droiteTexte.trim() === "") return { erreur: "relation" };
    const g = lirePolynome(gaucheTexte, variable);
    if ("erreur" in g) return { erreur: g.erreur };
    const d = lirePolynome(droiteTexte, variable);
    if ("erreur" in d) return { erreur: d.erreur };
    return { gauche: g.poly, droite: d.poly, symbole };
  }
  return { erreur: "relation" };
}

function moins(p: Poly2, r: Poly2): Poly2 {
  return [net(p[0] - r[0]), net(p[1] - r[1]), net(p[2] - r[2])];
}

function nul(p: Poly2): boolean {
  return p.every((c) => Math.abs(c) < 1e-9);
}

/** p = k·r avec k ≠ 0 ? */
export function proportionnels(p: Poly2, r: Poly2): boolean {
  if (nul(p) || nul(r)) return false;
  const i = r.findIndex((c) => Math.abs(c) > 1e-9);
  const k = p[i]! / r[i]!;
  return Math.abs(k) > 1e-9 && p.every((c, j) => proches(c, k * r[j]!, 1e-7));
}

export function egauxPoly(p: Poly2, r: Poly2): boolean {
  return p.every((c, j) => proches(c, r[j]!, 1e-7));
}

/** Membre non nul d'une relation « … ◇ 0 » ou « 0 ◇ … » (symbole retourné dans le second cas) ; sinon G − D. */
export function formeRamenee(l: { gauche: Poly2; droite: Poly2; symbole: Relation }): { poly: Poly2; symbole: Relation } {
  if (nul(l.droite)) return { poly: l.gauche, symbole: l.symbole };
  if (nul(l.gauche)) {
    const inv: Record<Relation, Relation> = { "<": ">", ">": "<", "≤": "≥", "≥": "≤", "=": "=" };
    return { poly: l.droite, symbole: inv[l.symbole] };
  }
  return { poly: moins(l.gauche, l.droite), symbole: l.symbole };
}

const MESSAGE_ILLISIBLE: Record<string, string> = {
  illisible: "illisible",
  degre: "Ton expression n'est pas du second degré (ou contient une erreur d'écriture).",
  lettre: "Utilise la bonne lettre pour l'inconnue.",
  relation: "Écris une seule relation, par exemple avec « = », « < » ou « >= ».",
};

// ---------------------------------------------------------------------------------------------
// Ensembles saisis
// ---------------------------------------------------------------------------------------------

export interface SaisieEnsemble {
  forme: "vide" | "reel" | "nombres" | "intervalles" | null;
  nombres: string;
  morceaux: EtatMorceau[];
  points: string[];
}

function lireBorne(mode: string, valeur: string, infini: number): number | null {
  if (mode !== "nombre") return infini;
  return lireNombre(valeur);
}

/** `null` : saisie incomplète ou illisible. */
export function lireEnsemble(s: SaisieEnsemble): Ensemble | null {
  if (s.forme === null) return null;
  if (s.forme === "vide") return [];
  if (s.forme === "reel") return [{ g: -Infinity, gFerme: false, d: Infinity, dFerme: false }];
  if (s.forme === "nombres") {
    const l = lireListe(s.nombres);
    if (l === null || l.length === 0) return null;
    return normaliserEnsemble(l.map((v) => ({ g: v, gFerme: true, d: v, dFerme: true })));
  }
  const intervalles: Intervalle[] = [];
  for (const m of s.morceaux) {
    const g = lireBorne(m.borneGaucheMode, m.borneGaucheValeur, -Infinity);
    const d = lireBorne(m.borneDroiteMode, m.borneDroiteValeur, Infinity);
    const cg = m.borneGaucheMode === "-inf" ? "]" : m.crochetGauche;
    const cd = m.borneDroiteMode === "+inf" ? "[" : m.crochetDroit;
    if (g === null || d === null || cg === null || cd === null || g > d) return null;
    intervalles.push({ g, gFerme: cg === "[", d, dFerme: cd === "]" });
  }
  for (const p of s.points) {
    const v = lireNombre(p);
    if (v === null) return null;
    intervalles.push({ g: v, gFerme: true, d: v, dFerme: true });
  }
  return normaliserEnsemble(intervalles);
}

export function saisieEnsembleComplete(s: SaisieEnsemble): boolean {
  if (s.forme === null) return false;
  if (s.forme === "nombres") return s.nombres.trim() !== "";
  if (s.forme === "intervalles")
    return (
      s.morceaux.every(
        (m) =>
          (m.borneGaucheMode === "-inf" || (m.borneGaucheValeur.trim() !== "" && m.crochetGauche !== null)) &&
          (m.borneDroiteMode === "+inf" || (m.borneDroiteValeur.trim() !== "" && m.crochetDroit !== null)),
      ) && s.points.every((p) => p.trim() !== "")
    );
  return true;
}

/** Diagnostic d'un ensemble saisi contre l'ensemble attendu (messages automatiques). */
export function diagnostiquerEnsembleValeur(saisi: Ensemble, cible: Ensemble, pieges: { ensemble: Ensemble; message: string }[] = []): StatutChamp {
  if (ensemblesEgaux(saisi, cible)) return { etat: "correct" };
  const p = pieges.find((x) => ensemblesEgaux(saisi, x.ensemble));
  if (p) return { etat: "piege", message: p.message };
  if (ensemblesEgaux(saisi, complementaire(cible)) && cible.length > 0 && complementaire(cible).length > 0)
    return { etat: "piege", message: "C'est le complémentaire de la solution : tu as pris l'intérieur au lieu de l'extérieur des racines (ou l'inverse). Regarde le signe du coefficient de tête." };
  if (memesBornes(saisi, cible)) return { etat: "piege", message: "Les bornes sont justes ; revois les crochets (une borne est-elle incluse ou exclue ?) ou les morceaux gardés." };
  return { etat: "faux" };
}

// ---------------------------------------------------------------------------------------------
// Diagnostic d'un champ
// ---------------------------------------------------------------------------------------------

export type Saisie = string | SaisieEnsemble;

function statutLecture(erreur: string): StatutChamp {
  return erreur === "illisible" ? { etat: "parse_error" } : { etat: "faux", message: MESSAGE_ILLISIBLE[erreur] };
}

function diagNombre(saisie: string, c: ChampNombre): StatutChamp {
  const v = lireNombre(sansPrefixe(saisie).replace(new RegExp(`${c.unite ? c.unite.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&") : "\\u0000"}\\s*$`), ""));
  if (v === null) return { etat: "parse_error" };
  if (proches(v, c.cible, 1e-7)) return { etat: "correct" };
  const p = c.pieges.find((x) => proches(v, x.valeur, 1e-7));
  if (p) return { etat: "piege", message: p.message };
  return { etat: "faux", message: c.messageSiFaux };
}

function diagListe(saisie: string, c: ChampListe): StatutChamp {
  const l = lireListe(saisie);
  if (l === null) return { etat: "parse_error" };
  if (l.length === 0 && !c.videPermis && c.cibles.length > 0) return { etat: "faux", message: c.messageSiFaux };
  if (memesValeurs(l, c.cibles)) return { etat: "correct" };
  const p = c.pieges.find((x) => memesValeurs(l, x.valeurs));
  if (p) return { etat: "piege", message: p.message };
  if (c.cibles.length > 1 && l.length < c.cibles.length && l.every((v) => c.cibles.some((w) => proches(v, w))))
    return { etat: "faux", message: "Ce que tu as écrit est juste, mais il manque au moins une valeur." };
  return { etat: "faux", message: c.messageSiFaux };
}

function diagExpression(saisie0: string, c: ChampExpression): StatutChamp {
  const saisie = c.forme ? sansPrefixeFonction(saisie0) : saisie0;
  const l = lirePolynome(saisie, c.variable);
  if ("erreur" in l) return statutLecture(l.erreur);
  if (egauxPoly(l.poly, c.cible)) {
    if (!c.forme) return { etat: "correct" };
    const f = controlerForme(normaliserExpression(saisie), c.forme);
    return f.ok ? { etat: "correct" } : { etat: "forme", message: f.message };
  }
  const p = c.pieges.find((x) => egauxPoly(l.poly, x.poly));
  if (p) return { etat: "piege", message: p.message };
  return { etat: "faux", message: c.messageSiFaux };
}

function diagEquation(saisie: string, c: ChampEquation): StatutChamp {
  const l = lireRelation(saisie, c.variable);
  if ("erreur" in l) return statutLecture(l.erreur);
  if (l.symbole !== "=") return { etat: "faux", message: "On attend une équation, avec le signe « = »." };
  const r = moins(l.gauche, l.droite);
  if (proportionnels(r, c.cible)) return { etat: "correct" };
  const p = c.pieges.find((x) => proportionnels(r, x.poly));
  if (p) return { etat: "piege", message: p.message };
  return { etat: "faux", message: c.messageSiFaux };
}

function diagRelation(saisie: string, c: ChampRelation): StatutChamp {
  const l = lireRelation(saisie, c.variable);
  if ("erreur" in l) return statutLecture(l.erreur);
  if (c.sorte === "equation" && l.symbole !== "=") return { etat: "faux", message: "On attend une équation, avec le signe « = »." };
  if (c.sorte === "inequation" && l.symbole === "=") return { etat: "faux", message: "On attend une inéquation, avec « < », « > », « <= » ou « >= »." };
  const f = formeRamenee(l);
  if (Math.abs(f.poly[0]) < 1e-9) return { etat: "faux", message: "Ton (in)équation n'est pas du second degré : il faut un terme en $x^2$." };
  const ens = ensembleRelation(f.poly, f.symbole);
  if (!ensemblesEgaux(ens, c.ensemble)) {
    const miroir = c.ensemble.map((i) => ({ g: -i.d, gFerme: i.dFerme, d: -i.g, dFerme: i.gFerme }));
    if (ensemblesEgaux(ens, miroir) && !ensemblesEgaux(miroir, c.ensemble))
      return { etat: "piege", message: "Les racines de ton trinôme sont les opposées de celles qu'il faut : pour la racine $r$, le facteur est $(x-r)$." };
    const d = diagnostiquerEnsembleValeur(ens, c.ensemble);
    return { etat: d.etat === "piege" ? "piege" : "faux", message: `Ton ${c.sorte === "equation" ? "équation" : "inéquation"} n'a pas cette solution. ${d.message ?? c.messageSiFaux ?? ""}`.trim() };
  }
  if (c.coefA !== undefined && !proches(f.poly[0], c.coefA)) {
    return { etat: "faux", message: `La solution est la bonne, mais écris-la sous la forme $ax^2+bx+c\\lozenge 0$ avec $a=${c.coefA < 0 ? `-${-c.coefA}` : c.coefA}$.` };
  }
  return { etat: "correct" };
}

function diagEnsemble(saisie: SaisieEnsemble, c: ChampEnsemble): StatutChamp {
  const e = lireEnsemble(saisie);
  if (e === null) return { etat: "parse_error" };
  const d = diagnostiquerEnsembleValeur(e, c.cible, c.pieges);
  return d.etat === "faux" ? { etat: "faux", message: c.messageSiFaux } : d;
}

export function diagnostiquerChamp(saisie: Saisie, c: Champ): StatutChamp {
  if (c.type === "ensemble") return typeof saisie === "string" ? { etat: "parse_error" } : diagEnsemble(saisie, c);
  if (typeof saisie !== "string" || saisie.trim() === "") return { etat: "parse_error" };
  switch (c.type) {
    case "nombre":
      return diagNombre(saisie, c);
    case "liste":
      return diagListe(saisie, c);
    case "expression":
      return diagExpression(saisie, c);
    case "equation":
      return diagEquation(saisie, c);
    case "relation":
      return diagRelation(saisie, c);
  }
}

export function diagnostiquerChamps(saisies: Saisie[], champs: Champ[]): StatutChamp[] {
  return champs.map((c, i) => diagnostiquerChamp(saisies[i] ?? "", c));
}

import type { ExerciceComparerEncadrerLog, TermeLog } from "../core6e/comparerEncadrerLogarithmes.types";
import { logApprocheMilli, valeurDecomposition, valeurLog } from "../core6e/comparerEncadrerLogarithmesCalcul";
import type { StatutVerification } from "../moteur/statutVerification";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { evaluerValeurExponentielle } from "./expressionExponentielle";
import { estPhaseChoix } from "./typesComparerEncadrerLogarithmes";
import type { PhaseChampsComparerEncadrerLog, PhaseChoixComparerEncadrerLog, PhaseComparerEncadrerLog } from "./typesComparerEncadrerLogarithmes";

/**
 * Couche B (6e) — vérification de `6gen86`. Champs libres : un NOMBRE (entier, décimal à virgule,
 * fraction, puissance) — une saisie qui contient un logarithme ou une lettre est illisible ici
 * (`parse_error`, aucune tentative décomptée) : recopier « log2(50) » ne doit pas valider l'écran.
 * Entiers et puissances : valeur exacte ; valeurs approchées : tolérance annoncée (0,001 près pour
 * log N et log a, arrondi au centième pour le résultat). Choix fermés : l'identifiant de l'option
 * correcte (`ordre` : les indices des quatre nombres dans l'ordre croissant, « 2,0,3,1 »).
 * N'importe rien de `generateurs6e/`.
 */

/** Lit un nombre ; `null` si la saisie est illisible (syntaxe, lettre, valeur non finie). */
export function lireNombre(texte: string): number | null {
  const s = normaliserSigneMoins(texte ?? "").trim();
  if (s === "" || /[a-zA-Zπ]/.test(s)) return null;
  const v = evaluerValeurExponentielle(s);
  return v !== null && Number.isFinite(v) ? v : null;
}

const egal = (v: number | null, c: number) => v !== null && Math.abs(v - c) < 1e-9;

/** Encadrement entier d'un terme : [n, n + 1]. */
function encadrementTerme(t: TermeLog): number[] {
  return [t.plancher, t.plancher + 1];
}

/** Valeurs attendues, champ par champ (source unique : écran, récapitulatif, corrigé, barème). */
export function cibles(e: ExerciceComparerEncadrerLog, phase: PhaseChampsComparerEncadrerLog): number[] {
  switch (phase) {
    case "puissances":
      return e.variante === "encadrer" ? [Math.pow(e.a, e.k), Math.pow(e.a, e.k + 1)] : [];
    case "encadrement":
      return e.variante === "encadrer" ? [e.k, e.k + 1] : [];
    case "encadrerA":
      return e.variante === "comparer" ? encadrementTerme(e.A) : [];
    case "encadrerB":
      return e.variante === "comparer" ? encadrementTerme(e.B) : [];
    case "situer":
      return e.variante === "ranger" ? e.nombres.flatMap((n) => (n.type === "log" ? [n.terme.plancher] : [])) : [];
    case "valeurs":
      return e.variante === "changementBase" ? [e.logNMilli / 1000, e.logAMilli / 1000] : [];
    case "quotient":
      return e.variante === "changementBase" ? [e.resultatCentiemes / 100] : [];
  }
}

/** Tolérance du champ `i` de l'écran. */
function accepte(e: ExerciceComparerEncadrerLog, phase: PhaseChampsComparerEncadrerLog, i: number, v: number | null): boolean {
  if (v === null) return false;
  const c = cibles(e, phase)[i];
  if (phase === "valeurs" && e.variante === "changementBase") {
    const d = i === 0 ? e.N : e.a;
    const ln = (x: { p: number; q: number; r: number }) => x.p * Math.LN2 + x.q * Math.log(3) + x.r * Math.log(5);
    const vraie = e.mode === "log" ? ln(d) / Math.LN10 : ln(d);
    return Math.abs(v - c) <= 0.0015 || Math.abs(v - vraie) <= 0.0015;
  }
  if (phase === "quotient") return Math.abs(v - c) < 0.0051;
  return egal(v, c);
}

/** Identifiant de l'option correcte d'un écran à choix fermé. */
export function optionCorrecte(e: ExerciceComparerEncadrerLog, phase: PhaseChoixComparerEncadrerLog): string {
  switch (phase) {
    case "verdict":
      return e.variante === "comparer" ? e.verdict : "";
    case "ordre":
      return e.variante === "ranger" ? e.ordre.join(",") : "";
    case "formule":
      return "0";
  }
}

/** Statut champ par champ (`[statut]` pour un écran à choix). */
export function diagnostiquerChamps(e: ExerciceComparerEncadrerLog, phase: PhaseComparerEncadrerLog, valeurs: string[]): StatutVerification[] {
  if (estPhaseChoix(phase)) return [valeurs[0] === optionCorrecte(e, phase) ? "correct" : "not_equivalent"];
  return cibles(e, phase).map((_, i) => {
    const v = lireNombre(valeurs[i] ?? "");
    if (v === null) return "parse_error";
    return accepte(e, phase, i, v) ? "correct" : "not_equivalent";
  });
}

/** Statut global : `parse_error` prioritaire (aucune tentative décomptée), puis `not_equivalent`. */
export function diagnostiquerEcran(e: ExerciceComparerEncadrerLog, phase: PhaseComparerEncadrerLog, valeurs: string[]): StatutVerification {
  const statuts = diagnostiquerChamps(e, phase, valeurs);
  if (statuts.includes("parse_error")) return "parse_error";
  return statuts.every((s) => s === "correct") ? "correct" : "not_equivalent";
}

export function verifierEcran(e: ExerciceComparerEncadrerLog, phase: PhaseComparerEncadrerLog, valeurs: string[]): boolean {
  return diagnostiquerEcran(e, phase, valeurs) === "correct";
}

function estPuissanceDe(v: number | null, a: number): boolean {
  if (v === null || v < 1 || !Number.isInteger(v)) return false;
  let p = 1;
  while (p < v) p *= a;
  return p === v;
}

/** Message d'un encadrement entier faux d'un logarithme (comparer, ranger). */
function messageEncadrement(t: TermeLog, bas: number | null, haut: number | null): string | null {
  const n = t.plancher;
  const baseInf1 = t.base.num < t.base.den;
  if (bas !== null && haut !== null && egal(bas, n + 1) && egal(haut, n)) return "L'entier inférieur doit être le plus petit des deux.";
  if (baseInf1 && egal(bas, -n - 1)) return "La base est inférieure à 1 : ce logarithme est strictement décroissant, l'encadrement des puissances change de sens.";
  if (n < 0 && egal(bas, n + 1)) return "Attention au signe : pour un nombre négatif, l'entier inférieur est le plus négatif des deux.";
  if (haut !== null && bas !== null && !egal(haut - bas, 1)) return "Les deux entiers doivent être consécutifs.";
  return null;
}

/** Message ciblé après une réponse fausse (en plus du compteur de tentatives) — jamais la réponse. */
export function messageSpecifique(e: ExerciceComparerEncadrerLog, phase: PhaseComparerEncadrerLog, valeurs: string[]): string | null {
  const v = valeurs.map((x) => lireNombre(x ?? ""));
  switch (phase) {
    case "puissances": {
      if (e.variante !== "encadrer") return null;
      const [bas, haut] = v;
      if (egal(bas, e.k) && egal(haut, e.k + 1)) return "Tu as donné les exposants : on demande ici les puissances elles-mêmes.";
      if (bas !== null && haut !== null && bas > haut) return "La puissance inférieure doit être la plus petite des deux.";
      if (estPuissanceDe(bas, e.a) && estPuissanceDe(haut, e.a) && bas! < e.N && haut! > e.N) return "Ces puissances encadrent bien le nombre, mais elles ne sont pas consécutives.";
      if (bas !== null && !estPuissanceDe(bas, e.a)) return "La puissance inférieure doit être une puissance de " + e.a + " d'exposant entier.";
      if (haut !== null && !estPuissanceDe(haut, e.a)) return "La puissance supérieure doit être une puissance de " + e.a + " d'exposant entier.";
      return "Ces puissances n'encadrent pas le nombre.";
    }
    case "encadrement": {
      if (e.variante !== "encadrer") return null;
      if (egal(v[0], Math.pow(e.a, e.k)) && egal(v[1], Math.pow(e.a, e.k + 1))) return "Tu as recopié les puissances : le logarithme est compris entre leurs exposants.";
      return v[0] !== null && v[1] !== null && !egal(v[1] - v[0], 1) ? "Les deux entiers doivent être consécutifs." : null;
    }
    case "encadrerA":
      return e.variante === "comparer" ? messageEncadrement(e.A, v[0], v[1]) : null;
    case "encadrerB":
      return e.variante === "comparer" ? messageEncadrement(e.B, v[0], v[1]) : null;
    case "situer": {
      if (e.variante !== "ranger") return null;
      const logs = e.nombres.flatMap((n) => (n.type === "log" ? [n.terme] : []));
      for (let i = 0; i < logs.length; i++) {
        if (egal(v[i], logs[i].plancher)) continue;
        const m = messageEncadrement(logs[i], v[i], null);
        if (m) return m;
        if (egal(v[i], logs[i].plancher + 1)) return "Tu as donné l'entier supérieur : on demande l'entier n situé juste en dessous du logarithme.";
      }
      return null;
    }
    case "valeurs": {
      if (e.variante !== "changementBase") return null;
      const abs = { p: Math.abs(e.N.p), q: Math.abs(e.N.q), r: Math.abs(e.N.r) };
      const n = valeurDecomposition(e.N);
      if (n.den !== 1 && v[0] !== null && Math.abs(v[0] - logApprocheMilli(abs, e.mode) / 1000) <= 0.0015) return "Pour un quotient, les logarithmes se soustraient.";
      return null;
    }
    case "quotient": {
      if (e.variante !== "changementBase" || v[0] === null) return null;
      const LN = e.logNMilli / 1000;
      const LA = e.logAMilli / 1000;
      if (Math.abs(v[0] - LA / LN) < 0.006) return "Tu as inversé le quotient : le logarithme de l'argument va au numérateur.";
      if (Math.abs(v[0] - (LN - LA)) < 0.006) return "Le changement de base donne un quotient, pas une différence.";
      return null;
    }
    default:
      return null;
  }
}

/** Valeur d'un terme (récapitulatifs, contrôles). */
export function valeurTerme(t: TermeLog): number {
  return valeurLog(t);
}

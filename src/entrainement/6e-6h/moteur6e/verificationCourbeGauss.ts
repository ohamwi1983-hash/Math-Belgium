import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { ExerciceCG, PhaseCG, QuestionRegle } from "../core6e/courbeGauss";
import { borneBasse, borneHaute, candidates, pourcentDepuis, pourcentExact, pourcentRegle, REGLE, valeurAire } from "../core6e/courbeGauss";
import { aireL, aireMots, bonneOption, phiEcritureL, valeurPhi } from "../ui6e/formatCourbeGauss";
import { lireValeurVA } from "./lectureVariablesAleatoires";
import { piegeDesigne, statutValeur } from "./verificationLoisLotH2";
import { nL } from "../ui6e/textesLoisLotH2";

/**
 * Vérification de `6gen117`. Écrans à choix : identifiant (une tentative). k : entier. Pourcentage :
 * « 2,3 », « 2,3 % » ou « 0,023 » ; juste s'il vaut, à 0,05 point près, la valeur tirée de la règle
 * empirique (68,3 / 95,4 / 99,7 %) OU la valeur exacte (2,28 % pour un seul côté à 2σ) — l'élève qui
 * applique la règle du cours n'est jamais refusé. Messages ciblés : aire décrite, valeur numérique d'une
 * écriture fausse, écart donné au lieu de k, pourcentage « dedans » au lieu de « un seul côté »…
 */

type E = ExerciceCG;
type P = PhaseCG;
const t = tx;
const l = lx;
const OPT = { tol: 0.05 + 1e-9, pourcent: true };
const LETTRES = ["A", "B", "C", "D"];

export function messageIllisible(_e: E, p: P): string {
  return p === "k"
    ? "Valeur non reconnue : écris un entier, par exemple 2. Cette saisie ne compte pas comme une tentative."
    : "Pourcentage non reconnu : écris un nombre, par exemple 2,3 ou 2,3 %. Cette saisie ne compte pas comme une tentative.";
}

const refsPourcent = (e: E) => [pourcentRegle(e), pourcentExact(e)];

export function diagnostiquer(e: E, p: P, valeurs: string[]): StatutVerification[] {
  if (p === "aire" || p === "figure" || p === "phi") return [valeurs[0] === bonneOption(e, p) ? "correct" : "not_equivalent"];
  if (p === "k") return [statutValeur(valeurs[0] ?? "", [e.k], { tol: 1e-9 })];
  return [statutValeur(valeurs[0] ?? "", refsPourcent(e), OPT)];
}

export function approchee(): string | null {
  return null;
}

const MOTS_QUESTION: Record<QuestionRegle, string> = {
  entre: "le pourcentage dans l'intervalle",
  hors: "le pourcentage hors de l'intervalle (des deux côtés)",
  auDela: "le pourcentage d'un seul côté, au-delà d'une borne",
  enDeca: "le pourcentage d'un seul côté, au-delà d'une borne",
  moitieHaut: "la moitié du pourcentage de l'intervalle",
  moitieBas: "la moitié du pourcentage de l'intervalle",
  sous: "50 % plus la moitié du pourcentage de l'intervalle",
  dessus: "50 % plus la moitié du pourcentage de l'intervalle",
};

export function piege(e: E, p: P, valeurs: string[]): Frag[] | null {
  const v = valeurs[0] ?? "";
  if (p === "aire" || p === "figure") {
    if (v === bonneOption(e, p)) return null;
    const c = candidates(e.aire);
    const choisie = p === "aire" ? c[Number(v.slice(1))] : c[e.ordre[Number(v.slice(1))] ?? 0];
    if (!choisie) return null;
    return p === "aire"
      ? [t("L'aire colorée est "), ...aireMots(e.aire), t(" ; "), l(aireL(choisie)), t(" serait l'aire "), ...aireMots(choisie), t(".")]
      : [t(`Sur la figure ${LETTRES[Number(v.slice(1))]}, l'aire colorée est `), ...aireMots(choisie), t(" : elle représente "), l(aireL(choisie)), t(".")];
  }
  if (p === "phi") {
    if (v === bonneOption(e, p)) return null;
    return [t("Cette écriture vaut environ "), l(nL(valeurPhi(e.aire, v), 3)), t(", alors que "), l(aireL(e.aire)), t(" vaut environ "), l(nL(valeurAire(e.aire), 3)), t(" : refais le dessin, "), l(phiEcritureL(e.aire, v)), t(" ne donne pas cette aire.")];
  }
  if (p === "k") {
    const lu = lireValeurVA(v);
    if (!lu) return null;
    if (Math.abs(lu.v - e.k * e.sigma) < 1e-9) return [t("C'est l'écart entre la borne et la moyenne ; divise-le par l'écart-type "), l(nL(e.sigma)), t(".")];
    if (Math.abs(lu.v - borneBasse(e)) < 1e-9 || Math.abs(lu.v - borneHaute(e)) < 1e-9) return [t("C'est une borne de l'intervalle ; "), l("k"), t(" est le nombre d'écarts-types entre la borne et la moyenne.")];
    return null;
  }
  const pieges: { x: number; message: Frag[] }[] = [];
  for (const q of Object.keys(MOTS_QUESTION) as QuestionRegle[]) {
    if (q === e.question) continue;
    pieges.push({ x: pourcentDepuis(q, REGLE[e.k]), message: [t(`C'est ${MOTS_QUESTION[q]} ; ici, on demande ${MOTS_QUESTION[e.question]}. Dessine la cloche et colorie la zone.`)] });
  }
  for (const k of [1, 2, 3] as const) if (k !== e.k) pieges.push({ x: pourcentDepuis(e.question, REGLE[k]), message: [t("Ce pourcentage correspond à "), l(`k=${k}`), t(" : vérifie le nombre d'écarts-types.")] });
  return piegeDesigne(v, refsPourcent(e), pieges, OPT);
}

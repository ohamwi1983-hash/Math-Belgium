import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { Exercice112, Phase112 } from "../core6e/fonctionRepartition";
import { Fi, Fq, cumuls, densite, probaContinue, probaIntervalle, probaIntervalleContinue, probaQueue, valeurF } from "../core6e/fonctionRepartition";
import { raisonInvalide } from "../ui6e/formatFonctionRepartition";
import { q, val } from "../ui6e/outilsVariablesAleatoiresLotH1";
import { MESSAGE_APPROCHEE, egalNum, estApprochee, fonctionVaut, lireVA, statutExact, statutFonction } from "./lectureVariablesAleatoiresLotH1";

/**
 * Vérification de `6gen112`. Saisie LUE avant tout verdict (illisible → `parse_error`, aucune
 * tentative) ; probabilités exactes à 1e-9 (décimal ou fraction), décimal proche mais faux = valeur
 * approchée (sans tentative) ; densité comparée en cinq points de ]0 ; L[. Choix de la fonction :
 * choix fermé, une tentative, message = la raison qui disqualifie l'autre fonction. Messages ciblés :
 * F non cumulée (probabilité seule), borne incluse / exclue à tort (discret), complément de F(k) au
 * lieu de F(k − 1), F(a) au lieu de 1 − F(a), F(b) seul, F recopiée au lieu de f, f sans le facteur
 * de la dérivée.
 */

type E = Exercice112;
type P = Phase112;
const t = tx;
const l = lx;

const pointsDensite = (L: number) => [0.13, 0.31, 0.5, 0.67, 0.89].map((r) => r * L);

function attendus(e: E, p: P): number[] {
  switch (p) {
    case "repartition":
      return cumuls(e).map((c) => c / 100);
    case "intervalle":
      return [probaIntervalle(e).valeur / 100];
    case "queue":
      return [probaQueue(e).valeur / 100];
    case "proba":
      return [val(probaContinue(e))];
    case "intervalleC":
      return [val(probaIntervalleContinue(e))];
    default:
      return [];
  }
}

export function diagnostiquer112(e: E, p: P, valeurs: string[]): StatutVerification[] {
  if (p === "choix") return [valeurs[0] === String(e.numeroValide) ? "correct" : "not_equivalent"];
  if (p === "densite") return [statutFonction(valeurs[0] ?? "", densite(e.valide!, e.L!), pointsDensite(e.L!))];
  return attendus(e, p).map((a, i) => statutExact(valeurs[i] ?? "", a));
}

export function approchee112(e: E, p: P, valeurs: string[]): string | null {
  if (p === "choix" || p === "densite") return null;
  return attendus(e, p).some((x, i) => estApprochee(valeurs[i] ?? "", x)) ? MESSAGE_APPROCHEE : null;
}

export function piege112(e: E, p: P, valeurs: string[]): Frag[] | null {
  if (p === "choix") return valeurs[0] === String(e.numeroValide) ? null : raisonInvalide(e);
  if (p === "densite") {
    const L = e.L!;
    const F = (x: number) => val(Fq(e.valide!, L, q(Math.round(x * 1e6), 1e6)));
    if (fonctionVaut(valeurs[0] ?? "", F, pointsDensite(L))) return [t("C'est la fonction de répartition elle-même : la densité est sa dérivée.")];
    const f = densite(e.valide!, L);
    for (const c of [2, 3, 0.5, 1 / 3]) if (fonctionVaut(valeurs[0] ?? "", (x) => f(x) / c, pointsDensite(L))) return [t("Vérifie la dérivée : n'oublie pas l'exposant qui descend devant (dérivée de "), l("x^n"), t(" : "), l("nx^{n-1}"), t(").")];
    return null;
  }
  const v = valeurs.map((s) => lireVA(s));
  if (p === "repartition") {
    const pr = e.probas!.map((x) => x / 100);
    const nonCumule = v.every((x, i) => x !== null && egalNum(x, pr[i]!));
    if (nonCumule) return [t("Ce sont les probabilités "), l("P(X=x)"), t(" : F les cumule, "), l("F(x)=P(X\\leq x)"), t(".")];
    const att = attendus(e, p);
    const i = v.findIndex((x, k) => x !== null && !egalNum(x, att[k]!));
    if (i >= 0 && v[i] !== null && egalNum(v[i]!, pr[i]!)) return [t("Ajoute les probabilités des valeurs précédentes : F cumule.")];
    return null;
  }
  const r = v[0];
  if (r === null || r === undefined) return null;
  const att = attendus(e, p)[0]!;
  const cand: { valeur: number; message: Frag[] }[] = [];
  if (p === "intervalle") {
    const { i, j } = e.intervalle!;
    const message: Frag[] = [t("En discret, la borne compte : une valeur incluse ou exclue change la probabilité. Repère les valeurs de X qui sont vraiment dans l'intervalle.")];
    for (const [h, b] of [
      [j, i],
      [j, i - 1],
      [j - 1, i],
      [j - 1, i - 1],
    ] as const)
      cand.push({ valeur: (Fi(e, h) - Fi(e, b)) / 100, message });
  }
  if (p === "queue") {
    const { k } = e.queue!;
    cand.push({ valeur: (100 - Fi(e, k)) / 100, message: [t("« Au moins k » contient k : son contraire est « au plus la valeur juste avant k ».")] });
    cand.push({ valeur: (100 - Fi(e, k - 1)) / 100, message: [t("« Plus de k » ne contient pas k : son contraire est « au plus k ».")] });
    cand.push({ valeur: Fi(e, k) / 100, message: [t("C'est la probabilité de l'événement contraire : retire-la de 1.")] });
    cand.push({ valeur: Fi(e, k - 1) / 100, message: [t("C'est la probabilité de l'événement contraire : retire-la de 1.")] });
  }
  if (p === "proba") {
    const F = val(valeurF(e, e.proba!.a));
    cand.push({ valeur: e.proba!.type === "<=" ? 1 - F : F, message: e.proba!.type === "<=" ? [l("P(X\\leq a)=F(a)"), t(" directement : pas de complément.")] : [t("C'est "), l("P(X\\leq a)"), t(" : retire-la de 1.")] });
  }
  if (p === "intervalleC") {
    cand.push({ valeur: val(valeurF(e, e.bornes!.b)), message: [t("C'est "), l(`P(X\\leq ${e.bornes!.b})`), t(" : retire encore "), l(`F(${e.bornes!.a})`), t(".")] });
    cand.push({ valeur: val(valeurF(e, e.bornes!.a)) - val(valeurF(e, e.bornes!.b)), message: [t("Ordre inversé : "), l("F(b)-F(a)"), t(", et une probabilité n'est jamais négative.")] });
  }
  for (const c of cand) if (!egalNum(c.valeur, att) && egalNum(r, c.valeur)) return c.message;
  return null;
}

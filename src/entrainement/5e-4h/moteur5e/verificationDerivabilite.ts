import type { ExerciceDerivabilite } from "../core5e/derivabilite";
import { deriveeEnA, fa, limDroite, limGauche, limTauxDroite, limTauxGauche, POINTS_DROITE, POINTS_GAUCHE, taux, unilaterale, verdict } from "../core5e/derivabilite";
import type { StatutVerification } from "../moteur/statutVerification";
import type { Frag } from "../ui5e/ecransTrigo.types";
import { lx, tx } from "../ui5e/ecransTrigo.types";
import type { PhaseDerivabilite } from "../ui5e/formatDerivabilite";
import { lireLimite, memeLimite } from "./lectureLimitesLotG";
import { egal, lireFonctionVar, lireNombre, statut, statutNombre } from "./lectureApplicationsDerivees";

/**
 * Vérification de `5gen75`. Saisies LUES avant le verdict (illisible → `parse_error`, aucune
 * tentative) : nombres par `lireNombre`, limites par `lireLimite` (« +∞ », « inf », « −∞ » LISIBLES :
 * un infini pour une limite finie est une réponse fausse ciblée), taux en h comparé en cinq points
 * du côté demandé (h < 0 ou h > 0), tangente comparée en cinq points. Choix fermé du verdict : une
 * tentative.
 * Messages ciblés : morceau de droite utilisé pour f(a), f(a) recopié pour la limite à droite d'une
 * fonction qui saute, |h| = h pour h < 0, limite finie donnée pour un taux qui tend vers l'infini
 * (et l'inverse), signe de l'infini, « dérivable parce que continue », limite infinie prise pour un
 * nombre dérivé, saut oublié, tangente sans le « − a ».
 */

type E = ExerciceDerivabilite;
const POINTS_X = [-3.7, -1.3, 0.4, 2.1, 4.6];

function statutLimite(brut: string, cible: number): StatutVerification {
  const v = lireLimite(brut);
  return v === null ? "parse_error" : statut(memeLimite(v, cible));
}

function statutTaux(e: E, brut: string, cote: "g" | "d"): StatutVerification {
  const h = lireFonctionVar(brut, "h");
  if (!h) return "parse_error";
  const pts = cote === "g" ? POINTS_GAUCHE : POINTS_DROITE;
  return statut(pts.every((x) => egal(h(x), taux(e, x))));
}

export function diagnostiquer(e: E, p: PhaseDerivabilite, valeurs: string[]): StatutVerification[] {
  if (p === "continuite") {
    const out = [statutNombre(valeurs[0] ?? "", fa(e))];
    if (unilaterale(e)) out.push(statutLimite(valeurs[1] ?? "", limDroite(e)));
    else out.push(statutLimite(valeurs[1] ?? "", limGauche(e)), statutLimite(valeurs[2] ?? "", limDroite(e)));
    return out;
  }
  if (p === "gauche") return [statutTaux(e, valeurs[0] ?? "", "g"), statutLimite(valeurs[1] ?? "", limTauxGauche(e))];
  if (p === "droite") return [statutTaux(e, valeurs[0] ?? "", "d"), statutLimite(valeurs[1] ?? "", limTauxDroite(e))];
  if (p === "verdict") return [statut(valeurs[0] === verdict(e))];
  const h = lireFonctionVar(valeurs[0] ?? "", "x");
  if (!h) return ["parse_error"];
  const m = deriveeEnA(e);
  const q = fa(e) - m * e.a;
  return [statut(POINTS_X.every((x) => egal(h(x), m * x + q)))];
}

export function piege(e: E, p: PhaseDerivabilite, valeurs: string[]): Frag[] | null {
  const a = e.a;
  if (p === "continuite") {
    const x = lireNombre(valeurs[0] ?? "");
    if (!unilaterale(e) && x !== null && !egal(x, fa(e)) && egal(x, e.droite[2])) return [lx(`x=${a}`), tx(" vérifie « x ≤ a » : f(a) se calcule avec le morceau de GAUCHE.")];
    const ld = lireLimite(valeurs[unilaterale(e) ? 1 : 2] ?? "");
    if (ld !== null && !unilaterale(e) && limDroite(e) !== fa(e) && memeLimite(ld, fa(e))) return [tx("À droite de "), lx(`${a}`), tx(", f(x) est donnée par le second morceau : remplace x par "), lx(`${a}`), tx(" dans CE morceau.")];
    return null;
  }
  if (p === "gauche" || p === "droite") {
    const cote = p === "gauche" ? "g" : "d";
    const cible = cote === "g" ? limTauxGauche(e) : limTauxDroite(e);
    const lim = lireLimite(valeurs[1] ?? "");
    const hf = lireFonctionVar(valeurs[0] ?? "", "h");
    if (e.variante === "absolue" && hf) {
      const pts = cote === "g" ? POINTS_GAUCHE : POINTS_DROITE;
      const faux = cote === "g" ? e.droite[1] : e.gauche[1];
      if (pts.every((x) => egal(hf(x), faux + e.gauche[0] * x))) return [tx(cote === "g" ? "Pour h < 0, " : "Pour h > 0, "), lx(cote === "g" ? "|h|=-h" : "|h|=h"), tx(" : le signe de h change la valeur absolue.")];
    }
    if (lim !== null && Number.isFinite(lim) && !Number.isFinite(cible)) return [tx("Le taux contient un terme en "), lx(e.variante === "racine" ? "\\dfrac{1}{\\sqrt{h}}" : "\\dfrac{1}{h}"), tx(" : quand h tend vers 0, il devient infiniment grand, la limite est infinie.")];
    if (lim !== null && !Number.isFinite(lim) && Number.isFinite(cible)) return [tx("Le taux simplifié n'a plus de h au dénominateur : sa limite est un nombre.")];
    if (lim !== null && !Number.isFinite(lim) && !Number.isFinite(cible) && lim === -cible) return [tx(cote === "g" ? "Signe : h est négatif à gauche." : "Signe : regarde le signe du numérateur, h est positif.")];
    if (cote === "d" && hf && verdict(e) === "discontinue" && POINTS_DROITE.every((x) => egal(hf(x), e.droite[0] * x + e.droite[1]))) return [tx("f(a) vient du morceau de gauche : en retranchant f(a), le saut de f en a reste au numérateur.")];
    return null;
  }
  if (p === "verdict") {
    const choix = valeurs[0];
    const v = verdict(e);
    if (choix === "derivable" && v === "anguleux") return [tx("f est continue en a, mais cela ne suffit pas : les nombres dérivés à gauche et à droite sont différents, il n'y a pas UNE tangente.")];
    if (choix === "derivable" && v === "verticale") return [tx("Une limite infinie n'est pas un nombre dérivé : le taux tend vers l'infini, la tangente est verticale.")];
    if (choix === "derivable" && v === "discontinue") return [tx("f fait un saut en a : elle n'est pas continue, donc pas dérivable (dérivable ⟹ continue).")];
    if (choix === "discontinue") return [tx("Les limites à gauche et à droite valent f(a) : f est continue en a.")];
    if (choix === "verticale") return [tx(v === "discontinue" ? "Un taux qui tend vers l'infini parce que f saute en a : c'est d'abord une discontinuité." : "Les deux nombres dérivés sont finis : la tangente n'est pas verticale.")];
    if (choix === "anguleux") return [tx(v === "derivable" ? "Les deux nombres dérivés sont égaux : f est dérivable en a." : v === "discontinue" ? "f n'est même pas continue en a." : "La limite du taux est infinie : ce n'est pas un point anguleux (deux pentes finies différentes).")];
    return null;
  }
  const h = lireFonctionVar(valeurs[0] ?? "", "x");
  if (!h) return null;
  const m = deriveeEnA(e);
  if (POINTS_X.every((x) => egal(h(x), m * x + fa(e))) && a !== 0) return [tx("Il manque le « − a » : la tangente est "), lx("y=f'(a)\\,(x-a)+f(a)"), tx(".")];
  return null;
}

/** Explication d'un verdict faux (affichée avec la réponse). */
export function explicationChoix(e: E): string {
  const v = verdict(e);
  if (v === "derivable") return "Les nombres dérivés à gauche et à droite sont finis et égaux.";
  if (v === "anguleux") return "f est continue, mais les nombres dérivés à gauche et à droite sont finis et différents.";
  if (v === "verticale") return "Le taux d'accroissement tend vers l'infini : pas de nombre dérivé, la tangente est verticale.";
  return "Les limites de f à gauche et à droite de a ne sont pas égales : f n'est pas continue en a.";
}

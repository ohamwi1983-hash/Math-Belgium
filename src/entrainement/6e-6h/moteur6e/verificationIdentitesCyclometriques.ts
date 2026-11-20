import type { ExerciceIdentites } from "../core6e/identitesCyclometriques.types";
import type { StatutVerification } from "../moteur/statutVerification";
import type { Frag } from "../ui6e/ecransExp.types";
import { lx, tx } from "../ui6e/ecransExp.types";
import { bonneOption } from "../ui6e/formatIdentitesCyclometriques";
import type { PhaseIdentites } from "../ui6e/formatIdentitesCyclometriques";
import { arcDe, dansImage, exterieure, fonctionAttendue, k12De, phiV, pointsControle, valeurTrigArc } from "./modeleIdentitesCyclometriques";
import { egal, estApprochee, lireFonction, lireNombre, memesFonctions } from "./lectureValeurExp";
import { radV } from "../ui6e/nombresRecip";

/**
 * Vérification de `6gen153` : choix fermés comparés à leur identifiant ; valeur exacte comparée
 * NUMÉRIQUEMENT (toute écriture juste acceptée : π, √, fractions, « − ») ; expression en x comparée
 * en cinq points du domaine. Une saisie qui recopie une fonction trigonométrique ou une arcfonction,
 * ou une valeur décimale approchée, est arrêtée par un message SANS tentative consommée.
 */

type E = ExerciceIdentites;
const t = tx;
const l = lx;

/** Valeur attendue de l'écran 2 (nombre). */
export function valeurAttendue(e: E): number {
  if (e.variante === "arcTrig") return phiV(e);
  if (e.variante === "trigArc") return radV(valeurTrigArc(e));
  return NaN;
}

const FONCTION = /(sin|cos|tan|arc|asin|acos|atan)/i;

export function diagnostiquer(e: E, phase: PhaseIdentites, valeurs: string[]): StatutVerification[] {
  if (phase === "verdict") return [valeurs[0] === bonneOption(e) ? "correct" : "not_equivalent"];
  const s = valeurs[0] ?? "";
  if (e.variante === "litteral") {
    const f = lireFonction(s, "x");
    if (!f) return ["parse_error"];
    return [memesFonctions(f, fonctionAttendue(e), pointsControle(e)) ? "correct" : "not_equivalent"];
  }
  const v = lireNombre(s);
  if (v === null) return ["parse_error"];
  return [egal(v, valeurAttendue(e)) ? "correct" : "not_equivalent"];
}

export function approchee(e: E, phase: PhaseIdentites, valeurs: string[]): string | null {
  if (phase !== "valeur") return null;
  const s = valeurs[0] ?? "";
  if (FONCTION.test(s.replace(/sqrt/gi, ""))) return "Ta réponse contient encore sin, cos, tan ou une arcfonction : simplifie-la jusqu'au bout. Cela ne compte pas comme une tentative.";
  if (e.variante !== "litteral" && estApprochee(s, valeurAttendue(e)))
    return "Ta valeur est une valeur approchée : on demande la valeur exacte (fraction, racine, π). Cela ne compte pas comme une tentative.";
  return null;
}

export function piege(e: E, phase: PhaseIdentites, valeurs: string[]): Frag[] | null {
  const s = valeurs[0] ?? "";
  if (phase === "verdict") {
    if (e.variante === "arcTrig") return [t("Compare "), l("\\theta"), t(" aux deux bornes écrites au même dénominateur : une seule borne dépassée suffit pour sortir de l'image.")];
    if (e.variante === "trigArc") {
      const g = exterieure(e.couple);
      const f = arcDe(e.couple);
      if ((g === "cos" && f !== "cos") || (g === "sin" && f === "cos"))
        return [t(`Le ${g === "cos" ? "cosinus" : "sinus"} d'un angle de l'image de arc${f} ne dépend pas du signe de `), l("a"), t(" : regarde où se trouve l'angle.")];
      return [t("Situe d'abord l'angle "), l("\\alpha"), t(" dans l'image, puis lis le signe sur le cercle.")];
    }
    return [t("Le domaine vient de l'arcfonction (argument entre −1 et 1, sauf arctan) et, pour une tangente, du dénominateur non nul.")];
  }
  if (e.variante === "litteral") {
    const f = lireFonction(s, "x");
    if (!f) return null;
    const k = e.k;
    const att = fonctionAttendue(e);
    const pts = pointsControle(e);
    if (memesFonctions(f, (x) => -att(x), pts)) return [t("Le signe est fixé par l'image de l'arcfonction : la racine est positive.")];
    const g = exterieure(e.couple);
    const fa = arcDe(e.couple);
    if (fa !== "tan" && g !== "tan" && memesFonctions(f, (x) => Math.sqrt(1 - k * x * x), pts.map((x) => x / 2)))
      return [t("Le carré porte sur tout l'argument : "), l(`(${k}x)^{2}=${k * k}x^{2}`), t(".")];
    if (fa !== "tan" && g !== "tan" && memesFonctions(f, (x) => 1 - k * k * x * x, pts)) return [t("Tu as écrit le carré du résultat : il reste à prendre la racine.")];
    return null;
  }
  const v = lireNombre(s);
  if (v === null) return null;
  const att = valeurAttendue(e);
  if (e.variante === "arcTrig") {
    const th = (e.n * Math.PI) / e.d;
    if (!dansImage(e.fn, k12De(e)) && egal(v, th)) return [l("\\theta"), t(" n'est pas dans l'image : la composée ne le redonne pas. Cherche l'angle de l'image qui a la même valeur.")];
    const F = e.fn === "sin" ? Math.sin : e.fn === "cos" ? Math.cos : Math.tan;
    if (egal(F(v), F(th), 1e-7)) return [t("Cet angle a bien la même valeur trigonométrique, mais il n'est pas dans l'image de l'arcfonction.")];
    return null;
  }
  if (egal(v, -att)) return [t("Le signe est fixé par la position de l'angle dans l'image (étape 1).")];
  if (egal(v, att * att) || egal(v, -att * att)) return [t("Tu as trouvé le carré : il reste à prendre la racine.")];
  if (egal(v, e.a.n / e.a.d)) return [t("C'est la valeur de "), l(`\\${arcDe(e.couple)}\\alpha`), t(", pas celle de "), l(`\\${exterieure(e.couple)}\\alpha`), t(".")];
  return null;
}

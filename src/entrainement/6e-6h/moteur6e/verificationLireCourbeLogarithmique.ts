import type { ExerciceLireCourbeLogarithmique } from "../core6e/lireCourbeLogarithmique.types";
import type { EnsembleReelGuide } from "../core6e/ensembleReel.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { separerEquationTexte } from "./equivalenceExponentielle";
import { evaluerExpressionExponentielle } from "./expressionExponentielle";
import { verifierEnsembleReelGuide } from "./verificationEnsembleReel";
import type { PhaseLireCourbeLogarithmique, ReponseLireCourbeLog } from "./typesLireCourbeLogarithmique";
import { estPhaseChoix, indiceCourbe } from "./typesLireCourbeLogarithmique";

/**
 * Couche B (6e) — vérification de `6gen85`, statut à 3 valeurs (`correct` / `not_equivalent` /
 * `parse_error`). N'importe jamais rien de `generateurs6e/`. Les paramètres sont relus directement
 * dans l'exercice (base num/den, c, d).
 *
 * - **Asymptote** : « x = c », « c = x », « x − c = 0 »… (toute équation en x dont c est la SEULE
 *   solution), ou le nombre c seul.
 * - **Domaine** : ensemble construit (`EnsembleReelGuideBuilder`) égal à ]c ; +∞[.
 * - **Base** : valeur exacte (1/2, 0,5, 2^(−1)…), préfixe « a = » toléré.
 * - **Expression** : équivalente à log_a(x − c) + d sur le domaine (échantillonnage) ; préfixe
 *   « f(x) = » ou « y = » toléré ; log2(…), log(…) (base 10), ln(…)/ln(1/2)… acceptés.
 * - **Associer** : indice de l'expression choisie.
 */

const TOLERANCE = 1e-6;
const DECALAGES_X = [0.3, 0.9, 1.7, 2.6, 4.1, 7.3];

function evaluer(texte: string, variables: Record<string, number>): number | "parse_error" {
  try {
    return evaluerExpressionExponentielle(normaliserSigneMoins(texte), variables);
  } catch {
    return "parse_error";
  }
}

function proche(a: number, b: number): boolean {
  return Number.isFinite(a) && Math.abs(a - b) < TOLERANCE * Math.max(1, Math.abs(b));
}

export function diagnostiquerAsymptote(c: number, texte: string): StatutVerification {
  const t = normaliserSigneMoins(texte).trim();
  if (t === "") return "parse_error";
  if (!t.includes("=")) {
    const v = evaluer(t, {});
    if (v === "parse_error") return "parse_error";
    return proche(v, c) ? "correct" : "not_equivalent";
  }
  const separe = separerEquationTexte(t);
  if (separe === null || separe.gauche.trim() === "" || separe.droite.trim() === "") return "parse_error";
  if (separe.symbole !== "=") return "not_equivalent";
  if (/y/i.test(t)) return "not_equivalent";
  const residu = (x: number): number | "parse_error" => {
    const g = evaluer(separe.gauche, { x });
    const d = evaluer(separe.droite, { x });
    if (g === "parse_error" || d === "parse_error") return "parse_error";
    return g - d;
  };
  const enC = residu(c);
  if (enC === "parse_error") return "parse_error";
  if (!Number.isFinite(enC) || Math.abs(enC) > 1e-6) return "not_equivalent";
  for (const ailleurs of [c + 1, c - 1.7, c + 2.9, -c]) {
    if (Math.abs(ailleurs - c) < 1e-9) continue;
    const r = residu(ailleurs);
    if (r === "parse_error") return "parse_error";
    if (!Number.isFinite(r) || Math.abs(r) < 1e-3) return "not_equivalent";
  }
  return "correct";
}

export function verifierDomaine(c: number, ensemble: EnsembleReelGuide): boolean {
  return verifierEnsembleReelGuide(ensemble, { forme: "intervalles", points: [], morceaux: [{ inf: c, sup: null, infInclus: false, supInclus: false }] });
}

export function diagnostiquerBase(valeur: number, texte: string): StatutVerification {
  const t = normaliserSigneMoins(texte).trim().replace(/^a\s*=/i, "");
  if (t.trim() === "" || t.includes("=")) return "parse_error";
  const v = evaluer(t, {});
  if (v === "parse_error") return "parse_error";
  return proche(v, valeur) ? "correct" : "not_equivalent";
}

export function diagnostiquerExpression(attendue: (x: number) => number, c: number, texte: string): StatutVerification {
  const t = normaliserSigneMoins(texte).trim().replace(/^(f\s*\(\s*x\s*\)|y)\s*=/i, "");
  if (t.trim() === "" || t.includes("=")) return "parse_error";
  for (const dx of DECALAGES_X) {
    const x = c + dx;
    const v = evaluer(t, { x });
    if (v === "parse_error") return "parse_error";
    if (!proche(v, attendue(x))) return "not_equivalent";
  }
  return "correct";
}

/** Diagnostic d'un écran, quel qu'il soit. */
export function diagnostiquerEcran(e: ExerciceLireCourbeLogarithmique, phase: PhaseLireCourbeLogarithmique, reponse: ReponseLireCourbeLog): StatutVerification {
  if (estPhaseChoix(phase)) {
    if (e.variante !== "associer" || reponse.type !== "choix") return "parse_error";
    return reponse.indice === e.expressionDeCourbe[indiceCourbe(phase)] ? "correct" : "not_equivalent";
  }
  if (e.variante !== "lecture") return "parse_error";
  const { base, c, d } = e.courbe;
  if (phase === "domaine") {
    if (reponse.type !== "ensemble") return "parse_error";
    return verifierDomaine(c, reponse.ensemble) ? "correct" : "not_equivalent";
  }
  if (reponse.type !== "texte") return "parse_error";
  if (phase === "asymptote") return diagnostiquerAsymptote(c, reponse.texte);
  if (phase === "base") return diagnostiquerBase(base.num / base.den, reponse.texte);
  return diagnostiquerExpression((x) => Math.log(x - c) / Math.log(base.num / base.den) + d, c, reponse.texte);
}

export function verifierEcran(e: ExerciceLireCourbeLogarithmique, phase: PhaseLireCourbeLogarithmique, reponse: ReponseLireCourbeLog): boolean {
  return diagnostiquerEcran(e, phase, reponse) === "correct";
}

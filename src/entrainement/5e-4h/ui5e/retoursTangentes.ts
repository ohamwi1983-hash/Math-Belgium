/**
 * 5gen28 (tangentes) — lot B, règles communes : aides à deux niveaux (niveau 1 = la méthode du
 * cours, `texteAideNiveau1` ; niveau 2 = posée pour CETTE fonction, jamais la réponse — les anciens
 * « Exemple : f(x) = x² + 1… » et leurs « ; ⇒ ; » (G8) disparaissent) et messages ciblés (f(a) et
 * f′(a) intervertis, p = f(a), ordonnée calculée avec f′, f′(x) = 0 résolue au lieu de f′(x) = m, P
 * pris pour un point de contact, Δ < 0…). Le refus sans tentative est dans le moteur
 * (`refusSaisieTangente`).
 */
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { ExerciceTangente } from "../core5e/tangentes.types";
import type { EcranTangente } from "../moteur5e/typesTangentes";
import { deriveeF, valeurF } from "../moteur5e/verificationTangentesLotC";
import type { ReponseTangente } from "../moteur5e/verificationTangentesLotC";
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import { coeffsTangente } from "../generateurs5e/tangentes/index";
import type { AideTrig } from "./aidesTrigonometrie";
import { conditionContactLatex, formatFDeXLatex, formatFPrimeDeXLatex, formatReponseAttenduePhaseLatex, texteAideNiveau1 } from "./formatTangentes";
import { aideDepuis, l, t } from "./retoursDerivees";

const par = (n: number) => (n < 0 ? `(${n})` : `${n}`);

/** Polynôme en la variable v (coefficients ascendants), réduit. */
function poly(c: number[], v: string): string {
  let out = "";
  for (let d = c.length - 1; d >= 0; d--) {
    const k = c[d];
    if (k === 0) continue;
    const abs = Math.abs(k);
    const signe = k < 0 ? "-" : out === "" ? "" : "+";
    out += `${signe}${abs === 1 && d > 0 ? "" : abs}${d === 0 ? "" : d === 1 ? v : `${v}^{${d}}`}`;
  }
  return out === "" ? "0" : out;
}

/** Polynôme où x est remplacé par un nombre, NON calculé (« 2\cdot(-1)^{3}-3\cdot(-1)+1 »). */
function substitue(c: number[], a: number): string {
  let out = "";
  for (let d = c.length - 1; d >= 0; d--) {
    const k = c[d];
    if (k === 0) continue;
    const abs = Math.abs(k);
    const signe = k < 0 ? "-" : out === "" ? "" : "+";
    const puissance = d === 0 ? "" : d === 1 ? par(a) : `${par(a)}^{${d}}`;
    out += d === 0 ? `${signe}${abs}` : `${signe}${abs === 1 ? "" : `${abs}\\cdot `}${puissance}`;
  }
  return out === "" ? "0" : out;
}

const derive = (c: number[]) => c.slice(1).map((v, i) => (i + 1) * v);

function niveau2(e: ExerciceTangente, ecran: EcranTangente): AideTrig {
  const c = coeffsTangente(e);
  switch (ecran) {
    case "deriver":
      if (c) return { texte: [t("Ici, dérive chaque terme de f(x) séparément, puis additionne :")], formules: [`f'(x)=${c.map((k, d) => (k === 0 ? "" : `\\left(${poly(Array.from({ length: d + 1 }, (_, i) => (i === d ? k : 0)), "x")}\\right)'`)).filter(Boolean).reverse().join("+")}`] };
      if (e.variante === "pointDonne" && e.sousFamille === "radicale") return { texte: [t("Ici, u est l'expression sous la racine :")], formules: [`u(x)=${poly([e.p, e.m], "x")}\\qquad u'(x)=${e.m}`] };
      break;
    case "substituer":
      if (e.variante === "pointDonne") {
        if (c) return { texte: [t("Ici, remplace x par "), l(par(e.a)), t(" dans f(x), puis dans f′(x) :")], formules: [`f(${e.a})=${substitue(c, e.a)}\\qquad f'(${e.a})=${substitue(derive(c), e.a)}`] };
        if (e.sousFamille === "radicale") return { texte: [t("Ici, remplace x par "), l(par(e.a)), t(" sous la racine ; simplifie la racine si possible :")], formules: [`f(${e.a})=${e.coeff}\\sqrt{${e.m}\\cdot ${par(e.a)}+${par(e.p)}}`] };
      }
      break;
    case "tangente":
      if (e.variante === "pointDonne") return { texte: [t("Ici, la tangente passe par le point de contact et a pour pente f′("), l(`${e.a}`), t(") — remplace par les valeurs de l'étape précédente, puis distribue :")], formules: [`y=f(${e.a})+f'(${e.a})\\,(x-${par(e.a)})`] };
      break;
    case "resoudre":
      if (e.variante === "horizontale") {
        const k = 3 * e.a;
        return { texte: [t("Ici, divise les deux membres par "), l(`${k}`), t(", puis étudie le trinôme obtenu (factorisation, ou discriminant) :")], formules: [`${poly([e.c, 2 * e.b, 3 * e.a], "x")}=0\\iff ${poly([e.c / k, (2 * e.b) / k, 1], "x")}=0`] };
      }
      break;
    case "resoudrePente":
      if (e.variante === "pente" && c) return { texte: [t("Ici, f′(x) = "), l(`${e.m}`), t(" : passe tout dans le premier membre :")], formules: [`${poly(derive(c), "x")}=${e.m}\\iff ${poly(derive(c).map((v, i) => (i === 0 ? v - e.m : v)), "x")}=0`] };
      break;
    case "coordonnees": {
      const xs = e.variante === "horizontale" || e.variante === "pente" ? e.racines : [];
      return { texte: [t("Ici, l'ordonnée de chaque point se calcule avec f (pas avec f′) :")], formules: [xs.map((r) => `f(${r})`).join("\\qquad ")] };
    }
    case "tangentesPente":
      if (e.variante === "pente") return { texte: [t("Ici, chaque tangente a la pente "), l(`${e.m}`), t(" et passe par son point de contact :")], formules: [e.racines.map((r) => `y=f(${r})+${par(e.m)}\\,(x-${par(r)})`).join("\\qquad ")] };
      break;
    case "condition":
      if (e.variante === "pointExterieur" && c) return { texte: [t("Ici, exprime f(t) et f′(t), puis écris que P vérifie l'équation de la tangente :")], formules: [`f(t)=${poly(c, "t")}\\qquad f'(t)=${poly(derive(c), "t")}`] };
      break;
    case "abscissesContact":
      if (e.variante === "pointExterieur") return { texte: [t("Ici, l'équation développée et réduite (divisée par le coefficient de t²) est :")], formules: [conditionContactLatex(e)] };
      break;
    case "tangentesContact":
      if (e.variante === "pointExterieur") return { texte: [t("Ici, une tangente par abscisse de contact t trouvée :")], formules: [e.contacts.map((u) => `y=f(${u})+f'(${u})\\,(x-${par(u)})`).join("\\qquad ")] };
      break;
    case "tangenteEnP":
      if (e.variante === "doubleTangence") return { texte: [t("Ici, dérive chaque terme, puis remplace x par "), l(par(e.p)), t(" dans f et dans f′ :")], formules: [`f'(${e.p})=${substitue(derive(e.coeffs), e.p)}`] };
      break;
    case "trouverQ":
      if (e.variante === "doubleTangence") {
        const tq = formatReponseAttenduePhaseLatex(e, "tangenteEnP")[1].replace(/^y=/, "");
        return { texte: [t("Ici, soustrais la tangente et divise par "), l(e.p === 0 ? "x^2" : `(x-${par(e.p)})^2`), t(" :")], formules: [`f(x)-\\left(${tq}\\right)=${e.p === 0 ? "x^2" : `(x-${par(e.p)})^2`}\\cdot Q(x)`] };
      }
      break;
    case "verifierPente":
      if (e.variante === "doubleTangence") return { texte: [t("Ici, remplace x par "), l(par(e.q)), t(" dans f′(x) :")], formules: [`f'(${e.q})=${substitue(derive(e.coeffs), e.q)}`] };
      break;
  }
  return { texte: [t("Ici, reprends les données :")], formules: [formatFDeXLatex(e)] };
}

export function aidesTangente(e: ExerciceTangente, ecran: EcranTangente): AideTrig[] {
  const n1 = texteAideNiveau1(ecran, e);
  return [aideDepuis(n1.texte, n1.latex), niveau2(e, ecran)];
}

function lire(s: string): number | null {
  try {
    const v = evaluerExpressionGenerale(s.replace(/[−–—]/g, "-").replace(/^[^=]*=/, ""), 0);
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

function enX(s: string, x: number): number | null {
  try {
    const v = evaluerExpressionGenerale(s.replace(/[−–—]/g, "-").replace(/^[^=≡]*[=≡]/, ""), x);
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

const egal = (v: number | null, c: number) => v !== null && Math.abs(v - c) <= 1e-6 * Math.max(1, Math.abs(c));
const estDroite = (s: string, m: number, p: number) => [0, 1, 2, -1].every((x) => egal(enX(s, x), m * x + p));

/** Message ciblé sur l'erreur trahie par la réponse fausse (null : message générique). */
export function cibleTangente(e: ExerciceTangente, ecran: EcranTangente, r: ReponseTangente): FragmentConsigne[] | null {
  const v = r.valeurs;
  switch (ecran) {
    case "deriver": {
      if (e.variante === "pointDonne" && e.sousFamille === "radicale" && e.m !== 1) {
        if ([0.5, 1.5, 2.5].every((x) => e.m * x + e.p <= 0 || egal(enX(v[0], x), deriveeF(e, x) / e.m))) return [t("Il manque le facteur u′ = "), l(`${e.m}`), t(" de la règle de la chaîne : "), l("(\\sqrt{u})'=\\frac{u'}{2\\sqrt{u}}"), t(".")];
      }
      const c = coeffsTangente(e);
      if (c && c[0] !== 0 && [0.5, 1.5, -1.2].every((x) => egal(enX(v[0], x), deriveeF(e, x) + c[0]))) return [t("Le terme constant "), l(`${c[0]}`), t(" a pour dérivée 0 : il disparaît.")];
      return null;
    }
    case "substituer": {
      if (e.variante !== "pointDonne") return null;
      const fa = valeurF(e, e.a);
      const fpa = deriveeF(e, e.a);
      if (egal(lire(v[0]), fpa) && egal(lire(v[1]), fa)) return [t("Les deux valeurs sont interverties : f("), l(`${e.a}`), t(") se calcule avec f, f′("), l(`${e.a}`), t(") avec f′.")];
      if (e.a < 0 && (egal(lire(v[0]), valeurF(e, -e.a)) || egal(lire(v[1]), deriveeF(e, -e.a)))) return [t("Remplace x par "), l(`(${e.a})`), t(" entre parenthèses : le signe compte.")];
      return null;
    }
    case "tangente":
    case "tangentesPente":
    case "tangentesContact": {
      const xs = e.variante === "pointDonne" ? [e.a] : e.variante === "pente" ? e.racines : e.variante === "pointExterieur" ? e.contacts : [];
      for (const s of v) {
        for (const x0 of xs) {
          const m = deriveeF(e, x0);
          const fa = valeurF(e, x0);
          if (estDroite(s, m, fa - m * x0)) continue;
          if (x0 !== 0 && estDroite(s, m, fa)) return [t("L'ordonnée à l'origine n'est pas f("), l(`${x0}`), t(") : la tangente passe par ("), l(`${x0}\\,;\\,${fa}`), t("), donc "), l(`p=f(${x0})-f'(${x0})\\cdot ${par(x0)}`), t(".")];
          if (estDroite(s, fa, m - fa * x0) || estDroite(s, fa, m)) return [t("Pente et ordonnée interverties : la pente est f′("), l(`${x0}`), t("), pas f("), l(`${x0}`), t(").")];
        }
        if (e.variante === "pointExterieur") {
          const m = deriveeF(e, e.xP);
          if (estDroite(s, m, e.yP - m * e.xP)) return [t("P n'est pas sur la courbe : f′("), l(`${e.xP}`), t(") n'est la pente d'aucune tangente passant par P. Utilise les abscisses de contact t.")];
        }
      }
      return null;
    }
    case "resoudre":
      if (e.variante === "horizontale" && e.racines.length === 0 && !r.aucune) return [t("Vérifie le discriminant du trinôme : s'il est négatif, f′(x) = 0 n'a aucune solution — aucune tangente horizontale.")];
      if (e.variante === "horizontale" && e.racines.length > 0 && r.aucune) return [t("Recalcule le discriminant : l'équation f′(x) = 0 a bien au moins une solution.")];
      return null;
    case "resoudrePente": {
      if (e.variante !== "pente") return null;
      const nums = v.map(lire);
      const c = coeffsTangente(e) as number[];
      const dp = derive(c);
      if (nums.length > 0 && nums.every((x) => x !== null && Math.abs(dp.reduce((s, k, i) => s + k * x ** i, 0)) < 1e-9)) return [t("Tu as résolu f′(x) = 0 : la pente demandée est "), l(`${e.m}`), t(", donc résous f′(x) = "), l(`${e.m}`), t(".")];
      return null;
    }
    case "coordonnees": {
      const xs = e.variante === "horizontale" || e.variante === "pente" ? e.racines : [];
      const ys = v.filter((_, i) => i % 2 === 1).map(lire);
      if (ys.length > 0 && ys.every((y, i) => xs[i] !== undefined && egal(y, deriveeF(e, xs[i])))) return [t("L'ordonnée d'un point de la courbe se calcule avec f(x), pas avec f′(x) (qui donne la pente).")];
      return null;
    }
    case "abscissesContact":
      if (e.variante === "pointExterieur" && v.some((s) => egal(lire(s), e.xP))) return [t("L'abscisse de P n'est pas une abscisse de contact : P n'est pas sur la courbe.")];
      return null;
    case "condition":
      return null;
    default:
      return null;
  }
}

export { formatFPrimeDeXLatex };

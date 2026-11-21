/**
 * 5gen24 (étude complète) — lots B–D, règles communes : aides à deux niveaux (niveau 1 = la
 * propriété du cours, inchangée ; niveau 2 = posée pour CETTE fonction — les anciens « exemples
 * avec une autre fonction » sont remplacés —, jamais la réponse), saisies refusées sans tentative
 * (illisible, approchée) partagées avec le moteur, et messages ciblés sur les erreurs du cours.
 */
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { ExerciceEtudeComplete, ExerciceEtudeCompletePipeline } from "../core5e/etudeComplete.types";
import type { PhaseEtudeComplete } from "../moteur5e/typesEtudeComplete";
import { lireLimite } from "../moteur5e/saisieLimites";
import type { AideTrig } from "./aidesTrigonometrie";
import { formatDenominateurLatex, formatNumerateurLatex, formatPenteOrdonnee, texteAideNiveau1 } from "./formatEtudeComplete";
import { fragmentsRiches } from "./retoursLimites";

export { refusSaisieEtude } from "../moteur5e/saisieEtudeComplete";

const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

function dominant(coeffs: number[]): string {
  let d = coeffs.length - 1;
  while (d > 0 && coeffs[d] === 0) d--;
  const c = coeffs[d];
  const v = d === 0 ? "" : d === 1 ? "x" : `x^{${d}}`;
  if (d === 0) return `${c}`;
  return `${c === 1 ? "" : c === -1 ? "-" : c}${v}`;
}

export function aidesEtude(e: ExerciceEtudeComplete, phase: PhaseEtudeComplete): AideTrig[] {
  const n1: AideTrig = { texte: fragmentsRiches(texteAideNiveau1(e, phase)) };
  if (e.mode === "constructionInverse") {
    const r = e.proprietes.racineDenominateur;
    const x = r === 0 ? "x" : `x${r > 0 ? "-" : "+"}${Math.abs(r)}`;
    return [n1, { texte: [t("Ici, une fraction de dénominateur "), l(x), t(" tend vers l'infini en "), l(`x=${r}`), t(" et vers 0 en "), l("\\pm\\infty"), t(" :")], formules: [`\\lim_{x\\to\\pm\\infty}\\dfrac{1}{${x}}=0`] }];
  }
  const N = formatNumerateurLatex(e);
  const D = formatDenominateurLatex(e);
  const pos = e.exclusions.map((x) => x.position);
  const pv = e.exclusions.find((x) => x.type === "pointVide");
  let n2: AideTrig;
  switch (phase) {
    case "domaine":
      n2 = { texte: [t("Ici, résous l'équation « dénominateur = 0 » (facteurs, identité remarquable ou Δ) :")], formules: [`${D}=0`] };
      break;
    case "typeLimite":
      n2 = { texte: [t("Ici, calcule le numérateur "), l(`N(x)=${N}`), t(" en chaque valeur exclue :")], formules: [pos.map((p) => `N(${p})`).join("\\qquad ")] };
      break;
    case "pointVideSimplification":
      n2 = { texte: [t("Ici, "), l(`(x${pv && pv.position < 0 ? "+" : "-"}${Math.abs(pv?.position ?? 0)})`), t(" est un facteur commun du numérateur et du dénominateur : factorise chacun, puis simplifie.")] };
      break;
    case "pointVideLimite":
      n2 = { texte: [t("Ici, remplace x par "), l(`${pv?.position ?? 0}`), t(" dans la forme simplifiée de l'étape précédente (elle n'est plus de la forme "), l("\\frac{0}{0}"), t(") :")], formules: [`\\lim_{x\\to ${pv?.position ?? 0}}f(x)=\\dfrac{N_1(${pv?.position ?? 0})}{D_1(${pv?.position ?? 0})}`] };
      break;
    case "limitesGD1":
    case "limitesGD2": {
      const r = (phase === "limitesGD1" ? e.exclusions[0] : e.exclusions[1]).position;
      n2 = { texte: [t("Ici, évalue le numérateur en "), l(`x=${r}`), t(", puis le signe de chaque facteur du dénominateur juste avant et juste après "), l(`${r}`), t(" (un facteur au carré reste positif) :")], formules: [`x\\to ${r}^{-}\\qquad x\\to ${r}^{+}`] };
      break;
    }
    case "av":
      n2 = { texte: [t("Ici, reprends l'étape 2 : seules les valeurs exclues de forme "), l("\\frac{k}{0}"), t(" donnent une asymptote verticale ; un point vide n'en donne pas.")] };
      break;
    case "infini":
      n2 = { texte: [t("Ici, en "), l("\\pm\\infty"), t(", garde les termes de plus haut degré du numérateur et du dénominateur :")], formules: [`\\dfrac{${dominant(e.coeffsN)}}{${dominant(e.coeffsD)}}`] };
      break;
    case "coefDirecteur":
      n2 = { texte: [t("Ici, divise f(x) par x, puis compare les degrés :")], formules: [`\\dfrac{f(x)}{x}=\\dfrac{${N}}{x\\left(${D}\\right)}`] };
      break;
    case "coefB":
      n2 = { texte: [t("Ici, avec a trouvé à l'étape précédente, réduis au même dénominateur :")], formules: [`f(x)-ax=\\dfrac{${N}-ax\\left(${D}\\right)}{${D}}`] };
      break;
    case "asymptoteInfini":
      n2 = { texte: [t("Ici, reprends les étapes précédentes : une limite finie L en "), l("\\pm\\infty"), t(" donne "), l("y=L"), t(" ; a et b finis donnent "), l("y=ax+b"), t(" ; a infini : aucune asymptote horizontale ou oblique.")] };
      break;
    case "casSpecial": {
      const inf = e.infini;
      const d = inf.type === "horizontale" ? `${inf.limite}` : inf.type === "oblique" ? formatPenteOrdonnee(inf.pente, inf.ordonnee) : "";
      n2 = { texte: [t("Ici, un point commun vérifie l'égalité ci-dessous ; multiplie par le dénominateur, le terme de plus haut degré disparaît :")], formules: [`\\dfrac{${N}}{${D}}=${d}`] };
      break;
    }
    default:
      n2 = { texte: [] };
  }
  return [n1, n2];
}

const egal = (v: number | null, c: number) => v !== null && Number.isFinite(v) && Math.abs(v - c) < 1e-9 * Math.max(1, Math.abs(c));

/** Message ciblé sur la dernière réponse fausse (`valeurs` = saisies de l'écran, dans l'ordre). */
export function cibleEtude(e: ExerciceEtudeComplete, phase: PhaseEtudeComplete, valeurs: string[]): FragmentConsigne[] | null {
  if (e.mode !== "etude") return [t("Vérifie chaque propriété : limite infinie en la valeur donnée, et asymptote à l'infini (limite de f, ou de f(x) − (ax + b)).")];
  const ex: ExerciceEtudeCompletePipeline = e;
  const lus = valeurs.map((s) => lireLimite(s.replace(/^\s*[xy]\s*=\s*/i, "")));
  switch (phase) {
    case "domaine": {
      const pos = ex.exclusions.map((x) => x.position);
      if (lus.length < pos.length) return [t("Il manque une valeur exclue : toutes les valeurs qui annulent le dénominateur sont exclues, même celles qui annulent aussi le numérateur.")];
      return [t("Les valeurs exclues annulent le DÉNOMINATEUR (pas le numérateur) : résous « dénominateur = 0 ».")];
    }
    case "pointVideLimite": {
      if (lus[0] !== null && !Number.isFinite(lus[0])) return [t("Après simplification, le dénominateur ne s'annule plus en cette valeur : la limite est un nombre réel.")];
      return [t("Remplace x dans la forme SIMPLIFIÉE (pas dans f d'origine, qui donne "), l("\\frac{0}{0}"), t(").")];
    }
    case "limitesGD1":
    case "limitesGD2": {
      const excl = phase === "limitesGD1" ? ex.exclusions[0] : ex.exclusions[1];
      const [g, d] = lus;
      if (g !== null && d !== null && g === (excl.signeDroit as number) * Infinity && d === (excl.signeGauche as number) * Infinity && excl.signeGauche !== excl.signeDroit)
        return [t("Gauche et droite échangées : juste à gauche, "), l(`x-${excl.position}<0`), t(" ("), l("0^-"), t(").")];
      if (g !== null && Number.isFinite(g)) return [t("Le dénominateur tend vers 0 et pas le numérateur : la limite est infinie.")];
      if (excl.type === "vaDouble") return [t("Facteur au carré : il tend vers "), l("0^+"), t(" des deux côtés, les deux limites ont le même signe.")];
      return [t("Facteur simple : son signe change en la valeur exclue, les deux limites sont de signes contraires.")];
    }
    case "av": {
      const pvPos = ex.exclusions.filter((x) => x.type === "pointVide").map((x) => x.position);
      if (lus.some((v) => pvPos.some((p) => egal(v, p)))) return [t("Un point vide n'est pas une asymptote verticale : la limite y est finie.")];
      return [t("Chaque valeur exclue de forme "), l("\\frac{k}{0}"), t(" donne une asymptote verticale "), l("x=r"), t(".")];
    }
    case "infini": {
      const inf = ex.infini;
      if (inf.type === "horizontale") {
        if (lus.some((v) => v !== null && !Number.isFinite(v))) return [t("Numérateur de degré inférieur ou égal à celui du dénominateur : la limite est finie.")];
        return [t("Limite = quotient des termes de plus haut degré (0 si le numérateur est de plus petit degré).")];
      }
      if (lus.some((v) => v !== null && Number.isFinite(v))) return [t("Numérateur de plus haut degré : la limite est infinie.")];
      return [t("Signe de l'infini : regarde le signe du quotient des termes dominants pour x très grand, puis très négatif.")];
    }
    case "coefDirecteur":
      return ex.infini.type === "oblique"
        ? [lus.some((v) => v !== null && !Number.isFinite(v)) ? t("Pour une oblique, f(x)/x a un numérateur et un dénominateur de même degré : a est un nombre réel.") : t("a est le quotient des coefficients des termes de plus haut degré de N(x) et de x·D(x).")]
        : [t("Le degré du numérateur dépasse celui du dénominateur d'au moins 2 : f(x)/x tend encore vers l'infini.")];
    case "coefB":
      return lus.some((v) => v !== null && !Number.isFinite(v)) ? [t("b est la limite de f(x) − ax (pas de f(x)) : réduis au même dénominateur, le degré baisse.")] : [t("Réduis f(x) − ax au même dénominateur, puis prends le quotient des termes de plus haut degré.")];
    case "casSpecial": {
      const c = ex.casSpecial;
      if (!c) return null;
      if (egal(lus[0], c.x) && egal(lus[1], 0) && c.y !== 0) return [t("L'abscisse est juste ; le point est sur l'asymptote : son ordonnée se calcule sur l'asymptote, pas 0.")];
      if (egal(lus[0], c.x)) return [t("L'abscisse est juste ; calcule l'ordonnée sur l'asymptote en cette valeur.")];
      return [t("Multiplie l'égalité par le dénominateur : il reste une équation du premier degré.")];
    }
    case "pointVideSimplification": {
      return [t("Factorise le numérateur et le dénominateur, puis simplifie le facteur commun — la fraction restante ne s'annule plus au dénominateur en cette valeur.")];
    }
    default:
      return null;
  }
}

/** Message sous la réponse révélée de l'écran « typeLimite » (choix fermé, une tentative). */
export function cibleTypeLimite(e: ExerciceEtudeComplete): FragmentConsigne[] | null {
  if (e.mode !== "etude") return null;
  return [t("En une valeur exclue r : si N(r) = 0 aussi, forme "), l("\\frac{0}{0}"), t(" (point vide) ; si N(r) ≠ 0, forme "), l("\\frac{k}{0}"), t(" (asymptote verticale).")];
}

import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceOptimiserLog, IdVarianteOptimiserLog } from "../../core6e/optimiserModeleLog.types";
import { PHASES_OPTIMISER_LOG } from "../../moteur6e/typesOptimiserModeleLog";
import type { PhaseOptimiserLog } from "../../moteur6e/typesOptimiserModeleLog";
import { modeleNumerique } from "../../moteur6e/verificationOptimiserModeleLog";
import { fiche, formatReponseAttenduePhaseLatex } from "../../ui6e/formatOptimiserModeleLog";
import { figureOptimiserLogSvg } from "../../ui6e/figureOptimiserModeleLog";
import { COURS_ETUDE, arrondi, dec, fragmentsAide, vaut } from "../../ui6e/corrigeLogarithmes2";

/**
 * Corrigé détaillé « comme au tableau » de `6gen91` (optimiser un modèle logarithmique) — règle
 * `.claude/rules/feuilles-evaluations.md`. Cinq étapes = cinq écrans : a) domaine (une condition par
 * ligne, puis leur intersection), b) dérivée, c) zéro de la dérivée, d) signe de la dérivée (forme
 * factorisée, puis une valeur test dans chaque intervalle) et nature de l'optimum, e) valeur de
 * l'optimum dans les unités demandées. Chaînes de l'écran (`fiche(e).calculs`) éclatées une
 * transformation par ligne ; valeurs : `modeleNumerique` (source unique de l'écran et de la
 * vérification) ; réponses : `formatReponseAttenduePhaseLatex`.
 */

type E = ExerciceOptimiserLog;
type Regle = string | FragmentConsigne[];
const t = texte;
const f = latex;
const LETTRES: Record<PhaseOptimiserLog, string> = { domaine: "a", derivee: "b", zero: "c", nature: "d", valeur: "e" };

/** Une condition par ligne, puis leur intersection (le domaine dans le contexte). */
function lignesDomaine(e: E): LigneCalcul[] {
  const M = e.M;
  switch (e.variante) {
    case "engrais":
      return [ligne("1+x>0", "argument du logarithme strictement positif"), ligne("x>-1"), ligne(`0\\le x\\le ${M}`, "dose positive ou nulle, plafonnée"), ligne(`0\\le x\\le ${M}`, "intersection : x > −1 est alors automatique")];
    case "benefice":
      return [ligne("q>0", "argument du logarithme strictement positif"), ligne(`q\\le ${M}`, "production maximale"), ligne(`0<q\\le ${M}`, "intersection")];
    case "rendement-moyen":
      return [ligne("x>0", "argument du logarithme strictement positif"), ligne("x\\ne 0", "dénominateur non nul"), ligne(`x\\le ${M}`, "production maximale"), ligne(`0<x\\le ${M}`, "intersection")];
    case "cout-moyen":
      return [ligne("x>0", "argument du logarithme strictement positif"), ligne(`x\\le ${M}`, "production maximale"), ligne(`0<x\\le ${M}`, "intersection : la borne 0 est exclue")];
    case "debit":
      return [ligne("v>0", "argument du logarithme strictement positif"), ligne(`v\\le ${M}`, "vitesse maximale"), ligne(`0<v\\le ${M}`, "intersection")];
  }
}

const INV = (v: string): Regle => [f(`\\left(\\ln ${v}\\right)'=\\dfrac{1}{${v}}`)];

const REGLES: Record<IdVarianteOptimiserLog, Record<Exclude<PhaseOptimiserLog, "domaine">, Regle[]>> = {
  engrais: {
    derivee: [[f("(\\ln u)'=\\dfrac{u'}{u}"), t(" avec u = 1 + x, u′ = 1 ; la constante disparaît")], "on simplifie"],
    zero: ["la dérivée s'annule", "produit en croix", "on retranche 1"],
    nature: ["même dénominateur", "on met en évidence"],
    valeur: ["on remplace x par la valeur trouvée", "calculatrice"],
  },
  benefice: {
    derivee: [[t("dérivée terme à terme, "), ...(INV("q") as FragmentConsigne[])], "on simplifie"],
    zero: ["la dérivée s'annule", "produit en croix", "on simplifie"],
    nature: ["même dénominateur", "on met en évidence"],
    valeur: ["on remplace q par la valeur trouvée", "calculatrice"],
  },
  "rendement-moyen": {
    derivee: [[f("\\left(\\dfrac{u}{v}\\right)'=\\dfrac{u'v-uv'}{v^2}")], "on simplifie le numérateur"],
    zero: ["le numérateur s'annule (x² > 0)", "on isole ln(x)", "on applique exp"],
    nature: ["on met en évidence"],
    valeur: ["on remplace x, avec ln(eᵏ) = k", "on simplifie", "calculatrice"],
  },
  "cout-moyen": {
    derivee: [[f("(uv)'=u'v+uv'"), t(" pour x ln(x)")], "on simplifie et on développe"],
    zero: ["la dérivée s'annule", "on isole ln(x)", "on applique exp"],
    nature: ["on met en évidence"],
    valeur: ["on remplace x, avec ln(eᵏ) = k", "on simplifie", "calculatrice"],
  },
  debit: {
    derivee: [[f("(uv)'=u'v+uv'"), t(" pour v ln(v)")], "on simplifie et on développe"],
    zero: ["la dérivée s'annule", "on isole ln(v)", "on applique exp"],
    nature: ["on met en évidence"],
    valeur: ["on remplace v, avec ln(eᵏ) = k", "on simplifie", "calculatrice"],
  },
};

/** Membres d'une chaîne coupés aux « = » et « \approx » de niveau 0. */
function membres(s: string): { rel: string; s: string }[] {
  const out: { rel: string; s: string }[] = [];
  let prof = 0;
  let debut = 0;
  let rel = "";
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === "\\") {
      const m = /^\\approx(?![a-zA-Z])/.exec(s.slice(i));
      if (m && prof === 0) {
        out.push({ rel, s: s.slice(debut, i) });
        rel = "\\approx ";
        debut = i + m[0].length;
        i += m[0].length - 1;
        continue;
      }
      i++;
      continue;
    }
    if (c === "{") prof++;
    else if (c === "}") prof--;
    else if (c === "=" && prof === 0) {
      out.push({ rel, s: s.slice(debut, i) });
      rel = "=";
      debut = i + 1;
    }
  }
  out.push({ rel, s: s.slice(debut) });
  return out.map((x) => ({ rel: x.rel, s: x.s.trim() }));
}

/** Chaîne de l'écran éclatée : coupure aux « ⟺ », puis aux « = » / « \approx » (une transformation par ligne). */
function eclater(chaine: string, regles: Regle[]): LigneCalcul[] {
  const lignes: LigneCalcul[] = [];
  let r = 0;
  for (const morceau of chaine.split("\\iff").map((x) => x.trim()).filter((x) => x !== "")) {
    const m = membres(morceau);
    if (m.length === 1) {
      lignes.push(ligne(morceau, regles[r++]));
      continue;
    }
    m.slice(1).forEach((x, k) => lignes.push(ligne(k === 0 ? `${m[0]!.s}${x.rel}${x.s}` : `${x.rel}${x.s}`, regles[r++])));
  }
  return lignes;
}

/** Valeur test « propre » strictement entre a et b. */
function valeurTest(a: number, b: number): number {
  for (const d of [0, 1, 2]) {
    const pas = Math.pow(10, -d);
    const v = Math.ceil((a + (b - a) * 0.25) / pas) * pas;
    if (v > a + 1e-9 && v < b - 1e-9) return arrondi(v, d);
  }
  return arrondi((a + b) / 2, 3);
}

function lignesSigne(e: E): LigneCalcul[] {
  const m = modeleNumerique(e);
  const F = `${m.nom}'`;
  const xs = m.xEtoile;
  const t1 = valeurTest(m.domaine.gauche, xs);
  const t2 = valeurTest(xs, m.domaine.droite);
  const signe = (v: number) => (v > 0 ? ">0" : "<0");
  return [
    ligne(`${F}(${dec(t1, 3)})${vaut(m.fp(t1), 3)}`, "une valeur test avant l'optimum"),
    ligne(signe(m.fp(t1))),
    ligne(`${F}(${dec(t2, 3)})${vaut(m.fp(t2), 3)}`, "une valeur test après l'optimum"),
    ligne(signe(m.fp(t2)), m.nature === "max" ? "la dérivée passe de + à − : maximum" : "la dérivée passe de − à + : minimum"),
  ];
}

/** Retour aux unités de l'énoncé (x compte des centaines, des milliers…). */
function lignesUnites(e: E): EtapeCorrection[] {
  const m = modeleNumerique(e);
  const facteur = Math.round(m.optimumContexte / m.xEtoile);
  const lignes: LigneCalcul[] = [];
  if (facteur !== 1) lignes.push(ligne(`${facteur}\\times ${dec(m.xEtoile, 4)}${vaut(m.optimumContexte, 0)}`, `${m.variable} compte des ${facteur === 100 ? "centaines" : facteur === 1000 ? "milliers" : facteur === 10 ? "dizaines" : `paquets de ${facteur}`}`));
  const fv = m.valeur !== 0 ? Math.round(m.valeurContexte / m.valeur) : 1;
  if (fv !== 1) lignes.push(ligne(`${fv}\\times ${dec(m.valeur, 4)}${vaut(m.valeurContexte, 0)}`, "valeur dans l'unité demandée"));
  return lignes.length ? [calcul(LETTRES.valeur, lignes, [], "Unités")] : [];
}

/** Piège de l'écran, ses formules écrites en LaTeX (jamais « 1/x » ou « a/b » au clavier). */
function piegeFragments(e: E, phase: PhaseOptimiserLog, texteEcran: string): FragmentConsigne[] {
  if (e.variante === "engrais" && phase === "derivee") return [t("Écrire "), f("\\left(\\ln(1+x)\\right)'=\\dfrac{1}{x}"), t(" : la dérivée de l'argument 1 + x vaut 1, mais il reste au dénominateur.")];
  if (e.variante === "engrais" && phase === "zero") return [t("Résoudre en "), f("x=\\dfrac{a}{b}"), t(" en oubliant de retrancher 1.")];
  if (e.variante === "benefice" && phase === "zero") return [t("Inverser le quotient ("), f("q=\\dfrac{b}{a}"), t(" au lieu de "), f("\\dfrac{a}{b}"), t(").")];
  if ((e.variante === "cout-moyen" || e.variante === "debit") && phase === "derivee") {
    const v = e.variante === "debit" ? "v" : "x";
    return [t(`Dériver ${v} ln(${v}) en `), f(`\\dfrac{1}{${v}}`), t(` ou en ln(${v}) seulement : c'est un produit, sa dérivée vaut ln(${v}) + 1.`)];
  }
  return [t(texteEcran)];
}

export function correctionDetailleeOptimiserLog(e: E): EtapeCorrection[] {
  const fi = fiche(e);
  return PHASES_OPTIMISER_LOG.flatMap((phase): EtapeCorrection[] => {
    const sq = LETTRES[phase];
    const rep = formatReponseAttenduePhaseLatex(e, phase).flatMap((x, i) => (i === 0 ? [f(x)] : [t(" ; "), f(x)]));
    const p = piege(sq, piegeFragments(e, phase, fi.pieges[phase]));
    switch (phase) {
      case "domaine":
        return [utilise(sq, [t("Le logarithme n'existe que pour un argument strictement positif ; on croise avec les contraintes de la situation " + COURS_ETUDE + ".")]), calcul(sq, lignesDomaine(e)), resultat(sq, [t("Domaine dans le contexte : "), ...rep]), p];
      case "derivee":
        return [utilise(sq, fragmentsAide(fi.aides.derivee[0], COURS_ETUDE)), calcul(sq, eclater(fi.calculs.derivee, REGLES[e.variante].derivee)), resultat(sq, [t("Dérivée : "), ...rep]), p];
      case "zero":
        return [utilise(sq, fragmentsAide(fi.aides.zero[0], COURS_ETUDE)), calcul(sq, eclater(fi.calculs.zero, REGLES[e.variante].zero)), resultat(sq, [t("La dérivée s'annule en "), ...rep]), p];
      case "nature":
        return [
          utilise(sq, fragmentsAide(fi.aides.nature[0], COURS_ETUDE)),
          calcul(sq, eclater(fi.calculs.nature, REGLES[e.variante].nature), [], "Forme factorisée"),
          calcul(sq, lignesSigne(e), [], "Valeurs test"),
          resultat(sq, [t("Signe et nature : "), ...rep]),
          p,
        ];
      case "valeur":
        return [
          utilise(sq, fragmentsAide(fi.aides.valeur[0], COURS_ETUDE)),
          calcul(sq, eclater(fi.calculs.valeur, REGLES[e.variante].valeur)),
          ...lignesUnites(e),
          { ...resultat(sq, [t("Optimum : "), ...rep]), figureHtml: figureOptimiserLogSvg(e) },
          verification(sq, [t("Valeur cohérente avec la courbe : l'optimum est atteint en "), f(`${modeleNumerique(e).variable}\\approx ${dec(modeleNumerique(e).xEtoile, 3)}`), t(", à l'intérieur du domaine.")]),
          p,
        ];
    }
  });
}

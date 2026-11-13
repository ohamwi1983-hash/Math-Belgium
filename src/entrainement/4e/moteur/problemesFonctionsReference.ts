import type { Borne, Crochet, Morceau, SolutionEnsemble } from "../core/inequation.types";
import type { DescriptionProbleme, ExerciceProblemesFonctionsReference, SensQuestion } from "../core/problemesFonctionsReference.types";
import type { StatutVerification } from "./statutVerification";
import { evaluerExpressionGenerale } from "./expressionGenerale";

/**
 * Moteur de gen68 : description mathématique d'une instance (fonction, domaines, inéquation,
 * ensemble-solution) et vérificateurs des 4 écrans. Une seule source pour l'appli ET l'adaptateur
 * papier (`generateurs/problemesFonctionsReference/exportEvaluation.ts`).
 */

function m(crochetGauche: Crochet, borneGauche: Borne, borneDroite: Borne, crochetDroit: Crochet): Morceau {
  return { crochetGauche, borneGauche, crochetDroit, borneDroite };
}

function intervalle(morceau: Morceau): SolutionEnsemble {
  return { forme: "intervalle", morceau };
}

export function nombreLatex(v: number): string {
  return String(Math.round(v * 1e6) / 1e6).replace(".", "{,}");
}

function borneLatex(b: Borne): string {
  if (b === "-inf") return "-\\infty";
  if (b === "+inf") return "+\\infty";
  return nombreLatex(b);
}

export function morceauLatex(morceau: Morceau): string {
  return `${morceau.crochetGauche}${borneLatex(morceau.borneGauche)} \\,;\\, ${borneLatex(morceau.borneDroite)}${morceau.crochetDroit}`;
}

export function ensembleLatex(s: SolutionEnsemble): string {
  switch (s.forme) {
    case "vide":
      return "\\varnothing";
    case "reel":
      return "\\mathbb{R}";
    case "point":
      return `\\{${nombreLatex(s.valeur)}\\}`;
    case "reel_sauf_point":
      return `\\mathbb{R} \\setminus \\{${nombreLatex(s.valeur)}\\}`;
    case "intervalle":
      return morceauLatex(s.morceau);
    case "union":
      return `${morceauLatex(s.morceau1)} \\cup ${morceauLatex(s.morceau2)}`;
  }
}

const SYMBOLE_LATEX: Record<SensQuestion, string> = { "<": "<", "≤": "\\leq", ">": ">", "≥": "\\geq" };

export function symboleLatex(sens: SensQuestion): string {
  return SYMBOLE_LATEX[sens];
}

const R_SAUF_0 = "\\mathbb{R} \\setminus \\{0\\}";

/** Durée de l'énoncé du trajet, en heures (ex. 1 h 30 min → 1,5). */
export function dureeHeures(e: ExerciceProblemesFonctionsReference): number {
  return e.p.heures! + e.p.minutes! / 60;
}

/**
 * Restreint au domaine du contexte un ensemble défini par « valeur < borne » (dessous) ou
 * « valeur > borne » (dessus), large ou strict. Le domaine est un seul morceau ]g ; D] ou [g ; D].
 */
function partie(domaine: Morceau, borne: number, dessus: boolean, large: boolean): SolutionEnsemble {
  if (dessus) return intervalle(m(large ? "[" : "]", borne, domaine.borneDroite, domaine.crochetDroit));
  return intervalle(m(domaine.crochetGauche, domaine.borneGauche, borne, large ? "]" : "["));
}

export function decrireProbleme(e: ExerciceProblemesFonctionsReference): DescriptionProbleme {
  const { p, sens } = e;
  const large = sens === "≤" || sens === "≥";
  /** « f(x) au-dessus du seuil » (> ou ≥). */
  const auDessus = sens === ">" || sens === "≥";
  switch (e.famille) {
    case "trajet": {
      const d = p.d!;
      const vmax = p.vmax!;
      const t = dureeHeures(e);
      const s = Math.round(d / t);
      const domaine = m("]", 0, vmax, "]");
      // d/v décroissante sur ]0 ; vmax] : « durée sous T » ⟺ « vitesse au-dessus de s » (le sens s'inverse).
      return {
        variable: "v",
        nomFonction: "t",
        expressionLatex: `\\dfrac{${d}}{v}`,
        evaluer: (v) => d / v,
        domaineContexte: domaine,
        domaineAlgebriqueLatex: R_SAUF_0,
        optionsDomaine: [morceauLatex(domaine), R_SAUF_0, morceauLatex(m("]", 0, "+inf", "[")), morceauLatex(m("[", 0, vmax, "]"))],
        solution: partie(domaine, s, !auDessus, large),
        inequationLatex: `\\dfrac{${d}}{v} ${symboleLatex(sens)} ${nombreLatex(t)}`,
      };
    }
    case "potager": {
      const amax = p.amax!;
      const k = p.k!;
      const domaine = m("]", 0, amax, "]");
      return {
        variable: "A",
        nomFonction: "c",
        expressionLatex: "\\sqrt{A}",
        evaluer: (a) => Math.sqrt(a),
        domaineContexte: domaine,
        domaineAlgebriqueLatex: morceauLatex(m("[", 0, "+inf", "[")),
        optionsDomaine: [morceauLatex(domaine), morceauLatex(m("[", 0, "+inf", "[")), morceauLatex(m("]", 0, "+inf", "[")), morceauLatex(m("]", 0, Math.round(Math.sqrt(amax)), "]"))],
        solution: partie(domaine, k * k, auDessus, large),
        inequationLatex: `\\sqrt{A} ${symboleLatex(sens)} ${k}`,
      };
    }
    case "aquarium": {
      const vmax = p.vmax!;
      const k = p.k!;
      const domaine = m("]", 0, vmax, "]");
      return {
        variable: "V",
        nomFonction: "a",
        expressionLatex: "\\sqrt[3]{V}",
        evaluer: (v) => Math.cbrt(v),
        domaineContexte: domaine,
        domaineAlgebriqueLatex: "\\mathbb{R}",
        optionsDomaine: [morceauLatex(domaine), "\\mathbb{R}", morceauLatex(m("]", 0, "+inf", "[")), morceauLatex(m("]", 0, Math.round(Math.cbrt(vmax)), "]"))],
        solution: partie(domaine, k * k * k, auDessus, large),
        inequationLatex: `\\sqrt[3]{V} ${symboleLatex(sens)} ${k}`,
      };
    }
    case "thermostat": {
      const c = p.consigne!;
      const k = p.k!;
      const domaine = m("[", 10, 30, "]");
      const solution: SolutionEnsemble = auDessus
        ? { forme: "union", morceau1: m("[", 10, c - k, large ? "]" : "["), morceau2: m(large ? "[" : "]", c + k, 30, "]") }
        : intervalle(m(large ? "[" : "]", c - k, c + k, large ? "]" : "["));
      return {
        variable: "T",
        nomFonction: "E",
        expressionLatex: `|T - ${c}|`,
        evaluer: (t) => Math.abs(t - c),
        domaineContexte: domaine,
        domaineAlgebriqueLatex: "\\mathbb{R}",
        optionsDomaine: [morceauLatex(domaine), "\\mathbb{R}", morceauLatex(m("[", 0, "+inf", "[")), morceauLatex(m("[", 0, 30, "]"))],
        solution,
        inequationLatex: `|T - ${c}| ${symboleLatex(sens)} ${k}`,
      };
    }
    case "location": {
      const f = p.forfait!;
      const ph = p.prixHeure!;
      const seuil = p.seuil!;
      const s = f / (seuil - ph);
      const domaine = m("]", 0, "+inf", "[");
      // F/x + p décroissante sur ]0 ; +∞[ : « coût sous le seuil » ⟺ « durée au-dessus de s ».
      return {
        variable: "x",
        nomFonction: "C",
        expressionLatex: `\\dfrac{${f}}{x} + ${ph}`,
        evaluer: (x) => f / x + ph,
        domaineContexte: domaine,
        domaineAlgebriqueLatex: R_SAUF_0,
        optionsDomaine: [morceauLatex(domaine), R_SAUF_0, morceauLatex(m("[", 0, "+inf", "[")), morceauLatex(m("]", ph, "+inf", "["))],
        solution: partie(domaine, s, !auDessus, large),
        inequationLatex: `\\dfrac{${f}}{x} + ${ph} ${symboleLatex(sens)} ${seuil}`,
      };
    }
    case "plaque": {
      const cote = p.cote!;
      const k = p.k!;
      const domaine = m("]", 0, cote, "]");
      return {
        variable: "c",
        nomFonction: "A",
        expressionLatex: "c^2",
        evaluer: (c) => c * c,
        domaineContexte: domaine,
        domaineAlgebriqueLatex: "\\mathbb{R}",
        optionsDomaine: [morceauLatex(domaine), "\\mathbb{R}", morceauLatex(m("]", 0, "+inf", "[")), morceauLatex(m("]", 0, cote * cote, "]"))],
        solution: partie(domaine, k, auDessus, large),
        inequationLatex: `c^2 ${symboleLatex(sens)} ${k * k}`,
      };
    }
  }
}

// ---------------------------------------------------------------------------------------------
// Écran 1 — expression de la fonction
// ---------------------------------------------------------------------------------------------

export type StatutFonction = StatutVerification | "mauvaise_variable";

/** Retire un éventuel « t(v) = » / « t = » recopié devant l'expression. */
export function expressionSansPrefixe(saisie: string): string {
  const i = saisie.lastIndexOf("=");
  return (i >= 0 ? saisie.slice(i + 1) : saisie).replace(/−/g, "-").trim();
}

/** Points d'échantillonnage : dans le domaine du contexte (des deux côtés de la consigne pour la
 * valeur absolue), plus quelques valeurs hors contexte mais dans le domaine algébrique. */
function pointsEchantillon(e: ExerciceProblemesFonctionsReference): number[] {
  const base = [0.37, 1.3, 2.71, 4.9, 7.25, 11.6, 17.3, 23.9, 28.4, 41.7, 66.2, 97.3];
  if (e.famille === "thermostat") return [...base, -3.4, -12.6];
  if (e.famille === "aquarium" || e.famille === "plaque") return [...base, -2.6, -8.1];
  return base;
}

export function diagnostiquerFonction(saisie: string, e: ExerciceProblemesFonctionsReference): StatutFonction {
  const d = decrireProbleme(e);
  const expression = expressionSansPrefixe(saisie);
  if (expression === "") return "parse_error";
  const autreLettre = d.variable.toLowerCase() !== "x" && /(^|[^a-zA-Z])x([^a-zA-Z]|$)/.test(expression);
  let egal = true;
  try {
    for (const valeur of pointsEchantillon(e)) {
      const attendu = d.evaluer(valeur);
      const obtenu = evaluerExpressionGenerale(expression, d.variable === "x" ? valeur : Number.NaN, { [d.variable]: valeur });
      if (!Number.isFinite(obtenu) || Math.abs(obtenu - attendu) > 1e-7 * Math.max(1, Math.abs(attendu))) {
        egal = false;
        break;
      }
    }
  } catch {
    return autreLettre ? "mauvaise_variable" : "parse_error";
  }
  if (egal) return "correct";
  return autreLettre ? "mauvaise_variable" : "not_equivalent";
}

// ---------------------------------------------------------------------------------------------
// Écran 3 — ensemble-solution de la question concrète
// ---------------------------------------------------------------------------------------------

export type StatutQuestion = "correct" | "crochets" | "hors_contexte" | "sens" | "unite" | "faux";

function dansBorneGauche(x: number, b: Borne, c: Crochet): boolean {
  if (b === "-inf") return true;
  if (b === "+inf") return false;
  return c === "[" ? x >= b : x > b;
}

function dansBorneDroite(x: number, b: Borne, c: Crochet): boolean {
  if (b === "+inf") return true;
  if (b === "-inf") return false;
  return c === "]" ? x <= b : x < b;
}

function dansMorceau(x: number, mo: Morceau): boolean {
  return dansBorneGauche(x, mo.borneGauche, mo.crochetGauche) && dansBorneDroite(x, mo.borneDroite, mo.crochetDroit);
}

export function appartient(x: number, s: SolutionEnsemble): boolean {
  switch (s.forme) {
    case "vide":
      return false;
    case "reel":
      return true;
    case "point":
      return x === s.valeur;
    case "reel_sauf_point":
      return x !== s.valeur;
    case "intervalle":
      return dansMorceau(x, s.morceau);
    case "union":
      return dansMorceau(x, s.morceau1) || dansMorceau(x, s.morceau2);
  }
}

function bornesFinies(s: SolutionEnsemble): number[] {
  const morceaux = s.forme === "intervalle" ? [s.morceau] : s.forme === "union" ? [s.morceau1, s.morceau2] : [];
  const out: number[] = [];
  for (const mo of morceaux) for (const b of [mo.borneGauche, mo.borneDroite]) if (typeof b === "number") out.push(b);
  if (s.forme === "point" || s.forme === "reel_sauf_point") out.push(s.valeur);
  return out;
}

/** Comparaison de deux ensembles par échantillonnage : grille fine + chaque borne et ses voisins.
 * `aussiBornes = false` ignore les bornes elles-mêmes (ne compare que les intérieurs). */
function memesEnsembles(a: (x: number) => boolean, b: (x: number) => boolean, bornes: number[], aussiBornes: boolean): boolean {
  const pts: number[] = [];
  for (let x = -60; x <= 1200; x += 0.25) pts.push(x + 0.0371);
  for (const v of bornes) {
    pts.push(v - 0.01, v + 0.01);
    if (aussiBornes) pts.push(v);
  }
  pts.push(1e6, -1e6);
  return pts.every((x) => a(x) === b(x));
}

export function diagnostiquerQuestion(saisie: SolutionEnsemble, e: ExerciceProblemesFonctionsReference): StatutQuestion {
  const d = decrireProbleme(e);
  const attendu = d.solution;
  const bornes = [...bornesFinies(saisie), ...bornesFinies(attendu), ...bornesFinies(intervalle(d.domaineContexte))];
  const dansSaisie = (x: number) => appartient(x, saisie);
  const dansAttendu = (x: number) => appartient(x, attendu);
  const dansDomaine = (x: number) => dansMorceau(x, d.domaineContexte);
  if (memesEnsembles(dansSaisie, dansAttendu, bornes, true)) return "correct";
  if (memesEnsembles(dansSaisie, dansAttendu, bornes, false)) return "crochets";
  const restreinte = (x: number) => dansSaisie(x) && dansDomaine(x);
  if (memesEnsembles(restreinte, dansAttendu, bornes, false)) return "hors_contexte";
  if (memesEnsembles(restreinte, (x) => dansDomaine(x) && !dansAttendu(x), bornes, false)) return "sens";
  if (e.famille === "trajet" && e.p.minutes! > 0) {
    const fausseDuree = e.p.heures! + e.p.minutes! / 100;
    const fausseBorne = e.p.d! / fausseDuree;
    if (bornesFinies(saisie).some((b) => Math.abs(b - fausseBorne) < 1)) return "unite";
  }
  return "faux";
}

// ---------------------------------------------------------------------------------------------
// Écrans 2 et 4 — choix fermés (l'option 0 est toujours la bonne, `ordre*` ne fait que l'afficher)
// ---------------------------------------------------------------------------------------------

export function verifierChoix(indexOption: number): boolean {
  return indexOption === 0;
}

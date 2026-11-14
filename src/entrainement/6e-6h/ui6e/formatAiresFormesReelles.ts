import type { ExerciceAiresFormesReelles, ExerciceMurFormesReelles, ExerciceSectionFormesReelles } from "../core6e/airesFormesReelles.types";
import type { Arc, PhaseFormesReelles } from "../moteur6e/modeleAiresFormesReelles";
import {
  aireCourbe,
  arcExercice,
  bornesArc,
  bornesCorrige,
  coefArc,
  coefficientsArc,
  coefficientsParcelle,
  coefficientsVitrail,
  integraleSignee,
  litresPeinture,
  nombrePots,
  valeurCout,
  valeurTotal,
  valeurVolume,
} from "../moteur6e/modeleAiresFormesReelles";
import { CONSIGNE_PRECISION, decimalLatex, decimalTexte, egalExactPuisApprox, fractionDepuisValeur, fractionLatex, racineLatex, racineSimplifiee } from "./nombresExactsIntegrales";

/**
 * Couche ui (6e) — textes, consignes, aides et réponses attendues (LaTeX) de `6gen81` « Aires de
 * formes réelles ». Les mêmes fonctions servent à l'écran, au récapitulatif, au corrigé papier et au
 * barème (`generateurs6e/airesFormesReelles/exportEvaluation.ts`).
 */

export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

export interface ChampDef {
  type: "fonction" | "valeur";
  /** Libellé texte brut (aperçu, historique). */
  label: string;
  /** Libellé LaTeX rendu à la place de `label` quand il est fourni. */
  labelLatex?: string;
  placeholder: string;
}

const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

// ============================================================================
// Nombres.
// ============================================================================

function nettoyer(v: number): number {
  const r = Math.round(v * 1e9) / 1e9;
  return Object.is(r, -0) ? 0 : r;
}

/** Représentation LaTeX d'un nombre : entier, fraction (régime exact) ou décimal court ; sinon
 * décimal à 4 chiffres, marqué `exact: false` (l'appelant écrit alors « ≈ »). */
export function representer(v: number, prefereFraction: boolean, denMax = 100): { tex: string; exact: boolean } {
  const x = nettoyer(v);
  if (Number.isInteger(x)) return { tex: `${x}`, exact: true };
  const decimalCourt = Math.abs(x * 1e4 - Math.round(x * 1e4)) < 1e-6;
  const fr = fractionDepuisValeur(x, denMax);
  if (prefereFraction && fr) return { tex: fractionLatex(fr.num, fr.den), exact: true };
  if (decimalCourt) return { tex: decimalLatex(x, 4), exact: true };
  if (fr) return { tex: fractionLatex(fr.num, fr.den), exact: true };
  return { tex: decimalLatex(x, 4), exact: false };
}

function prefere(e: ExerciceAiresFormesReelles): boolean {
  return e.calcul === "exacte";
}

/** Nombre en texte brut (virgule décimale, « − »). */
export function nb(v: number): string {
  return decimalTexte(nettoyer(v), 3);
}

/** Montant en euros : 2 décimales dès qu'il n'est pas entier. */
function grouper(entier: string, separateur: string): string {
  return entier.length <= 4 ? entier : entier.replace(/\B(?=(\d{3})+(?!\d))/g, separateur);
}

/** Montant en euros (texte) : 2 décimales dès qu'il n'est pas entier, milliers séparés. */
export function euros(v: number): string {
  const x = Math.round(v * 100) / 100;
  const [ent, dec] = (Number.isInteger(x) ? `${x}` : x.toFixed(2)).split(".");
  return grouper(ent, "\u202f") + (dec ? `,${dec}` : "");
}

export function eurosLatex(v: number): string {
  const x = Math.round(v * 100) / 100;
  const [ent, dec] = (Number.isInteger(x) ? `${x}` : x.toFixed(2)).split(".");
  return grouper(ent, "\\,") + (dec ? `{,}${dec}` : "");
}

/** Monôme signé `coef·x^n` (premier terme sans « + »). */
function monome(coefTex: string, n: number, premier: boolean): string {
  const negatif = coefTex.startsWith("-");
  const abs = negatif ? coefTex.slice(1) : coefTex;
  const signe = negatif ? "-" : premier ? "" : "+";
  const variable = n === 0 ? "" : n === 1 ? "x" : `x^{${n}}`;
  const corps = n > 0 && abs === "1" ? "" : abs;
  return `${signe}${corps}${variable}`;
}

/** Polynôme (coefficients CROISSANTS) en LaTeX, degrés décroissants. */
export function polyTex(coeffs: number[], prefereFraction: boolean, denMax = 100): { tex: string; exact: boolean } {
  const morceaux: string[] = [];
  let exact = true;
  for (let n = coeffs.length - 1; n >= 0; n--) {
    const c = nettoyer(coeffs[n]);
    if (c === 0) continue;
    const r = representer(c, prefereFraction, denMax);
    exact = exact && r.exact;
    morceaux.push(monome(r.tex, n, morceaux.length === 0));
  }
  return { tex: morceaux.length === 0 ? "0" : morceaux.join(""), exact };
}

/** Primitive (constante nulle) d'un polynôme, coefficients croissants. */
function primitiveCoeffs(coeffs: number[]): number[] {
  return [0, ...coeffs.map((c, i) => c / (i + 1))];
}

function evaluerPoly(coeffs: number[], x: number): number {
  return coeffs.reduce((acc, c, i) => acc + c * x ** i, 0);
}

// ============================================================================
// Arcs (mur, section).
// ============================================================================

/** Équation de l'arc dans un repère : forme factorisée (pied) ou canonique (milieu). */
export function arcTex(arc: Arc, repere: "pied" | "milieu", prefereFraction: boolean): { tex: string; exact: boolean } {
  const c = representer(coefArc(arc), prefereFraction);
  const coef = c.tex === "1" ? "" : c.tex === "-1" ? "-" : c.tex;
  if (repere === "pied") return { tex: `${coef}x(x-${representer(arc.largeur, false).tex})`, exact: c.exact };
  const sommet = representer(arc.sens * arc.fleche, prefereFraction).tex;
  const terme = monome(c.tex, 2, false);
  return { tex: arc.sens > 0 ? `${sommet}${terme}` : `${monome(c.tex, 2, true)}${sommet}`, exact: c.exact };
}

/** f(x) développée donnée dans l'énoncé (fonction donnée). */
function fonctionDonneeArc(e: ExerciceMurFormesReelles | ExerciceSectionFormesReelles): string {
  return polyTex(coefficientsArc(arcExercice(e), e.repere), prefere(e)).tex;
}

// ============================================================================
// Unités et vocabulaire.
// ============================================================================

export function uniteLongueur(e: ExerciceAiresFormesReelles): string {
  if (e.situation === "vitrail") return "dm";
  if (e.situation === "section" && e.contexte === "gouttiere") return "cm";
  return "m";
}

function uniteAireTex(e: ExerciceAiresFormesReelles): string {
  if (e.situation === "parcelle") return "\\text{ u.a.}";
  return `\\text{ ${uniteLongueur(e)}}^2`;
}

function uniteAireTexte(e: ExerciceAiresFormesReelles): string {
  if (e.situation === "parcelle") return "u.a.";
  return `${uniteLongueur(e)}²`;
}

function uniteVolumeTex(e: ExerciceSectionFormesReelles): string {
  return e.contexte === "gouttiere" ? "\\text{ L}" : "\\text{ m}^3";
}

const NOM_SECTION = { canal: "du canal", tunnel: "du tunnel", gouttiere: "de la gouttière" } as const;

// ============================================================================
// Énoncé.
// ============================================================================

export function consigneGenerale(e: ExerciceAiresFormesReelles): FragmentConsigne[] {
  switch (e.situation) {
    case "mur": {
      const debut = `On doit repeindre le pignon d'une maison : un mur rectangulaire de ${nb(e.L)} m de large et ${nb(e.h)} m de haut, surmonté d'un fronton dont le bord a la forme d'un arc de parabole.`;
      const arc =
        e.modele === "retrouver"
          ? ` L'arc part des deux coins supérieurs du rectangle et son sommet est à ${nb(e.k)} m au-dessus du bord supérieur du rectangle.`
          : " Dans le repère du schéma (unité : 1 m), l'axe des abscisses suit le bord supérieur du rectangle et le bord du fronton est la courbe de la fonction f donnée.";
      const peinture = ` On peint une face du mur en deux couches. La peinture couvre ${nb(e.rendement)} m² par litre et se vend en pots de ${nb(e.contenance)} L à ${euros(e.prixPot)} € le pot.`;
      return [t(debut + arc + peinture)];
    }
    case "vitrail":
      return [
        t(
          `Un vitrail rectangulaire de ${nb(e.W)} dm de large et ${nb(e.H)} dm de haut contient une lentille de verre rouge, délimitée par deux arcs de parabole. Dans le repère du schéma (origine au coin inférieur gauche du vitrail, unité : 1 dm), l'arc supérieur est la courbe de f et l'arc inférieur celle de g. Le verre rouge coûte ${euros(e.prixColore)} € le m², le verre clair (le reste du vitrail) ${euros(e.prixClair)} € le m².`,
        ),
      ];
    case "section": {
      const u = uniteLongueur(e);
      // Fonction donnée : pas de dimensions (les bornes se trouvent en résolvant f(x) = 0).
      const dims = (largeur: string, profondeur: string) => (e.modele === "retrouver" ? ` : ${nb(e.W)} ${u} de large ${largeur} et ${nb(e.D)} ${u} de ${profondeur} au milieu.` : ".");
      const debut =
        e.contexte === "canal"
          ? `Un canal d'irrigation de ${nb(e.longueur)} m de long a une section en forme d'arc de parabole${dims("au niveau du sol", "profondeur")}`
          : e.contexte === "tunnel"
            ? `On creuse un tunnel de ${nb(e.longueur)} m de long dont la section a la forme d'un arc de parabole${dims("au sol", "haut")}`
            : `Une gouttière de ${nb(e.longueur)} m de long a une section en forme d'arc de parabole${dims("en haut", "profondeur")}`;
      const repere =
        e.modele === "donnee"
          ? ` Dans le repère du schéma (unité : 1 ${u}), l'axe des abscisses suit ${e.contexte === "gouttiere" ? "le bord supérieur" : "le sol"} et l'arc est la courbe de la fonction f donnée.`
          : "";
      const but =
        e.contexte === "canal"
          ? " On veut connaître le volume d'eau qu'il contient quand il est plein à ras bord."
          : e.contexte === "tunnel"
            ? " On veut estimer le volume de terre à évacuer."
            : " On veut savoir combien de litres d'eau elle contient quand elle est pleine.";
      return [t(debut + repere + but)];
    }
    case "parcelle": {
      const debut = `Une parcelle à bâtir est bordée d'un côté par une route rectiligne, de l'autre par une rivière, et sur les côtés par deux clôtures perpendiculaires à la route, situées à ${nb(10 * e.a)} m et à ${nb(10 * e.b)} m d'un pont. On prend un repère d'origine le pied du pont, l'axe des abscisses le long de la route, avec une unité de 10 m sur chaque axe.`;
      const y0 = e.alpha * e.m * e.m + e.k;
      const berge =
        e.modele === "retrouver"
          ? ` La berge est modélisée par un arc de parabole : elle est au plus loin de la route, à ${nb(10 * e.k)} m, en face du point de la route situé à ${nb(10 * e.m)} m du pont ; au pied du pont, elle est à ${nb(10 * y0)} m de la route.`
          : " Dans ce repère, la berge est la courbe de la fonction f donnée.";
      return [t(`${debut}${berge} Le terrain se vend ${euros(e.prix)} € le m².`)];
    }
  }
}

/** Formules de l'énoncé (fonctions données) ; vide quand la fonction est à retrouver. */
export function blocDonnees(e: ExerciceAiresFormesReelles): string[] {
  if (e.situation === "vitrail") {
    const { f, g } = coefficientsVitrail(e);
    return [`f(x)=${polyTex(f, prefere(e)).tex}`, `g(x)=${polyTex(g, prefere(e)).tex}`];
  }
  if (e.modele === "retrouver") return [];
  if (e.situation === "parcelle") return [`f(x)=${polyTex(coefficientsParcelle(e), prefere(e)).tex}`];
  return [`f(x)=${fonctionDonneeArc(e)}`];
}

// ============================================================================
// Écrans.
// ============================================================================

export function libellePhase(e: ExerciceAiresFormesReelles, phase: PhaseFormesReelles): string {
  switch (phase) {
    case "modeliser":
      if (e.situation === "vitrail") return "Intersections";
      return e.modele === "retrouver" ? "Modèle" : "Bornes";
    case "aire":
      return e.situation === "mur" ? "Aire de l'arc" : e.situation === "vitrail" ? "Verre rouge" : e.situation === "section" ? "Aire de la section" : "Aire en u.a.";
    case "total":
      return e.situation === "mur" ? "Surface du mur" : e.situation === "vitrail" ? "Verre clair" : "Aire en m²";
    case "peinture":
      return "Peinture";
    case "cout":
      return e.situation === "parcelle" ? "Valeur du terrain" : "Coût";
    case "volume":
      return "Volume";
  }
}

const PRECISION_CONTEXTE = "Donne la valeur exacte, ou arrondie au centième.";

export function consigneEcran(e: ExerciceAiresFormesReelles, phase: PhaseFormesReelles): FragmentConsigne[] {
  switch (phase) {
    case "modeliser": {
      if (e.situation === "vitrail") {
        return [
          t("Trouve les abscisses "),
          l("x_1<x_2"),
          t(` des deux points où les arcs se rejoignent.${e.calcul === "calculatrice" ? " Donne leur valeur exacte, ou arrondie au centième." : ""}`),
        ];
      }
      if (e.situation === "parcelle") {
        return e.modele === "retrouver"
          ? [t("Donne une équation de la berge dans ce repère (coefficients exacts ou arrondis au millième), puis les bornes "), l("a<b"), t(" de la parcelle, en unités du repère.")]
          : [t("Donne les bornes "), l("a<b"), t(" de la parcelle, en unités du repère.")];
      }
      const u = uniteLongueur(e);
      const base = e.situation === "mur" ? "du bord supérieur du rectangle" : e.contexte === "gouttiere" ? "du bord supérieur de la gouttière" : "du sol";
      if (e.modele === "retrouver") {
        return [
          t(`Choisis un repère : l'axe des abscisses le long ${base}, l'origine où tu veux sur cet axe, unité 1 ${u}. Donne une équation de l'arc (coefficients exacts ou arrondis au millième) et les bornes `),
          l("a<b"),
          t(" de l'intégrale : les abscisses des pieds de l'arc."),
        ];
      }
      return [t("Détermine les bornes "), l("a<b"), t(` de l'intégrale : les abscisses des points où l'arc rejoint ${base.replace(/^du /, "le ")}.`)];
    }
    case "aire": {
      const objet = e.situation === "mur" ? "de la partie arrondie du mur" : e.situation === "vitrail" ? "de la lentille de verre rouge" : e.situation === "section" ? `de la section ${NOM_SECTION[e.contexte]}` : "de la parcelle";
      const unite = e.situation === "parcelle" ? "unités d'aire du repère" : uniteAireTexte(e);
      return [t(`Calcule l'aire ${objet}, en ${unite}. ${CONSIGNE_PRECISION}`)];
    }
    case "total":
      if (e.situation === "mur") return [t(`Calcule l'aire totale du mur à peindre, en m². ${PRECISION_CONTEXTE}`)];
      if (e.situation === "vitrail") return [t(`Calcule l'aire de verre clair, en dm². ${PRECISION_CONTEXTE}`)];
      return [t(`Convertis l'aire de la parcelle en m². ${PRECISION_CONTEXTE}`)];
    case "peinture":
      return [t("Combien de litres de peinture faut-il pour les deux couches (arrondi au centième) ? Combien de pots faut-il acheter ?")];
    case "cout":
      if (e.situation === "parcelle") return [t("Quelle est la valeur de la parcelle, en euros (arrondie à l'euro) ?")];
      if (e.situation === "vitrail") return [t("Calcule le coût total du verre du vitrail, en euros (au centime près).")];
      return [t("Quel est le coût de la peinture, en euros ?")];
    case "volume":
      if (e.situation !== "section") return [];
      return e.contexte === "gouttiere"
        ? [t(`Calcule le volume d'eau contenu dans la gouttière pleine, en litres. ${PRECISION_CONTEXTE}`)]
        : [t(`Calcule le volume ${e.contexte === "canal" ? "d'eau contenu dans le canal plein" : "de terre à évacuer"}, en m³. ${PRECISION_CONTEXTE}`)];
  }
}

export function champsEcran(e: ExerciceAiresFormesReelles, phase: PhaseFormesReelles): ChampDef[] {
  const valeur = (label: string, placeholder = "ex : 12,5", labelLatex?: string): ChampDef => ({ type: "valeur", label, placeholder, ...(labelLatex ? { labelLatex } : {}) });
  switch (phase) {
    case "modeliser": {
      if (e.situation === "vitrail") return [valeur("x₁ =", "ex : 1,5", "x_1="), valeur("x₂ =", "ex : 6,5", "x_2=")];
      const bornes = [valeur("a =", "ex : -2", "a="), valeur("b =", "ex : 4", "b=")];
      if (e.modele === "retrouver") return [{ type: "fonction", label: "f(x) =", labelLatex: "f(x)=", placeholder: "ex : 0,5(x-1)(x+3)" }, ...bornes];
      return bornes;
    }
    case "aire":
      return [valeur(`Aire (${uniteAireTexte(e)}) =`, "ex : 17/3")];
    case "total":
      return [valeur(e.situation === "mur" ? "Surface du mur (m²) =" : e.situation === "vitrail" ? "Verre clair (dm²) =" : "Aire (m²) =")];
    case "peinture":
      return [valeur("Peinture (L) ="), valeur("Nombre de pots =", "ex : 4")];
    case "cout":
      return [valeur(e.situation === "parcelle" ? "Valeur (€) =" : "Coût (€) =", "ex : 125,40")];
    case "volume":
      return [valeur(e.situation === "section" && e.contexte === "gouttiere" ? "Volume (L) =" : "Volume (m³) =")];
  }
}

// ============================================================================
// Réponses attendues (écran, récapitulatif, corrigé).
// ============================================================================

/** Modèle du corrigé : équation (si à retrouver) et bornes. */
export function modeleCorrigeTex(e: ExerciceAiresFormesReelles): string[] {
  const [a, b] = bornesCorrige(e);
  if (e.situation === "vitrail") return [`x_1=${bornesVitrailTex(e)[0]}`, `x_2=${bornesVitrailTex(e)[1]}`];
  const bornes = [`a=${representer(a, prefere(e)).tex}`, `b=${representer(b, prefere(e)).tex}`];
  if (e.modele === "donnee") return bornes;
  return [`${fonctionCorrigeTex(e)}`, ...bornes];
}

/** « f(x) = … » (ou « f(x) ≈ … ») de la fonction du corrigé. */
export function fonctionCorrigeTex(e: ExerciceAiresFormesReelles): string {
  if (e.situation === "vitrail") return "";
  if (e.situation === "parcelle") {
    const c = representer(e.alpha, prefere(e));
    const m = representer(e.m, false).tex;
    const k = representer(e.k, false).tex;
    return `f(x)${c.exact ? "=" : "\\approx"}${c.tex === "-1" ? "-" : c.tex}(x-${m})^2+${k}`;
  }
  const r = arcTex(arcExercice(e), e.repere, prefere(e));
  return `f(x)${r.exact ? "=" : "\\approx"}${r.tex}`;
}

/** Bornes du vitrail : entiers, ou m ± √s (simplifiée). */
export function bornesVitrailTex(e: Extract<ExerciceAiresFormesReelles, { situation: "vitrail" }>): [string, string] {
  const { radicande } = racineSimplifiee(e.s);
  if (radicande === 1) {
    const d = Math.sqrt(e.s);
    return [representer(e.m - d, false).tex, representer(e.m + d, false).tex];
  }
  const m = representer(e.m, false).tex;
  const r = racineLatex(e.s);
  return [`${m}-${r}\\approx ${decimalLatex(e.m - Math.sqrt(e.s), 2)}`, `${m}+${r}\\approx ${decimalLatex(e.m + Math.sqrt(e.s), 2)}`];
}

/** Valeur exacte de l'aire courbe quand elle a une forme close lisible (vitrail : q√s). */
function aireExacteTex(e: ExerciceAiresFormesReelles): string | null {
  if (e.situation !== "vitrail") return null;
  const { coef, radicande } = racineSimplifiee(e.s);
  if (radicande === 1) return null;
  const q = representer((4 / 3) * e.A * e.s * coef, true);
  return q.exact ? `${q.tex === "1" ? "" : q.tex}\\sqrt{${radicande}}` : null;
}

export function aireTex(e: ExerciceAiresFormesReelles): string {
  return `\\mathcal{A}${egalExactPuisApprox(aireCourbe(e), aireExacteTex(e))}${uniteAireTex(e)}`;
}

/** Décimal au centième, milliers séparés au-delà de 9 999. */
function decimalGroupeLatex(v: number): string {
  const brut = decimalLatex(v, 2);
  const [ent, dec] = brut.split("{,}");
  const signe = ent.startsWith("-") ? "-" : "";
  return signe + grouper(ent.replace("-", ""), "\\,") + (dec !== undefined ? `{,}${dec}` : "");
}

function valeurContexteTex(v: number): string {
  const fr = fractionDepuisValeur(v, 12);
  const auCentieme = Math.abs(v * 100 - Math.round(v * 100)) < 1e-6;
  if (fr && fr.den !== 1 && !auCentieme) return `=${fractionLatex(fr.num, fr.den)}\\approx ${decimalGroupeLatex(v)}`;
  return auCentieme ? `=${decimalGroupeLatex(v)}` : `\\approx ${decimalGroupeLatex(v)}`;
}

export function totalTex(e: ExerciceAiresFormesReelles): string {
  const v = valeurTotal(e);
  if (e.situation === "mur") return `S${valeurContexteTex(v)}\\text{ m}^2`;
  if (e.situation === "vitrail") return `\\mathcal{A}_{\\text{clair}}${valeurContexteTex(v)}\\text{ dm}^2`;
  return `\\mathcal{A}${valeurContexteTex(v)}\\text{ m}^2`;
}

export function coutTex(e: ExerciceAiresFormesReelles): string {
  const v = valeurCout(e);
  if (e.situation === "parcelle") {
    const arrondiEuro = Math.round(v);
    return `\\text{valeur}${Math.abs(v - arrondiEuro) < 1e-6 ? "=" : "\\approx "}${eurosLatex(arrondiEuro)}\\text{ €}`;
  }
  const exact = Math.abs(v * 100 - Math.round(v * 100)) < 1e-6;
  return `\\text{coût}${exact ? "=" : "\\approx "}${eurosLatex(v)}\\text{ €}`;
}

export function volumeTex(e: ExerciceSectionFormesReelles): string {
  return `V${valeurContexteTex(valeurVolume(e))}${uniteVolumeTex(e)}`;
}

export function formatReponseAttenduePhaseLatex(e: ExerciceAiresFormesReelles, phase: PhaseFormesReelles): string[] {
  switch (phase) {
    case "modeliser":
      return modeleCorrigeTex(e);
    case "aire":
      return [aireTex(e)];
    case "total":
      return [totalTex(e)];
    case "peinture": {
      if (e.situation !== "mur") return [];
      return [`\\text{peinture}${valeurContexteTex(litresPeinture(e))}\\text{ L}`, `${nombrePots(e)}\\text{ pot${nombrePots(e) > 1 ? "s" : ""}}`];
    }
    case "cout":
      return [coutTex(e)];
    case "volume":
      return e.situation === "section" ? [volumeTex(e)] : [];
  }
}

// ============================================================================
// Intégrale du corrigé.
// ============================================================================

/** Coefficients croissants de l'intégrande dans le repère du corrigé (f, ou f − g pour le vitrail). */
export function integrandeCoeffs(e: ExerciceAiresFormesReelles): number[] {
  if (e.situation === "vitrail") {
    const { f, g } = coefficientsVitrail(e);
    return f.map((v, i) => v - g[i]);
  }
  if (e.situation === "parcelle") return coefficientsParcelle(e);
  return coefficientsArc(arcExercice(e), e.repere);
}

/** « ∫ₐᵇ (…) dx = [F(x)]ₐᵇ = valeur » (valeur signée). */
export function calculIntegraleTex(e: ExerciceAiresFormesReelles): string {
  const coeffs = integrandeCoeffs(e);
  const [a, b] = bornesCorrige(e);
  // Coefficients exacts (fractions jusqu'au dénominateur 1000) : l'égalité du calcul reste vraie.
  const integrande = polyTex(coeffs, prefere(e), 1000).tex;
  const prim = polyTex(primitiveCoeffs(coeffs), true, 1000).tex;
  const aTex = e.situation === "vitrail" ? "x_1" : representer(a, prefere(e)).tex;
  const bTex = e.situation === "vitrail" ? "x_2" : representer(b, prefere(e)).tex;
  const valeur = e.situation === "vitrail" ? aireCourbe(e) : integraleSignee(e);
  const verif = evaluerPoly(primitiveCoeffs(coeffs), b) - evaluerPoly(primitiveCoeffs(coeffs), a);
  const exactTex = Math.abs(verif - valeur) < 1e-6 ? aireExacteTex(e) : null;
  return `\\int_{${aTex}}^{${bTex}}\\left(${integrande}\\right)dx=\\left[${prim}\\right]_{${aTex}}^{${bTex}}${egalExactPuisApprox(valeur, exactTex)}`;
}

// ============================================================================
// Aides (jamais la réponse finale).
// ============================================================================

const AUCUNE: AideAvecLatex = { texte: "", latex: null };

export function aideNiveau1(e: ExerciceAiresFormesReelles, phase: PhaseFormesReelles): AideAvecLatex {
  switch (phase) {
    case "modeliser":
      if (e.situation === "vitrail") return { texte: "Les deux arcs se rejoignent là où leurs ordonnées sont égales :", latex: "f(x)=g(x)" };
      if (e.situation === "parcelle") {
        return e.modele === "retrouver"
          ? { texte: "Le point de la berge le plus éloigné de la route est le sommet de la parabole ; avec une unité de 10 m, ses coordonnées sont :", latex: `(${representer(e.m, false).tex}\\,;\\,${representer(e.k, false).tex})` }
          : { texte: "Une unité du repère vaut 10 m : une clôture à 10 m du pont est sur la droite d'équation :", latex: "x=1" };
      }
      if (e.modele === "retrouver") {
        const arc = arcExercice(e);
        return { texte: "Avec l'origine au pied gauche de l'arc, la parabole s'annule en 0 et à l'autre pied :", latex: `f(x)=c\\,x\\,(x-${representer(arc.largeur, false).tex})` };
      }
      return { texte: "Les pieds de l'arc sont les points où la courbe coupe l'axe des abscisses :", latex: "f(x)=0" };
    case "aire":
      if (e.situation === "vitrail") return { texte: "Entre les deux intersections, l'arc de f est au-dessus de celui de g :", latex: "\\mathcal{A}=\\int_{x_1}^{x_2}\\left(f(x)-g(x)\\right)dx" };
      if (e.situation === "section" && e.contexte !== "tunnel") return { texte: "L'arc est sous l'axe des abscisses : f est négative entre les bornes, donc l'aire est l'opposé de l'intégrale :", latex: "\\mathcal{A}=-\\int_a^b f(x)\\,dx" };
      return { texte: "f est positive entre les bornes, donc l'aire est l'intégrale de f :", latex: "\\mathcal{A}=\\int_a^b f(x)\\,dx" };
    case "total":
      if (e.situation === "mur") return { texte: "Le mur est formé du rectangle et de la partie arrondie :", latex: "S=L\\times h+\\mathcal{A}_{\\text{arc}}" };
      if (e.situation === "vitrail") return { texte: "Le verre clair occupe le vitrail, sauf la lentille rouge :", latex: "\\mathcal{A}_{\\text{clair}}=W\\times H-\\mathcal{A}_{\\text{rouge}}" };
      return { texte: "Une unité d'aire est un carré de 10 m sur 10 m :", latex: "1\\text{ u.a.}=10\\text{ m}\\times 10\\text{ m}=100\\text{ m}^2" };
    case "peinture":
      return { texte: "Deux couches : on couvre deux fois la surface, et un litre couvre r m² :", latex: "\\text{litres}=\\dfrac{2\\times S}{r}" };
    case "cout":
      if (e.situation === "mur") return { texte: "On paie chaque pot acheté :", latex: "\\text{coût}=\\text{nombre de pots}\\times\\text{prix d'un pot}" };
      if (e.situation === "vitrail") return { texte: "Les prix sont au m² et les aires en dm² ; convertis d'abord les aires :", latex: "1\\text{ dm}^2=0{,}01\\text{ m}^2" };
      return { texte: "La valeur est proportionnelle à l'aire en m² :", latex: "\\text{valeur}=\\text{aire en m}^2\\times\\text{prix au m}^2" };
    case "volume":
      return { texte: "L'ouvrage est un prisme droit : son volume est l'aire de sa section multipliée par sa longueur :", latex: "V=\\mathcal{A}_{\\text{section}}\\times\\ell" };
  }
}

export function aideNiveau2(e: ExerciceAiresFormesReelles, phase: PhaseFormesReelles): AideAvecLatex {
  switch (phase) {
    case "modeliser": {
      if (e.situation === "vitrail") {
        const { f, g } = coefficientsVitrail(e);
        return { texte: "Équation à résoudre, une fois tout passé dans le même membre :", latex: `${polyTex(f.map((v, i) => v - g[i]), prefere(e)).tex}=0` };
      }
      if (e.situation === "parcelle") {
        if (e.modele === "retrouver") {
          const y0 = e.alpha * e.m * e.m + e.k;
          return { texte: "Forme canonique, puis le point du pied du pont pour trouver c :", latex: `f(x)=c(x-${representer(e.m, false).tex})^2+${representer(e.k, false).tex}\\quad\\text{et}\\quad f(0)=${representer(y0, false).tex}` };
        }
        return { texte: "Divise chaque distance au pont, en mètres, par 10 :", latex: "x=\\dfrac{\\text{distance en m}}{10}" };
      }
      const arc = arcExercice(e);
      if (e.modele === "retrouver") {
        const demi = representer(arc.largeur / 2, false).tex;
        return { texte: "Le sommet est au milieu des deux pieds : remplace x par son abscisse pour trouver c :", latex: `f(${demi})=${representer(arc.sens * arc.fleche, false).tex}` };
      }
      return { texte: "Équation à résoudre :", latex: `${fonctionDonneeArc(e)}=0` };
    }
    case "aire": {
      const prim = polyTex(primitiveCoeffs(integrandeCoeffs(e)), true).tex;
      return { texte: e.situation === "vitrail" ? "Une primitive de f − g :" : "Une primitive de f :", latex: `F(x)=${prim}` };
    }
    case "total":
      if (e.situation === "mur") return { texte: "Avec les dimensions du mur :", latex: `S=${representer(e.L, false).tex}\\times ${representer(e.h, false).tex}+\\mathcal{A}_{\\text{arc}}` };
      if (e.situation === "vitrail") return { texte: "Avec les dimensions du vitrail :", latex: `\\mathcal{A}_{\\text{clair}}=${representer(e.W, false).tex}\\times ${representer(e.H, false).tex}-\\mathcal{A}_{\\text{rouge}}` };
      return { texte: "Multiplie l'aire en u.a. par :", latex: "100" };
    case "peinture":
      return e.situation === "mur"
        ? { texte: "Un pot entamé s'achète entier : on arrondit à l'unité SUPÉRIEURE le quotient :", latex: `\\dfrac{\\text{litres}}{${representer(e.contenance, false).tex}}` }
        : AUCUNE;
    case "cout":
      if (e.situation === "mur") return { texte: "Prix d'un pot :", latex: `${eurosLatex(e.prixPot)}\\text{ €}` };
      if (e.situation === "vitrail") return { texte: "Chaque verre à son prix :", latex: `\\text{coût}=\\dfrac{\\mathcal{A}_{\\text{rouge}}}{100}\\times ${eurosLatex(e.prixColore)}+\\dfrac{\\mathcal{A}_{\\text{clair}}}{100}\\times ${eurosLatex(e.prixClair)}` };
      return e.situation === "parcelle" ? { texte: "Prix au m² :", latex: `${eurosLatex(e.prix)}\\text{ €}` } : AUCUNE;
    case "volume":
      if (e.situation !== "section") return AUCUNE;
      return e.contexte === "gouttiere"
        ? { texte: "L'aire est en cm² : exprime la longueur en cm, puis convertis les cm³ en litres :", latex: `${representer(e.longueur, false).tex}\\text{ m}=${representer(100 * e.longueur, false).tex}\\text{ cm}\\quad\\text{et}\\quad 1\\text{ L}=1000\\text{ cm}^3` }
        : { texte: "Longueur de l'ouvrage :", latex: `\\ell=${representer(e.longueur, false).tex}\\text{ m}` };
  }
}

// Ré-export utile à l'adaptateur et aux figures.
export { bornesArc };

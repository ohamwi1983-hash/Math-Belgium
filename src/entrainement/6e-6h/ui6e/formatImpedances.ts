import {
  DECIMALES_ARGUMENT,
  DECIMALES_INTENSITE,
  DECIMALES_MODULE,
  argumentDegres,
  capaciteMicroFarad,
  impedanceTotale,
  inductanceMilliHenry,
  intensite,
  moduleZ,
  nettoyer,
  reactanceBranche,
} from "../core6e/impedancesComplexes";
import type { ExerciceImpedances, NatureCircuit } from "../core6e/impedancesComplexes";
import type { PhaseImpedances } from "../moteur6e/typesImpedances";

/**
 * Couche C (6e) — textes de `6gen96` « Électricité : impédances complexes ». SOURCE UNIQUE des
 * consignes, aides et réponses attendues : l'écran, le récapitulatif et l'adaptateur de feuilles
 * (`generateurs6e/impedancesComplexes/exportEvaluation.ts`) en dérivent.
 *
 * Notation des électriciens (décision de l'utilisateur), annoncée à l'élève dans chaque énoncé :
 * l'unité imaginaire se note `j` (`j^2=-1`, j joue le rôle de i, car i désigne l'intensité). Comme
 * dans la section « Forme trigonométrique » du cours (application « Décrire un courant électrique
 * alternatif » : `Z=3+4j`), un complexe s'écrit `a+bj`. Unités : `\Omega`, `\text{mH}`, `\mu\text{F}`,
 * `\text{rad/s}`, `\text{V}`, `\text{A}`, degrés `^\circ`. Aides : phrase terminée par « : » puis la
 * formule, jamais la réponse finale.
 */

export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

export interface ChampDef {
  /** Texte brut (aria-label, résumé « Votre réponse »). */
  label: string;
  labelLatex?: string;
  placeholder: string;
}

export interface AideAvecLatex {
  texte: string;
  latex?: string;
}

export interface OptionNature {
  id: NatureCircuit;
  fragments: FragmentConsigne[];
}

const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

// ============================================================================
// Nombres.
// ============================================================================

/** Nombre décimal français en TEXTE (« 12,5 », « −40 »), au plus `maxDec` décimales, zéros inutiles retirés. */
export function nombreTexte(v: number, maxDec = 3): string {
  const s = nettoyer(v, maxDec).toString();
  return s.replace("-", "−").replace(".", ",");
}

/** Même nombre en LaTeX (« 12{,}5 », « -40 »). */
export function nombreLatex(v: number, maxDec = 3): string {
  return nettoyer(v, maxDec).toString().replace(".", "{,}");
}

/** Arrondi à `dec` décimales, zéros conservés (« 44{,}7 », « 0{,}0 »), en LaTeX. */
export function arrondiLatex(v: number, dec: number): string {
  const s = (Math.round(v * 10 ** dec) / 10 ** dec).toFixed(dec);
  return (/^-0(\.0*)?$/.test(s) ? s.slice(1) : s).replace(".", "{,}");
}

/** « = » si la valeur s'écrit exactement avec `dec` décimales, « \approx » sinon. */
function egalOuEnviron(v: number, dec: number): string {
  return Math.abs(v * 10 ** dec - Math.round(v * 10 ** dec)) < 1e-6 ? "=" : "\\approx ";
}

/** Complexe a + bj en LaTeX : « 40+40j », « 19{,}2-14{,}4j », « -40j », « 30 ». */
export function complexeLatex(re: number, im: number): string {
  const r = re === 0 ? "" : nombreLatex(re);
  if (im === 0) return r || "0";
  const corps = `${nombreLatex(Math.abs(im))}j`;
  if (im < 0) return `${r}-${corps}`;
  return r ? `${r}+${corps}` : corps;
}

/** Terme entre parenthèses s'il est négatif (pour l'élever au carré, le diviser…). */
function parenthese(v: number): string {
  return v < 0 ? `(${nombreLatex(v)})` : nombreLatex(v);
}

/** L en henrys (« 0{,}08 », « 1{,}5 »). */
function inductanceHenryLatex(e: ExerciceImpedances): string {
  return nombreLatex(inductanceMilliHenry(e) / 1000, 6);
}

/** C en farads, écrit avec 10⁻⁶ (« 25\cdot10^{-6} »). */
function capaciteFaradLatex(e: ExerciceImpedances): string {
  return `${nombreLatex(capaciteMicroFarad(e), 1)}\\cdot10^{-6}`;
}

// ============================================================================
// Données de l'énoncé.
// ============================================================================

export function tensionLatex(e: ExerciceImpedances): string {
  return `U=${e.U}\\,\\text{V}`;
}

export function pulsationLatex(e: ExerciceImpedances): string {
  return `\\omega=${e.omega}\\,\\text{rad/s}`;
}

export function resistanceLatex(e: ExerciceImpedances): string {
  return `R=${e.R}\\,\\Omega`;
}

export function inductanceLatex(e: ExerciceImpedances): string {
  return `L=${nombreLatex(inductanceMilliHenry(e), 1)}\\,\\text{mH}`;
}

export function capaciteLatex(e: ExerciceImpedances): string {
  return `C=${nombreLatex(capaciteMicroFarad(e), 1)}\\,\\mu\\text{F}`;
}

/** Description du circuit (une phrase) — écran et papier. */
export function descriptionCircuit(e: ExerciceImpedances): FragmentConsigne[] {
  const debut = [t("Un circuit est alimenté par une tension alternative de valeur efficace "), l(tensionLatex(e)), t(" et de pulsation "), l(pulsationLatex(e)), t(".")];
  if (e.variante === "parallele") {
    const autre = e.xL !== null ? [t("une bobine d'inductance "), l(inductanceLatex(e))] : [t("un condensateur de capacité "), l(capaciteLatex(e))];
    return [...debut, t(" Il comporte deux branches en parallèle : une résistance "), l(resistanceLatex(e)), t(" dans la première, "), ...autre, t(" dans la seconde.")];
  }
  const composants: FragmentConsigne[][] = [[t("une résistance "), l(resistanceLatex(e))]];
  if (e.xL !== null) composants.push([t("une bobine d'inductance "), l(inductanceLatex(e))]);
  if (e.xC !== null) composants.push([t("un condensateur de capacité "), l(capaciteLatex(e))]);
  const liste: FragmentConsigne[] = [];
  composants.forEach((c, i) => {
    if (i > 0) liste.push(t(i === composants.length - 1 ? " et " : ", "));
    liste.push(...c);
  });
  return [...debut, t(" Il comporte, en série, "), ...liste, t(".")];
}

/** Rappel de la notation j (décision de l'utilisateur : dit explicitement à l'élève). */
export const RAPPEL_J: FragmentConsigne[] = [
  t("En électricité, l'unité imaginaire se note "),
  l("j"),
  t(" (avec "),
  l("j^2=-1"),
  t(") : "),
  l("j"),
  t(" joue le rôle de "),
  l("i"),
  t(", car la lettre "),
  l("i"),
  t(" désigne l'intensité du courant."),
];

/** Formules des impédances utiles à CE circuit (et règle d'association). */
export function rappelImpedances(e: ExerciceImpedances): FragmentConsigne[] {
  const formules = ["Z_R=R"];
  if (e.xL !== null) formules.push("Z_L=jL\\omega");
  if (e.xC !== null) formules.push("Z_C=\\dfrac{1}{jC\\omega}");
  const unites = e.xL !== null && e.xC !== null ? " (L en henrys, C en farads)" : e.xL !== null ? " (L en henrys)" : " (C en farads)";
  const fr: FragmentConsigne[] = [t("Impédances : ")];
  formules.forEach((f, i) => {
    if (i > 0) fr.push(t(", "));
    fr.push(l(f));
  });
  fr.push(t(`${unites}. `));
  if (e.variante === "parallele") fr.push(t("En parallèle, les inverses s'additionnent : "), l(`\\dfrac{1}{Z}=\\dfrac{1}{Z_R}+\\dfrac{1}{${nomReactif(e)}}`), t("."));
  else fr.push(t("En série, les impédances s'additionnent."));
  return fr;
}

/** Nom des impédances de branche en parallèle (Z₁ = R, Z₂ = composant réactif). */
export function nomReactif(e: ExerciceImpedances): string {
  return e.xL !== null ? "Z_L" : "Z_C";
}

// ============================================================================
// Consignes d'écran.
// ============================================================================

export function consigneGenerale(e: ExerciceImpedances): FragmentConsigne[] {
  return [...descriptionCircuit(e), t(" "), ...RAPPEL_J];
}

export function libellePhase(phase: PhaseImpedances): string {
  switch (phase) {
    case "composants":
      return "Impédance des composants";
    case "totale":
      return "Impédance totale";
    case "polaire":
      return "Module et déphasage";
    case "intensite":
      return "Intensité efficace";
    case "nature":
      return "Nature du circuit";
  }
}

export function consigneEcran(e: ExerciceImpedances, phase: PhaseImpedances): FragmentConsigne[] {
  switch (phase) {
    case "composants": {
      const deux = e.xL !== null && e.xC !== null;
      const formules: FragmentConsigne[] = [];
      const conversions: FragmentConsigne[] = deux
        ? [t("L s'exprime en henrys et C en farads : "), l("1\\,\\text{mH}=10^{-3}\\,\\text{H}"), t(", "), l("1\\,\\mu\\text{F}=10^{-6}\\,\\text{F}"), t(".")]
        : e.xL !== null
          ? [t("L s'exprime en henrys : "), l("1\\,\\text{mH}=10^{-3}\\,\\text{H}"), t(".")]
          : [t("C s'exprime en farads : "), l("1\\,\\mu\\text{F}=10^{-6}\\,\\text{F}"), t(".")];
      if (e.xL !== null) formules.push(l("Z_L=jL\\omega"));
      if (deux) formules.push(t(" et "));
      if (e.xC !== null) formules.push(l("Z_C=\\dfrac{1}{jC\\omega}"));
      return [
        t(deux ? "Calcule l'impédance complexe de la bobine et celle du condensateur, " : e.xL !== null ? "Calcule l'impédance complexe de la bobine, " : "Calcule l'impédance complexe du condensateur, "),
        ...formules,
        t(", sous la forme "),
        l("bj"),
        t(" ("),
        l("b"),
        t(" en ohms, positif ou négatif). "),
        ...conversions,
      ];
    }
    case "totale":
      if (e.variante === "parallele")
        return [
          t("Les deux branches sont en parallèle, d'impédances "),
          l("Z_1=R"),
          t(" et "),
          l(`Z_2=${nomReactif(e)}`),
          t(" : "),
          l("\\dfrac{1}{Z}=\\dfrac{1}{Z_1}+\\dfrac{1}{Z_2}"),
          t(", c'est-à-dire "),
          l("Z=\\dfrac{Z_1Z_2}{Z_1+Z_2}"),
          t(". Écris l'impédance totale "),
          l("Z"),
          t(" sous forme algébrique "),
          l("a+bj"),
          t(" : donne sa partie réelle et sa partie imaginaire exactes, en ohms."),
        ];
      return [t("Les composants sont en série : leurs impédances s'additionnent. Écris l'impédance totale "), l("Z"), t(" sous forme algébrique "), l("a+bj"), t(" : donne sa partie réelle et sa partie imaginaire, en ohms.")];
    case "polaire":
      return [
        t("Calcule le module "),
        l("|Z|"),
        t(" (en ohms, arrondi au dixième) et un argument "),
        l("\\varphi=\\arg Z"),
        t(" (en degrés, arrondi au dixième). Comme "),
        l("\\mathrm{Re}(Z)>0"),
        t(", "),
        l("\\varphi"),
        t(" est compris entre "),
        l("-90^\\circ"),
        t(" et "),
        l("90^\\circ"),
        t(" : c'est le déphasage entre la tension et le courant."),
      ];
    case "intensite":
      return [t("En alternatif, la loi d'Ohm relie les valeurs efficaces par le module de l'impédance : "), l("I=\\dfrac{U}{|Z|}"), t(". Calcule l'intensité efficace du courant, en ampères, arrondie au centième.")];
    case "nature":
      return [t("Le signe du déphasage "), l("\\varphi=\\arg Z"), t(" donne la nature du circuit. Quelle est-elle ?")];
  }
}

export function champsEcran(e: ExerciceImpedances, phase: PhaseImpedances): ChampDef[] {
  const exact = e.variante === "parallele" ? "valeur exacte, ex : 7,2" : "en ohms, ex : 35";
  switch (phase) {
    case "composants": {
      const champs: ChampDef[] = [];
      if (e.xL !== null) champs.push({ label: "Z_L (en Ω)", labelLatex: "Z_L\\ (\\text{en }\\Omega)", placeholder: "forme bj, ex : 25j" });
      if (e.xC !== null) champs.push({ label: "Z_C (en Ω)", labelLatex: "Z_C\\ (\\text{en }\\Omega)", placeholder: "forme bj, ex : −12j" });
      return champs;
    }
    case "totale":
      return [
        { label: "Re(Z) (en Ω)", labelLatex: "\\mathrm{Re}(Z)\\ (\\text{en }\\Omega)", placeholder: exact },
        { label: "Im(Z) (en Ω)", labelLatex: "\\mathrm{Im}(Z)\\ (\\text{en }\\Omega)", placeholder: e.variante === "parallele" ? "valeur exacte, ex : −9,6" : "en ohms, ex : −15" },
      ];
    case "polaire":
      return [
        { label: "|Z| (en Ω)", labelLatex: "|Z|\\ (\\text{en }\\Omega)", placeholder: "au dixième, ex : 36,1" },
        { label: "φ (en degrés)", labelLatex: "\\varphi\\ (\\text{en degrés})", placeholder: "au dixième, ex : −33,7" },
      ];
    case "intensite":
      return [{ label: "I (en A)", labelLatex: "I\\ (\\text{en A})", placeholder: "au centième, ex : 2,47" }];
    case "nature":
      return [];
  }
}

export const OPTIONS_NATURE: OptionNature[] = [
  { id: "inductif", fragments: [t("Inductif : "), l("\\varphi>0"), t(", le courant est en retard sur la tension.")] },
  { id: "capacitif", fragments: [t("Capacitif : "), l("\\varphi<0"), t(", le courant est en avance sur la tension.")] },
  { id: "resistif", fragments: [t("Résistif : "), l("\\varphi=0"), t(", le courant est en phase avec la tension.")] },
];

export const NOM_NATURE: Record<NatureCircuit, string> = { inductif: "inductif", capacitif: "capacitif", resistif: "résistif" };

// ============================================================================
// Calculs détaillés (validation, récapitulatif, corrigé).
// ============================================================================

export function calculBobineLatex(e: ExerciceImpedances): string {
  return `Z_L=jL\\omega=j\\times${inductanceHenryLatex(e)}\\times${e.omega}=${e.xL}j\\ \\Omega`;
}

export function calculCondensateurLatex(e: ExerciceImpedances): string {
  return `Z_C=\\dfrac{1}{jC\\omega}=-\\dfrac{j}{C\\omega}=-\\dfrac{j}{${capaciteFaradLatex(e)}\\times${e.omega}}=-${e.xC}j\\ \\Omega`;
}

/** Développement de 1/j = −j (pour le corrigé). */
export const UN_SUR_J_LATEX = "\\dfrac{1}{j}=\\dfrac{j}{j^2}=-j";

export function formeAlgebriqueLatex(e: ExerciceImpedances): string {
  const z = impedanceTotale(e);
  return complexeLatex(z.re, z.im);
}

/** Calcul de Z (somme en série, produit sur somme puis conjugué en parallèle). */
export function calculTotaleLatex(e: ExerciceImpedances): string {
  if (e.variante === "parallele") {
    const X = reactanceBranche(e);
    const z2 = X < 0 ? `(${complexeLatex(0, X)})` : complexeLatex(0, X);
    const denominateur = complexeLatex(e.R, X);
    const conjugue = complexeLatex(e.R, -X);
    return `Z=\\dfrac{Z_1Z_2}{Z_1+Z_2}=\\dfrac{${e.R}\\times${z2}}{${denominateur}}=\\dfrac{${complexeLatex(0, e.R * X)}\\,(${conjugue})}{${e.R}^2+${X < 0 ? `(${X})` : X}^2}=\\dfrac{${complexeLatex(e.R * X * X, e.R * e.R * X)}}{${e.R * e.R + X * X}}=${formeAlgebriqueLatex(e)}\\ \\Omega`;
  }
  const termes = [`${e.R}`];
  if (e.xL !== null) termes.push(`+${e.xL}j`);
  if (e.xC !== null) termes.push(`-${e.xC}j`);
  const noms = ["Z_R", ...(e.xL !== null ? ["Z_L"] : []), ...(e.xC !== null ? ["Z_C"] : [])].join("+");
  return `Z=${noms}=${termes.join("")}=${formeAlgebriqueLatex(e)}\\ \\Omega`;
}

/** |Z|² exact (entier en série, décimal en parallèle). */
function moduleCarre(e: ExerciceImpedances): number {
  const z = impedanceTotale(e);
  return nettoyer(z.re * z.re + z.im * z.im, 6);
}

export function moduleArrondiLatex(e: ExerciceImpedances): string {
  return arrondiLatex(moduleZ(e), DECIMALES_MODULE);
}

export function argumentArrondiLatex(e: ExerciceImpedances): string {
  return arrondiLatex(argumentDegres(e), DECIMALES_ARGUMENT);
}

export function intensiteArrondieLatex(e: ExerciceImpedances): string {
  return arrondiLatex(intensite(e), DECIMALES_INTENSITE);
}

export function calculModuleLatex(e: ExerciceImpedances): string {
  const z = impedanceTotale(e);
  const m = moduleZ(e);
  const racine = `\\sqrt{${nombreLatex(moduleCarre(e), 4)}}`;
  return `|Z|=\\sqrt{${parenthese(z.re)}^2+${parenthese(z.im)}^2}=${racine}${egalOuEnviron(m, DECIMALES_MODULE)}${moduleArrondiLatex(e)}\\ \\Omega`;
}

export function calculArgumentLatex(e: ExerciceImpedances): string {
  const z = impedanceTotale(e);
  const phi = argumentDegres(e);
  return `\\varphi=\\arctan\\dfrac{${nombreLatex(z.im)}}{${nombreLatex(z.re)}}${egalOuEnviron(phi, DECIMALES_ARGUMENT)}${argumentArrondiLatex(e)}^\\circ`;
}

export function calculIntensiteLatex(e: ExerciceImpedances): string {
  const i = intensite(e);
  const m = moduleZ(e);
  const exactModule = Math.abs(m - Math.round(m * 1000) / 1000) < 1e-9;
  const denominateur = exactModule ? nombreLatex(m) : `\\sqrt{${nombreLatex(moduleCarre(e), 4)}}`;
  return `I=\\dfrac{U}{|Z|}=\\dfrac{${e.U}}{${denominateur}}${egalOuEnviron(i, DECIMALES_INTENSITE)}${intensiteArrondieLatex(e)}\\ \\text{A}`;
}

/** Justification de la nature (texte + formule). */
export function justificationNature(e: ExerciceImpedances): FragmentConsigne[] {
  const phi = argumentArrondiLatex(e);
  switch (e.nature) {
    case "inductif":
      return [l(`\\varphi\\approx ${phi}^\\circ>0`), t(" (partie imaginaire de "), l("Z"), t(" positive) : le circuit est inductif, le courant est en retard sur la tension.")];
    case "capacitif":
      return [l(`\\varphi\\approx ${phi}^\\circ<0`), t(" (partie imaginaire de "), l("Z"), t(" négative) : le circuit est capacitif, le courant est en avance sur la tension.")];
    case "resistif":
      return [l("\\mathrm{Im}(Z)=0"), t(", donc "), l("\\varphi=0^\\circ"), t(" : le circuit est résistif (résonance : "), l("L\\omega=\\dfrac{1}{C\\omega}"), t("), le courant est en phase avec la tension.")];
  }
}

export function reponseFragments(e: ExerciceImpedances, phase: PhaseImpedances): FragmentConsigne[] {
  switch (phase) {
    case "composants": {
      const fr: FragmentConsigne[] = [];
      if (e.xL !== null) fr.push(l(calculBobineLatex(e)));
      if (e.xL !== null && e.xC !== null) fr.push(t(" et "));
      if (e.xC !== null) fr.push(l(calculCondensateurLatex(e)));
      return fr;
    }
    case "totale":
      return [l(calculTotaleLatex(e))];
    case "polaire":
      return [l(calculModuleLatex(e)), t(" et "), l(calculArgumentLatex(e))];
    case "intensite":
      return [l(calculIntensiteLatex(e))];
    case "nature":
      return justificationNature(e);
  }
}

export function reponseRecap(e: ExerciceImpedances, phase: PhaseImpedances): string {
  switch (phase) {
    case "composants": {
      const v: string[] = [];
      if (e.xL !== null) v.push(`Z_L=${e.xL}j`);
      if (e.xC !== null) v.push(`Z_C=-${e.xC}j`);
      return `${v.join(",\\ ")}\\ (\\Omega)`;
    }
    case "totale":
      return `Z=${formeAlgebriqueLatex(e)}\\ \\Omega`;
    case "polaire":
      return `|Z|\\approx ${moduleArrondiLatex(e)}\\ \\Omega,\\ \\varphi\\approx ${argumentArrondiLatex(e)}^\\circ`;
    case "intensite":
      return `I\\approx ${intensiteArrondieLatex(e)}\\ \\text{A}`;
    case "nature":
      return `\\text{circuit ${NOM_NATURE[e.nature]}}`;
  }
}

// ============================================================================
// Aides (jamais la réponse finale).
// ============================================================================

function lignes(...formules: string[]): string {
  return `\\begin{gathered}${formules.join("\\\\")}\\end{gathered}`;
}

export function aideNiveau1(e: ExerciceImpedances, phase: PhaseImpedances): AideAvecLatex {
  switch (phase) {
    case "composants":
      return e.xC !== null
        ? {
            texte: e.xL !== null
              ? "La bobine se calcule directement ; pour le condensateur, débarrasse-toi de j au dénominateur en multipliant le numérateur et le dénominateur par j :"
              : "Débarrasse-toi de j au dénominateur en multipliant le numérateur et le dénominateur par j :",
            latex: lignes(...(e.xL !== null ? ["Z_L=jL\\omega"] : []), "j^2=-1:\\quad Z_C=\\dfrac{1}{jC\\omega}=\\dfrac{j}{j^2\\,C\\omega}=-\\dfrac{j}{C\\omega}"),
          }
        : { texte: "L'impédance d'une bobine est imaginaire pure : multiplie j par l'inductance (en henrys) et par la pulsation :", latex: "Z_L=jL\\omega,\\qquad 1\\,\\text{mH}=10^{-3}\\,\\text{H}" };
    case "totale":
      return e.variante === "parallele"
        ? { texte: "Produit sur somme, puis multiplie le numérateur et le dénominateur par le conjugué du dénominateur pour le rendre réel :", latex: lignes("Z=\\dfrac{Z_1Z_2}{Z_1+Z_2}", "(a+bj)(a-bj)=a^2+b^2") }
        : { texte: "En série, on additionne les impédances : les parties réelles entre elles, les parties imaginaires entre elles :", latex: "Z=Z_R+Z_L+Z_C=R+j\\left(L\\omega-\\dfrac{1}{C\\omega}\\right)" };
    case "polaire":
      return { texte: "Module et argument d'un complexe a + bj dont la partie réelle a est positive :", latex: lignes("|Z|=\\sqrt{a^2+b^2}", "\\varphi=\\arctan\\dfrac{b}{a}") };
    case "intensite":
      return { texte: "La loi d'Ohm s'écrit avec le MODULE de l'impédance, pas avec la seule résistance :", latex: "I=\\dfrac{U}{|Z|}" };
    case "nature":
      return { texte: "Comme la partie réelle de Z est positive, φ a le signe de la partie imaginaire de Z :", latex: "\\tan\\varphi=\\dfrac{\\mathrm{Im}(Z)}{\\mathrm{Re}(Z)}" };
  }
}

export function aideNiveau2(e: ExerciceImpedances, phase: PhaseImpedances): AideAvecLatex {
  const z = impedanceTotale(e);
  switch (phase) {
    case "composants": {
      const f: string[] = [];
      if (e.xL !== null) f.push(`Z_L=j\\times${inductanceHenryLatex(e)}\\times${e.omega}`);
      if (e.xC !== null) f.push(`Z_C=-\\dfrac{j}{${capaciteFaradLatex(e)}\\times${e.omega}}`);
      return { texte: "Avec les valeurs de l'énoncé converties en henrys et en farads ; il reste à effectuer les calculs :", latex: lignes(...f) };
    }
    case "totale": {
      if (e.variante === "parallele") {
        const X = reactanceBranche(e);
        return {
          texte: "Avec Z₁ = R et l'impédance Z₂ trouvée ; il reste à multiplier par le conjugué du dénominateur, puis à développer :",
          latex: `Z=\\dfrac{${e.R}\\times${X < 0 ? `(${complexeLatex(0, X)})` : complexeLatex(0, X)}}{${complexeLatex(e.R, X)}}`,
        };
      }
      const termes = [`${e.R}`];
      if (e.xL !== null) termes.push(`+${e.xL}j`);
      if (e.xC !== null) termes.push(`+(-${e.xC}j)`);
      return { texte: "Avec les impédances trouvées ; il reste à regrouper les termes en j :", latex: `Z=${termes.join("")}` };
    }
    case "polaire":
      return { texte: "Avec la partie réelle et la partie imaginaire de Z (calculatrice réglée en degrés pour l'arctangente) :", latex: lignes(`|Z|=\\sqrt{${parenthese(z.re)}^2+${parenthese(z.im)}^2}`, `\\varphi=\\arctan\\dfrac{${nombreLatex(z.im)}}{${nombreLatex(z.re)}}`) };
    case "intensite":
      return { texte: "Avec la tension efficace de l'énoncé et le module trouvé (garde sa valeur la plus précise possible) :", latex: `I=\\dfrac{${e.U}}{\\sqrt{${nombreLatex(moduleCarre(e), 4)}}}` };
    case "nature":
      return { texte: "", latex: undefined };
  }
}

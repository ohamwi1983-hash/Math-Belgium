import katex from "katex";
import { arrondir, chaineLinearisation, DECIMALES_ETAPE, defContexte, logsAttendus, nombreDecimales } from "../core6e/linearisationDonnees";
import type { ExerciceLinearisation, ModeleDonnees } from "../core6e/linearisationDonnees";
import type { PhaseLinearisation } from "../moteur6e/typesLinearisation";
import { OPTIONS_CHOIX, unitePrevision } from "../moteur6e/verificationLinearisation";

/**
 * Couche C (6e) — textes de `6gen89` « Linéariser des données : du tableau au modèle ». SOURCE
 * UNIQUE des consignes, aides, options, tableaux et réponses attendues : l'écran, le récapitulatif
 * et l'adaptateur de feuilles (`generateurs6e/linearisationDonnees/exportEvaluation.ts`) en dérivent.
 *
 * Notations du cours (chapitre 3 de 6e, section « problèmes », méthode « Linéariser des données ») :
 * $\ln$ (logarithme népérien), droite $Y = mX + p$, $k = e^{p}$, $a = e^{m}$ (modèle exponentiel),
 * $n = m$ (modèle puissance) ; virgule décimale `{,}`, signe « − » typographique dans le texte,
 * jamais de prose dans le mode math ; aides = phrase terminée par « : » puis la formule, sans la
 * réponse finale.
 */

export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

export interface ChampDef {
  label: string;
  labelLatex?: string;
  placeholder: string;
  /** Unité affichée après le champ (texte brut). */
  unite?: string;
}

export interface AideAvecLatex {
  texte: string;
  latex?: string;
}

export interface OptionChoix {
  id: string;
  fragments: FragmentConsigne[];
}

const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

// ============================================================================
// Nombres.
// ============================================================================

/** Chiffres d'un nombre avec séparateur des milliers (à partir de 10 000) et virgule. */
function chiffres(v: number, decimales: number, sep: string, virgule: string, moins: string): string {
  const r = arrondir(v, decimales);
  const negatif = r < 0;
  const [ent, dec] = Math.abs(r).toFixed(decimales).split(".");
  const entier = ent.length > 4 ? ent.replace(/\B(?=(\d{3})+(?!\d))/g, sep) : ent;
  return `${negatif ? moins : ""}${entier}${dec ? virgule + dec : ""}`;
}

/** Nombre en LaTeX, avec `decimales` décimales (par défaut : celles du nombre). */
export function nombreLatex(v: number, decimales = nombreDecimales(v)): string {
  return chiffres(v, decimales, "\\,", "{,}", "-");
}

/** Nombre en texte brut (virgule, signe « − », espace insécable des milliers). */
export function nombreTexte(v: number, decimales = nombreDecimales(v)): string {
  return chiffres(v, decimales, "\u00a0", ",", "−");
}

/** « ≈ » ou « = » devant un nombre arrondi à `decimales`. */
export function egalOuEnviron(v: number, decimales: number): string {
  return Math.abs(arrondir(v, decimales) - v) < 1e-9 ? "=" : "\\approx ";
}

/** « à l'unité », « au dixième »… */
export function precisionTexte(decimales: number): string {
  return ["à l'unité", "au dixième", "au centième", "au millième", "au dix-millième"][decimales] ?? `à ${decimales} décimales`;
}

/** Unité en LaTeX (`10⁵ km` → `10^{5}\,\text{km}`). */
export function uniteLatex(u: string): string {
  if (u === "10⁵ km") return "\\times 10^{5}\\,\\text{km}";
  if (u === "milliers/mL") return "\\text{milliers/mL}";
  return `\\text{${u}}`;
}

// ============================================================================
// Symboles des coordonnées.
// ============================================================================

export function varX(e: ExerciceLinearisation): string {
  return defContexte(e.contexte).varX;
}

export function varY(e: ExerciceLinearisation): string {
  return defContexte(e.contexte).varY;
}

/** Ordonnée transformée en LaTeX : `\ln(\theta)` (ou `y` pour le modèle affine). */
export function grandeurYLatex(e: ExerciceLinearisation, modele: ModeleDonnees = e.modele): string {
  return modele === "affine" ? varY(e) : `\\ln(${varY(e)})`;
}

export function grandeurXLatex(e: ExerciceLinearisation, modele: ModeleDonnees = e.modele): string {
  return modele === "puissance" ? `\\ln(${varX(e)})` : varX(e);
}

/** Même chose en texte brut (axes des figures). */
export function grandeurYTexte(e: ExerciceLinearisation, modele: ModeleDonnees = e.modele): string {
  const y = defContexte(e.contexte).varYTexte;
  return modele === "affine" ? y : `ln(${y})`;
}

export function grandeurXTexte(e: ExerciceLinearisation, modele: ModeleDonnees = e.modele): string {
  const x = defContexte(e.contexte).varXTexte;
  return modele === "puissance" ? `ln(${x})` : x;
}

/** Équation de la droite : `\ln(\theta)=m\,t+p`. */
export function droiteLatex(e: ExerciceLinearisation, modele: ModeleDonnees = e.modele): string {
  return `${grandeurYLatex(e, modele)}=m\\,${grandeurXLatex(e, modele)}+p`;
}

/** Modèle cherché : `\theta=k\cdot a^{t}`, `T=k\cdot r^{n}`, `y=m\,x+p`. */
export function modeleLatex(e: ExerciceLinearisation, modele: ModeleDonnees = e.modele): string {
  const x = varX(e);
  const y = varY(e);
  if (modele === "exponentiel") return `${y}=k\\cdot a^{${x}}`;
  if (modele === "puissance") return `${y}=k\\cdot ${x}^{n}`;
  return `${y}=m\\,${x}+p`;
}

/** Abscisse d'une ligne du tableau en LaTeX : `t=4`. */
function ligneLatex(e: ExerciceLinearisation, indice: number): string {
  return `${varX(e)}=${nombreLatex(e.xs[indice])}`;
}

// ============================================================================
// Tableau des mesures.
// ============================================================================

function rendre(expr: string): string {
  return katex.renderToString(expr, { throwOnError: false, output: "html" });
}

const BORD = "border:1px solid #888;padding:0.3em 0.55em;text-align:center;white-space:nowrap";

/** Tableau des mesures (HTML autonome, KaTeX pré-rendu). `vertical` : une ligne par mesure (écran
 * de téléphone) ; sinon une ligne par grandeur (papier). */
export function tableauHtml(e: ExerciceLinearisation, vertical: boolean): string {
  const def = defContexte(e.contexte);
  const enteteX = `${rendre(def.varX)} (${def.uniteX})`;
  const enteteY = `${rendre(def.varY)} (${def.uniteY})`;
  const cellX = e.xs.map((x) => rendre(nombreLatex(x)));
  const cellY = e.ys.map((y) => rendre(nombreLatex(y)));
  if (vertical) {
    const lignes = cellX.map((x, i) => `<tr><td style="${BORD}">${x}</td><td style="${BORD}">${cellY[i]}</td></tr>`).join("");
    return `<div style="overflow-x:auto;max-width:100%"><table style="border-collapse:collapse;margin:0.4em auto"><tr><th style="${BORD}">${enteteX}</th><th style="${BORD}">${enteteY}</th></tr>${lignes}</table></div>`;
  }
  const ligne = (entete: string, cellules: string[]) => `<tr><th style="${BORD}">${entete}</th>${cellules.map((c) => `<td style="${BORD}">${c}</td>`).join("")}</tr>`;
  return `<div style="overflow-x:auto;max-width:100%"><table style="border-collapse:collapse;margin:0.4em auto">${ligne(enteteX, cellX)}${ligne(enteteY, cellY)}</table></div>`;
}

// ============================================================================
// Consigne générale.
// ============================================================================

function situation(e: ExerciceLinearisation): FragmentConsigne[] {
  const pas = e.xs[1] - e.xs[0];
  switch (e.contexte) {
    case "refroidissement":
      return [t(`Un café chaud est posé dans une pièce où il fait ${e.ambiante} °C. Toutes les ${nombreTexte(pas)} minutes, on relève l'écart `), l("\\theta"), t(" (en °C) entre la température du café et celle de la pièce, "), l("t"), t(" minutes après le début des mesures.")];
    case "moore":
      return [t("Selon la loi de Moore, le nombre de transistors d'une puce électronique croît de façon exponentielle. Voici le nombre "), l("N"), t(" de transistors (en millions) des puces d'un fabricant, sorties "), l("t"), t(" années après 2010.")];
    case "bacteries":
      return [t("On suit une culture de bactéries : "), l("N"), t(" est la concentration (en milliers de bactéries par mL) mesurée "), l("t"), t(" heures après le début de l'observation.")];
    case "decharge":
      return [t("Un condensateur se décharge dans une résistance : "), l("U"), t(" est la tension (en V) à ses bornes, "), l("t"), t(" millisecondes après la fermeture de l'interrupteur.")];
    case "desintegration":
      return [t("Un échantillon radioactif est suivi en laboratoire : "), l("A"), t(" est son activité (en becquerels, Bq) mesurée "), l("t"), t(" jours après le début des mesures.")];
    case "kepler":
      return [t("Les lunes d'une planète lointaine décrivent des orbites presque circulaires. Pour chacune, on connaît le rayon "), l("r"), t(" de son orbite (en 10⁵ km) et sa période de révolution "), l("T"), t(" (en heures).")];
    case "metabolisme":
      return [t("Chez les mammifères, la puissance "), l("P"), t(" dégagée au repos (en W) dépend de la masse "), l("M"), t(" de l'animal (en kg). Voici des mesures faites sur plusieurs espèces.")];
    case "chute":
      return [t("Sur une planète inconnue, on lâche une bille sans vitesse initiale et on mesure la distance "), l("d"), t(" (en m) qu'elle a parcourue après "), l("t"), t(" secondes de chute.")];
    case "intensite":
      return [t("Une lampe éclaire une feuille placée à une distance "), l("d"), t(" (en m) ; un luxmètre mesure l'éclairement "), l("E"), t(" (en lux) reçu par la feuille.")];
    case "capteur":
      return [t("Un capteur mesure un signal "), l("y"), t(" (en mV) à différentes distances "), l("x"), t(" (en cm) d'une source.")];
    case "echantillon":
      return [t("Au cours d'une expérience, on mesure la masse "), l("y"), t(" (en g) d'un échantillon, "), l("x"), t(" heures après le début de l'expérience.")];
    case "composant":
      return [t("On mesure la tension "), l("y"), t(" (en V) aux bornes d'un composant électronique pour différentes fréquences "), l("x"), t(" (en kHz).")];
  }
}

function objectif(e: ExerciceLinearisation): FragmentConsigne[] {
  const y = varY(e);
  const x = varX(e);
  switch (e.variante) {
    case "semilog":
      return [t(" On veut vérifier que "), l(y), t(" suit un modèle exponentiel "), l(modeleLatex(e)), t(" en représentant "), l(`\\ln(${y})`), t(" en fonction de "), l(x), t(" (représentation semi-logarithmique), déterminer ce modèle, puis faire une prévision.")];
    case "loglog":
      return [t(" On veut vérifier que "), l(y), t(" suit un modèle puissance "), l(modeleLatex(e)), t(" en représentant "), l(`\\ln(${y})`), t(" en fonction de "), l(`\\ln(${x})`), t(" (représentation log-log), déterminer ce modèle, puis faire une prévision.")];
    case "choisir":
      return [t(" Un seul des trois modèles suivants décrit ces données : affine "), l("y=m\\,x+p"), t(", exponentiel "), l("y=k\\cdot a^{x}"), t(" ou puissance "), l("y=k\\cdot x^{n}"), t(". On cherche la représentation qui aligne les points, puis on s'en sert pour faire une prévision.")];
  }
}

export function consigneGenerale(e: ExerciceLinearisation): FragmentConsigne[] {
  return [...situation(e), ...objectif(e)];
}

// ============================================================================
// Consignes des écrans.
// ============================================================================

/** Question de prévision (sans la précision), selon le contexte. */
function questionPrevision(e: ExerciceLinearisation): FragmentConsigne[] {
  const def = defContexte(e.contexte);
  const c = e.cible;
  const n = (v: number) => nombreTexte(v);
  if (e.typePrevision === "valeur") {
    switch (e.contexte) {
      case "refroidissement":
        return [t(`Estime la température du café (en °C) ${n(c)} minutes après le début des mesures.`)];
      case "moore":
        return [t(`Estime le nombre de transistors (en millions) d'une puce sortie ${n(c)} ans après 2010.`)];
      case "bacteries":
        return [t(`Estime la concentration de bactéries (en milliers par mL) au bout de ${n(c)} heures.`)];
      case "decharge":
        return [t(`Estime la tension aux bornes du condensateur (en V) au bout de ${n(c)} ms.`)];
      case "desintegration":
        return [t(`Estime l'activité de l'échantillon (en Bq) au bout de ${n(c)} jours.`)];
      case "kepler":
        return [t(`Estime la période de révolution (en heures) d'une lune dont l'orbite a un rayon de ${n(c)} × 10⁵ km.`)];
      case "metabolisme":
        return [t(`Estime la puissance dégagée au repos (en W) par un animal de ${n(c)} kg.`)];
      case "chute":
        return [t(`Estime la distance parcourue (en m) après ${n(c)} s de chute.`)];
      case "intensite":
        return [t(`Estime l'éclairement (en lux) reçu par la feuille placée à ${n(c)} m de la lampe.`)];
      default:
        return [t("Estime "), l("y"), t(` (en ${def.uniteY}) pour `), l(`x=${nombreLatex(c)}`), t(".")];
    }
  }
  switch (e.contexte) {
    case "refroidissement":
      return [t(`Au bout de combien de minutes la température du café descendra-t-elle à ${n(c)} °C ?`)];
    case "moore":
      return [t(`Combien d'années après 2010 une puce atteindra-t-elle ${n(c)} millions de transistors ?`)];
    case "bacteries":
      return [t(`Au bout de combien d'heures la concentration atteindra-t-elle ${n(c)} milliers de bactéries par mL ?`)];
    case "decharge":
      return [t(`Au bout de combien de millisecondes la tension descendra-t-elle à ${n(c)} V ?`)];
    case "desintegration":
      return [t(`Au bout de combien de jours l'activité descendra-t-elle à ${n(c)} Bq ?`)];
    case "kepler":
      return [t(`Quel serait le rayon de l'orbite (en 10⁵ km) d'une lune dont la période de révolution vaut ${n(c)} h ?`)];
    case "metabolisme":
      return [t(`Quelle serait la masse (en kg) d'un animal qui dégage ${n(c)} W au repos ?`)];
    case "chute":
      return [t(`Combien de temps (en s) dure une chute de ${n(c)} m ?`)];
    case "intensite":
      return [t(`À quelle distance de la lampe (en m) faut-il placer la feuille pour qu'elle reçoive ${n(c)} lux ?`)];
    default:
      return [t("Pour quelle valeur de "), l("x"), t(" a-t-on "), l(`y=${nombreLatex(c)}`), t(" ?")];
  }
}

/** Précision de la prévision. */
export function precisionPrevision(e: ExerciceLinearisation): string {
  return precisionTexte(chaineLinearisation(e).decimalesPrevision);
}

export const PHRASE_ARRONDIS = " Une petite différence due aux arrondis des étapes précédentes est acceptée.";

/** Consigne de la prévision, autosuffisante (papier compris). */
export function consignePrevision(e: ExerciceLinearisation): FragmentConsigne[] {
  return [...questionPrevision(e), t(` Donne le résultat arrondi ${precisionPrevision(e)}.`)];
}

export function consigneEcran(e: ExerciceLinearisation, phase: PhaseLinearisation): FragmentConsigne[] {
  const [i, j] = e.lignes;
  const c = chaineLinearisation(e);
  const y = varY(e);
  const x = varX(e);
  switch (phase) {
    case "logs":
      return e.modele === "puissance"
        ? [t("Calcule "), l(`\\ln(${x})`), t(" et "), l(`\\ln(${y})`), t(" pour les lignes "), l(ligneLatex(e, i)), t(" et "), l(ligneLatex(e, j)), t(" du tableau (valeurs arrondies au millième).")]
        : [t("Calcule "), l(`\\ln(${y})`), t(" pour les lignes "), l(ligneLatex(e, i)), t(" et "), l(ligneLatex(e, j)), t(" du tableau (valeurs arrondies au millième).")];
    case "choix":
      return [t("Quelle représentation aligne les points du tableau ?")];
    case "pente":
      if (e.variante === "choisir") {
        return [t("Dans cette représentation, les points sont alignés sur une droite d'équation "), l(droiteLatex(e)), t(". Calcule la pente "), l("m"), t(" de la droite qui passe par les points des lignes "), l(ligneLatex(e, i)), t(" et "), l(ligneLatex(e, j)), t(" (arrondie au millième).")];
      }
      return [t("Les points "), l(`\\left(${grandeurXLatex(e)}\\,;\\,${grandeurYLatex(e)}\\right)`), t(" sont alignés sur une droite d'équation "), l(droiteLatex(e)), t(". Calcule la pente "), l("m"), t(" de la droite qui passe par les deux points de l'étape précédente (arrondie au millième).")];
    case "ordonnee":
      return [t("Calcule l'ordonnée à l'origine "), l("p"), t(" de cette droite (arrondie au millième).")];
    case "modele":
      return e.modele === "exponentiel"
        ? [t("Déduis-en le modèle "), l(modeleLatex(e)), t(" : donne "), l("k"), t(` (arrondi ${precisionTexte(c.decimalesK)}) et `), l("a"), t(" (arrondi au millième).")]
        : [t("Déduis-en le modèle "), l(modeleLatex(e)), t(" : donne "), l("k"), t(` (arrondi ${precisionTexte(c.decimalesK)}) et `), l("n"), t(" (arrondi au millième).")];
    case "prevision":
      return [...consignePrevision(e), t(PHRASE_ARRONDIS)];
  }
}

// ============================================================================
// Champs, options, libellés.
// ============================================================================

const PLACEHOLDER = "ex. : 1,234";

export function champsEcran(e: ExerciceLinearisation, phase: PhaseLinearisation): ChampDef[] {
  const [i, j] = e.lignes;
  const y = varY(e);
  const x = varX(e);
  const def = defContexte(e.contexte);
  switch (phase) {
    case "logs": {
      const champY = (k: number): ChampDef => ({ label: `ln(${def.varYTexte}) pour ${def.varXTexte} = ${nombreTexte(e.xs[k])}`, labelLatex: `\\ln(${y})\\;(${ligneLatex(e, k)})`, placeholder: PLACEHOLDER });
      const champX = (k: number): ChampDef => ({ label: `ln(${def.varXTexte}) pour ${def.varXTexte} = ${nombreTexte(e.xs[k])}`, labelLatex: `\\ln(${x})\\;(${ligneLatex(e, k)})`, placeholder: PLACEHOLDER });
      return e.modele === "puissance" ? [champX(i), champY(i), champX(j), champY(j)] : [champY(i), champY(j)];
    }
    case "choix":
      return [];
    case "pente":
      return [{ label: "m", labelLatex: "m", placeholder: PLACEHOLDER }];
    case "ordonnee":
      return [{ label: "p", labelLatex: "p", placeholder: PLACEHOLDER }];
    case "modele":
      return [
        { label: "k", labelLatex: "k", placeholder: PLACEHOLDER },
        e.modele === "exponentiel" ? { label: "a", labelLatex: "a", placeholder: PLACEHOLDER } : { label: "n", labelLatex: "n", placeholder: PLACEHOLDER },
      ];
    case "prevision": {
      const nom = e.typePrevision === "valeur" ? (e.ambiante > 0 ? "T" : def.varYTexte) : def.varXTexte;
      const nomLatex = e.typePrevision === "valeur" ? (e.ambiante > 0 ? "T" : y) : x;
      return [{ label: nom, labelLatex: nomLatex, placeholder: "ex. : 12,5", unite: unitePrevision(e) === "10⁵ km" ? "× 10⁵ km" : unitePrevision(e) }];
    }
  }
}

/** Libellés (texte brut) des champs de l'écran, pour les messages de piège. */
export function libellesChamps(e: ExerciceLinearisation, phase: PhaseLinearisation): string[] {
  return champsEcran(e, phase).map((c) => c.label);
}

function texteOption(e: ExerciceLinearisation, m: ModeleDonnees): FragmentConsigne[] {
  if (m === "affine") return [t("Aucune transformation : "), l("y"), t(" en fonction de "), l("x"), t(" (modèle affine)")];
  if (m === "exponentiel") return [t("Semi-logarithmique : "), l(grandeurYLatex(e, "exponentiel")), t(" en fonction de "), l("x"), t(" (modèle exponentiel)")];
  return [t("Log-log : "), l(grandeurYLatex(e, "puissance")), t(" en fonction de "), l(grandeurXLatex(e, "puissance")), t(" (modèle puissance)")];
}

export function optionsChoix(e: ExerciceLinearisation): OptionChoix[] {
  return OPTIONS_CHOIX.map((m) => ({ id: m, fragments: texteOption(e, m) }));
}

export function reponseChoix(e: ExerciceLinearisation): FragmentConsigne[] {
  return texteOption(e, e.modele);
}

export function fragmentsOption(options: OptionChoix[], id: string | null): FragmentConsigne[] {
  return options.find((o) => o.id === id)?.fragments ?? [];
}

export function libellePhase(_e: ExerciceLinearisation, phase: PhaseLinearisation): string {
  switch (phase) {
    case "logs":
      return "Logarithmes";
    case "choix":
      return "Représentation";
    case "pente":
      return "Pente m";
    case "ordonnee":
      return "Ordonnée à l'origine p";
    case "modele":
      return "Modèle";
    case "prevision":
      return "Prévision";
  }
}

// ============================================================================
// Réponses attendues.
// ============================================================================

const D = DECIMALES_ETAPE;

/** Valeur arrondie au millième précédée de « ≈ » ou « = ». */
export function approxLatex(v: number, decimales = D): string {
  return `${egalOuEnviron(v, decimales)}${nombreLatex(v, decimales)}`;
}

/** Nom LaTeX de la grandeur demandée à la prévision (T, θ, r…). */
export function nomPrevisionLatex(e: ExerciceLinearisation): string {
  return champsEcran(e, "prevision")[0].labelLatex ?? "";
}

export function previsionLatex(e: ExerciceLinearisation): string {
  const c = chaineLinearisation(e);
  return `${nomPrevisionLatex(e)}${approxLatex(c.prevision, c.decimalesPrevision)}\\,${uniteLatex(unitePrevision(e))}`;
}

export function formatReponseAttenduePhaseLatex(e: ExerciceLinearisation, phase: PhaseLinearisation): string[] {
  const c = chaineLinearisation(e);
  const [i, j] = e.lignes;
  switch (phase) {
    case "logs": {
      const v = logsAttendus(e);
      if (e.modele === "puissance") {
        return [
          `\\ln(${nombreLatex(e.xs[i])})${approxLatex(v[0])}`,
          `\\ln(${nombreLatex(e.ys[i])})${approxLatex(v[1])}`,
          `\\ln(${nombreLatex(e.xs[j])})${approxLatex(v[2])}`,
          `\\ln(${nombreLatex(e.ys[j])})${approxLatex(v[3])}`,
        ];
      }
      return [`\\ln(${nombreLatex(e.ys[i])})${approxLatex(v[0])}`, `\\ln(${nombreLatex(e.ys[j])})${approxLatex(v[1])}`];
    }
    case "choix":
      return [];
    case "pente":
      return [`m${approxLatex(c.m)}`];
    case "ordonnee":
      return [`p${approxLatex(c.p)}`];
    case "modele":
      return [`k${approxLatex(c.k, c.decimalesK)}`, `${e.modele === "exponentiel" ? "a" : "n"}${approxLatex(c.parametre)}`];
    case "prevision":
      return [previsionLatex(e)];
  }
}

// ============================================================================
// Calculs détaillés (aides et corrigé).
// ============================================================================

/** Coordonnée X (transformée) d'une ligne, en LaTeX : `4` ou `\ln(2{,}1)`. */
function xLigneLatex(e: ExerciceLinearisation, indice: number): string {
  return e.modele === "puissance" ? `\\ln(${nombreLatex(e.xs[indice])})` : nombreLatex(e.xs[indice]);
}

function yLigneLatex(e: ExerciceLinearisation, indice: number): string {
  return e.modele === "affine" ? nombreLatex(e.ys[indice]) : `\\ln(${nombreLatex(e.ys[indice])})`;
}

/** Valeurs (arrondies au millième si transformées) d'une coordonnée, en LaTeX. */
function valeurLatex(v: number, transformee: boolean): string {
  return transformee ? nombreLatex(v, D) : nombreLatex(v);
}

/** Entre parenthèses si négatif (pour une soustraction ou un produit). */
function par(s: string): string {
  return s.startsWith("-") ? `(${s})` : s;
}

/** m = (Y₂ − Y₁)/(X₂ − X₁) avec les valeurs arrondies : formule substituée (sans le résultat). */
export function substitutionPenteLatex(e: ExerciceLinearisation): string {
  const c = chaineLinearisation(e);
  const tx = e.modele === "puissance";
  const ty = e.modele !== "affine";
  return `m=\\dfrac{${valeurLatex(c.Y[1], ty)}-${par(valeurLatex(c.Y[0], ty))}}{${valeurLatex(c.X[1], tx)}-${par(valeurLatex(c.X[0], tx))}}`;
}

/** Forme symbolique : m = (ln θ₂ − ln θ₁)/(t₂ − t₁) avec les mesures. */
export function formulePenteLatex(e: ExerciceLinearisation): string {
  const [i, j] = e.lignes;
  return `m=\\dfrac{${yLigneLatex(e, j)}-${yLigneLatex(e, i)}}{${xLigneLatex(e, j)}-${xLigneLatex(e, i)}}`;
}

/** p = Y₁ − m·X₁ avec les valeurs arrondies (sans le résultat). */
export function substitutionOrdonneeLatex(e: ExerciceLinearisation): string {
  const c = chaineLinearisation(e);
  return `p=${valeurLatex(c.Y[0], e.modele !== "affine")}-${par(nombreLatex(c.m, D))}\\times ${par(valeurLatex(c.X[0], e.modele === "puissance"))}`;
}

/** Retour au modèle : ln(θ) = m t + p ⟺ θ = eᵖ·(eᵐ)ᵗ. */
export function retourModeleLatex(e: ExerciceLinearisation): string {
  const x = varX(e);
  const y = varY(e);
  if (e.modele === "exponentiel") return `\\ln(${y})=m\\,${x}+p\\iff ${y}=e^{m\\,${x}+p}=e^{p}\\cdot\\left(e^{m}\\right)^{${x}}`;
  return `\\ln(${y})=m\\ln(${x})+p\\iff ${y}=e^{p}\\cdot e^{m\\ln(${x})}=e^{p}\\cdot ${x}^{m}`;
}

/** Identification : k = eᵖ et a = eᵐ (ou n = m). */
export function identificationLatex(e: ExerciceLinearisation): string {
  return e.modele === "exponentiel" ? "k=e^{p}\\qquad a=e^{m}" : "k=e^{p}\\qquad n=m";
}

/** Modèle obtenu, valeurs arrondies : `\theta=60{,}02\cdot 0{,}900^{t}`. */
export function modeleNumeriqueLatex(e: ExerciceLinearisation): string {
  const c = chaineLinearisation(e);
  const x = varX(e);
  const y = varY(e);
  const k = nombreLatex(c.k, c.decimalesK);
  const par3 = nombreLatex(c.parametre, D);
  if (e.modele === "exponentiel") return `${y}\\approx ${k}\\cdot ${par3}^{${x}}`;
  if (e.modele === "puissance") return `${y}\\approx ${k}\\cdot ${x}^{${par3}}`;
  return `${y}\\approx ${nombreLatex(c.m, D)}\\,${x}+${par(nombreLatex(c.p, D))}`;
}

/** Calcul de la prévision, substitué (sans le résultat) — variante avec écran « modèle ». */
export function substitutionPrevisionLatex(e: ExerciceLinearisation): string {
  const c = chaineLinearisation(e);
  const x = varX(e);
  const y = varY(e);
  const k = nombreLatex(c.k, c.decimalesK);
  const a = nombreLatex(c.parametre, D);
  const yv = nombreLatex(c.yPrevision);
  if (e.typePrevision === "valeur") {
    const xs = nombreLatex(e.cible);
    return e.modele === "exponentiel" ? `${y}\\approx ${k}\\times ${a}^{${xs}}` : `${y}\\approx ${k}\\times ${xs}^{${a}}`;
  }
  return e.modele === "exponentiel"
    ? `${k}\\cdot ${a}^{${x}}=${yv}\\iff ${x}=\\dfrac{\\ln\\left(\\dfrac{${yv}}{${k}}\\right)}{\\ln(${a})}`
    : `${k}\\cdot ${x}^{${a}}=${yv}\\iff ${x}=\\left(\\dfrac{${yv}}{${k}}\\right)^{\\frac{1}{${a}}}`;
}

/** Variante `choisir` : ordonnée transformée au point cherché, Y = p + m·X (sans le résultat). */
export function substitutionDroiteLatex(e: ExerciceLinearisation): string {
  const c = chaineLinearisation(e);
  const X = e.modele === "puissance" ? `\\ln(${nombreLatex(e.cible)})` : nombreLatex(e.cible);
  return `${grandeurYLatex(e)}\\approx ${nombreLatex(c.p, D)}+${par(nombreLatex(c.m, D))}\\times ${X}`;
}

// ============================================================================
// Aides (jamais la réponse finale).
// ============================================================================

export function aideNiveau1(e: ExerciceLinearisation, phase: PhaseLinearisation): AideAvecLatex {
  const [i] = e.lignes;
  switch (phase) {
    case "logs":
      return { texte: "Le logarithme népérien se calcule avec la touche ln de la calculatrice, par exemple pour la première ligne :", latex: e.modele === "puissance" ? `\\ln(${nombreLatex(e.xs[i])})\\qquad\\ln(${nombreLatex(e.ys[i])})` : `\\ln(${nombreLatex(e.ys[i])})` };
    case "choix":
      return { texte: "Dans chaque représentation, calcule la pente entre deux paires de points voisins : la bonne représentation donne (presque) la même pente partout :", latex: "\\dfrac{Y_2-Y_1}{X_2-X_1}\\approx\\dfrac{Y_6-Y_5}{X_6-X_5}" };
    case "pente":
      return { texte: "La pente de la droite passant par deux points se calcule par :", latex: "m=\\dfrac{Y_2-Y_1}{X_2-X_1}" };
    case "ordonnee":
      return { texte: "Les coordonnées d'un point de la droite vérifient son équation, donc :", latex: "Y=m\\,X+p\\iff p=Y-m\\,X" };
    case "modele":
      return { texte: "Applique l'exponentielle aux deux membres de l'équation de la droite :", latex: retourModeleLatex(e) };
    case "prevision": {
      if (e.variante === "choisir") return { texte: "Calcule d'abord l'ordonnée de la droite pour cette abscisse :", latex: `${grandeurYLatex(e)}=p+m\\,${grandeurXLatex(e)}` };
      if (e.typePrevision === "valeur") return { texte: "Remplace la variable par sa valeur dans le modèle obtenu à l'étape précédente :", latex: substitutionPrevisionLatex(e) };
      const c = chaineLinearisation(e);
      const k = nombreLatex(c.k, c.decimalesK);
      const a = nombreLatex(c.parametre, D);
      const x = varX(e);
      return { texte: "Écris l'équation à résoudre avec le modèle obtenu à l'étape précédente :", latex: e.modele === "exponentiel" ? `${k}\\cdot ${a}^{${x}}=${nombreLatex(c.yPrevision)}` : `${k}\\cdot ${x}^{${a}}=${nombreLatex(c.yPrevision)}` };
    }
  }
}

export function aideNiveau2(e: ExerciceLinearisation, phase: PhaseLinearisation): AideAvecLatex {
  switch (phase) {
    case "logs":
      return { texte: "Garde trois chiffres après la virgule et contrôle l'ordre de grandeur : le logarithme d'une mesure est compris entre deux entiers consécutifs quand :", latex: "e^{n}\\leq y<e^{n+1}\\iff n\\leq\\ln(y)<n+1" };
    case "choix":
      return { texte: "Raccourcis : des écarts constants entre mesures successives (pas constant) signalent un modèle affine, des rapports constants un modèle exponentiel ; sinon, essaie le log-log." };
    case "pente":
      return { texte: "Ici, avec les coordonnées arrondies des deux points :", latex: substitutionPenteLatex(e) };
    case "ordonnee":
      return { texte: "Avec le premier point et la pente arrondie :", latex: substitutionOrdonneeLatex(e) };
    case "modele":
      return { texte: "Par identification avec le modèle cherché :", latex: identificationLatex(e) };
    case "prevision": {
      if (e.variante === "choisir") {
        return e.modele === "affine"
          ? { texte: "Ici, aucune transformation : l'ordonnée de la droite est directement y. Avec les valeurs :", latex: substitutionDroiteLatex(e) }
          : { texte: "Calcule cette ordonnée, puis reviens à y avec l'exponentielle :", latex: `${substitutionDroiteLatex(e)}\\qquad y=e^{${grandeurYLatex(e)}}` };
      }
      if (e.typePrevision === "valeur") {
        return e.ambiante > 0
          ? { texte: "Le modèle donne l'écart à la pièce : la température du café s'obtient en ajoutant la température de la pièce :", latex: `T=${e.ambiante}+\\theta` }
          : { texte: "Calcule d'abord la puissance, puis multiplie par k." };
      }
      if (e.ambiante > 0) return { texte: "Attention : le modèle donne l'écart à la pièce. L'écart visé vaut :", latex: `\\theta=${nombreLatex(e.cible)}-${e.ambiante}` };
      return { texte: "Isole la puissance, puis applique ln (ou la racine) :", latex: e.modele === "exponentiel" ? `${varX(e)}=\\dfrac{\\ln\\left(\\dfrac{${varY(e)}}{k}\\right)}{\\ln(a)}` : `${varX(e)}=\\left(\\dfrac{${varY(e)}}{k}\\right)^{\\frac{1}{n}}` };
    }
  }
}

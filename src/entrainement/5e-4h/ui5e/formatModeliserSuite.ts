import { anneeDonnee, anneeDuRang, premierTerme, somme, terme } from "../core5e/modeliserSuite";
import type { ExerciceModeliserSeuil, ExerciceModeliserSuite } from "../core5e/modeliserSuite";
import { ID_ARITHMETIQUE, ID_GEOMETRIQUE } from "../moteur5e/verificationModeliserSuite";
import type { PhaseModeliserSuite } from "../moteur5e/typesModeliserSuite";

/**
 * Couche C (5e) — textes de `5gen47` « Modéliser une situation par une suite ». SOURCE UNIQUE des
 * consignes, champs, aides et réponses attendues : l'écran, le récapitulatif et l'adaptateur de
 * feuilles (`generateurs5e/modeliserSuite/exportEvaluation.ts`) en dérivent.
 *
 * Notations du cours (chapitre 3 de 5e) : rang 1 = u₁, uₙ = u₁ + (n − 1)r, uₙ = u₁·qⁿ⁻¹,
 * Sₙ = n(u₁ + uₙ)/2, Sₙ = u₁(1 − qⁿ)/(1 − q). Virgule décimale, espace fine des milliers (dès
 * 10 000, comme 5gen45), jamais de prose dans le mode math ; aides = phrase terminée par « : » puis
 * la formule, sans la réponse finale. Une valeur non décimale courte est arrondie à la précision
 * du contexte et précédée de « ≈ ».
 */

export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

export interface ChampDef {
  /** Texte brut (aria-label, historique). */
  label: string;
  labelLatex?: string;
  /** Unité affichée à côté du champ (« € », « abonnés »…). */
  unite?: string;
  placeholder: string;
}

export interface OptionChoix {
  id: string;
  fragments: FragmentConsigne[];
}

export interface AideAvecLatex {
  texte: string;
  latex?: string;
}

const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

// ============================================================================
// Écriture des nombres.
// ============================================================================

interface Morceaux {
  negatif: boolean;
  entier: string[];
  decimales: string;
}

function morceaux(x: number, dec: number, fixe: boolean): Morceaux {
  const f = 10 ** dec;
  const arrondi = Math.round(x * f) / f;
  let s = Math.abs(arrondi).toFixed(dec);
  // Zéros finaux retirés seulement APRÈS la virgule (« 1020 » reste « 1020 »).
  if (!fixe && s.includes(".")) s = s.replace(/\.?0+$/, "");
  const [ent, decimales = ""] = s.split(".");
  const entier = ent.length >= 5 ? ent.replace(/\B(?=(\d{3})+(?!\d))/g, " ").split(" ") : [ent];
  return { negatif: arrondi < 0, entier, decimales };
}

/** Nombre en LaTeX : virgule `{,}`, espace fine des milliers dès 10 000. */
export function nbL(x: number, dec = 4, fixe = false): string {
  const m = morceaux(x, dec, fixe);
  return `${m.negatif ? "-" : ""}${m.entier.join("\\,")}${m.decimales ? `{,}${m.decimales}` : ""}`;
}

/** Nombre en texte brut : virgule, espace fine insécable des milliers, moins typographique. */
export function nbT(x: number, dec = 4, fixe = false): string {
  const m = morceaux(x, dec, fixe);
  return `${m.negatif ? "−" : ""}${m.entier.join(" ")}${m.decimales ? `,${m.decimales}` : ""}`;
}

function estEuro(e: ExerciceModeliserSuite): boolean {
  return e.contexte.unite === "€";
}

/** Une valeur s'écrit-elle exactement avec peu de décimales (2 pour des euros, 4 sinon) ? */
function exacteCourte(e: ExerciceModeliserSuite, x: number): boolean {
  const max = estEuro(e) ? 2 : 4;
  return Math.abs(x * 10 ** max - Math.round(x * 10 ** max)) < 1e-6;
}

export interface ValeurAffichee {
  latex: string;
  texte: string;
  /** Valeur arrondie (« ≈ ») : sinon elle est exacte. */
  approchee: boolean;
}

/** Écriture d'une grandeur du contexte : exacte si elle est courte, sinon arrondie à la précision
 * du contexte. Euros non entiers : toujours deux décimales. */
export function valeur(e: ExerciceModeliserSuite, x: number): ValeurAffichee {
  const exacte = exacteCourte(e, x);
  const dec = exacte ? (estEuro(e) ? 2 : 4) : e.contexte.decimales;
  const fixe = estEuro(e) && !Number.isInteger(Math.round(x * 100) / 100);
  return { latex: nbL(x, dec, fixe), texte: nbT(x, dec, fixe), approchee: !exacte };
}

/** « = 1 260 » ou « ≈ 1 644,9 » en LaTeX. */
function egalValeur(e: ExerciceModeliserSuite, x: number): string {
  const v = valeur(e, x);
  return `${v.approchee ? "\\approx" : "="} ${v.latex}`;
}

/** Valeur avec son unité, en texte (« 1 260 € », « 340 t »). */
export function avecUnite(e: ExerciceModeliserSuite, x: number): string {
  return `${valeur(e, x).texte} ${e.contexte.unite}`;
}

/** Nombre négatif entre parenthèses dans un calcul substitué. */
function jeton(x: number): string {
  return x < 0 ? `(${nbL(x)})` : nbL(x);
}

function qL(e: ExerciceModeliserSuite): string {
  return nbL(e.q);
}

/** Précision demandée (mode calculatrice) : « à l'unité », « au dixième », « au centime ». */
export function precisionTexte(e: ExerciceModeliserSuite): string {
  switch (e.contexte.decimales) {
    case 0:
      return "à l'unité";
    case 1:
      return "au dixième";
    case 2:
      return estEuro(e) ? "au centime" : "au centième";
  }
}

function il(e: ExerciceModeliserSuite): string {
  return e.contexte.genre === "f" ? "elle" : "il";
}

// ============================================================================
// Énoncé.
// ============================================================================

export function phraseDonnee(e: ExerciceModeliserSuite): string {
  return e.contexte.donnee.replace("{annee}", String(anneeDonnee(e))).replace("{v}", valeur(e, e.valeurDonnee).texte);
}

export function phraseEvolution(e: ExerciceModeliserSuite): string {
  const c = e.contexte;
  const verbe = e.sens === "hausse" ? "augmente" : "diminue";
  switch (e.formulation) {
    case "montant":
      return `Chaque année, ${c.pronom} ${verbe} de ${avecUnite(e, Math.abs(e.r))}.`;
    case "pourcentInitial":
      return `Chaque année, la banque ajoute des intérêts égaux à ${e.pct} % de la somme déposée en ${anneeDonnee(e)}.`;
    case "pourcent":
      if (c.interets) return `Chaque année, la banque ajoute des intérêts égaux à ${e.pct} % de la somme présente sur le compte.`;
      return `Chaque année, ${c.pronom} ${verbe} de ${e.pct} %.`;
    case "double":
      return `Chaque année, ${c.pronom} double.`;
    case "moitie":
      return `Chaque année, ${c.pronom} diminue de moitié.`;
  }
}

/** La question posée (dernière phrase de l'énoncé). */
export function phraseQuestion(e: ExerciceModeliserSuite): string {
  const c = e.contexte;
  switch (e.variante) {
    case "terme":
      return `Quel${c.genre === "f" ? "le" : ""} sera ${c.grandeur} en ${anneeDuRang(e, e.rang)} ?`;
    case "somme":
      return `Calcule ${c.total?.texte ?? ""} de ${e.annee1} à ${anneeDuRang(e, e.nombre)} inclus.`;
    case "seuil": {
      const s = avecUnite(e, e.seuil);
      return e.sens === "hausse"
        ? `En quelle année ${c.grandeur} dépassera-t-${il(e)} pour la première fois ${s} ?`
        : `En quelle année ${c.grandeur} deviendra-t-${il(e)} inférieur${c.genre === "f" ? "e" : ""} à ${s} pour la première fois ?`;
    }
  }
}

/** Précision et unité de la réponse (dernière phrase de l'énoncé). */
export function phrasePrecision(e: ExerciceModeliserSuite): string {
  const en = e.contexte.enUnite ? ` ${e.contexte.enUnite}` : "";
  if (e.variante === "seuil") return e.mode === "calcul" ? `Arrondis les valeurs calculées ${precisionTexte(e)}.` : "";
  return e.mode === "calcul" ? `Donne la réponse${en ? `${en},` : ""} arrondie ${precisionTexte(e)}.` : `Donne la valeur exacte${en}.`;
}

/** Données + définition de uₙ (sans la question). */
export function fragmentsSituation(e: ExerciceModeliserSuite): FragmentConsigne[] {
  return [
    t(`${phraseDonnee(e)} ${phraseEvolution(e)} On note `),
    l("u_n"),
    t(` ${e.contexte.grandeur} l'année de rang `),
    l("n"),
    t(`. L'année ${e.annee1} a le rang 1.`),
  ];
}

export function consigneGenerale(e: ExerciceModeliserSuite): FragmentConsigne[] {
  const precision = phrasePrecision(e);
  return [...fragmentsSituation(e), t(` ${phraseQuestion(e)}${precision ? ` ${precision}` : ""}`)];
}

// ============================================================================
// Écrans.
// ============================================================================

export function libellePhase(e: ExerciceModeliserSuite, phase: PhaseModeliserSuite): string {
  switch (phase) {
    case "nature":
      return "Nature de la suite";
    case "premierTerme":
      return "Premier terme";
    case "raison":
      return "Raison";
    case "rang":
      return "Rang de l'année demandée";
    case "terme":
      return e.variante === "terme" ? `Valeur en ${anneeDuRang(e, e.rang)}` : "Terme";
    case "nombreTermes":
      return "Nombre de termes";
    case "somme":
      return "Total";
    case "tableau":
      return "Tableau de valeurs";
    case "annee":
      return "Première année";
  }
}

export function optionsChoix(): OptionChoix[] {
  return [
    { id: ID_ARITHMETIQUE, fragments: [t("Une suite arithmétique : chaque année, on ajoute (ou on retire) la même quantité.")] },
    { id: ID_GEOMETRIQUE, fragments: [t("Une suite géométrique : chaque année, on multiplie par le même nombre.")] },
  ];
}

export function fragmentsOption(options: OptionChoix[], id: string): FragmentConsigne[] {
  return options.find((o) => o.id === id)?.fragments ?? [t(id)];
}

export function consigneEcran(e: ExerciceModeliserSuite, phase: PhaseModeliserSuite): FragmentConsigne[] {
  const arith = e.nature === "arithmetique";
  switch (phase) {
    case "nature":
      return [t("Quel type de suite modélise cette situation ?")];
    case "premierTerme":
      return [t("Que vaut "), l("u_1"), t(" ?")];
    case "raison":
      return arith ? [t("Quelle est la raison "), l("r"), t(" de cette suite arithmétique ?")] : [t("Quelle est la raison "), l("q"), t(" de cette suite géométrique ?")];
    case "rang":
      return e.variante === "terme" ? [t("À quel rang "), l("n"), t(` correspond l'année ${anneeDuRang(e, e.rang)} ?`)] : [];
    case "terme": {
      if (e.variante !== "terme") return [];
      const precision = e.mode === "calcul" ? ` Arrondis ${precisionTexte(e)}.` : "";
      return [t("Calcule "), l(`u_{${e.rang}}`), t(` : ${e.contexte.grandeur} en ${anneeDuRang(e, e.rang)}.${precision}`)];
    }
    case "nombreTermes":
      return e.variante === "somme"
        ? [t(`Le total de ${e.annee1} à ${anneeDuRang(e, e.nombre)} est la somme `), l("S_N=u_1+u_2+\\ldots+u_N"), t(". Que vaut "), l("N"), t(" ?")]
        : [];
    case "somme": {
      if (e.variante !== "somme") return [];
      const precision = e.mode === "calcul" ? ` Arrondis ${precisionTexte(e)}.` : "";
      return [t("Calcule "), l(`S_{${e.nombre}}`), t(` : ${e.contexte.total?.texte ?? ""} de ${e.annee1} à ${anneeDuRang(e, e.nombre)}.${precision}`)];
    }
    case "tableau":
      return [t("Complète le tableau des valeurs de "), l("u_n"), t(e.mode === "calcul" ? `, arrondies ${precisionTexte(e)}.` : ".")];
    case "annee":
      return e.variante === "seuil" ? [t(`D'après le tableau : ${phraseQuestion(e).charAt(0).toLowerCase()}${phraseQuestion(e).slice(1)}`)] : [];
  }
}

export function champsEcran(e: ExerciceModeliserSuite, phase: PhaseModeliserSuite): ChampDef[] {
  const unite = e.contexte.unite;
  switch (phase) {
    case "nature":
      return [];
    case "premierTerme":
      return [{ label: "u1", labelLatex: "u_1=", unite, placeholder: "premier terme" }];
    case "raison":
      return e.nature === "arithmetique" ? [{ label: "r", labelLatex: "r=", placeholder: "raison" }] : [{ label: "q", labelLatex: "q=", placeholder: "ex. 1,03" }];
    case "rang":
      return [{ label: "n", labelLatex: "n=", placeholder: "rang" }];
    case "terme":
      return e.variante === "terme" ? [{ label: `u${e.rang}`, labelLatex: `u_{${e.rang}}=`, unite, placeholder: "valeur" }] : [];
    case "nombreTermes":
      return [{ label: "N", labelLatex: "N=", placeholder: "nombre de termes" }];
    case "somme":
      return e.variante === "somme" ? [{ label: `S${e.nombre}`, labelLatex: `S_{${e.nombre}}=`, unite, placeholder: "total" }] : [];
    case "tableau":
      return e.variante === "seuil" ? e.rangsTable.map((k) => ({ label: `u${k}`, labelLatex: `u_{${k}}`, unite, placeholder: "" })) : [];
    case "annee":
      return [{ label: "Année", placeholder: "année" }];
  }
}

// ============================================================================
// Réponses attendues.
// ============================================================================

/** Calcul de u₁. */
function calculPremierTerme(e: ExerciceModeliserSuite): string {
  const u1 = premierTerme(e);
  if (e.depart === "rang1") return `u_1=${nbL(u1)}`;
  const u0 = nbL(e.valeurDonnee);
  return e.nature === "arithmetique" ? `u_1=${u0}+${jeton(e.r)}${egalValeur(e, u1)}` : `u_1=${u0}\\times ${qL(e)}${egalValeur(e, u1)}`;
}

/** Calcul de la raison. */
function calculRaison(e: ExerciceModeliserSuite): string {
  if (e.nature === "arithmetique") {
    if (e.formulation === "pourcentInitial" && e.pct !== null) return `r=\\dfrac{${e.pct}}{100}\\times ${nbL(e.valeurDonnee)}=${nbL(e.r)}`;
    return `r=${nbL(e.r)}`;
  }
  switch (e.formulation) {
    case "double":
      return "q=2";
    case "moitie":
      return "q=\\dfrac{1}{2}=0{,}5";
    default:
      return `q=1${e.sens === "hausse" ? "+" : "-"}\\dfrac{${e.pct}}{100}=${qL(e)}`;
  }
}

/** uₖ substitué dans la formule générale (sans le résultat). */
function termeSubstitue(e: ExerciceModeliserSuite, k: number): string {
  const u1 = nbL(premierTerme(e));
  return e.nature === "arithmetique" ? `${u1}+${k - 1}\\times ${jeton(e.r)}` : `${u1}\\times ${qL(e)}^{${k - 1}}`;
}

function calculTerme(e: ExerciceModeliserSuite, k: number): string {
  return `u_{${k}}=${termeSubstitue(e, k)}${egalValeur(e, terme(e, k))}`;
}

/** S_N substituée dans la formule (sans le résultat). */
function sommeSubstituee(e: ExerciceModeliserSuite, n: number): string {
  const u1 = nbL(premierTerme(e));
  if (e.nature === "arithmetique") return `\\dfrac{${n}\\times(${u1}+${valeur(e, terme(e, n)).latex})}{2}`;
  return `${u1}\\times\\dfrac{1-${qL(e)}^{${n}}}{1-${qL(e)}}`;
}

/** Lignes du tableau : « u₇ ≈ 2 980 (2031) ». */
export function lignesTableau(e: ExerciceModeliserSeuil): FragmentConsigne[] {
  return e.rangsTable.flatMap((k, i) => [...(i === 0 ? [] : [t(" ; ")]), l(`u_{${k}}${egalValeur(e, terme(e, k))}`), t(` (${anneeDuRang(e, k)})`)]);
}

function conclusionSeuil(e: ExerciceModeliserSeuil): FragmentConsigne[] {
  const k = e.rangSeuil;
  const s = valeur(e, e.seuil).latex;
  const [avant, apres] = e.sens === "hausse" ? ["\\leqslant", ">"] : ["\\geqslant", "<"];
  return [
    l(`u_{${k - 1}}${egalValeur(e, terme(e, k - 1))}${avant} ${s}`),
    t(" et "),
    l(`u_{${k}}${egalValeur(e, terme(e, k))}${apres} ${s}`),
    t(` : le seuil est franchi pour la première fois au rang ${k}, soit l'année `),
    l(`${e.annee1}+${k}-1=${anneeDuRang(e, k)}`),
    t("."),
  ];
}

/** Réponse d'un écran (bloc de validation, ligne « Calcul » du corrigé). */
export function reponseFragments(e: ExerciceModeliserSuite, phase: PhaseModeliserSuite): FragmentConsigne[] {
  const unite = t(` ${e.contexte.unite}`);
  switch (phase) {
    case "nature":
      return e.nature === "arithmetique"
        ? [t("Suite arithmétique : chaque année, on ajoute la même quantité "), l("r"), t(".")]
        : [t("Suite géométrique : chaque année, on multiplie par le même nombre "), l("q"), t(".")];
    case "premierTerme":
      return [l(calculPremierTerme(e)), unite];
    case "raison":
      return [l(calculRaison(e)), ...(e.nature === "arithmetique" ? [unite] : [])];
    case "rang":
      return e.variante === "terme" ? [l(`n=${anneeDuRang(e, e.rang)}-${e.annee1}+1=${e.rang}`)] : [];
    case "terme":
      return e.variante === "terme" ? [l(calculTerme(e, e.rang)), unite] : [];
    case "nombreTermes":
      return e.variante === "somme" ? [l(`N=${anneeDuRang(e, e.nombre)}-${e.annee1}+1=${e.nombre}`)] : [];
    case "somme": {
      if (e.variante !== "somme") return [];
      const n = e.nombre;
      const ligneSomme = l(`S_{${n}}=${sommeSubstituee(e, n)}${egalValeur(e, somme(e, n))}`);
      if (e.nature === "arithmetique") return [l(calculTerme(e, n)), t(" puis "), ligneSomme, unite];
      return [ligneSomme, unite];
    }
    case "tableau":
      return e.variante === "seuil" ? lignesTableau(e) : [];
    case "annee":
      return e.variante === "seuil" ? conclusionSeuil(e) : [];
  }
}

/** Valeurs confirmées (récapitulatif « Ce qu'on sait déjà »). */
export function reponseRecap(e: ExerciceModeliserSuite, phase: PhaseModeliserSuite): { texte: string } | { latex: string[] } {
  switch (phase) {
    case "nature":
      return { texte: e.nature === "arithmetique" ? "suite arithmétique" : "suite géométrique" };
    case "premierTerme":
      return { latex: [`u_1${egalValeur(e, premierTerme(e))}`] };
    case "raison":
      return { latex: [e.nature === "arithmetique" ? `r=${nbL(e.r)}` : `q=${qL(e)}`] };
    case "rang":
      return { latex: [e.variante === "terme" ? `n=${e.rang}` : ""] };
    case "terme":
      return { latex: [e.variante === "terme" ? `u_{${e.rang}}${egalValeur(e, terme(e, e.rang))}` : ""] };
    case "nombreTermes":
      return { latex: [e.variante === "somme" ? `N=${e.nombre}` : ""] };
    case "somme":
      return { latex: [e.variante === "somme" ? `S_{${e.nombre}}${egalValeur(e, somme(e, e.nombre))}` : ""] };
    case "tableau":
      return { latex: e.variante === "seuil" ? e.rangsTable.map((k) => `u_{${k}}${egalValeur(e, terme(e, k))}`) : [] };
    case "annee":
      return { texte: e.variante === "seuil" ? String(anneeDuRang(e, e.rangSeuil)) : "" };
  }
}

/** Explication d'un verdict faux (choix fermé, une seule tentative). */
export function explicationVerdictFaux(e: ExerciceModeliserSuite): string {
  if (e.nature === "arithmetique") {
    if (e.formulation === "pourcentInitial") return "Le pourcentage porte toujours sur la somme déposée au départ : la banque ajoute donc chaque année le même montant, la suite est arithmétique.";
    return "On ajoute (ou on retire) chaque année la même quantité : la suite est arithmétique.";
  }
  if (e.formulation === "double" || e.formulation === "moitie") return "Doubler ou diminuer de moitié, c'est multiplier chaque année par le même nombre : la suite est géométrique.";
  return "Un pourcentage de la valeur de l'année précédente revient à multiplier chaque année par le même nombre : la quantité ajoutée change d'une année à l'autre, la suite est géométrique.";
}

// ============================================================================
// Aides (jamais la réponse finale).
// ============================================================================

export function aideNiveau1(e: ExerciceModeliserSuite, phase: PhaseModeliserSuite): AideAvecLatex {
  const arith = e.nature === "arithmetique";
  switch (phase) {
    case "nature":
      return {
        texte: "Regarde comment on passe d'une année à la suivante : ajoute-t-on toujours la même quantité (suite arithmétique), ou multiplie-t-on toujours par le même nombre (suite géométrique) ? Un pourcentage de la valeur de l'année précédente change chaque année ; un pourcentage d'une valeur fixe, non. Les deux relations possibles :",
        latex: "u_{n+1}=u_n+r\\qquad u_{n+1}=u_n\\times q",
      };
    case "premierTerme":
      return e.depart === "rang1"
        ? { texte: "u₁ est la valeur de l'année de rang 1 : relis la phrase qui définit uₙ pour savoir de quelle année il s'agit, puis cherche sa valeur dans l'énoncé." }
        : {
            texte: `L'énoncé donne la valeur de ${anneeDonnee(e)}, un an AVANT l'année de rang 1 (${e.annee1}) : applique une fois l'évolution annuelle, comme pour passer d'un terme au suivant :`,
            latex: arith ? "u_1=u_0+r" : "u_1=u_0\\times q",
          };
    case "raison":
      return arith
        ? { texte: "La raison r est la quantité ajoutée chaque année (négative si elle est retirée) :", latex: "u_{n+1}=u_n+r" }
        : { texte: "La raison q est le nombre par lequel on multiplie chaque année :", latex: "u_{n+1}=u_n\\times q" };
    case "rang":
      return { texte: `Compte les années à partir de l'année de rang 1 : ${e.annee1} a le rang 1, ${e.annee1 + 1} le rang 2, ${e.annee1 + 2} le rang 3, et ainsi de suite.` };
    case "terme":
      return arith ? { texte: "Formule générale d'une suite arithmétique :", latex: "u_n=u_1+(n-1)\\,r" } : { texte: "Formule générale d'une suite géométrique :", latex: "u_n=u_1\\times q^{n-1}" };
    case "nombreTermes":
      return e.variante === "somme"
        ? { texte: `La somme commence au premier terme (année ${e.annee1}) et s'arrête au dernier terme, celui de l'année ${anneeDuRang(e, e.nombre)} : N est le rang de cette année-là.` }
        : { texte: "" };
    case "somme":
      return arith
        ? { texte: "Somme des N premiers termes d'une suite arithmétique — N fois la moyenne du premier et du dernier terme :", latex: "S_N=\\dfrac{N\\,(u_1+u_N)}{2}" }
        : { texte: "Somme des N premiers termes d'une suite géométrique :", latex: "S_N=u_1\\times\\dfrac{1-q^N}{1-q}" };
    case "tableau":
      return arith ? { texte: "Calcule chaque terme avec la formule générale :", latex: "u_n=u_1+(n-1)\\,r" } : { texte: "Calcule chaque terme avec la formule générale :", latex: "u_n=u_1\\times q^{n-1}" };
    case "annee": {
      const cond = e.sens === "hausse" ? "uₙ dépasse le seuil" : "uₙ passe sous le seuil";
      return { texte: `Descends le tableau : repère la première ligne où ${cond}, et vérifie qu'à la ligne précédente ce n'était pas encore le cas. Réponds par l'ANNÉE de cette ligne, pas par son rang.` };
    }
  }
}

export function aideNiveau2(e: ExerciceModeliserSuite, phase: PhaseModeliserSuite): AideAvecLatex {
  const arith = e.nature === "arithmetique";
  switch (phase) {
    case "nature":
      return { texte: "" };
    case "premierTerme":
      if (e.depart === "rang1") return { texte: `L'année de rang 1 est ${e.annee1} : la valeur de cette année-là est u₁.` };
      return { texte: "Avec les données de l'énoncé :", latex: arith ? `u_1=${nbL(e.valeurDonnee)}+${jeton(e.r)}` : `u_1=${nbL(e.valeurDonnee)}\\times q` };
    case "raison":
      if (arith) {
        if (e.formulation === "pourcentInitial" && e.pct !== null) return { texte: `Les intérêts valent chaque année ${e.pct} % de la somme déposée au départ :`, latex: `r=\\dfrac{${e.pct}}{100}\\times ${nbL(e.valeurDonnee)}` };
        return { texte: "Attention au signe : quand la quantité diminue chaque année, la raison est négative." };
      }
      if (e.formulation === "pourcent") {
        return e.sens === "hausse"
          ? { texte: "Augmenter de t %, c'est garder la valeur et ajouter t % de celle-ci ; on multiplie donc par :", latex: "1+\\dfrac{t}{100}" }
          : { texte: "Diminuer de t %, c'est garder la valeur et retirer t % de celle-ci ; on multiplie donc par :", latex: "1-\\dfrac{t}{100}" };
      }
      return { texte: "Écris u₂ en fonction de u₁, puis calcule le quotient :", latex: "q=\\dfrac{u_2}{u_1}" };
    case "rang":
      return e.variante === "terme" ? { texte: `Le rang vaut le nombre d'années écoulées depuis ${e.annee1}, plus 1 :`, latex: `n=${anneeDuRang(e, e.rang)}-${e.annee1}+1` } : { texte: "" };
    case "terme":
      return e.variante === "terme" ? { texte: "Avec les valeurs trouvées :", latex: `u_{${e.rang}}=${termeSubstitue(e, e.rang)}` } : { texte: "" };
    case "nombreTermes":
      return e.variante === "somme" ? { texte: "Comme pour un rang :", latex: `N=${anneeDuRang(e, e.nombre)}-${e.annee1}+1` } : { texte: "" };
    case "somme": {
      if (e.variante !== "somme") return { texte: "" };
      const n = e.nombre;
      if (arith) return { texte: "Calcule d'abord le dernier terme, puis remplace dans la formule :", latex: `u_{${n}}=${termeSubstitue(e, n)}\\qquad S_{${n}}=\\dfrac{${n}\\times(u_1+u_{${n}})}{2}` };
      return { texte: "Avec les valeurs trouvées :", latex: `S_{${n}}=${sommeSubstituee(e, n)}` };
    }
    case "tableau":
      return e.variante === "seuil" ? { texte: "Pour la première ligne du tableau :", latex: `u_{${e.rangsTable[0]}}=${termeSubstitue(e, e.rangsTable[0])}` } : { texte: "" };
    case "annee":
      return { texte: "L'année du rang n s'obtient ainsi :", latex: `${e.annee1}+n-1` };
  }
}

/** Phrase de méthode (corrigé, « Méthode ») : l'aide de niveau 1 sans tournure d'écran. */
export function methodeCorrige(e: ExerciceModeliserSuite, phase: PhaseModeliserSuite): AideAvecLatex {
  if (phase === "nature") {
    if (e.nature === "arithmetique") {
      return e.formulation === "pourcentInitial"
        ? { texte: "Les intérêts sont toujours calculés sur la même somme (celle du départ) : on ajoute chaque année le même montant." }
        : { texte: "On ajoute (ou on retire) chaque année la même quantité." };
    }
    return e.formulation === "pourcent"
      ? { texte: "Le pourcentage s'applique à la valeur de l'année précédente : on multiplie chaque année par le même nombre." }
      : { texte: "On multiplie chaque année par le même nombre." };
  }
  if (phase === "premierTerme" && e.depart === "rang1") return { texte: `u₁ est la valeur de l'année de rang 1, c'est-à-dire ${e.annee1}.` };
  if (phase === "annee") return { texte: "On repère dans le tableau le premier rang où le seuil est franchi (la ligne précédente ne le franchit pas), puis on le traduit en année." };
  if (phase === "raison" && e.nature === "geometrique" && e.formulation === "pourcent") {
    return e.sens === "hausse"
      ? { texte: "Augmenter de t %, c'est multiplier par :", latex: "1+\\dfrac{t}{100}" }
      : { texte: "Diminuer de t %, c'est multiplier par :", latex: "1-\\dfrac{t}{100}" };
  }
  return aideNiveau1(e, phase);
}

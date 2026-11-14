import type { ExerciceEchellesLogarithmiques } from "../core6e/echellesLogarithmiques.types";
import {
  CONTEXTES_COMBIEN,
  CONTEXTES_COMPARER_DB,
  CONTEXTES_COMPARER_PH,
  CONTEXTES_DILUER,
  CONTEXTES_ETOILES,
  CONTEXTES_REDUIRE,
  CONTEXTES_SOURCES,
  REGIONS_SEISMES,
} from "../core6e/contextesEchellesLogarithmiques";
import type { PhaseEchelles } from "../moteur6e/typesEchellesLogarithmiques";
import { modeleEchelles } from "../moteur6e/verificationEchellesLogarithmiques";
import type { AideAvecLatex, ChampAccumuler, FragmentConsigne, OptionModele } from "./formatAccumulerGrandeur";

/**
 * Couche ui (6e) — textes, aides et réponses attendues de `6gen90` « Échelles logarithmiques :
 * rapports et sommes ». Une « fiche » par instance (`fiche(e)`) rassemble TOUT ce que l'écran, le
 * récapitulatif et l'adaptateur d'export affichent : énoncé, données, options du choix fermé,
 * consignes, aides, réponses, lignes de calcul et pièges du corrigé. Les nombres viennent de
 * `modeleEchelles` (moteur), jamais recalculés ici. Types de fragments/aides/champs partagés avec
 * 6gen80 (l'écran `EtapeAccumulerGrandeur` est réutilisé tel quel).
 *
 * Écriture : virgule décimale (`{,}` en LaTeX), unités en `\text{…}`, aides = phrase terminée par
 * « : » puis la formule ; une aide ne donne jamais le résultat (il reste un calcul à faire).
 * Notation du cours : `\log` = logarithme en base 10.
 */

export type { AideAvecLatex, ChampAccumuler, FragmentConsigne, OptionModele } from "./formatAccumulerGrandeur";

const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

const DB = "\\ \\text{dB}";

/** Nombre LaTeX à `d` décimales FIXES (virgule, espace fine des milliers dès 10 000, jamais −0). */
export function nf(x: number, d: number): string {
  const r = Math.round(x * 10 ** d) / 10 ** d;
  const s = (Math.abs(r) < 10 ** -(d + 2) ? 0 : r).toFixed(d);
  const [ent, dec] = s.split(".");
  const signe = ent.startsWith("-") ? "-" : "";
  const absEnt = ent.replace("-", "");
  const groupe = absEnt.length > 4 ? absEnt.replace(/\B(?=(\d{3})+(?!\d))/g, "\\,") : absEnt;
  return signe + groupe + (dec ? `{,}${dec}` : "");
}

/** Nombre LaTeX avec au plus `d` décimales (zéros inutiles retirés). */
export function nt(x: number, d = 6): string {
  const s = nf(x, d);
  return s.includes("{,}") ? s.replace(/0+$/, "").replace(/\{,\}$/, "") : s;
}

/** « = valeur » si la valeur s'écrit exactement avec `d` décimales, sinon « ≈ valeur arrondie ». */
function egal(x: number, d: number): string {
  const exact = Math.abs(x - Math.round(x * 10 ** d) / 10 ** d) < 1e-9;
  return exact ? `=${nt(x, d)}` : `\\approx ${nf(x, d)}`;
}

/** Précision annoncée d'une réponse à `d` décimales. */
function precision(d: number): string {
  if (d === 0) return "à l'unité";
  if (d === 1) return "au dixième";
  return "au centième";
}

/** « de » + groupe nominal, avec contraction (du, de l', d'un). */
function de(nom: string): string {
  if (nom.startsWith("le ")) return `du ${nom.slice(3)}`;
  if (nom.startsWith("un ")) return `d'un ${nom.slice(3)}`;
  return `de ${nom}`;
}

export interface FicheEchelles {
  consigneGenerale: FragmentConsigne[];
  blocDonnees: string[];
  /** Options canoniques de l'écran « traduire » (0 = la bonne), avant mélange. */
  options: string[];
  consignes: Record<PhaseEchelles, FragmentConsigne[]>;
  /** La question du problème telle qu'elle s'imprime (écran « réponse », sans guidage). */
  questionPapier: FragmentConsigne[];
  champs: Record<Exclude<PhaseEchelles, "traduire">, ChampAccumuler>;
  aides: Record<PhaseEchelles, [AideAvecLatex, AideAvecLatex | null]>;
  reponses: Record<PhaseEchelles, string>;
  /** Lignes « Calcul » du corrigé, par écran (LaTeX). */
  calculs: Record<PhaseEchelles, string>;
  /** Ligne « Piège » ciblée du corrigé, par écran. */
  pieges: Record<PhaseEchelles, string>;
}

const PH_EXPRESSION = "nombre ou expression";
const PH_NOMBRE = "nombre seul";

// ============================================================================
// Type « facteur » : la grandeur est multipliée (ou divisée) par k → nouvel écart sur l'échelle.
// ============================================================================

interface DescFacteur {
  intro: FragmentConsigne[];
  donnees: string[];
  options: string[];
  consigneTraduire: FragmentConsigne[];
  aideTraduire: AideAvecLatex;
  justification: string;
  /** Nom de l'écart (« \Delta L »), formule symbolique (« 10\log(n) ») et numérique. */
  nomEcart: string;
  formuleEcart: string;
  formuleEcartNum: string;
  uniteEcart: string;
  libelleEcart: string;
  consigneCalcul: FragmentConsigne[];
  /** Question finale (sans la précision), nom et unité de la réponse. */
  question: FragmentConsigne[];
  nomReponse: string;
  uniteReponse: string;
  libelleReponse: string;
  relationReponse: string;
  /** Valeur de départ en LaTeX et opération (+ ou −). */
  depart: string;
  pieges: Record<PhaseEchelles, string>;
  aideReponse2: AideAvecLatex | null;
}

function ficheFacteur(e: ExerciceEchellesLogarithmiques, d: DescFacteur): FicheEchelles {
  const m = modeleEchelles(e);
  const dr = m.decimalesReponse;
  const op = m.reponse >= e.v1 ? "+" : "-";
  const ecart = `${d.nomEcart}=${d.formuleEcartNum}${egal(m.calcul, 2)}${d.uniteEcart}`;
  const questionComplete = [...d.question, t(` Arrondis ${precision(dr)}.`)];
  return {
    consigneGenerale: d.intro,
    blocDonnees: d.donnees,
    options: d.options,
    consignes: {
      traduire: d.consigneTraduire,
      calcul: [...d.consigneCalcul, t(" Donne la valeur exacte ou arrondie au centième.")],
      reponse: questionComplete,
    },
    questionPapier: questionComplete,
    champs: {
      calcul: { label: d.libelleEcart, placeholder: PH_EXPRESSION, expression: true },
      reponse: { label: d.libelleReponse, placeholder: PH_NOMBRE, expression: false },
    },
    aides: {
      traduire: [d.aideTraduire, null],
      calcul: [
        { texte: "L'écart sur l'échelle dépend seulement du facteur :", latex: `${d.nomEcart}=${d.formuleEcart}` },
        { texte: "Remplace le facteur par sa valeur :", latex: `${d.nomEcart}=${d.formuleEcartNum}` },
      ],
      reponse: [{ texte: "Applique l'écart à la valeur de départ :", latex: d.relationReponse }, d.aideReponse2],
    },
    reponses: {
      traduire: d.options[0],
      calcul: ecart,
      reponse: `${d.nomReponse}${egal(m.reponse, dr)}${d.uniteReponse}`,
    },
    calculs: {
      traduire: d.justification,
      calcul: ecart,
      reponse: `${d.nomReponse}=${d.depart}${op}${egal(m.calcul, 2).replace(/^=|^\\approx /, "")}${egal(m.reponse, dr)}${d.uniteReponse}`,
    },
    pieges: d.pieges,
  };
}

const FORMULE_DB = "L=10\\log\\left(\\dfrac{I}{I_0}\\right)";
const FORMULE_ENERGIE = "\\log(E)=1{,}5\\,M+4{,}8";
const FORMULE_PH = "\\mathrm{pH}=-\\log(c)";
const FORMULE_ETOILES = "m=-2{,}5\\log(E)+C";

function introDb(): FragmentConsigne[] {
  return [t(" Le niveau sonore "), l("L"), t(" (en décibels) d'un son d'intensité "), l("I"), t(" vaut "), l(FORMULE_DB), t(", où "), l("I_0"), t(" est une intensité de référence ; les intensités de plusieurs sources qui fonctionnent ensemble s'additionnent.")];
}

function ficheDbSources(e: ExerciceEchellesLogarithmiques): FicheEchelles {
  const c = CONTEXTES_SOURCES[e.contexte];
  return ficheFacteur(e, {
    intro: [t(`${c.nom} produit un niveau sonore `), l(`L_1=${e.v1}${DB}`), t(`. On fait fonctionner ${e.k} ${c.pluriel} identiques au même endroit.`), ...introDb()],
    donnees: [`L_1=${e.v1}${DB}`, `n=${e.k}`],
    options: ["L=L_1+10\\log(n)", "L=n\\cdot L_1", "L=L_1+10\\,n", "L=L_1+\\log(n)"],
    consigneTraduire: [t(`Ensemble, les ${e.k} ${c.pluriel} ont une intensité `), l("n"), t(" fois plus grande qu'une seule. Quelle relation donne le niveau sonore total "), l("L"), t(" ?")],
    aideTraduire: { texte: "Le logarithme transforme un produit en somme :", latex: "\\log(n\\cdot I)=\\log(n)+\\log(I)" },
    justification: "L=10\\log\\left(\\dfrac{n\\,I_1}{I_0}\\right)=10\\log(n)+10\\log\\left(\\dfrac{I_1}{I_0}\\right)=L_1+10\\log(n)",
    nomEcart: "\\Delta L",
    formuleEcart: "10\\log(n)",
    formuleEcartNum: `10\\log(${e.k})`,
    uniteEcart: DB,
    libelleEcart: "\\Delta L (en dB) =",
    consigneCalcul: [t("De combien de décibels le niveau sonore augmente-t-il ?")],
    question: [t(`Quel est le niveau sonore total des ${e.k} ${c.pluriel} ?`)],
    nomReponse: "L",
    uniteReponse: DB,
    libelleReponse: "L (en dB) =",
    relationReponse: "L=L_1+\\Delta L",
    depart: `${e.v1}`,
    pieges: {
      traduire: "Multiplier le niveau par le nombre de sources : ce sont les intensités qui s'additionnent, pas les décibels (deux sources de 60 dB donnent environ 63 dB, jamais 120 dB).",
      calcul: "Calculer 10 fois n au lieu de 10 fois le logarithme de n.",
      reponse: "Donner l'augmentation seule, sans l'ajouter au niveau d'une source.",
    },
    aideReponse2: { texte: "On ajoute des décibels, on ne multiplie jamais le niveau :", latex: "L\\neq n\\cdot L_1" },
  });
}

function ficheDbReduire(e: ExerciceEchellesLogarithmiques): FicheEchelles {
  const c = CONTEXTES_REDUIRE[e.contexte];
  return ficheFacteur(e, {
    intro: [t(`${c.protection} divise par ${e.k} l'intensité sonore ${c.bruit} `), l(`L_1=${e.v1}${DB}`), t("."), ...introDb().slice(0, 8), t(" est une intensité de référence.")],
    donnees: [`L_1=${e.v1}${DB}`, `k=${e.k}`],
    options: ["L=L_1-10\\log(k)", "L=\\dfrac{L_1}{k}", "L=L_1+10\\log(k)", "L=L_1-\\log(k)"],
    consigneTraduire: [t("L'intensité sonore est divisée par "), l("k"), t(". Quelle relation donne le nouveau niveau sonore "), l("L"), t(" ?")],
    aideTraduire: { texte: "Le logarithme transforme un quotient en différence :", latex: "\\log\\left(\\dfrac{I}{k}\\right)=\\log(I)-\\log(k)" },
    justification: "L=10\\log\\left(\\dfrac{I_1}{k\\,I_0}\\right)=10\\log\\left(\\dfrac{I_1}{I_0}\\right)-10\\log(k)=L_1-10\\log(k)",
    nomEcart: "\\Delta L",
    formuleEcart: "10\\log(k)",
    formuleEcartNum: `10\\log(${e.k})`,
    uniteEcart: DB,
    libelleEcart: "\\Delta L (en dB) =",
    consigneCalcul: [t("De combien de décibels le niveau sonore diminue-t-il ?")],
    question: [t("Quel niveau sonore reste-t-il avec cette protection ?")],
    nomReponse: "L",
    uniteReponse: DB,
    libelleReponse: "L (en dB) =",
    relationReponse: "L=L_1-\\Delta L",
    depart: `${e.v1}`,
    pieges: {
      traduire: "Diviser le niveau sonore par k : diviser l'intensité par k RETIRE au niveau dix fois le logarithme de k.",
      calcul: "Oublier le facteur 10 de la formule des décibels.",
      reponse: "Ajouter l'écart au lieu de le retirer : le niveau baisse.",
    },
    aideReponse2: null,
  });
}

function ficheSeismeMagnitude(e: ExerciceEchellesLogarithmiques): FicheEchelles {
  return ficheFacteur(e, {
    intro: [
      t(`Un séisme de magnitude `),
      l(`M_1=${nf(e.v1, 1)}`),
      t(` se produit ${REGIONS_SEISMES[e.contexte]}. Un second séisme libère ${e.k === 10000 ? "10 000" : e.k} fois plus d'énergie. L'énergie `),
      l("E"),
      t(" (en joules) libérée par un séisme de magnitude "),
      l("M"),
      t(" vérifie "),
      l(FORMULE_ENERGIE),
      t("."),
    ],
    donnees: [`M_1=${nf(e.v1, 1)}`, `\\dfrac{E_2}{E_1}=${nt(e.k)}`],
    options: ["M_2=M_1+\\dfrac{\\log(k)}{1{,}5}", "M_2=M_1+1{,}5\\log(k)", "M_2=k\\cdot M_1", "M_2=M_1+\\log(k)"],
    consigneTraduire: [t("On note "), l("k=\\dfrac{E_2}{E_1}"), t(". Quelle relation donne la magnitude "), l("M_2"), t(" du second séisme ?")],
    aideTraduire: { texte: "Soustrais les deux relations, le terme 4,8 disparaît :", latex: "\\log(E_2)-\\log(E_1)=1{,}5\\,(M_2-M_1)" },
    justification: "\\log\\left(\\dfrac{E_2}{E_1}\\right)=1{,}5\\,(M_2-M_1)\\iff M_2=M_1+\\dfrac{\\log(k)}{1{,}5}",
    nomEcart: "\\Delta M",
    formuleEcart: "\\dfrac{\\log(k)}{1{,}5}",
    formuleEcartNum: `\\dfrac{\\log(${nt(e.k)})}{1{,}5}`,
    uniteEcart: "",
    libelleEcart: "\\Delta M =",
    consigneCalcul: [t("De combien la magnitude augmente-t-elle ?")],
    question: [t("Quelle est la magnitude du second séisme ?")],
    nomReponse: "M_2",
    uniteReponse: "",
    libelleReponse: "M_2 =",
    relationReponse: "M_2=M_1+\\Delta M",
    depart: nf(e.v1, 1),
    pieges: {
      traduire: "Multiplier par 1,5 au lieu de diviser : c'est le logarithme de l'énergie qui varie de 1,5 fois l'écart des magnitudes, l'écart des magnitudes vaut donc le logarithme de k divisé par 1,5.",
      calcul: "Prendre pour écart le logarithme de k, en oubliant le coefficient 1,5 de la relation.",
      reponse: "Multiplier la magnitude par k : un facteur sur l'énergie s'AJOUTE sur l'échelle des magnitudes.",
    },
    aideReponse2: null,
  });
}

function fichePhDiluer(e: ExerciceEchellesLogarithmiques): FicheEchelles {
  return ficheFacteur(e, {
    intro: [
      t(`On dilue ${e.k} fois ${CONTEXTES_DILUER[e.contexte]} dont le pH vaut `),
      l(`\\mathrm{pH}_0=${nf(e.v1, 1)}`),
      t(` : on ajoute de l'eau jusqu'à obtenir un volume ${e.k} fois plus grand, ce qui divise par ${e.k} la concentration `),
      l("c"),
      t(" en ions "),
      l("\\mathrm{H_3O^+}"),
      t(" (en mol/L). Le pH vaut "),
      l(FORMULE_PH),
      t("."),
    ],
    donnees: [`\\mathrm{pH}_0=${nf(e.v1, 1)}`, `k=${e.k}`],
    options: ["\\mathrm{pH}=\\mathrm{pH}_0+\\log(k)", "\\mathrm{pH}=\\mathrm{pH}_0-\\log(k)", "\\mathrm{pH}=k\\cdot\\mathrm{pH}_0", "\\mathrm{pH}=\\mathrm{pH}_0+k"],
    consigneTraduire: [t("La concentration en ions "), l("\\mathrm{H_3O^+}"), t(" est divisée par "), l("k"), t(". Quelle relation donne le pH de la solution diluée ?")],
    aideTraduire: { texte: "Le signe moins de la formule change le sens de l'effet :", latex: "-\\log\\left(\\dfrac{c}{k}\\right)=-\\log(c)+\\log(k)" },
    justification: "\\mathrm{pH}=-\\log\\left(\\dfrac{c}{k}\\right)=-\\log(c)+\\log(k)=\\mathrm{pH}_0+\\log(k)",
    nomEcart: "\\Delta\\mathrm{pH}",
    formuleEcart: "\\log(k)",
    formuleEcartNum: `\\log(${e.k})`,
    uniteEcart: "",
    libelleEcart: "\\Delta\\mathrm{pH} =",
    consigneCalcul: [t("De combien le pH augmente-t-il ?")],
    question: [t("Quel est le pH de la solution diluée ?")],
    nomReponse: "\\mathrm{pH}",
    uniteReponse: "",
    libelleReponse: "\\mathrm{pH} =",
    relationReponse: "\\mathrm{pH}=\\mathrm{pH}_0+\\Delta\\mathrm{pH}",
    depart: nf(e.v1, 1),
    pieges: {
      traduire: "Faire baisser le pH : une dilution rend la solution MOINS acide, son pH augmente.",
      calcul: "Prendre l'écart égal à k : diluer 10 fois augmente le pH de 1, pas de 10.",
      reponse: "Multiplier le pH par le facteur de dilution.",
    },
    aideReponse2: null,
  });
}

function ficheEtoilesMagnitude(e: ExerciceEchellesLogarithmiques): FicheEchelles {
  const moins = e.sens === "moins";
  const options = moins
    ? ["m_B=m_A+2{,}5\\log(k)", "m_B=m_A-2{,}5\\log(k)", "m_B=m_A+0{,}4\\log(k)", "m_B=k\\cdot m_A"]
    : ["m_B=m_A-2{,}5\\log(k)", "m_B=m_A+2{,}5\\log(k)", "m_B=m_A-0{,}4\\log(k)", "m_B=\\dfrac{m_A}{k}"];
  return ficheFacteur(e, {
    intro: [
      t(`${CONTEXTES_ETOILES[e.contexte]} L'étoile A a une magnitude apparente `),
      l(`m_A=${nf(e.v1, 1)}`),
      t(` ; l'étoile B paraît ${e.k} fois ${moins ? "moins" : "plus"} lumineuse que A. La magnitude apparente vaut `),
      l(FORMULE_ETOILES),
      t(", où "),
      l("E"),
      t(" est l'éclat de l'étoile (la lumière reçue) et "),
      l("C"),
      t(" une constante : plus une étoile paraît brillante, plus sa magnitude est petite."),
    ],
    donnees: [`m_A=${nf(e.v1, 1)}`, moins ? `\\dfrac{E_A}{E_B}=${e.k}` : `\\dfrac{E_B}{E_A}=${e.k}`],
    options,
    consigneTraduire: [t("On note "), l("k"), t(` le facteur d'éclat. Quelle relation donne la magnitude `), l("m_B"), t(" de l'étoile B ?")],
    aideTraduire: { texte: "Écris l'écart des magnitudes avec le quotient des éclats :", latex: "m_B-m_A=-2{,}5\\log\\left(\\dfrac{E_B}{E_A}\\right)" },
    justification: moins
      ? "m_B-m_A=-2{,}5\\log\\left(\\dfrac{E_B}{E_A}\\right)=-2{,}5\\log\\left(\\dfrac{1}{k}\\right)=2{,}5\\log(k)"
      : "m_B-m_A=-2{,}5\\log\\left(\\dfrac{E_B}{E_A}\\right)=-2{,}5\\log(k)",
    nomEcart: "|m_B-m_A|",
    formuleEcart: "2{,}5\\log(k)",
    formuleEcartNum: `2{,}5\\log(${e.k})`,
    uniteEcart: "",
    libelleEcart: "|m_B-m_A| =",
    consigneCalcul: [t("Quel est l'écart entre les deux magnitudes, sans tenir compte du signe ?")],
    question: [t("Quelle est la magnitude apparente de l'étoile B ?")],
    nomReponse: "m_B",
    uniteReponse: "",
    libelleReponse: "m_B =",
    relationReponse: moins ? "m_B=m_A+|m_B-m_A|" : "m_B=m_A-|m_B-m_A|",
    depart: nf(e.v1, 1),
    pieges: {
      traduire: moins ? "Se tromper de sens : une étoile MOINS lumineuse a une magnitude PLUS grande." : "Se tromper de sens : une étoile PLUS lumineuse a une magnitude PLUS petite (éventuellement négative).",
      calcul: "Utiliser 0,4 au lieu de 2,5 : 0,4 sert à passer de l'écart de magnitudes au logarithme du rapport d'éclat.",
      reponse: moins ? "Retrancher l'écart : B est moins lumineuse, sa magnitude est plus grande." : "Ajouter l'écart : B est plus lumineuse, sa magnitude est plus petite.",
    },
    aideReponse2: { texte: moins ? "B est moins lumineuse que A : sa magnitude est plus grande." : "B est plus lumineuse que A : sa magnitude est plus petite.", latex: null },
  });
}

// ============================================================================
// Type « rapport » : deux valeurs sur l'échelle → combien de fois plus ?
// ============================================================================

interface DescRapport {
  intro: FragmentConsigne[];
  donnees: string[];
  options: string[];
  consigneTraduire: FragmentConsigne[];
  aideTraduire: AideAvecLatex;
  justification: string;
  /** Rapport en LaTeX (`\dfrac{I_2}{I_1}`) et en version courte pour les libellés (`I_2/I_1`). */
  rapport: string;
  rapportCourt: string;
  /** Écart en LaTeX avec les valeurs (`\dfrac{95-55}{10}`). */
  calculLog: string;
  question: FragmentConsigne[];
  pieges: Record<PhaseEchelles, string>;
}

function ficheRapport(e: ExerciceEchellesLogarithmiques, d: DescRapport): FicheEchelles {
  const m = modeleEchelles(e);
  const exact = Number.isInteger(m.calcul);
  const dr = m.decimalesReponse;
  const logR = `\\log\\left(${d.rapport}\\right)`;
  const reponse = exact ? `${d.rapport}=10^{${nt(m.calcul)}}=${nt(m.reponse, 0)}` : `${d.rapport}=10^{${nt(m.calcul)}}\\approx ${nf(m.reponse, dr)}`;
  const questionComplete = [...d.question, t(exact ? " Donne la valeur exacte." : ` Arrondis ${precision(dr)}.`)];
  return {
    consigneGenerale: d.intro,
    blocDonnees: d.donnees,
    options: d.options,
    consignes: {
      traduire: d.consigneTraduire,
      calcul: [t("Calcule "), l(logR), t(".")],
      reponse: questionComplete,
    },
    questionPapier: questionComplete,
    champs: {
      calcul: { label: `\\log(${d.rapportCourt}) =`, placeholder: PH_EXPRESSION, expression: true },
      reponse: { label: `${d.rapportCourt} =`, placeholder: PH_NOMBRE, expression: false },
    },
    aides: {
      traduire: [d.aideTraduire, null],
      calcul: [
        { texte: "Utilise la relation entre l'écart sur l'échelle et le logarithme du rapport :", latex: d.options[0] },
        { texte: "Remplace par les valeurs de l'énoncé :", latex: `${logR}=${d.calculLog}` },
      ],
      reponse: [
        { texte: "Repasse du logarithme au nombre :", latex: "\\log(x)=a\\iff x=10^{a}" },
        { texte: "Ici :", latex: `${d.rapport}=10^{${nt(m.calcul)}}` },
      ],
    },
    reponses: {
      traduire: d.options[0],
      calcul: `${logR}=${nt(m.calcul)}`,
      reponse,
    },
    calculs: {
      traduire: d.justification,
      calcul: `${logR}=${d.calculLog}=${nt(m.calcul)}`,
      reponse,
    },
    pieges: d.pieges,
  };
}

function ficheDbComparer(e: ExerciceEchellesLogarithmiques): FicheEchelles {
  const a = CONTEXTES_COMPARER_DB[e.contexte].lieu;
  const b = CONTEXTES_COMPARER_DB[e.contexte2].lieu;
  return ficheRapport(e, {
    intro: [t(`Un sonomètre mesure un niveau sonore `), l(`L_1=${e.v1}${DB}`), t(` ${a}, puis `), l(`L_2=${e.v2}${DB}`), t(` ${b}. Le niveau sonore `), l("L"), t(" (en décibels) d'un son d'intensité "), l("I"), t(" vaut "), l(FORMULE_DB), t(", où "), l("I_0"), t(" est une intensité de référence.")],
    donnees: [`L_1=${e.v1}${DB}`, `L_2=${e.v2}${DB}`],
    options: [
      "\\log\\left(\\dfrac{I_2}{I_1}\\right)=\\dfrac{L_2-L_1}{10}",
      "\\dfrac{I_2}{I_1}=\\dfrac{L_2}{L_1}",
      "\\dfrac{I_2}{I_1}=L_2-L_1",
      "\\log\\left(\\dfrac{I_2}{I_1}\\right)=10\\,(L_2-L_1)",
    ],
    consigneTraduire: [t("On veut comparer les intensités "), l("I_2"), t(" et "), l("I_1"), t(". Quelle relation relie leur rapport à l'écart des niveaux ?")],
    aideTraduire: { texte: "Écris la différence des deux niveaux, les termes en I₀ disparaissent :", latex: "L_2-L_1=10\\log(I_2)-10\\log(I_1)" },
    justification: "L_2-L_1=10\\log\\left(\\dfrac{I_2}{I_0}\\right)-10\\log\\left(\\dfrac{I_1}{I_0}\\right)=10\\log\\left(\\dfrac{I_2}{I_1}\\right)",
    rapport: "\\dfrac{I_2}{I_1}",
    rapportCourt: "I_2/I_1",
    calculLog: `\\dfrac{${e.v2}-${e.v1}}{10}`,
    question: [t(`Combien de fois l'intensité sonore est-elle plus grande ${b} que ${a} ?`)],
    pieges: {
      traduire: "Diviser les niveaux en décibels : le quotient des intensités se lit sur l'ÉCART des niveaux, pas sur leur quotient.",
      calcul: "Oublier de diviser l'écart par 10.",
      reponse: "Prendre l'écart des niveaux pour le rapport : 10 dB de plus, c'est une intensité 10 fois plus grande, et 20 dB de plus, 100 fois plus grande.",
    },
  });
}

function ficheSeismeRapport(e: ExerciceEchellesLogarithmiques): FicheEchelles {
  const energie = e.variante === "seisme-energie";
  const g = energie ? "E" : "A";
  const intro: FragmentConsigne[] = [
    t("Un séisme de magnitude "),
    l(`M_1=${nf(e.v1, 1)}`),
    t(` se produit ${REGIONS_SEISMES[e.contexte]}, puis un séisme de magnitude `),
    l(`M_2=${nf(e.v2, 1)}`),
    t(` ${REGIONS_SEISMES[e.contexte2]}.`),
  ];
  if (energie) intro.push(t(" L'énergie "), l("E"), t(" (en joules) libérée par un séisme de magnitude "), l("M"), t(" vérifie "), l(FORMULE_ENERGIE), t("."));
  else intro.push(t(" Des stations sismiques situées à la même distance des deux épicentres mesurent l'amplitude "), l("A"), t(" des ondes ; la magnitude vaut "), l("M=\\log\\left(\\dfrac{A}{A_0}\\right)"), t(", où "), l("A_0"), t(" est une amplitude de référence."));
  const rapport = `\\dfrac{${g}_2}{${g}_1}`;
  const logR = `\\log\\left(${rapport}\\right)`;
  return ficheRapport(e, {
    intro,
    donnees: [`M_1=${nf(e.v1, 1)}`, `M_2=${nf(e.v2, 1)}`],
    options: energie
      ? [`${logR}=1{,}5\\,(M_2-M_1)`, `${logR}=M_2-M_1`, `${rapport}=1{,}5\\,(M_2-M_1)`, `${logR}=1{,}5\\,(M_2-M_1)+4{,}8`]
      : [`${logR}=M_2-M_1`, `${rapport}=\\dfrac{M_2}{M_1}`, `${rapport}=M_2-M_1`, `${logR}=1{,}5\\,(M_2-M_1)`],
    consigneTraduire: [t(energie ? "On veut comparer les énergies " : "On veut comparer les amplitudes "), l(`${g}_2`), t(" et "), l(`${g}_1`), t(". Quelle relation relie leur rapport à l'écart des magnitudes ?")],
    aideTraduire: energie
      ? { texte: "Soustrais les deux relations, le terme 4,8 disparaît :", latex: "\\log(E_2)-\\log(E_1)=1{,}5\\,M_2-1{,}5\\,M_1" }
      : { texte: "Écris la différence des deux magnitudes, les termes en A₀ disparaissent :", latex: "M_2-M_1=\\log(A_2)-\\log(A_1)" },
    justification: energie
      ? `\\log(E_2)-\\log(E_1)=(1{,}5\\,M_2+4{,}8)-(1{,}5\\,M_1+4{,}8)\\iff ${logR}=1{,}5\\,(M_2-M_1)`
      : `M_2-M_1=\\log\\left(\\dfrac{A_2}{A_0}\\right)-\\log\\left(\\dfrac{A_1}{A_0}\\right)=${logR}`,
    rapport,
    rapportCourt: `${g}_2/${g}_1`,
    calculLog: energie ? `1{,}5\\times(${nf(e.v2, 1)}-${nf(e.v1, 1)})` : `${nf(e.v2, 1)}-${nf(e.v1, 1)}`,
    question: [t(energie ? "Combien de fois le second séisme libère-t-il plus d'énergie que le premier ?" : "Combien de fois l'amplitude des ondes du second séisme est-elle plus grande que celle du premier ?")],
    pieges: energie
      ? {
          traduire: "Confondre amplitude et énergie : pour l'énergie, le logarithme du rapport vaut 1,5 fois l'écart des magnitudes.",
          calcul: "Oublier le coefficient 1,5 (ou garder le terme 4,8, qui disparaît dans la différence).",
          reponse: "Prendre l'écart des magnitudes pour le rapport : un degré de plus, c'est environ 32 fois plus d'énergie, pas « 1 fois plus ».",
        }
      : {
          traduire: "Diviser les magnitudes : le rapport des amplitudes se lit sur l'ÉCART des magnitudes.",
          calcul: "Multiplier l'écart par 1,5 : ce coefficient concerne l'énergie, pas l'amplitude.",
          reponse: "Prendre l'écart pour le rapport : 2 degrés de plus, c'est une amplitude 100 fois plus grande, pas 2 fois.",
        },
  });
}

function fichePhComparer(e: ExerciceEchellesLogarithmiques): FicheEchelles {
  const a = CONTEXTES_COMPARER_PH[e.contexte].nom;
  const b = CONTEXTES_COMPARER_PH[e.contexte2].nom;
  const rapport = "\\dfrac{c_A}{c_B}";
  const logR = `\\log\\left(${rapport}\\right)`;
  return ficheRapport(e, {
    intro: [
      t(`Le pH ${de(a)} (solution A) vaut `),
      l(`\\mathrm{pH}_A=${nf(e.v1, 1)}`),
      t(` ; celui ${de(b)} (solution B) vaut `),
      l(`\\mathrm{pH}_B=${nf(e.v2, 1)}`),
      t(". On note "),
      l("c_A"),
      t(" et "),
      l("c_B"),
      t(" leurs concentrations en ions "),
      l("\\mathrm{H_3O^+}"),
      t(" (en mol/L) ; le pH vaut "),
      l(FORMULE_PH),
      t("."),
    ],
    donnees: [`\\mathrm{pH}_A=${nf(e.v1, 1)}`, `\\mathrm{pH}_B=${nf(e.v2, 1)}`],
    options: [`${logR}=\\mathrm{pH}_B-\\mathrm{pH}_A`, `${logR}=\\mathrm{pH}_A-\\mathrm{pH}_B`, `${rapport}=\\dfrac{\\mathrm{pH}_B}{\\mathrm{pH}_A}`, `${rapport}=\\mathrm{pH}_B-\\mathrm{pH}_A`],
    consigneTraduire: [t("On veut comparer les concentrations "), l("c_A"), t(" et "), l("c_B"), t(". Quelle relation relie leur rapport à l'écart des pH ?")],
    aideTraduire: { texte: "Attention au signe moins de la formule du pH :", latex: "\\log(c)=-\\mathrm{pH}" },
    justification: `${logR}=\\log(c_A)-\\log(c_B)=-\\mathrm{pH}_A+\\mathrm{pH}_B`,
    rapport,
    rapportCourt: "c_A/c_B",
    calculLog: `${nf(e.v2, 1)}-${nf(e.v1, 1)}`,
    question: [t(`Combien de fois la concentration en ions H₃O⁺ est-elle plus grande dans ${a} que dans ${b} ?`)],
    pieges: {
      traduire: "Inverser le sens : la solution au pH le plus PETIT est la plus concentrée en ions H₃O⁺.",
      calcul: "Faire la différence dans le mauvais sens (résultat négatif) : le rapport demandé est plus grand que 1, son logarithme est positif.",
      reponse: "Prendre l'écart des pH pour le rapport : un pH plus petit de 1 correspond à une concentration 10 fois plus grande.",
    },
  });
}

function ficheEtoilesEclat(e: ExerciceEchellesLogarithmiques): FicheEchelles {
  const rapport = "\\dfrac{E_A}{E_B}";
  const logR = `\\log\\left(${rapport}\\right)`;
  return ficheRapport(e, {
    intro: [
      t(`${CONTEXTES_ETOILES[e.contexte]} Leurs magnitudes apparentes valent `),
      l(`m_A=${nf(e.v1, 1)}`),
      t(" et "),
      l(`m_B=${nf(e.v2, 1)}`),
      t(". La magnitude apparente vaut "),
      l(FORMULE_ETOILES),
      t(", où "),
      l("E"),
      t(" est l'éclat de l'étoile (la lumière reçue) et "),
      l("C"),
      t(" une constante : plus une étoile paraît brillante, plus sa magnitude est petite."),
    ],
    donnees: [`m_A=${nf(e.v1, 1)}`, `m_B=${nf(e.v2, 1)}`],
    options: [`${logR}=0{,}4\\,(m_B-m_A)`, `${logR}=2{,}5\\,(m_B-m_A)`, `${logR}=0{,}4\\,(m_A-m_B)`, `${rapport}=\\dfrac{m_B}{m_A}`],
    consigneTraduire: [t("On veut comparer les éclats "), l("E_A"), t(" et "), l("E_B"), t(". Quelle relation relie leur rapport à l'écart des magnitudes ?")],
    aideTraduire: { texte: "Écris la différence des deux magnitudes, puis divise par −2,5 :", latex: "m_B-m_A=-2{,}5\\,\\big(\\log(E_B)-\\log(E_A)\\big)" },
    justification: `m_B-m_A=-2{,}5\\log\\left(\\dfrac{E_B}{E_A}\\right)=2{,}5\\,${logR}\\iff ${logR}=\\dfrac{m_B-m_A}{2{,}5}=0{,}4\\,(m_B-m_A)`,
    rapport,
    rapportCourt: "E_A/E_B",
    calculLog: `0{,}4\\times(${nf(e.v2, 1)}-${nf(e.v1, 1)})`,
    question: [t("Combien de fois l'étoile A paraît-elle plus lumineuse que l'étoile B ?")],
    pieges: {
      traduire: "Multiplier par 2,5 au lieu de diviser : le logarithme du rapport d'éclat vaut l'écart des magnitudes divisé par 2,5, soit 0,4 fois cet écart.",
      calcul: "Se tromper de signe : A est la plus brillante, le logarithme du rapport est positif.",
      reponse: "Prendre l'écart des magnitudes pour le rapport : 5 magnitudes d'écart, c'est un éclat 100 fois plus grand.",
    },
  });
}

// ============================================================================
// Type « combien » : combien de sources identiques pour atteindre un niveau ?
// ============================================================================

function ficheDbCombien(e: ExerciceEchellesLogarithmiques): FicheEchelles {
  const c = CONTEXTES_COMBIEN[e.contexte];
  const m = modeleEchelles(e);
  const exact = Number.isInteger(m.calcul);
  const options = ["L_1+10\\log(n)\\geq L_c", "n\\cdot L_1\\geq L_c", "L_1+10\\,n\\geq L_c", "L_1+\\log(n)\\geq L_c"];
  const sujet = c.nom.charAt(0).toLowerCase() + c.nom.slice(1);
  const question = [t(`Combien de ${c.pluriel} identiques faut-il au minimum pour atteindre au moins `), l(`${e.v2}${DB}`), t(" ?")];
  const rapportTxt = exact ? `10^{${nt(m.calcul)}}=${nt(m.reponse, 0)}` : `10^{${nt(m.calcul)}}\\approx ${nf(10 ** m.calcul, 2)}`;
  return {
    consigneGenerale: [
      t(`${c.nom} produit un niveau sonore `),
      l(`L_1=${e.v1}${DB}`),
      t(`. On souhaite atteindre un niveau d'au moins `),
      l(`L_c=${e.v2}${DB}`),
      t(" en faisant jouer ensemble "),
      l("n"),
      t(` ${c.pluriel} identiques.`),
      ...introDb(),
    ],
    blocDonnees: [`L_1=${e.v1}${DB}`, `L_c=${e.v2}${DB}`],
    options,
    consignes: {
      traduire: [t("Avec "), l("n"), t(` ${c.pluriel}, l'intensité est `), l("n"), t(` fois celle d'${sujet.startsWith("un ") ? "un seul" : "une seule"}. Quelle condition doit vérifier `), l("n"), t(" ?")],
      calcul: [t("Quelle valeur minimale "), l("\\log(n)"), t(" doit-il atteindre ? Donne la valeur exacte.")],
      reponse: question,
    },
    questionPapier: question,
    champs: {
      calcul: { label: "\\log(n)_{\\min} =", placeholder: PH_EXPRESSION, expression: true },
      reponse: { label: `n (nombre de ${c.pluriel}) =`, placeholder: PH_NOMBRE, expression: false },
    },
    aides: {
      traduire: [{ texte: "Multiplier l'intensité par n ajoute un nombre fixe de décibels :", latex: "10\\log\\left(\\dfrac{n\\,I_1}{I_0}\\right)=10\\log(n)+L_1" }, null],
      calcul: [
        { texte: "Isole le terme en log(n) :", latex: "10\\log(n)\\geq L_c-L_1" },
        { texte: "Ici :", latex: `10\\log(n)\\geq ${e.v2}-${e.v1}` },
      ],
      reponse: [
        { texte: "Repasse du logarithme au nombre :", latex: "\\log(n)\\geq a\\iff n\\geq 10^{a}" },
        { texte: `n est un nombre entier de ${c.pluriel} : prends le premier entier qui convient.`, latex: null },
      ],
    },
    reponses: {
      traduire: options[0],
      calcul: `\\log(n)\\geq ${nt(m.calcul)}`,
      reponse: `n=${m.reponse}`,
    },
    calculs: {
      traduire: "L=10\\log\\left(\\dfrac{n\\,I_1}{I_0}\\right)=L_1+10\\log(n)\\geq L_c",
      calcul: `10\\log(n)\\geq ${e.v2}-${e.v1}\\iff\\log(n)\\geq ${nt(m.calcul)}`,
      reponse: `n\\geq ${rapportTxt}${exact ? "" : `\\ \\text{donc}\\ n=${m.reponse}`}`,
    },
    pieges: {
      traduire: "Multiplier le niveau par n : ce sont les intensités qui s'additionnent, pas les décibels.",
      calcul: "Oublier de diviser l'écart par 10.",
      reponse: "Arrondir à l'entier le plus proche (ou tronquer) : il faut l'entier SUPÉRIEUR pour atteindre au moins le niveau visé.",
    },
  };
}

// ============================================================================
// Points d'entrée (écran, récapitulatif, export).
// ============================================================================

export function fiche(e: ExerciceEchellesLogarithmiques): FicheEchelles {
  switch (e.variante) {
    case "db-sources":
      return ficheDbSources(e);
    case "db-reduire":
      return ficheDbReduire(e);
    case "db-combien":
      return ficheDbCombien(e);
    case "db-comparer":
      return ficheDbComparer(e);
    case "seisme-amplitude":
    case "seisme-energie":
      return ficheSeismeRapport(e);
    case "seisme-magnitude":
      return ficheSeismeMagnitude(e);
    case "ph-comparer":
      return fichePhComparer(e);
    case "ph-diluer":
      return fichePhDiluer(e);
    case "etoiles-eclat":
      return ficheEtoilesEclat(e);
    case "etoiles-magnitude":
      return ficheEtoilesMagnitude(e);
  }
}

export const LIBELLE_PHASE: Record<PhaseEchelles, string> = {
  traduire: "Traduire la situation",
  calcul: "Calcul",
  reponse: "Réponse en contexte",
};

export function consigneGenerale(e: ExerciceEchellesLogarithmiques): FragmentConsigne[] {
  return fiche(e).consigneGenerale;
}

export function blocDonnees(e: ExerciceEchellesLogarithmiques): string[] {
  return fiche(e).blocDonnees;
}

export function consigneEcran(e: ExerciceEchellesLogarithmiques, phase: PhaseEchelles): FragmentConsigne[] {
  return fiche(e).consignes[phase];
}

/** Options du choix fermé, dans l'ordre d'affichage tiré (`ordreOptions`). */
export function optionsTraduire(e: ExerciceEchellesLogarithmiques): OptionModele[] {
  const options = fiche(e).options;
  return e.ordreOptions.map((canon) => ({ id: String(canon), fragments: [l(options[canon])] }));
}

export function champEcran(e: ExerciceEchellesLogarithmiques, phase: Exclude<PhaseEchelles, "traduire">): ChampAccumuler {
  return fiche(e).champs[phase];
}

export function aideNiveau1(e: ExerciceEchellesLogarithmiques, phase: PhaseEchelles): AideAvecLatex {
  return fiche(e).aides[phase][0];
}

export function aideNiveau2(e: ExerciceEchellesLogarithmiques, phase: PhaseEchelles): AideAvecLatex {
  return fiche(e).aides[phase][1] ?? { texte: "", latex: null };
}

/** Réponse attendue d'un écran, en LaTeX (une seule formule). */
export function formatReponseAttenduePhaseLatex(e: ExerciceEchellesLogarithmiques, phase: PhaseEchelles): string[] {
  return [fiche(e).reponses[phase]];
}

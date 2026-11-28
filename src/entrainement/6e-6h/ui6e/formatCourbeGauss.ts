import type { AireCG, ExerciceCG, PhaseCG, QuestionRegle } from "../core6e/courbeGauss";
import { borneBasse, borneHaute, candidates, indexJuste, phases, phiJuste, pourcentRegle, REGLE, valeurAire } from "../core6e/courbeGauss";
import { phiExact } from "../core6e/tablePhi";
import type { AideEcran, ChampEcran, DefinitionEcrans, Frag, OptionEcran } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import { clocheSvg, nombreSvg, quatreClochesSvg } from "./figureCloche";
import type { OptionsCloche } from "./figureCloche";
import { dL, nL, NL, pctL } from "./textesLoisLotH2";
import { approchee, diagnostiquer, messageIllisible, piege } from "../moteur6e/verificationCourbeGauss";
import { correctionDetailleeCG } from "../generateurs6e/courbeGauss/corrigeDetaille";

/**
 * Couche C — textes et figures de `6gen117` « Courbe de Gauss : aires et règle empirique ». Source
 * unique de l'écran, du papier et du corrigé. Notation : 𝒩(μ ; σ), Φ(z) = P(Z ≤ z), règle empirique
 * 68,3 / 95,4 / 99,7 % (cours, § 6).
 */

type E = ExerciceCG;
type P = PhaseCG;
const t = tx;
const l = lx;
const LETTRES = ["A", "B", "C", "D"];

/** Borne au dixième (« 1{,}2 », « -0{,}8 »). */
const bL = (x: number) => dL(x, 1);

/** « P(Z\le 1{,}2) », « P(Z\le -0{,}8)+P(Z\ge 1{,}5) ». */
export function aireL(x: AireCG): string {
  switch (x.type) {
    case "gauche":
      return `P(Z\\le ${bL(x.a)})`;
    case "droite":
      return `P(Z\\ge ${bL(x.a)})`;
    case "entre":
      return `P(${bL(x.a)}\\le Z\\le ${bL(x.b)})`;
    case "queues":
      return `P(Z\\le ${bL(x.a)})+P(Z\\ge ${bL(x.b)})`;
  }
}

/** Description en mots de l'aire (messages, corrigé). */
export function aireMots(x: AireCG): Frag[] {
  switch (x.type) {
    case "gauche":
      return [t("à gauche de "), l(bL(x.a))];
    case "droite":
      return [t("à droite de "), l(bL(x.a))];
    case "entre":
      return [t("entre "), l(bL(x.a)), t(" et "), l(bL(x.b))];
    case "queues":
      return [t("à gauche de "), l(bL(x.a)), t(" et à droite de "), l(bL(x.b))];
  }
}

/** Écriture avec Φ (id) pour l'aire `x` (nombres positifs u = |a|, b). */
export function phiEcritureL(x: AireCG, id: string): string {
  const une = x.type === "gauche" || x.type === "droite";
  const u = `\\Phi(${bL(Math.abs(x.a))})`;
  const B = `\\Phi(${bL(x.b)})`;
  if (une) {
    if (id === "phi") return u;
    if (id === "unMoins") return `1-${u}`;
    if (id === "moinsDemi") return `${u}-0{,}5`;
    return `2${u}-1`;
  }
  if (id === "diff") return `${B}-${u}`;
  if (id === "sommeMoinsUn") return `${B}+${u}-1`;
  if (id === "deuxMoins") return `2-${B}-${u}`;
  return `1-${B}+${u}`;
}

/** Valeur exacte d'une écriture avec Φ (messages : « cette écriture vaut environ … »). */
export function valeurPhi(x: AireCG, id: string): number {
  const U = phiExact(Math.abs(x.a));
  const B = phiExact(x.b);
  switch (id) {
    case "phi":
      return U;
    case "unMoins":
      return 1 - U;
    case "moinsDemi":
      return U - 0.5;
    case "deuxPhiMoinsUn":
      return 2 * U - 1;
    case "diff":
      return B - U;
    case "sommeMoinsUn":
      return B + U - 1;
    case "deuxMoins":
      return 2 - B - U;
    default:
      return 1 - B + U;
  }
}

function optionsCloche(x: AireCG, extra: Partial<OptionsCloche> = {}): OptionsCloche {
  const zones = x.type === "gauche" ? [{ de: -Infinity, a: x.a }] : x.type === "droite" ? [{ de: x.a, a: Infinity }] : x.type === "entre" ? [{ de: x.a, a: x.b }] : [{ de: -Infinity, a: x.a }, { de: x.b, a: Infinity }];
  const bornes = x.type === "gauche" || x.type === "droite" ? [x.a] : [x.a, x.b];
  const reperes = [...(bornes.some((z) => Math.abs(z) < 0.25) ? [] : [{ z: 0, etiquette: "0" }]), ...bornes.map((z) => ({ z, etiquette: nombreSvg(z), trait: true }))];
  return { zones, reperes, titre: "Courbe de Gauss de la loi normale centrée réduite, aire colorée", ...extra };
}

export const figureAire = (x: AireCG, largeur = 320) => clocheSvg({ ...optionsCloche(x), largeur });

export function figureQuatre(e: E): string {
  const c = candidates(e.aire);
  return quatreClochesSvg(
    e.ordre.map((i, k) => ({ ...optionsCloche(c[i]!), lettre: LETTRES[k] })),
    "Quatre courbes de Gauss A, B, C et D, chacune avec une aire colorée",
  );
}

/* ---------------------------------------------------------------- règle empirique */

export const CONTEXTES_REGLE: { phrase: string; objets: string; verbe: string; unite: string }[] = [
  { phrase: "La taille des élèves d'une grande école", objets: "élèves", verbe: "mesurent", unite: "cm" },
  { phrase: "La masse des paquets de café remplis par une machine", objets: "paquets", verbe: "pèsent", unite: "g" },
  { phrase: "La durée de vie des ampoules d'un modèle", objets: "ampoules", verbe: "durent", unite: "h" },
  { phrase: "La durée du trajet d'un élève entre son domicile et l'école, sur une année", objets: "trajets", verbe: "durent", unite: "min" },
];

const nU = (x: number, u: string) => `${nL(x)}\\text{ ${u}}`;

/** Intervalle décrit par la question (« entre 154 cm et 186 cm »). */
export function intervalleMots(e: E): Frag[] {
  const c = CONTEXTES_REGLE[e.ctx]!;
  const a = l(nU(borneBasse(e), c.unite));
  const b = l(nU(borneHaute(e), c.unite));
  const m = l(nU(e.mu, c.unite));
  const q: Record<QuestionRegle, Frag[]> = {
    entre: [t("entre "), a, t(" et "), b],
    hors: [t("moins de "), a, t(" ou plus de "), b],
    auDela: [t("plus de "), b],
    enDeca: [t("moins de "), a],
    moitieHaut: [t("entre "), m, t(" et "), b],
    moitieBas: [t("entre "), a, t(" et "), m],
    sous: [t("moins de "), b],
    dessus: [t("plus de "), a],
  };
  return q[e.question];
}

export function situationRegle(e: E): Frag[] {
  const c = CONTEXTES_REGLE[e.ctx]!;
  return [t(`${c.phrase} suit une loi normale de moyenne `), l(nU(e.mu, c.unite)), t(" et d'écart-type "), l(nU(e.sigma, c.unite)), t(" : "), l(`X\\sim${NL(e.mu, e.sigma)}`), t(".")];
}

export function questionRegle(e: E): Frag[] {
  const c = CONTEXTES_REGLE[e.ctx]!;
  return [t(`À l'aide de la règle empirique, donne le pourcentage des ${c.objets} qui ${c.verbe} `), ...intervalleMots(e), t(".")];
}

/* ---------------------------------------------------------------- énoncé, écrans */

export const SITUATION_AIRE: Frag[] = [t("On considère la loi normale centrée réduite "), l("\\mathcal{N}(0\\,;1)"), t(".")];

export function question(e: E): Frag[] {
  if (e.variante === "aire") return [t("Quelle probabilité l'aire colorée sous la courbe de Gauss représente-t-elle ? Écris-la ensuite à l'aide de valeurs de "), l("\\Phi"), t(" en des nombres positifs.")];
  if (e.variante === "figure") return [t("Laquelle des quatre figures représente "), l(aireL(e.aire)), t(" par une aire colorée ? Écris ensuite cette probabilité à l'aide de valeurs de "), l("\\Phi"), t(" en des nombres positifs.")];
  return questionRegle(e);
}

export function consigneGenerale(e: E): Frag[] {
  if (e.variante === "aire" || e.variante === "figure") return [...SITUATION_AIRE, t(" "), ...question(e)];
  return [...situationRegle(e), t(" "), ...questionRegle(e)];
}

export function libelle(_e: E, p: P): string {
  return p === "aire" ? "Probabilité colorée" : p === "figure" ? "Figure" : p === "phi" ? "Écriture avec Φ" : p === "k" ? "Nombre d'écarts-types" : "Pourcentage";
}

export function consigne(e: E, p: P): Frag[] {
  if (p === "aire") return [t("Quelle probabilité l'aire colorée représente-t-elle ?")];
  if (p === "figure") return [t("Sur quelle figure l'aire colorée représente-t-elle "), l(aireL(e.aire)), t(" ?")];
  if (p === "phi") return [t("Écris "), l(aireL(e.aire)), t(" à l'aide de valeurs de "), l("\\Phi"), t(" en des nombres positifs.")];
  if (p === "k") return [t("De combien d'écarts-types "), l("k"), t(" la (ou les) borne(s) de l'intervalle s'écarte(nt)-elle(s) de la moyenne ?")];
  return [t("Donne le pourcentage demandé (règle empirique).")];
}

export function options(e: E, p: P): OptionEcran[] {
  const c = candidates(e.aire);
  if (p === "aire") return e.ordre.map((i) => ({ id: `C${i}`, fragments: [l(aireL(c[i]!))] }));
  if (p === "figure") return e.ordre.map((_i, k) => ({ id: `F${k}`, fragments: [t(`Figure ${LETTRES[k]}`)] }));
  return e.ordrePhi.map((id) => ({ id, fragments: [l(`${aireL(e.aire)}=${phiEcritureL(e.aire, id)}`)] }));
}

export function bonneOption(e: E, p: P): string {
  if (p === "aire") return `C${indexJuste(e)}`;
  if (p === "figure") return `F${e.ordre.indexOf(indexJuste(e))}`;
  return phiJuste(e.aire);
}

export const lettreJuste = (e: E): string => LETTRES[e.ordre.indexOf(indexJuste(e))]!;

export function champs(e: E, p: P): ChampEcran[] {
  if (p === "k") return [{ label: "Nombre d'écarts-types k", labelLatex: "k=", placeholder: "entier" }];
  void e;
  return [{ label: "Pourcentage", labelLatex: "\\%", placeholder: "par exemple 34,15" }];
}

export function reponse(e: E, p: P): Frag[] {
  if (p === "aire") return [l(aireL(e.aire))];
  if (p === "figure") return [t(`Figure ${lettreJuste(e)}`)];
  if (p === "phi") return [l(`${aireL(e.aire)}=${phiEcritureL(e.aire, phiJuste(e.aire))}`)];
  if (p === "k") return [l(`k=${e.k}`)];
  return [l(pctL(pourcentRegle(e), 3))];
}

export const recap = reponse;

export function aide1(_e: E, p: P): AideEcran {
  if (p === "aire" || p === "figure") return { texte: [l("P(Z\\le t)"), t(" est l'aire à gauche de "), l("t"), t(", "), l("P(Z\\ge t)"), t(" l'aire à droite, "), l("P(a\\le Z\\le b)"), t(" l'aire entre "), l("a"), t(" et "), l("b"), t(" (cours, point 6).")] };
  if (p === "phi") return { texte: [t("La table donne "), l("\\Phi(t)=P(Z\\le t)"), t(" pour "), l("t\\ge 0"), t(" ; l'aire totale vaut 1 et la courbe est symétrique par rapport à 0 :")], latex: "P(Z\\ge t)=1-\\Phi(t)\\qquad \\Phi(-t)=1-\\Phi(t)" };
  if (p === "k") return { texte: [t("Règle empirique : les bornes sont de la forme "), l("\\mu\\pm k\\sigma"), t(". Calcule l'écart entre une borne et la moyenne, puis divise par l'écart-type.")] };
  return { texte: [t("Règle empirique (cours, point 6) : environ "), l("68{,}3\\,\\%"), t(", "), l("95{,}4\\,\\%"), t(" et "), l("99{,}7\\,\\%"), t(" des valeurs dans "), l("[\\mu-\\sigma\\,;\\mu+\\sigma]"), t(", "), l("[\\mu-2\\sigma\\,;\\mu+2\\sigma]"), t(", "), l("[\\mu-3\\sigma\\,;\\mu+3\\sigma]"), t(". Le reste se partage également entre les deux côtés.")] };
}

export function aide2(e: E, p: P): AideEcran | null {
  if (p === "aire") return { texte: [t("Repère où se trouve la couleur : à gauche d'une borne, à droite, entre deux bornes, ou des deux côtés.")] };
  if (p === "figure") return { texte: [t("Cherche la figure dont la couleur est "), ...aireMots(e.aire), t(".")] };
  if (p === "phi") return e.aire.a < 0 ? { texte: [t("Ici une borne est négative : remplace "), l(`\\Phi(${bL(e.aire.a)})`), t(" par "), l(`1-\\Phi(${bL(-e.aire.a)})`), t(".")] } : { texte: [t("Ici les bornes sont positives : compare l'aire colorée avec des aires à gauche.")] };
  if (p === "k") {
    const borne = e.question === "enDeca" || e.question === "dessus" || e.question === "moitieBas" ? borneBasse(e) : borneHaute(e);
    return { texte: [t("Ici : "), l(`\\dfrac{|${nL(borne)}-${nL(e.mu)}|}{${nL(e.sigma)}}`), t(".")] };
  }
  const p0 = REGLE[e.k];
  const unCote = e.question !== "entre" && e.question !== "hors";
  return { texte: [t("Ici "), l(`${pctL(p0)}`), t(` des valeurs sont dans [μ − ${e.k}σ ; μ + ${e.k}σ]`), t(unCote ? " ; dessine la cloche et colorie la zone demandée : quelle part de 100 %, de la moitié ou du reste ?" : ".")] };
}

export function explicationChoix(e: E, p: P): string {
  if (p === "aire" || p === "figure") return `L'aire colorée est ${aireMots(e.aire).map((f) => f.valeur.replace("{,}", ",").replace("-", "−")).join("")}.`;
  if (p === "phi") return "La table ne donne que des aires à gauche de nombres positifs : on passe par le complément à 1 et la symétrie.";
  return "";
}

/** Valeur numérique d'une aire candidate (corrigé). */
export const valeurAireCG = valeurAire;

/** `6gen117` sur le socle d'écrans partagé : deux écrans par variante. */
export const DEFINITION_CG: DefinitionEcrans<E, P> = {
  phases,
  estChoix: (_e, p) => p === "aire" || p === "figure" || p === "phi",
  mode: (e, p) => (p === "aire" || p === "figure" || p === "phi" ? { type: "choix", options: options(e, p) } : { type: "champs", champs: champs(e, p) }),
  libelle,
  consigneGenerale,
  figure: (e) => (e.variante === "aire" ? figureAire(e.aire) : e.variante === "figure" ? figureQuatre(e) : null),
  consigne,
  approchee,
  aide1,
  aide2,
  aidesChoixDeuxNiveaux: true,
  diagnostiquer,
  piege,
  piegeChoixRevele: true,
  bonneOption,
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  explicationChoix,
  correction: correctionDetailleeCG,
};

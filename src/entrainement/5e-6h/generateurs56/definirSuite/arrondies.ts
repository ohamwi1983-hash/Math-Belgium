import type { DefinitionEcrans, Frag, TableauDonnees } from "../../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../../5e-4h/ui5e/ecransTrigo.types";
import type { EtapeCorrection } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, utilise } from "../../../export/corrigeTableau";
import { choisir, lireNombre56, nbL, nbT, statutNombre56 } from "../../commun56/lecture56";
import { adaptateurEcrans56 } from "../../commun56/adaptateurEcrans56";

/**
 * 56gen3, variante AJOUTÉE EN FIN de catalogue « Données arrondies : raison environ » (5e (6h), étape 6 ;
 * exercice des bactéries et des rayons X du manuel : données ARRONDIES, raison « environ »). Un tableau de
 * cinq mesures arrondies ; écrans : écarts successifs (4 champs), quotients successifs arrondis au
 * centième (4 champs), nature approchée (choix fermé, une tentative, jugé ✗ / ✓), raison approchée et
 * estimation de u₈ (2 champs, toute valeur cohérente avec les quotients ou écarts observés acceptée).
 * Verdict (géométrique / arithmétique) tiré à parts égales AVANT les nombres ; jamais dans la `forme` ;
 * niveau et durée constants (critères fixes). Calculatrice indispensable (quotients) : `calcul`
 * « calculatrice », variante exclue en « calculatrice interdite ».
 */

export type PhaseArrondies = "ecarts" | "quotients" | "nature" | "prevision";
type Nature = "geometrique" | "arithmetique";

interface ContexteArrondies {
  id: string;
  nature: Nature;
  phrase: string;
  grandeur: string;
  unite: string;
  dec: number;
  depart: [number, number];
  /** Raison (géométrique) ou écart (arithmétique) possibles. */
  raisons: number[];
}

const CONTEXTES: ContexteArrondies[] = [
  { id: "bacteries", nature: "geometrique", phrase: "Une culture de bactéries est exposée à des rayons X. On compte la population (en milliers) toutes les heures.", grandeur: "population", unite: "milliers", dec: 0, depart: [40, 90], raisons: [1.41, 1.38, 1.44, 1.35] },
  { id: "radioactif", nature: "geometrique", phrase: "On mesure chaque jour la masse (en g) d'un échantillon radioactif.", grandeur: "masse", unite: "g", dec: 1, depart: [60, 150], raisons: [0.78, 0.82, 0.75, 0.85] },
  { id: "rebonds", nature: "geometrique", phrase: "On mesure la hauteur (en cm) des rebonds successifs d'une balle.", grandeur: "hauteur", unite: "cm", dec: 1, depart: [120, 200], raisons: [0.7, 0.75, 0.8, 0.65] },
  { id: "abonnes", nature: "geometrique", phrase: "On relève chaque mois le nombre d'abonnés (en centaines) d'une chaîne de vidéos.", grandeur: "nombre d'abonnés", unite: "centaines", dec: 1, depart: [12, 30], raisons: [1.25, 1.3, 1.22, 1.35] },
  { id: "bougie", nature: "arithmetique", phrase: "On mesure toutes les heures la hauteur (en cm) d'une bougie allumée.", grandeur: "hauteur", unite: "cm", dec: 1, depart: [9, 14], raisons: [-1.6, -1.8, -1.4, -2.1] },
  { id: "plante", nature: "arithmetique", phrase: "On mesure chaque semaine la hauteur (en cm) d'une jeune plante.", grandeur: "hauteur", unite: "cm", dec: 1, depart: [5, 9], raisons: [2.3, 2.6, 1.9, 2.8] },
  { id: "citerne", nature: "arithmetique", phrase: "Une citerne se remplit ; on relève le volume d'eau (en L) chaque minute.", grandeur: "volume", unite: "L", dec: 0, depart: [30, 60], raisons: [12.5, 14.5, 11.5, 16] },
  { id: "trajet", nature: "arithmetique", phrase: "On relève toutes les dix minutes la distance parcourue (en km) par un cycliste depuis le départ.", grandeur: "distance", unite: "km", dec: 1, depart: [3, 6], raisons: [3.4, 3.8, 4.2, 3.1] },
];

export interface ExerciceArrondies {
  famille56: "arrondies";
  contexteId: string;
  nature: Nature;
  phrase: string;
  unite: string;
  dec: number;
  valeurs: number[];
  /** Rang de l'estimation demandée (u₈). */
  rang: number;
}

export const CATALOGUE_ARRONDIES = [{ id: "arrondies", label: "Données arrondies : raison environ (tableau de mesures)" }];

export function estArrondies(x: unknown): x is ExerciceArrondies {
  return !!x && (x as ExerciceArrondies).famille56 === "arrondies";
}

const arrondir = (x: number, dec: number) => Number(x.toFixed(dec));
export const ecarts = (e: ExerciceArrondies) => e.valeurs.slice(1).map((v, i) => arrondir(v - e.valeurs[i], e.dec));
export const quotients = (e: ExerciceArrondies) => e.valeurs.slice(1).map((v, i) => v / e.valeurs[i]);
const etendue = (xs: number[]) => Math.max(...xs) - Math.min(...xs);
const moyenne = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

export function genererArrondies(): ExerciceArrondies {
  const nature: Nature = Math.random() < 0.5 ? "geometrique" : "arithmetique";
  for (let essai = 0; essai < 2000; essai++) {
    const c = choisir(CONTEXTES.filter((x) => x.nature === nature));
    const r = choisir(c.raisons);
    const u1 = c.depart[0] + Math.random() * (c.depart[1] - c.depart[0]);
    const brut = Array.from({ length: 5 }, (_, i) => (nature === "geometrique" ? u1 * Math.pow(r, i) : u1 + i * r) * (1 + (Math.random() - 0.5) * 0.006));
    const valeurs = brut.map((v) => arrondir(v, c.dec));
    if (valeurs.some((v) => v <= 0)) continue;
    const e: ExerciceArrondies = { famille56: "arrondies", contexteId: c.id, nature, phrase: c.phrase, unite: c.unite, dec: c.dec, valeurs, rang: 8 };
    const q = quotients(e);
    const d = ecarts(e);
    if (d.some((x) => x === 0)) continue;
    // Le verdict doit se LIRE sans ambiguïté : quotients presque constants et écarts nettement variables
    // (géométrique), ou l'inverse (arithmétique).
    if (nature === "geometrique" && !(etendue(q) <= 0.03 && etendue(d) >= 0.15 * Math.max(...d.map(Math.abs)))) continue;
    if (nature === "arithmetique" && !(etendue(d) <= 0.08 * Math.abs(moyenne(d)) && etendue(q) >= 0.04)) continue;
    return e;
  }
  return { famille56: "arrondies", contexteId: "bacteries", nature: "geometrique", phrase: CONTEXTES[0].phrase, unite: "milliers", dec: 0, valeurs: [50, 71, 100, 141, 199], rang: 8 };
}

/** Plage acceptée pour la raison : des plus petits aux plus grands quotients (écarts) observés, ±0,01. */
export function plageRaison(e: ExerciceArrondies): [number, number] {
  const xs = e.nature === "geometrique" ? quotients(e) : ecarts(e);
  const marge = e.nature === "geometrique" ? 0.01 : 0.1;
  return [Math.min(...xs) - marge, Math.max(...xs) + marge];
}
const raisonAffichee = (e: ExerciceArrondies) => (e.nature === "geometrique" ? Number(moyenne(quotients(e)).toFixed(2)) : Number(moyenne(ecarts(e)).toFixed(Math.max(1, e.dec))));
const prolonger = (e: ExerciceArrondies, r: number) => (e.nature === "geometrique" ? e.valeurs[4] * Math.pow(r, e.rang - 5) : e.valeurs[4] + (e.rang - 5) * r);
export function plageEstimation(e: ExerciceArrondies): [number, number] {
  const [a, b] = plageRaison(e);
  const x = prolonger(e, a);
  const y = prolonger(e, b);
  const lo = Math.min(x, y);
  const hi = Math.max(x, y);
  return [lo - 0.01 * Math.abs(lo) - 0.5, hi + 0.01 * Math.abs(hi) + 0.5];
}
const estimationAffichee = (e: ExerciceArrondies) => prolonger(e, raisonAffichee(e));

const t = tx;
const l = lx;
const vL = (e: ExerciceArrondies, x: number) => nbL(x, e.dec);
const qL = (x: number) => nbL(x, 2);
const motRaison = (e: ExerciceArrondies) => (e.nature === "geometrique" ? "q" : "r");

function tableau(e: ExerciceArrondies): TableauDonnees {
  return { entetes: [[l("n")], [l("u_n")]], lignes: e.valeurs.map((v, i) => [String(i + 1), nbT(v, e.dec)]), horizontal: true };
}
const tableauLatex = (e: ExerciceArrondies) =>
  `\\begin{array}{c|ccccc} n & 1 & 2 & 3 & 4 & 5 \\\\ \\hline u_n & ${e.valeurs.map((v) => vL(e, v)).join(" & ")} \\end{array}`;

function consigneGenerale(e: ExerciceArrondies): Frag[] {
  return [t(`${e.phrase} On note `), l("u_n"), t(` la mesure numéro n (valeurs arrondies, en ${e.unite}), donnée dans le tableau.`)];
}

const consignePapier = (e: ExerciceArrondies): Frag[] => [
  t("Ces mesures sont-elles, à peu près, celles d'une suite arithmétique ou d'une suite géométrique ? Justifie par des calculs, donne une valeur approchée de la raison, puis estime "),
  l(`u_{${e.rang}}`),
  t("."),
];

function consigne(e: ExerciceArrondies, p: PhaseArrondies): Frag[] {
  if (p === "ecarts") return [t("Calcule les écarts successifs "), l("u_2-u_1"), t(", "), l("u_3-u_2"), t(", "), l("u_4-u_3"), t(" et "), l("u_5-u_4"), t(".")];
  if (p === "quotients") return [t("Calcule les quotients successifs "), l("\\dfrac{u_2}{u_1}"), t(", "), l("\\dfrac{u_3}{u_2}"), t(", "), l("\\dfrac{u_4}{u_3}"), t(" et "), l("\\dfrac{u_5}{u_4}"), t(", arrondis au centième.")];
  if (p === "nature") return [t("Que peut-on dire de cette suite de mesures ?")];
  return [t(`Donne une valeur approchée de la raison ${motRaison(e)}, puis estime `), l(`u_{${e.rang}}`), t(".")];
}

const OPTIONS = [
  { id: "geometrique", fragments: [t("Elle est à peu près géométrique : les quotients sont presque constants.")] },
  { id: "arithmetique", fragments: [t("Elle est à peu près arithmétique : les écarts sont presque constants.")] },
];

function diagnostiquer(e: ExerciceArrondies, p: PhaseArrondies, v: string[]) {
  if (p === "ecarts") return ecarts(e).map((d, i) => statutNombre56(v[i], d));
  if (p === "quotients") return quotients(e).map((q, i) => statutNombre56(v[i], q, [q - 0.0051, q + 0.0051]));
  if (p === "nature") return [v[0] === e.nature ? "correct" : "not_equivalent"] as ("correct" | "not_equivalent")[];
  return [statutNombre56(v[0], 0, plageRaison(e)), statutNombre56(v[1], 0, plageEstimation(e))];
}

function piegeArrondies(e: ExerciceArrondies, p: PhaseArrondies, v: string[]): Frag[] | null {
  if (p === "ecarts") {
    const xs = v.map(lireNombre56);
    if (xs.every((x, i) => x !== null && Math.abs(x + ecarts(e)[i]) < 1e-9)) return [t("Tu as soustrait dans le mauvais sens : on calcule le terme suivant moins le terme précédent.")];
    return null;
  }
  if (p === "quotients") {
    const xs = v.map(lireNombre56);
    if (xs.every((x, i) => x !== null && Math.abs(x - 1 / quotients(e)[i]) < 0.006)) return [t("Tu as divisé le terme précédent par le suivant : le quotient est "), l("\\dfrac{u_{n+1}}{u_n}"), t(".")];
    return null;
  }
  if (p === "nature") return v[0] === "geometrique" ? [t("Compare l'étendue des quotients et celle des écarts : ici, ce sont les écarts qui restent presque les mêmes.")] : [t("Compare l'étendue des quotients et celle des écarts : ici, ce sont les quotients qui restent presque les mêmes.")];
  const x = lireNombre56(v[0]);
  if (x !== null && e.nature === "geometrique" && Math.abs(x - moyenne(ecarts(e))) < Math.abs(x - 1)) return [t("Pour une suite géométrique, la raison est un quotient (un facteur multiplicatif), pas un écart.")];
  return null;
}

function reponseAttendue(e: ExerciceArrondies, p: PhaseArrondies): Frag[] {
  if (p === "ecarts") return [l(ecarts(e).map((d) => vL(e, d)).join("\\,;\\ "))];
  if (p === "quotients") return [l(quotients(e).map((q) => `${qL(q)}`).join("\\,;\\ "))];
  if (p === "nature") return OPTIONS.find((o) => o.id === e.nature)!.fragments;
  return [l(`${motRaison(e)}\\approx ${e.nature === "geometrique" ? qL(raisonAffichee(e)) : vL(e, raisonAffichee(e))}`), t(" et "), l(`u_{${e.rang}}\\approx ${nbL(estimationAffichee(e), Math.max(e.dec, 0))}`), t(` ${e.unite}`)];
}

function correction(e: ExerciceArrondies): EtapeCorrection[] {
  const d = ecarts(e);
  const q = quotients(e);
  const r = raisonAffichee(e);
  const geo = e.nature === "geometrique";
  const k = e.rang - 5;
  return [
    calcul("a", d.map((x, i) => ligne(`u_{${i + 2}}-u_{${i + 1}}=${vL(e, e.valeurs[i + 1])}-${vL(e, e.valeurs[i])}=${vL(e, x)}`)), [t("On soustrait chaque mesure de la suivante :")]),
    calcul("b", q.map((x, i) => ligne(`\\dfrac{u_{${i + 2}}}{u_{${i + 1}}}=\\dfrac{${vL(e, e.valeurs[i + 1])}}{${vL(e, e.valeurs[i])}}\\approx ${qL(x)}`)), [t("On divise chaque mesure par la précédente (calculatrice) :")]),
    utilise("c", [t("Une suite est arithmétique si ses écarts sont constants, géométrique si ses quotients sont constants. Avec des mesures arrondies, on ne peut attendre qu'une égalité approchée.")]),
    resultat("c", geo ? [t(`Les quotients restent entre ${nbT(Math.min(...q), 2)} et ${nbT(Math.max(...q), 2)}, alors que les écarts varient de ${nbT(Math.min(...d), e.dec)} à ${nbT(Math.max(...d), e.dec)} : la suite est à peu près géométrique.`)] : [t(`Les écarts restent entre ${nbT(Math.min(...d), e.dec)} et ${nbT(Math.max(...d), e.dec)}, alors que les quotients varient de ${nbT(Math.min(...q), 2)} à ${nbT(Math.max(...q), 2)} : la suite est à peu près arithmétique.`)]),
    calcul(
      "d",
      geo
        ? [ligne(`q\\approx ${qL(r)}`, "moyenne des quotients"), ligne(`u_{${e.rang}}=u_5\\cdot q^{${k}}\\approx ${vL(e, e.valeurs[4])}\\cdot ${qL(r)}^{${k}}\\approx ${nbL(estimationAffichee(e), e.dec)}`)]
        : [ligne(`r\\approx ${vL(e, r)}`, "moyenne des écarts"), ligne(`u_{${e.rang}}=u_5+${k}r\\approx ${vL(e, e.valeurs[4])}+${k}\\cdot ${r < 0 ? `(${vL(e, r)})` : vL(e, r)}\\approx ${nbL(estimationAffichee(e), e.dec)}`)],
      [t("On prend une raison représentative des valeurs observées et on prolonge depuis la dernière mesure :")],
    ),
    resultat("d", [l(`${motRaison(e)}\\approx ${geo ? qL(r) : vL(e, r)}`), t(" ; "), l(`u_{${e.rang}}\\approx ${nbL(estimationAffichee(e), e.dec)}`), t(` ${e.unite} (estimation : toute raison entre les valeurs observées convient).`)]),
    piege("c", [t("Exiger des quotients (ou des écarts) exactement égaux : les mesures sont arrondies, la raison n'est connue qu'« environ ».")]),
  ];
}

export const DEFINITION_ARRONDIES: DefinitionEcrans<ExerciceArrondies, PhaseArrondies> = {
  phases: () => ["ecarts", "quotients", "nature", "prevision"],
  estChoix: (_e, p) => p === "nature",
  mode: (e, p) => {
    if (p === "nature") return { type: "choix", options: OPTIONS };
    if (p === "prevision")
      return {
        type: "champs",
        champs: [
          { label: `raison ${motRaison(e)}`, labelLatex: `${motRaison(e)}\\approx`, placeholder: "valeur approchée" },
          { label: `u${e.rang}`, labelLatex: `u_{${e.rang}}\\approx`, placeholder: "estimation", unite: e.unite },
        ],
      };
    return { type: "champs", champs: [0, 1, 2, 3].map((i) => ({ label: p === "ecarts" ? `écart ${i + 1}` : `quotient ${i + 1}`, labelLatex: p === "ecarts" ? `u_{${i + 2}}-u_{${i + 1}}=` : `\\dfrac{u_{${i + 2}}}{u_{${i + 1}}}\\approx`, placeholder: "nombre" })) };
  },
  libelle: (_e, p) => ({ ecarts: "Écarts successifs", quotients: "Quotients successifs", nature: "Nature approchée", prevision: "Raison et estimation" })[p],
  consigneGenerale,
  tableau,
  consigne,
  aide1: (_e, p) =>
    p === "ecarts"
      ? { texte: [t("Un écart, c'est la différence entre une mesure et la précédente :")], latex: "u_{n+1}-u_n" }
      : p === "quotients"
        ? { texte: [t("Un quotient, c'est une mesure divisée par la précédente :")], latex: "\\dfrac{u_{n+1}}{u_n}" }
        : p === "nature"
          ? { texte: [t("Arithmétique : écarts constants. Géométrique : quotients constants. Ici, on cherche ceux qui sont presque constants.")] }
          : { texte: [t("Géométrique : "), l("u_n=u_5\\cdot q^{n-5}"), t(" ; arithmétique : "), l("u_n=u_5+(n-5)r"), t(".")] },
  aide2: (e, p) =>
    p === "ecarts"
      ? { texte: [t("Premier écart :")], latex: `u_2-u_1=${vL(e, e.valeurs[1])}-${vL(e, e.valeurs[0])}` }
      : p === "quotients"
        ? { texte: [t("Premier quotient :")], latex: `\\dfrac{u_2}{u_1}=\\dfrac{${vL(e, e.valeurs[1])}}{${vL(e, e.valeurs[0])}}` }
        : p === "nature"
          ? { texte: [t("Regarde de combien varient tes quatre écarts, puis tes quatre quotients : lesquels changent le moins ?")] }
          : { texte: [t(`Prends pour ${motRaison(e)} une valeur proche des ${e.nature === "geometrique" ? "quotients" : "écarts"} trouvés, puis prolonge ${e.rang - 5} fois depuis `), l(`u_5=${vL(e, e.valeurs[4])}`), t(".")] },
  diagnostiquer,
  piege: piegeArrondies,
  messageIllisible: () => "Écris un nombre décimal (avec une virgule). Cette saisie ne compte pas comme une tentative.",
  reponseAttendue,
  recap: (e, p) => reponseAttendue(e, p),
  piegeChoixRevele: true,
  bonneOption: (e) => e.nature,
  correction,
};

export const adaptateurArrondies = adaptateurEcrans56<ExerciceArrondies, PhaseArrondies>({
  def: DEFINITION_ARRONDIES,
  titreDocument: "Données arrondies : arithmétique ou géométrique ? — Évaluation",
  nomFichierBase: "donnees-arrondies-suite",
  catalogue: CATALOGUE_ARRONDIES,
  genererLibre: genererArrondies,
  genererVariante: () => genererArrondies(),
  donneesPapier: (e) => [t(`${e.phrase} On note `), l("u_n"), t(` la mesure numéro n (valeurs arrondies, en ${e.unite}) :`), l(`\\displaystyle ${tableauLatex(e)}`)],
  consignePapier,
  reponseBreve: (e) => [t(e.nature === "geometrique" ? "À peu près géométrique, " : "À peu près arithmétique, "), ...reponseAttendue(e, "prevision")],
  critere: (e, p) =>
    p === "ecarts"
      ? { points: 0.5, critere: [t("Écarts successifs : "), ...reponseAttendue(e, "ecarts")] }
      : p === "quotients"
        ? { points: 1, critere: [t("Quotients successifs : "), ...reponseAttendue(e, "quotients")] }
        : p === "nature"
          ? { points: 1, critere: [t("Conclusion justifiée par la comparaison des écarts et des quotients")] }
          : { points: 1.5, critere: [t("Raison approchée et estimation cohérentes : "), ...reponseAttendue(e, "prevision")] },
  erreursFrequentes: () => [
    { description: [t("Conclure « ni arithmétique ni géométrique » parce que les quotients ne sont pas exactement égaux")], cout: "0 pt sur la conclusion" },
    { description: [t("Raison géométrique prise égale à un écart")], cout: "0 pt sur la raison, estimation jugée selon la démarche" },
  ],
  reponsesAcceptees: () => [[t("Toute raison comprise entre les quotients (ou écarts) observés, et l'estimation qui en découle")]],
  criteres: () => ({ methode: 1, piege: 0, nombres: 1 }),
  profil: () => ({ casParticulier: null, forme: "arrondies", calcul: "calculatrice" }),
  calculatriceIndispensable: ["arrondies"],
});

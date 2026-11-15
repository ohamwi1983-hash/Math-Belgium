import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type {
  DonneesDetectiveStatistique,
  ExerciceCumules,
  ExerciceDispersion,
  ExerciceGroupes,
  ExerciceMoyenne,
  ExercicePosition,
  IdDescriptionStatistique,
  ReponseDetectiveStatistique,
  TableauStat,
  TypeErreurStatistique,
} from "../core/detectiveStatistique.types";

/**
 * Modèle de gen112 « Détective d'erreurs : statistique » : la copie de l'élève fictif (avec son
 * erreur), la même résolution sans erreur (corrigé), la ligne fausse et le résultat final attendu.
 * Source UNIQUE pour l'écran, la vérification et l'adaptateur de feuilles.
 *
 * Toutes les lignes sont construites par le même code, avec ou sans l'erreur (`err`) : la copie
 * reste cohérente avec son erreur (chaque ligne suivante est calculée à partir de la ligne fausse).
 * Conventions du chapitre : règle du seuil (STRICTEMENT supérieur), variance divisée par n et
 * arrondie à 2 décimales AVANT la racine, écart-type arrondi au centième.
 */

const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

// ---------------------------------------------------------------------------------------------
// Contextes (une seule source pour les mots de l'énoncé et les plages de nombres)
// ---------------------------------------------------------------------------------------------

export interface ContexteStat {
  id: string;
  /** Ce que l'on a relevé, avec article : « le nombre de livres lus pendant l'été ». */
  caractere: string;
  /** Individus au pluriel (« élèves », « voitures »). */
  individus: string;
  /** En-têtes du tableau (texte brut). */
  enTeteValeur: string;
  enTeteEffectif: string;
  /** Unité au singulier et au pluriel (« livre », « livres » ; « min », « min »). */
  unite: [string, string];
  /** Plage des valeurs (entiers). */
  min: number;
  max: number;
  /** Phrase d'introduction d'un relevé de n individus. */
  releve: (n: number) => string;
  /** Les deux groupes (variante « groupes ») : complément après « les 20 élèves … ». */
  groupes: [string, string];
}

export const CONTEXTES: ContexteStat[] = [
  {
    id: "livres",
    caractere: "le nombre de livres lus pendant l'été",
    individus: "élèves",
    enTeteValeur: "Livres lus xᵢ",
    enTeteEffectif: "Élèves nᵢ",
    unite: ["livre", "livres"],
    min: 0,
    max: 12,
    releve: (n) => `On a demandé à ${n} élèves de 4e combien de livres ils ont lus pendant l'été.`,
    groupes: ["de la 4e A", "de la 4e B"],
  },
  {
    id: "trajet",
    caractere: "la durée du trajet entre la maison et l'école (en minutes)",
    individus: "élèves",
    enTeteValeur: "Durée (min) xᵢ",
    enTeteEffectif: "Élèves nᵢ",
    unite: ["min", "min"],
    min: 5,
    max: 35,
    releve: (n) => `On a relevé la durée du trajet entre la maison et l'école (en minutes) de ${n} élèves.`,
    groupes: ["de l'école du village", "de l'école de la ville"],
  },
  {
    id: "sport",
    caractere: "le nombre d'heures de sport par semaine",
    individus: "jeunes",
    enTeteValeur: "Heures de sport xᵢ",
    enTeteEffectif: "Jeunes nᵢ",
    unite: ["h", "h"],
    min: 0,
    max: 10,
    releve: (n) => `On a demandé à ${n} jeunes combien d'heures de sport ils pratiquent par semaine.`,
    groupes: ["du club de natation", "du club d'athlétisme"],
  },
  {
    id: "passagers",
    caractere: "le nombre de passagers par voiture",
    individus: "voitures",
    enTeteValeur: "Passagers xᵢ",
    enTeteEffectif: "Voitures nᵢ",
    unite: ["passager", "passagers"],
    min: 1,
    max: 5,
    releve: (n) => `À l'entrée d'un parking, on a compté le nombre de passagers (conducteur compris) de ${n} voitures.`,
    groupes: ["arrivées le matin", "arrivées le soir"],
  },
  {
    id: "notes",
    caractere: "la note obtenue à un test noté sur 10",
    individus: "élèves",
    enTeteValeur: "Note sur 10 xᵢ",
    enTeteEffectif: "Élèves nᵢ",
    unite: ["point", "points"],
    min: 1,
    max: 10,
    releve: (n) => `Voici les notes (sur 10) obtenues par ${n} élèves à un test.`,
    groupes: ["de la 4e A", "de la 4e B"],
  },
  {
    id: "buts",
    caractere: "le nombre de buts marqués par match",
    individus: "matchs",
    enTeteValeur: "Buts marqués xᵢ",
    enTeteEffectif: "Matchs nᵢ",
    unite: ["but", "buts"],
    min: 0,
    max: 7,
    releve: (n) => `Un club de football a relevé le nombre de buts marqués lors de ses ${n} derniers matchs.`,
    groupes: ["de l'équipe des filles", "de l'équipe des garçons"],
  },
];

export function contexteDe(e: DonneesDetectiveStatistique): ContexteStat {
  return CONTEXTES[e.contexte]!;
}

// ---------------------------------------------------------------------------------------------
// Écriture des nombres (virgule décimale, signe moins typographique dans le texte)
// ---------------------------------------------------------------------------------------------

export function arrondi(x: number, decimales: number): number {
  const p = 10 ** decimales;
  const v = Math.round((x + Math.sign(x) * 1e-12) * p) / p;
  return Object.is(v, -0) ? 0 : v;
}

/** Le nombre a-t-il au plus `d` décimales (à 1e-9 près) ? */
export function auPlusDecimales(x: number, d: number): boolean {
  return Math.abs(x * 10 ** d - Math.round(x * 10 ** d)) < 1e-6;
}

/** Nombre en LaTeX (« 6{,}5 », « -3 »), au plus `decimales` décimales. */
export function nombreLatex(x: number, decimales = 2): string {
  const v = arrondi(x, decimales);
  const brut = Math.abs(v).toFixed(decimales).replace(/\.?0+$/, "");
  const [ent, dec] = brut.split(".");
  const groupe = ent!.length > 4 ? ent!.replace(/\B(?=(\d{3})+(?!\d))/g, "\\,") : ent!;
  return `${v < 0 ? "-" : ""}${groupe}${dec ? `{,}${dec}` : ""}`;
}

/** Nombre en texte (« 6,5 », « −3 »). */
export function nombreTexte(x: number, decimales = 2): string {
  return nombreLatex(x, decimales).replace("{,}", ",").replace(/\\,/g, " ").replace(/^-/, "−");
}

/** « = » si la valeur est exacte à 2 décimales, « ≈ » sinon (LaTeX). */
export function egalOuEnviron(x: number, decimales = 2): string {
  return auPlusDecimales(x, decimales) ? "=" : "\\approx";
}

/** « 6,5 livres », « 1 livre », « 12 min ». */
export function quantite(c: ContexteStat, x: number, decimales = 2): string {
  const u = Math.abs(x) < 2 ? c.unite[0] : c.unite[1];
  return `${nombreTexte(x, decimales)} ${u}`;
}

/** Unité accordée à la valeur (« 1 passager », « 3 passagers »). */
export function uniteAccordee(c: ContexteStat, x: number): string {
  return Math.abs(x) < 2 ? c.unite[0] : c.unite[1];
}

/** Unité au pluriel (champ de l'écran 3). */
export function uniteCourte(c: ContexteStat): string {
  return c.unite[1];
}

/** « 9 et 12 », « 7, 9 et 12 ». */
export function listeEt(mots: string[]): string {
  if (mots.length <= 1) return mots.join("");
  return `${mots.slice(0, -1).join(", ")} et ${mots[mots.length - 1]}`;
}

const rangOrdinal = (k: number) => (k === 1 ? "1re" : `${k}e`);

// ---------------------------------------------------------------------------------------------
// Calculs de base
// ---------------------------------------------------------------------------------------------

export const effectifTotal = (T: TableauStat) => T.effectifs.reduce((a, b) => a + b, 0);
export const sommeProduits = (T: TableauStat) => T.valeurs.reduce((a, x, i) => a + x * T.effectifs[i]!, 0);
export const sommeValeurs = (T: TableauStat) => T.valeurs.reduce((a, b) => a + b, 0);
export const moyennePonderee = (T: TableauStat) => sommeProduits(T) / effectifTotal(T);
/** Moyenne NON pondérée (l'erreur) : Σxᵢ / k. */
export const moyenneValeurs = (T: TableauStat) => sommeValeurs(T) / T.valeurs.length;

export function cumules(T: TableauStat): number[] {
  const c: number[] = [];
  T.effectifs.forEach((n, i) => c.push((c[i - 1] ?? 0) + n));
  return c;
}

export function trier(serie: readonly number[]): number[] {
  return [...serie].sort((a, b) => a - b);
}

// ---------------------------------------------------------------------------------------------
// Ligne fausse, description, nombre de lignes
// ---------------------------------------------------------------------------------------------

export function indiceLigneFausse(e: DonneesDetectiveStatistique): number {
  switch (e.variante) {
    case "moyenne":
      return e.type === "moyenneNonPonderee" ? 1 : 3;
    case "position":
      return e.type === "medianeNonTriee" ? 0 : 3;
    case "dispersion":
      return e.type === "moyenneNonPonderee" ? 1 : e.type === "varianceSansN" ? 3 : 4;
    case "cumules":
      return e.type === "q1MalPlace" ? 1 : 3;
    case "groupes":
      return e.type === "moyenneNonPonderee" ? 1 : 2;
  }
}

export function typeErreur(e: DonneesDetectiveStatistique): TypeErreurStatistique {
  return e.type;
}

export function descriptionCorrecte(e: DonneesDetectiveStatistique): IdDescriptionStatistique {
  return e.type;
}

export function nombreLignes(e: DonneesDetectiveStatistique): number {
  return { moyenne: 5, position: 6, dispersion: 6, cumules: 5, groupes: 4 }[e.variante];
}

// ---------------------------------------------------------------------------------------------
// Calculs par variante, avec ou sans l'erreur
// ---------------------------------------------------------------------------------------------

export interface CalculMoyenne {
  n: number;
  moyenne: number;
  cumules: number[];
  /** Indice de la dernière valeur < x̄ (celle dont on retire le cumulé). */
  iAvant: number;
  /** Indice dont la copie retire le cumulé (iAvant, ou iAvant + 1 avec l'erreur de cumul). */
  iRetire: number;
  effectif: number;
  pourcentage: number;
}

export function calculMoyenne(e: ExerciceMoyenne, err: boolean): CalculMoyenne {
  const T = e.tableau;
  const n = effectifTotal(T);
  const moyenne = err && e.type === "moyenneNonPonderee" ? moyenneValeurs(T) : moyennePonderee(T);
  const C = cumules(T);
  let iAvant = -1;
  T.valeurs.forEach((x, i) => {
    if (x < moyenne) iAvant = i;
  });
  const iRetire = err && e.type === "cumulMalLu" ? iAvant + 1 : iAvant;
  const effectif = n - (C[iRetire] ?? 0);
  return { n, moyenne, cumules: C, iAvant, iRetire, effectif, pourcentage: (effectif / n) * 100 };
}

export interface CalculPosition {
  n: number;
  /** Série telle que la copie la « range » (non rangée avec l'erreur de tri). */
  rangee: number[];
  mediane: number;
  q1: number;
  q3: number;
  /** Rang (1 = première valeur) retenu pour Q1. */
  rangQ1: number;
  ecart: number;
}

export function calculPosition(e: ExercicePosition, err: boolean): CalculPosition {
  const n = e.serie.length;
  const rangee = err && e.type === "medianeNonTriee" ? [...e.serie] : trier(e.serie);
  const rangQ1 = err && e.type === "q1MalPlace" ? n / 4 : n / 4 + 1;
  const mediane = rangee[n / 2]!;
  const q1 = rangee[rangQ1 - 1]!;
  const q3 = rangee[(3 * n) / 4]!;
  return { n, rangee, mediane, q1, q3, rangQ1, ecart: q3 - q1 };
}

export interface CalculDispersion {
  n: number;
  moyenne: number;
  sommeCarres: number;
  variance: number;
  /** Variance arrondie à 2 décimales (convention de la plateforme). */
  varianceArrondie: number;
  ecartType: number;
}

export function calculDispersion(e: ExerciceDispersion, err: boolean): CalculDispersion {
  const T = e.tableau;
  const n = effectifTotal(T);
  const moyenne = err && e.type === "moyenneNonPonderee" ? moyenneValeurs(T) : moyennePonderee(T);
  const sommeCarres = T.valeurs.reduce((a, x, i) => a + (x - moyenne) ** 2 * T.effectifs[i]!, 0);
  const variance = err && e.type === "varianceSansN" ? sommeCarres : sommeCarres / n;
  const varianceArrondie = arrondi(variance, 2);
  const ecartType = err && e.type === "sansRacine" ? varianceArrondie : arrondi(Math.sqrt(varianceArrondie), 2);
  return { n, moyenne, sommeCarres, variance, varianceArrondie, ecartType };
}

export interface CalculCumules {
  n: number;
  cumules: number[];
  /** Indice de Q1 et de Q3 dans le tableau. */
  iQ1: number;
  iQ3: number;
  /** Indice dont la copie retire le cumulé (-1 : rien). */
  iRetire: number;
  effectif: number;
  pourcentage: number;
}

export function calculCumules(e: ExerciceCumules, err: boolean): CalculCumules {
  const T = e.tableau;
  const n = effectifTotal(T);
  const C = cumules(T);
  const seuil1 = n / 4;
  const seuil3 = (3 * n) / 4;
  const iQ1 = err && e.type === "q1MalPlace" ? C.findIndex((c) => c >= seuil1) : C.findIndex((c) => c > seuil1);
  const iQ3 = C.findIndex((c) => c > seuil3);
  const iRetire = err && e.type === "cumulMalLu" ? iQ1 : iQ1 - 1;
  const effectif = C[iQ3]! - (C[iRetire] ?? 0);
  return { n, cumules: C, iQ1, iQ3, iRetire, effectif, pourcentage: (effectif / n) * 100 };
}

export interface CalculGroupes {
  nA: number;
  moyenneA: number;
  moyenne: number;
}

export function calculGroupes(e: ExerciceGroupes, err: boolean): CalculGroupes {
  const T = e.tableau;
  const nA = effectifTotal(T);
  const moyenneA = err && e.type === "moyenneNonPonderee" ? moyenneValeurs(T) : moyennePonderee(T);
  const moyenne = err && e.type === "moyenneDesMoyennes" ? (moyenneA + e.moyenneB) / 2 : (nA * moyenneA + e.nB * e.moyenneB) / (nA + e.nB);
  return { nA, moyenneA, moyenne };
}

/** Résultat final de la copie (`err`) ou de la résolution correcte. */
export function resultat(e: DonneesDetectiveStatistique, err: boolean): number {
  switch (e.variante) {
    case "moyenne":
      return calculMoyenne(e, err).pourcentage;
    case "position":
      return calculPosition(e, err).ecart;
    case "dispersion":
      return calculDispersion(e, err).ecartType;
    case "cumules":
      return calculCumules(e, err).pourcentage;
    case "groupes":
      return calculGroupes(e, err).moyenne;
  }
}

export function reponseAttendue(e: DonneesDetectiveStatistique): ReponseDetectiveStatistique {
  return { valeur: resultat(e, false), tolerance: e.variante === "dispersion" ? 0.01 + 1e-9 : 1e-9 };
}

// ---------------------------------------------------------------------------------------------
// Les lignes de la copie (err = true) ou de la résolution correcte (err = false)
// ---------------------------------------------------------------------------------------------

function sommeLatex(nombres: number[]): string {
  return nombres.map((x) => nombreLatex(x)).join(" + ");
}

function produitsLatex(T: TableauStat): string {
  return T.valeurs.map((x, i) => `${nombreLatex(x)} \\times ${T.effectifs[i]}`).join(" + ");
}

/** « x̄ = (Σ…)/n = S/n = 6,5 » ou, avec l'erreur, « x̄ = (2 + 6 + 9 + 12)/4 = 29/4 = 7,25 ». */
function moyenneLatex(T: TableauStat, nonPonderee: boolean, nom = "\\bar{x}"): string {
  if (nonPonderee) {
    const s = sommeValeurs(T);
    const k = T.valeurs.length;
    return `${nom} = \\dfrac{${sommeLatex(T.valeurs)}}{${k}} = \\dfrac{${nombreLatex(s)}}{${k}} ${egalOuEnviron(s / k)} ${nombreLatex(s / k)}`;
  }
  const n = effectifTotal(T);
  const s = sommeProduits(T);
  return `${nom} = \\dfrac{${produitsLatex(T)}}{${n}} = \\dfrac{${nombreLatex(s)}}{${n}} ${egalOuEnviron(s / n)} ${nombreLatex(s / n)}`;
}

function effectifTotalLatex(T: TableauStat, nom = "n"): string {
  return `${nom} = ${T.effectifs.join(" + ")} = ${effectifTotal(T)}`;
}

function pourcentageLatex(effectif: number, n: number): string {
  const p = (effectif / n) * 100;
  return `\\dfrac{${effectif}}{${n}} \\times 100 ${egalOuEnviron(p)} ${nombreLatex(p)}\\,\\%`;
}

function lignesMoyenne(e: ExerciceMoyenne, err: boolean): FragmentConsigne[][] {
  const c = contexteDe(e);
  const T = e.tableau;
  const k = calculMoyenne(e, err);
  const au = T.valeurs.filter((x) => x > k.moyenne).map((x) => nombreTexte(x));
  return [
    [t("Effectif total : "), l(effectifTotalLatex(T)), t(".")],
    [t("Moyenne : "), l(moyenneLatex(T, err && e.type === "moyenneNonPonderee")), t(".")],
    [t(`Effectifs cumulés : ${k.cumules.join(" ; ")}.`)],
    [
      t(`Plus de ${quantite(c, k.moyenne)} : ${au.length > 1 ? "les valeurs" : "la valeur"} ${listeEt(au)}, soit `),
      l(`${k.n} - ${k.cumules[k.iRetire]} = ${k.effectif}`),
      t(` ${c.individus}.`),
    ],
    [t("Pourcentage : "), l(pourcentageLatex(k.effectif, k.n)), t(".")],
  ];
}

function lignesPosition(e: ExercicePosition, err: boolean): FragmentConsigne[][] {
  const c = contexteDe(e);
  const k = calculPosition(e, err);
  const n = k.n;
  const strict = !(err && e.type === "q1MalPlace");
  return [
    [t("Série rangée ("), l(`n = ${n}`), t(`) : ${k.rangee.map((x) => nombreTexte(x)).join(" ; ")}.`)],
    [t("Seuils : "), l(`\\dfrac{n}{2} = ${n / 2}`), t(" ; "), l(`\\dfrac{n}{4} = ${n / 4}`), t(" ; "), l(`\\dfrac{3n}{4} = ${(3 * n) / 4}`), t(".")],
    [t("Médiane : la première valeur de rang "), l(`> ${n / 2}`), t(` est la ${rangOrdinal(n / 2 + 1)}, donc la médiane vaut ${nombreTexte(k.mediane)}.`)],
    [
      l("Q_1"),
      t(" : la première valeur de rang "),
      l(`${strict ? ">" : "\\geq"} ${n / 4}`),
      t(` est la ${rangOrdinal(k.rangQ1)}, donc `),
      l(`Q_1 = ${nombreLatex(k.q1)}`),
      t("."),
    ],
    [l("Q_3"), t(" : la première valeur de rang "), l(`> ${(3 * n) / 4}`), t(` est la ${rangOrdinal((3 * n) / 4 + 1)}, donc `), l(`Q_3 = ${nombreLatex(k.q3)}`), t(".")],
    [t("Écart interquartile : "), l(`Q_3 - Q_1 = ${nombreLatex(k.q3)} - ${nombreLatex(k.q1)} = ${nombreLatex(k.ecart)}`), t(` ${uniteAccordee(c, k.ecart)}.`)],
  ];
}

function lignesDispersion(e: ExerciceDispersion, err: boolean): FragmentConsigne[][] {
  const c = contexteDe(e);
  const T = e.tableau;
  const k = calculDispersion(e, err);
  const m = nombreLatex(k.moyenne);
  const termes = T.valeurs.map((x, i) => `(${nombreLatex(x)} - ${m})^2 \\times ${T.effectifs[i]}`).join(" + ");
  const S = nombreLatex(k.sommeCarres, 4);
  const Vr = nombreLatex(k.varianceArrondie);
  const sansN = err && e.type === "varianceSansN";
  const sansRacine = err && e.type === "sansRacine";
  const racineExacte = auPlusDecimales(Math.sqrt(k.varianceArrondie), 2);
  return [
    [t("Effectif total : "), l(effectifTotalLatex(T)), t(".")],
    [t("Moyenne : "), l(moyenneLatex(T, err && e.type === "moyenneNonPonderee")), t(".")],
    [t("Somme des carrés des écarts : "), l(`\\Sigma (x_i - \\bar{x})^2 \\, n_i = ${termes} = ${S}`), t(".")],
    [t("Variance : "), l(sansN ? `V = ${S}` : `V = \\dfrac{${S}}{${k.n}} ${egalOuEnviron(k.variance)} ${Vr}`), t(".")],
    [t("Écart-type : "), l(sansRacine ? `\\sigma = V = ${Vr}` : `\\sigma = \\sqrt{${Vr}} ${racineExacte ? "=" : "\\approx"} ${nombreLatex(k.ecartType)}`), t(".")],
    [t(`Conclusion : l'écart-type vaut ${sansRacine || racineExacte ? "" : "environ "}${quantite(c, k.ecartType)}.`)],
  ];
}

function lignesCumules(e: ExerciceCumules, err: boolean): FragmentConsigne[][] {
  const c = contexteDe(e);
  const T = e.tableau;
  const k = calculCumules(e, err);
  const s1 = k.n / 4;
  const s3 = (3 * k.n) / 4;
  const strict = !(err && e.type === "q1MalPlace");
  const q1 = T.valeurs[k.iQ1]!;
  const q3 = T.valeurs[k.iQ3]!;
  return [
    [t(`Effectifs cumulés : ${k.cumules.join(" ; ")}.`)],
    [
      l("Q_1"),
      t(" : seuil "),
      l(`\\dfrac{n}{4} = ${s1}`),
      t(" ; le premier effectif cumulé "),
      l(`${strict ? ">" : "\\geq"} ${s1}`),
      t(` est ${k.cumules[k.iQ1]}, donc `),
      l(`Q_1 = ${nombreLatex(q1)}`),
      t("."),
    ],
    [l("Q_3"), t(" : seuil "), l(`\\dfrac{3n}{4} = ${s3}`), t(" ; le premier effectif cumulé "), l(`> ${s3}`), t(` est ${k.cumules[k.iQ3]}, donc `), l(`Q_3 = ${nombreLatex(q3)}`), t(".")],
    [t("Effectif de "), l(`Q_1 = ${nombreLatex(q1)}`), t(" à "), l(`Q_3 = ${nombreLatex(q3)}`), t(" (bornes comprises) : "), l(`${k.cumules[k.iQ3]} - ${k.cumules[k.iRetire] ?? 0} = ${k.effectif}`), t(` ${c.individus}.`)],
    [t("Pourcentage : "), l(pourcentageLatex(k.effectif, k.n)), t(".")],
  ];
}

function lignesGroupes(e: ExerciceGroupes, err: boolean): FragmentConsigne[][] {
  const c = contexteDe(e);
  const T = e.tableau;
  const k = calculGroupes(e, err);
  const N = k.nA + e.nB;
  const xA = nombreLatex(k.moyenneA);
  const xB = nombreLatex(e.moyenneB);
  let reunie: string;
  if (err && e.type === "moyenneDesMoyennes") {
    reunie = `\\bar{x} = \\dfrac{${xA} + ${xB}}{2} ${egalOuEnviron(k.moyenne)} ${nombreLatex(k.moyenne)}`;
  } else {
    const num = k.nA * k.moyenneA + e.nB * e.moyenneB;
    reunie = `\\bar{x} = \\dfrac{${k.nA} \\times ${xA} + ${e.nB} \\times ${xB}}{${k.nA} + ${e.nB}} = \\dfrac{${nombreLatex(num, 4)}}{${N}} ${egalOuEnviron(k.moyenne)} ${nombreLatex(k.moyenne)}`;
  }
  const exacte = auPlusDecimales(k.moyenne, 2);
  return [
    [t("Effectif du groupe A : "), l(effectifTotalLatex(T, "n_A")), t(".")],
    [t("Moyenne du groupe A : "), l(moyenneLatex(T, err && e.type === "moyenneNonPonderee", "\\bar{x}_A")), t(".")],
    [t("Moyenne des deux groupes réunis : "), l(reunie), t(".")],
    [t(`Conclusion : les ${N} ${c.individus} des deux groupes ont une moyenne ${exacte ? "de" : "d'environ"} ${quantite(c, k.moyenne)}.`)],
  ];
}

export function lignes(e: DonneesDetectiveStatistique, err: boolean): FragmentConsigne[][] {
  switch (e.variante) {
    case "moyenne":
      return lignesMoyenne(e, err);
    case "position":
      return lignesPosition(e, err);
    case "dispersion":
      return lignesDispersion(e, err);
    case "cumules":
      return lignesCumules(e, err);
    case "groupes":
      return lignesGroupes(e, err);
  }
}

export function copieEleve(e: DonneesDetectiveStatistique): FragmentConsigne[][] {
  return lignes(e, true);
}

export function resolutionCorrecte(e: DonneesDetectiveStatistique): FragmentConsigne[][] {
  return lignes(e, false);
}

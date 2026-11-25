import type { LigneCalcul } from "../../export/genererFeuilleExercices";
import { latex, ligne, texte } from "../../export/corrigeTableau";
import type { ExerciceDetectiveCombi, VarianteDetectiveCombi } from "../core6e/detectiveCombinatoire";
import { MOTS } from "../core6e/detectiveCombinatoire";
import type { AideEcran, Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { Fr } from "../ui6e/nombresCombinatoireLotH2";
import { A, C, entL, fact, fr, frL, frMul, frPow } from "../ui6e/nombresCombinatoireLotH2";

/**
 * Modèle de `6gen109` « Détective d'erreurs : analyse combinatoire » : à partir des paramètres
 * entiers du scénario, la copie de l'élève fictif (cohérente avec SON erreur), la ligne fausse, la
 * bonne description, la valeur corrigée (écran 3) et le contenu du corrigé détaillé (la ligne refaite,
 * la règle illustrée sur un petit exemple, la résolution reprise et vérifiée). Une seule source pour
 * l'écran, le papier et le corrigé. Même contrat que 6gen163 (copie canonique + trois lignes justes
 * préliminaires ; `av` lignes justes avant la ligne fausse, les dernières gardées).
 */

type E = ExerciceDetectiveCombi;
const t = tx;
const l = lx;
const ft = texte;
const fl = latex;

export interface BlocCorrigeDC {
  utilise: Frag[];
  lignes: LigneCalcul[];
}

export interface CopieDetectiveCombi {
  enonce: Frag[];
  lignes: Frag[][];
  ligneFausse: number;
  regles: string[];
  regleCours: AideEcran;
  aideCorrection: AideEcran;
  /** Valeur juste (écran 3) et résultat (faux) de la copie. */
  valeur: Fr;
  valeurCopie: Fr;
  /** Nature de la réponse : un nombre (dénombrement) ou une probabilité. */
  probabilite: boolean;
  piege: Frag[];
  autres: { valeur: Fr; message: Frag[] }[];
  corrigeA: BlocCorrigeDC;
  corrigeB: BlocCorrigeDC;
  corrigeC: BlocCorrigeDC & { verification?: BlocCorrigeDC };
  preliminaires: { ligne: Frag[]; regle: string }[];
}

// ============================================================================
// Descriptions (écran 2).
// ============================================================================

export const LEURRES: Record<VarianteDetectiveCombi, string[]> = {
  ordre: ["orRepetition", "orTous", "orAddition"],
  collier: ["coRotation", "coTous", "coAddition"],
  denominateur: ["deOrdre", "deAddition", "deNumerateur"],
  exposants: ["exRepetition", "exOrdre", "exProduit"],
  moinsUn: ["muDiviser", "muOrdre", "muRepetition"],
  repetitions: ["reMoinsUn", "rePuissance", "reOrdre"],
};

const motDe = (e: E) => MOTS[e.d.mot ?? 0]!;
const longueur = (e: E) => motDe(e).mot.length;
const diviseurL = (e: E) => motDe(e).rep.map(([, k]) => `${k}!`).join("\\cdot ");
const diviseur = (e: E) => motDe(e).rep.reduce((p, [, k]) => p * fact(k), 1);
const multinomiale = (e: E) => fact(longueur(e)) / diviseur(e);
const NOMS_LETTRES = ["A", "B", "C", "D", "E", "F"];

export function descriptionFragments(id: string, e: E): Frag[] {
  const d = e.d;
  switch (id) {
    case "ordre":
      return d.ctx === 0
        ? [t("Une délégation n'a pas de rôles : l'ordre ne compte pas, il fallait "), l(`C_{${d.n}}^{${d.k}}=\\dfrac{A_{${d.n}}^{${d.k}}}{${d.k}!}`), t(".")]
        : [t("Les trois postes sont différents : l'ordre compte, il fallait "), l(`A_{${d.n}}^{3}=C_{${d.n}}^{3}\\cdot 3!`), t(".")];
    case "orRepetition":
      return [t("Une même personne peut être choisie plusieurs fois : il fallait "), l(d.ctx === 0 ? `${d.n}^{${d.k}}` : `${d.n}^{3}`), t(".")];
    case "orTous":
      return [t("Toutes les personnes sont placées : il fallait "), l(`${d.n}!`), t(".")];
    case "orAddition":
      return [t("Les choix successifs devaient être additionnés, pas multipliés.")];
    case "collier":
      return [t("Un collier se retourne : une disposition et son image dans un miroir donnent le même collier, il fallait encore diviser par "), l("2"), t(".")];
    case "coRotation":
      return [t("Deux dispositions qui se déduisent par rotation sont des colliers différents : il fallait "), l(`${d.n}!`), t(".")];
    case "coTous":
      return [t("Il fallait diviser "), l(`${d.n}!`), t(" par "), l(`${d.n}!`), t(" : il n'y a qu'un seul collier.")];
    case "coAddition":
      return [t("Il fallait additionner les choix des perles au lieu de les multiplier.")];
    case "denominateur":
      return [t("Les cas possibles sont tous les tirages de "), l(`${d.n}`), t(" boules parmi "), l(`${d.N}`), t(" : "), l(`C_{${d.N}}^{${d.n}}`), t(", pas "), l(`C_{${d.N}}^{${d.j}}`), t(".")];
    case "deOrdre":
      return [t("Le tirage est simultané : il fallait des arrangements au lieu des combinaisons.")];
    case "deAddition":
      return [t("Au numérateur, il fallait additionner les deux combinaisons au lieu de les multiplier.")];
    case "deNumerateur":
      return [t("Au numérateur, il fallait seulement "), l(`C_{${d.K}}^{${d.j}}`), t(" : les autres boules n'interviennent pas.")];
    case "exposants":
      return d.ctx === 0
        ? [t("Chacune des "), l(`${d.k}`), t(" positions a "), l(`${d.n}`), t(" choix : il fallait "), l(`${d.n}^{${d.k}}`), t(", pas "), l(`${d.k}^{${d.n}}`), t(".")]
        : [t("Les exposants sont inversés : la probabilité d'un succès "), l("\\dfrac{1}{6}"), t(" porte l'exposant "), l(`${d.j}`), t(" (le nombre de succès).")];
    case "exRepetition":
      return d.ctx === 0 ? [t("Une lettre ne peut pas se répéter : il fallait "), l(`A_{${d.n}}^{${d.k}}`), t(".")] : [t("Les lancers ne sont pas indépendants : la loi binomiale ne s'applique pas.")];
    case "exOrdre":
      return d.ctx === 0 ? [t("L'ordre des lettres ne compte pas : il fallait "), l(`C_{${d.n}}^{${d.k}}`), t(".")] : [t("Il ne fallait pas le coefficient "), l(`C_{${d.n}}^{${d.j}}`), t(" : un seul ordre des résultats convient.")];
    case "exProduit":
      return d.ctx === 0 ? [t("Il fallait multiplier : "), l(`${d.n}\\times ${d.k}`), t(".")] : [t("Il fallait additionner les probabilités des lancers au lieu de les multiplier.")];
    case "moinsUn":
      return d.ctx === 0 ? [t("Le mot lui-même n'est pas une « autre » anagramme : il fallait retirer "), l("1"), t(".")] : [t("La pizza sans aucune garniture est comptée dans les "), l(`2^{${d.n}}`), t(" choix : il fallait retirer "), l("1"), t(".")];
    case "muDiviser":
      return d.ctx === 0 ? [t("Il fallait encore diviser par "), l("2"), t(" (le mot lu à l'envers).")] : [t("Il fallait diviser par "), l("2"), t(" : chaque pizza est comptée deux fois.")];
    case "muOrdre":
      return d.ctx === 0 ? [t("L'ordre des lettres ne compte pas : il fallait une combinaison.")] : [t("L'ordre des garnitures compte : il fallait "), l(`${d.n}!`), t(".")];
    case "muRepetition":
      return d.ctx === 0 ? [t("Il ne fallait pas diviser par les factorielles des lettres répétées.")] : [t("Chaque garniture a "), l(`${d.n}`), t(" choix : il fallait "), l(`${d.n}^{2}`), t(".")];
    case "repetitions":
      return [t("Échanger deux lettres identiques ne change pas le mot : il fallait diviser "), l(`${longueur(e)}!`), t(" par "), l(diviseurL(e)), t(".")];
    case "reMoinsUn":
      return [t("Il fallait retirer "), l("1"), t(" : le mot lui-même n'est pas une anagramme.")];
    case "rePuissance":
      return [t("Chaque position a "), l(`${longueur(e)}`), t(" choix : il fallait "), l(`${longueur(e)}^{${longueur(e)}}`), t(".")];
    case "reOrdre":
      return [t("L'ordre des lettres ne compte pas : il fallait "), l("1"), t(" seule anagramme.")];
  }
  return [];
}

// ============================================================================
// Scénarios.
// ============================================================================

function ordre(e: E): CopieDetectiveCombi {
  const { ctx, n } = e.d;
  if (ctx === 0) {
    const k = e.d.k;
    const juste = C(n, k);
    const faux = A(n, k);
    const produit = Array.from({ length: k }, (_, i) => `${n - i}`).join("\\cdot ");
    return {
      enonce: [t("Une classe de "), l(`${n}`), t(" élèves désigne une délégation de "), l(`${k}`), t(" élèves pour le conseil d'école, sans rôles particuliers. Combien de délégations différentes peut-on former ?")],
      lignes: [[t("L'ordre de choix compte : c'est un arrangement "), l(`A_{${n}}^{${k}}`), t(".")], [l(`A_{${n}}^{${k}}=${produit}=${entL(faux)}`)], [t("Il y a "), l(entL(faux)), t(" délégations.")]],
      ligneFausse: 0,
      regles: ["l'ordre compte-t-il ?", "calcul de l'arrangement", "conclusion"],
      regleCours: { texte: [t("Combinaison ou arrangement (cours, § 1) : si l'ordre ne compte pas, on compte des combinaisons, "), l("C_n^k=\\dfrac{A_n^k}{k!}"), t(" ; chaque groupe y est compté une seule fois.")] },
      aideCorrection: { texte: [t("Compte les groupes de "), l(`${k}`), t(" élèves sans ordre : combinaisons de "), l(`${k}`), t(" parmi "), l(`${n}`), t(".")] },
      valeur: fr(juste),
      valeurCopie: fr(faux),
      probabilite: false,
      piege: [t("C'est le résultat de la copie : il compte chaque délégation "), l(`${k}!`), t(" fois, une par ordre de choix.")],
      autres: [{ valeur: fr(n ** k), message: [t("Une même personne ne peut pas être choisie deux fois.")] }],
      corrigeA: {
        utilise: [t("Une délégation sans rôles est un groupe : changer l'ordre des élèves choisis ne change pas la délégation (cours, § 1).")],
        lignes: [ligne(`C_{${n}}^{${k}}=\\dfrac{A_{${n}}^{${k}}}{${k}!}`, [ft("combinaison, et non "), fl(`A_{${n}}^{${k}}`), ft(" comme dans la copie")])],
      },
      corrigeB: {
        utilise: [t("Avec trois élèves "), l("a, b, c"), t(" et une délégation de deux : "), l("\\{a,b\\},\\{a,c\\},\\{b,c\\}"), t(".")],
        lignes: [ligne("C_3^2=3", "trois délégations"), ligne("A_3^2=6", "compte ab et ba comme différentes")],
      },
      corrigeC: {
        utilise: [t("On reprend avec la combinaison.")],
        lignes: [ligne(`C_{${n}}^{${k}}=\\dfrac{${produit}}{${k}!}`), ligne(`=${entL(juste)}`)],
        verification: { utilise: [t("Chaque délégation est comptée "), l(`${k}!`), t(" fois dans la copie :")], lignes: [ligne(`${entL(juste)}\\cdot ${k}!=${entL(faux)}`)] },
      },
      preliminaires: [
        { ligne: [t("On choisit "), l(`${k}`), t(" élèves parmi "), l(`${n}`), t(".")], regle: "données" },
        { ligne: [t("Un élève ne peut pas être choisi deux fois : pas de répétition.")], regle: "répétition ?" },
        { ligne: [t("On ne prend pas tous les élèves : ce n'est pas une permutation.")], regle: "tous utilisés ?" },
      ],
    };
  }
  const juste = A(n, 3);
  const faux = C(n, 3);
  return {
    enonce: [t("Un club de "), l(`${n}`), t(" membres élit son bureau : un président, un secrétaire et un trésorier, trois personnes différentes. Combien de bureaux différents sont possibles ?")],
    lignes: [[t("L'ordre ne compte pas : c'est une combinaison "), l(`C_{${n}}^{3}`), t(".")], [l(`C_{${n}}^{3}=\\dfrac{${n}\\cdot ${n - 1}\\cdot ${n - 2}}{3!}=${entL(faux)}`)], [t("Il y a "), l(entL(faux)), t(" bureaux.")]],
    ligneFausse: 0,
    regles: ["l'ordre compte-t-il ?", "calcul de la combinaison", "conclusion"],
    regleCours: { texte: [t("Combinaison ou arrangement (cours, § 1) : si les places sont différentes (rôles), l'ordre compte et on compte des arrangements, "), l("A_n^k=C_n^k\\cdot k!"), t(".")] },
    aideCorrection: { texte: [t("Président, puis secrétaire, puis trésorier : "), l(`${n}`), t(", puis "), l(`${n - 1}`), t(", puis "), l(`${n - 2}`), t(" choix.")] },
    valeur: fr(juste),
    valeurCopie: fr(faux),
    probabilite: false,
    piege: [t("C'est le résultat de la copie : il compte seulement les groupes de trois personnes, sans dire qui occupe quel poste.")],
    autres: [{ valeur: fr(n ** 3), message: [t("Une même personne ne peut pas occuper deux postes.")] }],
    corrigeA: {
      utilise: [t("Les trois postes sont différents : échanger le président et le trésorier donne un autre bureau, l'ordre compte (cours, § 1).")],
      lignes: [ligne(`A_{${n}}^{3}=C_{${n}}^{3}\\cdot 3!`, [ft("arrangement, et non "), fl(`C_{${n}}^{3}`), ft(" comme dans la copie")])],
    },
    corrigeB: {
      utilise: [t("Avec trois personnes "), l("a, b, c"), t(" pour un président et un secrétaire : "), l("(a,b),(b,a),(a,c),(c,a),(b,c),(c,b)"), t(".")],
      lignes: [ligne("A_3^2=6", "six bureaux"), ligne("C_3^2=3", "oublie qui est président")],
    },
    corrigeC: {
      utilise: [t("On reprend avec l'arrangement.")],
      lignes: [ligne(`A_{${n}}^{3}=${n}\\cdot ${n - 1}\\cdot ${n - 2}`), ligne(`=${entL(juste)}`)],
      verification: { utilise: [t("Chaque groupe de trois personnes donne "), l("3!=6"), t(" bureaux :")], lignes: [ligne(`${entL(faux)}\\cdot 6=${entL(juste)}`)] },
    },
    preliminaires: [
      { ligne: [t("On choisit "), l("3"), t(" personnes parmi "), l(`${n}`), t(".")], regle: "données" },
      { ligne: [t("Une personne ne peut pas occuper deux postes : pas de répétition.")], regle: "répétition ?" },
      { ligne: [t("On ne prend pas tous les membres : ce n'est pas une permutation.")], regle: "tous utilisés ?" },
    ],
  };
}

function collier(e: E): CopieDetectiveCombi {
  const n = e.d.n;
  const cercle = fact(n - 1);
  return {
    enonce: [t("Avec "), l(`${n}`), t(" perles toutes différentes, on enfile un collier fermé (on peut le retourner). Combien de colliers différents peut-on obtenir ?")],
    lignes: [[t("Nombre de colliers : "), l(`(${n}-1)!=${entL(cercle)}`), t(".")], [t("On peut obtenir "), l(entL(cercle)), t(" colliers.")]],
    ligneFausse: 0,
    regles: ["nombre de colliers", "conclusion"],
    regleCours: { texte: [t("Permutations circulaires (cours, § 1) : "), l("(n-1)!"), t(" dispositions autour d'une table ; un collier se retourne en plus, d'où "), l("\\dfrac{(n-1)!}{2}"), t(" (pour "), l("n\\ge 3"), t(").")] },
    aideCorrection: { texte: [t("Pars des "), l(`(${n}-1)!`), t(" dispositions en cercle, puis regroupe chaque disposition avec son image retournée.")] },
    valeur: fr(cercle / 2),
    valeurCopie: fr(cercle),
    probabilite: false,
    piege: [t("C'est le résultat de la copie : il compte deux fois chaque collier, une fois à l'endroit et une fois retourné.")],
    autres: [
      { valeur: fr(fact(n)), message: [t("Les rotations d'un même collier ne donnent pas un nouveau collier.")] },
      { valeur: fr(fact(n) / 2), message: [t("Il faut aussi identifier les rotations : on divise par "), l(`${n}`), t(".")] },
    ],
    corrigeA: {
      utilise: [t("Un collier se retourne : une disposition en cercle et son image retournée sont le même collier.")],
      lignes: [ligne(`\\dfrac{(${n}-1)!}{2}=\\dfrac{${entL(cercle)}}{2}`, [ft("et non "), fl(`(${n}-1)!`), ft(" comme dans la copie")])],
    },
    corrigeB: {
      utilise: [t("Avec trois perles "), l("a, b, c"), t(" : les cercles "), l("abc"), t(" et "), l("acb"), t(" sont deux dispositions, mais un seul collier (l'un est l'autre retourné).")],
      lignes: [ligne("(3-1)!=2", "dispositions autour d'une table"), ligne("\\dfrac{(3-1)!}{2}=1", "collier")],
    },
    corrigeC: {
      utilise: [t("On reprend en divisant par 2.")],
      lignes: [ligne(`N=\\dfrac{(${n}-1)!}{2}`), ligne(`=\\dfrac{${entL(cercle)}}{2}`), ligne(`=${entL(cercle / 2)}`)],
      verification: { utilise: [t("Chaque collier correspond à deux dispositions en cercle :")], lignes: [ligne(`${entL(cercle / 2)}\\cdot 2=${entL(cercle)}`)] },
    },
    preliminaires: [
      { ligne: [t("Les "), l(`${n}`), t(" perles sont toutes différentes.")], regle: "données" },
      { ligne: [t("Enfilées en ligne, elles donnent "), l(`${n}!=${entL(fact(n))}`), t(" rangements.")], regle: "permutations" },
      { ligne: [t("Les "), l(`${n}`), t(" rotations d'un même cercle donnent la même disposition : on divise par "), l(`${n}`), t(".")], regle: "rotations" },
    ],
  };
}

function denominateur(e: E): CopieDetectiveCombi {
  const { N, K, n, j } = e.d as { N: number; K: number; n: number; j: number };
  const fav = C(K, j) * C(N - K, n - j);
  const juste = fr(fav, C(N, n));
  const faux = fr(fav, C(N, j));
  return {
    enonce: [t("Une urne contient "), l(`${N}`), t(" boules : "), l(`${K}`), t(" rouges et "), l(`${N - K}`), t(" vertes. On tire simultanément "), l(`${n}`), t(" boules. Calcule la probabilité d'obtenir exactement "), l(`${j}`), t(j === 1 ? " boule rouge." : " boules rouges.")],
    lignes: [[l(`P=\\dfrac{C_{${K}}^{${j}}\\,C_{${N - K}}^{${n - j}}}{C_{${N}}^{${j}}}`), t(" (cas favorables sur cas possibles).")], [l(`P=\\dfrac{${entL(fav)}}{${entL(C(N, j))}}${faux.d !== C(N, j) ? `=${frL(faux)}` : ""}`)]],
    ligneFausse: 0,
    regles: ["formule : cas favorables sur cas possibles", "combinaisons calculées"],
    regleCours: { texte: [t("Loi hypergéométrique (cours, § 5) :")], latex: "P(X=k)=\\dfrac{C_K^k\\,C_{N-K}^{n-k}}{C_N^n}" },
    aideCorrection: { texte: [t("Les cas possibles sont tous les tirages de "), l(`${n}`), t(" boules parmi "), l(`${N}`), t(".")] },
    valeur: juste,
    valeurCopie: faux,
    probabilite: true,
    piege: [t("C'est le résultat de la copie : son dénominateur ne compte que des groupes de "), l(`${j}`), t(" boules, alors qu'on en tire "), l(`${n}`), t(".")],
    autres: [{ valeur: fr(C(K, j), C(N, n)), message: [t("Il faut aussi choisir les "), l(`${n - j}`), t(" boules vertes au numérateur.")] }],
    corrigeA: {
      utilise: [t("Un cas possible est un tirage de "), l(`${n}`), t(" boules parmi "), l(`${N}`), t(", sans ordre.")],
      lignes: [ligne(`C_{${N}}^{${n}}=${entL(C(N, n))}`, [ft("et non "), fl(`C_{${N}}^{${j}}`), ft(" comme dans la copie")])],
    },
    corrigeB: {
      utilise: [t("Urne de "), l("4"), t(" boules dont "), l("2"), t(" rouges, tirage simultané de "), l("2"), t(" boules : il y a "), l("C_4^2=6"), t(" tirages possibles, dont "), l("C_2^1\\,C_2^1=4"), t(" avec exactement une rouge.")],
      lignes: [ligne("P(X=1)=\\dfrac{C_2^1\\,C_2^1}{C_4^2}=\\dfrac{4}{6}", "dénominateur : tous les tirages de 2 boules"), ligne("\\dfrac{C_2^1\\,C_2^1}{C_4^1}=1", "avec l'erreur : l'événement serait certain, absurde")],
    },
    corrigeC: {
      utilise: [t("On reprend avec le bon dénominateur.")],
      lignes: [ligne(`P(X=${j})=\\dfrac{C_{${K}}^{${j}}\\,C_{${N - K}}^{${n - j}}}{C_{${N}}^{${n}}}`), ligne(`=\\dfrac{${entL(fav)}}{${entL(C(N, n))}}`), ligne(`=${frL(juste)}`)],
      verification: { utilise: [t("La probabilité est bien comprise entre 0 et 1 :")], lignes: [ligne(`0<${frL(juste)}<1`)] },
    },
    preliminaires: [
      { ligne: [t("Tirage simultané : on compte des combinaisons, toutes équiprobables.")], regle: "modèle" },
      { ligne: [t("Choix des rouges : "), l(`C_{${K}}^{${j}}=${entL(C(K, j))}`), t(" ; choix des vertes : "), l(`C_{${N - K}}^{${n - j}}=${entL(C(N - K, n - j))}`), t(".")], regle: "combinaisons" },
      { ligne: [t("Cas favorables : "), l(`${entL(C(K, j))}\\cdot ${entL(C(N - K, n - j))}=${entL(fav)}`), t(".")], regle: "cas favorables (produit)" },
    ],
  };
}

function exposants(e: E): CopieDetectiveCombi {
  const { ctx, n } = e.d as { ctx: number; n: number };
  if (ctx === 0) {
    const k = e.d.k;
    const lettres = NOMS_LETTRES.slice(0, n).join(", ");
    return {
      enonce: [t(`Combien de « mots » de `), l(`${k}`), t(` lettres (avec ou sans signification) peut-on écrire avec les ${n} lettres ${lettres}, une lettre pouvant se répéter ?`)],
      lignes: [[t("Nombre de mots : "), l(`${k}^{${n}}=${entL(k ** n)}`), t(".")], [t("On peut écrire "), l(entL(k ** n)), t(" mots.")]],
      ligneFausse: 0,
      regles: ["nombre de mots", "conclusion"],
      regleCours: { texte: [t("Arrangements avec répétition (cours, § 1) : "), l("k"), t(" positions ayant chacune "), l("n"), t(" choix donnent "), l("n^k"), t(" résultats.")] },
      aideCorrection: { texte: [t("Première lettre : "), l(`${n}`), t(" choix ; deuxième : "), l(`${n}`), t(" choix ; … pour les "), l(`${k}`), t(" positions.")] },
      valeur: fr(n ** k),
      valeurCopie: fr(k ** n),
      probabilite: false,
      piege: [t("C'est le résultat de la copie : base et exposant sont inversés.")],
      autres: [
        { valeur: fr(A(n, k)), message: [t("Les lettres peuvent se répéter : chaque position garde ses "), l(`${n}`), t(" choix.")] },
        { valeur: fr(n * k), message: [t("On multiplie les choix des positions entre eux : "), l(`${n}`), t(" multiplié par lui-même autant de fois qu'il y a de positions.")] },
      ],
      corrigeA: {
        utilise: [t("La base est le nombre de choix par position, l'exposant le nombre de positions.")],
        lignes: [ligne(`${n}^{${k}}=${entL(n ** k)}`, [ft("et non "), fl(`${k}^{${n}}`), ft(" comme dans la copie")])],
      },
      corrigeB: {
        utilise: [t("Mots de "), l("3"), t(" lettres écrits avec "), l("A"), t(" et "), l("B"), t(" : AAA, AAB, ABA, ABB, BAA, BAB, BBA, BBB.")],
        lignes: [ligne("2^3=8", "huit mots"), ligne("3^2=9", "base et exposant inversés : faux")],
      },
      corrigeC: {
        utilise: [t("Principe de multiplication : "), l(`${n}`), t(" choix pour chacune des "), l(`${k}`), t(" positions.")],
        lignes: [ligne(`N=${Array.from({ length: k }, () => `${n}`).join("\\cdot ")}`), ligne(`=${n}^{${k}}`), ligne(`=${entL(n ** k)}`)],
        verification: { utilise: [t("Sans répétition, il y aurait moins de mots :")], lignes: [ligne(`A_{${n}}^{${k}}=${entL(A(n, k))}\\le ${entL(n ** k)}`)] },
      },
      preliminaires: [
        { ligne: [t("Chaque mot a "), l(`${k}`), t(" positions.")], regle: "données" },
        { ligne: [t("Une lettre peut se répéter : chaque position a "), l(`${n}`), t(" choix.")], regle: "répétition" },
        { ligne: [t("L'ordre des lettres compte (AB et BA sont deux mots).")], regle: "ordre" },
      ],
    };
  }
  const j = e.d.j;
  const p = fr(1, 6);
  const q = fr(5, 6);
  const juste = frMul(fr(C(n, j)), frMul(frPow(p, j), frPow(q, n - j)));
  const faux = frMul(fr(C(n, j)), frMul(frPow(q, j), frPow(p, n - j)));
  return {
    enonce: [t("On lance "), l(`${n}`), t(" fois un dé équilibré. Calcule la probabilité d'obtenir exactement "), l(`${j}`), t(j === 1 ? " six." : " six.")],
    lignes: [[l(`P(X=${j})=C_{${n}}^{${j}}\\left(\\dfrac{5}{6}\\right)^{${j}}\\left(\\dfrac{1}{6}\\right)^{${n - j}}`)], [l(`P(X=${j})=${frL(faux)}`)]],
    ligneFausse: 0,
    regles: ["formule appliquée", "valeur"],
    regleCours: { texte: [t("Loi binomiale (cours, § 6) : "), l("p"), t(" (succès) porte l'exposant "), l("k"), t(", le nombre de succès :")], latex: "P(X=k)=C_n^k\\,p^k\\,(1-p)^{n-k}" },
    aideCorrection: { texte: [t("Succès : obtenir un six, "), l("p=\\dfrac{1}{6}"), t(" ; il faut "), l(`${j}`), t(" succès et "), l(`${n - j}`), t(" échecs.")] },
    valeur: juste,
    valeurCopie: faux,
    probabilite: true,
    piege: [t("C'est le résultat de la copie : les exposants de "), l("\\dfrac{1}{6}"), t(" et de "), l("\\dfrac{5}{6}"), t(" sont échangés.")],
    autres: [{ valeur: frMul(frPow(p, j), frPow(q, n - j)), message: [t("C'est la probabilité d'un seul ordre : multiplie par "), l(`C_{${n}}^{${j}}`), t(".")] }],
    corrigeA: {
      utilise: [t("Le succès est « obtenir un six », de probabilité "), l("\\dfrac{1}{6}"), t(" ; il y a "), l(`${j}`), t(" succès.")],
      lignes: [ligne(`P(X=${j})=C_{${n}}^{${j}}\\left(\\dfrac{1}{6}\\right)^{${j}}\\left(\\dfrac{5}{6}\\right)^{${n - j}}`, [ft("et non avec les exposants échangés comme dans la copie")])],
    },
    corrigeB: {
      utilise: [t("Deux lancers, exactement un six : (6 ; autre) ou (autre ; 6).")],
      lignes: [ligne("P=2\\cdot\\dfrac{1}{6}\\cdot\\dfrac{5}{6}=\\dfrac{10}{36}", "un succès, un échec"), ligne("C_2^1\\left(\\dfrac{1}{6}\\right)^{1}\\left(\\dfrac{5}{6}\\right)^{1}=\\dfrac{10}{36}", "même valeur par la formule")],
    },
    corrigeC: {
      utilise: [t("On reprend avec les bons exposants.")],
      lignes: [ligne(`P(X=${j})=${C(n, j)}\\cdot\\dfrac{1^{${j}}\\cdot 5^{${n - j}}}{6^{${n}}}`), ligne(`=\\dfrac{${entL(C(n, j) * 5 ** (n - j))}}{${entL(6 ** n)}}`), ligne(`=${frL(juste)}`)],
      verification: { utilise: [t("La probabilité est bien comprise entre 0 et 1 :")], lignes: [ligne(`0<${frL(juste)}<1`)] },
    },
    preliminaires: [
      { ligne: [l("X"), t(" : nombre de six obtenus ; les lancers sont indépendants et identiques.")], regle: "variable" },
      { ligne: [l("X"), t(" suit une loi binomiale de paramètres "), l(`n=${n}`), t(" et "), l("p=\\dfrac{1}{6}"), t(".")], regle: "modèle" },
      { ligne: [l("P(X=k)=C_n^k\\,p^k\\,(1-p)^{n-k}"), t(".")], regle: "formule du cours" },
    ],
  };
}

function moinsUn(e: E): CopieDetectiveCombi {
  const { ctx } = e.d;
  if (ctx === 0) {
    const m = motDe(e);
    const L = longueur(e);
    const M = multinomiale(e);
    const reps = m.rep.map(([c, k]) => `${c} (${k} fois)`).join(", ");
    return {
      enonce: [t(`Combien d'anagrammes du mot ${m.mot}, autres que le mot ${m.mot} lui-même, peut-on écrire (mots avec ou sans signification) ?`)],
      lignes: [[t(`Anagrammes autres que ${m.mot} : `), l(entL(M)), t(".")], [t("Il y a "), l(entL(M)), t(" autres anagrammes.")]],
      ligneFausse: 0,
      regles: ["anagrammes autres que le mot", "conclusion"],
      regleCours: { texte: [t("Anagrammes (cours, § 2) : permutations avec répétition, "), l("\\dfrac{n!}{a!\\,b!\\cdots}"), t(" ; ce nombre compte aussi le mot de départ.")] },
      aideCorrection: { texte: [t("Parmi les "), l(entL(M)), t(" anagrammes, l'une est le mot lui-même.")] },
      valeur: fr(M - 1),
      valeurCopie: fr(M),
      probabilite: false,
      piege: [t("C'est le résultat de la copie : il compte aussi le mot de départ.")],
      autres: [{ valeur: fr(fact(L) - 1), message: [t("Échanger deux lettres identiques ne crée pas une nouvelle anagramme : divise par "), l(diviseurL(e)), t(".")] }],
      corrigeA: {
        utilise: [t("Le nombre d'anagrammes compte toutes les écritures, le mot de départ compris.")],
        lignes: [ligne(`${entL(M)}-1=${entL(M - 1)}`, [ft("et non "), fl(entL(M)), ft(" comme dans la copie")])],
      },
      corrigeB: {
        utilise: [t("Mot AB : ses anagrammes sont AB et BA, dont une seule autre que AB.")],
        lignes: [ligne("2!=2", "anagrammes"), ligne("2!-1=1", "autres que le mot")],
      },
      corrigeC: {
        utilise: [t("On reprend en retirant le mot lui-même.")],
        lignes: [ligne(`N=\\dfrac{${L}!}{${diviseurL(e)}}-1`), ligne(`=${entL(M)}-1`), ligne(`=${entL(M - 1)}`)],
        verification: { utilise: [t("Avec le mot lui-même, on retrouve toutes les anagrammes :")], lignes: [ligne(`${entL(M - 1)}+1=${entL(M)}`)] },
      },
      preliminaires: [
        { ligne: [t(`Le mot ${m.mot} a `), l(`${L}`), t(` lettres ; se répètent : ${reps}.`)], regle: "données" },
        { ligne: [t("Une anagramme est une permutation de ces lettres, avec répétition.")], regle: "modèle" },
        { ligne: [t("Nombre d'anagrammes : "), l(`\\dfrac{${L}!}{${diviseurL(e)}}=${entL(M)}`), t(".")], regle: "permutations avec répétition" },
      ],
    };
  }
  const n = e.d.n;
  const P = 2 ** n;
  return {
    enonce: [t("Une pizzeria propose "), l(`${n}`), t(" garnitures différentes. Une pizza contient au moins une garniture, chacune au plus une fois, et l'ordre ne compte pas. Combien de pizzas différentes peut-on composer ?")],
    lignes: [[t("Nombre de pizzas : "), l(`2^{${n}}=${entL(P)}`), t(".")], [t("On peut composer "), l(entL(P)), t(" pizzas.")]],
    ligneFausse: 0,
    regles: ["nombre de pizzas", "conclusion"],
    regleCours: { texte: [t("Un ensemble à "), l("n"), t(" éléments a "), l("2^n"), t(" parties (cours, § 3), dont la partie vide ; « au moins un » l'exclut : "), l("2^n-1"), t(".")] },
    aideCorrection: { texte: [t("Parmi les "), l(`2^{${n}}`), t(" choix « présente / absente », l'un ne contient aucune garniture.")] },
    valeur: fr(P - 1),
    valeurCopie: fr(P),
    probabilite: false,
    piege: [t("C'est le résultat de la copie : il compte aussi la pizza sans aucune garniture.")],
    autres: [{ valeur: fr(fact(n)), message: [t("L'ordre des garnitures ne compte pas : chaque garniture est présente ou absente.")] }],
    corrigeA: {
      utilise: [t("Les "), l(`2^{${n}}`), t(" choix comprennent celui où toutes les garnitures sont absentes, interdit ici.")],
      lignes: [ligne(`2^{${n}}-1=${entL(P - 1)}`, [ft("et non "), fl(`2^{${n}}`), ft(" comme dans la copie")])],
    },
    corrigeB: {
      utilise: [t("Avec deux garnitures (jambon, olives) : jambon, olives, jambon et olives — et la pizza nue, exclue.")],
      lignes: [ligne("2^2=4", "parties, la vide comprise"), ligne("2^2-1=3", "au moins une garniture")],
    },
    corrigeC: {
      utilise: [t("On reprend en retirant la pizza sans garniture.")],
      lignes: [ligne(`N=2^{${n}}-1`), ligne(`=${entL(P)}-1`), ligne(`=${entL(P - 1)}`)],
      verification: { utilise: [t("Par la somme des combinaisons (une garniture, deux, …, toutes) :")], lignes: [ligne(`${Array.from({ length: n }, (_, i) => `C_{${n}}^{${i + 1}}`).join("+")}=${entL(P - 1)}`)] },
    },
    preliminaires: [
      { ligne: [t("Il y a "), l(`${n}`), t(" garnitures différentes.")], regle: "données" },
      { ligne: [t("Pour chaque garniture, deux choix : présente ou absente.")], regle: "choix par garniture" },
      { ligne: [t("Principe de multiplication : "), l(`2\\cdot 2\\cdots 2=2^{${n}}`), t(" choix en tout.")], regle: "principe de multiplication" },
    ],
  };
}

function repetitions(e: E): CopieDetectiveCombi {
  const m = motDe(e);
  const L = longueur(e);
  const M = multinomiale(e);
  const reps = m.rep.map(([c, k]) => `${c} (${k} fois)`).join(", ");
  return {
    enonce: [t(`Combien d'anagrammes du mot ${m.mot} peut-on écrire (mots avec ou sans signification) ?`)],
    lignes: [[t("Nombre d'anagrammes : "), l(`${L}!=${entL(fact(L))}`), t(".")], [t("Il y a "), l(entL(fact(L))), t(" anagrammes.")]],
    ligneFausse: 0,
    regles: ["nombre d'anagrammes", "conclusion"],
    regleCours: { texte: [t("Permutations avec répétition (cours, § 2) : avec des lettres répétées "), l("a"), t(", "), l("b"), t("… fois, il y a "), l("\\dfrac{n!}{a!\\,b!\\cdots}"), t(" anagrammes.")] },
    aideCorrection: { texte: [t("Divise "), l(`${L}!`), t(" par la factorielle du nombre de répétitions de chaque lettre répétée.")] },
    valeur: fr(M),
    valeurCopie: fr(fact(L)),
    probabilite: false,
    piege: [t("C'est le résultat de la copie : il compte comme différents des mots obtenus en échangeant deux lettres identiques.")],
    autres: [{ valeur: fr(M - 1), message: [t("La question demande toutes les anagrammes, le mot lui-même compris.")] }],
    corrigeA: {
      utilise: [t("Échanger deux lettres identiques donne le même mot : on divise par les factorielles des répétitions.")],
      lignes: [ligne(`\\dfrac{${L}!}{${diviseurL(e)}}`, [ft("et non "), fl(`${L}!`), ft(" comme dans la copie")])],
    },
    corrigeB: {
      utilise: [t("Mot AAB : ses anagrammes sont AAB, ABA, BAA.")],
      lignes: [ligne("\\dfrac{3!}{2!}=3", "trois anagrammes"), ligne("3!=6", "compte deux fois chaque mot")],
    },
    corrigeC: {
      utilise: [t("On reprend avec la formule des permutations avec répétition.")],
      lignes: [ligne(`N=\\dfrac{${L}!}{${diviseurL(e)}}`), ligne(`=\\dfrac{${entL(fact(L))}}{${diviseur(e)}}`), ligne(`=${entL(M)}`)],
      verification: { utilise: [t("Chaque anagramme correspond à "), l(`${diviseur(e)}`), t(" rangements des lettres numérotées :")], lignes: [ligne(`${entL(M)}\\cdot ${diviseur(e)}=${entL(fact(L))}`)] },
    },
    preliminaires: [
      { ligne: [t(`Le mot ${m.mot} a `), l(`${L}`), t(" lettres.")], regle: "données" },
      { ligne: [t(`Lettres répétées : ${reps}.`)], regle: "répétitions" },
      { ligne: [t("Une anagramme utilise toutes les lettres, une fois chacune.")], regle: "modèle" },
    ],
  };
}

function copieCanonique(e: E): CopieDetectiveCombi {
  switch (e.variante) {
    case "ordre":
      return ordre(e);
    case "collier":
      return collier(e);
    case "denominateur":
      return denominateur(e);
    case "exposants":
      return exposants(e);
    case "moinsUn":
      return moinsUn(e);
    case "repetitions":
      return repetitions(e);
  }
}

/** Copie finale : `av` lignes justes (préliminaires, les dernières gardées) avant la ligne fausse. */
function assembler(c: CopieDetectiveCombi, av: number): CopieDetectiveCombi {
  const pool = [...c.preliminaires.map((x) => x.ligne), ...c.lignes.slice(0, c.ligneFausse)];
  const poolR = [...c.preliminaires.map((x) => x.regle), ...c.regles.slice(0, c.ligneFausse)];
  const k = Math.min(av, pool.length);
  return {
    ...c,
    lignes: [...pool.slice(pool.length - k), ...c.lignes.slice(c.ligneFausse)],
    regles: [...poolR.slice(poolR.length - k), ...c.regles.slice(c.ligneFausse)],
    ligneFausse: k,
  };
}

const CACHE = new WeakMap<E, CopieDetectiveCombi>();
export function copie(e: E): CopieDetectiveCombi {
  const enCache = CACHE.get(e);
  if (enCache) return enCache;
  const c = assembler(copieCanonique(e), e.d.av ?? 0);
  CACHE.set(e, c);
  return c;
}

export const nombreLignes = (e: E): number => copie(e).lignes.length;
export const valeurL = (x: Fr): string => frL(x);

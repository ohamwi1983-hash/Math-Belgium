import type { LigneCalcul } from "../../export/genererFeuilleExercices";
import { latex, ligne, texte } from "../../export/corrigeTableau";
import type { ExerciceDetectiveProba, VarianteDetectiveProba } from "../core6e/detectiveProbabilites";
import type { AideEcran, Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { Q } from "../../5e-4h/ui5e/nombresTrigo";
import { nbL, q, qAdd, qL, qMul, qSub, qVal } from "../../5e-4h/ui5e/nombresTrigo";

/**
 * Modèle de `6gen163` « Détective d'erreurs : probabilités » : à partir des paramètres entiers du
 * scénario, la copie de l'élève fictif (cohérente avec SON erreur), la ligne fausse, la bonne
 * description, la probabilité corrigée (écran 3) et le contenu du corrigé détaillé (la ligne refaite,
 * la règle illustrée sur un exemple simple, la résolution reprise et vérifiée). Une seule source pour
 * l'écran, le papier et le corrigé. Même contrat que 5gen72 (copie canonique + lignes justes
 * préliminaires ; `av` lignes justes avant la ligne fausse, les dernières gardées).
 */

type E = ExerciceDetectiveProba;
const t = tx;
const l = lx;
const ft = texte;
const fl = latex;

export interface BlocCorrigeDP {
  utilise: Frag[];
  lignes: LigneCalcul[];
}

export interface CopieDetectiveProba {
  enonce: Frag[];
  lignes: Frag[][];
  ligneFausse: number;
  regles: string[];
  regleCours: AideEcran;
  aideCorrection: AideEcran;
  /** Probabilité juste (écran 3) et résultat (faux) de la copie. */
  valeur: Q;
  valeurCopie: Q;
  /** Écriture des nombres : décimale (données en dixièmes / centièmes) ou fractionnaire. */
  decimal: boolean;
  /** Message quand la saisie reprend le résultat de la copie. */
  piege: Frag[];
  /** Autres valeurs fausses typiques et leur message (jamais la réponse). */
  autres: { valeur: Q; message: Frag[] }[];
  corrigeA: BlocCorrigeDP;
  corrigeB: BlocCorrigeDP;
  corrigeC: BlocCorrigeDP & { verification?: BlocCorrigeDP };
  preliminaires: { ligne: Frag[]; regle: string }[];
}

// ============================================================================
// Écritures.
// ============================================================================

const fracB = (n: number, d: number) => `\\dfrac{${n}}{${d}}`;
const dec = (x: Q) => nbL(qVal(x), 4);
const puiss = (x: Q, n: number): Q => q(x.n ** n, x.d ** n);
/** x^n écrit : « 0{,}7^{3} » ou « \left(\dfrac{5}{6}\right)^{3} ». */
const puissL = (x: Q, n: number, decimal: boolean) => (decimal ? `${dec(x)}^{${n}}` : `\\left(${qL(x)}\\right)^{${n}}`);
/** « = forme réduite » si elle diffère de n/d. */
const reduite = (n: number, d: number): LigneCalcul[] => {
  const r = q(n, d);
  return r.n !== n || r.d !== d ? [ligne(`=${qL(r)}`, `on simplifie par ${n / r.n}`)] : [];
};

// ============================================================================
// Descriptions (écran 2).
// ============================================================================

export const LEURRES: Record<VarianteDetectiveProba, string[]> = {
  complementaire: ["cpIndependance", "cpSoustraction", "cpPuissance"],
  reunion: ["reIndependance", "reContraire", "reTotal"],
  conditionnelleInversee: ["ciProduit", "ciIndependance", "ciIntersection"],
  produitSansRemise: ["prR1", "prAddition", "prChemin"],
  arbreMalPondere: ["amContraire", "amSomme", "amPremier"],
  ordreOublie: ["ooEquiprobable", "ooAddition", "ooRemise"],
};

export function descriptionFragments(id: string, e: E): Frag[] {
  const d = e.d;
  const des = d.ctx === 1;
  switch (id) {
    case "complementaire":
      return [t("Le contraire de « au moins un succès » est « aucun succès », pas « que des succès ».")];
    case "cpIndependance":
      return [t("Les essais ne sont pas indépendants : on ne peut pas multiplier les probabilités.")];
    case "cpSoustraction":
      return [t("À la fin, il fallait calculer "), l("P(\\bar{A})-1"), t(" et non "), l("1-P(\\bar{A})"), t(".")];
    case "cpPuissance":
      return [t("Il fallait multiplier la probabilité par le nombre d'essais au lieu de l'élever à cette puissance.")];
    case "reunion":
      return [l("A"), t(" et "), l("V"), t(" ne sont pas incompatibles : il faut retirer "), l("P(A\\cap V)"), t(", comptée deux fois.")];
    case "reIndependance":
      return [t("Il fallait multiplier "), l("P(A)"), t(" par "), l("P(V)"), t(" au lieu de les additionner.")];
    case "reContraire":
      return [t("Le contraire de « aucun des deux sports » est « les deux sports à la fois ».")];
    case "reTotal":
      return [t("Les fractions devaient avoir "), l(`${d.a + d.b}`), t(" (le nombre de sportifs) au dénominateur, et non "), l(`${d.N}`), t(".")];
    case "conditionnelleInversee":
      return [t("On divise par la probabilité de l'événement connu : "), l("P(T|B)=\\dfrac{P(T\\cap B)}{P(B)}"), t(", pas par "), l("P(T)"), t(".")];
    case "ciProduit":
      return [t("Il fallait multiplier "), l("P(T\\cap B)"), t(" par "), l("P(T)"), t(" au lieu de diviser.")];
    case "ciIndependance":
      return [l("T"), t(" et "), l("B"), t(" sont indépendants : la réponse est simplement "), l("P(T)"), t(".")];
    case "ciIntersection":
      return [l("P(T\\cap B)"), t(" est faux : il vaut "), l("P(T)+P(B)"), t(".")];
    case "produitSansRemise": {
      const n = d.r + d.b;
      return [t("Sans remise, l'urne a changé : après une rouge, il reste "), l(`${n - 1}`), t(" boules dont "), l(`${d.r - 1}`), t(" rouges, donc "), l(`P(R_2|R_1)=${fracB(d.r - 1, n - 1)}`), t(".")];
    }
    case "prR1":
      return [l("P(R_1)"), t(" est faux : il fallait diviser par le nombre de boules bleues.")];
    case "prAddition":
      return [t("Les probabilités des deux tirages devaient être additionnées, pas multipliées.")];
    case "prChemin":
      return [t("Il manque le chemin « bleue puis rouge ».")];
    case "arbreMalPondere":
      return [t("Le chemin « B puis D » n'est pas multiplié par la branche "), l("P(B)"), t(" : "), l("P(B\\cap D)=P(B)\\times P(D|B)"), t(".")];
    case "amContraire":
      return [l("P(B)"), t(" est faux : il vaut "), l("P(A)"), t(".")];
    case "amSomme":
      return [t("Les probabilités des deux chemins devaient être multipliées, pas additionnées.")];
    case "amPremier":
      return [l("P(A\\cap D)"), t(" est faux : il fallait additionner "), l("P(A)"), t(" et "), l("P(D|A)"), t(".")];
    case "ordreOublie":
      return des
        ? [t("Un "), l(`${d.a}`), t(" et un "), l(`${d.b}`), t(" peuvent sortir dans deux ordres : "), l(`(${d.a}\\,;${d.b})`), t(" et "), l(`(${d.b}\\,;${d.a})`), t(" sont deux issues différentes.")]
        : [t("L'événement se réalise dans deux ordres : il manque le chemin « bleue puis rouge ».")];
    case "ooEquiprobable":
      return des ? [t("Les "), l("36"), t(" couples ne sont pas équiprobables : on ne peut pas compter les cas favorables.")] : [t("Les boules n'ont pas toutes la même chance d'être tirées : on ne peut pas utiliser l'arbre.")];
    case "ooAddition":
      return des ? [t("Il fallait additionner "), l("\\dfrac{1}{6}"), t(" et "), l("\\dfrac{1}{6}"), t(", une probabilité par dé.")] : [t("Le long d'un chemin, il fallait additionner les probabilités des branches.")];
    case "ooRemise":
      return des
        ? [t("Il fallait diviser par "), l("12"), t(", le nombre total de faces des deux dés.")]
        : [t("La seconde fraction est fausse : le tirage est avec remise, il fallait "), l(fracB(d.b, d.r + d.b)), t(".")];
  }
  return [];
}

// ============================================================================
// Scénarios.
// ============================================================================

function complementaire(e: E): CopieDetectiveProba {
  const { ctx, k, n } = e.d;
  const des = ctx === 1;
  const p = des ? q(1, 6) : q(k, 10);
  const qe = qSub(q(1), p);
  const decimal = !des;
  const nb = (x: Q) => (decimal ? dec(x) : qL(x));
  const pN = puiss(p, n);
  const qN = puiss(qe, n);
  const essais = des ? "lancers" : "tirs";
  const succes = des ? "obtenir un 6" : "réussir un tir";
  const tous = des ? `« les ${n} lancers donnent tous un 6 »` : `« les ${n} tirs sont tous réussis »`;
  const aucun = des ? `« aucun des ${n} lancers ne donne 6 »` : `« les ${n} tirs sont tous ratés »`;
  return {
    enonce: des
      ? [t("On lance "), l(`${n}`), t(" fois un dé équilibré. Calcule la probabilité d'obtenir au moins un 6.")]
      : [t("Un tireur atteint sa cible avec une probabilité de "), l(nb(p)), t(" à chaque tir, les tirs étant indépendants. Il tire "), l(`${n}`), t(" fois. Calcule la probabilité qu'il atteigne la cible au moins une fois.")],
    lignes: [[l("\\bar{A}"), t(` : ${tous}.`)], [l(`P(\\bar{A})=${puissL(p, n, decimal)}=${nb(pN)}`)], [l(`P(A)=1-${nb(pN)}=${nb(qSub(q(1), pN))}`)]],
    ligneFausse: 0,
    regles: ["événement contraire", `probabilité du contraire (${essais} indépendants : produit)`, "probabilité cherchée par le contraire"],
    regleCours: { texte: [t("Événement contraire (cours, § 1 et § 4) : le contraire de « au moins un succès » est « aucun succès » ; ensuite "), l("P(A)=1-P(\\bar{A})"), t(".")] },
    aideCorrection: { texte: [t("Écris le bon contraire, puis calcule "), l("P(\\bar{A})"), t(" : les "), l(`${n}`), t(` ${essais} sont des échecs, de probabilité `), l(nb(qe)), t(" chacun.")] },
    valeur: qSub(q(1), qN),
    valeurCopie: qSub(q(1), pN),
    decimal,
    piege: [t("C'est le résultat de la copie : il vient de « que des succès », qui n'est pas le contraire de « au moins un succès ».")],
    autres: [
      { valeur: qN, message: [t("C'est "), l("P(\\bar{A})"), t(", la probabilité de n'avoir aucun succès : il reste à calculer "), l("1-P(\\bar{A})"), t(".")] },
      { valeur: pN, message: [t("C'est la probabilité de n'avoir que des succès, pas celle d'en avoir au moins un.")] },
      { valeur: qMul(p, q(n)), message: [t("On n'additionne pas les probabilités des essais : passe par l'événement contraire.")] },
    ],
    corrigeA: {
      utilise: [t("Le contraire de « au moins un succès » est « aucun succès » (cours, § 4, « au moins un » par le complément) : "), l("\\bar{A}"), t(` : ${aucun}.`)],
      lignes: [ligne(`P(\\bar{A})=${puissL(qe, n, decimal)}`, [ft(`${n} échecs, ${essais} indépendants : on multiplie`)]), ligne(`=${nb(qN)}`, [ft("et non "), fl(nb(pN)), ft(" comme dans la copie")])],
    },
    corrigeB: {
      utilise: [t("Sur deux lancers d'un dé, « au moins un 6 » et « deux 6 » ne sont pas contraires : le résultat (6 ; 2) n'est dans aucun des deux.")],
      lignes: [ligne("1-\\left(\\dfrac{5}{6}\\right)^{2}=\\dfrac{11}{36}", "contraire juste : aucun 6"), ligne("1-\\left(\\dfrac{1}{6}\\right)^{2}=\\dfrac{35}{36}", "« deux 6 » comme contraire : résultat faux")],
    },
    corrigeC: {
      utilise: [t("On reprend à partir de la ligne fausse, avec le bon événement contraire.")],
      lignes: [ligne(`P(\\bar{A})=${puissL(qe, n, decimal)}=${nb(qN)}`), ligne(`P(A)=1-${nb(qN)}`, "probabilité du contraire"), ligne(`=${nb(qSub(q(1), qN))}`)],
      verification: { utilise: [l("A"), t(" et son contraire se partagent toutes les issues :")], lignes: [ligne(`${nb(qSub(q(1), qN))}+${nb(qN)}=1`)] },
    },
    preliminaires: [
      { ligne: [l("A"), t(` : « au moins un succès » (succès : ${succes}) ; on passe par l'événement contraire `), l("\\bar{A}"), t(".")], regle: "méthode « au moins un » : le contraire" },
      { ligne: des ? [l("P(\\text{obtenir un 6})=\\dfrac{1}{6}"), t(" à chaque lancer ; les lancers sont indépendants.")] : [l(`P(\\text{réussir un tir})=${nb(p)}`), t(" ; les tirs sont indépendants.")], regle: "données" },
      { ligne: [l(`P(\\text{${des ? "ne pas obtenir 6" : "rater un tir"}})=1-${nb(p)}=${nb(qe)}`)], regle: "probabilité du contraire pour un essai" },
    ],
  };
}

function reunion(e: E): CopieDetectiveProba {
  const { N, a, b, c } = e.d;
  const juste = q(N - a - b + c, N);
  return {
    enonce: [t("Dans un club de "), l(`${N}`), t(" membres, "), l(`${a}`), t(" pratiquent la natation, "), l(`${b}`), t(" le vélo et "), l(`${c}`), t(" pratiquent les deux. On choisit un membre au hasard ; on note "), l("A"), t(" « il pratique la natation » et "), l("V"), t(" « il pratique le vélo ». Calcule la probabilité qu'il ne pratique aucun des deux sports.")],
    lignes: [[l(`P(A\\cup V)=${fracB(a, N)}+${fracB(b, N)}=${fracB(a + b, N)}`)], [l(`P(\\overline{A\\cup V})=1-${fracB(a + b, N)}=${fracB(N - a - b, N)}`)]],
    ligneFausse: 0,
    regles: ["probabilité de la réunion", "probabilité du contraire"],
    regleCours: { texte: [t("Probabilité d'une réunion (cours, § 1) :")], latex: "P(A\\cup V)=P(A)+P(V)-P(A\\cap V)" },
    aideCorrection: { texte: [t("Recalcule "), l("P(A\\cup V)"), t(" en retirant "), l(`P(A\\cap V)=${fracB(c, N)}`), t(", puis passe au contraire.")] },
    valeur: juste,
    valeurCopie: q(N - a - b, N),
    decimal: false,
    piege: [t("C'est le résultat de la copie : les "), l(`${c}`), t(" membres qui pratiquent les deux sports y sont comptés deux fois.")],
    autres: [
      { valeur: q(a + b - c, N), message: [t("C'est "), l("P(A\\cup V)"), t(" : on demande la probabilité de ne pratiquer aucun des deux sports.")] },
      { valeur: q(c, N), message: [t("C'est "), l("P(A\\cap V)"), t(", la probabilité de pratiquer les deux.")] },
    ],
    corrigeA: {
      utilise: [t("Probabilité d'une réunion (cours, § 1) : "), l("P(A\\cup V)=P(A)+P(V)-P(A\\cap V)"), t(".")],
      lignes: [ligne(`P(A\\cup V)=${fracB(a, N)}+${fracB(b, N)}-${fracB(c, N)}`, "on retire l'intersection, comptée deux fois"), ligne(`=${fracB(a + b - c, N)}`, [ft("et non "), fl(fracB(a + b, N)), ft(" comme dans la copie")])],
    },
    corrigeB: {
      utilise: [t("Avec un dé : "), l("A=\\{2\\,;4\\,;6\\}"), t(" (pair) et "), l("B=\\{4\\,;5\\,;6\\}"), t(" (au moins 4) se chevauchent en "), l("\\{4\\,;6\\}"), t(", et "), l("A\\cup B=\\{2\\,;4\\,;5\\,;6\\}"), t(".")],
      lignes: [ligne("P(A\\cup B)=\\dfrac{3}{6}+\\dfrac{3}{6}-\\dfrac{2}{6}=\\dfrac{4}{6}", "on retire 4 et 6, comptés deux fois"), ligne("P(A)+P(B)=\\dfrac{6}{6}=1", [ft("faux : 1 et 3 ne sont pas dans "), fl("A\\cup B")])],
    },
    corrigeC: {
      utilise: [t("On reprend à partir de la ligne fausse : réunion corrigée, puis événement contraire.")],
      lignes: [ligne(`P(A\\cup V)=${fracB(a + b - c, N)}`), ligne(`P(\\overline{A\\cup V})=1-${fracB(a + b - c, N)}`, "« aucun des deux » : contraire de la réunion"), ligne(`=${fracB(N - a - b + c, N)}`), ...reduite(N - a - b + c, N)],
      verification: { utilise: [t("Les quatre groupes (natation seule, vélo seul, les deux, aucun) font bien le total des membres :")], lignes: [ligne(`${a - c}+${b - c}+${c}+${N - a - b + c}=${N}`)] },
    },
    preliminaires: [
      { ligne: [l(`P(A)=${fracB(a, N)}`), t(" ; "), l(`P(V)=${fracB(b, N)}`), t(" ; "), l(`P(A\\cap V)=${fracB(c, N)}`)], regle: "données" },
      { ligne: [t("« Aucun des deux » est le contraire de "), l("A\\cup V"), t(".")], regle: "événement contraire" },
      { ligne: [l("P(\\overline{A\\cup V})=1-P(A\\cup V)")], regle: "probabilité du contraire" },
    ],
  };
}

function conditionnelleInversee(e: E): CopieDetectiveProba {
  const { N, a, b, c } = e.d;
  return {
    enonce: [t("Dans un club de "), l(`${N}`), t(" membres, "), l(`${a}`), t(" jouent au tennis, "), l(`${b}`), t(" au badminton et "), l(`${c}`), t(" aux deux. On note "), l("T"), t(" « il joue au tennis » et "), l("B"), t(" « il joue au badminton ». On choisit au hasard un membre qui joue au badminton : calcule la probabilité qu'il joue aussi au tennis.")],
    lignes: [[l("P(T|B)=\\dfrac{P(T\\cap B)}{P(T)}")], [l(`P(T|B)=${fracB(c, N)}\\div${fracB(a, N)}=${fracB(c, a)}`)]],
    ligneFausse: 0,
    regles: ["définition de la probabilité conditionnelle", "calcul de la conditionnelle"],
    regleCours: { texte: [t("Probabilité conditionnelle (cours, § 1) — on divise par la probabilité de ce qu'on sait déjà :")], latex: "P(T|B)=\\dfrac{P(T\\cap B)}{P(B)}" },
    aideCorrection: { texte: [t("Recommence avec "), l(`P(B)=${fracB(b, N)}`), t(" au dénominateur.")] },
    valeur: q(c, b),
    valeurCopie: q(c, a),
    decimal: false,
    piege: [t("C'est le résultat de la copie : c'est "), l("P(B|T)"), t(", la probabilité de jouer au badminton sachant qu'on joue au tennis.")],
    autres: [
      { valeur: q(c, N), message: [t("C'est "), l("P(T\\cap B)"), t(" : on sait déjà que le membre joue au badminton, on divise donc par "), l("P(B)"), t(".")] },
      { valeur: q(a, N), message: [t("C'est "), l("P(T)"), t(" : savoir que le membre joue au badminton change la probabilité.")] },
    ],
    corrigeA: {
      utilise: [t("Probabilité conditionnelle (cours, § 1) : on divise par la probabilité de l'événement connu, ici "), l("B"), t(".")],
      lignes: [ligne("P(T|B)=\\dfrac{P(T\\cap B)}{P(B)}", [ft("et non "), fl("\\dfrac{P(T\\cap B)}{P(T)}"), ft(" comme dans la copie")])],
    },
    corrigeB: {
      utilise: [t("Dans un jeu de 52 cartes (4 rois, 12 figures), les deux sens de conditionnement ne donnent pas le même nombre :")],
      lignes: [ligne("P(\\text{roi}|\\text{figure})=\\dfrac{4}{12}=\\dfrac{1}{3}", "on divise par le nombre de figures"), ligne("P(\\text{figure}|\\text{roi})=\\dfrac{4}{4}=1", "on divise par le nombre de rois")],
    },
    corrigeC: {
      utilise: [t("On reprend à partir de la ligne fausse, avec "), l("P(B)"), t(" au dénominateur.")],
      lignes: [ligne(`P(T|B)=${fracB(c, N)}\\div${fracB(b, N)}`), ligne(`=${fracB(c, b)}`, [ft("les dénominateurs "), fl(`${N}`), ft(" se simplifient")]), ...reduite(c, b)],
      verification: { utilise: [t("Directement : parmi les "), l(`${b}`), t(" joueurs de badminton, "), l(`${c}`), t(" jouent au tennis.")], lignes: [] },
    },
    preliminaires: [
      { ligne: [t("On sait que le membre joue au badminton : on cherche "), l("P(T|B)"), t(".")], regle: "événement connu : B" },
      { ligne: [l(`P(T)=${fracB(a, N)}`), t(" ; "), l(`P(B)=${fracB(b, N)}`)], regle: "données" },
      { ligne: [l(`P(T\\cap B)=${fracB(c, N)}`)], regle: "données" },
    ],
  };
}

function produitSansRemise(e: E): CopieDetectiveProba {
  const { r, b } = e.d;
  const n = r + b;
  const D = n * (n - 1);
  return {
    enonce: [t("Une urne contient "), l(`${r}`), t(" boules rouges et "), l(`${b}`), t(" boules bleues. On tire successivement deux boules, sans remise. Calcule la probabilité d'obtenir deux boules rouges.")],
    lignes: [[l(`P(R_1)=${fracB(r, n)}`)], [l(`P(R_2|R_1)=${fracB(r, n)}`)], [l(`P(R_1\\cap R_2)=${fracB(r, n)}\\times${fracB(r, n)}=${fracB(r * r, n * n)}`)]],
    ligneFausse: 1,
    regles: ["proportion de boules rouges", "composition de l'urne au 2e tirage", "produit le long du chemin"],
    regleCours: { texte: [t("Tirage sans remise (cours, § 2) : au second tirage, l'urne a perdu une boule ; "), l("P(R_2|R_1)"), t(" se lit sur l'urne modifiée.")] },
    aideCorrection: { texte: [t("Après une boule rouge tirée, combien reste-t-il de boules, et combien de rouges ? Recalcule "), l("P(R_2|R_1)"), t(", puis le produit.")] },
    valeur: q(r * (r - 1), D),
    valeurCopie: q(r * r, n * n),
    decimal: false,
    piege: [t("C'est le résultat de la copie : il correspond à un tirage avec remise (urne inchangée).")],
    autres: [
      { valeur: q(r - 1, n - 1), message: [t("C'est "), l("P(R_2|R_1)"), t(" seulement : multiplie encore par "), l("P(R_1)"), t(".")] },
      { valeur: q(r * (r - 1), n * n), message: [t("Après le premier tirage, il ne reste que "), l(`${n - 1}`), t(" boules dans l'urne.")] },
    ],
    corrigeA: {
      utilise: [t("Tirage sans remise (cours, § 2) : après une rouge, il reste "), l(`${n - 1}`), t(" boules dont "), l(`${r - 1}`), t(" rouges.")],
      lignes: [ligne(`P(R_2|R_1)=${fracB(r - 1, n - 1)}`, [ft("et non "), fl(fracB(r, n)), ft(" comme dans la copie")])],
    },
    corrigeB: {
      utilise: [t("Urne de 2 rouges et 1 bleue, deux tirages : le résultat dépend de la remise.")],
      lignes: [ligne("\\dfrac{2}{3}\\times\\dfrac{1}{2}=\\dfrac{1}{3}", "sans remise : deux rouges"), ligne("\\dfrac{2}{3}\\times\\dfrac{2}{3}=\\dfrac{4}{9}", "avec remise : une autre expérience")],
    },
    corrigeC: {
      utilise: [t("On reprend à partir de la ligne fausse : produit le long du chemin "), l("R_1"), t(" puis "), l("R_2"), t(".")],
      lignes: [ligne(`P(R_1\\cap R_2)=${fracB(r, n)}\\times${fracB(r - 1, n - 1)}`), ligne(`=${fracB(r * (r - 1), D)}`), ...reduite(r * (r - 1), D)],
      verification: { utilise: [t("Les quatre chemins de l'arbre (RR, RB, BR, BB) totalisent 1 :")], lignes: [ligne(`${fracB(r * (r - 1), D)}+${fracB(r * b, D)}+${fracB(b * r, D)}+${fracB(b * (b - 1), D)}=1`)] },
    },
    preliminaires: [
      { ligne: [t("Il y a "), l(`${n}`), t(" boules, dont "), l(`${r}`), t(" rouges ; le tirage se fait sans remise.")], regle: "données" },
      { ligne: [l("R_1"), t(" : « la 1re boule est rouge » ; "), l("R_2"), t(" : « la 2e boule est rouge ».")], regle: "notations" },
      { ligne: [l("P(R_1\\cap R_2)=P(R_1)\\times P(R_2|R_1)")], regle: "probabilité d'un chemin" },
    ],
  };
}

function arbreMalPondere(e: E): CopieDetectiveProba {
  const { kA, dA, dB } = e.d;
  const pA = q(kA, 10);
  const pB = qSub(q(1), pA);
  const qA = q(dA, 100);
  const qB = q(dB, 100);
  const cA = qMul(pA, qA);
  const cB = qMul(pB, qB);
  const juste = qAdd(cA, cB);
  const copie = qAdd(cA, qB);
  const [mi, ma] = qVal(qA) < qVal(qB) ? [qA, qB] : [qB, qA];
  return {
    enonce: [
      t("Une usine a deux machines : la machine A fabrique "),
      l(`${kA * 10}\\,\\%`),
      t(" des pièces, la machine B le reste. "),
      l(`${dA}\\,\\%`),
      t(" des pièces de A et "),
      l(`${dB}\\,\\%`),
      t(" des pièces de B sont défectueuses. On prend une pièce au hasard ; on note "), l("D"), t(" « elle est défectueuse ». Calcule "),
      l("P(D)"),
      t("."),
    ],
    lignes: [[l(`P(B)=1-${dec(pA)}=${dec(pB)}`)], [l(`P(A\\cap D)=${dec(pA)}\\times ${dec(qA)}=${dec(cA)}`)], [l(`P(B\\cap D)=${dec(qB)}`)], [l(`P(D)=${dec(cA)}+${dec(qB)}=${dec(copie)}`)]],
    ligneFausse: 2,
    regles: ["probabilité du contraire", "chemin A puis D", "chemin B puis D", "probabilités totales"],
    regleCours: { texte: [t("Probabilité d'un chemin (cours, § 2) : produit des probabilités de ses branches —")], latex: "P(B\\cap D)=P(B)\\times P(D|B)" },
    aideCorrection: { texte: [t("Multiplie la branche "), l(`P(B)=${dec(pB)}`), t(" par "), l(`P(D|B)=${dec(qB)}`), t(", puis additionne les deux chemins qui mènent à D.")] },
    valeur: juste,
    valeurCopie: copie,
    decimal: true,
    piege: [t("C'est le résultat de la copie : le chemin B puis D n'y est pas multiplié par "), l("P(B)"), t(".")],
    autres: [
      { valeur: cB, message: [t("C'est "), l("P(B\\cap D)"), t(" seulement : ajoute le chemin A puis D.")] },
      { valeur: qAdd(qA, qB), message: [t("On n'additionne pas les branches du second niveau : chaque chemin est un produit.")] },
    ],
    corrigeA: {
      utilise: [t("Probabilité d'un chemin (cours, § 2 et § 3) : produit des probabilités de ses branches.")],
      lignes: [ligne("P(B\\cap D)=P(B)\\times P(D|B)", "chemin « B puis D »"), ligne(`=${dec(pB)}\\times ${dec(qB)}`), ligne(`=${dec(cB)}`, [ft("et non "), fl(dec(qB)), ft(" comme dans la copie")])],
    },
    corrigeB: {
      utilise: [t("Si la moitié des pièces vient de la machine A et que 20 % de celles-ci sont défectueuses, seules 10 % de toutes les pièces sont à la fois de la machine A et défectueuses :")],
      lignes: [ligne("P(A\\cap D)=0{,}5\\times 0{,}2=0{,}1", "et non 0,2 : une branche seule ne suffit pas")],
    },
    corrigeC: {
      utilise: [t("On reprend à partir de la ligne fausse : chemin « B puis D », puis probabilités totales (cours, § 3).")],
      lignes: [ligne(`P(B\\cap D)=${dec(pB)}\\times ${dec(qB)}=${dec(cB)}`), ligne(`P(D)=${dec(cA)}+${dec(cB)}`, "probabilités totales"), ligne(`=${dec(juste)}`)],
      verification: { utilise: [l("P(D)"), t(" est une moyenne pondérée des taux des deux machines, donc comprise entre eux :")], lignes: [ligne(`${dec(mi)}\\le ${dec(juste)}\\le ${dec(ma)}`)] },
    },
    preliminaires: [
      { ligne: [t("Arbre : au 1er niveau A ou B, au 2e niveau D ou "), l("\\bar{D}"), t(".")], regle: "construction de l'arbre" },
      { ligne: [l(`P(A)=${dec(pA)}`), t(" ; "), l(`P(D|A)=${dec(qA)}`), t(" ; "), l(`P(D|B)=${dec(qB)}`)], regle: "données" },
      { ligne: [l("P(D)=P(A\\cap D)+P(B\\cap D)")], regle: "probabilités totales" },
    ],
  };
}

function ordreOublie(e: E): CopieDetectiveProba {
  const d = e.d;
  if (d.ctx === 1) {
    const { a, b } = d;
    return {
      enonce: [t("On lance deux dés équilibrés. Calcule la probabilité d'obtenir un "), l(`${a}`), t(" et un "), l(`${b}`), t(".")],
      lignes: [[t("Cas favorable : "), l(`(${a}\\,;${b})`), t(", un seul couple.")], [l("P=\\dfrac{1}{36}")]],
      ligneFausse: 0,
      regles: ["cas favorables", "favorables / possibles"],
      regleCours: { texte: [t("Les issues sont des couples ordonnés (diagramme cartésien, cours, § 2) : "), l(`(${a}\\,;${b})`), t(" et "), l(`(${b}\\,;${a})`), t(" sont deux issues différentes.")] },
      aideCorrection: { texte: [t("Compte toutes les cases du diagramme cartésien qui contiennent un "), l(`${a}`), t(" et un "), l(`${b}`), t(".")] },
      valeur: q(2, 36),
      valeurCopie: q(1, 36),
      decimal: false,
      piege: [t("C'est le résultat de la copie : un seul des deux ordres y est compté.")],
      autres: [{ valeur: q(1, 21), message: [t("Les "), l("36"), t(" couples sont équiprobables, pas les 21 paires non ordonnées.")] }],
      corrigeA: {
        utilise: [t("Les couples sont ordonnés (cours, § 2) : obtenir un "), l(`${a}`), t(" et un "), l(`${b}`), t(", c'est "), l(`(${a}\\,;${b})`), t(" ou "), l(`(${b}\\,;${a})`), t(".")],
        lignes: [ligne("n(\\text{favorables})=2", [ft("et non 1 comme dans la copie")])],
      },
      corrigeB: {
        utilise: [t("Somme 3 avec deux dés : elle s'obtient par (1 ; 2) et par (2 ; 1), deux cases du diagramme cartésien.")],
        lignes: [ligne("P(\\text{somme }3)=\\dfrac{2}{36}=\\dfrac{1}{18}", "deux couples ordonnés")],
      },
      corrigeC: {
        utilise: [t("On reprend à partir de la ligne fausse : deux cas favorables sur 36 équiprobables.")],
        lignes: [ligne("P=\\dfrac{2}{36}"), ligne("=\\dfrac{1}{18}", "on simplifie par 2")],
        verification: { utilise: [t("Dans le diagramme cartésien, les deux cases sont symétriques par rapport à la diagonale des doubles.")], lignes: [] },
      },
      preliminaires: [
        { ligne: [t("On distingue les deux dés : le premier et le second.")], regle: "modèle" },
        { ligne: [l("\\Omega"), t(" : les "), l("36"), t(" couples (premier dé ; second dé), tous équiprobables.")], regle: "univers équiprobable" },
        { ligne: [l("P=\\dfrac{\\text{nombre de cas favorables}}{36}")], regle: "favorables / possibles" },
      ],
    };
  }
  const { r, b } = d;
  const n = r + b;
  const D = n * (n - 1);
  return {
    enonce: [t("Une urne contient "), l(`${r}`), t(" boules rouges et "), l(`${b}`), t(" boules bleues. On tire successivement deux boules, sans remise. Calcule la probabilité d'obtenir une boule de chaque couleur.")],
    lignes: [[t("« Une boule de chaque couleur » : le chemin "), l("R_1\\cap B_2"), t(".")], [l(`P(R_1\\cap B_2)=${fracB(r, n)}\\times${fracB(b, n - 1)}=${fracB(r * b, D)}`)]],
    ligneFausse: 0,
    regles: ["chemins qui réalisent l'événement", "produit le long du chemin"],
    regleCours: { texte: [t("Probabilité d'un événement (cours, § 2) : somme des probabilités de tous les chemins qui le réalisent ; ici l'ordre des couleurs compte.")] },
    aideCorrection: { texte: [t("Ajoute le chemin "), l("B_1\\cap R_2"), t(" : calcule sa probabilité, puis additionne les deux chemins.")] },
    valeur: q(2 * r * b, D),
    valeurCopie: q(r * b, D),
    decimal: false,
    piege: [t("C'est le résultat de la copie : le chemin « bleue puis rouge » y manque.")],
    autres: [{ valeur: q(2 * r * b, n * n), message: [t("Le tirage est sans remise : au second tirage, il ne reste que "), l(`${n - 1}`), t(" boules.")] }],
    corrigeA: {
      utilise: [t("Une boule de chaque couleur se réalise par deux chemins de l'arbre (cours, § 2) : rouge puis bleue, ou bleue puis rouge.")],
      lignes: [ligne("P(\\text{une de chaque})=P(R_1\\cap B_2)+P(B_1\\cap R_2)", [ft("et non le seul chemin "), fl("R_1\\cap B_2"), ft(" comme dans la copie")])],
    },
    corrigeB: {
      utilise: [t("Urne d'une rouge et d'une bleue, on tire les deux : avoir une boule de chaque couleur est certain.")],
      lignes: [ligne("P(R_1\\cap B_2)+P(B_1\\cap R_2)=\\dfrac{1}{2}\\times 1+\\dfrac{1}{2}\\times 1=1", "les deux chemins"), ligne("P(R_1\\cap B_2)=\\dfrac{1}{2}", "un seul chemin : faux, l'événement est certain")],
    },
    corrigeC: {
      utilise: [t("On reprend à partir de la ligne fausse : les deux chemins, puis leur somme.")],
      lignes: [ligne(`P(B_1\\cap R_2)=${fracB(b, n)}\\times${fracB(r, n - 1)}=${fracB(r * b, D)}`), ligne(`P(\\text{une de chaque})=${fracB(r * b, D)}+${fracB(r * b, D)}`), ligne(`=${fracB(2 * r * b, D)}`), ...reduite(2 * r * b, D)],
      verification: { utilise: [t("Avec « deux rouges » et « deux bleues », toutes les issues sont couvertes :")], lignes: [ligne(`${fracB(r * (r - 1), D)}+${fracB(b * (b - 1), D)}+${fracB(2 * r * b, D)}=1`)] },
    },
    preliminaires: [
      { ligne: [t("Il y a "), l(`${n}`), t(" boules ; tirage successif sans remise : arbre à deux niveaux.")], regle: "données" },
      { ligne: [l("R_1"), t(", "), l("B_1"), t(" : couleur de la 1re boule ; "), l("R_2"), t(", "), l("B_2"), t(" : couleur de la 2e.")], regle: "notations" },
      { ligne: [t("Probabilité d'un chemin : produit des probabilités de ses branches.")], regle: "arbre pondéré" },
    ],
  };
}

function copieCanonique(e: E): CopieDetectiveProba {
  switch (e.variante) {
    case "complementaire":
      return complementaire(e);
    case "reunion":
      return reunion(e);
    case "conditionnelleInversee":
      return conditionnelleInversee(e);
    case "produitSansRemise":
      return produitSansRemise(e);
    case "arbreMalPondere":
      return arbreMalPondere(e);
    case "ordreOublie":
      return ordreOublie(e);
  }
}

/** Copie finale : `av` lignes justes (préliminaires puis lignes justes de la copie canonique, les
 * dernières gardées) avant la ligne fausse, puis ses conséquences. */
function assembler(c: CopieDetectiveProba, av: number): CopieDetectiveProba {
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

const CACHE = new WeakMap<E, CopieDetectiveProba>();
export function copie(e: E): CopieDetectiveProba {
  const enCache = CACHE.get(e);
  if (enCache) return enCache;
  const c = assembler(copieCanonique(e), e.d.av ?? 0);
  CACHE.set(e, c);
  return c;
}

export const nombreLignes = (e: E): number => copie(e).lignes.length;

/** Lignes disponibles avant la ligne fausse (contrôle : ≥ 3 pour que av = 0…3 marche). */
export const poolAvantFausse = (e: E): number => {
  const c = copieCanonique(e);
  return c.preliminaires.length + c.ligneFausse;
};

/** Probabilité écrite comme dans la copie (décimale ou fraction réduite). */
export const nombreL = (c: CopieDetectiveProba, x: Q): string => (c.decimal ? dec(x) : qL(x));

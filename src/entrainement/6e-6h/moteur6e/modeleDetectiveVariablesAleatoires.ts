import type { LigneCalcul } from "../../export/genererFeuilleExercices";
import { latex, ligne, texte } from "../../export/corrigeTableau";
import type { ExerciceDVA, PrecisionDVA, VarianteDVA } from "../core6e/detectiveVariablesAleatoires";
import type { AideEcran, Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import { C, fact, fr, frL, frMul, frPow, frVal } from "../ui6e/nombresCombinatoireLotH2";
import { arrondiZ, phiExact, phiTable } from "../core6e/tablePhi";
import { BL, NL, nL, p4L, pctL, phiL, zL } from "../ui6e/textesLoisLotH2";

/**
 * Modèle de `6gen122` « Détective d'erreurs : variables aléatoires » : à partir des paramètres entiers
 * du scénario, la copie de l'élève fictif (cohérente avec SON erreur), la ligne fausse, la bonne
 * description, la valeur corrigée (écran 3), les messages ciblés et le contenu du corrigé détaillé (la
 * ligne refaite, la règle illustrée sur un petit exemple, la résolution reprise et vérifiée). Une seule
 * source pour l'écran, le papier et le corrigé. Même contrat que 6gen109 (copie canonique + trois
 * lignes justes préliminaires ; `av` lignes justes avant la ligne fausse, les dernières gardées).
 */

type E = ExerciceDVA;
const t = tx;
const l = lx;
const ft = texte;
const fl = latex;

export interface BlocCorrigeDVA {
  utilise: Frag[];
  lignes: LigneCalcul[];
}

export interface CopieDVA {
  enonce: Frag[];
  lignes: Frag[][];
  ligneFausse: number;
  regles: string[];
  regleCours: AideEcran;
  aideCorrection: AideEcran;
  /** Valeur juste (écran 3), références acceptées, écriture LaTeX, résultat (faux) de la copie. */
  valeur: number;
  refs: number[];
  valeurL: string;
  valeurCopie: number;
  precision: PrecisionDVA;
  /** Nom de la grandeur demandée (« la probabilité P(X ≤ 35) »). */
  demande: Frag[];
  piege: Frag[];
  autres: { valeur: number; message: Frag[] }[];
  corrigeA: BlocCorrigeDVA;
  corrigeB: BlocCorrigeDVA;
  corrigeC: BlocCorrigeDVA & { verification?: BlocCorrigeDVA };
  preliminaires: { ligne: Frag[]; regle: string }[];
}

// ============================================================================
// Descriptions (écran 2) : la juste (= variante) et trois leurres par variante.
// ============================================================================

export const LEURRES: Record<VarianteDVA, string[]> = {
  moyenne: ["moProba", "moSomme", "moCarre"],
  ecartType: ["etKonig", "etMoitie", "etSansRacine"],
  symetriePhi: ["spSigne", "spDemi", "spDeux"],
  regleUnCote: ["ruDedans", "ruMoitie", "ruK"],
  lambda: ["laDiviser", "laBinomiale", "laFactorielle"],
  complement: ["coAjout", "coSens", "coLambda"],
  uniforme: ["unSomme", "unDemi", "unRacine"],
  coefficient: ["cfExposants", "cfSomme", "cfRemise"],
  continuite: ["ctSigma", "ctSigne", "ctConditions"],
};

const r4 = (x: number) => Math.round(x * 1e4) / 1e4;

export function descriptionFragments(id: string, e: E): Frag[] {
  const d = e.d;
  switch (id) {
    case "moyenne":
      return [t("Les valeurs n'ont pas toutes la même probabilité : l'espérance est la moyenne pondérée "), l("E(X)=\\sum x_i\\,p_i"), t(", pas la moyenne simple.")];
    case "moProba":
      return [t("Il fallait additionner les probabilités au lieu des valeurs.")];
    case "moSomme":
      return [t("Il fallait additionner les valeurs sans diviser.")];
    case "moCarre":
      return [t("Il fallait calculer "), l("E(X^2)"), t(" au lieu de "), l("E(X)"), t(".")];
    case "ecartType":
      return [t("L'écart-type est la racine carrée de la variance : "), l("\\sigma=\\sqrt{V(X)}"), t(", pas "), l("V(X)^2"), t(".")];
    case "etKonig":
      return [t("La formule de König est "), l("V=E(X)^2-E(X^2)"), t(".")];
    case "etMoitie":
      return [t("L'écart-type est la moitié de la variance.")];
    case "etSansRacine":
      return [t("L'écart-type est égal à la variance.")];
    case "symetriePhi":
      return [t("La fonction "), l("\\Phi"), t(" n'est pas paire : "), l(`\\Phi(${zL(-d.zc! / 100)})=1-\\Phi(${zL(d.zc! / 100)})`), t(".")];
    case "spSigne":
      return [t("La valeur centrée réduite devait être positive.")];
    case "spDemi":
      return [t("Il fallait "), l(`\\Phi(${zL(d.zc! / 100)})-0{,}5`), t(".")];
    case "spDeux":
      return [t("Il fallait "), l(`2\\Phi(${zL(d.zc! / 100)})-1`), t(".")];
    case "regleUnCote":
      return [t("Hors de l'intervalle, le pourcentage se partage également entre les deux côtés (symétrie) : il fallait diviser par "), l("2"), t(".")];
    case "ruDedans":
      return [t("Il fallait garder le pourcentage de l'intervalle, sans le soustraire de 100 %.")];
    case "ruMoitie":
      return [t("Il fallait prendre la moitié du pourcentage de l'intervalle.")];
    case "ruK":
      return [t("Le nombre d'écarts-types "), l("k"), t(" est faux.")];
    case "lambda":
      return [l("\\lambda"), t(" doit être ajusté à la durée de la question : "), l(`\\lambda=${d.r}\\times\\dfrac{${d.t}}{60}`), t(".")];
    case "laDiviser":
      return [t("Il fallait "), l(`\\lambda=\\dfrac{${d.r}}{${d.t}}`), t(".")];
    case "laBinomiale":
      return [t("Il fallait une loi binomiale : le nombre d'appels est fixé.")];
    case "laFactorielle":
      return [t("Il fallait diviser par "), l("k"), t(" au lieu de "), l("k!"), t(".")];
    case "complement":
      return [t("Le contraire de "), l(`X\\ge ${d.k}`), t(" est "), l(`X\\le ${d.k! - 1}`), t(", pas "), l(`X\\le ${d.k}`), t(".")];
    case "coAjout":
      return [t("Il fallait ajouter "), l(`P(X=${d.k})`), t(" au lieu de passer par le contraire.")];
    case "coSens":
      return [t("Il fallait calculer "), l(`P(X\\le ${d.k})`), t(" et s'arrêter là.")];
    case "coLambda":
      return [t("Le paramètre "), l("\\lambda"), t(" devait être ajusté.")];
    case "uniforme":
      return [t("La variance d'une loi uniforme est "), l("\\dfrac{(b-a)^2}{12}"), t(" : le carré a été oublié.")];
    case "unSomme":
      return [t("Il fallait "), l("\\dfrac{a+b}{12}"), t(".")];
    case "unDemi":
      return [t("Il fallait "), l("\\dfrac{b-a}{2}"), t(".")];
    case "unRacine":
      return [t("Il fallait "), l("\\dfrac{\\sqrt{b-a}}{12}"), t(".")];
    case "coefficient":
      return [t("Il manque le coefficient "), l(`C_{${d.n}}^{${d.k}}`), t(" : les "), l(`C_{${d.n}}^{${d.k}}`), t(" ordres possibles des succès ont tous cette probabilité.")];
    case "cfExposants":
      return [t("Les exposants de "), l("p"), t(" et de "), l("1-p"), t(" sont inversés.")];
    case "cfSomme":
      return [t("Il fallait additionner les probabilités des épreuves au lieu de les multiplier.")];
    case "cfRemise":
      return [t("Les épreuves ne sont pas indépendantes : il fallait une loi hypergéométrique.")];
    case "continuite":
      return [t("La correction de continuité est oubliée : "), l(`P(X\\le ${d.k})\\approx P(Y\\le ${d.k}+0{,}5)`), t(".")];
    case "ctSigma":
      return [t("Il fallait "), l("\\sigma=np(1-p)"), t(", sans racine.")];
    case "ctSigne":
      return [t("Le signe de "), l("z"), t(" est faux.")];
    case "ctConditions":
      return [t("Les conditions d'approximation ne sont pas remplies : il fallait la loi binomiale exacte.")];
  }
  return [];
}

// ============================================================================
// Scénarios.
// ============================================================================

function moyenne(e: E): CopieDVA {
  const { x1, x2, x3, p1, p2, p3 } = e.d as Record<string, number>;
  const xs = [x1!, x2!, x3!];
  const ps = [p1! / 10, p2! / 10, p3! / 10];
  const E_ = xs.reduce((s, x, i) => s + x * ps[i]!, 0);
  const m = (x1! + x2! + x3!) / 3;
  const pL_ = ps.map((p) => nL(p));
  const somme = xs.map((x, i) => `${x < 0 ? `(${x})` : x}\\times ${pL_[i]}`).join("+");
  return {
    enonce: [t("Un jeu fait gagner "), l(`${x1}`), t(", "), l(`${x2}`), t(" ou "), l(`${x3}`), t(" euros (un gain négatif est une perte) avec les probabilités respectives "), l(pL_[0]!), t(", "), l(pL_[1]!), t(" et "), l(pL_[2]!), t(". Calcule le gain moyen espéré "), l("E(X)"), t(".")],
    lignes: [[t("L'espérance est la moyenne des valeurs de "), l("X"), t(".")], [l(`E(X)=\\dfrac{${x1}+${x2 < 0 ? `(${x2})` : x2}+${x3 < 0 ? `(${x3})` : x3}}{3}${Math.abs(m * 1e4 - Math.round(m * 1e4)) < 1e-6 ? "=" : "\\approx "}${nL(m, 2)}`)], [t("Le gain moyen espéré est "), l(`${nL(m, 2)}`), t(" euros.")]],
    ligneFausse: 0,
    regles: ["définition de l'espérance", "calcul", "conclusion"],
    regleCours: { texte: [t("Espérance d'une variable discrète (cours, § 1) : chaque valeur est pondérée par sa probabilité :")], latex: "E(X)=x_1p_1+x_2p_2+\\cdots+x_np_n" },
    aideCorrection: { texte: [t("Multiplie chaque gain par sa probabilité, puis additionne les trois produits.")] },
    valeur: E_,
    refs: [E_],
    valeurL: nL(E_),
    valeurCopie: Math.round(m * 100) / 100,
    precision: "exacte",
    demande: [t("le gain moyen espéré "), l("E(X)")],
    piege: [t("C'est le résultat de la copie : la moyenne simple ignore que les gains n'ont pas la même probabilité.")],
    autres: [{ valeur: x1! + x2! + x3!, message: [t("C'est la somme des gains : il faut les pondérer par leurs probabilités.")] }],
    corrigeA: { utilise: [t("L'espérance pondère chaque valeur par sa probabilité (cours, § 1).")], lignes: [ligne("E(X)=x_1p_1+x_2p_2+x_3p_3", [ft("moyenne pondérée, et non la moyenne simple comme dans la copie")])] },
    corrigeB: { utilise: [t("Petit exemple : "), l("X=0"), t(" avec la probabilité "), l("0{,}9"), t(", "), l("X=10"), t(" avec la probabilité "), l("0{,}1"), t(".")], lignes: [ligne("E(X)=0\\times 0{,}9+10\\times 0{,}1=1", "moyenne pondérée"), ligne("\\dfrac{0+10}{2}=5", "moyenne simple : ignore que 10 est rare")] },
    corrigeC: {
      utilise: [t("On reprend avec la moyenne pondérée.")],
      lignes: [ligne(`E(X)=${somme}`), ligne(`=${nL(E_)}`)],
      verification: { utilise: [t("L'espérance est comprise entre le plus petit et le plus grand gain :")], lignes: [ligne(`${Math.min(...xs)}\\le ${nL(E_)}\\le ${Math.max(...xs)}`)] },
    },
    preliminaires: [
      { ligne: [t("Les valeurs de "), l("X"), t(" sont "), l(`${x1}`), t(", "), l(`${x2}`), t(" et "), l(`${x3}`), t(".")], regle: "données" },
      { ligne: [t("Leurs probabilités sont "), l(pL_[0]!), t(", "), l(pL_[1]!), t(" et "), l(pL_[2]!), t(".")], regle: "données" },
      { ligne: [l(`${pL_[0]}+${pL_[1]}+${pL_[2]}=1`), t(" : c'est bien une loi de probabilité.")], regle: "somme des probabilités" },
    ],
  };
}

function ecartType(e: E): CopieDVA {
  const { x1, x2, x3, p1, p2, p3 } = e.d as Record<string, number>;
  const xs = [x1!, x2!, x3!];
  const ps = [p1! / 10, p2! / 10, p3! / 10];
  const E1 = xs.reduce((s, x, i) => s + x * ps[i]!, 0);
  const E2 = xs.reduce((s, x, i) => s + x * x * ps[i]!, 0);
  const V = Math.round((E2 - E1 * E1) * 1e6) / 1e6;
  const s = Math.sqrt(V);
  const pL_ = ps.map((p) => nL(p));
  const loi = xs.map((x, i) => `${x}\\times ${pL_[i]}`).join("+");
  const loi2 = xs.map((x, i) => `${x}^2\\times ${pL_[i]}`).join("+");
  return {
    enonce: [t("La variable "), l("X"), t(" prend les valeurs "), l(`${x1}`), t(", "), l(`${x2}`), t(" et "), l(`${x3}`), t(" avec les probabilités "), l(pL_[0]!), t(", "), l(pL_[1]!), t(" et "), l(pL_[2]!), t(". Calcule son écart-type "), l("\\sigma(X)"), t(" (au centième).")],
    lignes: [
      [l(`E(X)=${loi}=${nL(E1)}`)],
      [l(`E(X^2)=${loi2}=${nL(E2)}`)],
      [l(`V(X)=E(X^2)-E(X)^2=${nL(E2)}-${nL(E1)}^2=${nL(V)}`)],
      [l(`\\sigma(X)=V(X)^2=${nL(V)}^2\\approx ${nL(Math.round(V * V * 100) / 100, 2)}`)],
      [t("L'écart-type vaut environ "), l(nL(Math.round(V * V * 100) / 100, 2)), t(".")],
    ],
    ligneFausse: 3,
    regles: ["espérance", "espérance du carré", "formule de König", "écart-type", "conclusion"],
    regleCours: { texte: [t("Variance et écart-type (cours, § 1) :")], latex: "V(X)=E(X^2)-E(X)^2\\qquad \\sigma(X)=\\sqrt{V(X)}" },
    aideCorrection: { texte: [t("Garde "), l(`V(X)=${nL(V)}`), t(" et prends sa racine carrée.")] },
    valeur: s,
    refs: [s],
    valeurL: `\\sqrt{${nL(V)}}\\approx ${nL(Math.round(s * 100) / 100, 2)}`,
    valeurCopie: V * V,
    precision: "centieme",
    demande: [t("l'écart-type "), l("\\sigma(X)")],
    piege: [t("C'est le résultat de la copie : la variance a été élevée au carré au lieu d'en prendre la racine.")],
    autres: [{ valeur: V, message: [t("C'est la variance ; l'écart-type est sa racine carrée.")] }],
    corrigeA: { utilise: [t("L'écart-type est la racine carrée de la variance (cours, § 1).")], lignes: [ligne(`\\sigma(X)=\\sqrt{V(X)}=\\sqrt{${nL(V)}}`, [ft("et non "), fl("V(X)^2"), ft(" comme dans la copie")])] },
    corrigeB: { utilise: [t("Petit exemple : "), l("X=\\pm 2"), t(" avec la probabilité "), l("\\tfrac{1}{2}"), t(" chacune ; l'écart à la moyenne est toujours "), l("2"), t(".")], lignes: [ligne("V(X)=4", "moyenne des carrés des écarts"), ligne("\\sigma(X)=\\sqrt{4}=2", "on retrouve l'écart, dans l'unité de X")] },
    corrigeC: {
      utilise: [t("On reprend à partir de la variance, juste.")],
      lignes: [ligne(`\\sigma(X)=\\sqrt{${nL(V)}}`), ligne(`\\approx ${nL(Math.round(s * 100) / 100, 2)}`, "au centième")],
      verification: { utilise: [t("La variance est encadrée par les carrés des deux centièmes voisins :")], lignes: [ligne(`${nL(Math.floor(s * 100) / 100, 2)}^2=${nL((Math.floor(s * 100) / 100) ** 2)}<${nL(V)}<${nL((Math.floor(s * 100) / 100 + 0.01) ** 2)}`)] },
    },
    preliminaires: [
      { ligne: [t("Les probabilités ont pour somme "), l("1"), t(".")], regle: "loi de probabilité" },
      { ligne: [t("On utilise la formule de König pour la variance.")], regle: "méthode" },
      { ligne: [t("On calcule d'abord "), l("E(X)"), t(", puis "), l("E(X^2)"), t(".")], regle: "méthode" },
    ],
  };
}

const z2 = (zc: number) => zc / 100;

function symetriePhi(e: E): CopieDVA {
  const { mu, sigma, zc } = e.d as Record<string, number>;
  const z = z2(zc!);
  const x0 = mu! - (zc! * sigma!) / 100;
  const juste = r4(1 - phiTable(z));
  return {
    enonce: [l(`X\\sim${NL(mu!, sigma!)}`), t(". Calcule "), l(`P(X\\le ${nL(x0)})`), t(" à l'aide de la table de "), l("\\Phi"), t(" (quatre décimales).")],
    lignes: [
      [l(`z=\\dfrac{${nL(x0)}-${mu}}{${sigma}}=${zL(-z)}`)],
      [l(`P(X\\le ${nL(x0)})=${phiL(-z)}`)],
      [l(`${phiL(-z)}=${phiL(z)}=${p4L(phiTable(z))}`)],
      [t("Donc "), l(`P(X\\le ${nL(x0)})\\approx ${p4L(phiTable(z))}`), t(".")],
    ],
    ligneFausse: 2,
    regles: ["standardisation", "probabilité écrite avec Φ", "lecture de la table", "conclusion"],
    regleCours: { texte: [t("Symétrie de la courbe de Gauss (cours, § 6) :")], latex: "\\Phi(-z)=1-\\Phi(z)" },
    aideCorrection: { texte: [t("Remplace "), l(phiL(-z)), t(" par "), l(`1-${phiL(z)}`), t(", puis lis la table.")] },
    valeur: juste,
    refs: [juste, 1 - phiExact(z)],
    valeurL: `\\approx ${p4L(juste)}`,
    valeurCopie: phiTable(z),
    precision: "dec4",
    demande: [t("la probabilité "), l(`P(X\\le ${nL(x0)})`)],
    piege: [t("C'est le résultat de la copie : une valeur sous la moyenne a une probabilité à gauche inférieure à "), l("0{,}5"), t(".")],
    autres: [],
    corrigeA: { utilise: [t("La table ne donne "), l("\\Phi"), t(" que pour des nombres positifs ; par symétrie, "), l("\\Phi(-z)=1-\\Phi(z)"), t(".")], lignes: [ligne(`${phiL(-z)}=1-${phiL(z)}`, [ft("et non "), fl(phiL(z)), ft(" comme dans la copie")])] },
    corrigeB: { utilise: [t("Petit exemple : "), l("\\Phi(1)\\approx 0{,}8413"), t(", aire à gauche de 1 ; l'aire à gauche de "), l("-1"), t(" est la petite queue de gauche.")], lignes: [ligne("\\Phi(-1)=1-0{,}8413=0{,}1587", "symétrie"), ligne("\\Phi(-1)<0{,}5<\\Phi(1)", "cohérent avec le dessin")] },
    corrigeC: {
      utilise: [t("On reprend à partir de la ligne fausse.")],
      lignes: [ligne(`P(X\\le ${nL(x0)})=1-${phiL(z)}`), ligne(`=1-${p4L(phiTable(z))}`, "table"), ligne(`=${p4L(juste)}`)],
      verification: { utilise: [l(`${nL(x0)}`), t(" est sous la moyenne : la probabilité est inférieure à "), l("0{,}5"), t(".")], lignes: [ligne(`${p4L(juste)}<0{,}5`)] },
    },
    preliminaires: [
      { ligne: [t("Moyenne "), l(`\\mu=${mu}`), t(", écart-type "), l(`\\sigma=${sigma}`), t(".")], regle: "données" },
      { ligne: [l("Z=\\dfrac{X-\\mu}{\\sigma}"), t(" suit la loi "), l("\\mathcal{N}(0\\,;1)"), t(".")], regle: "standardisation" },
      { ligne: [t("La table donne "), l("\\Phi(z)=P(Z\\le z)"), t(" pour "), l("z\\ge 0"), t(".")], regle: "table" },
    ],
  };
}

const REGLE: Record<number, number> = { 1: 68.3, 2: 95.4, 3: 99.7 };
const CTX_REGLE = [
  { phrase: "La taille des élèves d'une école", unite: "cm", objets: "élèves", verbe: "mesurent" },
  { phrase: "La masse des paquets remplis par une machine", unite: "g", objets: "paquets", verbe: "pèsent" },
];

function regleUnCote(e: E): CopieDVA {
  const { ctx, mu, sigma, k } = e.d as Record<string, number>;
  const c = CTX_REGLE[ctx!]!;
  const p = REGLE[k!]!;
  const x = mu! + k! * sigma!;
  const juste = (100 - p) / 2;
  const exact = (1 - phiExact(k!)) * 100;
  return {
    enonce: [t(`${c.phrase} suit une loi normale de moyenne `), l(`${mu}\\text{ ${c.unite}}`), t(" et d'écart-type "), l(`${sigma}\\text{ ${c.unite}}`), t(`. Quel pourcentage des ${c.objets} ${c.verbe} plus de `), l(`${x}\\text{ ${c.unite}}`), t(" ? Utilise la règle empirique.")],
    lignes: [
      [l(`${x}=${mu}+${k}\\times ${sigma}`), t(" : c'est "), l(`\\mu+${k}\\sigma`), t(".")],
      [t("Règle empirique : "), l(pctL(p)), t(" des valeurs sont dans "), l(`[\\mu-${k}\\sigma\\,;\\mu+${k}\\sigma]`), t(".")],
      [t("Donc "), l(`100\\,\\%-${pctL(p)}=${pctL(100 - p)}`), t(" des valeurs sont au-dessus de "), l(`${x}`), t(".")],
      [t("Réponse : "), l(pctL(100 - p)), t(".")],
    ],
    ligneFausse: 2,
    regles: ["nombre d'écarts-types", "règle empirique", "pourcentage au-dessus", "conclusion"],
    regleCours: { texte: [t("Règle empirique (cours, § 6) : la courbe est symétrique ; hors de "), l("[\\mu-k\\sigma\\,;\\mu+k\\sigma]"), t(", la moitié du reste est de chaque côté.")] },
    aideCorrection: { texte: [t("Le reste "), l(pctL(100 - p)), t(" se répartit des deux côtés de l'intervalle : quelle part est au-dessus ?")] },
    valeur: juste,
    refs: [juste, exact],
    valeurL: pctL(juste, 3),
    valeurCopie: 100 - p,
    precision: "pourcent",
    demande: [t("le pourcentage demandé")],
    piege: [t("C'est le résultat de la copie : ce pourcentage compte les deux côtés de l'intervalle.")],
    autres: [{ valeur: p / 2, message: [t("C'est la moitié de l'intervalle (entre la moyenne et la borne) ; on demande au-delà de la borne.")] }],
    corrigeA: { utilise: [t("La courbe est symétrique par rapport à "), l("\\mu"), t(" : le pourcentage hors de l'intervalle se partage en deux.")], lignes: [ligne(`\\dfrac{100\\,\\%-${pctL(p)}}{2}`, [ft("un seul côté, et non "), fl(pctL(100 - p)), ft(" comme dans la copie")])] },
    corrigeB: { utilise: [t("Petit exemple : "), l("95{,}4\\,\\%"), t(" dans "), l("[\\mu-2\\sigma\\,;\\mu+2\\sigma]"), t(".")], lignes: [ligne("100\\,\\%-95{,}4\\,\\%=4{,}6\\,\\%", "les deux queues"), ligne("\\dfrac{4{,}6\\,\\%}{2}=2{,}3\\,\\%", "une seule queue")] },
    corrigeC: {
      utilise: [t("On reprend en partageant par symétrie.")],
      lignes: [ligne(`\\dfrac{100\\,\\%-${pctL(p)}}{2}=\\dfrac{${pctL(100 - p)}}{2}`), ligne(`=${pctL(juste, 3)}`)],
      verification: { utilise: [t("Avec la table de "), l("\\Phi"), t(", la valeur exacte est "), l(`\\approx ${pctL(exact)}`), t(".")], lignes: [] },
    },
    preliminaires: [
      { ligne: [l(`\\mu=${mu}`), t(" et "), l(`\\sigma=${sigma}`), t(".")], regle: "données" },
      { ligne: [t("On cherche la proportion au-dessus de "), l(`${x}`), t(".")], regle: "question" },
      { ligne: [t("La courbe de Gauss est symétrique par rapport à "), l("\\mu"), t(".")], regle: "propriété" },
    ],
  };
}

const poisson = (lam: number, k: number) => (Math.exp(-lam) * lam ** k) / fact(k);

function lambdaScenario(e: E): CopieDVA {
  const { r, t: tm, k } = e.d as Record<string, number>;
  const lam = (r! * tm!) / 60;
  const juste = r4(poisson(lam, k!));
  const faux = r4(poisson(r!, k!));
  return {
    enonce: [t("Un standard reçoit en moyenne "), l(`${r}`), t(" appels par heure, au hasard. Calcule la probabilité de recevoir exactement "), l(`${k}`), t(` appel${k! > 1 ? "s" : ""} en `), l(`${tm}`), t(" minutes (quatre décimales).")],
    lignes: [
      [t("Le nombre "), l("X"), t(" d'appels suit une loi de Poisson.")],
      [l(`\\lambda=${r}`), t(".")],
      [l(`P(X=${k})=e^{-${r}}\\,\\dfrac{${r}^{${k}}}{${k}!}\\approx ${p4L(faux)}`)],
      [t("La probabilité vaut environ "), l(p4L(faux)), t(".")],
    ],
    ligneFausse: 1,
    regles: ["modèle", "paramètre λ", "formule de Poisson", "conclusion"],
    regleCours: { texte: [t("Ajustement de "), l("\\lambda"), t(" (cours, § 8) : "), l("\\lambda"), t(" est le nombre moyen d'événements sur la durée de la question, proportionnel à cette durée.")] },
    aideCorrection: { texte: [t("Combien d'appels en moyenne en "), l(`${tm}`), t(" minutes ? Puis reprends la formule avec ce "), l("\\lambda"), t(".")] },
    valeur: juste,
    refs: [juste, poisson(lam, k!)],
    valeurL: `\\approx ${p4L(juste)}`,
    valeurCopie: faux,
    precision: "dec4",
    demande: [t("la probabilité "), l(`P(X=${k})`)],
    piege: [t("C'est le résultat de la copie : il utilise le taux horaire sans l'ajuster à "), l(`${tm}`), t(" minutes.")],
    autres: [],
    corrigeA: { utilise: [l("\\lambda"), t(" est proportionnel à la durée.")], lignes: [ligne(`\\lambda=${r}\\times\\dfrac{${tm}}{60}=${nL(lam)}`, [ft("et non "), fl(`${r}`), ft(" comme dans la copie")])] },
    corrigeB: { utilise: [t("Petit exemple : "), l("60"), t(" appels par heure, c'est en moyenne "), l("1"), t(" appel par minute.")], lignes: [ligne("\\lambda=60\\times\\dfrac{1}{60}=1", "sur une minute"), ligne("\\lambda=60\\times\\dfrac{30}{60}=30", "sur une demi-heure")] },
    corrigeC: {
      utilise: [t("On reprend avec le paramètre ajusté.")],
      lignes: [ligne(`P(X=${k})=e^{-${nL(lam)}}\\,\\dfrac{${nL(lam)}^{${k}}}{${k}!}`), ligne(`\\approx ${p4L(juste)}`, "quatre décimales")],
      verification: { utilise: [t("C'est bien une probabilité :")], lignes: [ligne(`0\\le ${p4L(juste)}\\le 1`)] },
    },
    preliminaires: [
      { ligne: [t("Les appels arrivent au hasard, indépendamment les uns des autres.")], regle: "hypothèses" },
      { ligne: [t("On compte les appels pendant "), l(`${tm}`), t(" minutes.")], regle: "question" },
      { ligne: [t("Formule : "), l("P(X=k)=e^{-\\lambda}\\dfrac{\\lambda^k}{k!}"), t(".")], regle: "formule" },
    ],
  };
}

function complement(e: E): CopieDVA {
  const { l2, k } = e.d as Record<string, number>;
  const lam = l2! / 2;
  let cumK = 0;
  for (let i = 0; i <= k!; i++) cumK += poisson(lam, i);
  const cumK1 = cumK - poisson(lam, k!);
  const juste = r4(1 - cumK1);
  const faux = r4(1 - cumK);
  const termes = Array.from({ length: k! + 1 }, (_, i) => `P(X=${i})`).join("+");
  return {
    enonce: [t("Le nombre "), l("X"), t(" de pannes d'une machine en un mois suit une loi de Poisson de paramètre "), l(`\\lambda=${nL(lam)}`), t(". Calcule la probabilité d'avoir au moins "), l(`${k}`), t(" pannes en un mois (quatre décimales).")],
    lignes: [
      [l(`P(X\\ge ${k})=1-P(X\\le ${k})`)],
      [l(`P(X\\le ${k})=${termes}\\approx ${p4L(r4(cumK))}`)],
      [l(`P(X\\ge ${k})\\approx 1-${p4L(r4(cumK))}=${p4L(faux)}`)],
      [t("Réponse : environ "), l(p4L(faux)), t(".")],
    ],
    ligneFausse: 0,
    regles: ["événement contraire", "somme des termes", "complément", "conclusion"],
    regleCours: { texte: [t("Événement contraire : pour une variable à valeurs entières,")], latex: "P(X\\ge k)=1-P(X\\le k-1)" },
    aideCorrection: { texte: [t("Les valeurs « au moins "), l(`${k}`), t(" » commencent à "), l(`${k}`), t(" : leur contraire s'arrête à "), l(`${k - 1}`), t(".")] },
    valeur: juste,
    refs: [juste, 1 - cumK1],
    valeurL: `\\approx ${p4L(juste)}`,
    valeurCopie: faux,
    precision: "dec4",
    demande: [t("la probabilité "), l(`P(X\\ge ${k})`)],
    piege: [t("C'est le résultat de la copie : c'est "), l(`P(X>${k})`), t(", la valeur "), l(`${k}`), t(" a été retirée deux fois.")],
    autres: [{ valeur: cumK, message: [t("C'est "), l(`P(X\\le ${k})`), t(" ; il faut le contraire, avec la bonne borne.")] }],
    corrigeA: { utilise: [t("Le contraire de « au moins "), l(`${k}`), t(" » est « au plus "), l(`${k - 1}`), t(" ».")], lignes: [ligne(`P(X\\ge ${k})=1-P(X\\le ${k - 1})`, [ft("et non "), fl(`1-P(X\\le ${k})`), ft(" comme dans la copie")])] },
    corrigeB: { utilise: [t("Petit exemple avec un dé : « au moins 5 » = {5 ; 6}, son contraire est {1 ; 2 ; 3 ; 4}.")], lignes: [ligne("P(X\\ge 5)=1-P(X\\le 4)=1-\\dfrac{4}{6}=\\dfrac{2}{6}", "juste"), ligne("1-P(X\\le 5)=\\dfrac{1}{6}", "oublie la valeur 5")] },
    corrigeC: {
      utilise: [t("On reprend avec la bonne borne.")],
      lignes: [ligne(`P(X\\le ${k - 1})\\approx ${p4L(r4(cumK1))}`, "somme des termes de 0 à k − 1"), ligne(`P(X\\ge ${k})\\approx 1-${p4L(r4(cumK1))}`), ligne(`=${p4L(juste)}`)],
      verification: { utilise: [t("La valeur juste dépasse celle de la copie de "), l(`P(X=${k})\\approx ${p4L(r4(poisson(lam, k!)))}`), t(".")], lignes: [] },
    },
    preliminaires: [
      { ligne: [l("X"), t(" suit une loi de Poisson de paramètre "), l(`${nL(lam)}`), t(".")], regle: "données" },
      { ligne: [t("« Au moins "), l(`${k}`), t(" pannes » s'écrit "), l(`X\\ge ${k}`), t(".")], regle: "traduction" },
      { ligne: [t("On passe par l'événement contraire (moins de termes à additionner).")], regle: "méthode" },
    ],
  };
}

function uniforme(e: E): CopieDVA {
  const { a, L } = e.d as Record<string, number>;
  const b = a! + L!;
  const juste = (L! * L!) / 12;
  return {
    enonce: [t("Un train arrive à un instant au hasard entre 8 h "), l(`${a}`), t(" et 8 h "), l(`${b}`), t(", aucun instant n'étant privilégié ; "), l("X"), t(" est le nombre de minutes après 8 h, uniforme sur "), l(`[${a}\\,;${b}]`), t(". Calcule la variance "), l("V(X)"), t(".")],
    lignes: [[l(`E(X)=\\dfrac{${a}+${b}}{2}=${nL((a! + b) / 2)}`)], [l(`V(X)=\\dfrac{${b}-${a}}{12}=${frL(fr(L!, 12))}`)], [t("La variance vaut "), l(frL(fr(L!, 12))), t(".")]],
    ligneFausse: 1,
    regles: ["espérance", "variance", "conclusion"],
    regleCours: { texte: [t("Loi uniforme continue sur "), l("[a\\,;b]"), t(" (cours, § 5) :")], latex: "E(X)=\\dfrac{a+b}{2}\\qquad V(X)=\\dfrac{(b-a)^2}{12}" },
    aideCorrection: { texte: [t("Élève la longueur de l'intervalle au carré avant de diviser par "), l("12"), t(".")] },
    valeur: juste,
    refs: [juste],
    valeurL: nL(juste),
    valeurCopie: L! / 12,
    precision: "exacte",
    demande: [t("la variance "), l("V(X)")],
    piege: [t("C'est le résultat de la copie : la longueur n'a pas été élevée au carré.")],
    autres: [{ valeur: Math.sqrt(juste), message: [t("C'est l'écart-type ; on demande la variance.")] }],
    corrigeA: { utilise: [t("La variance d'une loi uniforme continue est "), l("\\dfrac{(b-a)^2}{12}"), t(".")], lignes: [ligne(`V(X)=\\dfrac{(${b}-${a})^2}{12}`, [ft("et non "), fl(`\\dfrac{${b}-${a}}{12}`), ft(" comme dans la copie")])] },
    corrigeB: { utilise: [t("Contrôle d'unité : si "), l("X"), t(" est en minutes, la variance est en minutes au carré ; "), l("b-a"), t(" seul est en minutes.")], lignes: [ligne("\\sigma(X)=\\sqrt{V(X)}=\\dfrac{b-a}{\\sqrt{12}}", "en minutes, comme X")] },
    corrigeC: {
      utilise: [t("On reprend avec le carré.")],
      lignes: [ligne(`V(X)=\\dfrac{${L}^2}{12}`), ligne(`=\\dfrac{${L! * L!}}{12}`), ligne(`=${nL(juste)}`)],
      verification: { utilise: [t("L'écart-type "), l(`\\sqrt{${nL(juste)}}\\approx ${nL(Math.round(Math.sqrt(juste) * 100) / 100, 2)}`), t(" est plus petit que la demi-longueur "), l(`${nL(L! / 2)}`), t(", cohérent.")], lignes: [] },
    },
    preliminaires: [
      { ligne: [l("X"), t(" suit la loi uniforme sur "), l(`[${a}\\,;${b}]`), t(".")], regle: "modèle" },
      { ligne: [t("Longueur de l'intervalle : "), l(`${b}-${a}=${L}`), t(".")], regle: "données" },
      { ligne: [t("L'espérance est au milieu de l'intervalle.")], regle: "propriété" },
    ],
  };
}

const CTX_COEF = [
  { p: fr(1, 2), texte: (n: number) => [t("On lance "), l(`${n}`), t(" fois une pièce équilibrée ; "), l("X"), t(" est le nombre de « pile ».")] },
  { p: fr(1, 6), texte: (n: number) => [t("On lance "), l(`${n}`), t(" fois un dé équilibré ; "), l("X"), t(" est le nombre de 6.")] },
  { p: fr(1, 4), texte: (n: number) => [t("Un élève répond au hasard aux "), l(`${n}`), t(" questions d'un questionnaire (quatre réponses par question, une seule juste) ; "), l("X"), t(" est le nombre de bonnes réponses.")] },
];

function coefficient(e: E): CopieDVA {
  const { ctx, n, k } = e.d as Record<string, number>;
  const c = CTX_COEF[ctx!]!;
  const p = c.p;
  const q = fr(p.d - p.n, p.d);
  const sans = frMul(frPow(p, k!), frPow(q, n! - k!));
  const juste = frMul(fr(C(n!, k!)), sans);
  return {
    enonce: [...c.texte(n!), t(" Calcule "), l(`P(X=${k})`), t(" (valeur exacte).")],
    lignes: [[l("X"), t(" suit la loi binomiale "), l(BL(n!, frL(p))), t(".")], [l(`P(X=${k})=\\left(${frL(p)}\\right)^{${k}}\\left(${frL(q)}\\right)^{${n! - k!}}`)], [l(`P(X=${k})=${frL(sans)}`)]],
    ligneFausse: 1,
    regles: ["modèle", "formule", "calcul"],
    regleCours: { texte: [t("Loi binomiale (cours, § 2) :")], latex: "P(X=k)=C_n^k\\,p^k(1-p)^{n-k}" },
    aideCorrection: { texte: [t("Multiplie le résultat de la copie par le nombre d'ordres possibles des "), l(`${k}`), t(" succès parmi les "), l(`${n}`), t(" épreuves.")] },
    valeur: frVal(juste),
    refs: [frVal(juste)],
    valeurL: frL(juste),
    valeurCopie: frVal(sans),
    precision: "exacte",
    demande: [t("la probabilité "), l(`P(X=${k})`)],
    piege: [t("C'est le résultat de la copie : la probabilité d'un seul ordre des succès.")],
    autres: [],
    corrigeA: { utilise: [t("Les succès peuvent tomber à "), l(`C_{${n}}^{${k}}`), t(" places différentes, chacune avec la même probabilité.")], lignes: [ligne(`P(X=${k})=C_{${n}}^{${k}}\\left(${frL(p)}\\right)^{${k}}\\left(${frL(q)}\\right)^{${n! - k!}}`, [ft("coefficient oublié dans la copie")])] },
    corrigeB: { utilise: [t("Petit exemple : deux lancers de pièce, exactement un « pile » : PF ou FP.")], lignes: [ligne("P(X=1)=C_2^1\\left(\\dfrac{1}{2}\\right)^{2}=\\dfrac{2}{4}", "deux ordres"), ligne("\\left(\\dfrac{1}{2}\\right)^{2}=\\dfrac{1}{4}", "un seul ordre")] },
    corrigeC: {
      utilise: [t("On reprend avec le coefficient.")],
      lignes: [ligne(`P(X=${k})=${C(n!, k!)}\\times ${frL(sans)}`, "nombre d'ordres des succès"), ligne(`=${frL(juste)}`)],
      verification: { utilise: [t("C'est bien une probabilité :")], lignes: [ligne(`0<${frL(juste)}<1`)] },
    },
    preliminaires: [
      { ligne: [t("Les "), l(`${n}`), t(" épreuves sont identiques et indépendantes.")], regle: "hypothèses" },
      { ligne: [t("Probabilité d'un succès : "), l(`p=${frL(p)}`), t(".")], regle: "données" },
      { ligne: [t("On cherche exactement "), l(`${k}`), t(" succès.")], regle: "question" },
    ],
  };
}

function continuite(e: E): CopieDVA {
  const { n, pc, k } = e.d as Record<string, number>;
  const p = pc! / 100;
  const mu = n! * p;
  const sigma = Math.sqrt(n! * p * (1 - p));
  const zFaux = arrondiZ((k! - mu) / sigma);
  const zJuste = arrondiZ((k! + 0.5 - mu) / sigma);
  const juste = phiTable(zJuste);
  const faux = phiTable(zFaux);
  return {
    enonce: [l(`X\\sim${BL(n!, nL(p))}`), t(". Estime "), l(`P(X\\le ${k})`), t(" à l'aide d'une loi normale "), l("Y"), t(" (table de "), l("\\Phi"), t(", quatre décimales).")],
    lignes: [
      [l(`n=${n}>30`), t(" et "), l(`0{,}3<${nL(p)}<0{,}7`), t(" : on approche par une loi normale.")],
      [l(`\\mu=${n}\\times ${nL(p)}=${nL(mu)}`), t(" et "), l(`\\sigma=\\sqrt{${n}\\times ${nL(p)}\\times ${nL(1 - p)}}=${nL(sigma)}`), t(".")],
      [l(`z=\\dfrac{${k}-${nL(mu)}}{${nL(sigma)}}\\approx ${zL(zFaux)}`)],
      [l(`P(X\\le ${k})\\approx ${phiL(zFaux)}=${p4L(faux)}`)],
      [t("Réponse : environ "), l(p4L(faux)), t(".")],
    ],
    ligneFausse: 2,
    regles: ["conditions", "paramètres", "standardisation", "lecture de la table", "conclusion"],
    regleCours: { texte: [t("Correction de continuité (cours, § 7) : la valeur entière "), l("k"), t(" occupe l'intervalle "), l("[k-0{,}5\\,;k+0{,}5]"), t(" :")], latex: "P(X\\le k)\\approx P(Y\\le k+0{,}5)" },
    aideCorrection: { texte: [t("Standardise "), l(`${k}+0{,}5`), t(" au lieu de "), l(`${k}`), t(", puis lis la table.")] },
    valeur: juste,
    refs: [juste, phiExact((k! + 0.5 - mu) / sigma)],
    valeurL: `\\approx ${p4L(juste)}`,
    valeurCopie: faux,
    precision: "dec4",
    demande: [t("l'estimation de "), l(`P(X\\le ${k})`)],
    piege: [t("C'est le résultat de la copie, sans correction de continuité.")],
    autres: [],
    corrigeA: { utilise: [t("Correction de continuité : on standardise la borne "), l(`${k}+0{,}5`), t(".")], lignes: [ligne(`z=\\dfrac{${k}+0{,}5-${nL(mu)}}{${nL(sigma)}}`, [ft("et non "), fl(`\\dfrac{${k}-${nL(mu)}}{${nL(sigma)}}`), ft(" comme dans la copie")])] },
    corrigeB: { utilise: [t("Petit exemple : "), l("P(X=50)"), t(" est la barre de 50, de 49,5 à 50,5 ; sans correction, l'aire sous une seule valeur serait nulle.")], lignes: [ligne("P(X=50)\\approx P(49{,}5\\le Y\\le 50{,}5)", "avec correction"), ligne("P(50\\le Y\\le 50)=0", "sans correction")] },
    corrigeC: {
      utilise: [t("On reprend avec la borne corrigée.")],
      lignes: [ligne(`z=\\dfrac{${nL(k! + 0.5)}-${nL(mu)}}{${nL(sigma)}}\\approx ${zL(zJuste)}`), ligne(`P(X\\le ${k})\\approx ${phiL(zJuste)}`), ligne(`=${p4L(juste)}`, "table")],
      verification: { utilise: [t("La correction ajoute une demi-barre : la probabilité augmente.")], lignes: [ligne(`${p4L(juste)}>${p4L(faux)}`)] },
    },
    preliminaires: [
      { ligne: [l("X"), t(" suit une loi binomiale ; on veut une estimation de "), l(`P(X\\le ${k})`), t(".")], regle: "données" },
      { ligne: [t("On vérifie d'abord les conditions du cours.")], regle: "méthode" },
      { ligne: [t("On note "), l("Y"), t(" la variable normale qui approche "), l("X"), t(".")], regle: "notation" },
    ],
  };
}

function copieCanonique(e: E): CopieDVA {
  switch (e.variante) {
    case "moyenne":
      return moyenne(e);
    case "ecartType":
      return ecartType(e);
    case "symetriePhi":
      return symetriePhi(e);
    case "regleUnCote":
      return regleUnCote(e);
    case "lambda":
      return lambdaScenario(e);
    case "complement":
      return complement(e);
    case "uniforme":
      return uniforme(e);
    case "coefficient":
      return coefficient(e);
    case "continuite":
      return continuite(e);
  }
}

/** Copie finale : `av` lignes justes (préliminaires puis lignes justes de la copie, les dernières
 * gardées) avant la ligne fausse. */
function assembler(c: CopieDVA, av: number): CopieDVA {
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

const CACHE = new WeakMap<E, CopieDVA>();
export function copie(e: E): CopieDVA {
  const enCache = CACHE.get(e);
  if (enCache) return enCache;
  const c = assembler(copieCanonique(e), e.d.av ?? 0);
  CACHE.set(e, c);
  return c;
}

export const nombreLignes = (e: E): number => copie(e).lignes.length;

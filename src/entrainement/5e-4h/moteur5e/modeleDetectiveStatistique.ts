import type { LigneCalcul } from "../../export/genererFeuilleExercices";
import { ligne } from "../../export/corrigeTableau";
import type { ExerciceDetectiveStat, VarianteDetectiveStat } from "../core5e/detectiveStatistique";
import type { Point2 } from "../core5e/statistiqueLotH2";
import { mayer, mediane, moindresCarres, resume, somme } from "../core5e/statistiqueLotH2";
import type { AideEcran, Frag, TableauDonnees } from "../ui5e/ecransTrigo.types";
import { lx, tx } from "../ui5e/ecransTrigo.types";
import { categorieR } from "../ui5e/formatModeliserPrevoir";
import { droiteL, egalOuEnviron, nL, nP, nPlus, nT } from "../ui5e/nombresStatLotH2";

/**
 * Modèle de `5gen81` « Détective d'erreurs : statistique à deux variables » : à partir des données de
 * l'instance, l'exercice, la copie de l'élève fictif (cohérente avec SON erreur), la ligne fausse, la
 * description juste et ses leurres, la valeur corrigée (droite, point moyen, r, ou conclusion à
 * choisir) et le contenu du corrigé (ligne refaite, règle du cours, résolution reprise). Une seule
 * source pour l'écran, le papier et le corrigé.
 */

type E = ExerciceDetectiveStat;
const t = tx;
const l = lx;

/* ----------------------------------------------------------------------------------------------
 * Contextes des erreurs d'interprétation
 * -------------------------------------------------------------------------------------------- */

export interface ContexteExtrapolation {
  texte: string;
  enteteX: string;
  enteteY: string;
  xs: number[];
  alpha: number;
  beta: number;
  bruit: number;
  decY: number;
  xLoin: number;
  /** Conclusion (fausse) de la copie, avec la valeur prévue. */
  conclusion: (y: string) => string;
  unite: string;
}

export const CONTEXTES_EXTRAPOLATION: ContexteExtrapolation[] = [
  {
    texte: "Le tableau donne le taux de mortalité infantile en Belgique (en décès pour 1 000 naissances) pour six périodes de cinq ans : x = 1 pour 1946-1950, x = 2 pour 1951-1955, …, x = 6 pour 1971-1975. Un élève doit estimer ce taux pour la période 2001-2005 (x = 12).",
    enteteX: "Période x", enteteY: "Taux (‰)", xs: [1, 2, 3, 4, 5, 6], alpha: -8.3, beta: 63, bruit: 2.5, decY: 1, xLoin: 12,
    conclusion: (y) => `Conclusion : en 2001-2005, le taux de mortalité infantile sera de ${y} ‰.`, unite: "‰",
  },
  {
    texte: "Le tableau donne la taille moyenne (en cm) d'un enfant selon son âge x (en années). Un élève doit estimer sa taille à 40 ans (x = 40).",
    enteteX: "Âge x (ans)", enteteY: "Taille (cm)", xs: [2, 4, 6, 8, 10], alpha: 6, beta: 77, bruit: 1.5, decY: 0, xLoin: 40,
    conclusion: (y) => `Conclusion : à 40 ans, cette personne mesurera environ ${y} cm.`, unite: "cm",
  },
  {
    texte: "Le tableau donne le prix de revente (en €) d'une voiture selon son âge x (en années). Un élève doit estimer son prix à 12 ans (x = 12).",
    enteteX: "Âge x (ans)", enteteY: "Prix (€)", xs: [1, 2, 3, 4, 5, 6], alpha: -2600, beta: 18000, bruit: 500, decY: -2, xLoin: 12,
    conclusion: (y) => `Conclusion : à 12 ans, la voiture vaudra ${y} €.`, unite: "€",
  },
  {
    texte: "Le tableau donne le nombre de jeux vendus par semaine par un magasin pendant les six premières semaines de sortie d'un jeu (x = numéro de la semaine). Un élève doit estimer les ventes de la semaine 104, deux ans après la sortie (x = 104).",
    enteteX: "Semaine x", enteteY: "Jeux vendus", xs: [1, 2, 3, 4, 5, 6], alpha: 35, beta: 120, bruit: 10, decY: 0, xLoin: 104,
    conclusion: (y) => `Conclusion : la semaine 104, le magasin vendra environ ${y} jeux.`, unite: "jeux",
  },
];

export interface ContexteCausalite {
  texte: string;
  x: string;
  y: string;
  r: string;
  cause: string;
  consequence: string;
  bonne: string;
  inverse: string;
}

export const CONTEXTES_CAUSALITE: ContexteCausalite[] = [
  {
    texte: "Dans huit villes, on relève le nombre de librairies x et le nombre de vols de vélos déclarés en un an y.",
    x: "le nombre de librairies", y: "le nombre de vols de vélos", r: "0{,}93",
    cause: "Les librairies provoquent des vols de vélos.", consequence: "Pour réduire les vols de vélos, il suffit de fermer des librairies.",
    bonne: "Corrélation ne signifie pas causalité : la population de la ville fait augmenter à la fois les librairies et les vols de vélos (cause commune).",
    inverse: "C'est l'inverse : ce sont les vols de vélos qui font ouvrir des librairies.",
  },
  {
    texte: "Chez des enfants de 6 à 12 ans, on relève la taille x (en cm) et le score y à un même test de lecture.",
    x: "la taille", y: "le score de lecture", r: "0{,}88",
    cause: "Grandir fait mieux lire.", consequence: "Pour mieux lire, il faut grandir plus vite.",
    bonne: "Corrélation ne signifie pas causalité : l'âge fait augmenter à la fois la taille et le niveau de lecture (cause commune).",
    inverse: "C'est l'inverse : lire beaucoup fait grandir.",
  },
  {
    texte: "Pendant un été, on relève chaque semaine les ventes de ventilateurs x et les ventes de glaces y d'un centre commercial.",
    x: "les ventes de ventilateurs", y: "les ventes de glaces", r: "0{,}9",
    cause: "Acheter un ventilateur donne envie de manger une glace.", consequence: "Pour vendre plus de glaces, il faut vendre plus de ventilateurs.",
    bonne: "Corrélation ne signifie pas causalité : la chaleur fait augmenter à la fois les ventes de ventilateurs et celles de glaces (cause commune).",
    inverse: "C'est l'inverse : manger des glaces pousse à acheter des ventilateurs.",
  },
  {
    texte: "Dans les communes d'une province, on relève le nombre d'églises x et le nombre de cafés y.",
    x: "le nombre d'églises", y: "le nombre de cafés", r: "0{,}9",
    cause: "Les églises font ouvrir des cafés.", consequence: "Pour avoir plus de cafés, une commune doit construire des églises.",
    bonne: "Corrélation ne signifie pas causalité : la taille de la commune fait augmenter à la fois le nombre d'églises et celui des cafés (cause commune).",
    inverse: "C'est l'inverse : ce sont les cafés qui font construire des églises.",
  },
];

/* ----------------------------------------------------------------------------------------------
 * Descriptions (écran 2)
 * -------------------------------------------------------------------------------------------- */

export const LEURRES: Record<VarianteDetectiveStat, string[]> = {
  mayerSansTri: ["mtEffectifs", "mtMedianes", "mtExtremes"],
  penteArrondie: ["paInverse", "paG2", "paPasG1"],
  medianeMoyenne: ["mmPasG", "mmN1", "mmTriY"],
  xyEchanges: ["xyInverse", "xyN1", "xyPasG"],
  sxAuLieuSigma: ["sxCov", "sxVariances", "sxBorne"],
  covSansN: ["cnSigma", "cnVariances", "cnPlusUn"],
  extrapolation: ["exCalcul", "exMayer", "exArrondi"],
  causalite: ["caForte", "caUn", "caSigne"],
};

/** Description (mini-syntaxe « $…$ » pour les formules). */
const DESCRIPTIONS: Record<string, string> = {
  mayerSansTri: "Les points n'ont pas été rangés par abscisses croissantes avant de former les deux groupes.",
  mtEffectifs: "Les deux groupes devaient contenir 2 et 4 points.",
  mtMedianes: "$G_1$ et $G_2$ se calculent avec les médianes de chaque groupe, pas avec les moyennes.",
  mtExtremes: "La droite de Mayer passe par le premier et le dernier point du tableau.",
  penteArrondie: "La pente a été arrondie trop tôt : b doit se calculer avec la valeur exacte de a (gardée en mémoire).",
  paInverse: "La pente se calcule par $\\dfrac{\\Delta x}{\\Delta y}$ et non par $\\dfrac{\\Delta y}{\\Delta x}$.",
  paG2: "b doit se calculer avec les coordonnées de $G_2$, jamais avec celles de $G_1$.",
  paPasG1: "La droite de Mayer ne passe pas par $G_1$.",
  medianeMoyenne: "Le point moyen se calcule avec les moyennes des x et des y, pas avec leurs médianes.",
  mmPasG: "La droite des moindres carrés ne passe pas toujours par le point moyen.",
  mmN1: "Les coordonnées de G se calculent en divisant par $n-1$.",
  mmTriY: "Il fallait ranger les y dans le même ordre que les x avant de calculer G.",
  xyEchanges: "$\\bar{x}$ et $\\bar{y}$ ont été échangés : $b=\\bar{y}-a\\,\\bar{x}$.",
  xyInverse: "La pente se calcule par $a=\\dfrac{V(x)}{\\operatorname{Cov}(x,y)}$.",
  xyN1: "La covariance se calcule en divisant par $n-1$.",
  xyPasG: "La droite des moindres carrés ne passe pas par le point moyen.",
  sxAuLieuSigma: "Les écarts-types ont été calculés en divisant par $n-1$ (valeur $S_x$ de la calculatrice) au lieu de $n$.",
  sxCov: "La covariance doit, elle aussi, être divisée par $n-1$.",
  sxVariances: "r se calcule avec les variances : $r=\\dfrac{\\operatorname{Cov}(x,y)}{V(x)\\,V(y)}$.",
  sxBorne: "Un coefficient de corrélation ne peut pas dépasser $0{,}80$.",
  covSansN: "La covariance est une moyenne : il faut diviser la somme des produits par n (un r plus grand que 1 trahit l'erreur).",
  cnSigma: "Les écarts-types doivent être calculés en divisant par $n-1$.",
  cnVariances: "r se calcule avec les variances : $r=\\dfrac{\\operatorname{Cov}(x,y)}{V(x)\\,V(y)}$.",
  cnPlusUn: "Il n'y a pas d'erreur de calcul : r dépasse 1 quand la corrélation est très forte.",
  extrapolation: "Un r proche de 1 ou de −1 ne garantit rien loin des données : la prévision est une extrapolation abusive.",
  exCalcul: "Le calcul de y est faux : il fallait remplacer x par la plus grande valeur du tableau.",
  exMayer: "Il fallait utiliser la droite de Mayer, plus sûre pour prévoir loin des données.",
  exArrondi: "La prévision est fiable, il fallait seulement l'arrondir davantage.",
  causalite: "Une forte corrélation ne prouve pas que l'une des grandeurs est la cause de l'autre.",
  caForte: "$r>0{,}80$ ne signifie pas que la corrélation est forte.",
  caUn: "On ne peut parler de corrélation que si $r=1$.",
  caSigne: "Le signe de r montre que les deux grandeurs varient en sens contraire.",
};

export function fragsMini(s: string): Frag[] {
  return s
    .split("$")
    .map((m, i) => (i % 2 ? l(m) : t(m)))
    .filter((f) => f.valeur !== "");
}

export const descriptionFragments = (id: string): Frag[] => fragsMini(DESCRIPTIONS[id] ?? id);

/* ----------------------------------------------------------------------------------------------
 * Copie
 * -------------------------------------------------------------------------------------------- */

export type ValeurCorrigee = { genre: "droite"; a: number; b: number } | { genre: "point"; x: number; y: number } | { genre: "r"; r: number } | { genre: "choix"; options: Frag[][] };

export interface BlocCorrigeStat {
  utilise: Frag[];
  lignes: LigneCalcul[];
}

export interface CopieDetectiveStat {
  enonce: Frag[];
  tableau: TableauDonnees | null;
  lignes: Frag[][];
  ligneFausse: number;
  regles: string[];
  regleCours: AideEcran;
  aideCorrection: AideEcran;
  valeur: ValeurCorrigee;
  /** Valeur (fausse) de la copie : une saisie qui la reprend reçoit `piege`. */
  valeurCopie?: ValeurCorrigee;
  piege: Frag[];
  corrigeA: BlocCorrigeStat;
  corrigeB: BlocCorrigeStat;
  corrigeC: BlocCorrigeStat;
}

interface Ligne {
  f: Frag[];
  regle: string;
}

interface Scenario {
  enonce: Frag[];
  tableau: TableauDonnees | null;
  avant: [Ligne, Ligne, Ligne];
  fausse: Ligne;
  apres: Ligne[];
  regleCours: AideEcran;
  aideCorrection: AideEcran;
  valeur: ValeurCorrigee;
  valeurCopie?: ValeurCorrigee;
  piege: Frag[];
  corrigeA: BlocCorrigeStat;
  corrigeB: BlocCorrigeStat;
  corrigeC: BlocCorrigeStat;
}

const pt = (q: Point2, d = 2) => `(${nL(q.x, d)}\\,;${nL(q.y, d)})`;
const listeL = (p: Point2[]) => p.map((q) => pt(q)).join(",\\ ");
const tableau = (p: Point2[], ex = "x", ey = "y", decY = 2): TableauDonnees => ({ horizontal: true, entetes: [[t(ex)], [t(ey)]], lignes: p.map((q) => [nT(q.x, 2), nT(q.y, decY)]) });
const sommeL = (v: number[]) => v.map((x, i) => (i > 0 && x >= 0 ? `+${nL(x, 2)}` : nL(x, 2))).join("");

function scenarioMayer(e: E): Scenario {
  const table = e.points;
  const bon = mayer(table);
  const faux = mayer(table, false);
  const s = resume(table);
  const g1L = (m: typeof bon) => `G_1=\\left(\\dfrac{${sommeL(m.groupe1.map((q) => q.x))}}{3}\\,;\\dfrac{${sommeL(m.groupe1.map((q) => q.y))}}{3}\\right)=${pt(m.g1)}`;
  const g2L = (m: typeof bon) => `G_2=\\left(\\dfrac{${sommeL(m.groupe2.map((q) => q.x))}}{3}\\,;\\dfrac{${sommeL(m.groupe2.map((q) => q.y))}}{3}\\right)=${pt(m.g2)}`;
  const aL = (m: typeof bon) => `a=\\dfrac{${nL(m.g2.y, 2)}-${nP(m.g1.y, 2)}}{${nL(m.g2.x, 2)}-${nP(m.g1.x, 2)}}=${nL(m.droite.a, 2)}`;
  const bL = (m: typeof bon) => `b=${nL(m.g1.y, 2)}-${nP(m.droite.a, 2)}\\cdot ${nP(m.g1.x, 2)}=${nL(m.droite.b, 2)}`;
  return {
    enonce: [t("Exercice : détermine une équation de la droite de Mayer de la série ci-dessous.")],
    tableau: tableau(table),
    avant: [
      { f: [t("La série compte "), l("n=6"), t(" points : deux groupes de 3 points.")], regle: "effectifs des groupes" },
      { f: [l(`\\bar{x}=\\dfrac{${nL(somme(table.map((q) => q.x)), 2)}}{6}${egalOuEnviron(s.mx, 2)}`), t(" et "), l(`\\bar{y}=\\dfrac{${nL(somme(table.map((q) => q.y)), 2)}}{6}${egalOuEnviron(s.my, 2)}`)], regle: "moyennes (point moyen G)" },
      { f: [t("La droite de Mayer passera par "), l(`G${pt({ x: s.mx, y: s.my })}`), t(".")], regle: "propriété : la droite de Mayer passe par G" },
    ],
    fausse: { f: [t("Groupe 1 : "), l(listeL(faux.groupe1)), t(" ; groupe 2 : "), l(listeL(faux.groupe2)), t(".")], regle: "partage en deux groupes" },
    apres: [
      { f: [l(g1L(faux))], regle: "point moyen du groupe 1" },
      { f: [l(g2L(faux))], regle: "point moyen du groupe 2" },
      { f: [l(aL(faux))], regle: "pente de (G₁G₂)" },
      { f: [l(bL(faux)), t(", donc "), l(droiteL(faux.droite.a, faux.droite.b, 2, 2))], regle: "ordonnée à l'origine" },
    ],
    regleCours: { texte: [t("Méthode de Mayer (cours, § 3) : on range d'abord les points par abscisses croissantes, puis on partage en deux groupes d'effectifs égaux (à une unité près), on calcule G₁ et G₂, la pente, puis b.")] },
    aideCorrection: { texte: [t("Points rangés par abscisses croissantes :")], latex: listeL(bon.groupe1.concat(bon.groupe2)) },
    valeur: { genre: "droite", a: bon.droite.a, b: bon.droite.b },
    valeurCopie: { genre: "droite", a: faux.droite.a, b: faux.droite.b },
    piege: [t("C'est la droite de la copie : range d'abord les points par abscisses croissantes, puis forme les groupes.")],
    corrigeA: {
      utilise: [t("Avant de partager la série, il faut ranger les points par abscisses croissantes.")],
      lignes: [ligne(listeL(bon.groupe1), "groupe 1 : les trois plus petites abscisses"), ligne(listeL(bon.groupe2), "groupe 2 : les trois autres")],
    },
    corrigeB: { utilise: [t("Droite de Mayer (cours, § 3) : tri selon x, deux groupes, points moyens G₁ et G₂, droite (G₁G₂).")], lignes: [] },
    corrigeC: { utilise: [t("On reprend la méthode avec les bons groupes.")], lignes: [ligne(g1L(bon)), ligne(g2L(bon)), ligne(aL(bon)), ligne(bL(bon)), ligne(droiteL(bon.droite.a, bon.droite.b, 2, 2), [t("vérification : passe par G")])] },
  };
}

function scenarioPente(e: E): Scenario {
  const g1 = e.g1!;
  const g2 = e.g2!;
  const ar = e.aArrondi!;
  const dy = g2.y - g1.y;
  const dx = g2.x - g1.x;
  const a = dy / dx;
  const b = g1.y - a * g1.x;
  const bc = g1.y - ar * g1.x;
  return {
    enonce: [t("Exercice : les points moyens des deux groupes d'une série sont "), l(`G_1${pt(g1)}`), t(" et "), l(`G_2${pt(g2)}`), t(". Détermine une équation de la droite de Mayer (coefficients au centième).")],
    tableau: null,
    avant: [
      { f: [t("La droite de Mayer est la droite "), l("(G_1G_2)"), t(".")], regle: "définition de la droite de Mayer" },
      { f: [l(`\\Delta y=${nL(g2.y, 2)}-${nP(g1.y, 2)}=${nL(dy, 2)}`), t(" et "), l(`\\Delta x=${nL(g2.x, 2)}-${nP(g1.x, 2)}=${nL(dx, 2)}`)], regle: "accroissements" },
      { f: [l(`a=\\dfrac{${nL(dy, 2)}}{${nL(dx, 2)}}\\approx ${nL(a, 4, true)}`)], regle: "pente Δy / Δx" },
    ],
    fausse: { f: [l(`b=y_1-a\\,x_1=${nL(g1.y, 2)}-${nL(ar, 2)}\\cdot ${nP(g1.x, 2)}=${nL(bc, 2)}`)], regle: "ordonnée à l'origine" },
    apres: [{ f: [t("Droite de Mayer : "), l(droiteL(ar, bc, 2, 2)), t(".")], regle: "équation" }],
    regleCours: { texte: [t("On garde la pente en mémoire (ou sous forme de fraction) pour calculer b : un arrondi trop tôt fausse l'ordonnée à l'origine (cours, § 3).")] },
    aideCorrection: { texte: [t("Avec la pente exacte :")], latex: `a=\\dfrac{${nL(dy, 2)}}{${nL(dx, 2)}}\\qquad b=${nL(g1.y, 2)}-\\dfrac{${nL(dy, 2)}}{${nL(dx, 2)}}\\cdot ${nP(g1.x, 2)}` },
    valeur: { genre: "droite", a, b },
    valeurCopie: { genre: "droite", a: ar, b: bc },
    piege: [t("C'est la droite de la copie : calcule b avec la pente exacte, pas avec "), l(nL(ar, 2)), t(".")],
    corrigeA: {
      utilise: [t("b se calcule avec la pente exacte.")],
      lignes: [ligne(`b=${nL(g1.y, 2)}-\\dfrac{${nL(dy, 2)}}{${nL(dx, 2)}}\\cdot ${nP(g1.x, 2)}${egalOuEnviron(b, 2)}`, `et non ${nT(bc, 2)} : la copie a utilisé a = ${nT(ar, 2)}`)],
    },
    corrigeB: { utilise: [t("Un arrondi intermédiaire se propage : on garde les valeurs exactes jusqu'au résultat final.")], lignes: [ligne(`\\left(\\dfrac{${nL(dy, 2)}}{${nL(dx, 2)}}-${nL(ar, 2)}\\right)\\cdot ${nP(g1.x, 2)}\\approx ${nL((a - ar) * g1.x, 2, true)}`, "erreur commise sur b")] },
    corrigeC: { utilise: [t("On reprend avec la pente exacte.")], lignes: [ligne(`a=\\dfrac{${nL(dy, 2)}}{${nL(dx, 2)}}\\approx ${nL(a, 2, true)}`), ligne(`b=${nL(g1.y, 2)}-\\dfrac{${nL(dy, 2)}}{${nL(dx, 2)}}\\cdot ${nP(g1.x, 2)}\\approx ${nL(b, 2, true)}`), ligne(`y\\approx ${nL(a, 2, true)}x${nPlus(b, 2, true)}`, "vérification : passe par G₂")] },
  };
}

function scenarioMediane(e: E): Scenario {
  const p = e.points;
  const s = resume(p);
  const d = moindresCarres(p);
  const xs = p.map((q) => q.x);
  const ys = [...p.map((q) => q.y)].sort((u, v) => u - v);
  const xm = mediane(xs);
  const ym = mediane(ys);
  const val = d.a * xm + d.b;
  return {
    enonce: [t("Exercice : la droite des moindres carrés de la série ci-dessous est "), l(droiteL(d.a, d.b, 2, 2)), t(". Calcule le point moyen G et vérifie que cette droite passe par G.")],
    tableau: tableau(p),
    avant: [
      { f: [t("La droite des moindres carrés passe toujours par le point moyen G.")], regle: "propriété du cours" },
      { f: [t("La série compte "), l("n=6"), t(" points.")], regle: "effectif" },
      { f: [t("Les abscisses sont déjà rangées dans l'ordre croissant.")], regle: "lecture du tableau" },
    ],
    fausse: { f: [l(`G=\\left(\\dfrac{${nL(xs[2]!, 2)}+${nL(xs[3]!, 2)}}{2}\\,;\\dfrac{${nL(ys[2]!, 2)}+${nL(ys[3]!, 2)}}{2}\\right)=${pt({ x: xm, y: ym })}`)], regle: "coordonnées du point moyen" },
    apres: [
      { f: [l(`${nL(d.a, 2)}\\cdot ${nP(xm, 2)}${nPlus(d.b, 2)}=${nL(val, 4)}\\neq ${nL(ym, 2)}`)], regle: "vérification" },
      { f: [t("La droite ne passe pas par G : l'équation donnée est fausse.")], regle: "conclusion" },
    ],
    regleCours: { texte: [t("Point moyen (cours, § 1) :")], latex: "G(\\bar{x}\\,;\\bar{y})\\quad\\text{avec}\\quad\\bar{x}=\\dfrac{x_1+\\cdots+x_n}{n},\\ \\bar{y}=\\dfrac{y_1+\\cdots+y_n}{n}" },
    aideCorrection: { texte: [t("Ici :")], latex: `\\bar{x}=\\dfrac{${sommeL(xs)}}{6}\\qquad\\bar{y}=\\dfrac{${sommeL(p.map((q) => q.y))}}{6}` },
    valeur: { genre: "point", x: s.mx, y: s.my },
    valeurCopie: { genre: "point", x: xm, y: ym },
    piege: [t("Ce sont les médianes de la copie : le point moyen utilise les moyennes.")],
    corrigeA: {
      utilise: [t("Les coordonnées de G sont des moyennes.")],
      lignes: [ligne(`\\bar{x}=\\dfrac{${sommeL(xs)}}{6}=${nL(s.mx, 2)}`, `et non ${nT(xm, 2)} (médiane)`), ligne(`\\bar{y}=\\dfrac{${sommeL(p.map((q) => q.y))}}{6}=${nL(s.my, 2)}`, `et non ${nT(ym, 2)} (médiane)`)],
    },
    corrigeB: { utilise: [t("Moyenne et médiane ne coïncident pas en général : G est le point (moyenne des x ; moyenne des y).")], lignes: [] },
    corrigeC: { utilise: [t("On vérifie avec le vrai point moyen.")], lignes: [ligne(`G${pt({ x: s.mx, y: s.my })}`), ligne(`${nL(d.a, 2)}\\cdot ${nP(s.mx, 2)}${nPlus(d.b, 2)}=${nL(d.a * s.mx + d.b, 2)}=\\bar{y}`, "la droite passe bien par G")] },
  };
}

function scenarioXY(e: E): Scenario {
  const p = e.points;
  const s = resume(p);
  const cov = s.cov;
  const v = s.sx * s.sx;
  const bc = s.mx - s.a * s.my;
  return {
    enonce: [t("Exercice : détermine, à la main, la droite des moindres carrés de la série ci-dessous.")],
    tableau: tableau(p),
    avant: [
      { f: [l(`\\bar{x}=\\dfrac{${sommeL(p.map((q) => q.x))}}{5}=${nL(s.mx, 2)}`)], regle: "moyenne des x" },
      { f: [l(`\\bar{y}=\\dfrac{${sommeL(p.map((q) => q.y))}}{5}=${nL(s.my, 2)}`)], regle: "moyenne des y" },
      { f: [l(`a=\\dfrac{\\operatorname{Cov}(x,y)}{V(x)}=\\dfrac{${nL(cov, 2)}}{${nL(v, 2)}}=${nL(s.a, 2)}`)], regle: "pente des moindres carrés" },
    ],
    fausse: { f: [l(`b=\\bar{x}-a\\,\\bar{y}=${nL(s.mx, 2)}-${nP(s.a, 2)}\\cdot ${nP(s.my, 2)}=${nL(bc, 2)}`)], regle: "ordonnée à l'origine" },
    apres: [{ f: [t("Droite des moindres carrés : "), l(droiteL(s.a, bc, 2, 2)), t(".")], regle: "équation" }],
    regleCours: { texte: [t("La droite des moindres carrés passe par G(x̄ ; ȳ) (cours, § 4) :")], latex: "\\bar{y}=a\\,\\bar{x}+b\\iff b=\\bar{y}-a\\,\\bar{x}" },
    aideCorrection: { texte: [t("Ici :")], latex: `b=${nL(s.my, 2)}-${nP(s.a, 2)}\\cdot ${nP(s.mx, 2)}` },
    valeur: { genre: "droite", a: s.a, b: s.b },
    valeurCopie: { genre: "droite", a: s.a, b: bc },
    piege: [t("C'est la droite de la copie : "), l("b=\\bar{y}-a\\,\\bar{x}"), t(".")],
    corrigeA: { utilise: [t("La droite passe par G : on remplace x par x̄ et y par ȳ.")], lignes: [ligne(`b=\\bar{y}-a\\,\\bar{x}=${nL(s.my, 2)}-${nP(s.a, 2)}\\cdot ${nP(s.mx, 2)}=${nL(s.b, 2)}`, `et non ${nT(bc, 2)}`)] },
    corrigeB: { utilise: [t("Dans "), l("\\bar{y}=a\\,\\bar{x}+b"), t(", x̄ est multiplié par la pente et ȳ est isolé.")], lignes: [] },
    corrigeC: { utilise: [t("On reprend à partir de b.")], lignes: [ligne(`b=${nL(s.b, 2)}`), ligne(droiteL(s.a, s.b, 2, 2), "vérification : passe par G")] },
  };
}

function scenarioR(e: E, sansN: boolean): Scenario {
  const p = e.points;
  const s = resume(p);
  const SX = somme(p.map((q) => (q.x - s.mx) ** 2));
  const SY = somme(p.map((q) => (q.y - s.my) ** 2));
  const SXY = somme(p.map((q) => (q.x - s.mx) * (q.y - s.my)));
  const moy: Ligne = { f: [l(`\\bar{x}=${nL(s.mx, 2)}`), t(" et "), l(`\\bar{y}=${nL(s.my, 2)}`)], regle: "moyennes" };
  const covJuste: Ligne = { f: [l(`\\operatorname{Cov}(x,y)=\\dfrac{${nL(SXY, 2)}}{5}=${nL(SXY / 5, 2)}`)], regle: "covariance" };
  const sommes: Ligne = { f: [l(`\\sum(x_i-\\bar{x})^2=${nL(SX, 2)}`), t(" et "), l(`\\sum(y_i-\\bar{y})^2=${nL(SY, 2)}`)], regle: "sommes des carrés des écarts" };
  const sxJ: Ligne = { f: [l(`\\sigma_x=\\sqrt{\\dfrac{${nL(SX, 2)}}{5}}\\approx ${nL(s.sx, 3, true)}`)], regle: "écart-type des x" };
  const syJ: Ligne = { f: [l(`\\sigma_y=\\sqrt{\\dfrac{${nL(SY, 2)}}{5}}\\approx ${nL(s.sy, 3, true)}`)], regle: "écart-type des y" };
  const signe = s.r < 0 ? "<-0{,}98" : ">0{,}98";
  if (sansN) {
    const rc = SXY / (Math.round(s.sx * 1000) / 1000) / (Math.round(s.sy * 1000) / 1000);
    return {
      enonce: [t("Exercice : calcule le coefficient de corrélation linéaire r de la série ci-dessous et interprète-le.")],
      tableau: tableau(p),
      avant: [moy, sxJ, syJ],
      fausse: { f: [l(`\\operatorname{Cov}(x,y)=\\sum(x_i-\\bar{x})(y_i-\\bar{y})=${nL(SXY, 2)}`)], regle: "covariance" },
      apres: [
        { f: [l(`r=\\dfrac{${nL(SXY, 2)}}{${nL(s.sx, 3, true)}\\cdot ${nL(s.sy, 3, true)}}\\approx ${nL(rc, 2, true)}`)], regle: "coefficient de corrélation" },
        { f: [l(`r${signe}`), t(" : corrélation très forte.")], regle: "interprétation" },
      ],
      regleCours: { texte: [t("La covariance est la moyenne des produits des écarts (cours, § 5) ; et toujours −1 ≤ r ≤ 1 :")], latex: "\\operatorname{Cov}(x,y)=\\dfrac{1}{n}\\sum(x_i-\\bar{x})(y_i-\\bar{y})" },
      aideCorrection: { texte: [t("Ici :")], latex: `r=\\dfrac{${nL(SXY, 2)}/5}{${nL(s.sx, 3, true)}\\cdot ${nL(s.sy, 3, true)}}` },
      valeur: { genre: "r", r: s.r },
      valeurCopie: { genre: "r", r: rc },
      piege: [t("C'est le r de la copie, qui dépasse 1 : divise la somme des produits par n = 5.")],
      corrigeA: { utilise: [t("La covariance divise la somme des produits par n.")], lignes: [ligne(`\\operatorname{Cov}(x,y)=\\dfrac{${nL(SXY, 2)}}{5}=${nL(SXY / 5, 2)}`, `et non ${nT(SXY, 2)}`)] },
      corrigeB: { utilise: [t("Un coefficient de corrélation est toujours compris entre −1 et 1 : un r plus grand que 1 (en valeur absolue) signale une erreur de calcul.")], lignes: [] },
      corrigeC: { utilise: [t("On reprend avec la bonne covariance.")], lignes: [ligne(`r=\\dfrac{${nL(SXY / 5, 2)}}{\\sqrt{\\dfrac{${nL(SX, 2)}}{5}}\\cdot\\sqrt{\\dfrac{${nL(SY, 2)}}{5}}}\\approx ${nL(s.r, 2, true)}`, `corrélation ${categorieR(s.r)}`)] },
    };
  }
  const sx4 = Math.sqrt(SX / 4);
  const sy4 = Math.sqrt(SY / 4);
  const rc = SXY / 5 / (Math.round(sx4 * 1000) / 1000) / (Math.round(sy4 * 1000) / 1000);
  return {
    enonce: [t("Exercice : calcule le coefficient de corrélation linéaire r de la série ci-dessous et interprète-le.")],
    tableau: tableau(p),
    avant: [moy, covJuste, sommes],
    fausse: { f: [l(`\\sigma_x=\\sqrt{\\dfrac{${nL(SX, 2)}}{4}}\\approx ${nL(sx4, 3, true)}`), t(" et "), l(`\\sigma_y=\\sqrt{\\dfrac{${nL(SY, 2)}}{4}}\\approx ${nL(sy4, 3, true)}`)], regle: "écarts-types" },
    apres: [
      { f: [l(`r=\\dfrac{${nL(SXY / 5, 2)}}{${nL(sx4, 3, true)}\\cdot ${nL(sy4, 3, true)}}\\approx ${nL(rc, 2, true)}`)], regle: "coefficient de corrélation" },
      { f: [t(`Corrélation ${categorieR(rc)}.`)], regle: "interprétation" },
    ],
    regleCours: { texte: [t("Dans le cours (comme en 4e), l'écart-type divise par n (σx de la calculatrice, pas Sx) :")], latex: "\\sigma_x=\\sqrt{\\dfrac{1}{n}\\sum(x_i-\\bar{x})^2}" },
    aideCorrection: { texte: [t("Ici :")], latex: `\\sigma_x=\\sqrt{\\dfrac{${nL(SX, 2)}}{5}}\\qquad\\sigma_y=\\sqrt{\\dfrac{${nL(SY, 2)}}{5}}` },
    valeur: { genre: "r", r: s.r },
    valeurCopie: { genre: "r", r: rc },
    piege: [t("C'est le r de la copie : les écarts-types se calculent en divisant par n = 5.")],
    corrigeA: { utilise: [t("Les écarts-types divisent par n = 5, pas par n − 1 = 4.")], lignes: [ligne(`\\sigma_x=\\sqrt{\\dfrac{${nL(SX, 2)}}{5}}\\approx ${nL(s.sx, 3, true)}`, `et non ${nT(sx4, 3, true)}`), ligne(`\\sigma_y=\\sqrt{\\dfrac{${nL(SY, 2)}}{5}}\\approx ${nL(s.sy, 3, true)}`, `et non ${nT(sy4, 3, true)}`)] },
    corrigeB: { utilise: [t("La calculatrice affiche Sx (division par n − 1) et σx (division par n) : le cours prend σx.")], lignes: [] },
    corrigeC: { utilise: [t("On reprend avec les bons écarts-types.")], lignes: [ligne(`r=\\dfrac{${nL(SXY / 5, 2)}}{\\sqrt{\\dfrac{${nL(SX, 2)}}{5}}\\cdot\\sqrt{\\dfrac{${nL(SY, 2)}}{5}}}\\approx ${nL(s.r, 2, true)}`, `corrélation ${categorieR(s.r)} (et non ${categorieR(rc)})`)] },
  };
}

const OPTIONS_EXTRAPOLATION = (_c: ContexteExtrapolation, xs: number[]): string[] => [
  `On extrapole très loin des données (x de ${nT(Math.min(...xs), 2)} à ${nT(Math.max(...xs), 2)}) : rien ne garantit que la tendance continue, la prévision n'est pas fiable.`,
  "La prévision est fiable, mais il faut l'arrondir à l'unité.",
  "Il faut refaire la prévision avec la droite de Mayer, plus fiable loin des données.",
  "La prévision serait fiable si r valait exactement 1 ou −1.",
];
void CONTEXTES_EXTRAPOLATION;

function scenarioExtrapolation(e: E): Scenario {
  const c = CONTEXTES_EXTRAPOLATION[e.contexte!]!;
  const s = resume(e.points);
  const a = Math.round(s.a * 100) / 100;
  const b = Math.round(s.b * 100) / 100;
  const X = e.xLoin!;
  const Y = a * X + b;
  const yT = nT(Y, 2);
  const rL = nL(s.r, 2, true);
  const fort = Math.abs(s.r) >= 0.98 ? "très forte" : "forte";
  const opts = OPTIONS_EXTRAPOLATION(c, e.points.map((q) => q.x));
  return {
    enonce: [t(`Exercice : ${c.texte.charAt(0).toLowerCase()}${c.texte.slice(1)} La droite des moindres carrés est `), l(droiteL(a, b, 2, 2)), t(" et "), l(`r\\approx ${rL}`), t(".")],
    tableau: tableau(e.points, c.enteteX, c.enteteY, c.decY < 0 ? 0 : c.decY),
    avant: [
      { f: [t("La droite des moindres carrés est "), l(droiteL(a, b, 2, 2)), t(".")], regle: "équation donnée" },
      { f: [l(`r\\approx ${rL}`), t(` : corrélation ${fort}, la droite résume bien les données du tableau.`)], regle: "interprétation de r" },
      { f: [t("Pour "), l(`x=${nL(X, 2)}`), t(" : "), l(`y=${nL(a, 2)}\\cdot ${nP(X, 2)}${nPlus(b, 2)}=${nL(Y, 2)}`), t(".")], regle: "calcul de la prévision" },
    ],
    fausse: { f: [t(`Comme r est proche de ${s.r < 0 ? "−1" : "1"}, cette prévision est fiable.`)], regle: "fiabilité de la prévision" },
    apres: [{ f: [t(c.conclusion(yT))], regle: "conclusion" }],
    regleCours: { texte: [t("Interpolation et extrapolation (cours, § 2 et § 6) : un bon r dit que la droite résume bien les données ; loin de ces données, rien ne garantit que la tendance continue.")] },
    aideCorrection: { texte: [t(`Compare x = ${nT(X, 2)} à l'intervalle des x du tableau, et regarde si le résultat est seulement possible.`)] },
    valeur: { genre: "choix", options: opts.map(fragsMini) },
    piege: [],
    corrigeA: { utilise: [t("Les lignes qui précèdent sont justes (équation, r, calcul) ; c'est la conclusion « fiable » qui est fausse.")], lignes: [ligne(`${nL(X, 2)}\\notin[${nL(Math.min(...e.points.map((q) => q.x)), 2)}\\,;${nL(Math.max(...e.points.map((q) => q.x)), 2)}]`, "extrapolation lointaine")] },
    corrigeB: { utilise: [t("r mesure l'alignement des points du tableau, pas la validité de la droite au-delà.")], lignes: [] },
    corrigeC: { utilise: [t("Conclusion corrigée :")], lignes: [ligne(`y\\approx ${nL(Y, 2)}`, `en ${c.unite} : valeur calculée, mais sans valeur de prévision`)] },
  };
}

const OPTIONS_CAUSALITE = (c: ContexteCausalite): string[] => [c.bonne, "C'est exact : r est supérieur à 0,80, donc l'une des grandeurs est la cause de l'autre.", c.inverse, "On ne peut conclure à une causalité que si r vaut exactement 1."];

function scenarioCausalite(e: E): Scenario {
  const c = CONTEXTES_CAUSALITE[e.contexte!]!;
  const opts = OPTIONS_CAUSALITE(c);
  return {
    enonce: [t(`Exercice : ${c.texte.charAt(0).toLowerCase()}${c.texte.slice(1)} On trouve `), l(`r\\approx ${c.r}`), t(". Interprète ce résultat.")],
    tableau: null,
    avant: [
      { f: [l(`r\\approx ${c.r}`)], regle: "valeur donnée" },
      { f: [l(`r>0{,}80`), t(" : la corrélation est forte.")], regle: "tableau d'interprétation" },
      { f: [t(`r est positif : ${c.x} et ${c.y} augmentent ensemble.`)], regle: "signe de r" },
    ],
    fausse: { f: [t(`Donc ${c.cause.charAt(0).toLowerCase()}${c.cause.slice(1)}`)], regle: "conclusion sur la cause" },
    apres: [{ f: [t(c.consequence)], regle: "conséquence pratique" }],
    regleCours: { texte: [t("Corrélation ne signifie pas causalité (cours, § 6) : une troisième grandeur peut faire varier les deux (cause commune).")] },
    aideCorrection: { texte: [t("Cherche une grandeur qui, dans cette situation, ferait augmenter les deux en même temps.")] },
    valeur: { genre: "choix", options: opts.map(fragsMini) },
    piege: [],
    corrigeA: { utilise: [t("Les lignes qui précèdent lisent correctement r ; la ligne « donc … provoque … » conclut à une cause sans raison.")], lignes: [] },
    corrigeB: { utilise: [t("Une forte corrélation peut venir d'une cause commune, d'une coïncidence ou d'une causalité inverse.")], lignes: [] },
    corrigeC: { utilise: [t("Conclusion corrigée :")], lignes: [] },
  };
}

function scenario(e: E): Scenario {
  switch (e.variante) {
    case "mayerSansTri":
      return scenarioMayer(e);
    case "penteArrondie":
      return scenarioPente(e);
    case "medianeMoyenne":
      return scenarioMediane(e);
    case "xyEchanges":
      return scenarioXY(e);
    case "sxAuLieuSigma":
      return scenarioR(e, false);
    case "covSansN":
      return scenarioR(e, true);
    case "extrapolation":
      return scenarioExtrapolation(e);
    case "causalite":
      return scenarioCausalite(e);
  }
}

export function copie(e: E): CopieDetectiveStat {
  const s = scenario(e);
  const avant = s.avant.slice(3 - e.av);
  const lignes = [...avant, s.fausse, ...s.apres];
  return {
    enonce: s.enonce,
    tableau: s.tableau,
    lignes: lignes.map((x) => x.f),
    ligneFausse: avant.length,
    regles: lignes.map((x) => x.regle),
    regleCours: s.regleCours,
    aideCorrection: s.aideCorrection,
    valeur: s.valeur,
    valeurCopie: s.valeurCopie,
    piege: s.piege,
    corrigeA: s.corrigeA,
    corrigeB: s.corrigeB,
    corrigeC: s.corrigeC,
  };
}

export const nombreLignes = (e: E): number => copie(e).lignes.length;

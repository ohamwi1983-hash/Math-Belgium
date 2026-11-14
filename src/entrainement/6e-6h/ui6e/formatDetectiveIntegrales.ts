import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { ExerciceDetectiveIntegrales, IdDescriptionIntegrales, TypeErreurIntegrales, ValeurLigne } from "../core6e/detectiveIntegrales.types";
import { souderPonctuation } from "../../4e/ui/formatDetectiveVecteurs";
import {
  INTERVALLE_NEGATIF,
  POINTS_G2,
  POINTS_L2,
  SCENARIOS,
  bornesG1,
  bornesL1,
  copieEleve,
  descriptionCorrecte,
  fonctionLatex,
  indiceLigneFausse,
  latexValeur,
  typeErreur,
  valeursAttendues,
} from "../moteur6e/modeleDetectiveIntegrales";

/**
 * Textes de 6gen84 (écran ET papier : une seule source). Formules toujours en LaTeX, jamais au
 * clavier ; notation du chapitre 4 (`\int_a^b f(x)\,dx`, crochets de primitive, `\ln|x|`, méthode
 * des disques, u.a.).
 */

const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

export { souderPonctuation };

export const TITRES_ECRANS = ["La ligne fausse", "L'erreur commise", "La correction"];

export const CONSIGNE_GENERALE = "Une ligne de cette résolution est fausse. Trouve-la, explique l'erreur et corrige la résolution.";

// ---------------------------------------------------------------------------------------------
// Énoncé et copie
// ---------------------------------------------------------------------------------------------

/** Ce que l'élève fictif devait faire. */
export function enonceExercice(e: ExerciceDetectiveIntegrales): FragmentConsigne[] {
  return souderPonctuation(enonceBrut(e));
}

function enonceBrut(e: ExerciceDetectiveIntegrales): FragmentConsigne[] {
  const d = e.donnees;
  const f = l(`f(x) = ${fonctionLatex(e)}`);
  switch (e.scenario) {
    case "A1":
      return [t("On pose "), f, t(". L'élève doit calculer "), l(`\\int_0^{\\frac{\\pi}{${2 * d.k!}}} f(x)\\,dx`), t(".")];
    case "A2":
      return [t("On pose "), f, t(". L'élève doit calculer "), l("\\int_0^1 f(x)\\,dx"), t(".")];
    case "L1": {
      const { bas, haut } = bornesL1(e);
      return [t("On pose "), f, t(". L'élève doit calculer "), l(`\\int_{${bas}}^{${haut}} f(x)\\,dx`), t(".")];
    }
    case "L2":
      return [t("On pose "), f, t(" sur "), l(INTERVALLE_NEGATIF), t(". L'élève doit déterminer la primitive F de f sur cet intervalle telle que "), l(`F(${POINTS_L2[d.p!]}) = ${d.y}`), t(".")];
    case "G1": {
      const { a, b } = bornesG1(e);
      return [t("On pose "), f, t(". L'élève doit calculer "), l(`\\int_{${a.l}}^{${b.l}} f(x)\\,dx`), t(".")];
    }
    case "G2":
      return [t("On pose "), f, t(". L'élève doit déterminer la primitive F de f telle que "), l(`F\\left(${POINTS_G2[d.j!]!.l}\\right) = ${d.y}`), t(".")];
    case "R1":
      return [t("On pose "), f, t(". L'élève doit calculer l'aire de la région comprise entre la courbe de f, l'axe des abscisses et les droites "), l("x = 0"), t(" et "), l(`x = ${d.m}`), t(".")];
    case "R2":
      return [t("On pose "), f, t(" et "), l("g(x) = x^2"), t(". L'élève doit calculer l'aire de la région comprise entre les courbes de f et de g, et les droites "), l("x = 0"), t(" et "), l(`x = ${d.m}`), t(".")];
    case "V1":
    case "V2":
      return [t("On pose "), f, t(". L'élève doit calculer le volume du solide engendré par la rotation, autour de l'axe des abscisses, de la région sous la courbe de f sur "), l(`[0;${d.h}]`), t(".")];
    case "B1":
      return [t("On pose "), f, t(". L'élève doit calculer la valeur moyenne de f sur "), l(`[${d.a};${d.b}]`), t(".")];
    case "C1":
      return [t("On pose "), f, t(". L'élève doit déterminer la primitive F de f telle que "), l(`F(${d.x}) = ${d.y}`), t(".")];
    case "C2":
      return [
        t("Un mobile a une accélération "),
        l(`a(t) = ${fonctionLatex(e)}`),
        t(" (en m/s², t en secondes) et une vitesse initiale "),
        l(`v(0) = ${d.v}`),
        t(" m/s. L'élève doit calculer sa vitesse après "),
        l(`${d.T}`),
        t(" secondes."),
      ];
  }
}

export function lignesCopie(e: ExerciceDetectiveIntegrales): FragmentConsigne[][] {
  return copieEleve(e).map(souderPonctuation);
}

// ---------------------------------------------------------------------------------------------
// Valeurs (écran 3, fiche, corrigé)
// ---------------------------------------------------------------------------------------------

/** Une valeur, telle qu'on l'écrit dans une réponse (« Aire = 2 u.a. », « F(x) = … »). */
export function valeurFragments(v: ValeurLigne): FragmentConsigne[] {
  if (v.genre === "fonction") return [l(`${v.quantite} = ${v.latex}${v.avecC ? " + C" : ""}`)];
  const prefixe = v.prefixe.map((f) => (f.type === "texte" ? t(`${f.valeur} `) : l(`${f.valeur} ${latexValeur(v)}`)));
  const avecValeur = v.prefixe.some((f) => f.type === "latex") ? prefixe : [...prefixe, l(latexValeur(v))];
  return v.unite ? [...avecValeur, t(` ${v.unite}`)] : avecValeur;
}

/** Libellé de chaque valeur demandée à l'écran 3. */
export function libellesValeurs(e: ExerciceDetectiveIntegrales): FragmentConsigne[][] {
  const n = indiceLigneFausse(e) + 1;
  const valeurs = valeursAttendues(e);
  return valeurs.map((v, i) => {
    if (i === 0 && valeurs.length > 1) {
      if (v.genre === "fonction" && v.aConstantePres) return [t(`Ligne ${n} corrigée (une primitive suffit) :`)];
      if (v.genre === "fonction" && v.quantite === "[f(x)]^2") return [t(`Ligne ${n} corrigée — la fonction à intégrer :`)];
      return [t(`Ligne ${n} corrigée :`)];
    }
    return [t("Résultat final corrigé :")];
  });
}

/** Message de l'écran 3 quand une valeur est fausse. */
export function messagesARevoir(e: ExerciceDetectiveIntegrales): string[] {
  const n = indiceLigneFausse(e) + 1;
  const valeurs = valeursAttendues(e);
  return valeurs.map((_, i) => (i === 0 && valeurs.length > 1 ? `La ligne ${n} corrigée est à revoir.` : "Le résultat final est à revoir."));
}

/** Rappel de saisie (texte brut : la syntaxe clavier est précisément ce qu'il faut taper). */
export function aideSaisie(e: ExerciceDetectiveIntegrales): string {
  const fonctions = valeursAttendues(e).some((v) => v.genre === "fonction");
  const base = "Écris des valeurs exactes : fraction (7/3), pi, e, ln(2), rac(3) ou √3, valeur absolue |x|.";
  return fonctions ? `${base} Une fonction s'écrit avec x (ou t), par exemple 2sin(3x) ou 3ln|x|.` : base;
}

// ---------------------------------------------------------------------------------------------
// Consignes des écrans
// ---------------------------------------------------------------------------------------------

export function consignesEcrans(e: ExerciceDetectiveIntegrales): FragmentConsigne[][] {
  const n = indiceLigneFausse(e) + 1;
  const correctionC =
    valeursAttendues(e).length > 1
      ? [t(`Corrige la copie : donne la bonne valeur de la ligne ${n}, puis le résultat final correct (valeurs exactes).`)]
      : [t(`Corrige la copie : reprends la résolution à partir de la ligne ${n} et donne le résultat final correct (valeur exacte).`)];
  return [[t("Quelle ligne de la copie est fausse ?")], [t(`Quelle erreur l'élève a-t-il commise à la ligne ${n} ?`)], correctionC];
}

// ---------------------------------------------------------------------------------------------
// Descriptions d'erreur (écran 2)
// ---------------------------------------------------------------------------------------------

export function descriptionFragments(id: IdDescriptionIntegrales, e: ExerciceDetectiveIntegrales): FragmentConsigne[] {
  return souderPonctuation(descriptionBrute(id, e));
}

function descriptionBrute(id: IdDescriptionIntegrales, e: ExerciceDetectiveIntegrales): FragmentConsigne[] {
  const d = e.donnees;
  const coefInterieur = e.scenario === "A1" ? d.k! : d.a ?? 2;
  switch (id) {
    case "affine":
      return [
        t("La dérivée intérieure est oubliée : une primitive de "),
        l("g(ax + b)"),
        t(" est "),
        l("\\dfrac{1}{a}G(ax + b)"),
        t(", il fallait donc diviser par "),
        l(`${coefInterieur}`),
        t("."),
      ];
    case "lnAbs":
      return [t("La valeur absolue est oubliée : une primitive de "), l("\\dfrac{1}{x}"), t(" est "), l("\\ln|x|"), t(", définie aussi pour "), l("x < 0"), t(" (où elle vaut "), l("\\ln(-x)"), t(").")];
    case "signeSin":
      return [t("Le signe est faux : une primitive de "), l("\\sin(x)"), t(" est "), l("-\\cos(x)"), t(", et non "), l("\\cos(x)"), t(".")];
    case "signeCos":
      return [t("Le signe est faux : une primitive de "), l("\\cos(x)"), t(" est "), l("\\sin(x)"), t(", et non "), l("-\\sin(x)"), t(".")];
    case "aireRacines":
      return [t("L'intervalle n'est pas découpé en "), l(`x = ${d.k}`), t(", où f change de signe : l'intégrale compense la partie sous l'axe et la partie au-dessus, ce n'est pas l'aire.")];
    case "aireIntersections":
      return [t("L'intervalle n'est pas découpé en "), l(`x = ${d.k}`), t(", où les courbes se croisent : après ce point, c'est "), l("x^2"), t(" qui est au-dessus.")];
    case "volumeCarre":
      return [t("Le carré est oublié : la méthode des disques intègre "), l("[f(x)]^2"), t(", car un disque de rayon "), l("f(x)"), t(" a pour aire "), l("\\pi[f(x)]^2"), t(".")];
    case "volumePi":
      return [t("Le facteur "), l("\\pi"), t(" est oublié : "), l("V = \\pi\\int_a^b [f(x)]^2\\,dx"), t(".")];
    case "bornes":
      return [t("Les bornes sont inversées : "), l("\\int_a^b f(x)\\,dx = F(b) - F(a)"), t(", borne supérieure d'abord.")];
    case "constanteIsolee":
      return [t("La constante est mal isolée : un terme qui change de membre change de signe, donc "), l("a + C = y_0 \\iff C = y_0 - a"), t(".")];
    case "constanteOubliee":
      return [t("La constante d'intégration est oubliée : "), l(`v(t) = ${d.k === 1 ? "" : d.k}t^2 + C`), t(", et c'est la condition "), l(`v(0) = ${d.v}`), t(" qui fixe C.")];
    // --- leurres (toujours faux pour la ligne visée) ---
    case "multiplierParA":
      return [t("Il fallait multiplier par le coefficient intérieur : une primitive de "), l("g(ax + b)"), t(" est "), l("a\\,G(ax + b)"), t(".")];
    case "exposant":
      return [t("L'exposant ne devait pas augmenter : une primitive de "), l("u^n"), t(" est "), l("\\dfrac{u^n}{n}"), t(".")];
    case "developper":
      return [t("La règle de "), l("f(ax + b)"), t(" ne s'applique pas à une puissance : il fallait d'abord développer "), l(`(${d.a}x + ${d.b})^{${d.n}}`), t(".")];
    case "constanteIntegrale":
      return [t("La constante C est oubliée dans la primitive : sans elle, l'intégrale ne peut pas être calculée.")];
    case "signeCosFaux":
      return [t("Le signe est faux : une primitive de "), l("\\cos(kx)"), t(" s'écrit avec "), l("-\\sin(kx)"), t(".")];
    case "deriveeInverse":
      return [t("Une primitive de "), l("\\dfrac{1}{x}"), t(" est "), l("-\\dfrac{1}{x^2}"), t(", et non un logarithme.")];
    case "pasDePrimitive":
      return [t("La fonction "), l("\\dfrac{1}{x}"), t(" n'admet pas de primitive sur un intervalle de nombres négatifs.")];
    case "lnMoins":
      return [t("Sur un intervalle de nombres négatifs, une primitive de "), l("\\dfrac{1}{x}"), t(" est "), l("-\\ln(x)"), t(".")];
    case "linearite":
      return [t("Le facteur constant ne peut pas sortir de l'intégrale : il fallait le garder dans le crochet.")];
    case "decoupeIntegrale":
      return [t("Il fallait découper l'intervalle là où "), l("\\sin(x)"), t(" s'annule : une intégrale se calcule toujours morceau par morceau.")];
    case "diviserParC":
      return [t("Il fallait diviser par le coefficient : une primitive de "), l(`${d.c}\\cos(x)`), t(" est "), l(`\\dfrac{\\sin(x)}{${d.c}}`), t(".")];
    case "conditionSurf":
      return [t("La condition initiale porte sur f : elle se traduit par "), l("f(x_0) = y_0"), t(", et non par une équation sur F.")];
    case "constanteAbsente":
      return [t("La constante C est oubliée dans la primitive générale.")];
    case "valeurAbsolueGlobale":
      return [t("Il suffisait de prendre la valeur absolue de l'intégrale sur tout l'intervalle : "), l(`\\left|\\int_0^{${d.m}} \\ldots\\right|`), t(".")];
    case "deriveeAuLieu":
      return [t("Il fallait utiliser la dérivée "), l("f'"), t(" et non une primitive de f.")];
    case "ordreCourbes":
      return [t("L'ordre des courbes est faux : "), l("x^2"), t(" est au-dessus de "), l(`${d.k === 1 ? "" : d.k}x`), t(" sur tout l'intervalle, il fallait intégrer "), l(`x^2 - ${d.k === 1 ? "" : d.k}x`), t(".")];
    case "intersectionsFausses":
      return [t("Les points d'intersection sont faux : il fallait résoudre "), l(`x^2 + ${d.k === 1 ? "" : d.k}x = 0`), t(".")];
    case "volumeCube":
      return [t("Il fallait élever "), l("f(x)"), t(" au cube, puisqu'un volume est une grandeur de dimension 3.")];
    case "volumeDeuxPi":
      return [t("Il fallait multiplier par "), l("2\\pi"), t(", la longueur d'un cercle de rayon 1.")];
    case "constanteBornes":
      return [t("La constante C est oubliée : il fallait calculer "), l("(F(b) + C) - (F(a) + C)"), t(", qui ne donne pas le même résultat.")];
    case "decoupeRacines":
      return [t("Il fallait d'abord découper l'intervalle aux racines de f.")];
    case "valeurF":
      return [t("La valeur de "), l(`F(${d.x})`), t(" est mal calculée.")];
    case "primitiveDemi":
      return [t("La primitive est fausse : une primitive de "), l(`${2 * d.k!}t`), t(" est "), l(`\\dfrac{${d.k === 1 ? "" : d.k}t^2}{2}`), t(".")];
    case "vitesseDerivee":
      return [t("La vitesse est la dérivée de l'accélération, et non une primitive.")];
    case "positionVitesse":
      return [t("La vitesse est une primitive de la position, et non de l'accélération.")];
  }
}

const NOMS_COURTS: Partial<Record<IdDescriptionIntegrales, string>> = {
  affine: "primitive de f(ax + b) non divisée par a",
  lnAbs: "valeur absolue oubliée dans ln|x|",
  signeSin: "signe faux dans la primitive de sin",
  signeCos: "signe faux dans la primitive de cos",
  aireRacines: "aire calculée sans découper aux racines",
  aireIntersections: "aire calculée sans découper aux intersections",
  volumeCarre: "carré oublié dans la méthode des disques",
  volumePi: "facteur π oublié dans la méthode des disques",
  bornes: "bornes inversées, F(a) − F(b)",
  constanteIsolee: "constante C mal isolée",
  constanteOubliee: "constante d'intégration oubliée",
};

export function nomErreur(e: ExerciceDetectiveIntegrales): string {
  return NOMS_COURTS[descriptionCorrecte(e)] ?? "";
}

// ---------------------------------------------------------------------------------------------
// Aides (jamais la réponse finale : il reste toujours au moins un calcul)
// ---------------------------------------------------------------------------------------------

function aidesLigne(e: ExerciceDetectiveIntegrales): FragmentConsigne[][] {
  const i = indiceLigneFausse(e);
  const n = SCENARIOS[e.scenario].nombreLignes;
  const [p, q] = i % 2 === 0 ? (i + 1 < n ? [i, i + 1] : [i - 1, i]) : [i - 1, i];
  return [
    [t("Refais la résolution à partir des données, ligne par ligne, en comparant chaque formule à celle du cours : la première ligne qui ne redonne pas le même résultat est la ligne fausse.")],
    [t(`L'erreur se trouve à la ligne ${p + 1} ou à la ligne ${q + 1}.`)],
  ];
}

const AIDES_ERREUR: Record<TypeErreurIntegrales, FragmentConsigne[][]> = {
  affine: [
    [t("Rappel du cours :"), l("\\int f(ax+b)\\,dx = \\dfrac{1}{a}F(ax+b) + C")],
    [t("Dérive la primitive écrite par l'élève : retrouves-tu exactement la fonction de départ ?")],
  ],
  lnAbs: [
    [t("Rappel du cours :"), l("\\int \\dfrac{1}{x}\\,dx = \\ln|x| + C")],
    [t("Regarde le signe des nombres placés dans le logarithme, sur l'intervalle de l'exercice.")],
  ],
  signe: [
    [t("Rappel du cours :"), l("\\int \\cos(x)\\,dx = \\sin(x) + C \\qquad \\int \\sin(x)\\,dx = -\\cos(x) + C")],
    [t("Dérive la primitive écrite par l'élève et compare avec la fonction à intégrer.")],
  ],
  aire: [
    [t("Si la fonction à intégrer change de signe en r, on découpe et on additionne les valeurs absolues :"), l("\\left|\\int_a^r h(x)\\,dx\\right| + \\left|\\int_r^b h(x)\\,dx\\right|")],
    [t("Étudie le signe de la fonction intégrée sur tout l'intervalle.")],
  ],
  volume: [
    [t("Méthode des disques :"), l("V = \\pi\\int_a^b [f(x)]^2\\,dx")],
    [t("Compare chaque ligne avec cette formule : le facteur devant l'intégrale, puis la fonction intégrée.")],
  ],
  bornes: [
    [t("Théorème fondamental :"), l("\\int_a^b f(x)\\,dx = F(b) - F(a)")],
    [t("Vérifie l'ordre des deux termes de la soustraction.")],
  ],
  constante: [
    [t("Méthode du cours : on garde C dans la primitive générale, puis on résout en C l'équation :"), l("F(x_0) + C = y_0")],
    [t("Vérifie que C est bien présente, puis comment elle est isolée.")],
  ],
};

function aidesCorrection(e: ExerciceDetectiveIntegrales): FragmentConsigne[][] {
  const d = e.donnees;
  switch (e.scenario) {
    case "A1":
      return [
        [t("Une primitive d'une composée affine :"), l("\\int \\cos(kx)\\,dx = \\dfrac{1}{k}\\sin(kx) + C")],
        [t("Calcule ensuite, avec cette primitive :"), l(`F\\left(\\frac{\\pi}{${2 * d.k!}}\\right) - F(0)`)],
      ];
    case "A2":
      return [
        [t("Une primitive d'une puissance de ax + b :"), l("\\int (ax+b)^n\\,dx = \\dfrac{(ax+b)^{n+1}}{a(n+1)} + C")],
        [t("Calcule ensuite, avec cette primitive :"), l("F(1) - F(0)")],
      ];
    case "L1": {
      const { bas, haut } = bornesL1(e);
      return [
        [t("Rappel du cours :"), l("\\int \\dfrac{c}{x}\\,dx = c\\ln|x| + C")],
        [t("Calcule ensuite, puis simplifie avec les propriétés du logarithme :"), l(`F(${haut}) - F(${bas})`)],
      ];
    }
    case "L2":
      return [
        [t("Rappel du cours :"), l("\\int \\dfrac{c}{x}\\,dx = c\\ln|x| + C")],
        [t("Pose ensuite la condition initiale et résous en C :"), l(`F(${POINTS_L2[d.p!]}) = ${d.y}`)],
      ];
    case "G1": {
      const { a, b } = bornesG1(e);
      return [
        [t("Rappel du cours :"), l("\\int \\sin(x)\\,dx = -\\cos(x) + C")],
        [t("Calcule ensuite, avec les valeurs exactes du cosinus :"), l(`${d.c}\\left(-\\cos\\left(${b.l}\\right) + \\cos\\left(${a.l}\\right)\\right)`)],
      ];
    }
    case "G2":
      return [
        [t("Rappel du cours :"), l("\\int \\cos(x)\\,dx = \\sin(x) + C")],
        [t("Pose ensuite la condition initiale et résous en C :"), l(`${d.c}\\sin\\left(${POINTS_G2[d.j!]!.l}\\right) + C = ${d.y}`)],
      ];
    case "R1":
      return [
        [t("f s'annule en "), l(`x = ${d.k}`), t(" : découpe l'intervalle en ce point :"), l(`-\\int_0^{${d.k}} f(x)\\,dx + \\int_{${d.k}}^{${d.m}} f(x)\\,dx`)],
        [t("Calcule chaque morceau avec la primitive de la ligne 1, puis additionne :"), l(`-\\left(F(${d.k}) - F(0)\\right) + \\left(F(${d.m}) - F(${d.k})\\right)`)],
      ];
    case "R2": {
      const kx = d.k === 1 ? "x" : `${d.k}x`;
      return [
        [t("Les courbes se croisent en "), l(`x = ${d.k}`), t(" : découpe et intègre toujours « courbe du dessus moins courbe du dessous » :"), l(`\\int_0^{${d.k}} \\left(${kx} - x^2\\right)dx + \\int_{${d.k}}^{${d.m}} \\left(x^2 - ${kx}\\right)dx`)],
        [t("Une primitive utile :"), l(`\\int \\left(${kx} - x^2\\right)dx = \\dfrac{${d.k === 1 ? "" : d.k}x^2}{2} - \\dfrac{x^3}{3} + C`)],
      ];
    }
    case "V1":
      return [
        [t("La fonction à intégrer est le carré du rayon :"), l(`[f(x)]^2 = \\left(${d.k === 1 ? "" : d.k}x\\right)^2`)],
        [t("Calcule ensuite :"), l(`V = \\pi\\int_0^{${d.h}} [f(x)]^2\\,dx`)],
      ];
    case "V2":
      return [
        [t("Méthode des disques :"), l("V = \\pi\\int_a^b [f(x)]^2\\,dx")],
        [t("Reprends la ligne 2 avec le facteur manquant, puis calcule :"), l(`\\int_0^{${d.h}} ${d.k}x\\,dx`)],
      ];
    case "B1":
      return [
        [t("Théorème fondamental :"), l(`\\int_{${d.a}}^{${d.b}} f(x)\\,dx = F(${d.b}) - F(${d.a})`)],
        [t("Puis la valeur moyenne :"), l(`\\dfrac{1}{${d.b} - ${d.a}}\\int_{${d.a}}^{${d.b}} f(x)\\,dx`)],
      ];
    case "C1": {
      const v = d.x! ** 3 + d.b! * d.x! * d.x!;
      return [
        [t("Isole C : un terme qui change de membre change de signe :"), l(`${v} + C = ${d.y} \\iff C = ${d.y} - ${v < 0 ? `(${v})` : v}`)],
        [t("Écris ensuite la primitive particulière, avec cette valeur de C :"), l(`F(x) = x^3 ${d.b! < 0 ? "-" : "+"} ${Math.abs(d.b!) === 1 ? "" : Math.abs(d.b!)}x^2 + C`)],
      ];
    }
    case "C2":
      return [
        [t("Une primitive générale de l'accélération :"), l(`v(t) = ${d.k === 1 ? "" : d.k}t^2 + C`)],
        [t("La condition initiale fixe C ; calcule ensuite la vitesse demandée :"), l(`v(0) = C = ${d.v}`)],
      ];
  }
}

export function aidesEcran(e: ExerciceDetectiveIntegrales, ecran: number): FragmentConsigne[][] {
  if (ecran === 0) return aidesLigne(e);
  if (ecran === 1) return AIDES_ERREUR[typeErreur(e)];
  return aidesCorrection(e).map(souderPonctuation);
}

// ---------------------------------------------------------------------------------------------
// Corrigé : comment repérer la ligne fausse, piège
// ---------------------------------------------------------------------------------------------

export function constat(e: ExerciceDetectiveIntegrales): FragmentConsigne[] {
  return souderPonctuation(constatBrut(e));
}

function constatBrut(e: ExerciceDetectiveIntegrales): FragmentConsigne[] {
  const d = e.donnees;
  const n = indiceLigneFausse(e) + 1;
  switch (e.scenario) {
    case "A1":
      return [t(`À la ligne ${n}, la dérivée de `), l(`${d.c === 1 ? "" : d.c}\\sin(${d.k}x)`), t(" vaut "), l(`${d.c! * d.k!}\\cos(${d.k}x)`), t(", et non "), l("f(x)"), t(" : il manque le facteur "), l(`\\dfrac{1}{${d.k}}`), t(".")];
    case "A2":
      return [t(`À la ligne ${n}, la dérivée de la primitive proposée vaut `), l(`${d.a}(${d.a}x + ${d.b})^{${d.n}}`), t(", et non "), l("f(x)"), t(" : il manque le facteur "), l(`\\dfrac{1}{${d.a}}`), t(".")];
    case "L1":
    case "L2":
      return [t(`À la ligne ${n}, `), l("\\ln(x)"), t(" n'est défini que pour "), l("x > 0"), t(", alors que l'exercice ne porte que sur des nombres négatifs : la conclusion « impossible » de la copie vient de là.")];
    case "G1":
      return [t(`À la ligne ${n}, la dérivée de `), l("\\cos(x)"), t(" est "), l("-\\sin(x)"), t(" : le crochet donne l'opposé de l'intégrale (résultat négatif alors que "), l("\\sin(x) \\ge 0"), t(" sur l'intervalle).")];
    case "G2":
      return [t(`À la ligne ${n}, la dérivée de `), l(`-${d.c}\\sin(x)`), t(" est "), l(`-${d.c}\\cos(x)`), t(", et non "), l("f(x)"), t(".")];
    case "R1":
      return [t(`À la ligne ${n}, f change de signe en `), l(`x = ${d.k}`), t(" sur "), l(`[0;${d.m}]`), t(" : l'intégrale compense la partie sous l'axe et la partie au-dessus.")];
    case "R2":
      return [t(`À la ligne ${n}, les courbes se croisent en `), l(`x = ${d.k}`), t(", à l'intérieur de "), l(`[0;${d.m}]`), t(" : au-delà, "), l("x^2"), t(" passe au-dessus.")];
    case "V1":
      return [t(`À la ligne ${n}, la fonction intégrée est `), l("f(x)"), t(" et non "), l("[f(x)]^2"), t(".")];
    case "V2":
      return [t(`À la ligne ${n}, le facteur `), l("\\pi"), t(" de la méthode des disques a disparu.")];
    case "B1":
      return [t(`À la ligne ${n}, l'intégrale est calculée par `), l(`F(${d.a}) - F(${d.b})`), t(" : elle est négative alors que "), l("f(x) > 0"), t(".")];
    case "C1":
      return [t(`À la ligne ${n}, le terme `), l(`${d.x! ** 3 + d.b! * d.x! * d.x!}`), t(" passe dans l'autre membre sans changer de signe.")];
    case "C2":
      return [t(`À la ligne ${n}, la constante d'intégration manque : la donnée `), l(`v(0) = ${d.v}`), t(" n'est jamais utilisée.")];
  }
}

export function piege(e: ExerciceDetectiveIntegrales): FragmentConsigne[] {
  return souderPonctuation(piegeBrut(e));
}

function piegeBrut(e: ExerciceDetectiveIntegrales): FragmentConsigne[] {
  switch (typeErreur(e)) {
    case "affine":
      return [t("Pour une composée affine, divise par le coefficient de x : "), l("\\int f(ax+b)\\,dx = \\dfrac{1}{a}F(ax+b) + C"), t(" ; vérifie en dérivant.")];
    case "lnAbs":
      return [t("Une primitive de "), l("\\dfrac{1}{x}"), t(" est "), l("\\ln|x|"), t(" : la valeur absolue la rend utilisable pour "), l("x < 0"), t(".")];
    case "signe":
      return [t("Primitives : "), l("\\cos \\to \\sin"), t(" et "), l("\\sin \\to -\\cos"), t(" ; en dérivant, on retrouve la fonction de départ.")];
    case "aire":
      return [t("Une aire n'est jamais négative : découpe aux racines (ou aux intersections) et additionne les valeurs absolues des intégrales partielles.")];
    case "volume":
      return [l("V = \\pi\\int_a^b [f(x)]^2\\,dx"), t(" : ni le facteur "), l("\\pi"), t(" ni le carré ne peuvent disparaître.")];
    case "bornes":
      return [l("\\int_a^b f(x)\\,dx = F(b) - F(a)"), t(" : la borne supérieure d'abord ; une fonction positive a une intégrale positive.")];
    case "constante":
      return [t("Garde C dans la primitive générale, puis isole-la correctement : "), l("F(x_0) + C = y_0 \\iff C = y_0 - F(x_0)"), t(".")];
  }
}

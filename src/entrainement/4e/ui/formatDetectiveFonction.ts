import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { ExerciceDetectiveFonction, IdDescriptionFonction, TypeErreurFonction } from "../core/detectiveFonction.types";
import { ensembleLatex } from "../moteur/algebreTransfertSecondDegre";
import { bornes, developpeeLatex, imageCopie, imageCorrecte, indiceLigneFausse, intervalleLatex, nomExtremum, optimumCopie, optimumCorrect, sommetCopie } from "../moteur/modeleDetectiveFonction";
import type { Champ } from "./ecransTransfertSecondDegre";
import { souderPonctuation } from "./formatDetectiveVecteurs";
import { q, qp } from "./corrigeChapitre3";

/**
 * Textes de gen127 « Détective d'erreurs : fonction du second degré » — SOURCE UNIQUE pour l'écran,
 * les aides, le papier et le corrigé. Notation du cours : S(x_S ; y_S), a(x − x_S)² + y_S,
 * im f = [y_S ; +∞[ ou ]−∞ ; y_S]. Aucun « Δ ».
 */

type E = ExerciceDetectiveFonction;
type Fr = FragmentConsigne[];
const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

export { souderPonctuation };

export const TITRES_ECRANS = ["La ligne fausse", "L'erreur commise", "La correction"];

export const CONSIGNE_GENERALE = "Une ligne de cette copie est fausse. Trouve-la, explique l'erreur et corrige le résultat.";

export function recit(e: E): Fr {
  const fx = l(`f(x)=${developpeeLatex(e)}`);
  switch (e.variante) {
    case "sommet":
      return [t("Un élève cherche le sommet S de la parabole d'équation "), l("y=f(x)"), t(", avec "), fx, t(". Voici sa copie :")];
    case "canonique":
      return [t("Un élève écrit "), fx, t(" sous forme canonique pour trouver le sommet S de sa parabole. Voici sa copie :")];
    case "image":
      return [t("Un élève cherche l'image de la fonction "), fx, t(". Voici sa copie :")];
    case "optimum":
      return [t(`Un élève cherche le ${nomExtremum(e)} de `), fx, t(" pour "), l(`x\\in${intervalleLatex(e.m!, e.M!)}`), t(". Voici sa copie :")];
  }
}

export function consigneCorrection(e: E): Fr {
  if (e.variante === "image") return [t("Donne l'image correcte de f.")];
  if (e.variante === "optimum") return [t(`Donne le ${nomExtremum(e)} correct de f sur `), l(intervalleLatex(e.m!, e.M!)), t(" et l'abscisse où il est atteint.")];
  return [t("Donne le sommet correct "), l("S(x_S\\,;y_S)"), t(".")];
}

export function consignesEcrans(e: E): Fr[] {
  return [[t("Quelle ligne de la copie est fausse ?")], [t(`Quelle erreur l'élève a-t-il commise à la ligne ${indiceLigneFausse(e) + 1} ?`)], consigneCorrection(e)];
}

/** Réponse de l'écran 3 (et résultat final du corrigé). */
export function reponseFragments(e: E): Fr {
  if (e.variante === "image") return [l(`\\operatorname{im} f=${ensembleLatex(imageCorrecte(e))}`)];
  if (e.variante === "optimum") {
    const o = optimumCorrect(e);
    return souderPonctuation([t(`Le ${nomExtremum(e)} vaut `), l(q(o.v)), t(", atteint en "), l(`x=${q(o.x)}`), t(".")]);
  }
  return [l(`S(${q(e.h)}\\,;${q(e.k)})`)];
}

/** Résultat (faux) de la copie, pour le barème et le message « c'est le résultat de la copie ». */
export function resultatCopieFragments(e: E): Fr {
  if (e.variante === "image") return [l(`\\operatorname{im} f=${ensembleLatex(imageCopie(e))}`)];
  if (e.variante === "optimum") {
    const o = optimumCopie(e);
    return [l(`${q(o.v)}`), t(" en "), l(`x=${q(o.x)}`)];
  }
  const s = sommetCopie(e);
  return [l(`S(${q(s.x)}\\,;${q(s.y)})`)];
}

// ---------------------------------------------------------------------------------------------
// Descriptions de l'écran 2
// ---------------------------------------------------------------------------------------------

export function descriptionFragments(id: IdDescriptionFonction, e: E): Fr {
  const ext = nomExtremum(e);
  switch (id) {
    case "bSansSigne":
      return [t("Le coefficient b est recopié sans son signe : dans f(x), "), l(`b=${q(e.b)}`), t(".")];
    case "signeXS":
      return [t("Le signe « − » de la formule "), l("x_S=-\\dfrac{b}{2a}"), t(" est oublié.")];
    case "nonMultiplieParA":
      return [t("Le nombre sorti du crochet n'est pas multiplié par a.")];
    case "signeSommet":
      return [t("L'abscisse du sommet est lue avec le mauvais signe dans la parenthèse "), l("(x-x_S)"), t(".")];
    case "allureInversee":
      return [t("Le sens de la parabole est inversé : "), l("a>0"), t(" donne une parabole tournée vers le haut, "), l("a<0"), t(" vers le bas.")];
    case "imageAvecXS":
      return [t("L'image est écrite avec l'abscisse du sommet au lieu de son ordonnée.")];
    case "sommetHorsDomaine":
      return [t("Le sommet n'est pas dans le domaine : il fallait le vérifier, car l'extremum est alors atteint à une borne.")];
    case "variationInversee":
      return [t("Le sens de variation de f sur l'intervalle est inversé : l'extremum est pris à la mauvaise borne.")];
    case "leurreCarreNegatif":
      return [t("Dans le calcul de "), l("f(x_S)"), t(", le carré d'un nombre négatif est compté négatif.")];
    case "leurreCoordInversees":
      return [t("Les coordonnées du sommet sont écrites dans le désordre : "), l("(y_S\\,;x_S)"), t(".")];
    case "leurreEvidence":
      return [t("En mettant a en évidence, le coefficient de x n'est pas divisé par a.")];
    case "leurreCompletion":
      return [t("Le carré est mal complété : il faut la moitié du coefficient de x dans la parenthèse.")];
    case "leurreAllure":
      return [t(`La parabole est tournée vers le ${e.a < 0 ? "haut" : "bas"} : le sommet est un ${ext === "maximum" ? "minimum" : "maximum"}, il ne fallait pas chercher un ${ext}.`)];
  }
}

export const NOMS_ERREURS: Record<TypeErreurFonction, string> = {
  bSansSigne: "b recopié sans son signe",
  signeXS: "« − » de la formule de l'abscisse du sommet oublié",
  nonMultiplieParA: "nombre sorti du crochet non multiplié par a",
  signeSommet: "signe de l'abscisse du sommet inversé à la lecture",
  allureInversee: "sens de la parabole inversé",
  imageAvecXS: "image construite avec l'abscisse du sommet",
  sommetHorsDomaine: "sommet hors du domaine non vérifié",
  variationInversee: "sens de variation inversé sur l'intervalle",
};

/** La règle du cours que la ligne fausse n'a pas suivie (corrigé, étape b). */
export function regle(e: E): Fr {
  switch (e.type) {
    case "bSansSigne":
    case "signeXS":
      return [t("L'abscisse du sommet vaut "), l("x_S=-\\dfrac{b}{2a}"), t(", avec les coefficients lus sur f(x) avec leur signe (cours, point 1).")];
    case "nonMultiplieParA":
      return [t("On redistribue a sur les deux termes du crochet : "), l("a\\left[(x-p)^2-p^2\\right]=a(x-p)^2-ap^2"), t(" (cours, point 2).")];
    case "signeSommet":
      return [t("La forme canonique "), l("a(x-x_S)^2+y_S"), t(" donne le sommet "), l("S(x_S\\,;y_S)"), t(" : dans la parenthèse, on soustrait "), l("x_S"), t(" (cours, point 2).")];
    case "allureInversee":
    case "imageAvecXS":
      return [t("Si "), l("a>0"), t(", le sommet est un minimum et "), l("\\operatorname{im} f=[y_S\\,;+\\infty["), t(" ; si "), l("a<0"), t(", c'est un maximum et "), l("\\operatorname{im} f=\\mathopen{]}-\\infty\\,;y_S]"), t(" (cours, point 1).")];
    case "sommetHorsDomaine":
    case "variationInversee":
      return [t("Sur un intervalle, l'extremum est au sommet seulement si le sommet est dans l'intervalle ; sinon, f est monotone sur l'intervalle et l'extremum est à la borne la plus proche du sommet (cours, point 3).")];
  }
}

export function piege(e: E): Fr {
  switch (e.type) {
    case "bSansSigne":
      return [t("On recopie chaque coefficient avec le signe qui le précède dans f(x).")];
    case "signeXS":
      return [t("Le « − » devant la fraction : "), l("x_S=-\\dfrac{b}{2a}"), t(", à ne jamais oublier.")];
    case "nonMultiplieParA":
      return [t("Le nombre qui sort du crochet est multiplié par a avant d'être ajouté à c.")];
    case "signeSommet":
      return [l("(x+2)^2=\\big(x-(-2)\\big)^2"), t(" : le sommet a pour abscisse "), l("-2"), t(", pas 2.")];
    case "allureInversee":
      return [t("Le signe de a donne le sens de la parabole, donc le côté de l'image.")];
    case "imageAvecXS":
      return [t("L'image se lit sur l'axe des ordonnées : elle part de "), l("y_S"), t(", jamais de "), l("x_S"), t(".")];
    case "sommetHorsDomaine":
      return [t("Avant de conclure au sommet, on vérifie qu'il appartient au domaine.")];
    case "variationInversee":
      return [t("D'un même côté du sommet, f est monotone : plus on s'approche du sommet, plus on s'approche de l'extremum.")];
  }
}

// ---------------------------------------------------------------------------------------------
// Aides (deux niveaux par écran, jamais la réponse)
// ---------------------------------------------------------------------------------------------

export function aidesEcran(e: E, ecran: number): Fr[] {
  if (ecran === 0) {
    const n2: Record<E["variante"], Fr> = {
      sommet: [t("Vérifie d'abord les coefficients lus sur f(x), avec leur signe, puis la formule "), l("x_S=-\\dfrac{b}{2a}"), t(".")],
      canonique: [t("Vérifie dans l'ordre : a mis en évidence, le carré complété, a redistribué sur le crochet, puis la lecture du sommet sur "), l("a(x-x_S)^2+y_S"), t(".")],
      image: [t("Vérifie le calcul du sommet, puis le lien entre le signe de a et le sens de la parabole, puis l'image écrite.")],
      optimum: [t("Vérifie si le sommet appartient au domaine, puis le sens de variation de f entre les bornes.")],
    };
    return [[t("Refais la copie toi-même, ligne par ligne : la ligne fausse est la première qui ne découle pas correctement de la précédente (ou de l'énoncé).")], n2[e.variante]];
  }
  if (ecran === 1) return [[t("Compare la ligne fausse à la règle du cours qu'elle applique : laquelle n'est pas respectée ?")], regle(e)];
  const n1: Fr = [t("Reprends la copie à partir de la ligne fausse en corrigeant l'erreur : les lignes suivantes changent aussi.")];
  switch (e.type) {
    case "bSansSigne":
    case "signeXS":
      return [n1, [t("Avec "), l(`b=${q(e.b)}`), t(" et "), l(`a=${q(e.a)}`), t(" : "), l(`x_S=-\\dfrac{${qp(e.b)}}{2\\cdot ${qp(e.a)}}`), t(", puis "), l("y_S=f(x_S)"), t(".")]];
    case "nonMultiplieParA":
      return [n1, [t("Le nombre sorti du crochet devient "), l(`${qp(e.a)}\\cdot(-${q(e.h * e.h)})`), t(" ; ajoute-le à c pour obtenir "), l("y_S"), t(".")]];
    case "signeSommet":
      return [n1, [t("Écris la parenthèse de la ligne 4 sous la forme "), l("(x-x_S)"), t(" pour lire "), l("x_S"), t(" avec son signe ; "), l("y_S"), t(" ne change pas.")]];
    case "allureInversee":
      return [n1, [t("Ici "), l(`a=${q(e.a)}`), t(" : de quel côté la parabole est-elle tournée ? Le sommet est-il le point le plus haut ou le plus bas ?")]];
    case "imageAvecXS":
      return [n1, [t("L'image est l'ensemble des valeurs prises par f : elle commence (ou s'arrête) à l'ordonnée du sommet, calculée à la ligne 2.")]];
    default: {
      return [n1, [t("Compare "), l(`x_S=${q(e.h)}`), t(" aux bornes "), l(q(e.m!)), t(" et "), l(q(e.M!)), t(" : l'extremum est à la borne la plus proche du sommet ; calcule f en cette borne.")]];
    }
  }
}

// ---------------------------------------------------------------------------------------------
// Champs de l'écran 3 (coquille des écrans « transfert »)
// ---------------------------------------------------------------------------------------------

export function champsCorrection(e: E): Champ[] {
  const n = indiceLigneFausse(e) + 1;
  const msgCopie = `C'est le résultat de la copie : reprends la résolution à partir de la ligne ${n}, sans l'erreur.`;
  if (e.variante === "image") {
    return [
      {
        type: "ensemble",
        id: "image",
        libelle: [t("Image de f :")],
        variable: "x",
        prefixeApercu: "\\operatorname{im} f=",
        cible: imageCorrecte(e),
        pieges: [
          { ensemble: imageCopie(e), message: msgCopie },
          { ensemble: [{ g: e.h, gFerme: true, d: Infinity, dFerme: false }], message: "L'image part de l'ordonnée du sommet, pas de son abscisse." },
          { ensemble: [{ g: -Infinity, gFerme: false, d: e.h, dFerme: true }], message: "L'image part de l'ordonnée du sommet, pas de son abscisse." },
        ].filter((p) => !(p.ensemble[0]!.g === imageCorrecte(e)[0]!.g && p.ensemble[0]!.d === imageCorrecte(e)[0]!.d)),
        messageSiFaux: "L'image part de $y_S$ : vers le haut si $a>0$, vers le bas si $a<0$.",
      },
    ];
  }
  if (e.variante === "optimum") {
    const o = optimumCorrect(e);
    const c = optimumCopie(e);
    const { loin } = bornes(e);
    return [
      { type: "nombre", id: "xOpt", libelle: [t("atteint en "), l("x=")], cible: o.x, pieges: [{ valeur: c.x, message: msgCopie }, { valeur: e.h, message: "Le sommet n'est pas dans le domaine." }, { valeur: loin, message: "C'est la borne la plus éloignée du sommet." }].filter((p, i, tab) => p.valeur !== o.x && tab.findIndex((x) => x.valeur === p.valeur) === i), messageSiFaux: "L'extremum est à une borne du domaine." },
      { type: "nombre", id: "vOpt", libelle: [t(`${nomExtremum(e)} :`)], cible: o.v, pieges: [{ valeur: c.v, message: msgCopie }, { valeur: e.k, message: "C'est l'ordonnée du sommet, qui n'est pas dans le domaine." }].filter((p, i, tab) => p.valeur !== o.v && tab.findIndex((x) => x.valeur === p.valeur) === i), messageSiFaux: "Calcule f en la borne trouvée." },
    ];
  }
  const s = sommetCopie(e);
  return [
    { type: "nombre", id: "xS", libelle: [l("x_S=")], cible: e.h, pieges: [{ valeur: s.x, message: msgCopie }, { valeur: -e.h, message: "Revois le signe de l'abscisse du sommet." }].filter((p, i, tab) => p.valeur !== e.h && tab.findIndex((x) => x.valeur === p.valeur) === i), messageSiFaux: "Revois l'abscisse du sommet." },
    { type: "nombre", id: "yS", libelle: [l("y_S=")], cible: e.k, pieges: [{ valeur: s.y, message: msgCopie }].filter((p) => p.valeur !== e.k), messageSiFaux: "Revois l'ordonnée du sommet : $y_S=f(x_S)$." },
  ];
}

export function nomErreur(e: E): string {
  return NOMS_ERREURS[e.type];
}

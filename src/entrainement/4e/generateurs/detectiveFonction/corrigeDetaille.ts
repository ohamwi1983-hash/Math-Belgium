import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege as lignePiege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceDetectiveFonction } from "../../core/detectiveFonction.types";
import { bornes, canoniqueLatex, coefDevant, developpeeLatex, evidenceLatex, f, imageCorrecte, indiceLigneFausse, intervalleLatex, nomExtremum, optimumCorrect, substitution } from "../../moteur/modeleDetectiveFonction";
import { ensembleLatex } from "../../moteur/algebreTransfertSecondDegre";
import { descriptionFragments, piege, regle, reponseFragments } from "../../ui/formatDetectiveFonction";
import { moinsH, nombreTexte, plusQ, polynome, q, qp } from "../../ui/corrigeChapitre3";

/**
 * Corrigé détaillé « comme au tableau » de gen127 (détective d'erreurs : fonction du second degré) —
 * règle `.claude/rules/feuilles-evaluations.md`. Trois étapes = trois écrans : a) la ligne fausse
 * (refaite et comparée à la copie, « ≠ »), b) l'erreur commise (règle du cours, constat chiffré,
 * description de l'écran, piège), c) la correction : la copie reprise bloc par bloc (« Ligne k »),
 * sans l'erreur, puis le résultat. Valeurs du modèle (`moteur/modeleDetectiveFonction.ts`) ; partagé
 * par l'adaptateur papier et l'appli.
 */

type E = ExerciceDetectiveFonction;
type Fr = FragmentConsigne[];

const signeA = (e: E) => `a=${q(e.a)}${e.a < 0 ? "<0" : ">0"}`;

function lignesSommet(e: E): LigneCalcul[] {
  return [ligne("x_S=-\\dfrac{b}{2a}", "formule de l'abscisse du sommet"), ligne(`=-\\dfrac{${qp(e.b)}}{2\\cdot ${qp(e.a)}}`, "on remplace a et b"), ligne(`=${q(e.h)}`)];
}

function lignesOrdonnee(e: E): LigneCalcul[] {
  return [ligne(`y_S=f(${q(e.h)})`, "l'ordonnée est l'image de l'abscisse"), ligne(`=${substitution(e, e.h)}`), ligne(`=${q(e.k)}`)];
}

/** a) La ligne fausse refaite et comparée à la copie. */
function lignesControle(e: E): LigneCalcul[] {
  const i = indiceLigneFausse(e) + 1;
  const copie = `ce qu'écrit la copie à la ligne ${i}`;
  switch (e.type) {
    case "bSansSigne":
      return [ligne(`b=${q(e.b)}`, "coefficient de x dans f(x), avec son signe"), ligne(`${q(e.b)}\\neq ${q(-e.b)}`, copie)];
    case "signeXS":
      return [...lignesSommet(e), ligne(`${q(e.h)}\\neq ${q(-e.h)}`, copie)];
    case "nonMultiplieParA":
      return [ligne(`${qp(e.a)}\\cdot(-${q(e.h * e.h)})=${q(-e.a * e.h * e.h)}`, "a multiplie aussi le second terme du crochet"), ligne(`${q(-e.a * e.h * e.h)}\\neq -${q(e.h * e.h)}`, copie)];
    case "signeSommet":
      return [
        ...(e.h < 0 ? [ligne(`${moinsH(e.h)}=x-(${q(e.h)})`, [texte("la parenthèse écrite sous la forme "), latex("x-x_S")])] : []),
        ligne(`x_S=${q(e.h)}`, [texte("dans la parenthèse, on soustrait "), latex("x_S")]),
        ligne(`${q(e.h)}\\neq ${q(-e.h)}`, copie),
      ];
    case "allureInversee":
      return [ligne(signeA(e), `parabole tournée vers le ${e.a < 0 ? "bas" : "haut"} ; la copie dit vers le ${e.a < 0 ? "haut" : "bas"}`)];
    case "imageAvecXS":
      return [ligne(`y_S=${q(e.k)}`, "l'image part de l'ordonnée du sommet (ligne 2)"), ligne(`${q(e.k)}\\neq ${q(e.h)}`, [texte("la copie part de "), latex("x_S"), texte(" à la ligne 4")])];
    case "sommetHorsDomaine": {
      const { proche } = bornes(e);
      return [ligne(`x_S=${q(e.h)}`, "ligne 1, juste"), ligne(`${q(e.h)}${e.h > e.M! ? ">" : "<"}${q(proche)}`, "le sommet est hors du domaine : la copie le garde")];
    }
    case "variationInversee": {
      const { croit } = bornes(e);
      return [ligne(signeA(e), `sur l'intervalle, f ${croit ? "croît" : "décroît"} (elle va vers le sommet ou s'en éloigne) ; la copie dit l'inverse`)];
    }
  }
}

function constat(e: E): Fr {
  const debut = texte(`La ligne ${indiceLigneFausse(e) + 1} est fausse : `);
  const fin: Record<E["type"], string> = {
    bSansSigne: "b y est recopié sans son signe.",
    signeXS: "le « − » de la formule y manque.",
    nonMultiplieParA: "le nombre sorti du crochet n'y est pas multiplié par a.",
    signeSommet: "l'abscisse du sommet y a le mauvais signe.",
    allureInversee: "le sens de la parabole y est inversé.",
    imageAvecXS: "l'image y part de l'abscisse du sommet.",
    sommetHorsDomaine: "le sommet, hors du domaine, y est gardé.",
    variationInversee: "le sens de variation de f sur l'intervalle y est inversé.",
  };
  return [debut, texte(fin[e.type])];
}

/** c) La copie reprise bloc par bloc, sans l'erreur. */
function blocsCorrects(e: E): { titre: string; lignes: LigneCalcul[] }[] {
  switch (e.variante) {
    case "sommet":
      return [
        { titre: "Ligne 1", lignes: [ligne(`a=${q(e.a)}`, "coefficient de x²"), ligne(`b=${q(e.b)}`, "coefficient de x, avec son signe"), ligne(`c=${q(e.c)}`, "terme constant")] },
        { titre: "Ligne 2", lignes: lignesSommet(e) },
        { titre: "Ligne 3", lignes: lignesOrdonnee(e) },
      ];
    case "canonique": {
      const h2 = e.h * e.h;
      const p = e.b / e.a;
      return [
        { titre: "Ligne 1", lignes: [ligne(`f(x)=${developpeeLatex(e)}`), ligne(`=${evidenceLatex(e)}`, `on met ${nombreTexte(e.a)} en évidence sur les termes en x² et en x`)] },
        { titre: "Ligne 2", lignes: [ligne(`f(x)=${coefDevant(e.a)}[(${moinsH(e.h)})^2-${q(h2)}]${plusQ(e.c)}`, [texte("on complète le carré : "), latex(`${polynome([1, p, 0])}=(${moinsH(e.h)})^2-${q(Math.abs(e.h))}^2`)])] },
        { titre: "Ligne 3", lignes: [ligne(`f(x)=${coefDevant(e.a)}(${moinsH(e.h)})^2${plusQ(-e.a * h2)}${plusQ(e.c)}`, [texte(`on redistribue ${nombreTexte(e.a)} : `), latex(`${qp(e.a)}\\cdot(-${q(h2)})=${q(-e.a * h2)}`)])] },
        { titre: "Ligne 4", lignes: [ligne(`f(x)=${canoniqueLatex(e.a, e.h, e.k)}`, "on réduit les constantes")] },
        {
          titre: "Ligne 5",
          lignes: [
            ...(e.h < 0 ? [ligne(`${moinsH(e.h)}=x-(${q(e.h)})`, [texte("la parenthèse écrite sous la forme "), latex("x-x_S")])] : []),
            ligne(`x_S=${q(e.h)}`, "le nombre soustrait à x"),
            ligne(`y_S=${q(e.k)}`, "la constante ajoutée au carré"),
          ],
        },
      ];
    }
    case "image":
      return [
        { titre: "Ligne 1", lignes: lignesSommet(e) },
        { titre: "Ligne 2", lignes: lignesOrdonnee(e) },
        { titre: "Ligne 3", lignes: [ligne(signeA(e), `parabole tournée vers le ${e.a < 0 ? "bas : le sommet est un maximum" : "haut : le sommet est un minimum"}`)] },
        { titre: "Ligne 4", lignes: [ligne(`\\operatorname{im} f=${ensembleLatex(imageCorrecte(e))}`, [texte(`f prend toutes les valeurs ${e.a < 0 ? "inférieures ou égales à" : "supérieures ou égales à"} `), latex("y_S")])] },
      ];
    case "optimum": {
      const { proche, croit } = bornes(e);
      const o = optimumCorrect(e);
      return [
        { titre: "Ligne 1", lignes: lignesSommet(e) },
        { titre: "Ligne 2", lignes: [ligne(`${q(e.h)}${e.h > e.M! ? ">" : "<"}${q(proche)}`, "le sommet n'est pas dans le domaine")] },
        { titre: "Ligne 3", lignes: [ligne(signeA(e), `f ${croit ? "croît" : "décroît"} sur l'intervalle : le ${nomExtremum(e)} est à la borne la plus proche du sommet, x = ${nombreTexte(proche)}`)] },
        { titre: "Ligne 4", lignes: [ligne(`f(${q(proche)})=${substitution(e, proche)}`), ligne(`=${q(o.v)}`)] },
      ];
    }
  }
}

function verificationFinale(e: E): EtapeCorrection[] {
  if (e.variante === "optimum") {
    const { loin } = bornes(e);
    const o = optimumCorrect(e);
    return [verification("c", [texte("L'autre borne donne une valeur moins bonne : ")], [ligne(`f(${q(loin)})=${substitution(e, loin)}`), ligne(`=${q(f(e, loin))}`), ligne(`${q(f(e, loin))}${e.a < 0 ? "<" : ">"}${q(o.v)}`, `c'est bien le ${nomExtremum(e)} en x = ${nombreTexte(o.x)}`)])];
  }
  if (e.variante === "canonique") return [verification("c", [texte("L'ordonnée du sommet est l'image de son abscisse : ")], [ligne(`f(${q(e.h)})=${substitution(e, e.h)}`), ligne(`=${q(e.k)}`)])];
  if (e.variante === "image") return [verification("c", [texte("Contrôle : le sommet est sur la courbe et f n'atteint pas de valeur au-delà de "), latex("y_S"), texte(" : ")], [ligne(`f(${q(e.h)})=${q(e.k)}`, "la valeur extrême de f")])];
  return [verification("c", [texte("Avec la forme canonique : ")], [ligne(`f(x)=${canoniqueLatex(e.a, e.h, e.k)}`, "on retrouve f(x) en développant"), ligne(`=${developpeeLatex(e)}`)])];
}

export function correctionDetailleeDetectiveFonction(e: E): EtapeCorrection[] {
  const i = indiceLigneFausse(e);
  const enonce = latex(`f(x)=${developpeeLatex(e)}`);
  const domaine = e.variante === "optimum" ? [texte(" sur "), latex(intervalleLatex(e.m!, e.M!))] : [];
  return [
    utilise("a", [texte("On refait la copie ligne par ligne à partir de "), enonce, ...domaine, texte(" : la première ligne qui ne redonne pas le même résultat est la ligne fausse.")]),
    calcul("a", lignesControle(e), [texte(`Ligne ${i + 1} refaite :`)]),
    resultat("a", constat(e)),
    utilise("b", regle(e)),
    calcul("b", lignesControle(e).slice(-1)),
    resultat("b", descriptionFragments(e.type, e)),
    lignePiege("b", piege(e)),
    utilise("c", [texte("On reprend la copie bloc par bloc, sans l'erreur.")]),
    ...blocsCorrects(e).map((b) => calcul("c", b.lignes, [], b.titre)),
    resultat("c", reponseFragments(e)),
    ...verificationFinale(e),
  ];
}

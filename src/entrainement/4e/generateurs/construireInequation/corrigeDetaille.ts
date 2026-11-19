import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceConstruireInequation } from "../../core/construireInequation.types";
import { symbolePour, trinome } from "./index";
import { ensembleTexteLatex, facteur, formeFactorisee, libelleRelation, relationExemple } from "../../ui/formatConstruireInequation";
import { nombreLatex, symboleLatex } from "../../moteur/algebreTransfertSecondDegre";
import { polynome, q, qp } from "../../ui/corrigeChapitre3";
import { COURS_RESOUDRE, COURS_SIGNE_TRINOME } from "../../ui/corrigeTransfertSecondDegre";

/**
 * Corrigé détaillé « comme au tableau » de gen120 — règle `.claude/rules/feuilles-evaluations.md`.
 * a) une (in)équation de solution S (racines lues, forme factorisée développée, symbole choisi par le
 * signe de a), b) la même avec le coefficient imposé (multiplication, sens du symbole), c) la parabole
 * par un point (a par substitution, puis b et c en développant). Partagé par l'adaptateur et l'appli.
 */

type E = ExerciceConstruireInequation;

function lignesDeveloppement(e: E, k: number, gauche = formeFactorisee(e, k)): LigneCalcul[] {
  const s = e.r1 + e.r2;
  const p = e.r1 * e.r2;
  const distribue: [string, string | ReturnType<typeof texte>[]] = [polynome([1, -s, p]), [texte("on distribue : "), latex("(x-x_1)(x-x_2)=x^2-(x_1+x_2)x+x_1x_2")]];
  if (k === 1) return [ligne(`${gauche}=${distribue[0]}`, distribue[1])];
  const pre = k === -1 ? "-" : String(k);
  return [ligne(`${gauche}=${pre}(${distribue[0]})`, distribue[1]), ligne(`=${polynome(trinome(e, k))}`, `on distribue ${q(k).replace("-", "−")}`)];
}

function phraseSigne(e: E, k: number): string {
  const pos = k > 0;
  if (e.variante === "equation") return "";
  const interieur = e.allure === "interieur";
  // signe voulu sur S : négatif à l'intérieur si a > 0, positif à l'intérieur si a < 0.
  const signeSurS = interieur === pos ? "négatif" : "positif";
  return `a ${pos ? ">" : "<"} 0 : le trinôme est ${pos ? "positif à l'extérieur et négatif entre" : "négatif à l'extérieur et positif entre"} ses racines ; S est la zone où il est ${signeSurS}`;
}

function etapeA(e: E): EtapeCorrection[] {
  const k = e.den;
  const nom = libelleRelation(e);
  const sy = symbolePour(e, k);
  const lignes: LigneCalcul[] = [
    ligne(`x_1=${nombreLatex(e.r1)}`, e.variante === "equation" ? "première solution" : "borne finie de S : une racine"),
    ligne(`x_2=${nombreLatex(e.r2)}`, e.variante === "equation" ? "seconde solution" : "borne finie de S : l'autre racine"),
    ...lignesDeveloppement(e, k),
  ];
  if (e.variante === "inequation") {
    lignes.push(ligne(relationExemple(e, k), phraseSigne(e, k) + (sy === "≤" || sy === "≥" ? " ; bornes incluses : symbole large" : " ; bornes exclues : symbole strict")));
  } else lignes.push(ligne(relationExemple(e, k), "le produit est nul pour x₁ et pour x₂ seulement"));
  const milieu = (e.r1 + e.r2) / 2;
  const valeur = trinome(e, k)[0] * milieu * milieu + trinome(e, k)[1] * milieu + trinome(e, k)[2];
  return [
    utilise("a", [texte(`Les solutions (ou les bornes de S) sont les racines du trinôme, qui s'écrit `), latex("{a(x-x_1)(x-x_2)}"), texte(` ${COURS_RESOUDRE} ; son signe : celui de a à l'extérieur des racines ${COURS_SIGNE_TRINOME}.`)]),
    calcul("a", lignes),
    resultat("a", [texte("Par exemple "), latex(relationExemple(e, k)), texte(` : toute ${nom} de même solution convient.`)]),
    ...(e.variante === "inequation"
      ? [
          verification("a", [texte("Une valeur entre les racines : ")], [
            ligne(`${polynome(trinome(e, k)).replace(/x/g, `(${nombreLatex(milieu)})`)}=${nombreLatex(valeur)}`, `en x = ${nombreLatex(milieu).replace("-", "−").replace(/\\dfrac\{(\d+)\}\{(\d+)\}/, "$1/$2")}`),
            ligne(`${nombreLatex(valeur)}${valeur < 0 ? "<" : ">"}0`, e.allure === "interieur" ? "elle est bien solution" : "elle n'est pas solution : c'est bien l'extérieur"),
          ]),
        ]
      : []),
    piege(
      "a",
      e.variante === "equation"
        ? [texte("Pour une solution r, le facteur est (x − r) : pour "), latex(nombreLatex(e.r1)), texte(", c'est "), latex(`(${facteur(e.r1)})`), texte(", pas l'inverse.")]
        : [texte("Le symbole ne se devine pas avec le crochet seul : il dépend du signe de a et de la zone (intérieur ou extérieur) donnée par S.")],
    ),
  ];
}

function etapeB(e: E): EtapeCorrection[] {
  const k = e.aImpose;
  const nom = libelleRelation(e);
  const lignes: LigneCalcul[] = [...lignesDeveloppement(e, k)];
  if (e.variante === "inequation") lignes.push(ligne(relationExemple(e, k), phraseSigne(e, k)));
  else lignes.push(ligne(relationExemple(e, k), "même produit nul : mêmes solutions"));
  return [
    utilise("b", [texte(`Multiplier le trinôme par une constante non nulle garde ses racines ; dans une inéquation, multiplier par un nombre négatif change le sens du symbole ${COURS_SIGNE_TRINOME}.`)]),
    calcul("b", lignes),
    resultat("b", [latex(relationExemple(e, k))]),
    ...(e.variante === "inequation" && k < 0
      ? [piege("b", [texte(`Avec a < 0, le symbole est l'inverse de celui de l'étape 1 : `), latex(symboleLatex(symbolePour(e, 1))), texte(" devient "), latex(symboleLatex(symbolePour(e, k))), texte(".")])]
      : e.variante === "inequation"
        ? [piege("b", [texte(`Le coefficient imposé est positif : le symbole reste celui de l'${nom} de l'étape 1.`)])]
        : []),
  ];
}

function etapeC(e: E): EtapeCorrection[] {
  const f1 = e.x0 - e.r1;
  const f2 = e.x0 - e.r2;
  const prod = f1 * f2;
  const b = -e.a3 * (e.r1 + e.r2);
  const c = e.a3 * e.r1 * e.r2;
  const sub = (r: number) => (Math.abs(r) < 1e-12 ? `(${nombreLatex(e.x0)})` : `(${nombreLatex(e.x0)}${r < 0 ? "+" : "-"}${nombreLatex(Math.abs(r))})`);
  const lignes: LigneCalcul[] = [
    ligne(`y=a${formeFactorisee(e, 1)}`, "racines x₁ et x₂"),
    ligne(`${nombreLatex(e.y0)}=a${sub(e.r1)}${sub(e.r2)}`, "P est sur la parabole : on remplace x et y"),
    ligne(`${nombreLatex(e.y0)}=a\\cdot ${qp(f1)}\\cdot ${qp(f2)}`, "on calcule chaque facteur"),
    ligne(`${nombreLatex(e.y0)}=${nombreLatex(prod)}a`, "on multiplie"),
    ligne(`a=\\dfrac{${nombreLatex(e.y0)}}{${nombreLatex(prod)}}`, `on divise par ${q(prod).replace("-", "−").replace(/\\dfrac\{(\d+)\}\{(\d+)\}/, "$1/$2")}`),
    ligne(`=${nombreLatex(e.a3)}`),
    ligne(`y=${formeFactorisee(e, e.a3)}`, "on remplace a par sa valeur"),
    ...lignesDeveloppement(e, e.a3, ""),
  ];
  return [
    utilise("c", [texte("Une parabole qui coupe l'axe des x en "), latex("x_1"), texte(" et "), latex("x_2"), texte(" a pour équation "), latex("{y=a(x-x_1)(x-x_2)}"), texte(` ${COURS_RESOUDRE} ; un point de la parabole vérifie son équation.`)]),
    calcul("c", lignes),
    resultat("c", [latex(`a=${nombreLatex(e.a3)}`), texte(", "), latex(`b=${nombreLatex(b)}`), texte(", "), latex(`c=${nombreLatex(c)}`)]),
    verification("c", [texte("On remplace x par l'abscisse de P dans le trinôme développé : ")], [
      ligne(`${nombreLatex(e.a3)}\\cdot ${qp(e.x0)}^2${b < 0 ? "-" : "+"}${nombreLatex(Math.abs(b))}\\cdot ${qp(e.x0)}${c < 0 ? "-" : "+"}${nombreLatex(Math.abs(c))}=${nombreLatex(e.y0)}`, "on retrouve l'ordonnée de P"),
    ]),
  ];
}

export function correctionDetailleeConstruireInequation(e: E): EtapeCorrection[] {
  return [...etapeA(e), ...etapeB(e), ...etapeC(e)];
}

export { ensembleTexteLatex };

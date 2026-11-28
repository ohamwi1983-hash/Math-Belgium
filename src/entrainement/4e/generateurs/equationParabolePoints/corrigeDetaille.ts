import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceEquationParabolePoints } from "../../core/equationParabolePoints.types";
import { nombreLatex } from "../../moteur/algebreTransfertSecondDegre";
import { mono, moinsH, plusQ, polynome, q, qp, somme } from "../../ui/corrigeChapitre3";
import { devant, figureAnnotee, formeJusteLatex, pointLatex, reponseCoefficients, reponseEquation, reponseForme, substitutionLatex } from "../../ui/formatEquationParabolePoints";

/**
 * Corrigé détaillé « comme au tableau » de gen125 — règle `.claude/rules/feuilles-evaluations.md`.
 * a) les données (une ligne par donnée lue ou donnée, avec sa relation) et la forme de départ ;
 * b) a par le point P, une opération par ligne — ou le système des points B et C résolu ligne à
 * ligne (combinaison qui élimine b, puis b par substitution) ; c) développement ligne à ligne et
 * vérification par un point. Figure annotée (variante graphique).
 */

type E = ExerciceEquationParabolePoints;
const n = nombreLatex;
const COURS = "(cours, point 2)";

function lignesDonnees(e: E): LigneCalcul[] {
  const graphique = e.variante === "graphique";
  if (e.donnees === "sommet") {
    const out = [
      ligne(`x_S=${n(e.sommet.x)}`, graphique ? "abscisse du sommet, lue sur un nœud du quadrillage" : "abscisse du sommet (donnée)"),
      ligne(`y_S=${n(e.sommet.y)}`, graphique ? "ordonnée du sommet, lue" : "ordonnée du sommet (donnée)"),
    ];
    if (graphique) out.push(ligne(`f(x)\\neq 0`, "la parabole ne coupe pas l'axe des x : pas de forme factorisée"));
    out.push(ligne(`f(x)=${formeJusteLatex(e)}`, "forme canonique : il reste a à trouver"));
    return out;
  }
  if (e.donnees === "zeros") {
    const out = [
      ligne(`f(${n(e.zeros[0]!)})=0`, graphique ? `la courbe coupe l'axe des x en x = ${String(e.zeros[0]).replace("-", "−")}` : "premier zéro (donné)"),
      ligne(`f(${n(e.zeros[1]!)})=0`, graphique ? `la courbe coupe l'axe des x en x = ${String(e.zeros[1]).replace("-", "−")}` : "second zéro (donné)"),
    ];
    if (graphique) out.push(ligne(`x_S=\\dfrac{${n(e.zeros[0]!)}+${qp(e.zeros[1]!)}}{2}=${q(e.sommet.x)}`, "le sommet est entre deux lignes : il ne se lit pas exactement"));
    out.push(ligne(`f(x)=${formeJusteLatex(e)}`, "forme factorisée : il reste a à trouver"));
    return out;
  }
  const c = e.coefficients[2];
  return [ligne(`c=f(0)=${n(c)}`, "le point A a pour abscisse 0"), ligne(`f(x)=${formeJusteLatex(e)}`, "forme développée : il reste a et b à trouver")];
}

function lignesCoefficientA(e: E): LigneCalcul[] {
  const A = e.coefficients[0];
  const p = e.point;
  const lignes: LigneCalcul[] = [ligne(`f(${n(p.x)})=${n(p.y)}`, `P${e.variante === "graphique" ? ", lu sur le quadrillage," : ""} est sur la parabole`), ligne(`${substitutionLatex(e, p)}=${n(p.y)}`, "on remplace x par l'abscisse de P")];
  if (e.donnees === "sommet") {
    const t = p.x - e.sommet.x;
    const t2 = t * t;
    lignes.push(ligne(`${mono(t2, "a")}${plusQ(e.sommet.y)}=${n(p.y)}`, [texte("on calcule le carré : "), latex(`${qp(t)}^2=${t2}`)]));
    if (e.sommet.y !== 0) lignes.push(ligne(`${mono(t2, "a")}=${n(p.y - e.sommet.y)}`, `on ${e.sommet.y > 0 ? "retire" : "ajoute"} ${String(Math.abs(e.sommet.y))} aux deux membres`));
    if (t2 !== 1) lignes.push(ligne(`a=${q(A)}`, `on divise par ${t2}`));
    return lignes;
  }
  const u = p.x - e.zeros[0]!, v = p.x - e.zeros[1]!;
  lignes.push(ligne(`a\\cdot ${qp(u)}\\cdot ${qp(v)}=${n(p.y)}`, "on calcule chaque parenthèse"));
  lignes.push(ligne(`${mono(u * v, "a")}=${n(p.y)}`, "on calcule le produit"));
  if (Math.abs(u * v) !== 1 || u * v === -1) lignes.push(ligne(`a=${q(A)}`, `on divise par ${String(u * v).replace("-", "−")}`));
  return lignes;
}

function lignesSysteme(e: E): LigneCalcul[] {
  const [A, B, C] = e.coefficients;
  const [, P1, P2] = e.points;
  const x2 = P2!.x;
  const r1 = P1!.y - C, r2 = P2!.y - C;
  const eq2 = somme([[x2 * x2, "a"], [x2, "b"]]);
  return [
    ligne(`a\\cdot 1^2+b\\cdot 1${plusQ(C)}=${n(P1!.y)}`, "B est sur la parabole"),
    ligne(`a+b=${n(r1)}`, `équation (1) : on ${C > 0 ? "retire" : "ajoute"} ${String(Math.abs(C))}`),
    ligne(`a\\cdot ${qp(x2)}^2+b\\cdot ${qp(x2)}${plusQ(C)}=${n(P2!.y)}`, "C est sur la parabole"),
    ligne(`${eq2}=${n(r2)}`, `équation (2) : on calcule et on ${C > 0 ? "retire" : "ajoute"} ${String(Math.abs(C))}`),
    ligne(`${somme([[x2, "a"], [x2, "b"]])}=${n(r1 * x2)}`, `on multiplie (1) par ${String(x2).replace("-", "−")}`),
    ligne(`${mono(x2 * x2 - x2, "a")}=${n(r2 - r1 * x2)}`, "on soustrait cette égalité de (2), membre à membre : b disparaît"),
    ligne(`a=${q(A)}`, `on divise par ${String(x2 * x2 - x2).replace("-", "−")}`),
    ligne(`b=${n(r1)}${plusQ(-A)}`, [texte("dans (1) : "), latex(`b=${n(r1)}-a`)]),
    ligne(`=${q(B)}`),
  ];
}

function lignesDeveloppement(e: E): LigneCalcul[] {
  const [A, B, C] = e.coefficients;
  if (e.donnees === "troisPoints") return [ligne(`f(x)=${polynome([A, B, C])}`, "on remplace a, b et c")];
  const d = devant(A);
  if (e.donnees === "sommet") {
    const h = e.sommet.x, k = e.sommet.y;
    if (h === 0) return [ligne(`f(x)=${d}x^2${plusQ(k)}`, "on remplace a : déjà développée")];
    const carre = polynome([1, -2 * h, h * h]);
    return [
      ligne(`f(x)=${d}(${moinsH(h)})^2${plusQ(k)}`, "on remplace a"),
      ligne(`=${d}(${carre})${plusQ(k)}`, [texte("on développe le carré : "), latex("(x-h)^2=x^2-2hx+h^2")]),
      ligne(`=${somme([[A, "x^2"], [-2 * A * h, "x"], [A * h * h, ""]])}${plusQ(k)}`, "on distribue a"),
      ligne(`=${polynome([A, B, C])}`, "on réduit"),
    ];
  }
  const [x1, x2] = e.zeros as [number, number];
  const f1 = x1 === 0 ? "x" : `(${moinsH(x1)})`, f2 = x2 === 0 ? "x" : `(${moinsH(x2)})`;
  const developpe = somme([[1, "x^2"], [-x2, "x"], [-x1, "x"], [x1 * x2, ""]]);
  return [
    ligne(`f(x)=${d}${f1}${f2}`, "on remplace a"),
    ligne(`=${d}(${developpe})`, "on distribue les deux parenthèses"),
    ligne(`=${d}(${polynome([1, -(x1 + x2), x1 * x2])})`, "on réduit"),
    ligne(`=${polynome([A, B, C])}`, "on distribue a"),
  ];
}

/** f(x_v) remplacé terme à terme, puis la valeur (une seule ligne si un seul terme reste). */
function lignesVerification(xv: number, yv: number, termes: number[]): LigneCalcul[] {
  const s = somme(termes.map((t): [number, string] => [t, ""]));
  const lignes = [ligne(`f(${n(xv)})=${s}`, [texte("on remplace x par "), latex(n(xv))])];
  if (termes.filter((t) => t !== 0).length > 1) lignes.push(ligne(`=${n(yv)}`, "c'est bien l'ordonnée du point"));
  return lignes;
}

export function correctionDetailleeEquationParabole(e: E): EtapeCorrection[] {
  const [A, B, C] = e.coefficients;
  const sortie: EtapeCorrection[] = [];
  sortie.push(
    utilise("a", [texte("Sommet connu : forme canonique "), latex("f(x)=a(x-x_S)^2+y_S"), texte(" ; zéros connus : forme factorisée "), latex("f(x)=a(x-x_1)(x-x_2)"), texte(" ; sinon "), latex("f(x)=ax^2+bx+c"), texte(` ${COURS}.`)]),
    calcul("a", lignesDonnees(e)),
    resultat("a", reponseForme(e)),
    piege("a", e.donnees === "troisPoints" ? [texte("c est l'ordonnée du point d'abscisse 0 ; les deux autres points servent à trouver "), latex("a"), texte(" et "), latex("b"), texte(".")] : [texte("Dans la parenthèse, le signe change : la valeur 2 donne "), latex("(x-2)"), texte(", la valeur −2 donne "), latex("(x+2)"), texte(".")]),
  );
  if (e.donnees === "troisPoints") {
    sortie.push(
      utilise("b", [texte("Chaque point de la parabole vérifie son équation : "), latex("B"), texte(" et "), latex("C"), texte(" donnent un système de deux équations en "), latex("a"), texte(" et "), latex("b"), texte(", qu'on résout par combinaison.")]),
      calcul("b", lignesSysteme(e)),
      resultat("b", reponseCoefficients(e)),
      verification("b", [texte("Dans l'équation (2) :")], [ligne(`${somme([[e.points[2]!.x ** 2 * A, ""]])}${plusQ(e.points[2]!.x * B)}=${n(e.points[2]!.y - C)}`, "(2) est vérifiée")]),
      piege("b", [texte("On remplace "), latex("x"), texte(" et "), latex("f(x)"), texte(" : l'abscisse du point dans "), latex("x"), texte(", son ordonnée à la place de "), latex("f(x)"), texte(".")]),
    );
  } else {
    sortie.push(
      utilise("b", [texte("Le point "), latex("P"), texte(" est sur la parabole : ses coordonnées vérifient l'équation, ce qui donne une équation du premier degré en "), latex("a"), texte(` ${COURS}.`)]),
      calcul("b", lignesCoefficientA(e)),
      resultat("b", reponseCoefficients(e)),
      piege("b", e.donnees === "sommet" ? [texte("On retire "), latex("y_S"), texte(" avant de diviser par le carré.")] : [texte("Chaque parenthèse se calcule avec l'abscisse de "), latex("P"), texte(" : "), latex(`${n(e.point.x)}-${qp(e.zeros[0]!)}`), texte(" et "), latex(`${n(e.point.x)}-${qp(e.zeros[1]!)}`), texte(".")]),
    );
  }
  const verif = e.donnees === "troisPoints" ? { nom: "B", p: e.points[1]! } : { nom: "P", p: e.point };
  const xv = verif.p.x;
  sortie.push(
    utilise("c", [texte("On remplace "), latex("a"), texte(e.donnees === "troisPoints" ? " et " : " dans la forme de départ, puis on développe et on réduit"), ...(e.donnees === "troisPoints" ? [latex("b"), texte(" dans la forme développée")] : []), texte(` ${COURS}.`)]),
    calcul("c", lignesDeveloppement(e)),
    { ...resultat("c", reponseEquation(e)), ...(e.variante === "graphique" ? { figureHtml: figureAnnotee(e) } : {}) },
    verification("c", [texte("Le point "), latex(pointLatex(verif.nom, verif.p)), texte(" vérifie l'équation :")], lignesVerification(xv, verif.p.y, [A * xv * xv, B * xv, C])),
    piege("c", e.donnees === "troisPoints" ? [texte("La réponse attendue est la forme développée "), latex("ax^2+bx+c"), texte(" avec les trois valeurs.")] : [texte("Le coefficient "), latex("a"), texte(" se distribue sur tous les termes, pas seulement sur "), latex("x^2"), texte(".")]),
  );
  return sortie;
}

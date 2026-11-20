import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceTroisEcritures } from "../../core/troisEcritures.types";
import { developpe, zeros } from "./index";
import { canoniqueDe, coefDevant, developpeeLatex, evidenceLatex, facteurZero, factoriseeLatex, reponseSommet } from "../../ui/formatTroisEcritures";
import { mono, moinsH, nombreTexte, plusQ, polynome, q, qp, sansDoublons, somme } from "../../ui/corrigeChapitre3";

/**
 * Corrigé détaillé « comme au tableau » de gen126 « Trois écritures d'une parabole » — règle
 * `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN (`ui/formatTroisEcritures.ts::ecrans`) :
 * développement ligne à ligne (carré développé, a distribué, réduction), zéros sur la forme canonique
 * (carré isolé, deux racines carrées opposées — ou un carré égal à un nombre négatif), forme
 * factorisée vérifiée en redéveloppant ; a mis en évidence, carré complété, a redistribué (le nombre
 * sorti du crochet multiplié par a) ; sommet lu ou calculé par le milieu des zéros. Partagé par
 * l'adaptateur papier et l'appli (corrigé de l'étape à l'écran). Aucun « Δ » (chapitre 1).
 */

type E = ExerciceTroisEcritures;

const COURS_ETUDIER = "(cours, § 1)";
const COURS_TRANSFORMER = "(cours, § 2)";

/** « (x−3)² = x² − 2·3·x + 3² » : le carré développé, avec le double produit visible. */
function carreDeveloppe(h: number): string {
  const v = Math.abs(h);
  return `(${moinsH(h)})^2=x^2${h > 0 ? "-" : "+"}2\\cdot ${q(v)}\\cdot x+${q(v)}^2`;
}

/** Valeur de la forme développée en x, substituée : « 2·(−1)² − 12·(−1) + 10 ». */
function substitutionDeveloppee(e: E, x: number): string {
  const [a, b, c] = developpe(e);
  const terme2 = a === 1 ? `${qp(x)}^2` : a === -1 ? `-(${q(x)})^2` : `${q(a)}\\cdot ${qp(x)}^2`;
  const terme1 = b === 0 ? "" : `${b < 0 ? "-" : "+"}${q(Math.abs(b))}\\cdot ${qp(x)}`;
  return `${terme2}${terme1}${plusQ(c)}`;
}

/** Valeur de la forme canonique en x, substituée : « 2(1 − 3)² − 8 ». */
function substitutionCanonique(e: E, x: number): string {
  return `${coefDevant(e.a)}(${q(x)}${plusQ(-e.h)})^2${plusQ(e.k)}`;
}

/** Développement de la forme canonique (carré, a distribué, réduction). */
function lignesDevCanonique(e: E, gauche: string): LigneCalcul[] {
  const { a, h, k } = e;
  const lignes: LigneCalcul[] = [
    ligne(`${gauche}=${coefDevant(a)}(${polynome([1, -2 * h, h * h])})${plusQ(k)}`, [texte("on développe le carré : "), latex(carreDeveloppe(h))]),
  ];
  if (a !== 1) lignes.push(ligne(`=${polynome([a, -2 * a * h, a * h * h])}${plusQ(k)}`, `on distribue ${nombreTexte(a)} sur chaque terme`));
  else lignes.push(ligne(`=${polynome([1, -2 * h, h * h])}${plusQ(k)}`, "on retire les parenthèses"));
  lignes.push(ligne(`=${developpeeLatex(e)}`, "on réduit les constantes"));
  return sansDoublons(lignes);
}

function etapesDepuisCanonique(e: E): EtapeCorrection[] {
  const { a, h, k } = e;
  const dev = developpeeLatex(e);
  const canon = canoniqueDe(e);
  const c = developpe(e)[2];
  const z = zeros(e);
  const out: EtapeCorrection[] = [
    utilise("a", [texte("Le carré d'une différence (ou d'une somme) : "), latex("(x-p)^2=x^2-2px+p^2"), texte(", puis a distribué sur chaque terme "), texte(COURS_TRANSFORMER), texte(".")]),
    calcul("a", [ligne(`f(x)=${canon}`), ...lignesDevCanonique(e, "")]),
    resultat("a", [latex(`f(x)=${dev}`)]),
    verification("a", [texte("Même ordonnée à l'origine dans les deux écritures : ")], [ligne(`f(0)=${substitutionCanonique(e, 0)}`, "dans la forme canonique"), ligne(`=${q(c)}`, "c'est bien le terme constant de la forme développée")]),
    piege("a", [texte("Le carré ne se « distribue » pas : "), latex(`(${moinsH(h)})^2\\neq x^2+${q(h * h)}`), texte(" ; il manquerait le double produit "), latex(`${mono(-2 * h, "x")}\\text{.}`)]),
  ];
  // b) les zéros
  const lignesB: LigneCalcul[] = [ligne(`${canon}=0`, "les zéros de f : on résout f(x) = 0")];
  lignesB.push(ligne(`${coefDevant(a)}(${moinsH(h)})^2=${q(-k)}`, k < 0 ? `on ajoute ${nombreTexte(-k)} aux deux membres` : `on retranche ${nombreTexte(k)} aux deux membres`));
  if (a !== 1) lignesB.push(ligne(`(${moinsH(h)})^2=${q(-k / a)}`, `on divise par ${nombreTexte(a)}`));
  if (z.length === 2) {
    const d = e.d!;
    lignesB.push(ligne(`${moinsH(h)}=${d}`, `${d}² = ${d * d} : première possibilité`));
    lignesB.push(ligne(`x_2=${q(h + d)}`, h > 0 ? `on ajoute ${nombreTexte(h)}` : `on retranche ${nombreTexte(-h)}`));
    lignesB.push(ligne(`${moinsH(h)}=-${d}`, `(−${d})² = ${d * d} aussi : seconde possibilité`));
    lignesB.push(ligne(`x_1=${q(h - d)}`, h > 0 ? `on ajoute ${nombreTexte(h)}` : `on retranche ${nombreTexte(-h)}`));
  } else {
    lignesB.push(ligne(`${q(-k / a)}<0`, "un carré n'est jamais négatif : l'équation n'a aucune solution"));
  }
  out.push(
    utilise("b", [texte("Sur la forme canonique, on isole le carré : un carré n'est jamais négatif, et un nombre positif m a deux racines carrées opposées, "), latex("\\sqrt{m}"), texte(" et "), latex("-\\sqrt{m}"), texte(` ${COURS_TRANSFORMER}.`)]),
    calcul("b", lignesB),
  );
  if (z.length === 2) {
    const [r1, r2] = z as [number, number];
    out.push(
      resultat("b", [texte("Deux zéros : "), latex(`x_1=${q(r1)}`), texte(" et "), latex(`x_2=${q(r2)}`), texte(".")]),
      verification("b", [texte("On remplace x par un zéro dans la forme canonique : ")], [ligne(`f(${q(r1)})=${substitutionCanonique(e, r1)}`), ligne(`=${q(a * e.d! * e.d!)}${plusQ(k)}`), ligne("=0", "c'est bien un zéro")]),
      piege("b", [texte("On isole le carré avant de prendre la racine carrée (diviser par a d'abord), et on garde les deux racines carrées, la positive et la négative.")]),
    );
    const fact = factoriseeLatex(a, r1, r2);
    const prod = polynome([1, -(r1 + r2), r1 * r2]);
    const lignesVerif: LigneCalcul[] = a === 1 ? [ligne(`${fact}=${prod}`, "on développe le produit : c'est bien la forme développée")] : [ligne(`${fact}=${coefDevant(a)}(${prod})`, "on développe le produit"), ligne(`=${dev}`, `on distribue ${nombreTexte(a)} : c'est bien la forme développée`)];
    out.push(
      utilise("c", [texte("Une fonction du second degré de zéros "), latex("x_1"), texte(" et "), latex("x_2"), texte(" s'écrit "), latex("a(x-x_1)(x-x_2)"), texte(`, avec le même a que dans les autres écritures ${COURS_TRANSFORMER}.`)]),
      calcul("c", [ligne("f(x)=a(x-x_1)(x-x_2)", "forme factorisée"), ligne(`=${fact}`, `a = ${nombreTexte(a)}, x₁ = ${nombreTexte(r1)}, x₂ = ${nombreTexte(r2)}`)]),
      resultat("c", [latex(`f(x)=${fact}`)]),
      verification("c", [texte("En développant, on retrouve la forme développée : ")], lignesVerif),
      piege("c", [texte("Chaque zéro r donne le facteur "), latex("(x-r)"), texte(" : pour "), latex(q(r1 !== 0 ? r1 : r2)), texte(", c'est "), latex(facteurZero(r1 !== 0 ? r1 : r2)), texte(" ; et a reste devant le produit.")]),
    );
  } else {
    out.push(
      resultat("b", [texte("f n'a aucun zéro : sa parabole ne coupe pas l'axe des x, donc f n'a pas de forme factorisée.")]),
      piege("b", [texte("« Carré = nombre négatif » n'a pas de solution : il est inutile de chercher une racine carrée.")]),
    );
  }
  return out;
}

function etapesDepuisDeveloppee(e: E): EtapeCorrection[] {
  const { a, h, k } = e;
  const [, b, c] = developpe(e);
  const dev = developpeeLatex(e);
  const evid = evidenceLatex(e);
  const canon = canoniqueDe(e);
  const p = b / a;
  return [
    utilise("a", [texte("Pour compléter le carré quand "), latex("a\\neq 1"), texte(", on met d'abord a en évidence sur les termes en "), latex("x^2"), texte(` et en x ; c reste dehors ${COURS_TRANSFORMER}.`)]),
    calcul("a", [ligne(`f(x)=${dev}`), ligne(`=${evid}`, [texte("on met "), latex(q(a)), texte(" en évidence : "), latex(`${mono(b, "x")}=${qp(a)}\\cdot ${mono(p, "x").startsWith("-") ? `(${mono(p, "x")})` : mono(p, "x")}`)])]),
    resultat("a", [latex(`f(x)=${evid}`)]),
    verification("a", [texte("En redistribuant a, on retrouve les deux premiers termes : ")], [ligne(`${coefDevant(a)}(${polynome([1, p, 0])})=${polynome([a, b, 0])}`)]),
    piege("a", [texte("Le coefficient de x est divisé par a, signe compris ; c ne rentre pas dans la parenthèse.")]),
    utilise("b", [texte("On complète le carré : "), latex("x^2+px=\\left(x+\\dfrac{p}{2}\\right)^2-\\left(\\dfrac{p}{2}\\right)^2"), texte(`, puis on redistribue a sur les deux termes du crochet ${COURS_TRANSFORMER}.`)]),
    calcul("b", [
      ligne(`f(x)=${evid}`),
      ligne(`=${coefDevant(a)}[(${moinsH(h)})^2-${q(h * h)}]${plusQ(c)}`, [texte("on complète le carré : "), latex(`${polynome([1, p, 0])}=(${moinsH(h)})^2-${q(Math.abs(h))}^2`)]),
      ligne(`=${coefDevant(a)}(${moinsH(h)})^2${plusQ(-a * h * h)}${plusQ(c)}`, [texte(`on redistribue ${nombreTexte(a)} : `), latex(`${qp(a)}\\cdot(-${q(h * h)})=${q(-a * h * h)}`)]),
      ligne(`=${canon}`, "on réduit les constantes"),
    ]),
    resultat("b", [latex(`f(x)=${canon}`)]),
    verification("b", [texte("En développant la forme canonique, on retrouve f(x) : ")], lignesDevCanonique(e, canon)),
    piege("b", [texte("Le nombre "), latex(`-${q(h * h)}`), texte(" sorti du crochet est multiplié par a : "), latex(`${qp(a)}\\cdot(-${q(h * h)})=${q(-a * h * h)}`), texte(", et non "), latex(`-${q(h * h)}`), texte(".")]),
    utilise("c", [texte("La forme canonique "), latex("a(x-x_S)^2+y_S"), texte(" donne directement le sommet "), latex("S(x_S\\,;y_S)"), texte(` ${COURS_TRANSFORMER}.`)]),
    calcul("c", [
      ...(h < 0 ? [ligne(`${moinsH(h)}=x-(${q(h)})`, "on écrit la parenthèse sous la forme x − x_S")] : []),
      ligne(`x_S=${q(h)}`, "le nombre soustrait à x dans la parenthèse"),
      ligne(`y_S=${q(k)}`, "la constante ajoutée au carré"),
    ]),
    resultat("c", reponseSommet(e)),
    verification("c", [texte("L'ordonnée du sommet est l'image de son abscisse : ")], [ligne(`f(${q(h)})=${substitutionDeveloppee(e, h)}`), ligne(`=${q(k)}`)]),
    piege("c", [texte("Dans "), latex(`(${moinsH(h)})^2`), texte(", l'abscisse du sommet est "), latex(q(h)), texte(" et non "), latex(`${q(-h)}\\text{.}`)]),
  ];
}

function etapesDepuisFactorisee(e: E): EtapeCorrection[] {
  const { a, h, k } = e;
  const [r1, r2] = zeros(e) as [number, number];
  const fact = factoriseeLatex(a, r1, r2);
  const dev = developpeeLatex(e);
  const canon = canoniqueDe(e);
  const c = developpe(e)[2];
  const brut = somme([
    [1, "x^2"],
    [-r2, "x"],
    [-r1, "x"],
    [r1 * r2, ""],
  ]);
  const reduit = polynome([1, -(r1 + r2), r1 * r2]);
  const lignesA: LigneCalcul[] = [ligne(`f(x)=${fact}`)];
  if (a === 1) {
    lignesA.push(ligne(`=${brut}`, "chaque terme du premier facteur par chaque terme du second"), ligne(`=${reduit}`, "on réduit"));
  } else {
    lignesA.push(ligne(`=${coefDevant(a)}(${brut})`, "chaque terme du premier facteur par chaque terme du second"), ligne(`=${coefDevant(a)}(${reduit})`, "on réduit"), ligne(`=${dev}`, `on distribue ${nombreTexte(a)} sur chaque terme`));
  }
  const rv = r1 !== 0 ? r1 : r2;
  return [
    utilise("a", [texte("Double distributivité (chaque terme du premier facteur par chaque terme du second), puis a distribué sur chaque terme "), texte(COURS_TRANSFORMER), texte(".")]),
    calcul("a", sansDoublons(lignesA)),
    resultat("a", [latex(`f(x)=${dev}`)]),
    verification("a", [texte("Même ordonnée à l'origine dans les deux écritures : ")], [ligne(`f(0)=${q(a)}\\cdot ${qp(-r1)}\\cdot ${qp(-r2)}`, "dans la forme factorisée"), ligne(`=${q(c)}`, "c'est bien le terme constant")]),
    piege("a", [texte("Le terme en x vaut "), latex("-(x_1+x_2)x"), texte(" : attention aux signes, et a multiplie chaque terme, pas seulement "), latex("x^2"), texte(".")]),
    utilise("b", [texte("L'axe de symétrie passe au milieu des deux zéros : "), latex("x_S=\\dfrac{x_1+x_2}{2}"), texte(` ${COURS_ETUDIER} ; puis `), latex("y_S=f(x_S)"), texte(".")]),
    calcul("b", [
      ligne(`x_1=${q(r1)}`, `le facteur ${r1 === 0 ? "x" : moinsH(r1).replace("-", " − ").replace("+", " + ")} s'annule`),
      ligne(`x_2=${q(r2)}`, `le facteur ${r2 === 0 ? "x" : moinsH(r2).replace("-", " − ").replace("+", " + ")} s'annule`),
      ligne(`x_S=\\dfrac{${q(r1)}+${qp(r2)}}{2}`, "milieu des zéros"),
      ligne(`=${q(h)}`),
      ligne(`y_S=f(${q(h)})`, "image de l'abscisse du sommet"),
      ligne(`=${coefDevant(a)}(${q(h)}${plusQ(-r1)})(${q(h)}${plusQ(-r2)})`, "dans la forme factorisée"),
      ligne(`=${q(a)}\\cdot ${qp(h - r1)}\\cdot ${qp(h - r2)}`),
      ligne(`=${q(k)}`),
    ]),
    resultat("b", reponseSommet(e)),
    piege("b", [texte("Les zéros sont les nombres qui annulent les facteurs : "), latex(facteurZero(rv)), texte(" s'annule pour "), latex(`x=${q(rv)}`), texte(", pas pour "), latex(`x=${q(-rv)}\\text{.}`)]),
    utilise("c", [texte("Forme canonique "), latex("a(x-x_S)^2+y_S"), texte(`, avec le même a et le sommet trouvé ${COURS_TRANSFORMER}.`)]),
    calcul("c", [ligne("f(x)=a(x-x_S)^2+y_S", "forme canonique"), ligne(`=${canon}`, `a = ${nombreTexte(a)}, S(${nombreTexte(h)} ; ${nombreTexte(k)})`)]),
    resultat("c", [latex(`f(x)=${canon}`)]),
    verification("c", [texte("En développant, on retrouve la forme développée de l'étape 1 : ")], lignesDevCanonique(e, canon)),
    piege("c", [texte("Dans "), latex("a(x-x_S)^2"), texte(", le nombre écrit dans la parenthèse est l'opposé de "), latex("x_S"), texte(" : ici "), latex(`(${moinsH(h)})^2\\text{.}`)]),
  ];
}

export function correctionDetailleeTroisEcritures(e: E): EtapeCorrection[] {
  if (e.variante === "depuisCanonique") return etapesDepuisCanonique(e);
  if (e.variante === "depuisDeveloppee") return etapesDepuisDeveloppee(e);
  return etapesDepuisFactorisee(e);
}

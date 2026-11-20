import { latex, texte } from "../../export/corrigeTableau";
import type { ExerciceTroisEcritures } from "../core/troisEcritures.types";
import { developpe, zeros } from "../generateurs/troisEcritures";
import type { Poly2 } from "../moteur/algebreTransfertSecondDegre";
import type { Champ, EcranTSD, Fragments } from "./ecransTransfertSecondDegre";
import { mono, moinsH, plusQ, polynome, q, qp } from "./corrigeChapitre3";

/**
 * Textes et écrans de gen126 « Trois écritures d'une parabole » — SOURCE UNIQUE pour l'écran, les
 * aides, le papier et le corrigé. Notation du cours (§ 2) : forme canonique a(x − x_S)² + y_S,
 * sommet S(x_S ; y_S), forme factorisée a(x − x₁)(x − x₂) ; « − » typographique, aucune notation
 * clavier. Aucun « Δ » (chapitre 1).
 */

type E = ExerciceTroisEcritures;

/** Coefficient écrit devant une parenthèse : « » (1), « - » (−1), « 2 », « -3 ». */
export function coefDevant(a: number): string {
  return a === 1 ? "" : a === -1 ? "-" : q(a);
}

/** `a(x - h)^2 + k`. */
export function canoniqueLatex(a: number, h: number, k: number): string {
  return `${coefDevant(a)}(${moinsH(h)})^2${plusQ(k)}`;
}

/** Facteur du premier degré d'un zéro r : `x` ou `(x - r)`. */
export function facteurZero(r: number): string {
  return r === 0 ? "x" : `(${moinsH(r)})`;
}

/** `a(x - r1)(x - r2)` (facteur « x » écrit en premier). */
export function factoriseeLatex(a: number, r1: number, r2: number): string {
  const [u, v] = r2 === 0 ? [r2, r1] : [r1, r2];
  return `${coefDevant(a)}${facteurZero(u)}${facteurZero(v)}`;
}

export function developpeeLatex(e: E): string {
  return polynome(developpe(e));
}

/** `a(x^2 + px) + c` (a mis en évidence sur les deux premiers termes). */
export function evidenceLatex(e: E): string {
  const [, b, c] = developpe(e);
  return `${coefDevant(e.a)}(${polynome([1, b / e.a, 0])})${plusQ(c)}`;
}

export function canoniqueDe(e: E): string {
  return canoniqueLatex(e.a, e.h, e.k);
}

export function factoriseeDe(e: E): string {
  const z = zeros(e);
  return z.length === 2 ? factoriseeLatex(e.a, z[0]!, z[1]!) : "";
}

/** Écriture donnée dans l'énoncé. */
export function ecritureDonnee(e: E): string {
  if (e.variante === "depuisCanonique") return canoniqueDe(e);
  if (e.variante === "depuisDeveloppee") return developpeeLatex(e);
  return factoriseeDe(e);
}

export function enonceFragments(e: E): Fragments {
  return [texte("On donne "), latex(`f(x)=${ecritureDonnee(e)}\\text{.}`)];
}

export const CONSIGNES_GLOBALES: Record<E["variante"], string> = {
  depuisCanonique: "Écris f sous forme développée, puis cherche ses zéros à partir de la forme canonique et, s'il y en a, écris f sous forme factorisée.",
  depuisDeveloppee: "Écris f sous forme canonique, puis donne le sommet S de sa parabole.",
  depuisFactorisee: "Écris f sous forme développée, calcule le sommet S de sa parabole, puis écris f sous forme canonique.",
};

export function consigneGlobale(e: E): string {
  return CONSIGNES_GLOBALES[e.variante];
}

export const TITRES: Record<E["variante"], string[]> = {
  depuisCanonique: ["Forme développée", "Les zéros", "Forme factorisée"],
  depuisDeveloppee: ["a en évidence", "Forme canonique", "Le sommet"],
  depuisFactorisee: ["Forme développée", "Le sommet", "Forme canonique"],
};

/** Écran sans zéro : la forme factorisée n'existe pas (le dernier écran disparaît). */
export function nombreEcrans(e: E): number {
  return e.variante === "depuisCanonique" && e.d === null ? 2 : 3;
}

// ---------------------------------------------------------------------------------------------
// Pièges
// ---------------------------------------------------------------------------------------------

const MSG_DOUBLE_PRODUIT = "Le carré d'une différence a trois termes : $(x-p)^2=x^2-2px+p^2$ — n'oublie pas le double produit.";
const MSG_SIGNE_DOUBLE = "Revois le signe du terme en x : $(x-p)^2=x^2-2px+p^2$ et $(x+p)^2=x^2+2px+p^2$.";
const MSG_A_PARTOUT = "a multiplie chaque terme du carré développé, y compris son terme constant.";
const MSG_A_OUBLIE = "N'oublie pas le coefficient a devant le carré (ou devant le produit).";

function sansDoublonsPieges(cible: Poly2, pieges: { poly: Poly2; message: string }[]): { poly: Poly2; message: string }[] {
  const egal = (p: Poly2, r: Poly2) => p.every((c, i) => Math.abs(c - r[i]!) < 1e-9);
  const out: { poly: Poly2; message: string }[] = [];
  for (const p of pieges) if (!egal(p.poly, cible) && !out.some((o) => egal(o.poly, p.poly))) out.push(p);
  return out;
}

function piegesDeveloppementCanonique(e: E): { poly: Poly2; message: string }[] {
  const { a, h, k } = e;
  return sansDoublonsPieges(developpe(e), [
    { poly: [a, 0, a * h * h + k], message: MSG_DOUBLE_PRODUIT },
    { poly: [a, 0, -a * h * h + k], message: MSG_DOUBLE_PRODUIT },
    { poly: [a, 2 * a * h, a * h * h + k], message: MSG_SIGNE_DOUBLE },
    { poly: [a, -2 * a * h, h * h + k], message: MSG_A_PARTOUT },
    { poly: [1, -2 * h, h * h + k], message: MSG_A_OUBLIE },
  ]);
}

function piegesCanonique(e: E): { poly: Poly2; message: string }[] {
  const { a, h, k } = e;
  const c = developpe(e)[2];
  return sansDoublonsPieges(developpe(e), [
    { poly: [a, -2 * a * h, a * h * h + c - h * h], message: "Le nombre sorti du crochet doit être multiplié par a avant d'être ajouté à c." },
    { poly: [a, 2 * a * h, a * h * h + k], message: "Revois le signe dans la parenthèse : $x^2-2px=(x-p)^2-p^2$ et $x^2+2px=(x+p)^2-p^2$." },
    { poly: [1, -2 * h, h * h + k], message: MSG_A_OUBLIE },
    { poly: [a, -2 * a * h, a * h * h - k], message: "Revois le signe de la constante $y_S$." },
  ]);
}

// ---------------------------------------------------------------------------------------------
// Écrans
// ---------------------------------------------------------------------------------------------

const LIBELLE_F: Fragments = [latex("f(x)=")];

function champExpression(id: string, e: E, forme: "developpee" | "canonique" | "factorisee" | "evidence", pieges: { poly: Poly2; message: string }[], messageSiFaux: string): Champ {
  return { type: "expression", id, libelle: LIBELLE_F, variable: "x", cible: developpe(e), pieges, forme, messageSiFaux };
}

function champSommet(e: E, piegesX: { valeur: number; message: string }[], piegesY: { valeur: number; message: string }[]): Champ[] {
  const filtre = (cible: number, p: { valeur: number; message: string }[]) => p.filter((x, i) => Math.abs(x.valeur - cible) > 1e-9 && p.findIndex((y) => Math.abs(y.valeur - x.valeur) < 1e-9) === i);
  return [
    { type: "nombre", id: "xS", libelle: [latex("x_S=")], cible: e.h, pieges: filtre(e.h, piegesX), messageSiFaux: "Revois l'abscisse du sommet." },
    { type: "nombre", id: "yS", libelle: [latex("y_S=")], cible: e.k, pieges: filtre(e.k, piegesY), messageSiFaux: "Revois l'ordonnée du sommet : c'est l'image de son abscisse, $y_S=f(x_S)$." },
  ];
}

export function reponseSommet(e: E): Fragments {
  return [latex(`S(${q(e.h)}\\,;${q(e.k)})`)];
}

function ecransCanonique(e: E): EcranTSD[] {
  const { a, h, k } = e;
  const z = zeros(e);
  const dev = developpeeLatex(e);
  const c0 = `${canoniqueDe(e)}=0`;
  const ecranDev: EcranTSD = {
    type: "champs",
    titre: TITRES.depuisCanonique[0]!,
    consigne: [texte("Écris "), latex("f(x)"), texte(" sous forme développée "), latex("ax^2+bx+c"), texte(".")],
    champs: [champExpression("dev", e, "developpee", piegesDeveloppementCanonique(e), "Développe le carré, distribue a, puis réduis.")],
    aides: [
      [texte("Développe le carré avec "), latex("(x-p)^2=x^2-2px+p^2"), texte(" (ou "), latex("(x+p)^2=x^2+2px+p^2"), texte("), puis distribue a sur chaque terme et ajoute "), latex("y_S"), texte(".")],
      a === 1
        ? [texte("Ici "), latex(`(${moinsH(h)})^2=${polynome([1, -2 * h, h * h])}`), texte(" ; il reste à ajouter "), latex(`${q(k)}`), texte(" et à réduire.")]
        : [texte("Ici "), latex(`(${moinsH(h)})^2=${polynome([1, -2 * h, h * h])}`), texte(" ; il reste à multiplier chaque terme par "), latex(qp(a)), texte(", à ajouter "), latex(`${q(k)}`), texte(" et à réduire.")],
    ],
    reponse: [latex(`f(x)=${dev}`)],
  };
  const piegesZeros: { valeurs: number[]; message: string }[] = [];
  if (z.length === 2) {
    const d = e.d!;
    piegesZeros.push({ valeurs: [-h - d, -h + d], message: "Attention au signe : $x-x_S=\\pm m$ donne $x=x_S\\pm m$ ; dans $(x+p)$, $x_S=-p$." });
    piegesZeros.push({ valeurs: [-d, d], message: "Tu as trouvé les valeurs de $x-x_S$ : il reste à ajouter $x_S$." });
    const r = Math.sqrt(-k);
    if (a !== 1 && -k > 0 && Number.isInteger(r)) piegesZeros.push({ valeurs: [h - r, h + r], message: "Avant de prendre la racine carrée, divise par a pour isoler le carré." });
    piegesZeros.push({ valeurs: [], message: "Isole le carré : il est égal à un nombre positif, qui a deux racines carrées opposées." });
  }
  const ecranZeros: EcranTSD = {
    type: "champs",
    titre: TITRES.depuisCanonique[1]!,
    consigne: [texte("Résous "), latex("f(x)=0"), texte(" à partir de la forme canonique : donne les zéros de f, ou écris « aucun » s'il n'y en a pas.")],
    champs: [
      {
        type: "liste",
        id: "zeros",
        libelle: [texte("Zéros de f :")],
        cibles: z,
        pieges: piegesZeros.filter((p) => !(p.valeurs.length === z.length && p.valeurs.every((v) => z.includes(v)))),
        videPermis: true,
        messageSiFaux: "Isole le carré, puis regarde le signe du nombre obtenu : un carré n'est jamais négatif, et un nombre positif a deux racines carrées opposées.",
      },
    ],
    aides: [
      [texte("Sur la forme canonique, isole le carré : "), latex("(x-x_S)^2=-\\dfrac{y_S}{a}"), texte(". Un carré n'est jamais négatif ; s'il vaut un nombre positif m, alors "), latex("x-x_S=\\sqrt{m}"), texte(" ou "), latex("x-x_S=-\\sqrt{m}"), texte(".")],
      a === 1
        ? [texte("Ici "), latex(`${c0}`), texte(" : fais passer "), latex(q(k)), texte(" dans l'autre membre, puis regarde le signe du nombre obtenu.")]
        : [texte("Ici "), latex(`${c0}`), texte(" : fais passer "), latex(q(k)), texte(" dans l'autre membre, divise par "), latex(qp(a)), texte(", puis regarde le signe du nombre obtenu.")],
    ],
    reponse: z.length === 2 ? [texte("Deux zéros : "), latex(`x_1=${q(z[0]!)}`), texte(" et "), latex(`x_2=${q(z[1]!)}`), texte(".")] : [texte("Aucun zéro : le carré devrait être égal à un nombre négatif. f n'a donc pas de forme factorisée.")],
  };
  if (z.length < 2) return [ecranDev, ecranZeros];
  const [r1, r2] = z as [number, number];
  const ecranFact: EcranTSD = {
    type: "champs",
    titre: TITRES.depuisCanonique[2]!,
    consigne: [texte("Écris "), latex("f(x)"), texte(" sous forme factorisée "), latex("a(x-x_1)(x-x_2)"), texte(".")],
    champs: [
      champExpression(
        "fact",
        e,
        "factorisee",
        sansDoublonsPieges(developpe(e), [
          { poly: [1, -(r1 + r2), r1 * r2], message: "Garde le coefficient a devant : $a(x-x_1)(x-x_2)$." },
          { poly: [a, a * (r1 + r2), a * r1 * r2], message: "Pour le zéro r, le facteur est $(x-r)$ : un zéro positif donne une soustraction." },
        ]),
        "Écris a, puis un facteur $(x-r)$ pour chaque zéro r.",
      ),
    ],
    aides: [
      [texte("Une parabole qui coupe l'axe des x en "), latex("x_1"), texte(" et "), latex("x_2"), texte(" a pour expression "), latex("a(x-x_1)(x-x_2)"), texte(", avec le même a que dans les autres écritures.")],
      [texte("Vérifie ta réponse en la développant : tu dois retrouver "), latex(`${dev}\\text{.}`)],
    ],
    reponse: [latex(`f(x)=${factoriseeLatex(a, r1, r2)}`)],
  };
  return [ecranDev, ecranZeros, ecranFact];
}

function ecransDeveloppee(e: E): EcranTSD[] {
  const { a, h, k } = e;
  const [, b, c] = developpe(e);
  const ecranEvidence: EcranTSD = {
    type: "champs",
    titre: TITRES.depuisDeveloppee[0]!,
    consigne: [texte("Mets a en évidence sur les termes en "), latex("x^2"), texte(" et en x : écris "), latex("f(x)"), texte(" sous la forme "), latex("a\\left(x^2+\\ldots x\\right)+c"), texte(".")],
    champs: [
      champExpression(
        "evid",
        e,
        "evidence",
        sansDoublonsPieges(developpe(e), [
          { poly: [a, a * b, c], message: "Divise aussi le coefficient de x par a : $ax^2+bx=a\\left(x^2+\\dfrac{b}{a}x\\right)$." },
          { poly: [a, -b, c], message: "Attention au signe en divisant le coefficient de x par a." },
          { poly: [a, b, a * c], message: "c reste en dehors de la parenthèse : on met a en évidence sur les termes en $x^2$ et en x seulement." },
        ]),
        "Divise le coefficient de $x^2$ et celui de x par a ; c reste dehors.",
      ),
    ],
    aides: [
      [texte("On met a en évidence sur les termes en "), latex("x^2"), texte(" et en x seulement : "), latex("ax^2+bx+c=a\\left(x^2+\\dfrac{b}{a}x\\right)+c"), texte(".")],
      [texte("Ici a = "), latex(q(a)), texte(" : divise "), latex(mono(a, "x^2")), texte(" et "), latex(mono(b, "x")), texte(" par "), latex(qp(a)), texte(" ; "), latex(q(c)), texte(" reste dehors.")],
    ],
    reponse: [latex(`f(x)=${evidenceLatex(e)}`)],
  };
  const ecranCanon: EcranTSD = {
    type: "champs",
    titre: TITRES.depuisDeveloppee[1]!,
    consigne: [texte("Complète le carré : écris "), latex("f(x)"), texte(" sous forme canonique "), latex("a(x-x_S)^2+y_S"), texte(".")],
    champs: [champExpression("canon", e, "canonique", piegesCanonique(e), "Complète le carré dans la parenthèse, puis redistribue a sur les deux termes du crochet.")],
    aides: [
      [texte("Complète le carré dans la parenthèse : "), latex("x^2+px=\\left(x+\\dfrac{p}{2}\\right)^2-\\left(\\dfrac{p}{2}\\right)^2"), texte(", puis multiplie les deux termes du crochet par a.")],
      [texte("Ici "), latex(`${polynome([1, -2 * h, 0])}=(${moinsH(h)})^2-${q(h * h)}`), texte(" ; il reste à multiplier le crochet par "), latex(qp(a)), texte(" et à ajouter "), latex(`${q(c)}\\text{.}`)],
    ],
    reponse: [latex(`f(x)=${canoniqueDe(e)}`)],
  };
  const ecranSommet: EcranTSD = {
    type: "champs",
    titre: TITRES.depuisDeveloppee[2]!,
    consigne: [texte("Donne les coordonnées du sommet "), latex("S(x_S\\,;y_S)"), texte(" de la parabole.")],
    champs: champSommet(
      e,
      [
        { valeur: -h, message: "Lis le signe dans la parenthèse : $x-x_S$ ; dans $(x+p)$, $x_S=-p$." },
        { valeur: k, message: "C'est l'ordonnée du sommet : l'abscisse se lit dans la parenthèse." },
      ],
      [
        { valeur: -k, message: "$y_S$ est la constante de la forme canonique, avec son signe." },
        { valeur: h, message: "C'est l'abscisse du sommet : l'ordonnée est la constante ajoutée au carré." },
      ],
    ),
    aides: [
      [texte("Dans "), latex("a(x-x_S)^2+y_S"), texte(", le sommet est "), latex("S(x_S\\,;y_S)"), texte(".")],
      [texte("Attention au signe dans la parenthèse : "), latex("(x+2)^2=\\big(x-(-2)\\big)^2"), texte(" donne "), latex("x_S=-2"), texte(". Contrôle : "), latex("y_S=f(x_S)"), texte(".")],
    ],
    reponse: reponseSommet(e),
  };
  return [ecranEvidence, ecranCanon, ecranSommet];
}

function ecransFactorisee(e: E): EcranTSD[] {
  const { a, h, k } = e;
  const [r1, r2] = zeros(e) as [number, number];
  const dev = developpeeLatex(e);
  const ecranDev: EcranTSD = {
    type: "champs",
    titre: TITRES.depuisFactorisee[0]!,
    consigne: [texte("Écris "), latex("f(x)"), texte(" sous forme développée "), latex("ax^2+bx+c"), texte(".")],
    champs: [
      champExpression(
        "dev",
        e,
        "developpee",
        sansDoublonsPieges(developpe(e), [
          { poly: [a, a * (r1 + r2), a * r1 * r2], message: "$(x-x_1)(x-x_2)=x^2-(x_1+x_2)x+x_1x_2$ : attention aux signes." },
          { poly: [1, -(r1 + r2), r1 * r2], message: "Multiplie ensuite le produit développé par a." },
          { poly: [a, -(r1 + r2), r1 * r2], message: "a multiplie chaque terme du produit développé, pas seulement $x^2$." },
        ]),
        "Développe le produit des deux facteurs, réduis, puis multiplie chaque terme par a.",
      ),
    ],
    aides: [
      [texte("Développe le produit des deux facteurs (chaque terme du premier par chaque terme du second), réduis, puis multiplie chaque terme par a.")],
      [texte("Le produit développé vaut "), latex("x^2-(x_1+x_2)x+x_1x_2"), texte(" ; ici "), latex(`x_1=${q(r1)}`), texte(" et "), latex(`x_2=${q(r2)}`), texte(" (les nombres qui annulent les facteurs).")],
    ],
    reponse: [latex(`f(x)=${dev}`)],
  };
  const ecranSommet: EcranTSD = {
    type: "champs",
    titre: TITRES.depuisFactorisee[1]!,
    consigne: [texte("Calcule les coordonnées du sommet "), latex("S(x_S\\,;y_S)"), texte(" de la parabole.")],
    champs: champSommet(
      e,
      [
        { valeur: -h, message: "Le milieu se calcule avec les zéros eux-mêmes : le facteur $(x-r)$ s'annule pour $x=r$." },
        { valeur: e.d!, message: "C'est la demi-distance entre les zéros ; l'abscisse du sommet est leur milieu $\\dfrac{x_1+x_2}{2}$." },
      ],
      [
        { valeur: -k, message: "Remplace x par $x_S$ dans f et attention aux signes du produit." },
        { valeur: a * (-h - r1) * (-h - r2), message: "Remplace x par $x_S$, avec son signe." },
      ],
    ),
    aides: [
      [texte("L'axe de symétrie passe au milieu des deux zéros : "), latex("x_S=\\dfrac{x_1+x_2}{2}"), texte(" ; puis "), latex("y_S=f(x_S)"), texte(".")],
      [texte("Les zéros sont "), latex(q(r1)), texte(" et "), latex(q(r2)), texte(" (là où un facteur s'annule) : calcule leur milieu, puis remplace x par ce milieu dans la forme factorisée.")],
    ],
    reponse: reponseSommet(e),
  };
  const ecranCanon: EcranTSD = {
    type: "champs",
    titre: TITRES.depuisFactorisee[2]!,
    consigne: [texte("Écris "), latex("f(x)"), texte(" sous forme canonique "), latex("a(x-x_S)^2+y_S"), texte(".")],
    champs: [
      champExpression(
        "canon",
        e,
        "canonique",
        sansDoublonsPieges(developpe(e), [
          { poly: [a, 2 * a * h, a * h * h + k], message: "Revois le signe dans la parenthèse : $a(x-x_S)^2$, avec $x_S$ et son signe." },
          { poly: [1, -2 * h, h * h + k], message: MSG_A_OUBLIE },
          { poly: [a, -2 * a * h, a * h * h - k], message: "Revois le signe de la constante $y_S$." },
        ]),
        "Écris a, le sommet trouvé à l'étape précédente, sous la forme $a(x-x_S)^2+y_S$.",
      ),
    ],
    aides: [
      [latex("f(x)=a(x-x_S)^2+y_S"), texte(" : a est le même que dans la forme factorisée, et S est le sommet de l'étape précédente.")],
      [texte("Vérifie : en développant ta forme canonique, tu dois retrouver "), latex(`${dev}\\text{.}`)],
    ],
    reponse: [latex(`f(x)=${canoniqueDe(e)}`)],
  };
  return [ecranDev, ecranSommet, ecranCanon];
}

export function ecrans(e: E): EcranTSD[] {
  if (e.variante === "depuisCanonique") return ecransCanonique(e);
  if (e.variante === "depuisDeveloppee") return ecransDeveloppee(e);
  return ecransFactorisee(e);
}

/** Réponse finale (page « Je vérifie ») — une écriture par étape, sans lettres. */
export function reponseBreveFragments(e: E): Fragments {
  const z = zeros(e);
  if (e.variante === "depuisCanonique") {
    if (z.length < 2) return [latex(`f(x)=${developpeeLatex(e)}`), texte(" ; f n'a aucun zéro, donc pas de forme factorisée.")];
    return [latex(`f(x)=${developpeeLatex(e)}`), texte(" ; zéros "), latex(q(z[0]!)), texte(" et "), latex(q(z[1]!)), texte(" ; "), latex(`f(x)=${factoriseeDe(e)}\\text{.}`)];
  }
  if (e.variante === "depuisDeveloppee") return [latex(`f(x)=${canoniqueDe(e)}`), texte(" ; sommet "), latex(`S(${q(e.h)}\\,;${q(e.k)})\\text{.}`)];
  return [latex(`f(x)=${developpeeLatex(e)}`), texte(" ; sommet "), latex(`S(${q(e.h)}\\,;${q(e.k)})`), texte(" ; "), latex(`f(x)=${canoniqueDe(e)}\\text{.}`)];
}

/** Exemples de saisies justes AUTREMENT écrites (tests du moteur). */
export function saisiesJustes(e: E): Record<string, string[]> {
  const [a, b, c] = developpe(e);
  const n = (v: number) => (v < 0 ? `(−${-v})` : String(v));
  const z = zeros(e);
  const out: Record<string, string[]> = {
    dev: [`${c} + ${n(b)}x + ${n(a)}x²`, `f(x) = ${a}x^2 ${b < 0 ? "−" : "+"} ${Math.abs(b)}x ${c < 0 ? "–" : "+"} ${Math.abs(c)}`],
    canon: [`${e.k} + ${a}(x ${e.h < 0 ? "+" : "−"} ${Math.abs(e.h)})²`, `${a}*(${-e.h} + x)^2 + ${n(e.k)}`],
    evid: [`${c} + ${a}(x² ${b / a < 0 ? "—" : "+"} ${Math.abs(b / a)}x)`],
    zeros: z.length ? [`${z[1]} ; ${z[0]}`, `x = ${z[0]} ou x = ${z[1]}`] : ["aucun", "aucune solution"],
    xS: [String(e.h).replace("-", "−")],
    yS: [String(e.k).replace("-", "–")],
  };
  if (z.length === 2) out.fact = [`${a}(${z[1] === 0 ? "x" : `x ${z[1]! < 0 ? "+" : "−"} ${Math.abs(z[1]!)}`})(x ${z[0]! < 0 ? "+" : "−"} ${Math.abs(z[0]!)})`, `(x - ${n(z[0]!)})·${n(a)}·(x - ${n(z[1]!)})`];
  return out;
}

/** Écritures JUSTES mais dans une autre forme que celle demandée (tests : message sans perte). */
export function saisiesAutreForme(e: E): Record<string, string[]> {
  const dev = `${developpe(e)[0]}x^2 + ${developpe(e)[1]}x + ${developpe(e)[2]}`;
  const canon = `${e.a}(x - ${e.h})^2 + ${e.k}`;
  const z = zeros(e);
  const out: Record<string, string[]> = { dev: [canon], canon: [dev], evid: [dev, canon] };
  if (z.length === 2) {
    out.fact = [dev, canon];
    out.dev.push(`${e.a}(x - ${z[0]})(x - ${z[1]})`);
    out.canon.push(`${e.a}(x - ${z[0]})(x - ${z[1]})`);
  }
  return out;
}

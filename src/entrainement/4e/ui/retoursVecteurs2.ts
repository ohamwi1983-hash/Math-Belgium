import { latex, texte } from "../../export/corrigeTableau";
import type { ExerciceCombinaisonVecteurs, GroupeCombinaison } from "../core/combinaisonVecteurs.types";
import type { ExerciceConstructionVectorielle } from "../core/constructionVectorielle.types";
import type { ComposantesLin, ExerciceColinearParametre, ExerciceColinearParametreCarre, ExerciceColinearPoints, ExerciceColinearPointsParametre, ExerciceColinearVecteurs } from "../core/colinearite.types";
import { diagnostiquerComposanteLineaire, diagnostiquerReductionAvecX } from "../moteur/verificationColinearite";
import { diagnostiquerFormeCanonique } from "../moteur/expressionAlgebrique";
import { moinsPoly, plusPoly, polyLatex, produitLin, type Poly } from "./corrigeVecteurs1";
import { formuleSubstitueeLatex, versLin } from "./formatColinearite";
import { idCanoniqueRef, signeConversionRef } from "../generateurs/combinaisonVecteurs";
import { parserCombinaisonVecteurs, coefficientsEgaux } from "../moteur/expressionVectorielle";
import { coefVec, q, qp, vec, type V } from "./corrigeVecteurs1";
import { formatSommeAxesLatex } from "./formatCombinaisonVecteurs";
import { MESSAGE_COMPOSANTES_INVERSEES, egal, memePoint, type Fragments, type Niveaux } from "./retoursVecteurs";

/**
 * Aides à deux niveaux et messages ciblés des générateurs 22 à 26 du 4e ch. 6 (audit, lot B) — voir
 * l'en-tête de `retoursVecteurs.ts`. Jamais la réponse : le niveau 2 pose UN calcul de l'instance
 * (un groupe distribué, une composante substituée), l'élève fait le reste.
 */

// ---------------------------------------------------------------------------------------------
// gen22 — combinaison linéaire : réduction, puis composantes
// ---------------------------------------------------------------------------------------------

function lettres(t: GroupeCombinaison["termes"][number]): string {
  return t.ref.type === "libre" ? t.ref.nom : `${t.ref.depart}${t.ref.arrivee}`;
}

/** Coefficients réduits obtenus par une erreur typique (`variante` : quelle règle est mal appliquée). */
function reductionErronee(e: ExerciceCombinaisonVecteurs, erreur: "sansConversion" | "externePremier" | "signePremier"): Record<string, number> {
  const acc: Record<string, number> = Object.fromEntries(e.baseCanonique.map((id) => [id, 0]));
  e.groupes.forEach((g, i) => {
    const signe = i === 0 ? 1 : e.operateurs[i - 1] === "-" ? -1 : 1;
    g.termes.forEach((t, j) => {
      const ext = erreur === "externePremier" && j > 0 ? 1 : g.coefficientExterne;
      const sg = erreur === "signePremier" && j > 0 ? 1 : signe;
      const conv = erreur === "sansConversion" ? 1 : signeConversionRef(t.ref);
      acc[idCanoniqueRef(t.ref)] += sg * ext * t.coefficient * conv;
    });
  });
  return acc;
}

export function aidesReductionCombinaison(e: ExerciceCombinaisonVecteurs): Niveaux {
  const n1: Fragments = [
    texte("Un coefficient devant une parenthèse multiplie chacun de ses termes, et un « − » devant un groupe change le signe de chacun d'eux"),
    ...(e.points ? [texte(" ; "), latex("\\vec{BA}=-\\vec{AB}"), texte(" : un terme en "), latex("\\vec{BA}"), texte(" s'écrit avec "), latex("\\vec{AB}"), texte(" en changeant de signe")] : []),
    texte(". Additionne enfin les coefficients d'un même vecteur."),
  ];
  // Niveau 2 : le PREMIER terme du premier groupe à parenthèses seulement (jamais toute
  // l'expression distribuée, qui est la réponse à l'ordre près dans la variante « parenthèses »).
  const g = e.groupes.find((x) => x.termes.length > 1);
  const n2: Fragments = [];
  if (g) {
    const t = g.termes[0];
    n2.push(texte("Par exemple, dans "), latex(`${q(g.coefficientExterne)}(\\dots)`), texte(", le premier terme devient "), latex(`${q(g.coefficientExterne)}\\times ${qp(t.coefficient)}${vec(lettres(t))}=${coefVec(g.coefficientExterne * t.coefficient)}${vec(lettres(t))}`), texte(". Fais de même pour chaque terme"));
  } else {
    n2.push(texte("Chaque terme a déjà son coefficient"));
  }
  const repetes = e.baseCanonique.filter((id) => e.groupes.flatMap((x) => x.termes).filter((t) => idCanoniqueRef(t.ref) === id).length >= 2);
  if (repetes.length > 0) n2.push(texte(", puis additionne les coefficients de "), latex(repetes.map((id) => vec(id)).join(",\\ ")), texte(", qui apparaissent plusieurs fois."));
  else n2.push(texte("."));
  return [n1, n2];
}

/** Message ciblé de l'écran « réduction » ; `null` si la saisie ne trahit aucune erreur connue. */
export function messageReductionCombinaison(e: ExerciceCombinaisonVecteurs, saisieTexte: string): Fragments | null {
  if (e.points && /BA/i.test(saisieTexte.replace(/\s+/g, ""))) {
    return [texte("Exprime le résultat avec "), latex("\\vec{AB}"), texte(" : "), latex("\\vec{BA}=-\\vec{AB}"), texte(".")];
  }
  const lus = parserCombinaisonVecteurs(saisieTexte, e.baseCanonique);
  if (!lus || coefficientsEgaux(lus, e.coefficientsReduits, e.baseCanonique)) return null;
  const essais: { erreur: "sansConversion" | "externePremier" | "signePremier"; message: Fragments }[] = [
    { erreur: "sansConversion", message: [latex("\\vec{BA}=-\\vec{AB}"), texte(" : un terme en "), latex("\\vec{BA}"), texte(" change de signe quand on l'écrit avec "), latex("\\vec{AB}"), texte(".")] },
    { erreur: "externePremier", message: [texte("Le coefficient devant la parenthèse multiplie tous ses termes, pas seulement le premier.")] },
    { erreur: "signePremier", message: [texte("Un « − » devant un groupe change le signe de tous ses termes, pas seulement du premier.")] },
  ];
  for (const { erreur, message } of essais) {
    if (erreur === "sansConversion" && !e.points) continue;
    const r = reductionErronee(e, erreur);
    if (!coefficientsEgaux(r, e.coefficientsReduits, e.baseCanonique) && coefficientsEgaux(lus, r, e.baseCanonique)) return message;
  }
  return null;
}

/** Saisie de l'écran « réduction » lisible : combinaison des vecteurs de la base (ou contenant BA,
 * que le message ciblé signale — une tentative, puisque l'écriture est lisible). */
export function reductionLisible(e: ExerciceCombinaisonVecteurs, saisieTexte: string): boolean {
  return parserCombinaisonVecteurs(saisieTexte, e.baseCanonique) !== null || (!!e.points && parserCombinaisonVecteurs(saisieTexte, [...e.baseCanonique, "BA"]) !== null);
}

function composantesDe(e: ExerciceCombinaisonVecteurs, id: string, abInverse = false): V {
  if (id === "AB" && e.points) {
    const { A, B } = e.points;
    return abInverse ? { x: A.x - B.x, y: A.y - B.y } : { x: B.x - A.x, y: B.y - A.y };
  }
  return e.vecteursLibres.find((v) => v.nom === id)!.composantes;
}

export function aidesComposantesCombinaison(e: ExerciceCombinaisonVecteurs): Niveaux {
  const t = vec(e.resultatNom);
  const avecAB = !!e.points && e.coefficientsReduits.AB !== 0;
  const n1: Fragments = [
    ...(e.variante === "plate" ? [texte("L'expression est déjà réduite. ")] : []),
    texte("Multiplier un vecteur par un nombre multiplie ses deux composantes ; une somme se calcule composante par composante"),
    ...(avecAB ? [texte(" ; "), latex("\\vec{AB}"), texte(" a pour composantes extrémité − origine, "), latex("x_B-x_A"), texte(" et "), latex("y_B-y_A")] : []),
    texte("."),
  ];
  const n2: Fragments = [texte("Première composante : "), latex(formatSommeAxesLatex(e).x.replace(/=\s*/, "=")), texte(` (les premières composantes, chacune multipliée par son coefficient). Même calcul pour la seconde composante de `), latex(t), texte(".")];
  return [n1, n2];
}

// ---------------------------------------------------------------------------------------------
// gen23 — construction de k·AB sur le quadrillage
// ---------------------------------------------------------------------------------------------

export function aidesConstructionVectorielle(e: ExerciceConstructionVectorielle): Niveaux {
  const k = e.coefficient;
  const ab = { x: e.pointB.x - e.pointA.x, y: e.pointB.y - e.pointA.y };
  return [
    [
      latex(`${coefVec(k)}${vec("AB")}`),
      texte(" a la même direction que "),
      latex(vec("AB")),
      texte(", le même sens si le coefficient est positif, le sens contraire s'il est négatif, et une longueur multipliée par "),
      latex(`|${q(k)}|`),
      texte(". En repère : on multiplie chaque composante de "),
      latex(vec("AB")),
      texte(" par le coefficient."),
    ],
    [
      texte("Lis "),
      latex(`${vec("AB")}=${colonneSimple(ab)}`),
      texte(" sur le quadrillage. Le vecteur à tracer a pour première composante "),
      latex(`${qp(k)}\\times ${qp(ab.x)}`),
      texte(" : depuis un nœud, avance d'autant de carreaux horizontalement, puis fais de même verticalement avec la seconde composante."),
    ],
  ];
}

function colonneSimple(v: V): string {
  return `\\begin{pmatrix}${q(v.x)}\\\\${q(v.y)}\\end{pmatrix}`;
}

/** Message ciblé d'une construction fausse (`trace` = composantes du vecteur tracé). */
export function messageConstructionVectorielle(e: ExerciceConstructionVectorielle, trace: V): Fragments | null {
  const c = e.cibleComposantes;
  if (memePoint(trace, c)) return null;
  const ab = { x: e.pointB.x - e.pointA.x, y: e.pointB.y - e.pointA.y };
  if (memePoint(trace, { x: -c.x, y: -c.y })) return [texte("Bonne direction et bonne longueur, mais le sens est contraire : regarde le signe du coefficient.")];
  if (Math.abs(e.coefficient) !== 1 && (memePoint(trace, ab) || memePoint(trace, { x: -ab.x, y: -ab.y }))) return [texte("Tu as tracé un vecteur de même longueur que "), latex(vec("AB")), texte(" : il faut multiplier sa longueur par "), latex(`|${q(e.coefficient)}|`), texte(".")];
  const colineaire = Math.abs(trace.x * c.y - trace.y * c.x) < 1e-9;
  if (colineaire) return [texte("La direction est bonne, mais pas la longueur : chaque composante doit être multipliée par le coefficient.")];
  if ((egal(trace.x, c.x) && egal(trace.y, ab.y)) || (egal(trace.y, c.y) && egal(trace.x, ab.x))) return [texte("Le coefficient multiplie les deux composantes, pas une seule.")];
  return [texte("Ton vecteur n'a pas la direction de "), latex(vec("AB")), texte(" : compare les déplacements horizontal et vertical avec ceux de "), latex(vec("AB")), texte(".")];
}

// ---------------------------------------------------------------------------------------------
// gen24 — colinéarité et alignement
// ---------------------------------------------------------------------------------------------

const CRITERE_COLINEARITE: Fragments = [
  texte("Deux vecteurs "),
  latex("\\vec{u}"),
  texte(" et "),
  latex("\\vec{v}"),
  texte(" sont colinéaires si et seulement si leur critère de colinéarité est nul : "),
  latex("x_{\\vec u}\\cdot y_{\\vec v}-y_{\\vec u}\\cdot x_{\\vec v}=0"),
  texte("."),
];

type TestColin = ExerciceColinearVecteurs | ExerciceColinearPoints;

function vecteursTest(e: TestColin): [V, V, string, string] {
  return e.variante === "vecteurs" ? [e.v1, e.v2, e.v1Nom, e.v2Nom] : [e.vecteurAB, e.vecteurAC, `${e.labelA}${e.labelB}`, `${e.labelA}${e.labelC}`];
}

export function aidesTestColinearite(e: TestColin): Niveaux {
  const [u, v, nu, nv] = vecteursTest(e);
  const n1: Fragments =
    e.variante === "points"
      ? [texte(`Trois points ${e.labelA}, ${e.labelB}, ${e.labelC} sont alignés si et seulement si deux vecteurs de même origine, `), latex(vec(nu)), texte(" et "), latex(vec(nv)), texte(", sont colinéaires. "), ...CRITERE_COLINEARITE]
      : CRITERE_COLINEARITE;
  return [n1, [texte("Ici : "), latex(`${formuleSubstitueeLatex(versLin(u), versLin(v))}`), texte(" ; calcule chaque produit, une composante négative entre parenthèses, puis conclus : nul ou non nul ?")]];
}

/** Message ciblé sur une valeur fausse du critère (produit scalaire calculé, signe « + »…). */
export function messageCritereColinearite(e: TestColin, valeur: number): Fragments | null {
  const [u, v] = vecteursTest(e);
  const c = u.x * v.y - u.y * v.x;
  if (egal(valeur, c) || (e.variante === "points" && egal(valeur, -c))) return null;
  if (egal(valeur, u.x * v.x + u.y * v.y)) return [texte("Tu as calculé "), latex("x_{\\vec u}\\cdot x_{\\vec v}+y_{\\vec u}\\cdot y_{\\vec v}"), texte(", le produit scalaire, qui sert à l'orthogonalité : la colinéarité se teste avec les produits en croix "), latex("x_{\\vec u}\\cdot y_{\\vec v}-y_{\\vec u}\\cdot x_{\\vec v}"), texte(".")];
  if (egal(valeur, u.x * v.y + u.y * v.x)) return [texte("Le critère de colinéarité est une différence de produits en croix, pas une somme.")];
  if (egal(valeur, -c)) return [texte("Respecte l'ordre : "), latex("x_{\\vec u}\\cdot y_{\\vec v}"), texte(" moins "), latex("y_{\\vec u}\\cdot x_{\\vec v}"), texte(".")];
  return null;
}

/** Texte du message qui accompagne une conclusion jugée fausse (puis figée et révélée). */
export function messageConclusionColinearite(e: TestColin): Fragments {
  const [u, v] = vecteursTest(e);
  const nul = u.x * v.y - u.y * v.x === 0;
  return [texte(`La conclusion était fausse : les vecteurs ${nul ? "sont" : "ne sont pas"} colinéaires${e.variante === "points" ? `, donc les points ${nul ? "sont" : "ne sont pas"} alignés` : ""} (critère ${nul ? "nul" : "non nul"}). La bonne réponse est affichée ; il reste à calculer le critère.`)];
}

function composantesAttendues(e: ExerciceColinearPoints): { ab: V; ac: V } {
  return { ab: e.vecteurAB, ac: e.vecteurAC };
}

export function aidesConstructionColinearite(e: ExerciceColinearPoints | ExerciceColinearPointsParametre): Niveaux {
  const { labelA: a, labelB: b } = e;
  const n2: Fragments =
    e.variante === "points"
      ? [texte("Par exemple "), latex(`x_{${a}${b}}=x_${b}-x_${a}=${q(e.pointB.x)}-${qp(e.pointA.x)}`), texte(". Fais de même pour les trois autres composantes.")]
      : [texte("Par exemple "), latex(`x_{${a}${b}}=x_${b}-x_${a}`), texte(" : garde x dans l'expression et soustrais "), latex(`x_${a}=${q(e.pointA.x)}`), texte(". Fais de même pour les trois autres composantes.")];
  return [[texte(`Les deux vecteurs ont la même origine ${a}. Composantes d'un vecteur : extrémité − origine, `), latex(`\\vec{${a}${b}}=\\begin{pmatrix}x_${b}-x_${a}\\\\y_${b}-y_${a}\\end{pmatrix}`), texte(".")], n2];
}

export function messageConstructionColinearite(e: ExerciceColinearPoints, s: { abX: number; abY: number; acX: number; acY: number }): Fragments | null {
  const { ab, ac } = composantesAttendues(e);
  const inv = (egal(s.abX, -ab.x) && egal(s.abY, -ab.y) && (ab.x !== 0 || ab.y !== 0)) || (egal(s.acX, -ac.x) && egal(s.acY, -ac.y) && (ac.x !== 0 || ac.y !== 0));
  return inv ? MESSAGE_COMPOSANTES_INVERSEES : null;
}

/** Composantes en x lisibles (les quatre champs). */
export function constructionAvecXLisible(s: { abX: string; abY: string; acX: string; acY: string }): boolean {
  return [s.abX, s.abY, s.acX, s.acY].every((t) => diagnostiquerComposanteLineaire(t, { coefX: 0, constante: 0 }) !== "parse_error");
}

export function messageConstructionAvecX(e: ExerciceColinearPointsParametre, s: { abX: string; abY: string; acX: string; acY: string }): Fragments | null {
  const neg = (c: ComposantesLin["x"]) => ({ coefX: -c.coefX, constante: -c.constante });
  const ab = e.vecteurAB;
  const ac = e.vecteurAC;
  const inverse =
    (diagnostiquerComposanteLineaire(s.abX, neg(ab.x)) === "correct" && diagnostiquerComposanteLineaire(s.abY, neg(ab.y)) === "correct") ||
    (diagnostiquerComposanteLineaire(s.acX, neg(ac.x)) === "correct" && diagnostiquerComposanteLineaire(s.acY, neg(ac.y)) === "correct");
  return inverse ? MESSAGE_COMPOSANTES_INVERSEES : null;
}

type AvecX = ExerciceColinearParametre | ExerciceColinearPointsParametre | ExerciceColinearParametreCarre;

function vecteursAvecX(e: AvecX): [ComposantesLin, ComposantesLin] {
  return e.variante === "pointsParametre" ? [e.vecteurAB, e.vecteurAC] : [e.v1, e.v2];
}

export function aidesReductionColinearite(e: AvecX): Niveaux {
  const [u, v] = vecteursAvecX(e);
  return [
    [...CRITERE_COLINEARITE.slice(0, -1), texte(" ; une composante qui contient x se multiplie comme un binôme.")],
    [texte("Ici : "), latex(`${formuleSubstitueeLatex(u, v)}=0`), texte(" ; développe chaque produit, distribue le « − » sur tout le second, puis réduis.")],
  ];
}

export function reductionColineariteLisible(e: AvecX, texteSaisi: string): boolean {
  return diagnostiquerReductionAvecX(e, texteSaisi) !== "parse_error";
}

function equationVaut(texteSaisi: string, p: Poly): boolean {
  if (p.every((c) => c === 0)) return false;
  return diagnostiquerFormeCanonique(texteSaisi.replace(/[−–—]/g, "-"), { a: p[2], b: p[1], c: p[0] }) === "correct";
}

/** Colinéarité confondue avec l'orthogonalité, ou somme des produits au lieu de la différence. */
export function messageReductionColinearite(e: AvecX, texteSaisi: string): Fragments | null {
  if (diagnostiquerReductionAvecX(e, texteSaisi) === "correct") return null;
  const [u, v] = vecteursAvecX(e);
  const scalaire = plusPoly(produitLin(u.x, v.x), produitLin(u.y, v.y));
  const somme = plusPoly(produitLin(u.x, v.y), produitLin(u.y, v.x));
  const bon = moinsPoly(produitLin(u.x, v.y), produitLin(u.y, v.x));
  if (polyLatex(scalaire) !== polyLatex(bon) && equationVaut(texteSaisi, scalaire)) return [texte("C'est la condition d'orthogonalité (produit scalaire nul) : pour la colinéarité, on écrit les produits en croix, "), latex("x_{\\vec u}\\cdot y_{\\vec v}-y_{\\vec u}\\cdot x_{\\vec v}=0"), texte(".")];
  if (polyLatex(somme) !== polyLatex(bon) && equationVaut(texteSaisi, somme)) return [texte("Le critère de colinéarité est une différence de produits en croix : le « − » se distribue sur tout le second produit.")];
  return null;
}

export function aidesResolutionColinearite(e: ExerciceColinearParametre | ExerciceColinearPointsParametre): Niveaux {
  return [
    [texte("Équation du premier degré : on isole x — on retire le terme constant aux deux membres, puis on divise par le coefficient de x.")],
    [texte("Ici : "), latex(`${polyLatex([0, e.coefX, 0])}=${q(-e.coefConst)}`), texte(" ; il reste à diviser les deux membres par "), latex(q(e.coefX)), texte(".")],
  ];
}

export function messageResolutionColinearite(e: ExerciceColinearParametre | ExerciceColinearPointsParametre, valeur: number): Fragments | null {
  const sol = e.solutionX as number;
  if (egal(valeur, sol)) return null;
  if (egal(valeur, -sol)) return [texte("Erreur de signe : en passant dans l'autre membre, le terme constant change de signe.")];
  if (e.coefConst !== 0 && egal(valeur, -e.coefX / e.coefConst)) return [texte("On divise le terme constant par le coefficient de x, pas l'inverse.")];
  return null;
}

export function aidesResolutionCarre(e: ExerciceColinearParametreCarre): Niveaux {
  const { coefX2: a, coefX: b, coefConst: c } = e;
  return [
    [texte("Équation du second degré "), latex("ax^2+bx+c=0"), texte(" : on calcule "), latex("\\Delta=b^2-4ac"), texte(". Si Δ > 0, deux solutions "), latex("\\dfrac{-b\\pm\\sqrt{\\Delta}}{2a}"), texte(" ; si Δ = 0, une seule ; si Δ < 0, aucune.")],
    [texte("Ici "), latex(`a=${q(a)}`), texte(", "), latex(`b=${q(b)}`), texte(", "), latex(`c=${q(c)}`), texte(" : "), latex(`\\Delta=${qp(b)}^2-4\\cdot ${qp(a)}\\cdot ${qp(c)}`), texte(". Son signe dit combien de valeurs conviennent.")],
  ];
}

export function messageValeursCarre(e: ExerciceColinearParametreCarre, valeurs: number[]): Fragments | null {
  const sol = e.solutions;
  const toutesJustes = valeurs.every((v) => sol.some((s) => egal(v, s)));
  if (toutesJustes && sol.length === 2 && !sol.every((s) => valeurs.some((v) => egal(v, s)))) return [texte("Cette valeur est juste, mais il y en a une autre : Δ > 0 donne deux solutions.")];
  if (valeurs.length > 0 && valeurs.every((v) => sol.some((s) => egal(v, -s))) && !toutesJustes) return [texte("Erreur de signe : les solutions sont "), latex("\\dfrac{-b\\pm\\sqrt{\\Delta}}{2a}"), texte(", avec −b.")];
  return null;
}

export function messageChoixCarre(e: ExerciceColinearParametreCarre): Fragments {
  return e.solutions.length === 0
    ? [texte("Il n'y a aucune valeur de x : Δ < 0, l'équation n'a pas de solution réelle.")]
    : [texte(`Il y a ${e.solutions.length === 1 ? "une valeur (Δ = 0)" : "deux valeurs (Δ > 0)"} : la bonne réponse est affichée ; calcule-${e.solutions.length === 1 ? "la" : "les"}.`)];
}

export function messageComposantesCombinaison(e: ExerciceCombinaisonVecteurs, s: V): Fragments | null {
  if (memePoint(s, e.reponse)) return null;
  if (e.points && e.coefficientsReduits.AB !== 0) {
    const faux = e.baseCanonique.reduce((acc, id) => {
      const c = e.coefficientsReduits[id];
      const v = composantesDe(e, id, true);
      return { x: acc.x + c * v.x, y: acc.y + c * v.y };
    }, { x: 0, y: 0 });
    if (memePoint(s, faux)) return MESSAGE_COMPOSANTES_INVERSEES;
  }
  if (egal(s.x, e.reponse.x) !== egal(s.y, e.reponse.y)) return [texte("Une seule composante est fausse : refais le calcul de celle qui est marquée, en mettant les nombres négatifs entre parenthèses.")];
  return null;
}

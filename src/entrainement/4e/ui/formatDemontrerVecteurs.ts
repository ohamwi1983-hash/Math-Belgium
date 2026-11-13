import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { latex, texte } from "../../export/fragmentsDocx";
import type { Coefficients, ExerciceDemontrerVecteurs, IdBase, IdConclusion, OptionBase, PointDefini, Rationnel, VecteurNomme } from "../core/demontrerVecteurs.types";
import {
  PREMIER_VECTEUR_BASE,
  coefficientColinearite,
  coefficientsVecteur,
  egaux,
  estNul,
  positions,
  q,
  secondVecteurBase,
} from "../moteur/modeleDemontrerVecteurs";

/**
 * Textes de gen85 (écran ET papier : une seule source). Formules toujours en LaTeX (vecteurs
 * `\vec{AB}`, fractions `\dfrac`), jamais au clavier ; aucune prose dans le mode math.
 */

export const NOMBRE_ECRANS = 4;
export const TITRES_ECRANS = ["Une base adaptée", "Les vecteurs utiles dans la base", "Comparer les coefficients", "Conclure"];

// ---------------------------------------------------------------------------------------------
// Nombres, vecteurs, combinaisons
// ---------------------------------------------------------------------------------------------

export function rationnelLatex(r: Rationnel): string {
  if (r.d === 1) return `${r.n}`;
  return r.n < 0 ? `-\\dfrac{${-r.n}}{${r.d}}` : `\\dfrac{${r.n}}{${r.d}}`;
}

/** Nombre entre parenthèses s'il est négatif (après un signe ×). */
export function rationnelParentheses(r: Rationnel): string {
  return r.n < 0 ? `\\left(${rationnelLatex(r)}\\right)` : rationnelLatex(r);
}

/** Écriture texte d'un rationnel (champ, réponse rappelée) : « −2/3 », « 4 ». */
export function rationnelTexte(r: Rationnel): string {
  const s = r.d === 1 ? `${Math.abs(r.n)}` : `${Math.abs(r.n)}/${r.d}`;
  return r.n < 0 ? `−${s}` : s;
}

export function vecLatex(v: VecteurNomme): string {
  return `\\vec{${v.de}${v.vers}}`;
}

/** Terme « k·vecteur » : `\vec{AB}`, `-\vec{AB}`, `\dfrac{1}{3}\vec{AB}`… (`premier` : sans « + »). */
function terme(k: Rationnel, vec: string, premier: boolean): string {
  if (estNul(k)) return "";
  const abs = q(Math.abs(k.n), k.d);
  const coef = egaux(abs, q(1)) ? "" : rationnelLatex(abs);
  if (premier) return `${k.n < 0 ? "-" : ""}${coef}${vec}`;
  return ` ${k.n < 0 ? "-" : "+"} ${coef}${vec}`;
}

/** Combinaison linéaire réduite, ex. `-\vec{AB} + \dfrac{1}{2}\vec{AD}` (jamais vide). */
export function combinaisonLatex(c: Coefficients, u: string, v: string): string {
  if (estNul(c.x) && estNul(c.y)) return "\\vec{0}";
  if (estNul(c.x)) return terme(c.y, v, true);
  return `${terme(c.x, u, true)}${terme(c.y, v, false)}`;
}

export function uLatex(): string {
  return vecLatex(PREMIER_VECTEUR_BASE);
}

export function vLatex(e: Pick<ExerciceDemontrerVecteurs, "figure">): string {
  return vecLatex(secondVecteurBase(e.figure));
}

/** Combinaison dans la base adaptée. */
export function dansBaseLatex(e: ExerciceDemontrerVecteurs, c: Coefficients): string {
  return combinaisonLatex(c, uLatex(), vLatex(e));
}

export function baseLatex(b: Pick<OptionBase, "u" | "v">): string {
  return `\\left(${vecLatex(b.u)} \\,;\\, ${vecLatex(b.v)}\\right)`;
}

export function baseAdapteeLatex(e: ExerciceDemontrerVecteurs): string {
  return `\\left(${uLatex()} \\,;\\, ${vLatex(e)}\\right)`;
}

/** Égalité « vecteur = combinaison » d'un vecteur utile, dans la base adaptée. */
export function expressionVecteurLatex(e: ExerciceDemontrerVecteurs, vec: VecteurNomme): string {
  return `${vecLatex(vec)} = ${dansBaseLatex(e, coefficientsVecteur(e, vec))}`;
}

/** « v = k·w » (k = 1 : « v = w »). */
export function relationColineariteLatex(e: ExerciceDemontrerVecteurs, k: Rationnel = coefficientColinearite(e)): string {
  // Vecteurs égaux : dans l'ordre de lecture (UM = MV, PQ = SR).
  if (egaux(k, q(1))) return `${vecLatex(e.w)} = ${vecLatex(e.v)}`;
  return `${vecLatex(e.v)} = ${terme(k, vecLatex(e.w), true)}`;
}

// ---------------------------------------------------------------------------------------------
// Énoncé
// ---------------------------------------------------------------------------------------------

function figureFragments(e: ExerciceDemontrerVecteurs): FragmentConsigne[] {
  if (e.figure === "parallelogramme") return [texte("ABCD est un parallélogramme.")];
  if (e.figure === "triangle") return [texte("ABC est un triangle.")];
  return [texte("ABCD est un trapèze de bases [AB] et [DC] tel que "), latex(`\\vec{DC} = ${terme(e.t ?? q(1, 2), "\\vec{AB}", true)}`), texte(".")];
}

/** Relation qui définit un point : « E est le milieu de [AC] », « vecteur AE = 1/3 vecteur AC »… */
export function relationFragments(d: PointDefini): FragmentConsigne[] {
  if (d.de === d.origine) {
    if (egaux(d.k, q(1, 2))) return [texte(`${d.nom} est le milieu du segment [${d.origine}${d.vers}]`)];
    if (egaux(d.k, q(2))) return [texte(`${d.nom} est le symétrique de ${d.origine} par rapport à ${d.vers}`)];
    if (egaux(d.k, q(-1))) return [texte(`${d.nom} est le symétrique de ${d.vers} par rapport à ${d.origine}`)];
  }
  return [latex(relationLatex(d))];
}

/** La relation sous forme vectorielle (toujours), pour le corrigé et les aides. */
export function relationLatex(d: PointDefini): string {
  return `\\vec{${d.origine}${d.nom}} = ${terme(d.k, `\\vec{${d.de}${d.vers}}`, true)}`;
}

export function enonceFragments(e: ExerciceDemontrerVecteurs): FragmentConsigne[] {
  const [E, F] = e.definis as [PointDefini, PointDefini];
  return [...figureFragments(e), texte(" Les points E et F sont définis par : "), ...relationFragments(E), texte(" ; "), ...relationFragments(F), texte(".")];
}

function listeEt(noms: string[]): string {
  return `${noms.slice(0, -1).join(", ")} et ${noms[noms.length - 1]}`;
}

/** Ce qu'il faut démontrer, SANS méthode (décision de l'utilisateur). */
export function aDemontrerFragments(e: ExerciceDemontrerVecteurs): FragmentConsigne[] {
  const c = e.cible;
  switch (c.type) {
    case "alignes":
      return [texte(`Démontre que les points ${listeEt(c.points)} sont alignés.`)];
    case "paralleles":
      return [texte(`Démontre que les droites (${c.droite1.join("")}) et (${c.droite2.join("")}) sont parallèles.`)];
    case "milieu":
      return [texte(`Démontre que ${c.milieu} est le milieu du segment [${c.extremites.join("")}].`)];
    case "parallelogramme":
      return [texte(`Démontre que ${c.sommets.join("")} est un parallélogramme.`)];
  }
}

export const CONSIGNE_GENERALE = "On démontre la propriété demandée sans repère, uniquement avec des vecteurs.";

// ---------------------------------------------------------------------------------------------
// Consignes des écrans (aussi titres « Étape n » du corrigé papier)
// ---------------------------------------------------------------------------------------------

export function consignesEcrans(e: ExerciceDemontrerVecteurs): FragmentConsigne[][] {
  return [
    [texte("Choisis la base la mieux adaptée pour exprimer les vecteurs utiles.")],
    [texte("Exprime "), latex(vecLatex(e.w)), texte(" et "), latex(vecLatex(e.v)), texte(" dans la base "), latex(baseAdapteeLatex(e)), texte(", à l'aide de la relation de Chasles.")],
    [texte("Compare les coefficients : trouve le nombre k tel que "), latex(`${vecLatex(e.v)} = k\\,${vecLatex(e.w)}`), texte(".")],
    [texte("Conclus en citant la propriété utilisée.")],
  ];
}

// ---------------------------------------------------------------------------------------------
// Écran 1 — bases
// ---------------------------------------------------------------------------------------------

export function messageBase(id: IdBase): string | undefined {
  if (id === "colineaire") return "Ces deux vecteurs sont colinéaires : ils ne forment pas une base.";
  if (id === "maladroite") return "C'est bien une base, mais aucun sommet de la figure ne s'y exprime directement : tous les calculs deviennent plus longs.";
  return undefined;
}

export function aidesBase(e: ExerciceDemontrerVecteurs): FragmentConsigne[][] {
  const col = e.bases.find((b) => b.id === "colineaire")!;
  return [
    [
      texte(
        "Une base est formée de deux vecteurs non colinéaires. La plus pratique part d'un même sommet, le long de deux côtés de la figure : les relations de l'énoncé s'y traduisent directement.",
      ),
    ],
    [texte("Regarde la direction des vecteurs de chaque proposition : "), latex(vecLatex(col.u)), texte(" et "), latex(vecLatex(col.v)), texte(" sont-ils portés par des droites parallèles ?")],
  ];
}

// ---------------------------------------------------------------------------------------------
// Écran 2 — expressions dans la base
// ---------------------------------------------------------------------------------------------

/** Expression des sommets non triviaux (C, et D pour le trapèze) dans la base adaptée. */
function rappelsSommets(e: ExerciceDemontrerVecteurs): string[] {
  if (e.figure === "parallelogramme") return ["\\vec{AC} = \\vec{AB} + \\vec{BC} = \\vec{AB} + \\vec{AD}"];
  if (e.figure === "trapeze") return [`\\vec{AC} = \\vec{AD} + \\vec{DC} = \\vec{AD} + ${terme(e.t ?? q(1, 2), "\\vec{AB}", true)}`];
  return [];
}

/** Position d'un point défini, Chasles écrit mais non réduit (aide de niveau 2, corrigé). */
export function positionNonReduite(d: PointDefini): string {
  const kVec = terme(d.k, `\\vec{${d.de}${d.vers}}`, true);
  if (d.origine === "A") return `\\vec{A${d.nom}} = ${kVec}`;
  return `\\vec{A${d.nom}} = \\vec{A${d.origine}} + \\vec{${d.origine}${d.nom}} = \\vec{A${d.origine}} ${kVec.startsWith("-") ? `- ${kVec.slice(1)}` : `+ ${kVec}`}`;
}

/** Points intervenant dans les vecteurs utiles. */
function pointsUtiles(e: ExerciceDemontrerVecteurs): string[] {
  return [...new Set([e.w.de, e.w.vers, e.v.de, e.v.vers])];
}

export function aidesExpressions(e: ExerciceDemontrerVecteurs): FragmentConsigne[][] {
  // Jamais la réponse finale : on tait une formule qui donnerait directement un vecteur utile
  // (vecteur utile AX alors que la position de X se lit déjà réduite dans la base).
  const directs = new Set([e.w, e.v].filter((x) => x.de === "A").map((x) => x.vers));
  const base = [PREMIER_VECTEUR_BASE, secondVecteurBase(e.figure)].map(vecLatex);
  const dejaReduite = (d: PointDefini) => {
    const membres = positionNonReduite(d).split(" = ");
    const vecteurs = membres[membres.length - 1]!.match(/\\vec\{[A-Z]{2}\}/g) ?? [];
    return vecteurs.every((x) => base.includes(x));
  };
  const definis = e.definis.filter((d) => pointsUtiles(e).includes(d.nom) && !(directs.has(d.nom) && dejaReduite(d)));
  const niveau2: FragmentConsigne[] = [texte("Écris d'abord chaque point utile à partir de A, puis réduis : ")];
  const formules = [...(directs.has("C") ? [] : rappelsSommets(e)), ...definis.map(positionNonReduite)];
  if (formules.length === 0) formules.push("\\vec{XY} = \\vec{AY} - \\vec{AX}");
  formules.forEach((f, i) => {
    if (i > 0) niveau2.push(texte(" ; "));
    niveau2.push(latex(f));
  });
  return [
    [texte("Insère A dans chaque vecteur grâce à la relation de Chasles, puis remplace chaque vecteur qui part de A : "), latex("\\vec{XY} = \\vec{XA} + \\vec{AY} = -\\vec{AX} + \\vec{AY}")],
    niveau2,
  ];
}

export type StatutVecteur = "correct" | "signe" | "chasles" | "faux";

export function messageVecteur(vec: VecteurNomme, statut: StatutVecteur): FragmentConsigne[] {
  if (statut === "signe") return [latex(vecLatex(vec)), texte(" : le sens est inversé — tu as exprimé "), latex(vecLatex({ de: vec.vers, vers: vec.de })), texte(".")];
  if (statut === "chasles")
    return [latex(vecLatex(vec)), texte(" : Chasles mal enchaîné — "), latex(`\\vec{${vec.de}A}`), texte(" vaut "), latex(`-\\vec{A${vec.de}}`), texte(", pas "), latex(`\\vec{A${vec.de}}`), texte(".")];
  return [latex(vecLatex(vec)), texte(" : au moins un coefficient est à revoir.")];
}

// ---------------------------------------------------------------------------------------------
// Écran 3 — coefficient de colinéarité
// ---------------------------------------------------------------------------------------------

export function aidesColinearite(e: ExerciceDemontrerVecteurs): FragmentConsigne[][] {
  const w = coefficientsVecteur(e, e.w);
  const v = coefficientsVecteur(e, e.v);
  const surX = !estNul(w.x);
  const [cv, cw, nom] = surX ? [v.x, w.x, uLatex()] : [v.y, w.y, vLatex(e)];
  return [
    [
      texte("Deux vecteurs sont colinéaires quand l'un est un multiple de l'autre : le même nombre k multiplie les deux coefficients de "),
      latex(vecLatex(e.w)),
      texte(" pour donner ceux de "),
      latex(vecLatex(e.v)),
      texte("."),
    ],
    [texte("Avec les coefficients de "), latex(nom), texte(" : "), latex(`${rationnelLatex(cv)} = k \\times ${rationnelParentheses(cw)}`), texte(". Vérifie ensuite avec l'autre coefficient.")],
  ];
}

export type StatutColinearite = "correct" | "inverse" | "signe" | "faux";

export function messageColinearite(e: ExerciceDemontrerVecteurs, statut: StatutColinearite): FragmentConsigne[] {
  if (statut === "inverse") return [texte("Rapport inversé : tu as calculé le nombre qui donne "), latex(vecLatex(e.w)), texte(" à partir de "), latex(vecLatex(e.v)), texte(".")];
  if (statut === "signe") return [texte("Erreur de signe : les vecteurs sont-ils de même sens ou de sens contraires ?")];
  return [texte("Ce nombre ne multiplie pas les deux coefficients à la fois.")];
}

// ---------------------------------------------------------------------------------------------
// Écran 4 — conclusion
// ---------------------------------------------------------------------------------------------

export function conclusionFragments(e: ExerciceDemontrerVecteurs, id: IdConclusion): FragmentConsigne[] {
  const rel = latex(relationColineariteLatex(e));
  const c = e.cible;
  if (id === "rien") return [texte("On ne peut rien conclure : il faudrait mesurer les longueurs sur la figure.")];
  switch (c.type) {
    case "alignes": {
      const [X] = c.points;
      if (id === "juste") return [rel, texte(` : ces vecteurs sont colinéaires et ont l'origine ${X} en commun, donc ${listeEt(c.points)} sont alignés.`)];
      if (id === "piege") return [rel, texte(` : ces vecteurs sont colinéaires, donc les droites (${X}E) et (${X}F) sont parallèles et distinctes.`)];
      return [latex(`k \\neq 1`), texte(" : les vecteurs "), latex(vecLatex(e.w)), texte(" et "), latex(vecLatex(e.v)), texte(` ne sont pas égaux, donc ${listeEt(c.points)} ne sont pas alignés.`)];
    }
    case "paralleles": {
      const d1 = `(${c.droite1.join("")})`;
      const d2 = `(${c.droite2.join("")})`;
      if (id === "juste") return [rel, texte(` : ces vecteurs sont colinéaires, donc les droites ${d1} et ${d2} sont parallèles.`)];
      if (id === "piege") return [rel, texte(` : ces vecteurs sont colinéaires, donc les points ${listeEt([...c.droite1, ...c.droite2])} sont alignés.`)];
      return [latex(`k \\neq 1`), texte(" : les vecteurs "), latex(vecLatex(e.w)), texte(" et "), latex(vecLatex(e.v)), texte(` ne sont pas égaux, donc les droites ${d1} et ${d2} ne sont pas parallèles.`)];
    }
    case "milieu": {
      const [U, V] = c.extremites;
      if (id === "juste") return [rel, texte(`, donc ${c.milieu} est le milieu du segment [${U}${V}].`)];
      if (id === "piege") return [rel, texte(`, donc ${U} est le milieu du segment [${c.milieu}${V}].`)];
      return [texte("Les vecteurs "), latex(vecLatex(e.w)), texte(" et "), latex(vecLatex(e.v)), texte(` sont seulement colinéaires : ${c.milieu} est sur la droite (${U}${V}), mais rien ne dit que c'est le milieu.`)];
    }
    case "parallelogramme": {
      const [P, Q, R, S] = c.sommets;
      if (id === "juste") return [rel, texte(`, donc ${P}${Q}${R}${S} est un parallélogramme.`)];
      if (id === "piege") return [rel, texte(`, donc ${P}${Q}${S}${R} est un parallélogramme.`)];
      return [
        texte("Les vecteurs "),
        latex(vecLatex(e.w)),
        texte(" et "),
        latex(vecLatex(e.v)),
        texte(` sont seulement colinéaires : ${P}${Q}${R}${S} est un trapèze, mais pas forcément un parallélogramme.`),
      ];
    }
  }
}

export function messageConclusion(e: ExerciceDemontrerVecteurs, id: IdConclusion): string | undefined {
  if (id === "juste") return undefined;
  if (id === "rien") return "Ce n'était pas la bonne conclusion : le calcul de k suffit, sans mesure, et il est exact.";
  switch (e.cible.type) {
    case "alignes":
      return id === "piege"
        ? "Ce n'était pas la bonne conclusion : deux vecteurs colinéaires qui ont un point commun sont portés par la même droite — les points sont alignés."
        : "Ce n'était pas la bonne conclusion : pour l'alignement, il suffit que les vecteurs soient colinéaires (k quelconque), pas égaux.";
    case "paralleles":
      return id === "piege"
        ? "Ce n'était pas la bonne conclusion : colinéaires ne veut pas dire alignés — ici les deux droites n'ont aucun point commun, elles sont parallèles."
        : "Ce n'était pas la bonne conclusion : pour le parallélisme, il suffit que les vecteurs soient colinéaires (k quelconque), pas égaux.";
    case "milieu":
      return id === "piege"
        ? "Ce n'était pas la bonne conclusion : lis l'égalité dans l'ordre — le point placé entre les deux vecteurs égaux est le milieu."
        : "Ce n'était pas la bonne conclusion : les vecteurs sont égaux (k = 1), pas seulement colinéaires — c'est exactement la définition du milieu.";
    case "parallelogramme":
      return id === "piege"
        ? "Ce n'était pas la bonne conclusion : l'ordre des sommets compte — avec deux vecteurs égaux de côtés opposés, on garde l'ordre du tour du quadrilatère."
        : "Ce n'était pas la bonne conclusion : les vecteurs sont égaux (k = 1), pas seulement colinéaires — c'est la caractérisation du parallélogramme.";
  }
}

export function aidesConclusion(e: ExerciceDemontrerVecteurs): FragmentConsigne[][] {
  const c = e.cible;
  switch (c.type) {
    case "alignes":
      return [
        [texte("Deux vecteurs colinéaires qui ont un point commun sont portés par la même droite ; sans point commun, ils sont portés par deux droites parallèles.")],
        [texte("Les vecteurs "), latex(vecLatex(e.w)), texte(" et "), latex(vecLatex(e.v)), texte(" ont-ils un point en commun ?")],
      ];
    case "paralleles":
      return [
        [texte("Deux vecteurs colinéaires sont portés par des droites parallèles (ou confondues). Pour parler d'alignement, il faudrait un point commun.")],
        [texte(`Les droites (${c.droite1.join("")}) et (${c.droite2.join("")}) ont-elles un point commun ? Regarde la figure.`)],
      ];
    case "milieu":
      return [
        [texte("Deux vecteurs égaux mis bout à bout partagent le segment en deux moitiés : leur point commun en est le milieu.")],
        [texte("Lis l'égalité dans l'ordre : "), latex(vecLatex(e.w)), texte(" puis "), latex(vecLatex(e.v)), texte(". Quel point est entre les deux ?")],
      ];
    case "parallelogramme":
      return [
        [texte("Un quadrilatère PQRS est un parallélogramme quand "), latex("\\vec{PQ} = \\vec{SR}"), texte(" : deux côtés opposés, parcourus dans le même sens.")],
        [texte(`Fais le tour ${c.sommets.join("")} : les côtés [${c.sommets[0]}${c.sommets[1]}] et [${c.sommets[3]}${c.sommets[2]}] sont-ils opposés ?`)],
      ];
  }
}

/** Position de chaque point défini, réduite dans la base (corrigé). */
export function positionReduiteLatex(e: ExerciceDemontrerVecteurs, nom: string): string {
  return `\\vec{A${nom}} = ${dansBaseLatex(e, positions(e)[nom]!)}`;
}

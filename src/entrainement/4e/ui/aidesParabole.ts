import type { ExerciceAnalyseFonction, ReponseAxeSommet, ReponseCoefficients } from "../core/analyseFonction.types";
import type { ExerciceTransformationGraphique, ReponseCurseurs } from "../core/transformationsGraphiques.types";
import type { ExerciceFormeCanoniqueTransformation } from "../core/formeCanoniqueTransformations.types";
import type { Morceau } from "../core/inequation.types";
import type { FragmentConsigne } from "./formatEquationDroite";
import { latex, texte } from "../../export/corrigeTableau";
import { q } from "./corrigeChapitre3";
import { carreTranslate, facteurLatex } from "./corrigeParabole";
import { analyserAxeSymetrie } from "../moteur/verificationAnalyseFonction";
import { analyserFormeCanoniqueComplete } from "../moteur/verificationFormeCanoniqueTransformations";

/**
 * Aides à deux niveaux (formule en KaTeX) et messages ciblés des générateurs du chapitre 1 de 4e
 * (audit 4e ch. 1, lot B : R3, R4, R5) — gen7, gen8, gen9. Niveau 1 : la propriété du cours ;
 * niveau 2 : comment l'appliquer à l'instance. Jamais la réponse ; aucun « Δ » (pas encore vu).
 * Messages d'illisible PAR NATURE de champ (jamais « la place de x » pour un nombre).
 */

export type Aides = FragmentConsigne[][];

const egal = (x: number, y: number) => Math.abs(x - y) < 1e-7;

export const MESSAGE_COEFFICIENT_ILLISIBLE =
  "Nombre non reconnu : écris chaque coefficient, par exemple −3, 0 ou 1/2 (virgule ou point). Cette saisie ne compte pas comme une tentative.";
export const MESSAGE_SOMMET_ILLISIBLE =
  "Saisie non reconnue : écris l'axe sous la forme x = 3 (ou x = −1/2) et chaque coordonnée comme un nombre ou une fraction. Cette saisie ne compte pas comme une tentative.";
export const MESSAGE_INTERVALLE_ILLISIBLE =
  "Borne non reconnue : écris un nombre ou une fraction (par exemple −9/4), ou choisis l'infini, et choisis les deux crochets. Cette saisie ne compte pas comme une tentative.";
export const MESSAGE_FONCTION_ILLISIBLE =
  "Expression non reconnue : écris par exemple 2(x − 3)^2 + 1 ou −1/2(x + 4)^2 (parenthèses fermées, « ^2 » pour le carré). Cette saisie ne compte pas comme une tentative.";
export const MESSAGE_NOMBRE_ILLISIBLE =
  "Nombre non reconnu : écris un nombre entier, décimal ou une fraction, par exemple −3 ou 5/2. Cette saisie ne compte pas comme une tentative.";

// ---------------------------------------------------------------------------------------------
// gen7 — analyse d'une fonction du second degré
// ---------------------------------------------------------------------------------------------

export function aidesCoefficients(): Aides {
  return [
    [texte("Une fonction du second degré s'écrit "), latex("f(x)=ax^2+bx+c"), texte(" : a est le coefficient de "), latex("x^2"), texte(", b celui de x, c le terme constant.")],
    [texte("Range d'abord les termes : celui en "), latex("x^2"), texte(", puis celui en x, puis la constante. Le signe devant un terme fait partie de son coefficient ; un terme absent a un coefficient nul.")],
  ];
}

export function messageCoefficients(e: ExerciceAnalyseFonction, r: ReponseCoefficients): FragmentConsigne[] | null {
  const { a, b, c } = e.exercice.enonce;
  const vals = [a, b, c];
  const lus = [r.a, r.b, r.c];
  if (lus.every((v, i) => egal(Math.abs(v), Math.abs(vals[i]!))) && !lus.every((v, i) => egal(v, vals[i]!))) return [texte("Les valeurs sont bonnes, pas les signes : le signe placé devant un terme fait partie de son coefficient.")];
  const tries = [...lus].sort((x, y) => x - y);
  const attendus = [...vals].sort((x, y) => x - y);
  if (tries.every((v, i) => egal(v, attendus[i]!))) return [texte("Ce sont les bons nombres, mais pas à la bonne place : a est le coefficient de "), latex("x^2"), texte(", quel que soit l'ordre d'écriture.")];
  return null;
}

export function aidesAllure(e: ExerciceAnalyseFonction): Aides {
  const { a, b } = e.exercice.enonce;
  return [
    [texte("Le signe de a donne l'ouverture ("), latex("a>0"), texte(" : vers le haut). Comme "), latex("x_S=-\\dfrac{b}{2a}"), texte(", le signe de "), latex("a\\cdot b"), texte(" situe l'axe : positif, à gauche de Oy ; négatif, à droite ; nul, sur Oy.")],
    [texte("Ici, repère a et b dans f(x) (avec leur signe), puis calcule "), latex(`a\\cdot b=${facteurLatex(a)}\\cdot ${facteurLatex(b)}`), texte(".")],
  ];
}

export function consigneAxeSommetEcran(): string {
  return "Donne l'axe de symétrie et les coordonnées du sommet (valeurs exactes : une fraction comme 5/2 est acceptée).";
}

export function aidesAxeSommet(e: ExerciceAnalyseFonction): Aides {
  const { a, b } = e.exercice.enonce;
  return [
    [texte("Abscisse du sommet : "), latex("x_S=-\\dfrac{b}{2a}"), texte(" ; axe de symétrie : "), latex("x=x_S"), texte(" ; ordonnée : "), latex("y_S=f(x_S)"), texte(".")],
    [texte("Ici "), latex(`x_S=-\\dfrac{${q(b)}}{2\\cdot ${facteurLatex(a)}}`), texte(" ; remplace ensuite x par cette valeur dans f(x) (le croquis montre où se trouve le sommet).")],
  ];
}

export function messageAxeSommet(e: ExerciceAnalyseFonction, r: ReponseAxeSommet): FragmentConsigne[] | null {
  const axe = analyserAxeSymetrie(r.axeTexte);
  if (e.xS !== 0 && egal(r.xS, -e.xS)) return [texte("Relis le signe de "), latex("x_S"), texte(" : n'oublie pas le « − » de "), latex("-\\dfrac{b}{2a}"), texte(".")];
  if (egal(r.xS, e.xS) && !egal(r.yS, e.yS)) {
    if (egal(r.yS, e.xS)) return [texte("L'ordonnée du sommet n'est pas son abscisse : calcule "), latex("y_S=f(x_S)"), texte(".")];
    return [texte("L'abscisse est juste ; recalcule "), latex("y_S=f(x_S)"), texte(" en remplaçant x par "), latex(q(e.xS)), texte(" dans f(x), terme par terme.")];
  }
  if (egal(r.xS, e.xS) && egal(r.yS, e.yS) && axe !== null && !egal(axe, e.xS)) return [texte("L'axe de symétrie est la droite verticale qui passe par le sommet : "), latex("x=x_S"), texte(".")];
  return null;
}

export function aidesImage(e: ExerciceAnalyseFonction): Aides {
  return [
    [latex("a>0"), texte(" : le sommet est un minimum, "), latex("\\operatorname{im} f=[y_S\\,;\\,{+\\infty}["), texte(" ; "), latex("a<0"), texte(" : maximum, "), latex("\\operatorname{im} f=]{-\\infty}\\,;\\,y_S]"), texte(".")],
    [texte("Ici "), latex(`y_S=${q(e.yS)}`), texte(` et a est ${e.exercice.enonce.a > 0 ? "positif" : "négatif"} : le croquis montre la partie de l'axe des ordonnées couverte par la courbe.`)],
  ];
}

export function messageImage(e: ExerciceAnalyseFonction, m: Morceau): FragmentConsigne[] | null {
  const bornes = [m.borneGauche, m.borneDroite].filter((x): x is number => typeof x === "number");
  if (bornes.some((x) => egal(x, e.xS)) && !egal(e.xS, e.yS)) return [texte("L'image se lit sur l'ordonnée du sommet, pas sur son abscisse.")];
  const a = e.exercice.enonce.a;
  if (bornes.some((x) => egal(x, e.yS))) {
    if ((a > 0 && m.borneDroite !== "+inf") || (a < 0 && m.borneGauche !== "-inf")) return [texte(`La parabole est tournée vers le ${a > 0 ? "haut : elle monte jusqu'à +∞" : "bas : elle descend jusqu'à −∞"}.`)];
    return [texte("La valeur au sommet est atteinte : le crochet est fermé de son côté.")];
  }
  return null;
}

export function aidesMethodeCh1(): Aides {
  return [
    [texte("Teste les raccourcis dans l'ordre : "), latex("c=0"), texte(" → mise en évidence ; "), latex("b=0"), texte(" et a, c de signes opposés → binôme conjugué ; "), latex("b^2=4ac"), texte(" → produit remarquable.")],
    [texte("Si aucun ne marche, regarde le sommet (écran précédent) : s'il est du côté où la parabole s'ouvre (au-dessus de Ox avec "), latex("a>0"), texte(", en dessous avec "), latex("a<0"), texte("), la courbe ne coupe jamais Ox.")],
  ];
}

export function aidesFactorisationCh1(e: ExerciceAnalyseFonction): Aides {
  switch (e.exercice.categorie) {
    case "mise_en_evidence":
      return [
        [texte("Pas de terme constant : "), latex("ax^2+bx=ax\\left(x+\\dfrac{b}{a}\\right)"), texte(".")],
        [texte("Mets en évidence "), latex("ax"), texte(` (ici a = ${q(e.exercice.enonce.a).replace("-", "−")}) : il reste une parenthèse de la forme `), latex("x-r"), texte(".")],
      ];
    case "binome_conjugue":
      return [
        [texte("Différence de deux carrés : "), latex("A^2-B^2=(A-B)(A+B)"), texte(".")],
        [texte("Mets d'abord a en évidence, puis écris le reste comme "), latex("x^2-B^2"), texte(".")],
      ];
    default:
      return [
        [texte("Carré parfait : "), latex("A^2\\pm 2AB+B^2=(A\\pm B)^2"), texte(".")],
        [texte("Mets d'abord a en évidence, repère A et B dans les termes extrêmes, puis vérifie le double produit "), latex("2AB"), texte(".")],
      ];
  }
}

export function aidesZerosCh1(): Aides {
  return [
    [texte("Produit nul : "), latex("A\\cdot B=0\\iff A=0\\ \\text{ou}\\ B=0"), texte(".")],
    [texte("Égale à 0 chaque facteur qui contient x (le coefficient a ne s'annule jamais) ; un carré nul ne donne qu'un zéro (zéro double).")],
  ];
}

export function messageZerosCh1(e: ExerciceAnalyseFonction, r: [number, number]): FragmentConsigne[] | null {
  const att = [...e.exercice.solution.racines].sort((x, y) => x - y);
  const v = [...r].filter((x) => Number.isFinite(x)).sort((x, y) => x - y);
  if (v.length === 2 && egal(v[0]!, -att[1]!) && egal(v[1]!, -att[0]!) && !egal(att[0]!, -att[1]!)) return [texte("Tes zéros ont le mauvais signe : "), latex("x-3=0"), texte(" donne "), latex("x=3"), texte(", et "), latex("x+3=0"), texte(" donne "), latex("x=-3"), texte(".")];
  return null;
}

export function aidesTableau(e: ExerciceAnalyseFonction): Aides {
  return [
    [texte("Signe : à l'extérieur des zéros, celui de a ; entre deux zéros, le signe opposé ; sans zéro, le signe de a partout. Variation : changement de sens au sommet "), latex("x_S"), texte(".")],
    [texte(`Ici a est ${e.exercice.enonce.a > 0 ? "positif : f décroît puis croît" : "négatif : f croît puis décroît"} ; le croquis montre où la courbe est au-dessus et en dessous de l'axe Ox.`)],
  ];
}

// ---------------------------------------------------------------------------------------------
// gen8 — transformations graphiques
// ---------------------------------------------------------------------------------------------

export function aidesTransformation(): Aides {
  return [
    [texte("Le sommet donne les translations : "), latex("\\text{TH}=x_S"), texte(", "), latex("\\text{TV}=y_S"), texte(". Le point croix, une unité à droite du sommet, est à a unités du sommet en hauteur : "), latex("|a|=\\dfrac{\\text{EV}}{\\text{CV}}"), texte(", et "), latex("a<0"), texte(" s'il est sous le sommet (SOX).")],
    [texte("Compte les carreaux entre le sommet et le point croix, puis écris "), latex("f(x)=a(x-x_S)^2+y_S"), texte(". La courbe orange suit tes réglages : superpose-la à la courbe bleue.")],
  ];
}

export function messageEquationTransformation(e: ExerciceTransformationGraphique, saisie: string): FragmentConsigne[] | null {
  const f = analyserFormeCanoniqueComplete(saisie);
  if (!f) return null;
  const a = (e.sox ? -1 : 1) * (e.ev / e.cv);
  if (e.p !== 0 && egal(f.p, -e.p)) return [texte("Dans la parenthèse, on soustrait l'abscisse du sommet : un sommet en "), latex(`x=${q(e.p)}`), texte(" donne "), latex(carreTranslate(e.p)), texte(".")];
  if (egal(f.a, -a)) return [texte("Relis le signe de a : la parabole est tournée vers le "), texte(a > 0 ? "haut." : "bas.")];
  if (!egal(Math.abs(a), 1) && egal(Math.abs(f.a), 1 / Math.abs(a))) return [texte("Ton coefficient est inversé : |a| est l'écart vertical entre le sommet et le point croix.")];
  if (e.q !== 0 && egal(f.q, -e.q)) return [texte("Relis la translation verticale : c'est l'ordonnée du sommet, avec son signe.")];
  return null;
}

export function messageCurseurs(e: ExerciceTransformationGraphique, c: ReponseCurseurs): FragmentConsigne[] | null {
  if (e.p !== 0 && c.th === -e.p) return [texte("TH : un sommet à droite de l'axe Oy correspond à une translation vers la droite (TH positif).")];
  if (e.ev !== e.cv && Math.abs(c.ev / c.cv - e.cv / e.ev) < 1e-9) return [texte("EV et CV sont inversés : la parabole est-elle plus resserrée (étirement) ou plus ouverte (compression) que "), latex("y=x^2"), texte(" ?")];
  if (e.q !== 0 && c.tv === -e.q) return [texte("TV : un sommet sous l'axe Ox correspond à une translation vers le bas (TV négatif).")];
  return null;
}

// ---------------------------------------------------------------------------------------------
// gen9 — forme canonique et transformations
// ---------------------------------------------------------------------------------------------

export function aidesCanonique(): Aides {
  return [
    [latex("x_S=-\\dfrac{b}{2a}"), texte(", "), latex("y_S=f(x_S)"), texte(", puis "), latex("f(x)=a(x-x_S)^2+y_S"), texte(" avec le même a que devant "), latex("x^2"), texte(".")],
    [texte("Repère a, b et c dans f(x) (fractions comprises), calcule "), latex("x_S"), texte(", puis remplace x par "), latex("x_S"), texte(" dans f(x).")],
  ];
}

export function messageCanonique(e: ExerciceFormeCanoniqueTransformation, xS: number, forme: string): FragmentConsigne[] | null {
  if (e.xS !== 0 && egal(xS, -e.xS)) return [texte("Relis le signe de "), latex("x_S"), texte(" : "), latex("-\\dfrac{b}{2a}"), texte(".")];
  const f = analyserFormeCanoniqueComplete(forme);
  if (f && egal(xS, e.xS) && e.xS !== 0 && egal(f.p, -e.xS)) return [texte("Dans la parenthèse, on soustrait "), latex("x_S"), texte(" : "), latex(`x_S=${q(e.xS)}`), texte(" donne "), latex(carreTranslate(e.xS)), texte(".")];
  if (f && !egal(f.a, (e.sox ? -1 : 1) * (e.ev / e.cv))) return [texte("Le coefficient a de la forme canonique est celui de "), latex("x^2"), texte(" dans f(x) : il ne change pas.")];
  return null;
}

export function aidesTh(): Aides {
  return [
    [texte("Une translation horizontale de TH unités remplace x par "), latex("x-\\text{TH}"), texte(" : elle amène le sommet de "), latex("y=x^2"), texte(" à l'abscisse "), latex("x_S"), texte(".")],
    [texte("Reprends "), latex("x_S"), texte(" trouvé à l'écran précédent : "), latex("\\text{TH}=x_S"), texte(" et la fonction obtenue est "), latex("(x-x_S)^2"), texte(".")],
  ];
}

export function aidesEvCvSox(): Aides {
  return [
    [latex("|a|=\\dfrac{\\text{EV}}{\\text{CV}}"), texte(" : "), latex("|a|>1"), texte(" étirement, "), latex("|a|<1"), texte(" compression ; "), latex("a<0"), texte(" : symétrie d'axe Ox (SOX).")],
    [texte("Lis a dans la forme canonique : sa valeur sans le signe donne le rapport EV/CV, son signe dit s'il y a une symétrie. Multiplie "), latex("(x-x_S)^2"), texte(" par a.")],
  ];
}

export function aidesTv(): Aides {
  return [
    [texte("Une translation verticale de TV unités ajoute TV à la fonction : elle amène le sommet à l'ordonnée "), latex("y_S"), texte(".")],
    [latex("\\text{TV}=y_S"), texte(" : ajoute "), latex("y_S"), texte(" (avec son signe) à la fonction de l'écran précédent.")],
  ];
}

export function messageTranslation(attendu: number, saisi: number, sens: "horizontale" | "verticale"): FragmentConsigne[] | null {
  if (attendu !== 0 && saisi === -attendu) return [texte(sens === "horizontale" ? "Relis le sens : TH a le signe de l'abscisse du sommet (vers la droite si elle est positive)." : "Relis le sens : TV a le signe de l'ordonnée du sommet (vers le haut si elle est positive).")];
  return null;
}

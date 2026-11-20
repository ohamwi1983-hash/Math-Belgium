import type { ExerciceOptimisation, ExerciceOptimisationModelisation } from "../core/optimisation.types";
import type { FragmentConsigne } from "./formatEquationDroite";
import { latex, texte } from "../../export/corrigeTableau";
import { q } from "./corrigeChapitre3";
import { facteurLatex } from "./corrigeParabole";
import {
  formatIsolementLatex,
  segmentsPhraseEnonce,
  texteAideContrainteNiveau1,
  texteAideContrainteNiveau2,
  texteAideDecisionNiveau1,
  texteAideDomaineNiveau1,
  texteAideGrandeurNiveau1,
  texteAideGrandeurNiveau2,
} from "./formatOptimisation";
import { parserNombreOuFraction } from "../moteur/verificationAnalyseFonction";

/**
 * Aides à deux niveaux (texte + KaTeX, jamais de notation clavier) et messages ciblés de gen55
 * (« Problèmes d'optimisation », audit 4e ch. 1, lot B : R4, R5). Niveau 1 : la méthode du cours ;
 * niveau 2 : son application à l'instance. Jamais la réponse de l'écran (l'ancien niveau 3 du
 * domaine donnait l'intervalle : retiré).
 */

export type Aides = FragmentConsigne[][];

export const MESSAGE_EXPRESSION_OPTIMISATION_ILLISIBLE =
  "Expression non reconnue : écris par exemple 2x + 3y = 40 ou (20 + x)·y (parenthèses fermées, « * » ou « · » pour multiplier, « ^2 » pour un carré). Cette saisie ne compte pas comme une tentative.";
export const MESSAGE_VALEUR_OPTIMISATION_ILLISIBLE =
  "Nombre non reconnu : écris un nombre, par exemple 12, −3,5 ou 15/2 (virgule ou point). Cette saisie ne compte pas comme une tentative.";

/** Phrase avec segments `$…$` → fragments (texte / KaTeX). */
export function fragmentsDePhrase(phrase: string): FragmentConsigne[] {
  return segmentsPhraseEnonce(phrase).map((s) => (s.type === "katex" ? latex(s.valeur) : texte(s.valeur)));
}

const egal = (x: number, y: number) => Math.abs(x - y) < 0.005;

export function aidesContrainteEtGrandeur(e: ExerciceOptimisationModelisation): Aides {
  return [
    [...fragmentsDePhrase(texteAideContrainteNiveau1(e)), texte(" "), ...fragmentsDePhrase(texteAideGrandeurNiveau1(e))],
    [...fragmentsDePhrase(texteAideContrainteNiveau2(e)), texte(" "), ...fragmentsDePhrase(texteAideGrandeurNiveau2(e))],
  ];
}

export function aidesSysteme(e: ExerciceOptimisationModelisation): Aides {
  return [
    [texte("Isole une inconnue dans la contrainte, remplace-la dans l'expression de la grandeur (entre parenthèses), puis développe et réduis.")],
    [texte(`Ici, ${e.contrainte.lettreCherchee} isolé : `), latex(formatIsolementLatex(e.contrainte, e.contexte.labelVariable)), texte(` ; remplace ${e.contrainte.lettreCherchee} par cette expression dans la grandeur.`)],
  ];
}

export function aidesDomaine(e: ExerciceOptimisationModelisation): Aides {
  return [
    fragmentsDePhrase(texteAideDomaineNiveau1(e)),
    [
      texte(`Écris une inéquation par grandeur (par exemple `),
      latex(`${e.contrainte.lettreCherchee}\\geq 0`),
      texte(`, puis remplace ${e.contrainte.lettreCherchee} par son expression en ${e.contexte.labelVariable}) et résous chacune ; le domaine est l'intersection des solutions${e.domaineSansContrainte ? ", à laquelle tu ajoutes la condition de la dernière phrase de l'énoncé" : ""}.`),
    ],
  ];
}

export function aidesSommet(e: ExerciceOptimisation): Aides {
  const v = e.contexte.labelVariable;
  return [
    [texte("Abscisse du sommet : "), latex(`${v}_S=-\\dfrac{b}{2a}`), texte(" ; la valeur de la grandeur au sommet s'obtient en remplaçant "), latex(v), texte(" par "), latex(`${v}_S`), texte(" dans la fonction.")],
    [texte("Ici "), latex(`a=${q(e.fonction.a)}`), texte(" et "), latex(`b=${q(e.fonction.b)}`), texte(" : "), latex(`${v}_S=-\\dfrac{${q(e.fonction.b)}}{2\\cdot ${facteurLatex(e.fonction.a)}}`), texte(".")],
  ];
}

export function aidesDecision(e: ExerciceOptimisation): Aides {
  const v = e.contexte.labelVariable;
  return [
    fragmentsDePhrase(texteAideDecisionNiveau1(e)),
    [
      texte("Compare "),
      latex(`${v}_S=${q(e.sommet.x)}`),
      texte(" aux bornes du domaine "),
      latex(`[${q(e.domaine.inf)}\\,;\\,${q(e.domaine.sup)}]`),
      texte(". S'il en sort, calcule la grandeur aux deux bornes et garde la meilleure."),
    ],
  ];
}

export function aidesInterpretation(): Aides {
  return [
    [texte("La conclusion donne la valeur optimale de la grandeur (avec son unité) et la valeur de la variable qui la donne (avec la sienne).")],
    [texte("Vérifie le sens (maximum ou minimum), les deux unités, et que la valeur de la variable n'a pas été prise pour la valeur optimale.")],
  ];
}

/** Message ciblé de l'écran « sommet » : signe de x_S, ordonnée calculée avec la mauvaise abscisse. */
export function messageSommet(e: ExerciceOptimisation, x: string, y: string): FragmentConsigne[] | null {
  const xl = parserNombreOuFraction(x);
  const yl = parserNombreOuFraction(y);
  if (xl === null || yl === null) return null;
  if (e.sommet.x !== 0 && egal(xl, -e.sommet.x)) return [texte("Relis le signe : n'oublie pas le « − » de "), latex("-\\dfrac{b}{2a}"), texte(".")];
  if (egal(xl, e.sommet.x) && !egal(yl, e.sommet.y)) return [texte("L'abscisse est juste ; remplace-la dans la fonction pour obtenir la valeur au sommet, terme par terme.")];
  return null;
}

/** Message ciblé de l'écran « décision » : optimum lu au sommet alors qu'il est hors du domaine. */
export function messageDecision(e: ExerciceOptimisation, x: string, y: string): FragmentConsigne[] | null {
  const xl = parserNombreOuFraction(x);
  const yl = parserNombreOuFraction(y);
  if (xl === null || yl === null) return null;
  if (!e.sommetDansDomaine && egal(xl, e.sommet.x)) return [texte("Le sommet est hors du domaine : sa valeur n'est jamais atteinte. Compare les valeurs aux deux bornes.")];
  const autre = e.optimal.x === e.domaine.inf ? e.domaine.sup : e.domaine.inf;
  if (!e.sommetDansDomaine && egal(xl, autre)) return [texte(`C'est l'autre borne : la meilleure est la plus proche du sommet (${e.sens === "max" ? "plus grande valeur" : "plus petite valeur"}).`)];
  if (egal(xl, e.optimal.x) && !egal(yl, e.optimal.y)) return [texte("La valeur de la variable est juste ; recalcule la grandeur en remplaçant la variable par cette valeur.")];
  return null;
}

/** Message ciblé de l'écran « domaine ». */
export function messageDomaine(e: ExerciceOptimisationModelisation, inf: string, sup: string): FragmentConsigne[] | null {
  const a = parserNombreOuFraction(inf);
  const b = parserNombreOuFraction(sup);
  if (a === null || b === null) return null;
  if (egal(a, e.domaine.sup) && egal(b, e.domaine.inf)) return [texte("Les bornes sont inversées : la plus petite d'abord.")];
  const sans = e.domaineSansContrainte;
  if (sans && egal(a, sans.inf) && egal(b, sans.sup)) return [texte("Ces bornes viennent des grandeurs qui doivent rester positives, mais la dernière phrase de l'énoncé ajoute une condition : elle réduit le domaine.")];
  if (egal(b, e.domaine.sup) && !egal(a, e.domaine.inf)) return [texte("La borne de droite est juste ; relis la condition sur l'autre grandeur pour la borne de gauche.")];
  if (egal(a, e.domaine.inf) && !egal(b, e.domaine.sup)) return [texte("La borne de gauche est juste ; relis la condition qui empêche l'autre grandeur de devenir négative.")];
  return null;
}

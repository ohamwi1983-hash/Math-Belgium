/**
 * Couche présentation (5e) — consignes/labels/aides/LaTeX pour 5gen27 ("Fonction dérivée").
 * Dépend librement des couches inférieures (jamais l'inverse) : réutilise `formatFDeXLatex`/
 * `formatDeriveeFDeXLatex`/`formatAtomeLatex`/`formatInterieurLatex`/`formatExterieurEnULatex`
 * (`generateurs5e/fonctionDerivee/index.ts`) — même patron que `formatDefinitionDerivee.ts`
 * réutilisant `valeurExacte`/`deriveeExacte` depuis la Couche A.
 */
import type { ExerciceFonctionDerivee, TypeDerivee } from "../core5e/fonctionDerivee.types";
import { formatAtomeLatex, formatDeriveeFDeXLatex, formatExterieurEnULatex, formatFDeXLatex, formatInterieurLatex } from "../generateurs5e/fonctionDerivee/index";
import type { EcranFonctionDerivee } from "../moteur5e/typesFonctionDerivee";

export { formatFDeXLatex };

export function questionFinale(): string {
  return "f'(x)";
}

export function consigneGenerale(): string {
  return "Reconnais la structure de f(x), décompose-la si besoin, puis calcule f'(x) — en 2 ou 3 étapes selon le type reconnu.";
}

export function formatTermesDonneesLatex(exercice: ExerciceFonctionDerivee): string[] {
  return [formatFDeXLatex(exercice)];
}

// ============================================================================
// Libellés du type retenu — plain text (JAMAIS de KaTeX ici : "u·v"/"u/v" restent de simples
// caractères unicode, pas des fragments mathématiques rendus).
// ============================================================================

export const LIBELLE_TYPE: Record<TypeDerivee, string> = {
  reglebase: "Règle de base (somme)",
  produit: "Produit u·v",
  quotient: "Quotient u/v",
  composee: "Composée (chaîne)",
};

export const OPTIONS_RECONNAISSANCE: { type: TypeDerivee; label: string }[] = [
  { type: "reglebase", label: LIBELLE_TYPE.reglebase },
  { type: "produit", label: LIBELLE_TYPE.produit },
  { type: "quotient", label: LIBELLE_TYPE.quotient },
  { type: "composee", label: LIBELLE_TYPE.composee },
];

// ============================================================================
// Consignes par écran.
// ============================================================================

export function consigneEcran(ecran: EcranFonctionDerivee, typeRetenu: TypeDerivee | null): string {
  if (ecran === "reconnaissance") return "Quel type de dérivée est-ce ?";
  if (ecran === "decomposer") {
    if (typeRetenu === "produit") return "Identifie les deux facteurs u(x) et v(x) multipliés dans f(x).";
    if (typeRetenu === "quotient") return "Identifie le numérateur u(x) et le dénominateur v(x) de f(x).";
    return "Identifie la fonction intérieure u(x) et la fonction extérieure (exprimée en u).";
  }
  return "Calcule f'(x).";
}

// ============================================================================
// Décomposition CONFIRMÉE — 2 fragments LaTeX, notation à lettre unique ("u(x)=.../v(x)=..." ou
// "u(x)=.../g(u)=..."), jamais de mot dans le fragment KaTeX lui-même.
// ============================================================================

export function labelsChampsDecomposition(typeRetenu: TypeDerivee): [string, string] {
  if (typeRetenu === "composee") return ["u(x)=", "g(u)="];
  return ["u(x)=", "v(x)="];
}

export function placeholdersChampsDecomposition(typeRetenu: TypeDerivee): [string, string] {
  if (typeRetenu === "composee") return ["ex : 2x+1", "ex : u^3"];
  return ["ex : x^2", "ex : sin(x)"];
}

function formatTermesDecompositionLatex(exercice: ExerciceFonctionDerivee, typeRetenu: TypeDerivee): string[] {
  if (typeRetenu === "reglebase") return [];
  if (typeRetenu === "produit" || typeRetenu === "quotient") {
    const decomposition = exercice.decompositions[typeRetenu];
    if (!decomposition || decomposition.type !== "produitOuQuotient") return [];
    return [`u(x)=${decomposition.uLatex}`, `v(x)=${decomposition.vLatex}`];
  }
  const decomposition = exercice.decompositions.composee;
  if (!decomposition || decomposition.type !== "composee") return [];
  return [`u(x)=${decomposition.interieurLatex}`, `g(u)=${decomposition.exterieurLatexEnU}`];
}

// ============================================================================
// Bloc "état actuel" — absent sur "reconnaissance" (rien de confirmé), rappelle le type reconnu
// dès "decomposer", ajoute la décomposition confirmée sur "calculer" (sauf "reglebase", qui n'en
// a pas).
// ============================================================================

export function libelleTypeReconnu(typeRetenu: TypeDerivee): string {
  return `Type reconnu : ${LIBELLE_TYPE[typeRetenu]}`;
}

export function formatTermesEtatActuelLatex(exercice: ExerciceFonctionDerivee, ecran: EcranFonctionDerivee, typeRetenu: TypeDerivee | null): string[] {
  if (ecran === "reconnaissance" || typeRetenu === null) return [];
  if (ecran === "decomposer") return [];
  return formatTermesDecompositionLatex(exercice, typeRetenu);
}

// ============================================================================
// Aides — niveau 1 (rappel de méthode/piège), niveau 2 (exemple concret proche, jamais la
// réponse) — pièges documentés (spec) : produit (oublier un terme de u'v+uv', ne dériver qu'un
// facteur) ; quotient (oublier le carré au dénominateur, inverser u'v-uv' en uv'-u'v) ; composée
// (oublier de multiplier par la dérivée de l'intérieure) ; habillage trig (signe de cos'=-sin,
// oubli de la chaîne quand l'argument n'est pas x seul, ex. cos(3x)'=-3sin(3x) et non -sin(x)).
// ============================================================================

/** Aide fragmentée — texte en français d'un côté, formule KaTeX de l'autre (jamais de formule
 * brute dans le texte), rendue via `<p>{aide.texte}</p> {aide.latex && <Katex expression={aide.latex} block />}`. */
export interface AideFragmentee {
  texte: string;
  latex: string | null;
}

export function texteAideNiveau1(ecran: EcranFonctionDerivee, typeRetenu: TypeDerivee | null): AideFragmentee {
  if (ecran === "reconnaissance") {
    return {
      texte:
        "Une SOMME de termes (chacun en x seul) → règle de base. Une MULTIPLICATION de deux expressions → produit. Une DIVISION → quotient. UNE SEULE expression emboîtée dans une autre (ex. (...)ⁿ, √(...), sin(...) avec un contenu ≠ x) → composée.",
      latex: null,
    };
  }
  if (ecran === "decomposer") {
    if (typeRetenu === "produit")
      return {
        texte: "u(x) et v(x) sont les deux facteurs, tels quels, sans les multiplier entre eux — chacun peut lui-même contenir un exposant, une racine ou un sin/cos.",
        latex: null,
      };
    if (typeRetenu === "quotient")
      return { texte: "u(x) est le numérateur, v(x) le dénominateur — l'ORDRE compte ici, contrairement au produit.", latex: null };
    return {
      texte:
        "u(x) est ce qu'il y a À L'INTÉRIEUR (l'argument), g(u) est l'opération extérieure appliquée à ce contenu — remplace mentalement tout le contenu intérieur par la lettre u pour écrire g(u).",
      latex: null,
    };
  }
  if (typeRetenu === "produit")
    return {
      texte: "Dérive u ET v séparément, puis additionne les DEUX termes (piège : oublier l'un des deux, ou ne dériver qu'un seul facteur) :",
      latex: "(u\\cdot v)'=u'\\cdot v+u\\cdot v'",
    };
  if (typeRetenu === "quotient")
    return {
      texte: "Attention à l'ORDRE (u'v-uv', jamais uv'-u'v) et à ne pas oublier le carré au dénominateur :",
      latex: "\\left(\\dfrac{u}{v}\\right)'=\\dfrac{u'v-uv'}{v^2}",
    };
  if (typeRetenu === "composee")
    return {
      texte: "Dérive d'abord l'extérieure (en gardant l'intérieure telle quelle), PUIS multiplie par la dérivée de l'intérieure — ne jamais oublier ce dernier facteur.",
      latex: null,
    };
  return {
    texte: "Dérive chaque terme séparément avec les dérivées connues (xⁿ, √x, 1/xⁿ, sin x, cos x), puis additionne les résultats — attention au signe :",
    latex: "(\\sin x)'=\\cos x \\quad\\text{mais}\\quad (\\cos x)'=-\\sin x",
  };
}

export function texteAideNiveau2(ecran: EcranFonctionDerivee, typeRetenu: TypeDerivee | null): AideFragmentee {
  if (ecran === "reconnaissance") {
    return {
      texte: "Exemple :",
      latex:
        "\\underbrace{x^2+\\sin(x)}_{\\text{additionnés} \\to \\text{base}} \\quad \\underbrace{x\\cdot\\sin(x)}_{\\text{multipliés} \\to \\text{produit}} \\quad \\underbrace{\\sin(2x+1)}_{\\text{bloc intérieur} \\to \\text{composée}}",
    };
  }
  if (ecran === "decomposer") {
    if (typeRetenu === "produit")
      return { texte: "Exemple :", latex: "f(x)=x^2\\cdot\\cos(3x), \\quad u(x)=x^2, \\quad v(x)=\\cos(3x)" };
    if (typeRetenu === "quotient")
      return {
        texte: "Exemple :",
        latex: "f(x)=\\dfrac{x}{x+1}, \\quad u(x)=x\\ \\text{(numérateur)}, \\quad v(x)=x+1\\ \\text{(dénominateur)}",
      };
    return {
      texte: "Exemple :",
      latex: "f(x)=(3x+2)^4, \\quad u(x)=3x+2, \\quad g(u)=u^4 \\quad \\text{(remplacer } u \\text{ par } 3x+2 \\text{ redonne bien } f(x)\\text{)}",
    };
  }
  if (typeRetenu === "produit")
    return {
      texte: "Exemple :",
      latex:
        "f(x)=x\\cdot\\sin(2x), \\quad u=x\\ (u'=1), \\quad v=\\sin(2x)\\ (v'=2\\cos(2x)) \\;\\Rightarrow\\; f'(x)=1\\cdot\\sin(2x)+x\\cdot2\\cos(2x)=\\sin(2x)+2x\\cos(2x)",
    };
  if (typeRetenu === "quotient")
    return {
      texte: "Exemple :",
      latex:
        "f(x)=\\dfrac{x}{x+1}, \\quad u=x\\ (u'=1), \\quad v=x+1\\ (v'=1) \\;\\Rightarrow\\; f'(x)=\\dfrac{1\\cdot(x+1)-x\\cdot1}{(x+1)^2}=\\dfrac{1}{(x+1)^2}",
    };
  if (typeRetenu === "composee")
    return {
      texte: "Exemple :",
      latex:
        "f(x)=(3x+2)^4 \\;\\Rightarrow\\; f'(x)=4(3x+2)^3\\cdot3=12(3x+2)^3 \\quad \\text{(dérivée de l'extérieure } u^4 \\text{ en } 4u^3\\text{, multipliée par la dérivée de l'intérieure } 3x+2\\text{, qui vaut } 3\\text{)}",
    };
  return {
    texte: "Exemple :",
    latex:
      "f(x)=x^3+\\cos(x) \\;\\Rightarrow\\; f'(x)=3x^2-\\sin(x) \\quad \\text{(attention au signe moins devant } \\sin\\text{, dérivée de } \\cos\\text{)}",
  };
}

// ============================================================================
// Récapitulatif final — libellé + réponse attendue, par écran RÉELLEMENT traversé.
// ============================================================================

export const LIBELLE_ECRAN: Record<EcranFonctionDerivee, string> = {
  reconnaissance: "Type de dérivée",
  decomposer: "Décomposition",
  calculer: "Dérivée f'(x)",
};

/** Réponse "texte" attendue pour l'écran "reconnaissance" (pas de KaTeX : simple nom de
 * catégorie) — les DEUX libellés séparés par "ou" pour l'exercice ambigu. */
export function texteReponseAttendueReconnaissance(exercice: ExerciceFonctionDerivee): string {
  return exercice.typesAcceptes.map((t) => LIBELLE_TYPE[t]).join(" ou ");
}

export function formatTermesReponseAttendueDecomposerLatex(exercice: ExerciceFonctionDerivee, typeRetenu: TypeDerivee): string[] {
  return formatTermesDecompositionLatex(exercice, typeRetenu);
}

export function formatReponseAttendueCalculerLatex(exercice: ExerciceFonctionDerivee): string {
  return `f'(x)=${formatDeriveeFDeXLatex(exercice)}`;
}

// Réexports pratiques pour les composants d'écran (évite d'importer directement la Couche A
// ailleurs que dans ce module et `generateurs5e/`, même esprit que `formatDefinitionDerivee.ts`).
export { formatAtomeLatex, formatDeriveeFDeXLatex, formatExterieurEnULatex, formatInterieurLatex };

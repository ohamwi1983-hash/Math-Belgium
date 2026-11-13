import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { latex, texte } from "../../export/fragmentsDocx";
import type { Axe, ExerciceTransformationsEnsembles, Intervalle, Transformation, TypeTransformation } from "../core/transformationsEnsembles.types";
import { axeDe, transformationsDeLAxe } from "../moteur/modeleTransformationsEnsembles";

/**
 * Textes de gen72 (écran ET papier : une seule source). Formules toujours en LaTeX, jamais au
 * clavier ; virgule décimale ; signe moins typographique (KaTeX).
 */

export const NOMBRE_ECRANS = 3;
export const TITRES_ECRANS = ["Ce que touche chaque transformation", "Le domaine de g", "L'ensemble image de g"];

export function nombreLatex(n: number): string {
  if (n === Infinity) return "+\\infty";
  if (n === -Infinity) return "-\\infty";
  const arrondi = Math.round(n * 1e9) / 1e9;
  return String(arrondi === 0 ? 0 : arrondi).replace(".", "{,}");
}

export function intervalleLatex(i: Intervalle): string {
  // \mathopen / \mathclose : « ]−8 » se lit sinon comme une soustraction (espace autour du signe).
  const g = i.gaucheFerme ? "[" : "\\mathopen{]}";
  const d = i.droiteFerme ? "]" : "\\mathclose{[}";
  return `${g}${nombreLatex(i.gauche)} \\,;\\, ${nombreLatex(i.droite)}${d}`;
}

export const DOM_F = "\\text{dom}\\,f";
export const IM_F = "\\text{im}\\,f";
export const DOM_G = "\\text{dom}\\,g";
export const IM_G = "\\text{im}\\,g";

export function nomEnsemble(axe: Axe): string {
  return axe === "H" ? "le domaine" : "l'ensemble image";
}

export function ensembleGLatex(axe: Axe): string {
  return axe === "H" ? DOM_G : IM_G;
}

/** Sigle seul, pour les libellés courts (« après la TH de −5 »). */
export function sigleTransformation(t: Transformation): FragmentConsigne[] {
  switch (t.type) {
    case "SOX":
    case "SOY":
      return [texte(t.type)];
    case "TH":
    case "TV":
      return [texte(`${t.type} de `), latex(nombreLatex(t.valeur))];
    default:
      return [texte(`${t.type} de facteur `), latex(nombreLatex(t.valeur))];
  }
}

const NOMS: Record<TypeTransformation, string> = {
  TH: "translation horizontale",
  TV: "translation verticale",
  SOX: "symétrie d'axe Ox",
  SOY: "symétrie d'axe Oy",
  EH: "étirement horizontal",
  CH: "compression horizontale",
  EV: "étirement vertical",
  CV: "compression verticale",
};

/** Nom complet : « une translation horizontale TH de −5 », « une symétrie d'axe Ox (SOX) »… */
export function descriptionTransformation(t: Transformation): FragmentConsigne[] {
  const article = t.type === "TH" || t.type === "TV" || t.type === "CH" || t.type === "CV" || t.type === "SOX" || t.type === "SOY" ? "une" : "un";
  if (t.type === "SOX" || t.type === "SOY") return [texte(`${article} ${NOMS[t.type]} (${t.type})`)];
  if (t.type === "TH" || t.type === "TV") return [texte(`${article} ${NOMS[t.type]} ${t.type} de `), latex(nombreLatex(t.valeur))];
  return [texte(`${article} ${NOMS[t.type]} ${t.type} de facteur `), latex(nombreLatex(t.valeur))];
}

export function avecMajuscule(fragments: FragmentConsigne[]): FragmentConsigne[] {
  const [premier, ...reste] = fragments;
  if (!premier || premier.type !== "texte") return fragments;
  return [texte(premier.valeur.charAt(0).toUpperCase() + premier.valeur.slice(1)), ...reste];
}

export const CONSIGNE_GENERALE =
  "On ne connaît de la fonction f que son domaine et son ensemble image. Son graphique subit successivement les transformations ci-dessous, dans cet ordre ; on note g la fonction obtenue.";

export const CONSIGNE_PAPIER = "Détermine le domaine et l'ensemble image de g. Justifie chaque étape.";

export function donneesFragments(e: ExerciceTransformationsEnsembles): FragmentConsigne[] {
  return [latex(`${DOM_F} = ${intervalleLatex(e.domaine)}`), texte(" et "), latex(`${IM_F} = ${intervalleLatex(e.image)}`), texte(".")];
}

/** Liste numérotée des transformations (une ligne chacune). */
export function listeTransformations(e: ExerciceTransformationsEnsembles): FragmentConsigne[][] {
  return e.transformations.map((t, i) => [texte(`${i + 1}. `), ...avecMajuscule(descriptionTransformation(t)), texte(i === e.transformations.length - 1 ? "." : " ;")]);
}

export function consignesEcrans(e: ExerciceTransformationsEnsembles): FragmentConsigne[][] {
  return [
    [texte("Pour chaque transformation, indique si elle modifie le domaine ou l'ensemble image.")],
    consigneAxe(e, "H"),
    consigneAxe(e, "V"),
  ];
}

function consigneAxe(e: ExerciceTransformationsEnsembles, axe: Axe): FragmentConsigne[] {
  const liste = transformationsDeLAxe(e, axe);
  const ensemble = axe === "H" ? "le domaine" : "l'ensemble image";
  if (liste.length === 0) return [texte(`Donne ${ensemble} de g.`)];
  if (liste.length === 1) return [texte(`Donne ${ensemble} de g après la seule transformation qui le modifie.`)];
  return [texte(`Suis ${ensemble} à travers les transformations qui le modifient, dans l'ordre : donne-le après chacune d'elles. Le dernier intervalle est ${ensemble} de g.`)];
}

/** Libellé de chaque ligne de saisie d'un écran d'axe. */
export function libellesLignes(e: ExerciceTransformationsEnsembles, axe: Axe): FragmentConsigne[][] {
  const liste = transformationsDeLAxe(e, axe);
  if (liste.length === 0) return [[latex(`${ensembleGLatex(axe)} =`)]];
  return liste.map(({ t, rang }, i) => [
    texte(`Après ${rang}. `),
    ...sigleTransformation(t),
    ...(i === liste.length - 1 ? [texte(" : "), latex(`${ensembleGLatex(axe)} =`)] : [texte(" :")]),
  ]);
}

// ---------------------------------------------------------------------------------------------
// Effet sur un point et sur les bornes (aides, corrigé)
// ---------------------------------------------------------------------------------------------

function plusValeur(variable: string, v: number): string {
  return v < 0 ? `${variable} - ${nombreLatex(-v)}` : `${variable} + ${nombreLatex(v)}`;
}

export function effetPointLatex(t: Transformation): string {
  const k = nombreLatex(t.valeur);
  const image = (() => {
    switch (t.type) {
      case "TH":
        return `(${plusValeur("x", t.valeur)} \\,;\\, y)`;
      case "TV":
        return `(x \\,;\\, ${plusValeur("y", t.valeur)})`;
      case "SOX":
        return "(x \\,;\\, -y)";
      case "SOY":
        return "(-x \\,;\\, y)";
      case "EH":
        return `(${k}x \\,;\\, y)`;
      case "CH":
        return `\\left(\\dfrac{x}{${k}} \\,;\\, y\\right)`;
      case "EV":
        return `(x \\,;\\, ${k}y)`;
      case "CV":
        return `\\left(x \\,;\\, \\dfrac{y}{${k}}\\right)`;
    }
  })();
  return `(x \\,;\\, y) \\mapsto ${image}`;
}

/** Règle sur les bornes, par type (aide de niveau 1, corrigé). */
export function regleBornes(type: TypeTransformation): FragmentConsigne[] {
  switch (type) {
    case "TH":
    case "TV":
      return [texte(`${type} de a : on ajoute a aux deux bornes ; les crochets ne changent pas.`)];
    case "SOX":
    case "SOY":
      return [texte(`${type} : chaque borne change de signe, les deux bornes s'échangent, et chaque crochet suit sa borne.`)];
    case "EH":
    case "EV":
      return [texte(`${type} de facteur k : on multiplie les deux bornes par k ; les crochets ne changent pas.`)];
    case "CH":
    case "CV":
      return [texte(`${type} de facteur k : on divise les deux bornes par k ; les crochets ne changent pas.`)];
  }
}

function borneTexte(b: number): string {
  return nombreLatex(b);
}

function entreParentheses(b: number): string {
  return b < 0 && Number.isFinite(b) ? `(${borneTexte(b)})` : borneTexte(b);
}

/** Opération sur les bornes de l'intervalle `avant`, sans le résultat (aide de niveau 2, corrigé). */
export function operationBornes(t: Transformation, avant: Intervalle): FragmentConsigne[] {
  const g = avant.gauche;
  const d = avant.droite;
  const infini = !Number.isFinite(g) || !Number.isFinite(d);
  const noteInfini = infini ? [texte(" Une borne infinie reste infinie, avec un crochet ouvert.")] : [];
  switch (t.type) {
    case "TH":
    case "TV": {
      const op = (b: number) => `${entreParentheses(b)} ${t.valeur < 0 ? "-" : "+"} ${nombreLatex(Math.abs(t.valeur))}`;
      const finies = [g, d].filter(Number.isFinite);
      return [texte("Bornes finies : "), ...finies.flatMap((b, i) => [...(i > 0 ? [texte(" et ")] : []), latex(op(b))]), texte(" ; mêmes crochets."), ...noteInfini];
    }
    case "SOX":
    case "SOY":
      return [
        texte("Nouvelle borne de gauche : l'opposé de "),
        latex(borneTexte(d)),
        texte(" ; nouvelle borne de droite : l'opposé de "),
        latex(borneTexte(g)),
        texte(". Le crochet de "),
        latex(borneTexte(d)),
        texte(" passe à gauche, celui de "),
        latex(borneTexte(g)),
        texte(" passe à droite."),
        ...noteInfini,
      ];
    case "EH":
    case "EV":
    case "CH":
    case "CV": {
      const fois = t.type === "EH" || t.type === "EV";
      const op = (b: number) => (fois ? `${nombreLatex(t.valeur)} \\times ${entreParentheses(b)}` : `\\dfrac{${borneTexte(b)}}{${nombreLatex(t.valeur)}}`);
      const finies = [g, d].filter(Number.isFinite);
      return [texte("Bornes finies : "), ...finies.flatMap((b, i) => [...(i > 0 ? [texte(" et ")] : []), latex(op(b))]), texte(" ; mêmes crochets."), ...noteInfini];
    }
  }
}

// ---------------------------------------------------------------------------------------------
// Aides (jamais l'intervalle final : il reste toujours le calcul à faire)
// ---------------------------------------------------------------------------------------------

export function aidesClassement(e: ExerciceTransformationsEnsembles): FragmentConsigne[][] {
  return [
    [
      texte(
        "Une transformation qui déplace les points vers la gauche ou la droite change leurs abscisses : elle modifie le domaine. Une transformation qui les déplace vers le haut ou le bas change leurs ordonnées : elle modifie l'ensemble image.",
      ),
    ],
    [
      texte("Regarde quelle coordonnée change pour un point quelconque : "),
      ...e.transformations.flatMap((t, i) => [...(i > 0 ? [texte(" ; ")] : []), ...sigleTransformation(t), texte(" : "), latex(effetPointLatex(t))]),
      texte("."),
    ],
  ];
}

export function aidesAxe(e: ExerciceTransformationsEnsembles, axe: Axe): FragmentConsigne[][] {
  const liste = transformationsDeLAxe(e, axe);
  if (liste.length === 0) {
    return [
      [
        texte(
          axe === "H"
            ? "Seules les transformations horizontales (TH, SOY, EH, CH) modifient le domaine. Y en a-t-il dans la liste ?"
            : "Seules les transformations verticales (TV, SOX, EV, CV) modifient l'ensemble image. Y en a-t-il dans la liste ?",
        ),
      ],
    ];
  }
  const types = [...new Set(liste.map(({ t }) => t.type))];
  const niveau1 = types.flatMap((type, i) => [...(i > 0 ? [texte(" ")] : []), ...regleBornes(type)]);
  const depart = axe === "H" ? e.domaine : e.image;
  const niveau2: FragmentConsigne[] = [
    texte("Première étape, à partir de "),
    latex(intervalleLatex(depart)),
    texte(" ("),
    ...sigleTransformation(liste[0]!.t),
    texte(") — "),
    ...operationBornes(liste[0]!.t, depart),
    ...(liste.length > 1 ? [texte(" Ensuite, applique chaque transformation à l'intervalle que tu viens d'obtenir, dans l'ordre de la liste.")] : []),
  ];
  return [niveau1, niveau2];
}

/** Réponse attendue d'un écran d'axe, pour l'affichage après validation. */
export function chaineLatex(intervalles: Intervalle[]): string {
  return intervalles.map(intervalleLatex).join(" \\;\\to\\; ");
}

export function libelleAxe(axe: Axe): string {
  return axe === "H" ? "Domaine" : "Ensemble image";
}

export function classementAttendu(e: ExerciceTransformationsEnsembles): Axe[] {
  return e.transformations.map((t) => axeDe(t));
}

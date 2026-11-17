import type { ExerciceLirePlacer, IdOperationPlan, IdTransformationPlan, PointEntier } from "../core6e/lirePlacerPlanComplexe.types";
import { TRANSFORMATION_DE, argumentCLatex, cSurAxe, imageOperation, moduleCLatex } from "../moteur6e/modeleLirePlacerPlanComplexe";
import type { PhaseLirePlacer } from "../moteur6e/typesLirePlacerPlanComplexe";
import { graineDepuis, melangerParGraine } from "../moteur6e/saisieComplexe";

/**
 * Couche ui (6e) — textes, aides, options et réponses attendues de `6gen95` « Lire et placer dans
 * le plan complexe ». Source UNIQUE de ce qu'affichent l'écran, le récapitulatif et l'adaptateur
 * d'export (énoncé papier, corrigé, barème) : les nombres viennent de
 * `moteur6e/modeleLirePlacerPlanComplexe.ts`, jamais recalculés ici.
 *
 * Écriture : signe « − » (KaTeX), conjugué `\bar z`, `\arg`, arguments en radians ; aides = phrase
 * terminée par « : » puis la formule ; une aide ne donne jamais le résultat final (il reste au
 * moins un calcul : développer, réduire, compter les carreaux, simplifier une racine…).
 */

export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

export interface ChampLirePlacer {
  label: FragmentConsigne[];
  placeholder: string;
}

export interface OptionTransformation {
  id: IdTransformationPlan;
  fragments: FragmentConsigne[];
}

export const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
export const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

// ---------------------------------------------------------------------------------------------
// Écriture des nombres et des opérations.
// ---------------------------------------------------------------------------------------------

/** Affixe d'un point à coordonnées entières : « 3-2i », « -i », « 4 », « 2i ». */
export function affixeLatex(p: PointEntier): string {
  const coefI = (v: number) => (v === 1 ? "i" : v === -1 ? "-i" : `${v}i`);
  if (p.y === 0) return `${p.x}`;
  if (p.x === 0) return coefI(p.y);
  return `${p.x}${p.y > 0 ? "+" : "-"}${Math.abs(p.y) === 1 ? "" : Math.abs(p.y)}i`;
}

/** Coordonnées « (3 ; −2) » en LaTeX. */
export function coordonneesLatex(p: PointEntier): string {
  return `(${p.x}\\,;${p.y})`;
}

export const OPERATION_LATEX: Record<IdOperationPlan, string> = {
  conjugue: "\\bar z",
  oppose: "-z",
  opposeConjugue: "-\\bar z",
  rotation: "iz",
  double: "2z",
  somme: "z+w",
  difference: "z-w",
};

/** Noms des points images, dans l'ordre des écrans de placement. */
export const NOMS_IMAGES = ["P", "Q"] as const;

/** Étiquette (Unicode, texte brut) d'un point image sur la figure : « P », avec l'opération à côté. */
export const OPERATION_TEXTE: Record<IdOperationPlan, string> = {
  conjugue: "z̄",
  oppose: "−z",
  opposeConjugue: "−z̄",
  rotation: "iz",
  double: "2z",
  somme: "z + w",
  difference: "z − w",
};

export const TRANSFORMATION_FRAGMENTS: Record<IdTransformationPlan, FragmentConsigne[]> = {
  symetrieAxeReel: [t("Symétrie orthogonale d'axe réel")],
  symetrieAxeImaginaire: [t("Symétrie orthogonale d'axe imaginaire")],
  symetrieCentrale: [t("Symétrie centrale de centre O")],
  rotationPlus: [t("Rotation de centre O et d'angle "), l("\\dfrac{\\pi}{2}")],
  rotationMoins: [t("Rotation de centre O et d'angle "), l("-\\dfrac{\\pi}{2}")],
  translationW: [t("Translation de vecteur "), l("\\overrightarrow{OB}"), t(" (d'affixe "), l("w"), t(")")],
  translationMoinsW: [t("Translation de vecteur "), l("\\overrightarrow{BO}"), t(" (d'affixe "), l("-w"), t(")")],
  homothetie: [t("Homothétie de centre O et de rapport 2")],
};

/** Nom court en texte brut (récapitulatif « Ce qu'on sait déjà », sans formule). */
export const TRANSFORMATION_COURTE: Record<IdTransformationPlan, string> = {
  symetrieAxeReel: "symétrie d'axe réel",
  symetrieAxeImaginaire: "symétrie d'axe imaginaire",
  symetrieCentrale: "symétrie de centre O",
  rotationPlus: "quart de tour autour de O, sens contraire des aiguilles",
  rotationMoins: "quart de tour autour de O, sens des aiguilles",
  translationW: "translation qui envoie O sur B",
  translationMoinsW: "translation qui envoie B sur O",
  homothetie: "homothétie de centre O, de rapport 2",
};

const ORDRE_TRANSFORMATIONS: IdTransformationPlan[] = [
  "symetrieAxeReel",
  "symetrieAxeImaginaire",
  "symetrieCentrale",
  "rotationPlus",
  "rotationMoins",
  "translationW",
  "translationMoinsW",
  "homothetie",
];

/** Options de l'écran « associer », mélangées par une graine tirée de l'exercice (même ordre pour
 * les deux opérations). Sans point B, les deux translations disparaissent (w n'existe pas). */
export function optionsTransformations(e: ExerciceLirePlacer): OptionTransformation[] {
  const ids = ORDRE_TRANSFORMATIONS.filter((id) => e.w !== null || (id !== "translationW" && id !== "translationMoinsW"));
  return melangerParGraine(ids, graineDepuis(e, "associer")).map((id) => ({ id, fragments: TRANSFORMATION_FRAGMENTS[id] }));
}

// ---------------------------------------------------------------------------------------------
// Libellés, consignes, champs.
// ---------------------------------------------------------------------------------------------

export const LIBELLE_PHASE: Record<PhaseLirePlacer, string> = {
  lire: "Affixes lues",
  placer1: "Point P",
  placer2: "Point Q",
  associer: "Transformations",
  moduleArgument: "Module et argument de C",
};

export const INDICATION_PLACEMENT = "Touche une intersection du quadrillage pour y placer le point, puis fais-le glisser si besoin.";

/** Consigne générale de l'écran : la figure EST la donnée (aucune coordonnée écrite). */
export function consigneGenerale(e: ExerciceLirePlacer): FragmentConsigne[] {
  return [
    t("Dans le plan complexe ci-dessous (une unité par carreau), le point A a pour affixe "),
    l("z"),
    ...(e.w ? [t(", le point B a pour affixe "), l("w")] : []),
    t(" et le point C a pour affixe "),
    l("z_C"),
    t("."),
  ];
}

export function consigneEcran(e: ExerciceLirePlacer, phase: PhaseLirePlacer): FragmentConsigne[] {
  switch (phase) {
    case "lire":
      return e.w
        ? [t("Lis sur la figure l'affixe "), l("z"), t(" du point A et l'affixe "), l("w"), t(" du point B (forme "), l("a+bi"), t(").")]
        : [t("Lis sur la figure l'affixe "), l("z"), t(" du point A (forme "), l("a+bi"), t(").")];
    case "placer1":
    case "placer2": {
      const i = phase === "placer1" ? 0 : 1;
      return [t(`Place le point ${NOMS_IMAGES[i]} d'affixe `), l(OPERATION_LATEX[e.operations[i]]), t(".")];
    }
    case "associer":
      return [t("Pour chaque opération, choisis la transformation du plan qui envoie le point M d'affixe "), l("z"), t(" sur le point d'affixe obtenue (A sur P, puis A sur Q).")];
    case "moduleArgument":
      return [t("Lis les coordonnées du point C, puis donne le module "), l("|z_C|"), t(" (valeur exacte) et un argument de "), l("z_C"), t(" (en radians).")];
  }
}

export function champsEcran(e: ExerciceLirePlacer, phase: PhaseLirePlacer): ChampLirePlacer[] {
  if (phase === "lire") {
    const champs: ChampLirePlacer[] = [{ label: [l("z=")], placeholder: "ex : 7−5i" }];
    if (e.w) champs.push({ label: [l("w=")], placeholder: "ex : −6+7i" });
    return champs;
  }
  if (phase === "moduleArgument") {
    return [
      { label: [l("|z_C|=")], placeholder: "ex : 2√5" },
      { label: [l("\\arg z_C=")], placeholder: "ex : 5π/6" },
    ];
  }
  return [];
}

// ---------------------------------------------------------------------------------------------
// Aides (deux niveaux sur les écrans ouverts, un seul sur le choix fermé).
// ---------------------------------------------------------------------------------------------

/** Point d'exemple pour l'aide de lecture : jamais un point de la figure. */
function pointExemple(e: ExerciceLirePlacer): PointEntier {
  const candidats: PointEntier[] = [
    { x: -2, y: 3 },
    { x: 3, y: -1 },
    { x: -1, y: -3 },
    { x: 4, y: 2 },
  ];
  const pris = [e.z, e.w, e.c].filter((p): p is PointEntier => p !== null);
  return candidats.find((p) => !pris.some((q) => q.x === p.x && q.y === p.y)) ?? candidats[0];
}

const AIDE_OPERATION_1: Record<IdOperationPlan, AideAvecLatex> = {
  conjugue: { texte: "Le conjugué garde la partie réelle et change le signe de la partie imaginaire (symétrie d'axe réel) :", latex: "\\overline{a+bi}=a-bi" },
  oppose: { texte: "L'opposé change le signe des deux parties (symétrie de centre O) :", latex: "-(a+bi)=-a-bi" },
  opposeConjugue: { texte: "L'opposé du conjugué change seulement le signe de la partie réelle (symétrie d'axe imaginaire) :", latex: "-\\overline{a+bi}=-a+bi" },
  rotation: { texte: "Développe le produit, puis remplace le carré de i par sa valeur :", latex: "i^2=-1,\\quad i(a+bi)=ai+bi^2=-b+ai" },
  double: { texte: "Multiplier par le réel 2 double les deux coordonnées (homothétie de centre O, de rapport 2) :", latex: "2(a+bi)=2a+2bi" },
  somme: { texte: "On additionne les parties réelles entre elles, puis les parties imaginaires entre elles :", latex: "(a+bi)+(c+di)=(a+c)+(b+d)i" },
  difference: { texte: "On soustrait dans l'ordre « z moins w », partie réelle par partie réelle, partie imaginaire par partie imaginaire :", latex: "(a+bi)-(c+di)=(a-c)+(b-d)i" },
};

function aideOperation2(e: ExerciceLirePlacer, op: IdOperationPlan): AideAvecLatex {
  const z = affixeLatex(e.z);
  const w = e.w ? affixeLatex(e.w) : "";
  const latex: Record<IdOperationPlan, string> = {
    conjugue: `\\bar z=\\overline{${z}}`,
    oppose: `-z=-(${z})`,
    opposeConjugue: `-\\bar z=-\\overline{${z}}`,
    rotation: `iz=i(${z})`,
    double: `2z=2(${z})`,
    somme: `z+w=(${z})+(${w})`,
    difference: `z-w=(${z})-(${w})`,
  };
  return { texte: "Calcule l'affixe à partir de celle(s) lue(s) à l'étape 1, puis compte les carreaux depuis O (vers la droite pour une partie réelle positive, vers le haut pour une partie imaginaire positive) :", latex: latex[op] };
}

export function aideNiveau1(e: ExerciceLirePlacer, phase: PhaseLirePlacer): AideAvecLatex {
  switch (phase) {
    case "lire":
      return { texte: "La partie réelle se lit sur l'axe horizontal (Re), la partie imaginaire sur l'axe vertical (Im) :", latex: "M(a\\,;b)\\ \\longleftrightarrow\\ z_M=a+bi" };
    case "placer1":
      return AIDE_OPERATION_1[e.operations[0]];
    case "placer2":
      return AIDE_OPERATION_1[e.operations[1]];
    case "associer":
      return {
        texte:
          "Compare chaque point obtenu à A : même abscisse ou même ordonnée (symétrie d'axe), coordonnées toutes deux opposées (symétrie centrale), quart de tour autour de O (multiplication par i, de module 1), points alignés avec O et deux fois plus loin (multiplication par un réel), glissement d'un même vecteur (addition).",
        latex: null,
      };
    case "moduleArgument":
      return { texte: "Le module est la distance de O au point (Pythagore) ; un argument est l'angle orienté entre l'axe réel positif et la demi-droite [OC) :", latex: "|a+bi|=\\sqrt{a^2+b^2}" };
  }
}

export function aideNiveau2(e: ExerciceLirePlacer, phase: PhaseLirePlacer): AideAvecLatex {
  switch (phase) {
    case "lire": {
      const p = pointExemple(e);
      return { texte: `Exemple : le point situé ${Math.abs(p.x)} carreau${Math.abs(p.x) > 1 ? "x" : ""} ${p.x < 0 ? "à gauche" : "à droite"} de O et ${Math.abs(p.y)} carreau${Math.abs(p.y) > 1 ? "x" : ""} ${p.y < 0 ? "en dessous" : "au-dessus"} a pour affixe :`, latex: affixeLatex(p) };
    }
    case "placer1":
      return aideOperation2(e, e.operations[0]);
    case "placer2":
      return aideOperation2(e, e.operations[1]);
    case "associer":
      return { texte: "", latex: null };
    case "moduleArgument": {
      const c = e.c;
      if (cSurAxe(c)) return { texte: "C est sur un axe : son module est sa distance à O, et son argument est l'un des quatre angles suivants (selon le demi-axe) :", latex: "0,\\quad \\frac{\\pi}{2},\\quad \\pi,\\quad -\\frac{\\pi}{2}" };
      return { texte: "C est sur une diagonale du quadrillage : son argument est l'un des angles ci-dessous (selon le quadrant) ; pour le module, applique Pythagore aux coordonnées lues, puis simplifie la racine :", latex: `|z_C|=\\sqrt{x_C^2+y_C^2},\\quad \\arg z_C\\in\\left\\{\\pm\\frac{\\pi}{4},\\ \\pm\\frac{3\\pi}{4}\\right\\}` };
    }
  }
}

// ---------------------------------------------------------------------------------------------
// Réponses attendues (écran, récapitulatif, corrigé).
// ---------------------------------------------------------------------------------------------

export function imageDe(e: ExerciceLirePlacer, i: 0 | 1): PointEntier {
  return imageOperation(e.operations[i], e.z, e.w);
}

/** Réponse attendue d'un écran, en LaTeX (une formule par élément) — écrans de saisie et de
 * placement ; l'écran « associer » a sa propre forme (`reponseAssocierFragments`). */
export function formatReponseAttenduePhaseLatex(e: ExerciceLirePlacer, phase: PhaseLirePlacer): string[] {
  switch (phase) {
    case "lire":
      return e.w ? [`z=${affixeLatex(e.z)}`, `w=${affixeLatex(e.w)}`] : [`z=${affixeLatex(e.z)}`];
    case "placer1":
    case "placer2": {
      const i = phase === "placer1" ? 0 : 1;
      const p = imageDe(e, i);
      return [`${NOMS_IMAGES[i]}${coordonneesLatex(p)}`, `${OPERATION_LATEX[e.operations[i]]}=${affixeLatex(p)}`];
    }
    case "associer":
      return e.operations.map((op) => `z\\mapsto ${OPERATION_LATEX[op]}`);
    case "moduleArgument":
      return [`|z_C|=${moduleCLatex(e.c)}`, `\\arg z_C=${argumentCLatex(e.c)}`];
  }
}

/** Réponse de l'écran « associer » : « z ↦ z̄ : symétrie d'axe réel » pour chaque opération. */
export function reponseAssocierFragments(e: ExerciceLirePlacer): FragmentConsigne[] {
  return e.operations.flatMap((op, i) => [...(i > 0 ? [t(" ; ")] : []), l(`z\\mapsto ${OPERATION_LATEX[op]}`), t(" : "), ...minuscule(TRANSFORMATION_FRAGMENTS[TRANSFORMATION_DE[op]])]);
}

function minuscule(fr: FragmentConsigne[]): FragmentConsigne[] {
  return fr.map((f, i) => (i === 0 && f.type === "texte" ? t(f.valeur.charAt(0).toLowerCase() + f.valeur.slice(1)) : f));
}

/** Réponse d'un écran sous forme de fragments (texte + LaTeX), pour le corrigé et le barème. */
export function reponseFragments(e: ExerciceLirePlacer, phase: PhaseLirePlacer): FragmentConsigne[] {
  if (phase === "associer") return reponseAssocierFragments(e);
  if (phase === "placer1" || phase === "placer2") {
    const i = phase === "placer1" ? 0 : 1;
    const p = imageDe(e, i);
    return [t(`${NOMS_IMAGES[i]} d'affixe `), l(`${OPERATION_LATEX[e.operations[i]]}=${affixeLatex(p)}`), t(", de coordonnées "), l(coordonneesLatex(p))];
  }
  return formatReponseAttenduePhaseLatex(e, phase).flatMap((x, i) => (i === 0 ? [l(x)] : [t(" ; "), l(x)]));
}

/** Ligne du récapitulatif « Ce qu'on sait déjà » (texte brut pour « associer »). */
export function valeurRecapitulatif(e: ExerciceLirePlacer, phase: PhaseLirePlacer): { valeur: string; estLatex: boolean; valeurs?: string[] } {
  if (phase === "associer") {
    return { valeur: e.operations.map((op, i) => `${NOMS_IMAGES[i]} : ${TRANSFORMATION_COURTE[TRANSFORMATION_DE[op]]}`).join(" ; "), estLatex: false };
  }
  const valeurs = formatReponseAttenduePhaseLatex(e, phase);
  return { valeur: valeurs.join(",\\quad "), estLatex: true };
}

// ---------------------------------------------------------------------------------------------
// Diagnostics (message ciblé après une tentative fausse — jamais la réponse).
// ---------------------------------------------------------------------------------------------

const MESSAGES_PLACEMENT: Record<string, FragmentConsigne[]> = {
  oppose: [t("Tu as placé le point d'affixe "), l("-z"), t(" : c'est le symétrique de A par rapport à O (les deux coordonnées changent de signe).")],
  conjugue: [t("Tu as placé le point d'affixe "), l("\\bar z"), t(" : seule la partie imaginaire change de signe (symétrie d'axe réel).")],
  opposeConjugue: [t("Tu as placé le point d'affixe "), l("-\\bar z"), t(" : seule la partie réelle change de signe (symétrie d'axe imaginaire).")],
  rotationMoins: [t("Tu as tourné dans le sens des aiguilles d'une montre : c'est le point d'affixe "), l("-iz"), t(". Multiplier par "), l("i"), t(" fait tourner de "), l("\\frac{\\pi}{2}"), t(" dans le sens contraire.")],
  iCarre: [t("En développant, n'oublie pas que "), l("i^2=-1"), t(" : le terme "), l("bi\\cdot i"), t(" donne "), l("-b"), t(".")],
  doubleReel: [t("Tu n'as doublé que la partie réelle : "), l("2z"), t(" double aussi la partie imaginaire.")],
  doubleImaginaire: [t("Tu n'as doublé que la partie imaginaire : "), l("2z"), t(" double aussi la partie réelle.")],
  plusDeux: [t("Tu as ajouté 2 à la partie réelle : il faut multiplier les deux coordonnées par 2.")],
  "somme-difference": [t("Tu as placé "), l("z-w"), t(" : pour "), l("z+w"), t(", additionne les coordonnées de B à celles de A.")],
  "somme-w-moins-z": [t("Tu as placé "), l("w-z"), t(" : pour "), l("z+w"), t(", additionne les coordonnées de A et de B.")],
  "w-moins-z": [t("Tu as placé "), l("w-z"), t(" : l'ordre compte, "), l("z-w=-(w-z)"), t(" est son symétrique par rapport à O.")],
  "difference-somme": [t("Tu as additionné : "), l("z-w"), t(" retranche les coordonnées de B à celles de A.")],
  inversion: [t("Tu as échangé partie réelle et partie imaginaire : la partie réelle se lit sur l'axe horizontal (Re), la partie imaginaire sur l'axe vertical (Im).")],
  depart: [t("Le point est resté sur A : calcule d'abord l'affixe demandée, puis place le point correspondant.")],
  autre: [t("Ce n'est pas le bon point : calcule d'abord l'affixe demandée, puis compte les carreaux depuis O.")],
};

export function messagePlacement(id: string): FragmentConsigne[] {
  return MESSAGES_PLACEMENT[id] ?? MESSAGES_PLACEMENT.autre;
}

// ---------------------------------------------------------------------------------------------
// Corrigé : lignes de calcul et pièges.
// ---------------------------------------------------------------------------------------------

/** Terme « coefficient × i » ou « coefficient × i² » signé, pour le développement de iz. */
function termeI(v: number, puissance: "" | "^2", premier: boolean): string {
  const signe = v < 0 ? "-" : premier ? "" : "+";
  const mag = Math.abs(v) === 1 ? "" : `${Math.abs(v)}`;
  return `${signe}${mag}i${puissance}`;
}

export function calculPlacement(e: ExerciceLirePlacer, i: 0 | 1): string {
  const op = e.operations[i];
  const z = affixeLatex(e.z);
  const w = e.w ? affixeLatex(e.w) : "";
  const img = affixeLatex(imageDe(e, i));
  switch (op) {
    case "conjugue":
      return `\\bar z=\\overline{${z}}=${img}`;
    case "oppose":
      return `-z=-(${z})=${img}`;
    case "opposeConjugue":
      return `-\\bar z=-(${affixeLatex({ x: e.z.x, y: -e.z.y })})=${img}`;
    case "rotation":
      return `iz=i(${z})=${termeI(e.z.x, "", true)}${termeI(e.z.y, "^2", false)}=${img}`;
    case "double":
      return `2z=2(${z})=${img}`;
    case "somme":
      return `z+w=(${z})+(${w})=${img}`;
    case "difference":
      return `z-w=(${z})-(${w})=${img}`;
  }
}

export const PIEGE_OPERATION: Record<IdOperationPlan, FragmentConsigne[]> = {
  conjugue: [t("Confondre "), l("\\bar z"), t(" (symétrie d'axe réel) avec "), l("-z"), t(" (symétrie de centre O).")],
  oppose: [t("Confondre "), l("-z"), t(" (symétrie de centre O) avec "), l("\\bar z"), t(" (symétrie d'axe réel).")],
  opposeConjugue: [t("Confondre "), l("-\\bar z"), t(" (symétrie d'axe imaginaire) avec "), l("\\bar z"), t(" (symétrie d'axe réel).")],
  rotation: [t("Tourner dans le sens des aiguilles d'une montre (point "), l("-iz"), t(") ou oublier que "), l("i^2=-1"), t(".")],
  double: [t("Ne doubler qu'une seule des deux coordonnées.")],
  somme: [t("Soustraire au lieu d'additionner les coordonnées de B.")],
  difference: [t("Placer "), l("w-z"), t(" au lieu de "), l("z-w"), t(" (l'ordre de la soustraction compte).")],
};

/** Piège de l'étape « associer », propre aux deux opérations de l'exercice. */
const PIEGE_TRANSFORMATION: Record<IdOperationPlan, FragmentConsigne[]> = {
  conjugue: [t("le conjugué est une symétrie d'axe réel, pas de centre O")],
  oppose: [t("l'opposé est une symétrie de centre O, pas une symétrie d'axe")],
  opposeConjugue: [t("l'opposé du conjugué est une symétrie d'axe imaginaire, pas d'axe réel")],
  rotation: [t("multiplier par "), l("i"), t(" fait tourner de "), l("\\frac{\\pi}{2}"), t(" dans le sens contraire des aiguilles d'une montre (pas de "), l("-\\frac{\\pi}{2}"), t(")")],
  double: [t("multiplier par le réel 2 est une homothétie de centre O, pas une translation")],
  somme: [t("ajouter "), l("w"), t(" est la translation de vecteur "), l("\\overrightarrow{OB}"), t(", pas "), l("\\overrightarrow{BO}")],
  difference: [t("retrancher "), l("w"), t(" est la translation de vecteur "), l("\\overrightarrow{BO}"), t(" (d'affixe "), l("-w"), t("), pas "), l("\\overrightarrow{OB}")],
};

export function piegeAssocier(e: ExerciceLirePlacer): FragmentConsigne[] {
  const [a, b] = e.operations.map((op) => PIEGE_TRANSFORMATION[op]);
  const premier = a.map((f, i) => (i === 0 && f.type === "texte" ? t(f.valeur.charAt(0).toUpperCase() + f.valeur.slice(1)) : f));
  return [...premier, t(" ; "), ...b, t(".")];
}

/** Justification de la transformation associée à une opération (corrigé, étape « associer »). */
export const JUSTIFICATION_TRANSFORMATION: Record<IdOperationPlan, string> = {
  conjugue: "\\overline{a+bi}=a-bi",
  oppose: "-(a+bi)=-a-bi",
  opposeConjugue: "-\\overline{a+bi}=-a+bi",
  rotation: "iz=e^{i\\frac{\\pi}{2}}\\,z",
  double: "z\\mapsto 2z,\\ \\ 2(a+bi)=2a+2bi",
  somme: "z\\mapsto z+w",
  difference: "z\\mapsto z+(-w)",
};

/** Calcul du module et de l'argument de z_C (corrigé). */
export function calculModuleArgument(e: ExerciceLirePlacer): string {
  const c = e.c;
  const somme = c.x * c.x + c.y * c.y;
  const p = (v: number) => (v < 0 ? `(${v})` : `${v}`);
  const racine = `\\sqrt{${somme}}`;
  const fin = moduleCLatex(c) === racine ? racine : `${racine}=${moduleCLatex(c)}`;
  return `z_C=${affixeLatex(c)},\\quad |z_C|=\\sqrt{${p(c.x)}^2+${p(c.y)}^2}=${fin},\\quad \\arg z_C=${argumentCLatex(c)}`;
}

/** Justification de l'argument : demi-axe ou diagonale/quadrant. */
export function justificationArgument(e: ExerciceLirePlacer): FragmentConsigne[] {
  const c = e.c;
  if (cSurAxe(c)) {
    const demi = c.y === 0 ? (c.x > 0 ? "le demi-axe réel positif" : "le demi-axe réel négatif") : c.y > 0 ? "le demi-axe imaginaire positif" : "le demi-axe imaginaire négatif";
    return [t(`C est sur ${demi} : son argument se lit directement.`)];
  }
  const quadrant = c.x > 0 ? (c.y > 0 ? "en haut à droite" : "en bas à droite") : c.y > 0 ? "en haut à gauche" : "en bas à gauche";
  return [t(`C est sur une diagonale du quadrillage (même distance aux deux axes), ${quadrant} de O : l'angle avec l'axe réel positif vaut `), l(argumentCLatex(c)), t(".")];
}

/** Message ciblé d'une tentative fausse (identifiant de `diagnosticEcran`) — jamais la réponse. */
export function messageDiagnostic(e: ExerciceLirePlacer, phase: PhaseLirePlacer, id: string): FragmentConsigne[] {
  if (phase === "placer1" || phase === "placer2") return messagePlacement(id);
  if (phase === "associer") return [t("Au moins une transformation ne correspond pas à son opération.")];
  if (phase === "lire") {
    const [nom, cas] = id.split(":");
    const suite: Record<string, string> = {
      inversion: "tu as échangé partie réelle et partie imaginaire. La partie réelle est l'abscisse (axe horizontal Re), la partie imaginaire l'ordonnée (axe vertical Im).",
      imaginaire: "vérifie le signe de la partie imaginaire : elle est positive au-dessus de l'axe réel, négative en dessous.",
      reelle: "vérifie le signe de la partie réelle : elle est positive à droite de l'axe imaginaire, négative à gauche.",
      signes: "vérifie les signes des deux parties (positives à droite et au-dessus de O).",
      autre: "compte les carreaux depuis O, horizontalement puis verticalement.",
    };
    const corps = suite[cas] ?? suite.autre;
    if (!e.w) return [t(corps.charAt(0).toUpperCase() + corps.slice(1))];
    return [t("Affixe "), l(nom === "A" ? "z" : "w"), t(` du point ${nom} : ${corps}`)];
  }
  const messages: Record<string, FragmentConsigne[]> = {
    "module:carre": [t("Tu as donné "), l("|z_C|^2"), t(" : n'oublie pas la racine carrée.")],
    "module:somme": [t("Le module n'est pas la somme des coordonnées : c'est la longueur OC, par Pythagore.")],
    "module:autre": [t("Module incorrect : relis les coordonnées de C, puis applique Pythagore.")],
    "argument:signe": [t("Module correct. Signe de l'argument : un point situé sous l'axe réel a un argument négatif, au-dessus un argument positif.")],
    "argument:oppose": [t("Module correct. Tu as donné l'argument du symétrique de C par rapport à O : vérifie dans quel quadrant se trouve C.")],
    "argument:symetrique": [t("Module correct. Tu as donné l'argument du symétrique de C par rapport à l'axe imaginaire : vérifie de quel côté de cet axe se trouve C.")],
    "argument:autre": [t("Module correct, mais pas l'argument : mesure l'angle depuis l'axe réel positif, dans le sens contraire des aiguilles d'une montre.")],
  };
  return messages[id] ?? messages["module:autre"];
}

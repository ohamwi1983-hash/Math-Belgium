import type { AffixeEntiere, ExerciceTransfoA, ExerciceTransfoB, ExerciceTransfoC, ExerciceTransfoD, ExerciceTransformationsPlan, NatureTransfoD, ParametresTransfoA, SousTypeTransfoA } from "../core6e/transformationsPlan.types";
import type { PhaseTransformationsPlan } from "../moteur6e/typesTransformationsPlan";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen40`. Dispatch sur
 * `exercice.famille` PUIS `phase`, mirroir `formatFormeTrigonometrique.ts` (6gen37), jamais importé
 * par un autre générateur (chaque générateur reste indépendant — CLAUDE.md).
 *
 * **Vigilance signe orphelin / groupe LaTeX vide** (bug déjà rencontré et corrigé sur 6gen23/6gen26/
 * 6gen34/6gen37, documenté par CLAUDE.md) — `affixeLatex` ci-dessous est la SEULE fonction qui
 * assemble un "a+bi" (a,b toujours des ENTIERS ici, voir `core6e/transformationsPlan.types.ts`) —
 * assemble TOUJOURS signe+magnitude ENSEMBLE, jamais un signe bare. Couverture de régression :
 * `formatTransformationsPlan.test.ts`, "signe orphelin", scanne le LaTeX rendu sur de nombreux
 * tirages aléatoires des 3 familles à la recherche d'un `++`/`+-`/groupe vide.
 *
 * **`\cdot` suivi d'un identifiant** (piège documenté CLAUDE.md, a touché 6gen37 pour `z_1\cdotz_2`)
 * — toute concaténation LaTeX ici insère `\,` après un `\cdot` collé à `z`/`k`/`e` (voir
 * `formuleSubstitueeA`).
 */

export type TypeChamp = "texte" | "choix";

export interface OptionChoix {
  valeur: string;
  label: string;
}

export interface ChampDef {
  type: TypeChamp;
  /** Libellé texte brut (fiche « votre réponse », aperçu). */
  label: string;
  /** Libellé affiché devant le champ, symboles en KaTeX (audit 6e ch. 5 : « |z_A| = » était
   * affiché en notation clavier). Ajouté par `champsEcran`. */
  libelle?: FragmentConsigne[];
  placeholder?: string;
  options?: OptionChoix[];
}

/** Aide : texte riche (prose + LaTeX inline — audit 6e ch. 5 : plus aucune formule « au clavier »
 * du type z_v, e^{iθ} dans la prose) + formule LaTeX affichée en bloc. */
export interface AideAvecLatex {
  texte: FragmentConsigne[];
  latex: string | null;
}

/** Texte brut mêlé à du LaTeX inline court — même contrat que `ui/formatEquationDroite.ts`,
 * rendu via `components/RenduFragments.tsx`. */
export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

function texte(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}
function latexFrag(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
}

const AUCUNE_AIDE: AideAvecLatex = { texte: [], latex: null };

// ============================================================================
// Assemblage "a+bi" (a,b entiers) — voir en-tête de fichier.
// ============================================================================

export function affixeLatex(z: AffixeEntiere): string {
  const { a, b } = z;
  if (a === 0 && b === 0) return "0";
  const aTexte = a === 0 ? "" : `${a}`;
  if (b === 0) return aTexte;
  const bSigne = b < 0 ? "-" : "+";
  const bMagnitude = Math.abs(b) === 1 ? "" : `${Math.abs(b)}`;
  if (a === 0) return `${b < 0 ? "-" : ""}${bMagnitude}i`;
  return `${aTexte}${bSigne}${bMagnitude}i`;
}

/** `e^{iθ}` — jamais une simple concaténation `"i"+angle.latex` (piège déjà rencontré/corrigé sur
 * 6gen37, `formatFormeTrigonometrique.ts` — voir son en-tête) : le signe négatif est ramené DEVANT
 * le `i` (`e^{-i\frac{\pi}{2}}`), jamais laissé coller au `i` par la droite (se lirait "i MOINS..."
 * au lieu de "i fois..."). Réimplication délibérée (jamais importée de `formatFormeTrigonometrique.
 * ts`, "jamais importé par un autre générateur" — voir son en-tête). */
function formatExpIAngle(angleLatex: string): string {
  return angleLatex.startsWith("-") ? `-i${angleLatex.slice(1)}` : `i${angleLatex}`;
}

/** Module d'un point construit par `tirerAffixeEntiereRemarquable` (axe `q∈{1,2}` → `r` entier ;
 * "quart" `q=4` → `r=k√2`) — mêmes conventions que `latexModuleDepuisAngle` de
 * `formatFormeTrigonometrique.ts` (6gen37), réimpliquée ici. */
function moduleLatex(r: number, angleQ: number): string {
  if (angleQ === 4) {
    const k = Math.round(r / Math.SQRT2);
    return k === 1 ? "\\sqrt{2}" : `${k}\\sqrt{2}`;
  }
  return `${Math.round(r)}`;
}

// ============================================================================
// Famille A — Image d'un point par une transformation classique ou composée.
// ============================================================================

/**
 * Description PURE PROSE de la transformation, consommée par `consigneGeneraleA` UNIQUEMENT — texte
 * PLAIN, jamais dans `blocDonnees` (bug historique : `\text{...}` avec `_` isolé → erreur KaTeX, et
 * débordement d'`.equation-box` — voir `docs/historique-6e.md`, section 6gen40). Plus aucune
 * majuscule d'insistance (audit 6e ch. 5).
 */
const LIBELLE_SOUS_TYPE_A: Record<SousTypeTransfoA, string> = {
  translation: "une translation",
  homothetie: "une homothétie de centre O",
  rotation: "une rotation de centre O",
  similitude: "une similitude de centre O (rotation puis homothétie)",
  rotationTranslation: "une rotation de centre O suivie d'une translation",
};

export function consigneGeneraleA(e: ExerciceTransfoA): FragmentConsigne[] {
  return [texte("P est un point d'affixe "), latexFrag("z_P"), texte(`. Identifie la formule complexe correspondant à ${LIBELLE_SOUS_TYPE_A[e.parametres.sousType]}, puis calcule l'image de P.`)];
}

/** Une donnée par ligne (audit 6e ch. 5 : aucune ligne `\quad` qui déborde à 390 px). */
export function blocDonneesA(e: ExerciceTransfoA): string[] {
  const lignes = [`z_P=${affixeLatex(e.zP)}`];
  const p = e.parametres;
  if (p.sousType === "translation") lignes.push(`z_v=${affixeLatex(p.zV)}`);
  else if (p.sousType === "homothetie") lignes.push(`k=${p.k}`);
  else if (p.sousType === "rotation") lignes.push(`\\theta=${p.angle.latex}`);
  else if (p.sousType === "similitude") lignes.push(`k=${p.k}`, `\\theta=${p.angle.latex}`);
  else lignes.push(`\\theta=${p.angle.latex}`, `z_v=${affixeLatex(p.zV)}`);
  return lignes;
}

/** Formule CORRECTE, symboles substitués par les valeurs numériques réelles de l'exercice — utilisée
 * pour le "état actuel" de l'écran 2 (jamais pour l'écran 1, QCM volontairement SYMBOLIQUE). */
function formuleSubstitueeA(e: ExerciceTransfoA): string {
  const p = e.parametres;
  const zP = affixeLatex(e.zP);
  switch (p.sousType) {
    case "translation":
      return `z_P+z_v=(${zP})+(${affixeLatex(p.zV)})`;
    case "homothetie":
      return `k\\cdot\\, z_P=${p.k}\\cdot\\,(${zP})`;
    case "rotation":
      return `z_P\\cdot\\, e^{${formatExpIAngle(p.angle.latex)}}=(${zP})\\cdot\\, e^{${formatExpIAngle(p.angle.latex)}}`;
    case "similitude":
      return `k\\cdot\\, z_P\\cdot\\, e^{${formatExpIAngle(p.angle.latex)}}=${p.k}\\cdot\\,(${zP})\\cdot\\, e^{${formatExpIAngle(p.angle.latex)}}`;
    case "rotationTranslation":
      return `z_P\\cdot\\, e^{${formatExpIAngle(p.angle.latex)}}+z_v=(${zP})\\cdot\\, e^{${formatExpIAngle(p.angle.latex)}}+(${affixeLatex(p.zV)})`;
  }
}

export function consigneEcranA(phase: PhaseTransformationsPlan): FragmentConsigne[] {
  if (phase === "aEcran1") return [texte("Parmi les formules proposées, choisis celle qui correspond exactement à cette transformation (une seule tentative).")];
  return [texte("Calcule l'image de P à partir de la formule confirmée à l'étape précédente.")];
}

export function etatActuelA(e: ExerciceTransfoA, phase: PhaseTransformationsPlan): string[] | null {
  if (phase !== "aEcran2") return null;
  return [`${formuleSubstitueeA(e)}\\text{ (formule confirmée)}`];
}

/** Placeholders HORS de l'espace des tirages (audit 6e ch. 5) : les affixes tirées sont entières,
 * « 0,5+1,5i » ne peut donc jamais être une réponse (et montre la virgule décimale). */
const PLACEHOLDER_AFFIXE = "ex : 0,5+1,5i";
/** Modules/rapports tirés : 1 à 4, k√2 (k ≤ 3), |a| ∈ {√2 ; 2 ; 2√2} — jamais 5. */
const PLACEHOLDER_REEL = "ex : 5";
/** Angles tirés : multiples de π/4 — jamais 2π/5. */
const PLACEHOLDER_ANGLE = "ex : 2pi/5";

export function champsA(phase: PhaseTransformationsPlan): ChampDef[] {
  if (phase === "aEcran2") return [{ type: "texte", label: "Image de P =", placeholder: PLACEHOLDER_AFFIXE }];
  return []; // aEcran1 : écran de CHOIX (QCM), aucun champ texte — voir EtapeChoixFormuleTransformationsPlan.
}

export function niveauAideMaxA(phase: PhaseTransformationsPlan): number {
  return phase === "aEcran1" ? 2 : 0;
}
export function aideNiveau1A(phase: PhaseTransformationsPlan): AideAvecLatex {
  if (phase !== "aEcran1") return AUCUNE_AIDE;
  return {
    texte: [
      texte("Formules complexes de base : une translation de vecteur "),
      latexFrag("z_v"),
      texte(" ajoute "),
      latexFrag("z_v"),
      texte(" ; une homothétie de centre O et de rapport "),
      latexFrag("k"),
      texte(" multiplie par "),
      latexFrag("k"),
      texte(" ; une rotation de centre O et d'angle "),
      latexFrag("\\theta"),
      texte(" multiplie par "),
      latexFrag("e^{i\\theta}"),
      texte("."),
    ],
    latex: "z_P+z_v\\qquad k\\cdot\\, z_P\\qquad z_P\\cdot\\, e^{i\\theta}",
  };
}

/**
 * Aide 2 — NE DÉSIGNE PLUS la formule de l'exercice (audit 6e ch. 5, point 40 : « Ici, une
 * translation seule : z_P+z_v » donnait la réponse du QCM). Elle donne à la place des PROPRIÉTÉS que
 * l'image doit vérifier, à tester sur chaque option pour éliminer les distracteurs — l'élève fait
 * lui-même le tri.
 */
export function aideNiveau2A(e: ExerciceTransfoA, phase: PhaseTransformationsPlan): AideAvecLatex {
  if (phase !== "aEcran1") return AUCUNE_AIDE;
  switch (e.parametres.sousType) {
    case "translation":
      return {
        texte: [texte("Teste chaque option : une translation de vecteur nul laisse P en place, et le vecteur "), latexFrag("\\overrightarrow{PP'}"), texte(" a pour affixe "), latexFrag("z_v"), texte(" (pas son opposé).")],
        latex: "z_v=0\\ \\Rightarrow\\ z_{P'}=z_P\\qquad z_{P'}-z_P=z_v",
      };
    case "homothetie":
      return {
        texte: [texte("Teste chaque option : une homothétie de centre O laisse O fixe et multiplie les distances à O par "), latexFrag("|k|"), texte(".")],
        latex: "z_P=0\\ \\Rightarrow\\ z_{P'}=0\\qquad |z_{P'}|=|k|\\cdot|z_P|",
      };
    case "rotation":
      return {
        texte: [texte("Teste chaque option : une rotation de centre O conserve la distance à O et fait tourner P de "), latexFrag("\\theta"), texte(" dans le sens trigonométrique (pas de "), latexFrag("-\\theta"), texte(").")],
        latex: "|z_{P'}|=|z_P|\\qquad \\arg z_{P'}=\\arg z_P+\\theta",
      };
    case "similitude":
      return {
        texte: [texte("Teste chaque option : la distance à O est multipliée par "), latexFrag("|k|"), texte(" et P tourne de "), latexFrag("\\theta"), texte(" (pas de "), latexFrag("-\\theta"), texte(") autour de O.")],
        latex: "z_P=0\\ \\Rightarrow\\ z_{P'}=0\\qquad |z_{P'}|=|k|\\cdot|z_P|",
      };
    case "rotationTranslation":
      return {
        texte: [texte("L'ordre compte : on tourne d'abord P autour de O, puis on translate. Teste chaque option avec P = O : la rotation laisse O fixe, l'image de O doit donc être le point d'affixe "), latexFrag("z_v"), texte(".")],
        latex: "z_P=0\\ \\Rightarrow\\ z_{P'}=z_v",
      };
  }
}

/**
 * QCM famille A, écran 1 — options SYMBOLIQUES (z_P, k, θ, z_v) : liste de RÉFÉRENCE dont l'option
 * correcte est TOUJOURS l'indice 0, puis réordonnée par `ordre` (permutation tirée à la génération,
 * `ExerciceTransfoA.ordreOptions` — audit 6e ch. 5, point 6 : la bonne option occupait une position
 * fixe par sous-type). Le piège central (ordre d'une transformation composée) reste encodé dans
 * `rotationTranslation` : `(z_P+z_v)\cdot e^{i\theta}` applique la translation AVANT la rotation.
 */
function optionsReferenceA(sousType: SousTypeTransfoA): { id: string; latex: string }[] {
  switch (sousType) {
    case "translation":
      return [
        { id: "correct", latex: "z_P+z_v" },
        { id: "sensInverse", latex: "z_v-z_P" },
        { id: "signeInverse", latex: "z_P-z_v" },
        { id: "operationErronee", latex: "z_P\\cdot\\, z_v" },
      ];
    case "homothetie":
      return [
        { id: "correct", latex: "k\\cdot\\, z_P" },
        { id: "operationErronee", latex: "z_P+k" },
        { id: "operationInverse", latex: "\\dfrac{z_P}{k}" },
        { id: "puissanceErronee", latex: "z_P^{k}" },
      ];
    case "rotation":
      return [
        { id: "correct", latex: "z_P\\cdot\\, e^{i\\theta}" },
        { id: "operationErronee", latex: "z_P+e^{i\\theta}" },
        { id: "signeInverse", latex: "z_P\\cdot\\, e^{-i\\theta}" },
        { id: "sensInverse", latex: "\\dfrac{e^{i\\theta}}{z_P}" },
      ];
    case "similitude":
      return [
        { id: "correct", latex: "k\\cdot\\, z_P\\cdot\\, e^{i\\theta}" },
        { id: "kDansExposant", latex: "z_P\\cdot\\, e^{ik\\theta}" },
        { id: "operationErronee", latex: "k+z_P\\cdot\\, e^{i\\theta}" },
        { id: "signeInverse", latex: "k\\cdot\\, z_P\\cdot\\, e^{-i\\theta}" },
      ];
    case "rotationTranslation":
      return [
        { id: "correct", latex: "z_P\\cdot\\, e^{i\\theta}+z_v" },
        { id: "ordreInverse", latex: "(z_P+z_v)\\cdot\\, e^{i\\theta}" },
        { id: "zvDansRotation", latex: "z_P+z_v\\cdot\\, e^{i\\theta}" },
        { id: "signeInverse", latex: "z_P\\cdot\\, e^{i\\theta}-z_v" },
      ];
  }
}

export function optionsFormuleA(sousType: SousTypeTransfoA, ordre?: number[]): { id: string; latex: string }[] {
  const reference = optionsReferenceA(sousType);
  if (!ordre || ordre.length !== reference.length) return reference;
  return ordre.map((i) => reference[i]);
}

// ============================================================================
// Famille B — Construire un point depuis somme/produit, identifier la transformation.
// ============================================================================

export function consigneGeneraleB(): FragmentConsigne[] {
  return [texte("A et B sont 2 points d'affixes "), latexFrag("z_A"), texte(" et "), latexFrag("z_B"), texte(". Construis le point demandé, puis donne les éléments de la transformation qui envoie A sur ce point.")];
}

export function blocDonneesB(e: ExerciceTransfoB): string[] {
  const symbole = e.sousType === "somme" ? "+" : "\\cdot\\,";
  const nomPoint = e.sousType === "somme" ? "M" : "P";
  return [`z_A=${affixeLatex(e.zA)}`, `z_B=${affixeLatex(e.zB)}`, `z_{${nomPoint}}=z_A${symbole}z_B=\\,?`];
}

/** Écran 2 — nature IMPOSÉE et point de départ précisé (audit 6e ch. 5, point 41). */
export function consigneEcranB(e: ExerciceTransfoB, phase: PhaseTransformationsPlan): FragmentConsigne[] {
  if (phase === "bEcran1") {
    return e.sousType === "somme" ? [texte("Calcule "), latexFrag("z_M=z_A+z_B"), texte(".")] : [texte("Calcule "), latexFrag("z_P=z_A\\cdot\\, z_B"), texte(".")];
  }
  if (e.sousType === "somme") return [texte("Le point M est l'image du point A par une translation. Donne l'affixe du vecteur de cette translation.")];
  return [texte("Le point P est l'image du point A par une similitude de centre O. Donne le rapport et l'angle de cette similitude.")];
}

export function etatActuelB(e: ExerciceTransfoB, phase: PhaseTransformationsPlan): string[] | null {
  if (phase !== "bEcran2") return null;
  const nomPoint = e.sousType === "somme" ? "M" : "P";
  return [`z_{${nomPoint}}=${affixeLatex(e.zResultat)}\\text{ (confirmé)}`];
}

export function champsB(e: ExerciceTransfoB, phase: PhaseTransformationsPlan): ChampDef[] {
  if (phase === "bEcran1") return [{ type: "texte", label: e.sousType === "somme" ? "Affixe de M =" : "Affixe de P =", placeholder: PLACEHOLDER_AFFIXE }];
  if (e.sousType === "somme") return [{ type: "texte", label: "Vecteur (affixe) =", placeholder: PLACEHOLDER_AFFIXE }];
  return [
    { type: "texte", label: "Rapport =", placeholder: PLACEHOLDER_REEL },
    { type: "texte", label: "Angle θ =", placeholder: PLACEHOLDER_ANGLE },
  ];
}

export function niveauAideMaxB(phase: PhaseTransformationsPlan): number {
  return phase === "bEcran2" ? 2 : 0;
}
export function aideNiveau1B(e: ExerciceTransfoB, phase: PhaseTransformationsPlan): AideAvecLatex {
  if (phase !== "bEcran2") return AUCUNE_AIDE;
  if (e.sousType === "somme") {
    return { texte: [texte("Ajouter un même nombre complexe "), latexFrag("c"), texte(" à une affixe revient à translater le point par le vecteur d'affixe "), latexFrag("c"), texte(".")], latex: "z\\ \\longmapsto\\ z+c" };
  }
  return {
    texte: [texte("Multiplier une affixe par un nombre complexe "), latexFrag("c"), texte(" revient à appliquer la similitude de centre O, de rapport "), latexFrag("|c|"), texte(" et d'angle "), latexFrag("\\arg c"), texte(".")],
    latex: "z\\ \\longmapsto\\ c\\cdot\\, z",
  };
}
export function aideNiveau2B(e: ExerciceTransfoB, phase: PhaseTransformationsPlan): AideAvecLatex {
  if (phase !== "bEcran2") return AUCUNE_AIDE;
  if (e.sousType === "somme") return { texte: [texte("Le nombre ajouté à "), latexFrag("z_A"), texte(" pour obtenir "), latexFrag("z_M"), texte(" :")], latex: "z_M-z_A=\\,?" };
  return {
    texte: [texte("Le nombre qui multiplie "), latexFrag("z_A"), texte(" est "), latexFrag("z_B"), texte(" : calcule son module et un de ses arguments.")],
    latex: `|z_B|=\\sqrt{(${e.zB.a})^2+(${e.zB.b})^2}`,
  };
}

// ============================================================================
// Famille C — Rotation de centre O, modules égaux.
// ============================================================================

const NOMS_AUTRES_POINTS = ["C", "D", "E"];

export function nomPoint(index: number): string {
  return NOMS_AUTRES_POINTS[index] ?? `P_{${index}}`;
}

export function consigneGeneraleC(): FragmentConsigne[] {
  return [texte("A et B sont 2 points tels que "), latexFrag("|z_A|=|z_B|"), texte(". Vérifie cette égalité, détermine la rotation de centre O qui transforme A en B, puis applique-la aux autres points donnés.")];
}

/** Une affixe par ligne (audit 6e ch. 5 : `z_A=…\quad z_B=…` débordait à 390 px). */
export function blocDonneesC(e: ExerciceTransfoC): string[] {
  const lignes = [`z_A=${affixeLatex(e.zA)}`, `z_B=${affixeLatex(e.zB)}`];
  e.autresPoints.forEach((p, i) => lignes.push(`z_{${nomPoint(i)}}=${affixeLatex(p)}`));
  return lignes;
}

export function consigneEcranC(phase: PhaseTransformationsPlan): FragmentConsigne[] {
  if (phase === "cEcran1") return [texte("Calcule "), latexFrag("|z_A|"), texte(" et "), latexFrag("|z_B|"), texte(" (elles doivent être égales).")];
  if (phase === "cEcran2") return [texte("À partir de l'égalité confirmée, détermine l'angle de la rotation de centre O qui transforme A en B.")];
  return [texte("Applique la rotation confirmée à chacun des autres points donnés pour trouver leurs images.")];
}

export function etatActuelC(e: ExerciceTransfoC, phase: PhaseTransformationsPlan): string[] | null {
  const modulesConfirmes = `|z_A|=|z_B|=${moduleLatex(e.moduleCommun, e.angleA.q)}\\text{ (confirmé)}`;
  if (phase === "cEcran2") return [modulesConfirmes];
  if (phase === "cEcran3") return [modulesConfirmes, `\\theta=${e.angleRotation.latex}\\text{ (confirmé)}`];
  return null;
}

export function champsC(phase: PhaseTransformationsPlan): ChampDef[] {
  if (phase === "cEcran1")
    return [
      { type: "texte", label: "Module de A =", placeholder: PLACEHOLDER_REEL },
      { type: "texte", label: "Module de B =", placeholder: PLACEHOLDER_REEL },
    ];
  if (phase === "cEcran2") return [{ type: "texte", label: "θ =", placeholder: PLACEHOLDER_ANGLE }];
  return []; // cEcran3 : add-as-needed, voir EtapeImagesTransformationsPlan (placeholder PLACEHOLDER_AFFIXE).
}

export const PLACEHOLDER_IMAGE = PLACEHOLDER_AFFIXE;

export function niveauAideMaxC(phase: PhaseTransformationsPlan): number {
  return phase === "cEcran2" ? 2 : 0;
}
export function aideNiveau1C(phase: PhaseTransformationsPlan): AideAvecLatex {
  if (phase !== "cEcran2") return AUCUNE_AIDE;
  return { texte: [texte("Une similitude de centre O de rapport 1 est une rotation : son angle est l'écart entre un argument de "), latexFrag("z_B"), texte(" et un argument de "), latexFrag("z_A"), texte(".")], latex: "\\theta=\\arg z_B-\\arg z_A" };
}
export function aideNiveau2C(e: ExerciceTransfoC, phase: PhaseTransformationsPlan): AideAvecLatex {
  if (phase !== "cEcran2") return AUCUNE_AIDE;
  return { texte: [texte("Arguments de "), latexFrag("z_A"), texte(" et de "), latexFrag("z_B"), texte(" (différence non calculée) :")], latex: `\\arg z_A=${e.angleA.latex}\\qquad \\arg z_B=${e.angleB.latex}` };
}

// ============================================================================
// Famille D — z′ = az + b : nature, centre, angle, rapport (audit 6e ch. 5, point 42).
// ============================================================================

export const LIBELLE_NATURE_D: Record<NatureTransfoD, string> = {
  translation: "Translation",
  rotation: "Rotation",
  homothetie: "Homothétie",
  similitude: "Similitude",
};
const NATURES_REFERENCE_D: NatureTransfoD[] = ["translation", "rotation", "homothetie", "similitude"];

/** Options de l'écran 1 dans l'ordre tiré à la génération (`ordreNatures`), libellés en texte brut. */
export function optionsNatureD(e: ExerciceTransfoD): { id: string; label: string }[] {
  const ordre = e.ordreNatures.length === 4 ? e.ordreNatures : [0, 1, 2, 3];
  return ordre.map((i) => ({ id: NATURES_REFERENCE_D[i], label: LIBELLE_NATURE_D[NATURES_REFERENCE_D[i]] }));
}

/** Coefficient de z dans `az + b` : 1 → rien, −1 → « − », réel → « 2 », imaginaire pur → « i »,
 * « −2i », sinon parenthésé « (1+i) ». */
function coefficientLatex(a: AffixeEntiere): string {
  if (a.b === 0) return a.a === 1 ? "" : a.a === -1 ? "-" : `${a.a}`;
  if (a.a === 0) return a.b === 1 ? "i" : a.b === -1 ? "-i" : `${a.b}i`;
  return `(${affixeLatex(a)})`;
}

export function formuleD(e: ExerciceTransfoD): string {
  const coef = coefficientLatex(e.a);
  const sep = coef === "" || coef === "-" ? "" : "\\,";
  const bLatex = affixeLatex(e.b);
  const terme = bLatex.startsWith("-") ? bLatex : `+${bLatex}`;
  return `z'=${coef}${sep}z${terme}`;
}

export function consigneGeneraleD(): FragmentConsigne[] {
  return [
    texte("La transformation du plan donnée ci-dessous associe au point M d'affixe "),
    latexFrag("z"),
    texte(" le point M′ d'affixe "),
    latexFrag("z'"),
    texte(". Détermine sa nature, puis ses éléments caractéristiques."),
  ];
}

export function blocDonneesD(e: ExerciceTransfoD): string[] {
  return [formuleD(e)];
}

export function consigneEcranD(e: ExerciceTransfoD, phase: PhaseTransformationsPlan): FragmentConsigne[] {
  if (phase === "dEcran1") return [texte("Choisis la nature de cette transformation (une seule tentative).")];
  switch (e.nature) {
    case "translation":
      return [texte("Donne l'affixe du vecteur de cette translation.")];
    case "rotation":
      return [texte("Donne l'affixe du centre Ω (son unique point fixe) et l'angle de cette rotation.")];
    case "homothetie":
      return [texte("Donne l'affixe du centre Ω (son unique point fixe) et le rapport "), latexFrag("k"), texte(" de cette homothétie.")];
    case "similitude":
      return [texte("Donne l'affixe du centre Ω (son unique point fixe), le rapport et l'angle de cette similitude.")];
  }
}

export function etatActuelD(e: ExerciceTransfoD, phase: PhaseTransformationsPlan): string[] | null {
  if (phase !== "dEcran2") return null;
  return [`\\text{${LIBELLE_NATURE_D[e.nature]} (confirmée)}`];
}

export function champsD(e: ExerciceTransfoD, phase: PhaseTransformationsPlan): ChampDef[] {
  if (phase !== "dEcran2") return [];
  const centre: ChampDef = { type: "texte", label: "Centre Ω (affixe) =", placeholder: PLACEHOLDER_AFFIXE };
  switch (e.nature) {
    case "translation":
      return [{ type: "texte", label: "Vecteur (affixe) =", placeholder: PLACEHOLDER_AFFIXE }];
    case "rotation":
      return [centre, { type: "texte", label: "Angle θ =", placeholder: PLACEHOLDER_ANGLE }];
    case "homothetie":
      return [centre, { type: "texte", label: "Rapport k =", placeholder: PLACEHOLDER_REEL }];
    case "similitude":
      return [centre, { type: "texte", label: "Rapport =", placeholder: PLACEHOLDER_REEL }, { type: "texte", label: "Angle θ =", placeholder: PLACEHOLDER_ANGLE }];
  }
}

export function niveauAideMaxD(e: ExerciceTransfoD, phase: PhaseTransformationsPlan): number {
  if (phase === "dEcran1") return 2;
  return e.nature === "translation" ? 1 : 2;
}
export function aideNiveau1D(e: ExerciceTransfoD, phase: PhaseTransformationsPlan): AideAvecLatex {
  if (phase === "dEcran1") {
    return {
      texte: [
        texte("La nature se lit sur le coefficient "),
        latexFrag("a"),
        texte(" de "),
        latexFrag("z'=az+b"),
        texte(" : translation si "),
        latexFrag("a=1"),
        texte(" ; rotation si "),
        latexFrag("|a|=1"),
        texte(" et "),
        latexFrag("a\\neq1"),
        texte(" ; homothétie si "),
        latexFrag("a"),
        texte(" est réel, différent de 0 et de 1 ; similitude dans les autres cas."),
      ],
      latex: null,
    };
  }
  if (phase !== "dEcran2") return AUCUNE_AIDE;
  if (e.nature === "translation") return { texte: [texte("L'écart "), latexFrag("z'-z"), texte(" est le même pour tous les points : c'est l'affixe du vecteur.")], latex: "z'-z=b" };
  return {
    texte: [texte("Le centre est l'unique point fixe : résous "), latexFrag("z=az+b"), texte(". Le rapport est "), latexFrag("|a|"), texte(" (le réel "), latexFrag("a"), texte(" lui-même pour une homothétie) et l'angle est un argument de "), latexFrag("a"), texte(".")],
    latex: "z_\\Omega=\\dfrac{b}{1-a}",
  };
}
export function aideNiveau2D(e: ExerciceTransfoD, phase: PhaseTransformationsPlan): AideAvecLatex {
  if (phase === "dEcran1") {
    const mod2 = e.a.a * e.a.a + e.a.b * e.a.b;
    return { texte: [texte("Le coefficient de "), latexFrag("z"), texte(" et le carré de son module (conclusion non faite) :")], latex: `a=${affixeLatex(e.a)}\\qquad |a|^2=${mod2}` };
  }
  if (phase !== "dEcran2" || e.nature === "translation") return AUCUNE_AIDE;
  return { texte: [texte("Formule du centre, valeurs substituées (division non faite) :")], latex: `z_\\Omega=\\dfrac{${affixeLatex(e.b)}}{1-(${affixeLatex(e.a)})}` };
}

// ============================================================================
// Dispatch commun (mirroir 6gen37).
// ============================================================================

export function consigneGenerale(exercice: ExerciceTransformationsPlan): FragmentConsigne[] {
  switch (exercice.famille) {
    case "A":
      return consigneGeneraleA(exercice);
    case "B":
      return consigneGeneraleB();
    case "C":
      return consigneGeneraleC();
    case "D":
      return consigneGeneraleD();
  }
}

export function blocDonnees(exercice: ExerciceTransformationsPlan): string[] {
  switch (exercice.famille) {
    case "A":
      return blocDonneesA(exercice);
    case "B":
      return blocDonneesB(exercice);
    case "C":
      return blocDonneesC(exercice);
    case "D":
      return blocDonneesD(exercice);
  }
}

export function consigneEcran(exercice: ExerciceTransformationsPlan, phase: PhaseTransformationsPlan): FragmentConsigne[] {
  switch (exercice.famille) {
    case "A":
      return consigneEcranA(phase);
    case "B":
      return consigneEcranB(exercice, phase);
    case "C":
      return consigneEcranC(phase);
    case "D":
      return consigneEcranD(exercice, phase);
  }
}

export function etatActuel(exercice: ExerciceTransformationsPlan, phase: PhaseTransformationsPlan): string[] | null {
  switch (exercice.famille) {
    case "A":
      return etatActuelA(exercice, phase);
    case "B":
      return etatActuelB(exercice, phase);
    case "C":
      return etatActuelC(exercice, phase);
    case "D":
      return etatActuelD(exercice, phase);
  }
}

/** Libellés de champ dont un symbole doit être rendu en KaTeX — les autres restent en texte. Le
 * `label` brut (aperçu de saisie, fiche) est formulé en mots (« Module de A = »), jamais en
 * notation clavier. */
const LIBELLES_KATEX: Record<string, FragmentConsigne[]> = {
  "Affixe de M =": [latexFrag("z_M=")],
  "Affixe de P =": [latexFrag("z_P=")],
  "Module de A =": [latexFrag("|z_A|=")],
  "Module de B =": [latexFrag("|z_B|=")],
  "θ =": [latexFrag("\\theta=")],
  "Angle θ =": [texte("Angle "), latexFrag("\\theta=")],
  "Rapport k =": [texte("Rapport "), latexFrag("k=")],
  "Centre Ω (affixe) =": [texte("Centre : "), latexFrag("z_\\Omega=")],
};

export function champsEcran(exercice: ExerciceTransformationsPlan, phase: PhaseTransformationsPlan): ChampDef[] {
  return champsEcranBruts(exercice, phase).map((c) => ({ ...c, libelle: LIBELLES_KATEX[c.label] ?? [texte(c.label)] }));
}

function champsEcranBruts(exercice: ExerciceTransformationsPlan, phase: PhaseTransformationsPlan): ChampDef[] {
  switch (exercice.famille) {
    case "A":
      return champsA(phase);
    case "B":
      return champsB(exercice, phase);
    case "C":
      return champsC(phase);
    case "D":
      return champsD(exercice, phase);
  }
}

export function niveauAideMaxEcran(exercice: ExerciceTransformationsPlan, phase: PhaseTransformationsPlan): number {
  switch (exercice.famille) {
    case "A":
      return niveauAideMaxA(phase);
    case "B":
      return niveauAideMaxB(phase);
    case "C":
      return niveauAideMaxC(phase);
    case "D":
      return niveauAideMaxD(exercice, phase);
  }
}

export function aideNiveau1(exercice: ExerciceTransformationsPlan, phase: PhaseTransformationsPlan): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideNiveau1A(phase);
    case "B":
      return aideNiveau1B(exercice, phase);
    case "C":
      return aideNiveau1C(phase);
    case "D":
      return aideNiveau1D(exercice, phase);
  }
}

export function aideNiveau2(exercice: ExerciceTransformationsPlan, phase: PhaseTransformationsPlan): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideNiveau2A(exercice, phase);
    case "B":
      return aideNiveau2B(exercice, phase);
    case "C":
      return aideNiveau2C(exercice, phase);
    case "D":
      return aideNiveau2D(exercice, phase);
  }
}

export const LIBELLE_PHASE: Record<PhaseTransformationsPlan, string> = {
  aEcran1: "Étape 1 (formule)",
  aEcran2: "Étape 2 (image calculée)",
  bEcran1: "Étape 1 (point construit)",
  bEcran2: "Étape 2 (éléments de la transformation)",
  cEcran1: "Étape 1 (modules égaux)",
  cEcran2: "Étape 2 (angle de la rotation)",
  cEcran3: "Étape 3 (images des autres points)",
  dEcran1: "Étape 1 (nature)",
  dEcran2: "Étape 2 (éléments caractéristiques)",
};

export const LIBELLE_FAMILLE: Record<ExerciceTransformationsPlan["famille"], string> = {
  A: "A — Image d'un point par une transformation",
  B: "B — Construire un point, identifier la transformation",
  C: "C — Rotation de centre O, modules égaux",
  D: "D — z′ = az + b : nature et éléments caractéristiques",
};

/** Récapitulatif final : affiche toujours la réponse CORRECTE connue de l'exercice — jamais
 * recalculée depuis la saisie élève. Un fragment par donnée (aucun `\quad` collé). */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceTransformationsPlan, phase: PhaseTransformationsPlan): string[] {
  switch (exercice.famille) {
    case "A":
      if (phase === "aEcran1") return [optionsReferenceA(exercice.parametres.sousType)[0].latex];
      return [`z_{P'}=${affixeLatex(exercice.image)}`];
    case "B":
      if (phase === "bEcran1") return [`z_{${exercice.sousType === "somme" ? "M" : "P"}}=${affixeLatex(exercice.zResultat)}`];
      if (exercice.sousType === "somme") return [`\\text{vecteur : }${affixeLatex(exercice.zB)}`];
      return [`\\text{rapport : }${moduleLatex(exercice.rB, exercice.angleB.q)}`, `\\theta=${exercice.angleB.latex}`];
    case "C":
      if (phase === "cEcran1") return [`|z_A|=|z_B|=${moduleLatex(exercice.moduleCommun, exercice.angleA.q)}`];
      if (phase === "cEcran2") return [`\\theta=${exercice.angleRotation.latex}`];
      return exercice.imagesAutresPoints.map((img, i) => `z_{${nomPoint(i)}'}=${affixeLatex(img)}`);
    case "D":
      if (phase === "dEcran1") return [`\\text{${LIBELLE_NATURE_D[exercice.nature]}}`];
      if (exercice.nature === "translation" || exercice.centre === null) return [`\\text{vecteur : }${affixeLatex(exercice.b)}`];
      if (exercice.nature === "rotation") return [`z_\\Omega=${affixeLatex(exercice.centre)}`, `\\theta=${exercice.angle.latex}`];
      if (exercice.nature === "homothetie") return [`z_\\Omega=${affixeLatex(exercice.centre)}`, `k=${exercice.rapportLatex}`];
      return [`z_\\Omega=${affixeLatex(exercice.centre)}`, `\\text{rapport : }${exercice.rapportLatex}`, `\\theta=${exercice.angle.latex}`];
  }
}

export type { ParametresTransfoA };

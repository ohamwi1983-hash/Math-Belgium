/**
 * Présentation pure — "Applications physiques (résultante de vecteurs)" (chapitre "Calcul
 * vectoriel", huitième générateur).
 */
import type { ContexteApplicationPhysique, ExerciceApplicationPhysique, VarianteApplicationPhysique } from "../core/applicationPhysique.types";
import type { Composantes, Point } from "../core/vecteur.types";
import type { EtatSessionApplicationPhysique } from "../moteur/typesApplicationPhysique";
import type { FragmentConsigne } from "./formatEquationDroite";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { nombreFr } from "./nombreFr";

export type { FragmentConsigne };

/** Même patron que les autres modules `format*.ts` du chapitre 6 — dupliqué plutôt que partagé
 * (trop petit pour l'extraction, voir CLAUDE.md). */
function texte(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}

function latex(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
}

export interface VecteursSchemaApplicationPhysique {
  /** v1, en direction plein Nord depuis l'origine. */
  v1: Composantes;
  /** v2, déplacement libre (pas encore ancré) — à tracer bout à bout à l'extrémité de v1. */
  v2: Composantes;
  /** Résultante (v1+v2), depuis l'origine. */
  resultante: Composantes;
}

/** Géométrie du schéma affiché — v1 pointe plein Nord (angle 90° au sens mathématique standard,
 * x=cos, y=sin) ; v2 fait l'angle donné par l'énoncé avec v1, du côté (Est/Ouest) tiré à la
 * génération — vers l'Est = rotation horaire (angle décroissant), vers l'Ouest = antihoraire
 * (angle croissant). Purement illustratif, jamais utilisé pour la vérification (numérique,
 * comparée à `exercice.triangle`). */
export function calculerVecteursSchema(exercice: ExerciceApplicationPhysique): VecteursSchemaApplicationPhysique {
  const ANGLE_V1 = 90;
  const signe = exercice.coteDeviation === "est" ? -1 : 1;
  const angleV2 = ANGLE_V1 + signe * exercice.angleEntreVecteurs;
  const radV1 = (ANGLE_V1 * Math.PI) / 180;
  const radV2 = (angleV2 * Math.PI) / 180;

  const v1: Composantes = { x: exercice.v1 * Math.cos(radV1), y: exercice.v1 * Math.sin(radV1) };
  const v2: Composantes = { x: exercice.v2 * Math.cos(radV2), y: exercice.v2 * Math.sin(radV2) };
  return { v1, v2, resultante: { x: v1.x + v2.x, y: v1.y + v2.y } };
}

/** Fraction du plus grand côté du schéma : décalage d'une étiquette par rapport à son vecteur, et
 * marge ajoutée autour de la figure (étiquettes comprises). */
const FRACTION_DECALAGE_ETIQUETTE_SCHEMA = 0.1;
const FRACTION_MARGE_SCHEMA = 0.1;
/** Hauteur d'une étiquette (lettre + flèche, dessinées AU-DESSUS de son point d'ancrage), en
 * fraction du plus grand côté : décalage supplémentaire d'une étiquette placée sous son vecteur, et
 * marge supplémentaire en haut de la figure. */
const FRACTION_HAUTEUR_ETIQUETTE_SCHEMA = 0.1;

export interface PositionsEtiquettesSchema {
  v1: Point;
  v2: Point;
  resultante: Point;
  /** Coins de la zone à afficher (figure + étiquettes + marge), pour `VecteurGraph.viewBoxFixe`. */
  coins: [Point, Point];
}

/**
 * Étiquettes du schéma (audit chapitre 6, point 26) — chacune placée du côté EXTÉRIEUR du triangle
 * vectoriel (à l'opposé de son centre de gravité), et à des hauteurs différentes le long des deux
 * vecteurs issus de l'origine (40 % pour v₁, 60 % pour la résultante). Le placement au milieu, du
 * même côté pour tous, superposait v₁ et v_R dès que le triangle était mince (vent faible devant la
 * vitesse propre) ; et sans marge proportionnelle (`calculerViewBoxVecteurs` n'ajoute que 1,5 unité,
 * rien face à des vitesses de 300 km/h) l'étiquette de v₂ sortait du cadre.
 */
export function positionsEtiquettesSchema(exercice: ExerciceApplicationPhysique): PositionsEtiquettesSchema {
  const { v1, v2, resultante } = calculerVecteursSchema(exercice);
  const sommets: Point[] = [{ x: 0, y: 0 }, v1, resultante];
  const centre = { x: (v1.x + resultante.x) / 3, y: (v1.y + resultante.y) / 3 };
  const xs = sommets.map((p) => p.x);
  const ys = sommets.map((p) => p.y);
  const taille = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
  const decalage = taille * FRACTION_DECALAGE_ETIQUETTE_SCHEMA;

  function placer(origine: Point, vecteur: Composantes, fraction: number): Point {
    const point = { x: origine.x + vecteur.x * fraction, y: origine.y + vecteur.y * fraction };
    const longueur = Math.hypot(vecteur.x, vecteur.y) || 1;
    let perp = { x: -vecteur.y / longueur, y: vecteur.x / longueur };
    if (perp.x * (centre.x - point.x) + perp.y * (centre.y - point.y) > 0) perp = { x: -perp.x, y: -perp.y };
    const sousLeVecteur = perp.y < -0.3 ? taille * FRACTION_HAUTEUR_ETIQUETTE_SCHEMA * -perp.y : 0;
    return { x: point.x + perp.x * decalage, y: point.y + perp.y * decalage - sousLeVecteur };
  }

  const positions = {
    v1: placer({ x: 0, y: 0 }, v1, 0.4),
    v2: placer(v1, v2, 0.5),
    resultante: placer({ x: 0, y: 0 }, resultante, 0.6),
  };
  const tous = [...sommets, positions.v1, positions.v2, positions.resultante];
  const marge = taille * FRACTION_MARGE_SCHEMA;
  const coins: [Point, Point] = [
    { x: Math.min(...tous.map((p) => p.x)) - marge, y: Math.min(...tous.map((p) => p.y)) - marge },
    { x: Math.max(...tous.map((p) => p.x)) + marge, y: Math.max(...tous.map((p) => p.y)) + marge + taille * FRACTION_HAUTEUR_ETIQUETTE_SCHEMA },
  ];
  return { ...positions, coins };
}

const LIBELLES_CONTEXTE: Record<ContexteApplicationPhysique, string> = {
  avion: "Un avion dans le vent",
  helicoptere: "Un hélicoptère dans le vent",
  forces: "Deux forces sur un objet",
};

export function libelleContexteApplicationPhysique(contexte: ContexteApplicationPhysique): string {
  return LIBELLES_CONTEXTE[contexte];
}

/** Texte narratif complet, valeurs déjà interpolées — un gabarit par contexte, jamais un même
 * texte générique pour les trois (vocabulaire "vitesse propre"/cap pour les véhicules, "force"/
 * orientée pour les forces). */
export function formatEnonceApplicationPhysique(exercice: ExerciceApplicationPhysique): string {
  const coteTexte = exercice.coteDeviation === "est" ? "l'Est" : "l'Ouest";
  if (exercice.contexte === "avion") {
    return `Un avion vole cap plein Nord à une vitesse propre de ${exercice.v1} km/h. Un vent souffle à ${exercice.v2} km/h, formant un angle de ${exercice.angleEntreVecteurs}° avec la trajectoire de l'avion, en direction de ${coteTexte}.`;
  }
  if (exercice.contexte === "helicoptere") {
    return `Un hélicoptère vole cap plein Nord à une vitesse propre de ${exercice.v1} km/h. Un vent souffle à ${exercice.v2} km/h, formant un angle de ${exercice.angleEntreVecteurs}° avec sa trajectoire, en direction de ${coteTexte}.`;
  }
  return `Deux forces s'exercent sur un même objet : la première, de ${exercice.v1} N, est orientée plein Nord ; la seconde, de ${exercice.v2} N, forme un angle de ${exercice.angleEntreVecteurs}° avec elle, en direction de ${coteTexte}.`;
}

/** 4 options fixes pour l'écran "interpretation" — toujours les mêmes, une seule est correcte
 * (`exercice.directionCorrecte`), jamais mélangées différemment d'un exercice à l'autre (l'ordre
 * de présentation n'a pas besoin d'être aléatoire ici, contrairement à un multi-select). */
export const OPTIONS_DIRECTION = ["Nord-Est", "Nord-Ouest", "Sud-Est", "Sud-Ouest"] as const;

export interface NotationVecteursApplicationPhysique {
  v1: string;
  v2: string;
  resultante: string;
  normeResultante: string;
}

/**
 * Notation vectorielle (LaTeX) adaptée au contexte narratif (`promptgen29modificationscompletes.md`,
 * point 2) — $\vec{v_1}$/$\vec{v_2}$/$\vec{v_R}$ pour "avion"/"helicoptere" (vitesses),
 * $\vec{F_1}$/$\vec{F_2}$/$\vec{F_R}$ pour "forces" — jamais un nom générique indépendant du
 * contexte, jamais une lettre nue sans flèche pour désigner un vecteur.
 */
export function notationVecteursApplicationPhysique(contexte: ContexteApplicationPhysique): NotationVecteursApplicationPhysique {
  const lettre = contexte === "forces" ? "F" : "v";
  return {
    v1: `\\vec{${lettre}_1}`,
    v2: `\\vec{${lettre}_2}`,
    resultante: `\\vec{${lettre}_R}`,
    normeResultante: `\\|\\vec{${lettre}_R}\\|`,
  };
}

/** Mot narratif pluriel ("forces"/"vitesses") — même mot pour "avion" et "helicoptere". */
export function libelleGrandeurApplicationPhysique(contexte: ContexteApplicationPhysique): string {
  return contexte === "forces" ? "forces" : "vitesses";
}

/**
 * Label d'un vecteur sur le graphe Mafs — `<Text>` ne peut PAS rendre du vrai KaTeX (voir
 * CLAUDE.md). Deux essais en caractères Unicode se sont succédé, chacun confirmé cassé dans
 * l'environnement réel de l'utilisateur malgré une vérification "correcte" dans le sandbox du
 * projet : (1) le caractère combinant U+20D7 (COMBINING RIGHT ARROW ABOVE) sur la lettre de base
 * — rendu en glyphe manquant ("tofu box") ; (2) le caractère autonome U+2192 (RIGHTWARDS ARROW) en
 * préfixe — rendu correctement comme flèche, mais avec un espacement du caractère bien plus large
 * que sa lettre suivante dans la police de repli réellement utilisée par le navigateur de
 * l'utilisateur (un glyphe Unicode "exotique" peut déclencher un repli de police entier, aux
 * métriques imprévisibles) — donnant une flèche visuellement DÉTACHÉE de la lettre. La lettre "R"
 * de la résultante, en texte plein plutôt qu'en indice (aucun Unicode subscript capital R
 * n'existe), ne se lisait de plus pas comme un indice.
 *
 * Ces deux essais dépendaient tous deux d'un glyphe de police pour un rendu correct — un point
 * faible structurel du texte SVG déjà démontré deux fois sur ce seul générateur. Corrigé en
 * abandonnant TOUT caractère Unicode spécial pour ce label : `labelsGrapheApplicationPhysique` ne
 * retourne plus qu'une paire `{base, indice}` (données pures, aucun rendu) ; `VecteurGraph.tsx`
 * (`LabelVecteurFleche`) dessine désormais la flèche comme une VRAIE FORME SVG (segment + triangle,
 * geometrie fixe en pixels, aucune dépendance de police) et l'indice comme un `<tspan>` à taille de
 * police réduite avec décalage vertical (`dy`) — un indice SVG authentique, valable pour n'importe
 * quelle lettre (y compris "R"), garanti par les primitives SVG de base (`text`/`tspan`/`dy`/
 * `font-size`), jamais par la disponibilité d'un glyphe Unicode particulier dans une police
 * quelconque. Toujours jamais `\vec{}` littéral (KaTeX), réservé aux consignes/aides/révélations.
 */
export interface LabelGrapheVecteur {
  base: string;
  indice: string;
}

export interface LabelsGrapheApplicationPhysique {
  v1: LabelGrapheVecteur;
  v2: LabelGrapheVecteur;
  resultante: LabelGrapheVecteur;
}

/** Labels du graphe (point 2) — mêmes lettres que `notationVecteursApplicationPhysique`, jamais
 * "V₁"/"V₂"/"R" sans flèche comme avant correction. Données pures (`{base, indice}`) — le rendu de
 * la flèche et de l'indice est entièrement à la charge de `VecteurGraph.tsx`/`LabelVecteurFleche`. */
export function labelsGrapheApplicationPhysique(contexte: ContexteApplicationPhysique): LabelsGrapheApplicationPhysique {
  const lettre = contexte === "forces" ? "F" : "v";
  return {
    v1: { base: lettre, indice: "1" },
    v2: { base: lettre, indice: "2" },
    resultante: { base: lettre, indice: "R" },
  };
}

/** Consigne de l'écran "modelisation" (point 3) — remplace l'ancienne question générique par une
 * question nommant explicitement les deux vecteurs composants, contexte-aware. */
export function segmentsConsigneConfiguration(exercice: ExerciceApplicationPhysique): FragmentConsigne[] {
  const { v1, v2 } = notationVecteursApplicationPhysique(exercice.contexte);
  const grandeur = libelleGrandeurApplicationPhysique(exercice.contexte);
  return [texte(`Quel type d'angle entre les ${grandeur} `), latex(v1), texte(" et "), latex(v2), texte(" ?")];
}

/** Tolérance réellement vérifiée = `TOLERANCE_ARRONDI = 0.5` pour la norme (`diagnostiquerCalculArrondi`,
 * `verificationApplicationPhysique.ts`) — soit un arrondi à l'unité ; pour la déviation, ±1° autour
 * de la valeur recalculée avec la norme arrondie (`deviationsAcceptables`, audit chapitre 6). */
const NOTE_PRECISION_ARRONDI_UNITE = " (arrondi à l'unité accepté si besoin)";

/** Consigne de l'écran "norme" (point 4.1). */
export function segmentsConsigneNorme(exercice: ExerciceApplicationPhysique): FragmentConsigne[] {
  const { normeResultante } = notationVecteursApplicationPhysique(exercice.contexte);
  const grandeur = libelleGrandeurApplicationPhysique(exercice.contexte);
  return [texte(`Calcule la norme de la résultante des ${grandeur} `), latex(normeResultante), texte(`${NOTE_PRECISION_ARRONDI_UNITE}.`)];
}

/** Consigne de l'écran "deviation" (point 5.1). */
export function segmentsConsigneDeviation(exercice: ExerciceApplicationPhysique): FragmentConsigne[] {
  const { v1, resultante } = notationVecteursApplicationPhysique(exercice.contexte);
  return [
    texte("Quel est l'angle de déviation entre "),
    latex(v1),
    texte(" et "),
    latex(resultante),
    texte(`${NOTE_PRECISION_ARRONDI_UNITE} ?`),
  ];
}

/**
 * Aide niveau 1 de l'écran "norme" (point 4.3) — rappel de la MÉTHODE pertinente uniquement
 * (Pythagore pour angleDroit, formule de la résultante pour angleQuelconque, jamais les deux à la
 * fois), formule NON substituée. Audit chapitre 6, point 19 : même formule que le cours
 * (`R² = F₁² + F₂² + 2·F₁·F₂·cos θ`, θ = angle ENTRE les deux vecteurs, celui de l'énoncé) —
 * l'ancienne version `… − 2…cos(α)`, α = angle du triangle vectoriel, était juste mais n'était pas
 * celle du cours, et l'élève y injectait naturellement l'angle de l'énoncé avec le signe −.
 */
export function segmentsAideNormeNiveau1(exercice: ExerciceApplicationPhysique): FragmentConsigne[] {
  const { v1, v2, resultante } = notationVecteursApplicationPhysique(exercice.contexte);
  if (exercice.variante === "angleDroit") {
    return [texte("Utilise le théorème de Pythagore : "), latex(`\\|${resultante}\\|^2 = \\|${v1}\\|^2 + \\|${v2}\\|^2`), texte(".")];
  }
  return [
    texte("Utilise la formule de la résultante (loi des cosinus) : "),
    latex(`\\|${resultante}\\|^2 = \\|${v1}\\|^2 + \\|${v2}\\|^2 + 2\\|${v1}\\|\\|${v2}\\|\\cos\\theta`),
    texte(", où θ est l'angle entre "),
    latex(v1),
    texte(" et "),
    latex(v2),
    texte(" donné dans l'énoncé."),
  ];
}

/** Aide niveau 2 de l'écran "norme" (point 4.3) — formule SUBSTITUÉE avec les valeurs réelles de
 * l'instance (v1, v2 et θ, l'angle de l'énoncé — même formule que le cours, voir le niveau 1),
 * jamais calculée (le résultat final reste à trouver par l'élève). */
export function formatAideNormeNiveau2Latex(exercice: ExerciceApplicationPhysique): string {
  const { resultante } = notationVecteursApplicationPhysique(exercice.contexte);
  if (exercice.variante === "angleDroit") {
    return `\\|${resultante}\\|^2 = ${exercice.v1}^2 + ${exercice.v2}^2`;
  }
  return `\\|${resultante}\\|^2 = ${exercice.v1}^2 + ${exercice.v2}^2 + 2\\cdot ${exercice.v1}\\cdot ${exercice.v2}\\cdot\\cos(${exercice.angleEntreVecteurs}°)`;
}

const LIBELLES_VARIANTE: Record<VarianteApplicationPhysique, string> = {
  angleDroit: "Angle droit",
  angleQuelconque: "Angle quelconque",
};

export function libelleVarianteApplicationPhysique(variante: VarianteApplicationPhysique): string {
  return LIBELLES_VARIANTE[variante];
}

/** Arrondi 2 décimales, virgule décimale (audit chapitre 6, point 14) — même convention que la
 * réponse révélée (`AppApplicationPhysique.tsx`), jamais un décimal brut non arrondi. */
export function formatValeurApplicationPhysique(valeur: number): string {
  return nombreFr(Math.round(valeur * 100) / 100);
}

/**
 * Récapitulatif accumulé des écrans déjà clos pour l'exercice en cours (même principe que les 13
 * autres récapitulatifs du projet, ex. `recapitulatifCercleTrigonometrique.ts`) — dérivé uniquement
 * des champs `scoreXxxExercice`/`xxxReveleExercice` déjà trackés par le moteur (`!== null` ⟺
 * l'écran a eu lieu et est clos pour l'exercice courant), toujours la vraie valeur confirmée
 * (`exerciceCourant`), jamais la saisie brute de l'élève. Aucune entrée pour "interpretation" :
 * dernière étape, clôture toujours immédiatement l'exercice.
 */
export function calculerRecapitulatifApplicationPhysique(etat: EtatSessionApplicationPhysique): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const entrees: EntreeRecapitulatif[] = [];

  if (etat.scoreModelisationExercice !== null) {
    entrees.push({
      libelle: "Configuration",
      estLatex: false,
      valeur: LIBELLES_VARIANTE[exercice.variante],
      revele: etat.modelisationReveleExercice,
    });
  }

  if (etat.scoreNormeExercice !== null) {
    entrees.push({
      libelle: "Norme de la résultante",
      estLatex: false,
      valeur: `${formatValeurApplicationPhysique(exercice.triangle.a)} ${exercice.unite}`,
      revele: etat.normeReveleExercice,
    });
  }

  if (etat.scoreDeviationExercice !== null) {
    entrees.push({
      libelle: "Angle de déviation",
      estLatex: false,
      valeur: `${formatValeurApplicationPhysique(exercice.triangle.C)}°`,
      revele: etat.deviationReveleExercice,
    });
  }

  return entrees;
}

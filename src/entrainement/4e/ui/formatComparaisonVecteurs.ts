import type { ExerciceComparaisonVecteurs, ProprieteComparaison } from "../core/comparaisonVecteurs.types";
import { calculerViewBoxVecteurs } from "./vecteurGraph";
import type { PointAffiche, VecteurAffiche, ViewBoxTransformation } from "./vecteurGraph";
import { ETIQUETTE_ECRAN, placerEtiquettesComparaison } from "./etiquettesComparaison";
import type { GabaritEtiquette } from "./etiquettesComparaison";

const CONSIGNES_PROPRIETE: Record<ProprieteComparaison, string> = {
  longueur: "même longueur",
  direction: "même direction",
  sens: "même sens",
};

/** Consigne de l'étape "sélection" — texte brut + fragment LaTeX court (jamais toute la phrase
 * passée à KaTeX, même piège déjà rencontré et corrigé ailleurs dans le projet, voir CLAUDE.md). */
export function consigneSelection(exercice: ExerciceComparaisonVecteurs): { avant: string; latex: string; apres: string } {
  return {
    avant: `Sélectionne tous les vecteurs de ${CONSIGNES_PROPRIETE[exercice.propriete]} que `,
    latex: `\\vec{${exercice.labelReference}}`,
    apres: ".",
  };
}

/** Marge de la fenêtre pour les étiquettes, en fraction de sa HAUTEUR (le texte monte depuis son
 * ancrage : plus de place en haut). */
const FRACTION_LARGEUR_ETIQUETTE = 0.1;
const FRACTION_HAUTEUR_ETIQUETTE = 0.15;
const FRACTION_DECALAGE_ETIQUETTE = 0.06;
/** Tête de flèche des vecteurs de la figure (écran et papier), en unités du quadrillage (audit
 * 4e ch. 6, G13 : environ 0,35 unité, au lieu d'une tête Mafs de taille fixe aussi longue qu'un
 * vecteur de 1 à 2 unités). */
export const TETE_FLECHE_COMPARAISON = 0.35;
/** Gabarit par défaut (écran de 420 px, largeur par défaut de `VecteurGraph`) quand l'appelant ne
 * connaît pas la largeur réelle. */
const GABARIT_DEFAUT: GabaritEtiquette = { ...ETIQUETTE_ECRAN, largeurPx: 420, hauteurPx: 280 };

/** Couleur d'un vecteur de la figure : orange s'il est sélectionné, rouge pour la référence, sinon
 * couleur par défaut (`undefined`). */
export function couleurVecteurComparaison(exercice: ExerciceComparaisonVecteurs, label: string, labelsSelectionnes: string[]): string | undefined {
  return labelsSelectionnes.includes(label) ? "#f08c00" : label === exercice.labelReference ? "#e03131" : undefined;
}

/** Vecteurs affichés (jamais de point isolé) — un par vecteur de l'exercice, coloré différemment
 * si sélectionné. Labels en notation vectorielle réelle (`labelFleche`, flèche dessinée AU-DESSUS
 * de la lettre — voir `components/VecteurGraph.tsx::LabelVecteurFleche`), jamais une lettre nue
 * (`label`) — y compris pour la référence en rouge. Positions calculées par
 * `etiquettesComparaison.ts::placerEtiquettesComparaison` plutôt que le milieu par défaut de chaque vecteur : les vecteurs de ce générateur sont
 * TOUS des transformations (multiples scalaires, translations) de 2-3 vecteurs de base, donc
 * souvent proches/parallèles. `viewBox` est la fenêtre dans laquelle les étiquettes ont été placées
 * (à passer à `VecteurGraph.viewBoxFixe`, et à la figure papier) : une étiquette qui en sortirait est
 * écartée au placement. `gabarit` : taille réelle, en pixels, de la zone tracée et de l'étiquette
 * (écran : largeur mesurée du graphe ; papier : `ETIQUETTE_PAPIER`) — le placement
 * (`etiquettesComparaison.ts`) en dépend, les données de l'exercice jamais. */
export function vecteursAffichesComparaison(
  exercice: ExerciceComparaisonVecteurs,
  labelsSelectionnes: string[],
  gabarit: GabaritEtiquette = GABARIT_DEFAUT,
): { points: PointAffiche[]; vecteurs: VecteurAffiche[]; viewBox: ViewBoxTransformation } {
  const vecteursBase: VecteurAffiche[] = exercice.vecteurs.map((v) => ({
    origine: v.origine,
    vecteur: v.composantes,
    couleur: couleurVecteurComparaison(exercice, v.label, labelsSelectionnes),
  }));
  // Fenêtre élargie d'une étiquette (surtout en haut : le texte monte depuis son ancrage), pour
  // qu'une étiquette au bord de la figure ait la place de s'afficher sans être coupée.
  const brute = calculerViewBoxVecteurs([], vecteursBase);
  const h = brute.y[1] - brute.y[0];
  const coins: PointAffiche[] = [
    { point: { x: brute.x[0] - h * FRACTION_LARGEUR_ETIQUETTE, y: brute.y[0] - h * FRACTION_DECALAGE_ETIQUETTE }, label: "" },
    { point: { x: brute.x[1] + h * FRACTION_LARGEUR_ETIQUETTE, y: brute.y[1] + h * FRACTION_HAUTEUR_ETIQUETTE }, label: "" },
  ];
  const viewBox = calculerViewBoxVecteurs(coins);
  const positions = placerEtiquettesComparaison(
    vecteursBase,
    exercice.vecteurs.map((v) => v.label),
    viewBox,
    gabarit,
    TETE_FLECHE_COMPARAISON,
  );
  const vecteurs: VecteurAffiche[] = exercice.vecteurs.map((v, i) => ({
    ...vecteursBase[i],
    labelFleche: { base: v.label },
    labelPosition: positions[i],
  }));
  return { points: [], vecteurs, viewBox };
}

type SegmentAide = { type: "texte"; valeur: string } | { type: "katex"; valeur: string };

const t = (valeur: string): SegmentAide => ({ type: "texte", valeur });
const k = (valeur: string): SegmentAide => ({ type: "katex", valeur });

function vecteurColonneLatex(label: string, x: number, y: number): string {
  return `\\vec{${label}}\\begin{pmatrix} ${x} \\\\ ${y} \\end{pmatrix}`;
}

function composantesDe(exercice: ExerciceComparaisonVecteurs, label: string): { x: number; y: number } {
  const v = exercice.vecteurs.find((w) => w.label === label);
  if (!v) throw new Error(`composantesDe : vecteur ${label} introuvable`);
  return v.composantes;
}

function carreLatex(n: number): string {
  return n < 0 ? `(${n})^2` : `${n}^2`;
}

/** Aides de l'écran « sélection » (audit chapitre 6, F4). Niveau 1 : définition du cours de la
 * propriété demandée, sur des lettres u, v jamais tirées sur la figure. Niveau 2 : composantes de
 * la référence lues sur la grille (et sa norme pour « longueur ») — jamais les vecteurs à
 * sélectionner. Vocabulaire de la colinéarité uniquement (jamais celui de l'orthogonalité). */
export function aideSelectionComparaison(exercice: ExerciceComparaisonVecteurs, niveau: number): SegmentAide[][] {
  const lignes: SegmentAide[][] = [];
  const ref = exercice.labelReference;
  if (niveau >= 1) {
    if (exercice.propriete === "longueur") {
      lignes.push([
        t("Deux vecteurs ont la même longueur quand ils ont la même norme — leur direction et leur sens peuvent être différents. La norme de "),
        k("\\vec{v}\\begin{pmatrix} x \\\\ y \\end{pmatrix}"),
        t(" vaut "),
        k("\\sqrt{x^2 + y^2}"),
        t("."),
      ]);
    } else if (exercice.propriete === "direction") {
      lignes.push([
        t("Deux vecteurs ont la même direction (ils sont colinéaires) quand l'un est un multiple de l'autre : "),
        k("\\vec{v} = k\\,\\vec{u}"),
        t(" — leurs supports sont parallèles. Leur sens et leur longueur peuvent être différents."),
      ]);
    } else {
      lignes.push([
        t("Deux vecteurs ont le même sens quand ils ont la même direction et pointent du même côté : "),
        k("\\vec{v} = k\\,\\vec{u}"),
        t(" avec "),
        k("k > 0"),
        t(". Leur longueur peut être différente."),
      ]);
    }
  }
  if (niveau >= 2) {
    const { x, y } = composantesDe(exercice, ref);
    lignes.push([t("Lis les composantes de la référence sur la grille : "), k(vecteurColonneLatex(ref, x, y)), t(".")]);
    if (exercice.propriete === "longueur") {
      const n2 = x * x + y * y;
      const racine = Math.sqrt(n2);
      const valeur = Number.isInteger(racine) ? `\\sqrt{${n2}} = ${racine}` : `\\sqrt{${n2}}`;
      lignes.push([
        t("Sa norme vaut "),
        k(`\\sqrt{${carreLatex(x)} + ${carreLatex(y)}} = ${valeur}`),
        t(" : lis les composantes de chaque autre vecteur et garde ceux qui ont la même norme."),
      ]);
    } else {
      lignes.push([
        t("Garde les vecteurs dont les deux composantes sont celles de "),
        k(`\\vec{${ref}}`),
        t(exercice.propriete === "sens" ? " multipliées par un même nombre k positif." : " multipliées par un même nombre k (positif ou négatif)."),
      ]);
    }
  }
  return lignes;
}

/** Aides de l'écran « égalité » (audit chapitre 6, F4). Niveau 1 : méthode (trouver k). Niveau 2 :
 * composantes des deux vecteurs lues sur la grille — jamais k ni l'égalité elle-même. */
export function aideEgaliteComparaison(exercice: ExerciceComparaisonVecteurs, niveau: number): SegmentAide[][] {
  const lignes: SegmentAide[][] = [];
  const ref = exercice.labelReference;
  const cible = exercice.cibleEgalite;
  if (niveau >= 1) {
    lignes.push([
      t("Les deux vecteurs ont la même direction : cherche le nombre k tel que "),
      k(`\\vec{${cible}} = k\\,\\vec{${ref}}`),
      t(" — chaque composante de "),
      k(`\\vec{${cible}}`),
      t(" est celle de "),
      k(`\\vec{${ref}}`),
      t(" multipliée par k. Si les deux vecteurs sont de sens contraires, k est négatif."),
    ]);
  }
  if (niveau >= 2) {
    const c = composantesDe(exercice, cible);
    const r = composantesDe(exercice, ref);
    lignes.push([
      t("Composantes lues sur la grille : "),
      k(vecteurColonneLatex(cible, c.x, c.y)),
      t(" et "),
      k(vecteurColonneLatex(ref, r.x, r.y)),
      t("."),
    ]);
  }
  return lignes;
}

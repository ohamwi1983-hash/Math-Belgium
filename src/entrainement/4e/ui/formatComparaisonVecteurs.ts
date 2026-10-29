import type { ExerciceComparaisonVecteurs, ProprieteComparaison } from "../core/comparaisonVecteurs.types";
import type { Point } from "../core/vecteur.types";
import { calculerViewBoxVecteurs } from "./vecteurGraph";
import type { PointAffiche, VecteurAffiche, ViewBoxTransformation } from "./vecteurGraph";

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

/** Taille d'une étiquette (lettre + flèche au-dessus, dessinées AU-DESSUS de son point d'ancrage)
 * et décalage par rapport à son vecteur, en fraction de la HAUTEUR du viewBox (le graphe au format
 * 3:2 est limité par sa hauteur : ≈ 16 × 26 px sur un graphe de 213 px, à 390 px de large). */
const FRACTION_LARGEUR_ETIQUETTE = 0.1;
const FRACTION_HAUTEUR_ETIQUETTE = 0.15;
const FRACTION_DECALAGE_ETIQUETTE = 0.06;
/** Rayon de la tête de flèche (taille fixe en pixels chez Mafs), même fraction. */
const FRACTION_RAYON_TETE = 0.06;
/** Positions essayées le long du vecteur (fraction de sa longueur), de part et d'autre. */
const FRACTIONS_LE_LONG = [0.5, 0.35, 0.65, 0.2, 0.8];

interface Boite {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

function boiteEtiquette(ancrage: Point, largeur: number, hauteur: number): Boite {
  return { xMin: ancrage.x - largeur / 2, xMax: ancrage.x + largeur / 2, yMin: ancrage.y, yMax: ancrage.y + hauteur };
}

function boitesSeChevauchent(a: Boite, b: Boite): boolean {
  return a.xMin < b.xMax && b.xMin < a.xMax && a.yMin < b.yMax && b.yMin < a.yMax;
}

/** Le segment (ou sa tête de flèche) touche-t-il la boîte ? (échantillonnage : largement assez fin
 * à cette échelle) */
function segmentTraverseBoite(origine: Point, vecteur: Point, boite: Boite, rayonTete: number): boolean {
  const pointe = { x: origine.x + vecteur.x, y: origine.y + vecteur.y };
  const dx = Math.max(boite.xMin - pointe.x, 0, pointe.x - boite.xMax);
  const dy = Math.max(boite.yMin - pointe.y, 0, pointe.y - boite.yMax);
  if (Math.hypot(dx, dy) < rayonTete) return true;
  for (let k = 0; k <= 40; k++) {
    const x = origine.x + (vecteur.x * k) / 40;
    const y = origine.y + (vecteur.y * k) / 40;
    if (x > boite.xMin && x < boite.xMax && y > boite.yMin && y < boite.yMax) return true;
  }
  return false;
}

/**
 * Positions d'étiquettes (audit chapitre 6, point 25) — pour chaque vecteur, on essaie plusieurs
 * ancrages (de part et d'autre du vecteur, à plusieurs endroits le long de celui-ci) et on garde le
 * premier dont la boîte (lettre + flèche, AU-DESSUS de l'ancrage) ne touche ni un tracé ni une
 * étiquette déjà placée, ni ne sort du cadre — à défaut, celui qui fait le moins de conflits.
 * L'ancien placement (milieu décalé toujours du même côté, puis écartement mutuel) ignorait la
 * hauteur du texte et les tracés : à 390 px les étiquettes s'empilaient ou couvraient une flèche.
 */
function positionsEtiquettes(vecteurs: VecteurAffiche[], viewBox: ViewBoxTransformation): Point[] {
  const hauteurVue = viewBox.y[1] - viewBox.y[0];
  const largeur = hauteurVue * FRACTION_LARGEUR_ETIQUETTE;
  const hauteur = hauteurVue * FRACTION_HAUTEUR_ETIQUETTE;
  const decalage = hauteurVue * FRACTION_DECALAGE_ETIQUETTE;
  const rayonTete = hauteurVue * FRACTION_RAYON_TETE;
  const placees: Boite[] = [];

  return vecteurs.map((v) => {
    const longueur = Math.hypot(v.vecteur.x, v.vecteur.y) || 1;
    const perp = { x: -v.vecteur.y / longueur, y: v.vecteur.x / longueur };
    let meilleur: { ancrage: Point; boite: Boite; conflits: number } | null = null;
    for (const eloignement of [1, 2, 3]) for (const fraction of FRACTIONS_LE_LONG) {
      for (const cote of [1, -1]) {
        const px = perp.x * cote;
        const py = perp.y * cote;
        const point = { x: v.origine.x + v.vecteur.x * fraction, y: v.origine.y + v.vecteur.y * fraction };
        const d = decalage * eloignement;
        // Côté « dessous » : la boîte monte depuis l'ancrage, il faut donc descendre d'autant.
        const ancrage = { x: point.x + px * (d + (largeur / 2) * Math.abs(px)), y: point.y + py * d - (py < 0 ? hauteur * -py : 0) };
        const boite = boiteEtiquette(ancrage, largeur, hauteur);
        let conflits = 0;
        for (const autre of vecteurs) if (segmentTraverseBoite(autre.origine, autre.vecteur, boite, rayonTete)) conflits++;
        for (const deja of placees) if (boitesSeChevauchent(deja, boite)) conflits++;
        if (boite.xMin < viewBox.x[0] || boite.xMax > viewBox.x[1] || boite.yMin < viewBox.y[0] || boite.yMax > viewBox.y[1]) conflits++;
        if (!meilleur || conflits < meilleur.conflits) meilleur = { ancrage, boite, conflits };
        if (conflits === 0) break;
      }
      if (meilleur?.conflits === 0) break;
    }
    placees.push(meilleur!.boite);
    return meilleur!.ancrage;
  });
}

/** Vecteurs affichés (jamais de point isolé) — un par vecteur de l'exercice, coloré différemment
 * si sélectionné. Labels en notation vectorielle réelle (`labelFleche`, flèche dessinée AU-DESSUS
 * de la lettre — voir `components/VecteurGraph.tsx::LabelVecteurFleche`), jamais une lettre nue
 * (`label`) — y compris pour la référence en rouge. Positions calculées par `positionsEtiquettes`
 * ci-dessus plutôt que le milieu par défaut de chaque vecteur : les vecteurs de ce générateur sont
 * TOUS des transformations (multiples scalaires, translations) de 2-3 vecteurs de base, donc
 * souvent proches/parallèles. `viewBox` est la fenêtre dans laquelle les étiquettes ont été placées
 * (à passer à `VecteurGraph.viewBoxFixe`) : une étiquette qui en sortirait est écartée au placement. */
export function vecteursAffichesComparaison(
  exercice: ExerciceComparaisonVecteurs,
  labelsSelectionnes: string[],
): { points: PointAffiche[]; vecteurs: VecteurAffiche[]; viewBox: ViewBoxTransformation } {
  const vecteursBase: VecteurAffiche[] = exercice.vecteurs.map((v) => ({
    origine: v.origine,
    vecteur: v.composantes,
    couleur: labelsSelectionnes.includes(v.label) ? "#f08c00" : v.label === exercice.labelReference ? "#e03131" : undefined,
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
  const positions = positionsEtiquettes(vecteursBase, viewBox);
  const vecteurs: VecteurAffiche[] = exercice.vecteurs.map((v, i) => ({
    ...vecteursBase[i],
    labelFleche: { base: v.label },
    labelPosition: positions[i],
  }));
  return { points: [], vecteurs, viewBox };
}

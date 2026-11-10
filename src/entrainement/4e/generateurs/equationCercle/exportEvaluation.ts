import type { ExerciceEquationCercle } from "../../core/equationCercle.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  ErreurFrequente,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { formatNombreGraphique } from "../../../export/svgGraph";
import { RATIO_GRAPHE_CERCLE, viewBoxEquationCercle } from "../../ui/equationCercleGraph";
import {
  CONSIGNE_CENTRE,
  CONSIGNE_EQUATION,
  CONSIGNE_GENERALE_EQUATION_CERCLE,
  consigneRayon,
  formatAideRayonNiveau2Latex,
  formatEquationAttendueLatex,
  formatEtatActuelCentreLatex,
  formatRayonLatex,
  LATEX_GABARIT_EQUATION,
} from "../../ui/formatEquationCercle";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEquationCercle } from "./index";
import { PARAMETRES_CENTRE_CERCLE, profilEquationCercle } from "../profilsEvaluation4eCh7Coniques";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceEquationCercle>` pour gen49 (Équation d'un cercle
 * (non développée) à partir d'un graphe, `AppEquationCercle.tsx`) — voir
 * `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence, et
 * `generateurs/boiteMoustaches/exportEvaluation.ts` pour le précédent le plus proche d'un adaptateur
 * pilotant un graphique statique SVG écrit à la main (`enteteHtml`/bloc `"html"`).
 *
 * Chapitre Math-Belgium "Géométrie analytique plane" (4e), section "Équation du cercle (forme
 * graphique)" (`cercle`) : cette section est servie par DEUX générateurs, gen49 (ce fichier) ET
 * gen50 (`equationCercleDeveloppee`, adaptateur distinct porté séparément) — ce fichier ne couvre
 * que gen49.
 *
 * Écran → question : `sessionEquationCercle.ts` enchaîne 3 phases FIXES, toujours dans le même
 * ordre — `centre → rayon → equation` (jamais de saut conditionnel, les 2 variantes traversant
 * exactement la même séquence, voir son commentaire de tête) — ceci devient ici 3 questions a/b/c,
 * dans le même ordre, jamais recombinées : (a) coordonnées du centre (écran "centre", 2 champs x/y
 * soumis ensemble) ; (b) rayon (écran "rayon", 1 champ numérique) ; (c) équation cartésienne NON
 * développée (écran "equation", 1 champ texte). Les 2 variantes de `CATALOGUE_VARIANTES`
 * (`rayon_direct`/`rayon_indirect`) ne changent PAS le nombre/l'ordre des questions — seule la
 * justification du rayon en correction (b) diffère (compter les cases vs. Pythagore), exactement
 * comme à l'écran (`texteAideRayonNiveau1`/`texteAideRayonNiveau2`, `ui/formatEquationCercle.ts`).
 *
 * **Graphique** (`construireSvgEquationCercle`) : gen49 est "graphe-first" — `ui/formatEquationCercle.ts`
 * documente explicitement qu'aucun bloc texte ne révèle jamais le centre/rayon en dehors du graphe
 * (c'est justement ce que l'élève doit déterminer). Le papier reproduit donc fidèlement le graphe
 * Mafs de l'écran (`components/EquationCercleGraph.tsx` — cercle tracé, point marqué, AUCUNE
 * annotation) dans l'énoncé, et le RÉIMPRIME dans la correction (même principe que
 * `boiteMoustaches/exportEvaluation.ts` variante `lecture`) avec en plus le centre marqué (croix
 * verte) et le segment centre↔point marqué (pointillé orange) — le même habillage que l'aide de
 * niveau 2 des écrans "centre"/"rayon" à l'écran (`afficherCentre`/`afficherRayon`,
 * `EquationCercleGraph.tsx`), jamais un nouveau code couleur inventé ici. Aucun générateur existant
 * ne trace de CERCLE en SVG statique (`export/svgGraph.ts::construireSvgFonction` est un moteur de
 * tracé de COURBE `y=f(x)`, structurellement inapplicable à un cercle — multivalué en y) : ce
 * fichier écrit donc son propre petit moteur de tracé (même principe assumé que
 * `boiteMoustaches/exportEvaluation.ts`), mais réutilise autant que possible la géométrie déjà pure
 * et testée du reste du projet plutôt que d'en reconstruire une nouvelle — `viewBoxEquationCercle`
 * (`ui/equationCercleGraph.ts`, cadrage dérivé des 4 points cardinaux du cercle + le point marqué,
 * déjà utilisé côté écran, avec le même rapport `RATIO_GRAPHE_CERCLE`). Seul le rendu `<svg>`
 * lui-même (grille de pas 1, axes, cercle, point, croix du centre, segment du rayon) est propre à ce fichier, aucun équivalent
 * générique n'existant à réutiliser.
 *
 * **PAS `regroupable`** : `AdaptateurFeuilleExercices.regroupable` exige à la fois une seule
 * question par instance, une consigne GÉNÉRIQUE, ET l'absence d'`enteteHtml` (voir sa doc,
 * `export/genererFeuilleExercices.ts`) — gen49 ne remplit AUCUNE des 3 conditions : 3 questions par
 * instance (a/b/c ci-dessus, jamais 1 seule) ET un `enteteHtml` (le graphique du cercle) sur
 * chaque instance.
 *
 * Correction RESYNTHÉTISÉE depuis les valeurs déjà connues et correctes de l'instance tirée
 * (`exercice.centre`/`.rayon`/`.pointMarque`, tous déjà fixés à la génération — voir
 * `generateurs/equationCercle/index.ts`), jamais recalculée indépendamment. Réutilise directement
 * `ui/formatEquationCercle.ts` (`formatEtatActuelCentreLatex` pour le centre confirmé,
 * `formatAideRayonNiveau2Latex` pour la formule de Pythagore substituée de la variante
 * `rayon_indirect` — déjà la même formule affichée côté écran à l'aide de niveau 2, seul le résultat
 * numérique final est ajouté ici — et `formatEquationAttendueLatex` pour l'équation attendue),
 * plutôt que d'en resynthétiser de nouvelles. Le texte de justification (pourquoi le centre est ce
 * point, pourquoi compter les cases suffit pour `rayon_direct`) est en revanche un texte de
 * résolution nouveau, aucune des aides existantes n'exposant de texte à concaténer pour ce cas
 * précis (mêmes principe et raison que `analyseFonction/exportWord.ts`/`cercleTrigonometrique/exportEvaluation.ts`).
 *
 * **Feuille d'exercices / évaluation (refonte papier)** : l'énoncé papier (`enoncePapier`) est le
 * graphique et la consigne globale « détermine l'équation » ; les 3 écrans (centre, rayon, équation)
 * deviennent les étapes 1 à 3 du corrigé détaillé, jamais des sous-questions imprimées. Aucune place
 * de réponse. Tirage équilibré : `profilsEvaluation4eCh7Coniques.ts` (centre sur un axe au choix).
 */

// ============================================================================
// Moteur de tracé SVG statique — cercle sur grille (aucun équivalent existant, voir commentaire de
// tête de fichier : `export/svgGraph.ts::construireSvgFonction` est un tracé de COURBE `y=f(x)`,
// inapplicable à un cercle multivalué en y).
// ============================================================================

const LARGEUR_SVG = 320;
const MARGE_SVG = 14;
const COULEUR_GRILLE = "#d8dee6";
const COULEUR_AXE = "#495057";
const COULEUR_CERCLE = "#1971c2";
const COULEUR_POINT = "#f08c00";
const COULEUR_CENTRE = "#2f9e44";
const EPAISSEUR_CERCLE = 2.4;
const EPAISSEUR_SEGMENT = 1.6;
const DEMI_CROIX_CENTRE = 4;

function ligneSvg(x1: number, y1: number, x2: number, y2: number, couleur: string, epaisseur: number, style?: "dashed"): string {
  const traitPointille = style === "dashed" ? ' stroke-dasharray="5,4"' : "";
  return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${couleur}" stroke-width="${epaisseur}"${traitPointille}/>`;
}

function texteSvg(x: number, y: number, couleur: string, contenu: string, ancre: "middle" | "end"): string {
  return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="8" text-anchor="${ancre}" fill="${couleur}">${contenu}</text>`;
}

interface OptionsSvgEquationCercle {
  /** Croix verte au centre — correction uniquement (aide niveau 2 côté écran), jamais l'énoncé (qui
   * ne doit pas trahir la réponse). */
  avecCentre?: boolean;
  /** Segment pointillé centre↔point marqué — correction uniquement, même réserve que `avecCentre`. */
  avecRayon?: boolean;
}

/**
 * `<svg>` autonome du graphe de gen49 — grille de pas 1 + axes gradués, cercle tracé, point
 * marqué ; le centre (croix) et le segment du rayon ne sont ajoutés que si demandé (`options`,
 * correction uniquement). Cadrage identique à l'écran (`viewBoxEquationCercle`, même
 * fonction pure que `EquationCercleGraph.tsx`), avec UNE
 * seule échelle sur les deux axes : le cercle est un vrai `<circle>`, jamais une ellipse.
 */
function construireSvgEquationCercle(exercice: ExerciceEquationCercle, options: OptionsSvgEquationCercle = {}): string {
  const viewBox = viewBoxEquationCercle(exercice);
  const largeur = LARGEUR_SVG;
  const hauteur = Math.round(largeur / RATIO_GRAPHE_CERCLE);
  const [xMin, xMax] = viewBox.x;
  const [yMin, yMax] = viewBox.y;
  // UNE seule échelle pour les deux axes (audit chapitre 7, point 41) : deux échelles
  // indépendantes déformaient le cercle en ellipse (jusqu'à 5 %) — la zone la plus contraignante
  // fixe l'échelle, l'autre axe est centré.
  const echelle = Math.min((largeur - 2 * MARGE_SVG) / (xMax - xMin), (hauteur - 2 * MARGE_SVG) / (yMax - yMin));
  const decalageX = (largeur - echelle * (xMax - xMin)) / 2;
  const decalageY = (hauteur - echelle * (yMax - yMin)) / 2;
  const sx = (x: number) => decalageX + (x - xMin) * echelle;
  const sy = (y: number) => decalageY + (yMax - y) * echelle;

  // Quadrillage de pas 1 (coordonnées entières sur les nœuds, comme à l'écran) ; un nombre sur
  // deux seulement quand une unité est trop étroite pour y écrire « −10 ».
  const pasX = 1;
  const pasY = 1;
  const pasEtiquettes = echelle < 16 ? 2 : 1;

  // Bords de la zone tracée et position des axes — un axe hors cadre n'est pas tracé, mais ses
  // nombres restent épinglés au bord le plus proche (même principe que les graduations flottantes
  // de l'écran, `GraduationsFlottantes`) : jamais une figure sans aucune coordonnée lisible.
  const gauche = sx(xMin);
  const droite = sx(xMax);
  const haut = sy(yMax);
  const bas = sy(yMin);
  const borner = (valeur: number, min: number, max: number) => Math.min(max, Math.max(min, valeur));
  const ligneNombresX = borner(sy(0), haut, bas - 12);
  const colonneNombresY = borner(sx(0), gauche + 16, droite);

  const grille: string[] = [];
  const labels: string[] = [];
  for (let v = Math.ceil(xMin / pasX) * pasX; v <= xMax + 1e-9; v += pasX) {
    const px = sx(v);
    grille.push(`<line x1="${px.toFixed(1)}" y1="${haut.toFixed(1)}" x2="${px.toFixed(1)}" y2="${bas.toFixed(1)}" stroke="${COULEUR_GRILLE}" stroke-width="1"/>`);
    if (Math.abs(v) > 1e-9 && Math.round(v) % pasEtiquettes === 0) labels.push(texteSvg(px, ligneNombresX + 11, COULEUR_AXE, formatNombreGraphique(v), "middle"));
  }
  for (let v = Math.ceil(yMin / pasY) * pasY; v <= yMax + 1e-9; v += pasY) {
    const py = sy(v);
    grille.push(`<line x1="${gauche.toFixed(1)}" y1="${py.toFixed(1)}" x2="${droite.toFixed(1)}" y2="${py.toFixed(1)}" stroke="${COULEUR_GRILLE}" stroke-width="1"/>`);
    if (Math.abs(v) > 1e-9 && Math.round(v) % pasEtiquettes === 0) labels.push(texteSvg(colonneNombresY - 4, py + 3, COULEUR_AXE, formatNombreGraphique(v), "end"));
  }

  const axeX = yMin <= 0 && 0 <= yMax ? ligneSvg(gauche, sy(0), droite, sy(0), COULEUR_AXE, 1.4) : "";
  const axeY = xMin <= 0 && 0 <= xMax ? ligneSvg(sx(0), haut, sx(0), bas, COULEUR_AXE, 1.4) : "";

  const { centre, rayon, pointMarque } = exercice;
  const cercle = `<circle cx="${sx(centre.x).toFixed(1)}" cy="${sy(centre.y).toFixed(1)}" r="${(rayon * echelle).toFixed(1)}" fill="none" stroke="${COULEUR_CERCLE}" stroke-width="${EPAISSEUR_CERCLE}"/>`;
  // Étiquette « P » : l'énoncé papier et le corrigé nomment ce point (placée côté extérieur du cercle).
  const versExterieurX = Math.sign(pointMarque.x - centre.x);
  const versExterieurY = Math.sign(pointMarque.y - centre.y);
  const etiquetteP = `<text x="${(sx(pointMarque.x) + (versExterieurX >= 0 ? 6 : -6)).toFixed(1)}" y="${(sy(pointMarque.y) + (versExterieurY > 0 ? -6 : 12)).toFixed(1)}" font-size="11" font-weight="700" text-anchor="${versExterieurX >= 0 ? "start" : "end"}" fill="${COULEUR_POINT}">P</text>`;
  const point = `<circle cx="${sx(pointMarque.x).toFixed(1)}" cy="${sy(pointMarque.y).toFixed(1)}" r="3.2" fill="${COULEUR_POINT}"/>${etiquetteP}`;

  const segmentRayon = options.avecRayon ? ligneSvg(sx(centre.x), sy(centre.y), sx(pointMarque.x), sy(pointMarque.y), COULEUR_POINT, EPAISSEUR_SEGMENT, "dashed") : "";

  let centreCroix = "";
  if (options.avecCentre) {
    const cx = sx(centre.x);
    const cy = sy(centre.y);
    centreCroix =
      ligneSvg(cx - DEMI_CROIX_CENTRE, cy, cx + DEMI_CROIX_CENTRE, cy, COULEUR_CENTRE, 1.8) +
      ligneSvg(cx, cy - DEMI_CROIX_CENTRE, cx, cy + DEMI_CROIX_CENTRE, COULEUR_CENTRE, 1.8);
  }

  const cadre = `<rect x="0.5" y="0.5" width="${largeur - 1}" height="${hauteur - 1}" fill="none" stroke="#adb5bd" stroke-width="1"/>`;

  return `<svg class="graphe-cyclo" width="${largeur}" height="${hauteur}" viewBox="0 0 ${largeur} ${hauteur}" xmlns="http://www.w3.org/2000/svg">
<rect x="0" y="0" width="${largeur}" height="${hauteur}" fill="#ffffff"/>
${grille.join("")}
${axeX}${axeY}
${segmentRayon}
${cercle}
${point}
${centreCroix}
${labels.join("")}
${cadre}
</svg>`;
}

// ============================================================================
// Adaptateur.
// ============================================================================

function construireEnonceEquationCercle(exercice: ExerciceEquationCercle): SectionExercice {
  return {
    enteteFragments: [texte(CONSIGNE_GENERALE_EQUATION_CERCLE)],
    enteteHtml: construireSvgEquationCercle(exercice),
    questions: [{ consigne: [texte(CONSIGNE_CENTRE)] }, { consigne: [texte(consigneRayon(exercice))] }, { consigne: [texte(CONSIGNE_EQUATION)] }],
  };
}

/** Énoncé papier : le graphique et la consigne globale — les 3 écrans deviennent les étapes du
 * corrigé. Le point marqué est nommé P pour que le corrigé puisse s'y référer. */
function enoncePapierEquationCercle(exercice: ExerciceEquationCercle): EnoncePapier {
  return {
    section: {
      enteteFragments: [
        texte("Le graphique ci-dessous représente un cercle ; le point marqué P appartient à ce cercle. Détermine l'équation cartésienne de ce cercle, sous la forme non développée "),
        latex(LATEX_GABARIT_EQUATION),
        texte("."),
      ],
      enteteHtml: construireSvgEquationCercle(exercice),
      questions: [],
    },
  };
}

function construireCorrectionEquationCercle(exercice: ExerciceEquationCercle): BlocCorrection[] {
  return [
    { type: "html", html: construireSvgEquationCercle(exercice, { avecCentre: true, avecRayon: true }) },
    { type: "paragraphe", fragments: [texte("Centre "), latex(`C${formatEtatActuelCentreLatex(exercice)}`), texte(", rayon "), latex(`R = ${formatRayonLatex(exercice)}`), texte(".")] },
    { type: "paragraphe", fragments: [texte("Équation : "), latex(formatEquationAttendueLatex(exercice)), texte(".")] },
  ];
}

function pointLatex(x: number, y: number): string {
  return `(${x}\\,;\\,${y})`;
}

function difficulteEquationCercle(exercice: ExerciceEquationCercle): 1 | 2 | 3 {
  return exercice.variante === "rayon_direct" ? 1 : 2;
}

function reponseBreveEquationCercle(exercice: ExerciceEquationCercle): FragmentConsigne[] {
  return [latex(formatEquationAttendueLatex(exercice))];
}

function correctionDetailleeEquationCercle(exercice: ExerciceEquationCercle): EtapeCorrection[] {
  const { centre, pointMarque } = exercice;
  const lignes: EtapeCorrection[] = [
    { label: "Méthode", sousQuestion: "a", fragments: [texte("Le centre est le point situé à égale distance de tous les points du cercle : le milieu du cercle tracé, lu sur les nœuds de la grille.")] },
    {
      label: "Lecture",
      sousQuestion: "a",
      fragments: [texte("Centre "), latex(`C${formatEtatActuelCentreLatex(exercice)}`), texte(" (croix sur la figure) ; le point marqué est "), latex(`P${pointLatex(pointMarque.x, pointMarque.y)}`), texte(".")],
      figureHtml: construireSvgEquationCercle(exercice, { avecCentre: true, avecRayon: true }),
    },
  ];
  if (exercice.variante === "rayon_direct") {
    const horizontal = pointMarque.y === centre.y;
    lignes.push({
      label: "Lecture",
      sousQuestion: "b",
      fragments: [
        texte(`P est sur la même ${horizontal ? "horizontale" : "verticale"} que le centre : le rayon se compte en carreaux, `),
        latex(`R = CP = ${formatRayonLatex(exercice)}`),
        texte(", donc "),
        latex(`R^2 = ${exercice.rayonCarre}`),
        texte("."),
      ],
    });
  } else {
    lignes.push(
      { label: "Méthode", sousQuestion: "b", fragments: [texte("P n'est pas aligné avec le centre sur la grille : le rayon est la distance CP, calculée par le théorème de Pythagore à partir des écarts horizontal et vertical.")] },
      {
        label: "Calcul",
        sousQuestion: "b",
        fragments: [latex(`${formatAideRayonNiveau2Latex(exercice) as string} = \\sqrt{${exercice.rayonCarre}} = ${formatRayonLatex(exercice)}`), texte(", donc "), latex(`R^2 = ${exercice.rayonCarre}`), texte(".")],
      },
    );
  }
  lignes.push(
    { label: "Méthode", sousQuestion: "c", fragments: [texte("Un cercle de centre "), latex("(x_0\\,;\\,y_0)"), texte(" et de rayon "), latex("R"), texte(" a pour équation "), latex(LATEX_GABARIT_EQUATION), texte(".")] },
    { label: "Conclusion", sousQuestion: "c", fragments: [latex(formatEquationAttendueLatex(exercice)), texte(".")] },
  );
  const negatif = centre.x < 0 ? { variable: "x", valeur: centre.x } : centre.y < 0 ? { variable: "y", valeur: centre.y } : null;
  lignes.push({
    label: "Piège",
    sousQuestion: "c",
    fragments: negatif
      ? [texte("Dans la parenthèse on soustrait la coordonnée du centre : "), latex(`${negatif.variable}_0 = ${negatif.valeur}`), texte(" donne "), latex(`(${negatif.variable} + ${-negatif.valeur})^2`), texte(", et le second membre est "), latex("R^2"), texte(", pas R.")]
      : [texte("Le second membre de l'équation est "), latex(`R^2 = ${exercice.rayonCarre}`), texte(", pas "), latex(`R = ${formatRayonLatex(exercice).split(" \\approx")[0]}`), texte(".")],
  });
  return lignes;
}

function baremeEquationCercle(exercice: ExerciceEquationCercle): BaremeExercice {
  const { centre } = exercice;
  const erreurs: ErreurFrequente[] = [{ description: [texte("Rayon R écrit au second membre au lieu de "), latex("R^2")], cout: "−1" }];
  if (centre.x !== 0 || centre.y !== 0) erreurs.push({ description: [texte("Signe d'une coordonnée du centre inversé dans la parenthèse")], cout: "−1" });
  if (exercice.variante === "rayon_indirect") erreurs.push({ description: [texte("Rayon lu « à vue » sur la grille au lieu du théorème de Pythagore")], cout: "−1" });
  return {
    reponseFinale: [latex(formatEquationAttendueLatex(exercice))],
    criteres: [
      { sousQuestion: "a", critere: [texte("Centre "), latex(formatEtatActuelCentreLatex(exercice))], points: 1 },
      { sousQuestion: "b", critere: exercice.variante === "rayon_direct" ? [texte("Rayon lu sur la grille : "), latex(`R = ${formatRayonLatex(exercice)}`)] : [texte("Rayon calculé par Pythagore : "), latex(`R^2 = ${exercice.rayonCarre}`)], points: 1 },
      { sousQuestion: "c", critere: [texte("Équation correcte sous la forme non développée (signes et "), latex("R^2"), texte(")")], points: 2 },
    ],
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[texte("Le rayon peut rester sous forme de racine : seul "), latex(`R^2 = ${exercice.rayonCarre}`), texte(" apparaît dans l'équation")]],
  };
}

export const adaptateurEvaluationEquationCercle: AdaptateurFeuilleExercices<ExerciceEquationCercle> = {
  titreDocument: "Équation d'un cercle (non développée) à partir d'un graphe — Évaluation",
  nomFichierBase: "equation-cercle",
  genererInstance: genererExerciceEquationCercle,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceEquationCercle,
  construireCorrection: construireCorrectionEquationCercle,
  difficulte: difficulteEquationCercle,
  reponseBreve: reponseBreveEquationCercle,
  correctionDetaillee: correctionDetailleeEquationCercle,
  bareme: baremeEquationCercle,
  enoncePapier: enoncePapierEquationCercle,
  dureeMinutes: 5,
  profilInstance: profilEquationCercle,
  parametresAuChoix: PARAMETRES_CENTRE_CERCLE,
  // PAS regroupable : 3 étapes par instance ET un enteteHtml (le graphique du cercle).
};

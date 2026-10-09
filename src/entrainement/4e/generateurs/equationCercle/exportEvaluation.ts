import type { ExerciceEquationCercle } from "../../core/equationCercle.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { formatNombreGraphique } from "../../../export/svgGraph";
import { viewBoxEquationCercle } from "../../ui/equationCercleGraph";
import {
  CONSIGNE_CENTRE,
  CONSIGNE_EQUATION,
  CONSIGNE_GENERALE_EQUATION_CERCLE,
  CONSIGNE_RAYON,
  formatAideRayonNiveau2Latex,
  formatEquationAttendueLatex,
  formatEtatActuelCentreLatex,
} from "../../ui/formatEquationCercle";
import { RATIO_GRAPHE, calculerPasGrille, etendreViewBoxPourEtiquettes } from "../../ui/mafsTransformation";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEquationCercle } from "./index";

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
 * déjà utilisé côté écran), `etendreViewBoxPourEtiquettes`/`calculerPasGrille`/`RATIO_GRAPHE`
 * (`ui/mafsTransformation.ts`, même calcul de pas de grille "nombre rond" et de marge de clairance
 * que le reste du projet). Seul le rendu `<svg>` lui-même (grille, axes, ellipse représentant le
 * cercle, point, croix du centre, segment du rayon) est propre à ce fichier, aucun équivalent
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
 * Aucune zone de réponse vierge (`reponse: { type: "lignes", nombre: 0 }` sur les 3 questions, même
 * décision documentée que `quelAngle/exportEvaluation.ts`/`pointVectoriel/exportEvaluation.ts`) :
 * chaque réponse attendue est une donnée courte (une paire de coordonnées, un nombre, une équation),
 * jamais un calcul à dérouler sur plusieurs lignes.
 */

function formatNombre(valeur: number): string {
  return Number.isInteger(valeur) ? String(valeur) : valeur.toFixed(2).replace(/\.?0+$/, "");
}

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
 * `<svg>` autonome du graphe de gen49 — grille + axes gradués, cercle tracé (`<ellipse>`, jamais un
 * `<circle>` seul : `sx`/`sy` peuvent différer légèrement, voir ci-dessous), point marqué ; le centre
 * (croix) et le segment du rayon ne sont ajoutés que si demandé (`options`, correction uniquement).
 * Cadrage identique à l'écran (`viewBoxEquationCercle` + `etendreViewBoxPourEtiquettes`, même
 * fonctions pures que `EquationCercleGraph.tsx`) : `xMax-xMin` et `yMax-yMin` respectent alors
 * exactement `RATIO_GRAPHE`, donc `sx`/`sy` restent quasi identiques malgré la marge fixe `MARGE_SVG`
 * commune aux 2 axes (même compromis assumé que `export/svgGraph.ts::construireSvgFonction`) — le
 * cercle reste visuellement rond, jamais une ellipse perceptible.
 */
function construireSvgEquationCercle(exercice: ExerciceEquationCercle, options: OptionsSvgEquationCercle = {}): string {
  const viewBox = etendreViewBoxPourEtiquettes(viewBoxEquationCercle(exercice));
  const largeur = LARGEUR_SVG;
  const hauteur = Math.round(largeur / RATIO_GRAPHE);
  const [xMin, xMax] = viewBox.x;
  const [yMin, yMax] = viewBox.y;
  const zoneX = largeur - 2 * MARGE_SVG;
  const zoneY = hauteur - 2 * MARGE_SVG;
  const sx = (x: number) => MARGE_SVG + ((x - xMin) / (xMax - xMin)) * zoneX;
  const sy = (y: number) => MARGE_SVG + ((yMax - y) / (yMax - yMin)) * zoneY;

  const pasX = calculerPasGrille(xMax - xMin);
  const pasY = calculerPasGrille(yMax - yMin);

  const grille: string[] = [];
  const labels: string[] = [];
  for (let v = Math.ceil(xMin / pasX) * pasX; v <= xMax + 1e-9; v += pasX) {
    const px = sx(v);
    grille.push(`<line x1="${px.toFixed(1)}" y1="${MARGE_SVG}" x2="${px.toFixed(1)}" y2="${hauteur - MARGE_SVG}" stroke="${COULEUR_GRILLE}" stroke-width="1"/>`);
    if (Math.abs(v) > 1e-9) labels.push(texteSvg(px, sy(0) + 11, COULEUR_AXE, formatNombreGraphique(v), "middle"));
  }
  for (let v = Math.ceil(yMin / pasY) * pasY; v <= yMax + 1e-9; v += pasY) {
    const py = sy(v);
    grille.push(`<line x1="${MARGE_SVG}" y1="${py.toFixed(1)}" x2="${largeur - MARGE_SVG}" y2="${py.toFixed(1)}" stroke="${COULEUR_GRILLE}" stroke-width="1"/>`);
    if (Math.abs(v) > 1e-9) labels.push(texteSvg(sx(0) - 4, py + 3, COULEUR_AXE, formatNombreGraphique(v), "end"));
  }

  const axeX = ligneSvg(MARGE_SVG, sy(0), largeur - MARGE_SVG, sy(0), COULEUR_AXE, 1.4);
  const axeY = ligneSvg(sx(0), MARGE_SVG, sx(0), hauteur - MARGE_SVG, COULEUR_AXE, 1.4);

  const { centre, rayon, pointMarque } = exercice;
  const rx = sx(centre.x + rayon) - sx(centre.x);
  const ry = sy(centre.y) - sy(centre.y + rayon);
  const cercle = `<ellipse cx="${sx(centre.x).toFixed(1)}" cy="${sy(centre.y).toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="none" stroke="${COULEUR_CERCLE}" stroke-width="${EPAISSEUR_CERCLE}"/>`;
  const point = `<circle cx="${sx(pointMarque.x).toFixed(1)}" cy="${sy(pointMarque.y).toFixed(1)}" r="3.2" fill="${COULEUR_POINT}"/>`;

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
    questions: [
      { consigne: [texte(CONSIGNE_CENTRE)], reponse: { type: "lignes", nombre: 0 } },
      { consigne: [texte(CONSIGNE_RAYON)], reponse: { type: "lignes", nombre: 0 } },
      { consigne: [texte(CONSIGNE_EQUATION)], reponse: { type: "lignes", nombre: 0 } },
    ],
  };
}

function construireCorrectionEquationCercle(exercice: ExerciceEquationCercle): BlocCorrection[] {
  const { rayon, variante } = exercice;
  const blocs: BlocCorrection[] = [{ type: "html", html: construireSvgEquationCercle(exercice, { avecCentre: true, avecRayon: true }) }];

  blocs.push({
    type: "paragraphe",
    fragments: [
      texte("a) Le centre est le point équidistant de tous les points du cercle — marqué en vert sur le graphique ci-dessus : "),
      latex(formatEtatActuelCentreLatex(exercice)),
      texte("."),
    ],
  });

  if (variante === "rayon_direct") {
    blocs.push({
      type: "paragraphe",
      fragments: [
        texte(
          `b) Le point marqué est aligné avec le centre sur la grille (segment orange ci-dessus) : il suffit de compter le nombre de cases qui les séparent — R = ${formatNombre(rayon)}.`,
        ),
      ],
    });
  } else {
    const formuleRayon = formatAideRayonNiveau2Latex(exercice) as string;
    blocs.push({
      type: "paragraphe",
      fragments: [
        texte(
          "b) Le point marqué n'est pas aligné avec le centre : le rayon se retrouve par le théorème de Pythagore, à partir des écarts horizontal et vertical entre le centre et ce point (segment orange ci-dessus) : ",
        ),
        latex(`${formuleRayon} = ${formatNombre(rayon)}`),
        texte("."),
      ],
    });
  }

  blocs.push({
    type: "paragraphe",
    fragments: [
      texte("c) Un cercle de centre (x₀ ; y₀) et de rayon R a pour équation (x−x₀)² + (y−y₀)² = R², non développée, donc : "),
      latex(formatEquationAttendueLatex(exercice)),
      texte("."),
    ],
  });

  return blocs;
}

export const adaptateurEvaluationEquationCercle: AdaptateurFeuilleExercices<ExerciceEquationCercle> = {
  titreDocument: "Équation d'un cercle (non développée) à partir d'un graphe — Évaluation",
  nomFichierBase: "equation-cercle",
  genererInstance: genererExerciceEquationCercle,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceEquationCercle,
  construireCorrection: construireCorrectionEquationCercle,
  // PAS regroupable : 3 questions par instance (centre/rayon/équation) ET un enteteHtml (le
  // graphique du cercle) sur chaque instance — les 2 conditions explicitement exclues par la doc de
  // `AdaptateurFeuilleExercices.regroupable` (`export/genererFeuilleExercices.ts`). Voir le
  // commentaire de tête de fichier.
};

import type { ExerciceParametresSinusoideGraphique } from "../../core5e/parametresSinusoideGraphique.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { ORDRE_PHASES_SINUSOIDE_GRAPHIQUE } from "../../moteur5e/typesParametresSinusoideGraphique";
import { evaluerY, formatRationnelPiTexte, pasAxeY, positionsTicksX, valeurAmplitudeSignee, viewBoxX, viewBoxY } from "../../ui5e/sinusoideGraph";
import { valeurNumerique } from "../parametresSinusoide/rationnelPi";
import { formatChampParametreGraphiqueLatex } from "../../ui5e/formatParametresSinusoideGraphique";
import { genererExerciceParametresSinusoideGraphique } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceParametresSinusoideGraphique>` pour 5gen9
 * (Paramètres — lecture graphique) — feuille d'évaluation. Réutilise DIRECTEMENT la géométrie déjà
 * établie de l'écran interactif (`ui5e/sinusoideGraph.ts::evaluerY`/`viewBoxX`/`viewBoxY`, couvrant
 * 2,5 périodes) via `construireSvgFonction` (`export/svgGraph.ts`, déjà utilisé par 5gen4 et gen8
 * 4e) — le graphique imprimé est donc géométriquement identique à celui vu à l'écran, jamais un
 * second moteur de tracé.
 */

const COULEUR_COURBE = "#1971c2";
const COULEUR_GRILLE = "#d8dee6";
const COULEUR_AXE = "#495057";

/**
 * Graphe imprimé gradué COMME À L'ÉCRAN (audit 5e ch. 2, point 29) : le moteur générique
 * `export/svgGraph.ts` gradue en « nombres ronds » (5, 10, 15… pour T = 3π) et pose ses étiquettes
 * sur les axes, souvent hors du cadre (44 % des tirages) — illisible pour cet exercice dont tout
 * l'enjeu est de LIRE T et x₀. Ici : lignes verticales à chaque quart de période à partir de Φ
 * (`positionsTicksX`, valeurs exactes en π, les passages par la médiane et les sommets tombent tous
 * sur une ligne), étiquettes une sur deux ; lignes horizontales au pas `pasAxeY`, étiquettes sur b,
 * b ± A ; toutes les étiquettes DANS le cadre (sur l'axe s'il est visible, sinon au bord).
 */
function construireGrapheParametresSinusoide(exercice: ExerciceParametresSinusoideGraphique): string {
  const [xMin, xMax] = viewBoxX(exercice);
  const [yMin, yMax] = viewBoxY(exercice);
  const largeur = 440;
  const hauteur = 230;
  const marge = 12;
  const sx = (x: number) => marge + ((x - xMin) / (xMax - xMin)) * (largeur - 2 * marge);
  const sy = (y: number) => marge + ((yMax - y) / (yMax - yMin)) * (hauteur - 2 * marge);
  const f = (v: number) => v.toFixed(1);
  const texteX = (x: number, y: number, t: string, ancre: string) => `<text x="${f(x)}" y="${f(y)}" font-size="9" text-anchor="${ancre}" fill="${COULEUR_AXE}">${t}</text>`;

  const elements: string[] = [`<rect x="0" y="0" width="${largeur}" height="${hauteur}" fill="#ffffff"/>`];
  // Quadrillage vertical : un quart de période.
  const ticksX = positionsTicksX(exercice);
  for (const tick of ticksX) {
    const px = sx(valeurNumerique(tick));
    elements.push(`<line x1="${f(px)}" y1="${marge}" x2="${f(px)}" y2="${hauteur - marge}" stroke="${COULEUR_GRILLE}" stroke-width="1"/>`);
  }
  // Quadrillage horizontal : pas de l'axe Y (1 ou 0,5).
  const pas = pasAxeY(exercice);
  for (let i = Math.ceil(yMin / pas); i * pas <= yMax + 1e-9; i++) {
    const py = sy(i * pas);
    elements.push(`<line x1="${marge}" y1="${f(py)}" x2="${largeur - marge}" y2="${f(py)}" stroke="${COULEUR_GRILLE}" stroke-width="1"/>`);
  }
  // Axes (seulement s'ils sont dans le cadre).
  const zeroXVisible = xMin <= 0 && 0 <= xMax;
  const zeroYVisible = yMin <= 0 && 0 <= yMax;
  if (zeroYVisible) elements.push(`<line x1="${marge}" y1="${f(sy(0))}" x2="${largeur - marge}" y2="${f(sy(0))}" stroke="${COULEUR_AXE}" stroke-width="1.4"/>`);
  if (zeroXVisible) elements.push(`<line x1="${f(sx(0))}" y1="${marge}" x2="${f(sx(0))}" y2="${hauteur - marge}" stroke="${COULEUR_AXE}" stroke-width="1.4"/>`);
  // Courbe.
  const points: string[] = [];
  for (let i = 0; i <= 400; i++) {
    const x = xMin + ((xMax - xMin) * i) / 400;
    points.push(`${i === 0 ? "M" : "L"} ${f(sx(x))},${f(sy(evaluerY(exercice, x)))}`);
  }
  elements.push(`<path d="${points.join(" ")}" fill="none" stroke="${COULEUR_COURBE}" stroke-width="2.2" stroke-linecap="round"/>`);
  // Étiquettes X : une ligne sur deux (demi-période), jamais à moins de 22 px d'un bord.
  const yEtiquetteX = zeroYVisible && sy(0) < hauteur - marge - 12 ? sy(0) + 11 : hauteur - marge - 3;
  ticksX.forEach((tick, index) => {
    if (index % 2 !== 1) return;
    const px = sx(valeurNumerique(tick));
    if (px < marge + 22 || px > largeur - marge - 22) return;
    elements.push(texteX(px, yEtiquetteX, formatRationnelPiTexte(tick).replace("-", "−"), "middle"));
  });
  // Étiquettes Y : b, b + A, b − A.
  const A = Math.abs(valeurAmplitudeSignee(exercice));
  const xEtiquetteY = zeroXVisible && sx(0) > marge + 30 ? sx(0) - 3 : marge + 3;
  const ancreY = zeroXVisible && sx(0) > marge + 30 ? "end" : "start";
  for (const v of [exercice.b - A, exercice.b, exercice.b + A]) {
    elements.push(texteX(xEtiquetteY, sy(v) + 3, formatNombreFr(v), ancreY));
  }
  elements.push(`<rect x="0.5" y="0.5" width="${largeur - 1}" height="${hauteur - 1}" fill="none" stroke="#adb5bd" stroke-width="1"/>`);
  return `<svg class="graphe-sinusoide" width="${largeur}" height="${hauteur}" viewBox="0 0 ${largeur} ${hauteur}" xmlns="http://www.w3.org/2000/svg">${elements.join("")}</svg>`;
}

/** Nombre avec virgule décimale et « − » typographique. */
function formatNombreFr(v: number): string {
  const r = Math.round(v * 100) / 100;
  return String(r).replace(".", ",").replace("-", "−");
}

function construireEnonceParametresSinusoideGraphique(exercice: ExerciceParametresSinusoideGraphique): SectionExercice {
  return {
    enteteFragments: [texte("Le graphique ci-dessous représente une fonction sinusoïdale.")],
    enteteHtml: construireGrapheParametresSinusoide(exercice),
    questions: [
      {
        consigne: [texte("Détermine le décalage vertical b, l'amplitude, la période T, la pulsation ω, la fréquence, le décalage horizontal Φ (abscisse d'un passage de la courbe par sa ligne médiane en montant) et la phase φ de cette fonction (valeurs exactes, ou arrondies au centième).")],
        reponse: { type: "lignes", nombre: 7 },
      },
    ],
  };
}

function construireCorrectionParametresSinusoideGraphique(exercice: ExerciceParametresSinusoideGraphique): BlocCorrection[] {
  return ORDRE_PHASES_SINUSOIDE_GRAPHIQUE.map((champ) => ({ type: "paragraphe", fragments: [latex(formatChampParametreGraphiqueLatex(exercice, champ))] }));
}

export const adaptateurEvaluationParametresSinusoideGraphique: AdaptateurFeuilleExercices<ExerciceParametresSinusoideGraphique> = {
  titreDocument: "Paramètres d'une fonction sinusoïdale (graphique) — Évaluation",
  nomFichierBase: "parametres-sinusoide-graphique",
  genererInstance: genererExerciceParametresSinusoideGraphique,
  construireEnonce: construireEnonceParametresSinusoideGraphique,
  construireCorrection: construireCorrectionParametresSinusoideGraphique,
};

import type { ExerciceParametresSinusoideGraphique } from "../../core5e/parametresSinusoideGraphique.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  EtapeCorrection,
  ErreurFrequente,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { ORDRE_PHASES_SINUSOIDE_GRAPHIQUE, type PhaseParametresSinusoideGraphique } from "../../moteur5e/typesParametresSinusoideGraphique";
import { evaluerY, formatRationnelPiTexte, pasAxeY, positionsTicksX, valeurAmplitudeSignee, viewBoxX, viewBoxY } from "../../ui5e/sinusoideGraph";
import { additionnerRationnelPi, diviserParEntier, inverseRationnelPi, multiplierRationnelPi, negatifRationnelPi, reduireRationnelPi, valeurNumerique } from "../parametresSinusoide/rationnelPi";
import { consignePhase, formatChampParametreGraphiqueLatex, formatMagnitudeAmplitudeLatex, formatRationnelPiLatex, phaseRetenue, phiRetenu } from "../../ui5e/formatParametresSinusoideGraphique";
import { genererExerciceParametresSinusoideGraphique } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceParametresSinusoideGraphique>` pour 5gen9
 * (Paramètres — lecture graphique). Méthode des feuilles : `.claude/rules/feuilles-evaluations.md`.
 * Le graphe imprimé reprend la géométrie de l'écran (`ui5e/sinusoideGraph.ts::evaluerY`/`viewBoxX`/
 * `viewBoxY`), gradué en quarts de période. `construireEnonce` porte les 7 étapes de l'écran
 * (titres du corrigé) ; `enoncePapier`, le graphe et une consigne globale.
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

const PRECISION = " (valeur exacte, ou arrondie au centième)";
const LETTRE: Record<PhaseParametresSinusoideGraphique, string> = { decalage: "a", amplitude: "b", periode: "c", pulsation: "d", frequence: "e", phi: "f", dephasage: "g" };

/** Consigne d'une étape (celle de l'écran), sans la précision d'arrondi rappelée dans la consigne globale. */
function consigneEtape(phase: PhaseParametresSinusoideGraphique): FragmentConsigne[] {
  return [texte(consignePhase(phase).replace(PRECISION, ""))];
}

const ENTETE: FragmentConsigne[] = [
  texte("Le graphique ci-dessous représente une fonction sinusoïdale "),
  latex("f(x) = A\\sin(\\omega x + \\varphi) + b"),
  texte(", avec "),
  latex("A > 0"),
  texte(" et "),
  latex("\\omega > 0"),
  texte("."),
];

/** Les 7 étapes de l'écran interactif (ordre `ORDRE_PHASES_SINUSOIDE_GRAPHIQUE`, lettres a → g) : sur
 * papier, elles ne servent qu'aux titres du corrigé (voir `enoncePapier`). */
function construireEnonceParametresSinusoideGraphique(exercice: ExerciceParametresSinusoideGraphique): SectionExercice {
  return {
    enteteFragments: ENTETE,
    enteteHtml: construireGrapheParametresSinusoide(exercice),
    questions: ORDRE_PHASES_SINUSOIDE_GRAPHIQUE.map((phase) => ({ consigne: consigneEtape(phase) })),
  };
}

const CONSIGNE_GLOBALE =
  "Lis sur le graphique le décalage vertical b, l'amplitude et la période T, puis détermine la pulsation ω, la fréquence, le décalage horizontal Φ (abscisse x₀ d'un passage de la courbe par sa ligne médiane en montant) et la phase φ (valeurs exactes, ou arrondies au centième).";

function enoncePapierParametresSinusoideGraphique(exercice: ExerciceParametresSinusoideGraphique): EnoncePapier {
  return {
    section: { enteteFragments: ENTETE, enteteHtml: construireGrapheParametresSinusoide(exercice), questions: [{ consigne: [texte(CONSIGNE_GLOBALE)] }] },
    etapesParQuestion: [ORDRE_PHASES_SINUSOIDE_GRAPHIQUE.map((phase) => LETTRE[phase])],
  };
}

function construireCorrectionParametresSinusoideGraphique(exercice: ExerciceParametresSinusoideGraphique): BlocCorrection[] {
  return ORDRE_PHASES_SINUSOIDE_GRAPHIQUE.map((champ) => ({ type: "paragraphe", fragments: [latex(formatChampParametreGraphiqueLatex(exercice, champ))] }));
}

function listeParametres(exercice: ExerciceParametresSinusoideGraphique): FragmentConsigne[] {
  return ORDRE_PHASES_SINUSOIDE_GRAPHIQUE.flatMap((champ, i) => [...(i === 0 ? [] : [texte(" ; ")]), latex(formatChampParametreGraphiqueLatex(exercice, champ))]);
}

/** b + s·|A| en valeur EXACTE (fraction réduite, ou « b + √r ») — ordonnée d'un maximum (s = 1) ou
 * d'un minimum (s = −1). */
function ordonneeSommetLatex(exercice: ExerciceParametresSinusoideGraphique, s: 1 | -1): string {
  const { A, b } = exercice;
  if (A.radicande !== null) {
    const racine = `\\sqrt{${A.radicande}}`;
    if (b === 0) return s > 0 ? racine : `-${racine}`;
    return `${b} ${s > 0 ? "+" : "-"} ${racine}`;
  }
  const { numerateur: n, denominateur: d } = A.rationnelle!;
  return formatRationnelPiLatex(reduireRationnelPi({ numerateur: b * d + s * n, denominateur: d, degrePi: 0 }));
}

function entreParentheses(valeurLatex: string): string {
  return valeurLatex.startsWith("-") ? `\\left(${valeurLatex}\\right)` : valeurLatex;
}

function correctionDetailleeParametresSinusoideGraphique(exercice: ExerciceParametresSinusoideGraphique): EtapeCorrection[] {
  const max = ordonneeSommetLatex(exercice, 1);
  const min = ordonneeSommetLatex(exercice, -1);
  const absA = formatMagnitudeAmplitudeLatex(exercice.A);
  const T = exercice.T;
  const TLatex = formatRationnelPiLatex(T);
  const x0 = phiRetenu(exercice);
  const x0Latex = formatRationnelPiLatex(x0);
  // Deux maximums consécutifs : un quart de période après le passage ascendant, puis une période plus loin.
  const xMax1 = additionnerRationnelPi(x0, diviserParEntier(T, 4));
  const xMax2 = additionnerRationnelPi(xMax1, T);
  const omega = multiplierRationnelPi({ numerateur: 2, denominateur: 1, degrePi: 1 }, inverseRationnelPi(T));
  const omegaLatex = formatRationnelPiLatex(omega);
  const phaseBrute = negatifRationnelPi(multiplierRationnelPi(omega, x0));
  const phaseLatex = formatRationnelPiLatex(phaseRetenue(exercice));
  const phaseBruteLatex = formatRationnelPiLatex(phaseBrute);
  const conclusion = (champ: PhaseParametresSinusoideGraphique): EtapeCorrection => ({ label: "Conclusion", sousQuestion: LETTRE[champ], fragments: [latex(formatChampParametreGraphiqueLatex(exercice, champ))] });
  return [
    { label: "Lecture", sousQuestion: "a", fragments: [texte("Maximum de la courbe : "), latex(`y = ${max}`), texte(" ; minimum : "), latex(`y = ${min}`), texte(".")] },
    { label: "Calcul", sousQuestion: "a", fragments: [latex(`b = \\dfrac{\\max + \\min}{2} = \\dfrac{${max} + ${entreParentheses(min)}}{2} = ${exercice.b}`)] },
    ...(exercice.b !== 0
      ? [{ label: "Piège", sousQuestion: "a", fragments: [texte("La ligne médiane de la courbe n'est pas l'axe des abscisses : b ≠ 0.")] }]
      : []),
    { label: "Calcul", sousQuestion: "b", fragments: [latex(`\\text{amplitude} = \\dfrac{\\max - \\min}{2} = \\dfrac{${max} - ${entreParentheses(min)}}{2} = ${absA}`)] },
    { label: "Piège", sousQuestion: "b", fragments: [texte("L'amplitude est la MOITIÉ de l'écart entre le maximum et le minimum, pas l'écart complet.")] },
    { label: "Lecture", sousQuestion: "c", fragments: [texte("Deux maximums consécutifs : "), latex(`x = ${formatRationnelPiLatex(xMax1)}`), texte(" et "), latex(`x = ${formatRationnelPiLatex(xMax2)}`), texte(".")] },
    { label: "Calcul", sousQuestion: "c", fragments: [latex(`T = ${formatRationnelPiLatex(xMax2)} - ${entreParentheses(formatRationnelPiLatex(xMax1))} = ${TLatex}`)] },
    { label: "Piège", sousQuestion: "c", fragments: [texte("Entre un maximum et le minimum voisin, il n'y a qu'une DEMI-période.")] },
    { label: "Calcul", sousQuestion: "d", fragments: [latex(`\\omega = \\dfrac{2\\pi}{T} = \\dfrac{2\\pi}{${TLatex}} = ${omegaLatex}`)] },
    { label: "Calcul", sousQuestion: "e", fragments: [latex(`f_{req} = \\dfrac{1}{T} = \\dfrac{1}{${TLatex}}`)] },
    { label: "Méthode", sousQuestion: "f", fragments: [texte("On repère un point où la courbe traverse sa ligne médiane EN MONTANT (juste après un minimum) : son abscisse est x₀ = Φ.")] },
    conclusion("phi"),
    { label: "Piège", sousQuestion: "f", fragments: [texte("Un passage en descendant est décalé d'une demi-période : il ne donne pas Φ.")] },
    { label: "Méthode", sousQuestion: "g", fragments: [texte("Formule du cours : "), latex("\\varphi = -\\omega\\cdot x_0"), texte(".")] },
    {
      label: "Calcul",
      sousQuestion: "g",
      fragments: [latex(`\\varphi = -${entreParentheses(omegaLatex)}\\cdot ${entreParentheses(x0Latex)} = ${phaseBruteLatex}`), ...(phaseBruteLatex === phaseLatex ? [] : [texte(", soit, à "), latex("2\\pi"), texte(" près, "), latex(`\\varphi = ${phaseLatex}`)])],
    },
  ];
}

/** Poids par étape (somme 4) : lire T et x₀ est le cœur de l'exercice. */
const POIDS: Record<PhaseParametresSinusoideGraphique, number> = { decalage: 0.5, amplitude: 0.5, periode: 0.75, pulsation: 0.5, frequence: 0.25, phi: 0.75, dephasage: 0.75 };

function baremeParametresSinusoideGraphique(exercice: ExerciceParametresSinusoideGraphique): BaremeExercice {
  const erreurs: ErreurFrequente[] = [
    { description: [texte("Amplitude prise égale à l'écart complet entre le maximum et le minimum")], cout: "0 pt sur b)" },
    { description: [texte("Période lue entre un maximum et le minimum voisin (demi-période)")], cout: "0 pt sur c), suite notée sans double pénalité" },
    { description: [texte("Φ lu sur un passage de la ligne médiane en descendant")], cout: "0 pt sur f), suite notée sans double pénalité" },
  ];
  if (exercice.b !== 0) erreurs.unshift({ description: [texte("Ligne médiane confondue avec l'axe des abscisses (b = 0)")], cout: "0 pt sur a)" });
  return {
    reponseFinale: listeParametres(exercice),
    criteres: ORDRE_PHASES_SINUSOIDE_GRAPHIQUE.map((champ) => ({ sousQuestion: LETTRE[champ], critere: [latex(formatChampParametreGraphiqueLatex(exercice, champ))], points: POIDS[champ] })),
    erreursFrequentes: erreurs,
    reponsesAcceptees: [
      [texte("Décalage horizontal à une période près : "), latex("\\Phi + kT")],
      [texte("Phase à "), latex("2\\pi"), texte(" près : "), latex("\\varphi + 2k\\pi")],
      [texte("Valeurs arrondies au centième")],
    ],
  };
}

/** ★★ : période multiple de π et amplitude rationnelle (lectures sur les graduations) ; ★★★ : période
 * sans π ou amplitude irrationnelle (lecture moins directe, x₀ fractionnaire). */
function difficulteParametresSinusoideGraphique(exercice: ExerciceParametresSinusoideGraphique): 1 | 2 | 3 {
  return exercice.T.degrePi === 0 || exercice.A.radicande !== null ? 3 : 2;
}

export const adaptateurEvaluationParametresSinusoideGraphique: AdaptateurFeuilleExercices<ExerciceParametresSinusoideGraphique> = {
  titreDocument: "Paramètres d'une fonction sinusoïdale (graphique) — Évaluation",
  nomFichierBase: "parametres-sinusoide-graphique",
  genererInstance: genererExerciceParametresSinusoideGraphique,
  construireEnonce: construireEnonceParametresSinusoideGraphique,
  construireCorrection: construireCorrectionParametresSinusoideGraphique,
  difficulte: difficulteParametresSinusoideGraphique,
  reponseBreve: listeParametres,
  correctionDetaillee: correctionDetailleeParametresSinusoideGraphique,
  bareme: baremeParametresSinusoideGraphique,
  enoncePapier: enoncePapierParametresSinusoideGraphique,
  dureeMinutes: 7,
};

import type {
  CinqNombres,
  ExerciceBoiteMoustaches,
  ExerciceBoiteMoustachesComparaison,
  ExerciceBoiteMoustachesConstruction,
  ExerciceBoiteMoustachesLecture,
  PlageAxe,
} from "../../core/boiteMoustaches.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { formatNombreGraphique } from "../../../export/svgGraph";
import {
  DEMI_HAUTEUR_BOITE,
  DEMI_HAUTEUR_MOUSTACHE,
  MANTISSES_GRILLE_BOITE,
  calculerViewBoxBoiteMoustaches,
  cibleNombreLignesXAdaptative,
  ratioGraphe,
  yLigne,
} from "../../ui/boiteMoustachesGraph";
import { LABEL_Q1, LABEL_Q2, LABEL_Q3, LABEL_X_MAX, LABEL_X_MIN, formatEnonceTexte, formatTermesCinqNombresLatex } from "../../ui/formatBoiteMoustaches";
import { calculerPasGrille, etendreLargeurXPourEtiquettes } from "../../ui/mafsTransformation";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceBoiteMoustaches } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceBoiteMoustaches>` pour gen36 (Boîte à moustaches,
 * `AppBoiteMoustaches.tsx`) — voir `generateurs/analyseFonction/exportWord.ts` pour le mécanisme
 * générique de référence, et `generateurs/caracteristiquesFonction/exportEvaluation.ts` pour le
 * précédent le plus proche d'un adaptateur pilotant un graphique statique (`enteteHtml`).
 *
 * **3 variantes, 3 formes papier très différentes** (`CATALOGUE_VARIANTES`, `generateurs/boiteMoustaches/index.ts`) :
 * - `construction` — l'écran interactif donne les 5 nombres et fait glisser 5 marqueurs sur un
 *   graphe Mafs vierge. Sur papier : les 5 nombres sont imprimés (texte + KaTeX, comme
 *   `formatTermesCinqNombresLatex`, déjà utilisé côté écran) au-dessus d'un axe gradué VIERGE (même
 *   viewBox que l'écran, mais sans aucune boîte tracée — juste une ligne de base à `y=0` comme repère
 *   horizontal) sur lequel l'élève dessine sa boîte à la main ; la correction montre la boîte
 *   attendue tracée, étiquetée des 5 valeurs.
 * - `lecture` — l'écran affiche une boîte déjà tracée (SANS aucune valeur visible) et fait saisir les
 *   5 nombres. Sur papier : la boîte est imprimée dans l'énoncé exactement de la même façon (aucune
 *   étiquette numérique — sans quoi l'exercice n'aurait plus de sens), la correction réimprime la
 *   MÊME boîte cette fois étiquetée des 5 valeurs (repère de correction direct, même principe que
 *   `caracteristiquesFonction/exportEvaluation.ts` qui réimprime son graphique en tête de correction).
 * - `comparaison` — l'écran affiche 2 boîtes (séries A/B, mêmes 2 questions catégorielles
 *   `comparaisonMedianes`/`comparaisonDispersions` toujours posées dans cet ordre, jamais une seule
 *   des deux — voir `AppBoiteMoustaches.tsx`). Sur papier : les 2 boîtes sur un seul graphique
 *   (étiquetées "A"/"B", sans valeur numérique dans l'énoncé — seul l'ordre relatif importe), 2
 *   questions papier consécutives reprenant ces 2 comparaisons ; la correction réimprime le
 *   graphique étiqueté des valeurs puis répond aux 2 questions en relisant directement
 *   `medianePlusGrande`/`ecartInterquartilePlusGrand` (déjà calculés et garantis univoques à la
 *   construction, voir `core/boiteMoustaches.types.ts`), jamais recalculés indépendamment ici.
 *
 * **Graphique** (`construireSvgBoiteMoustaches`) : AUCUN générateur existant ne trace de boîte à
 * moustaches en SVG statique — `export/svgGraph.ts::construireSvgFonction` est un moteur de tracé de
 * COURBE (échantillonnage d'une fonction réelle), inapplicable ici (une boîte à moustaches n'est pas
 * le graphe d'une fonction). Ce fichier écrit donc son propre petit moteur de tracé, mais **réutilise
 * la géométrie déjà pure et testée de `ui/boiteMoustachesGraph.ts`** (`calculerViewBoxBoiteMoustaches`,
 * `ratioGraphe`, `yLigne`, `DEMI_HAUTEUR_BOITE`, `DEMI_HAUTEUR_MOUSTACHE`, `MANTISSES_GRILLE_BOITE`,
 * `cibleNombreLignesXAdaptative`) et le calcul de pas de grille "nombre rond" déjà partagé par le
 * reste du projet (`ui/mafsTransformation.ts::calculerPasGrille`/`etendreLargeurXPourEtiquettes`) —
 * aucune de ces fonctions ne dépend de React/Mafs (pur calcul), seul `components/BoiteMoustachesGraph.tsx`
 * (non réutilisable ici, JSX Mafs) construit le rendu ÉCRAN à partir des mêmes briques. Le tracé
 * lui-même (moustaches, boîte, bords colorés Q1/médiane/Q3) recopie fidèlement le code couleur et la
 * disposition de `BoiteMoustachesGraph.tsx` (vert `#2f9e44`/violet `#7048e8`/bleu `#1971c2`/neutre
 * `#212529`) pour rester visuellement cohérent avec l'écran. Étiquette de série ("A"/"B") toujours
 * affichée à GAUCHE de la boîte (jamais au-dessus, comme à l'écran) : au-dessus aurait pu chevaucher
 * l'étiquette numérique de la médiane (`avecEtiquettes: true`, corrections uniquement) qui partage la
 * même abscisse — déplacer la lettre de série évite tout risque de collision sans complexifier le
 * calcul de position des 5 étiquettes numériques (qui reste, lui, identique à
 * `BoiteMoustachesGraph.tsx` : alternance haut/bas par index pour éviter que 2 marqueurs ADJACENTS,
 * parfois distants d'une seule unité de donnée, ne se chevauchent).
 *
 * `avecEtiquettes: true` (correction uniquement, jamais l'énoncé — cf. `lecture`/`construction`
 * ci-dessus) ajoute les 5 valeurs numériques à côté de chaque marqueur, en couleur assortie
 * (min/max neutres, Q1 vert, médiane violette, Q3 bleue) — jamais dans l'énoncé, où ces valeurs sont
 * précisément ce que l'élève doit deviner/tracer.
 *
 * **PAS `regroupable`** : `AdaptateurFeuilleExercices.regroupable` exige À LA FOIS une seule question
 * par instance ET une consigne GÉNÉRIQUE (indépendante des valeurs tirées) ET l'absence
 * d'`enteteHtml` (voir sa doc, `export/genererFeuilleExercices.ts`) — aucune des 3 variantes ne
 * remplit ces conditions : `construction`/`lecture` ont chacune un `enteteHtml` (le graphique, vierge
 * ou tracé), et `comparaison` a EN PLUS 2 questions par instance. Contrairement à
 * `tableauFrequences/exportEvaluation.ts` (seul précédent `regroupable: true` du projet), aucune des
 * 3 formes papier de ce générateur n'est un simple texte + une consigne fixe.
 *
 * Correction toujours RESYNTHÉTISÉE depuis les champs déjà connus de l'instance
 * (`exercice.valeurs`/`serieA`/`serieB`/`medianePlusGrande`/`ecartInterquartilePlusGrand`), jamais
 * recalculée indépendamment — même principe que tous les autres adaptateurs du projet.
 */

// ============================================================================
// Moteur de tracé SVG statique — boîte à moustaches (aucun équivalent existant, voir
// commentaire de tête).
// ============================================================================

const LARGEUR_SVG = 360;
const MARGE_SVG = 10;
const COULEUR_GRILLE = "#d8dee6";
const COULEUR_AXE = "#495057";
const COULEUR_Q1 = "#2f9e44";
const COULEUR_MEDIANE = "#7048e8";
const COULEUR_Q3 = "#1971c2";
const COULEUR_NEUTRE = "#212529";
const EPAISSEUR_STANDARD = 1.4;
const EPAISSEUR_ACCENTUEE = 2.4;

const CLES_ORDRE: (keyof CinqNombres)[] = ["min", "q1", "mediane", "q3", "max"];
const COULEUR_PAR_CLE: Record<keyof CinqNombres, string> = {
  min: COULEUR_NEUTRE,
  q1: COULEUR_Q1,
  mediane: COULEUR_MEDIANE,
  q3: COULEUR_Q3,
  max: COULEUR_NEUTRE,
};

function formatNombre(valeur: number): string {
  return Number.isInteger(valeur) ? String(valeur) : valeur.toFixed(2).replace(/\.?0+$/, "");
}

function echapperTexteSvg(valeur: string): string {
  return valeur.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function ligneSvg(x1: number, y1: number, x2: number, y2: number, couleur: string, epaisseur: number): string {
  return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${couleur}" stroke-width="${epaisseur}"/>`;
}

function texteSvg(x: number, y: number, couleur: string, contenu: string, ancre: "middle" | "end", taille = 9, gras = false): string {
  return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${taille}"${gras ? ' font-weight="bold"' : ""} text-anchor="${ancre}" fill="${couleur}">${echapperTexteSvg(contenu)}</text>`;
}

export interface LigneBoiteEvaluation {
  valeurs: CinqNombres;
  /** "A"/"B" — variante `comparaison` uniquement, affiché à GAUCHE de la boîte (voir commentaire de
   * tête de fichier : jamais au-dessus, pour ne jamais chevaucher l'étiquette numérique de la
   * médiane en mode `avecEtiquettes`). */
  label?: string;
}

/** Une boîte tracée pour une `ligne` donnée (`index`/`nombreLignes` — voir `yLigne`,
 * `ui/boiteMoustachesGraph.ts`) : 2 moustaches + leurs chapeaux + le contour (haut/bas neutres,
 * bord gauche Q1 vert, bord droit Q3 bleu, médiane violette) — même disposition que
 * `components/BoiteMoustachesGraph.tsx`. `avecEtiquettes` ajoute les 5 valeurs numériques en
 * couleur assortie, alternées haut/bas par index (même principe que l'écran : 2 marqueurs ADJACENTS
 * peuvent être aussi rapprochés qu'1 unité de donnée).
 */
function construireUneBoiteSvg(
  ligne: LigneBoiteEvaluation,
  index: number,
  nombreLignes: 1 | 2,
  sx: (x: number) => number,
  sy: (y: number) => number,
  avecEtiquettes: boolean,
): string {
  const y = yLigne(index, nombreLignes);
  const { min, q1, mediane, q3, max } = ligne.valeurs;
  const py = sy(y);
  const yHaut = sy(y + DEMI_HAUTEUR_BOITE);
  const yBas = sy(y - DEMI_HAUTEUR_BOITE);
  const morceaux: string[] = [];

  // Moustaches + chapeaux — toujours neutres.
  morceaux.push(ligneSvg(sx(min), py, sx(q1), py, COULEUR_NEUTRE, EPAISSEUR_STANDARD));
  morceaux.push(ligneSvg(sx(q3), py, sx(max), py, COULEUR_NEUTRE, EPAISSEUR_STANDARD));
  morceaux.push(ligneSvg(sx(min), sy(y - DEMI_HAUTEUR_MOUSTACHE), sx(min), sy(y + DEMI_HAUTEUR_MOUSTACHE), COULEUR_NEUTRE, EPAISSEUR_STANDARD));
  morceaux.push(ligneSvg(sx(max), sy(y - DEMI_HAUTEUR_MOUSTACHE), sx(max), sy(y + DEMI_HAUTEUR_MOUSTACHE), COULEUR_NEUTRE, EPAISSEUR_STANDARD));

  // Contour de la boîte — haut/bas neutres, bord gauche (Q1) vert, bord droit (Q3) bleu.
  morceaux.push(ligneSvg(sx(q1), yHaut, sx(q3), yHaut, COULEUR_NEUTRE, EPAISSEUR_STANDARD));
  morceaux.push(ligneSvg(sx(q1), yBas, sx(q3), yBas, COULEUR_NEUTRE, EPAISSEUR_STANDARD));
  morceaux.push(ligneSvg(sx(q1), yBas, sx(q1), yHaut, COULEUR_Q1, EPAISSEUR_ACCENTUEE));
  morceaux.push(ligneSvg(sx(q3), yBas, sx(q3), yHaut, COULEUR_Q3, EPAISSEUR_ACCENTUEE));

  // Médiane — trait violet, plus épais que le reste du contour.
  morceaux.push(ligneSvg(sx(mediane), yBas, sx(mediane), yHaut, COULEUR_MEDIANE, EPAISSEUR_ACCENTUEE));

  if (ligne.label) {
    morceaux.push(texteSvg(sx(min) - 8, py + 4, COULEUR_NEUTRE, ligne.label, "end", 12, true));
  }

  if (avecEtiquettes) {
    const xParCle: Record<keyof CinqNombres, number> = { min, q1, mediane, q3, max };
    CLES_ORDRE.forEach((cle, i) => {
      const enHaut = i % 2 === 0;
      const yEtiquette = enHaut ? yHaut - 6 : yBas + 14;
      morceaux.push(texteSvg(sx(xParCle[cle]), yEtiquette, COULEUR_PAR_CLE[cle], formatNombre(xParCle[cle]), "middle"));
    });
  }

  return morceaux.join("");
}

/**
 * `<svg>` autonome d'une boîte à moustaches (1 ou 2 lignes selon `lignes.length`) — `lignes: []`
 * (variante `construction`, énoncé) rend un axe gradué VIERGE avec une simple ligne de base à `y=0`
 * comme repère horizontal, sans aucune boîte tracée (voir commentaire de tête de fichier).
 */
function construireSvgBoiteMoustaches(bornePlage: PlageAxe, lignes: LigneBoiteEvaluation[], avecEtiquettes = false): string {
  const nombreLignes: 1 | 2 = lignes.length === 2 ? 2 : 1;
  const ratio = ratioGraphe(nombreLignes);
  const largeur = LARGEUR_SVG;
  const hauteur = Math.round(largeur / ratio);

  const viewBox = calculerViewBoxBoiteMoustaches(bornePlage, nombreLignes);
  const cibleNombreLignesX = cibleNombreLignesXAdaptative(bornePlage);
  const viewBoxEtendu = etendreLargeurXPourEtiquettes(viewBox, cibleNombreLignesX, ratio, MANTISSES_GRILLE_BOITE);
  const [xMin, xMax] = viewBoxEtendu.x;
  const [yMin, yMax] = viewBoxEtendu.y;

  const zoneX = largeur - 2 * MARGE_SVG;
  const zoneY = hauteur - 2 * MARGE_SVG;
  const sx = (x: number) => MARGE_SVG + ((x - xMin) / (xMax - xMin)) * zoneX;
  const sy = (y: number) => MARGE_SVG + ((yMax - y) / (yMax - yMin)) * zoneY;

  const pasX = calculerPasGrille(xMax - xMin, cibleNombreLignesX, MANTISSES_GRILLE_BOITE);
  const grille: string[] = [];
  for (let v = Math.ceil(xMin / pasX) * pasX; v <= xMax + 1e-9; v += pasX) {
    const px = sx(v);
    grille.push(`<line x1="${px.toFixed(1)}" y1="${MARGE_SVG}" x2="${px.toFixed(1)}" y2="${hauteur - MARGE_SVG}" stroke="${COULEUR_GRILLE}" stroke-width="1"/>`);
    grille.push(texteSvg(px, hauteur - MARGE_SVG + 11, COULEUR_AXE, formatNombreGraphique(v), "middle", 8));
  }

  const cadre = `<rect x="0.5" y="0.5" width="${largeur - 1}" height="${hauteur - 1}" fill="none" stroke="#adb5bd" stroke-width="1"/>`;

  let contenu: string;
  if (lignes.length === 0) {
    // Axe vierge (variante "construction", énoncé) — simple ligne de base à y=0, aucune boîte.
    const py0 = sy(yLigne(0, 1));
    contenu = ligneSvg(sx(xMin), py0, sx(xMax), py0, COULEUR_AXE, EPAISSEUR_STANDARD);
  } else {
    contenu = lignes.map((ligne, index) => construireUneBoiteSvg(ligne, index, nombreLignes, sx, sy, avecEtiquettes)).join("");
  }

  return `<svg class="graphe-cyclo" width="${largeur}" height="${hauteur}" viewBox="0 0 ${largeur} ${hauteur}" xmlns="http://www.w3.org/2000/svg">
<rect x="0" y="0" width="${largeur}" height="${hauteur}" fill="#ffffff"/>
${grille.join("")}
${contenu}
${cadre}
</svg>`;
}

// ============================================================================
// Variante "construction".
// ============================================================================

function construireEnonceConstruction(exercice: ExerciceBoiteMoustachesConstruction): SectionExercice {
  const valeursLatex = formatTermesCinqNombresLatex(exercice.valeurs).join(",\\ ");
  return {
    enteteFragments: [texte(formatEnonceTexte(exercice)), texte(" Voici les 5 valeurs qui la caractérisent : "), latex(valeursLatex), texte(".")],
    enteteHtml: construireSvgBoiteMoustaches(exercice.bornePlage, []),
    questions: [
      {
        consigne: [
          texte(`Trace la boîte à moustaches correspondante sur l'axe gradué ci-dessus (en ${exercice.contexte.unite}).`),
        ],
      },
    ],
  };
}

function construireCorrectionConstruction(exercice: ExerciceBoiteMoustachesConstruction): BlocCorrection[] {
  const valeursLatex = formatTermesCinqNombresLatex(exercice.valeurs).join(",\\ ");
  return [
    { type: "html", html: construireSvgBoiteMoustaches(exercice.bornePlage, [{ valeurs: exercice.valeurs }], true) },
    { type: "paragraphe", fragments: [texte("Boîte à moustaches attendue : "), latex(valeursLatex), texte(".")] },
  ];
}

// ============================================================================
// Variante "lecture".
// ============================================================================

function construireEnonceLecture(exercice: ExerciceBoiteMoustachesLecture): SectionExercice {
  return {
    enteteFragments: [texte(formatEnonceTexte(exercice)), texte(" La boîte à moustaches ci-dessous représente cette série.")],
    enteteHtml: construireSvgBoiteMoustaches(exercice.bornePlage, [{ valeurs: exercice.valeurs }]),
    questions: [
      {
        consigne: [
          texte("Relève les 5 valeurs ("),
          latex(LABEL_X_MIN),
          texte(", "),
          latex(LABEL_Q1),
          texte(" médiane ("),
          latex(LABEL_Q2),
          texte("), "),
          latex(LABEL_Q3),
          texte(", "),
          latex(LABEL_X_MAX),
          texte(`) de cette boîte à moustaches (en ${exercice.contexte.unite}).`),
        ],
        reponse: { type: "lignes", nombre: 2 },
      },
    ],
  };
}

function construireCorrectionLecture(exercice: ExerciceBoiteMoustachesLecture): BlocCorrection[] {
  const valeursLatex = formatTermesCinqNombresLatex(exercice.valeurs).join(",\\ ");
  return [
    { type: "html", html: construireSvgBoiteMoustaches(exercice.bornePlage, [{ valeurs: exercice.valeurs }], true) },
    { type: "paragraphe", fragments: [texte("Valeurs attendues : "), latex(valeursLatex), texte(".")] },
  ];
}

// ============================================================================
// Variante "comparaison".
// ============================================================================

function construireLignesComparaison(exercice: ExerciceBoiteMoustachesComparaison): LigneBoiteEvaluation[] {
  return [
    { valeurs: exercice.serieA, label: "A" },
    { valeurs: exercice.serieB, label: "B" },
  ];
}

function construireEnonceComparaison(exercice: ExerciceBoiteMoustachesComparaison): SectionExercice {
  return {
    enteteFragments: [texte(formatEnonceTexte(exercice)), texte(" Le graphique ci-dessous représente les boîtes à moustaches des 2 séries.")],
    enteteHtml: construireSvgBoiteMoustaches(exercice.bornePlage, construireLignesComparaison(exercice)),
    questions: [
      { consigne: [texte("Laquelle des deux séries (A ou B) a la plus grande médiane ("), latex(LABEL_Q2), texte(") ?")], reponse: { type: "lignes", nombre: 1 } },
      {
        consigne: [
          texte("Laquelle des deux séries (A ou B) est la plus dispersée (le plus grand écart interquartile, "),
          latex(`${LABEL_Q3}-${LABEL_Q1}`),
          texte(") ?"),
        ],
        reponse: { type: "lignes", nombre: 1 },
      },
    ],
  };
}

function construireCorrectionComparaison(exercice: ExerciceBoiteMoustachesComparaison): BlocCorrection[] {
  return [
    { type: "html", html: construireSvgBoiteMoustaches(exercice.bornePlage, construireLignesComparaison(exercice), true) },
    {
      type: "paragraphe",
      fragments: [texte("a) La série "), texte(exercice.medianePlusGrande), texte(" a la plus grande médiane ("), latex(LABEL_Q2), texte(").")],
    },
    {
      type: "paragraphe",
      fragments: [
        texte("b) La série "),
        texte(exercice.ecartInterquartilePlusGrand),
        texte(" a le plus grand écart interquartile ("),
        latex(`${LABEL_Q3}-${LABEL_Q1}`),
        texte(").")
      ],
    },
  ];
}

// ============================================================================
// Adaptateur.
// ============================================================================

function construireEnonceBoiteMoustaches(exercice: ExerciceBoiteMoustaches): SectionExercice {
  if (exercice.variante === "construction") return construireEnonceConstruction(exercice);
  if (exercice.variante === "lecture") return construireEnonceLecture(exercice);
  return construireEnonceComparaison(exercice);
}

function construireCorrectionBoiteMoustaches(exercice: ExerciceBoiteMoustaches): BlocCorrection[] {
  if (exercice.variante === "construction") return construireCorrectionConstruction(exercice);
  if (exercice.variante === "lecture") return construireCorrectionLecture(exercice);
  return construireCorrectionComparaison(exercice);
}

export const adaptateurEvaluationBoiteMoustaches: AdaptateurFeuilleExercices<ExerciceBoiteMoustaches> = {
  titreDocument: "Boîte à moustaches — Évaluation",
  nomFichierBase: "boite-moustaches",
  genererInstance: genererExerciceBoiteMoustaches,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceBoiteMoustaches,
  construireCorrection: construireCorrectionBoiteMoustaches,
  // PAS regroupable : chaque variante a un enteteHtml (graphique), et "comparaison" a en plus 2
  // questions par instance — voir le commentaire de tête de fichier.
};

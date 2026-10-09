import type { ExerciceEquationParabole } from "../../core/equationParabole.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { formatNombreGraphique } from "../../../export/svgGraph";
import { directriceEquationParabole, viewBoxEquationParabole } from "../../ui/equationParaboleGraph";
import { CONSIGNE_EQUATION, CONSIGNE_SOMMET_FOYER, formatEquationAttendueLatex, formatFoyerLatex, formatSommetLatex } from "../../ui/formatEquationParabole";
import { calculerPasGrille, RATIO_GRAPHE } from "../../ui/mafsTransformation";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEquationParabole } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceEquationParabole>` pour **gen51** (Équation d'une
 * parabole depuis un graphe, `AppEquationParabole.tsx`) — voir `generateurs/analyseFonction/exportWord.ts`
 * pour le mécanisme générique de référence.
 *
 * Chapitre Math-Belgium "Géométrie analytique plane" (4e), section "Équation de la parabole (forme
 * graphique)" (`parabole`) : cette section est servie par TROIS générateurs, gen51 (ce fichier),
 * gen52 (`equationParaboleDeveloppee`) et gen53 (`constructionParabole`), chacun porté séparément —
 * ce fichier ne couvre que gen51.
 *
 * **2 variantes MÉLANGÉES** (`CATALOGUE_VARIANTES`, `"vertical"`/`"horizontal"` — voir
 * `core/equationParabole.types.ts`) : axe vertical, directrice horizontale, `(x-x_S)^2=2p(y-y_S)` ;
 * axe horizontal, directrice verticale, `(y-y_S)^2=2p(x-x_S)`. Jamais 4 variantes séparées pour les
 * 4 sens d'ouverture (haut/bas/gauche/droite) : le sens d'ouverture est encodé par le SIGNE de `p`
 * à l'intérieur de chacune des 2 orientations, jamais par une variante distincte (voir le
 * commentaire de tête de `generateurs/equationParabole/index.ts`).
 *
 * **Écran → questions** : `AppEquationParabole.tsx`/`moteur/sessionEquationParabole.ts` enchaînent 2
 * phases FIXES, toujours dans le même ordre, sur LE MÊME graphe — `"sommetFoyer"`
 * (`EtapeSommetFoyerEquationParabole.tsx` : lire S et F sur le graphe, 4 champs numériques) →
 * `"equation"` (`EtapeEquationEquationParabole.tsx` : écrire l'équation de la parabole, texte
 * libre). Reproduit ici par UNE figure (`enteteHtml`, affichée une seule fois en tête, même
 * principe que `comparaisonVecteurs/exportEvaluation.ts`/`caracteristiquesFonction/exportEvaluation.ts`)
 * suivie de 2 questions a)/b) dans le même ordre, jamais recombinées : a) reprend `CONSIGNE_SOMMET_FOYER`
 * (`ui/formatEquationParabole.ts`, déjà la consigne exacte affichée à l'écran), b) reprend
 * `CONSIGNE_EQUATION` (même source) — aucune reformulation locale.
 *
 * **Graphique papier NÉCESSAIRE — GÉNÉRATEUR GRAPHIQUE** : l'exercice EST la lecture d'un graphe
 * (`EquationParaboleGraph.tsx`, Mafs) : sans le tracé de la parabole, sa directrice et son foyer
 * marqué, aucune des 2 questions n'a de sens (l'élève DOIT lire S et F sur la figure, jamais des
 * valeurs numériques déjà données en texte). `construireSvgParabole` (ce fichier) est un second
 * moteur de tracé SVG statique, écrit ici plutôt que réutilisé tel quel : `export/svgGraph.ts::
 * construireSvgFonction` ne trace qu'une courbe `y=f(x)` (`Plot.OfX`), incapable de représenter la
 * variante `"horizontal"` de ce générateur (`x=f(y)`, `Plot.OfY` côté écran — une parabole couchée
 * n'est mathématiquement PAS une fonction de x). `construireSvgParabole` échantillonne donc soit en
 * x (vertical) soit en y (horizontal) selon `exercice.variante`, exactement comme
 * `EquationParaboleGraph.tsx` choisit entre `Plot.OfX`/`Plot.OfY`. Réutilise en revanche telle
 * quelle toute la géométrie déjà pure et partagée de `ui/equationParaboleGraph.ts`
 * (`viewBoxEquationParabole`/`directriceEquationParabole`, la MÊME source que l'écran interactif —
 * jamais un cadrage recalculé indépendamment) et `formatNombreGraphique` (`export/svgGraph.ts`,
 * déjà le formateur numérique générique des graphiques imprimés). Seule la rastérisation en
 * primitives `<svg>` (grille "nombre rond" + axes gradués — contrairement à
 * `comparaisonVecteurs/exportEvaluation.ts`, qui masque axes/graduations parce que seules
 * longueur/direction/sens comptent, ICI l'élève doit au contraire pouvoir LIRE des coordonnées
 * entières exactes sur le quadrillage, donc les 2 axes ET leurs graduations numériques restent
 * affichés, même choix que `export/svgGraph.ts::construireSvgFonction`) est écrite ici, jamais dans
 * `ui/`. Couleurs et conventions de tracé dupliquées à l'identique de `EquationParaboleGraph.tsx`
 * (jamais réimportées, ce composant est un `.tsx` hors du périmètre `ui/`/`moteur/`/`generateurs/xxx/index.ts`
 * des adaptateurs `exportEvaluation.ts`, même règle que documentée par
 * `comparaisonVecteurs/exportEvaluation.ts`) : courbe et sommet en bleu (`#1971c2`), foyer (croix
 * ×) ET directrice dans la MÊME couleur orange (`#f08c00`) — le sommet S n'est PAS marqué sur la
 * figure de l'énoncé (donnée à trouver visuellement, "le point le plus resserré de la courbe",
 * exactement l'état par défaut `afficherSommet=false` de l'écran interactif), mais IL L'EST sur la
 * figure de correction (`avecCorrection=true` — mêmes state que l'aide de niveau 2 à l'écran),
 * accompagnée des étiquettes texte "S(...)"/"F(...)" — un repère visuel direct, jamais seulement
 * textuel, pour un exercice dont la question EST visuelle (même principe que
 * `comparaisonVecteurs/exportEvaluation.ts`/`boiteMoustaches/exportEvaluation.ts::avecEtiquettes` :
 * réimprimer le graphique en tête de correction, sommet/foyer mis en évidence, plutôt que décrire la
 * réponse en texte seul).
 *
 * **PAS `regroupable`**, pour 2 raisons indépendantes, chacune déjà suffisante à elle seule (voir la
 * doc de `AdaptateurFeuilleExercices.regroupable`, `genererFeuilleExercices.ts`) : (1) 2 questions
 * par instance, jamais 1 seule (peu importe que `CONSIGNE_SOMMET_FOYER`/`CONSIGNE_EQUATION` soient
 * chacune, prises isolément, des consignes GÉNÉRIQUES indépendantes de l'instance — la condition (1)
 * du mécanisme, "toujours UNE seule question par instance", n'est de toute façon pas remplie) ; (2)
 * `construireEnonceEquationParabole` utilise `enteteHtml` (le graphe), condition à elle seule déjà
 * exclusive quel que soit le nombre de questions.
 *
 * **Correction RESYNTHÉTISÉE** depuis les valeurs déjà connues et garanties correctes de l'instance
 * tirée (`sommet`/`foyer`/`p`, tous entiers par construction — voir `generateurs/equationParabole/index.ts`),
 * jamais recalculée indépendamment. Réutilise directement `formatSommetLatex`/`formatFoyerLatex`/
 * `formatEquationAttendueLatex` (`ui/formatEquationParabole.ts`) — les MÊMES formateurs déjà
 * utilisés côté écran par `ResultatPanelEquationParabole.tsx` pour annoncer "Sommet attendu :
 * .../Foyer attendu : ..." et l'équation de référence — jamais une formule reconstruite localement.
 * `p` n'a pas de texte d'aide à concaténer à proprement parler (`TEXTE_AIDE_SOMMET_FOYER_NIVEAU1`/
 * `TEXTE_AIDE_SOMMET_FOYER_NIVEAU2`/`segmentsAideEquationNiveau1` sont purement méthodologiques,
 * jamais une révélation de valeur, hormis `formatAideEquationNiveau2Latex` qui révèle juste `p`) : la
 * correction ci-dessous est donc un texte de résolution nouveau (lecture de S/F, puis calcul de `p`,
 * puis substitution dans la forme générale), jamais une transcription d'aide.
 *
 * **Aucune zone de réponse vierge** (`reponse: { type: "lignes", nombre: 0 }` sur les 2 questions) —
 * même décision documentée par `generateurs/comparaisonVecteurs/exportEvaluation.ts`/`generateurs/
 * pointVectoriel/exportEvaluation.ts` : l'élève répond sur une feuille à part, jamais sur la copie
 * imprimée elle-même.
 */

// --- Rendu SVG imprimé du graphe (voir le commentaire de tête ci-dessus) ---

const LARGEUR_SVG = 300;
const MARGE_SVG = 16;
const COULEUR_COURBE = "#1971c2";
const COULEUR_FOYER = "#f08c00";
const COULEUR_GRILLE = "#d8dee6";
const COULEUR_AXE = "#495057";
const NB_POINTS_COURBE = 120;

function formatNombre(valeur: number): string {
  return Number.isInteger(valeur) ? String(valeur) : valeur.toFixed(2).replace(/\.?0+$/, "");
}

/** Points `(x,y)` de la courbe, échantillonnés en x (vertical, `y=f(x)`) ou en y (horizontal,
 * `x=f(y)`) sur toute l'étendue du viewBox — même choix de domaine que `Plot.OfX`/`Plot.OfY` côté
 * écran (`EquationParaboleGraph.tsx`), une parabole du 2nd degré n'a par construction aucune
 * discontinuité à gérer (contrairement à `export/svgGraph.ts::echantillonnerSegments`, prévu pour
 * une fonction quelconque avec asymptotes). */
function pointsCourbeParabole(exercice: ExerciceEquationParabole, xMin: number, xMax: number, yMin: number, yMax: number): [number, number][] {
  const { sommet, p, variante } = exercice;
  const points: [number, number][] = [];
  for (let i = 0; i <= NB_POINTS_COURBE; i++) {
    if (variante === "vertical") {
      const x = xMin + ((xMax - xMin) * i) / NB_POINTS_COURBE;
      const y = sommet.y + ((x - sommet.x) * (x - sommet.x)) / (2 * p);
      points.push([x, y]);
    } else {
      const y = yMin + ((yMax - yMin) * i) / NB_POINTS_COURBE;
      const x = sommet.x + ((y - sommet.y) * (y - sommet.y)) / (2 * p);
      points.push([x, y]);
    }
  }
  return points;
}

/**
 * `<svg>` autonome du graphe — courbe (bleu), directrice ET croix du foyer (orange, même couleur
 * que l'écran), quadrillage "nombre rond" avec graduations numériques sur les 2 axes (l'élève doit
 * pouvoir lire des coordonnées entières exactes, contrairement à `comparaisonVecteurs/exportEvaluation.ts`
 * qui masque axes/graduations). `avecCorrection=false` (énoncé) reproduit exactement l'état par
 * défaut de l'écran interactif (`afficherSommet=false` — S n'est PAS marqué, à trouver
 * visuellement) ; `avecCorrection=true` ajoute le sommet S (point bleu) et les étiquettes texte
 * "S(...)"/"F(...)" — même fonction pour les deux, seul l'argument change, jamais deux moteurs de
 * tracé distincts (même principe que `comparaisonVecteurs/exportEvaluation.ts::construireSvgComparaison`).
 */
function construireSvgParabole(exercice: ExerciceEquationParabole, avecCorrection: boolean): string {
  const { sommet, foyer, variante } = exercice;
  const viewBox = viewBoxEquationParabole(exercice);
  const [xMin, xMax] = viewBox.x;
  const [yMin, yMax] = viewBox.y;
  const largeur = LARGEUR_SVG;
  const hauteur = Math.round(largeur / RATIO_GRAPHE);
  const zoneX = largeur - 2 * MARGE_SVG;
  const zoneY = hauteur - 2 * MARGE_SVG;
  const sx = (x: number) => MARGE_SVG + ((x - xMin) / (xMax - xMin)) * zoneX;
  const sy = (y: number) => MARGE_SVG + ((yMax - y) / (yMax - yMin)) * zoneY;

  const pasX = calculerPasGrille(xMax - xMin);
  const pasY = calculerPasGrille(yMax - yMin);
  const grille: string[] = [];
  const labelsX: string[] = [];
  const labelsY: string[] = [];
  for (let v = Math.ceil(xMin / pasX) * pasX; v <= xMax + 1e-9; v += pasX) {
    const px = sx(v);
    grille.push(`<line x1="${px.toFixed(1)}" y1="${MARGE_SVG}" x2="${px.toFixed(1)}" y2="${(hauteur - MARGE_SVG).toFixed(1)}" stroke="${COULEUR_GRILLE}" stroke-width="1"/>`);
    if (Math.abs(v) > 1e-9) {
      labelsX.push(`<text x="${px.toFixed(1)}" y="${(sy(0) + 11).toFixed(1)}" font-size="8" text-anchor="middle" fill="${COULEUR_AXE}">${formatNombreGraphique(v)}</text>`);
    }
  }
  for (let v = Math.ceil(yMin / pasY) * pasY; v <= yMax + 1e-9; v += pasY) {
    const py = sy(v);
    grille.push(`<line x1="${MARGE_SVG}" y1="${py.toFixed(1)}" x2="${(largeur - MARGE_SVG).toFixed(1)}" y2="${py.toFixed(1)}" stroke="${COULEUR_GRILLE}" stroke-width="1"/>`);
    if (Math.abs(v) > 1e-9) {
      labelsY.push(`<text x="${(sx(0) - 4).toFixed(1)}" y="${(py + 3).toFixed(1)}" font-size="8" text-anchor="end" fill="${COULEUR_AXE}">${formatNombreGraphique(v)}</text>`);
    }
  }
  const axeX = `<line x1="${MARGE_SVG}" y1="${sy(0).toFixed(1)}" x2="${(largeur - MARGE_SVG).toFixed(1)}" y2="${sy(0).toFixed(1)}" stroke="${COULEUR_AXE}" stroke-width="1.4"/>`;
  const axeY = `<line x1="${sx(0).toFixed(1)}" y1="${MARGE_SVG}" x2="${sx(0).toFixed(1)}" y2="${(hauteur - MARGE_SVG).toFixed(1)}" stroke="${COULEUR_AXE}" stroke-width="1.4"/>`;

  const pts = pointsCourbeParabole(exercice, xMin, xMax, yMin, yMax);
  const chemin = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${sx(x).toFixed(1)},${sy(y).toFixed(1)}`).join(" ");
  const courbe = `<path d="${chemin}" fill="none" stroke="${COULEUR_COURBE}" stroke-width="2.2" stroke-linecap="round"/>`;

  const directrice = directriceEquationParabole(exercice);
  const ligneDirectrice =
    variante === "vertical"
      ? `<line x1="${MARGE_SVG}" y1="${sy(directrice).toFixed(1)}" x2="${(largeur - MARGE_SVG).toFixed(1)}" y2="${sy(directrice).toFixed(1)}" stroke="${COULEUR_FOYER}" stroke-width="1.6"/>`
      : `<line x1="${sx(directrice).toFixed(1)}" y1="${MARGE_SVG}" x2="${sx(directrice).toFixed(1)}" y2="${(hauteur - MARGE_SVG).toFixed(1)}" stroke="${COULEUR_FOYER}" stroke-width="1.6"/>`;

  const cxF = sx(foyer.x);
  const cyF = sy(foyer.y);
  const croixFoyer = `<text x="${cxF.toFixed(1)}" y="${(cyF + 4).toFixed(1)}" font-size="14" font-weight="bold" text-anchor="middle" fill="${COULEUR_FOYER}">×</text>`;

  const reperesCorrection = avecCorrection
    ? `<circle cx="${sx(sommet.x).toFixed(1)}" cy="${sy(sommet.y).toFixed(1)}" r="3" fill="${COULEUR_COURBE}"/>` +
      `<text x="${sx(sommet.x).toFixed(1)}" y="${(sy(sommet.y) - 8).toFixed(1)}" font-size="10" text-anchor="middle" fill="${COULEUR_COURBE}">S(${formatNombre(sommet.x)} ; ${formatNombre(sommet.y)})</text>` +
      `<text x="${(cxF + 8).toFixed(1)}" y="${(cyF - 6).toFixed(1)}" font-size="10" text-anchor="start" fill="${COULEUR_FOYER}">F(${formatNombre(foyer.x)} ; ${formatNombre(foyer.y)})</text>`
    : "";

  const svg = `<svg width="${largeur}" height="${hauteur}" viewBox="0 0 ${largeur} ${hauteur}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Graphe de la parabole">
<rect x="0" y="0" width="${largeur}" height="${hauteur}" fill="#ffffff"/>
${grille.join("")}
${axeX}${axeY}
${ligneDirectrice}
${courbe}
${labelsX.join("")}${labelsY.join("")}
${croixFoyer}
${reperesCorrection}
</svg>`;

  // `page-break-inside`/`break-inside` évitent qu'une impression coupe la figure entre deux pages —
  // même précaution que `comparaisonVecteurs/exportEvaluation.ts`/`triangleQuelconque/exportEvaluation.ts`.
  return `<div style="text-align:center;margin:0.6em 0;page-break-inside:avoid;break-inside:avoid;">${svg}</div>`;
}

// --- Énoncé / correction ---

function construireEnonceEquationParabole(instance: ExerciceEquationParabole): SectionExercice {
  return {
    enteteHtml: construireSvgParabole(instance, false),
    questions: [
      { consigne: [texte(CONSIGNE_SOMMET_FOYER)], reponse: { type: "lignes", nombre: 0 } },
      { consigne: [texte(CONSIGNE_EQUATION)], reponse: { type: "lignes", nombre: 0 } },
    ],
  };
}

function construireCorrectionEquationParabole(instance: ExerciceEquationParabole): BlocCorrection[] {
  const { sommet, foyer, p } = instance;

  return [
    { type: "html", html: construireSvgParabole(instance, true) },
    {
      type: "paragraphe",
      fragments: [
        texte("a) Sommet attendu : "),
        latex(formatSommetLatex(sommet)),
        texte(" — Foyer attendu : "),
        latex(formatFoyerLatex(foyer)),
        texte(" (repérés ci-dessus sur le graphe)."),
      ],
    },
    {
      type: "paragraphe",
      fragments: [
        texte("b) "),
        latex(`p = ${p}`),
        texte(" (distance signée entre la directrice et le foyer, dans le sens de l'axe de la parabole), donc l'équation de la parabole est "),
        latex(formatEquationAttendueLatex(instance)),
        texte("."),
      ],
    },
  ];
}

export const adaptateurEvaluationEquationParabole: AdaptateurFeuilleExercices<ExerciceEquationParabole> = {
  titreDocument: "Équation d'une parabole depuis un graphe — Évaluation",
  nomFichierBase: "equation-parabole-graphique",
  genererInstance: genererExerciceEquationParabole,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceEquationParabole,
  construireCorrection: construireCorrectionEquationParabole,
  // 2 questions par instance ET `enteteHtml` (le graphe) : 2 raisons indépendantes déjà suffisantes
  // chacune pour exclure `regroupable` — voir le commentaire de tête de fichier.
};

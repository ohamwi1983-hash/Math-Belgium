import type { ExerciceEquationParabole } from "../../core/equationParabole.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, EnoncePapier, ErreurFrequente, EtapeCorrection, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { formatNombreGraphique } from "../../../export/svgGraph";
import { PAS_GRILLE_EQUATION_PARABOLE, directriceEquationParabole, viewBoxEquationParabole } from "../../ui/equationParaboleGraph";
import { CONSIGNE_EQUATION, CONSIGNE_SOMMET_FOYER, formatAideEquationNiveau2Latex, formatEquationAttendueLatex, formatFoyerLatex, formatSommetLatex } from "../../ui/formatEquationParabole";
import { RATIO_GRAPHE } from "../../ui/mafsTransformation";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEquationParabole } from "./index";
import { PARAMETRES_SOMMET_PARABOLE, profilEquationParabole } from "../profilsEvaluation4eCh7Coniques";

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
 * **Feuille d'exercices / évaluation (refonte papier)** : l'énoncé papier est le graphique (F et d
 * nommés, sans coordonnées) et la consigne globale « détermine l'équation » ; les 2 écrans
 * deviennent les étapes 1 et 2 du corrigé détaillé, avec le graphique annoté (S, F). Aucune place de
 * réponse. Tirage équilibré : `profilsEvaluation4eCh7Coniques.ts` (sommet sur un axe au choix).
 */

// --- Rendu SVG imprimé du graphe (voir le commentaire de tête ci-dessus) ---

const LARGEUR_SVG = 300;
const MARGE_SVG = 16;
const COULEUR_COURBE = "#1971c2";
const COULEUR_FOYER = "#f08c00";
const COULEUR_GRILLE = "#d8dee6";
const COULEUR_AXE = "#495057";
const NB_POINTS_COURBE = 120;
/** Identifiant unique du `clipPath` de chaque graphique (plusieurs graphiques dans un même document). */
let compteurClip = 0;

/** Points `(x,y)` de la courbe, échantillonnés en x (vertical, `y=f(x)`) ou en y (horizontal,
 * `x=g(y)`) sur tout le cadre. */
function pointsCourbeParabole(exercice: ExerciceEquationParabole, xMin: number, xMax: number, yMin: number, yMax: number): [number, number][] {
  const { sommet, p, variante } = exercice;
  const points: [number, number][] = [];
  for (let i = 0; i <= NB_POINTS_COURBE; i++) {
    if (variante === "vertical") {
      const x = xMin + ((xMax - xMin) * i) / NB_POINTS_COURBE;
      points.push([x, sommet.y + ((x - sommet.x) * (x - sommet.x)) / (2 * p)]);
    } else {
      const y = yMin + ((yMax - yMin) * i) / NB_POINTS_COURBE;
      points.push([sommet.x + ((y - sommet.y) * (y - sommet.y)) / (2 * p), y]);
    }
  }
  return points;
}

function texteSvg(x: number, y: number, contenu: string, options: { couleur?: string; taille?: number; ancre?: "start" | "middle" | "end"; gras?: boolean } = {}): string {
  const { couleur = COULEUR_AXE, taille = 8, ancre = "middle", gras = false } = options;
  return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${taille}" text-anchor="${ancre}"${gras ? ' font-weight="700"' : ""} fill="${couleur}">${contenu}</text>`;
}

/**
 * `<svg>` autonome du graphe de gen51 — grille de pas 1, axes gradués, parabole, directrice d
 * (trait orange) et foyer F (croix orange), nommés « d » et « F » sans aucune coordonnée (c'est ce
 * que l'élève lit). Cadrage identique à l'écran (`viewBoxEquationParabole`, déjà ajusté au rapport
 * `RATIO_GRAPHE` : une seule échelle sur les deux axes). Un axe hors cadre n'est pas tracé, mais ses
 * nombres restent épinglés au bord le plus proche. Correction : sommet S et coordonnées de S et F.
 */
function construireSvgParabole(exercice: ExerciceEquationParabole, avecCorrection: boolean): string {
  const { sommet, foyer, variante } = exercice;
  const viewBox = viewBoxEquationParabole(exercice);
  const [xMin, xMax] = viewBox.x;
  const [yMin, yMax] = viewBox.y;
  const largeur = LARGEUR_SVG;
  const hauteur = Math.round(largeur / RATIO_GRAPHE);
  const echelle = Math.min((largeur - 2 * MARGE_SVG) / (xMax - xMin), (hauteur - 2 * MARGE_SVG) / (yMax - yMin));
  const decalageX = (largeur - echelle * (xMax - xMin)) / 2;
  const decalageY = (hauteur - echelle * (yMax - yMin)) / 2;
  const sx = (x: number) => decalageX + (x - xMin) * echelle;
  const sy = (y: number) => decalageY + (yMax - y) * echelle;
  const gauche = sx(xMin);
  const droite = sx(xMax);
  const haut = sy(yMax);
  const bas = sy(yMin);
  const borner = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
  const ligneNombresX = borner(sy(0), haut, bas - 12);
  const colonneNombresY = borner(sx(0), gauche + 16, droite);
  const pasEtiquettes = echelle < 16 ? 2 : 1;

  const pas = PAS_GRILLE_EQUATION_PARABOLE;
  const grille: string[] = [];
  const labels: string[] = [];
  for (let v = Math.ceil(xMin / pas) * pas; v <= xMax + 1e-9; v += pas) {
    const px = sx(v);
    grille.push(`<line x1="${px.toFixed(1)}" y1="${haut.toFixed(1)}" x2="${px.toFixed(1)}" y2="${bas.toFixed(1)}" stroke="${COULEUR_GRILLE}" stroke-width="1"/>`);
    if (Math.abs(v) > 1e-9 && Math.round(v) % pasEtiquettes === 0) labels.push(texteSvg(px, ligneNombresX + 11, formatNombreGraphique(v)));
  }
  for (let v = Math.ceil(yMin / pas) * pas; v <= yMax + 1e-9; v += pas) {
    const py = sy(v);
    grille.push(`<line x1="${gauche.toFixed(1)}" y1="${py.toFixed(1)}" x2="${droite.toFixed(1)}" y2="${py.toFixed(1)}" stroke="${COULEUR_GRILLE}" stroke-width="1"/>`);
    if (Math.abs(v) > 1e-9 && Math.round(v) % pasEtiquettes === 0) labels.push(texteSvg(colonneNombresY - 4, py + 3, formatNombreGraphique(v), { ancre: "end" }));
  }
  const axeX = yMin <= 0 && 0 <= yMax ? `<line x1="${gauche.toFixed(1)}" y1="${sy(0).toFixed(1)}" x2="${droite.toFixed(1)}" y2="${sy(0).toFixed(1)}" stroke="${COULEUR_AXE}" stroke-width="1.4"/>` : "";
  const axeY = xMin <= 0 && 0 <= xMax ? `<line x1="${sx(0).toFixed(1)}" y1="${haut.toFixed(1)}" x2="${sx(0).toFixed(1)}" y2="${bas.toFixed(1)}" stroke="${COULEUR_AXE}" stroke-width="1.4"/>` : "";

  const pts = pointsCourbeParabole(exercice, xMin, xMax, yMin, yMax).filter(([x, y]) => x >= xMin - 1 && x <= xMax + 1 && y >= yMin - 1 && y <= yMax + 1);
  const chemin = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${sx(x).toFixed(1)},${sy(y).toFixed(1)}`).join(" ");
  const courbe = `<path d="${chemin}" fill="none" stroke="${COULEUR_COURBE}" stroke-width="2.2" stroke-linecap="round"/>`;

  const directrice = directriceEquationParabole(exercice);
  const ligneDirectrice =
    variante === "vertical"
      ? `<line x1="${gauche.toFixed(1)}" y1="${sy(directrice).toFixed(1)}" x2="${droite.toFixed(1)}" y2="${sy(directrice).toFixed(1)}" stroke="${COULEUR_FOYER}" stroke-width="1.8"/>` +
        texteSvg(gauche + 6, sy(directrice) + (foyer.y > directrice ? 13 : -5), "d", { couleur: COULEUR_FOYER, taille: 11, ancre: "start", gras: true })
      : `<line x1="${sx(directrice).toFixed(1)}" y1="${haut.toFixed(1)}" x2="${sx(directrice).toFixed(1)}" y2="${bas.toFixed(1)}" stroke="${COULEUR_FOYER}" stroke-width="1.8"/>` +
        texteSvg(sx(directrice) + (foyer.x > directrice ? -5 : 5), haut + 28, "d", { couleur: COULEUR_FOYER, taille: 11, ancre: foyer.x > directrice ? "end" : "start", gras: true });

  const cxF = sx(foyer.x);
  const cyF = sy(foyer.y);
  const croixFoyer =
    `<g stroke="${COULEUR_FOYER}" stroke-width="2.2"><line x1="${(cxF - 4).toFixed(1)}" y1="${(cyF - 4).toFixed(1)}" x2="${(cxF + 4).toFixed(1)}" y2="${(cyF + 4).toFixed(1)}"/><line x1="${(cxF - 4).toFixed(1)}" y1="${(cyF + 4).toFixed(1)}" x2="${(cxF + 4).toFixed(1)}" y2="${(cyF - 4).toFixed(1)}"/></g>` +
    texteSvg(cxF + 7, cyF - 6, avecCorrection ? `F(${formatNombreGraphique(foyer.x)} ; ${formatNombreGraphique(foyer.y)})` : "F", { couleur: COULEUR_FOYER, taille: avecCorrection ? 10 : 11, ancre: "start", gras: true });

  const reperesCorrection = avecCorrection
    ? `<circle cx="${sx(sommet.x).toFixed(1)}" cy="${sy(sommet.y).toFixed(1)}" r="3" fill="${COULEUR_COURBE}"/>` +
      texteSvg(sx(sommet.x) - 7, sy(sommet.y) + (variante === "vertical" ? (exercice.p > 0 ? 13 : -7) : 13), `S(${formatNombreGraphique(sommet.x)} ; ${formatNombreGraphique(sommet.y)})`, { couleur: COULEUR_COURBE, taille: 10, ancre: "end", gras: true })
    : "";

  const idClip = `cadre-parabole-${++compteurClip}`;
  const cadre = `<rect x="0.5" y="0.5" width="${largeur - 1}" height="${hauteur - 1}" fill="none" stroke="#adb5bd" stroke-width="1"/>`;
  return `<svg class="graphe-cyclo" width="${largeur}" height="${hauteur}" viewBox="0 0 ${largeur} ${hauteur}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Graphe de la parabole">
<rect x="0" y="0" width="${largeur}" height="${hauteur}" fill="#ffffff"/>
<clipPath id="${idClip}"><rect x="${gauche.toFixed(1)}" y="${haut.toFixed(1)}" width="${(droite - gauche).toFixed(1)}" height="${(bas - haut).toFixed(1)}"/></clipPath>
${grille.join("")}
${axeX}${axeY}
<g clip-path="url(#${idClip})">${courbe}</g>
${ligneDirectrice}
${labels.join("")}
${croixFoyer}
${reperesCorrection}
${cadre}
</svg>`;
}

function construireEnonceEquationParabole(instance: ExerciceEquationParabole): SectionExercice {
  return {
    enteteHtml: construireSvgParabole(instance, false),
    questions: [{ consigne: [texte(CONSIGNE_SOMMET_FOYER)] }, { consigne: [texte(CONSIGNE_EQUATION)] }],
  };
}

/** Forme réduite du cours, selon l'axe : jamais nommée en clair dans l'énoncé (lire l'axe sur le
 * graphe fait partie de l'exercice) — les deux formes sont rappelées. */
const FORMES_REDUITES = "(x-x_S)^2=2p(y-y_S) \\text{ ou } (y-y_S)^2=2p(x-x_S)";

/** Énoncé papier : le graphique (parabole, foyer F, directrice d) et la consigne globale — les 2
 * écrans deviennent les étapes du corrigé. */
function enoncePapierEquationParabole(instance: ExerciceEquationParabole): EnoncePapier {
  return {
    section: {
      enteteFragments: [
        texte("Le graphique ci-dessous représente une parabole, son foyer F et sa directrice d. Détermine l'équation de cette parabole sous la forme réduite "),
        latex(FORMES_REDUITES),
        texte(" (selon son axe)."),
      ],
      enteteHtml: construireSvgParabole(instance, false),
      questions: [],
    },
  };
}

function construireCorrectionEquationParabole(instance: ExerciceEquationParabole): BlocCorrection[] {
  return [
    { type: "html", html: construireSvgParabole(instance, true) },
    { type: "paragraphe", fragments: [texte("Sommet "), latex(`S${formatSommetLatex(instance.sommet)}`), texte(", foyer "), latex(`F${formatFoyerLatex(instance.foyer)}`), texte(".")] },
    { type: "paragraphe", fragments: [latex(formatAideEquationNiveau2Latex(instance)), texte(", donc "), latex(formatEquationAttendueLatex(instance)), texte(".")] },
  ];
}

function difficulteEquationParabole(instance: ExerciceEquationParabole): 1 | 2 | 3 {
  return instance.p < 0 || instance.variante === "horizontal" ? 3 : 2;
}

function reponseBreveEquationParabole(instance: ExerciceEquationParabole): FragmentConsigne[] {
  return [latex(formatEquationAttendueLatex(instance))];
}

function correctionDetailleeEquationParabole(instance: ExerciceEquationParabole): EtapeCorrection[] {
  const { sommet, foyer, variante, p } = instance;
  const vertical = variante === "vertical";
  const directrice = directriceEquationParabole(instance);
  const directriceLatex = `${vertical ? "y" : "x"} = ${directrice}`;
  return [
    {
      label: "Méthode",
      sousQuestion: "a",
      fragments: [texte(`La directrice d est ${vertical ? "horizontale" : "verticale"} : l'axe de la parabole est ${vertical ? "vertical" : "horizontal"}. Le sommet S est sur cet axe, exactement à mi-chemin entre le foyer F et la directrice.`)],
    },
    {
      label: "Lecture",
      sousQuestion: "a",
      fragments: [texte("Foyer "), latex(`F${formatFoyerLatex(foyer)}`), texte(", directrice "), latex(directriceLatex), texte(", donc sommet "), latex(`S${formatSommetLatex(sommet)}`), texte(".")],
      figureHtml: construireSvgParabole(instance, true),
    },
    {
      label: "Méthode",
      sousQuestion: "b",
      fragments: [texte("Axe " + (vertical ? "vertical" : "horizontal") + " : "), latex(vertical ? "(x-x_S)^2=2p(y-y_S)" : "(y-y_S)^2=2p(x-x_S)"), texte(", avec "), latex(vertical ? "p=2(y_F-y_S)" : "p=2(x_F-x_S)"), texte(" (p est signé).")],
    },
    { label: "Calcul", sousQuestion: "b", fragments: [latex(formatAideEquationNiveau2Latex(instance)), texte(", donc "), latex(`2p = ${2 * p}`), texte(".")] },
    { label: "Conclusion", sousQuestion: "b", fragments: [latex(formatEquationAttendueLatex(instance)), texte(".")] },
    {
      label: "Piège",
      sousQuestion: "b",
      fragments:
        p < 0
          ? [texte(`La parabole s'ouvre vers ${vertical ? "le bas" : "la gauche"} (le foyer est ${vertical ? "sous" : "à gauche du"} sommet) : p est négatif, `), latex(`p = ${p}`), texte(".")]
          : [texte("Le coefficient de l'équation est "), latex("2p"), texte(", pas "), latex("p"), texte(" : ici "), latex(`2p = ${2 * p}`), texte(".")],
    },
  ];
}

function baremeEquationParabole(instance: ExerciceEquationParabole): BaremeExercice {
  const erreurs: ErreurFrequente[] = [
    { description: [texte("Coefficient "), latex("p"), texte(" écrit à la place de "), latex("2p")], cout: "−1" },
    { description: [texte("Forme de l'autre axe utilisée (carré sur la mauvaise variable)")], cout: "−1,5" },
  ];
  if (instance.p < 0) erreurs.push({ description: [texte("Signe de p oublié (parabole ouverte vers " + (instance.variante === "vertical" ? "le bas" : "la gauche") + ")")], cout: "−1" });
  return {
    reponseFinale: [latex(formatEquationAttendueLatex(instance))],
    criteres: [
      { sousQuestion: "a", critere: [texte("Foyer "), latex(`F${formatFoyerLatex(instance.foyer)}`), texte(" et sommet "), latex(`S${formatSommetLatex(instance.sommet)}`), texte(" lus")], points: 1 },
      { sousQuestion: "b", critere: [texte("Paramètre "), latex(`p = ${instance.p}`), texte(" (signe compris)")], points: 1 },
      { sousQuestion: "b", critere: [texte("Équation correcte, forme de l'axe " + (instance.variante === "vertical" ? "vertical" : "horizontal"))], points: 2 },
    ],
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[texte("Toute équation équivalente sous forme réduite (par exemple coefficient "), latex("2p"), texte(" écrit comme un produit)")]],
  };
}

export const adaptateurEvaluationEquationParabole: AdaptateurFeuilleExercices<ExerciceEquationParabole> = {
  titreDocument: "Équation d'une parabole depuis un graphe — Évaluation",
  nomFichierBase: "equation-parabole",
  genererInstance: genererExerciceEquationParabole,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceEquationParabole,
  construireCorrection: construireCorrectionEquationParabole,
  difficulte: difficulteEquationParabole,
  reponseBreve: reponseBreveEquationParabole,
  correctionDetaillee: correctionDetailleeEquationParabole,
  bareme: baremeEquationParabole,
  enoncePapier: enoncePapierEquationParabole,
  dureeMinutes: 5,
  profilInstance: profilEquationParabole,
  parametresAuChoix: PARAMETRES_SOMMET_PARABOLE,
  // PAS regroupable : 2 étapes par instance ET un enteteHtml (le graphique).
};

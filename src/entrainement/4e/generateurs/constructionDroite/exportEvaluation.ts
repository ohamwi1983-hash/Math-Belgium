import type { ExerciceConstructionDroite } from "../../core/constructionDroite.types";
import type { Composantes, Point } from "../../core/vecteur.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { formatNombreGraphique } from "../../../export/svgGraph";
import { calculerPasGrille } from "../../ui/mafsTransformation";
import { calculerViewBoxVecteurs } from "../../ui/vecteurGraph";
import type { ViewBoxTransformation } from "../../ui/vecteurGraph";
import { formatPointLatex } from "../../ui/formatEquationDroite";
import { formatEnonceLatex, texteAidePointsNiveau1 } from "../../ui/formatConstructionDroite";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceConstructionDroite } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceConstructionDroite>` pour gen44 ("Construction
 * graphique — tracer une droite depuis son équation", `AppConstructionDroite.tsx`) — voir
 * `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence, et
 * `generateurs/constructionVectorielle/exportEvaluation.ts` pour l'analogue le plus proche déjà
 * porté (même famille de problème : un graphique vierge imprimé, l'élève y trace quelque chose —
 * ici une droite entière plutôt qu'un vecteur borné entre 2 points).
 *
 * Chapitre Math-Belgium "Géométrie analytique plane" (4e), section "Lire et tracer une droite"
 * (`lire-tracer`, `src/content/chapters/4e/geometrie-analytique-plane.ts`). **Cette section est
 * servie par DEUX générateurs** : gen44 (celui-ci, construction = tracer une droite donnée) ET
 * gen43 (`lectureGraphiqueDroite`, lecture = lire l'équation d'une droite déjà tracée), porté par
 * un autre agent en parallèle — seul `generateurs/constructionDroite/` est touché ici.
 *
 * **Écran → question** : `AppConstructionDroite.tsx` a 2 phases séquentielles
 * (`moteur/sessionConstructionDroite.ts`, `PhaseConstructionDroite`) — écran "points" (l'élève
 * donne 2 points entiers de la droite) PUIS écran "trace" (il place ces 2 points sur un graphe
 * interactif, `ConstructionDroiteGraph.tsx`, `MovablePoint` + `Line.ThroughPoints` en temps réel).
 * Cette séquence en 2 temps n'a de sens QUE parce que l'écran vérifie chaque étape indépendamment
 * (droite mal choisie détectée avant même le placement). Sur papier, il n'y a aucune vérification
 * intermédiaire possible : les 2 écrans se réduisent donc à UNE seule question — donner l'équation,
 * demander de tracer directement la droite sur un graphique vierge déjà imprimé — même simplification
 * que `constructionVectorielle/exportEvaluation.ts` (qui fusionne de la même façon son unique écran
 * en une seule question, cf. son commentaire de tête).
 *
 * **Représentation papier** : grille + axes vierges (aucune droite tracée — ce serait donner la
 * réponse) sous l'équation donnée (`construireEnonceConstructionDroite`), une droite ENTIÈRE
 * (prolongée jusqu'aux bords du graphique, pas un simple segment/vecteur borné — `clipLigneAuViewBox`
 * ci-dessous) tracée en bleu (même couleur que `ConstructionDroiteGraph.tsx::COULEUR_DROITE` =
 * `#1971c2`) en correction. Aucun moteur de tracé SVG générique n'existe dans `export/` pour ce cas
 * (grille + droite complète clippée à un rectangle) — même constat que `constructionVectorielle`
 * ("chacun le sien" — `boiteMoustaches`/`triangleLies`/`constructionVectorielle` ont chacun le leur) :
 * ce fichier écrit donc le sien, mais réutilise la géométrie pure déjà partagée par l'écran
 * interactif plutôt que de la dupliquer — `ui/vecteurGraph.ts::calculerViewBoxVecteurs` (même calcul
 * de viewBox — marge fixe + ratio `RATIO_GRAPHE` — que `viewBoxConstructionDroite`, qui l'appelle
 * aussi) et `ui/mafsTransformation.ts::calculerPasGrille` (même pas de grille "nombre rond" que
 * `GrilleAdaptative`). Le viewBox est calculé à partir de `exercice.point` et
 * `exercice.point + exercice.vecteur` — 2 points ENTIERS de la droite, garantis distincts et
 * toujours valides quelle que soit `variante` (voir `core/constructionDroite.types.ts`, champ
 * `point`/`vecteur` — jamais montrés numériquement à l'élève, mais utilisables ici comme n'importe
 * quelle autre valeur déjà connue et correcte de l'instance tirée). Le même viewBox sert à l'énoncé
 * ET à la correction (comme `constructionVectorielle`) : la grille imprimée dans l'énoncé doit déjà
 * montrer assez d'espace pour que l'élève puisse y tracer sa droite sans en sortir.
 *
 * **Deux points, pas un vecteur** : contrairement à `constructionVectorielle` (qui trace un segment
 * borné entre 2 points précis), une droite est en principe infinie — `clipLigneAuViewBox` calcule
 * donc l'intersection de la droite (point, vecteur directeur) avec le rectangle du viewBox
 * (algorithme de clipping paramétrique classique, borne `t` par les 4 côtés du rectangle) et trace
 * le segment résultant, qui occupe tout le graphique plutôt que de s'arrêter à A/B — geste bien plus
 * proche de ce qu'un élève trace réellement à la règle sur un graphique imprimé.
 *
 * **Correction RESYNTHÉTISÉE** depuis les valeurs déjà connues et correctes de l'instance tirée
 * (`exercice.point`, `exercice.vecteur` — jamais recalculées indépendamment) : `texteAidePointsNiveau1`
 * (`ui/formatConstructionDroite.ts`, déjà partagée avec l'écran 1) est RÉUTILISÉE telle quelle pour
 * la méthode ("substitue une valeur, calcule l'autre coordonnée, recommence") — seul le second point
 * d'exemple diffère : l'écran ne montre jamais qu'UN point d'exemple (`formatAidePointsNiveau2Latex`,
 * aide niveau 2 seulement), alors que la correction papier a besoin des 2 points explicitement pour
 * justifier le tracé — `exercice.point` et `exercice.point + exercice.vecteur` sont TOUJOURS deux
 * points distincts et valides de la droite quelle que soit `variante` (vérifié algébriquement pour
 * les 4 formes en lisant `generateurs/droite/geometrieDroite.ts` : chaque forme de sortie est
 * dérivée directement de ce couple point/vecteur, donc les deux lui appartiennent par construction).
 *
 * **PAS `regroupable`** — les 2 conditions disqualifiantes de `AdaptateurFeuilleExercices.regroupable`
 * (`export/genererFeuilleExercices.ts`) sont TOUTES DEUX réunies : (1) la consigne
 * (`consigneTraceExport` ci-dessous) dépend de `variante` (texte différent pour "parametrique" vs les
 * 3 formes cartésiennes) — jamais générique/indépendante de l'instance ; (2) `enteteHtml` (le
 * graphique) est utilisé, ce qui disqualifie `regroupable` à lui seul, quelle que soit la consigne
 * (voir la doc du champ). Même décision que `constructionVectorielle/exportEvaluation.ts`.
 *
 * **Consigne propre à l'export, jamais celle de l'écran** : `consigneGeneraleTrace`
 * (`ui/formatConstructionDroite.ts`) suppose l'équation affichée SOUS la consigne ("... ci-dessous"),
 * cohérent avec l'ordre d'affichage de l'écran (consigne puis équation). Le pipeline HTML évaluation
 * affiche systématiquement `enteteFragments` (ici l'équation) AVANT `enteteHtml`/les questions
 * (`assemblerEvaluationHtml.ts::corpsQuestionHtml`) — l'ordre inverse. Réutiliser tel quel le texte de
 * l'écran produirait donc un contresens spatial ("ci-dessous" pointant vers un graphique, pas vers
 * l'équation déjà affichée au-dessus) ; `consigneTraceExport` ci-dessous est donc une variante de
 * formulation ADAPTÉE à cet ordre d'affichage inversé, pas une réécriture arbitraire.
 *
 * Pas de zone de réponse vierge (`reponse` omis sur l'unique question, comportement par défaut,
 * SANS AUCUN EFFET sur le pipeline HTML évaluation qui n'affiche jamais de zone de réponse — voir le
 * commentaire de tête de `corpsQuestionHtml`) : la réponse attendue est un TRACÉ sur la grille déjà
 * imprimée dans l'énoncé, jamais une ligne de texte à remplir en dessous — même raison que
 * `constructionVectorielle`/`boiteMoustaches`/`triangleLies`.
 */

const LARGEUR_SVG = 280;
const RATIO_SVG = 3 / 2; // même RATIO_GRAPHE que l'écran (ui/mafsTransformation.ts).
const HAUTEUR_SVG = Math.round(LARGEUR_SVG / RATIO_SVG);
const MARGE_PX = 20;

const COULEUR_GRILLE = "#d8dee6";
const COULEUR_AXE = "#495057";
const COULEUR_POINT = "#495057";
const COULEUR_DROITE = "#1971c2"; // même couleur que ConstructionDroiteGraph.tsx::COULEUR_DROITE.

interface Echelle {
  sx: (x: number) => number;
  sy: (y: number) => number;
}

function construireEchelle(viewBox: ViewBoxTransformation): Echelle {
  const [xMin, xMax] = viewBox.x;
  const [yMin, yMax] = viewBox.y;
  const zoneX = LARGEUR_SVG - 2 * MARGE_PX;
  const zoneY = HAUTEUR_SVG - 2 * MARGE_PX;
  return {
    sx: (x) => MARGE_PX + ((x - xMin) / (xMax - xMin)) * zoneX,
    sy: (y) => HAUTEUR_SVG - MARGE_PX - ((y - yMin) / (yMax - yMin)) * zoneY,
  };
}

/** Grille "nombre rond" (`calculerPasGrille`, même fonction que l'écran) + axes x=0/y=0 — géométrie
 * en attributs SVG inline, même patron que `constructionVectorielle/exportEvaluation.ts::construireGrilleEtAxesHtml`
 * (document HTML d'évaluation autonome, sans dépendance à `App.css`). */
function construireGrilleEtAxesHtml(viewBox: ViewBoxTransformation, echelle: Echelle): string {
  const [xMin, xMax] = viewBox.x;
  const [yMin, yMax] = viewBox.y;
  const pasX = calculerPasGrille(xMax - xMin);
  const pasY = calculerPasGrille(yMax - yMin);

  const lignes: string[] = [];
  const labels: string[] = [];

  for (let v = Math.ceil(xMin / pasX) * pasX; v <= xMax + 1e-9; v += pasX) {
    const px = echelle.sx(v);
    lignes.push(`<line x1="${px.toFixed(1)}" y1="${MARGE_PX}" x2="${px.toFixed(1)}" y2="${HAUTEUR_SVG - MARGE_PX}" stroke="${COULEUR_GRILLE}" stroke-width="1"/>`);
    if (Math.abs(v) > 1e-9) {
      labels.push(`<text x="${px.toFixed(1)}" y="${(echelle.sy(0) + 11).toFixed(1)}" font-size="8" text-anchor="middle" fill="${COULEUR_AXE}">${formatNombreGraphique(v)}</text>`);
    }
  }
  for (let v = Math.ceil(yMin / pasY) * pasY; v <= yMax + 1e-9; v += pasY) {
    const py = echelle.sy(v);
    lignes.push(`<line x1="${MARGE_PX}" y1="${py.toFixed(1)}" x2="${LARGEUR_SVG - MARGE_PX}" y2="${py.toFixed(1)}" stroke="${COULEUR_GRILLE}" stroke-width="1"/>`);
    if (Math.abs(v) > 1e-9) {
      labels.push(`<text x="${(echelle.sx(0) - 4).toFixed(1)}" y="${(py + 3).toFixed(1)}" font-size="8" text-anchor="end" fill="${COULEUR_AXE}">${formatNombreGraphique(v)}</text>`);
    }
  }

  const axeX = `<line x1="${MARGE_PX}" y1="${echelle.sy(0).toFixed(1)}" x2="${LARGEUR_SVG - MARGE_PX}" y2="${echelle.sy(0).toFixed(1)}" stroke="${COULEUR_AXE}" stroke-width="1.4"/>`;
  const axeY = `<line x1="${echelle.sx(0).toFixed(1)}" y1="${MARGE_PX}" x2="${echelle.sx(0).toFixed(1)}" y2="${HAUTEUR_SVG - MARGE_PX}" stroke="${COULEUR_AXE}" stroke-width="1.4"/>`;

  return `${lignes.join("")}${axeX}${axeY}${labels.join("")}`;
}

function construirePointHtml(point: Point, label: string, echelle: Echelle): string {
  const px = echelle.sx(point.x);
  const py = echelle.sy(point.y);
  return `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="3" fill="${COULEUR_POINT}"/><text x="${px.toFixed(1)}" y="${(py - 8).toFixed(1)}" font-size="12" font-weight="700" text-anchor="middle" fill="${COULEUR_POINT}">${label}</text>`;
}

/** Clippe la droite infinie `{point + t·vecteur, t ∈ ℝ}` au rectangle du viewBox — algorithme de
 * clipping paramétrique classique (borne l'intervalle de `t` par les 4 côtés du rectangle, un axe à
 * la fois). `vecteur` n'a jamais de composante nulle ici (`constructionDroite/index.ts::tirerVecteur`,
 * jamais un vecteur horizontal/vertical), donc les deux branches `x!==0`/`y!==0` sont toujours
 * empruntées en pratique — les branches `else` (vecteur horizontal/vertical) restent écrites par
 * robustesse, jamais exercées par ce générateur précis mais sans coût à les couvrir. Retourne
 * toujours un segment non vide : `point` est garanti strictement à l'intérieur du rectangle
 * (`calculerViewBoxVecteurs` marge chaque point d'au moins 1.5 unité), donc `tMin<0<tMax` toujours. */
function clipLigneAuViewBox(point: Point, vecteur: Composantes, viewBox: ViewBoxTransformation): [Point, Point] {
  const [xMin, xMax] = viewBox.x;
  const [yMin, yMax] = viewBox.y;
  let tMin = -Infinity;
  let tMax = Infinity;

  if (vecteur.x !== 0) {
    const t1 = (xMin - point.x) / vecteur.x;
    const t2 = (xMax - point.x) / vecteur.x;
    tMin = Math.max(tMin, Math.min(t1, t2));
    tMax = Math.min(tMax, Math.max(t1, t2));
  }
  if (vecteur.y !== 0) {
    const t1 = (yMin - point.y) / vecteur.y;
    const t2 = (yMax - point.y) / vecteur.y;
    tMin = Math.max(tMin, Math.min(t1, t2));
    tMax = Math.min(tMax, Math.max(t1, t2));
  }

  return [
    { x: point.x + tMin * vecteur.x, y: point.y + tMin * vecteur.y },
    { x: point.x + tMax * vecteur.x, y: point.y + tMax * vecteur.y },
  ];
}

function construireDroiteHtml(point: Point, vecteur: Composantes, echelle: Echelle, viewBox: ViewBoxTransformation): string {
  const [p1, p2] = clipLigneAuViewBox(point, vecteur, viewBox);
  const x1 = echelle.sx(p1.x);
  const y1 = echelle.sy(p1.y);
  const x2 = echelle.sx(p2.x);
  const y2 = echelle.sy(p2.y);
  return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${COULEUR_DROITE}" stroke-width="2.2"/>`;
}

function secondPoint(point: Point, vecteur: Composantes): Point {
  return { x: point.x + vecteur.x, y: point.y + vecteur.y };
}

/** Construit le graphique complet (grille + axes), avec en plus la droite tracée (bleue, prolongée
 * jusqu'aux bords du graphique) et les 2 points A/B repères quand `avecTrace` — réservé à la
 * correction, jamais l'énoncé (qui ne doit montrer qu'une grille vierge). Le viewBox est TOUJOURS
 * calculé à partir des mêmes 2 points, que la droite soit affichée ou non (voir commentaire de tête :
 * l'énoncé doit déjà montrer assez d'espace pour que l'élève y trace sa droite sans en sortir). */
function construireSvgConstructionDroite(exercice: ExerciceConstructionDroite, avecTrace: boolean): string {
  const { point, vecteur } = exercice;
  const pointB = secondPoint(point, vecteur);
  const viewBox = calculerViewBoxVecteurs([
    { point, label: "" },
    { point: pointB, label: "" },
  ]);
  const echelle = construireEchelle(viewBox);

  const grilleHtml = construireGrilleEtAxesHtml(viewBox, echelle);
  const droiteHtml = avecTrace ? construireDroiteHtml(point, vecteur, echelle, viewBox) : "";
  const pointsHtml = avecTrace ? `${construirePointHtml(point, "A", echelle)}${construirePointHtml(pointB, "B", echelle)}` : "";

  return `<svg width="${LARGEUR_SVG}" height="${HAUTEUR_SVG}" viewBox="0 0 ${LARGEUR_SVG} ${HAUTEUR_SVG}" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:8px auto 14px;border:1px solid #e6e6f0;border-radius:8px;background:#ffffff;">
<rect x="0" y="0" width="${LARGEUR_SVG}" height="${HAUTEUR_SVG}" fill="#ffffff"/>
${grilleHtml}
${droiteHtml}
${pointsHtml}
</svg>`;
}

/** Consigne de l'unique question — voir le commentaire de tête pour pourquoi ce n'est PAS
 * `consigneGeneraleTrace` (`ui/formatConstructionDroite.ts`), écrite pour l'ordre d'affichage inverse
 * de l'écran. Dépend de `variante` (paramétrique vs cartésienne) — disqualifie `regroupable`. */
function consigneTraceExport(exercice: ExerciceConstructionDroite): string {
  return exercice.variante === "parametrique"
    ? "Trace la droite dont la représentation paramétrique est donnée ci-dessus, sur le graphique ci-dessous."
    : "Trace la droite d'équation donnée ci-dessus, sur le graphique ci-dessous.";
}

function construireEnonceConstructionDroite(exercice: ExerciceConstructionDroite): SectionExercice {
  return {
    enteteFragments: [texte("Équation de la droite : "), latex(formatEnonceLatex(exercice))],
    enteteHtml: construireSvgConstructionDroite(exercice, false),
    questions: [{ consigne: [texte(consigneTraceExport(exercice))] }],
  };
}

function construireCorrectionConstructionDroite(exercice: ExerciceConstructionDroite): BlocCorrection[] {
  const { point, vecteur } = exercice;
  const pointB = secondPoint(point, vecteur);

  return [
    { type: "html", html: construireSvgConstructionDroite(exercice, true) },
    { type: "paragraphe", fragments: [texte(texteAidePointsNiveau1(exercice))] },
    {
      type: "paragraphe",
      fragments: [
        texte("Deux points de la droite ainsi obtenus : "),
        latex(`A${formatPointLatex(point)}`),
        texte(" et "),
        latex(`B${formatPointLatex(pointB)}`),
        texte(" — il suffit de les relier par une droite complète, prolongée jusqu'aux bords du graphique."),
      ],
    },
  ];
}

export const adaptateurEvaluationConstructionDroite: AdaptateurFeuilleExercices<ExerciceConstructionDroite> = {
  titreDocument: "Construction graphique — tracer une droite — Évaluation",
  nomFichierBase: "construction-droite",
  genererInstance: genererExerciceConstructionDroite,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceConstructionDroite,
  construireCorrection: construireCorrectionConstructionDroite,
  // PAS regroupable — consigne dépendante de `variante` (paramétrique vs cartésienne, jamais
  // générique) ET `enteteHtml` (le graphique) utilisé, qui disqualifie `regroupable` à lui seul :
  // voir le commentaire de tête.
};

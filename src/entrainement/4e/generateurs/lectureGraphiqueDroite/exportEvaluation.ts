import type { ExerciceLectureGraphiqueDroite } from "../../core/lectureGraphiqueDroite.types";
import type { Point } from "../../core/vecteur.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { formatNombreGraphique } from "../../../export/svgGraph";
import { calculerPasGrille, RATIO_GRAPHE } from "../../ui/mafsTransformation";
import type { ViewBoxTransformation } from "../../ui/vecteurGraph";
import { consigneGeneraleLecture, consigneLecture, formatReponseAttendueLatex } from "../../ui/formatLectureGraphiqueDroite";
import { formatPointLatex, formatVecteurLatex } from "../../ui/formatEquationDroite";
import { pointsEntiersVisibles, viewBoxLectureGraphiqueDroite } from "../../ui/lectureGraphiqueDroiteGraph";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLectureGraphiqueDroite } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceLectureGraphiqueDroite>` pour gen43 (Lecture
 * graphique — équation d'une droite, `AppLectureGraphiqueDroite.tsx`) — voir
 * `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence, et
 * `generateurs/constructionVectorielle/exportEvaluation.ts` pour l'exemple jumeau d'un graphique
 * papier écrit à la main (moteur `<svg>` propre à chaque adaptateur, aucun moteur générique
 * point/vecteur partagé dans `export/`).
 *
 * Chapitre Math-Belgium "Géométrie analytique plane" (4e), section "Lire et tracer une droite"
 * (`lire-tracer`, `src/content/chapters/4e/geometrie-analytique-plane.ts` côté Math-Belgium) — cette
 * section est servie par DEUX générateurs, gen43 (celui-ci, lecture d'une droite déjà tracée) ET
 * gen44 (`constructionDroite`, tracer une droite depuis son équation, porté séparément).
 *
 * **Écran → question** : `moteur/sessionLectureGraphiqueDroite.ts` n'a qu'UN seul écran par
 * exercice (pas de `Phase`), dispatché directement sur `exercice.variante` — `EtapeLectureCartesienne.tsx`
 * (champ de texte libre, n'importe quelle forme cartésienne équivalente acceptée — implicite ou
 * explicite en x/en y, voir `verificationLectureGraphiqueDroite.ts::diagnostiquerCartesienne`) ou
 * `EtapeLectureParametrique.tsx` (2 champs de texte libre x(t)/y(t), n'importe quel point de la
 * droite + vecteur colinéaire accepté, voir `diagnostiquerParametriqueLecture`). Ceci devient ici UNE
 * seule question par instance, dont la consigne dépend de la variante (`consigneLecture`, réutilisée
 * telle quelle depuis `ui/formatLectureGraphiqueDroite.ts` — jamais reformulée ici).
 *
 * **Graphique papier NÉCESSAIRE** : l'exercice EST une lecture graphique — la droite tracée sur le
 * quadrillage est la SEULE donnée de l'énoncé (aucune donnée textuelle, contrairement à
 * `equationDroite`), impossible à remplacer par du texte sans vider l'exercice de son sens.
 * `construireSvgLectureGraphiqueDroite` ci-dessous réécrit son propre petit moteur de tracé `<svg>`
 * (même précédent que `constructionVectorielle`/`triangleQuelconque` — chacun le sien), mais
 * RÉUTILISE la géométrie pure déjà partagée par l'écran interactif plutôt que de la dupliquer :
 * `ui/lectureGraphiqueDroiteGraph.ts::viewBoxLectureGraphiqueDroite`/`pointsEntiersVisibles` (même
 * viewBox et mêmes points à coordonnées entières que `LectureGraphiqueDroiteGraph.tsx`, dérivés du
 * SEUL `point`/`vecteur` de l'instance) et `ui/mafsTransformation.ts::calculerPasGrille` (même pas de
 * grille "nombre rond" que `GrilleAdaptative`). Seuls le découpage de la droite (infinie) aux bords
 * du viewBox (`decouperDroiteDansViewBox`, absent à l'écran — Mafs `Line.PointAngle` le fait déjà en
 * interne, jamais exposé comme géométrie pure réutilisable) et la projection réel→pixel/le tracé
 * `<svg>` proprement dit sont écrits ici.
 *
 * **PAS `regroupable`** — 2 des 3 conditions de `AdaptateurFeuilleExercices.regroupable`
 * (`export/genererFeuilleExercices.ts`) sont violées, chacune déjà suffisante à elle seule : (1)
 * `enteteHtml` (le graphique) est utilisé, ce qui disqualifie `regroupable` quelle que soit la
 * consigne ; (2) la consigne dépend en outre de la variante (`consigneLecture` : cartésienne vs
 * paramétrique), jamais une seule et même constante `CONSIGNE_GENERALE` — même si elle est par
 * ailleurs indépendante des VALEURS tirées au sein d'une variante donnée.
 *
 * **Correction RESYNTHÉTISÉE** depuis les valeurs déjà connues de l'instance tirée (`exercice.point`,
 * `exercice.vecteur`, `exercice.referenceImplicite` — jamais recalculées indépendamment ici) : la
 * méthode de lecture est reconstituée en repérant deux points à coordonnées entières EFFECTIVEMENT
 * visibles sur le graphe imprimé (`pointsEntiersVisibles(exercice)[1]`/`[2]`, qui valent exactement
 * `exercice.point` et `exercice.point + exercice.vecteur` — voir `lectureGraphiqueDroiteGraph.ts`,
 * `K_MIN=-1`), jamais un couple de points arbitraire recalculé ailleurs. `EtapeLecture*.tsx` n'a pas
 * de texte d'aide progressif à concaténer (`texteAideNiveau1` reste un rappel de méthode générique,
 * jamais une valeur réelle de l'exercice) : la correction explicite donc directement la méthode
 * (repérer deux points entiers → vecteur directeur par différence → équation), puis la réponse finale
 * via `formatReponseAttendueLatex` (`ui/formatLectureGraphiqueDroite.ts`, LA MÊME fonction que la
 * révélation de réponse déjà utilisée côté écran après échec — jamais une resynthèse indépendante de
 * la forme finale), en rappelant que toute forme/tout point/vecteur équivalent reste accepté (même
 * tolérance que `verificationLectureGraphiqueDroite.ts`).
 *
 * Aucune zone de réponse vierge (`reponse` omis sur l'unique question, comportement par défaut —
 * sans effet sur le pipeline HTML évaluation, qui n'affiche jamais de zone de réponse, voir le
 * commentaire de tête de `corpsQuestionHtml`, `export/assemblerEvaluationHtml.ts`) : l'élève répond
 * sur une feuille à part.
 */

const LARGEUR_SVG = 260;
const HAUTEUR_SVG = Math.round(LARGEUR_SVG / RATIO_GRAPHE);
const MARGE_PX = 20;

const COULEUR_GRILLE = "#d8dee6";
const COULEUR_AXE = "#495057";
const COULEUR_DROITE = "#1971c2";
const COULEUR_POINT = "#495057";

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

/** Grille "nombre rond" (`calculerPasGrille`, même fonction que l'écran) + axes x=0/y=0 — même
 * patron que `constructionVectorielle/exportEvaluation.ts::construireGrilleEtAxesHtml` (document
 * HTML d'évaluation autonome, sans dépendance à `App.css`). */
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

/** Découpe la droite INFINIE (`point` + direction `vecteur`) aux bords du `viewBox` — méthode des
 * tranches (slab method), universellement correcte y compris pour une direction verticale/horizontale
 * (`vecteur.x`/`vecteur.y` nul). Retourne les 2 points d'intersection avec le cadre, dans l'ordre
 * croissant de `t` — jamais `null` en pratique ici : `viewBox` est TOUJOURS calculé par
 * `viewBoxLectureGraphiqueDroite`, qui couvre par construction des points réellement sur la droite
 * (`pointsEntiersVisibles`), donc la droite traverse nécessairement le cadre. Le repli sur `point`
 * lui-même (segment de longueur nulle) ne peut donc être exercé que si cette garantie était un jour
 * rompue par un appelant futur — jamais silencieusement invisible, un point unique restant visible. */
function decouperDroiteDansViewBox(point: Point, vecteur: { x: number; y: number }, viewBox: ViewBoxTransformation): [Point, Point] {
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

  if (!(tMin <= tMax)) {
    return [point, point];
  }
  return [
    { x: point.x + tMin * vecteur.x, y: point.y + tMin * vecteur.y },
    { x: point.x + tMax * vecteur.x, y: point.y + tMax * vecteur.y },
  ];
}

/** Grille + droite tracée d'un bord à l'autre du cadre + points à coordonnées entières marqués — même
 * représentation que `LectureGraphiqueDroiteGraph.tsx` à l'écran, jamais l'équation elle-même
 * affichée (c'est justement ce que l'élève doit trouver). */
function construireSvgLectureGraphiqueDroite(exercice: ExerciceLectureGraphiqueDroite): string {
  const viewBox = viewBoxLectureGraphiqueDroite(exercice);
  const echelle = construireEchelle(viewBox);
  const [depart, arrivee] = decouperDroiteDansViewBox(exercice.point, exercice.vecteur, viewBox);

  const grilleHtml = construireGrilleEtAxesHtml(viewBox, echelle);
  const droiteHtml = `<line x1="${echelle.sx(depart.x).toFixed(1)}" y1="${echelle.sy(depart.y).toFixed(1)}" x2="${echelle.sx(arrivee.x).toFixed(1)}" y2="${echelle.sy(arrivee.y).toFixed(1)}" stroke="${COULEUR_DROITE}" stroke-width="2.4"/>`;
  const pointsHtml = pointsEntiersVisibles(exercice)
    .map((p) => `<circle cx="${echelle.sx(p.x).toFixed(1)}" cy="${echelle.sy(p.y).toFixed(1)}" r="3" fill="${COULEUR_POINT}"/>`)
    .join("");

  return `<svg width="${LARGEUR_SVG}" height="${HAUTEUR_SVG}" viewBox="0 0 ${LARGEUR_SVG} ${HAUTEUR_SVG}" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:8px auto 14px;border:1px solid #e6e6f0;border-radius:8px;background:#ffffff;">
<rect x="0" y="0" width="${LARGEUR_SVG}" height="${HAUTEUR_SVG}" fill="#ffffff"/>
${grilleHtml}
${droiteHtml}
${pointsHtml}
</svg>`;
}

function construireEnonceLectureGraphiqueDroite(exercice: ExerciceLectureGraphiqueDroite): SectionExercice {
  return {
    enteteFragments: [texte(consigneGeneraleLecture(exercice))],
    enteteHtml: construireSvgLectureGraphiqueDroite(exercice),
    questions: [{ consigne: [texte(consigneLecture(exercice))] }],
  };
}

function construireCorrectionLectureGraphiqueDroite(exercice: ExerciceLectureGraphiqueDroite): BlocCorrection[] {
  const points = pointsEntiersVisibles(exercice);
  // Index 1/2 valent exactement `exercice.point`/`exercice.point + exercice.vecteur` (voir le
  // commentaire de tête — `K_MIN=-1` dans `lectureGraphiqueDroiteGraph.ts`), jamais un couple
  // recalculé indépendamment.
  const [pointA, pointB] = [points[1], points[2]];

  const blocs: BlocCorrection[] = [
    {
      type: "paragraphe",
      fragments: [
        texte("On repère deux points à coordonnées entières sur la droite, par exemple "),
        latex(formatPointLatex(pointA)),
        texte(" et "),
        latex(formatPointLatex(pointB)),
        texte(", puis on calcule un vecteur directeur par différence des coordonnées : "),
        latex(`\\vec{u}${formatVecteurLatex(exercice.vecteur)}`),
        texte("."),
      ],
    },
  ];

  if (exercice.variante === "cartesienne") {
    blocs.push({
      type: "paragraphe",
      fragments: [
        texte("Équation cartésienne (toute forme équivalente — implicite ou explicite en "),
        latex("x"),
        texte(" ou en "),
        latex("y"),
        texte(" — est acceptée) : "),
        latex(formatReponseAttendueLatex(exercice)),
        texte("."),
      ],
    });
  } else {
    blocs.push({
      type: "paragraphe",
      fragments: [
        texte("En prenant "),
        latex(formatPointLatex(exercice.point)),
        texte(" comme point de référence, les équations paramétriques sont (tout point de la droite associé à un vecteur colinéaire est également accepté) : "),
        latex(formatReponseAttendueLatex(exercice)),
        texte("."),
      ],
    });
  }

  return blocs;
}

export const adaptateurEvaluationLectureGraphiqueDroite: AdaptateurFeuilleExercices<ExerciceLectureGraphiqueDroite> = {
  titreDocument: "Lecture graphique — équation d'une droite — Évaluation",
  nomFichierBase: "lecture-graphique-droite",
  genererInstance: genererExerciceLectureGraphiqueDroite,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceLectureGraphiqueDroite,
  construireCorrection: construireCorrectionLectureGraphiqueDroite,
  // PAS regroupable — `enteteHtml` (le graphique) utilisé ET consigne dépendante de la variante
  // (cartésienne/paramétrique) : 2 raisons indépendantes déjà suffisantes chacune, voir le
  // commentaire de tête.
};

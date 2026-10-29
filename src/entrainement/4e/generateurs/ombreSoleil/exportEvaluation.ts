import type { ExerciceOmbreSoleil, VarianteOmbreSoleil } from "../../core/ombreSoleil.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { texte } from "../../../export/fragmentsDocx";
import { elementsConclusion, elementsScene, fusionner, libelleObstacle, solidePourAffichage, texteConclusion } from "../../ui/formatOmbreSoleil";
import type { ElementsCroquis } from "../../ui/formatOmbreSoleil";
import { calculerEchelleProjection, calculerGeometrieSolide3D, HAUTEUR_SVG, LARGEUR_SVG, projeter3DVersPixel } from "../../ui/solide3DSketch";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceOmbreSoleil } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceOmbreSoleil>` pour gen41 (Ombre au soleil —
 * projection parallèle, `AppOmbreSoleil.tsx`) — voir `generateurs/analyseFonction/exportWord.ts`
 * pour le mécanisme générique de référence.
 *
 * **Écran → papier, adaptation « choix » → « tracé »** : à l'écran, l'élève choisit parmi 4 candidats
 * dessinés ; sur papier, il TRACE lui-même la construction (rayon parallèle au rayon de référence,
 * trace au sol parallèle à l'ombre de référence, intersection). L'énoncé montre la scène sans
 * l'ombre à trouver, la correction reprend l'image de l'écran de conclusion (`elementsConclusion`,
 * obstacle touché en vert, contour de l'ombre du campanile).
 *
 * **Aucune valeur numérique** (ni énoncé ni correction) : la direction de la lumière n'est jamais
 * chiffrée, la correction désigne les points étiquetés sur la figure.
 *
 * **Géométrie réutilisée, jamais réinventée** : projection (`ui/solide3DSketch.ts`) et éléments du
 * croquis (`ui/formatOmbreSoleil.ts`) sont les mêmes qu'à l'écran ; seule la rastérisation en
 * `<svg>` à attributs inline (le document de l'évaluation n'a pas accès aux feuilles de style) est
 * écrite ici. Pas `regroupable` : chaque instance a sa scène (`enteteHtml`).
 */

// --- Rendu SVG imprimé de la scène (voir le commentaire de tête ci-dessus) ---

const COULEUR_ARETE_VISIBLE = "#495057";
const COULEUR_ARETE_CACHEE = "#adb5bd";

/** Énoncé : la scène (sol, obstacles, exemple ou paire connue, bâton à résoudre) sans aucune ombre
 * à trouver ; correction : l'image de l'écran de conclusion (`elementsConclusion`). Les sommets à
 * projeter de la variante `directionInconnue` sont repérés par leur nom. */
function elementsFigure(exercice: ExerciceOmbreSoleil, avecOmbre: boolean): ElementsCroquis {
  if (avecOmbre) return elementsConclusion(exercice);
  if (exercice.variante !== "directionInconnue") return elementsScene(exercice);
  const reperes: ElementsCroquis = {
    points: exercice.piquets.map((p) => ({ position: { x: p.piquet.base.x, y: p.piquet.base.y, z: p.piquet.hauteur }, label: p.piquet.id, couleur: COULEUR_ARETE_VISIBLE })),
    segments: [],
  };
  return fusionner(elementsScene(exercice), reperes);
}

function construireSvgOmbreSoleil(exercice: ExerciceOmbreSoleil, avecOmbre: boolean): string {
  const solide = solidePourAffichage(exercice);
  const geometrie = calculerGeometrieSolide3D(solide);
  const echelleProjection = calculerEchelleProjection(solide);
  const { points, segments } = elementsFigure(exercice, avecOmbre);

  const traits = geometrie.aretes
    .map((arete) => {
      const [n1, n2] = arete.sommets;
      const p1 = geometrie.sommetsPixel[n1];
      const p2 = geometrie.sommetsPixel[n2];
      const couleur = arete.visible ? COULEUR_ARETE_VISIBLE : COULEUR_ARETE_CACHEE;
      const pointille = arete.visible ? "" : ` stroke-dasharray="4 3"`;
      return `<line x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" stroke="${couleur}" stroke-width="1.6"${pointille}/>`;
    })
    .join("");

  const traitsExtra = segments
    .map((s) => {
      const p1 = projeter3DVersPixel(s.a, echelleProjection);
      const p2 = projeter3DVersPixel(s.b, echelleProjection);
      const pointille = s.pointille ? ` stroke-dasharray="5 4"` : "";
      return `<line x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" stroke="${s.couleur}" stroke-width="1.6"${pointille}/>`;
    })
    .join("");

  const pointsExtra = points
    .map((pt) => {
      const p = projeter3DVersPixel(pt.position, echelleProjection);
      return (
        `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.5" fill="${pt.couleur}"/>` +
        `<text x="${p.x.toFixed(1)}" y="${(p.y - 8).toFixed(1)}" font-size="11" text-anchor="middle" fill="${pt.couleur}">${pt.label}</text>`
      );
    })
    .join("");

  const svg = `<svg width="${LARGEUR_SVG}" height="${HAUTEUR_SVG}" viewBox="0 0 ${LARGEUR_SVG} ${HAUTEUR_SVG}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Scène en perspective cavalière — ombre au soleil">
<rect x="0" y="0" width="${LARGEUR_SVG}" height="${HAUTEUR_SVG}" fill="#ffffff"/>
${traits}
${traitsExtra}
${pointsExtra}
</svg>`;

  // `page-break-inside`/`break-inside` évitent qu'une impression coupe la figure entre deux pages.
  return `<div style="text-align:center;margin:0.6em 0;page-break-inside:avoid;break-inside:avoid;">${svg}</div>`;
}

// --- Consignes (tâche de tracé, voir le commentaire de tête) ---

const METHODE =
  "trace depuis le sommet la parallèle au rayon de référence (trait pointillé), et depuis le pied (le point du sol à sa verticale) la parallèle à l'ombre de référence au sol ; l'ombre du sommet est à l'intersection de ces deux droites";

function consigneOmbreSoleil(exercice: ExerciceOmbreSoleil): string {
  if (exercice.variante === "simple") {
    return `Le soleil éclaire le bâton A comme le bâton E (rayon pointillé, ombre au sol). Construis l'ombre du bâton A : ${METHODE}.`;
  }
  if (exercice.variante === "obstacle") {
    return `Le soleil éclaire le bâton A comme le bâton E (rayon pointillé, ombre au sol). Construis l'ombre du sommet de A (${METHODE}), puis indique où elle s'arrête réellement : sur le sol, ou sur l'un des obstacles — lequel ?`;
  }
  const ids = exercice.piquets.map((p) => p.piquet.id).join(", ");
  return `Le trait pointillé relie le sommet ${exercice.piquetConnu.id} du campanile à son ombre connue : il donne la direction de la lumière. Construis l'ombre des sommets ${ids} (${METHODE}), puis le contour de l'ombre portée du campanile sur le sol.`;
}

// --- Énoncé / correction ---

function construireEnonceOmbreSoleil(instance: ExerciceOmbreSoleil): SectionExercice {
  return {
    enteteHtml: construireSvgOmbreSoleil(instance, false),
    questions: [{ consigne: [texte(consigneOmbreSoleil(instance))], reponse: { type: "lignes", nombre: instance.variante === "obstacle" ? 2 : 0 } }],
  };
}

function construireCorrectionOmbreSoleil(instance: ExerciceOmbreSoleil): BlocCorrection[] {
  const figureCorrigee: BlocCorrection = { type: "html", html: construireSvgOmbreSoleil(instance, true) };
  let detail = texteConclusion(instance);
  if (instance.variante === "obstacle" && instance.indexObstacleTouche !== null) {
    detail = `La trace au sol issue du pied de A passe sous ${libelleObstacle(instance.obstacles[instance.indexObstacleTouche])} (en vert), et le rayon issu du sommet de A le heurte avant d'atteindre le sol. ${detail}`;
  }
  if (instance.variante === "directionInconnue") {
    const ids = [...instance.piquets.map((p) => p.piquet.id), ...instance.ombresAutres.map((o) => o.id)].join(", ");
    detail = `Chaque sommet hors du sol (${ids}) se projette en suivant la direction donnée par la paire connue ; ses ombres sont notées ${ids
      .split(", ")
      .map((id) => `${id}′`)
      .join(", ")}. ${detail}`;
  }
  return [figureCorrigee, { type: "paragraphe", fragments: [texte(detail)] }];
}

export const adaptateurEvaluationOmbreSoleil: AdaptateurFeuilleExercices<ExerciceOmbreSoleil> = {
  titreDocument: "Ombre au soleil — projection parallèle — Évaluation",
  nomFichierBase: "ombre-soleil",
  genererInstance: genererExerciceOmbreSoleil,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as VarianteOmbreSoleil),
  construireEnonce: construireEnonceOmbreSoleil,
  construireCorrection: construireCorrectionOmbreSoleil,
  // `enteteHtml` (la scène) utilisé systématiquement : condition à elle seule déjà exclusive pour
  // `regroupable`, quel que soit le nombre de questions par instance — voir le commentaire de tête.
};

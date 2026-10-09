import type { Point3D } from "../../core/geometrieEspace.types";
import type {
  ExerciceOmbreSoleil,
  ExerciceOmbreSoleilObstacle,
  Piquet,
  VarianteOmbreSoleil,
} from "../../core/ombreSoleil.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { texte } from "../../../export/fragmentsDocx";
import type { PointExtraSolide3D, SegmentExtraSolide3D } from "../../components/Solide3DSketch";
import {
  elementsConclusion,
  elementsExemple,
  pointSommetPiquet,
  segmentPiquet,
  solidePourAffichage,
} from "../../ui/formatOmbreSoleil";
import { calculerEchelleProjection, calculerGeometrieSolide3D, HAUTEUR_SVG, LARGEUR_SVG, projeter3DVersPixel } from "../../ui/solide3DSketch";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceOmbreSoleil } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceOmbreSoleil>` pour gen41 (Ombre au soleil —
 * projection parallèle, `AppOmbreSoleil.tsx`/`moteur/sessionOmbreSoleil.ts`) — voir
 * `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence.
 *
 * **3 variantes** (`CATALOGUE_VARIANTES`, réutilisé tel quel depuis `generateurs/ombreSoleil/index.ts`) :
 * `"simple"` (un piquet, ombre directe sur le sol), `"obstacle"` (un bâton, 1 à 3 solides-obstacles
 * réels), `"directionInconnue"` (direction à déduire d'une paire piquet/ombre déjà connue, puis
 * projection des autres sommets non-sol d'un vrai gabarit — voir `core/ombreSoleil.types.ts`).
 *
 * **Écran → papier, adaptation délibérée "sélection" → "tracé"** : à l'écran, chaque étape
 * (`EtapePointSimple`/`EtapeDirectionOmbre`/`EtapePointOmbre`/`EtapeDirectionInconnue`) fait
 * SÉLECTIONNER l'élève parmi 4 candidats génériques ("Candidat 1".."4", jamais montrés
 * simultanément sur le croquis — voir l'en-tête de `ui/formatOmbreSoleil.ts`), parce que la
 * vérification est catégorielle (aucune saisie libre, spec "Vérification"). Ce mécanisme de boutons
 * ne se transpose pas sur papier : imprimer 4 rayons candidats superposés sur un même sommet
 * rendrait la figure illisible, et la mécanique perdrait tout son sens sans les boutons. La feuille
 * imprimée demande donc à l'élève de TRACER lui-même le rayon lumineux (parallèle à l'exemple déjà
 * fourni) et d'indiquer où il touche une surface — même decision que documentée à l'étape 3 du
 * prompt de cette session, motif déjà établi par `constructionDroite`/`constructionParabole/exportEvaluation.ts`
 * (`construireSvgOmbreSoleil(exercice, false)` pour l'énoncé — scène + exemple SANS l'ombre à
 * trouver, `construireSvgOmbreSoleil(exercice, true)` pour la correction — même scène, ombre(s)
 * tracée(s)). Les CONSIGNE_* de `ui/formatOmbreSoleil.ts` (rédigées pour la sélection, "parmi les 4
 * candidats") sont donc reprises pour leur PARTIE SITUATIONNELLE (le dispositif : piquet, exemple,
 * obstacles) mais leur partie ACTION est réécrite en tâche de tracé — jamais une reformulation du
 * contenu mathématique lui-même, seulement de l'interaction UI→papier.
 *
 * **Aucune valeur numérique nulle part** (ni énoncé ni correction) — respecte à la lettre la règle
 * du générateur ("la direction de lumière n'est JAMAIS montrée numériquement", `ui/formatOmbreSoleil.ts`) :
 * la correction ne fait que désigner les points déjà étiquetés sur la figure corrigée ("Ombre A",
 * "Ombre connue"...), jamais une coordonnée. Conséquence directe : aucun fragment `latex(...)` nulle
 * part dans ce fichier, uniquement `texte(...)` — un cas inédit parmi les adaptateurs du projet mais
 * fidèle au générateur source.
 *
 * **Rendu SVG (`construireSvgOmbreSoleil`) — géométrie RÉUTILISÉE, jamais réinventée** : la
 * projection en perspective cavalière (visibilité des arêtes, mise à l'échelle dynamique du viewBox,
 * projection d'un point 3D annexe) vient telle quelle de `ui/solide3DSketch.ts`
 * (`calculerGeometrieSolide3D`/`calculerEchelleProjection`/`projeter3DVersPixel`/`LARGEUR_SVG`/`HAUTEUR_SVG`
 * — les MÊMES fonctions pures déjà consommées par `components/Solide3DSketch.tsx`, seule la
 * rastérisation finale en primitives `<svg>` avec attributs inline (jamais de classe CSS, le
 * document HTML autonome de l'évaluation n'a pas accès à `App.css`) est écrite ici. Les éléments
 * annexes affichés (exemple grisé, piquet(s)/bâton à résoudre, ombre(s) déjà résolue(s)) viennent
 * eux aussi tels quels de `ui/formatOmbreSoleil.ts` (`elementsExemple`/`elementsConclusion`/
 * `pointSommetPiquet`/`segmentPiquet`/`solidePourAffichage`) — les MÊMES fonctions déjà utilisées par
 * `EtapePointOmbre.tsx`/`EtapeDirectionInconnue.tsx`/`EtapeConclusionOmbreSoleil.tsx`, jamais une
 * seconde géométrie divergente. Seule exception : la paire "connue" de la variante `directionInconnue`
 * (`piquetConnu`/`ombreConnue`) est reconstruite ici à la main avec le label "Ombre connue" (comme
 * `EtapeDirectionInconnue.tsx` le fait déjà lui-même, plutôt que `elementsExemple`, qui labelliserait
 * à tort ce point "Exemple").
 *
 * **RÈGLE COUCHE A/B RESPECTÉE** : ce fichier n'importe JAMAIS `moteur/*` directement — seulement
 * `./index` (Couche A, générateur→générateur) et `ui/formatOmbreSoleil.ts`/`ui/solide3DSketch.ts`
 * (couche présentation, qui dépend librement des couches inférieures, CLAUDE.md). Aucune logique
 * géométrique n'a dû être dupliquée ici (contrairement à `distanceDroite/exportEvaluation.ts`) : la
 * correction ne fait que RESYNTHÉTISER les champs déjà calculés par la Couche A sur l'instance tirée
 * (`exercice.piquet.ombre`, `exercice.ombre`, `exercice.indexObstacleTouche`, `exercice.piquets[].ombre`...),
 * jamais recalculée indépendamment.
 *
 * **Une seule question par instance, mais PAS `regroupable`** : chaque instance produit UNE tâche de
 * tracé globale (voir ci-dessus — la "boucle" à l'écran des variantes `obstacle`/`directionInconnue`
 * est collapsée en une seule figure/consigne, tous les obstacles/piquets déjà fusionnés dans
 * `solidePourAffichage`), mais `construireEnonceOmbreSoleil` utilise `enteteHtml` (la scène) — condition
 * à elle seule déjà exclusive pour `regroupable`, quel que soit le nombre de questions (voir la doc
 * de `AdaptateurFeuilleExercices.regroupable`, `genererFeuilleExercices.ts`, et
 * `equationParabole/exportEvaluation.ts` pour le même raisonnement).
 */

// --- Rendu SVG imprimé de la scène (voir le commentaire de tête ci-dessus) ---

const COULEUR_ARETE_VISIBLE = "#495057";
const COULEUR_ARETE_CACHEE = "#adb5bd";
const COULEUR_EXEMPLE = "#868e96";

/** La paire "connue" de la variante `directionInconnue` — même construction que
 * `EtapeDirectionInconnue.tsx` (jamais `elementsExemple`, qui labelliserait l'ombre "Exemple" plutôt
 * que "Ombre connue"). Toujours présente sur la figure, énoncé ET correction, ce n'est PAS une
 * inconnue à trouver mais la donnée de départ de l'exercice. */
function elementsPaireConnueDirectionInconnue(piquetConnu: Piquet, ombreConnue: Point3D): { points: PointExtraSolide3D[]; segments: SegmentExtraSolide3D[] } {
  const sommet = pointSommetPiquet(piquetConnu, COULEUR_EXEMPLE);
  return {
    points: [sommet, { position: ombreConnue, label: "Ombre connue", couleur: COULEUR_EXEMPLE }],
    segments: [segmentPiquet(piquetConnu, COULEUR_EXEMPLE), { a: sommet.position, b: ombreConnue, couleur: COULEUR_EXEMPLE, pointille: true }],
  };
}

/** Éléments "donnés" toujours visibles (exemple grisé pour `simple`/`obstacle`, paire connue pour
 * `directionInconnue`) — établissent visuellement la direction de la lumière SANS jamais la
 * chiffrer, présents identiquement sur l'énoncé et la correction. */
function elementsDonnes(exercice: ExerciceOmbreSoleil): { points: PointExtraSolide3D[]; segments: SegmentExtraSolide3D[] } {
  if (exercice.variante === "directionInconnue") {
    return elementsPaireConnueDirectionInconnue(exercice.piquetConnu, exercice.ombreConnue);
  }
  return elementsExemple(exercice.piquetExemple, exercice.ombreExemple);
}

/** Le(s) piquet(s)/bâton à résoudre, montrés SANS leur ombre (sommet + segment vertical uniquement)
 * — l'état "énoncé", avant que l'élève ne trace le rayon lumineux. */
function elementsARésoudre(exercice: ExerciceOmbreSoleil): { points: PointExtraSolide3D[]; segments: SegmentExtraSolide3D[] } {
  if (exercice.variante === "simple") {
    const piquet = exercice.piquet.piquet;
    return { points: [pointSommetPiquet(piquet)], segments: [segmentPiquet(piquet)] };
  }
  if (exercice.variante === "obstacle") {
    return { points: [pointSommetPiquet(exercice.baton)], segments: [segmentPiquet(exercice.baton)] };
  }
  const points: PointExtraSolide3D[] = [];
  const segments: SegmentExtraSolide3D[] = [];
  for (const p of exercice.piquets) {
    points.push(pointSommetPiquet(p.piquet));
    segments.push(segmentPiquet(p.piquet));
  }
  return { points, segments };
}

/** Éléments complets d'une figure (donnés + à-résoudre-sans-ombre pour l'énoncé, donnés +
 * conclusion déjà résolue — réutilisée telle quelle de `ui/formatOmbreSoleil.ts` — pour la
 * correction). */
function elementsFigure(exercice: ExerciceOmbreSoleil, avecOmbre: boolean): { points: PointExtraSolide3D[]; segments: SegmentExtraSolide3D[] } {
  const donnes = elementsDonnes(exercice);
  const reste = avecOmbre ? elementsConclusion(exercice) : elementsARésoudre(exercice);
  return { points: [...donnes.points, ...reste.points], segments: [...donnes.segments, ...reste.segments] };
}

/**
 * `<svg>` autonome de la scène — perspective cavalière (arêtes visibles en trait plein, cachées en
 * pointillé clair, jamais d'étiquette de sommet — même convention que tout écran de ce générateur,
 * `labelsSommets={false}`), avec les points/segments annexes (exemple ou paire connue, piquet(s) à
 * résoudre, ombre(s) si `avecOmbre`) en couleur, tous calculés dans le MÊME repère pixel que le
 * solide (`calculerEchelleProjection`/`projeter3DVersPixel`, voir le commentaire de tête). `avecOmbre=false`
 * pour l'énoncé (scène + exemple, ombre à trouver PAS encore tracée), `avecOmbre=true` pour la
 * correction (ombre(s) tracée(s) — `elementsConclusion`, le même résultat que l'écran de conclusion
 * interactif `EtapeConclusionOmbreSoleil.tsx`).
 */
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
      const largeur = arete.visible ? 1.6 : 1.2;
      return `<line x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" stroke="${couleur}" stroke-width="${largeur}"${pointille}/>`;
    })
    .join("");

  const traitsExtra = segments
    .map((s) => {
      const p1 = projeter3DVersPixel(s.a, echelleProjection);
      const p2 = projeter3DVersPixel(s.b, echelleProjection);
      const pointille = s.pointille ? ` stroke-dasharray="5 4"` : "";
      return `<line x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" stroke="${s.couleur}" stroke-width="1.8"${pointille}/>`;
    })
    .join("");

  const pointsExtra = points
    .map((pt) => {
      const p = projeter3DVersPixel(pt.position, echelleProjection);
      return (
        `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4" fill="${pt.couleur}"/>` +
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

  // `page-break-inside`/`break-inside` évitent qu'une impression coupe la figure entre deux pages —
  // même précaution que `equationParabole`/`comparaisonVecteurs/exportEvaluation.ts`.
  return `<div style="text-align:center;margin:0.6em 0;page-break-inside:avoid;break-inside:avoid;">${svg}</div>`;
}

// --- Consignes (partie situationnelle reprise de `ui/formatOmbreSoleil.ts`, action réécrite en
// tâche de tracé — voir le commentaire de tête) ---

const CONSIGNE_SIMPLE =
  "Un piquet vertical projette une ombre sur le sol, dans la direction du soleil illustrée par l'exemple ci-dessus (piquet E, rayon pointillé). Trace, depuis le sommet du piquet, le rayon lumineux PARALLÈLE à celui de l'exemple, et indique le point où il touche le sol.";

const CONSIGNE_OBSTACLE =
  "Le bâton représenté ci-dessus projette une ombre dans la direction du soleil illustrée par l'exemple (piquet E, rayon pointillé). Trace, depuis son sommet, le rayon lumineux PARALLÈLE à celui de l'exemple, et détermine où cette ombre touche réellement une surface : le sol, ou l'un des obstacles représentés — et si c'est un obstacle, lequel.";

const CONSIGNE_DIRECTION_INCONNUE_PLUSIEURS =
  "Le trait pointillé ci-dessus relie un sommet du solide à son ombre déjà connue : il indique la direction réelle de la lumière (à déduire, jamais à deviner). Trace, depuis chacun des AUTRES sommets du solide non situés au sol, le rayon PARALLÈLE à cette direction, et indique où chacun touche le sol.";

const CONSIGNE_DIRECTION_INCONNUE_AUCUN =
  "Le trait pointillé ci-dessus relie l'unique sommet non situé au sol du solide à son ombre déjà connue : il indique la direction réelle de la lumière (à déduire, jamais à deviner). Ce solide n'a aucun autre sommet non situé au sol à projeter — justifie que le rayon tracé est bien le seul possible.";

function consigneOmbreSoleil(exercice: ExerciceOmbreSoleil): string {
  if (exercice.variante === "simple") return CONSIGNE_SIMPLE;
  if (exercice.variante === "obstacle") return CONSIGNE_OBSTACLE;
  return exercice.piquets.length > 0 ? CONSIGNE_DIRECTION_INCONNUE_PLUSIEURS : CONSIGNE_DIRECTION_INCONNUE_AUCUN;
}

// --- Énoncé / correction ---

function construireEnonceOmbreSoleil(instance: ExerciceOmbreSoleil): SectionExercice {
  return {
    enteteHtml: construireSvgOmbreSoleil(instance, false),
    questions: [{ consigne: [texte(consigneOmbreSoleil(instance))], reponse: { type: "lignes", nombre: 0 } }],
  };
}

/** Décrit le type d'un obstacle en français — jamais une valeur du champ interne `type` affichée
 * telle quelle. */
function libelleTypeObstacle(type: ExerciceOmbreSoleilObstacle["obstacles"][number]["obstacle"]["type"]): string {
  return type === "escalier" ? "un escalier" : "une caisse";
}

function construireCorrectionOmbreSoleil(instance: ExerciceOmbreSoleil): BlocCorrection[] {
  const figureCorrigee: BlocCorrection = { type: "html", html: construireSvgOmbreSoleil(instance, true) };

  if (instance.variante === "simple") {
    const id = instance.piquet.piquet.id;
    return [
      figureCorrigee,
      {
        type: "paragraphe",
        fragments: [
          texte(
            `Le rayon tracé depuis le sommet du piquet ${id}, parallèle à celui de l'exemple E, touche le sol au point marqué « Ombre ${id} » ci-dessus — c'est l'ombre du piquet ${id}.`,
          ),
        ],
      },
    ];
  }

  if (instance.variante === "obstacle") {
    const id = instance.baton.id;
    const touche = instance.indexObstacleTouche;
    const texteResultat =
      touche === null
        ? `Le rayon tracé depuis le sommet du bâton ${id} ne rencontre aucun obstacle sur son trajet : son ombre atteint directement le sol, au point marqué « Ombre ${id} » ci-dessus.`
        : `Le rayon tracé depuis le sommet du bâton ${id} rencontre, sur son trajet vers le sol, ${libelleTypeObstacle(instance.obstacles[touche].obstacle.type)} (le premier obstacle réellement touché parmi ceux représentés) : l'ombre de ${id} s'arrête donc sur cette surface, au point marqué « Ombre ${id} » ci-dessus, jamais au sol.`;
    return [figureCorrigee, { type: "paragraphe", fragments: [texte(texteResultat)] }];
  }

  // directionInconnue
  if (instance.piquets.length === 0) {
    return [
      figureCorrigee,
      {
        type: "paragraphe",
        fragments: [
          texte(
            "Ce gabarit n'a qu'un seul sommet non situé au sol (l'apex) : c'est justement le sommet déjà donné avec son ombre. Il n'y a donc aucun autre sommet à projeter — l'exercice se limitait à lire correctement la direction sur la paire déjà fournie.",
          ),
        ],
      },
    ];
  }
  const listeIds = instance.piquets.map((p) => p.piquet.id).join(", ");
  return [
    figureCorrigee,
    {
      type: "paragraphe",
      fragments: [
        texte(
          `Chaque autre sommet non situé au sol (${listeIds}) projette son ombre en traçant depuis ce sommet le rayon PARALLÈLE à la direction connue (le trait pointillé reliant le sommet donné à son ombre connue) : les points obtenus sont marqués « Ombre ${instance.piquets[0].piquet.id} », etc. ci-dessus, un par sommet.`,
        ),
      ],
    },
  ];
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

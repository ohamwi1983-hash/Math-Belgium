import type { ExerciceOmbreSoleil, VarianteOmbreSoleil } from "../../core/ombreSoleil.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, EnoncePapier, EtapeCorrection, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { texte } from "../../../export/fragmentsDocx";
import {
  AIDE_POINT_SIMPLE,
  elementsConclusion,
  elementsScene,
  fusionner,
  libelleObstacle,
  solidePourAffichage,
  texteConclusion,
} from "../../ui/formatOmbreSoleil";
import type { ElementsCroquis } from "../../ui/formatOmbreSoleil";
import { calculerEchelleProjection, calculerGeometrieSolide3D, HAUTEUR_SVG, LARGEUR_SVG, projeter3DVersPixel } from "../../ui/solide3DSketch";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceOmbreSoleil } from "./index";
import { profilOmbreSoleil } from "../profilsEvaluation4eCh8";

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
        `<text x="${p.x.toFixed(1)}" y="${(p.y - 8).toFixed(1)}" font-size="13" font-weight="700" text-anchor="middle" fill="${pt.couleur}">${pt.label}</text>`
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

// --- Énoncé papier et étapes ---

/** Contexte de la scène (ce que montre la figure), sans méthode. */
function contexteScene(exercice: ExerciceOmbreSoleil): string {
  if (exercice.variante === "directionInconnue") {
    const k = exercice.piquetConnu.id;
    return `L'ombre du sommet ${k} du campanile est connue : les deux traits pointillés relient ce sommet ${k}, puis son pied (le point du sol à sa verticale), à son ombre ${k}′ sur le sol. Ils donnent la direction de la lumière du soleil et celle des ombres au sol.`;
  }
  const exemple = "Le soleil éclaire le bâton A comme le bâton E : le trait pointillé est le rayon qui passe par le sommet de E, et l'ombre de E au sol va de son pied jusqu'à E′.";
  return exercice.variante === "obstacle" ? `${exemple} Des obstacles sont posés sur le sol.` : exemple;
}

function sommetsAProjeter(exercice: Extract<ExerciceOmbreSoleil, { variante: "directionInconnue" }>): string {
  const ids = exercice.piquets.map((p) => p.piquet.id);
  return ids.length > 1 ? `${ids.slice(0, -1).join(", ")} et ${ids[ids.length - 1]}` : ids[0];
}

function consignePapier(exercice: ExerciceOmbreSoleil): string {
  if (exercice.variante === "simple") return "Construis l'ombre du bâton A au soleil ; nomme A′ l'ombre de son sommet.";
  if (exercice.variante === "obstacle") return "Construis l'ombre du bâton A (nomme A′ l'ombre de son sommet) et indique où elle s'arrête : sur le sol, ou sur un obstacle — lequel ?";
  const autres = exercice.ombresAutres.length > 0 ? ", puis, par le même procédé, celles des autres sommets utiles," : ",";
  return `Construis les ombres des sommets ${sommetsAProjeter(exercice)} du campanile${autres} et trace le contour de l'ombre portée du campanile sur le sol.`;
}

/** Étapes du raisonnement, une par écran du générateur (titres « Étape n — … » du corrigé). */
function consignesEtapes(exercice: ExerciceOmbreSoleil): string[] {
  if (exercice.variante === "simple") return ["Construis l'ombre A′ du sommet du bâton A, puis l'ombre du bâton."];
  if (exercice.variante === "obstacle") {
    return [
      "Trace le rayon issu du sommet du bâton A, parallèle au rayon de l'exemple (du sommet de E à E′).",
      "Trouve le point A′ où l'ombre du sommet de A s'arrête réellement : sur un obstacle, ou sur le sol.",
    ];
  }
  const premier = exercice.piquets[0].piquet.id;
  return [
    `Trace le rayon issu du sommet ${premier}, dans la direction de la lumière (parallèle au rayon ${exercice.piquetConnu.id}${exercice.piquetConnu.id}′).`,
    ...exercice.piquets.map((p) => `Construis l'ombre ${p.piquet.id}′ du sommet ${p.piquet.id}.`),
    exercice.ombresAutres.length > 0
      ? "Construis de même les ombres des autres sommets utiles, puis trace le contour de l'ombre portée du campanile sur le sol."
      : "Trace le contour de l'ombre portée du campanile sur le sol.",
  ];
}

function construireEnonceOmbreSoleil(instance: ExerciceOmbreSoleil): SectionExercice {
  return {
    enteteFragments: [texte(contexteScene(instance))],
    enteteHtml: construireSvgOmbreSoleil(instance, false),
    questions: consignesEtapes(instance).map((c) => ({ consigne: [texte(c)] })),
  };
}

function construireCorrectionOmbreSoleil(instance: ExerciceOmbreSoleil): BlocCorrection[] {
  const figureCorrigee: BlocCorrection = { type: "html", html: construireSvgOmbreSoleil(instance, true) };
  let detail = texteConclusion(instance);
  if (instance.variante === "obstacle" && instance.indexObstacleTouche !== null) {
    detail = `La trace au sol issue du pied de A passe sous ${libelleObstacle(instance.obstacles[instance.indexObstacleTouche])}. ${detail}`;
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

// ============================================================================
// Feuilles enrichies (difficulté, réponse brève, corrigé détaillé, barème, énoncé papier). Méthodes =
// les aides de niveau 1 de l'écran (`ui/formatOmbreSoleil.ts`), figure = l'écran de conclusion.
// ============================================================================

const LETTRES = "abcdefghij";

const sansMethode = (t: string) => t.replace(/^Méthode : /, "");
const majuscule = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

function difficulteOmbreSoleil(exercice: ExerciceOmbreSoleil): 1 | 2 | 3 {
  if (exercice.variante === "simple") return 1;
  if (exercice.variante === "obstacle") return exercice.indexObstacleTouche === null ? 2 : 3;
  return 3;
}

function reponseBreveOmbreSoleil(exercice: ExerciceOmbreSoleil): FragmentConsigne[] {
  if (exercice.variante === "simple") return [texte("Ombre du bâton A : du pied de A jusqu'à A′, parallèle à l'ombre de E (voir la figure du corrigé).")];
  if (exercice.variante === "obstacle") {
    return [
      texte(
        exercice.indexObstacleTouche === null
          ? "L'ombre du sommet de A atteint le sol (le rayon passe au-dessus des obstacles)."
          : `L'ombre du sommet de A s'arrête sur ${libelleObstacle(exercice.obstacles[exercice.indexObstacleTouche])}.`,
      ),
    ];
  }
  return [texte(`Ombres ${exercice.piquets.map((p) => `${p.piquet.id}′`).join(", ")} et contour de l'ombre portée : voir la figure du corrigé.`)];
}

function correctionDetailleeOmbreSoleil(exercice: ExerciceOmbreSoleil): EtapeCorrection[] {
  const figure = construireSvgOmbreSoleil(exercice, true);
  const conclusion = construireCorrectionOmbreSoleil(exercice)[1];
  const texteConclusionDetail = conclusion.type === "paragraphe" ? conclusion.fragments : [texte(texteConclusion(exercice))];
  if (exercice.variante === "simple") {
    return [
      { label: "Méthode", sousQuestion: "a", fragments: [texte(majuscule(sansMethode(AIDE_POINT_SIMPLE[0])))] },
      { label: "Conclusion", sousQuestion: "a", fragments: texteConclusionDetail, figureHtml: figure },
      { label: "Piège", sousQuestion: "a", fragments: [texte("Le rayon part du SOMMET du bâton, la trace au sol part de son PIED : les échanger, ou tracer la trace au sol depuis le pied de E, donne une ombre trop courte ou trop longue.")] },
    ];
  }
  if (exercice.variante === "obstacle") {
    const auSol = exercice.indexObstacleTouche === null;
    return [
      {
        label: "Méthode",
        sousQuestion: "a",
        fragments: [texte("Les rayons du soleil sont parallèles, et des droites parallèles restent parallèles sur le dessin : le rayon issu du sommet de A a la même inclinaison et le même sens que le rayon pointillé de l'exemple.")],
      },
      { label: "Construction", sousQuestion: "a", fragments: [texte("Depuis le sommet de A, on trace la parallèle au rayon de l'exemple (du sommet de E vers E′), dans le même sens.")] },
      {
        label: "Méthode",
        sousQuestion: "b",
        fragments: [
          texte(
            "On suit la trace au sol issue du pied de A (parallèle à l'ombre de E) ; pour chaque obstacle qu'elle traverse, on regarde si le rayon passe au-dessus ou s'il le heurte. L'ombre s'arrête sur la PREMIÈRE surface que le rayon touche.",
          ),
        ],
      },
      { label: "Conclusion", sousQuestion: "b", fragments: texteConclusionDetail, figureHtml: figure },
      {
        label: "Piège",
        sousQuestion: "b",
        fragments: [
          texte(
            auSol
              ? "Un obstacle traversé par la trace au sol n'arrête l'ombre que si le rayon le heurte : ici le rayon passe au-dessus, l'ombre va jusqu'au sol."
              : "L'ombre s'arrête sur la PREMIÈRE surface que le rayon touche : ne pas la prolonger jusqu'au sol à travers l'obstacle.",
          ),
        ],
      },
    ];
  }
  const k = exercice.piquetConnu.id;
  const etapes: EtapeCorrection[] = [
    { label: "Méthode", sousQuestion: "a", fragments: [texte(`La lumière va du sommet ${k} vers son ombre ${k}′ : tous les rayons sont parallèles au rayon pointillé ${k}${k}′ et de même sens (vers le sol, du côté de l'ombre).`)] },
    { label: "Construction", sousQuestion: "a", fragments: [texte(`Depuis chaque sommet à projeter, on trace la parallèle au rayon ${k}${k}′, dirigée vers le sol du même côté que ${k}′.`)] },
  ];
  exercice.piquets.forEach((p, i) => {
    const id = p.piquet.id;
    etapes.push({
      label: "Construction",
      sousQuestion: LETTRES[i + 1],
      fragments: [texte(`${id}′ est à l'intersection du rayon issu de ${id} (parallèle à ${k}${k}′) et de la trace au sol issue du pied de ${id} (le point du sol à sa verticale), parallèle à la trace au sol qui mène à ${k}′.`)],
    });
  });
  const fin = LETTRES[exercice.piquets.length + 1];
  etapes.push({ label: "Conclusion", sousQuestion: fin, fragments: texteConclusionDetail, figureHtml: figure });
  etapes.push({
    label: "Piège",
    sousQuestion: LETTRES[1],
    fragments: [texte("La trace au sol part du PIED du sommet (le point du sol à sa verticale), pas d'un coin de la base pris au hasard : sans ce pied, l'intersection avec le rayon n'a pas de sens.")],
  });
  return etapes;
}

function baremeOmbreSoleil(exercice: ExerciceOmbreSoleil): BaremeExercice {
  const reponseFinale = reponseBreveOmbreSoleil(exercice);
  if (exercice.variante === "simple") {
    return {
      reponseFinale,
      criteres: [
        { sousQuestion: "a", critere: [texte("Rayon issu du sommet de A, parallèle au rayon de l'exemple")], points: 1.5 },
        { sousQuestion: "a", critere: [texte("Trace au sol issue du pied de A, parallèle à l'ombre de E")], points: 1.5 },
        { sousQuestion: "a", critere: [texte("A′ à l'intersection des deux droites, ombre du bâton tracée")], points: 1 },
      ],
      erreursFrequentes: [{ description: [texte("Ombre de A tracée de même longueur que celle de E (bâtons de hauteurs différentes)")], cout: "−1" }],
      reponsesAcceptees: [[texte("Construction juste sans tracer les droites en entier, si A′ est bien placé")]],
    };
  }
  if (exercice.variante === "obstacle") {
    const auSol = exercice.indexObstacleTouche === null;
    return {
      reponseFinale,
      criteres: [
        { sousQuestion: "a", critere: [texte("Rayon issu du sommet de A, parallèle au rayon de l'exemple")], points: 1 },
        { sousQuestion: "b", critere: [texte("Trace au sol issue du pied de A, parallèle à l'ombre de E")], points: 1 },
        { sousQuestion: "b", critere: [texte(auSol ? "Rayon reconnu au-dessus des obstacles" : `Premier obstacle heurté : ${libelleObstacle(exercice.obstacles[exercice.indexObstacleTouche!])}`)], points: 1 },
        { sousQuestion: "b", critere: [texte(auSol ? "A′ placé au sol, ombre du bâton tracée" : "A′ placé sur la surface de l'obstacle")], points: 1 },
      ],
      erreursFrequentes: [
        { description: [texte(auSol ? "Ombre arrêtée sur un obstacle que le rayon survole" : "Ombre prolongée jusqu'au sol à travers l'obstacle")], cout: "0 pt sur le point A′" },
        { description: [texte("Rayon non parallèle au rayon de l'exemple")], cout: "0 pt sur a), suite notée sans double pénalité" },
      ],
    };
  }
  const fin = LETTRES[exercice.piquets.length + 1];
  return {
    reponseFinale,
    criteres: [
      { sousQuestion: "a", critere: [texte(`Direction de la lumière reportée depuis chaque sommet (parallèle à ${exercice.piquetConnu.id}${exercice.piquetConnu.id}′)`)], points: 1 },
      { sousQuestion: "b", critere: [texte(`Ombres ${exercice.piquets.map((p) => `${p.piquet.id}′`).join(", ")} : intersection du rayon et de la trace au sol issue du pied`)], points: 2 },
      {
        sousQuestion: fin,
        critere: [texte(exercice.ombresAutres.length > 0 ? `Ombres des autres sommets (${exercice.ombresAutres.map((o) => `${o.id}′`).join(", ")}) et contour de l'ombre portée tracés` : "Contour de l'ombre portée tracé (base et ombres des sommets)")],
        points: 1,
      },
    ],
    erreursFrequentes: [
      { description: [texte("Trace au sol issue d'un coin de la base au lieu du pied du sommet")], cout: "0 pt sur l'ombre de ce sommet" },
      { description: [texte("Rayon tracé dans le sens opposé (vers le haut)")], cout: "0 pt sur a)" },
    ],
  };
}

function enoncePapierOmbreSoleil(exercice: ExerciceOmbreSoleil): EnoncePapier {
  return {
    section: {
      enteteFragments: [texte(contexteScene(exercice))],
      enteteHtml: construireSvgOmbreSoleil(exercice, false),
      questions: [{ consigne: [texte(consignePapier(exercice))] }],
    },
    etapesParQuestion: [consignesEtapes(exercice).map((_, i) => LETTRES[i])],
  };
}

export const adaptateurEvaluationOmbreSoleil: AdaptateurFeuilleExercices<ExerciceOmbreSoleil> = {
  titreDocument: "Ombre au soleil — projection parallèle — Évaluation",
  nomFichierBase: "ombre-soleil",
  genererInstance: genererExerciceOmbreSoleil,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as VarianteOmbreSoleil),
  construireEnonce: construireEnonceOmbreSoleil,
  construireCorrection: construireCorrectionOmbreSoleil,
  difficulte: difficulteOmbreSoleil,
  reponseBreve: reponseBreveOmbreSoleil,
  correctionDetaillee: correctionDetailleeOmbreSoleil,
  bareme: baremeOmbreSoleil,
  enoncePapier: enoncePapierOmbreSoleil,
  dureeMinutes: 6,
  profilInstance: profilOmbreSoleil,
  // `enteteHtml` (la scène) utilisé systématiquement : condition à elle seule déjà exclusive pour
  // `regroupable`, quel que soit le nombre de questions par instance — voir le commentaire de tête.
};

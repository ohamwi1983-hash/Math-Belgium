import type { ExerciceSectionPlaneSolide, PointSectionExercice } from "../../core/sectionPlaneSolide.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { texte } from "../../../export/fragmentsDocx";
import { libelleFace, libellePoint, pointsExtraConnus, segmentsExtraTraces, TEXTE_AIDE_AUXILIAIRE_NIVEAU1, TEXTE_AIDE_SEGMENT_NIVEAU1 } from "../../ui/formatSectionPlaneSolide";
import { calculerAretesAvecVisibilite, calculerEchelleProjection, calculerLabelsSommetsPixel, calculerSommetsPixel, HAUTEUR_SVG, LARGEUR_SVG, projeter3DVersPixel } from "../../ui/solide3DSketch";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceSectionPlaneSolide } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceSectionPlaneSolide>` pour gen40 ("Section plane
 * d'un solide", `AppSectionPlaneSolide.tsx`/chapitre "Géométrie dans l'espace", 4e) — voir
 * `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence,
 * `generateurs/constructionParabole/exportEvaluation.ts` pour le patron "SVG de construction
 * géométrique, non tracée en énoncé / tracée en correction" suivi ici, et
 * `generateurs/lieuxGeometriques/exportEvaluation.ts` pour le patron de correction resynthétisée en
 * plusieurs étapes de raisonnement.
 *
 * **Aucune donnée recalculée indépendamment** : contrairement à `distanceDroite`/`lieuxGeometriques`,
 * ce générateur n'a besoin d'AUCUNE logique de Couche B dupliquée ici — `ExerciceSectionPlaneSolide`
 * (`core/sectionPlaneSolide.types.ts`) porte déjà la vérité terrain COMPLÈTE du polygone de section
 * (`points`, `ordreCyclique`, `facesCroisees`, `idsDepart`), calculée une seule fois par
 * `generateurs/sectionPlaneSolide/polygoneSection.ts` (Couche A) à la génération. La correction ne
 * fait donc que PRÉSENTER ces champs déjà corrects, jamais recalculer une intersection/un point
 * auxiliaire soi-même — `moteur/verificationSectionPlaneSolide.ts`/`moteur/sessionSectionPlaneSolide.ts`
 * ne sont NI importés NI dupliqués ici (règle Couche A ↔ Couche B non négociable, CLAUDE.md) : ils ne
 * font que rejouer, côté état vivant d'une session interactive, un sous-ensemble de ce que
 * `points`/`ordreCyclique` connaissent déjà intégralement.
 *
 * **Étiquetage des sommets P/Q/R/S/T/…** : réutilise directement `ui/formatSectionPlaneSolide.ts::libellePoint`
 * (déjà exportée, pure, prend un tableau ordonné `connus` et un id) plutôt que de dupliquer sa
 * logique — mais lui passe un ordre synthétique `ordreLabelsDepuisExercice` (P, Q, R d'abord — même
 * ordre que `idsDepart`/l'état initial réel d'une session interactive, voir
 * `moteur/sessionSectionPlaneSolide.ts::demarrerSessionSectionPlaneSolide` — puis les points restants
 * dans l'ordre cyclique du polygone) plutôt que le véritable ordre de découverte d'une session jouée
 * (qui dépend des choix libres de l'élève à l'écran B, donc n'existe pas pour une instance générée
 * hors session). Ce choix ne change RIEN à la validité de l'étiquetage : `libellePoint` n'exige
 * aucune propriété de l'ordre fourni au-delà d'être une permutation valide des ids, seule la LETTRE
 * P/Q/R étant garantie par construction (elle occupe toujours les 3 premières positions).
 * `ui/formatSectionPlaneSolide.ts::pointsExtraConnus`/`segmentsExtraTraces` sont réutilisées de la
 * même façon pour obtenir les points/segments à dessiner (positions 3D + label + couleur hex déjà
 * calculée, `COULEUR_CONNU`/`COULEUR_SELECTION` — PAS des classes CSS, voir plus bas) plutôt que de
 * redériver soi-même ce mapping id → position/étiquette.
 *
 * **SVG autonome, PAS `Solide3DSketch.tsx`** : ce composant React s'appuie sur des classes CSS
 * (`solide3d-arete`, `solide3d-sommet-point`…) définies dans `App.css`, inaccessible au document HTML
 * autonome de l'évaluation (`export/assemblerEvaluationHtml.ts` n'injecte aucune feuille de style du
 * site). `construireSvgSectionPlaneSolide` ci-dessous réécrit donc son propre petit moteur de tracé
 * `<svg>` (même précédent que `constructionParabole`/`constructionVectorielle`/`triangleLies` —
 * chacun le sien, aucun moteur générique partagé dans `export/`), avec `fill`/`stroke` TOUJOURS en
 * attributs inline directs, jamais de classe CSS — mais RÉUTILISE INTÉGRALEMENT la géométrie pure
 * déjà partagée par l'écran interactif, `ui/solide3DSketch.ts` (`calculerSommetsPixel`,
 * `calculerLabelsSommetsPixel`, `calculerAretesAvecVisibilite`, `calculerEchelleProjection`,
 * `projeter3DVersPixel`, `LARGEUR_SVG`/`HAUTEUR_SVG`) : AUCUNE trigonométrie de perspective cavalière
 * n'est réécrite ici. `ui/solide3DSketch.ts::calculerPolygonePlan` n'est PAS utilisée : elle ne
 * fonctionne que pour un plan désigné par 3 SOMMETS NOMMÉS du solide (`PlanSolide3D`), alors que le
 * plan de coupe de cet exercice passe par P/Q/R — 3 points QUELCONQUES sur des arêtes, jamais des
 * sommets — le polygone de section est donc projeté point par point depuis `exercice.points` (déjà
 * connus, vérité terrain), via `projeter3DVersPixel` + `calculerEchelleProjection(solide)` (même
 * repère pixel que les sommets du solide, jamais un second calcul d'échelle indépendant).
 *
 * **Énoncé SANS le polygone de section, CORRECTION avec** : l'énoncé demande à l'élève de
 * RECONSTRUIRE le polygone de section lui-même (jamais donné tout tracé) — `avecSection=false` dans
 * `construireSvgSectionPlaneSolide` n'affiche donc que le solide et les 3 points de départ P, Q, R
 * (déjà connus dès le début d'une session interactive réelle, voir
 * `demarrerSessionSectionPlaneSolide` : `connus = new Set(idsDepart)` — ce ne sont donc jamais des
 * indices en trop par rapport à l'écran), sans aucun autre sommet ni segment de la section.
 * `avecSection=true` (réservé à la correction) affiche en plus TOUS les sommets de la section
 * (P/Q/R/S/T/…) et les segments qui la referment, dans l'ordre cyclique complet.
 *
 * **Consigne composée, PAS une consigne d'écran existante reprise telle quelle** : aucune des 4
 * consignes d'écran de `ui/formatSectionPlaneSolide.ts` (`CONSIGNE_SEGMENT_DIRECT`,
 * `CONSIGNE_AUXILIAIRE_LIGNES`, `CONSIGNE_AUXILIAIRE_FACE`) ne convient telle quelle : chacune ne
 * couvre qu'UN micro-pas de la boucle interactive ("Sélectionne une face…", "Sélectionne 2
 * droites…"), jamais la tâche complète "reconstruis tout le polygone" qu'une feuille papier doit
 * poser en une seule fois (mêmes raisons que `constructionParabole`, où les 2 phases écran
 * deviennent UNE SEULE question papier). La consigne ci-dessous (`CONSIGNE_PAPIER`) est donc composée
 * d'une phrase d'ouverture générique + des 2 textes de MÉTHODE déjà écrits pour les aides de niveau 1
 * des 2 écrans (`TEXTE_AIDE_SEGMENT_NIVEAU1`, `TEXTE_AIDE_AUXILIAIRE_NIVEAU1`), réutilisés TELS QUELS
 * (jamais reformulés) — ce sont déjà des phrases autonomes décrivant le principe géométrique, pas des
 * instructions d'interface ("Sélectionne...").
 *
 * **Correction RESYNTHÉTISÉE** depuis les champs déjà connus et corrects de l'instance tirée
 * (`points`, `ordreCyclique`, `facesCroisees`, `idsDepart`) : nombre de faces traversées, nom du
 * polygone obtenu (quadrilatère/pentagone/hexagone selon `points.length`), arête sur laquelle se
 * trouve chaque sommet, et ordre cyclique complet en repartant de P — jamais une resimulation de
 * l'ordre exact de découverte d'une partie jouée (qui dépendrait de choix libres non déterministes,
 * voir plus haut). Tout point AUTRE que P/Q/R est nécessairement un point auxiliaire (jamais un
 * segment direct, qui ne fait que RELIER 2 points déjà connus sans jamais en découvrir un nouveau —
 * voir `polygoneSection.ts::simulationResoluble` : seule `ciblesAuxiliaires` ajoute un id à `connus`)
 * — la correction l'affirme donc sans avoir besoin de rejouer la résolution.
 *
 * **PAS `regroupable`** — `enteteHtml` (le solide en perspective cavalière) est utilisé, ce qui
 * disqualifie `regroupable` à lui seul (voir la doc du champ, `export/genererFeuilleExercices.ts`),
 * indépendamment du fait que la consigne soit par ailleurs bien générique (`CONSIGNE_PAPIER` ne
 * dépend d'aucune valeur tirée — seul `enteteFragments`/`enteteHtml` varie d'une instance à l'autre).
 *
 * **Catalogue de variantes = les 4 gabarits** (`CATALOGUE_VARIANTES`, déjà exporté par
 * `generateurs/sectionPlaneSolide/index.ts`, RÉUTILISÉ tel quel, jamais un second catalogue
 * dupliqué) : parallélépipède, cube, prisme, tétraèdre — vérifié en lisant `index.ts` EN ENTIER, ce
 * générateur a déjà cette notion de variante (contrairement à `constructionParabole`, qui n'en a
 * aucune) car `SelecteurVarianteDev`/`AppSectionPlaneSolide.tsx` l'exposent déjà.
 */

const COULEUR_ARETE = "#1a1a2e";
const COULEUR_ARETE_CACHEE = "#adb5bd";

const NOMS_POLYGONE: Record<number, string> = {
  3: "triangle",
  4: "quadrilatère",
  5: "pentagone",
  6: "hexagone",
  7: "heptagone",
  8: "octogone",
};

function nomPolygone(k: number): string {
  return NOMS_POLYGONE[k] ?? `polygone à ${k} côtés`;
}

/** P, Q, R d'abord (même ordre que `idsDepart`, l'état initial réel d'une session), puis les autres
 * sommets du polygone dans l'ordre cyclique — voir le commentaire de tête pour pourquoi cet ordre
 * synthétique (pas un ordre de découverte réel) reste un usage valide de `libellePoint`. */
function ordreLabelsDepuisExercice(exercice: ExerciceSectionPlaneSolide): number[] {
  const { idsDepart, ordreCyclique } = exercice;
  const restants = ordreCyclique.filter((id) => !idsDepart.includes(id));
  return [...idsDepart, ...restants];
}

/** `ordreCyclique`, re-décalé pour commencer par P (id `idsDepart[0]`) — même cycle, juste plus
 * lisible en correction papier ("P → … → P") qu'un point de départ arbitraire. */
function ordreCycliqueDepuisP(exercice: ExerciceSectionPlaneSolide): number[] {
  const { idsDepart, ordreCyclique } = exercice;
  const indexP = ordreCyclique.indexOf(idsDepart[0]);
  return [...ordreCyclique.slice(indexP), ...ordreCyclique.slice(0, indexP)];
}

/** Clés `"a-b"` (a<b, même convention que `segmentsExtraTraces`) des `k` segments qui referment le
 * polygone de section — une paire par arête du cycle `ordreCyclique`. */
function segmentsPolygoneCles(exercice: ExerciceSectionPlaneSolide): string[] {
  const { ordreCyclique } = exercice;
  const n = ordreCyclique.length;
  return ordreCyclique.map((id, i) => {
    const suivant = ordreCyclique[(i + 1) % n];
    return id < suivant ? `${id}-${suivant}` : `${suivant}-${id}`;
  });
}

/** Solide en perspective cavalière (arêtes + sommets nommés), TOUJOURS affiché — géométrie
 * intégralement issue de `ui/solide3DSketch.ts`, jamais recalculée ici. */
function construireSvgSolide(exercice: ExerciceSectionPlaneSolide): string {
  const { solide } = exercice;
  const sommetsPixel = calculerSommetsPixel(solide);
  const labelsSommetsPixel = calculerLabelsSommetsPixel(solide);
  const aretes = calculerAretesAvecVisibilite(solide);

  const aretesCacheesHtml = aretes
    .filter((a) => !a.visible)
    .map((a) => {
      const p1 = sommetsPixel[a.sommets[0]];
      const p2 = sommetsPixel[a.sommets[1]];
      return `<line x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" stroke="${COULEUR_ARETE_CACHEE}" stroke-width="1.5" stroke-dasharray="4 3"/>`;
    })
    .join("");

  const aretesVisiblesHtml = aretes
    .filter((a) => a.visible)
    .map((a) => {
      const p1 = sommetsPixel[a.sommets[0]];
      const p2 = sommetsPixel[a.sommets[1]];
      return `<line x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" stroke="${COULEUR_ARETE}" stroke-width="1.75"/>`;
    })
    .join("");

  const sommetsHtml = Object.entries(sommetsPixel)
    .map(([nom, p]) => {
      const label = labelsSommetsPixel[nom];
      return (
        `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="2.5" fill="${COULEUR_ARETE}"/>` +
        `<text x="${label.x.toFixed(1)}" y="${label.y.toFixed(1)}" font-size="13" font-weight="700" fill="${COULEUR_ARETE}">${nom}</text>`
      );
    })
    .join("");

  return `${aretesCacheesHtml}${aretesVisiblesHtml}${sommetsHtml}`;
}

/** Points de section à afficher (P/Q/R seuls en énoncé, tous en correction) + segments de fermeture
 * du polygone (uniquement en correction) — positions/étiquettes/couleurs hex issues de
 * `pointsExtraConnus`/`segmentsExtraTraces` (`ui/formatSectionPlaneSolide.ts`, déjà en couleurs
 * inline, jamais des classes CSS), projetées ici dans le MÊME repère pixel que le solide via
 * `projeter3DVersPixel(_, calculerEchelleProjection(solide))`. */
function construireSvgSectionPlaneSolide(exercice: ExerciceSectionPlaneSolide, avecSection: boolean): string {
  const echelleProjection = calculerEchelleProjection(exercice.solide);
  const idsAffiches = avecSection ? ordreLabelsDepuisExercice(exercice) : exercice.idsDepart;

  let segmentsHtml = "";
  if (avecSection) {
    segmentsHtml = segmentsExtraTraces(exercice, segmentsPolygoneCles(exercice))
      .map((segment) => {
        const p1 = projeter3DVersPixel(segment.a, echelleProjection);
        const p2 = projeter3DVersPixel(segment.b, echelleProjection);
        return `<line x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" stroke="${segment.couleur}" stroke-width="3" stroke-linecap="round"/>`;
      })
      .join("");
  }

  const pointsHtml = pointsExtraConnus(exercice, idsAffiches)
    .map((point) => {
      const p = projeter3DVersPixel(point.position, echelleProjection);
      return (
        `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="5" fill="${point.couleur}" stroke="#ffffff" stroke-width="1.5"/>` +
        `<text x="${p.x.toFixed(1)}" y="${(p.y - 11).toFixed(1)}" font-size="12" font-weight="700" fill="${point.couleur}" text-anchor="middle">${point.label}</text>`
      );
    })
    .join("");

  return `<svg width="${LARGEUR_SVG}" height="${HAUTEUR_SVG}" viewBox="0 0 ${LARGEUR_SVG} ${HAUTEUR_SVG}" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:8px auto 14px;border:1px solid #e6e6f0;border-radius:8px;background:#ffffff;">
<rect x="0" y="0" width="${LARGEUR_SVG}" height="${HAUTEUR_SVG}" fill="#ffffff"/>
${construireSvgSolide(exercice)}
${segmentsHtml}
${pointsHtml}
</svg>`;
}

const CONSIGNE_PAPIER =
  "Le plan de coupe passe par les 3 points P, Q et R marqués sur le solide. Retrouve puis trace le polygone de section complet (tous les sommets où ce plan coupe les arêtes du solide, reliés dans l'ordre jusqu'à refermer le polygone). " +
  `${TEXTE_AIDE_SEGMENT_NIVEAU1} ${TEXTE_AIDE_AUXILIAIRE_NIVEAU1}`;

function construireEnonceSectionPlaneSolide(exercice: ExerciceSectionPlaneSolide): SectionExercice {
  return {
    enteteFragments: [texte(`On coupe le solide "${exercice.solide.label}" par un plan passant par les points P, Q et R.`)],
    enteteHtml: construireSvgSectionPlaneSolide(exercice, false),
    questions: [{ consigne: [texte(CONSIGNE_PAPIER)] }],
  };
}

/** Sommet du polygone décrit pour la correction : lettre déjà attribuée (`libellePoint`) + arête du
 * solide sur laquelle il se trouve + "donné"/"point auxiliaire" — tout point autre que P/Q/R est
 * nécessairement un point auxiliaire (voir le commentaire de tête). */
function texteDescriptionPoint(point: PointSectionExercice, label: string): string {
  const arete = `${point.arete[0]}${point.arete[1]}`;
  return point.labelDepart ? `${label} (donné, sur l'arête ${arete})` : `${label} (point auxiliaire, sur l'arête ${arete})`;
}

function construireCorrectionSectionPlaneSolide(exercice: ExerciceSectionPlaneSolide): BlocCorrection[] {
  const ordreLabels = ordreLabelsDepuisExercice(exercice);
  const ordreDepuisP = ordreCycliqueDepuisP(exercice).map((id) => exercice.points.find((p) => p.id === id)!);
  const facesListe = exercice.facesCroisees.map((f) => libelleFace(exercice, f)).join(", ");
  const descriptions = ordreDepuisP.map((p) => texteDescriptionPoint(p, libellePoint(ordreLabels, p.id)));
  const cycleLettres = [...ordreDepuisP.map((p) => libellePoint(ordreLabels, p.id)), libellePoint(ordreLabels, ordreDepuisP[0].id)].join(" → ");

  return [
    { type: "html", html: construireSvgSectionPlaneSolide(exercice, true) },
    {
      type: "paragraphe",
      fragments: [
        texte(
          `Le plan (PQR) traverse ${exercice.facesCroisees.length} faces du solide : ${facesListe}. Chacune de ces faces fournit un sommet de la section. ` +
            `${TEXTE_AIDE_SEGMENT_NIVEAU1} ${TEXTE_AIDE_AUXILIAIRE_NIVEAU1}`,
        ),
      ],
    },
    {
      type: "paragraphe",
      fragments: [
        texte(
          `Le polygone de section obtenu est un ${nomPolygone(exercice.points.length)} à ${exercice.points.length} sommets : ${descriptions.join(", ")}. ` +
            `En les reliant dans cet ordre — ${cycleLettres} — on obtient le polygone de section fermé (en bleu sur la figure).`,
        ),
      ],
    },
  ];
}

export const adaptateurEvaluationSectionPlaneSolide: AdaptateurFeuilleExercices<ExerciceSectionPlaneSolide> = {
  titreDocument: "Section plane d'un solide — Évaluation",
  nomFichierBase: "section-plane-solide",
  genererInstance: genererExerciceSectionPlaneSolide,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceSectionPlaneSolide,
  construireCorrection: construireCorrectionSectionPlaneSolide,
  // PAS regroupable — `enteteHtml` (le solide en perspective cavalière) est utilisé, ce qui
  // disqualifie `regroupable` à lui seul, quelle que soit la consigne (voir le commentaire de tête).
};

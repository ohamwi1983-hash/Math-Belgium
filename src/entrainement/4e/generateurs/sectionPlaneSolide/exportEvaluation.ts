import type { ExerciceSectionPlaneSolide } from "../../core/sectionPlaneSolide.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { texte } from "../../../export/fragmentsDocx";
import {
  elementsConstructionAuxiliaire,
  libelleFace,
  libelleLigne,
  libellePoint,
  nomPolygoneSection,
  pointsExtraConnus,
  segmentsExtraTraces,
  TEXTE_AIDE_AUXILIAIRE_NIVEAU1,
  TEXTE_AIDE_SEGMENT_NIVEAU1,
} from "../../ui/formatSectionPlaneSolide";
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
 * **Étiquetage des sommets P/Q/R/S/T/…** : réutilise `ui/formatSectionPlaneSolide.ts::libellePoint`
 * avec l'ordre de DÉCOUVERTE de la résolution de référence (`exercice.resolutionReference`, calculée
 * une seule fois à la génération par `polygoneSection.ts::resolutionReference`) — P, Q, R puis
 * chaque point auxiliaire dans l'ordre où la correction le construit, pour que les lettres de la
 * figure suivent exactement le texte. Les points auxiliaires de construction sont nommés I₁, I₂…
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
 * **Correction RESYNTHÉTISÉE** depuis les champs déjà connus et corrects de l'instance tirée : nombre
 * de faces traversées (chacune fournit un CÔTÉ de la section), puis chaque étape de la résolution de
 * référence — segment direct, ou construction détaillée d'un point auxiliaire (les 2 droites
 * prolongées, la face commune, le point I obtenu, la droite qui donne le nouveau point — audit
 * chapitre 8, point 26) — et enfin le polygone fermé. Une résolution valable parmi d'autres, jamais
 * l'ordre exact d'une partie jouée (qui dépend des choix libres de l'élève).
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

/** Ordre de DÉCOUVERTE de la résolution de référence (`exercice.resolutionReference`, calculée à la
 * génération) : P, Q, R, puis chaque point auxiliaire dans l'ordre où la correction le construit —
 * pour que les lettres S, T, … de la figure suivent exactement le texte de la correction. */
function ordreLabelsDepuisExercice(exercice: ExerciceSectionPlaneSolide): number[] {
  const ordre: number[] = [...exercice.idsDepart];
  for (const etape of exercice.resolutionReference) {
    if (etape.type === "auxiliaire" && !ordre.includes(etape.pointCible)) ordre.push(etape.pointCible);
  }
  for (const id of exercice.ordreCyclique) if (!ordre.includes(id)) ordre.push(id); // garde défensive
  return ordre;
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

const INDICES = ["₁", "₂", "₃", "₄", "₅", "₆"];

function nomPointAuxiliaire(rang: number): string {
  return `I${INDICES[rang] ?? rang + 1}`;
}

interface Pixel {
  x: number;
  y: number;
}

/** Cadre de la figure : le cadre habituel du croquis, élargi si besoin pour contenir les points
 * auxiliaires de la correction (jamais coupés). */
function cadreFigure(extra: Pixel[]): { x: number; y: number; largeur: number; hauteur: number } {
  const marge = 22;
  const xs = [0, LARGEUR_SVG, ...extra.map((p) => p.x - marge), ...extra.map((p) => p.x + marge)];
  const ys = [0, HAUTEUR_SVG, ...extra.map((p) => p.y - marge), ...extra.map((p) => p.y + marge)];
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, largeur: Math.max(...xs) - x, hauteur: Math.max(...ys) - y };
}

/** Position d'étiquette décalée radialement vers l'EXTÉRIEUR du solide (même principe que les
 * étiquettes de sommet, `calculerLabelsSommetsPixel`) — jamais posée sur une arête (audit
 * chapitre 8, point 26). */
function positionEtiquette(p: Pixel, centre: Pixel, distance = 14): Pixel {
  const dx = p.x - centre.x;
  const dy = p.y - centre.y;
  const longueur = Math.hypot(dx, dy) || 1;
  return { x: p.x + (dx / longueur) * distance, y: p.y + (dy / longueur) * distance + 4 };
}

/** Solide en perspective cavalière (arêtes + sommets nommés), TOUJOURS affiché — géométrie
 * intégralement issue de `ui/solide3DSketch.ts`, jamais recalculée ici. */
function construireSvgSolide(exercice: ExerciceSectionPlaneSolide): string {
  const { solide } = exercice;
  const sommetsPixel = calculerSommetsPixel(solide);
  const labelsSommetsPixel = calculerLabelsSommetsPixel(solide);
  const aretes = calculerAretesAvecVisibilite(solide);

  const ligne = (p1: Pixel, p2: Pixel, attributs: string) =>
    `<line x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" ${attributs}/>`;

  const aretesCacheesHtml = aretes
    .filter((a) => !a.visible)
    .map((a) => ligne(sommetsPixel[a.sommets[0]], sommetsPixel[a.sommets[1]], `stroke="${COULEUR_ARETE_CACHEE}" stroke-width="1.5" stroke-dasharray="4 3"`))
    .join("");

  const aretesVisiblesHtml = aretes
    .filter((a) => a.visible)
    .map((a) => ligne(sommetsPixel[a.sommets[0]], sommetsPixel[a.sommets[1]], `stroke="${COULEUR_ARETE}" stroke-width="1.75"`))
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
 * du polygone (correction : pointillés sur les faces cachées) + constructions auxiliaires de la
 * résolution de référence (correction : points I₁, I₂… et droites prolongées). Positions issues de
 * `pointsExtraConnus`/`segmentsExtraTraces`/`elementsConstructionAuxiliaire`
 * (`ui/formatSectionPlaneSolide.ts`, couleurs inline), projetées dans le MÊME repère pixel que le
 * solide via `projeter3DVersPixel(_, calculerEchelleProjection(solide))`. */
function construireSvgSectionPlaneSolide(exercice: ExerciceSectionPlaneSolide, avecSection: boolean): string {
  const echelleProjection = calculerEchelleProjection(exercice.solide);
  const projeter = (p: Parameters<typeof projeter3DVersPixel>[0]) => projeter3DVersPixel(p, echelleProjection);
  const ordreLabels = ordreLabelsDepuisExercice(exercice);
  const idsAffiches = avecSection ? ordreLabels : exercice.idsDepart;
  const sommetsPixel = Object.values(calculerSommetsPixel(exercice.solide));
  const centre = { x: sommetsPixel.reduce((s, p) => s + p.x, 0) / sommetsPixel.length, y: sommetsPixel.reduce((s, p) => s + p.y, 0) / sommetsPixel.length };

  let segmentsHtml = "";
  let constructionsHtml = "";
  const pointsAuxiliairesPixel: Pixel[] = [];
  if (avecSection) {
    segmentsHtml = segmentsExtraTraces(exercice, segmentsPolygoneCles(exercice))
      .map((segment) => {
        const p1 = projeter(segment.a);
        const p2 = projeter(segment.b);
        const tirets = segment.pointille ? ` stroke-dasharray="6 4"` : "";
        return `<line x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" stroke="${segment.couleur}" stroke-width="3" stroke-linecap="round"${tirets}/>`;
      })
      .join("");

    let rang = 0;
    for (const etape of exercice.resolutionReference) {
      if (etape.type !== "auxiliaire") continue;
      const connusAvant = ordreLabels.slice(0, ordreLabels.indexOf(etape.pointCible));
      const { segments, points } = elementsConstructionAuxiliaire(exercice, connusAvant, etape.ligne1, etape.ligne2, etape);
      constructionsHtml += segments
        .map((segment) => {
          const p1 = projeter(segment.a);
          const p2 = projeter(segment.b);
          return `<line x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" stroke="${segment.couleur}" stroke-width="1.5" stroke-dasharray="5 3"/>`;
        })
        .join("");
      const I = points[0];
      if (I) {
        const p = projeter(I.position);
        pointsAuxiliairesPixel.push(p);
        const etiquette = positionEtiquette(p, centre);
        constructionsHtml +=
          `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4" fill="${I.couleur}" stroke="#ffffff" stroke-width="1.5"/>` +
          `<text x="${etiquette.x.toFixed(1)}" y="${etiquette.y.toFixed(1)}" font-size="12" font-weight="700" fill="${I.couleur}" text-anchor="middle">${nomPointAuxiliaire(rang)}</text>`;
      }
      rang++;
    }
  }

  const pointsHtml = pointsExtraConnus(exercice, ordreLabels)
    .filter((_, index) => idsAffiches.includes(ordreLabels[index]))
    .map((point) => {
      const p = projeter(point.position);
      const etiquette = positionEtiquette(p, centre);
      return (
        `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="5" fill="${point.couleur}" stroke="#ffffff" stroke-width="1.5"/>` +
        `<text x="${etiquette.x.toFixed(1)}" y="${etiquette.y.toFixed(1)}" font-size="12" font-weight="700" fill="${point.couleur}" text-anchor="middle">${point.label}</text>`
      );
    })
    .join("");

  const cadre = cadreFigure(pointsAuxiliairesPixel);
  const largeurAffichee = Math.min(cadre.largeur, 520);
  const hauteurAffichee = (cadre.hauteur * largeurAffichee) / cadre.largeur;
  return `<svg width="${largeurAffichee.toFixed(0)}" height="${hauteurAffichee.toFixed(0)}" viewBox="${cadre.x.toFixed(1)} ${cadre.y.toFixed(1)} ${cadre.largeur.toFixed(1)} ${cadre.hauteur.toFixed(1)}" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:8px auto 14px;border:1px solid #e6e6f0;border-radius:8px;background:#ffffff;">
<rect x="${cadre.x.toFixed(1)}" y="${cadre.y.toFixed(1)}" width="${cadre.largeur.toFixed(1)}" height="${cadre.hauteur.toFixed(1)}" fill="#ffffff"/>
${construireSvgSolide(exercice)}
${constructionsHtml}
${segmentsHtml}
${pointsHtml}
</svg>`;
}

const CONSIGNE_PAPIER =
  "Le plan de coupe passe par les 3 points P, Q et R marqués sur le solide. Retrouve puis trace le polygone de section complet (tous les points où ce plan coupe les arêtes du solide, reliés dans l'ordre jusqu'à refermer le polygone ; les côtés situés sur une face cachée se tracent en pointillés). " +
  `${TEXTE_AIDE_SEGMENT_NIVEAU1} Quand plus aucune face n'a 2 points connus, construis un point auxiliaire : ${TEXTE_AIDE_AUXILIAIRE_NIVEAU1.replace(/^Méthode : /, "")}`;

function construireEnonceSectionPlaneSolide(exercice: ExerciceSectionPlaneSolide): SectionExercice {
  return {
    enteteFragments: [texte(`On coupe le solide "${exercice.solide.label}" par un plan passant par les points P, Q et R.`)],
    enteteHtml: construireSvgSectionPlaneSolide(exercice, false),
    questions: [{ consigne: [texte(CONSIGNE_PAPIER)] }],
  };
}

/** « le segment [PQ] », « l'arête [BF] », « la diagonale [AC] ». */
function avecArticle(libelle: string): string {
  if (libelle.startsWith("arête")) return `l'${libelle}`;
  if (libelle.startsWith("diagonale")) return `la ${libelle}`;
  return `le ${libelle}`;
}

/** Une phrase par étape de la résolution de référence — segments directs ET construction détaillée
 * de chaque point auxiliaire (quelles droites, dans quelle face, où elles se coupent, quelle droite
 * donne le nouveau point — audit chapitre 8, point 26). */
function textesEtapes(exercice: ExerciceSectionPlaneSolide): string[] {
  const ordreLabels = ordreLabelsDepuisExercice(exercice);
  const lettre = (id: number) => libellePoint(ordreLabels, id);
  const arete = (id: number) => {
    const point = exercice.points.find((p) => p.id === id)!;
    return `[${point.arete[0]}${point.arete[1]}]`;
  };
  let rang = 0;
  const textes: string[] = [];
  for (const etape of exercice.resolutionReference) {
    if (etape.type === "segment") {
      textes.push(`Dans la face ${libelleFace(exercice, etape.face)}, ${lettre(etape.pointA)} et ${lettre(etape.pointB)} sont connus : on trace le segment [${lettre(etape.pointA)}${lettre(etape.pointB)}].`);
      continue;
    }
    const connusAvant = ordreLabels.slice(0, ordreLabels.indexOf(etape.pointCible));
    const nomI = nomPointAuxiliaire(rang++);
    const l1 = libelleLigne(exercice, connusAvant, etape.ligne1);
    const l2 = libelleLigne(exercice, connusAvant, etape.ligne2);
    const dansFace = etape.faceCommune !== null ? `Dans la face ${libelleFace(exercice, etape.faceCommune)}, on` : "On";
    textes.push(
      `Plus aucune face n'a 2 points connus. ${dansFace} prolonge ${avecArticle(l1)} et ${avecArticle(l2)} : ces droites se coupent en ${nomI}, point du plan de coupe. ` +
        `${nomI} est aussi dans le plan de la face ${libelleFace(exercice, etape.face)}, où ${lettre(etape.pointConnu)} est déjà connu : la droite (${nomI}${lettre(etape.pointConnu)}) coupe l'arête ${arete(etape.pointCible)} en ${lettre(etape.pointCible)}.`,
    );
  }
  return textes;
}

function construireCorrectionSectionPlaneSolide(exercice: ExerciceSectionPlaneSolide): BlocCorrection[] {
  const ordreLabels = ordreLabelsDepuisExercice(exercice);
  const ordreDepuisP = ordreCycliqueDepuisP(exercice).map((id) => exercice.points.find((p) => p.id === id)!);
  const facesListe = exercice.facesCroisees.map((f) => libelleFace(exercice, f)).join(", ");
  const cycleLettres = [...ordreDepuisP.map((p) => libellePoint(ordreLabels, p.id)), libellePoint(ordreLabels, ordreDepuisP[0].id)].join(" → ");
  const k = exercice.points.length;

  return [
    { type: "html", html: construireSvgSectionPlaneSolide(exercice, true) },
    {
      type: "paragraphe",
      fragments: [
        texte(
          `Le plan (PQR) traverse ${exercice.facesCroisees.length} faces du solide : ${facesListe}. Chacune de ces faces fournit un côté de la section (le segment qui relie ses 2 points de section) : la section a donc ${k} côtés.`,
        ),
      ],
    },
    ...textesEtapes(exercice).map((t): BlocCorrection => ({ type: "paragraphe", fragments: [texte(t)] })),
    {
      type: "paragraphe",
      fragments: [
        texte(
          `Le polygone de section est un ${nomPolygoneSection(k)} : ${cycleLettres} (en bleu sur la figure ; les côtés situés sur une face cachée sont en pointillés, les constructions auxiliaires en violet).`,
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

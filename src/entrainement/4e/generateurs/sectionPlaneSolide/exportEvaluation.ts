import type { ExerciceSectionPlaneSolide } from "../../core/sectionPlaneSolide.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CritereBareme, EnoncePapier, EtapeCorrection, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
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
  segmentSurFaceCachee,
} from "../../ui/formatSectionPlaneSolide";
import { calculerAretesAvecVisibilite, calculerEchelleProjection, calculerLabelsSommetsPixel, calculerSommetsPixel, HAUTEUR_SVG, LARGEUR_SVG, projeter3DVersPixel } from "../../ui/solide3DSketch";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceSectionPlaneSolide } from "./index";
import { profilSectionPlaneSolide } from "../profilsEvaluation4eCh8";

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
 * **Énoncé papier (refonte des feuilles, `enoncePapier`)** : la figure + UNE consigne globale
 * (construire la section, nommer les nouveaux points, pointillés, nature du polygone) — aucun rappel
 * de méthode (décision de l'utilisateur). Les étapes de la boucle interactive (côté direct, point
 * auxiliaire, fermeture — `consignesEtapes`) sont les titres « Étape n — … » du corrigé, où vont
 * aussi les 2 textes de méthode des aides de niveau 1 (`TEXTE_AIDE_SEGMENT_NIVEAU1`,
 * `TEXTE_AIDE_AUXILIAIRE_NIVEAU1`).
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
 * et les étapes du corrigé dépendent de l'instance.
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

/** Étapes du raisonnement (une par écran du générateur) : un côté tracé dans une face où 2 points
 * sont connus, ou un point auxiliaire (écrans « droites » + « face »), puis la fermeture du
 * polygone. Ce sont les titres « Étape n — … » du corrigé ; l'énoncé papier n'a qu'une consigne. */
function consignesEtapes(exercice: ExerciceSectionPlaneSolide): string[] {
  return [
    ...exercice.resolutionReference.map((etape) =>
      etape.type === "segment"
        ? "Trace un côté de la section dans une face où 2 points de section sont déjà connus."
        : "Plus aucune face n'a 2 points connus : construis un point auxiliaire, puis le nouveau point de section qu'il donne.",
    ),
    "Referme le polygone de section et donne sa nature.",
  ];
}

/** « le cube ABCD-EFGH », « le tétraèdre ABCD »… (tous les gabarits sont masculins). */
function leSolide(exercice: ExerciceSectionPlaneSolide): string {
  const label = exercice.solide.label;
  return `le ${label.charAt(0).toLowerCase()}${label.slice(1)}`;
}

function construireEnonceSectionPlaneSolide(exercice: ExerciceSectionPlaneSolide): SectionExercice {
  return {
    enteteFragments: [texte(`On coupe ${leSolide(exercice)} par le plan passant par les points P, Q et R marqués sur ses arêtes.`)],
    enteteHtml: construireSvgSectionPlaneSolide(exercice, false),
    questions: consignesEtapes(exercice).map((c) => ({ consigne: [texte(c)] })),
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
      const [a, b] = ordreLabels.indexOf(etape.pointA) <= ordreLabels.indexOf(etape.pointB) ? [etape.pointA, etape.pointB] : [etape.pointB, etape.pointA];
      textes.push(`Dans la face ${libelleFace(exercice, etape.face)}, ${lettre(a)} et ${lettre(b)} sont connus : on trace le segment [${lettre(a)}${lettre(b)}].`);
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

// ============================================================================
// Feuilles enrichies (difficulté, réponse brève, corrigé détaillé, barème, énoncé papier). Étapes =
// `consignesEtapes` (une lettre par étape de `resolutionReference`, puis la fermeture). Textes et
// figure : les MÊMES fonctions que le corrigé historique (`textesEtapes`, figure avec la section).
// ============================================================================

const LETTRES = "abcdefghijklmnopqrstuvwxyz";

const majuscule = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

function lettreEtape(index: number): string {
  return LETTRES[index];
}

function cycleSection(exercice: ExerciceSectionPlaneSolide): string {
  const ordreLabels = ordreLabelsDepuisExercice(exercice);
  return ordreCycliqueDepuisP(exercice)
    .map((id) => libellePoint(ordreLabels, id))
    .join("");
}

function nombreAuxiliaires(exercice: ExerciceSectionPlaneSolide): number {
  return exercice.resolutionReference.filter((e) => e.type === "auxiliaire").length;
}

/** Côtés de la section situés sur une face cachée (en pointillés), nommés. */
function cotesCaches(exercice: ExerciceSectionPlaneSolide): string[] {
  const ordreLabels = ordreLabelsDepuisExercice(exercice);
  const { ordreCyclique } = exercice;
  return ordreCyclique
    .map((id, i) => [id, ordreCyclique[(i + 1) % ordreCyclique.length]] as const)
    .filter(([a, b]) => segmentSurFaceCachee(exercice, a, b))
    .map(([a, b]) => `[${libellePoint(ordreLabels, a)}${libellePoint(ordreLabels, b)}]`);
}

function difficulteSectionPlaneSolide(exercice: ExerciceSectionPlaneSolide): 1 | 2 | 3 {
  return exercice.points.length >= 5 ? 3 : 2;
}

function reponseBreveSectionPlaneSolide(exercice: ExerciceSectionPlaneSolide): FragmentConsigne[] {
  return [texte(`Section : ${nomPolygoneSection(exercice.points.length)} ${cycleSection(exercice)}.`)];
}

function correctionDetailleeSectionPlaneSolide(exercice: ExerciceSectionPlaneSolide): EtapeCorrection[] {
  const textes = textesEtapes(exercice);
  const etapes: EtapeCorrection[] = [];
  exercice.resolutionReference.forEach((etape, i) => {
    // Rappel de méthode à la PREMIÈRE étape de chaque type.
    if (etape.type === "segment" && !exercice.resolutionReference.slice(0, i).some((x) => x.type === "segment")) {
      etapes.push({ label: "Méthode", sousQuestion: lettreEtape(i), fragments: [texte(majuscule(TEXTE_AIDE_SEGMENT_NIVEAU1.replace(/^Rappel de la méthode : /, "")))] });
    }
    if (etape.type === "auxiliaire" && !exercice.resolutionReference.slice(0, i).some((x) => x.type === "auxiliaire")) {
      etapes.push({ label: "Méthode", sousQuestion: lettreEtape(i), fragments: [texte(majuscule(TEXTE_AIDE_AUXILIAIRE_NIVEAU1.replace(/^Méthode : /, "")))] });
    }
    etapes.push({ label: etape.type === "segment" ? "Tracé" : "Construction", sousQuestion: lettreEtape(i), fragments: [texte(textes[i])] });
  });
  const fin = lettreEtape(exercice.resolutionReference.length);
  const k = exercice.points.length;
  const faces = exercice.facesCroisees.map((f) => libelleFace(exercice, f)).join(", ");
  const caches = cotesCaches(exercice);
  etapes.push({
    label: "Méthode",
    sousQuestion: fin,
    fragments: [texte(`Le plan (PQR) traverse ${exercice.facesCroisees.length} faces du solide : ${faces}. Chacune fournit un côté de la section, qui a donc ${k} côtés.`)],
  });
  etapes.push({
    label: "Conclusion",
    sousQuestion: fin,
    fragments: [
      texte(
        `La section est le ${nomPolygoneSection(k)} ${cycleSection(exercice)}${caches.length > 0 ? ` ; ${caches.length > 1 ? "les côtés" : "le côté"} ${caches.join(", ")}, sur une face cachée, ${caches.length > 1 ? "se tracent" : "se trace"} en pointillés` : ""}.`,
      ),
    ],
    // La réponse est une construction : la section attendue (constructions auxiliaires en violet).
    figureHtml: construireSvgSectionPlaneSolide(exercice, true),
  });
  const premiereAux = exercice.resolutionReference.findIndex((e) => e.type === "auxiliaire");
  etapes.push({
    label: "Piège",
    sousQuestion: premiereAux >= 0 ? lettreEtape(premiereAux) : fin,
    fragments: [
      texte(
        "On ne prolonge que deux droites d'une même face (coplanaires) : deux droites qui se croisent seulement sur le dessin ne se coupent pas dans l'espace. Et deux points de section ne se relient que s'ils sont sur une même face.",
      ),
    ],
  });
  return etapes;
}

function baremeSectionPlaneSolide(exercice: ExerciceSectionPlaneSolide): BaremeExercice {
  const ref = exercice.resolutionReference;
  const fin = lettreEtape(ref.length);
  const premierSegment = ref.findIndex((e) => e.type === "segment");
  const premiereAux = ref.findIndex((e) => e.type === "auxiliaire");
  const n = nombreAuxiliaires(exercice);
  const k = exercice.points.length;
  const criteres: CritereBareme[] = [
    { sousQuestion: premierSegment >= 0 ? lettreEtape(premierSegment) : fin, critere: [texte("Côtés tracés directement dans les faces où 2 points de section sont connus")], points: 1 },
    {
      sousQuestion: premiereAux >= 0 ? lettreEtape(premiereAux) : fin,
      critere: [texte(`${n > 1 ? `${n} points auxiliaires construits` : "Point auxiliaire construit"} en prolongeant deux droites d'une même face`)],
      points: 1,
    },
    { sousQuestion: premiereAux >= 0 ? lettreEtape(premiereAux) : fin, critere: [texte(`${k - 3 > 1 ? `${k - 3} nouveaux points de section placés` : "Nouveau point de section placé"} sur la bonne arête`)], points: 1 },
    { sousQuestion: fin, critere: [texte(`Polygone fermé à ${k} côtés (${nomPolygoneSection(k)}), côtés cachés en pointillés`)], points: 1 },
  ];
  return {
    reponseFinale: reponseBreveSectionPlaneSolide(exercice),
    criteres,
    erreursFrequentes: [
      { description: [texte("Deux points de section reliés alors qu'ils ne sont pas sur une même face (côté qui traverse le solide)")], cout: "−1" },
      { description: [texte("Point auxiliaire obtenu en prolongeant deux droites non coplanaires")], cout: "0 pt sur le point auxiliaire et le point qu'il donne" },
      { description: [texte("Côté situé sur une face cachée tracé en trait plein")], cout: "−0,5" },
    ],
    reponsesAcceptees: [[texte("Autres noms pour les nouveaux points de section ou les points auxiliaires, si la construction est juste")]],
  };
}

function enoncePapierSectionPlaneSolide(exercice: ExerciceSectionPlaneSolide): EnoncePapier {
  return {
    section: {
      enteteFragments: [texte(`On coupe ${leSolide(exercice)} par le plan passant par les points P, Q et R marqués sur ses arêtes.`)],
      enteteHtml: construireSvgSectionPlaneSolide(exercice, false),
      questions: [
        {
          consigne: [
            texte(
              "Construis la section du solide par le plan (PQR) : nomme S, T… les nouveaux points de section dans l'ordre où tu les trouves, trace le polygone de section (côtés situés sur une face cachée en pointillés) et donne sa nature.",
            ),
          ],
        },
      ],
    },
    etapesParQuestion: [consignesEtapes(exercice).map((_, i) => lettreEtape(i))],
  };
}

export const adaptateurEvaluationSectionPlaneSolide: AdaptateurFeuilleExercices<ExerciceSectionPlaneSolide> = {
  titreDocument: "Section plane d'un solide — Évaluation",
  nomFichierBase: "section-plane-solide",
  genererInstance: genererExerciceSectionPlaneSolide,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceSectionPlaneSolide,
  construireCorrection: construireCorrectionSectionPlaneSolide,
  difficulte: difficulteSectionPlaneSolide,
  reponseBreve: reponseBreveSectionPlaneSolide,
  correctionDetaillee: correctionDetailleeSectionPlaneSolide,
  bareme: baremeSectionPlaneSolide,
  enoncePapier: enoncePapierSectionPlaneSolide,
  dureeMinutes: 12,
  profilInstance: profilSectionPlaneSolide,
  // PAS regroupable — `enteteHtml` (le solide en perspective cavalière) est utilisé, ce qui
  // disqualifie `regroupable` à lui seul, quelle que soit la consigne (voir le commentaire de tête).
};

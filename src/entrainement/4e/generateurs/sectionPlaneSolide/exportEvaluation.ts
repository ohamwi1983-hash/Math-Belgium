import type { ExerciceSectionPlaneSolide } from "../../core/sectionPlaneSolide.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CritereBareme, CriteresDifficulte, EnoncePapier, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { correctionDetailleeSectionPlaneSolide, ecransSection } from "./corrigeDetaille";
import { texte } from "../../../export/fragmentsDocx";
import {
  libelleFace,
  libelleLigne,
  libellePoint,
  nomPolygoneSection,
} from "../../ui/formatSectionPlaneSolide";
import { construireSvgSectionPlaneSolide, nomPointAuxiliaire, ordreCycliqueDepuisP, ordreLabelsDepuisExercice } from "./figure";
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

/** Étapes du raisonnement (une par écran du générateur) : un côté tracé dans une face où 2 points
 * sont connus, ou un point auxiliaire (écrans « droites » + « face »), puis la fermeture du
 * polygone. Ce sont les titres « Étape n — … » du corrigé ; l'énoncé papier n'a qu'une consigne. */
function consignesEtapes(exercice: ExerciceSectionPlaneSolide): string[] {
  return ecransSection(exercice).map((ecran) =>
    ecran.type === "segment"
      ? "Trace un côté de la section dans une face où 2 points de section sont déjà connus."
      : ecran.type === "lignes"
        ? "Plus aucune face n'a 2 points connus : construis un point auxiliaire en prolongeant deux droites d'une même face."
        : ecran.type === "face"
          ? "Dans la face que ce point auxiliaire débloque, construis le nouveau point de section."
          : "Referme le polygone de section et donne sa nature.",
  );
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

/** Niveau CONSTANT pour un solide donné (décision « un niveau ne trahit pas la réponse ») : le
 * nombre d'écrans dépend de la forme de la section, qui est la réponse — trois étapes de
 * raisonnement retenues (côtés directs, construction auxiliaire, fermeture), sans charge, plus un
 * écran de lecture (repérer les faces et les points connus) ; méthode 1 (côté direct ou point
 * auxiliaire, à choisir à chaque étape), aucun piège dans les données, aucun nombre. */
function criteresDifficulteSectionPlaneSolide(_exercice: ExerciceSectionPlaneSolide): CriteresDifficulte {
  return { etapesTransformation: 3, etapesLecture: 1, sansCharge: true, methode: 1, piege: 0, nombres: 0 };
}

function reponseBreveSectionPlaneSolide(exercice: ExerciceSectionPlaneSolide): FragmentConsigne[] {
  return [texte(`Section : ${nomPolygoneSection(exercice.points.length)} ${cycleSection(exercice)}.`)];
}

function baremeSectionPlaneSolide(exercice: ExerciceSectionPlaneSolide): BaremeExercice {
  const ecrans = ecransSection(exercice);
  const fin = lettreEtape(ecrans.length - 1);
  const premierSegment = ecrans.findIndex((e) => e.type === "segment");
  const premiereAux = ecrans.findIndex((e) => e.type === "lignes");
  const premiereFace = ecrans.findIndex((e) => e.type === "face");
  const n = nombreAuxiliaires(exercice);
  const k = exercice.points.length;
  const criteres: CritereBareme[] = [
    { sousQuestion: premierSegment >= 0 ? lettreEtape(premierSegment) : fin, critere: [texte("Côtés tracés directement dans les faces où 2 points de section sont connus")], points: 1 },
    {
      sousQuestion: premiereAux >= 0 ? lettreEtape(premiereAux) : fin,
      critere: [texte(`${n > 1 ? `${n} points auxiliaires construits` : "Point auxiliaire construit"} en prolongeant deux droites d'une même face`)],
      points: 1,
    },
    { sousQuestion: premiereFace >= 0 ? lettreEtape(premiereFace) : fin, critere: [texte(`${k - 3 > 1 ? `${k - 3} nouveaux points de section placés` : "Nouveau point de section placé"} sur la bonne arête`)], points: 1 },
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
  criteresDifficulte: criteresDifficulteSectionPlaneSolide,
  reponseBreve: reponseBreveSectionPlaneSolide,
  correctionDetaillee: correctionDetailleeSectionPlaneSolide,
  bareme: baremeSectionPlaneSolide,
  enoncePapier: enoncePapierSectionPlaneSolide,
  profilInstance: profilSectionPlaneSolide,
  // PAS regroupable — `enteteHtml` (le solide en perspective cavalière) est utilisé, ce qui
  // disqualifie `regroupable` à lui seul, quelle que soit la consigne (voir le commentaire de tête).
};

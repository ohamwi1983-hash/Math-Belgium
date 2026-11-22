import type { ExercicePositionDroitePlan } from "../../core/positionDroitePlan.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { correctionDetailleePositionDroitePlan } from "./corrigeDetaille";
import { construireSvgPositionDroitePlan } from "./figure";
import { texte } from "../../../export/fragmentsDocx";
import {
  LIBELLE_CLASSIFICATION,
  libelleDroite,
  libellePlan,
  phrasePosition,
  segmentParalleleAttendu,
  texteAideJustification,
  texteFaitsAppartenance,
  textePointsNommes,
  texteReponseJustificationAttendue,
} from "../../ui/formatPositionDroitePlan";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExercicePositionDroitePlan } from "./index";
import { GROUPES_VERDICT_POSITION_DROITE_PLAN, LIBELLE_CAS_POSITION_DROITE_PLAN, PARAMETRES_POSITION_DROITE_PLAN, profilPositionDroitePlan } from "../profilsEvaluation4eCh8";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExercicePositionDroitePlan>` pour gen39 (Position d'une
 * droite par rapport à un plan — 1er générateur du chapitre "Géométrie dans l'espace",
 * `AppPositionDroitePlan.tsx`) — voir `generateurs/analyseFonction/exportWord.ts` pour le mécanisme
 * générique de référence, `generateurs/lectureGraphiqueDroite/exportEvaluation.ts` pour l'exemple
 * jumeau d'un diagramme SVG autonome réutilisant une géométrie pure déjà partagée côté écran, et
 * `generateurs/distanceDroite/exportEvaluation.ts` pour le patron de duplication locale d'une petite
 * logique de vérification quand la Couche B ne peut jamais être importée depuis `generateurs/`.
 *
 * **Aucun calcul visible, pure reconnaissance géométrique** (voir le commentaire de tête de
 * `core/positionDroitePlan.types.ts`) : l'exercice ENTIER (écran 1 ET écran 2) repose sur UN SEUL
 * croquis en perspective cavalière (`components/Solide3DSketch.tsx`), le plan et la droite étant DÉJÀ
 * tous les deux mis en évidence dès l'écran 1 (voir le commentaire de tête de
 * `EtapeClassificationPositionDroitePlan.tsx` : masquer l'un des deux reviendrait à cacher une donnée
 * de l'énoncé, pas à éviter de révéler la réponse — la couleur ne dit rien en elle-même de
 * incluse/parallèle/sécante). `construireSvgPositionDroitePlan` ci-dessous reproduit donc EXACTEMENT
 * ce même unique croquis (jamais une version "encore à distinguer" puis une version "révélée") pour
 * les 2 questions papier.
 *
 * **Écran → question, dans le même ordre** (`AppPositionDroitePlan.tsx`, phases `classification` →
 * `justification`) :
 * - Écran 1 "classification" → question a) : la consigne "Que peux-tu dire de cette droite par
 *   rapport à ce plan ?" reprise telle quelle, 1 ligne de réponse.
 * - Écran 2 "justification" → question b) : consigne NEUTRE (`CONSIGNE_JUSTIFICATION_PAPIER`, audit
 *   chapitre 8) — jamais la consigne d'écran propre à la catégorie, qui révélait la réponse à a) ;
 *   3 lignes de réponse. Pas de liste de candidats imprimée : tous les sommets et points nommés sont
 *   déjà étiquetés sur le croquis, l'élève les cite par leurs lettres.
 *
 * **Diagramme SVG** (`construireSvgPositionDroitePlan`) : réutilise EXCLUSIVEMENT les fonctions pures
 * déjà partagées par le rendu écran (`ui/solide3DSketch.ts`, lu entièrement avant d'écrire ce
 * fichier) — `calculerGeometrieSolide3D` (sommets/labels en pixel + arêtes avec visibilité,
 * pointillé/plein déjà tranché) et `calculerPolygonePlan` (polygone ordonné de TOUS les sommets du
 * solide appartenant au plan désigné, pas seulement les 3 qui le définissent) — jamais de recalcul de
 * la projection cavalière ici. `projeter3DVersPixel`/`calculerEchelleProjection` (also exportés par
 * ce module) ne sont PAS utilisés : ce générateur n'a ni point ni segment annexe (`pointsExtra`/
 * `segmentsExtra` de `Solide3DSketch.tsx`, réservés aux 2 générateurs suivants du chapitre — section
 * plane, ombre). Seul le rendu `<svg>` texte proprement dit (attributs `fill`/`stroke` inline, jamais
 * de classe CSS — le document HTML autonome de l'évaluation n'a pas accès à `App.css`) est propre à
 * ce fichier, en reproduisant fidèlement la structure de `Solide3DSketch.tsx` (arêtes cachées en
 * pointillé d'abord, puis le polygone du plan, puis les arêtes visibles, puis la droite surlignée,
 * puis les labels de sommets — même ordre de calque). **Mise en évidence** : le plan est rempli en
 * violet translucide + contour violet (`COULEUR_PLAN`), la droite en trait orange épais
 * (`COULEUR_DROITE`) — mêmes couleurs LITTÉRALES que `.solide3d-plan`/`.solide3d-droite`/
 * `.solide3d-arete`/`.solide3d-sommet-label` de `App.css`, valeurs du thème CLAIR uniquement
 * (`--color-primary: #6d28d9`, `--color-text: #1b1c2b`, `--color-border: #e6e6f0`, voir
 * `src/index.css`) recopiées en dur — `var(...)` n'a aucun effet dans ce document HTML autonome, même
 * patron que `generateurs/reductionVectorielle/exportEvaluation.ts`/`generateurs/triangleLies/
 * exportEvaluation.ts`. Utilise `enteteHtml` (jamais `enteteFragments`) pour ce SVG, comme documenté
 * dans `export/genererFeuilleExercices.ts::SectionExercice.enteteHtml`.
 *
 * **Piège `enteteFragments` évité** : la consigne générale ("Étudie la position de la droite … par
 * rapport au plan …") est purement TEXTUELLE — `libelleDroite`/`libellePlan` renvoient déjà du texte
 * simple (ex. "(AB)"), jamais du LaTeX — donc AUCUN fragment `latex()` n'apparaît dans
 * `enteteFragments` ici : le bug de rendu "chaque fragment LaTeX court sur sa propre ligne centrée"
 * (`assemblerEvaluationHtml.ts`, toujours `displayMode:true` sur `enteteFragments`, corrigé cette
 * session dans `distanceDroite`/`relationsDroites`/`lieuxGeometriques`) ne peut pas se produire ici :
 * un fragment `texte()` reste un simple texte concaténé en ligne (`fragmentsVersHtml`,
 * `genererFeuilleExercicesHtml.ts`), jamais rendu par KaTeX.
 *
 * **Correction RESYNTHÉTISÉE**, jamais recalculée indépendamment — réutilise directement les
 * formateurs déjà utilisés côté écran (`ui/formatPositionDroitePlan.ts`) :
 * - a) `texteFaitsAppartenance(exercice)` (appartenance de chacun des 2 points de la droite au
 *   plan — plus jamais affichée comme aide à l'écran), suivie de la conclusion.
 * - b) `texteAideJustification(classification)` (rappel de règle déjà utilisé comme aide côté écran 2)
 *   suivi de la réponse concrète `texteReponseJustificationAttendue(exercice)` — cette dernière
 *   retrouve déjà, EN INTERNE à `ui/formatPositionDroitePlan.ts`, le candidat réellement correct via
 *   `verifierReponseParallele`/`verifierReponseSecante` (Couche B, `moteur/
 *   verificationPositionDroitePlan.ts`) : cette Couche B n'est donc JAMAIS importée ni dupliquée
 *   directement dans CE fichier (`generateurs/`), uniquement consommée à travers la fonction `ui/`
 *   déjà existante — respecte la règle Couche A/Couche B (aucun besoin de dupliquer une logique de
 *   vérification ici, contrairement à `distanceDroite/exportEvaluation.ts`, car `classification`/
 *   `candidatsParallele`/`candidatsSecante` sont déjà des champs connus de l'instance tirée, jamais
 *   recalculés).
 *
 * **PAS `regroupable`** — 2 raisons indépendantes, chacune déjà suffisante à elle seule (voir la doc
 * de `AdaptateurFeuilleExercices.regroupable`, `export/genererFeuilleExercices.ts`) : (1) 2 questions
 * par instance (a: classification, b: justification), jamais 1 seule ; (2) `enteteHtml` (le croquis
 * SVG) utilisé sur chaque instance, explicitement exclu par la doc de `regroupable`.
 */

// ============================================================================
// Énoncé / correction.
// ============================================================================

/** Consigne papier de la question b) — NEUTRE (audit chapitre 8) : l'ancienne reprenait la consigne
 * d'écran propre à la catégorie (« …à laquelle la droite est parallèle », « …où la droite perce le
 * plan ») et trahissait donc la réponse à a), avec un « Sélectionne » sans liste imprimée. */
const CONSIGNE_JUSTIFICATION_PAPIER = "Justifie ta réponse en citant les sommets, points, arêtes ou diagonales utiles (point de percée si la droite est sécante).";

function construireEnoncePositionDroitePlan(exercice: ExercicePositionDroitePlan): SectionExercice {
  const definitions = textePointsNommes(exercice);
  return {
    enteteFragments: [texte(`Étudie la position de la droite ${libelleDroite(exercice)} par rapport au plan ${libellePlan(exercice)}.${definitions ? ` ${definitions}` : ""}`)],
    enteteHtml: construireSvgPositionDroitePlan(exercice),
    questions: [
      { consigne: [texte("Que peux-tu dire de cette droite par rapport à ce plan ?")] },
      { consigne: [texte(CONSIGNE_JUSTIFICATION_PAPIER)] },
    ],
  };
}

/** La droite du plan parallèle à la droite donnée, ex. « (AC) » (audit 4e ch. 8, G8 : plus « AC »). */
function droiteParallele(exercice: ExercicePositionDroitePlan): string {
  const s = segmentParalleleAttendu(exercice);
  return s ? `(${s.join("")})` : "";
}

function paragraphe(lettre: string, contenu: string): BlocCorrection {
  return { type: "paragraphe", fragments: [texte(`${lettre}) ${contenu}`)] };
}

function construireCorrectionPositionDroitePlan(exercice: ExercicePositionDroitePlan): BlocCorrection[] {
  const { classification } = exercice;
  const conclusionClassification = `Conclusion : ${phrasePosition(exercice)}.`;

  const reponse = texteReponseJustificationAttendue(exercice);
  const ici =
    classification === "incluse"
      ? `Points de la figure dans le plan ${libellePlan(exercice)} : ${reponse} — ${exercice.droite[0]} et ${exercice.droite[1]} en font partie.`
      : classification === "parallele"
        ? `Ici, la droite ${libelleDroite(exercice)} est parallèle à ${droiteParallele(exercice)}, une droite du plan ${libellePlan(exercice)}.`
        : `Ici, la droite ${libelleDroite(exercice)} perce le plan ${perceeEn(reponse)}.`;

  return [paragraphe("a", `${texteFaitsAppartenance(exercice)} ${conclusionClassification}`), paragraphe("b", `${texteAideJustification(classification)} ${ici}`)];
}

/** « le sommet B » → « au sommet B », « le point I » → « au point I », « un point de l'arête [AB] »
 * → « en un point de l'arête [AB] » (le formateur d'écran renvoie le libellé du candidat). */
function perceeEn(reponse: string): string {
  if (reponse.startsWith("le sommet ")) return `au sommet ${reponse.slice("le sommet ".length)}`;
  if (reponse.startsWith("le point ")) return `au point ${reponse.slice("le point ".length)}`;
  return `en ${reponse}`;
}

// ============================================================================
// Feuilles enrichies (difficulté, réponse brève, corrigé détaillé, barème, énoncé papier). Étapes
// du corrigé = les 2 écrans : a) position (classification), b) justification. Tout vient des
// formateurs de l'écran (`ui/formatPositionDroitePlan.ts`) ; la position est un VERDICT, jamais
// un cas particulier du tirage (voir `profilsEvaluation4eCh8.ts`).
// ============================================================================

function reponseBrevePositionDroitePlan(exercice: ExercicePositionDroitePlan): FragmentConsigne[] {
  const reponse = texteReponseJustificationAttendue(exercice);
  const detail =
    exercice.classification === "incluse"
      ? `points du plan : ${reponse}`
      : exercice.classification === "parallele"
        ? `parallèle à ${droiteParallele(exercice)}, une droite du plan ${libellePlan(exercice)}`
        : `percée ${perceeEn(reponse)}`;
  return [texte(`${LIBELLE_CLASSIFICATION[exercice.classification]} ${libellePlan(exercice)} : ${detail}.`)];
}

/** Niveau CONSTANT (décision « un niveau ne trahit pas la réponse ») : la position est le verdict de
 * l'écran 1 — deux écrans de raisonnement (classification, justification), sans charge (le nombre de
 * lignes dépend du verdict), méthode 1 (choisir parmi les trois cas du cours), aucun piège dans les
 * données, aucun nombre. */
function criteresDifficultePositionDroitePlan(exercice: ExercicePositionDroitePlan): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleePositionDroitePlan(exercice)), sansCharge: true, methode: 1, piege: 0, nombres: 0 };
}

function baremePositionDroitePlan(exercice: ExercicePositionDroitePlan): BaremeExercice {
  const reponse = texteReponseJustificationAttendue(exercice);
  const elementJustification =
    exercice.classification === "incluse"
      ? `Points du plan cités (${reponse}), dont ${exercice.droite[0]} et ${exercice.droite[1]}`
      : exercice.classification === "parallele"
        ? `Droite du plan parallèle à ${libelleDroite(exercice)} : ${droiteParallele(exercice)}`
        : `Point de percée : ${reponse}`;
  return {
    reponseFinale: reponseBrevePositionDroitePlan(exercice),
    criteres: [
      { sousQuestion: "a", critere: [texte(`Appartenance (ou non) de ${exercice.droite[0]} et de ${exercice.droite[1]} au plan ${libellePlan(exercice)}`)], points: 1 },
      { sousQuestion: "a", critere: [texte(`Position : ${LIBELLE_CLASSIFICATION[exercice.classification].toLowerCase()}`)], points: 1 },
      { sousQuestion: "b", critere: [texte(elementJustification)], points: 1.5 },
      { sousQuestion: "b", critere: [texte("Propriété utilisée énoncée (incluse : 2 points dans le plan ; parallèle : parallèle à une droite du plan ; sécante : un seul point commun)")], points: 0.5 },
    ],
    erreursFrequentes: [
      { description: [texte("Position annoncée sans aucune justification")], cout: "0 pt sur b)" },
      { description: [texte("Plan réduit aux 3 points de son nom (un sommet ou un milieu du plan oublié)")], cout: "−0,5 sur a)" },
      {
        description: [texte(exercice.classification === "secante" ? "Point de percée lu sur le dessin à un croisement qui n'est pas dans le plan" : "Parallèle et sécante confondues (lecture du dessin seul)")],
        cout: exercice.classification === "secante" ? "0 pt sur le point de percée" : "0 pt sur a), b) noté selon sa cohérence",
      },
    ],
    reponsesAcceptees: [[texte("Toute justification équivalente qui cite des éléments de la figure (arête parallèle, point commun…)")]],
  };
}

function enoncePapierPositionDroitePlan(exercice: ExercicePositionDroitePlan): EnoncePapier {
  const definitions = textePointsNommes(exercice);
  return {
    section: {
      enteteFragments: [
        texte(`Sur le solide ci-dessous, le plan ${libellePlan(exercice)} est coloré et la droite ${libelleDroite(exercice)} est tracée en trait épais.${definitions ? ` ${definitions}` : ""}`),
      ],
      enteteHtml: construireSvgPositionDroitePlan(exercice),
      questions: [
        {
          consigne: [
            texte(
              `Étudie la position de la droite ${libelleDroite(exercice)} par rapport au plan ${libellePlan(exercice)} (incluse, parallèle ou sécante) et justifie ta réponse en citant les sommets, points, arêtes ou diagonales utiles (point de percée si la droite est sécante).`,
            ),
          ],
        },
      ],
    },
    etapesParQuestion: [["a", "b"]],
  };
}

export const adaptateurEvaluationPositionDroitePlan: AdaptateurFeuilleExercices<ExercicePositionDroitePlan> = {
  titreDocument: "Position d'une droite par rapport à un plan — Évaluation",
  nomFichierBase: "position-droite-plan",
  genererInstance: genererExercicePositionDroitePlan,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnoncePositionDroitePlan,
  construireCorrection: construireCorrectionPositionDroitePlan,
  criteresDifficulte: criteresDifficultePositionDroitePlan,
  reponseBreve: reponseBrevePositionDroitePlan,
  correctionDetaillee: correctionDetailleePositionDroitePlan,
  bareme: baremePositionDroitePlan,
  enoncePapier: enoncePapierPositionDroitePlan,
  profilInstance: profilPositionDroitePlan,
  parametresAuChoix: PARAMETRES_POSITION_DROITE_PLAN,
  libelleCasParticulier: LIBELLE_CAS_POSITION_DROITE_PLAN,
  groupesVerdict: GROUPES_VERDICT_POSITION_DROITE_PLAN,
  // PAS regroupable : 2 questions par instance (classification/justification), jamais 1 seule, ET
  // `enteteHtml` (le croquis) utilisé sur chaque instance — 2 raisons indépendantes déjà suffisantes
  // chacune, voir le commentaire de tête.
};

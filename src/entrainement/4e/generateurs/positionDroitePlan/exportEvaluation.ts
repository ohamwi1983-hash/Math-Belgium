import type { ExercicePositionDroitePlan } from "../../core/positionDroitePlan.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { texte } from "../../../export/fragmentsDocx";
import {
  consigneJustification,
  libelleClassification,
  libelleDroite,
  libellePlan,
  texteAideClassificationNiveau2,
  texteAideJustification,
  texteReponseJustificationAttendue,
} from "../../ui/formatPositionDroitePlan";
import { calculerGeometrieSolide3D, calculerPolygonePlan, HAUTEUR_SVG, LARGEUR_SVG } from "../../ui/solide3DSketch";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExercicePositionDroitePlan } from "./index";

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
 * - Écran 1 "classification" (`EtapeClassificationPositionDroitePlan.tsx`) → question a) : la
 *   consigne "Que peux-tu dire de cette droite par rapport à ce plan ?" est reprise TELLE QUELLE
 *   (jamais reformulée) ; l'élève écrit sa réponse (incluse/parallèle/sécante) sur feuille à part —
 *   aucune zone de réponse vierge (`reponse: { type: "lignes", nombre: 0 }`), même décision
 *   documentée que `generateurs/orthogonalite/exportEvaluation.ts`/`generateurs/triangleQuelconque/
 *   exportEvaluation.ts`.
 * - Écran 2 "justification" (`EtapeJustificationPositionDroitePlan.tsx`) → question b) :
 *   `ui/formatPositionDroitePlan.ts::consigneJustification(exercice.classification)` réutilisée TELLE
 *   QUELLE (déjà adaptée à la catégorie réellement tirée — sélection de 2 sommets pour "incluse",
 *   d'un segment candidat pour "parallele", d'un sommet/arête pour "secante" — jamais un texte
 *   générique unique). Contrairement à l'écran, jamais de liste de boutons candidats imprimée : sur
 *   le croquis, TOUS les sommets sont déjà nommés (labels toujours affichés,
 *   `Solide3DSketch`/`labelsSommets` par défaut `true`), donc l'élève peut désigner lui-même un
 *   segment/sommet par ses lettres sans qu'une liste fermée de distracteurs soit nécessaire sur
 *   copie (cette liste n'existe côté écran QUE pour permettre une vérification automatique par
 *   sélection, jamais parce que la question serait autrement insoluble) — même principe que
 *   `distanceDroite`/`orthogonalite` : une interaction "sélection parmi des boutons" redevient une
 *   question ouverte sur papier, corrigée à la main. Aucune zone de réponse vierge non plus, même
 *   raison qu'a).
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
 * - a) `texteAideClassificationNiveau2(exercice)` (déjà l'aide de niveau 2 substituée avec les vrais
 *   noms de points — appartenance de chacun des 2 points de la droite au plan), suivi de la
 *   conclusion via `libelleClassification` (ex. "la droite (AB) est incluse dans le plan (ABC).").
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
// Diagramme SVG — croquis en perspective cavalière, plan + droite mis en évidence.
// ============================================================================

const COULEUR_TRAIT = "#1b1c2b"; // --color-text (thème clair, src/index.css)
const COULEUR_PLAN = "#6d28d9"; // --color-primary (thème clair)
const COULEUR_DROITE = "#e8590c"; // .solide3d-droite (App.css) — couleur fixe, jamais liée au thème
const COULEUR_BORDURE = "#e6e6f0"; // --color-border (thème clair)

/**
 * `<svg>` autonome du croquis en perspective cavalière de gen39 — mêmes 5 calques que
 * `components/Solide3DSketch.tsx` (arêtes cachées pointillées, polygone du plan, arêtes visibles,
 * droite surlignée, labels de sommets), en attributs SVG littéraux (voir le commentaire de tête pour
 * pourquoi). Voir aussi le commentaire de tête pour la réutilisation exclusive des fonctions pures de
 * `ui/solide3DSketch.ts`.
 */
function construireSvgPositionDroitePlan(exercice: ExercicePositionDroitePlan): string {
  const { solide, plan, droite } = exercice;
  const geometrie = calculerGeometrieSolide3D(solide);
  const polygonePlan = calculerPolygonePlan(solide, plan);

  const aretesCachees = geometrie.aretes.filter((a) => !a.visible);
  const aretesVisibles = geometrie.aretes.filter((a) => a.visible);

  const ligneArete = (sommets: [string, string], style: "pleine" | "pointille"): string => {
    const [n1, n2] = sommets;
    const p1 = geometrie.sommetsPixel[n1];
    const p2 = geometrie.sommetsPixel[n2];
    const traitPointille = style === "pointille" ? ' stroke-dasharray="4 3"' : "";
    const epaisseur = style === "pointille" ? 1.5 : 1.75;
    return `<line x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" stroke="${COULEUR_TRAIT}" stroke-width="${epaisseur}"${traitPointille}/>`;
  };

  const aretesCacheesHtml = aretesCachees.map((a) => ligneArete(a.sommets, "pointille")).join("");
  const aretesVisiblesHtml = aretesVisibles.map((a) => ligneArete(a.sommets, "pleine")).join("");

  const planHtml =
    polygonePlan.length >= 3
      ? `<polygon points="${polygonePlan.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")}" fill="${COULEUR_PLAN}" fill-opacity="0.28" stroke="${COULEUR_PLAN}" stroke-width="2" stroke-linejoin="round"/>`
      : "";

  const [d1, d2] = droite;
  const pd1 = geometrie.sommetsPixel[d1];
  const pd2 = geometrie.sommetsPixel[d2];
  const droiteHtml = `<line x1="${pd1.x.toFixed(1)}" y1="${pd1.y.toFixed(1)}" x2="${pd2.x.toFixed(1)}" y2="${pd2.y.toFixed(1)}" stroke="${COULEUR_DROITE}" stroke-width="3" stroke-linecap="round"/>`;

  const labelsHtml = Object.entries(geometrie.sommetsPixel)
    .map(([nom, p]) => {
      const label = geometrie.labelsSommetsPixel[nom];
      return `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="2.5" fill="${COULEUR_TRAIT}"/><text x="${label.x.toFixed(1)}" y="${label.y.toFixed(1)}" font-size="13" font-weight="700" text-anchor="middle" dominant-baseline="middle" fill="${COULEUR_TRAIT}">${nom}</text>`;
    })
    .join("");

  return `<svg width="${LARGEUR_SVG}" height="${HAUTEUR_SVG}" viewBox="0 0 ${LARGEUR_SVG} ${HAUTEUR_SVG}" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:10px auto 16px;max-width:380px;width:100%;border:1px solid ${COULEUR_BORDURE};border-radius:8px;background:#ffffff;" role="img" aria-label="Représentation en perspective cavalière du solide, plan et droite mis en évidence">
<rect x="0" y="0" width="${LARGEUR_SVG}" height="${HAUTEUR_SVG}" fill="#ffffff"/>
${aretesCacheesHtml}
${planHtml}
${aretesVisiblesHtml}
${droiteHtml}
${labelsHtml}
</svg>`;
}

// ============================================================================
// Énoncé / correction.
// ============================================================================

function construireEnoncePositionDroitePlan(exercice: ExercicePositionDroitePlan): SectionExercice {
  return {
    enteteFragments: [texte(`Étudie la position de la droite ${libelleDroite(exercice)} par rapport au plan ${libellePlan(exercice)}.`)],
    enteteHtml: construireSvgPositionDroitePlan(exercice),
    questions: [
      { consigne: [texte("Que peux-tu dire de cette droite par rapport à ce plan ?")], reponse: { type: "lignes", nombre: 0 } },
      { consigne: [texte(consigneJustification(exercice.classification))], reponse: { type: "lignes", nombre: 0 } },
    ],
  };
}

function paragraphe(lettre: string, contenu: string): BlocCorrection {
  return { type: "paragraphe", fragments: [texte(`${lettre}) ${contenu}`)] };
}

function construireCorrectionPositionDroitePlan(exercice: ExercicePositionDroitePlan): BlocCorrection[] {
  const { classification } = exercice;

  const faitsAppartenance = texteAideClassificationNiveau2(exercice);
  const conclusionClassification = `Conclusion : la droite ${libelleDroite(exercice)} est ${libelleClassification(classification).toLowerCase()} ${libellePlan(exercice)}.`;

  const reponseJustification = texteReponseJustificationAttendue(exercice);
  const justification = `${texteAideJustification(classification)} Ici : ${reponseJustification}.`;

  return [paragraphe("a", `${faitsAppartenance} ${conclusionClassification}`), paragraphe("b", justification)];
}

export const adaptateurEvaluationPositionDroitePlan: AdaptateurFeuilleExercices<ExercicePositionDroitePlan> = {
  titreDocument: "Position d'une droite par rapport à un plan — Évaluation",
  nomFichierBase: "position-droite-plan",
  genererInstance: genererExercicePositionDroitePlan,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnoncePositionDroitePlan,
  construireCorrection: construireCorrectionPositionDroitePlan,
  // PAS regroupable : 2 questions par instance (classification/justification), jamais 1 seule, ET
  // `enteteHtml` (le croquis) utilisé sur chaque instance — 2 raisons indépendantes déjà suffisantes
  // chacune, voir le commentaire de tête.
};

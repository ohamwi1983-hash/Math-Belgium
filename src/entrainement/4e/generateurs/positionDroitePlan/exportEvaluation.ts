import type { ExercicePositionDroitePlan } from "../../core/positionDroitePlan.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { texte } from "../../../export/fragmentsDocx";
import {
  libelleDroite,
  libellePlan,
  phrasePosition,
  texteAideJustification,
  texteFaitsAppartenance,
  textePointsNommes,
  texteReponseJustificationAttendue,
} from "../../ui/formatPositionDroitePlan";
import {
  calculerEchelleProjection,
  calculerGeometrieSolide3D,
  calculerPolygonePlan,
  calculerSegmentsDroite,
  HAUTEUR_SVG,
  LARGEUR_SVG,
  positionLabelExterieur,
  projeter3DVersPixel,
} from "../../ui/solide3DSketch";
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

  // Droite prolongée au-delà de ses 2 points, partie cachée par le solide en pointillé — même
  // découpage que l'écran (`calculerSegmentsDroite`, audit chapitre 8).
  const position = (nom: string) => solide.sommets[nom] ?? exercice.pointsNommes.find((p) => p.nom === nom)!.position;
  const droiteHtml = calculerSegmentsDroite(solide, position(droite[0]), position(droite[1]))
    .map(
      (seg) =>
        `<line x1="${seg.x1.toFixed(1)}" y1="${seg.y1.toFixed(1)}" x2="${seg.x2.toFixed(1)}" y2="${seg.y2.toFixed(1)}" stroke="${COULEUR_DROITE}" stroke-width="${seg.cache ? 2.25 : 3}"${seg.cache ? ' stroke-dasharray="6 5"' : ' stroke-linecap="round"'}/>`,
    )
    .join("");

  // Milieux nommés (I, J) — étiquette décalée vers l'extérieur du solide.
  const echelle = calculerEchelleProjection(solide);
  const pointsNommesHtml = exercice.pointsNommes
    .map((p) => {
      const pixel = projeter3DVersPixel(p.position, echelle);
      const label = positionLabelExterieur(solide, p.position);
      return `<circle cx="${pixel.x.toFixed(1)}" cy="${pixel.y.toFixed(1)}" r="3.5" fill="${COULEUR_TRAIT}"/><text x="${label.x.toFixed(1)}" y="${label.y.toFixed(1)}" font-size="13" font-weight="700" text-anchor="middle" dominant-baseline="middle" fill="${COULEUR_TRAIT}">${p.nom}</text>`;
    })
    .join("");

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
${pointsNommesHtml}
</svg>`;
}

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
      { consigne: [texte("Que peux-tu dire de cette droite par rapport à ce plan ?")], reponse: { type: "lignes", nombre: 1 } },
      { consigne: [texte(CONSIGNE_JUSTIFICATION_PAPIER)], reponse: { type: "lignes", nombre: 3 } },
    ],
  };
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
        ? `Ici, la droite ${libelleDroite(exercice)} a la même direction que ${reponse.startsWith("arête") ? "l'" : "la "}${reponse}, qui est dans le plan ${libellePlan(exercice)}.`
        : `Ici, la droite ${libelleDroite(exercice)} perce le plan en ${reponse}.`;

  return [paragraphe("a", `${texteFaitsAppartenance(exercice)} ${conclusionClassification}`), paragraphe("b", `${texteAideJustification(classification)} ${ici}`)];
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

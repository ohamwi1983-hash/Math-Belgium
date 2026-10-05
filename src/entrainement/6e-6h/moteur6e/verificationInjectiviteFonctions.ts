import type { EnsembleReelGuide } from "../core6e/ensembleReel.types";
import type { ExerciceInjectiviteFonctions } from "../core6e/injectiviteFonctions.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerEquivalenceFonction } from "./equivalenceExponentielle";
import type { CoteBranche } from "./typesInjectiviteFonctions";
import { verifierEnsembleReelGuide } from "./verificationEnsembleReel";

/**
 * Couche B — vérification pour `6gen1` ("Fonctions injectives/surjectives/bijectives"). N'importe
 * JAMAIS rien de `src/generateurs6e/` (règle non négociable, CLAUDE.md) — voir
 * `verificationInjectiviteFonctions.test.ts` (fixtures locales factices) et
 * `generateurs6e/injectiviteFonctions/session.integration.test.ts` (seul fichier autorisé Couche A
 * + Couche B) pour la preuve.
 *
 * Les écrans 1/2/4/5 sont GUIDÉS (constructions structurées via `EnsembleReelGuideBuilder`/boutons
 * Oui-Non, jamais de LaTeX libre à parser) : comparaison STRUCTURELLE via
 * `verifierEnsembleReelGuide`. Seul l'écran 3 (réciproque) est un champ libre — vérifié par
 * échantillonnage numérique (voir CLAUDE.md, "Statut de vérification à 3 valeurs").
 */

// ============================================================================
// Écran 1 — domaine.
// ============================================================================

export function verifierDomaine(exercice: ExerciceInjectiviteFonctions, reponse: EnsembleReelGuide): boolean {
  return verifierEnsembleReelGuide(reponse, exercice.domaine);
}

// ============================================================================
// Écran 2 — injective (Oui/Non) + sous-question "plus grand intervalle d'injectivité" si "Non".
// ============================================================================

export interface ReponseInjective {
  ouiNon: boolean;
  /** Renseigné seulement quand `ouiNon===false` (sous-question révélée côté UI) — `null` sinon. */
  intervalle: EnsembleReelGuide | null;
}

export interface StatutInjective {
  ouiNonCorrect: boolean;
  /** `null` si aucune sous-question n'était nécessaire pour cette réponse (`ouiNon===true`). */
  intervalleCorrect: boolean | null;
  global: boolean;
}

/** Une des 2 moitiés symétriques du pivot est TOUJOURS acceptée indifféremment comme correcte
 * (spec explicite) — jamais une seule des deux privilégiée. */
export function diagnostiquerInjective(exercice: ExerciceInjectiviteFonctions, reponse: ReponseInjective): StatutInjective {
  const ouiNonCorrect = reponse.ouiNon === exercice.injective;
  if (exercice.injective) {
    return { ouiNonCorrect, intervalleCorrect: null, global: ouiNonCorrect };
  }
  const intervalleCorrect =
    reponse.intervalle !== null &&
    (verifierEnsembleReelGuide(reponse.intervalle, exercice.intervalleGauche) || verifierEnsembleReelGuide(reponse.intervalle, exercice.intervalleDroite));
  return { ouiNonCorrect, intervalleCorrect, global: ouiNonCorrect && intervalleCorrect };
}

export function verifierInjective(exercice: ExerciceInjectiviteFonctions, reponse: ReponseInjective): boolean {
  return diagnostiquerInjective(exercice, reponse).global;
}

/**
 * Détecte quelle branche (gauche/droite) correspond à l'intervalle soumis, pour noter ensuite
 * l'écran "réciproque" avec la BONNE closure (`fInverseGauche`/`fInverseDroite`) — voir en-tête de
 * `typesInjectiviteFonctions.ts` pour la justification complète de ce mécanisme de cohérence.
 * `"droite"` par défaut sur toute réponse qui ne correspond exactement à aucune des 2 moitiés
 * (réponse fausse, révélation après épuisement des tentatives — choix arbitraire mais déterministe,
 * documenté ici car la spec ne tranche pas explicitement ce cas limite).
 */
export function detecterCoteBranche(exercice: ExerciceInjectiviteFonctions, intervalle: EnsembleReelGuide | null): CoteBranche {
  if (intervalle !== null && verifierEnsembleReelGuide(intervalle, exercice.intervalleGauche)) return "gauche";
  return "droite";
}

// ============================================================================
// Écran 3 — réciproque (champ libre "f⁻¹(x)=").
// ============================================================================

const OFFSETS = [0.3, 0.7, 1.3, 2.1, 3.4, 5.5, 8.9];

/** Échantillons de points DANS un `EnsembleReelGuide` — générique, ne connaît rien d'une famille en
 * particulier (fonctionne à partir de la SEULE forme structurelle de l'ensemble), pour rester
 * réutilisable par n'importe laquelle des 6 familles sans code spécifique ici. */
function pointsDansEnsemble(e: EnsembleReelGuide): number[] {
  if (e.forme === "reel") return [-7, -5, -3, -1.7, -0.6, 0.6, 1.7, 3, 5, 7, -2.3, 4.2];
  if (e.forme === "prive_points") {
    const candidats = [-7, -5, -3, -1.7, -0.6, 0.6, 1.7, 3, 5, 7, -2.3, 4.2, -0.15, 0.15];
    return candidats.filter((v) => !e.points.some((p) => Math.abs(p - v) < 1e-6));
  }
  const pts: number[] = [];
  for (const m of e.morceaux) {
    if (m.inf === null && m.sup === null) pts.push(-7, -3, -0.6, 0.6, 3, 7);
    else if (m.inf === null) pts.push(...OFFSETS.map((o) => (m.sup as number) - o));
    else if (m.sup === null) pts.push(...OFFSETS.map((o) => (m.inf as number) + o));
    else pts.push(...[0.1, 0.25, 0.4, 0.6, 0.75, 0.9].map((f) => (m.inf as number) + f * ((m.sup as number) - (m.inf as number))));
  }
  return pts;
}

export function diagnostiquerReciproque(exercice: ExerciceInjectiviteFonctions, cote: CoteBranche, texte: string): StatutVerification {
  const reference = cote === "gauche" ? exercice.fInverseGauche : exercice.fInverseDroite;
  const points = pointsDansEnsemble(exercice.image);
  return diagnostiquerEquivalenceFonction(texte, reference, points);
}

export function verifierReciproque(exercice: ExerciceInjectiviteFonctions, cote: CoteBranche, texte: string): boolean {
  return diagnostiquerReciproque(exercice, cote, texte) === "correct";
}

// ============================================================================
// Écran 4 — image.
// ============================================================================

export function verifierImage(exercice: ExerciceInjectiviteFonctions, reponse: EnsembleReelGuide): boolean {
  return verifierEnsembleReelGuide(reponse, exercice.image);
}

// ============================================================================
// Écran 5 — bijection (double combobox X/Y indépendante).
// ============================================================================

export interface ReponseBijection {
  x: EnsembleReelGuide;
  y: EnsembleReelGuide;
}

export interface StatutBijection {
  xCorrect: boolean;
  yCorrect: boolean;
  global: boolean;
}

/** Chaque combobox est vérifiée INDÉPENDAMMENT (spec explicite) : X contre le(s) intervalle(s) de
 * l'écran 2 (n'importe laquelle des 2 moitiés), Y contre l'image de l'écran 4 — jamais recalculés
 * ici. **Piège transversal documenté par la spec** : X reste indépendant de la branche mémorisée
 * pour l'écran 3 (`coteChoisi`) — les 2 moitiés restent acceptées ici même si l'élève a construit sa
 * réciproque sur l'autre branche à l'écran précédent, par cohérence avec l'écran 2 qui accepte déjà
 * les 2 indifféremment. Ne jamais resserrer cette vérification à la seule branche de `coteChoisi`. */
export function diagnostiquerBijection(exercice: ExerciceInjectiviteFonctions, reponse: ReponseBijection): StatutBijection {
  const xCorrect = verifierEnsembleReelGuide(reponse.x, exercice.intervalleGauche) || verifierEnsembleReelGuide(reponse.x, exercice.intervalleDroite);
  const yCorrect = verifierEnsembleReelGuide(reponse.y, exercice.image);
  return { xCorrect, yCorrect, global: xCorrect && yCorrect };
}

export function verifierBijection(exercice: ExerciceInjectiviteFonctions, reponse: ReponseBijection): boolean {
  return diagnostiquerBijection(exercice, reponse).global;
}

import type { EnsembleReelGuide, ExerciceDomaineDefinition, GrilleQuotientDomf, MorceauEnsemble, SlotCE, SymboleCE } from "../core5e/domaineDefinition.types";

/**
 * Couche B — vérification pour 5gen1 ("Domaine de définition"). Les 3 écrans sont tous GUIDÉS
 * (choix structurés, jamais de LaTeX libre à parser — voir CLAUDE.md section 5gen1) : chaque
 * vérification est une comparaison STRUCTURELLE (ensembliste, ordre indifférent), jamais une
 * équivalence algébrique/échantillonnée. Aucun statut à 3 valeurs nécessaire ici (rien à parser,
 * le bouton "Valider" reste désactivé tant que la saisie guidée n'est pas complète — même principe
 * que les autres constructions guidées de la plateforme, ex. `FormeDomaine`/gen12-13 4e).
 */

// ============================================================================
// Écran 1 — CE (guidé : slot sélectionné + symbole choisi par bouton).
// ============================================================================

export type ReponseCE = { aucuneCE: true } | { aucuneCE: false; lignes: { slotId: string; symbole: SymboleCE }[] };

/**
 * Réduit toutes les lignes portant sur un même slot à un unique symbole EFFECTIF, en reconnaissant
 * l'équivalence réelle `e>0 ⟺ (e≥0 ET e≠0)` — valable pour n'importe quelle expression réelle,
 * jamais limitée à une famille particulière : 2 lignes `{≥,≠}` sur le MÊME slot valent une seule
 * ligne `>` sur ce slot. Toute autre combinaison sur un même slot (doublon, 3 lignes ou plus, paire
 * différente de `{≥,≠}`) est structurellement invalide → `null` (rejet), jamais une équivalence
 * inventée pour la faire passer.
 */
function symboleEffectifPourSlot(symboles: SymboleCE[]): SymboleCE | null {
  if (symboles.length === 1) return symboles[0];
  const distincts = new Set(symboles);
  if (symboles.length === 2 && distincts.size === 2 && distincts.has("≥") && distincts.has("≠")) return ">";
  return null;
}

/**
 * Comparaison de la CONJONCTION de toutes les lignes écrites par l'élève à la conjonction des
 * conditions attendues (`exercice.slots`) — jamais une comparaison positionnelle ligne à ligne
 * stricte (l'ordre des lignes est indifférent), mais chaque slot réel de `exercice.slots` doit
 * apparaître comme sa PROPRE ligne explicite, avec le bon symbole : aucun slot ne peut être omis
 * au motif qu'il serait mathématiquement impliqué par un autre déjà présent — choix pédagogique
 * délibéré (ex. famille "fractionSousRacine" : écrire "N/D≥0" seul, sans la ligne séparée "D≠0",
 * est rejeté même si "D≠0" est mathématiquement présupposée par "N/D≥0"). Reste conservateur par
 * ailleurs : un id de decoy (jamais un vrai `SlotCE.id`) ou un symbole non équivalent restent
 * toujours rejetés.
 *
 * Ne pas confondre avec `symboleEffectifPourSlot` ci-dessus : celle-ci reconnaît une équivalence
 * mathématique réelle (`e>0 ⟺ (e≥0 ET e≠0)`) sur les lignes portant sur un MÊME slot — un mécanisme
 * différent, toujours actif, hors du champ de cette règle.
 */
export function verifierCE(exercice: ExerciceDomaineDefinition, reponse: ReponseCE): boolean {
  if (exercice.aucuneCE) {
    return reponse.aucuneCE === true;
  }
  if (reponse.aucuneCE) return false;
  const attendues: SlotCE[] = exercice.famille === "pasDeCE" ? [] : exercice.slots;

  const lignesParSlot = new Map<string, SymboleCE[]>();
  for (const ligne of reponse.lignes) {
    const arr = lignesParSlot.get(ligne.slotId) ?? [];
    arr.push(ligne.symbole);
    lignesParSlot.set(ligne.slotId, arr);
  }

  const effectifParSlot = new Map<string, SymboleCE>();
  for (const [slotId, symboles] of lignesParSlot) {
    const effectif = symboleEffectifPourSlot(symboles);
    if (effectif === null) return false;
    effectifParSlot.set(slotId, effectif);
  }

  // Aucune ligne ne doit viser un id absent des slots réels attendus (ex. un decoy "numérateur
  // seul" — un id de decoy ne correspond jamais à un `SlotCE.id` réel, donc jamais accepté).
  const idsAttendus = new Set(attendues.map((s) => s.id));
  for (const slotId of effectifParSlot.keys()) {
    if (!idsAttendus.has(slotId)) return false;
  }

  for (const slot of attendues) {
    const effectif = effectifParSlot.get(slot.id);
    // Chaque slot réel est OBLIGATOIRE en tant que ligne explicite propre — jamais omissible, même
    // si sa condition est mathématiquement impliquée par un autre slot déjà présent et correct.
    if (effectif === undefined || effectif !== slot.symboleAttendu) return false;
  }

  return true;
}

// ============================================================================
// Écran 2/3 — ensemble guidé (résolution d'une condition seule OU domf final) : forme +
// points/morceaux structurés, comparaison ensembliste (ordre indifférent), tolérance flottante sur
// les bornes numériques.
// ============================================================================

function memeValeur(a: number | null, b: number | null): boolean {
  if (a === null || b === null) return a === b;
  return Math.abs(a - b) < 1e-6;
}

function memeMorceau(a: MorceauEnsemble, b: MorceauEnsemble): boolean {
  return memeValeur(a.inf, b.inf) && memeValeur(a.sup, b.sup) && a.infInclus === b.infInclus && a.supInclus === b.supInclus;
}

function trierMorceaux(morceaux: MorceauEnsemble[]): MorceauEnsemble[] {
  return [...morceaux].sort((a, b) => (a.inf ?? -Infinity) - (b.inf ?? -Infinity));
}

export function verifierEnsembleReelGuide(saisie: EnsembleReelGuide, attendu: EnsembleReelGuide): boolean {
  if (saisie.forme !== attendu.forme) return false;
  if (attendu.forme === "reel") return true;
  if (attendu.forme === "prive_points") {
    const a = [...attendu.points].sort((x, y) => x - y);
    const s = [...saisie.points].sort((x, y) => x - y);
    return a.length === s.length && a.every((v, i) => Math.abs(v - s[i]) < 1e-6);
  }
  const a = trierMorceaux(attendu.morceaux);
  const s = trierMorceaux(saisie.morceaux);
  return a.length === s.length && a.every((m, i) => memeMorceau(m, s[i]));
}

/**
 * Écran 2, famille "racineSurFraction" uniquement : 2 réponses indépendantes (radicande + valeur
 * exclue). Le dénominateur est désormais lui aussi un `EnsembleReelGuide` (guidé, jamais un champ
 * texte libre "valeur exclue" — promptcorrectionsregroupees.md, B.0.5 "usage systématique") : la
 * seule forme structurellement sensée pour "D≠0" (une seule valeur exclue) est `prive_points` à un
 * point, comparée à `exercice.resolutionDenominateur` via `verifierEnsembleReelGuide`, exactement
 * comme le radicande.
 */
export interface ReponseResolutionRacineSurFraction {
  radicande: EnsembleReelGuide;
  denominateur: EnsembleReelGuide;
}

export function verifierResolutionRacineSurFraction(
  exercice: Extract<ExerciceDomaineDefinition, { famille: "racineSurFraction" }>,
  reponse: ReponseResolutionRacineSurFraction,
): boolean {
  // `resolutionDenominateur` n'est `null` que pour la structure "nSurRacineD" — jamais atteinte ici
  // en pratique (cette fonction n'est appelée que pour "racineSurD", la seule structure à conserver
  // un écran "resolution" séparé — voir `phaseApresCE`), garde défensive plutôt qu'un cast.
  if (exercice.resolutionDenominateur === null) return false;
  const attenduDenominateur: EnsembleReelGuide = { forme: "prive_points", points: [exercice.resolutionDenominateur], morceaux: [] };
  return verifierEnsembleReelGuide(reponse.radicande, exercice.resolutionRadicande) && verifierEnsembleReelGuide(reponse.denominateur, attenduDenominateur);
}

// ============================================================================
// Écran 2, famille "fractionSousRacine" uniquement : grille de signes à convention ∄ — comparaison
// structurelle terme à terme, même principe que `verifierGrilleQuotient` (moteur/
// verificationInequationRationnelle.ts, 4e) mais réimplémentée ici (petite fonction pure, jamais
// importée cross-chantier — contrairement aux types `ValeurCellule`/`ValeurCelluleQuotient`
// eux-mêmes et aux fonctions de cycle `src/ui/cycleValeurCellule.ts`/`cycleValeurCelluleQuotient.ts`,
// génériques et réutilisées directement, voir CLAUDE.md section 5gen1).
// ============================================================================

function ligneEgale<T>(a: T[], b: T[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

export function verifierGrilleDomf(saisie: GrilleQuotientDomf, attendu: GrilleQuotientDomf): boolean {
  return (
    ligneEgale(saisie.ligneNumerateur, attendu.ligneNumerateur) &&
    ligneEgale(saisie.ligneDenominateur, attendu.ligneDenominateur) &&
    ligneEgale(saisie.ligneQuotient, attendu.ligneQuotient)
  );
}

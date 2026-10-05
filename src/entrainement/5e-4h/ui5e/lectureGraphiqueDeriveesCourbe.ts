/**
 * Couche présentation (5e) — construction PROCÉDURALE de la courbe pour 5gen30 ("Lecture
 * graphique — dérivées et applications"). f(x) = baseTrend(x) + Σ bumps — `baseTrend` réutilise
 * DIRECTEMENT `construirePieces`/`BUFFER_VA` de `ui5e/lectureGraphiqueLimitesCourbe.ts` (5gen22,
 * Couche présentation ↔ Couche présentation, légitime) pour la construction morceau-par-morceau,
 * mais réimplémente localement `evaluerPieceMelangee` avec `ALPHA_BLEND_DERIVEES=2` (au lieu de 8) :
 * ce paramètre DIFFÈRE délibérément de 5gen22 — voir l'en-tête de
 * `generateurs5e/lectureGraphiqueDerivees/courbeNumerique.ts` pour l'investigation empirique
 * complète qui a motivé ce choix. Les DEUX copies (celle-ci et la réplique Couche A) doivent rester
 * mathématiquement identiques — verrouillé par un test d'équivalence dédié
 * (`lectureGraphiqueDeriveesCourbe.test.ts`).
 */
import type { ExerciceLectureGraphiqueDerivees } from "../core5e/lectureGraphiqueDerivees.types";
import type { ExerciceLectureGraphiqueLimites } from "../core5e/lectureGraphiqueLimites.types";
import { BUFFER_VA, construirePieces } from "./lectureGraphiqueLimitesCourbe";
import type { PieceCourbe } from "./lectureGraphiqueLimitesCourbe";
import type { IdAsymptote } from "../moteur5e/typesLectureGraphiqueLimites";
import { xBordVisibleY } from "../ui/mafsTransformation";

/** Écart DÉLIBÉRÉ vs 5gen22 (`ALPHA_BLEND=8`) — voir l'en-tête de fichier. */
export const ALPHA_BLEND_DERIVEES = 2;

export function evaluerPieceMelangeeDerivees(piece: PieceCourbe, loRendu: number, hiRendu: number, x: number): number {
  const largeur = Math.max(hiRendu - loRendu, 1e-6);
  const t = (x - loRendu) / largeur;
  const poidsGauche = 1 / (1 + Math.exp(ALPHA_BLEND_DERIVEES * (t - 0.5)));
  return poidsGauche * piece.gabaritGauche(x) + (1 - poidsGauche) * piece.gabaritDroit(x);
}

const MARGE_X = 4;
const DEMI_LARGEUR_X_MIN = 5;

/** Bornes X — même formule que `calculerViewBoxLectureGraphique` (5gen22), la partie X ne dépend
 * que des positions d'AV, jamais des bumps. Exportée séparément du calcul du viewBox complet
 * (Y dépend des extrema/PI, jamais connus avant la génération). */
export function calculerBornesX(asymptotique: ExerciceLectureGraphiqueLimites): [number, number] {
  const positions = asymptotique.vas.map((va) => va.position);
  const xEtendueMin = Math.min(0, ...positions) - MARGE_X;
  const xEtendueMax = Math.max(0, ...positions) + MARGE_X;
  const demiLargeur = Math.max(DEMI_LARGEUR_X_MIN, (xEtendueMax - xEtendueMin) / 2);
  const centreX = (xEtendueMin + xEtendueMax) / 2;
  return [centreX - demiLargeur, centreX + demiLargeur];
}

export interface PieceDomaineDerivees {
  lo: number;
  hi: number;
  piece: PieceCourbe;
}

export function construireDomainesPieces(asymptotique: ExerciceLectureGraphiqueLimites, xMin: number, xMax: number): PieceDomaineDerivees[] {
  return construirePieces(asymptotique).map((piece) => ({
    lo: piece.loVA === null ? xMin : piece.loVA + BUFFER_VA,
    hi: piece.hiVA === null ? xMax : piece.hiVA - BUFFER_VA,
    piece,
  }));
}

function evaluerBaseTrendSurDomaines(domaines: PieceDomaineDerivees[], x: number): number {
  for (const d of domaines) {
    if (x >= d.lo && x <= d.hi) return evaluerPieceMelangeeDerivees(d.piece, d.lo, d.hi, x);
  }
  let meilleur = domaines[0];
  let meilleureDistance = Infinity;
  for (const d of domaines) {
    const dist = x < d.lo ? d.lo - x : x > d.hi ? x - d.hi : 0;
    if (dist < meilleureDistance) {
      meilleureDistance = dist;
      meilleur = d;
    }
  }
  return evaluerPieceMelangeeDerivees(meilleur.piece, meilleur.lo, meilleur.hi, x);
}

/** Gaussienne — CONSERVÉE après investigation d'un support compact polynomial, abandonné car
 * empiriquement PIRE sur le pipeline réel (excès plus élevé, pas plus faible) — voir l'en-tête de
 * `bumpExtremumValeur` dans `generateurs5e/lectureGraphiqueDerivees/courbeNumerique.ts` pour la
 * preuve complète. DOIT rester identique à la copie Couche A. */
export function bumpExtremumValeur(bump: { positionNominale: number; amplitude: number; largeur: number }, x: number): number {
  const u = (x - bump.positionNominale) / bump.largeur;
  return bump.amplitude * Math.exp(-u * u);
}
export function bumpInflexionValeur(bump: { positionNominale: number; amplitude: number; largeur: number }, x: number): number {
  return bump.amplitude * Math.tanh((x - bump.positionNominale) / bump.largeur);
}

/** Construit l'évaluateur f(x) complet — DOIT rester mathématiquement identique à
 * `construireEvaluateurCourbeDerivees` (Couche A, `courbeNumerique.ts`) pour un même exercice :
 * c'est ce qui garantit que la vérité terrain stockée correspond EXACTEMENT à ce qui est affiché
 * (voir test d'équivalence dédié). */
export function construireEvaluateurCourbeDerivees(exercice: ExerciceLectureGraphiqueDerivees, xMin: number, xMax: number): (x: number) => number {
  const domaines = construireDomainesPieces(exercice.asymptotique, xMin, xMax);
  return (x: number) => {
    let v = evaluerBaseTrendSurDomaines(domaines, x);
    for (const b of exercice.bumpsExtremum) v += bumpExtremumValeur(b, x);
    for (const b of exercice.bumpsInflexion) v += bumpInflexionValeur(b, x);
    return v;
  };
}

export interface SegmentCourbeDerivees {
  domaine: [number, number];
  evaluer: (x: number) => number;
}

/** Bornes de segment RÉACTIVES au zoom (`promptauditcourbesmafszoomy.md`, addendum Y) — utilisées
 * UNIQUEMENT pour le `domain` du `Plot.OfX` (où arrêter visuellement le tracé), JAMAIS pour
 * l'évaluateur `f` (`construireEvaluateurCourbeDerivees`, qui continue d'utiliser les bornes FIXES
 * de `construireDomainesPieces` : ce dernier reste inchangé pour préserver l'identité mathématique
 * avec la copie Couche A verrouillée par le test d'équivalence — voir l'en-tête de fichier). Même
 * principe bissection que `construireSegments` (5gen22, `lectureGraphiqueLimitesCourbe.ts`) :
 * bissecte sur le gabarit divergent seul, seulement côté réellement divergent (`pointIsoleGauche`/
 * `pointIsoleDroit` absent sur l'AV voisine), avec la même garde `xMax > piece.loVA`/
 * `xMin < piece.hiVA`. Un x plus proche du pôle que la borne fixe interne à `f` reste correctement
 * évalué (repli "morceau le plus proche" d'`evaluerBaseTrendSurDomaines`, qui sature naturellement
 * vers le gabarit divergent pur près du pôle — aucune coupure visuelle).
 */
function construireBornesSegmentsVisibles(asymptotique: ExerciceLectureGraphiqueLimites, xMin: number, xMax: number, visibleY: [number, number]): { lo: number; hi: number }[] {
  return construirePieces(asymptotique).map((piece, i) => {
    let lo = piece.loVA === null ? xMin : piece.loVA + BUFFER_VA;
    let hi = piece.hiVA === null ? xMax : piece.hiVA - BUFFER_VA;

    if (piece.loVA !== null && asymptotique.vas[i - 1].pointIsoleDroit === undefined && xMax > piece.loVA) {
      lo = xBordVisibleY(piece.gabaritGauche, piece.loVA, xMax, visibleY);
    }
    if (piece.hiVA !== null && asymptotique.vas[i].pointIsoleGauche === undefined && xMin < piece.hiVA) {
      hi = xBordVisibleY(piece.gabaritDroit, piece.hiVA, xMin, visibleY);
    }

    return { lo, hi };
  });
}

/**
 * Un `Plot.OfX domain=...` par morceau (jamais un seul avec exclusion interne), même principe que
 * `construireSegments` (5gen22).
 *
 * **Bug trouvé et corrigé (`prompt5gen30jitterpersisterediagnostic.md`)** : `f` était construit ICI
 * avec les bornes `xMin`/`xMax` REÇUES EN PARAMÈTRE — qui sont `visible[0]`/`visible[1]`
 * (`domaineVisibleX`, réactif au zoom/pan), contredisant le commentaire de
 * `construireBornesSegmentsVisibles` ci-dessus (« JAMAIS pour l'évaluateur f... qui continue
 * d'utiliser les bornes FIXES ») — l'intention documentée était correcte, le code ne la respectait
 * pas. Conséquence, isolée par instrumentation temporaire de `sampleParametric` (Mafs) : pour un
 * morceau SANS AV d'un côté (`loVA`/`hiVA===null`), ce côté de `evaluerPieceMelangeeDerivees` (le
 * mélange sigmoïde `poidsGauche`/`largeur`) utilise DIRECTEMENT `xMin`/`xMax` comme bord de mélange
 * — la LARGEUR et donc le POIDS du mélange à un x donné changent ainsi à chaque frame de pan/zoom,
 * même une fois le domaine de `Plot.OfX` stabilisé (fix précédent, `ui/mafsTransformation.ts`) : la
 * fonction TRACÉE elle-même se redéforme en continu, pas seulement sa troncature — preuve directe
 * observée : `sampleParametric` rappelé avec domaine/seuil/profondeurs BIT POUR BIT IDENTIQUES entre
 * 2 frames produisait pourtant des tracés de longueur différente (only explicable par un `fn`
 * différent, donc une valeur `f(x)` différente pour un même x). Fix : `f` utilise désormais TOUJOURS
 * les bornes FIXES `calculerBornesX(exercice.asymptotique)` (mêmes qu'utilisées par
 * `calculerViewBoxLectureGraphiqueDerivees` et par la réplique Couche A,
 * `calculerBornesXDerivees`/`courbeNumerique.ts`) — `xMin`/`xMax` REÇUS restent utilisés
 * UNIQUEMENT par `construireBornesSegmentsVisibles` (troncature `Plot.OfX`, où le prolongement
 * réactif au bord visible reste le comportement voulu).
 */
export function construireSegmentsDerivees(exercice: ExerciceLectureGraphiqueDerivees, xMin: number, xMax: number, visibleY: [number, number]): SegmentCourbeDerivees[] {
  const [xMinFixe, xMaxFixe] = calculerBornesX(exercice.asymptotique);
  const f = construireEvaluateurCourbeDerivees(exercice, xMinFixe, xMaxFixe);
  return construireBornesSegmentsVisibles(exercice.asymptotique, xMin, xMax, visibleY).map((b) => ({ domaine: [b.lo, b.hi], evaluer: f }));
}

const DEMI_HAUTEUR_Y_DEFAUT = 6;

/** ViewBox — étend `calculerBornesX` (partie X, ne dépend que des AV) en Y pour englober toutes
 * les valeurs notables : bords (AH/AO), extrema (valeur RÉELLE de f), points d'inflexion
 * (échantillonnés — un PI n'a pas de "hauteur" propre, mais la courbe doit rester visible autour). */
export function calculerViewBoxLectureGraphiqueDerivees(exercice: ExerciceLectureGraphiqueDerivees): { x: [number, number]; y: [number, number] } {
  const [xMin, xMax] = calculerBornesX(exercice.asymptotique);
  const f = construireEvaluateurCourbeDerivees(exercice, xMin, xMax);

  const valeursNotables: number[] = [];
  const { infini } = exercice.asymptotique;
  if (infini.type === "horizontale") valeursNotables.push(infini.limitePlusInfini, infini.limiteMoinsInfini);
  else if (infini.type === "oblique") valeursNotables.push(infini.pente * xMin + infini.ordonnee, infini.pente * xMax + infini.ordonnee);
  for (const va of exercice.asymptotique.vas) {
    if (va.pointIsoleGauche !== undefined) valeursNotables.push(va.pointIsoleGauche);
    if (va.pointIsoleDroit !== undefined) valeursNotables.push(va.pointIsoleDroit);
  }
  for (const e of exercice.extrema) valeursNotables.push(e.valeur);
  for (const p of exercice.inflexions) valeursNotables.push(f(p.position));

  let yMax = DEMI_HAUTEUR_Y_DEFAUT;
  let yMin = -DEMI_HAUTEUR_Y_DEFAUT;
  for (const v of valeursNotables) {
    yMax = Math.max(yMax, v + 2);
    yMin = Math.min(yMin, v - 2);
  }
  return { x: [xMin, xMax], y: [yMin, yMax] };
}

export interface MarqueurPointIsole {
  x: number;
  y: number;
}

export function construireMarqueursPointIsole(exercice: ExerciceLectureGraphiqueDerivees): MarqueurPointIsole[] {
  const marqueurs: MarqueurPointIsole[] = [];
  for (const va of exercice.asymptotique.vas) {
    if (va.pointIsoleGauche !== undefined) marqueurs.push({ x: va.position, y: va.pointIsoleGauche });
    if (va.pointIsoleDroit !== undefined) marqueurs.push({ x: va.position, y: va.pointIsoleDroit });
  }
  return marqueurs;
}

// ============================================================================
// Aide VISUELLE — surlignage du graphique, même patron que 5gen22 (`ZoneSurlignage`), étendu pour
// couvrir une racine du tableau f'/f'' ou un extremum/PI en cours de saisie.
// ============================================================================

export type ZoneSurlignage =
  | { type: "va"; index: number; cote: "gauche" | "droit" | "les-deux" }
  | { type: "bord"; cote: "gauche" | "droit" }
  | { type: "point"; position: number };

/** Équivalent de `zoneDepuisIdAsymptote` (5gen22) pour l'écran "asymptotes" de ce générateur. */
export function zoneDepuisIdAsymptote(id: IdAsymptote): ZoneSurlignage {
  if (id.kind === "va") return { type: "va", index: id.index, cote: "les-deux" };
  if (id.kind === "oblique") return { type: "bord", cote: "droit" };
  return { type: "bord", cote: id.cote ?? "droit" };
}

const LARGEUR_BANDE_VA = 1;
const LARGEUR_BANDE_BORD = 2.5;
const LARGEUR_BANDE_POINT = 0.8;

export function calculerZoneSurlignage(exercice: ExerciceLectureGraphiqueDerivees, zone: ZoneSurlignage, xViewBox: [number, number]): [number, number] {
  if (zone.type === "va") {
    const position = exercice.asymptotique.vas[zone.index].position;
    if (zone.cote === "gauche") return [position - LARGEUR_BANDE_VA, position];
    if (zone.cote === "droit") return [position, position + LARGEUR_BANDE_VA];
    return [position - LARGEUR_BANDE_VA, position + LARGEUR_BANDE_VA];
  }
  if (zone.type === "point") return [zone.position - LARGEUR_BANDE_POINT, zone.position + LARGEUR_BANDE_POINT];
  return zone.cote === "gauche" ? [xViewBox[0], xViewBox[0] + LARGEUR_BANDE_BORD] : [xViewBox[1] - LARGEUR_BANDE_BORD, xViewBox[1]];
}

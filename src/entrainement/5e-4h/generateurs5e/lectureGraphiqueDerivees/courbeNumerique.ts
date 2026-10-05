/**
 * Couche A (5e) — mathématiques pures pour 5gen30 : construction de f(x) (baseTrend + bumps) et
 * balayage numérique (vérité terrain). RÉPLIQUE LOCALEMENT (jamais importée) la construction
 * morceau-par-morceau/mélange sigmoïde de `ui5e/lectureGraphiqueLimitesCourbe.ts` (5gen22) — même
 * raison que `moteur5e/verificationEtudeLocale.ts` réplique `generateurs5e/etudeLocale/index.ts` :
 * `generateurs5e/` ne doit jamais dépendre de `ui5e/` (couche présentation, au-dessus dans la
 * hiérarchie à sens unique "core→generateurs→moteur→ui"). Les DEUX copies (celle-ci, et celle de
 * `ui5e/lectureGraphiqueDeriveesCourbe.ts`) doivent rester mathématiquement identiques — verrouillé
 * par un test d'équivalence dédié (`ui5e/lectureGraphiqueDeriveesCourbe.test.ts`) plutôt que promis
 * seulement en commentaire.
 *
 * **Écart DÉLIBÉRÉ vs 5gen22, découvert et corrigé empiriquement (jamais par intuition — cf.
 * CLAUDE.md "verify before fixing")** : `ALPHA_BLEND_DERIVEES=2` ici, au lieu de `ALPHA_BLEND=8`
 * dans `lectureGraphiqueLimitesCourbe.ts`.
 *
 * Investigation : un script jetable balayant f' et f'' (différences finies + détection de
 * changement de signe) de la construction ORIGINALE de 5gen22 (`ALPHA_BLEND=8`), SANS AUCUN bump,
 * sur les 4 combinaisons {0,1,2 AV} × {horizontale, oblique, aucune}, a montré que 39 des 40 combos
 * testées possèdent au moins un point critique "organique" de f' ou f'' dans la zone de transition
 * entre les 2 gabarits d'un même morceau — invisible pour 5gen22 (dont le milieu de chaque morceau
 * est explicitement "cosmétique et libre", aucun écran n'y lit jamais rien) mais directement
 * problématique ici, où le nombre d'extrema/PI doit rester lisible. Abaisser `ALPHA_BLEND` (mélange
 * plus doux, étalé sur toute la largeur du morceau plutôt que concentré autour du centre) réduit
 * fortement cette fréquence (`ALPHA_BLEND_DERIVEES=2` retenu après essais à 1/2/3/4/8/25/50 — les
 * valeurs basses minimisent les points organiques, les valeurs hautes les concentrent davantage
 * sans les supprimer). Ce paramètre ne les élimine PAS totalement (un morceau exactement symétrique
 * entre 2 AV identiques garde un extremum central "réel", pas un artefact) — le générateur
 * n'essaie donc PAS de forcer un nombre exact de points : il calcule la vérité terrain par balayage
 * complet de la courbe RÉELLEMENT construite (base + bumps) et l'accepte telle quelle, cf.
 * `core5e/lectureGraphiqueDerivees.types.ts` et `index.ts`.
 */
import type { ComportementVA, ExerciceLectureGraphiqueLimites, SigneInfini } from "../../core5e/lectureGraphiqueLimites.types";
import type { BumpExtremumDerivees, BumpInflexionDerivees } from "../../core5e/lectureGraphiqueDerivees.types";

const K_VA = 3;
const K_AUCUNE = 0.15;
const PENTE_POINT_ISOLE = 0.15;
export const ALPHA_BLEND_DERIVEES = 2;
export const BUFFER_VA_DERIVEES = 0.35;

type Gabarit = (x: number) => number;

function gabaritDivergenceDepuisDroite(a: number, signe: SigneInfini): Gabarit {
  return (x) => (signe * K_VA) / (x - a);
}
function gabaritDivergenceDepuisGauche(a: number, signe: SigneInfini): Gabarit {
  return (x) => (signe * K_VA) / (a - x);
}
function gabaritPointIsole(a: number, valeur: number): Gabarit {
  return (x) => valeur + PENTE_POINT_ISOLE * (x - a);
}
function gabaritHorizontale(limite: number): Gabarit {
  return () => limite;
}
function gabaritOblique(pente: number, ordonnee: number): Gabarit {
  return (x) => pente * x + ordonnee;
}
function gabaritAucune(signe: SigneInfini, xRef: number): Gabarit {
  return (x) => signe * K_AUCUNE * (x - xRef) * (x - xRef);
}

function gabaritCoteDroitVA(va: ComportementVA): Gabarit {
  return va.pointIsoleDroit !== undefined ? gabaritPointIsole(va.position, va.pointIsoleDroit) : gabaritDivergenceDepuisDroite(va.position, va.signeDroit);
}
function gabaritCoteGaucheVA(va: ComportementVA): Gabarit {
  return va.pointIsoleGauche !== undefined ? gabaritPointIsole(va.position, va.pointIsoleGauche) : gabaritDivergenceDepuisGauche(va.position, va.signeGauche);
}

export interface PieceCourbeDerivees {
  loVA: number | null;
  hiVA: number | null;
  gabaritGauche: Gabarit;
  gabaritDroit: Gabarit;
}

/** Un morceau par intervalle entre bornes consécutives (nombreVA+1 morceaux) — même principe que
 * `construirePieces` (5gen22). */
export function construirePiecesDerivees(exercice: ExerciceLectureGraphiqueLimites): PieceCourbeDerivees[] {
  const { vas, infini } = exercice;
  const n = vas.length;

  const xRefGauche = n > 0 ? vas[0].position : 0;
  const xRefDroit = n > 0 ? vas[n - 1].position : 0;
  const gabaritInfiniGauche: Gabarit =
    infini.type === "horizontale" ? gabaritHorizontale(infini.limiteMoinsInfini) : infini.type === "oblique" ? gabaritOblique(infini.pente, infini.ordonnee) : gabaritAucune(infini.signeMoinsInfini, xRefGauche);
  const gabaritInfiniDroit: Gabarit =
    infini.type === "horizontale" ? gabaritHorizontale(infini.limitePlusInfini) : infini.type === "oblique" ? gabaritOblique(infini.pente, infini.ordonnee) : gabaritAucune(infini.signePlusInfini, xRefDroit);

  const pieces: PieceCourbeDerivees[] = [];
  for (let i = 0; i <= n; i++) {
    pieces.push({
      loVA: i === 0 ? null : vas[i - 1].position,
      hiVA: i === n ? null : vas[i].position,
      gabaritGauche: i === 0 ? gabaritInfiniGauche : gabaritCoteDroitVA(vas[i - 1]),
      gabaritDroit: i === n ? gabaritInfiniDroit : gabaritCoteGaucheVA(vas[i]),
    });
  }
  return pieces;
}

export function evaluerPieceMelangeeDerivees(piece: PieceCourbeDerivees, loRendu: number, hiRendu: number, x: number): number {
  const largeur = Math.max(hiRendu - loRendu, 1e-6);
  const t = (x - loRendu) / largeur;
  const poidsGauche = 1 / (1 + Math.exp(ALPHA_BLEND_DERIVEES * (t - 0.5)));
  return poidsGauche * piece.gabaritGauche(x) + (1 - poidsGauche) * piece.gabaritDroit(x);
}

const MARGE_X = 4;
const DEMI_LARGEUR_X_MIN = 5;

/** Bornes X de rendu — même formule que `calculerViewBoxLectureGraphique`
 * (`ui5e/lectureGraphiqueLimitesCourbe.ts`), répliquée ici (Couche A, ne dépend que des positions
 * d'AV — identique quelle que soit la richesse en bumps ajoutée ensuite). */
export function calculerBornesXDerivees(asymptotique: ExerciceLectureGraphiqueLimites): [number, number] {
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
  piece: PieceCourbeDerivees;
}

/** Domaine RENDU de chaque morceau — buffer `BUFFER_VA_DERIVEES` exclu de chaque côté d'une AV,
 * même principe que `construireSegments` (5gen22). */
export function construireDomainesPieces(asymptotique: ExerciceLectureGraphiqueLimites, xMin: number, xMax: number): PieceDomaineDerivees[] {
  return construirePiecesDerivees(asymptotique).map((piece) => ({
    lo: piece.loVA === null ? xMin : piece.loVA + BUFFER_VA_DERIVEES,
    hi: piece.hiVA === null ? xMax : piece.hiVA - BUFFER_VA_DERIVEES,
    piece,
  }));
}

function evaluerBaseTrendSurDomaines(domaines: PieceDomaineDerivees[], x: number): number {
  for (const d of domaines) {
    if (x >= d.lo && x <= d.hi) return evaluerPieceMelangeeDerivees(d.piece, d.lo, d.hi, x);
  }
  // Repli — x hors de tout domaine rendu (n'arrive jamais pour les positions manipulées par ce
  // générateur, toujours choisies à l'intérieur d'un domaine) : morceau le plus proche.
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

/**
 * Gaussienne — CONSERVÉE après investigation, un support compact polynomial `A*(1-u²)^k` a été
 * essayé et ABANDONNÉ (voir `docs/historique-5e-derivees.md` pour l'investigation complète, campagne
 * "primitive d'extremum à support compact"). Raison, DÉMONTRÉE puis VÉRIFIÉE empiriquement sur le
 * pipeline réel (jamais juste supposée) :
 *
 *   1. **Les 2 points d'inflexion aux "épaules" sont mathématiquement inévitables pour TOUTE
 *      primitive unimodale C¹ créant un vrai extremum** — gaussienne, `(1-u²)^k` quel que soit k,
 *      cosinus surélevé... Argument à la Rolle : si g'(sommet)=0 ET g' revient à 0 (ou tend vers 0)
 *      "au loin", g' a nécessairement un extremum local ENTRE les deux, où g'' change de signe.
 *      Aucun choix de primitive ne supprime ce fait — seulement sa position/amplitude varient.
 *      Changer de primitive pour "éliminer les épaules" est donc voué à l'échec par construction.
 *   2. **Le support compact est en réalité PIRE pour l'excès mesuré, pas meilleur** : sur le
 *      pipeline réel (520 tirages, `robustesse.test.ts`), `(1-u²)^8` donne un excès extrema
 *      moyen=1.73 (max 5) et un excès inflexions moyen=3.56 (max 13) — PIRE que la gaussienne
 *      d'origine (extrema moyen=1.29, inflexions moyen=2.96 max 8). Cause : le second croisement de
 *      f' au retour vers la pente locale du fond (voir point 3) ne s'atténue JAMAIS avec un support
 *      compact, même pour une pente de fond quasi nulle (<0,001 dans les tests) — alors que la
 *      queue EXPONENTIELLE de la gaussienne s'atténue sous le seuil de détection
 *      (`SEUIL_AMPLITUDE_REELLE=0.05`) dès que la pente locale du fond descend sous ≈0,05-0,1
 *      (vérifié par balayage direct, script jetable) : la gaussienne "s'efface" naturellement là où
 *      le fond est calme, le support compact jamais.
 *   3. **Cause racine du "second croisement"** (affecte extrema, gaussienne ET support compact
 *      identiquement) : un bump `A*g((x-c)/w)` ajouté à un fond de pente locale b≠0 doit voir sa
 *      propre dérivée repasser de son pic (très positif) à son creux (très négatif, car g' est une
 *      fonction impaire) puis REVENIR vers b en s'éloignant du centre — ce retour traverse
 *      nécessairement 0 une seconde fois dès que |b| < pic de |bump'|, ce qui est TOUJOURS le cas
 *      par construction (le ratio amplitude/largeur est justement choisi pour dominer largement la
 *      pente du fond). D'où le fix RETENU : ne pas changer la primitive, mais restreindre le
 *      placement des bumps d'extremum aux positions où la pente locale du fond est déjà quasi
 *      nulle (voir `SEUIL_PENTE_BASE_EXTREMUM`, `index.ts`), condition sous laquelle la gaussienne
 *      supprime naturellement ce second croisement — vérifié empiriquement plutôt que supposé.
 */
export function bumpExtremumValeur(bump: BumpExtremumDerivees, x: number): number {
  const u = (x - bump.positionNominale) / bump.largeur;
  return bump.amplitude * Math.exp(-u * u);
}

/** tanh — dérivée première (sech²) ne s'annulant JAMAIS, dérivée seconde ne s'annulant QUE en
 * x=positionNominale (globalement). */
export function bumpInflexionValeur(bump: BumpInflexionDerivees, x: number): number {
  return bump.amplitude * Math.tanh((x - bump.positionNominale) / bump.largeur);
}

export interface DonneesCourbeDerivees {
  asymptotique: ExerciceLectureGraphiqueLimites;
  bumpsExtremum: BumpExtremumDerivees[];
  bumpsInflexion: BumpInflexionDerivees[];
}

/** Construit l'évaluateur f(x) complet — SEULE fonction que cette Couche A ET, répliquée à
 * l'identique côté `ui5e/lectureGraphiqueDeriveesCourbe.ts` (rendu), doivent produire pour un même
 * `DonneesCourbeDerivees` : garantit que la vérité terrain calculée ici correspond EXACTEMENT à ce
 * qui est affiché à l'élève (équivalence verrouillée par test, voir en-tête de fichier). */
export function construireEvaluateurCourbeDerivees(donnees: DonneesCourbeDerivees, xMin: number, xMax: number): (x: number) => number {
  const domaines = construireDomainesPieces(donnees.asymptotique, xMin, xMax);
  return (x: number) => {
    let v = evaluerBaseTrendSurDomaines(domaines, x);
    for (const b of donnees.bumpsExtremum) v += bumpExtremumValeur(b, x);
    for (const b of donnees.bumpsInflexion) v += bumpInflexionValeur(b, x);
    return v;
  };
}

// ============================================================================
// Balayage numérique — différences finies + détection de changement de signe + bissection. Rien
// n'est jamais montré à l'élève sous forme symbolique : une dérivée NUMÉRIQUE suffit entièrement.
// ============================================================================

const H_DERIVEE = 1e-2;

export function deriveeNumerique(f: (x: number) => number, x: number): number {
  return (f(x + H_DERIVEE) - f(x - H_DERIVEE)) / (2 * H_DERIVEE);
}
export function deriveeSecondeNumerique(f: (x: number) => number, x: number): number {
  return (f(x + H_DERIVEE) - 2 * f(x) + f(x - H_DERIVEE)) / (H_DERIVEE * H_DERIVEE);
}

function bissection(g: (x: number) => number, a: number, b: number): number {
  let ga = g(a);
  for (let i = 0; i < 60; i++) {
    const m = (a + b) / 2;
    const gm = g(m);
    if (Math.sign(gm) === Math.sign(ga) || gm === 0) {
      a = m;
      ga = gm;
    } else {
      b = m;
    }
  }
  return (a + b) / 2;
}

/** Filtre le bruit flottant pur : une fonction mathématiquement PLATE (ex. f''≡0 pour une
 * asymptote oblique unique aux 2 bouts — mêmes gabarits gauche/droite, mélange dégénéré en la
 * ligne elle-même) produit, sans ce filtre, des dizaines de "faux zéros" par pur bruit
 * d'arrondi — confirmé empiriquement (script jetable, cf. en-tête de fichier) : un changement de
 * signe n'est retenu que si `g` s'écarte réellement de zéro d'au moins ce seuil d'un côté. */
const SEUIL_AMPLITUDE_REELLE = 0.05;
/** Dédoublonne les zéros trouvés à une distance inférieure à la résolution d'échantillonnage —
 * jamais 2 entrées distinctes pour un seul vrai zéro capté 2 fois par le pas d'échantillonnage. */
const SEPARATION_DEDUP = 0.1;

export interface ZeroTrouve {
  position: number;
  signeAvant: 1 | -1;
  signeApres: 1 | -1;
}

/** Fenêtre (en unités d'axe x, jamais en nombre de pas — indépendante de `nEchantillons`) utilisée
 * pour confirmer qu'un changement de signe est RÉEL : la valeur immédiatement au bord d'un
 * changement de signe peut être minuscule par pur hasard d'échantillonnage même pour un vrai zéro
 * (ex. la grille tombe presque exactement sur le sommet d'une gaussienne) — un vrai zéro voit
 * TOUJOURS `|g|` redevenir significatif un peu plus loin de part et d'autre, alors que du bruit
 * flottant pur (fonction mathématiquement plate) reste sous le seuil partout. */
const FENETRE_CONFIRMATION = 0.08;

/** Balaie `g` sur [lo,hi] avec `nEchantillons` points (≥2000 recommandé), détecte chaque
 * changement de signe, affine par bissection. */
export function balayerZeros(g: (x: number) => number, lo: number, hi: number, nEchantillons = 2500): ZeroTrouve[] {
  if (hi <= lo) return [];
  const zeros: ZeroTrouve[] = [];
  const pas = (hi - lo) / nEchantillons;
  let xPrec = lo;
  let gPrec = g(xPrec);
  for (let i = 1; i <= nEchantillons; i++) {
    const x = lo + i * pas;
    const gx = g(x);
    if (Number.isFinite(gPrec) && Number.isFinite(gx) && gPrec !== 0 && Math.sign(gPrec) !== Math.sign(gx)) {
      const gLoin1 = g(Math.max(lo, xPrec - FENETRE_CONFIRMATION));
      const gLoin2 = g(Math.min(hi, x + FENETRE_CONFIRMATION));
      const amplitudeReelle = Math.max(Math.abs(gPrec), Math.abs(gx), Math.abs(gLoin1), Math.abs(gLoin2));
      if (amplitudeReelle > SEUIL_AMPLITUDE_REELLE) {
        const position = bissection(g, xPrec, x);
        zeros.push({ position, signeAvant: Math.sign(gPrec) as 1 | -1, signeApres: Math.sign(gx) as 1 | -1 });
      }
    }
    xPrec = x;
    gPrec = gx;
  }
  const dedupliques: ZeroTrouve[] = [];
  for (const z of zeros) {
    if (dedupliques.length === 0 || z.position - dedupliques[dedupliques.length - 1].position > SEPARATION_DEDUP) dedupliques.push(z);
  }
  return dedupliques;
}

export interface VeriteTerrainDerivees {
  extrema: { position: number; classification: "max" | "min" }[];
  inflexions: { position: number }[];
}

/** Balaie f' et f'' de la courbe RÉELLEMENT construite (base + tous les bumps) sur chaque morceau,
 * PÉRIODE — jamais filtré/restreint aux seules positions nominales des bumps (voir en-tête de
 * fichier : la vérité terrain peut légitimement contenir des points "organiques" du baseTrend). */
export function calculerVeriteTerrain(donnees: DonneesCourbeDerivees, xMin: number, xMax: number): VeriteTerrainDerivees {
  const f = construireEvaluateurCourbeDerivees(donnees, xMin, xMax);
  const fPrime = (x: number) => deriveeNumerique(f, x);
  const fSeconde = (x: number) => deriveeSecondeNumerique(f, x);
  const domaines = construireDomainesPieces(donnees.asymptotique, xMin, xMax);

  const extrema: { position: number; classification: "max" | "min" }[] = [];
  const inflexions: { position: number }[] = [];
  for (const d of domaines) {
    for (const z of balayerZeros(fPrime, d.lo, d.hi)) {
      extrema.push({ position: z.position, classification: z.signeAvant === 1 ? "max" : "min" });
    }
    for (const z of balayerZeros(fSeconde, d.lo, d.hi)) {
      inflexions.push({ position: z.position });
    }
  }
  extrema.sort((a, b) => a.position - b.position);
  inflexions.sort((a, b) => a.position - b.position);
  return { extrema, inflexions };
}

/**
 * Couche A (5e) — génération pour 5gen30 ("Lecture graphique — dérivées et applications"). Combine
 * `genererExerciceLectureGraphiqueLimites()` (5gen22, Couche A ↔ Couche A, comportement aux bords)
 * avec des bumps gaussiens (extrema)/tanh (points d'inflexion) placés sur une grille interne à
 * séparation garantie (voir `candidatsGrille`), puis calcule la vérité terrain par balayage
 * numérique complet de la courbe RÉELLEMENT construite (`calculerVeriteTerrain`,
 * `courbeNumerique.ts`) — jamais les positions nominales des bumps directement, voir
 * `core5e/lectureGraphiqueDerivees.types.ts`. N'importe jamais rien de `moteur5e/`.
 *
 * La vérité terrain peut légitimement contenir PLUS d'entrées que de bumps placés (points critiques
 * "organiques", voir `courbeNumerique.ts` et `robustesse.test.ts`) — mathématiquement inévitable,
 * jamais éliminé en retouchant la primitive. `construireExerciceBorne` (utilisée en production, voir
 * plus bas) plafonne ce nombre par repli progressif sur la CIBLE demandée — jamais sur la vérité
 * terrain elle-même, toujours calculée en entier et affichée telle quelle.
 */
import { construireAvecFamilleId, genererExerciceLectureGraphiqueLimites } from "../lectureGraphiqueLimites";
import type { ExerciceLectureGraphiqueLimites } from "../../core5e/lectureGraphiqueLimites.types";
import type {
  BumpExtremumDerivees,
  BumpInflexionDerivees,
  ExerciceLectureGraphiqueDerivees,
  ExtremumLectureGraphiqueDerivees,
  InflexionLectureGraphiqueDerivees,
} from "../../core5e/lectureGraphiqueDerivees.types";
import { calculerBornesXDerivees, calculerVeriteTerrain, construireDomainesPieces, construireEvaluateurCourbeDerivees, deriveeNumerique, deriveeSecondeNumerique } from "./courbeNumerique";

function signeAleatoire(): 1 | -1 {
  return Math.random() < 0.5 ? 1 : -1;
}
function melanger<T>(arr: T[]): T[] {
  const copie = [...arr];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

/** Distance minimale à une AV (jamais dans la zone où le gabarit de divergence domine) et au bord
 * du viewBox rendu (purement esthétique, la courbe ne doit pas sembler tronquée par un bump). */
const MARGIN_VA = 1.5;
const MARGIN_EDGE = 1.0;
/** Séparation minimale entre 2 positions quelconques (extrema entre eux, PI entre eux, ET
 * extrema vs PI) — garantie PAR CONSTRUCTION par le pas de la grille de candidats, jamais vérifiée
 * a posteriori par un rejet non borné. */
const MINSEP = 1.8;

interface IntervalleUsable {
  lo: number;
  hi: number;
}

/** Un intervalle utilisable par morceau (peut être vide si le morceau est trop étroit — ex. un
 * morceau entre 2 AV rapprochées) — filtré, jamais un intervalle inversé transmis plus loin. */
function intervallesUsables(asymptotique: ExerciceLectureGraphiqueLimites, xMin: number, xMax: number): IntervalleUsable[] {
  return construireDomainesPieces(asymptotique, xMin, xMax)
    .map(({ piece }) => ({
      lo: piece.loVA === null ? xMin + MARGIN_EDGE : piece.loVA + MARGIN_VA,
      hi: piece.hiVA === null ? xMax - MARGIN_EDGE : piece.hiVA - MARGIN_VA,
    }))
    .filter((iv) => iv.hi > iv.lo);
}

/** Grille de candidats espacés d'EXACTEMENT `MINSEP` À L'INTÉRIEUR de chaque intervalle — garantit
 * par construction qu'un sous-ensemble quelconque de ces candidats reste séparé d'au moins
 * `MINSEP` (jamais une boucle de rejet non bornée pour vérifier cette contrainte après coup, même
 * patron que `tirerPositionsVA`, `generateurs5e/lectureGraphiqueLimites/index.ts`). */
function candidatsGrille(intervalles: IntervalleUsable[]): number[] {
  const candidats: number[] = [];
  for (const iv of intervalles) {
    let x = iv.lo;
    while (x <= iv.hi + 1e-9) {
      candidats.push(x);
      x += MINSEP;
    }
  }
  return candidats;
}

/**
 * Amplitude/largeur — écart DÉLIBÉRÉ vs les bornes brutes suggérées par la consigne
 * ("amplitude dans [2,4]/largeur dans [0.7,0.9]" pour un extremum, "[1.5,2.5]/[0.6,0.8]" pour un
 * PI, indépendantes l'une de l'autre), corrigé après une investigation empirique (500+ tirages,
 * voir `robustesse.test.ts`) : une combinaison amplitude/largeur tirée SANS lien produit, dans les
 * cas où la pente locale de `baseTrend` est déjà significative (ex. asymptote oblique de pente
 * jusqu'à 3, cf. `entierNonNul(3)` dans `generateurs5e/lectureGraphiqueLimites/index.ts`), une
 * pente de crête de bump INFÉRIEURE à celle du fond — le bump se contente alors de "ralentir" une
 * pente déjà montante/descendante SANS jamais inverser son signe, donc SANS créer le vrai
 * extremum/PI voulu (bump "avalé"). Fixé en LIANT amplitude et largeur (au lieu de les tirer
 * indépendamment) pour garantir une pente/courbure de crête toujours nettement supérieure à la
 * pente/courbure locale maximale du fond (pente oblique ≤3, courbure de divergence ≤~2 à la
 * distance minimale autorisée d'une AV) — voir les calculs dans le commentaire de
 * `RATIO_AMPLITUDE_EXTREMUM`/`RATIO_AMPLITUDE_INFLEXION` ci-dessous. Magnitudes résultantes plus
 * larges que les bornes brutes suggérées ([2,4]→environ [3.5,5.9], [1.5,2.5]→environ [2.2,5.8])
 * mais restent des bumps modestes, jamais démesurés à l'échelle du graphique (viewBox typique
 * ±5-10 unités).
 */
const LARGEUR_EXTREMUM_MIN = 0.7;
const LARGEUR_EXTREMUM_MAX = 0.9;
/** Pente de crête d'une gaussienne A*exp(-u²) = A·√(2/e)/w ≈ 0,8578·A/w — `RATIO_AMPLITUDE_EXTREMUM`
 * fixe A/w, donc la pente de crête directement (indépendante de la largeur tirée) : ratio∈[5,6.5]
 * ⟹ pente de crête ∈[4,29;5,58], nettement au-dessus de la pente oblique max (3) et de la courbure
 * de divergence à distance MARGIN_VA=1,5 d'une AV (K_VA/1,5²≈1,33). */
const RATIO_AMPLITUDE_EXTREMUM_MIN = 6;
const RATIO_AMPLITUDE_EXTREMUM_MAX = 7.5;

function tirerBumpExtremum(position: number): BumpExtremumDerivees {
  const largeur = LARGEUR_EXTREMUM_MIN + Math.random() * (LARGEUR_EXTREMUM_MAX - LARGEUR_EXTREMUM_MIN);
  const ratio = RATIO_AMPLITUDE_EXTREMUM_MIN + Math.random() * (RATIO_AMPLITUDE_EXTREMUM_MAX - RATIO_AMPLITUDE_EXTREMUM_MIN);
  return { positionNominale: position, amplitude: signeAleatoire() * largeur * ratio, largeur };
}

const LARGEUR_INFLEXION_MIN = 0.6;
const LARGEUR_INFLEXION_MAX = 0.8;
/** Courbure de crête de B·tanh((x-c)/w) : d²/dx² atteint un maximum ≈0,77·B/w² (calculé
 * numériquement) — `RATIO_AMPLITUDE_INFLEXION` fixe B/w² directement (courbure de crête
 * indépendante de la largeur tirée) : ratio∈[6,9] ⟹ courbure de crête∈[4,6;6,9], au-dessus de la
 * courbure de divergence à distance minimale d'une AV (≈1,78 à MARGIN_VA=1,5). */
const RATIO_AMPLITUDE_INFLEXION_MIN = 8;
const RATIO_AMPLITUDE_INFLEXION_MAX = 11;

function tirerBumpInflexion(position: number): BumpInflexionDerivees {
  const largeur = LARGEUR_INFLEXION_MIN + Math.random() * (LARGEUR_INFLEXION_MAX - LARGEUR_INFLEXION_MIN);
  const ratio = RATIO_AMPLITUDE_INFLEXION_MIN + Math.random() * (RATIO_AMPLITUDE_INFLEXION_MAX - RATIO_AMPLITUDE_INFLEXION_MIN);
  return { positionNominale: position, amplitude: signeAleatoire() * largeur * largeur * ratio, largeur };
}

/**
 * Filtre les candidats où le fond (`baseTrend`, SANS aucun bump) a déjà une pente/courbure locale
 * trop marquée pour qu'un bump puisse fiablement y inverser le signe de f'/f'' — investigation
 * empirique (500+ tirages, voir `robustesse.test.ts`) : même avec l'amplitude/largeur liées
 * ci-dessus, une zone de TRANSITION étroite entre 2 gabarits très différents en valeur (ex. divergence
 * proche de +∞ d'un côté d'un morceau ÉTROIT, asymptote oblique très négative de l'autre) peut
 * produire localement une pente/courbure du fond bien plus grande que ce que suggère la seule pente
 * oblique nominale — un bump y est alors "avalé" (jamais d'inversion de signe). Seuils choisis avec
 * une marge confortable sous la pente/courbure de crête MINIMALE garantie par
 * `RATIO_AMPLITUDE_EXTREMUM_MIN`/`RATIO_AMPLITUDE_INFLEXION_MIN` ci-dessus.
 *
 * **`SEUIL_PENTE_BASE` relevé de `1.2` à `3.5` — bug trouvé empiriquement (Playwright, capture du
 * `<path>` réellement rendu), voir `promptcorrectionjitterasymptotesverification5gen30.md` point 4**
 * : pour la famille `0va-oblique` (aucune AV), `gabaritGauche`/`gabaritDroit` du morceau UNIQUE sont
 * LE MÊME gabarit oblique (`construirePiecesDerivees` ci-dessus) — le mélange sigmoïde est alors
 * dégénéré en la droite elle-même (voir le commentaire de `balayerZeros` ci-dessous), donc
 * `deriveeNumerique(baseTrend,x) ≡ pente` PARTOUT dans le domaine, jamais seulement localement près
 * d'une transition. Avec l'ancien seuil `1.2`, `pente=entierNonNul(3)` (entier non nul dans
 * [-3,3]) dépasse ce seuil dans 4 tirages sur 6 (|pente|∈{2,3}) — dans ce cas AUCUN candidat de la
 * grille n'est jamais "calme" nulle part dans tout le domaine (pas seulement localement), donc
 * `construireExerciceBorne` décrémente `cibleE` jusqu'à 0 à CHAQUE appel : la variante panneau dev
 * "0 AV — oblique, 2 extrema" affichait 0 extremum visible dans ≈8 tirages sur 10 mesurés
 * (`recheck-oblique.js`, script jetable) au lieu des 2 annoncés — un taux d'échec bien au-delà de ce
 * que `construireExerciceBorne` est censé absorber occasionnellement (le commentaire de
 * `CATALOGUE_VARIANTES` documente que les comptes du libellé sont des CIBLES, jamais des garanties,
 * mais un échec quasi systématique sur cette seule famille n'est pas le comportement voulu). Or la
 * pente de crête GARANTIE d'un bump d'extremum (`RATIO_AMPLITUDE_EXTREMUM_MIN=6` ⟹ pente de crête
 * ≥ environ 4,29, voir le commentaire ci-dessus) dépasse DÉJÀ largement la pente oblique maximale
 * (3) — le filtre à 1,2 était donc inutilement strict pour ce cas précis, jamais nécessaire pour
 * garantir l'inversion de signe. `3.5` reste sous cette garantie minimale (marge ≈0,79) tout en
 * dépassant la pente oblique maximale (marge ≈0,5), donc accepte désormais tous les candidats du cas
 * dégénéré tout en restant un filtre réel (toujours actif contre une pente/courbure locale
 * anormalement élevée). Non-régression vérifiée : `robustesse.test.ts` (extremumsNonRetrouves=0,
 * inflexionsNonRetrouvees=0, décalage max <0,3 inchangés) + `recheck-oblique.js` relancé après fix
 * (10/10 tirages avec 2 extrema visibles, contre ~2/10 avant).
 */
const SEUIL_PENTE_BASE = 3.5;
const SEUIL_COURBURE_BASE = 1.3;

function candidatsCalmes(asymptotique: ExerciceLectureGraphiqueLimites, xMin: number, xMax: number, candidats: number[]): number[] {
  const baseTrend = construireEvaluateurCourbeDerivees({ asymptotique, bumpsExtremum: [], bumpsInflexion: [] }, xMin, xMax);
  return candidats.filter((x) => Math.abs(deriveeNumerique(baseTrend, x)) <= SEUIL_PENTE_BASE && Math.abs(deriveeSecondeNumerique(baseTrend, x)) <= SEUIL_COURBURE_BASE);
}

/** Distance maximale tolérée entre la position NOMINALE d'un bump placé et le zéro RÉEL le plus
 * proche trouvé par balayage — au-delà, le bump est considéré "avalé" (voir
 * `candidatsCalmes`/le commentaire d'amplitude ci-dessus : rarissime après ces 2 garde-fous, mais
 * jamais totalement exclu par construction d'un mélange sigmoïde arbitraire). */
const DECALAGE_MAX_ACCEPTABLE = 0.3;
/** Tentatives bornées avant repli déterministe — même patron que `tirerPositionsVA`
 * (`generateurs5e/lectureGraphiqueLimites/index.ts`) : jamais une boucle non bornée. */
const TENTATIVES_MAX_PLACEMENT = 5;

function bumpEstRetrouve(position: number, cibles: { position: number; classification: string }[], classificationAttendue: string): boolean {
  const proche = cibles.find((c) => Math.abs(c.position - position) <= DECALAGE_MAX_ACCEPTABLE);
  return proche !== undefined && proche.classification === classificationAttendue;
}

/** Une seule tentative de placement — peut échouer (rarissime, voir ci-dessus) si un bump se
 * retrouve "avalé" par le fond malgré les 2 garde-fous déjà en place (`candidatsCalmes` +
 * amplitude/largeur liées) ; `null` dans ce cas, jamais un exercice silencieusement incohérent. */
function tenterConstruction(asymptotique: ExerciceLectureGraphiqueLimites, nombreExtremaDesire: number, nombrePIDesire: number): ExerciceLectureGraphiqueDerivees | null {
  const [xMin, xMax] = calculerBornesXDerivees(asymptotique);
  const intervalles = intervallesUsables(asymptotique, xMin, xMax);
  const candidats = melanger(candidatsCalmes(asymptotique, xMin, xMax, candidatsGrille(intervalles)));

  const total = Math.min(nombreExtremaDesire + nombrePIDesire, candidats.length);
  const nExtrema = Math.min(nombreExtremaDesire, total);
  const nPI = total - nExtrema;
  const positionsExtrema = candidats.slice(0, nExtrema);
  const positionsPI = candidats.slice(nExtrema, nExtrema + nPI);

  const bumpsExtremum = positionsExtrema.map(tirerBumpExtremum);
  const bumpsInflexion = positionsPI.map(tirerBumpInflexion);

  const donnees = { asymptotique, bumpsExtremum, bumpsInflexion };
  const verite = calculerVeriteTerrain(donnees, xMin, xMax);
  const f = construireEvaluateurCourbeDerivees(donnees, xMin, xMax);

  const extrema: ExtremumLectureGraphiqueDerivees[] = verite.extrema.map((e) => ({ position: e.position, valeur: f(e.position), classification: e.classification }));
  const inflexions: InflexionLectureGraphiqueDerivees[] = verite.inflexions.map((p) => ({ position: p.position, classification: "pi" as const }));

  const chaqueExtremumRetrouve = bumpsExtremum.every((b) => bumpEstRetrouve(b.positionNominale, extrema, b.amplitude > 0 ? "max" : "min"));
  const chaqueInflexionRetrouvee = bumpsInflexion.every((b) => bumpEstRetrouve(b.positionNominale, inflexions, "pi"));
  if (!chaqueExtremumRetrouve || !chaqueInflexionRetrouvee) return null;

  return { asymptotique, bumpsExtremum, bumpsInflexion, extrema, inflexions };
}

/** Construit l'exercice complet à partir d'un `asymptotique` déjà choisi (utilisé aussi bien par le
 * tirage aléatoire que par le panneau dev, qui fige `asymptotique` mais garde ce calcul commun).
 * Boucle bornée + repli déterministe (0 bump, garanti valide par construction) — jamais un rejet
 * non plafonné, voir `DECALAGE_MAX_ACCEPTABLE`/`TENTATIVES_MAX_PLACEMENT` ci-dessus. NE plafonne PAS
 * le nombre d'entrées de la vérité terrain — voir `construireExerciceBorne` pour la version
 * utilisée en production, qui ajoute ce plafond par repli progressif sur la CIBLE (jamais sur la
 * vérité terrain elle-même). Conservée SANS plafond car réutilisée telle quelle par
 * `robustesse.test.ts` pour mesurer l'EXCÈS honnêtement (voir en-tête de ce fichier de test) —
 * mesurer l'excès sur une fonction déjà plafonnée fausserait la mesure. */
function construireExercice(asymptotique: ExerciceLectureGraphiqueLimites, nombreExtremaDesire: number, nombrePIDesire: number): ExerciceLectureGraphiqueDerivees {
  for (let tentative = 0; tentative < TENTATIVES_MAX_PLACEMENT; tentative++) {
    const resultat = tenterConstruction(asymptotique, nombreExtremaDesire, nombrePIDesire);
    if (resultat !== null) return resultat;
  }
  return tenterConstruction(asymptotique, 0, 0) as ExerciceLectureGraphiqueDerivees; // 0 bump : jamais null (rien à retrouver)
}

/**
 * Plafond DUR sur le nombre d'entrées de la vérité terrain finale — voir l'en-tête de fichier et
 * `docs/historique-5e-derivees.md` : l'excès (points "épaules"/"second croisement" organiques,
 * démontré mathématiquement inévitable pour toute primitive de bosse lisse à support compact, cf.
 * argument de Rolle documenté dans `courbeNumerique.ts`/`robustesse.test.ts`) ne peut PAS être
 * éliminé en changeant la primitive — seul un plafond + repli progressif sur la CIBLE demandée
 * (jamais sur la vérité terrain elle-même, toujours calculée en entier et affichée telle quelle)
 * permet d'éviter qu'un exercice affiche un nombre déraisonnable d'entrées.
 *
 * Valeur retenue après investigation empirique (voir `robustesse.test.ts`, bloc "plafond de
 * lisibilité", distribution RÉELLE de production — `POIDS_NOMBRE_EXTREMA`/`POIDS_NOMBRE_PI`, 700
 * tirages, 2 exécutions indépendantes) — taux de réussite à cible pleine (aucun décrément de cible
 * nécessaire) mesuré par plafond candidat : CAP=3 → ≈49-53%, **CAP=4 → ≈71-72%**,
 * **CAP=5 → ≈87-91%**, CAP=6 → ≈97%. `4` reste sous l'objectif de 80-90% visé — retenu `5` :
 * franchit ce seuil de façon robuste (2 exécutions indépendantes >85%) tout en restant un nombre
 * d'entrées encore raisonnable à l'écran. Le repli déterministe ultime (0,0) reste TOUJOURS
 * largement sous ce plafond (max observé sur 3000 tirages indépendants : 3 pour chaque type — marge
 * de 2 conservée), et le plafond n'est JAMAIS dépassé en production sur 1000+ tirages avec la
 * distribution réelle (max observé = plafond exact, jamais au-delà).
 */
const CAP_EXTREMA = 5;
const CAP_INFLEXIONS = 5;

/**
 * Version bornée de `construireExercice`, utilisée par la génération de production
 * (`genererExerciceLectureGraphiqueDerivees`/`construireAvecVarianteId`) — jamais `construireExercice`
 * directement (celle-ci reste réservée à la mesure d'excès honnête côté `robustesse.test.ts`).
 * Décroît la CIBLE (`cibleE`/`cibleP`, jamais la vérité terrain déjà obtenue) tant que le résultat
 * dépasse le plafond de lisibilité, jusqu'au repli déterministe ultime `(0,0)` — voir la preuve de
 * sûreté de ce repli (toujours ≤ plafond) dans `robustesse.test.ts`. Boucle triplement bornée
 * (`cibleE` × `cibleP` × `TENTATIVES_MAX_PLACEMENT`), jamais un rejet non plafonné.
 */
function construireExerciceBorne(asymptotique: ExerciceLectureGraphiqueLimites, nombreExtremaDesire: number, nombrePIDesire: number): ExerciceLectureGraphiqueDerivees {
  for (let cibleE = nombreExtremaDesire; cibleE >= 0; cibleE--) {
    for (let cibleP = nombrePIDesire; cibleP >= 0; cibleP--) {
      for (let tentative = 0; tentative < TENTATIVES_MAX_PLACEMENT; tentative++) {
        const resultat = tenterConstruction(asymptotique, cibleE, cibleP);
        if (resultat !== null && resultat.extrema.length <= CAP_EXTREMA && resultat.inflexions.length <= CAP_INFLEXIONS) {
          return resultat;
        }
      }
    }
  }
  // Repli déterministe ultime — voir `robustesse.test.ts` pour la preuve empirique que ce cas
  // reste TOUJOURS dans le plafond (0 bump : rien à retrouver, donc jamais `null`).
  return tenterConstruction(asymptotique, 0, 0) as ExerciceLectureGraphiqueDerivees;
}

const POIDS_NOMBRE_EXTREMA: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 2],
  [3, 1.5],
];
const POIDS_NOMBRE_PI: [number, number][] = [
  [0, 1.5],
  [1, 2],
  [2, 1.5],
];

function tirerPondere(poids: [number, number][]): number {
  const total = poids.reduce((s, [, p]) => s + p, 0);
  let r = Math.random() * total;
  for (const [n, p] of poids) {
    if (r < p) return n;
    r -= p;
  }
  return poids[0][0];
}

export function genererExerciceLectureGraphiqueDerivees(): ExerciceLectureGraphiqueDerivees {
  const asymptotique = genererExerciceLectureGraphiqueLimites();
  return construireExerciceBorne(asymptotique, tirerPondere(POIDS_NOMBRE_EXTREMA), tirerPondere(POIDS_NOMBRE_PI));
}

// ============================================================================
// Panneau dev — combos représentatifs (instances FIXES, non aléatoires en tirage d'`asymptotique`
// — mais RESTENT aléatoires en amplitude/largeur/tirage de grille des bumps, même patron que
// `CATALOGUE_FAMILLES`/`construireAvecFamilleId`, 5gen22). Les comptes annoncés dans le libellé sont
// des CIBLES, pas des garanties exactes : la vérité terrain réellement affichée peut différer de la
// cible demandée (repli progressif si le plafond de lisibilité `CAP_EXTREMA`/`CAP_INFLEXIONS` est
// dépassé), mais ne dépasse JAMAIS `CAP_EXTREMA`/`CAP_INFLEXIONS` entrées au total — voir
// `construireExerciceBorne` ci-dessus.
// ============================================================================

export const CATALOGUE_VARIANTES: { id: string; label: string }[] = [
  { id: "0va-horizontale-0ext-0pi", label: "0 AV — horizontale, 0 extremum, 0 PI" },
  { id: "0va-horizontale-1ext-0pi", label: "0 AV — horizontale, 1 extremum" },
  { id: "0va-horizontale-2ext-1pi", label: "0 AV — horizontale, 2 extrema, 1 PI" },
  { id: "0va-horizontale-3ext-2pi", label: "0 AV — horizontale, 3 extrema, 2 PI" },
  { id: "0va-oblique-2ext-0pi", label: "0 AV — oblique, 2 extrema" },
  { id: "1va-horizontale-1ext-1pi", label: "1 AV — horizontale, 1 extremum, 1 PI" },
  { id: "1va-oblique-2ext-1pi", label: "1 AV — oblique, 2 extrema, 1 PI" },
  { id: "1va-aucune-0ext-0pi", label: "1 AV — aucune, 0 extremum, 0 PI" },
  { id: "2va-opposes-horizontale-2ext-2pi", label: "2 AV — horizontale, 2 extrema, 2 PI" },
  { id: "2va-mixte-oblique-3ext-2pi", label: "2 AV — oblique, 3 extrema, 2 PI" },
  { id: "2va-pointIsole-1ext-1pi", label: "2 AV (point isolé) — 1 extremum, 1 PI" },
];

export function construireAvecVarianteId(id: string): ExerciceLectureGraphiqueDerivees {
  switch (id) {
    case "0va-horizontale-0ext-0pi":
      return construireExerciceBorne(construireAvecFamilleId("0va-horizontale"), 0, 0);
    case "0va-horizontale-1ext-0pi":
      return construireExerciceBorne(construireAvecFamilleId("0va-horizontale"), 1, 0);
    case "0va-horizontale-2ext-1pi":
      return construireExerciceBorne(construireAvecFamilleId("0va-horizontale"), 2, 1);
    case "0va-horizontale-3ext-2pi":
      return construireExerciceBorne(construireAvecFamilleId("0va-horizontale"), 3, 2);
    case "0va-oblique-2ext-0pi":
      return construireExerciceBorne(construireAvecFamilleId("0va-oblique"), 2, 0);
    case "1va-horizontale-1ext-1pi":
      return construireExerciceBorne(construireAvecFamilleId("1va-opposes-horizontale"), 1, 1);
    case "1va-oblique-2ext-1pi":
      return construireExerciceBorne(construireAvecFamilleId("1va-opposes-oblique"), 2, 1);
    case "1va-aucune-0ext-0pi":
      return construireExerciceBorne(construireAvecFamilleId("1va-aucune"), 0, 0);
    case "2va-opposes-horizontale-2ext-2pi":
      return construireExerciceBorne(construireAvecFamilleId("2va-opposes-horizontale"), 2, 2);
    case "2va-mixte-oblique-3ext-2pi":
      return construireExerciceBorne(construireAvecFamilleId("2va-mixte-oblique"), 3, 2);
    case "2va-pointIsole-1ext-1pi":
      return construireExerciceBorne(construireAvecFamilleId("2va-pointIsole"), 1, 1);
    default:
      throw new Error(`construireAvecVarianteId : id inconnu "${id}"`);
  }
}

// Réexporté pour les tests (robustesse) et pour un éventuel usage direct (ex. forcer un nombre
// d'extrema précis sans passer par le catalogue de variantes fixes). `construireExercice` (SANS
// plafond) reste réservée à la mesure d'excès honnête ; `construireExerciceBorne`/`CAP_EXTREMA`/
// `CAP_INFLEXIONS` à la vérification du plafond de lisibilité effectivement livré en production.
export { construireExercice, construireExerciceBorne, CAP_EXTREMA, CAP_INFLEXIONS };

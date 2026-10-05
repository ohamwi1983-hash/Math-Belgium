import type {
  ExerciceCaracteristiquesFonction,
  ReponseAsymptotesCaracteristiques,
  ReponseExistence,
  ReponseZerosCaracteristiques,
} from "../core/caracteristiquesFonction.types";
import type { Borne, Crochet, Morceau } from "../core/inequation.types";
import { parserNombreOuFraction } from "./verificationAnalyseFonction";
import type { StatutVerification } from "./statutVerification";

const TOLERANCE = 0.005;

function interpolerLineaire(x0: number, y0: number, x1: number, y1: number, x: number): number {
  return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
}

/** Le zéro (s'il existe) de exercice.zeros strictement compris dans (min,max) — dérivé de la liste
 * plate, jamais un champ séparé par zone (voir core/caracteristiquesFonction.types.ts). */
function trouverZeroDans(exercice: ExerciceCaracteristiquesFonction, min: number, max: number): number | undefined {
  return exercice.zeros.find((z) => z > min && z < max);
}

/**
 * Seule source de vérité pour f(x), consommée à la fois par la vérification des réponses
 * (ce module) et par le tracé du graphique (src/ui/mafsCaracteristiquesFonction.ts) — jamais deux
 * évaluateurs indépendants. NaN en x=AV (asymptote), x=c (point creux, exclu du domaine depuis la
 * refonte) et strictement à l'intérieur de tout gap — jamais une exception, même contrat que les
 * autres évaluateurs du projet.
 *
 * Chaque zone monotone (2, 3, 5) retrouve son propre zéro éventuel en filtrant `exercice.zeros`
 * par plage plutôt que de porter un champ dédié : garantit que la liste plate reste la seule
 * source de vérité, jamais désynchronisée d'un zéro "caché" par zone.
 */
export function evaluerCourbeCaracteristiques(exercice: ExerciceCaracteristiquesFonction, x: number): number {
  if (x === exercice.AV) return NaN;
  if (x === exercice.c) return NaN;
  for (const gap of exercice.gaps) {
    if (x > gap.g1 && x < gap.g2) return NaN;
  }

  if (x <= exercice.b1) return exercice.y1 + exercice.m1 * (x - exercice.b1);

  if (x <= exercice.b2) {
    const z1 = trouverZeroDans(exercice, exercice.b1, exercice.b2);
    if (z1 !== undefined) {
      if (x <= z1) return interpolerLineaire(exercice.b1, exercice.y1, z1, 0, x);
      return interpolerLineaire(z1, 0, exercice.b2, exercice.y2, x);
    }
    return interpolerLineaire(exercice.b1, exercice.y1, exercice.b2, exercice.y2, x);
  }

  if (x <= exercice.b3) {
    const z3 = trouverZeroDans(exercice, exercice.b2, exercice.c);
    if (z3 !== undefined) {
      if (x <= z3) return interpolerLineaire(exercice.b2, exercice.y2, z3, 0, x);
      if (x <= exercice.c) return interpolerLineaire(z3, 0, exercice.c, exercice.valeurNaturelleC, x);
      return interpolerLineaire(exercice.c, exercice.valeurNaturelleC, exercice.b3, exercice.y3, x);
    }
    if (x <= exercice.c) return interpolerLineaire(exercice.b2, exercice.y2, exercice.c, exercice.valeurNaturelleC, x);
    return interpolerLineaire(exercice.c, exercice.valeurNaturelleC, exercice.b3, exercice.y3, x);
  }

  if (x <= exercice.b4) return exercice.y3;

  if (x < exercice.b5) {
    const z2 = trouverZeroDans(exercice, exercice.b4, exercice.b5);
    if (z2 !== undefined) {
      if (x <= z2) return interpolerLineaire(exercice.b4, exercice.y3, z2, 0, x);
      return interpolerLineaire(z2, 0, exercice.b5, exercice.y5Naturel, x);
    }
    return interpolerLineaire(exercice.b4, exercice.y3, exercice.b5, exercice.y5Naturel, x);
  }

  // Exactement à l'abscisse partagée de la discontinuité : la valeur dépend du cas tiré
  // ("3 cas possibles pour la discontinuité") — jamais un calcul dupliqué ailleurs, cette branche
  // est la SEULE à décider ce que vaut réellement f(b5). Pour "pointPlein", tombe dans la formule
  // hyperbolique générale ci-dessous (comportement historique inchangé).
  if (x === exercice.b5) {
    if (exercice.discontinuite.type === "trou") return NaN;
    if (exercice.discontinuite.type === "pointRedefini") return exercice.discontinuite.valeur;
  }

  return exercice.L + exercice.k / (x - exercice.AV);
}

/** La "valeur naturelle" (exclue) de la zone 5 à l'endroit exact de b5 — pour le marqueur creux ;
 * toujours exactement `y5Naturel` par construction de l'interpolation (voir types). */
export function valeurNaturelleEnB5(exercice: ExerciceCaracteristiquesFonction): number {
  return exercice.y5Naturel;
}

/** Valeur "naturelle" de la branche hyperbolique en b5 (`L + k/(b5-AV)`) — indépendante du cas de
 * discontinuité tiré, contrairement à `evaluerCourbeCaracteristiques(exercice, exercice.b5)` qui
 * peut valoir autre chose (NaN pour "trou", la valeur du point isolé pour "pointRedefini"). Sert à
 * positionner le second marqueur de la discontinuité sur le graphe (plein pour "pointPlein", vide
 * pour "trou"/"pointRedefini") — toujours distincte de `y5Naturel` par construction
 * (`layoutValide`, voir le générateur). */
export function valeurHyperboleEnB5(exercice: ExerciceCaracteristiquesFonction): number {
  return exercice.L + exercice.k / (exercice.b5 - exercice.AV);
}

/** Appartenance au domaine — seule source de vérité pour "l'ordonnée/f(v) existe-t-il ?" (refonte
 * points 6 et 7), jamais redérivée indépendamment de evaluerCourbeCaracteristiques. */
export function appartientAuDomaineCaracteristiques(exercice: ExerciceCaracteristiquesFonction, x: number): boolean {
  return Number.isFinite(evaluerCourbeCaracteristiques(exercice, x));
}

/**
 * Domaine attendu — construit DIRECTEMENT comme l'union des morceaux où la fonction EST définie
 * (refonte 3, correction 1) : jamais son complémentaire ("ℝ \ ..."). L'élève doit construire le
 * domaine lui-même tel qu'il est, avec le même composant générique de liste de morceaux que
 * partout ailleurs dans le projet — ce composant n'a jamais eu besoin de connaître la notion de
 * "complémentaire" pour représenter ℝ (`]-∞,+∞[`), un intervalle, une union de plusieurs morceaux,
 * etc., donc aucun changement d'UI n'est nécessaire ici, seulement un changement de ce qui est
 * comparé.
 *
 * Parcourt les exclusions triées par abscisse croissante (le point creux `c`, chaque gap, puis
 * `AV` — toujours dans cet ordre par construction, `c` étant toujours avant tout gap et `AV`
 * toujours après) et construit le morceau de domaine entre deux exclusions consécutives. Le
 * crochet à la frontière d'une exclusion PONCTUELLE (`c`, `AV`) est toujours OUVERT (le point lui
 * -même est exclu) ; à la frontière d'un GAP (intervalle), toujours FERMÉ (ses bornes `g1`/`g2`
 * elles-mêmes restent dans le domaine, seul l'intérieur strict est exclu).
 */
export function domaineCaracteristiques(exercice: ExerciceCaracteristiquesFonction): Morceau[] {
  const exclusions = [
    { debut: exercice.c, fin: exercice.c, ponctuelle: true },
    ...exercice.gaps.map((g) => ({ debut: g.g1, fin: g.g2, ponctuelle: false })),
    // b5 n'est exclu du domaine que pour le cas "trou" (cas 2) — "pointPlein" (cas 1) et
    // "pointRedefini" (cas 3) laissent b5 dans le domaine (voir CasDiscontinuite, core/types).
    ...(exercice.discontinuite.type === "trou" ? [{ debut: exercice.b5, fin: exercice.b5, ponctuelle: true }] : []),
    { debut: exercice.AV, fin: exercice.AV, ponctuelle: true },
  ].sort((a, b) => a.debut - b.debut);

  const morceaux: Morceau[] = [];
  let borneGauche: Borne = "-inf";
  let crochetGauche: Crochet = "]";
  for (const exclusion of exclusions) {
    const crochetDroit: Crochet = exclusion.ponctuelle ? "[" : "]";
    morceaux.push({ crochetGauche, borneGauche, crochetDroit, borneDroite: exclusion.debut });
    borneGauche = exclusion.fin;
    crochetGauche = exclusion.ponctuelle ? "]" : "[";
  }
  morceaux.push({ crochetGauche, borneGauche, crochetDroit: "[", borneDroite: "+inf" });
  return morceaux;
}

function morceauEgal(a: Morceau, b: Morceau): boolean {
  return (
    a.crochetGauche === b.crochetGauche &&
    a.crochetDroit === b.crochetDroit &&
    a.borneGauche === b.borneGauche &&
    a.borneDroite === b.borneDroite
  );
}

/** Comparaison en multi-ensemble (ordre non significatif), généralisée à N morceaux — voir
 * src/ui/listeMorceaux.ts::verifierListeMorceaux, dupliquée ici pour ne jamais faire dépendre
 * src/moteur/ de src/ui/ (règle d'architecture non négociable, voir CLAUDE.md). */
function memesMorceaux(saisie: Morceau[], attendu: Morceau[]): boolean {
  if (saisie.length !== attendu.length) return false;
  const restants = [...attendu];
  for (const m of saisie) {
    const index = restants.findIndex((a) => morceauEgal(a, m));
    if (index === -1) return false;
    restants.splice(index, 1);
  }
  return true;
}

export function verifierDomaineCaracteristiques(exercice: ExerciceCaracteristiquesFonction, saisie: Morceau[]): boolean {
  return memesMorceaux(saisie, domaineCaracteristiques(exercice));
}

/**
 * BUG DE DÉSYNCHRONISATION CORRIGÉ (symptôme B) : cette fonction affirmait auparavant que
 * `[b1,b2] ∪ [b4,b5]` (fermé-fermé aux DEUX bornes) était TOUJOURS la réponse exacte — c'est faux
 * pour deux raisons indépendantes, prouvées empiriquement (script `/tmp/diag_b5.ts`, 2000 tirages :
 * "jump UP" 982/2000, rendant le crochet fermé en b5 invalide dans ~moitié des cas) avant tout
 * correctif :
 * 1. La branche hyperbolique (zones 6/7, x >= b5) n'était jamais prise en compte : elle est
 *    TOUJOURS décroissante quand k>0 (g(x)=L+k/(x-AV), g'(x)=-k/(x-AV)² change de signe uniquement
 *    avec celui de k), et devrait alors apparaître dans la réponse attendue — au lieu d'un
 *    intervalle manquant.
 * 2. La valeur RÉELLE en b5 (`evaluerCourbeCaracteristiques(exercice,b5)`, sur la branche
 *    hyperbolique — jamais `y5Naturel`, qui n'est que la valeur vers laquelle la zone 5 tend sans
 *    jamais l'atteindre) peut être supérieure OU inférieure à `y5Naturel` selon les paramètres
 *    tirés (jamais un signe fixe) : un crochet fermé en b5 n'est mathématiquement valide pour la
 *    décroissance que si cette valeur réelle est INFÉRIEURE (le saut continue de descendre) —
 *    sinon (saut vers le haut) b5 doit être exclu de la zone décroissante, sans quoi l'intervalle
 *    "décroissant" contiendrait un point où la fonction remonte.
 *
 * Cette même primitive (`sauteVersLeHaut`) est réutilisée par `croissanceAttendueCaracteristiques`
 * pour la décision symétrique : le saut ne "casse" jamais la décroissance ET la croissance à la
 * fois (ce sont deux verdicts opposés, jamais indépendants), mais la direction du saut détermine
 * dans les deux cas où placer le crochet ouvert/fermé en b5.
 *
 * N'a de sens que pour le cas "pointPlein" (b5 réellement point de départ de la branche
 * hyperbolique) — jamais appelée pour "trou"/"pointRedefini" (voir `b5AppartientALaContinuite`
 * ci-dessous, toujours vérifiée en premier par les deux fonctions consommatrices grâce au
 * court-circuit `||`/`&&`) : `evaluerCourbeCaracteristiques(exercice,b5)` y vaudrait NaN ou la
 * valeur du point isolé, sans rapport avec une direction de saut continue.
 */
export function sauteVersLeHaut(exercice: ExerciceCaracteristiquesFonction): boolean {
  return evaluerCourbeCaracteristiques(exercice, exercice.b5) > exercice.y5Naturel;
}

/**
 * Vrai uniquement pour le cas "pointPlein" : b5 appartient alors réellement à la courbe continue
 * (fin de zone 5 exclue en cercle vide, mais début de la branche hyperbolique en point plein — la
 * question de savoir si les deux zones se "fusionnent" en un seul intervalle monotone a un sens).
 * Pour "trou"/"pointRedefini", les deux côtés de b5 sont des cercles vides (voir le contrat
 * `CasDiscontinuite`) : aucune des deux zones n'atteint réellement b5 sur la courbe tracée — zone 5
 * et zone 6 ne fusionnent donc JAMAIS, indépendamment du signe du saut théorique, et b5 lui-même
 * n'appartient à aucun des deux intervalles de monotonie (ouvert des deux côtés).
 */
function b5AppartientALaContinuite(exercice: ExerciceCaracteristiquesFonction): boolean {
  return exercice.discontinuite.type === "pointPlein";
}

/**
 * Réponse attendue de "décroissance stricte" — toujours zone 2 ([b1,b2], structurellement
 * décroissante), puis zone 5 (jusqu'à b5, ouvert ou fermé selon `sauteVersLeHaut`), fusionnée avec
 * zone 6 en un seul morceau [b4,AV[ quand k>0 ET que le saut descend (sinon zone 5 et zone 6
 * restent deux morceaux séparés), et — uniquement quand k>0 — zone 7 (]AV,+∞[, toujours séparée :
 * l'asymptote verticale empêche toute fusion). Jamais 2 morceaux fixes : dynamique selon le signe
 * de k et la direction du saut en b5 (2 à 4 morceaux selon le cas).
 */
export function decroissanceAttendueCaracteristiques(exercice: ExerciceCaracteristiquesFonction): Morceau[] {
  const zone2: Morceau = { crochetGauche: "[", borneGauche: exercice.b1, crochetDroit: "]", borneDroite: exercice.b2 };
  const continu = b5AppartientALaContinuite(exercice);

  if (exercice.k < 0) {
    // zones 6/7 croissantes, jamais dans la décroissance : seule zone 5 (jusqu'à b5) compte.
    // b5 exclu (crochet ouvert) dès que "trou"/"pointRedefini" — cercle vide des deux côtés, jamais
    // atteint réellement par la courbe — sinon (pointPlein) selon la direction du saut, comme avant.
    const zone5: Morceau = {
      crochetGauche: "[",
      borneGauche: exercice.b4,
      crochetDroit: !continu || sauteVersLeHaut(exercice) ? "[" : "]",
      borneDroite: exercice.b5,
    };
    return [zone2, zone5];
  }

  const zone7: Morceau = { crochetGauche: "]", borneGauche: exercice.AV, crochetDroit: "[", borneDroite: "+inf" };
  if (continu && !sauteVersLeHaut(exercice)) {
    // saut vers le bas (ou nul) : zone 5 et zone 6 fusionnent en un seul morceau continu.
    const zone5Et6: Morceau = { crochetGauche: "[", borneGauche: exercice.b4, crochetDroit: "[", borneDroite: exercice.AV };
    return [zone2, zone5Et6, zone7];
  }
  // "trou"/"pointRedefini" (ou saut vers le haut en "pointPlein") : jamais de fusion — b5 exclu des
  // deux côtés dès que le cercle de gauche/droite correspondant n'appartient pas réellement à la
  // courbe tracée.
  const zone5: Morceau = { crochetGauche: "[", borneGauche: exercice.b4, crochetDroit: "[", borneDroite: exercice.b5 };
  const zone6: Morceau = { crochetGauche: continu ? "[" : "]", borneGauche: exercice.b5, crochetDroit: "[", borneDroite: exercice.AV };
  return [zone2, zone5, zone6, zone7];
}

export function verifierDecroissanceCaracteristiques(exercice: ExerciceCaracteristiquesFonction, saisie: Morceau[]): boolean {
  return memesMorceaux(saisie, decroissanceAttendueCaracteristiques(exercice));
}

/**
 * Réponse attendue de "croissance stricte" (refonte 2, correction 7 — nouvelle question) : zone 1
 * (rayon `]-∞,b1]`, toujours croissante) et zone 3 (`[b2,b3]`, toujours croissante mais coupée en 2
 * morceaux au point creux `c`, exclu du domaine — jamais un seul morceau [b2,b3] qui inclurait un
 * point hors domaine), plus — uniquement quand k<0 (zones 6/7 croissantes) — zone 6 (`[b5,AV[`,
 * toujours fermée en b5 : aucune zone décroissante ne la précède directement, donc pas de question
 * de compatibilité de saut ici, contrairement à la décroissance) et zone 7 (`]AV,+∞[`, toujours
 * séparée). Dynamique : 3 morceaux si k>0, 5 si k<0.
 */
export function croissanceAttendueCaracteristiques(exercice: ExerciceCaracteristiquesFonction): Morceau[] {
  const zone1: Morceau = { crochetGauche: "]", borneGauche: "-inf", crochetDroit: "]", borneDroite: exercice.b1 };
  const zone3a: Morceau = { crochetGauche: "[", borneGauche: exercice.b2, crochetDroit: "[", borneDroite: exercice.c };
  const zone3b: Morceau = { crochetGauche: "]", borneGauche: exercice.c, crochetDroit: "]", borneDroite: exercice.b3 };

  if (exercice.k > 0) {
    return [zone1, zone3a, zone3b];
  }

  // b5 exclu (crochet ouvert) du début de zone 6 dès que "trou"/"pointRedefini" — le cercle vide de
  // droite n'appartient jamais réellement à la courbe tracée, contrairement à "pointPlein".
  const zone6: Morceau = {
    crochetGauche: b5AppartientALaContinuite(exercice) ? "[" : "]",
    borneGauche: exercice.b5,
    crochetDroit: "[",
    borneDroite: exercice.AV,
  };
  const zone7: Morceau = { crochetGauche: "]", borneGauche: exercice.AV, crochetDroit: "[", borneDroite: "+inf" };
  return [zone1, zone3a, zone3b, zone6, zone7];
}

export function verifierCroissanceCaracteristiques(exercice: ExerciceCaracteristiquesFonction, saisie: Morceau[]): boolean {
  return memesMorceaux(saisie, croissanceAttendueCaracteristiques(exercice));
}

/**
 * Réponse attendue de "constance" (refonte 2, correction 7 — nouvelle question) : zone 4 tout
 * entière (`[b3,b4]`), coupée en autant de morceaux qu'il y a de gaps exclus à l'intérieur (0, 1 ou
 * 2 gaps ⇒ 1, 2 ou 3 morceaux) — jamais un seul morceau fixe qui engloberait un point hors domaine.
 */
export function constanceAttendueCaracteristiques(exercice: ExerciceCaracteristiquesFonction): Morceau[] {
  const bornesGaps = exercice.gaps.flatMap((g) => [g.g1, g.g2]).sort((a, b) => a - b);
  const points = [exercice.b3, ...bornesGaps, exercice.b4];
  const morceaux: Morceau[] = [];
  for (let i = 0; i < points.length; i += 2) {
    morceaux.push({ crochetGauche: "[", borneGauche: points[i], crochetDroit: "]", borneDroite: points[i + 1] });
  }
  return morceaux;
}

export function verifierConstanceCaracteristiques(exercice: ExerciceCaracteristiquesFonction, saisie: Morceau[]): boolean {
  return memesMorceaux(saisie, constanceAttendueCaracteristiques(exercice));
}

/** Zéros : nombre variable (0 à 5), comparaison en multi-ensemble (refonte point 2). */
export function verifierZerosCaracteristiques(exercice: ExerciceCaracteristiquesFonction, saisie: ReponseZerosCaracteristiques): boolean {
  if (exercice.zeros.length === 0) return saisie.aucun === true;
  if (saisie.aucun) return false;

  const attendu = [...exercice.zeros].sort((a, b) => a - b);
  const recu = [...saisie.valeurs].sort((a, b) => a - b);
  if (attendu.length !== recu.length) return false;
  return attendu.every((v, i) => v === recu[i]);
}

/** Ordonnée à l'origine : peut ne pas exister si x=0 tombe dans une exclusion (refonte point 6). */
export function existeOrdonneeCaracteristiques(exercice: ExerciceCaracteristiquesFonction): boolean {
  return appartientAuDomaineCaracteristiques(exercice, 0);
}

export function verifierOrdonneeCaracteristiques(exercice: ExerciceCaracteristiquesFonction, saisie: ReponseExistence): boolean {
  const existe = existeOrdonneeCaracteristiques(exercice);
  if (!existe) return saisie.existe === false;
  if (!saisie.existe || saisie.valeur === null) return false;
  return Math.abs(saisie.valeur - evaluerCourbeCaracteristiques(exercice, 0)) < TOLERANCE;
}

/** f(v) : v cible toujours soit le point creux (c, "n'existe pas"), soit l'abscisse partagée de la
 * discontinuité (b5, "n'existe pas" pour "trou", sinon la valeur du point plein/isolé selon le cas
 * tiré) — refonte point 7, corrigée en refonte 3 (correction 2) pour cibler exactement `b5` depuis
 * la fusion de l'ancien `b6`, puis généralisée aux 3 cas de discontinuité en délégant directement à
 * l'appartenance au domaine (déjà case-aware via `evaluerCourbeCaracteristiques`), jamais un test
 * direct sur `b5` qui ignorerait le cas "trou". */
export function existeValeurEnVCaracteristiques(exercice: ExerciceCaracteristiquesFonction): boolean {
  return appartientAuDomaineCaracteristiques(exercice, exercice.v);
}

export function verifierValeurEnVCaracteristiques(exercice: ExerciceCaracteristiquesFonction, saisie: ReponseExistence): boolean {
  const existe = existeValeurEnVCaracteristiques(exercice);
  if (!existe) return saisie.existe === false;
  if (!saisie.existe || saisie.valeur === null) return false;
  return Math.abs(saisie.valeur - evaluerCourbeCaracteristiques(exercice, exercice.v)) < TOLERANCE;
}

const REGEX_AXE_VERTICALE = /^x\s*=\s*(.+)$/;
const REGEX_AXE_HORIZONTALE = /^y\s*=\s*(.+)$/;

/**
 * Tolérant à l'espacement mais exige la structure "x=valeur" — même principe que
 * analyserAxeSymetrie ("Analyse d'une fonction"), généralisé aux deux préfixes x/y pour AV≡/AH≡
 * (refonte point 8). Import moteur→moteur (parserNombreOuFraction), hors du champ de la règle
 * Couche A↔B.
 */
export function analyserEquationAxeVerticale(texte: string): number | null {
  const correspondance = REGEX_AXE_VERTICALE.exec(texte.trim());
  if (!correspondance) return null;
  return parserNombreOuFraction(correspondance[1]);
}

export function analyserEquationAxeHorizontale(texte: string): number | null {
  const correspondance = REGEX_AXE_HORIZONTALE.exec(texte.trim());
  if (!correspondance) return null;
  return parserNombreOuFraction(correspondance[1]);
}

/**
 * Statut à 3 valeurs (convention CLAUDE.md, point 4.1 de promptcorrectionsgenerateurs764transversal.md) :
 * les deux champs (AV≡/AH≡) exigent toujours le gabarit fixe "x=valeur"/"y=valeur" — comme
 * `diagnostiquerAxeSommet` ("Analyse d'une fonction"), il n'existe aucune autre formulation valide
 * pour une équation d'asymptote, donc l'échec de ce gabarit (préfixe absent ou valeur illisible
 * après le "=") est traité uniformément comme "parse_error", jamais "not_equivalent".
 */
export function diagnostiquerAsymptotesCaracteristiques(
  exercice: ExerciceCaracteristiquesFonction,
  saisie: ReponseAsymptotesCaracteristiques,
): StatutVerification {
  const av = analyserEquationAxeVerticale(saisie.avTexte);
  const ah = analyserEquationAxeHorizontale(saisie.ahTexte);
  if (av === null || ah === null) return "parse_error";
  const correct = Math.abs(av - exercice.AV) < TOLERANCE && Math.abs(ah - exercice.L) < TOLERANCE;
  return correct ? "correct" : "not_equivalent";
}

export function verifierAsymptotesCaracteristiques(
  exercice: ExerciceCaracteristiquesFonction,
  saisie: ReponseAsymptotesCaracteristiques,
): boolean {
  return diagnostiquerAsymptotesCaracteristiques(exercice, saisie) === "correct";
}

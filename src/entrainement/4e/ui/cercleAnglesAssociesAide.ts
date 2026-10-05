/**
 * Géométrie de l'aide du dix-septième générateur ("Angles associés", refonte écran unique —
 * `promptgen17refontecomplete.md` — puis corrections visuelles, `promptgen17gen15correctionsvisuelles.md`) :
 * le cercle trigonométrique de l'aide 1 (arc de `theta`, sans son propre label — voir plus bas — et
 * UNE SEULE projection, celle de la fonction réellement demandée, dans la même couleur que `theta`),
 * l'angle associé de l'aide 2 (`xReference`, orange) et l'angle complémentaire de l'aide 3 (`alpha`,
 * vert) — ces deux derniers avec rayon+arc orienté+point+valeur, sur le modèle du rendu déjà en
 * place pour l'aide "Angle du premier quadrant" des générateurs 14/15.
 *
 * Composition pure de primitives déjà partagées, aucune nouvelle trigonométrie : `calculerTrajetCercleTrig`
 * (`cercleTrigTrajet.ts`, générateur 14) pour les 3 arcs (theta, xReference, alpha — chacun un simple
 * appel `calculerTrajetCercleTrig(angle, angle)`, jamais une seconde primitive de tracé) ;
 * `calculerAideSignes` (`cercleTrigSignesAide.ts`, générateur 14) pour les 3 positions de projection
 * `pointSin`/`pointCos`/`pointTan` de `theta` — chacune déjà positionnée exactement sur l'axe/la
 * droite pertinente (`pointSin.x===centre.x`, `pointCos.y===centre.y`, `pointTan` sur `x=1`), et déjà
 * REPLIÉE au bord du cadre par cette primitive quand l'intersection réelle en sortirait (cas limite
 * tan proche de 90°/270°, section "Aide 1" du prompt d'origine).
 *
 * **Le label du texte de la question ("fonction(theta°)=?") intègre désormais la valeur de l'angle
 * lui-même** (`promptgen17gen15correctionsvisuelles.md`, A.3) — `CercleTrigTrajetBase` ne rend donc
 * plus le label de `theta` séparément (`afficherLabelAngleBrut={false}`, voir `EtapeAnglesAssocies.tsx`).
 * L'ancienne garde anti-chevauchement de `pointQuestion` (qui évitait ce label désormais absent) est
 * retargetée vers les 2 labels EXTÉRIEURS réellement affichés à l'écran (`labelAssocie`/
 * `labelComplementaire`, aide 2/aide 3) — même mécanisme (`positionLabelQuestion`), même seuil, cible
 * différente. `labelComplementaire` (alpha) est de la même façon écarté de `labelAssocie` (xReference)
 * quand les deux angles sont proches — même principe que l'ancienne garde theta/xReference, retargetée
 * ici entre les 2 labels réellement voisins sur l'anneau extérieur (`RAYON_CERCLE_TRIG+22`).
 *
 * **3 bugs trouvés par vérification empirique en navigateur lors de la conception initiale (méthode
 * "verify before fixing" du projet), corrigés en 2 passages successifs** — toujours valables pour la
 * position du texte de la question, le mécanisme `positionLabelQuestion` restant inchangé :
 * 1. Le texte "fonction(theta°)=?" recouvrait le petit rayon/arc près de l'origine pour un `theta`
 *    proche d'un multiple de 90° (`|cos(theta)|`/`|sin(theta)|` faible — atteignable en pratique,
 *    `alpha` peut descendre à 10°) : la position brute (`pointSin`/`pointCos`/`pointTan`) est trop
 *    proche du centre.
 * 2. Le label numérique d'un angle extérieur pouvait se superposer à un autre label proche.
 * 3. **Premier correctif du point 1, insuffisant** : faire grandir le texte à l'opposé du centre
 *    (plutôt que vers lui) évite bien le recouvrement du petit arc, mais réintroduit un débordement
 *    du CADRE (240×240) pour un point à distance modérée du centre. `positionLabelQuestion` calcule
 *    désormais la position ET l'ancrage ENSEMBLE, à partir d'une largeur de texte ESTIMÉE (caractères
 *    × ratio empirique, même principe que `labelsGrapheApplicationPhysique`) : le texte grandit
 *    toujours à l'opposé du centre (corrige le point 1), mais son ancre est ensuite TRANSLATÉE
 *    (jamais son ancrage changé, ni sa largeur réduite) juste assez pour que l'intégralité du texte
 *    reste dans `[MARGE,LARGEUR-MARGE]`.
 */
import type { ExerciceAnglesAssocies } from "../core/anglesAssocies.types";
import { CENTRE_CERCLE_TRIG, HAUTEUR_CERCLE_TRIG, LARGEUR_CERCLE_TRIG, RAYON_CERCLE_TRIG } from "./cercleTrigGeometrie";
import type { PointCroquisCercleTrig } from "./cercleTrigGeometrie";
import { calculerTrajetCercleTrig, RAYON_ARC } from "./cercleTrigTrajet";
import type { TrajetCercleTrig } from "./cercleTrigTrajet";
import { calculerAideSignes } from "./cercleTrigSignesAide";

/**
 * Rayons concentriques des 3 arcs, FIXES par rôle (aide 1/2/3), jamais recalculés selon le nombre
 * d'aides réellement affichées pour la variante tirée (`promptcorrectionsgen17gen12gen21.md`, point 1)
 * — les 3 trajets sont toujours calculés avec ces mêmes rayons quelle que soit l'exercice (aide 3
 * existe ou non), garantissant que "l'aide 2" a toujours le même rayon d'un exercice à l'autre. Sans
 * cette distinction, les 3 arcs (theta/xReference/alpha) partageaient le même `RAYON_ARC` par défaut
 * et se superposaient dès qu'un balayage angulaire en contenait un autre (ex. 22° dans 68°, dans
 * 248°) — devenant illisibles près de l'origine. `RAYON_ARC` (le rayon par défaut, toujours utilisé
 * tel quel par les générateurs 14/15/18) reste inchangé et n'est plus utilisé ici que comme référence
 * de marge pour l'anti-chevauchement des labels (voir `decalerVersExterieur`/`separerHorizontalement`
 * plus bas), volontairement conservée telle quelle : elle reste plus généreuse que `RAYON_ARC_CIBLE`,
 * le plus petit des 3 nouveaux rayons.
 */
export const RAYON_ARC_CIBLE = RAYON_CERCLE_TRIG * 0.24; // aide 1 (violet), le plus proche du centre
export const RAYON_ARC_ASSOCIE = RAYON_CERCLE_TRIG * 0.4; // aide 2 (orange), intermédiaire
export const RAYON_ARC_COMPLEMENTAIRE = RAYON_CERCLE_TRIG * 0.56; // aide 3 (vert), le plus proche du cercle

export type AncrageTexte = "start" | "middle" | "end";

export interface AideCercleAnglesAssocies {
  /** Arc/point de `theta`, depuis l'axe X positif — toujours un simple arc (`theta` déjà dans
   * `[0°,360°[` par construction, jamais une spirale). Rendu SANS son propre label (voir
   * `EtapeAnglesAssocies.tsx`, `afficherLabelAngleBrut={false}`). */
  trajetTheta: TrajetCercleTrig;
  /** Point de projection sur l'axe/la droite pertinente pour la fonction réellement demandée (sin,
   * cos, ou tan) — aide 1, UNE SEULE projection, jamais les trois. */
  pointProjection: PointCroquisCercleTrig;
  /** Position du texte "fonction(theta°)=?" (aide 1) — près du point de projection, toujours borné
   * au cadre visible (voir `positionLabelQuestion`). */
  pointQuestion: PointCroquisCercleTrig;
  /** `text-anchor` SVG associé à `pointQuestion` — toujours calculé ensemble (jamais l'un sans
   * l'autre, la translation de bord dépend de l'ancrage). */
  ancrageQuestion: AncrageTexte;
  /** Arc/flèche/rayon/point de l'angle ASSOCIÉ (`xReference`, 1er quadrant) — aide 2, orange. */
  trajetAssocie: TrajetCercleTrig;
  /** Position du label numérique de `xReference`, décalé à l'extérieur du cercle. */
  labelAssocie: PointCroquisCercleTrig;
  /** Arc/flèche/rayon/point de l'angle COMPLÉMENTAIRE (`alpha`, 1er quadrant) — aide 3, vert. */
  trajetComplementaire: TrajetCercleTrig;
  /** Position du label numérique de `alpha`, décalé à l'extérieur du cercle ET écarté de
   * `labelAssocie` s'ils seraient sinon trop proches. */
  labelComplementaire: PointCroquisCercleTrig;
}

/** Fonction trigonométrique réellement demandée par l'énoncé — `fonctionCible` pour la variante
 * sin/cos, toujours "tan" pour la variante tangente. Exportée : consommée à la fois ici et par le
 * composant de rendu (`EtapeAnglesAssocies.tsx`, pour savoir s'il faut tracer la droite tangente). */
export function fonctionCible(exercice: ExerciceAnglesAssocies): "sin" | "cos" | "tan" {
  return exercice.variante === "sinCos" ? exercice.fonctionCible : "tan";
}

/**
 * Distance angulaire minimale (degrés) avant d'écarter le label de `alpha` (aide 3, vert) de celui
 * de `xReference` (aide 2, orange) — les deux labels ("NN°"/"NNN°") sont rendus sur le MÊME rayon
 * (`labelAngleBrut`, `RAYON_CERCLE_TRIG+DECALAGE_LABEL_EXTERIEUR=112`, `cercleTrigTrajet.ts`) — une
 * simple valeur angulaire fixe ne suffit donc pas : la distance PIXEL entre 2 points au même rayon
 * dépend de l'écart angulaire (corde), jamais linéairement. Dérivée pour garantir au moins 40px de
 * séparation centre-à-centre (~30px de large chacun à 12px, avec marge) via `corde=2·R·sin(écart/2)`
 * inversée — `2·asin(40/(2·112))≈20,6°`, arrondi à 24° pour une marge de sécurité. Une première
 * valeur (14°, choisie sans ce calcul) s'est révélée insuffisante lors de la conception initiale
 * (`promptgen17contraintesgeneration.md`) — confirmé par capture Playwright, distance réelle mesurée
 * sous les ~35-40px nécessaires — méthode "verify before fixing" du projet. Cible retargetée
 * d'alpha/xReference (au lieu de theta/xReference) par `promptgen17gen15correctionsvisuelles.md`, le
 * label de `theta` n'étant plus affiché du tout (voir en-tête de fichier) — mécanisme et seuil
 * inchangés.
 */
const ECART_ANGULAIRE_MIN_LABELS = 24;

/** Écart angulaire signé le plus court de `a` vers `b`, dans `]-180,180]`. */
function ecartAngulaire(a: number, b: number): number {
  return ((((b - a) % 360) + 540) % 360) - 180;
}

/** Angle à utiliser pour LE LABEL de `alpha` (jamais pour le point lui-même, resté exact) — écarté
 * de `xReference` d'au moins `ECART_ANGULAIRE_MIN_LABELS` s'ils sont trop proches, dans la direction
 * qui les éloigne. */
function angleLabelAvecEcart(alpha: number, xReference: number): number {
  const ecart = ecartAngulaire(xReference, alpha); // xReference -> alpha
  if (Math.abs(ecart) >= ECART_ANGULAIRE_MIN_LABELS) return alpha;
  const signe = ecart === 0 ? 1 : Math.sign(ecart);
  return xReference + signe * ECART_ANGULAIRE_MIN_LABELS;
}

export function calculerAideCercleAnglesAssocies(exercice: ExerciceAnglesAssocies): AideCercleAnglesAssocies {
  const trajetTheta = calculerTrajetCercleTrig(exercice.theta, exercice.theta, RAYON_ARC_CIBLE);
  const signes = calculerAideSignes(exercice.theta);
  const fonction = fonctionCible(exercice);
  const pointProjection =
    fonction === "sin" ? signes.pointSin : fonction === "cos" ? signes.pointCos : (signes.pointTan ?? signes.pointCercle);

  const trajetAssocie = calculerTrajetCercleTrig(exercice.xReference, exercice.xReference, RAYON_ARC_ASSOCIE);
  const labelAssocie = trajetAssocie.labelAngleBrut;

  const trajetComplementaire = calculerTrajetCercleTrig(exercice.alpha, exercice.alpha, RAYON_ARC_COMPLEMENTAIRE);
  const angleLabelComplementaire = angleLabelAvecEcart(exercice.alpha, exercice.xReference);
  const labelComplementaire =
    angleLabelComplementaire === exercice.alpha
      ? trajetComplementaire.labelAngleBrut
      : calculerTrajetCercleTrig(angleLabelComplementaire, angleLabelComplementaire).labelAngleBrut;

  const { point: pointQuestion, ancrage: ancrageQuestion } = positionLabelQuestion(pointProjection, texteLabelQuestion(exercice), [
    labelAssocie,
    labelComplementaire,
  ]);

  return {
    trajetTheta,
    pointProjection,
    pointQuestion,
    ancrageQuestion,
    trajetAssocie,
    labelAssocie,
    trajetComplementaire,
    labelComplementaire,
  };
}

/** Texte brut (SVG `<text>`, aucun rendu KaTeX possible à l'intérieur d'un `<svg>` — même contrainte
 * que le générateur 29, voir CLAUDE.md), format `fonction(theta°)=?` — exemple donné littéralement
 * par le prompt ("sin(222°)=?"), sans espace autour du `=`. */
export function texteLabelQuestion(exercice: ExerciceAnglesAssocies): string {
  return `${fonctionCible(exercice)}(${exercice.theta}°)=?`;
}

const MARGE_BORD_CADRE = 6;

/**
 * Garantit une distance MINIMALE de `point` au centre (jamais un simple décalage additif, qui ne
 * suffit pas quand le point de départ est déjà proche du centre) — repousse `point` le long de la
 * direction centre→point si nécessaire, sinon le laisse inchangé. Repli diagonal fixe si `point`
 * coïncide exactement avec le centre (jamais de direction nulle) — même principe que
 * `positionEtiquettePoint` (`ui/vecteurGraph.ts`, chapitre 4).
 */
function decalerVersExterieur(point: PointCroquisCercleTrig, distanceMinimale: number): PointCroquisCercleTrig {
  return pousserLoinDe(point, CENTRE_CERCLE_TRIG, distanceMinimale, { x: Math.SQRT1_2, y: -Math.SQRT1_2 });
}

/**
 * Garantit une distance MINIMALE entre `point` et `reference`, en repoussant `point` le long de la
 * direction reference→point si nécessaire (sinon inchangé). `directionRepli` fixe la direction à
 * utiliser si `point` coïncide exactement avec `reference` (jamais de direction nulle) — même
 * principe que `positionEtiquettePoint` (`ui/vecteurGraph.ts`, chapitre 4).
 */
function pousserLoinDe(
  point: PointCroquisCercleTrig,
  reference: PointCroquisCercleTrig,
  distanceMinimale: number,
  directionRepli: { x: number; y: number } = { x: Math.SQRT1_2, y: Math.SQRT1_2 },
): PointCroquisCercleTrig {
  const dx = point.x - reference.x;
  const dy = point.y - reference.y;
  const norme = Math.hypot(dx, dy);

  if (norme === 0) {
    return { x: point.x + distanceMinimale * directionRepli.x, y: point.y + distanceMinimale * directionRepli.y };
  }
  if (norme >= distanceMinimale) {
    return point;
  }
  return { x: reference.x + (dx / norme) * distanceMinimale, y: reference.y + (dy / norme) * distanceMinimale };
}

/**
 * Écarte HORIZONTALEMENT `point` de `reference` d'au moins `distanceMinimale` (distance
 * euclidienne), à `point.y` FIXE — jamais un décalage diagonal (voir `pousserLoinDe`) : ce point et
 * `reference` peuvent être tous deux déjà repliés près du même bord du cadre (`y` proche de sa borne,
 * cas limite tan proche de 90°/270°, section "Aide 1" du prompt), auquel cas une poussée diagonale
 * est immédiatement annulée par le nouveau clamp vertical qui suit — trouvé par capture Playwright
 * ("275°" et "tan(275°)=?" quasi confondus malgré `pousserLoinDe`, distance résiduelle observée <4px).
 * Un décalage purement horizontal reste, lui, entièrement disponible (le cadre a 240px de large).
 */
function separerHorizontalement(
  point: PointCroquisCercleTrig,
  reference: PointCroquisCercleTrig,
  distanceMinimale: number,
): PointCroquisCercleTrig {
  const dy = point.y - reference.y;
  const dxNecessaire = Math.sqrt(Math.max(0, distanceMinimale * distanceMinimale - dy * dy));
  const dxActuel = point.x - reference.x;
  if (Math.abs(dxActuel) >= dxNecessaire) return point;
  const signeNaturel = dxActuel !== 0 ? Math.sign(dxActuel) : point.x - CENTRE_CERCLE_TRIG.x >= 0 ? 1 : -1;
  const xNaturel = reference.x + signeNaturel * dxNecessaire;
  // Le choix "naturel" (prolonger le sens d'origine du point) peut, pour un point déjà sur l'axe
  // horizontal du centre (`pointCos`, dont `y===CENTRE.y` par construction), franchir `CENTRE.x` et
  // ramener le point tout près du centre dès que `dxNecessaire` est assez grand (texte large, voir
  // `DISTANCE_MIN_ENTRE_LABELS_PX`) — violant l'invariant "au-delà du petit arc" garanti par
  // `decalerVersExterieur` PLUS TÔT dans le pipeline, que cette fonction ne doit jamais défaire.
  // Bascule alors sur l'AUTRE solution symétrique (`reference.x - signeNaturel·dxNecessaire`),
  // garantie plus éloignée du centre par construction — jamais l'inverse (préférer systématiquement
  // le côté le plus éloigné, quel que soit le résultat), qui déplacerait à tort le label vers le bord
  // du cadre même quand le choix naturel était déjà parfaitement valide. Trouvé par test dédié
  // (`cercleAnglesAssociesAide.test.ts`) en durcissant `DISTANCE_MIN_ENTRE_LABELS_PX` pour le premier
  // bug (largeur du texte, voir sa doc) — méthode "verify before fixing".
  if (Math.abs(xNaturel - CENTRE_CERCLE_TRIG.x) < RAYON_ARC + 16) {
    return { x: reference.x - signeNaturel * dxNecessaire, y: point.y };
  }
  return { x: xNaturel, y: point.y };
}

/** Largeur estimée d'un texte SVG (caractères × ratio empirique largeur/taille de police — même
 * principe que `labelsGrapheApplicationPhysique`, jamais une mesure DOM réelle `getBBox`). */
const RATIO_LARGEUR_CARACTERE = 0.58;
const TAILLE_FONTE_QUESTION = 12;

export interface PositionLabelQuestion {
  point: PointCroquisCercleTrig;
  ancrage: AncrageTexte;
}

/** Distance minimale (pixels) entre le point de la question et un autre label déjà positionné (ex.
 * le label de `theta` lui-même) — cas limite tan proche de 90°/270° (section "Aide 1" du prompt) :
 * le point tan REPLIÉ au bord peut sinon atterrir tout près du label de `theta`, lui aussi proche du
 * même bord — trouvé par capture Playwright ("275°" et "tan(275°)=?" fusionnés).
 *
 * **Ce seuil, comparé au seul POINT d'ancrage, reste insuffisant à lui seul dès que le texte de la
 * question est large** (`promptgen17contraintesgeneration.md`, vérification finale — un second bug
 * trouvé par capture Playwright, distinct de celui ci-dessus : theta=112°/alpha=68°, "sin(112°)=?"
 * chevauchant visiblement "112°" malgré ~46px de distance point-à-point, largement au-delà de ce
 * seuil). Le point de la question est fréquemment ancré `"middle"` (voir plus bas), qui étend le
 * texte des DEUX côtés du point — `largeur` (calculée juste après, déjà nécessaire au clamp de
 * cadre) est donc ajoutée en PLUS de ce seuil dans `separerHorizontalement`, pour garantir que le
 * BORD du texte (pas seulement son point d'ancrage) reste à au moins `DISTANCE_MIN_ENTRE_LABELS_PX`
 * de l'autre label, quel que soit l'ancrage final retenu ensuite. */
const DISTANCE_MIN_ENTRE_LABELS_PX = 32;

/**
 * Position ET ancrage du texte "fonction(theta°)=?" (aide 1) — calculés ENSEMBLE (voir bug 3,
 * en-tête de fichier) : le point brut (`pointSin`/`pointCos`/`pointTan`) est d'abord repoussé à une
 * distance minimale du centre (au-delà du petit arc d'angle `RAYON_ARC`, pour ne jamais recouvrir le
 * rayon/l'arc violet près de l'origine), puis de chaque point de `pointsAEviter` (ex. le label de
 * `theta`, déjà positionné par `CercleTrigTrajetBase`) — en tenant compte de la largeur ESTIMÉE du
 * texte (voir `DISTANCE_MIN_ENTRE_LABELS_PX`), jamais du seul point d'ancrage ; l'ancrage fait
 * ensuite grandir le texte à l'opposé du centre (jamais vers lui) ; enfin, la position est TRANSLATÉE
 * horizontalement (jamais son ancrage changé, ni sa largeur réduite) juste assez pour que
 * l'intégralité du texte, à sa largeur estimée, reste dans le cadre visible `[MARGE,LARGEUR-MARGE]`.
 */
export function positionLabelQuestion(
  pointBrut: PointCroquisCercleTrig,
  texte: string,
  pointsAEviter: PointCroquisCercleTrig[] = [],
): PositionLabelQuestion {
  const pointEcarteDuCentre = decalerVersExterieur(pointBrut, RAYON_ARC + 16);
  // y fixé et borné AVANT d'écarter des autres labels — sinon une poussée diagonale (`pousserLoinDe`)
  // est aussitôt annulée par le clamp vertical qui suivrait (voir `separerHorizontalement`).
  const y = Math.min(HAUTEUR_CERCLE_TRIG - MARGE_BORD_CADRE, Math.max(MARGE_BORD_CADRE, pointEcarteDuCentre.y));

  const largeur = texte.length * TAILLE_FONTE_QUESTION * RATIO_LARGEUR_CARACTERE;

  let point = { x: pointEcarteDuCentre.x, y };
  for (const autre of pointsAEviter) {
    point = separerHorizontalement(point, autre, DISTANCE_MIN_ENTRE_LABELS_PX + largeur);
  }
  point = { x: Math.min(LARGEUR_CERCLE_TRIG - MARGE_BORD_CADRE, Math.max(MARGE_BORD_CADRE, point.x)), y };

  const dx = point.x - CENTRE_CERCLE_TRIG.x;

  let resultat: PositionLabelQuestion;
  if (Math.abs(dx) < 5) {
    const x = Math.min(LARGEUR_CERCLE_TRIG - MARGE_BORD_CADRE - largeur / 2, Math.max(MARGE_BORD_CADRE + largeur / 2, point.x));
    resultat = { point: { x, y }, ancrage: "middle" };
  } else if (dx < 0) {
    // grandit vers la gauche (à l'opposé du centre) : x doit rester assez loin du bord gauche.
    const x = Math.max(point.x, MARGE_BORD_CADRE + largeur);
    resultat = { point: { x, y }, ancrage: "end" };
  } else {
    // grandit vers la droite (à l'opposé du centre) : x doit rester assez loin du bord droit.
    const x = Math.min(point.x, LARGEUR_CERCLE_TRIG - MARGE_BORD_CADRE - largeur);
    resultat = { point: { x, y }, ancrage: "start" };
  }

  return replierVerticalementSiChevauchement(resultat, largeur, pointsAEviter);
}

/** Largeur estimée d'un label d'angle brut ("NNN°", toujours ancré "start" — `CercleTrigTrajetBase`,
 * jamais de `textAnchor` défini dessus) — 4 caractères, la taille maximale possible (`0°` à `359°`),
 * volontairement une SURESTIMATION pour un angle à 2-3 chiffres plutôt qu'une largeur exacte par
 * `autre` (`pointsAEviter` ne transporte que des points, jamais le texte associé — inutile de
 * généraliser cette API pour un seul consommateur réel à ce jour, voir doc de `positionLabelQuestion`). */
const LARGEUR_LABEL_ANGLE_ESTIMEE = 4 * TAILLE_FONTE_QUESTION * RATIO_LARGEUR_CARACTERE;
/** Écart vertical minimal (pixels) entre 2 labels sur une même police 12px pour ne jamais se toucher
 * visuellement — même ordre de grandeur que `ECART_ANGULAIRE_MIN_LABELS`/`DISTANCE_MIN_ENTRE_LABELS_PX`
 * déjà en place dans ce fichier pour des séparations analogues. */
const SEPARATION_VERTICALE_MIN_PX = 18;

/** Bornes horizontales `[xMin,xMax]` d'un texte de largeur `largeur` ancré en `x` selon `ancrage`. */
function bornesHorizontales(x: number, largeur: number, ancrage: AncrageTexte): [number, number] {
  if (ancrage === "start") return [x, x + largeur];
  if (ancrage === "end") return [x - largeur, x];
  return [x - largeur / 2, x + largeur / 2];
}

/**
 * Repli VERTICAL, dernier recours quand la séparation horizontale (`separerHorizontalement`) ne
 * suffit plus — cas trouvé par capture Playwright (`promptgen17contraintesgeneration.md`,
 * vérification finale, tan(320°)) : quand le point de la question ET le label de `theta` sont TOUS
 * DEUX proches du même coin du cadre (frame étroit, 240×240), la séparation horizontale voulue
 * dépasse la largeur disponible — le clamp de cadre qui suit (`positionLabelQuestion`, "reste dans
 * le cadre") ramène alors le point directement dans la zone du label évité, défaisant la séparation.
 * Le cadre a, lui, 240px de HAUTEUR disponibles (jamais aussi contraints que la largeur dans ce coin
 * précis) — un repli vertical, à x/ancrage INCHANGÉS, reste donc toujours disponible en dernier
 * recours quand l'estimation de bounding box horizontale du texte final chevauche encore celle du
 * label évité ET que l'écart vertical est encore insuffisant.
 */
function replierVerticalementSiChevauchement(
  resultat: PositionLabelQuestion,
  largeur: number,
  pointsAEviter: PointCroquisCercleTrig[],
): PositionLabelQuestion {
  const [qMin, qMax] = bornesHorizontales(resultat.point.x, largeur, resultat.ancrage);
  for (const autre of pointsAEviter) {
    const rMin = autre.x;
    const rMax = autre.x + LARGEUR_LABEL_ANGLE_ESTIMEE;
    const chevaucheHorizontalement = qMin < rMax && rMin < qMax;
    if (!chevaucheHorizontalement) continue;
    const dy = resultat.point.y - autre.y;
    if (Math.abs(dy) >= SEPARATION_VERTICALE_MIN_PX) continue;
    const signe = dy !== 0 ? Math.sign(dy) : -1;
    const yBrut = autre.y + signe * SEPARATION_VERTICALE_MIN_PX;
    const y = Math.min(HAUTEUR_CERCLE_TRIG - MARGE_BORD_CADRE, Math.max(MARGE_BORD_CADRE, yBrut));
    return { point: { x: resultat.point.x, y }, ancrage: resultat.ancrage };
  }
  return resultat;
}

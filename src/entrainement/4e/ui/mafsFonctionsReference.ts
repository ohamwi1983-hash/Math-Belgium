import type { ExerciceFonctionReference } from "../core/fonctionsReference.types";
import { evaluerFonctionReference, pivotX } from "../moteur/verificationFonctionsReference";
import { RATIO_GRAPHE, ZOOM_MAX, ZOOM_MIN, calculerPasGrille, formatEtiquetteGrille, xBordVisibleY } from "./mafsTransformation";

export { RATIO_GRAPHE, ZOOM_MAX, ZOOM_MIN, calculerPasGrille, formatEtiquetteGrille };

/**
 * Demi-largeur de référence en U (l'argument commun aux 6 familles, voir
 * verificationFonctionsReference.ts) utilisée pour cadrer le graphe — équivalent, pour ce
 * générateur, du DEMI_LARGEUR_COURBE de mafsTransformation.ts (chapitre 1). Contrairement au
 * chapitre 1 (dont le cadrage devait compenser empiriquement l'effet non linéaire de |a| sur
 * l'échelle Y d'un x², `demiLargeurCadrage`), la relation ici est directement LINÉAIRE
 * (u = pente·(x-pivot)) : demiLargeurX = U_CIBLE / |pente| donne exactement une fenêtre en U de
 * largeur fixe ±U_CIBLE quelle que soit la pente, sans exposant empirique à régler.
 */
export const U_CIBLE = 4;

/** Le tracé réel (Plot.OfX) déborde un peu au-delà de la zone utilisée pour calculer le viewBox
 * initial (même intention que demiLargeurTrace du chapitre 1) — permet un léger pan sans que la
 * courbe s'arrête net pile au bord. */
const MULTIPLICATEUR_TRACE = 1.5;

/** Marge en U autour du pôle pour la famille "inverse" — jamais échantillonnée ni tracée, pour ne
 * jamais laisser l'asymptote faire exploser les bornes du viewBox (spec section 5 : "laisser un
 * vide visuel à cet endroit, pas une valeur aberrante"). */
const BUFFER_POLE = 0.3;

export interface SegmentTrace {
  domaine: [number, number];
}

function pente(parametres: ExerciceFonctionReference): number {
  return (parametres.soy ? -1 : 1) * (parametres.ch / parametres.eh);
}

/** x tel que u = ±uCible, translaté depuis le pivot (u=0) — voir pivotX (verificationFonctionsReference.ts). */
function xDepuisU(parametres: ExerciceFonctionReference, u: number): number {
  return pivotX(parametres) + u / pente(parametres);
}

/**
 * Segment(s) de domaine X à échantillonner/tracer pour une famille donnée, en U-unités fixes
 * autour du pivot (voir U_CIBLE) — jamais un intervalle X absolu, pour rester pertinent quelle que
 * soit l'ampleur de la translation (TH) combinée au rapport CH/EH.
 * - carre/cube/racine_cubique/valeur_absolue : domaine illimité, un segment symétrique en U.
 * - racine_carree : domaine restreint à un demi-axe (u≥0), un seul segment du bon côté.
 * - inverse : domaine = tout sauf le pôle, deux segments encadrant le pôle avec une marge
 *   (BUFFER_POLE) jamais franchie, pour ne jamais échantillonner l'asymptote elle-même.
 */
export function calculerSegments(parametres: ExerciceFonctionReference, uCible: number): SegmentTrace[] {
  if (parametres.famille === "racine_carree") {
    const xPivot = pivotX(parametres);
    const xBout = xDepuisU(parametres, uCible);
    return [{ domaine: [Math.min(xPivot, xBout), Math.max(xPivot, xBout)] }];
  }

  if (parametres.famille === "inverse") {
    const xNegatif = xDepuisU(parametres, -uCible);
    const xPositif = xDepuisU(parametres, uCible);
    const xBuffer1 = xDepuisU(parametres, -BUFFER_POLE);
    const xBuffer2 = xDepuisU(parametres, BUFFER_POLE);
    const [xMin, xBufMin] = [Math.min(xNegatif, xPositif), Math.min(xBuffer1, xBuffer2)];
    const [xBufMax, xMax] = [Math.max(xBuffer1, xBuffer2), Math.max(xNegatif, xPositif)];
    return [
      { domaine: [xMin, xBufMin] },
      { domaine: [xBufMax, xMax] },
    ];
  }

  const xNegatif = xDepuisU(parametres, -uCible);
  const xPositif = xDepuisU(parametres, uCible);
  return [{ domaine: [Math.min(xNegatif, xPositif), Math.max(xNegatif, xPositif)] }];
}

/** Domaine(s) de tracé réel, plus large que le cadrage (voir MULTIPLICATEUR_TRACE) — toujours à
 * U_CIBLE fixe, jamais la fenêtre adaptative du cadrage (voir uCadrageAdapte ci-dessous) : un tracé
 * légèrement plus large que le viewBox initial permet le pan sans que la courbe s'arrête net au
 * bord, indépendamment du cadrage effectivement choisi pour cette instance.
 *
 * **Dépréciée au profit de `calculerSegmentsVisibles`** (`promptauditcourbesmafszoom.md`) — cette
 * plage fixe (`U_CIBLE*MULTIPLICATEUR_TRACE`) redevient trop étroite dès qu'on dézoome au-delà,
 * laissant la courbe s'arrêter net avant le bord de la fenêtre visible. Conservée telle quelle
 * (encore utilisée par `bornesPourFenetre`/`uCadrageAdapte`, le cadrage INITIAL du viewBox — non
 * concerné par ce bug, seul le tracé réellement affiché l'était).
 */
export function calculerSegmentsTrace(parametres: ExerciceFonctionReference): SegmentTrace[] {
  return calculerSegments(parametres, U_CIBLE * MULTIPLICATEUR_TRACE);
}

/**
 * `promptauditcourbesmafszoom.md` : variante RÉACTIVE de `calculerSegments` — au lieu d'une demi-
 * largeur fixe en U (`uCible`), reçoit directement la fenêtre visible COURANTE en X (`visible`,
 * calculée depuis `viewTransform`, voir `ui/mafsTransformation.ts::domaineVisibleX`) et l'utilise
 * pour le bord "libre" de chaque segment. Le bord côté restriction mathématique réelle (`pivotX`
 * pour `racine_carree` — domaine restreint à un demi-axe, jamais franchi) reste, lui, EXACTEMENT le
 * pivot.
 *
 * `racine_carree` : le signe de `pente` déterminé le côté défini (u≥0 ⇔ x-pivot et pente de même
 * signe) — reproduit exactement la direction que l'ancien `xDepuisU(parametres, uCible)` (uCible>0)
 * produisait déjà implicitement, sans avoir besoin de le recalculer en U.
 *
 * `inverse` : `promptauditcourbesmafszoomy.md` (addendum, prolongement en Y près du pôle) — le bord
 * proche du pôle de chaque segment n'est plus un `BUFFER_POLE` fixe (0,3 en U), qui laissait la
 * branche s'arrêter à un y figé dès qu'on zoomait sur la région proche du pôle (voire un segment vide
 * à un zoom encore plus poussé). `xBordVisibleY` (`ui/mafsTransformation.ts`) retrouve à la place, par
 * bissection, le point où la branche atteint réellement le bord visible en y — `visibleY` requis en
 * plus de `visible` pour ce calcul.
 */
export function calculerSegmentsVisibles(parametres: ExerciceFonctionReference, visible: [number, number], visibleY: [number, number]): SegmentTrace[] {
  const [visMin, visMax] = visible;

  if (parametres.famille === "racine_carree") {
    const xPivot = pivotX(parametres);
    if (pente(parametres) > 0) {
      return [{ domaine: [xPivot, Math.max(xPivot, visMax)] }];
    }
    return [{ domaine: [Math.min(xPivot, visMin), xPivot] }];
  }

  if (parametres.famille === "inverse") {
    const xPole = pivotX(parametres);
    const evaluer = (x: number) => evaluerFonctionReference(parametres, x);
    const xPresGauche = xBordVisibleY(evaluer, xPole, visMin, visibleY);
    const xPresDroite = xBordVisibleY(evaluer, xPole, visMax, visibleY);
    return [
      { domaine: [Math.min(visMin, xPresGauche), Math.max(visMin, xPresGauche)] },
      { domaine: [Math.min(visMax, xPresDroite), Math.max(visMax, xPresDroite)] },
    ];
  }

  return [{ domaine: [visMin, visMax] }];
}

/** Fenêtre U minimale autorisée pour le cadrage adaptatif (voir uCadrageAdapte) — plancher choisi
 * pour garder le second point marqué (u=1, voir verificationFonctionsReference.ts::pointUnitaire)
 * EXACTEMENT à la limite de la fenêtre échantillonnée (jamais en-deçà) : `bornesPourFenetre`
 * échantillonne toujours `[xDepuisU(-uFenetre), xDepuisU(uFenetre)]`, donc à `uFenetre=U_MIN_CADRAGE`
 * ce point tombe pile sur le dernier échantillon (i=30, x=fin exactement, aucune imprécision
 * flottante) — le point reste ainsi toujours inclus dans les bornes SANS qu'aucun filet de
 * sécurité séparé ne soit nécessaire. Historiquement 1,5 ; abaissé à 1 (correctif demandé
 * directement en conversation, sans fichier prompt dédié — voir la section CLAUDE.md dédiée) après
 * qu'un balayage empirique de 6000 tirages a confirmé que 1 est la valeur qui minimise le taux de
 * squash sévère (occupation horizontale <10 % de la largeur du viewBox tombe à 0 %, contre 6,6-7,2 %
 * à 1,5) — une valeur PLUS BASSE que 1 dégrade en réalité l'occupation (le point u=1 tombe alors HORS
 * de la fenêtre échantillonnée, forçant les bornes à s'élargir pour l'inclure malgré tout, ce qui
 * neutralise le gain attendu du resserrement). */
export const U_MIN_CADRAGE = 1;

const ITERATIONS_BISECTION = 20;

const ECHANTILLONS_PAR_SEGMENT = 30;

/** Plancher minimal du padding autour d'une courbe (voir `ratioAvecPadding`/
 * `calculerViewBoxFonctionReference`) — historiquement 1 unité fixe, quelle que soit la taille
 * naturelle de la courbe. Ce plancher ABSOLU devenait dominant dès qu'une courbe se resserrait
 * sous ~8 unités (un cas fréquent pour une pente extrême à canal unique, CH ou EH = 5) : le ratio
 * padding-inclus plafonnait alors autour de 1,0 quelle que soit la fenêtre U choisie — jamais la
 * cible RATIO_GRAPHE=1,5 — rendant `uCadrageAdapte` structurellement incapable d'atteindre cette
 * cible pour ces courbes, et un resserrement de la fenêtre au-delà d'un certain point empirait
 * même l'occupation réelle (le padding fixe absorbant une part croissante d'une courbe de plus en
 * plus petite). Abaissé à 0,1 (correctif demandé directement en conversation, sans fichier prompt
 * dédié — voir la section CLAUDE.md dédiée) : reste un plancher réel pour une courbe authentiquement
 * ponctuelle (jamais un padding nul), mais laisse le ratio padding-inclus refléter fidèlement le
 * ratio géométrique réel de la courbe jusqu'à une échelle bien plus fine. */
export const PADDING_MIN = 0.1;

/** Bornes naturelles (X, Y) d'UNE SEULE courbe, échantillonnée sur la fenêtre U fournie — brique
 * commune à la recherche de cadrage adaptatif (uCadrageAdapte) et au calcul du viewBox final
 * (etendreBornesSurSegments), pour que les deux utilisent exactement la même géométrie. */
function bornesPourFenetre(parametres: ExerciceFonctionReference, uFenetre: number) {
  let xMin = Infinity;
  let xMax = -Infinity;
  let yMin = Infinity;
  let yMax = -Infinity;
  for (const segment of calculerSegments(parametres, uFenetre)) {
    const [debut, fin] = segment.domaine;
    xMin = Math.min(xMin, debut);
    xMax = Math.max(xMax, fin);
    for (let i = 0; i <= ECHANTILLONS_PAR_SEGMENT; i++) {
      const x = debut + ((fin - debut) * i) / ECHANTILLONS_PAR_SEGMENT;
      const y = evaluerFonctionReference(parametres, x);
      if (!Number.isFinite(y)) continue;
      yMin = Math.min(yMin, y);
      yMax = Math.max(yMax, y);
    }
  }
  return { xMin, xMax, yMin, yMax };
}

/** Ratio largeur/hauteur (avec le même padding à 12% que le viewBox final) des bornes naturelles
 * d'une courbe seule — jamais le ratio brut sans padding, pour que la recherche de cadrage
 * s'aligne exactement sur ce qui compte réellement pour le rendu final. */
function ratioAvecPadding(bornes: { xMin: number; xMax: number; yMin: number; yMax: number }): number {
  const largeurX = bornes.xMax - bornes.xMin;
  const largeurY = bornes.yMax - bornes.yMin;
  const paddingX = Math.max(PADDING_MIN, largeurX * 0.12);
  const paddingY = Math.max(PADDING_MIN, largeurY * 0.12);
  return (largeurX + 2 * paddingX) / (largeurY + 2 * paddingY);
}

/** Amélioration minimale (en échelle logarithmique) exigée pour préférer `U_MIN_CADRAGE` à
 * `U_CIBLE` dans le cas "même côté aux deux bornes" (voir `uCadrageAdapte`) — sans ce seuil, une
 * famille dont le ratio est constant ou quasi constant en la fenêtre (`valeur_absolue`, n=1)
 * basculerait vers `U_MIN_CADRAGE` sur un simple bruit numérique (effet de plancher du padding, cf
 * `ratioAvecPadding`) sans aucun gain réel de ratio — resserrant inutilement son cadrage alors que
 * rien ne le justifie. */
const AMELIORATION_MIN_LOG = 1e-6;

/**
 * Recherche par bissection, dans `[U_MIN_CADRAGE, U_CIBLE]`, la fenêtre U qui rapproche le plus le
 * ratio naturel (largeur/hauteur) de CETTE courbe seule du ratio cible RATIO_GRAPHE — jamais
 * au-delà de `U_CIBLE` (plafond, garantit qu'aucun cas déjà correct aujourd'hui ne régresse),
 * jamais en-deçà de `U_MIN_CADRAGE` (plancher, voir sa doc).
 *
 * Le ratio naturel (SANS padding) est STRICTEMENT MONOTONE en la largeur de fenêtre pour chacune
 * des 6 familles (vérifié empiriquement avant implémentation, sur un échantillon croisant les 6
 * familles et plusieurs combinaisons de paramètres, aucune exception rencontrée) — décroissant
 * pour les familles à croissance sur-linéaire (`carre`, `cube` : une fenêtre plus étroite y grimpe
 * le ratio, ce qui aide précisément le cas le plus sévère du sweep empirique, `cube` combiné à un
 * EV élevé, où le ratio naturel à `U_CIBLE` est très en-dessous de la cible) ; croissant pour les
 * familles à croissance sous-linéaire ou le pôle (`racine_carree`, `racine_cubique`, `inverse`) ;
 * strictement constant pour `valeur_absolue` (croissance linéaire, n=1) — cette famille n'a donc
 * structurellement rien à gagner d'un changement de fenêtre... **sauf** que `ratioAvecPadding` (le
 * ratio réellement utilisé ici, padding à 12% inclus avec son plancher `Math.max(1, ...)`) n'est
 * lui PAS parfaitement proportionnel dès que ce plancher intervient à une borne mais pas à l'autre
 * — `valeur_absolue` peut alors légitimement traverser la cible entre les deux bornes (bissection
 * normale) ou finir dans le cas "même côté" ci-dessous ; dans ce dernier cas uniquement,
 * `AMELIORATION_MIN_LOG` garde `U_CIBLE` (comportement historique, inchangé) tant que
 * `U_MIN_CADRAGE` n'apporte pas un gain réel — jamais un resserrement sur un simple artefact du
 * plancher de padding. Si la cible n'est atteignable dans AUCUN sens depuis `U_CIBLE` (déjà du
 * même côté aux deux bornes — une distorsion trop extrême pour être résorbée même à la fenêtre
 * minimale, ou le cas `valeur_absolue` ci-dessus) : `U_CIBLE` est retenu par défaut, sauf si
 * `U_MIN_CADRAGE` apporte cette amélioration réelle — jamais de bissection dans ce cas, la cible
 * n'étant de toute façon pas atteignable dans l'intervalle.
 */
export function uCadrageAdapte(parametres: ExerciceFonctionReference): number {
  const ratioMin = ratioAvecPadding(bornesPourFenetre(parametres, U_MIN_CADRAGE));
  const ratioMax = ratioAvecPadding(bornesPourFenetre(parametres, U_CIBLE));

  if ((ratioMin - RATIO_GRAPHE) * (ratioMax - RATIO_GRAPHE) >= 0) {
    const distanceMin = Math.abs(Math.log(ratioMin / RATIO_GRAPHE));
    const distanceMax = Math.abs(Math.log(ratioMax / RATIO_GRAPHE));
    return distanceMin < distanceMax - AMELIORATION_MIN_LOG ? U_MIN_CADRAGE : U_CIBLE;
  }

  const signeBas = Math.sign(ratioMin - RATIO_GRAPHE);
  let bas = U_MIN_CADRAGE;
  let haut = U_CIBLE;
  for (let i = 0; i < ITERATIONS_BISECTION; i++) {
    const milieu = (bas + haut) / 2;
    const ratioMilieu = ratioAvecPadding(bornesPourFenetre(parametres, milieu));
    if (Math.sign(ratioMilieu - RATIO_GRAPHE) === signeBas) {
      bas = milieu;
    } else {
      haut = milieu;
    }
  }
  return (bas + haut) / 2;
}

/** y = f(x), NaN hors domaine — délègue entièrement à evaluerFonctionReference (moteur), jamais de
 * logique dupliquée entre le calcul de vérification et le rendu graphique. */
export function evaluerPourGraphe(parametres: ExerciceFonctionReference, x: number): number {
  return evaluerFonctionReference(parametres, x);
}

/** Étend les bornes accumulées avec celles de cette courbe, échantillonnée sur SA PROPRE fenêtre
 * adaptée (uCadrageAdapte) — jamais la fenêtre fixe U_CIBLE partagée par toutes les courbes : deux
 * courbes de familles/paramètres différents (cible et live, voir calculerViewBoxFonctionReference)
 * peuvent ainsi choisir chacune la fenêtre qui la représente le mieux, indépendamment l'une de
 * l'autre. */
function etendreBornesSurSegments(
  bornes: { xMin: number; xMax: number; yMin: number; yMax: number },
  parametres: ExerciceFonctionReference,
) {
  const b = bornesPourFenetre(parametres, uCadrageAdapte(parametres));
  return {
    xMin: Math.min(bornes.xMin, b.xMin),
    xMax: Math.max(bornes.xMax, b.xMax),
    yMin: Math.min(bornes.yMin, b.yMin),
    yMax: Math.max(bornes.yMax, b.yMax),
  };
}

export interface ViewBoxFonctionReference {
  x: [number, number];
  y: [number, number];
}

/** Réplique la formule interne de Mafs pour ajuster une zone à un ratio donné (voir
 * mafsTransformation.ts::ajusterAuRatio pour l'explication complète) — dupliquée ici plutôt que
 * réexportée pour ne jamais risquer de régression sur les deux consommateurs existants de ce
 * fichier (petite fonction pure, sans état). */
function ajusterAuRatio(x: [number, number], y: [number, number], ratio: number): ViewBoxFonctionReference {
  const largeurZone = x[1] - x[0];
  const hauteurZone = y[1] - y[0];
  const ratioZone = largeurZone / hauteurZone;

  if (ratioZone > ratio) {
    const centreY = (y[0] + y[1]) / 2;
    const demiHauteur = largeurZone / ratio / 2;
    return { x, y: [centreY - demiHauteur, centreY + demiHauteur] };
  }

  const centreX = (x[0] + x[1]) / 2;
  const demiLargeur = (hauteurZone * ratio) / 2;
  return { x: [centreX - demiLargeur, centreX + demiLargeur], y };
}

/** Calcule le viewBox Mafs pour que la courbe cible — et, si `live` est fourni (bouton "Aide"
 * activé), la courbe manipulable en direct — soient toutes deux visibles confortablement. */
export function calculerViewBoxFonctionReference(
  cible: ExerciceFonctionReference,
  live?: ExerciceFonctionReference | null,
): ViewBoxFonctionReference {
  let bornes = { xMin: Infinity, xMax: -Infinity, yMin: Infinity, yMax: -Infinity };
  bornes = etendreBornesSurSegments(bornes, cible);
  if (live) bornes = etendreBornesSurSegments(bornes, live);

  const paddingY = Math.max(PADDING_MIN, (bornes.yMax - bornes.yMin) * 0.12);
  const paddingX = Math.max(PADDING_MIN, (bornes.xMax - bornes.xMin) * 0.12);

  return ajusterAuRatio(
    [bornes.xMin - paddingX, bornes.xMax + paddingX],
    [bornes.yMin - paddingY, bornes.yMax + paddingY],
    RATIO_GRAPHE,
  );
}

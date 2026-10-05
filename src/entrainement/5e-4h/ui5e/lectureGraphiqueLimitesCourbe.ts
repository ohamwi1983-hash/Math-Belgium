/**
 * Couche présentation (5e) — construction PROCÉDURALE de la courbe pour 5gen22 ("Limites et
 * asymptotes, lecture graphique"). Exercice PUR lecture graphique (aucun calcul testé) : la courbe
 * n'a donc jamais besoin de correspondre à une expression algébrique réelle — seul le comportement
 * QUALITATIF aux bords (chaque côté de chaque AV, chaque direction à l'infini) doit être exact, la
 * forme au milieu de chaque morceau est cosmétique et libre. Construite MORCEAU PAR MORCEAU (un
 * morceau = un intervalle entre 2 bornes consécutives parmi −∞/AV.../+∞, jamais une seule fonction
 * globale) : chaque morceau MÉLANGE par une pondération sigmoïde deux "gabarits" locaux réalisant
 * chacun exactement le comportement requis à SON bord (divergence signée, valeur finie de
 * continuité pour un point isolé, asymptote horizontale/oblique, ou croissance sans asymptote) —
 * l'un dominant près du bord gauche du morceau, l'autre près du bord droit.
 */
import type { ComportementVA, ExerciceLectureGraphiqueLimites, SigneInfini } from "../core5e/lectureGraphiqueLimites.types";
import { xBordVisibleY } from "../ui/mafsTransformation";

const K_VA = 3; // échelle du gabarit de divergence près d'une AV (cf. BUFFER_VA : valeur ≈ K_VA/BUFFER_VA au bord du domaine de rendu)
const K_AUCUNE = 0.15; // échelle du gabarit "croît sans asymptote"
const PENTE_POINT_ISOLE = 0.15; // légère variation locale autour de la valeur de continuité, jamais plate
const ALPHA_BLEND = 8; // netteté de la transition sigmoïde entre les 2 gabarits d'un morceau
export const BUFFER_VA = 0.35; // jamais échantillonner le pôle lui-même (unités d'axe x)

type Gabarit = (x: number) => number;

function gabaritDivergenceDepuisDroite(a: number, signe: SigneInfini): Gabarit {
  // Morceau à DROITE de l'AV a (x>a) : x→a⁺ ⟹ diverge vers signe·∞.
  return (x) => (signe * K_VA) / (x - a);
}
function gabaritDivergenceDepuisGauche(a: number, signe: SigneInfini): Gabarit {
  // Morceau à GAUCHE de l'AV a (x<a) : x→a⁻ ⟹ diverge vers signe·∞.
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

export interface PieceCourbe {
  /** Borne AV du morceau, ou `null` si ce bord est −∞/+∞ (borne réelle de rendu fixée par le viewBox). */
  loVA: number | null;
  hiVA: number | null;
  gabaritGauche: Gabarit;
  gabaritDroit: Gabarit;
}

/** Un morceau PAR intervalle entre bornes consécutives (nombreVA+1 morceaux au total) — jamais un
 * seul morceau avec une exclusion interne (Mafs relierait la coupure par une fausse droite). */
export function construirePieces(exercice: ExerciceLectureGraphiqueLimites): PieceCourbe[] {
  const { vas, infini } = exercice;
  const n = vas.length;

  const xRefGauche = n > 0 ? vas[0].position : 0;
  const xRefDroit = n > 0 ? vas[n - 1].position : 0;
  const gabaritInfiniGauche: Gabarit =
    infini.type === "horizontale" ? gabaritHorizontale(infini.limiteMoinsInfini) : infini.type === "oblique" ? gabaritOblique(infini.pente, infini.ordonnee) : gabaritAucune(infini.signeMoinsInfini, xRefGauche);
  const gabaritInfiniDroit: Gabarit =
    infini.type === "horizontale" ? gabaritHorizontale(infini.limitePlusInfini) : infini.type === "oblique" ? gabaritOblique(infini.pente, infini.ordonnee) : gabaritAucune(infini.signePlusInfini, xRefDroit);

  const pieces: PieceCourbe[] = [];
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

export function evaluerPieceMelangee(piece: PieceCourbe, loRendu: number, hiRendu: number, x: number): number {
  const largeur = Math.max(hiRendu - loRendu, 1e-6);
  const t = (x - loRendu) / largeur;
  const poidsGauche = 1 / (1 + Math.exp(ALPHA_BLEND * (t - 0.5)));
  return poidsGauche * piece.gabaritGauche(x) + (1 - poidsGauche) * piece.gabaritDroit(x);
}

export interface SegmentCourbe {
  domaine: [number, number];
  evaluer: (x: number) => number;
}

const MARGE_X_BORNES = 4;
const DEMI_LARGEUR_X_MIN_BORNES = 5;

/** Bornes X FIXES (ne dépendent que des positions d'AV, jamais du viewport) — même formule que
 * `calculerViewBoxLectureGraphique` ci-dessous (extraite ici pour être réutilisable par
 * `construireSegments`, voir son en-tête pour pourquoi cette distinction compte). */
export function calculerBornesXLimites(exercice: ExerciceLectureGraphiqueLimites): [number, number] {
  const positions = exercice.vas.map((va) => va.position);
  const xEtendueMin = Math.min(0, ...positions) - MARGE_X_BORNES;
  const xEtendueMax = Math.max(0, ...positions) + MARGE_X_BORNES;
  const demiLargeur = Math.max(DEMI_LARGEUR_X_MIN_BORNES, (xEtendueMax - xEtendueMin) / 2);
  const centreX = (xEtendueMin + xEtendueMax) / 2;
  return [centreX - demiLargeur, centreX + demiLargeur];
}

/**
 * Un `Plot.OfX domain=...` par morceau — `xMin`/`xMax` REÇUS (réactifs au zoom/pan,
 * `domaineVisibleX`) servent UNIQUEMENT à borner ce `domaine` (où arrêter visuellement le tracé,
 * remplaçant les bords −∞/+∞) et de référence "encore dans le cadre" pour `xBordVisibleY`
 * ci-dessous, buffer `BUFFER_VA` exclu de chaque côté d'une AV.
 *
 * **Jamais pour `evaluerPieceMelangee`** (bug trouvé et corrigé sur la copie sœur de ce fichier,
 * `ui5e/lectureGraphiqueDeriveesCourbe.ts`/5gen30, voir son en-tête pour le diagnostic complet) :
 * pour un morceau sans AV d'un côté (`loVA`/`hiVA===null`), ce côté du mélange sigmoïde
 * (`evaluerPieceMelangee`) utilisait DIRECTEMENT `xMin`/`xMax` comme bord — la largeur et donc le
 * poids du mélange à un x donné changeaient ainsi à chaque frame de pan/zoom, redéformant la courbe
 * TRACÉE en continu (pas seulement sa troncature), même une fois le domaine de `Plot.OfX` stabilisé
 * (`ui/mafsTransformation.ts`). `loRendu`/`hiRendu` passés à `evaluerPieceMelangee` utilisent
 * désormais TOUJOURS `calculerBornesXLimites(exercice)` (bornes FIXES) — jamais `xMin`/`xMax` reçus,
 * réservés à la troncature `Plot.OfX` (`domaine`) et à la bissection ci-dessous.
 *
 * `visibleY` : `promptauditcourbesmafszoomy.md` (addendum, prolongement en Y près d'une AV) — le
 * bord `BUFFER_VA` (0,35, unités d'axe x) restait pertinent pour ne jamais échantillonner le pôle
 * lui-même, mais à un zoom suffisamment poussé sur la région proche d'une AV, cette distance ABSOLUE
 * laissait la branche s'arrêter à un y bien en-deçà du bord du cadre (voire un domaine vide/inversé).
 * `xBordVisibleY` (`ui/mafsTransformation.ts`) retrouve à la place, par bissection SUR LE GABARIT
 * DIVERGENT SEUL (`piece.gabaritGauche`/`gabaritDroit`, jamais `evaluerPieceMelangee` — celui-ci
 * dépend lui-même de `loRendu`/`hiRendu`, une dépendance circulaire ; tout près d'une AV le mélange
 * favorise de toute façon déjà quasi exclusivement ce même gabarit, l'approximation reste donc fidèle
 * au pixel près), le point où la branche atteint réellement le bord visible en y. Seul le côté d'une
 * pièce RÉELLEMENT divergent (`pointIsoleGauche`/`pointIsoleDroit` du morceau voisin absent — un
 * point de continuité fini n'a, lui, jamais besoin d'être prolongé) est concerné ; `xMax`/`xMin`
 * (l'autre bord de la fenêtre visible, toujours un point valide où évaluer un gabarit 1/(x-a) — sa
 * magnitude n'y explose jamais) servent de référence "encore dans le cadre" à la bissection, jamais
 * l'autre bord DE CE MÊME morceau (potentiellement lui aussi en cours de résolution). Garde
 * `xMax > piece.loVA`/`xMin < piece.hiVA` : n'applique la bissection que si ce bord de la fenêtre
 * visible est bien du bon côté du pôle — sinon (morceau hors-champ dans cette direction) conserve le
 * bord `BUFFER_VA` fixe, sans conséquence visuelle puisque rien de ce côté n'est de toute façon
 * affiché.
 */
export function construireSegments(exercice: ExerciceLectureGraphiqueLimites, xMin: number, xMax: number, visibleY: [number, number]): SegmentCourbe[] {
  const [xMinFixe, xMaxFixe] = calculerBornesXLimites(exercice);
  return construirePieces(exercice).map((piece, i) => {
    let loRendu = piece.loVA === null ? xMin : piece.loVA + BUFFER_VA;
    let hiRendu = piece.hiVA === null ? xMax : piece.hiVA - BUFFER_VA;

    if (piece.loVA !== null && exercice.vas[i - 1].pointIsoleDroit === undefined && xMax > piece.loVA) {
      loRendu = xBordVisibleY(piece.gabaritGauche, piece.loVA, xMax, visibleY);
    }
    if (piece.hiVA !== null && exercice.vas[i].pointIsoleGauche === undefined && xMin < piece.hiVA) {
      hiRendu = xBordVisibleY(piece.gabaritDroit, piece.hiVA, xMin, visibleY);
    }

    const loRenduFixe = piece.loVA === null ? xMinFixe : piece.loVA + BUFFER_VA;
    const hiRenduFixe = piece.hiVA === null ? xMaxFixe : piece.hiVA - BUFFER_VA;
    return { domaine: [loRendu, hiRendu], evaluer: (x: number) => evaluerPieceMelangee(piece, loRenduFixe, hiRenduFixe, x) };
  });
}

export interface MarqueurPointIsole {
  x: number;
  y: number;
}

/** Un point PLEIN par côté en continuité (f(a)=valeur RÉELLEMENT défini, contrairement au reste du
 * domaine où x=position d'une AV est toujours exclu). */
export function construireMarqueursPointIsole(exercice: ExerciceLectureGraphiqueLimites): MarqueurPointIsole[] {
  const marqueurs: MarqueurPointIsole[] = [];
  for (const va of exercice.vas) {
    if (va.pointIsoleGauche !== undefined) marqueurs.push({ x: va.position, y: va.pointIsoleGauche });
    if (va.pointIsoleDroit !== undefined) marqueurs.push({ x: va.position, y: va.pointIsoleDroit });
  }
  return marqueurs;
}

const DEMI_HAUTEUR_Y_DEFAUT = 6;

/** ViewBox par défaut — étendue en x pour englober toutes les AV avec marge (`calculerBornesXLimites`
 * ci-dessus, mêmes bornes que celles utilisées comme référence fixe par `construireSegments`),
 * étendue en y pour englober toutes les valeurs notables (point isolé, AH, AO aux bords) avec marge ;
 * la divergence près d'une AV dépasse TOUJOURS cette étendue par construction (K_VA/BUFFER_VA ≈
 * 8.6), donnant le rendu visuel attendu d'une courbe "sortant" du cadre. */
export function calculerViewBoxLectureGraphique(exercice: ExerciceLectureGraphiqueLimites): { x: [number, number]; y: [number, number] } {
  const [xMin, xMax] = calculerBornesXLimites(exercice);

  const valeursNotables: number[] = [];
  for (const va of exercice.vas) {
    if (va.pointIsoleGauche !== undefined) valeursNotables.push(va.pointIsoleGauche);
    if (va.pointIsoleDroit !== undefined) valeursNotables.push(va.pointIsoleDroit);
  }
  const { infini } = exercice;
  if (infini.type === "horizontale") {
    valeursNotables.push(infini.limitePlusInfini, infini.limiteMoinsInfini);
  } else if (infini.type === "oblique") {
    valeursNotables.push(infini.pente * xMin + infini.ordonnee, infini.pente * xMax + infini.ordonnee);
  }

  let yMax = DEMI_HAUTEUR_Y_DEFAUT;
  let yMin = -DEMI_HAUTEUR_Y_DEFAUT;
  for (const v of valeursNotables) {
    yMax = Math.max(yMax, v + 2);
    yMin = Math.min(yMin, v - 2);
  }
  return { x: [xMin, xMax], y: [yMin, yMax] };
}

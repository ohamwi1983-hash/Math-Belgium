/**
 * Géométrie propre à l'aide de l'écran "Signes" (promptcorrectionsgenerateur14aides.md, section 8 ;
 * promptcorrectionsgenerateur14lot2.md, section 4 ; promptcorrectionbugtangentegen14v3.md) :
 * projections de cos(θ) sur l'axe X, sin(θ) sur l'axe Y, et tan(θ) sur la droite tangente au cercle
 * en (1,0) — verticale, puisque le rayon en θ=0° est horizontal. La projection tan(θ) est le point
 * d'intersection de la DROITE COMPLÈTE (pas seulement le rayon prolongé dans le même sens) passant
 * par le centre et le point de θ avec cette tangente — jamais une projection perpendiculaire comme
 * cos/sin (qui donnerait sin(θ), pas tan(θ)). `pointTan` est `null` quand tan(θ) n'existe pas
 * (cos(θ)=0, quadrant axeOy) — jamais une valeur infinie affichée.
 *
 * **Round 6 (v3) — sens du prolongement.** La droite complète passant par le centre et le point de
 * θ n'atteint la tangente `x=1` dans le même sens que le rayon (en s'éloignant du centre depuis le
 * point de θ) que si `cos(θ)>0` (quadrants I/IV). Si `cos(θ)<0` (quadrants II/III), le point
 * `(1,tanθ)` se trouve du côté OPPOSÉ au point de θ par rapport au centre — le pointillé doit donc
 * traverser le centre avant de rejoindre la tangente de l'autre côté. La droite est paramétrée par
 * `point(t) = centre + t·(pointCercle-centre)` (`t=1` au point de θ, `t=0` au centre) : le
 * paramètre `t` où `x(t)=xTangente` vaut `1/cos(θ)`, négatif exactement quand `cos(θ)<0` — donc
 * *dans la même formule*, sans branchement par quadrant, ce paramètre franchit naturellement `t=0`
 * (le centre) avant d'atteindre la tangente pour ces deux quadrants.
 *
 * **Bord du cadre.** Si le point ainsi obtenu tombe hors des limites verticales visibles du cadre
 * (`[MARGE_BORD_TAN, HAUTEUR_CERCLE_TRIG-MARGE_BORD_TAN]`), le point retenu n'est plus l'intersection
 * avec `x=xTangente` mais l'intersection de cette MÊME droite avec le bord horizontal du cadre
 * (`y=MARGE_BORD_TAN` ou `y=HAUTEUR_CERCLE_TRIG-MARGE_BORD_TAN`, selon le côté dépassé) — le point
 * reste donc toujours exactement sur la droite réelle (jamais un simple clamp de la coordonnée Y à
 * `x` fixé, qui casserait la colinéarité avec le centre pour les cas `cos(θ)<0` et introduirait un
 * écart pouvant atteindre plusieurs dizaines de pixels par rapport au centre réel) ; sa coordonnée
 * `x` n'est alors plus nécessairement `xTangente` — c'est la conséquence directe et assumée de
 * "prolonger jusqu'au bord du cadre" quand l'intersection réelle est hors champ, jamais un
 * compromis qui viendrait fausser la position par ailleurs.
 *
 * **Round 7 — marqueur masqué en cas de troncature.** Le pointillé rose s'étend toujours jusqu'au
 * bord du cadre dans le cas tronqué (round 6, ci-dessus), mais le point plein qui matérialise
 * l'intersection `(1,tanθ)` ne doit être affiché que si cette intersection réelle est effectivement
 * VISIBLE dans le cadre — un marqueur à l'endroit d'une simple troncature suggérerait à tort que
 * `(1,tanθ)` s'y trouve. `pointTanVisible` distingue les deux cas (`true` ssi non tronqué) ;
 * `pointTan` lui-même reste inchangé dans les deux cas (toujours l'extrémité correcte du pointillé,
 * tronqué ou non), pour que le tracé de la ligne n'ait jamais besoin de connaître cette distinction.
 */
import { CENTRE_CERCLE_TRIG, HAUTEUR_CERCLE_TRIG, RAYON_CERCLE_TRIG, pointSurCercle } from "./cercleTrigGeometrie";
import type { PointCroquisCercleTrig } from "./cercleTrigGeometrie";

export interface AideSignes {
  pointCercle: PointCroquisCercleTrig;
  pointCos: PointCroquisCercleTrig;
  pointSin: PointCroquisCercleTrig;
  /** `null` ssi tan(θ) n'existe pas (cos(θ)=0). Extrémité du pointillé rose — l'intersection réelle
   * `(1,tanθ)` si elle est visible, sinon le point où la droite sort du cadre (round 6). */
  pointTan: PointCroquisCercleTrig | null;
  /** `true` ssi `pointTan` est l'intersection réelle `(1,tanθ)`, effectivement visible dans le
   * cadre — `false` si `pointTan` n'est qu'une troncature au bord (auquel cas le marqueur plein ne
   * doit pas être affiché, round 7) ; sans objet (`false`) si `pointTan` est `null`. */
  pointTanVisible: boolean;
}

/** Marge de sécurité pour que le point tan(θ), tronqué au bord du cadre, y reste visuellement
 * (jamais collé pile au bord). Bornes verticales réelles du cadre dans lesquelles le point doit
 * rester — représentation schématique, jamais à l'échelle réelle près de l'asymptote (même principe
 * que les autres croquis SVG du projet). */
const MARGE_BORD_TAN = 8;
const Y_MIN_CADRE = MARGE_BORD_TAN;
const Y_MAX_CADRE = HAUTEUR_CERCLE_TRIG - MARGE_BORD_TAN;
const EPSILON_COS_NUL = 1e-9;
const X_TANGENTE = CENTRE_CERCLE_TRIG.x + RAYON_CERCLE_TRIG;

export function calculerAideSignes(angleReduit: number): AideSignes {
  const pointCercle = pointSurCercle(angleReduit, RAYON_CERCLE_TRIG);
  const pointCos: PointCroquisCercleTrig = { x: pointCercle.x, y: CENTRE_CERCLE_TRIG.y };
  const pointSin: PointCroquisCercleTrig = { x: CENTRE_CERCLE_TRIG.x, y: pointCercle.y };

  const rad = (angleReduit * Math.PI) / 180;
  const cos = Math.cos(rad);

  // Vecteur du centre vers le point de θ : point(t) = centre + t·(vx,vy), point(1) = pointCercle.
  const vx = pointCercle.x - CENTRE_CERCLE_TRIG.x;
  const vy = pointCercle.y - CENTRE_CERCLE_TRIG.y;

  let pointTan: PointCroquisCercleTrig | null = null;
  let pointTanVisible = false;
  if (Math.abs(cos) > EPSILON_COS_NUL) {
    const tCible = RAYON_CERCLE_TRIG / vx; // x(tCible) = xTangente, quel que soit le signe de cos(θ)
    const yCible = CENTRE_CERCLE_TRIG.y + tCible * vy;

    if (yCible >= Y_MIN_CADRE && yCible <= Y_MAX_CADRE) {
      pointTan = { x: X_TANGENTE, y: yCible };
      pointTanVisible = true;
    } else {
      // Hors cadre verticalement : tronquer au bord réel plutôt qu'à x fixe — le point reste
      // exactement sur la droite (centre, pointCercle), donc toujours cohérent avec le tracé
      // "passe par le centre" pour cos(θ)<0. Simple troncature, pas l'intersection réelle : le
      // marqueur plein ne doit pas être affiché à cet endroit (round 7).
      const yBord = yCible < Y_MIN_CADRE ? Y_MIN_CADRE : Y_MAX_CADRE;
      const tBord = (yBord - CENTRE_CERCLE_TRIG.y) / vy;
      pointTan = { x: CENTRE_CERCLE_TRIG.x + tBord * vx, y: yBord };
    }
  }

  return { pointCercle, pointCos, pointSin, pointTan, pointTanVisible };
}

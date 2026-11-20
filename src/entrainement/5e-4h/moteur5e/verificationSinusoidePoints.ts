import { egal, sub, val, type Rat } from "./trigExact";
import { egaux, egauxModulo, estApprochee, lireNombreTrig, type DiagnosticSaisie, type LectureNombre } from "./saisieTrig";
import { Phi, T, cadre, memePoint, pointCle, pointsPeriode, pointsReport, quart, xColonne, type ExerciceSinusoidePoints, type PointPlace } from "./modeleSinusoidePoints";
import {
  MSG_AUTRE_PERIODE,
  MSG_A_SIGNE,
  MSG_B_SIGNE,
  MSG_DEPART,
  MSG_ORDONNEES,
  MSG_ORDRE_NEG,
  MSG_ORDRE_POS,
  MSG_PAS,
  MSG_PAS_SUR_COURBE,
  MSG_PHI_PHI,
  MSG_PHI_SIGNE,
  MSG_T_DEMI,
  MSG_T_OMEGA,
  MSG_T_PRODUIT,
} from "../ui5e/formatSinusoidePoints";

/**
 * Vérification de 5gen52. Écran 1 : A, b, T, Φ (champs libres jamais filtrés ; Φ juste à une période
 * près, toute écriture exacte acceptée ; illisible ou approché jamais compté). Écrans 2 et 3 : points
 * placés sur les intersections du quadrillage, comparés aux points clés EXACTS (rationnels).
 */

type E = ExerciceSinusoidePoints;

/** Valeur réelle d'une abscisse exacte (·π si `enPi`). */
function reel(e: E, x: Rat): number {
  return e.enPi ? val(x) * Math.PI : val(x);
}

export function diagnostiquerParametres(e: E, valeurs: string[]): DiagnosticSaisie {
  const lus = valeurs.map((v) => lireNombreTrig(v));
  if (lus.some((x) => !x)) return { statut: "illisible" };
  const [a, b, tt, ph] = lus as LectureNombre[];
  const Tv = reel(e, T(e));
  const Pv = reel(e, Phi(e));
  const ok = [egaux(a!.valeur, e.A), egaux(b!.valeur, e.b), egaux(tt!.valeur, Tv), egauxModulo(ph!.valeur, Pv, Tv)];
  if (ok.every(Boolean)) return { statut: "correct" };
  const proches = [estApprochee(tt!, Tv), (() => { const k = Math.round((ph!.valeur - Pv) / Tv); return estApprochee(ph!, Pv + k * Tv); })()];
  if ((!ok[2] && proches[0]) || (!ok[3] && proches[1])) return { statut: "approchee" };
  const champsFaux = ok.map((x, i) => (x ? -1 : i)).filter((i) => i >= 0);
  const w = e.enPi ? val(e.omega) : val(e.omega) * Math.PI;
  const phiReel = val(e.phi) * Math.PI;
  let message = null;
  if (!ok[2] && egaux(tt!.valeur, w)) message = MSG_T_OMEGA;
  else if (!ok[2] && egaux(tt!.valeur, 2 * Math.PI * w)) message = MSG_T_PRODUIT;
  else if (!ok[2] && egaux(tt!.valeur, Math.PI / w)) message = MSG_T_DEMI;
  else if (!ok[3] && egauxModulo(ph!.valeur, phiReel, Tv)) message = MSG_PHI_PHI;
  else if (!ok[3] && egauxModulo(ph!.valeur, -Pv, Tv)) message = MSG_PHI_SIGNE;
  else if (!ok[0] && egaux(a!.valeur, -e.A)) message = MSG_A_SIGNE;
  else if (!ok[1] && egaux(b!.valeur, -e.b)) message = MSG_B_SIGNE;
  return { statut: "faux", champsFaux, message };
}

/** L'abscisse d'une colonne est-elle celle d'un point clé, et à quel indice j ? */
function indiceCle(e: E, p: PointPlace): number | null {
  const c = cadre(e);
  const x = xColonne(c, p.i);
  const j = val(sub(x, Phi(e))) / val(quart(e));
  if (Math.abs(j - Math.round(j)) > 1e-9) return null;
  const jj = Math.round(j);
  return pointCle(e, jj).y === p.y ? jj : null;
}

export function diagnostiquerPeriode(e: E, points: PointPlace[]): DiagnosticSaisie {
  const c = cadre(e);
  const attendus = pointsPeriode(e);
  const faux = points.map((p, k) => (attendus.some((q) => memePoint(c, p, q)) ? -1 : k)).filter((k) => k >= 0);
  if (faux.length === 0) return { statut: "correct" };
  // Cinq points clés consécutifs, mais pas la période qui commence en Φ : non compté.
  const js = points.map((p) => indiceCle(e, p));
  if (js.every((j) => j !== null)) {
    const tri = [...(js as number[])].sort((x, y) => x - y);
    if (tri.every((j, k) => j === tri[0]! + k)) return { statut: "nonCompte", message: MSG_AUTRE_PERIODE };
  }
  const xs = points.map((p) => xColonne(c, p.i)).sort((u, v) => val(u) - val(v));
  const memesAbscisses = attendus.every((q) => xs.some((x) => egal(x, q.x))) && xs.length === attendus.length;
  if (memesAbscisses) {
    const inverse = points.every((p) => {
      const q = attendus.find((a) => egal(a.x, xColonne(c, p.i)))!;
      return p.y === 2 * e.b - q.y;
    });
    return { statut: "faux", champsFaux: faux, message: inverse ? (e.A < 0 ? MSG_ORDRE_NEG : MSG_ORDRE_POS) : MSG_ORDONNEES };
  }
  const pas = xs.length > 1 ? sub(xs[1]!, xs[0]!) : null;
  const regulier = pas !== null && xs.every((x, k) => k === 0 || egal(sub(x, xs[k - 1]!), pas));
  if (regulier && egal(pas!, quart(e)) && !egal(xs[0]!, Phi(e))) return { statut: "faux", champsFaux: faux, message: MSG_DEPART };
  if (regulier && !egal(pas!, quart(e))) return { statut: "faux", champsFaux: faux, message: MSG_PAS };
  return { statut: "faux", champsFaux: faux, message: null };
}

export function diagnostiquerReport(e: E, points: PointPlace[]): DiagnosticSaisie {
  const c = cadre(e);
  const attendus = pointsReport(e);
  const faux = points.map((p, k) => (attendus.some((q) => memePoint(c, p, q)) ? -1 : k)).filter((k) => k >= 0);
  if (faux.length === 0) return { statut: "correct" };
  const horsCourbe = points.some((p) => indiceCle(e, p) === null);
  return { statut: "faux", champsFaux: faux, message: horsCourbe ? MSG_PAS_SUR_COURBE : null };
}

/** Points de la période (écran 3 : affichés, non cliquables). */
export function estPointPeriode(e: E, p: PointPlace): boolean {
  const c = cadre(e);
  return pointsPeriode(e).some((q) => memePoint(c, p, q));
}


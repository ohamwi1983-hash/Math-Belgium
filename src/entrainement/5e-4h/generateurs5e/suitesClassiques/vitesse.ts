import type { ExerciceVitesse } from "../../core5e/suitesClassiques.types";
import { sommeArithmetique, termeArithmetique } from "../suitesArithmetiques/parametres";

const KMH_PAR_MS = 3.6;

/** Scénario 4 — "à toute allure" (distance parcourue chaque seconde, en progression arithmétique).
 *
 * 3 méthodes d'estimation de la vitesse finale à t=11s :
 *  - Méthode 1 (naïve) : la dernière distance parcourue (sur 1s) EST la vitesse — u_11×3,6.
 *  - Méthode 2 (v=at+v0, en négligeant v0) : a×t×3,6, avec a=r (l'accélération = la raison).
 *  - Méthode 3 (rigoureuse) : e(t) = (r/2)t²+(u1-r/2)t est le prolongement CONTINU de Sn(t) (la
 *    somme des n premiers termes vue comme fonction de t réel) — sa dérivée v(t)=e'(t)=r·t+(u1-r/2)
 *    donne la VRAIE vitesse instantanée à t=11.
 */
export function construireVitesse(): ExerciceVitesse {
  const u1 = 1.2;
  const r = 1.5;
  const distance11 = termeArithmetique(u1, r, 11);
  const sommeTotale11 = sommeArithmetique(u1, r, 11);
  const vitesseMethode1KmH = distance11 * KMH_PAR_MS;
  const vitesseMethode2KmH = r * 11 * KMH_PAR_MS;
  const vDeT = (t: number) => r * t + (u1 - r / 2);
  const vitesseMethode3KmH = vDeT(11) * KMH_PAR_MS;
  return { scenario: "vitesse", u1, r, distance11, sommeTotale11, vitesseMethode1KmH, vitesseMethode2KmH, vitesseMethode3KmH };
}

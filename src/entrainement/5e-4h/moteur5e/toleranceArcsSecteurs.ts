/**
 * Couche B (5e) — tolérance de 5gen6 ("Arcs et secteurs"), mode "deuxVersTrois".
 *
 * La consigne demande d'arrondir au centième. Un élève qui réutilise une valeur ARRONDIE (trouvée à
 * un écran précédent, ou une donnée kπ/n qu'il a convertie en décimal) obtient un résultat qui
 * s'écarte de la valeur exacte de plus de 0,01 : A = ½r²θ multiplie l'erreur sur θ par ½r²
 * (jusqu'à 50). Avec la tolérance fixe ±0,01 (`verificationArcsSecteurs.ts`, partagée par d'autres
 * générateurs, inchangée), une démarche correcte était refusée dans 39 % des exercices (audit 5e
 * ch. 2, point 10).
 *
 * Ici, la tolérance de chaque écran = 0,01 + le plus grand écart que l'arrondi au centième des
 * valeurs utilisables à cet écran peut produire, quelle que soit la paire de valeurs dont l'élève
 * part (calcul exact de la propagation, pas une marge forfaitaire). Les erreurs de méthode (degrés
 * au lieu de radians, ½ oublié, r au lieu de r²…) restent refusées : vérifié par script sur des
 * dizaines de milliers de tirages.
 */
import type { ExerciceModeDeuxVersTrois, QuantiteArcSecteur, ValeursArcSecteur } from "../core5e/arcsSecteurs.types";
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import type { StatutVerification } from "../moteur/statutVerification";
import { quantitesManquantes } from "./typesArcsSecteurs";

export const TOLERANCE_BASE_ARC_SECTEUR = 0.01;
const DEMI_CENTIEME = 0.005;

/** Les 5 quantités à partir de 2 d'entre elles (`null` pour {θ°, θ_rad}, qui ne suffit pas). */
export function valeursDepuisPaire(qa: QuantiteArcSecteur, va: number, qb: QuantiteArcSecteur, vb: number): ValeursArcSecteur | null {
  const valeur = (q: QuantiteArcSecteur) => (q === qa ? va : q === qb ? vb : undefined);
  const has = (q: QuantiteArcSecteur) => qa === q || qb === q;
  let theta: number;
  let r: number;
  if (has("thetaDeg") || has("thetaRad")) {
    if (has("thetaDeg") && has("thetaRad")) return null;
    theta = has("thetaRad") ? (valeur("thetaRad") as number) : ((valeur("thetaDeg") as number) * Math.PI) / 180;
    if (has("r")) r = valeur("r") as number;
    else if (has("l")) r = (valeur("l") as number) / theta;
    else r = Math.sqrt((2 * (valeur("A") as number)) / theta);
  } else if (has("r") && has("l")) {
    r = valeur("r") as number;
    theta = (valeur("l") as number) / r;
  } else if (has("r") && has("A")) {
    r = valeur("r") as number;
    theta = (2 * (valeur("A") as number)) / (r * r);
  } else {
    const l = valeur("l") as number;
    const A = valeur("A") as number;
    r = (2 * A) / l;
    theta = l / r;
  }
  return { thetaDeg: (theta * 180) / Math.PI, thetaRad: theta, r, l: r * theta, A: 0.5 * r * r * theta };
}

/** Quantités que l'élève a à sa disposition à l'écran de `quantite` : les 2 données et les
 * quantités trouvées aux écrans précédents. */
function disponiblesAvant(exercice: ExerciceModeDeuxVersTrois, quantite: QuantiteArcSecteur): QuantiteArcSecteur[] {
  const ordre = quantitesManquantes(exercice);
  return [...exercice.connues, ...ordre.slice(0, ordre.indexOf(quantite))];
}

/** Tolérance de l'écran de `quantite` (voir l'en-tête du fichier). Une valeur entière (r, θ° multiple
 * de 5) est supposée recopiée telle quelle ; toute autre valeur peut avoir été arrondie au
 * centième. */
export function toleranceQuantiteArcSecteur(exercice: ExerciceModeDeuxVersTrois, quantite: QuantiteArcSecteur): number {
  const v = exercice.valeurs;
  const dispo = disponiblesAvant(exercice, quantite);
  const exacte = v[quantite];
  let ecartMax = 0;
  for (let i = 0; i < dispo.length; i++) {
    for (let j = i + 1; j < dispo.length; j++) {
      const qa = dispo[i];
      const qb = dispo[j];
      const marge = (q: QuantiteArcSecteur) => (Number.isInteger(Math.round(v[q] * 1e9) / 1e9) ? 0 : DEMI_CENTIEME);
      for (const sa of [-1, 1]) {
        for (const sb of [-1, 1]) {
          const valeurs = valeursDepuisPaire(qa, v[qa] + sa * marge(qa), qb, v[qb] + sb * marge(qb));
          if (valeurs === null) continue;
          const ecart = Math.abs(valeurs[quantite] - exacte);
          if (Number.isFinite(ecart)) ecartMax = Math.max(ecartMax, ecart);
        }
      }
    }
  }
  return TOLERANCE_BASE_ARC_SECTEUR + ecartMax;
}

export function diagnostiquerQuantiteArcSecteur(texte: string, exercice: ExerciceModeDeuxVersTrois, quantite: QuantiteArcSecteur): StatutVerification {
  try {
    const valeur = evaluerExpressionGenerale(texte, 0);
    if (!Number.isFinite(valeur)) return "parse_error";
    return Math.abs(valeur - exercice.valeurs[quantite]) <= toleranceQuantiteArcSecteur(exercice, quantite) ? "correct" : "not_equivalent";
  } catch {
    return "parse_error";
  }
}

import { cosinus, quadrant, sinus, tangente, type ExerciceAnglesRadians, type Quadrant } from "./modeleAnglesRadians";
import { egaux, egauxModulo, estApprochee, estNexistePas, lireNombreTrig, type DiagnosticSaisie } from "./saisieTrig";
import { val } from "./trigExact";
import { MSG_DEGRES, MSG_DEMI_TOUR, MSG_ECHANGE, MSG_HORS_INTERVALLE, MSG_TAN_EXISTE, MSG_TAN_INEXISTANTE, MSG_TAN_INVERSE, messageSigne } from "../ui5e/formatAnglesRadians";

/**
 * Vérification de 5gen51. Champs libres jamais filtrés, lus après coup (`saisieTrig.ts`) ; une saisie
 * illisible, approchée (valeur exacte demandée) ou juste mais hors de [0 ; 2π[ (écran 1) n'est jamais
 * comptée. Messages ciblés : demi-tour au lieu d'un tour, degrés, cos et sin échangés, signe faux,
 * tangente inversée, tangente qui existe / n'existe pas.
 */

const DEUX_PI = 2 * Math.PI;

export function diagnostiquerReduction(e: ExerciceAnglesRadians, texte: string): DiagnosticSaisie {
  const lu = lireNombreTrig(texte);
  if (!lu) return { statut: "illisible" };
  const r = val(e.reduit) * Math.PI;
  if (egaux(lu.valeur, r)) return { statut: "correct" };
  if (estApprochee(lu, r)) return { statut: "approchee" };
  if (egauxModulo(lu.valeur, r, DEUX_PI)) return { statut: "nonCompte", message: MSG_HORS_INTERVALLE };
  if (egauxModulo(lu.valeur, r + Math.PI, DEUX_PI)) return { statut: "faux", message: MSG_DEMI_TOUR };
  if (!/π|pi/i.test(texte) && egaux(lu.valeur, val(e.reduit) * 180)) return { statut: "faux", message: MSG_DEGRES };
  return { statut: "faux", message: null };
}

export function verifierQuadrant(e: ExerciceAnglesRadians, q: Quadrant): boolean {
  return q === quadrant(e);
}

export function diagnostiquerCosSin(e: ExerciceAnglesRadians, valeurs: string[]): DiagnosticSaisie {
  const lus = valeurs.map((v) => lireNombreTrig(v));
  if (lus.some((x) => !x)) return { statut: "illisible" };
  const [c, s] = lus as [NonNullable<(typeof lus)[0]>, NonNullable<(typeof lus)[0]>];
  const co = cosinus(e).valeur;
  const si = sinus(e).valeur;
  const okC = egaux(c.valeur, co);
  const okS = egaux(s.valeur, si);
  if (okC && okS) return { statut: "correct" };
  if ((!okC && estApprochee(c, co)) || (!okS && estApprochee(s, si))) return { statut: "approchee" };
  const champsFaux = [okC ? -1 : 0, okS ? -1 : 1].filter((i) => i >= 0);
  if (!egaux(co, si) && egaux(c.valeur, si) && egaux(s.valeur, co)) return { statut: "faux", champsFaux, message: MSG_ECHANGE };
  const signeFaux = (!okC && egaux(Math.abs(c.valeur), Math.abs(co))) || (!okS && egaux(Math.abs(s.valeur), Math.abs(si)));
  if (signeFaux) return { statut: "faux", champsFaux, message: messageSigne(e) };
  return { statut: "faux", champsFaux, message: null };
}

export function diagnostiquerTangente(e: ExerciceAnglesRadians, texte: string): DiagnosticSaisie {
  const tg = tangente(e);
  if (estNexistePas(texte)) return tg ? { statut: "faux", message: MSG_TAN_EXISTE } : { statut: "correct" };
  const lu = lireNombreTrig(texte);
  if (!lu) return { statut: "illisible", message: "Écriture non reconnue : écris une valeur exacte (par exemple −√3/3) ou utilise le bouton « n'existe pas ». Cette saisie ne compte pas comme une tentative." };
  if (!tg) return { statut: "faux", message: MSG_TAN_INEXISTANTE };
  if (egaux(lu.valeur, tg.valeur)) return { statut: "correct" };
  if (estApprochee(lu, tg.valeur)) return { statut: "approchee" };
  const s = sinus(e).valeur;
  if (s !== 0 && egaux(lu.valeur, cosinus(e).valeur / s) && !egaux(tg.valeur, cosinus(e).valeur / s)) return { statut: "faux", message: MSG_TAN_INVERSE };
  if (egaux(Math.abs(lu.valeur), Math.abs(tg.valeur))) return { statut: "faux", message: messageSigne(e) };
  return { statut: "faux", message: null };
}

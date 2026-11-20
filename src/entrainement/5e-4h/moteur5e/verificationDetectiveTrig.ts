import type { ExerciceDetectiveTrig, IdDescriptionTrig, ResultatDetectiveTrig } from "../core5e/detectiveTrig.types";
import { descriptionCorrecte, indiceLigneFausse, resultat } from "./modeleDetectiveTrig";
import { egaux, egauxModulo, estApprochee, lireListeTrig, lireNombreTrig, type DiagnosticSaisie, type LectureNombre } from "./saisieTrig";
import { messageEnsemble, messageHorsIntervalle, messageMinimum, messageResultatCopie } from "../ui5e/formatDetectiveTrig";
import { val } from "./trigExact";

/**
 * Vérification de 5gen50. Écrans 1 et 2 : choix fermés. Écran 3 : résultat final dans un champ libre
 * (jamais filtré), lu après coup (`saisieTrig.ts`) :
 * - aire : valeur EXACTE (6π, 25π/4…) ; une valeur décimale proche est « approchée » (non comptée) ;
 * - abscisse d'un maximum : toute abscisse x telle que f(x) = max est juste (à une période près) ;
 * - ensemble : toutes les solutions de [0 ; 2π[, dans n'importe quel ordre ; une solution écrite hors
 *   de [0 ; 2π[ est signalée sans compter de tentative.
 */

export function verifierLigne(e: ExerciceDetectiveTrig, indice: number): boolean {
  return indice === indiceLigneFausse(e);
}

export function verifierDescription(e: ExerciceDetectiveTrig, choix: IdDescriptionTrig): boolean {
  return choix === descriptionCorrecte(e);
}

const DEUX_PI = 2 * Math.PI;

/** Valeur numérique d'un résultat « nombre » (aire, abscisse). */
function valeurResultat(r: ResultatDetectiveTrig): number {
  if (r.genre === "aire") return r.valeur;
  if (r.genre === "abscisse") return val(r.x) * Math.PI;
  return NaN;
}

function memeEnsemble(lus: number[], angles: number[]): boolean {
  if (lus.length !== angles.length) return false;
  return angles.every((a) => lus.some((v) => egaux(v, a))) && lus.every((v) => angles.some((a) => egaux(v, a)));
}

export function diagnostiquerCorrection(e: ExerciceDetectiveTrig, texte: string): DiagnosticSaisie {
  const juste = resultat(e);
  const copie = resultat(e, true);
  if (juste.genre === "ensemble" && copie.genre === "ensemble") {
    const lus = lireListeTrig(texte);
    if (!lus) return { statut: "illisible" };
    const angles = juste.angles.map((a) => val(a) * Math.PI);
    const valeurs = lus.map((x) => x.valeur);
    if (memeEnsemble(valeurs, angles)) return { statut: "correct" };
    // Valeurs approchées des bonnes solutions : non comptées.
    if (lus.some((x) => x.decimal) && lus.every((x) => angles.some((a) => egaux(x.valeur, a) || estApprochee(x, a)))) return { statut: "approchee" };
    // Bonne solution écrite hors de [0 ; 2π[ : non comptée.
    const horsIntervalle = valeurs.some((v) => (v < -1e-9 || v >= DEUX_PI - 1e-9) && angles.some((a) => egauxModulo(v, a, DEUX_PI)));
    const toutesSolutions = valeurs.every((v) => angles.some((a) => egauxModulo(v, a, DEUX_PI)));
    if (horsIntervalle && toutesSolutions) return { statut: "nonCompte", message: messageHorsIntervalle() };
    if (memeEnsemble(valeurs, copie.angles.map((a) => val(a) * Math.PI))) return { statut: "faux", message: messageResultatCopie(e) };
    const enTrop = valeurs.filter((v) => !angles.some((a) => egaux(v, a))).length;
    const manquantes = angles.filter((a) => !valeurs.some((v) => egaux(v, a))).length;
    return { statut: "faux", message: messageEnsemble(manquantes, enTrop) };
  }
  const lu: LectureNombre | null = lireNombreTrig(texte);
  if (!lu) return { statut: "illisible" };
  const attendu = valeurResultat(juste);
  if (juste.genre === "abscisse" && e.variante === "parametres") {
    const T = val(juste.periode) * Math.PI;
    if (egauxModulo(lu.valeur, attendu, T)) return { statut: "correct" };
    const k = Math.round((lu.valeur - attendu) / T);
    if (estApprochee(lu, attendu + k * T)) return { statut: "approchee" };
    if (egaux(lu.valeur, valeurResultat(copie))) return { statut: "faux", message: messageResultatCopie(e) };
    if (egauxModulo(lu.valeur, attendu + T / 2, T)) return { statut: "faux", message: messageMinimum() };
    return { statut: "faux", message: null };
  }
  if (egaux(lu.valeur, attendu)) return { statut: "correct" };
  if (estApprochee(lu, attendu)) return { statut: "approchee" };
  if (egaux(lu.valeur, valeurResultat(copie))) return { statut: "faux", message: messageResultatCopie(e) };
  return { statut: "faux", message: null };
}

/** La saisie reprend le résultat (faux) de la copie (tests). */
export function estResultatCopie(e: ExerciceDetectiveTrig, texte: string): boolean {
  const d = diagnostiquerCorrection(e, texte);
  return d.statut === "faux" && !!d.message && d.message.some((f) => f.valeur.startsWith("C'est le résultat de la copie"));
}

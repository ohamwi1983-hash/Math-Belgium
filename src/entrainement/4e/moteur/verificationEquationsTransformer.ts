import type { ExerciceEquationsTransformer } from "../core/equationsTransformer.types";
import type { StatutVerification } from "./statutVerification";
import { evaluerExpressionGenerale } from "./expressionGenerale";
import { normaliserRacinesUnSansLautre } from "./verificationUnSansLautre";
import { referenceAffichee } from "../ui/formatEquationsTransformer";
import { solutionsAvecTolerance, toleranceBase, valeurK } from "./modeleEquationsTransformer";
import { diagnostiquerExactNumerique } from "./saisieExacteTrigo";

/**
 * Vérification de gen78. Valeurs k : forme exacte (fraction, √) ou décimale au centième
 * (tolérance 0,005, comme gen16). Angles : 0,5° pour les angles remarquables, 0,1° au dixième.
 * Une saisie illisible rend `parse_error` (jamais une tentative consommée : c'est l'appli qui ne
 * l'envoie pas au moteur). Un mauvais VERDICT (pas de solution / au moins une) est signalé à part
 * (`verdictFaux`) : choix fermé, une seule tentative.
 */

const TOLERANCE_K = 0.005 + 1e-9;

export interface Diagnostic {
  statut: StatutVerification;
  verdictFaux: boolean;
  /** Décision 3 de l'utilisateur (audit 4e ch. 5) : une valeur de k décimale APPROCHÉE (« 0,87 »
   * pour √3/2) est refusée sans perte d'essai, comme une saisie illisible. */
  approchee?: boolean;
}

/** k saisi : forme exacte ou décimal exact (« 0,6 ») seulement. */
function kJuste(saisie: string, k: number): boolean {
  return diagnostiquerExactNumerique(saisie, k) === "correct";
}

/** Une des saisies est-elle une valeur approchée d'un k attendu ? */
function kApproche(saisies: string[], ks: number[]): boolean {
  return saisies.some((sa) => ks.some((k) => diagnostiquerExactNumerique(sa, k) === "approchee"));
}

/** Valeur numérique d'une saisie libre (fraction, racine « √ » ou « sqrt », virgule) ; `null` si illisible. */
export function lireNombre(saisie: string): number | null {
  if (saisie.trim() === "") return null;
  try {
    const v = evaluerExpressionGenerale(normaliserRacinesUnSansLautre(saisie.replace(/°/g, "")), 0);
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

/** Angle en degrés (« 30 », « 156,4 », « 30° ») ; `null` si illisible. */
export function lireAngle(saisie: string): number | null {
  const propre = saisie.replace(/°/g, "").replace(/\s+/g, "").replace(",", ".").replace(/[−–]/g, "-");
  if (propre === "") return null;
  const v = Number(propre);
  return Number.isFinite(v) ? v : null;
}

/** Comparaison en multi-ensemble, ordre indifférent, chaque valeur attendue avec sa tolérance. */
function memeMultiensemble(saisies: number[], attendues: { valeur: number; tolerance: number }[]): boolean {
  if (saisies.length !== attendues.length) return false;
  const restantes = [...attendues];
  for (const v of saisies) {
    const i = restantes.findIndex((a) => Math.abs(a.valeur - v) <= a.tolerance);
    if (i === -1) return false;
    restantes.splice(i, 1);
  }
  return true;
}

/** Écran « équation(s) de base ». `valeurs` : une par base (affine, produit), ou une liste libre (carré). */
export function diagnostiquerBases(e: ExerciceEquationsTransformer, aucune: boolean, valeurs: string[]): Diagnostic {
  const attenduAucune = e.bases.length === 0;
  if (aucune !== attenduAucune) return { statut: "not_equivalent", verdictFaux: true };
  if (aucune) return { statut: "correct", verdictFaux: false };
  const lus = valeurs.map(lireNombre);
  if (lus.some((v) => v === null)) return { statut: "parse_error", verdictFaux: false };
  const nombres = lus as number[];
  const ks = e.bases.map((b) => valeurK(b.k));
  if (kApproche(valeurs, ks)) return { statut: "parse_error", verdictFaux: false, approchee: true };
  if (e.forme.type === "carre") {
    // Une même valeur écrite deux fois (k = 0 : « 0 » et « −0 ») ne compte qu'une fois.
    const indices = nombres.map((_v, i) => i).filter((i) => nombres.findIndex((w) => Math.abs(w - nombres[i]!) <= TOLERANCE_K) === i);
    const restants = [...ks];
    const ok =
      indices.length === ks.length &&
      indices.every((i) => {
        const j = restants.findIndex((k) => kJuste(valeurs[i]!, k));
        if (j === -1) return false;
        restants.splice(j, 1);
        return true;
      });
    return { statut: ok ? "correct" : "not_equivalent", verdictFaux: false };
  }
  const ok = nombres.length === e.bases.length && valeurs.every((sa, i) => kJuste(sa, ks[i]!));
  return { statut: ok ? "correct" : "not_equivalent", verdictFaux: false };
}

/** Statut ligne par ligne (affine, produit) pour signaler quelle valeur est fausse. */
export function statutsLignesBases(e: ExerciceEquationsTransformer, valeurs: string[]): StatutVerification[] {
  return valeurs.map((s, i) => {
    const v = lireNombre(s);
    if (v === null) return "parse_error";
    const b = e.bases[i];
    return b && kJuste(s, valeurK(b.k)) ? "correct" : "not_equivalent";
  });
}

/** Écran « angle de référence » de la base `i`. */
export function diagnostiquerReference(e: ExerciceEquationsTransformer, i: number, aucune: boolean, saisie: string): Diagnostic {
  const b = e.bases[i]!;
  if (aucune !== (b.reference === null)) return { statut: "not_equivalent", verdictFaux: true };
  if (aucune) return { statut: "correct", verdictFaux: false };
  const v = lireAngle(saisie);
  if (v === null) return { statut: "parse_error", verdictFaux: false };
  const ok = Math.abs(v - (b.reference as number)) <= toleranceBase(b) || Math.abs(v - referenceAffichee(b)) <= toleranceBase(b);
  return { statut: ok ? "correct" : "not_equivalent", verdictFaux: false };
}

function diagnostiquerListe(saisies: string[], attendues: { valeur: number; tolerance: number }[]): Diagnostic {
  const lus = saisies.map(lireAngle);
  if (lus.some((v) => v === null)) return { statut: "parse_error", verdictFaux: false };
  return { statut: memeMultiensemble(lus as number[], attendues) ? "correct" : "not_equivalent", verdictFaux: false };
}

/** Écran « solutions » de la base `i`. */
export function diagnostiquerSolutions(e: ExerciceEquationsTransformer, i: number, saisies: string[]): Diagnostic {
  const b = e.bases[i]!;
  return diagnostiquerListe(saisies, b.solutions.map((valeur) => ({ valeur, tolerance: toleranceBase(b) })));
}

/** Écran « ensemble des solutions ». */
export function diagnostiquerEnsemble(e: ExerciceEquationsTransformer, saisies: string[]): Diagnostic {
  return diagnostiquerListe(saisies, solutionsAvecTolerance(e));
}

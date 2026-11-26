// Copie 5e (6h) de `5e-4h/moteur5e/verificationModeliserSuite.ts` (56gen9 ← 5gen47, chantier D du 26/11/2026) — copiée pour que les deux années puissent diverger.
import { anneeDonnee, anneeDuRang, premierTerme, raison, somme, terme, tolerance } from "../core/modeliserSuite";
import type { ExerciceModeliserSuite } from "../core/modeliserSuite";
import { evaluerExpressionGenerale } from "../../../../5e-4h/moteur/expressionGenerale";
import type { StatutVerification } from "../../../../5e-4h/moteur/statutVerification";
import { normaliserSigneMoins } from "../../../../../lib/normaliserSaisie";
import { sansEspacesMilliers } from "../../../../5e-4h/moteur5e/saisieNombreSuites";
import type { PhaseModeliserSuite } from "./typesModeliserSuite";

/**
 * Couche B (5e) — vérification de `5gen47` « Modéliser une situation par une suite ». Toutes les
 * valeurs attendues viennent de `core5e/modeliserSuite.ts` (source unique).
 *
 * - Nature : choix fermé (`arithmetique` / `geometrique`), une seule tentative.
 * - Nombres : lus par `evaluerExpressionGenerale` (virgule décimale, « − » typographique, espace
 *   des milliers comme 5gen14/5gen15, calcul accepté) ; l'unité du contexte tapée à la fin
 *   (« 1 260 € », « 340 t ») est ignorée — la saisie elle-même n'est jamais filtrée.
 * - Tolérance : u₁, raison, rang, N et année exacts ; termes, somme et cases du tableau à une unité
 *   de la précision annoncée près en mode calculatrice (écart d'arrondi), exacts sinon.
 */

export const ID_ARITHMETIQUE = "arithmetique";
export const ID_GEOMETRIQUE = "geometrique";

/** Retire une unité tapée en fin de saisie (« € », « euros », l'unité du contexte). */
function sansUnite(texte: string, e: ExerciceModeliserSuite): string {
  const unites = [e.contexte.unite, "euros", "euro", "€"].map((u) => u.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&"));
  let t = texte.trim();
  for (const u of unites) t = t.replace(new RegExp(`\\s*${u}\\s*$`, "i"), "");
  return t.trim();
}

/** Valeur lue d'une saisie, `null` si illisible. */
export function lireNombre(texte: string, e: ExerciceModeliserSuite): number | null {
  const t = sansUnite(sansEspacesMilliers(normaliserSigneMoins(texte)), e);
  if (t === "") return null;
  try {
    const v = evaluerExpressionGenerale(t, 0);
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

/** Valeurs attendues, champ par champ (vide pour le choix fermé). */
export function valeursAttendues(e: ExerciceModeliserSuite, phase: PhaseModeliserSuite): number[] {
  switch (phase) {
    case "nature":
      return [];
    case "premierTerme":
      return [premierTerme(e)];
    case "raison":
      return [raison(e)];
    case "rang":
      return e.variante === "terme" ? [e.rang] : [];
    case "terme":
      return e.variante === "terme" ? [terme(e, e.rang)] : [];
    case "nombreTermes":
      return e.variante === "somme" ? [e.nombre] : [];
    case "somme":
      return e.variante === "somme" ? [somme(e, e.nombre)] : [];
    case "tableau":
      return e.variante === "seuil" ? e.rangsTable.map((k) => terme(e, k)) : [];
    case "annee":
      return e.variante === "seuil" ? [anneeDuRang(e, e.rangSeuil)] : [];
  }
}

/** Tolérance d'un écran : arrondi admis seulement sur les valeurs calculées en contexte. */
function toleranceEcran(e: ExerciceModeliserSuite, phase: PhaseModeliserSuite): number {
  if (phase === "terme" || phase === "somme" || phase === "tableau") return tolerance(e);
  if (phase === "premierTerme") return tolerance(e);
  return 1e-6;
}

/** Statut champ par champ. */
export function diagnostiquerChamps(e: ExerciceModeliserSuite, phase: PhaseModeliserSuite, valeurs: string[]): StatutVerification[] {
  if (phase === "nature") {
    const v = valeurs[0] ?? "";
    if (v !== ID_ARITHMETIQUE && v !== ID_GEOMETRIQUE) return ["parse_error"];
    return [v === e.nature ? "correct" : "not_equivalent"];
  }
  const tol = toleranceEcran(e, phase);
  return valeursAttendues(e, phase).map((cible, i) => {
    const v = lireNombre(valeurs[i] ?? "", e);
    if (v === null) return "parse_error";
    return Math.abs(v - cible) <= tol ? "correct" : "not_equivalent";
  });
}

export function diagnostiquerEcran(e: ExerciceModeliserSuite, phase: PhaseModeliserSuite, valeurs: string[]): StatutVerification {
  const statuts = diagnostiquerChamps(e, phase, valeurs);
  if (statuts.includes("parse_error")) return "parse_error";
  return statuts.every((s) => s === "correct") ? "correct" : "not_equivalent";
}

export function verifierEcran(e: ExerciceModeliserSuite, phase: PhaseModeliserSuite, valeurs: string[]): boolean {
  return diagnostiquerEcran(e, phase, valeurs) === "correct";
}

/** Message d'une saisie non lue (aucune tentative décomptée). */
export function messageIllisible(phase: PhaseModeliserSuite): string {
  if (phase === "annee") return "Écriture non reconnue — écris une année, par exemple 2031 ; aucune tentative n'a été comptée.";
  if (phase === "rang" || phase === "nombreTermes") return "Écriture non reconnue — écris un nombre entier ; aucune tentative n'a été comptée.";
  return "Écriture non reconnue — écris un nombre (virgule décimale, par exemple 1,04) ; aucune tentative n'a été comptée.";
}

// ============================================================================
// Pièges reconnus (jamais la valeur attendue).
// ============================================================================

function proche(v: number, cible: number, tol = 1e-6): boolean {
  return Math.abs(v - cible) <= Math.max(tol, 1e-6);
}

const RANG_DECALE_ARITH = "Rang décalé d'une unité : le facteur de r est le rang moins 1, uₙ = u₁ + (n − 1)r.";
const RANG_DECALE_GEOM = "Rang décalé d'une unité : l'exposant de q est le rang moins 1, uₙ = u₁ × qⁿ⁻¹.";

function rangDecale(e: ExerciceModeliserSuite): string {
  return e.nature === "arithmetique" ? RANG_DECALE_ARITH : RANG_DECALE_GEOM;
}

/** Raison « taux seul » (q = t/100 au lieu de 1 ± t/100), pour reconnaître ses conséquences. */
function qTauxSeul(e: ExerciceModeliserSuite): number | null {
  return e.nature === "geometrique" && e.formulation === "pourcent" && e.pct !== null ? e.pct / 100 : null;
}

function piegePremierTerme(e: ExerciceModeliserSuite, v: number): string | null {
  const u1 = premierTerme(e);
  const tol = tolerance(e);
  if (proche(v, u1, tol)) return null;
  if (e.depart === "avant") {
    if (proche(v, e.valeurDonnee)) {
      return `Cette valeur est celle de ${anneeDonnee(e)}, l'année AVANT le rang 1 : applique une fois l'évolution annuelle pour obtenir u₁ (année ${e.annee1}).`;
    }
    if (e.nature === "geometrique" && proche(v, Math.abs(u1 - e.valeurDonnee), tol)) {
      return "Tu as calculé la variation seule : il faut encore l'appliquer à la valeur de départ.";
    }
    if (e.nature === "geometrique" && e.pct !== null && e.formulation === "pourcent") {
      const autre = e.valeurDonnee * (e.sens === "hausse" ? 1 - e.pct / 100 : 1 + e.pct / 100);
      if (proche(v, autre, tol)) return "Attention au sens de l'évolution : relis si la grandeur augmente ou diminue.";
    }
    if (e.nature === "arithmetique" && proche(v, e.valeurDonnee - e.r, tol)) return "Attention au sens de l'évolution : relis si la grandeur augmente ou diminue.";
    return null;
  }
  if (proche(v, terme(e, 2), tol)) return `u₁ est la valeur de l'année de rang 1 (${e.annee1}) : aucune évolution n'est encore appliquée.`;
  return null;
}

function piegeRaison(e: ExerciceModeliserSuite, v: number): string | null {
  if (proche(v, raison(e))) return null;
  if (e.nature === "arithmetique") {
    if (proche(v, -e.r)) return e.r < 0 ? "La quantité diminue chaque année : la raison r est négative." : "La quantité augmente chaque année : la raison r est positive.";
    if (e.formulation === "pourcentInitial" && e.pct !== null) {
      if (proche(v, e.pct) || proche(v, e.pct / 100)) return `r est un MONTANT ajouté chaque année : calcule ${e.pct} % de la somme déposée au départ.`;
      if (proche(v, 1 + e.pct / 100)) return "Le pourcentage porte toujours sur la somme déposée au départ : on ajoute chaque année le même montant, la raison r est ce montant.";
    }
    return null;
  }
  if (e.formulation === "pourcent" && e.pct !== null) {
    const t = e.pct / 100;
    if (proche(v, t)) {
      return e.sens === "hausse"
        ? `${String(t).replace(".", ",")} est le taux seul : augmenter de ${e.pct} %, c'est garder toute la valeur ET ajouter ${e.pct} % ; on multiplie donc par 1 plus le taux.`
        : `${String(t).replace(".", ",")} est la part qui disparaît : il reste 1 moins cette part, et c'est par ce nombre qu'on multiplie.`;
    }
    if (proche(v, e.pct)) return "Écris le pourcentage sous forme décimale : q est le nombre par lequel on multiplie chaque année.";
    if (e.sens === "baisse" && proche(v, 1 + t)) return "La grandeur diminue : q est plus petit que 1 (1 moins le taux).";
    if (e.sens === "hausse" && proche(v, 1 - t)) return "La grandeur augmente : q est plus grand que 1 (1 plus le taux).";
    if (e.sens === "baisse" && proche(v, -t)) return "La raison d'une suite géométrique est un facteur multiplicatif, positif ici : diminuer d'un pourcentage, c'est multiplier par 1 moins le taux.";
    return null;
  }
  if (e.formulation === "moitie" && proche(v, 2)) return "Diminuer de moitié, c'est diviser par 2, donc multiplier par 1/2.";
  return null;
}

function piegeEcranFinal(e: ExerciceModeliserSuite, v: number): string | null {
  const tol = tolerance(e);
  switch (e.variante) {
    case "terme": {
      const n = e.rang;
      if (proche(v, terme(e, n), tol)) return null;
      if (proche(v, terme(e, n + 1), tol) || proche(v, terme(e, n - 1), tol)) return rangDecale(e);
      if (proche(v, somme(e, n), tol)) return "Tu as calculé le TOTAL des années (une somme) ; on demande la valeur d'UNE seule année, uₙ.";
      const qt = qTauxSeul(e);
      if (qt !== null && proche(v, premierTerme(e) * qt ** (n - 1), Math.max(tol, 0.01))) return "Tu as multiplié par le taux seul : la raison est 1 plus (ou moins) le taux, pas le taux lui-même.";
      if (e.nature === "arithmetique" && proche(v, premierTerme(e) + n * e.r, tol)) return RANG_DECALE_ARITH;
      return null;
    }
    case "somme": {
      const N = e.nombre;
      const S = somme(e, N);
      if (proche(v, S, tol)) return null;
      if (proche(v, terme(e, N), tol)) return "C'est la valeur de la dernière année seulement : le total additionne les valeurs de TOUTES les années de la période (une somme de termes).";
      if (proche(v, somme(e, N - 1), tol) || proche(v, somme(e, N + 1), tol)) return "Vérifie le nombre de termes : la somme va du premier terme au terme de rang N, avec N trouvé à l'étape précédente.";
      if (e.depart === "avant" && proche(v, e.valeurDonnee + somme(e, N - 1), tol)) return `La somme commence à u₁ (année ${e.annee1}) : la valeur de ${anneeDonnee(e)} n'en fait pas partie.`;
      if (e.nature === "arithmetique" && proche(v, 2 * S, tol)) return "Tu as oublié de diviser par 2 : la somme vaut N fois la MOYENNE du premier et du dernier terme.";
      if (e.mode === "calcul" && Math.abs(v - S) <= N * 10 ** -e.contexte.decimales) {
        return "Écart d'arrondi : calcule la somme avec la formule, sans arrondir les termes en cours de route.";
      }
      return null;
    }
    case "seuil": {
      const annee = anneeDuRang(e, e.rangSeuil);
      if (proche(v, annee)) return null;
      if (proche(v, e.rangSeuil)) return `C'est le RANG du premier franchissement ; la question demande l'ANNÉE (l'année ${e.annee1} a le rang 1).`;
      if (proche(v, annee - 1)) return "Cette année-là, le seuil n'est pas encore franchi : regarde la ligne suivante du tableau.";
      if (proche(v, annee + 1)) return "Le seuil est déjà franchi l'année précédente : on cherche la PREMIÈRE année.";
      return null;
    }
  }
}

/** Message ciblé sur une erreur classique, `null` si rien de reconnaissable (ou réponse juste). */
export function messagePiege(e: ExerciceModeliserSuite, phase: PhaseModeliserSuite, valeurs: string[]): string | null {
  if (phase === "nature") return null;
  const lus = valeurs.map((t) => lireNombre(t, e));
  if (lus.some((v) => v === null)) return null;
  const nombres = lus as number[];
  const v = nombres[0];
  switch (phase) {
    case "premierTerme":
      return piegePremierTerme(e, v);
    case "raison":
      return piegeRaison(e, v);
    case "rang": {
      if (e.variante !== "terme" || proche(v, e.rang)) return null;
      const annee = anneeDuRang(e, e.rang);
      if (proche(v, e.rang - 1)) return `Tu as compté les années écoulées depuis ${e.annee1} ; mais ${e.annee1} a déjà le rang 1, donc le rang a une unité de plus.`;
      if (proche(v, e.rang + 1)) return `Un rang de trop : ${e.annee1} a le rang 1, ${e.annee1 + 1} le rang 2, etc.`;
      if (proche(v, annee)) return "Le rang n'est pas l'année : c'est le numéro de l'année en comptant à partir de l'année de rang 1.";
      return null;
    }
    case "nombreTermes": {
      if (e.variante !== "somme" || proche(v, e.nombre)) return null;
      const fin = anneeDuRang(e, e.nombre);
      if (proche(v, e.nombre - 1)) return `De ${e.annee1} à ${fin}, compte les années en incluant les deux : il y en a une de plus que la différence ${fin} − ${e.annee1}.`;
      if (proche(v, e.nombre + 1) && e.depart === "avant") return `La somme commence à u₁, l'année ${e.annee1} : l'année ${anneeDonnee(e)} n'est pas comprise.`;
      if (proche(v, e.nombre + 1)) return `Une année de trop : la période va de ${e.annee1} (rang 1) à ${fin}.`;
      return null;
    }
    case "tableau": {
      if (e.variante !== "seuil") return null;
      const tol = tolerance(e);
      const decale = e.rangsTable.some((k, i) => !proche(nombres[i], terme(e, k), tol) && (proche(nombres[i], terme(e, k + 1), tol) || proche(nombres[i], terme(e, k - 1), tol)));
      return decale ? rangDecale(e) : null;
    }
    case "terme":
    case "somme":
    case "annee":
      return piegeEcranFinal(e, v);
  }
}

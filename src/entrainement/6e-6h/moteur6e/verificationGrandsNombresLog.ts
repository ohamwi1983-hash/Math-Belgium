import { basesCommunes, donneesTaille, ecritureScientifique, logPuissance, logsComparer, logsDuree, premierEstPlusGrand } from "../core6e/grandsNombresLog";
import type { ExerciceComparer, ExerciceGrandsNombres } from "../core6e/grandsNombresLog";
import type { StatutVerification } from "../moteur/statutVerification";
import { evaluerExpressionExponentielle } from "./expressionExponentielle";
import type { PhaseGrandsNombres } from "./typesGrandsNombresLog";

/**
 * Couche B (6e) — vérification de `6gen92` « Grands nombres et logarithme décimal ». Toutes les
 * valeurs attendues viennent de `core6e/grandsNombresLog.ts` (source unique). La saisie est lue par
 * l'analyseur du chapitre (`expressionExponentielle.ts`) : décimal à virgule, fraction, ou
 * expression exacte comme « 150log(7) » (`log` = base 10).
 *
 * Tolérances (précision annoncée dans chaque consigne) :
 * - logarithme « arrondi au millième » : 0,0015 (le millième plus une marge d'arrondi) ;
 * - entier (partie entière, nombre de chiffres, exposant, premier chiffre, plus grand n) : exact ;
 * - mantisse « arrondie au centième » : 0,02 (une partie décimale arrondie au millième suffit) ;
 *   0,05 pour la durée en années, calculée à partir d'une durée en secondes déjà arrondie ;
 *   0,01 pour le nombre d'opérations disponibles (valeur exacte) ;
 * - borne log(N)/log(2) « arrondie au centième » : 0,015.
 * Le générateur garde toutes les conclusions loin de ces tolérances (voir ses marges).
 */

/** Identifiant de l'option « premier > second » (option canonique 0). */
export function idVerdictJuste(e: ExerciceComparer): string {
  return premierEstPlusGrand(e) ? "0" : "1";
}

interface Attendu {
  valeur: number;
  tolerance: number;
}

const EXACT = 1e-6;
const MILLIEME = 0.0015;

/** Valeurs attendues, champ par champ, d'un écran à champs. */
export function valeursAttendues(e: ExerciceGrandsNombres, phase: PhaseGrandsNombres): Attendu[] {
  switch (e.variante) {
    case "chiffres":
    case "premier-chiffre": {
      const L = logPuissance(e.a, e.n);
      const s = ecritureScientifique(L);
      if (phase === "logPuissance") return [{ valeur: L, tolerance: MILLIEME }];
      if (phase === "partieEntiere") return [{ valeur: s.E, tolerance: EXACT }];
      if (phase === "nombreChiffres") return [{ valeur: s.E + 1, tolerance: EXACT }];
      if (phase === "scientifique") return [{ valeur: s.m, tolerance: 0.02 }, { valeur: s.E, tolerance: EXACT }];
      if (phase === "premierChiffre") return [{ valeur: Math.floor(s.m), tolerance: EXACT }, { valeur: s.E + 1, tolerance: EXACT }];
      return [];
    }
    case "comparer":
      if (phase === "logsDeux") return logsComparer(e).map((valeur) => ({ valeur, tolerance: MILLIEME }));
      if (phase === "memeExposant") return basesCommunes(e).map((valeur) => ({ valeur, tolerance: EXACT }));
      return [];
    case "temps":
      if (e.sousCas === "duree") {
        const L = logsDuree(e);
        if (phase === "logOperations") return [{ valeur: L.operations, tolerance: MILLIEME }];
        const s = ecritureScientifique(phase === "dureeSecondes" ? L.secondes : L.annees);
        if (phase === "dureeSecondes") return [{ valeur: s.m, tolerance: 0.02 }, { valeur: s.E, tolerance: EXACT }];
        if (phase === "dureeAnnees") return [{ valeur: s.m, tolerance: 0.05 }, { valeur: s.E, tolerance: EXACT }];
        return [];
      }
      {
        const d = donneesTaille(e);
        if (phase === "operations") {
          const s = ecritureScientifique(d.logN);
          return [{ valeur: s.m, tolerance: 0.01 }, { valeur: s.E, tolerance: EXACT }];
        }
        if (phase === "borne") return [{ valeur: d.borne, tolerance: 0.015 }];
        if (phase === "plusGrandN") return [{ valeur: d.nMax, tolerance: EXACT }];
        return [];
      }
  }
}

/** « 12 045 » (espace des milliers) se lit 12045, jamais 12 × 45. */
function sansMilliers(texte: string): string {
  return texte.replace(/(\d)[\s  ]+(?=\d{3}(?!\d))/g, "$1");
}

/** Lecture d'une saisie : nombre fini, `"illisible"` (syntaxe) ou `"deborde"` (calcul trop grand). */
export function lireSaisie(texte: string): number | "illisible" | "deborde" {
  try {
    const v = evaluerExpressionExponentielle(sansMilliers(texte), {});
    if (Number.isFinite(v)) return v;
    return Number.isNaN(v) ? "illisible" : "deborde";
  } catch {
    return "illisible";
  }
}

/** Statut champ par champ (`[statut]` pour le choix fermé). */
export function diagnostiquerChamps(e: ExerciceGrandsNombres, phase: PhaseGrandsNombres, valeurs: string[]): StatutVerification[] {
  if (phase === "verdict") return [e.variante === "comparer" && valeurs[0] === idVerdictJuste(e) ? "correct" : "not_equivalent"];
  return valeursAttendues(e, phase).map((attendu, i) => {
    const v = lireSaisie(valeurs[i] ?? "");
    if (typeof v !== "number") return "parse_error";
    return Math.abs(v - attendu.valeur) <= attendu.tolerance ? "correct" : "not_equivalent";
  });
}

export function diagnostiquerEcran(e: ExerciceGrandsNombres, phase: PhaseGrandsNombres, valeurs: string[]): StatutVerification {
  const statuts = diagnostiquerChamps(e, phase, valeurs);
  if (statuts.includes("parse_error")) return "parse_error";
  return statuts.every((s) => s === "correct") ? "correct" : "not_equivalent";
}

export function verifierEcran(e: ExerciceGrandsNombres, phase: PhaseGrandsNombres, valeurs: string[]): boolean {
  return diagnostiquerEcran(e, phase, valeurs) === "correct";
}

/** Message d'une saisie non lue (aucune tentative décomptée) : calcul trop grand, ou syntaxe. */
export function messageIllisible(valeurs: string[]): string {
  if (valeurs.some((v) => lireSaisie(v) === "deborde")) {
    return "Ce calcul dépasse les capacités de la machine, comme celles de ta calculatrice : passe par le logarithme, log(aⁿ) = n·log(a). Aucune tentative n'a été comptée.";
  }
  return "Écriture non reconnue — vérifie la syntaxe (un nombre seul, virgule décimale, parenthèses) ; aucune tentative n'a été comptée.";
}

// ============================================================================
// Pièges reconnus (jamais la valeur attendue).
// ============================================================================

function proche(v: number, cible: number, tolerance: number): boolean {
  return Math.abs(v - cible) <= tolerance;
}

function piegeLog(v: number, a: number, n: number): string | null {
  const L = logPuissance(a, n);
  if (proche(v, L, MILLIEME)) return null;
  if (proche(v, n * Math.log(a), 0.01 + 1e-3 * n)) return "Tu as utilisé ln : ici, c'est le logarithme DÉCIMAL (log, base 10) qui donne l'écriture en puissances de 10.";
  if (proche(v, n * Math.round(Math.log10(a) * 1000) / 1000, 0.002) || proche(v, n * Math.round(Math.log10(a) * 100) / 100, 0.002)) {
    return "Tu as arrondi log(a) avant de le multiplier par n : l'erreur est multipliée par n. Calcule le produit d'un seul coup, sans arrondi intermédiaire.";
  }
  if (proche(v, a * Math.log10(n), 0.01)) return "Base et exposant sont échangés : log(aⁿ) = n·log(a), l'exposant passe devant.";
  return null;
}

function piegeEntier(v: number, L: number, phase: "partieEntiere" | "nombreChiffres"): string | null {
  const E = Math.floor(L);
  if (phase === "partieEntiere") {
    if (v === E) return null;
    if (v === E + 1 && L - E >= 0.5) return "La partie entière n'est pas l'arrondi : on garde l'entier juste en dessous, sans regarder les décimales.";
    if (v === E + 1) return "Ce nombre est déjà le nombre de chiffres ; on demande d'abord la partie entière du logarithme.";
    return null;
  }
  if (v === E + 1) return null;
  if (v === E) return "Tu as oublié le « + 1 » : 100 = 10² a trois chiffres, alors que log(100) = 2.";
  return null;
}

function piegeScientifique(valeurs: number[], L: number): string | null {
  const s = ecritureScientifique(L);
  const [m, E] = valeurs;
  const messages: string[] = [];
  if (proche(m, s.f, 0.002)) messages.push("La mantisse n'est pas la partie décimale f elle-même, mais 10 exposant f.");
  else if (m >= 10 || m < 1) messages.push("Une mantisse d'écriture scientifique est comprise entre 1 et 10 (10 exclu).");
  if (E === s.E + 1) messages.push("L'exposant de 10 est la partie entière du logarithme, sans « + 1 ».");
  return messages.length > 0 ? messages.join(" ") : null;
}

/** Message ciblé sur une erreur classique, `null` si rien de reconnaissable (ou réponse juste). */
export function messagePiege(e: ExerciceGrandsNombres, phase: PhaseGrandsNombres, valeurs: string[]): string | null {
  const lus = valeurs.map((t) => lireSaisie(t));
  if (lus.some((v) => typeof v !== "number")) return null;
  const nombres = lus as number[];
  switch (e.variante) {
    case "chiffres":
    case "premier-chiffre": {
      const L = logPuissance(e.a, e.n);
      if (phase === "logPuissance") return piegeLog(nombres[0], e.a, e.n);
      if (phase === "partieEntiere" || phase === "nombreChiffres") return piegeEntier(nombres[0], L, phase);
      if (phase === "scientifique") return piegeScientifique(nombres, L);
      if (phase === "premierChiffre") {
        const s = ecritureScientifique(L);
        const messages: string[] = [];
        if (nombres[0] !== Math.floor(s.m) && nombres[0] === Math.round(s.m)) messages.push("Le premier chiffre est celui de la mantisse tronquée, pas arrondie.");
        if (nombres[1] === s.E) messages.push("Pour le nombre de chiffres, n'oublie pas le « + 1 » : 10² = 100 a trois chiffres.");
        return messages.length > 0 ? messages.join(" ") : null;
      }
      return null;
    }
    case "comparer": {
      if (phase !== "logsDeux") return null;
      const messages = [piegeLog(nombres[0], e.a, e.n), piegeLog(nombres[1], e.b, e.m)].filter((x): x is string => x !== null);
      return messages.length > 0 ? messages[0] : null;
    }
    case "temps": {
      if (e.sousCas === "duree") {
        const L = logsDuree(e);
        if (phase === "logOperations") return piegeLog(nombres[0], 2, e.n);
        const valeur = nombres[0] * Math.pow(10, nombres[1]);
        const cible = Math.pow(10, phase === "dureeSecondes" ? L.secondes : L.annees);
        if (phase === "dureeSecondes" && proche(Math.log10(Math.abs(valeur) || 1), L.operations + e.p, 0.01)) {
          return "Tu as multiplié par la vitesse de l'ordinateur : la durée est le nombre d'opérations DIVISÉ par le nombre d'opérations par seconde.";
        }
        if (phase === "dureeAnnees") {
          const secondes = Math.pow(10, L.secondes);
          if (proche(valeur / (secondes / 86400), 1, 0.01)) return "Ce nombre est la durée en jours : il faut encore diviser par 365.";
          if (proche(valeur / (secondes / 3600), 1, 0.01)) return "Ce nombre est la durée en heures : une année compte 365 × 24 × 3600 secondes.";
        }
        const messages: string[] = [];
        if (nombres[0] >= 10 || nombres[0] < 1) messages.push("Une mantisse d'écriture scientifique est comprise entre 1 et 10 (10 exclu).");
        else if (proche(valeur / cible, 10, 0.5) || proche(valeur / cible, 0.1, 0.05)) messages.push("Vérifie l'exposant de 10 : il vaut la partie entière du logarithme de la durée.");
        return messages.length > 0 ? messages.join(" ") : null;
      }
      const d = donneesTaille(e);
      if (phase === "operations") {
        const valeur = nombres[0] * Math.pow(10, nombres[1]);
        if (proche(valeur / Math.pow(10, e.p), 1, 0.01)) return "Ce nombre est le nombre d'opérations en UNE seconde : multiplie-le par la durée exprimée en secondes.";
        if (nombres[0] >= 10 || nombres[0] < 1) return "Une mantisse d'écriture scientifique est comprise entre 1 et 10 (10 exclu).";
        return null;
      }
      if (phase === "borne") {
        if (proche(nombres[0], d.logN, 0.02)) return "Ce nombre est log(N) : il reste à diviser par log(2), car log(2ⁿ) = n·log(2).";
        if (proche(nombres[0], Math.log(Math.pow(10, d.logN)) / Math.log10(2), 0.05)) return "Utilise le même logarithme des deux côtés : log(N) divisé par log(2).";
        return null;
      }
      if (phase === "plusGrandN") {
        if (nombres[0] === d.nMax + 1) return "Avec ce n, 2ⁿ dépasse le nombre d'opérations disponibles : n doit rester inférieur ou égal à la borne, on arrondit vers le bas.";
        return null;
      }
      return null;
    }
  }
}

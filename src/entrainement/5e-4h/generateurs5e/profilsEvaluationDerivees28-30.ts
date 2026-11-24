/**
 * Profils d'instance (tirage équilibré des évaluations, `AdaptateurFeuilleExercices.profilInstance`,
 * méthode : `.claude/rules/feuilles-evaluations.md`) de 5gen28 (tangentes), 5gen29 (étude locale)
 * et 5gen30 (lecture graphique — dérivées), chapitre 5 de 5e. Mesures : 5 000 tirages par variante
 * (`scratchpad/5c5-R2/mesures.txt`).
 *
 * 5gen28 — cas particuliers (ils RACCOURCISSENT la résolution) :
 * - `abscisse-nulle` : point donné en x = 0 (A : f(0) et f'(0) se lisent sur les coefficients ;
 *   C : p = 0) ;
 * - `pente-nulle` : f'(a) = 0 (A polynomiale) ou f'(p) = 0 (C) — tangente horizontale y = f(a) ;
 * - `racine-nulle` : x = 0 solution de f'(x) = 0 (B) — l'ordonnée vaut le terme constant.
 * Racine double ou deux racines distinctes (B) est un VERDICT : jamais filtré, mais imposé identique
 * d'une série à l'autre par `forme`. Toutes les valeurs sont exactes (racines carrées comprises) :
 * `calcul: 'exacte'`.
 *
 * 5gen29 — aucun cas particulier : la racine double (aucun extremum) et l'absence de point
 * d'inflexion sont des verdicts. `forme` = type × nature des racines × niveau. Racines
 * irrationnelles (1 ± √2…) : les abscisses sont exactes, mais la valeur de f en ces points demande
 * un développement de (a ± √b)³ peu réaliste à la main en 5e — `calcul: 'calculatrice'` (la consigne
 * papier accepte alors des valeurs arrondies au centième) ; tout le reste se fait à la main.
 * Le niveau avancé (f'') n'existe pas dans la variante « rationnelle avec CE » : pas de paramètre au
 * choix (règle : seulement un paramètre présent dans TOUTES les variantes).
 *
 * 5gen30 — lecture pure (aucun calcul) : `calcul` sans objet. `forme` = famille d'asymptotes
 * (nombre d'AV × horizontale / oblique / aucune) + présence d'un palier, pour qu'un tirage libre
 * garde la même structure d'une série à l'autre (au plus 18 formes ; la structure fine — signes des
 * AV, point isolé, horizontales distinctes — en donnait 59, trop pour la recherche de graine bornée
 * à 200 ms : un tirage libre coûte environ 2 ms). L'absence d'extremum ou de point
 * d'inflexion est un verdict (« aucun point ») : pas de cas particulier.
 */
import type { ProfilInstance } from "../../export/genererFeuilleExercices";
import type { ExerciceTangente } from "../core5e/tangentes.types";
import type { ExerciceEtudeLocale } from "../core5e/etudeLocale.types";
import type { ExerciceLectureGraphiqueDerivees } from "../core5e/lectureGraphiqueDerivees.types";
import { deriveeFDoubleTangence, deriveeFPointDonne } from "./tangentes/index";

function cas(liste: (string | false)[]): string | null {
  const presents = liste.filter((c): c is string => !!c);
  return presents.length === 0 ? null : presents.join("+");
}

export const LIBELLE_CAS_TANGENTES = "Inclure un cas particulier (point d'abscisse 0, tangente horizontale, ou solution nulle)";

/** Option « f′ donnée / à calculer » (lot C, question 3) : case cochée (défaut) = dérivée à calculer ;
 * décochée = f′ donnée dans l'énoncé. Marqueur d'absence : `derivee-donnee`. Sans objet pour la double
 * tangence (`parametresNonApplicables`). */
export const PARAMETRES_TANGENTES = [{ id: "derivee-donnee", label: "Dérivée f′ à calculer (décoché : f′ donnée dans l'énoncé)" }];

export function profilTangente(e: ExerciceTangente): ProfilInstance {
  const derivee = e.variante !== "doubleTangence" && !!e.deriveeDonnee && "derivee-donnee";
  switch (e.variante) {
    case "pointDonne":
      return {
        casParticulier: cas([e.a === 0 && "abscisse-nulle", e.sousFamille === "polynomiale" && deriveeFPointDonne(e, e.a) === 0 && "pente-nulle", derivee]),
        calcul: "exacte",
        forme: `pointDonne-${e.sousFamille}`,
      };
    case "horizontale":
      // Lot D : 0, 1 ou 2 points est le VERDICT (groupe_horizontale) — jamais dans la `forme`.
      return { casParticulier: cas([e.racines.includes(0) && "racine-nulle", derivee]), calcul: "exacte", forme: "horizontale" };
    case "doubleTangence":
      return { casParticulier: cas([e.p === 0 && "abscisse-nulle", deriveeFDoubleTangence(e, e.p) === 0 && "pente-nulle"]), calcul: "exacte", forme: "doubleTangence", parametresNonApplicables: ["derivee-donnee"] };
    case "pente":
      return { casParticulier: cas([derivee]), calcul: "exacte", forme: `pente-${e.racines.length}` };
    case "pointExterieur":
      return { casParticulier: cas([derivee]), calcul: "exacte", forme: "pointExterieur" };
  }
}

/** Option « f′ et f″ données / à calculer » (lot C, question 3) : case cochée (défaut) = dérivées
 * données ; décochée = à calculer. Marqueur d'absence : `derivees-a-calculer`. */
export const PARAMETRES_ETUDE_LOCALE = [{ id: "derivees-a-calculer", label: "Dérivées f′ (et f″) données (décoché : à calculer)" }];

export function profilEtudeLocale(e: ExerciceEtudeLocale): ProfilInstance {
  // Lot D : racines simples ou double (= extremums ou non) est le VERDICT (groupes à verdict) — hors
  // de la `forme` ; irrationnelle reste visible dans la forme (elle n'est pas dans un groupe). Lot C :
  // valeurs exactes partout (`calcul: 'exacte'`).
  const nature = e.type === "polynomiale" ? (e.natureRacines === "irrationnelle" ? "-irrationnelle" : "-rationnelle") : "";
  return { casParticulier: e.deriveesACalculer ? "derivees-a-calculer" : null, calcul: "exacte", forme: `${e.type}${nature}-${e.niveau}` };
}

export function profilLectureGraphiqueDerivees(e: ExerciceLectureGraphiqueDerivees): ProfilInstance {
  const { vas, infini } = e.asymptotique;
  return { casParticulier: null, forme: `${vas.length}va-${infini.type}-${e.paliers.length > 0 ? "palier" : "sans-palier"}` };
}

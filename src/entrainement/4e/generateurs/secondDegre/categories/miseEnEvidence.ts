import type { Exercice } from "../../../core/generateur.types";
import { randomInt, randomNonZeroInt } from "../aleatoire";

/**
 * ax² + bx = x(ax + b) = 0, racines 0 et -b/a.
 * c = 0 par construction ; la seconde racine r est choisie non nulle pour garder
 * un exercice non trivial (sinon b = 0 aussi et l'équation dégénère en ax² = 0).
 * `racineImposee` (générateur "Simplifier") fixe r à cette valeur au lieu de la tirer —
 * la racine structurelle 0 reste l'autre racine, garantie distincte puisque racineImposee ≠ 0.
 * `aImpose` (générateur "L'inconnue au dénominateur") fixe a au lieu de le tirer — utilisé pour
 * générer une équation monique (a=1), orthogonal à racineImposee.
 *
 * `formeFactorisee` est toujours la forme maximale (voir
 * prompt-corrections-affichage-simplification.md point 7) : puisque b = -a·r par construction,
 * a est déjà le facteur commun complet une fois x mis en évidence — "a·x·(x-r)", jamais la forme
 * partielle "x(ax+b)" qui ne factorise que x et laisse le facteur a non extrait de b. Ceci
 * n'affecte que l'affichage de référence (récapitulatif/révélation) ; la vérification de la
 * réponse de l'élève (verifierMiseEnEvidence) continue d'accepter toute factorisation valide,
 * y compris non maximale, puisqu'elle compare des coefficients, jamais cette chaîne.
 *
 * Pour a<0 (possible depuis promptgenerateur5signesProduit.md, point 8 — jamais le cas ici avant),
 * le signe est absorbé dans le second facteur ("x(ax - ar)") plutôt que de préfixer "x" d'une
 * négation ("-x(x-r)") : verifierMiseEnEvidence (expressionAlgebrique.ts) exige "x" comme facteur
 * explicite au sens structurel, et une négation en tête du facteur "x" le masque à cette détection
 * — comportement intentionnel du module partagé (voir son test "refuse un facteur x caché derrière
 * une négation"), donc c'est ici, à la génération, qu'il faut l'éviter — même principe déjà établi
 * par `formeFactoriseeMiseEnEvidence` (generateurs/equationRationnelle/construireExerciceClassifie.ts).
 */
export function construireMiseEnEvidence(options?: {
  racineImposee?: number;
  aImpose?: number;
}): Omit<Exercice, "formeAffichage"> {
  const a = options?.aImpose ?? randomInt(1, 4);
  const r = options?.racineImposee ?? randomNonZeroInt(-5, 5);
  const b = -a * r;

  const formeFactorisee =
    a > 0
      ? `${a === 1 ? "" : a}x(${r >= 0 ? `x - ${r}` : `x + ${Math.abs(r)}`})`
      : (() => {
          const constante = -a * r;
          const termeX = a === -1 ? "-x" : `${a}x`;
          return `x(${termeX} ${constante > 0 ? "+" : "-"} ${Math.abs(constante)})`;
        })();

  return {
    categorie: "mise_en_evidence",
    enonce: { a, b, c: 0 },
    solution: {
      formeFactorisee,
      racines: r < 0 ? [r, 0] : [0, r],
      racinesExactes: true,
    },
  };
}

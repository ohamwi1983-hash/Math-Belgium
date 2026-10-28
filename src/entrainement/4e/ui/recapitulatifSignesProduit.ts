import type { FacteurSignesProduit } from "../core/signesProduit.types";
import type { EtatSessionSignesProduit, PhaseSignesProduit } from "../moteur/typesSignesProduit";
import { bonneReponseMethode } from "../moteur/verificationSignesProduit";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { libelleCategorie } from "./categorieLabels";
import { formatPolynome } from "./formatSimplification";
import { formatFormeFactoriseeSignesProduit } from "./formatSignesProduit";

/** Une entrée du récapitulatif, avec l'écran qui l'a produite — `phase` + position (0-based) du
 * facteur concerné dans `exercice.facteurs`. Sert à retrouver EXACTEMENT l'entrée d'un écran qui
 * vient de se clore (consultation des puces, réponse attendue après échec), jamais « la dernière
 * ligne » (audit gen5 : le récap était trié par type, la dernière ligne n'était souvent pas celle
 * de l'écran clos). */
export interface EntreeRecapitulatifSignesProduit extends EntreeRecapitulatif {
  phase: PhaseSignesProduit;
  positionFacteur: number;
}

/** "facteur 2" — numéro du facteur dans l'énoncé (1-based), le même pour toutes ses étapes. */
function nomFacteur(position: number): string {
  return `facteur ${position + 1}`;
}

/**
 * Récapitulatif accumulé pour l'exercice "tableau de signes à plusieurs facteurs" — toujours la
 * vraie valeur confirmée, jamais la saisie de l'élève, rien pour une étape qui n'a pas eu lieu.
 * Émis dans l'ORDRE CHRONOLOGIQUE des écrans (facteur par facteur, dans l'ordre de l'énoncé, puis
 * étape par étape pour chacun), chaque libellé nommant le facteur par sa position dans l'énoncé —
 * jamais par un compteur propre à son type (« facteur irréductible 1 » pouvait désigner le 3e
 * facteur affiché, audit gen5). L'inéquation complète n'apparaît pas ici : elle reste épinglée dans
 * le bloc ÉNONCÉ (AppSignesProduit.tsx).
 */
export function calculerEntreesRecapSignesProduit(etat: EtatSessionSignesProduit): EntreeRecapitulatifSignesProduit[] {
  const entrees: EntreeRecapitulatifSignesProduit[] = [];
  let indexLineaire = 0;
  let indexQuadratique = 0;
  let indexIrreductible = 0;

  etat.exerciceCourant.facteurs.forEach((facteur: FacteurSignesProduit, position) => {
    const nom = nomFacteur(position);

    if (facteur.type === "lineaire") {
      const index = indexLineaire++;
      if (index < etat.scoresRacineLineaireExercice.length) {
        entrees.push({
          phase: "racineLineaire",
          positionFacteur: position,
          libelle: `Racine du ${nom}`,
          estLatex: false,
          valeur: String(facteur.polynome.p),
          revele: etat.racineLineaireRevelees[index],
        });
      }
      return;
    }

    const indexMethode = indexQuadratique++;

    if (facteur.type === "quadratique_factorisable") {
      const factorisable = facteur.exercice;
      if (etat.scoreReductionFacteurExercice !== null) {
        const initial = etat.exerciceInitial.facteurs[position];
        const diviseur =
          initial?.type === "quadratique_factorisable" ? Math.abs(initial.exercice.enonce.a / factorisable.enonce.a) : 1;
        entrees.push({
          phase: "reductionFacteur",
          positionFacteur: position,
          libelle: `${nom[0].toUpperCase()}${nom.slice(1)} divisé par ${diviseur} (positif : même signe)`,
          estLatex: true,
          valeur: formatPolynome(factorisable),
          revele: etat.reductionFacteurRevele,
        });
      }
      if (indexMethode < etat.scoresMethodeExercice.length) {
        entrees.push({
          phase: "methodeFacteur",
          positionFacteur: position,
          libelle: `Méthode pour le ${nom}`,
          estLatex: false,
          valeur: libelleCategorie(bonneReponseMethode(facteur)),
          revele: etat.methodeRevelees[indexMethode],
        });
      }
      const formeFactorisee = `${formatFormeFactoriseeSignesProduit(factorisable.enonce, factorisable.solution.racines)} = 0`;
      if (etat.scoreFactorisationChamp1Exercice !== null) {
        const revele = etat.factorisationChamp1Revele;
        entrees.push(
          factorisable.categorie === "cas_general"
            ? { phase: "factorisationChamp1", positionFacteur: position, libelle: `Δ du ${nom}`, estLatex: false, valeur: `Δ = ${factorisable.solution.delta}`, revele }
            : { phase: "factorisationChamp1", positionFacteur: position, libelle: `Forme factorisée du ${nom}`, estLatex: true, valeur: formeFactorisee, revele },
        );
      }
      if (etat.scoreFactorisationChamp2Exercice !== null) {
        entrees.push({
          phase: "factorisationChamp2",
          positionFacteur: position,
          libelle: `Racines du ${nom}`,
          estLatex: false,
          valeur: [...factorisable.solution.racines].sort((a, b) => a - b).join(" ; "),
          revele: etat.factorisationChamp2Revele,
        });
      }
      if (etat.scoreFactorisationFactorisationExercice !== null) {
        entrees.push({
          phase: "factorisationFactorisation",
          positionFacteur: position,
          libelle: `Forme factorisée du ${nom}`,
          estLatex: true,
          valeur: formeFactorisee,
          revele: etat.factorisationFactorisationRevele,
        });
      }
      return;
    }

    // Facteur irréductible : méthode ("Non factorisable") puis signe.
    const index = indexIrreductible++;
    if (indexMethode < etat.scoresMethodeExercice.length) {
      entrees.push({
        phase: "methodeFacteur",
        positionFacteur: position,
        libelle: `Méthode pour le ${nom}`,
        estLatex: false,
        valeur: libelleCategorie(bonneReponseMethode(facteur)),
        revele: etat.methodeRevelees[indexMethode],
      });
    }
    if (index < etat.scoresSigneIrreductibleExercice.length) {
      entrees.push({
        phase: "signeIrreductible",
        positionFacteur: position,
        libelle: `Signe du ${nom}`,
        estLatex: false,
        valeur: facteur.signe === "+" ? "toujours positif" : "toujours négatif",
        revele: etat.signeIrreductibleRevelees[index],
      });
    }
  });

  return entrees;
}

export function calculerRecapitulatifSignesProduit(etat: EtatSessionSignesProduit): EntreeRecapitulatif[] {
  return calculerEntreesRecapSignesProduit(etat).map(({ phase: _phase, positionFacteur: _position, ...entree }) => entree);
}

/** L'entrée produite par l'écran (`phase`, facteur à `positionFacteur`) — `undefined` si cet écran
 * n'a pas (encore) d'entrée ("grille"/"intervalle" n'en ont jamais). */
export function entreeRecapPourEcran(
  etat: EtatSessionSignesProduit,
  phase: PhaseSignesProduit,
  positionFacteur: number,
): EntreeRecapitulatifSignesProduit | undefined {
  return calculerEntreesRecapSignesProduit(etat).find((e) => e.phase === phase && e.positionFacteur === positionFacteur);
}

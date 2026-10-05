import type { FacteurQuadratiqueIrreductible, FacteurSignesProduit } from "../core/signesProduit.types";
import type { EtatSessionSignesProduit } from "../moteur/typesSignesProduit";
import { bonneReponseMethode } from "../moteur/verificationSignesProduit";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { libelleCategorie } from "./categorieLabels";
import { formatFormeFactoriseeDepuisRacines } from "./formatEquation";
import { formatPolynome } from "./formatSimplification";

function facteurFactorisableDe(etat: EtatSessionSignesProduit) {
  const facteur = etat.exerciceCourant.facteurs.find((f) => f.type === "quadratique_factorisable");
  return facteur?.type === "quadratique_factorisable" ? facteur.exercice : undefined;
}

function facteursLineairesDe(etat: EtatSessionSignesProduit): Extract<FacteurSignesProduit, { type: "lineaire" }>[] {
  return etat.exerciceCourant.facteurs.filter((f): f is Extract<FacteurSignesProduit, { type: "lineaire" }> => f.type === "lineaire");
}

function facteursQuadratiquesDe(etat: EtatSessionSignesProduit): Exclude<FacteurSignesProduit, { type: "lineaire" }>[] {
  return etat.exerciceCourant.facteurs.filter(
    (f): f is Exclude<FacteurSignesProduit, { type: "lineaire" }> => f.type !== "lineaire",
  );
}

function facteursIrreductiblesDe(etat: EtatSessionSignesProduit): FacteurQuadratiqueIrreductible[] {
  return etat.exerciceCourant.facteurs.filter((f): f is FacteurQuadratiqueIrreductible => f.type === "quadratique_irreductible");
}

/**
 * Récapitulatif accumulé pour l'exercice "tableau de signes à plusieurs facteurs" — même principe
 * que recapitulatif.ts/recapitulatifInequation.ts (toujours la vraie valeur confirmée, jamais la
 * saisie de l'élève, rien pour une étape qui n'a pas eu lieu). Fichier séparé car typé pour
 * EtatSessionSignesProduit, un contrat différent.
 *
 * L'inéquation complète n'apparaît plus ici (promptgenerateur5signesProduit.md, point 1) : elle
 * est désormais épinglée en permanence dans son propre encadré violet, à part du récapitulatif
 * textuel — voir AppSignesProduit.tsx. Le récapitulatif ne porte donc plus que les étapes
 * PAR FACTEUR déjà closes, dans l'ordre de `exercice.facteurs` — une entrée "Racine (facteur
 * linéaire N)" par facteur linéaire déjà résolu, une entrée "Méthode (facteur N)" par facteur
 * quadratique déjà passé par l'étape méthode (suivie, pour le seul facteur qui s'avère réellement
 * factorisable, de ses propres entrées Δ/forme factorisée/racines déjà closes), une entrée
 * "Signe (facteur irréductible N)" par facteur irréductible déjà signé — le "N" n'est ajouté que
 * s'il y a plus d'une entrée de cette même famille (même convention que le reste du projet).
 */
export function calculerRecapitulatifSignesProduit(etat: EtatSessionSignesProduit): EntreeRecapitulatif[] {
  const entrees: EntreeRecapitulatif[] = [];
  const factorisable = facteurFactorisableDe(etat);
  const facteursLineaires = facteursLineairesDe(etat);
  const facteursQuadratiques = facteursQuadratiquesDe(etat);
  const facteursIrreductibles = facteursIrreductiblesDe(etat);

  etat.scoresRacineLineaireExercice.forEach((_score, index) => {
    const facteur = facteursLineaires[index];
    entrees.push({
      libelle: `Racine (facteur linéaire${facteursLineaires.length > 1 ? ` ${index + 1}` : ""})`,
      estLatex: false,
      valeur: String(facteur.polynome.p),
    });
  });

  if (etat.scoreReductionFacteurExercice !== null && factorisable) {
    entrees.push({ libelle: "Réduction (facteur à factoriser)", estLatex: true, valeur: formatPolynome(factorisable) });
  }

  etat.scoresMethodeExercice.forEach((_score, index) => {
    const facteur = facteursQuadratiques[index];
    entrees.push({
      libelle: `Méthode${facteursQuadratiques.length > 1 ? ` (facteur ${index + 1})` : ""}`,
      estLatex: false,
      valeur: libelleCategorie(bonneReponseMethode(facteur)),
    });
  });

  if (etat.scoreFactorisationChamp1Exercice !== null && factorisable) {
    entrees.push(
      factorisable.categorie === "cas_general"
        ? { libelle: "Δ (facteur à factoriser)", estLatex: false, valeur: `Δ = ${factorisable.solution.delta}` }
        : { libelle: "Forme factorisée (facteur à factoriser)", estLatex: true, valeur: `${factorisable.solution.formeFactorisee} = 0` },
    );
  }

  if (etat.scoreFactorisationChamp2Exercice !== null && factorisable) {
    entrees.push({
      libelle: "Racines (facteur à factoriser)",
      estLatex: false,
      valeur: [...factorisable.solution.racines].sort((a, b) => a - b).join(" ; "),
    });
  }

  if (etat.scoreFactorisationFactorisationExercice !== null && factorisable) {
    entrees.push({
      libelle: "Forme factorisée (facteur à factoriser)",
      estLatex: true,
      valeur: `${formatFormeFactoriseeDepuisRacines(factorisable.enonce, factorisable.solution.racines)} = 0`,
    });
  }

  const plusieursIrreductibles = facteursIrreductibles.length > 1;
  etat.scoresSigneIrreductibleExercice.forEach((_score, index) => {
    const facteur = facteursIrreductibles[index];
    const libelle = plusieursIrreductibles ? `Signe (facteur irréductible ${index + 1})` : "Signe (facteur irréductible)";
    entrees.push({ libelle, estLatex: false, valeur: facteur.signe === "+" ? "toujours positif" : "toujours négatif" });
  });

  return entrees;
}

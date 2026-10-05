import type { ResultatExerciceAssociation } from "../moteur5e/typesAssociation";
import { lettreCorrecte, nombreElementsAssociation, reponseCorrecteAssociation } from "../core5e/association.types";
import { Katex } from "../components/Katex";
import { LigneRecap, RecapTotalPoints, statutRecap } from "./LigneRecap";
import { PolynomeAssociationGraph } from "./PolynomeAssociationGraph";
import { FonctionRicheAssociationGraph } from "./FonctionRicheAssociationGraph";

const LETTRES = ["A", "B", "C", "D", "E", "F", "G", "H"];

interface Props {
  resultat: ResultatExerciceAssociation;
  onContinuer: () => void;
  dernier: boolean;
}

/** Récapitulatif — une `LigneRecap` PAR ÉLÉMENT NUMÉROTÉ (spec : "chaque ligne d'association
 * traitée comme une question distincte"), toutes coloriées par le même couple aide/révélation
 * (exercice tenant sur un seul écran — une seule tentative combinée, jamais des lignes retentables
 * indépendamment). Famille A avancée : un élément singulier (catégorie 1) n'a pas de lettre
 * correcte — la ligne l'indique en toutes lettres plutôt que de pointer vers un graphique candidat
 * qui n'a jamais été la bonne réponse d'AUCUN élément (voir `core5e/association.types.ts`). */
export function ResultatPanelAssociation({ resultat, onContinuer, dernier }: Props) {
  const { exercice, niveauAide, revele } = resultat;
  const n = nombreElementsAssociation(exercice);
  const statut = statutRecap(revele, niveauAide);
  const singulier = exercice.famille === "grapheDeriveeAvancee" ? exercice.singulier : undefined;

  function contenuLigne(numero: number) {
    const lettre = lettreCorrecte(exercice.ordreLettres, numero);
    if (exercice.famille === "grapheDerivee") return <PolynomeAssociationGraph coeffs={exercice.fonctions[exercice.ordreLettres[lettre]]} />;
    if (exercice.famille === "grapheVerbal") return <span>{exercice.enonces[lettre]}</span>;
    if (exercice.famille === "grapheDeriveeAvancee") {
      if (singulier?.[numero]) return null;
      return <FonctionRicheAssociationGraph fonction={exercice.fonctions[exercice.ordreLettres[lettre]]} derivee />;
    }
    return <Katex expression={exercice.gLatex[lettre]} />;
  }

  function labelLigne(numero: number): string {
    const reponse = reponseCorrecteAssociation(exercice.ordreLettres, singulier, numero);
    return reponse === "aucune" ? `Élément ${numero + 1} → f' n'existe pas ici` : `Élément ${numero + 1} → ${LETTRES[reponse]}`;
  }

  return (
    <div className="resultat-panel">
      <h2>Récapitulatif</h2>
      {Array.from({ length: n }, (_, numero) => (
        <LigneRecap key={numero} label={labelLigne(numero)} statut={statut}>
          {contenuLigne(numero)}
        </LigneRecap>
      ))}
      <RecapTotalPoints ecrans={Array.from({ length: n }, () => ({ revele, niveauAide }))} />
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {dernier ? "Voir le résumé" : "Exercice suivant"}
      </button>
    </div>
  );
}

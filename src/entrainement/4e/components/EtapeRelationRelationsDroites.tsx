import { useState } from "react";
import type { ExerciceRelationsDroites, RelationReconnue } from "../core/relationsDroites.types";
import { NIVEAU_AIDE_MAX_RELATION } from "../moteur/sessionRelationsDroites";
import { CONSIGNE_RELATION, LIBELLE_RELATION, formatAideRelationNiveau2Latex, formatDonneesRechercheeLatex, formatEnonceLatex, segmentsAideRelationNiveau1 } from "../ui/formatRelationsDroites";
import { ConsigneGeneraleRelationsDroites } from "./ConsigneGeneraleRelationsDroites";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceRelationsDroites;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: RelationReconnue) => void;
  /** Présent une fois l'écran terminé — gèle le choix, remplace "Valider" par `ValidationEcran`. */
  validation?: ValidationEtapeProps | null;
}

const OPTIONS: RelationReconnue[] = ["paralleles", "perpendiculaires", "aucune"];

/**
 * Écran 3 de la famille `reconnaissance` — l'élève reconnaît lui-même la relation entre d₁ et d₂
 * à partir des deux vecteurs directeurs confirmés (récapitulatif), sans qu'elle soit écrite dans
 * l'énoncé (audit chapitre 7, gen45 point 23). UNE seule tentative : trois choix pour trois essais
 * se gagneraient par élimination. Le choix sélectionné n'est marqué qu'après validation
 * (`ValidationEcran`), jamais en rouge avant.
 */
export function EtapeRelationRelationsDroites({ exercice, niveauAide, onActiverAide, onValider, validation }: Props) {
  const [choix, setChoix] = useState<RelationReconnue | null>(null);

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={<ConsigneGeneraleRelationsDroites exercice={exercice} />}
        blocDonnees={
          <div className="equation-box">
            <Katex expression={formatEnonceLatex(exercice)} block />
            <Katex expression={formatDonneesRechercheeLatex(exercice)} block />
          </div>
        }
      />
      <p className="prompt-text">{CONSIGNE_RELATION}</p>

      {/* Une colonne : « Ni parallèles ni perpendiculaires » déborde d'une grille à 2 colonnes à 390 px. */}
      <div className="options-grid" style={{ gridTemplateColumns: "minmax(0, 1fr)" }}>
        {OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            className={choix === option ? "btn toggle-active" : "btn"}
            disabled={!!validation}
            onClick={() => setChoix(option)}
          >
            {LIBELLE_RELATION[option]}
          </button>
        ))}
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>
            <RenduFragments fragments={segmentsAideRelationNiveau1()} />
          </p>
          {niveauAide >= 2 && (
            <p>
              <Katex expression={formatAideRelationNiveau2Latex(exercice)} />
            </p>
          )}
        </div>
      )}
      {!validation && (
        <>
          <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_RELATION} onActiverAide={onActiverAide} />
          <button type="button" className="btn btn-primary" disabled={choix === null} onClick={() => choix && onValider(choix)}>
            Valider
          </button>
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

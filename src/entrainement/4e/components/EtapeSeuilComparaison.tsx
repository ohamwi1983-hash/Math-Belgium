import { useState } from "react";
import type { ExerciceComparaisonSeries, QuestionSeuil } from "../core/comparaisonSeries.types";
import { diagnostiquerSeuil } from "../moteur/verificationComparaisonSeries";
import { niveauAideMax } from "../moteur/sessionComparaisonSeries";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { libelleBoutonAide, segmentsAideSeuilNiveau1, segmentsAideSeuilNiveau2, segmentsConsigneSeuil } from "../ui/formatComparaisonSeries";
import { formatMessageErreur } from "../ui/messageErreur";
import { DonneesComparaisonSeries } from "./DonneesComparaisonSeries";
import { EnonceComparaisonSeries } from "./EnonceComparaisonSeries";
import { SegmentsInline } from "./SegmentsInline";

interface Props {
  exercice: ExerciceComparaisonSeries;
  question: QuestionSeuil;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
}

/** Question "lecture à un seuil / tranche" — un seul champ numérique, statut à 3 valeurs (`correct`/
 * `not_equivalent`/`parse_error`). Compatible variantes "tableaux"/"graphique" uniquement. */
export function EtapeSeuilComparaison({ exercice, question, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [texte, setTexte] = useState("");
  const maxAide = niveauAideMax();
  const complet = texte.trim() !== "";
  const statut = complet && tentativesUtilisees > 0 ? diagnostiquerSeuil(question, texte) : undefined;

  return (
    <div>
      <EnonceComparaisonSeries exercice={exercice} />
      <DonneesComparaisonSeries exercice={exercice} />

      <p className="prompt-text">
        <SegmentsInline segments={segmentsConsigneSeuil(question, exercice)} />
      </p>

      <div className="field field-inline">
        <label className="field-label" htmlFor="comparaison-series-seuil">
          Réponse =
        </label>
        <input
          id="comparaison-series-seuil"
          className={`text-input${statut !== undefined && statut !== "correct" ? " is-erronee" : ""}`}
          placeholder="ex : 7"
          value={texte}
          onChange={(e) => setTexte(filtrerSaisieNumerique(e.target.value))}
          onKeyDown={gererKeyDownNumerique}
        />
      </div>

      {niveauAide >= 1 && (
        <div className="triangle-quelconque-aide">
          <p>
            <SegmentsInline segments={segmentsAideSeuilNiveau1(exercice)} />
          </p>
          {niveauAide >= 2 && (
            <p>
              <SegmentsInline segments={segmentsAideSeuilNiveau2(question, exercice)} />
            </p>
          )}
        </div>
      )}
      <button type="button" className="btn btn-aide" disabled={niveauAide >= maxAide} onClick={onActiverAide}>
        {libelleBoutonAide(niveauAide, maxAide)}
      </button>

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(texte)}>
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, statut)}
        </p>
      )}
    </div>
  );
}

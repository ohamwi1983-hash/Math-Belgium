import { useState } from "react";
import type { ExerciceRelationsDroites } from "../core/relationsDroites.types";
import { NIVEAU_AIDE_MAX_EXTRACTION } from "../moteur/sessionRelationsDroites";
import { diagnostiquerExtraction } from "../moteur/verificationRelationsDroites";
import type { ReponseVecteur } from "../moteur/verificationRelationsDroites";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { PLACEHOLDER_COMPOSANTE, consigneExtraction, formatDonneesRechercheeLatex, formatEnonceLatex, libelleBoutonAide, segmentsAideExtractionNiveau1 } from "../ui/formatRelationsDroites";
import { formatMessageErreur } from "../ui/messageErreur";
import { ConsigneGeneraleRelationsDroites } from "./ConsigneGeneraleRelationsDroites";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";

interface Props {
  exercice: ExerciceRelationsDroites;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseVecteur) => void;
}

/**
 * Écran 1 — extraction d'un vecteur directeur de la droite de référence (2 champs numériques).
 * Vérifiée par colinéarité avec `exercice.vecteurReference` (`diagnostiquerExtraction`), jamais un
 * couple exact imposé — n'importe quel multiple non nul convient. Un seul niveau d'aide.
 */
export function EtapeExtractionRelationsDroites({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [x, setX] = useState("");
  const [y, setY] = useState("");

  const complet = [x, y].every((v) => v.trim() !== "");

  function construireReponse(): ReponseVecteur {
    return { x: Number(x.replace(",", ".")), y: Number(y.replace(",", ".")) };
  }

  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec ? diagnostiquerExtraction(exercice, construireReponse()) : undefined;
  const erronee = apresEchec && statut !== "correct";

  return (
    <div>
      <ConsigneGeneraleRelationsDroites exercice={exercice} />
      <div className="equation-box">
        <Katex expression={formatEnonceLatex(exercice)} block />
        <Katex expression={formatDonneesRechercheeLatex(exercice)} block />
      </div>
      <p className="prompt-text">{consigneExtraction(exercice)}</p>

      <div className="field-row">
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="relations-droites-extraction-x">
            <Katex expression="x_{\vec{u}}=" />
          </label>
          <input
            id="relations-droites-extraction-x"
            className={`text-input${erronee ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COMPOSANTE}
            value={x}
            onChange={(e) => setX(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
        </div>
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="relations-droites-extraction-y">
            <Katex expression="y_{\vec{u}}=" />
          </label>
          <input
            id="relations-droites-extraction-y"
            className={`text-input${erronee ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COMPOSANTE}
            value={y}
            onChange={(e) => setY(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
        </div>
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>
            <RenduFragments fragments={segmentsAideExtractionNiveau1(exercice)} />
          </p>
        </div>
      )}
      <button type="button" className="btn btn-aide" disabled={niveauAide >= NIVEAU_AIDE_MAX_EXTRACTION} onClick={onActiverAide}>
        {libelleBoutonAide(niveauAide, NIVEAU_AIDE_MAX_EXTRACTION)}
      </button>

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(construireReponse())}>
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

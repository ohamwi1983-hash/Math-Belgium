import { useState } from "react";
import type { ExerciceRelationsDroites } from "../core/relationsDroites.types";
import { NIVEAU_AIDE_MAX_CONSTRUCTION } from "../moteur/sessionRelationsDroites";
import { diagnostiquerConstruction } from "../moteur/verificationRelationsDroites";
import type { ReponseVecteur } from "../moteur/verificationRelationsDroites";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import {
  PLACEHOLDER_COMPOSANTE,
  consigneConstruction,
  formatAideConstructionNiveau2Latex,
  formatDonneesRechercheeLatex,
  formatEnonceLatex,
  formatEtatActuelVecteurReferenceLatex,
  libelleBoutonAide,
  segmentsAideConstructionNiveau1,
} from "../ui/formatRelationsDroites";
import { formatMessageErreur } from "../ui/messageErreur";
import { ConsigneGeneraleRelationsDroites } from "./ConsigneGeneraleRelationsDroites";
import { EtatActuelPanel } from "./EtatActuelPanel";
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
 * Écran 2 — construction d'un vecteur directeur de la droite CHERCHÉE, parallèle ou perpendiculaire
 * (selon `exercice.critere`) au vecteur de référence déjà confirmé à l'écran 1. Vérifiée par
 * `diagnostiquerConstruction` (colinéarité ou orthogonalité, jamais un couple exact imposé).
 */
export function EtapeConstructionRelationsDroites({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [x, setX] = useState("");
  const [y, setY] = useState("");

  const complet = [x, y].every((v) => v.trim() !== "");

  function construireReponse(): ReponseVecteur {
    return { x: Number(x.replace(",", ".")), y: Number(y.replace(",", ".")) };
  }

  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec ? diagnostiquerConstruction(exercice, construireReponse()) : undefined;
  const erronee = apresEchec && statut !== "correct";

  return (
    <div>
      <ConsigneGeneraleRelationsDroites exercice={exercice} />
      <div className="equation-box">
        <Katex expression={formatEnonceLatex(exercice)} block />
        <Katex expression={formatDonneesRechercheeLatex(exercice)} block />
      </div>
      <EtatActuelPanel latex={formatEtatActuelVecteurReferenceLatex(exercice)} />
      <p className="prompt-text">{consigneConstruction(exercice)}</p>

      <div className="field-row">
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="relations-droites-construction-x">
            <Katex expression="x_{\vec{v}}=" />
          </label>
          <input
            id="relations-droites-construction-x"
            className={`text-input${erronee ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COMPOSANTE}
            value={x}
            onChange={(e) => setX(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
        </div>
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="relations-droites-construction-y">
            <Katex expression="y_{\vec{v}}=" />
          </label>
          <input
            id="relations-droites-construction-y"
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
            <RenduFragments fragments={segmentsAideConstructionNiveau1(exercice.critere)} />
          </p>
          {niveauAide >= 2 && (
            <p>
              <Katex expression={formatAideConstructionNiveau2Latex(exercice)} />
            </p>
          )}
        </div>
      )}
      <button type="button" className="btn btn-aide" disabled={niveauAide >= NIVEAU_AIDE_MAX_CONSTRUCTION} onClick={onActiverAide}>
        {libelleBoutonAide(niveauAide, NIVEAU_AIDE_MAX_CONSTRUCTION)}
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

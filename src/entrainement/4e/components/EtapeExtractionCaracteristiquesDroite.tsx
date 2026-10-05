import { useState } from "react";
import type { ExerciceCaracteristiquesDroite } from "../core/caracteristiquesDroite.types";
import { NIVEAU_AIDE_MAX_EXTRACTION } from "../moteur/sessionCaracteristiquesDroite";
import { diagnostiquerExtraction } from "../moteur/verificationCaracteristiquesDroite";
import type { ReponseExtraction } from "../moteur/verificationCaracteristiquesDroite";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import {
  PLACEHOLDER_COMPOSANTE,
  PLACEHOLDER_COORDONNEE,
  formatAideExtractionNiveau2Latex,
  formatEnonceLatex,
  libelleBoutonAide,
  segmentsAideExtractionNiveau1,
} from "../ui/formatCaracteristiquesDroite";
import { formatMessageErreur } from "../ui/messageErreur";
import { ConsigneExtractionCaracteristiquesDroite } from "./ConsigneExtractionCaracteristiquesDroite";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";

interface Props {
  exercice: ExerciceCaracteristiquesDroite;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseExtraction) => void;
}

/**
 * Écran 1 — extraction d'un POINT et d'un VECTEUR DIRECTEUR de la droite de départ, 4 champs
 * numériques. Vérifiée par appartenance/proportionnalité (`diagnostiquerExtraction`), jamais par
 * égalité à un couple pré-déterminé — n'importe quel point de la droite avec n'importe quel
 * multiple non nul du vecteur directeur canonique est accepté.
 */
export function EtapeExtractionCaracteristiquesDroite({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [px, setPx] = useState("");
  const [py, setPy] = useState("");
  const [vx, setVx] = useState("");
  const [vy, setVy] = useState("");

  const complet = [px, py, vx, vy].every((v) => v.trim() !== "");

  function construireReponse(): ReponseExtraction {
    return {
      point: { x: Number(px.replace(",", ".")), y: Number(py.replace(",", ".")) },
      vecteur: { x: Number(vx.replace(",", ".")), y: Number(vy.replace(",", ".")) },
    };
  }

  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec ? diagnostiquerExtraction(exercice, construireReponse()) : undefined;
  const erronee = apresEchec && statut !== "correct";

  const champsPoint: { id: string; labelLatex: string; valeur: string; setter: (v: string) => void; placeholder: string }[] = [
    { id: "px", labelLatex: "x_A=", valeur: px, setter: setPx, placeholder: PLACEHOLDER_COORDONNEE },
    { id: "py", labelLatex: "y_A=", valeur: py, setter: setPy, placeholder: PLACEHOLDER_COORDONNEE },
  ];
  const champsVecteur: { id: string; labelLatex: string; valeur: string; setter: (v: string) => void; placeholder: string }[] = [
    { id: "vx", labelLatex: "x_{\\vec{u}}=", valeur: vx, setter: setVx, placeholder: PLACEHOLDER_COMPOSANTE },
    { id: "vy", labelLatex: "y_{\\vec{u}}=", valeur: vy, setter: setVy, placeholder: PLACEHOLDER_COMPOSANTE },
  ];

  return (
    <div>
      <ConsigneExtractionCaracteristiquesDroite exercice={exercice} />
      <div className="equation-box">
        <Katex expression={formatEnonceLatex(exercice)} />
      </div>

      {[champsPoint, champsVecteur].map((paire) => (
        <div key={paire[0]!.id} className="field-row">
          {paire.map((champ) => (
            <div key={champ.id} className="field field-inline">
              <label className="field-label field-label-minuscule" htmlFor={`caracteristiques-droite-extraction-${champ.id}`}>
                <Katex expression={champ.labelLatex} />
              </label>
              <input
                id={`caracteristiques-droite-extraction-${champ.id}`}
                className={`text-input${erronee ? " is-erronee" : ""}`}
                placeholder={champ.placeholder}
                value={champ.valeur}
                onChange={(e) => champ.setter(filtrerSaisieNumerique(e.target.value))}
                onKeyDown={gererKeyDownNumerique}
              />
            </div>
          ))}
        </div>
      ))}

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>
            <RenduFragments fragments={segmentsAideExtractionNiveau1(exercice)} />
          </p>
          {niveauAide >= 2 && (
            <p>
              <Katex expression={formatAideExtractionNiveau2Latex(exercice)} />
            </p>
          )}
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

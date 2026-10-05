import { useState } from "react";
import type { ExerciceConstructionDroite } from "../core/constructionDroite.types";
import { NIVEAU_AIDE_MAX_POINTS } from "../moteur/sessionConstructionDroite";
import { diagnostiquerPoints } from "../moteur/verificationConstructionDroite";
import type { ReponsePoints } from "../moteur/verificationConstructionDroite";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import {
  PLACEHOLDER_COORDONNEE,
  consigneGeneraleTrace,
  consignePoints,
  formatAidePointsNiveau2Latex,
  formatEnonceLatex,
  libelleBoutonAide,
  texteAidePointsNiveau1,
} from "../ui/formatConstructionDroite";
import { formatMessageErreur } from "../ui/messageErreur";
import { Katex } from "./Katex";

interface Props {
  exercice: ExerciceConstructionDroite;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponsePoints) => void;
}

/**
 * Écran 1 — 2 points ENTIERS et distincts de la droite, 4 champs numériques. Vérifiée par
 * APPARTENANCE à la droite (`diagnostiquerPoints`), jamais par égalité à une paire pré-déterminée —
 * n'importe quel couple de points entiers valides est accepté.
 */
export function EtapePointsConstructionDroite({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [x1, setX1] = useState("");
  const [y1, setY1] = useState("");
  const [x2, setX2] = useState("");
  const [y2, setY2] = useState("");

  const complet = [x1, y1, x2, y2].every((v) => v.trim() !== "");

  function construireReponse(): ReponsePoints {
    return {
      x1: Number(x1.replace(",", ".")),
      y1: Number(y1.replace(",", ".")),
      x2: Number(x2.replace(",", ".")),
      y2: Number(y2.replace(",", ".")),
    };
  }

  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec ? diagnostiquerPoints(exercice, construireReponse()) : undefined;
  const erronee = apresEchec && statut !== "correct";

  const champs: { id: string; label: string; valeur: string; setter: (v: string) => void }[][] = [
    [
      { id: "x1", label: "x₁ =", valeur: x1, setter: setX1 },
      { id: "y1", label: "y₁ =", valeur: y1, setter: setY1 },
    ],
    [
      { id: "x2", label: "x₂ =", valeur: x2, setter: setX2 },
      { id: "y2", label: "y₂ =", valeur: y2, setter: setY2 },
    ],
  ];

  return (
    <div>
      <p className="prompt-text">{consigneGeneraleTrace(exercice)}</p>
      <div className="equation-box">
        <Katex expression={formatEnonceLatex(exercice)} />
      </div>
      <p className="prompt-text">{consignePoints(exercice)}</p>

      {champs.map((paire) => (
        <div key={paire[0]!.id} className="field-row">
          {paire.map((champ) => (
            <div key={champ.id} className="field field-inline">
              <label className="field-label field-label-minuscule" htmlFor={`construction-droite-points-${champ.id}`}>
                {champ.label}
              </label>
              <input
                id={`construction-droite-points-${champ.id}`}
                className={`text-input${erronee ? " is-erronee" : ""}`}
                placeholder={PLACEHOLDER_COORDONNEE}
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
          <p>{texteAidePointsNiveau1(exercice)}</p>
          {niveauAide >= 2 && (
            <p>
              <Katex expression={formatAidePointsNiveau2Latex(exercice)} />
            </p>
          )}
        </div>
      )}
      <button type="button" className="btn btn-aide" disabled={niveauAide >= NIVEAU_AIDE_MAX_POINTS} onClick={onActiverAide}>
        {libelleBoutonAide(niveauAide, NIVEAU_AIDE_MAX_POINTS)}
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

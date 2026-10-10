import { useState } from "react";
import type { ExerciceEquationInequationSecondDegre } from "../core/equationInequationSecondDegre.types";
import { diagnostiquerEliminationSysteme } from "../moteur/verificationEquationInequationSecondDegre";
import { NIVEAU_AIDE_MAX_ELIMINER_SYSTEME } from "../moteur/sessionEquationInequationSecondDegre";
import { consigneEliminerSysteme, formatSystemeConfirmeLatex, texteAideEliminerSystemeNiveau1, texteAideEliminerSystemeNiveau2 } from "../ui/formatEquationInequationSecondDegre";
import { formatMessageErreur } from "../ui/messageErreur";
import { EnonceOptimisation } from "./EnonceOptimisation";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { Katex } from "./Katex";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceEquationInequationSecondDegre;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
}

/** Écran 0b (`voieSysteme` uniquement) — relation LINÉAIRE obtenue en soustrayant les 2 équations du
 * système (élimination du terme croisé `xy`). */
export function EtapeEliminerSystemeEquationInequationSecondDegre({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [texte, setTexte] = useState("");
  const complet = texte.trim() !== "";
  const statut = complet ? diagnostiquerEliminationSysteme(exercice, texte) : undefined;

  return (
    <div>
      <EnonceOptimisation exercice={exercice.base} />
      <EtatActuelPanel latex={formatSystemeConfirmeLatex(exercice)} label="Système" />
      <p className="prompt-text">{consigneEliminerSysteme()}</p>
      <div className="field">
        <label className="field-label" htmlFor="equation-inequation-eliminer-systeme">
          Relation linéaire
        </label>
        <input
          id="equation-inequation-eliminer-systeme"
          className={`text-input${tentativesUtilisees > 0 && statut && statut !== "correct" ? " is-erronee" : ""}`}
          placeholder="ex : 3*y-4*x=12"
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
        />
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{texteAideEliminerSystemeNiveau1()}</p>
          {niveauAide >= 2 && (
            <p>
              Relation attendue : <Katex expression={texteAideEliminerSystemeNiveau2(exercice)} />
            </p>
          )}
        </div>
      )}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_ELIMINER_SYSTEME} onActiverAide={onActiverAide} />

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

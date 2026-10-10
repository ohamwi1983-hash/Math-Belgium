import { useState } from "react";
import type { ExerciceEquationInequationSecondDegre } from "../core/equationInequationSecondDegre.types";
import { diagnostiquerPoserEquationInequation } from "../moteur/verificationEquationInequationSecondDegre";
import { NIVEAU_AIDE_MAX_POSER_EQUATION_INEQUATION } from "../moteur/sessionEquationInequationSecondDegre";
import { consignePoserEquationInequation, formatDonneesConfirmeesLatex, texteAidePoserEquationInequationNiveau1, texteAidePoserEquationInequationNiveau2 } from "../ui/formatEquationInequationSecondDegre";
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

/** Écran 4 — traduire le seuil de l'énoncé (`exercice.k`, jamais mentionné dans la phrase narrative)
 * en équation/inéquation `f(x) [=/>/<] k`. */
export function EtapePoserEquationInequationSecondDegre({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [texte, setTexte] = useState("");
  const complet = texte.trim() !== "";
  const statut = complet ? diagnostiquerPoserEquationInequation(exercice, texte) : undefined;
  const label = exercice.variante === "equation" ? "Équation" : "Inéquation";

  return (
    <div>
      <EnonceOptimisation exercice={exercice.base} />
      <EtatActuelPanel latex={formatDonneesConfirmeesLatex(exercice)} />
      <p className="prompt-text">{consignePoserEquationInequation(exercice)}</p>
      <div className="field">
        <label className="field-label" htmlFor="equation-inequation-poser">
          {label}
        </label>
        <input
          id="equation-inequation-poser"
          className={`text-input${tentativesUtilisees > 0 && statut && statut !== "correct" ? " is-erronee" : ""}`}
          placeholder={exercice.variante === "equation" ? "ex : -x^2+20x=91" : "ex : -x^2+20x>91"}
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
        />
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{texteAidePoserEquationInequationNiveau1()}</p>
          {niveauAide >= 2 && (
            <p>
              Relation à traduire : <Katex expression={texteAidePoserEquationInequationNiveau2(exercice)} />
            </p>
          )}
        </div>
      )}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_POSER_EQUATION_INEQUATION} onActiverAide={onActiverAide} />

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

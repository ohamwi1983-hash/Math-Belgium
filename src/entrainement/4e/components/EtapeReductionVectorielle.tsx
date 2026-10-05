import { useState } from "react";
import type { ExerciceReductionVectorielle } from "../core/reductionVectorielle.types";
import { Katex } from "./Katex";
import { OutilTraceVecteurs } from "./OutilTraceVecteurs";
import { FIGURES } from "../generateurs/reductionVectorielle/figures";
import { formatTermesLatex, libelleFigure } from "../ui/formatReductionVectorielle";
import { diagnostiquerReduction } from "../moteur/verificationReductionVectorielle";
import { formatMessageErreur } from "../ui/messageErreur";

interface Props {
  exercice: ExerciceReductionVectorielle;
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (texte: string) => void;
}

/** Unique écran de l'exercice : la figure (bloc fixe, coordonnées toujours identiques pour une
 * même figure, avec un outil de traçage de vecteurs FACULTATIF superposé — `OutilTraceVecteurs`,
 * jamais consommé par la vérification), l'expression à réduire mise en évidence (terme par terme,
 * `.equation-box-termes`, pour rester lisible sur mobile même à 7 termes), puis un champ libre pour
 * la réponse (2 lettres désignant le vecteur réduit, ex. "MA"). */
export function EtapeReductionVectorielle({ exercice, tentativesUtilisees, tentativesMax, onValider }: Props) {
  const [texte, setTexte] = useState("");
  const complet = texte.trim() !== "";
  const statut = complet && tentativesUtilisees > 0 ? diagnostiquerReduction(exercice, texte) : undefined;
  const erronee = statut !== undefined && statut !== "correct";

  return (
    <div>
      <p className="prompt-text">{libelleFigure(exercice)}</p>
      <OutilTraceVecteurs points={exercice.points} aretes={FIGURES[exercice.figure].aretes} />
      <p className="prompt-text">Réduis l'expression suivante en un seul vecteur.</p>
      <div className="equation-box">
        <div className="equation-box-termes">
          {formatTermesLatex(exercice).map((terme, i) => (
            <Katex key={i} expression={terme} />
          ))}
        </div>
      </div>

      <div className="field field-inline">
        <label className="field-label" htmlFor="reduction-vectorielle-reponse">
          Vecteur réduit =
        </label>
        <input
          id="reduction-vectorielle-reponse"
          className={`text-input${erronee ? " is-erronee" : ""}`}
          placeholder="ex : MA"
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
        />
      </div>
      {statut === "parse_error" && <p className="alert-error">{formatMessageErreur(tentativesUtilisees, tentativesMax, "parse_error")}</p>}

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(texte)}>
        Valider
      </button>
      {tentativesUtilisees > 0 && statut !== "parse_error" && (
        <p className="alert-error" role="alert">
          Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
        </p>
      )}
    </div>
  );
}

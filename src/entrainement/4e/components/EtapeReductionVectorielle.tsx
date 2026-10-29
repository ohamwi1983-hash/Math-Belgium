import { useState } from "react";
import type { ExerciceReductionVectorielle } from "../core/reductionVectorielle.types";
import { Katex } from "./Katex";
import { OutilTraceVecteurs } from "./OutilTraceVecteurs";
import { FIGURES } from "../generateurs/reductionVectorielle/figures";
import { aideReductionNiveau1, aideReductionNiveau2, formatTermesLatex, libelleFigure } from "../ui/formatReductionVectorielle";
import { NIVEAU_AIDE_MAX_REDUCTION } from "../moteur/typesReductionVectorielle";
import { BoutonAide } from "./BoutonAide";
import { SegmentsInline } from "./SegmentsInline";
import { diagnostiquerReduction } from "../moteur/verificationReductionVectorielle";
import { formatMessageErreur } from "../ui/messageErreur";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";

interface Props {
  exercice: ExerciceReductionVectorielle;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Unique écran de l'exercice : la figure (bloc fixe, coordonnées toujours identiques pour une
 * même figure, avec un outil de traçage de vecteurs FACULTATIF superposé — `OutilTraceVecteurs`,
 * jamais consommé par la vérification), l'expression à réduire mise en évidence (terme par terme,
 * `.equation-box-termes`, pour rester lisible sur mobile même à 7 termes), puis un champ libre pour
 * la réponse (2 lettres désignant le vecteur réduit, ex. "MA"). */
export function EtapeReductionVectorielle({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation }: Props) {
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
          placeholder="ex : PQ"
          value={texte}
          disabled={!!validation}
          onChange={(e) => setTexte(e.target.value)}
        />
      </div>
      {statut === "parse_error" && <p className="alert-error">{formatMessageErreur(tentativesUtilisees, tentativesMax, "parse_error")}</p>}

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          {aideReductionNiveau1().map((ligne, i) => (
            <p key={`n1-${i}`}>
              <SegmentsInline segments={ligne} />
            </p>
          ))}
          {niveauAide >= 2 &&
            aideReductionNiveau2(exercice).map((ligne, i) => (
              <p key={`n2-${i}`}>
                <SegmentsInline segments={ligne} />
              </p>
            ))}
        </div>
      )}

      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_REDUCTION} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(texte)}>
          Valider
        </button>
        {tentativesUtilisees > 0 && statut !== "parse_error" && (
          <p className="alert-error" role="alert">
            Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

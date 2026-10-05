import { useState } from "react";
import type { ExerciceTranslationRV } from "../core/relationVectorielle.types";
import { diagnostiquerCoordonnees, diagnostiquerX, diagnostiquerY } from "../moteur/verificationRelationVectorielle";
import { consigneRelationVectorielle, formatLabelXLatex, formatLabelYLatex, formatTermesDonneesConnuesLatex } from "../ui/formatRelationVectorielle";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { formatMessageErreur } from "../ui/messageErreur";
import { AideRelationVectorielle } from "./AideRelationVectorielle";
import { Katex } from "./Katex";

interface Props {
  exercice: ExerciceTranslationRV;
  tentativesUtilisees: number;
  tentativesMax: number;
  aideActivee: boolean;
  onActiverAide: () => void;
  onValider: (x: number, y: number) => void;
}

/**
 * Écran unique de la variante `translation` — seule phase, `"coordonnees"`, jamais de traduction
 * symbolique (déplacement direct, rien à traduire). 2 champs numériques SÉPARÉS (jamais un champ
 * couple unique) — objectif explicite de la spec : isoler une éventuelle erreur de signe sur une
 * seule coordonnée. Marquage rouge EN DIRECT du seul champ fautif après un échec (`diagnostiquerX`/
 * `diagnostiquerY`, disparaît dès correction — même principe que `classeCurseur`/
 * `celluleEstErronee` ailleurs dans le projet).
 */
export function EtapeTranslationVectorielle({ exercice, tentativesUtilisees, tentativesMax, aideActivee, onActiverAide, onValider }: Props) {
  const [texteX, setTexteX] = useState("");
  const [texteY, setTexteY] = useState("");

  const complet = texteX.trim() !== "" && texteY.trim() !== "";
  const x = Number(texteX.replace(",", "."));
  const y = Number(texteY.replace(",", "."));
  const statut = complet ? diagnostiquerCoordonnees(exercice, x, y) : undefined;

  const apresEchec = tentativesUtilisees > 0;
  const xErronee = apresEchec && diagnostiquerX(exercice, x) !== "correct";
  const yErronee = apresEchec && diagnostiquerY(exercice, y) !== "correct";

  const consigne = consigneRelationVectorielle(exercice);

  return (
    <div>
      <p className="prompt-text">
        {consigne.avant}
        {consigne.latex && <Katex expression={consigne.latex} />}
        {consigne.apres}
      </p>
      <div className="equation-box equation-box-termes">
        {formatTermesDonneesConnuesLatex(exercice).map((terme, i) => (
          <Katex key={i} expression={terme} />
        ))}
      </div>

      <div className="field-row">
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="relation-vectorielle-translation-x">
            <Katex expression={formatLabelXLatex(exercice)} />
          </label>
          <input
            id="relation-vectorielle-translation-x"
            className={`text-input${xErronee ? " is-erronee" : ""}`}
            placeholder="ex : 3"
            value={texteX}
            onChange={(e) => setTexteX(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
        </div>
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="relation-vectorielle-translation-y">
            <Katex expression={formatLabelYLatex(exercice)} />
          </label>
          <input
            id="relation-vectorielle-translation-y"
            className={`text-input${yErronee ? " is-erronee" : ""}`}
            placeholder="ex : -2"
            value={texteY}
            onChange={(e) => setTexteY(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
        </div>
      </div>

      <AideRelationVectorielle exercice={exercice} aideActivee={aideActivee} onActiverAide={onActiverAide} />

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(x, y)}>
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

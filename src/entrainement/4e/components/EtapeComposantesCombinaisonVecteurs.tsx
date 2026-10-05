import { useState } from "react";
import type { ExerciceCombinaisonVecteurs } from "../core/combinaisonVecteurs.types";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { diagnostiquerComposantes, diagnostiquerX, diagnostiquerY } from "../moteur/verificationCombinaisonVecteurs";
import { NIVEAU_AIDE_MAX_COMPOSANTES } from "../moteur/sessionCombinaisonVecteurs";
import {
  formatLabelXLatex,
  formatLabelYLatex,
  formatResultatLatex,
  formatSommeAxesLatex,
  formatSubstitutionLatex,
  formatTermesDonneesLatex,
  libelleBoutonAide,
} from "../ui/formatCombinaisonVecteurs";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { formatMessageErreur } from "../ui/messageErreur";
import { Katex } from "./Katex";
import { RecapitulatifPanel } from "./RecapitulatifPanel";

interface Props {
  exercice: ExerciceCombinaisonVecteurs;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  recapitulatif: EntreeRecapitulatif[];
  onActiverAide: () => void;
  onValider: (reponse: { x: number; y: number }) => void;
}

/**
 * Écran 2 (dernier) — calcul numérique final, une fois l'expression réduite confirmée (rappelée
 * via le récapitulatif, jamais recalculée différemment). 2 champs séparés (x, y) — marquage rouge
 * en direct du seul champ fautif après un échec, même principe que "Point à partir d'une relation
 * vectorielle". Labels `x_{\vec t} =`/`y_{\vec t} =` (KaTeX) sur la même ligne que leur champ
 * (`field-inline`, `promptcorrectionsgenerateur21notationinterface.md`, correction 6).
 *
 * 2 niveaux d'aide progressive : substitution des composantes réelles terme à terme (pas encore
 * sommée), puis la somme des composantes x d'un côté et des composantes y de l'autre, séparément —
 * jamais le résultat final combiné avant validation.
 *
 * `promptmodificationsgenerateur22.md`, point 2 : bloc de données (vecteurs libres + points)
 * répété sur cet écran (jusque-là absent, seul le `RecapitulatifPanel` — la forme réduite déjà
 * confirmée à l'écran 1 — y était affiché), en "bloc fitter" (`formatTermesDonneesLatex`), au-dessus
 * du récapitulatif.
 */
export function EtapeComposantesCombinaisonVecteurs({
  exercice,
  tentativesUtilisees,
  tentativesMax,
  niveauAide,
  recapitulatif,
  onActiverAide,
  onValider,
}: Props) {
  const [texteX, setTexteX] = useState("");
  const [texteY, setTexteY] = useState("");

  const x = Number(texteX.replace(",", "."));
  const y = Number(texteY.replace(",", "."));
  const complet = texteX.trim() !== "" && texteY.trim() !== "";
  const statut = complet ? diagnostiquerComposantes(exercice, x, y) : undefined;

  const apresEchec = tentativesUtilisees > 0;
  const xErronee = apresEchec && diagnostiquerX(exercice, x) !== "correct";
  const yErronee = apresEchec && diagnostiquerY(exercice, y) !== "correct";

  const sommeAxes = niveauAide >= 2 ? formatSommeAxesLatex(exercice) : null;

  return (
    <div>
      <div className="equation-box equation-box-termes">
        {formatTermesDonneesLatex(exercice).map((terme, i) => (
          <Katex key={i} expression={terme} />
        ))}
      </div>
      <RecapitulatifPanel entrees={recapitulatif} />
      <p className="prompt-text">
        Calcule les composantes de <Katex expression={formatResultatLatex(exercice)} />.
      </p>

      <div className="field-row">
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="combinaison-composantes-x">
            <Katex expression={formatLabelXLatex(exercice)} />
          </label>
          <input
            id="combinaison-composantes-x"
            className={`text-input${xErronee ? " is-erronee" : ""}`}
            value={texteX}
            onChange={(e) => setTexteX(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
        </div>
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="combinaison-composantes-y">
            <Katex expression={formatLabelYLatex(exercice)} />
          </label>
          <input
            id="combinaison-composantes-y"
            className={`text-input${yErronee ? " is-erronee" : ""}`}
            value={texteY}
            onChange={(e) => setTexteY(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
        </div>
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>
            <Katex expression={formatSubstitutionLatex(exercice)} />
          </p>
          {sommeAxes && (
            <>
              <p>
                <Katex expression={sommeAxes.x} />
              </p>
              <p>
                <Katex expression={sommeAxes.y} />
              </p>
            </>
          )}
        </div>
      )}
      <button type="button" className="btn btn-aide" disabled={niveauAide >= NIVEAU_AIDE_MAX_COMPOSANTES} onClick={onActiverAide}>
        {libelleBoutonAide(niveauAide, NIVEAU_AIDE_MAX_COMPOSANTES)}
      </button>

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider({ x, y })}>
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

import { useState } from "react";
import type { ExerciceContexteEconomiqueB } from "../core5e/contexteEconomique.types";
import { consigneEcran, consigneGenerale, formatTermesDonneesLatex, questionFinale, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatContexteEconomique";
import { Katex } from "../components/Katex";
import { QuestionFinale } from "../components/QuestionFinale";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelContexteEconomique } from "./EtatActuelContexteEconomique";

interface Props {
  exercice: ExerciceContexteEconomiqueB;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: boolean) => void;
}

/** Écran "confirmationCoherence" — question à part entière (jamais supposée) : le maximum de B
 * se situe-t-il à la même valeur de x que la solution retenue à l'étape "Égalité des
 * marginales" ? Toujours vraie par construction (`Cm(x)-Rm(x) ≡ -B'(x)` exactement, voir
 * `generateurs5e/contexteEconomique/index.ts`), mais l'élève doit néanmoins la confirmer
 * explicitement. */
export function EtapeConfirmationCoherence({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [reponse, setReponse] = useState<boolean | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = reponse !== null;

  function valider() {
    if (!complet) return;
    onValider(reponse as boolean);
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale(exercice)}</p>
      <div className="equation-box equation-box-donnees">
        {formatTermesDonneesLatex(exercice).map((frag, i) => (
          <Katex key={i} expression={frag} />
        ))}
      </div>
      <QuestionFinale question={questionFinale(exercice)} />
      <EtatActuelContexteEconomique exercice={exercice} ecran="confirmationCoherence" />
      <p className="prompt-text">{consigneEcran(exercice, "confirmationCoherence")}</p>

      <div className="options-grid-compact">
        <button type="button" className={`btn${reponse === true ? " toggle-active" : ""}`} onClick={() => setReponse(true)}>
          Oui, même valeur de x
        </button>
        <button type="button" className={`btn${reponse === false ? " toggle-active" : ""}${montrerErreurs && reponse === false ? " is-erronee" : ""}`} onClick={() => setReponse(false)}>
          Non, valeur différente
        </button>
      </div>

      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideNiveau1("confirmationCoherence")}</p>
          {niveauAide >= 2 && <p>{texteAideNiveau2(exercice, "confirmationCoherence")}</p>}
        </div>
      )}
    </div>
  );
}

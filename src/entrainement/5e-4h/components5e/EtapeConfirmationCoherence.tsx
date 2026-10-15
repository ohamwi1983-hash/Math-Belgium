import { useState } from "react";
import type { ExerciceContexteEconomiqueB } from "../core5e/contexteEconomique.types";
import { consigneEcran, consigneGenerale, formatTermesDonneesLatex, questionFinale, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatContexteEconomique";
import { Katex } from "../components/Katex";
import { QuestionFinale } from "../components/QuestionFinale";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceContexteEconomiqueB;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: boolean) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran "confirmationCoherence" — question à part entière (jamais supposée) : le maximum de B
 * se situe-t-il à la même valeur de x que la solution retenue à l'étape "Égalité des
 * marginales" ? Toujours vraie par construction (`Cm(x)-Rm(x) ≡ -B'(x)` exactement, voir
 * `generateurs5e/contexteEconomique/index.ts`), mais l'élève doit néanmoins la confirmer
 * explicitement. */
export function EtapeConfirmationCoherence({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation}: Props) {
  const [reponse, setReponse] = useState<boolean | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = reponse !== null;

  function valider() {
    if (!complet) return;
    onValider(reponse as boolean);
  }

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={consigneGenerale(exercice)}
        blocDonnees={
          <div className="equation-box equation-box-donnees">
            {formatTermesDonneesLatex(exercice).map((frag, i) => (
              <Katex key={i} expression={frag} />
            ))}
          </div>
        }
      />
      <QuestionFinale question={questionFinale(exercice)} />
      <p className="prompt-text">{consigneEcran(exercice, "confirmationCoherence")}</p>

      <div className="options-grid-compact">
        <button type="button" className={`btn${reponse === true ? " toggle-active" : ""}`} onClick={() => setReponse(true)}>
          Oui, même valeur de x
        </button>
        <button type="button" className={`btn${reponse === false ? " toggle-active" : ""}${montrerErreurs && reponse === false ? " is-erronee" : ""}`} onClick={() => setReponse(false)}>
          Non, valeur différente
        </button>
      </div>

      {niveauAide >= 1 && (
        <div className="aide-5e">
          {(() => {
            const aide1 = texteAideNiveau1("confirmationCoherence");
            return (
              <>
                <p>{aide1.texte}</p>
                {aide1.latex && <Katex expression={aide1.latex} block />}
              </>
            );
          })()}
          {niveauAide >= 2 &&
            (() => {
              const aide2 = texteAideNiveau2(exercice, "confirmationCoherence");
              return (
                <>
                  <p>{aide2.texte}</p>
                  {aide2.latex && <Katex expression={aide2.latex} block />}
                </>
              );
            })()}
        </div>
      )}
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
          Valider
        </button>
        {montrerErreurs && (
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

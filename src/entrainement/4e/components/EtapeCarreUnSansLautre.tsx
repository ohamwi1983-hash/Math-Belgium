import { useState } from "react";
import type { ExerciceUnSansLautre } from "../core/unSansLautre.types";
import { Katex } from "./Katex";
import { formatCarreLatex, formatIntervalleLatex, formatValeurConnueLatex, PLACEHOLDER_CARRE } from "../ui/formatUnSansLautre";
import { diagnostiquerCarre } from "../moteur/verificationUnSansLautre";
import { formatMessageErreur } from "../ui/messageErreur";
import { filtrerSaisieNumeriqueRacine, gererKeyDownNumeriqueRacine } from "../ui/bloquerSaisieNonNumeriqueRacine";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceUnSansLautre;
  tentativesUtilisees: number;
  tentativesMax: number;
  aideActivee: boolean;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
}

/** Première étape (toujours la même, jamais d'écran "énoncé" séparé) : le bloc énoncé (valeur
 * donnée + intervalle sur θ) est affiché ici et persiste, complété, sur les 2 écrans suivants. */
export function EtapeCarreUnSansLautre({ exercice, tentativesUtilisees, tentativesMax, aideActivee, onActiverAide, onValider }: Props) {
  const [texte, setTexte] = useState("");

  const complet = texte.trim() !== "";
  const statut = complet ? diagnostiquerCarre(exercice, texte) : undefined;

  return (
    <div>
      <div className="equation-box">
        <Katex expression={formatValeurConnueLatex(exercice)} block />
        <Katex expression={formatIntervalleLatex(exercice)} block />
      </div>
      <p className="prompt-text">
        Quelle est la valeur de <Katex expression={formatCarreLatex(exercice.fonctionCible)} /> ? (forme exacte ou
        décimale arrondie au centième)
      </p>
      <div className="field">
        <label className="field-label" htmlFor="un-sans-lautre-carre">
          Réponse
        </label>
        <input
          id="un-sans-lautre-carre"
          className={`text-input${tentativesUtilisees > 0 && statut && statut !== "correct" ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_CARRE}
          value={texte}
          onChange={(e) => setTexte(filtrerSaisieNumeriqueRacine(e.target.value))}
          onKeyDown={gererKeyDownNumeriqueRacine}
        />
      </div>

      <div>
        {aideActivee && (
          <div className="equation-box">
            <Katex expression="\cos^2\theta + \sin^2\theta = 1" block />
            <Katex
              expression={`${formatCarreLatex(exercice.fonctionCible)} = 1 - ${formatCarreLatex(exercice.fonctionConnue)}`}
              block
            />
          </div>
        )}
        <BoutonAide niveauAide={aideActivee ? 1 : 0} niveauAideMax={1} onActiverAide={onActiverAide} />
      </div>

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

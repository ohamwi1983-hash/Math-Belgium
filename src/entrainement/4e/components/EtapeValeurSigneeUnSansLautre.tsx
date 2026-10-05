import { useState } from "react";
import type { ExerciceUnSansLautre } from "../core/unSansLautre.types";
import { Katex } from "./Katex";
import {
  formatCarreCibleLatex,
  formatCarreLatex,
  formatFonctionCibleLatex,
  formatIntervalleLatex,
  formatSigneCibleLatex,
  formatValeurConnueLatex,
  libelleQuadrantUnSansLautre,
  PLACEHOLDER_VALEUR_SIGNEE,
} from "../ui/formatUnSansLautre";
import { diagnostiquerValeurSignee } from "../moteur/verificationUnSansLautre";
import { formatMessageErreur } from "../ui/messageErreur";
import { filtrerSaisieNumeriqueRacine, gererKeyDownNumeriqueRacine } from "../ui/bloquerSaisieNonNumeriqueRacine";

interface Props {
  exercice: ExerciceUnSansLautre;
  tentativesUtilisees: number;
  tentativesMax: number;
  aideActivee: boolean;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
}

/** Deuxième étape — le bloc contexte reprend l'énoncé ET le résultat confirmé de l'écran 1 (le
 * carré cible, toujours dérivé directement de l'exercice — jamais la saisie de l'élève). */
export function EtapeValeurSigneeUnSansLautre({ exercice, tentativesUtilisees, tentativesMax, aideActivee, onActiverAide, onValider }: Props) {
  const [texte, setTexte] = useState("");

  const complet = texte.trim() !== "";
  const statut = complet ? diagnostiquerValeurSignee(exercice, texte) : undefined;

  return (
    <div>
      <div className="equation-box">
        <Katex expression={formatValeurConnueLatex(exercice)} block />
        <Katex expression={formatIntervalleLatex(exercice)} block />
        <Katex expression={`${formatCarreLatex(exercice.fonctionCible)} = ${formatCarreCibleLatex(exercice)}`} block />
      </div>
      <p className="prompt-text">
        Quelle est la valeur de <Katex expression={formatFonctionCibleLatex(exercice)} /> ? (forme exacte ou décimale
        arrondie au centième)
      </p>
      <div className="field">
        <label className="field-label" htmlFor="un-sans-lautre-valeur-signee">
          Réponse
        </label>
        <input
          id="un-sans-lautre-valeur-signee"
          className={`text-input${tentativesUtilisees > 0 && statut && statut !== "correct" ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_VALEUR_SIGNEE}
          value={texte}
          onChange={(e) => setTexte(filtrerSaisieNumeriqueRacine(e.target.value))}
          onKeyDown={gererKeyDownNumeriqueRacine}
        />
      </div>

      <div>
        {aideActivee && (
          <p className="prompt-text">
            θ appartient au quadrant {libelleQuadrantUnSansLautre(exercice.quadrant)}, donc <Katex expression={formatSigneCibleLatex(exercice)} />.
          </p>
        )}
        <button type="button" className="btn btn-aide" disabled={aideActivee} onClick={onActiverAide}>
          {aideActivee ? "Aide utilisée" : "Aide"}
        </button>
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

import { useState } from "react";
import type { ExerciceUnSansLautre } from "../core/unSansLautre.types";
import { Katex } from "./Katex";
import {
  formatCarreCibleLatex,
  formatCarreLatex,
  formatFonctionCibleLatex,
  formatIntervalleLatex,
  formatValeurCibleSimplifieeLatex,
  formatValeurConnueLatex,
  PLACEHOLDER_TANGENTE,
} from "../ui/formatUnSansLautre";
import { diagnostiquerTangente } from "../moteur/verificationUnSansLautre";
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

/** Troisième et dernière étape — le bloc contexte reprend l'énoncé ET les deux résultats
 * confirmés précédents (carré, puis valeur signée). */
export function EtapeTangenteUnSansLautre({ exercice, tentativesUtilisees, tentativesMax, aideActivee, onActiverAide, onValider }: Props) {
  const [texte, setTexte] = useState("");

  const complet = texte.trim() !== "";
  const statut = complet ? diagnostiquerTangente(exercice, texte) : undefined;

  return (
    <div>
      <div className="equation-box">
        <Katex expression={formatValeurConnueLatex(exercice)} block />
        <Katex expression={formatIntervalleLatex(exercice)} block />
        <Katex expression={`${formatCarreLatex(exercice.fonctionCible)} = ${formatCarreCibleLatex(exercice)}`} block />
        <Katex expression={`${formatFonctionCibleLatex(exercice)} = ${formatValeurCibleSimplifieeLatex(exercice)}`} block />
      </div>
      <p className="prompt-text">
        Quelle est la valeur de <Katex expression="\tan\theta" /> ? (forme exacte ou décimale arrondie au centième)
      </p>
      <div className="field">
        <label className="field-label" htmlFor="un-sans-lautre-tangente">
          Réponse
        </label>
        <input
          id="un-sans-lautre-tangente"
          className={`text-input${tentativesUtilisees > 0 && statut && statut !== "correct" ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_TANGENTE}
          value={texte}
          onChange={(e) => setTexte(filtrerSaisieNumeriqueRacine(e.target.value))}
          onKeyDown={gererKeyDownNumeriqueRacine}
        />
      </div>

      <div>
        {aideActivee && (
          <div className="equation-box">
            <Katex expression="\tan\theta = \dfrac{\sin\theta}{\cos\theta}" block />
          </div>
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

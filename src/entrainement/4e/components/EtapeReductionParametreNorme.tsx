import { useState } from "react";
import type { ExerciceParametreNorme } from "../core/normeDistance.types";
import { diagnostiquerReductionParametreNorme } from "../moteur/verificationNormeDistance";
import { NIVEAU_AIDE_MAX } from "../moteur/typesNormeDistance";
import {
  FORMULE_GENERALE_NORME_PARAMETRE_LATEX,
  PLACEHOLDER_EQUATION_PARAMETRE,
  formatAideNormeSubstitueeParametreLatex,
  formatTermesEnonceParametreLatex,
  libelleBoutonAide,
  segmentsConsigneParametre,
} from "../ui/formatNormeDistance";
import { formatMessageErreur } from "../ui/messageErreur";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";

interface Props {
  exercice: ExerciceParametreNorme;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
}

/**
 * Écran "réduction" — variante 5, écran 1 : un seul champ de texte libre où l'élève écrit
 * l'équation développée et réduite complète (`x^2-8x+97=0`), vérifiée par équivalence algébrique
 * (`promptgen26refontecomplete.md`, Partie C — remplace les 3 anciens champs numériques a/b/c).
 * Aide progressive à 2 niveaux : rappel générique de la formule de la norme en notation
 * $x_{\vec v}$/$y_{\vec v}$ (niveau 1), puis substituée avec les valeurs réelles, non résolue
 * (niveau 2).
 */
export function EtapeReductionParametreNorme({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [texte, setTexte] = useState("");
  const max = NIVEAU_AIDE_MAX.reductionParametreNorme;
  const complet = texte.trim() !== "";
  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec ? diagnostiquerReductionParametreNorme(exercice, texte) : undefined;
  const erronee = apresEchec && statut !== "correct";

  return (
    <div>
      <p className="prompt-text">
        <RenduFragments fragments={segmentsConsigneParametre(exercice)} />
      </p>
      <div className="equation-box equation-box-termes">
        {formatTermesEnonceParametreLatex(exercice).map((terme, i) => (
          <Katex key={i} expression={terme} />
        ))}
      </div>
      <p className="prompt-text">Développe et réduis cette équation à la forme ax²+bx+c=0.</p>

      <div className="field">
        <label className="field-label field-label-minuscule" htmlFor="norme-distance-reduction-equation">
          Équation :
        </label>
        <input
          id="norme-distance-reduction-equation"
          className={`text-input${erronee ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_EQUATION_PARAMETRE}
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
        />
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>
            Rappel : <Katex expression={FORMULE_GENERALE_NORME_PARAMETRE_LATEX} />
          </p>
          {niveauAide >= 2 && (
            <p>
              Formule substituée : <Katex expression={formatAideNormeSubstitueeParametreLatex(exercice)} />
            </p>
          )}
        </div>
      )}
      {max > 0 && (
        <button type="button" className="btn btn-aide" disabled={niveauAide >= max} onClick={onActiverAide}>
          {libelleBoutonAide(niveauAide, max)}
        </button>
      )}

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

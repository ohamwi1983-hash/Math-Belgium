import { useState } from "react";
import type { ExerciceDistance } from "../core/normeDistance.types";
import { diagnostiquerCalculDistance } from "../moteur/verificationNormeDistance";
import { NIVEAU_AIDE_MAX } from "../moteur/typesNormeDistance";
import { CONSIGNE_GENERALE_DISTANCE, FORMULE_GENERALE_DISTANCE_LATEX, PLACEHOLDER_NORME, formatTermesDonneesDistanceLatex, formatVecteurLatex, formuleSubstitueeNormeLatex } from "../ui/formatNormeDistance";
import { formatMessageErreur } from "../ui/messageErreur";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { Katex } from "./Katex";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceDistance;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
}

/**
 * Écran "calcul" — variante 2, écran 2 (dernier) : consigne générale + bloc de données redondant +
 * bloc "état actuel" (AB⃗ déjà confirmé à l'écran précédent, inchangé) + un champ de texte libre
 * pour `dist(A,B)` (label reformulé, fraction/irrationnel irréductible acceptés —
 * `promptgen26refontecomplete.md`, Partie F). Aide à 2 niveaux, texte seul.
 */
export function EtapeCalculDistance({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [texte, setTexte] = useState("");
  const max = NIVEAU_AIDE_MAX.calculDistance;
  const complet = texte.trim() !== "";
  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec ? diagnostiquerCalculDistance(exercice, texte) : undefined;
  const erronee = apresEchec && statut !== "correct";

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_DISTANCE}</p>
      <div className="equation-box equation-box-termes">
        {formatTermesDonneesDistanceLatex(exercice).map((t, i) => (
          <Katex key={i} expression={t} />
        ))}
      </div>
      <EtatActuelPanel latex={formatVecteurLatex(`${exercice.labelA}${exercice.labelB}`, exercice.vecteurAB)} />
      <p className="prompt-text">Calcule la distance entre ces deux points.</p>

      <div className="field field-inline">
        <label className="field-label" htmlFor="norme-distance-calcul">
          dist(A,B) =
        </label>
        <input
          id="norme-distance-calcul"
          className={`text-input${erronee ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_NORME}
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
        />
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>
            Rappel : <Katex expression={FORMULE_GENERALE_DISTANCE_LATEX} />
          </p>
          {niveauAide >= 2 && (
            <p>
              Formule substituée : <Katex expression={formuleSubstitueeNormeLatex(exercice.vecteurAB)} />
            </p>
          )}
        </div>
      )}
      {max > 0 && (
        <BoutonAide niveauAide={niveauAide} niveauAideMax={max} onActiverAide={onActiverAide} />
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

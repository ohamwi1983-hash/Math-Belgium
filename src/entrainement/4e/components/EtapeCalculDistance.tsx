import { useState } from "react";
import type { ExerciceDistance } from "../core/normeDistance.types";
import { diagnostiquerCalculDistance } from "../moteur/verificationNormeDistance";
import { NIVEAU_AIDE_MAX } from "../moteur/typesNormeDistance";
import { CONSIGNE_GENERALE_DISTANCE, FORMULE_GENERALE_DISTANCE_LATEX, PLACEHOLDER_NORME, formatTermesDonneesDistanceLatex, formuleSubstitueeNormeLatex } from "../ui/formatNormeDistance";
import { formatMessageErreur } from "../ui/messageErreur";
import { Katex } from "./Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceDistance;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran "calcul" — variante 2, écran 2 (dernier) : consigne générale + bloc de données redondant
 * (AB⃗, déjà confirmé à l'écran précédent et listé dans le récapitulatif "Ce qu'on sait déjà") +
 * un champ de texte libre pour `dist(A,B)` (label reformulé, fraction/irrationnel irréductible
 * acceptés — `promptgen26refontecomplete.md`, Partie F). Aide à 2 niveaux, texte seul.
 */
export function EtapeCalculDistance({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation }: Props) {
  const [texte, setTexte] = useState("");
  const max = NIVEAU_AIDE_MAX.calculDistance;
  const complet = texte.trim() !== "";
  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec ? diagnostiquerCalculDistance(exercice, texte) : undefined;
  const erronee = apresEchec && statut !== "correct";

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={CONSIGNE_GENERALE_DISTANCE}
        blocDonnees={
          <div className="equation-box equation-box-termes">
            {formatTermesDonneesDistanceLatex(exercice).map((t, i) => (
              <Katex key={i} expression={t} />
            ))}
          </div>
        }
      />
      <p className="prompt-text">Calcule la distance entre ces deux points.</p>

      <div className="field field-inline">
        <label className="field-label" htmlFor="norme-distance-calcul">
          dist(A,B) =
        </label>
        <input disabled={!!validation}
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
      {!validation && (
        <>
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
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

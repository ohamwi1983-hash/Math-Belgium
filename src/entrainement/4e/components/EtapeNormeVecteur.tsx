import { useState } from "react";
import type { ExerciceNormeVecteur } from "../core/normeDistance.types";
import { diagnostiquerNormeVecteur } from "../moteur/verificationNormeDistance";
import { NIVEAU_AIDE_MAX } from "../moteur/typesNormeDistance";
import { FORMULE_GENERALE_NORME_LATEX, PLACEHOLDER_NORME, formatEnonceVecteurLatex, formatLabelNormeVecteurLatex, formuleSubstitueeNormeLatex, segmentsConsigneVecteur } from "../ui/formatNormeDistance";
import { formatMessageErreur } from "../ui/messageErreur";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceNormeVecteur;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
}

/**
 * Écran unique de la variante "vecteur" : consigne générale (`promptgen26refontecomplete.md`,
 * Partie G) + un champ de texte libre (la norme, fraction/irrationnel irréductible acceptés — plus
 * de filtrage numérique strict, qui bloquerait `/`/`sqrt`). Aide progressive à 2 niveaux, texte
 * seul : rappel générique de la formule en notation $x_{\vec v}$/$y_{\vec v}$ (niveau 1), puis la
 * formule substituée avec les vraies valeurs, non calculée (niveau 2).
 */
export function EtapeNormeVecteur({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [texte, setTexte] = useState("");
  const max = NIVEAU_AIDE_MAX.normeVecteur;
  const complet = texte.trim() !== "";
  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec ? diagnostiquerNormeVecteur(exercice, texte) : undefined;
  const erronee = apresEchec && statut !== "correct";

  return (
    <div>
      <p className="prompt-text">
        <RenduFragments fragments={segmentsConsigneVecteur(exercice)} />
      </p>
      <div className="equation-box">
        <Katex expression={formatEnonceVecteurLatex(exercice)} />
      </div>

      <div className="field field-inline">
        <label className="field-label field-label-minuscule" htmlFor="norme-distance-vecteur-norme">
          <Katex expression={formatLabelNormeVecteurLatex(exercice)} />
        </label>
        <input
          id="norme-distance-vecteur-norme"
          className={`text-input${erronee ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_NORME}
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
        />
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>
            Rappel : <Katex expression={FORMULE_GENERALE_NORME_LATEX} />
          </p>
          {niveauAide >= 2 && (
            <p>
              Formule substituée : <Katex expression={formuleSubstitueeNormeLatex(exercice.v)} />
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

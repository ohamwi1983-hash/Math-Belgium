import { useState } from "react";
import type { ExerciceNatureTriangle, NatureTriangleCotes } from "../core/normeDistance.types";
import { CONSIGNE_GENERALE_ISOCELE, OPTIONS_NATURE_COTES, formatTermesDonneesIsoceleLatex } from "../ui/formatNormeDistance";
import { aidesConclusionNature } from "../ui/retoursVecteurs3";
import { Katex } from "./Katex";
import { AidesNiveaux } from "./RetourSaisie";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceNatureTriangle;
  tentativesUtilisees: number;
  tentativesMax: number;
  onActiverAide: () => void;
  onValider: (nature: NatureTriangleCotes) => void;
  validation?: ValidationEtapeProps | null;
}

/**
 * Variante « nature d'un triangle » (lot C de l'audit 4e ch. 6), dernier écran : quelconque,
 * isocèle, rectangle ou rectangle isocèle — choix fermé, UNE tentative (le moteur), aides à deux
 * niveaux. Les longueurs trouvées sont rappelées par le récapitulatif de l'appli.
 */
export function EtapeConclusionNature({ exercice, tentativesUtilisees, tentativesMax, onActiverAide, onValider, validation }: Props) {
  const [nature, setNature] = useState<NatureTriangleCotes | null>(null);
  return (
    <div>
      <EnTeteExercice
        consigneGenerale={CONSIGNE_GENERALE_ISOCELE}
        blocDonnees={
          <div className="equation-box equation-box-termes">
            {formatTermesDonneesIsoceleLatex(exercice).map((t, i) => (
              <Katex key={i} expression={t} />
            ))}
          </div>
        }
      />
      <p className="prompt-text">Ce triangle est :</p>
      <div className="options-grid-compact">
        {OPTIONS_NATURE_COTES.map((o) => (
          <button disabled={!!validation} key={o.valeur} type="button" className={nature === o.valeur ? "btn toggle-active" : "btn"} onClick={() => setNature(o.valeur)}>
            {o.libelle}
          </button>
        ))}
      </div>
      {!validation && (
        <>
          <AidesNiveaux aides={aidesConclusionNature(exercice)} onPremiereAide={onActiverAide} />
          <button type="button" className="btn btn-primary" disabled={nature === null} onClick={() => nature !== null && onValider(nature)}>
            Valider
          </button>
          {tentativesUtilisees > 0 && (
            <p className="alert-error" role="alert">
              Incorrect — tentative {tentativesUtilisees}/{tentativesMax}.
            </p>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

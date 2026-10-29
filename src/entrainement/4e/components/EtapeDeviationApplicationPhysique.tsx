import { useState } from "react";
import type { ExerciceApplicationPhysique } from "../core/applicationPhysique.types";
import {
  formatAideDeviationNiveau2Latex,
  formatEnonceApplicationPhysique,
  segmentsAideDeviationNiveau1,
  segmentsAideDeviationSens,
  segmentsConsigneDeviation,
} from "../ui/formatApplicationPhysique";
import { diagnostiquerDeviation } from "../moteur/verificationApplicationPhysique";
import { NIVEAU_AIDE_MAX_DEVIATION } from "../moteur/sessionApplicationPhysique";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { formatMessageErreur } from "../ui/messageErreur";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { Katex } from "./Katex";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { RenduFragments } from "./RenduFragments";
import { SchemaApplicationPhysique } from "./SchemaApplicationPhysique";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceApplicationPhysique;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  recapitulatif: EntreeRecapitulatif[];
  onActiverAide: () => void;
  onValider: (valeur: number) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Angle de déviation entre la trajectoire/l'orientation de référence (v1) et la résultante —
 * trigonométrie de base (angle droit) ou loi des sinus (angle quelconque) selon la variante, déjà
 * calculé à la génération (`triangle.C`) — même principe que l'étape "norme", aide à 2 niveaux
 * comprise (F2, option b : le niveau 2 rappelle le piège de la déviation obtuse). */
export function EtapeDeviationApplicationPhysique({
  exercice,
  tentativesUtilisees,
  tentativesMax,
  niveauAide,
  recapitulatif,
  onActiverAide,
  onValider,
  validation,
}: Props) {
  const [texte, setTexte] = useState("");

  const complet = texte.trim() !== "";
  const valeur = Number(texte.replace(",", "."));
  const apresEchec = tentativesUtilisees > 0;
  const statut = complet ? diagnostiquerDeviation(exercice, valeur) : undefined;
  const erronee = apresEchec && statut !== "correct";
  const aideSens = segmentsAideDeviationSens(exercice);

  return (
    <div>
      <RecapitulatifPanel entrees={recapitulatif} />
      <EnTeteExercice
        consigneGenerale={formatEnonceApplicationPhysique(exercice)}
        blocDonnees={<SchemaApplicationPhysique exercice={exercice} />}
      />

      <p className="prompt-text">
        <RenduFragments fragments={segmentsConsigneDeviation(exercice)} />
      </p>
      <div className="field">
        <label className="field-label" htmlFor="application-physique-deviation">
          Angle de déviation
        </label>
        <div className="champ-avec-unite">
          <input
            id="application-physique-deviation"
            className={`text-input${erronee ? " is-erronee" : ""}`}
            value={texte}
            onChange={(e) => setTexte(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
          <span className="champ-avec-unite-suffixe">°</span>
        </div>
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>
            <RenduFragments fragments={segmentsAideDeviationNiveau1(exercice)} />
          </p>
          {niveauAide >= 2 && (
            <>
              <p>
                <Katex expression={formatAideDeviationNiveau2Latex(exercice)} />
              </p>
              {aideSens && (
                <p>
                  <RenduFragments fragments={aideSens} />
                </p>
              )}
            </>
          )}
        </div>
      )}
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_DEVIATION} onActiverAide={onActiverAide} />

        <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(valeur)}>
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

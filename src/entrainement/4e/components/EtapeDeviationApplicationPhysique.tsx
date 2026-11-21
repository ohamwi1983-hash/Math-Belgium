import { useState } from "react";
import type { ExerciceApplicationPhysique } from "../core/applicationPhysique.types";
import {
  formatEnonceApplicationPhysique,
  segmentsConsigneDeviation,
} from "../ui/formatApplicationPhysique";
import { diagnostiquerDeviation } from "../moteur/verificationApplicationPhysique";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { RenduFragments } from "./RenduFragments";
import { SchemaApplicationPhysique } from "./SchemaApplicationPhysique";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { AidesNiveaux, MessageRetour, useTentativeLisible } from "./RetourSaisie";
import { aidesDeviationPhysique, messageDeviationPhysique, lireNombrePhysique } from "../ui/retoursVecteurs4";
import { ILLISIBLE_VECTEURS } from "../ui/retoursVecteurs";
import { EnTeteExercice } from "./EnTeteExercice";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

interface Props {
  exercice: ExerciceApplicationPhysique;
  tentativesUtilisees: number;
  tentativesMax: number;
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
  recapitulatif,
  onActiverAide,
  onValider,
  validation,
}: Props) {
  const [texte, setTexte] = useState("");

  const saisie = useTentativeLisible<number>();
  const complet = texte.trim() !== "";
  const valeur = lireNombrePhysique(texte, true);
  const statut = saisie.soumise !== null ? diagnostiquerDeviation(exercice, saisie.soumise) : undefined;
  const erronee = tentativesUtilisees > 0 && statut !== undefined && statut !== "correct";

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
            onChange={(e) => setTexte(normaliserSigneMoins(e.target.value))}
          />
          <span className="champ-avec-unite-suffixe">°</span>
        </div>
      </div>

      {!validation && (
        <>
          <AidesNiveaux aides={aidesDeviationPhysique(exercice)} onPremiereAide={onActiverAide} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => saisie.tenter(valeur ?? NaN, valeur !== null, onValider)}>
            Valider
          </button>
          <MessageRetour
            illisible={saisie.illisible}
            texteIllisible={ILLISIBLE_VECTEURS.angle}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            cible={saisie.soumise !== null ? messageDeviationPhysique(exercice, saisie.soumise) : null}
          />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

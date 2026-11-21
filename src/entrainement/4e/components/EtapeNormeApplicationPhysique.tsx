import { useState } from "react";
import type { ExerciceApplicationPhysique } from "../core/applicationPhysique.types";
import {
  formatEnonceApplicationPhysique,
  segmentsConsigneNorme,
} from "../ui/formatApplicationPhysique";
import { diagnostiquerNorme } from "../moteur/verificationApplicationPhysique";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { RenduFragments } from "./RenduFragments";
import { SchemaApplicationPhysique } from "./SchemaApplicationPhysique";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { AidesNiveaux, MessageRetour, useTentativeLisible } from "./RetourSaisie";
import { aidesNormePhysique, messageNormePhysique, lireNombrePhysique } from "../ui/retoursVecteurs4";
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

/** Norme de la résultante — réutilise Pythagore (angle droit) ou la loi des cosinus (angle
 * quelconque) selon la variante, déjà calculée à la génération via `resoudreSAS`
 * (`triangle.a`, voir "Infrastructure partagée — générateurs triangle", CLAUDE.md) : seule la
 * valeur numérique finale est vérifiée ici, avec la "convention arrondie" (tolérance ±0,5, propre
 * à ce générateur — voir `verificationApplicationPhysique.ts`). Seul écran de ce générateur à
 * avoir une aide (2 niveaux, `promptgen29modificationscompletes.md`, point 4.3). */
export function EtapeNormeApplicationPhysique({
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
  const valeur = lireNombrePhysique(texte, false);
  const statut = saisie.soumise !== null ? diagnostiquerNorme(exercice, saisie.soumise) : undefined;
  const erronee = tentativesUtilisees > 0 && statut !== undefined && statut !== "correct";

  return (
    <div>
      <RecapitulatifPanel entrees={recapitulatif} />
      <EnTeteExercice
        consigneGenerale={formatEnonceApplicationPhysique(exercice)}
        blocDonnees={<SchemaApplicationPhysique exercice={exercice} />}
      />

      <p className="prompt-text">
        <RenduFragments fragments={segmentsConsigneNorme(exercice)} />
      </p>
      <div className="field">
        <label className="field-label" htmlFor="application-physique-norme">
          Norme de la résultante
        </label>
        <div className="champ-avec-unite">
          <input
            id="application-physique-norme"
            className={`text-input${erronee ? " is-erronee" : ""}`}
            value={texte}
            onChange={(e) => setTexte(normaliserSigneMoins(e.target.value))}
          />
          <span className="champ-avec-unite-suffixe">{exercice.unite}</span>
        </div>
      </div>

      {!validation && (
        <>
          <AidesNiveaux aides={aidesNormePhysique(exercice)} onPremiereAide={onActiverAide} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => saisie.tenter(valeur ?? NaN, valeur !== null, onValider)}>
            Valider
          </button>
          <MessageRetour
            illisible={saisie.illisible}
            texteIllisible={ILLISIBLE_VECTEURS.norme29}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            cible={saisie.soumise !== null ? messageNormePhysique(exercice, saisie.soumise) : null}
          />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

import { useState } from "react";
import type { ExerciceApplicationPhysique } from "../core/applicationPhysique.types";
import {
  formatAideNormeNiveau2Latex,
  formatEnonceApplicationPhysique,
  segmentsAideNormeNiveau1,
  segmentsConsigneNorme,
} from "../ui/formatApplicationPhysique";
import { libelleBoutonAide } from "../ui/formatEquationDroite";
import { diagnostiquerNorme } from "../moteur/verificationApplicationPhysique";
import { NIVEAU_AIDE_MAX_NORME } from "../moteur/sessionApplicationPhysique";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { formatMessageErreur } from "../ui/messageErreur";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { Katex } from "./Katex";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { RenduFragments } from "./RenduFragments";
import { SchemaApplicationPhysique } from "./SchemaApplicationPhysique";

interface Props {
  exercice: ExerciceApplicationPhysique;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  recapitulatif: EntreeRecapitulatif[];
  onActiverAide: () => void;
  onValider: (valeur: number) => void;
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
  niveauAide,
  recapitulatif,
  onActiverAide,
  onValider,
}: Props) {
  const [texte, setTexte] = useState("");

  const complet = texte.trim() !== "";
  const valeur = Number(texte.replace(",", "."));
  const apresEchec = tentativesUtilisees > 0;
  const statut = complet ? diagnostiquerNorme(exercice, valeur) : undefined;
  const erronee = apresEchec && statut !== "correct";

  return (
    <div>
      <RecapitulatifPanel entrees={recapitulatif} />
      <p className="prompt-text">{formatEnonceApplicationPhysique(exercice)}</p>
      <SchemaApplicationPhysique exercice={exercice} />

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
            onChange={(e) => setTexte(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
          <span className="champ-avec-unite-suffixe">{exercice.unite}</span>
        </div>
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>
            <RenduFragments fragments={segmentsAideNormeNiveau1(exercice)} />
          </p>
          {niveauAide >= 2 && (
            <p>
              <Katex expression={formatAideNormeNiveau2Latex(exercice)} />
            </p>
          )}
        </div>
      )}
      <button type="button" className="btn btn-aide" disabled={niveauAide >= NIVEAU_AIDE_MAX_NORME} onClick={onActiverAide}>
        {libelleBoutonAide(niveauAide, NIVEAU_AIDE_MAX_NORME)}
      </button>

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(valeur)}>
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

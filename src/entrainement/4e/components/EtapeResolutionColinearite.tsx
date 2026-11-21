import { useState } from "react";
import type { ExerciceColinearParametre, ExerciceColinearPointsParametre } from "../core/colinearite.types";
import { diagnostiquerResolutionAvecX } from "../moteur/verificationColinearite";
import { PLACEHOLDER_SOLUTION_X, consigneGlobaleColinearite, formatEquationReduiteLatex } from "../ui/formatColinearite";
import { lireNombreSaisi } from "../ui/lireNombre";
import { ILLISIBLE_VECTEURS } from "../ui/retoursVecteurs";
import { aidesResolutionColinearite, messageResolutionColinearite } from "../ui/retoursVecteurs2";
import { Katex } from "./Katex";
import { PiedVecteurs } from "./PiedVecteurs";
import { useTentativeLisible } from "./RetourSaisie";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { EnTeteExercice } from "./EnTeteExercice";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

interface Props {
  exercice: ExerciceColinearParametre | ExerciceColinearPointsParametre;
  tentativesUtilisees: number;
  tentativesMax: number;
  onActiverAide: () => void;
  onValider: (valeur: number) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran « résolution » (premier degré) de gen24, variantes « paramètre » et « alignement avec x » :
 * rappel de l'équation réduite confirmée, champ `x =`. Règles communes (audit 4e ch. 6, lot B) :
 * nombre illisible sans tentative, message ciblé (signe du terme constant, division inversée),
 * aides à deux niveaux (il n'y en avait aucune).
 */
export function EtapeResolutionColinearite({ exercice, tentativesUtilisees, tentativesMax, onActiverAide, onValider, validation }: Props) {
  const [texte, setTexte] = useState("");
  const saisie = useTentativeLisible<number>();
  const lu = lireNombreSaisi(texte);
  const complet = texte.trim() !== "";
  const jugee = tentativesUtilisees > 0 && !saisie.illisible ? saisie.soumise : null;
  const erronee = jugee !== null && diagnostiquerResolutionAvecX(exercice, jugee) !== "correct";

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={consigneGlobaleColinearite(exercice)}
        blocDonnees={
          <div className="equation-box">
            <Katex expression={formatEquationReduiteLatex(exercice)} />
          </div>
        }
      />
      <p className="prompt-text">Résous cette équation.</p>

      <div className="field field-inline">
        <label className="field-label" htmlFor="colinearite-resolution-x">
          x =
        </label>
        <input
          disabled={!!validation}
          id="colinearite-resolution-x"
          className={`text-input${erronee ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_SOLUTION_X}
          value={texte}
          onChange={(e) => setTexte(normaliserSigneMoins(e.target.value))}
        />
      </div>

      {!validation && (
        <PiedVecteurs
          aides={aidesResolutionColinearite(exercice)}
          onPremiereAide={onActiverAide}
          complet={complet}
          saisie={saisie}
          reponse={() => lu ?? Number.NaN}
          lisible={() => lu !== null}
          onValider={onValider}
          texteIllisible={ILLISIBLE_VECTEURS.valeurX}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          cible={(v) => messageResolutionColinearite(exercice, v)}
        />
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

import type { ExerciceOrthogonaliteParametre } from "../core/orthogonalite.types";
import { diagnostiquerResolutionParametre } from "../moteur/verificationOrthogonalite";
import { PLACEHOLDER_SOLUTION_X, consigneGlobaleOrthogonalite, formatEnonceLatex, formatEquationReduiteParametreLatex } from "../ui/formatOrthogonalite";
import { lireNombreSaisi } from "../ui/lireNombre";
import { ILLISIBLE_VECTEURS } from "../ui/retoursVecteurs";
import { aidesResolutionPremierDegre, messageResolutionPremierDegre } from "../ui/retoursVecteurs3";
import { Katex } from "./Katex";
import { EcranChampVecteurs } from "./EcranChampVecteurs";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceOrthogonaliteParametre;
  tentativesUtilisees: number;
  tentativesMax: number;
  onActiverAide: () => void;
  onValider: (valeur: number) => void;
  validation?: ValidationEtapeProps | null;
}

/** Écran 2 de la variante « paramètre » : résoudre l'équation réduite (champ `x =`). Règles
 * communes (audit 4e ch. 6, lot B) — aides à deux niveaux (il n'y en avait aucune). */
export function EtapeResolutionParametreOrthogonalite({ exercice, tentativesUtilisees, tentativesMax, onActiverAide, onValider, validation }: Props) {
  return (
    <EcranChampVecteurs<number>
      enTete={
        <>
          <EnTeteExercice
            consigneGenerale={consigneGlobaleOrthogonalite(exercice)}
            blocDonnees={
              <div className="equation-box">
                <Katex expression={formatEnonceLatex(exercice)} />
              </div>
            }
          />
          <div className="equation-box">
            <Katex expression={formatEquationReduiteParametreLatex(exercice)} />
          </div>
        </>
      }
      consigne="Résous cette équation."
      id="orthogonalite-resolution-x"
      label="x ="
      placeholder={PLACEHOLDER_SOLUTION_X}
      lire={lireNombreSaisi}
      estFausse={(v) => diagnostiquerResolutionParametre(exercice, v) !== "correct"}
      aides={aidesResolutionPremierDegre(exercice.coefX, exercice.coefConst)}
      onPremiereAide={onActiverAide}
      cible={(v) => messageResolutionPremierDegre(exercice.coefX, exercice.coefConst, exercice.solutionX, v)}
      texteIllisible={ILLISIBLE_VECTEURS.valeurX}
      tentativesUtilisees={tentativesUtilisees}
      tentativesMax={tentativesMax}
      onValider={onValider}
      validation={validation}
    />
  );
}

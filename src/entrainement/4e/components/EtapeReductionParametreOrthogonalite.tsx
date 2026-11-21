import type { ExerciceOrthogonaliteParametre } from "../core/orthogonalite.types";
import { diagnostiquerReductionParametre } from "../moteur/verificationOrthogonalite";
import { CONSIGNE_REDUCTION_PARAMETRE_ORTHOGONALITE, PLACEHOLDER_EQUATION_REDUITE, consigneGlobaleOrthogonalite, formatEnonceLatex } from "../ui/formatOrthogonalite";
import { ILLISIBLE_VECTEURS } from "../ui/retoursVecteurs";
import { aidesReductionParametreOrthogonalite, messageReductionParametreOrthogonalite } from "../ui/retoursVecteurs3";
import { Katex } from "./Katex";
import { EcranChampVecteurs } from "./EcranChampVecteurs";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceOrthogonaliteParametre;
  tentativesUtilisees: number;
  tentativesMax: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran`. */
  validation?: ValidationEtapeProps | null;
}

/** Écran 1 de la variante « paramètre » : la relation d'orthogonalité réduite (équation en x, un
 * seul champ libre, toute équation proportionnelle acceptée). Règles communes (audit 4e ch. 6,
 * lot B) : illisible sans tentative, message ciblé (produits en croix), aides à deux niveaux. */
export function EtapeReductionParametreOrthogonalite({ exercice, tentativesUtilisees, tentativesMax, onActiverAide, onValider, validation }: Props) {
  return (
    <EcranChampVecteurs<string>
      enTete={
        <EnTeteExercice
          consigneGenerale={consigneGlobaleOrthogonalite(exercice)}
          blocDonnees={
            <div className="equation-box">
              <Katex expression={formatEnonceLatex(exercice)} />
            </div>
          }
        />
      }
      consigne={CONSIGNE_REDUCTION_PARAMETRE_ORTHOGONALITE}
      id="orthogonalite-reduction-equation"
      label="Équation ="
      placeholder={PLACEHOLDER_EQUATION_REDUITE}
      lire={(t) => (diagnostiquerReductionParametre(exercice, t) === "parse_error" ? null : t)}
      estFausse={(t) => diagnostiquerReductionParametre(exercice, t) !== "correct"}
      aides={aidesReductionParametreOrthogonalite(exercice)}
      onPremiereAide={onActiverAide}
      cible={(t) => messageReductionParametreOrthogonalite(exercice, t)}
      texteIllisible={ILLISIBLE_VECTEURS.equationX}
      tentativesUtilisees={tentativesUtilisees}
      tentativesMax={tentativesMax}
      onValider={onValider}
      validation={validation}
    />
  );
}

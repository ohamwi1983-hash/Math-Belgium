import type { ExerciceDistance } from "../core/normeDistance.types";
import { diagnostiquerCalculDistance, lireExpressionNorme } from "../moteur/verificationNormeDistance";
import { CONSIGNE_GENERALE_DISTANCE, PLACEHOLDER_NORME, formatTermesDonneesDistanceLatex } from "../ui/formatNormeDistance";
import { ILLISIBLE_VECTEURS } from "../ui/retoursVecteurs";
import { aidesCalculDistance, lireValeurExacte, messageNorme } from "../ui/retoursVecteurs3";
import { Katex } from "./Katex";
import { EcranChampVecteurs } from "./EcranChampVecteurs";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceDistance;
  tentativesUtilisees: number;
  tentativesMax: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  validation?: ValidationEtapeProps | null;
}

/** Variante « distance », écran 2 : la distance exacte (norme de AB). Règles communes (audit 4e
 * ch. 6, lot B) : illisible ou approchée sans tentative, message ciblé, aides à deux niveaux. */
export function EtapeCalculDistance({ exercice, tentativesUtilisees, tentativesMax, onActiverAide, onValider, validation }: Props) {
  return (
    <EcranChampVecteurs<string>
      enTete={
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
      }
      consigne="Calcule la distance entre ces deux points (valeur exacte, simplifiée)."
      id="norme-distance-calcul"
      label=""
      labelLatex={`${exercice.labelA}${exercice.labelB} =`}
      placeholder={PLACEHOLDER_NORME}
      lire={(t) => {
        const l = lireValeurExacte(t, exercice.distance);
        return l.valeur === null || l.approchee ? null : t;
      }}
      estFausse={(t) => diagnostiquerCalculDistance(exercice, t) !== "correct"}
      aides={aidesCalculDistance(exercice)}
      onPremiereAide={onActiverAide}
      cible={(t) => messageNorme(exercice.vecteurAB, lireExpressionNorme(t) ?? Number.NaN)}
      texteIllisible={(t) => (lireValeurExacte(t, exercice.distance).approchee ? ILLISIBLE_VECTEURS.normeApprochee : ILLISIBLE_VECTEURS.norme)}
      tentativesUtilisees={tentativesUtilisees}
      tentativesMax={tentativesMax}
      onValider={onValider}
      validation={validation}
    />
  );
}

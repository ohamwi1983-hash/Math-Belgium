import type { ExerciceParametreNorme } from "../core/normeDistance.types";
import { diagnostiquerReductionParametreNorme } from "../moteur/verificationNormeDistance";
import { PLACEHOLDER_EQUATION_PARAMETRE, formatTermesEnonceParametreLatex, segmentsConsigneParametre } from "../ui/formatNormeDistance";
import { ILLISIBLE_VECTEURS } from "../ui/retoursVecteurs";
import { aidesReductionParametreNorme, messageReductionParametreNorme } from "../ui/retoursVecteurs3";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";
import { EcranChampVecteurs } from "./EcranChampVecteurs";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceParametreNorme;
  tentativesUtilisees: number;
  tentativesMax: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  validation?: ValidationEtapeProps | null;
}

/** Variante « paramètre », écran 1 : élever au carré, développer, réduire (équation du second
 * degré). Règles communes (audit 4e ch. 6, lot B) : équation illisible sans tentative, message
 * ciblé (cible non élevée au carré, double produit oublié), aides à deux niveaux. */
export function EtapeReductionParametreNorme({ exercice, tentativesUtilisees, tentativesMax, onActiverAide, onValider, validation }: Props) {
  return (
    <EcranChampVecteurs<string>
      enTete={
        <EnTeteExercice
          consigneGenerale={<RenduFragments fragments={segmentsConsigneParametre(exercice)} />}
          blocDonnees={
            <div className="equation-box equation-box-termes">
              {formatTermesEnonceParametreLatex(exercice).map((terme, i) => (
                <Katex key={i} expression={terme} />
              ))}
            </div>
          }
        />
      }
      consigne={
        <>
          Développe et réduis cette équation à la forme <Katex expression="ax^2+bx+c=0" />.
        </>
      }
      id="norme-distance-reduction-equation"
      label="Équation :"
      placeholder={PLACEHOLDER_EQUATION_PARAMETRE}
      lire={(t) => (diagnostiquerReductionParametreNorme(exercice, t) === "parse_error" ? null : t)}
      estFausse={(t) => diagnostiquerReductionParametreNorme(exercice, t) !== "correct"}
      aides={aidesReductionParametreNorme(exercice)}
      onPremiereAide={onActiverAide}
      cible={(t) => messageReductionParametreNorme(exercice, t)}
      texteIllisible={ILLISIBLE_VECTEURS.equationX}
      tentativesUtilisees={tentativesUtilisees}
      tentativesMax={tentativesMax}
      onValider={onValider}
      validation={validation}
    />
  );
}

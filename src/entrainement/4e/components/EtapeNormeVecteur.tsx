import type { ExerciceNormeVecteur } from "../core/normeDistance.types";
import { diagnostiquerNormeVecteur, lireExpressionNorme } from "../moteur/verificationNormeDistance";
import { PLACEHOLDER_NORME, formatEnonceVecteurLatex, formatLabelNormeVecteurLatex, segmentsConsigneVecteur } from "../ui/formatNormeDistance";
import { ILLISIBLE_VECTEURS } from "../ui/retoursVecteurs";
import { aidesNormeVecteur, lireValeurExacte, messageNorme } from "../ui/retoursVecteurs3";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";
import { EcranChampVecteurs } from "./EcranChampVecteurs";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";

interface Props {
  exercice: ExerciceNormeVecteur;
  tentativesUtilisees: number;
  tentativesMax: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  validation?: ValidationEtapeProps | null;
}

/** Variante « norme d'un vecteur » (un écran) : la norme exacte. Règles communes (audit 4e ch. 6,
 * lot B) : saisie illisible OU valeur décimale approchée refusée sans tentative, message ciblé
 * (racine oubliée, carré d'un négatif), aides à deux niveaux. */
export function EtapeNormeVecteur({ exercice, tentativesUtilisees, tentativesMax, onActiverAide, onValider, validation }: Props) {
  return (
    <EcranChampVecteurs<string>
      enTete={
        <>
          <p className="prompt-text">
            <RenduFragments fragments={segmentsConsigneVecteur(exercice)} />
          </p>
          <div className="equation-box">
            <Katex expression={formatEnonceVecteurLatex(exercice)} />
          </div>
        </>
      }
      consigne="Donne la valeur exacte, simplifiée."
      id="norme-distance-vecteur-norme"
      label=""
      placeholder={PLACEHOLDER_NORME}
      lire={(t) => {
        const l = lireValeurExacte(t, exercice.norme);
        return l.valeur === null || l.approchee ? null : t;
      }}
      estFausse={(t) => diagnostiquerNormeVecteur(exercice, t) !== "correct"}
      aides={aidesNormeVecteur(exercice)}
      onPremiereAide={onActiverAide}
      cible={(t) => messageNorme(exercice.v, lireExpressionNorme(t) ?? Number.NaN)}
      texteIllisible={(t) => (lireValeurExacte(t, exercice.norme).approchee ? ILLISIBLE_VECTEURS.normeApprochee : ILLISIBLE_VECTEURS.norme)}
      tentativesUtilisees={tentativesUtilisees}
      tentativesMax={tentativesMax}
      onValider={onValider}
      validation={validation}
      labelLatex={formatLabelNormeVecteurLatex(exercice)}
    />
  );
}

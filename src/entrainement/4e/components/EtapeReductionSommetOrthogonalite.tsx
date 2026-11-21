import type { ExerciceOrthogonaliteTriangleParametre, Sommet } from "../core/orthogonalite.types";
import { diagnostiquerReductionSommet } from "../moteur/verificationOrthogonalite";
import { PLACEHOLDER_EQUATION_REDUITE, consigneGlobaleOrthogonalite, formatTermesEnonceTriangleParametreLatex } from "../ui/formatOrthogonalite";
import { ILLISIBLE_VECTEURS } from "../ui/retoursVecteurs";
import { aidesReductionSommet, messageReductionSommet } from "../ui/retoursVecteurs3";
import { Katex } from "./Katex";
import { EcranChampVecteurs } from "./EcranChampVecteurs";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceOrthogonaliteTriangleParametre;
  sommet: Sommet;
  tentativesUtilisees: number;
  tentativesMax: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran`. */
  validation?: ValidationEtapeProps | null;
}

function labelSommet(exercice: ExerciceOrthogonaliteTriangleParametre, sommet: Sommet): string {
  return sommet === "A" ? exercice.labelA : sommet === "B" ? exercice.labelB : exercice.labelC;
}

/** Écran « réduction » d'un sommet (variante « triangle avec x ») : le produit scalaire des deux
 * côtés issus du sommet, réduit à une équation (un seul champ, quel que soit le degré). Règles
 * communes (audit 4e ch. 6, lot B) : illisible sans tentative, message ciblé (produits en croix,
 * côté non retourné), aides à deux niveaux (le rappel « BA = −AB » est dans le niveau 1). */
export function EtapeReductionSommetOrthogonalite({ exercice, sommet, tentativesUtilisees, tentativesMax, onActiverAide, onValider, validation }: Props) {
  return (
    <EcranChampVecteurs<string>
      enTete={
        <EnTeteExercice
          consigneGenerale={consigneGlobaleOrthogonalite(exercice)}
          blocDonnees={
            <div className="equation-box equation-box-termes">
              {formatTermesEnonceTriangleParametreLatex(exercice).map((t, i) => (
                <Katex key={i} expression={t} />
              ))}
            </div>
          }
        />
      }
      consigne={`Réduis le produit scalaire du sommet ${labelSommet(exercice, sommet)} à une équation.`}
      id={`orthogonalite-reductionsommet-${sommet}-equation`}
      label="Équation ="
      placeholder={PLACEHOLDER_EQUATION_REDUITE}
      lire={(t) => (diagnostiquerReductionSommet(exercice, sommet, t) === "parse_error" ? null : t)}
      estFausse={(t) => diagnostiquerReductionSommet(exercice, sommet, t) !== "correct"}
      aides={aidesReductionSommet(exercice, sommet)}
      onPremiereAide={onActiverAide}
      cible={(t) => messageReductionSommet(exercice, sommet, t)}
      texteIllisible={ILLISIBLE_VECTEURS.equationX}
      tentativesUtilisees={tentativesUtilisees}
      tentativesMax={tentativesMax}
      onValider={onValider}
      validation={validation}
    />
  );
}

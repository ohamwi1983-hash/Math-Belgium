import type { ExerciceOrthogonaliteTriangle, Sommet } from "../core/orthogonalite.types";
import { diagnostiquerTestSommetTriangle } from "../moteur/verificationOrthogonalite";
import { PLACEHOLDER_CRITERE, consigneGlobaleOrthogonalite, formatTermesEnonceTriangleLatex } from "../ui/formatOrthogonalite";
import { lireNombreSaisi } from "../ui/lireNombre";
import { ILLISIBLE_VECTEURS } from "../ui/retoursVecteurs";
import { aidesTestSommet, messageTestSommet } from "../ui/retoursVecteurs3";
import { Katex } from "./Katex";
import { EcranChampVecteurs } from "./EcranChampVecteurs";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceOrthogonaliteTriangle;
  sommet: Sommet;
  tentativesUtilisees: number;
  tentativesMax: number;
  onActiverAide: () => void;
  onValider: (valeur: number) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran`. */
  validation?: ValidationEtapeProps | null;
}

function labelSommet(exercice: ExerciceOrthogonaliteTriangle, sommet: Sommet): string {
  return sommet === "A" ? exercice.labelA : sommet === "B" ? exercice.labelB : exercice.labelC;
}

/** Écrans « test en A / B / C » (variante « triangle ») : produit scalaire des deux côtés issus du
 * sommet. Règles communes (audit 4e ch. 6, lot B) : illisible sans tentative, message ciblé
 * (côtés d'un autre sommet, un seul côté retourné), aides à deux niveaux. */
export function EtapeTestSommetOrthogonalite({ exercice, sommet, tentativesUtilisees, tentativesMax, onActiverAide, onValider, validation }: Props) {
  return (
    <EcranChampVecteurs<number>
      enTete={
        <EnTeteExercice
          consigneGenerale={consigneGlobaleOrthogonalite(exercice)}
          blocDonnees={
            <div className="equation-box equation-box-termes">
              {formatTermesEnonceTriangleLatex(exercice).map((t, i) => (
                <Katex key={i} expression={t} />
              ))}
            </div>
          }
        />
      }
      consigne={`Ce triangle est-il rectangle en ${labelSommet(exercice, sommet)} ? Calcule le produit scalaire des deux côtés issus de ${labelSommet(exercice, sommet)}.`}
      id={`orthogonalite-testsommet-${sommet}`}
      label="Produit scalaire ="
      placeholder={PLACEHOLDER_CRITERE}
      lire={lireNombreSaisi}
      estFausse={(v) => diagnostiquerTestSommetTriangle(exercice, sommet, v) !== "correct"}
      aides={aidesTestSommet(exercice, sommet)}
      onPremiereAide={onActiverAide}
      cible={(v) => messageTestSommet(exercice, sommet, v)}
      texteIllisible={ILLISIBLE_VECTEURS.produitScalaire}
      tentativesUtilisees={tentativesUtilisees}
      tentativesMax={tentativesMax}
      onValider={onValider}
      validation={validation}
    />
  );
}

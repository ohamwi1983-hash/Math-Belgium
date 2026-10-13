import { Katex } from "../components/Katex";
import type { ExerciceEtudeFonctionExponentielle } from "../core6e/etudeFonctionExponentielle.types";
import type { AideAvecLatex } from "../ui6e/formatEtudeFonctionExponentielle";
import { CONSIGNE_GENERALE, calculerViewBox, consigneGraphique, formatFonctionLatex } from "../ui6e/formatEtudeFonctionExponentielle";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { EnTeteExercice } from "./EnTeteExercice";
import { EtapeSelectionGraphiqueQCM } from "./EtapeSelectionGraphiqueQCM";
import { GrapheOptionEtudeFonction } from "./GrapheOptionEtudeFonction";

interface Props {
  exercice: ExerciceEtudeFonctionExponentielle;
  estPremierEcran: boolean;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (indexChoisi: number) => void;
  validation?: ValidationEtapeProps | null;
}

/** Écran 6/6, "graphique" (`6gen11`) — en-tête propre à ce générateur ; le corps du QCM (4
 * graphiques lettrés A→D empilés, non cliquables, + 4 boutons de choix texte séparés + Valider) est
 * délégué à `EtapeSelectionGraphiqueQCM`, partagé avec 6gen5/6gen8/6gen20/6gen21. Les 5 écrans
 * précédents (domaine, limites, asymptotes, croissance, concavité) sont listés dans le
 * récapitulatif "Ce qu'on sait déjà" (`ui6e/recapitulatifEtudeFonctionExponentielle.ts`). */
export function EtapeSelectionGraphiqueEtudeFonction({ exercice, estPremierEcran, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation }: Props) {
  const viewBox = calculerViewBox(exercice);

  return (
    <div>
      <EnTeteExercice
        estPremierEcran={estPremierEcran}
        consigneGenerale={CONSIGNE_GENERALE}
        blocDonnees={
          <div className="equation-box">
            <Katex expression={formatFonctionLatex(exercice)} />
          </div>
        }
      />
      <p className="prompt-text">{consigneGraphique()}</p>

      <EtapeSelectionGraphiqueQCM
        nombreOptions={exercice.candidats.length}
        renderGraphique={(index, largeur, hauteur) => <GrapheOptionEtudeFonction exercice={exercice} index={index} viewBox={viewBox} largeur={largeur} hauteur={hauteur} />}
        aideNiveau1={aideNiveau1}
        aideNiveau2={aideNiveau2}
        tentativesUtilisees={tentativesUtilisees}
        tentativesMax={tentativesMax}
        niveauAide={niveauAide}
        niveauAideMax={niveauAideMax}
        onActiverAide={onActiverAide}
        onValider={onValider}
        validation={validation}
      />
    </div>
  );
}

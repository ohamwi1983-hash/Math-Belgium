import { Katex } from "../components/Katex";
import { useLargeurConteneur } from "../components/useLargeurConteneur";
import type { ExerciceGraphiqueDeriveeLogarithme } from "../core6e/graphiqueDeriveeLogarithme.types";
import type { AideAvecLatex } from "../ui6e/formatGraphiqueDeriveeLogarithme";
import { CONSIGNE_GENERALE, calculerViewBoxFonction, calculerViewBoxGraphique, consigneEcranSelection, formatFonctionLatex } from "../ui6e/formatGraphiqueDeriveeLogarithme";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { EnTeteExercice } from "./EnTeteExercice";
import { EtapeSelectionGraphiqueQCM } from "./EtapeSelectionGraphiqueQCM";
import { GrapheOptionDeriveeLogarithme } from "./GrapheOptionDeriveeLogarithme";

interface Props {
  exercice: ExerciceGraphiqueDeriveeLogarithme;
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

const LARGEUR_MAX_F = 420;

/** Écran "selection" (1er écran, les 3 familles, `6gen20`) — le GRAPHIQUE de f est donné (avec son
 * expression), l'élève choisit celui de f' parmi 4 en lisant variations, extremums et pentes de f.
 * Jamais la formule de f' à l'écran (elle se calcule à l'écran suivant, qui confirme le choix). Le
 * corps du QCM est délégué à `EtapeSelectionGraphiqueQCM` (partagé 6gen5/6gen8/6gen11/6gen21). */
export function EtapeSelectionGraphiqueDeriveeLogarithme({ exercice, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation }: Props) {
  const viewBox = calculerViewBoxGraphique(exercice);
  const viewBoxF = calculerViewBoxFonction(exercice);
  const [refF, largeurMesuree] = useLargeurConteneur<HTMLDivElement>();
  const largeurF = Math.round(Math.min(LARGEUR_MAX_F, largeurMesuree || 300));

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={CONSIGNE_GENERALE}
        blocDonnees={
          <div className="equation-box">
            <Katex expression={formatFonctionLatex(exercice)} />
          </div>
        }
      />
      <div className="graphe-qcm-carte" ref={refF}>
        <p className="graphe-qcm-label">Graphique de f</p>
        <GrapheOptionDeriveeLogarithme exercice={exercice} index={0} fonction viewBox={viewBoxF} largeur={largeurF} hauteur={Math.round(largeurF * 0.75)} />
      </div>
      <p className="prompt-text">{consigneEcranSelection()}</p>

      <EtapeSelectionGraphiqueQCM
        nombreOptions={exercice.candidats.length}
        renderGraphique={(index, largeur, hauteur) => <GrapheOptionDeriveeLogarithme exercice={exercice} index={index} viewBox={viewBox} largeur={largeur} hauteur={hauteur} />}
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

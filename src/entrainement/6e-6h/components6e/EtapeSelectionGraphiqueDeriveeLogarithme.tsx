import { Katex } from "../components/Katex";
import type { ExerciceGraphiqueDeriveeLogarithme } from "../core6e/graphiqueDeriveeLogarithme.types";
import type { AideAvecLatex } from "../ui6e/formatGraphiqueDeriveeLogarithme";
import { CONSIGNE_GENERALE, calculerViewBoxGraphique, consigneEcranSelection, etatActuelSelection, formatFonctionLatex } from "../ui6e/formatGraphiqueDeriveeLogarithme";
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
}

/** Écran "selection" (les 3 familles, `6gen20`) — en-tête propre à ce générateur ; le corps du QCM
 * (4 graphiques lettrés A→D empilés, non cliquables, + 4 boutons de choix texte séparés + Valider)
 * est délégué à `EtapeSelectionGraphiqueQCM`, partagé avec 6gen5/6gen8/6gen11/6gen21. */
export function EtapeSelectionGraphiqueDeriveeLogarithme({ exercice, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const viewBox = calculerViewBoxGraphique(exercice);

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE}</p>
      <div className="equation-box">
        <Katex expression={formatFonctionLatex(exercice)} />
      </div>
      <div className="etat-actuel-box">
        <div className="etat-actuel-box-termes">
          {etatActuelSelection(exercice).map((frag, i) => (
            <Katex key={i} expression={frag} />
          ))}
        </div>
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
      />
    </div>
  );
}

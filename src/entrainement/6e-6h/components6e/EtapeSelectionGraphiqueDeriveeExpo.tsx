import { Katex } from "../components/Katex";
import type { ExerciceGraphiqueDeriveeExponentielle } from "../core6e/graphiquesDeriveeExponentielles.types";
import type { AideAvecLatex } from "../ui6e/formatGraphiquesDeriveeExponentielles";
import { CONSIGNE_GENERALE, calculerViewBoxGraphique, consigneEcranSelection, formatFonctionLatex } from "../ui6e/formatGraphiquesDeriveeExponentielles";
import { EtapeSelectionGraphiqueQCM } from "./EtapeSelectionGraphiqueQCM";
import { GrapheOptionDeriveeExpo } from "./GrapheOptionDeriveeExpo";

interface Props {
  exercice: ExerciceGraphiqueDeriveeExponentielle;
  /** `null` pour les familles A/C ("selection" est alors le PREMIER écran de leur séquence, rien à
   * rappeler) ; pour B/D, la dérivée CORRECTE confirmée à l'écran "derivee" qui précède
   * (`ui6e/formatGraphiquesDeriveeExponentielles.ts::etatActuel`). */
  etatActuel: string[] | null;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (indexChoisi: number) => void;
}

/** Écran "selection" (les 4 familles, `6gen8`) — en-tête propre à ce générateur ; le corps du QCM
 * (4 graphiques lettrés A→D empilés, non cliquables, + 4 boutons de choix texte séparés + Valider)
 * est délégué à `EtapeSelectionGraphiqueQCM`, partagé avec 6gen5/6gen11/6gen20/6gen21. */
export function EtapeSelectionGraphiqueDeriveeExpo({ exercice, etatActuel, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const viewBox = calculerViewBoxGraphique(exercice);

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE}</p>
      <div className="equation-box">
        <Katex expression={formatFonctionLatex(exercice)} />
      </div>
      {etatActuel && (
        <div className="etat-actuel-box">
          <div className="etat-actuel-box-termes">
            {etatActuel.map((frag, i) => (
              <Katex key={i} expression={frag} />
            ))}
          </div>
        </div>
      )}
      <p className="prompt-text">{consigneEcranSelection()}</p>

      <EtapeSelectionGraphiqueQCM
        nombreOptions={exercice.candidats.length}
        renderGraphique={(index, largeur, hauteur) => <GrapheOptionDeriveeExpo exercice={exercice} index={index} viewBox={viewBox} largeur={largeur} hauteur={hauteur} />}
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

import { Katex } from "../components/Katex";
import type { ExerciceEtudeFonctionExponentielle } from "../core6e/etudeFonctionExponentielle.types";
import type { AideAvecLatex } from "../ui6e/formatEtudeFonctionExponentielle";
import { CONSIGNE_GENERALE, calculerViewBox, consigneGraphique, formatFonctionLatex } from "../ui6e/formatEtudeFonctionExponentielle";
import { EtapeSelectionGraphiqueQCM } from "./EtapeSelectionGraphiqueQCM";
import { GrapheOptionEtudeFonction } from "./GrapheOptionEtudeFonction";

interface Props {
  exercice: ExerciceEtudeFonctionExponentielle;
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

/** Écran 6/6, "graphique" (`6gen11`) — en-tête propre à ce générateur ; le corps du QCM (4
 * graphiques lettrés A→D empilés, non cliquables, + 4 boutons de choix texte séparés + Valider) est
 * délégué à `EtapeSelectionGraphiqueQCM`, partagé avec 6gen5/6gen8/6gen20/6gen21. `etatActuel`
 * rappelle les 5 écrans précédents (domaine, limites, asymptotes, croissance, concavité) — le plus
 * long rappel de ce générateur, voir `ui6e/formatEtudeFonctionExponentielle.ts::etatActuel`. */
export function EtapeSelectionGraphiqueEtudeFonction({ exercice, etatActuel, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const viewBox = calculerViewBox(exercice);

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
      />
    </div>
  );
}

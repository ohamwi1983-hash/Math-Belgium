import { Katex } from "../components/Katex";
import type { ExerciceEtudeLogNonE } from "../core6e/etudeFonctionLogarithme.types";
import type { AideAvecLatex } from "../ui6e/formatEtudeFonctionLogarithme";
import { CONSIGNE_GENERALE, calculerViewBox, consigneGraphique, etatActuel, formatFonctionLatex } from "../ui6e/formatEtudeFonctionLogarithme";
import { EtapeSelectionGraphiqueQCM } from "./EtapeSelectionGraphiqueQCM";
import { GrapheOptionEtudeFonctionLog } from "./GrapheOptionEtudeFonctionLog";

interface Props {
  exercice: ExerciceEtudeLogNonE;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (indexChoisi: number) => void;
}

/** Écran final "graphique" (familles A-D uniquement, famille E n'en a pas, `6gen21`) — en-tête
 * propre à ce générateur ; le corps du QCM (4 graphiques lettrés A→D empilés, non cliquables, + 4
 * boutons de choix texte séparés + Valider) est délégué à `EtapeSelectionGraphiqueQCM`, partagé
 * avec 6gen5/6gen8/6gen11/6gen20. */
export function EtapeSelectionGraphiqueEtudeFonctionLog({ exercice, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const viewBox = calculerViewBox(exercice);

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE}</p>
      <div className="equation-box">
        <Katex expression={formatFonctionLatex(exercice)} />
      </div>
      <div className="etat-actuel-box">
        <div className="etat-actuel-box-termes">
          {(etatActuel("graphique", exercice) ?? []).map((frag, i) => (
            <Katex key={i} expression={frag} />
          ))}
        </div>
      </div>
      <p className="prompt-text">{consigneGraphique()}</p>

      <EtapeSelectionGraphiqueQCM
        nombreOptions={exercice.candidats.length}
        renderGraphique={(index, largeur, hauteur) => <GrapheOptionEtudeFonctionLog exercice={exercice} index={index} viewBox={viewBox} largeur={largeur} hauteur={hauteur} />}
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

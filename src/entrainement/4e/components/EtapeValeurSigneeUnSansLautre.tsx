import type { ExerciceUnSansLautre } from "../core/unSansLautre.types";
import { Katex } from "./Katex";
import { formatCarreCibleLatex, formatCarreLatex, formatFonctionCibleLatex, PLACEHOLDER_VALEUR_SIGNEE } from "../ui/formatUnSansLautre";
import { statutValeurSignee } from "../moteur/verificationUnSansLautre";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { ChampValeurExacte } from "./ChampValeurExacte";
import { aidesValeurSigneeUnSansLautre, messageValeurSigneeUnSansLautre } from "../ui/aidesUnSansLautre";

interface Props {
  exercice: ExerciceUnSansLautre;
  tentativesUtilisees: number;
  tentativesMax: number;
  aideActivee: boolean;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  validation?: ValidationEtapeProps | null;
}

/** Deuxième étape — le bloc local garde le résultat confirmé de l'écran 1 (le carré cible, dérivé
 * de l'exercice). Valeur exacte seulement (`ChampValeurExacte`). */
export function EtapeValeurSigneeUnSansLautre({ exercice, tentativesUtilisees, tentativesMax, onActiverAide, onValider, validation }: Props) {
  return (
    <ChampValeurExacte
      id="un-sans-lautre-valeur-signee"
      enTete={
        <div className="equation-box">
          <Katex expression={`${formatCarreLatex(exercice.fonctionCible)} = ${formatCarreCibleLatex(exercice)}`} block />
        </div>
      }
      question={
        <>
          Quelle est la valeur exacte de <Katex expression={formatFonctionCibleLatex(exercice)} /> ?
        </>
      }
      placeholder={PLACEHOLDER_VALEUR_SIGNEE}
      tentativesUtilisees={tentativesUtilisees}
      tentativesMax={tentativesMax}
      diagnostiquer={(t) => statutValeurSignee(exercice, t)}
      messageCible={(v) => messageValeurSigneeUnSansLautre(exercice, v)}
      aides={aidesValeurSigneeUnSansLautre(exercice)}
      onPremiereAide={onActiverAide}
      onValider={onValider}
      validation={validation}
    />
  );
}

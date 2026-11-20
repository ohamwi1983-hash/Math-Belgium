import type { ExerciceUnSansLautre } from "../core/unSansLautre.types";
import { Katex } from "./Katex";
import { formatCarreCibleLatex, formatCarreLatex, formatFonctionCibleLatex, formatFonctionFinaleLatex, formatValeurCibleSimplifieeLatex, PLACEHOLDER_TANGENTE } from "../ui/formatUnSansLautre";
import { statutTangente } from "../moteur/verificationUnSansLautre";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { ChampValeurExacte } from "./ChampValeurExacte";
import { aidesFinaleUnSansLautre, messageFinaleUnSansLautre } from "../ui/aidesUnSansLautre";

interface Props {
  exercice: ExerciceUnSansLautre;
  tentativesUtilisees: number;
  tentativesMax: number;
  aideActivee: boolean;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  validation?: ValidationEtapeProps | null;
}

/** Troisième étape : tan θ (ou sin θ pour la variante « tan θ donné »). Le bloc local garde les
 * deux résultats confirmés précédents. Valeur exacte seulement (`ChampValeurExacte`). */
export function EtapeTangenteUnSansLautre({ exercice, tentativesUtilisees, tentativesMax, onActiverAide, onValider, validation }: Props) {
  return (
    <ChampValeurExacte
      id="un-sans-lautre-tangente"
      enTete={
        <div className="equation-box">
          <Katex expression={`${formatCarreLatex(exercice.fonctionCible)} = ${formatCarreCibleLatex(exercice)}`} block />
          <Katex expression={`${formatFonctionCibleLatex(exercice)} = ${formatValeurCibleSimplifieeLatex(exercice)}`} block />
        </div>
      }
      question={
        <>
          Quelle est la valeur exacte de <Katex expression={formatFonctionFinaleLatex(exercice)} /> ?
        </>
      }
      placeholder={PLACEHOLDER_TANGENTE}
      tentativesUtilisees={tentativesUtilisees}
      tentativesMax={tentativesMax}
      diagnostiquer={(t) => statutTangente(exercice, t)}
      messageCible={(v) => messageFinaleUnSansLautre(exercice, v)}
      aides={aidesFinaleUnSansLautre(exercice)}
      onPremiereAide={onActiverAide}
      onValider={onValider}
      validation={validation}
    />
  );
}

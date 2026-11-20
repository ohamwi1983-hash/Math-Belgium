import type { ExerciceUnSansLautre } from "../core/unSansLautre.types";
import { Katex } from "./Katex";
import { formatCarreLatex, PLACEHOLDER_CARRE } from "../ui/formatUnSansLautre";
import { statutCarre } from "../moteur/verificationUnSansLautre";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { ChampValeurExacte } from "./ChampValeurExacte";
import { aidesCarreUnSansLautre, messageCarreUnSansLautre } from "../ui/aidesUnSansLautre";

interface Props {
  exercice: ExerciceUnSansLautre;
  tentativesUtilisees: number;
  tentativesMax: number;
  aideActivee: boolean;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  validation?: ValidationEtapeProps | null;
}

/** Première étape. La valeur donnée + intervalle sur θ sont affichées une seule fois dans l'en-tête
 * de l'exercice. Valeur exacte seulement (`ChampValeurExacte`, audit 4e ch. 5). */
export function EtapeCarreUnSansLautre({ exercice, tentativesUtilisees, tentativesMax, onActiverAide, onValider, validation }: Props) {
  return (
    <ChampValeurExacte
      id="un-sans-lautre-carre"
      question={
        <>
          Quelle est la valeur exacte de <Katex expression={formatCarreLatex(exercice.fonctionCible)} /> ?
        </>
      }
      placeholder={PLACEHOLDER_CARRE}
      tentativesUtilisees={tentativesUtilisees}
      tentativesMax={tentativesMax}
      diagnostiquer={(t) => statutCarre(exercice, t)}
      messageCible={(v) => messageCarreUnSansLautre(exercice, v)}
      aides={aidesCarreUnSansLautre(exercice)}
      onPremiereAide={onActiverAide}
      onValider={onValider}
      validation={validation}
    />
  );
}

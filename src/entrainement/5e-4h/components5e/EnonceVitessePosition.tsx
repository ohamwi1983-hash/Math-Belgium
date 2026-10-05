import type { ExerciceVitessePosition } from "../core5e/vitessePosition.types";
import { formatTermesDonneesLatex, phraseEnonce, questionFinale, segmentsEnonce } from "../ui5e/formatVitessePosition";
import { Katex } from "../components/Katex";
import { SegmentsInline } from "../components/SegmentsInline";
import { QuestionFinale } from "../components/QuestionFinale";

interface Props {
  exercice: ExerciceVitessePosition;
}

/** Bloc "consigne générale + données", persistant sur les 5 (A) ou 6 (B) écrans de l'exercice —
 * même ordre que la convention transversale (consigne → bloc de données → ...) : ici la "consigne
 * générale" EST le contexte narratif lui-même (`phraseEnonce`, "prose + fragments KaTeX courts",
 * jamais un bloc `\text{...}` monolithique), suivi du bloc de données structuré (e(t), D/D1/D, t0 —
 * chacun sur sa propre ligne, `equation-box-donnees`) puis la question finale persistante. */
export function EnonceVitessePosition({ exercice }: Props) {
  return (
    <>
      <p className="prompt-text">
        <SegmentsInline segments={segmentsEnonce(phraseEnonce(exercice))} />
      </p>
      <div className="equation-box equation-box-donnees">
        {formatTermesDonneesLatex(exercice).map((frag, i) => (
          <Katex key={i} expression={frag} />
        ))}
      </div>
      <QuestionFinale question={questionFinale(exercice)} />
    </>
  );
}

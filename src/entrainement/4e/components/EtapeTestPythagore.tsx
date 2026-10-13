import { useState } from "react";
import type { ExercicePythagore } from "../core/normeDistance.types";
import type { ReponseTestPythagore } from "../moteur/verificationNormeDistance";
import { NIVEAU_AIDE_MAX } from "../moteur/typesNormeDistance";
import { CONSIGNE_GENERALE_PYTHAGORE, TEXTE_AIDE_TEST_PYTHAGORE_NIVEAU1, formatRelationsPythagoreNiveau1Latex, formatRelationsPythagoreNiveau2Latex, formatTermesDonneesPythagoreLatex, libelleRectangleEn } from "../ui/formatNormeDistance";
import { Katex } from "./Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExercicePythagore;
  estPremierEcran: boolean;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseTestPythagore) => void;
  validation?: ValidationEtapeProps | null;
}

const SOMMETS: ("A" | "B" | "C")[] = ["A", "B", "C"];

/**
 * Écran "test" — variante 6, écran 3 (dernier depuis `promptgen26refontecomplete.md`, Partie E) :
 * fusionne l'ancien écran numérique `testPythagore` et l'ancien écran catégoriel `conclusionPythagore`
 * (supprimé) en une seule question "Le triangle est rectangle en" à 3 choix (A/B/C — plus d'option
 * "pas rectangle", voir `core/normeDistance.types.ts` pour le gap connu et assumé). Les 3 normes
 * confirmées aux écrans précédents sont listées dans le récapitulatif "Ce qu'on sait déjà". Aide à
 * 2 niveaux : la relation de Pythagore
 * pour chaque sommet (niveau 1), puis substituée avec un "?" à la place du signe "=" (niveau 2).
 */
export function EtapeTestPythagore({ exercice, estPremierEcran, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation }: Props) {
  const [choix, setChoix] = useState<"A" | "B" | "C" | null>(null);
  const complet = choix !== null;
  const max = NIVEAU_AIDE_MAX.testPythagore;

  return (
    <div>
      <EnTeteExercice
        estPremierEcran={estPremierEcran}
        consigneGenerale={CONSIGNE_GENERALE_PYTHAGORE}
        blocDonnees={
          <div className="equation-box equation-box-termes">
            {formatTermesDonneesPythagoreLatex(exercice).map((t, i) => (
              <Katex key={i} expression={t} />
            ))}
          </div>
        }
      />
      <p className="prompt-text">Le triangle est rectangle en</p>

      <div className="options-grid-compact">
        {SOMMETS.map((s) => (
          <button key={s} type="button" className={choix === s ? "btn toggle-active" : "btn"} onClick={() => setChoix(s)}>
            {libelleRectangleEn(s, exercice)}
          </button>
        ))}
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{TEXTE_AIDE_TEST_PYTHAGORE_NIVEAU1}</p>
          <Katex expression={formatRelationsPythagoreNiveau1Latex(exercice)} block />
          {niveauAide >= 2 && (
            <>
              <p>Substituées :</p>
              <Katex expression={formatRelationsPythagoreNiveau2Latex(exercice)} block />
            </>
          )}
        </div>
      )}
      {!validation && (
        <>
          {max > 0 && (
            <BoutonAide niveauAide={niveauAide} niveauAideMax={max} onActiverAide={onActiverAide} />
          )}

          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => complet && onValider(choix)}>
            Valider
          </button>
          {tentativesUtilisees > 0 && (
            <p className="alert-error" role="alert">
              Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
            </p>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

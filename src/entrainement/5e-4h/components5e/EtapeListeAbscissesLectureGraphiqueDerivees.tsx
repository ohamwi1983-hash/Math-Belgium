import { useState } from "react";
import type { ExerciceLectureGraphiqueDerivees } from "../core5e/lectureGraphiqueDerivees.types";
import type { ReponseListeAbscisses } from "../moteur5e/verificationLectureGraphiqueDerivees";
import { lireNombre } from "../moteur5e/verificationLectureGraphiqueDerivees";
import { consigneEcran, consigneGenerale, precisionAnnoncee, questionFinale, texteAideNiveau1 } from "../ui5e/formatLectureGraphiqueDerivees";
import { Katex } from "../components/Katex";
import { QuestionFinale } from "../components/QuestionFinale";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";
import { LectureGraphiqueDeriveesGraph } from "./LectureGraphiqueDeriveesGraph";
import { formatMessageErreur } from "../ui/messageErreur";
import "./lectureGraphiqueLimites.css";

interface Props {
  exercice: ExerciceLectureGraphiqueDerivees;
  ecran: "zerosFPrime" | "inflexions";
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseListeAbscisses) => void;
  validation?: ValidationEtapeProps | null;
}

const LIGNES_MAX = 6;

/**
 * Écrans « tangentes horizontales » et « points d'inflexion » de 5gen30 : l'élève ajoute une ligne
 * par point repéré et lit son abscisse, ou coche « Aucun point ». Le nombre de champs ne révèle rien
 * (aucune ligne pré-placée) ; ordre libre. Une écriture illisible ne consomme pas de tentative ;
 * après une tentative fausse, aucune ligne n'est marquée (le nombre de points se devinerait).
 */
export function EtapeListeAbscissesLectureGraphiqueDerivees({ exercice, ecran, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation }: Props) {
  const [valeurs, setValeurs] = useState<string[]>([]);
  const [aucun, setAucun] = useState(false);
  const [illisibles, setIllisibles] = useState<boolean[] | null>(null);
  const fige = !!validation;
  const complet = aucun ? valeurs.length === 0 : valeurs.length > 0 && valeurs.every((v) => v.trim() !== "");

  function ajouter() {
    setValeurs((vs) => [...vs, ""]);
    setIllisibles(null);
  }
  function retirer(i: number) {
    setValeurs((vs) => vs.filter((_, j) => j !== i));
    setIllisibles(null);
  }
  function modifier(i: number, texte: string) {
    setValeurs((vs) => vs.map((v, j) => (j === i ? texte : v)));
    setIllisibles((arr) => (arr ? arr.map((x, j) => (j === i ? false : x)) : arr));
  }
  function valider() {
    if (!complet) return;
    const lisibles = valeurs.map((v) => lireNombre(v) !== null);
    if (!aucun && lisibles.some((ok) => !ok)) {
      setIllisibles(lisibles.map((ok) => !ok));
      return;
    }
    setIllisibles(null);
    onValider({ aucun, valeurs });
  }

  return (
    <div>
      <EnTeteExercice consigneGenerale={consigneGenerale()} blocDonnees={<LectureGraphiqueDeriveesGraph exercice={exercice} />} />
      <QuestionFinale question={questionFinale(exercice)} />
      <p className="prompt-text">
        {consigneEcran(ecran)} {precisionAnnoncee(ecran)}
      </p>
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideNiveau1(ecran)}</p>
        </div>
      )}

      {valeurs.map((valeur, i) => (
        <div key={i} className="field field-inline ligne-asymptote">
          <label className="field-label field-label-minuscule" htmlFor={`abscisse-${ecran}-${i}`}>
            <Katex expression="x\approx" />
          </label>
          <input
            id={`abscisse-${ecran}-${i}`}
            type="text"
            inputMode="decimal"
            className={`text-input${illisibles?.[i] ? " is-erronee" : ""}`}
            value={valeur}
            onChange={(e) => modifier(i, e.target.value)}
            placeholder="ex : 9,5"
            aria-label={`Abscisse du point ${i + 1}`}
            disabled={fige}
            autoComplete="off"
          />
          {!fige && (
            <button type="button" className="btn btn-retirer-asymptote" onClick={() => retirer(i)} aria-label={`Retirer le point ${i + 1}`} title="Retirer">
              ✕
            </button>
          )}
        </div>
      ))}

      {!fige && (
        <>
          <div className="asymptotes-ajout">
            <button type="button" className="btn" onClick={ajouter} disabled={aucun || valeurs.length >= LIGNES_MAX}>
              + Ajouter un point
            </button>
          </div>
          <label className="case-aucune-asymptote">
            <input type="checkbox" checked={aucun} disabled={valeurs.length > 0} onChange={(e) => setAucun(e.target.checked)} />
            Aucun point
          </label>
        </>
      )}
      {fige && aucun && <p className="prompt-text">Ta réponse : aucun point.</p>}

      {!validation && (
        <>
          <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
            Valider
          </button>
          {illisibles?.some(Boolean) ? (
            <p className="alert-error" role="alert">
              Écriture non reconnue : tape un nombre, par exemple 2,5 ou −1.
            </p>
          ) : (
            tentativesUtilisees > 0 && (
              <p className="alert-error" role="alert">
                {formatMessageErreur(tentativesUtilisees, tentativesMax)}
              </p>
            )
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

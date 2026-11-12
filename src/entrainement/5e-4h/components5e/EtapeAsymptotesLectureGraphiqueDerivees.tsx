import { useState } from "react";
import type { ExerciceLectureGraphiqueDerivees } from "../core5e/lectureGraphiqueDerivees.types";
import type { LigneAsymptote, ReponseNommerAsymptotes, TypeAsymptote } from "../moteur5e/typesLectureGraphiqueLimites";
import { diagnostiquerNommerAsymptotes, listeAsymptotes } from "../moteur5e/verificationLectureGraphiqueDerivees";
import { consigneEcran, consigneGenerale, questionFinale, texteAideNiveau1 } from "../ui5e/formatLectureGraphiqueDerivees";
import { LIBELLE_TYPE_ASYMPTOTE } from "../ui5e/formatLectureGraphiqueLimites";
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
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseNommerAsymptotes) => void;
  validation?: ValidationEtapeProps | null;
}

const LIGNES_MAX = 5;
const TYPES: TypeAsymptote[] = ["verticale", "horizontale", "oblique"];

/**
 * Écran « asymptotes » de 5gen30 — même ergonomie que l'écran « Nommer les asymptotes » de 5gen22
 * (audit 5e ch. 4, décision G) : l'élève ajoute une ligne par asymptote avec le bouton de son type et
 * tape son équation, ou coche « Aucune asymptote ». Aucun champ pré-placé ne révèle la structure du
 * graphique ; ordre libre, vérification par ensemble. Une écriture illisible ne consomme pas de
 * tentative ; un verdict « aucune » faux clôt l'écran (moteur).
 */
export function EtapeAsymptotesLectureGraphiqueDerivees({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation }: Props) {
  const [lignes, setLignes] = useState<LigneAsymptote[]>([]);
  const [aucune, setAucune] = useState(false);
  const [illisibles, setIllisibles] = useState<boolean[] | null>(null);
  const fige = !!validation;
  const complet = aucune ? lignes.length === 0 : lignes.length > 0 && lignes.every((l) => l.texte.trim() !== "");

  function ajouter(type: TypeAsymptote) {
    setLignes((ls) => [...ls, { type, texte: "" }]);
    setIllisibles(null);
  }
  function retirer(i: number) {
    setLignes((ls) => ls.filter((_, j) => j !== i));
    setIllisibles(null);
  }
  function modifier(i: number, texte: string) {
    setLignes((ls) => ls.map((l, j) => (j === i ? { ...l, texte } : l)));
    setIllisibles((arr) => (arr ? arr.map((x, j) => (j === i ? false : x)) : arr));
  }
  function valider() {
    if (!complet) return;
    const reponse: ReponseNommerAsymptotes = { aucune, lignes };
    const diagnostic = diagnostiquerNommerAsymptotes(reponse, listeAsymptotes(exercice.asymptotique));
    if (diagnostic.illisible) {
      setIllisibles(diagnostic.statutsLignes.map((s) => s === "parse_error"));
      return;
    }
    setIllisibles(null);
    onValider(reponse);
  }

  return (
    <div>
      <EnTeteExercice consigneGenerale={consigneGenerale()} blocDonnees={<LectureGraphiqueDeriveesGraph exercice={exercice} />} />
      <QuestionFinale question={questionFinale(exercice)} />
      <p className="prompt-text">{consigneEcran("asymptotes")}</p>
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideNiveau1("asymptotes")}</p>
        </div>
      )}

      {lignes.map((ligne, i) => {
        const { nom, sigle, prefixeLatex } = LIBELLE_TYPE_ASYMPTOTE[ligne.type];
        return (
          <div key={i} className="field field-inline ligne-asymptote">
            <label className="field-label field-label-minuscule" htmlFor={`asymptote-derivees-${i}`}>
              <Katex expression={`\\text{${sigle} : }${prefixeLatex}`} />
            </label>
            <input
              id={`asymptote-derivees-${i}`}
              type="text"
              className={`text-input${illisibles?.[i] ? " is-erronee" : ""}`}
              value={ligne.texte}
              onChange={(e) => modifier(i, e.target.value)}
              placeholder={ligne.type === "oblique" ? "ex : 5x + 12" : "ex : 7,5"}
              aria-label={`Équation de l'asymptote ${nom}`}
              disabled={fige}
              autoComplete="off"
            />
            {!fige && (
              <button type="button" className="btn btn-retirer-asymptote" onClick={() => retirer(i)} aria-label={`Retirer l'asymptote ${nom}`} title="Retirer">
                ✕
              </button>
            )}
          </div>
        );
      })}

      {!fige && (
        <>
          <div className="asymptotes-ajout" role="group" aria-label="Ajouter une asymptote">
            {TYPES.map((type) => (
              <button key={type} type="button" className="btn" onClick={() => ajouter(type)} disabled={aucune || lignes.length >= LIGNES_MAX}>
                + Asymptote {LIBELLE_TYPE_ASYMPTOTE[type].nom}
              </button>
            ))}
          </div>
          <label className="case-aucune-asymptote">
            <input type="checkbox" checked={aucune} disabled={lignes.length > 0} onChange={(e) => setAucune(e.target.checked)} />
            Aucune asymptote
          </label>
        </>
      )}
      {fige && aucune && <p className="prompt-text">Ta réponse : aucune asymptote.</p>}

      {!validation && (
        <>
          <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
            Valider
          </button>
          {illisibles?.some(Boolean) ? (
            <p className="alert-error" role="alert">
              Écriture non reconnue : tape un nombre (ex. 7,5) pour une asymptote verticale ou horizontale, une expression en x (ex. 5x + 12) pour une oblique.
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

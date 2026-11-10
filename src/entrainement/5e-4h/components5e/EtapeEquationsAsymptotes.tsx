import { useState } from "react";
import type { ExerciceLectureGraphiqueLimites } from "../core5e/lectureGraphiqueLimites.types";
import type { LigneAsymptote, ReponseNommerAsymptotes, TypeAsymptote } from "../moteur5e/typesLectureGraphiqueLimites";
import type { DiagnosticNommerAsymptotes } from "../moteur5e/verificationLectureGraphiqueLimites";
import { LIBELLE_TYPE_ASYMPTOTE, consigneGenerale, consignePhase } from "../ui5e/formatLectureGraphiqueLimites";
import { Katex } from "../components/Katex";
import { LectureGraphiqueLimitesGraph } from "./LectureGraphiqueLimitesGraph";
import { formatMessageErreur } from "../ui/messageErreur";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { EnTeteExercice } from "./EnTeteExercice";
import "./lectureGraphiqueLimites.css";

interface Props {
  exercice: ExerciceLectureGraphiqueLimites;
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (reponse: ReponseNommerAsymptotes) => void;
  diagnostiquer?: (reponse: ReponseNommerAsymptotes) => DiagnosticNommerAsymptotes;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle les lignes,
   * remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md, "validation/invalidation
   * avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Au plus 5 lignes (le graphique en compte au plus 4 : 2 AV + 2 AH) — au-delà, plus de bouton d'ajout. */
const LIGNES_MAX = 5;
const TYPES: TypeAsymptote[] = ["verticale", "horizontale", "oblique"];

/**
 * Écran "nommerAsymptotes" de 5gen22 (audit 5e ch. 4, décision G) — l'élève NOMME chaque asymptote :
 * il ajoute une ligne par asymptote avec le bouton de son type (verticale, horizontale, oblique), puis
 * tape son équation ; ou il coche « Aucune asymptote ». Rien ne révèle la structure du graphique : pas
 * de champ pré-placé par asymptote, et l'écran n'est plus sauté quand il n'y en a aucune. Ordre libre,
 * vérifié par ensemble (`diagnostiquerNommerAsymptotes`).
 *
 * Une écriture illisible ne consomme pas de tentative (lignes marquées, message de syntaxe) ; après une
 * tentative fausse, aucune ligne n'est marquée (sinon le type se gagnerait par élimination) ; un verdict
 * « aucune / au moins une » faux clôt l'écran (moteur).
 */
export function EtapeEquationsAsymptotes({ exercice, tentativesUtilisees, tentativesMax, onValider, diagnostiquer, validation }: Props) {
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
    if (diagnostiquer) {
      const diagnostic = diagnostiquer(reponse);
      if (diagnostic.illisible) {
        setIllisibles(diagnostic.statutsLignes.map((s) => s === "parse_error"));
        return;
      }
    }
    setIllisibles(null);
    onValider(reponse);
  }

  return (
    <div>
      <EnTeteExercice consigneGenerale={consigneGenerale()} blocDonnees={<LectureGraphiqueLimitesGraph exercice={exercice} />} />
      <p className="prompt-text">{consignePhase("nommerAsymptotes")}</p>

      {lignes.map((ligne, i) => {
        const { nom, sigle, prefixeLatex } = LIBELLE_TYPE_ASYMPTOTE[ligne.type];
        return (
          <div key={i} className="field field-inline ligne-asymptote">
            <label className="field-label field-label-minuscule" htmlFor={`asymptote-${i}`}>
              <Katex expression={`\\text{${sigle} : }${prefixeLatex}`} />
            </label>
            <input
              id={`asymptote-${i}`}
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

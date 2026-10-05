import { useState } from "react";
import type { ExercicePythagoricienne } from "../core5e/equationsTrigonometriques.types";
import { diagnostiquerUneRacine, type ReponseRacine, type ReponseRacinesPythagoricienne } from "../moteur5e/verificationEquationTrig";
import { CONSIGNE_RACINES_RESOLUTION, TEXTE_AIDE_RACINES_RESOLUTION_NIVEAU1, formatTermesEtatActuelPythagoricienne } from "../ui5e/formatEquationTrigonometrique";
import { CONSIGNE_GENERALE_EQUATION_TRIG } from "../ui5e/formatEquationTrig";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExercicePythagoricienne;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseRacinesPythagoricienne) => void;
  /** Statut à 3 valeurs, calculé côté PRÉSENTATION uniquement — voir `EtapeArgumentEquationTrig`. */
  diagnostiquer?: (reponse: ReponseRacinesPythagoricienne) => StatutVerification;
}

/** Bloc "état actuel" — rappelle la conversion pythagoricienne ET les racines t déjà confirmées
 * aux 2 écrans précédents. */
function EtatActuelPythagoricienne({
  exercice,
  phase,
}: {
  exercice: ExercicePythagoricienne;
  phase: "racinesPythagoricienne" | "racinesResolution" | "solutionsPythagoricienne";
}) {
  const termes = formatTermesEtatActuelPythagoricienne(exercice, phase);
  if (termes.length === 0) return null;
  return (
    <div className="etat-actuel-box etat-actuel-box-termes">
      {termes.map((t, i) => (
        <Katex key={i} expression={t} />
      ))}
    </div>
  );
}

function formatT(t: number): string {
  return Number.isInteger(t) ? String(t) : t.toString().replace(".", ",");
}

/** Écran 3 (famille "pythagoricienne") — pour CHAQUE racine, l'élève décide de la rejeter (|t|>1,
 * aucune solution réelle) ou de résoudre trig(x)=t (add-as-needed, `a=1,b=0` toujours — spec
 * explicite). Structure DOUBLÉE (une par racine), même principe que `EtapeArgumentProduit`. */
export function EtapeRacinesResolutionPythagoricienne({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [rejeter1, setRejeter1] = useState(false);
  const [lignes1, setLignes1] = useState<string[]>([""]);
  const [rejeter2, setRejeter2] = useState(false);
  const [lignes2, setLignes2] = useState<string[]>([""]);
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;

  const complet1 = rejeter1 || (lignes1.length > 0 && lignes1.every((l) => l.trim() !== ""));
  const complet2 = rejeter2 || (lignes2.length > 0 && lignes2.every((l) => l.trim() !== ""));
  const complet = complet1 && complet2;
  const reponseRacine1: ReponseRacine = rejeter1 ? { rejeter: true } : { rejeter: false, lignes: lignes1 };
  const reponseRacine2: ReponseRacine = rejeter2 ? { rejeter: true } : { rejeter: false, lignes: lignes2 };
  const racine1Erronee = montrerErreurs && !rejeter1 && diagnostiquerUneRacine(exercice.racine1, reponseRacine1) !== "correct";
  const racine2Erronee = montrerErreurs && !rejeter2 && diagnostiquerUneRacine(exercice.racine2, reponseRacine2) !== "correct";

  function valider() {
    if (!complet) return;
    const r1: ReponseRacine = rejeter1 ? { rejeter: true } : { rejeter: false, lignes: lignes1 };
    const r2: ReponseRacine = rejeter2 ? { rejeter: true } : { rejeter: false, lignes: lignes2 };
    const reponse: ReponseRacinesPythagoricienne = { racine1: r1, racine2: r2 };
    if (diagnostiquer) setDernierStatut(diagnostiquer(reponse));
    onValider(reponse);
  }

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_EQUATION_TRIG}</p>
      <EtatActuelPythagoricienne exercice={exercice} phase="racinesResolution" />
      <p className="prompt-text">{CONSIGNE_RACINES_RESOLUTION}</p>

      <p className="prompt-text">Racine t = {formatT(exercice.racine1.t)} :</p>
      <button type="button" className={`btn ${rejeter1 ? "toggle-active" : ""}`} onClick={() => setRejeter1((v) => !v)}>
        Rejeter cette racine
      </button>
      {!rejeter1 && (
        <div className="contenu-conditionnel">
          {lignes1.map((ligne, i) => (
            <div key={i}>
              <ApercuExpressionLatex texte={ligne} />
              <div className="field-row">
                <input
                  type="text"
                  className={`text-input${racine1Erronee ? " is-erronee" : ""}`}
                  value={ligne}
                  onChange={(e) => setLignes1((arr) => arr.map((v, j) => (j === i ? e.target.value : v)))}
                  placeholder="ex : pi/3 + 2*k*pi"
                />
                {lignes1.length > 1 && (
                  <button type="button" className="btn liste-morceaux-retirer" aria-label="Retirer" onClick={() => setLignes1((arr) => arr.filter((_, j) => j !== i))}>
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
          <button type="button" className="btn" onClick={() => setLignes1((arr) => [...arr, ""])}>
            + Ajouter une série
          </button>
        </div>
      )}

      <p className="prompt-text">Racine t = {formatT(exercice.racine2.t)} :</p>
      <button type="button" className={`btn ${rejeter2 ? "toggle-active" : ""}`} onClick={() => setRejeter2((v) => !v)}>
        Rejeter cette racine
      </button>
      {!rejeter2 && (
        <div className="contenu-conditionnel">
          {lignes2.map((ligne, i) => (
            <div key={i}>
              <ApercuExpressionLatex texte={ligne} />
              <div className="field-row">
                <input
                  type="text"
                  className={`text-input${racine2Erronee ? " is-erronee" : ""}`}
                  value={ligne}
                  onChange={(e) => setLignes2((arr) => arr.map((v, j) => (j === i ? e.target.value : v)))}
                  placeholder="ex : pi/3 + 2*k*pi"
                />
                {lignes2.length > 1 && (
                  <button type="button" className="btn liste-morceaux-retirer" aria-label="Retirer" onClick={() => setLignes2((arr) => arr.filter((_, j) => j !== i))}>
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
          <button type="button" className="btn" onClick={() => setLignes2((arr) => [...arr, ""])}>
            + Ajouter une série
          </button>
        </div>
      )}

      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{TEXTE_AIDE_RACINES_RESOLUTION_NIVEAU1}</p>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import type { ExerciceEtudierFonction } from "../core5e/etudierFonction.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerOrdonnee, pointsClesEtudierFonction } from "../moteur5e/verificationEtudierFonction";
import {
  CONSIGNE_GENERALE_ETUDIER_FONCTION,
  consigneEcranEtudierFonction,
  formatLabelCoordonneeLatex,
  formatTermesDonneesLatex,
  questionFinaleEtudierFonction,
  texteAideNiveau1EtudierFonction,
  texteAideNiveau2EtudierFonction,
} from "../ui5e/formatEtudierFonction";
import { Katex } from "../components/Katex";
import { QuestionFinale } from "../components/QuestionFinale";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";
import { formatMessageErreur } from "../ui/messageErreur";

interface Props {
  exercice: ExerciceEtudierFonction;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponses: string[]) => void;
  validation?: ValidationEtapeProps | null;
}

/** Écran « coordonnées » de 5gen31 (audit 5e ch. 5, décision F) : l'élève CALCULE l'ordonnée de
 * chaque point remarquable (abscisses connues depuis les tableaux) avant de les placer. Valeur exacte
 * (√, fractions) ou arrondie au centième ; une écriture illisible ne consomme pas de tentative. */
export function EtapeCoordonneesEtudierFonction({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation }: Props) {
  const points = pointsClesEtudierFonction(exercice);
  const [valeurs, setValeurs] = useState<string[]>(() => points.map(() => ""));
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const complet = points.every((_, i) => (valeurs[i] ?? "").trim() !== "");
  const statuts = tentativesUtilisees > 0 && complet ? points.map((p, i) => diagnostiquerOrdonnee(valeurs[i] ?? "", p.y)) : null;

  function modifier(i: number, texte: string) {
    setValeurs((arr) => points.map((_, j) => (j === i ? texte : (arr[j] ?? ""))));
  }
  function valider() {
    if (!complet) return;
    const s = points.map((p, i) => diagnostiquerOrdonnee(valeurs[i] ?? "", p.y));
    setDernierStatut(s.find((v) => v !== "correct") ?? "correct");
    if (s.includes("parse_error")) return;
    onValider(points.map((_, i) => valeurs[i] ?? ""));
  }

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={CONSIGNE_GENERALE_ETUDIER_FONCTION}
        blocDonnees={
          <div className="equation-box equation-box-donnees">
            {formatTermesDonneesLatex(exercice).map((frag, i) => (
              <Katex key={i} expression={frag} />
            ))}
          </div>
        }
      />
      <QuestionFinale question={questionFinaleEtudierFonction()} />
      <p className="prompt-text">{consigneEcranEtudierFonction("coordonnees")}</p>
      {points.map((p, i) => (
        <div key={p.id} className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor={`coordonnee-${i}`}>
            <Katex expression={formatLabelCoordonneeLatex(p)} />
          </label>
          <input
            id={`coordonnee-${i}`}
            type="text"
            className={`text-input${statuts && statuts[i] !== "correct" ? " is-erronee" : ""}`}
            value={valeurs[i] ?? ""}
            onChange={(e) => modifier(i, e.target.value)}
            placeholder="ex : 123,45"
            disabled={!!validation}
            autoComplete="off"
          />
        </div>
      ))}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideNiveau1EtudierFonction("coordonnees")}</p>
          {niveauAide >= 2 &&
            (() => {
              const aide2 = texteAideNiveau2EtudierFonction("coordonnees");
              return (
                <>
                  <p>{aide2.texte}</p>
                  {aide2.latex && <Katex expression={aide2.latex} block />}
                </>
              );
            })()}
        </div>
      )}
      {!validation && (
        <>
          <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
            Valider
          </button>
          {dernierStatut === "parse_error" ? (
            <p className="alert-error" role="alert">
              Écriture non reconnue : tape un nombre (ex. −2,25) ou une valeur exacte (ex. 3/4, 2 + sqrt(5)).
            </p>
          ) : (
            tentativesUtilisees > 0 && (
              <p className="alert-error" role="alert">
                {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
              </p>
            )
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

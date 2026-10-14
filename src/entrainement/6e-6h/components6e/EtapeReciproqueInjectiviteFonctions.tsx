import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import type { ExerciceInjectiviteFonctions } from "../core6e/injectiviteFonctions.types";
import type { CoteBranche } from "../moteur6e/typesInjectiviteFonctions";
import { diagnostiquerReciproque } from "../moteur6e/verificationInjectiviteFonctions";
import { CONSIGNE_ECRAN_RECIPROQUE, CONSIGNE_GENERALE, TEXTE_AIDE_RECIPROQUE_NIVEAU1, aideReciproqueNiveau2, formatFLatexAffichage } from "../ui6e/formatInjectiviteFonctions";
import { formatMessageErreur } from "../ui/messageErreur";
import { Katex } from "../components/Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceInjectiviteFonctions;
  /** Branche mémorisée par la Couche B à la clôture de l'écran précédent (voir en-tête de
   * `moteur6e/typesInjectiviteFonctions.ts`) — détermine la bonne closure de réciproque. */
  coteChoisi: CoteBranche;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran 3 — champ libre "f⁻¹(x)=", label à gauche. `App6gen1.tsx` rend ce composant avec
 * `key={phase}`. */
export function EtapeReciproqueInjectiviteFonctions({ exercice, coteChoisi, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation}: Props) {
  const [texte, setTexte] = useState("");
  const montrerErreurs = tentativesUtilisees > 0;
  const dernierStatut = montrerErreurs ? diagnostiquerReciproque(exercice, coteChoisi, texte) : null;

  function valider() {
    if (texte.trim() === "") return;
    onValider(texte);
  }

  const aide2 = aideReciproqueNiveau2(exercice);

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={CONSIGNE_GENERALE}
        blocDonnees={
          <div className="equation-box">
            <Katex expression={formatFLatexAffichage(exercice)} />
          </div>
        }
      />
      <p className="prompt-text">{CONSIGNE_ECRAN_RECIPROQUE}</p>

      <ApercuExpressionLatex texte={texte} label="f⁻¹(x) =" />
      <div className="field champ-reponse-latex">
        <span className="field-label-latex">
          <Katex expression="f^{-1}(x) =" />
        </span>
        <input
          type="text"
          className={`text-input${montrerErreurs && dernierStatut !== "correct" ? " is-erronee" : ""}`}
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
        />
      </div>

      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={texte.trim() === ""} onClick={valider}>
          Valider
        </button>

        {montrerErreurs && dernierStatut !== "correct" && (
          <p className="alert-error" role="alert">
            {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}

      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{TEXTE_AIDE_RECIPROQUE_NIVEAU1}</p>
          {niveauAide >= 2 && (
            <>
              <p>{aide2.texte}</p>
              {aide2.latex && <Katex expression={aide2.latex} block />}
            </>
          )}
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { Katex } from "../components/Katex";
import type { SigneCroissance } from "../core6e/etudeFonctionLogarithme.types";
import type { ReponseCroissanceGrilleC } from "../moteur6e/verificationEtudeFonctionLogarithme";
import { CONSIGNE_GENERALE } from "../ui6e/formatEtudeFonctionLogarithme";
import { BoutonAide } from "./BoutonAide";

interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

interface Props {
  enonceLatex: string;
  consigneEcran: string;
  /** Rappel de domaine + limites + asymptotes déjà confirmés — voir
   * `ui6e/formatEtudeFonctionLogarithme.ts::etatActuel`. */
  etatActuel: string[];
  k: number;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseCroissanceGrilleC) => void;
}

/** Écran "croissance", forme "grilleC" — famille C uniquement : tableau de signe de f' à 4 cases
 * FIXES (jamais add-as-needed, le nombre de branches est structurellement déterminé par le domaine
 * ℝ\{-k,k}), délimitées par -k, 0, k, plus la position du maximum local (toujours 0, mais vérifiée
 * comme les autres, jamais présupposée côté écran). `App6gen21.tsx` doit le rendre avec
 * `key={indexExercice}`. */
export function EtapeCroissanceGrilleCLog({ enonceLatex, consigneEcran, etatActuel, k, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [signes, setSignes] = useState<(SigneCroissance | null)[]>([null, null, null, null]);
  const [positionMax, setPositionMax] = useState("");
  const montrerErreurs = tentativesUtilisees > 0;

  const labels = [`]-\\infty\\,;\\,-${k}[`, `]-${k}\\,;\\,0[`, `]0\\,;\\,${k}[`, `]${k}\\,;\\,+\\infty[`];
  const complet = signes.every((s) => s !== null) && positionMax.trim() !== "";

  function majSigne(index: number, valeur: SigneCroissance) {
    setSignes(signes.map((s, i) => (i === index ? valeur : s)));
  }

  function valider() {
    if (!complet) return;
    onValider({ signes: signes as SigneCroissance[], positionMax });
  }

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE}</p>
      <div className="equation-box">
        <Katex expression={enonceLatex} block />
      </div>
      <div className="etat-actuel-box">
        <div className="etat-actuel-box-termes">
          {etatActuel.map((frag, i) => (
            <Katex key={i} expression={frag} />
          ))}
        </div>
      </div>
      <p className="prompt-text">{consigneEcran}</p>
      {labels.map((label, i) => (
        <div className="field" key={label}>
          <p className="field-label field-label-minuscule">
            <Katex expression={label} />
          </p>
          <div className="options-grid-compact">
            <button
              type="button"
              className={`btn ${signes[i] === "croissante" ? "toggle-active" : ""} ${montrerErreurs && signes[i] === "croissante" ? "is-erronee" : ""}`}
              onClick={() => majSigne(i, "croissante")}
            >
              Croissante
            </button>
            <button
              type="button"
              className={`btn ${signes[i] === "decroissante" ? "toggle-active" : ""} ${montrerErreurs && signes[i] === "decroissante" ? "is-erronee" : ""}`}
              onClick={() => majSigne(i, "decroissante")}
            >
              Décroissante
            </button>
          </div>
        </div>
      ))}
      <div className="field">
        <label className="field-label field-label-minuscule">Position du maximum local (x=...)</label>
        <input type="text" className={`text-input ${montrerErreurs ? "is-erronee" : ""}`} value={positionMax} placeholder="ex : 0" onChange={(e) => setPositionMax(e.target.value)} />
      </div>
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{aideNiveau1.texte}</p>
          {aideNiveau1.latex && <Katex expression={aideNiveau1.latex} block />}
          {niveauAide >= 2 && (
            <>
              <p>{aideNiveau2.texte}</p>
              {aideNiveau2.latex && <Katex expression={aideNiveau2.latex} block />}
            </>
          )}
        </div>
      )}
    </div>
  );
}

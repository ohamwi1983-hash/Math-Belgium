import { useState } from "react";
import { Katex } from "../components/Katex";
import { CONSIGNE_GENERALE } from "../ui6e/formatEquationsExponentielles";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";

interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

interface Props {
  consigneEcran: string;
  enonceLatex: string;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  placeholder: string;
  labelAjout: string;
  labelAucune: string;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (textes: string[]) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran GÉNÉRIQUE add-as-needed (0 à 2 valeurs numériques) — réutilisé par aEcran2 (A3), cEcran2,
 * cEcran3 — même patron que `EtapeListeSolutionsCyclo.tsx` (6gen3). `App6gen9.tsx` doit le rendre
 * avec `key={phase}`. */
export function EtapeListeEquExpo({ consigneEcran, enonceLatex, aideNiveau1, aideNiveau2, placeholder, labelAjout, labelAucune, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation}: Props) {
  const [aucune, setAucune] = useState(false);
  const [lignes, setLignes] = useState<string[]>([""]);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = aucune || (lignes.length > 0 && lignes.every((l) => l.trim() !== ""));

  function ajouterLigne() {
    setLignes((arr) => [...arr, ""]);
  }
  function retirerLigne(i: number) {
    setLignes((arr) => arr.filter((_, j) => j !== i));
  }
  function modifierLigne(i: number, valeur: string) {
    setLignes((arr) => arr.map((v, j) => (j === i ? valeur : v)));
  }
  function valider() {
    if (!complet) return;
    onValider(aucune ? [] : lignes);
  }

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={CONSIGNE_GENERALE}
        blocDonnees={
          <div className="equation-box">
            <Katex expression={enonceLatex} block />
          </div>
        }
      />
      <p className="prompt-text">{consigneEcran}</p>
      <button type="button" className={`btn ${aucune ? "toggle-active" : ""} ${montrerErreurs && aucune ? "is-erronee" : ""}`} onClick={() => setAucune((v) => !v)}>
        {labelAucune}
      </button>
      {!aucune && (
        <div className="contenu-conditionnel">
          {lignes.map((ligne, i) => (
            <div key={i} className="field-row">
              <input type="text" className={`text-input ${montrerErreurs ? "is-erronee" : ""}`} value={ligne} placeholder={placeholder} onChange={(e) => modifierLigne(i, e.target.value)} />
              {lignes.length > 1 && (
                <button type="button" className="btn liste-morceaux-retirer" aria-label="Retirer" onClick={() => retirerLigne(i)}>
                  ×
                </button>
              )}
            </div>
          ))}
          <button type="button" className="btn" onClick={ajouterLigne}>
            {labelAjout}
          </button>
        </div>
      )}
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
          Valider
        </button>
        {montrerErreurs && (
          <p className="alert-error" role="alert">
            Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
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

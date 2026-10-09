import { useState } from "react";
import { Katex } from "../components/Katex";
import type { CategorieCroissance } from "../core6e/limitesLogarithmiques.types";
import type { ReponseDominanceA } from "../moteur6e/verificationLimitesLogarithmiques";
import { CONSIGNE_GENERALE, formatCategorieLabel } from "../ui6e/formatLimitesLogarithmiques";
import { BoutonAide } from "./BoutonAide";

interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

const OPTIONS: CategorieCroissance[] = ["log", "polynome", "exponentielle"];

interface Props {
  consigneEcran: string;
  enonceLatex: string;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseDominanceA) => void;
}

function GroupeCategorie({ label, valeur, erreur, onChange }: { label: string; valeur: CategorieCroissance | null; erreur: boolean; onChange: (v: CategorieCroissance) => void }) {
  return (
    <div className="field">
      <p className="field-label field-label-minuscule">{label}</p>
      <div className="options-grid-compact">
        {OPTIONS.map((option) => (
          <button key={option} type="button" className={`btn ${valeur === option ? "toggle-active" : ""} ${erreur && valeur === option ? "is-erronee" : ""}`} onClick={() => onChange(option)}>
            {formatCategorieLabel(option)}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Écran "aDominance" (`6gen17`, famille A) — identifie la catégorie de croissance dominante
 * (log/polynôme/exponentielle) du numérateur ET du dénominateur, 2 sous-réponses indépendantes
 * combinées derrière UN SEUL bouton "Valider" (spec : "Champ : description du terme dominant de
 * chaque côté"). Même patron que `EtapeFacteursC.tsx` (6gen6). `App6gen17.tsx` doit le rendre avec
 * `key={phase}`. */
export function EtapeDominanceA({ consigneEcran, enonceLatex, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [numerateur, setNumerateur] = useState<CategorieCroissance | null>(null);
  const [denominateur, setDenominateur] = useState<CategorieCroissance | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;

  function valider() {
    if (numerateur === null || denominateur === null) return;
    onValider({ numerateur, denominateur });
  }

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE}</p>
      <div className="equation-box">
        <Katex expression={enonceLatex} block />
      </div>
      <p className="prompt-text">{consigneEcran}</p>
      <GroupeCategorie label="Numérateur — terme dominant" valeur={numerateur} erreur={montrerErreurs} onChange={setNumerateur} />
      <GroupeCategorie label="Dénominateur — terme dominant" valeur={denominateur} erreur={montrerErreurs} onChange={setDenominateur} />
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={numerateur === null || denominateur === null} onClick={valider}>
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

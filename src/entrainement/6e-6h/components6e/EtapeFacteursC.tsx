import { useState } from "react";
import { Katex } from "../components/Katex";
import type { ReponseFacteursC, ReponseLimite } from "../moteur6e/verificationLimitesExponentielles";
import { CONSIGNE_GENERALE } from "../ui6e/formatLimitesExponentielles";
import { BoutonAide } from "./BoutonAide";

interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

type OptionCategorielle = "plus_infini" | "moins_infini" | "zero";
const OPTIONS: OptionCategorielle[] = ["plus_infini", "moins_infini", "zero"];
const LABELS: Record<OptionCategorielle, string> = { plus_infini: "+\\infty", moins_infini: "-\\infty", zero: "0" };

interface Props {
  consigneEcran: string;
  enonceLatex: string;
  etatActuel: string[] | null;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseFacteursC) => void;
}

function GroupeBoutons({ label, valeur, erreur, onChange }: { label: string; valeur: OptionCategorielle | null; erreur: boolean; onChange: (v: OptionCategorielle) => void }) {
  return (
    <div className="field">
      <p className="field-label field-label-minuscule">{label}</p>
      <div className="options-grid-compact">
        {OPTIONS.map((option) => (
          <button key={option} type="button" className={`btn ${valeur === option ? "toggle-active" : ""} ${erreur && valeur === option ? "is-erronee" : ""}`} onClick={() => onChange(option)}>
            <Katex expression={LABELS[option]} />
          </button>
        ))}
      </div>
    </div>
  );
}

/** Écran "cFacteurs" (`6gen6`, famille C) — 2 sous-réponses catégorielles indépendantes (limite de
 * chaque facteur), combinées derrière UN SEUL bouton "Valider" (spec : "Champ : 2 valeurs").
 * `App6gen6.tsx` doit le rendre avec `key={phase}`. */
export function EtapeFacteursC({ consigneEcran, enonceLatex, etatActuel, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [facteur1, setFacteur1] = useState<OptionCategorielle | null>(null);
  const [facteur2, setFacteur2] = useState<OptionCategorielle | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;

  function valider() {
    if (facteur1 === null || facteur2 === null) return;
    const r1: ReponseLimite = { type: facteur1 };
    const r2: ReponseLimite = { type: facteur2 };
    onValider({ facteur1: r1, facteur2: r2 });
  }

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE}</p>
      <div className="equation-box">
        <Katex expression={enonceLatex} block />
      </div>
      {etatActuel && (
        <div className="etat-actuel-box">
          <div className="etat-actuel-box-termes">
            {etatActuel.map((frag, i) => (
              <Katex key={i} expression={frag} />
            ))}
          </div>
        </div>
      )}
      <p className="prompt-text">{consigneEcran}</p>
      <GroupeBoutons label="x^r →" valeur={facteur1} erreur={montrerErreurs} onChange={setFacteur1} />
      <GroupeBoutons label="e^(-x^s) →" valeur={facteur2} erreur={montrerErreurs} onChange={setFacteur2} />
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={facteur1 === null || facteur2 === null} onClick={valider}>
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

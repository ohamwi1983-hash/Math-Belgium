import { useState } from "react";
import { Katex } from "../components/Katex";
import type { StatutLimiteQualitatif } from "../core6e/etudeFonctionLogarithme.types";
import type { ReponseComportementInfiniE } from "../moteur6e/verificationEtudeFonctionLogarithme";
import { CONSIGNE_GENERALE, consigneComportementInfiniE } from "../ui6e/formatEtudeFonctionLogarithme";
import { BoutonAide } from "./BoutonAide";

interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

const OPTIONS: { id: StatutLimiteQualitatif; label: string }[] = [
  { id: "zero", label: "La limite existe et vaut 0" },
  { id: "nexiste_pas", label: "La limite n'existe pas" },
];

function GroupeDirection({ label, valeur, erreur, onChange }: { label: string; valeur: StatutLimiteQualitatif | null; erreur: boolean; onChange: (v: StatutLimiteQualitatif) => void }) {
  return (
    <div className="field">
      <p className="field-label field-label-minuscule">
        <Katex expression={label} />
      </p>
      <div className="options-grid-compact">
        {OPTIONS.map((o) => (
          <button key={o.id} type="button" className={`btn ${valeur === o.id ? "toggle-active" : ""} ${erreur && valeur === o.id ? "is-erronee" : ""}`} onClick={() => onChange(o.id)}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

interface Props {
  enonceLatex: string;
  /** Rappel du domaine déjà confirmé à l'écran précédent — voir
   * `ui6e/formatEtudeFonctionLogarithme.ts::etatActuel`. */
  etatActuel: string[];
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseComportementInfiniE) => void;
}

/** Écran 2/2 (DERNIER écran), famille E uniquement — "comportement aux deux infinis". Structure
 * FIXE à 2 directions (jamais add-as-needed — toujours x→-∞ ET x→+∞, pas un nombre variable), champ
 * catégoriel à 2 statuts par direction ({@link StatutLimiteQualitatif}) — aucune vérification
 * d'expression/intervalle nécessaire (comparaison catégorielle pure). `App6gen21.tsx` doit le
 * rendre avec `key={indexExercice}`. */
export function EtapeComportementInfiniE({ enonceLatex, etatActuel, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [moinsInfini, setMoinsInfini] = useState<StatutLimiteQualitatif | null>(null);
  const [plusInfini, setPlusInfini] = useState<StatutLimiteQualitatif | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = moinsInfini !== null && plusInfini !== null;

  function valider() {
    if (!complet) return;
    onValider({ moinsInfini, plusInfini });
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
      <p className="prompt-text">{consigneComportementInfiniE()}</p>
      <GroupeDirection label="x \to -\infty" valeur={moinsInfini} erreur={montrerErreurs} onChange={setMoinsInfini} />
      <GroupeDirection label="x \to +\infty" valeur={plusInfini} erreur={montrerErreurs} onChange={setPlusInfini} />
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

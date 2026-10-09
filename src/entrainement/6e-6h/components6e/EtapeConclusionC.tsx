import { useState } from "react";
import { Katex } from "../components/Katex";
import type { AideAvecLatex, OptionQcm } from "../ui6e/formatComplexesAvances";
import { BoutonAide } from "./BoutonAide";

interface Props {
  consigneGenerale: string;
  blocDonnees: string[];
  etatActuel: string[] | null;
  consigneEcran: string;
  optionsStatut: OptionQcm[];
  optionsReciproque: OptionQcm[];
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (valeurs: string[]) => void;
}

/**
 * Écran DÉDIÉ famille C, écran 3 ("conclusion : statut ET réciproque") — 2 groupes de choix
 * `.btn.toggle-active` INDÉPENDANTS sur le même écran (jamais `.btn-primary`, convention CLAUDE.md) :
 * le statut (les 2 expressions confirmées sont-elles égales) et la réciproque (vraie/fausse). Le
 * second groupe apparaît dans un bloc `.contenu-conditionnel` une fois le premier choix fait —
 * l'élève répond aux 2 questions dans l'ordre logique de l'énoncé. `valeurs=[statutId,
 * reciproqueId]` soumis à `onValider` — voir `moteur6e/verificationComplexesAvances.ts`,
 * `diagnostiquerCEcran3`. `App6gen42.tsx` doit le rendre avec `key={phase}`.
 */
export function EtapeConclusionC({ consigneGenerale, blocDonnees, etatActuel, consigneEcran, optionsStatut, optionsReciproque, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [statut, setStatut] = useState<string | null>(null);
  const [reciproque, setReciproque] = useState<string | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = statut !== null && reciproque !== null;

  function valider() {
    if (!complet) return;
    onValider([statut as string, reciproque as string]);
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale}</p>
      <div className="equation-box">
        <div className="equation-box-donnees">
          {blocDonnees.map((frag, i) => (
            <Katex key={i} expression={frag} block />
          ))}
        </div>
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
      <p className="prompt-text">Les 2 expressions confirmées sont-elles égales ?</p>
      <div className="options-grid-compact">
        {optionsStatut.map((option) => (
          <button key={option.id} type="button" className={`btn ${statut === option.id ? "toggle-active" : ""} ${montrerErreurs && statut === option.id ? "is-erronee" : ""}`} onClick={() => setStatut(option.id)}>
            {option.label}
          </button>
        ))}
      </div>
      {statut !== null && (
        <div className="contenu-conditionnel">
          <p className="prompt-text">La réciproque est-elle vraie ?</p>
          <div className="options-grid-compact">
            {optionsReciproque.map((option) => (
              <button key={option.id} type="button" className={`btn ${reciproque === option.id ? "toggle-active" : ""} ${montrerErreurs && reciproque === option.id ? "is-erronee" : ""}`} onClick={() => setReciproque(option.id)}>
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
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

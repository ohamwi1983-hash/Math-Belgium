import { useState } from "react";
import { Katex } from "../components/Katex";
import type { IdRelationRacineUnite } from "../moteur6e/verificationRacinesNiemes";
import { OPTIONS_RELATION_C } from "../moteur6e/verificationRacinesNiemes";
import type { AideAvecLatex } from "../ui6e/formatRacinesNiemes";
import { LIBELLE_RELATION_C } from "../ui6e/formatRacinesNiemes";
import { BoutonAide } from "./BoutonAide";

interface Props {
  consigneGenerale: string;
  blocDonnees: string[];
  etatActuel: string[] | null;
  consigneEcran: string;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (id: IdRelationRacineUnite) => void;
}

/**
 * Écran de CHOIX — famille C, écran 1 UNIQUEMENT ("reconnaître la relation z=w·ζ_k") — mirroir
 * `EtapeChoixCongruenceFormeTrigonometrique.tsx` (6gen37, famille D écran 2). Choix véritable
 * présenté à l'élève ⟹ boutons `.btn.toggle-active`, JAMAIS `.btn-primary` (réservé à "Valider",
 * convention CLAUDE.md). `OPTIONS_RELATION_C` (`moteur6e/verificationRacinesNiemes.ts`) fixe l'ordre
 * des boutons — synchronisé avec `diagnostiquerCEcran1`, qui compare directement l'identifiant
 * choisi à `"correct"`.
 */
export function EtapeChoixRelationRacinesNiemes({ consigneGenerale, blocDonnees, etatActuel, consigneEcran, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [choix, setChoix] = useState<IdRelationRacineUnite | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;

  function valider() {
    if (choix === null) return;
    onValider(choix);
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
      <div className="options-grid-compact">
        {OPTIONS_RELATION_C.map((option) => (
          <button key={option} type="button" className={`btn ${choix === option ? "toggle-active" : ""} ${montrerErreurs && choix === option ? "is-erronee" : ""}`} onClick={() => setChoix(option)}>
            <Katex expression={LIBELLE_RELATION_C[option]} />
          </button>
        ))}
      </div>
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={choix === null} onClick={valider}>
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

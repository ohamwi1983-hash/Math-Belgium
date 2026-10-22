import { useState } from "react";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import type { StatutPariteHyperbolique } from "../core6e/hyperboliques.types";
import type { AideAvecLatex, FragmentConsigne } from "../ui6e/formatHyperboliques";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  consigneGenerale: FragmentConsigne[];
  blocDonnees: string[];
  consigneEcran: FragmentConsigne[];
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (choix: StatutPariteHyperbolique) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

const OPTIONS: { id: StatutPariteHyperbolique; label: string }[] = [
  { id: "paire", label: "Paire" },
  { id: "impaire", label: "Impaire" },
  { id: "aucune", label: "Ni l'une ni l'autre" },
];

/** Écran GÉNÉRIQUE "statut à 3 issues" — famille A (écran unique) de `6gen19`. Choix véritable
 * présenté à l'élève ⟹ boutons `.btn.toggle-active`, JAMAIS `.btn-primary` (convention CLAUDE.md).
 * Même patron que `EtapeStatutGEquationsExpLog.tsx` (`6gen14`). `App6gen19.tsx` doit le rendre
 * avec `key={phase}`. */
export function EtapeStatutPariteHyperboliques({ consigneGenerale, blocDonnees, consigneEcran, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation}: Props) {
  const [choix, setChoix] = useState<StatutPariteHyperbolique | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;

  function valider() {
    if (choix === null) return;
    onValider(choix);
  }

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={<RenduFragments fragments={consigneGenerale} />}
        blocDonnees={
          <div className="equation-box">
            <div className="equation-box-donnees">
              {blocDonnees.map((frag, i) => (
                <Katex key={i} expression={frag} />
              ))}
            </div>
          </div>
        }
      />
      <p className="prompt-text">
        <RenduFragments fragments={consigneEcran} />
      </p>
      <div className="options-grid-compact">
        {OPTIONS.map((o) => (
          <button key={o.id} type="button" className={`btn ${choix === o.id ? "toggle-active" : ""} ${montrerErreurs && choix === o.id ? "is-erronee" : ""}`} onClick={() => setChoix(o.id)}>
            {o.label}
          </button>
        ))}
      </div>
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
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={choix === null} onClick={valider}>
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
    </div>
  );
}

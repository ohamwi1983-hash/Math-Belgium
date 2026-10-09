import { useState } from "react";
import { Katex } from "../components/Katex";
import type { SigneLimiteHyperbolique } from "../core6e/hyperboliques.types";
import type { ReponseLimitesD } from "../moteur6e/verificationHyperboliques";
import type { AideAvecLatex } from "../ui6e/formatHyperboliques";
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
  onValider: (reponse: ReponseLimitesD) => void;
}

const OPTIONS: { id: SigneLimiteHyperbolique; latex: string }[] = [
  { id: "plus_infini", latex: "+\\infty" },
  { id: "moins_infini", latex: "-\\infty" },
];

/**
 * Écran DÉDIÉ famille D écran 2 (`6gen19`) — 2 GROUPES de boutons `.btn.toggle-active` (jamais
 * `.btn-primary`), un par direction (x→+∞ et x→−∞), chacun choisissant entre `+\infty`/`-\infty`
 * (la limite est TOUJOURS infinie ici — voir `core6e/hyperboliques.types.ts`, exclusion a+b=0/a=b
 * à la génération). Même esprit que `EtapeReponseLimite.tsx` (6gen6, options catégorielles), mais
 * 2 sous-réponses indépendantes sur un même écran plutôt qu'une seule (comme `EtapeFacteursC`,
 * 6gen6, qui réutilise en interne le même jeu de boutons 2 fois). `App6gen19.tsx` doit le rendre
 * avec `key={phase}`.
 */
export function EtapeLimitesHyperboliquesD({ consigneGenerale, blocDonnees, etatActuel, consigneEcran, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [plusInfini, setPlusInfini] = useState<SigneLimiteHyperbolique | null>(null);
  const [moinsInfini, setMoinsInfini] = useState<SigneLimiteHyperbolique | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = plusInfini !== null && moinsInfini !== null;

  function valider() {
    if (plusInfini === null || moinsInfini === null) return;
    onValider({ plusInfini, moinsInfini });
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale}</p>
      <div className="equation-box">
        {blocDonnees.map((frag, i) => (
          <Katex key={i} expression={frag} block />
        ))}
      </div>
      {etatActuel && (
        <div className="etat-actuel-box">
          {etatActuel.map((frag, i) => (
            <Katex key={i} expression={frag} block />
          ))}
        </div>
      )}
      <p className="prompt-text">{consigneEcran}</p>

      <p className="prompt-text">
        <Katex expression="\lim_{x\to+\infty} f(x) =" />
      </p>
      <div className="options-grid-compact">
        {OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            className={`btn ${plusInfini === o.id ? "toggle-active" : ""} ${montrerErreurs && plusInfini === o.id ? "is-erronee" : ""}`}
            onClick={() => setPlusInfini(o.id)}
          >
            <Katex expression={o.latex} />
          </button>
        ))}
      </div>

      <p className="prompt-text">
        <Katex expression="\lim_{x\to-\infty} f(x) =" />
      </p>
      <div className="options-grid-compact">
        {OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            className={`btn ${moinsInfini === o.id ? "toggle-active" : ""} ${montrerErreurs && moinsInfini === o.id ? "is-erronee" : ""}`}
            onClick={() => setMoinsInfini(o.id)}
          >
            <Katex expression={o.latex} />
          </button>
        ))}
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

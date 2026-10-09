import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";

interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

interface Props {
  consigneGenerale: string;
  blocDonnees: string[];
  etatActuel: string[] | null;
  consigneEcran: string;
  placeholder: string;
  labelAjout: string;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (textes: string[]) => void;
}

/**
 * Écran add-as-needed (1 ou 2 valeurs de m) pour `6gen25`, écran "resoudreM" — copié-adapté de
 * `EtapeListeEquationsExpLog.tsx` (6gen14), croix rouge `×` pour retirer une ligne (jamais un
 * bouton texte "Retirer", convention CLAUDE.md), MAIS sans le gate "Pas de solution" : contrairement
 * à 6gen9/6gen14 (une équation quelconque peut ne jamais avoir de solution réelle), les 3 techniques
 * de `6gen25` (voir `generateurs6e/integralesDefinies/parametre.ts`) sont construites pour TOUJOURS
 * admettre au moins une solution — le gate serait donc mort, jamais correct à cocher. Plafonné à 2
 * lignes (jamais 3, contrairement à 6gen14) : la technique "polynomiale" est la seule à produire
 * plus d'une solution, toujours exactement 2 (racines d'une équation du second degré). `App6gen25.tsx`
 * doit le rendre avec `key={phase}`.
 */
export function EtapeResoudreMIntegralesDefinies({ consigneGenerale, blocDonnees, etatActuel, consigneEcran, placeholder, labelAjout, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [lignes, setLignes] = useState<string[]>([""]);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = lignes.length > 0 && lignes.every((l) => l.trim() !== "");

  function ajouterLigne() {
    if (lignes.length >= 2) return;
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
    onValider(lignes);
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
      <div className="contenu-conditionnel">
        {lignes.map((ligne, i) => (
          <div key={i}>
            <ApercuExpressionLatex texte={ligne} label="m =" />
            <div className="field-row">
              <input type="text" className={`text-input ${montrerErreurs ? "is-erronee" : ""}`} value={ligne} placeholder={placeholder} onChange={(e) => modifierLigne(i, e.target.value)} />
              {lignes.length > 1 && (
                <button type="button" className="btn liste-morceaux-retirer" aria-label={`Retirer la valeur ${i + 1}`} onClick={() => retirerLigne(i)}>
                  ×
                </button>
              )}
            </div>
          </div>
        ))}
        {lignes.length < 2 && (
          <button type="button" className="btn" onClick={ajouterLigne}>
            {labelAjout}
          </button>
        )}
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

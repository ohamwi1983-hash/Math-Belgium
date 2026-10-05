import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import type { AideAvecLatex } from "../ui6e/formatGraphiquesDeriveeExponentielles";
import { CONSIGNE_GENERALE } from "../ui6e/formatGraphiquesDeriveeExponentielles";
import { BoutonAide } from "./BoutonAide";

interface Props {
  consigneEcran: string;
  fonctionLatex: string;
  /** `null` — jamais rendu — sur "derivee", TOUJOURS le premier écran de sa famille (B/D) : rien à
   * rappeler. Présent dans le contrat pour rester alignable avec `EtapeSelectionGraphiqueDeriveeExpo`,
   * jamais alimenté que par `null` en pratique côté `App6gen8.tsx`. */
  etatActuel: string[] | null;
  rappelDomaine: string | null;
  placeholder: string;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
}

/** Écran "derivee" (`6gen8`, familles B/D uniquement) — un seul champ texte libre pour f'(x),
 * vérifié par équivalence NUMÉRIQUE (`moteur6e/equivalenceExponentielle.ts`). `rappelDomaine`
 * (famille D seule, "x≠0") est TOUJOURS affiché, jamais gagné par une aide. `App6gen8.tsx` doit
 * rendre ce composant avec une `key` qui change entre 2 exercices (même si la phase reste
 * "derivee"), sinon le champ garderait la saisie de l'exercice précédent. */
export function EtapeDeriveeGraphExpo({ consigneEcran, fonctionLatex, etatActuel, rappelDomaine, placeholder, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [texte, setTexte] = useState("");
  const montrerErreurs = tentativesUtilisees > 0;

  function valider() {
    if (texte.trim() === "") return;
    onValider(texte);
  }

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE}</p>
      <div className="equation-box">
        <Katex expression={fonctionLatex} block />
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
      {rappelDomaine && <p className="prompt-text">{rappelDomaine}</p>}
      <ApercuExpressionLatex texte={texte} label="f'(x) =" />
      <div className="field">
        <input type="text" className={`text-input ${montrerErreurs ? "is-erronee" : ""}`} value={texte} placeholder={placeholder} onChange={(e) => setTexte(e.target.value)} />
      </div>
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={texte.trim() === ""} onClick={valider}>
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

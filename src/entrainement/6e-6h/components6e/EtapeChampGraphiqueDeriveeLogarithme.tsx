import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import type { AideAvecLatex } from "../ui6e/formatGraphiqueDeriveeLogarithme";
import { CONSIGNE_GENERALE } from "../ui6e/formatGraphiqueDeriveeLogarithme";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  consigneEcran: string;
  fonctionLatex: string;
  placeholder: string;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  /** Statut à 3 valeurs de la DERNIÈRE saisie soumise — distingue « syntaxe non reconnue » d'un
   * simple « incorrect ». */
  diagnostiquer: (texte: string) => StatutVerification;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran "derivee" (`6gen20`, 2e écran, les 3 familles — TOUJOURS traversé) — un
 * seul champ texte libre pour f'(x), vérifié par équivalence NUMÉRIQUE
 * (`moteur6e/equivalenceExponentielle.ts`). `App6gen20.tsx` doit rendre ce composant avec une `key`
 * qui change entre 2 exercices, sinon le champ garderait la saisie de l'exercice précédent. */
export function EtapeChampGraphiqueDeriveeLogarithme({
  consigneEcran,
  fonctionLatex,
  placeholder,
  aideNiveau1,
  aideNiveau2,
  tentativesUtilisees,
  tentativesMax,
  niveauAide,
  niveauAideMax,
  onActiverAide,
  onValider,
  diagnostiquer,
  validation,
}: Props) {
  const [texte, setTexte] = useState("");
  /** Dernière saisie SOUMISE — le champ n'est rouge que tant qu'il la contient encore. */
  const [texteSoumis, setTexteSoumis] = useState<string | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const rouge = (montrerErreurs || validation?.revele === true) && texteSoumis !== null && texte === texteSoumis;

  function valider() {
    if (texte.trim() === "") return;
    setTexteSoumis(texte);
    onValider(texte);
  }

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={CONSIGNE_GENERALE}
        blocDonnees={
          <div className="equation-box">
            <Katex expression={fonctionLatex} block />
          </div>
        }
      />
      <p className="prompt-text">{consigneEcran}</p>
      <ApercuExpressionLatex texte={texte} />
      <div className="field">
        <input type="text" className={`text-input ${rouge ? "is-erronee" : ""}`} value={texte} placeholder={placeholder} readOnly={!!validation} aria-label="f'(x)" onChange={(e) => setTexte(e.target.value)} />
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
        <button type="button" className="btn btn-primary" disabled={texte.trim() === ""} onClick={valider}>
          Valider
        </button>
        {montrerErreurs && texteSoumis !== null && (
          <p className="alert-error" role="alert">
            {formatMessageErreur(tentativesUtilisees, tentativesMax, diagnostiquer(texteSoumis))}
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

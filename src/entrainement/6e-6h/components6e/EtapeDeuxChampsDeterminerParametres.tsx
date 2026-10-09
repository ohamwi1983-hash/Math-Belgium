import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import type { AideAvecLatex } from "../ui6e/formatDeterminerParametresLogarithme";
import type { ReponseDeuxChamps } from "../moteur6e/verificationDeterminerParametresLogarithme";
import { BoutonAide } from "./BoutonAide";

interface Props {
  consigneGenerale: string;
  blocDonnees: string[];
  etatActuel: string[] | null;
  consigneEcran: string;
  labelA: string;
  labelB: string;
  placeholderA: string;
  placeholderB: string;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseDeuxChamps) => void;
  diagnostiquer: (reponse: ReponseDeuxChamps) => StatutVerification;
}

/**
 * Écran GÉNÉRIQUE à 2 champs texte libre pour `6gen18` — réutilisé par l'écran "système de 2
 * équations" (famille A), "q,r en fonction de p" et "valeurs de q,r" (famille B), un seul bouton
 * "Valider" commun aux 2 champs (même patron que `EtapeDeuxChampsDomaineDeriveeLog.tsx`, 6gen16).
 * `App6gen18.tsx` doit le rendre avec `key={phase}`.
 */
export function EtapeDeuxChampsDeterminerParametres({
  consigneGenerale,
  blocDonnees,
  etatActuel,
  consigneEcran,
  labelA,
  labelB,
  placeholderA,
  placeholderB,
  aideNiveau1,
  aideNiveau2,
  tentativesUtilisees,
  tentativesMax,
  niveauAide,
  niveauAideMax,
  onActiverAide,
  onValider,
  diagnostiquer,
}: Props) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const montrerErreurs = tentativesUtilisees > 0;
  const dernierStatut = montrerErreurs ? diagnostiquer({ a, b }) : null;

  function valider() {
    if (a.trim() === "" || b.trim() === "") return;
    onValider({ a, b });
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale}</p>
      <div className="equation-box">
        <div className="equation-box-donnees">
          {blocDonnees.map((frag, i) => (
            <Katex key={i} expression={frag} />
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
      <ApercuExpressionLatex texte={a} label={labelA} />
      <ApercuExpressionLatex texte={b} label={labelB} />
      <div className="field-row">
        <div className="field field-inline">
          <label className="field-label field-label-minuscule">{labelA}</label>
          <input type="text" className={`text-input ${montrerErreurs ? "is-erronee" : ""}`} value={a} placeholder={placeholderA} onChange={(e) => setA(e.target.value)} />
        </div>
        <div className="field field-inline">
          <label className="field-label field-label-minuscule">{labelB}</label>
          <input type="text" className={`text-input ${montrerErreurs ? "is-erronee" : ""}`} value={b} placeholder={placeholderB} onChange={(e) => setB(e.target.value)} />
        </div>
      </div>
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={a.trim() === "" || b.trim() === ""} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
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

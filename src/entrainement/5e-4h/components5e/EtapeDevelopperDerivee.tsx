import { useState } from "react";
import type { ExerciceDefinitionDerivee } from "../core5e/definitionDerivee.types";
import type { ReponseDevelopper } from "../moteur5e/sessionDefinitionDerivee";
import { consigneGenerale, formatTermesDonneesLatex, labelFA, labelFAH, questionSpecifiqueEcran, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatDefinitionDerivee";
import { Katex } from "../components/Katex";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelDefinitionDerivee } from "./EtatActuelDefinitionDerivee";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceDefinitionDerivee;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseDevelopper) => void;
  diagnostiquer?: (reponse: ReponseDevelopper) => { fA: StatutVerification; fAH: StatutVerification };
}

/** Écran "developper" — 2 champs (f(a) numérique, f(a+h) symbolique en h), vérifiés
 * INDÉPENDAMMENT pour l'affichage mais notés comme UNE SEULE tentative combinée (1 bouton
 * Valider) — même patron que `EtapeDiviserEuclidienne.tsx` (5gen21). Jamais de calculatrice :
 * générateur purement symbolique/exact. */
export function EtapeDevelopperDerivee({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [fA, setFA] = useState("");
  const [fAH, setFAH] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = fA.trim() !== "" && fAH.trim() !== "";
  const apresEchec = tentativesUtilisees > 0;
  const statuts = apresEchec && diagnostiquer && complet ? diagnostiquer({ fA, fAH }) : null;
  const aide2 = texteAideNiveau2(exercice, "developper");
  const question = questionSpecifiqueEcran(exercice, "developper");
  const a = exercice.a;

  function valider() {
    if (!complet) return;
    const reponse: ReponseDevelopper = { fA, fAH };
    if (diagnostiquer) {
      const s = diagnostiquer(reponse);
      setDernierStatut(s.fA !== "correct" ? s.fA : s.fAH);
    }
    onValider(reponse);
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale(exercice)}</p>
      <div className="equation-box equation-box-donnees">
        {formatTermesDonneesLatex(exercice).map((frag, i) => (
          <Katex key={i} expression={frag} />
        ))}
      </div>
      <EtatActuelDefinitionDerivee exercice={exercice} ecran="developper" />
      <p className="prompt-text">{question.texteAvant}</p>
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">
          <Katex expression={labelFA(a)} />
        </label>
        <input
          type="text"
          className={`text-input${statuts && statuts.fA !== "correct" ? " is-erronee" : ""}`}
          value={fA}
          onChange={(e) => setFA(e.target.value)}
          placeholder="ex : 4"
        />
      </div>
      <ApercuExpressionLatex texte={fAH} label={labelFAH(a)} />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">
          <Katex expression={labelFAH(a)} />
        </label>
        <input
          type="text"
          className={`text-input${statuts && statuts.fAH !== "correct" ? " is-erronee" : ""}`}
          value={fAH}
          onChange={(e) => setFAH(e.target.value)}
          placeholder="ex : 3*h+4"
        />
      </div>
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideNiveau1(exercice, "developper")}</p>
          {niveauAide >= 2 && <p>{aide2}</p>}
        </div>
      )}
    </div>
  );
}

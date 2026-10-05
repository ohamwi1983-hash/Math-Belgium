import { useState } from "react";
import type { ExerciceTangenteDoubleTangence } from "../core5e/tangentes.types";
import type { ReponseTangenteEnP } from "../moteur5e/sessionTangentes";
import { consigneGenerale, formatTermesDonneesLatex, labelFPrimeP, labelTangenteEquiv, questionSpecifiqueEcran, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatTangentes";
import { Katex } from "../components/Katex";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelTangente } from "./EtatActuelTangente";
import { CalculatriceScientifique } from "./CalculatriceScientifique";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceTangenteDoubleTangence;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseTangenteEnP) => void;
  diagnostiquer?: (reponse: ReponseTangenteEnP) => { fPrimeP: StatutVerification; tangente: StatutVerification };
}

/** Écran "tangenteEnP" (variante C, "doubleTangence") — 2 champs : f'(p) (numérique, dérivée du
 * quartique DÉJÀ DÉVELOPPÉ, calculée par l'élève lui-même — contrairement aux variantes A/B, cette
 * variante ne fournit jamais f'(x)) et l'équation de la tangente (symbolique, "y="). UNE SEULE
 * tentative combinée (1 bouton Valider) — même patron 2-champs que `EtapeDevelopperDerivee.tsx`
 * (5gen26). Calculatrice PRÉSENTE (substitution numérique dans un polynôme de degré 4). */
export function EtapeTangenteEnP({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [fPrimeP, setFPrimeP] = useState("");
  const [tangente, setTangente] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = fPrimeP.trim() !== "" && tangente.trim() !== "";
  const apresEchec = tentativesUtilisees > 0;
  const statuts = apresEchec && diagnostiquer && complet ? diagnostiquer({ fPrimeP, tangente }) : null;
  const aide2 = texteAideNiveau2("tangenteEnP");
  const question = questionSpecifiqueEcran(exercice, "tangenteEnP");

  function valider() {
    if (!complet) return;
    const reponse: ReponseTangenteEnP = { fPrimeP, tangente };
    if (diagnostiquer) {
      const s = diagnostiquer(reponse);
      setDernierStatut(s.fPrimeP !== "correct" ? s.fPrimeP : s.tangente);
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
      <EtatActuelTangente exercice={exercice} phase="tangenteEnP" />
      <p className="prompt-text">{question.texteAvant}</p>
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">
          <Katex expression={labelFPrimeP(exercice.p)} />
        </label>
        <input
          type="text"
          className={`text-input${statuts && statuts.fPrimeP !== "correct" ? " is-erronee" : ""}`}
          value={fPrimeP}
          onChange={(e) => setFPrimeP(e.target.value)}
          placeholder="ex : 1"
        />
      </div>
      <ApercuExpressionLatex texte={tangente} label={labelTangenteEquiv(exercice.p)} />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">
          <Katex expression={labelTangenteEquiv(exercice.p)} />
        </label>
        <input
          type="text"
          className={`text-input${statuts && statuts.tangente !== "correct" ? " is-erronee" : ""}`}
          value={tangente}
          onChange={(e) => setTangente(e.target.value)}
          placeholder="ex : 3*x-1"
        />
      </div>
      <CalculatriceScientifique />
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
          <p>{texteAideNiveau1("tangenteEnP")}</p>
          {niveauAide >= 2 && <p>{aide2}</p>}
        </div>
      )}
    </div>
  );
}

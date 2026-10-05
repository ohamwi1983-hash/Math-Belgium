import { useState } from "react";
import type { ExerciceSuiteGeometrique } from "../core5e/suitesGeometriques.types";
import type { PhaseSuiteGeometrique } from "../moteur5e/typesSuiteGeometrique";
import type { ReponseSommeInfinie } from "../moteur5e/verificationSuiteGeometrique";
import { consigneGenerale, consignePhase, formatTermesDonneesLatex, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatSuiteGeometrique";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelSuiteGeometrique } from "./EtatActuelSuiteGeometrique";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceSuiteGeometrique;
  phase: "sommeInfinie" | "sommeInfinieB1" | "sommeInfinieB2";
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseSommeInfinie) => void;
  /** Statut à 3 valeurs (A.1) calculé côté PRÉSENTATION uniquement — optionnel. */
  diagnostiquer?: (reponse: ReponseSommeInfinie) => StatutVerification;
}

/** Écran "sommeInfinie"/B1/B2 — choix Existe/N'existe pas PUIS, si "Existe", la valeur — piège
 * central : |q|<1 STRICTEMENT (q=1 ou q=-1 répondent tous deux "n'existe pas", contrairement à la
 * convergence de la suite elle-même). */
export function EtapeSommeInfinie({ exercice, phase, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [existe, setExiste] = useState<boolean | null>(null);
  const [valeur, setValeur] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = existe === false || (existe === true && valeur.trim() !== "");
  const apresEchec = tentativesUtilisees > 0;
  const valeurErronee = apresEchec && existe === true && !!diagnostiquer && diagnostiquer({ existe: true, valeur }) !== "correct";
  const aide2 = texteAideNiveau2(exercice, phase as PhaseSuiteGeometrique);

  function valider() {
    if (existe === null || !complet) return;
    const reponse: ReponseSommeInfinie = { existe, valeur: existe ? valeur : "" };
    if (diagnostiquer) setDernierStatut(diagnostiquer(reponse));
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
      <EtatActuelSuiteGeometrique exercice={exercice} phase={phase} />
      <p className="prompt-text">{consignePhase(exercice, phase)}</p>

      <div className="options-grid-compact">
        <button type="button" className={`btn ${existe === true ? "toggle-active" : ""}`} onClick={() => setExiste(true)}>
          Elle existe
        </button>
        <button type="button" className={`btn ${existe === false ? "toggle-active" : ""}`} onClick={() => setExiste(false)}>
          Elle n'existe pas
        </button>
      </div>

      {existe === true && (
        <div className="field field-inline contenu-conditionnel">
          <label className="field-label field-label-minuscule">
            <Katex expression="S_\infty =" />
          </label>
          <input type="text" className={`text-input${valeurErronee ? " is-erronee" : ""}`} value={valeur} onChange={(e) => setValeur(e.target.value)} />
        </div>
      )}

      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={existe === null || !complet} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <Katex expression={texteAideNiveau1(exercice, phase as PhaseSuiteGeometrique)} block />
          {niveauAide >= 2 && aide2.length > 0 && <Katex expression={aide2} block />}
        </div>
      )}
    </div>
  );
}

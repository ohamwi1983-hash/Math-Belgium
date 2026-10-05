import { useState } from "react";
import type { ExerciceModelisationSinusoide } from "../core5e/modelisationSinusoide.types";
import type { ReponseSysteme } from "../moteur5e/sessionModelisationSinusoide";
import { arrondiPrecis, consignePhase, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatModelisationSinusoide";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { BlocDonneesModelisation } from "./BlocDonneesModelisation";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelModelisation } from "./EtatActuelModelisation";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerSysteme } from "../moteur5e/verificationModelisationSinusoide";

interface Props {
  exercice: ExerciceModelisationSinusoide;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseSysteme) => void;
  /** Statut à 3 valeurs (correct/not_equivalent/parse_error), même motif que 5gen2 (A.1) — voir
   * `EtapeChampSimpleModelisation.tsx` pour la documentation complète. */
  diagnostiquer?: (reponse: ReponseSysteme) => StatutVerification;
}

/** Écran "systeme" (technique B3 uniquement) — 2 champs, une équation linéarisée en (ω,φ) par
 * point connu (t₁,v₁)/(t₂,v₂). */
export function EtapeSysteme({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const donnees = exercice.phase1;
  if (donnees.technique !== "b3") throw new Error("EtapeSysteme : technique hors 'b3'");
  const [equation1, setEquation1] = useState("");
  const [equation2, setEquation2] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = equation1.trim() !== "" && equation2.trim() !== "";
  const apresEchec = tentativesUtilisees > 0;
  /** equation1/equation2 diagnostiquées INDÉPENDAMMENT (`diagnostiquerSysteme` réutilisée
   * directement par équation, même logique que `diagnostiquerSystemePhase` côté App, qui combine
   * ces 2 mêmes appels — A.2). "parse_error" (pas de "=" dans le champ) compte comme erronée. */
  function statutEquation(texte: string, t: number, alpha: number): StatutVerification {
    const [gauche, droite] = texte.split("=");
    if (gauche === undefined || droite === undefined) return "parse_error";
    return diagnostiquerSysteme(gauche, droite, t, 1, alpha);
  }
  const equation1Erronee = apresEchec && statutEquation(equation1, donnees.t1, donnees.alpha1) !== "correct";
  const equation2Erronee = apresEchec && statutEquation(equation2, donnees.t2, donnees.alpha2) !== "correct";

  function valider() {
    if (!complet) return;
    const reponse = { equation1, equation2 };
    if (diagnostiquer) setDernierStatut(diagnostiquer(reponse));
    onValider(reponse);
  }

  return (
    <div>
      <BlocDonneesModelisation exercice={exercice} />
      <EtatActuelModelisation exercice={exercice} phase="systeme" />
      <p className="prompt-text">{consignePhase(exercice, "systeme")}</p>
      <ApercuExpressionLatex texte={equation1} />
      <div className="field">
        <label className="field-label field-label-minuscule">équation pour t₁={donnees.t1}, f₁={arrondiPrecis(donnees.v1)} :</label>
        <input
          type="text"
          className={`text-input${equation1Erronee ? " is-erronee" : ""}`}
          value={equation1}
          onChange={(e) => setEquation1(e.target.value)}
          placeholder="ex : omega*2+phi=asin((1.5-4)/5)"
        />
      </div>
      <ApercuExpressionLatex texte={equation2} />
      <div className="field">
        <label className="field-label field-label-minuscule">équation pour t₂={donnees.t2}, f₂={arrondiPrecis(donnees.v2)} :</label>
        <input
          type="text"
          className={`text-input${equation2Erronee ? " is-erronee" : ""}`}
          value={equation2}
          onChange={(e) => setEquation2(e.target.value)}
          placeholder="ex : omega*7+phi=asin((-1-4)/5)"
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
          <p>{texteAideNiveau1(exercice, "systeme")}</p>
          {niveauAide >= 2 && <Katex expression={texteAideNiveau2(exercice, "systeme")} block />}
        </div>
      )}
    </div>
  );
}

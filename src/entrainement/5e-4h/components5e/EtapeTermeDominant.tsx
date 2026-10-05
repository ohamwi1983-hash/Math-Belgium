import { useState } from "react";
import type { ExerciceLimite } from "../core5e/limites.types";
import type { ReponseTermeDominant } from "../moteur5e/sessionLimites";
import { consigneGenerale, consignePhase, formatBlocDonneesLatex, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatLimites";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelLimite } from "./EtatActuelLimite";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceLimite;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseTermeDominant) => void;
  diagnostiquer?: (reponse: ReponseTermeDominant) => { numerateur: StatutVerification; denominateur: StatutVerification };
}

/** Écran "termeDominant" (famille "limiteInfini" uniquement) — 2 champs symboliques FIXES (jamais
 * add-as-needed, toujours exactement 1 terme dominant par polynôme), vérifiés INDÉPENDAMMENT. */
export function EtapeTermeDominant({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [numerateur, setNumerateur] = useState("");
  const [denominateur, setDenominateur] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = numerateur.trim() !== "" && denominateur.trim() !== "";
  const apresEchec = tentativesUtilisees > 0;
  const statuts = apresEchec && diagnostiquer && complet ? diagnostiquer({ numerateur, denominateur }) : null;
  const aide2 = texteAideNiveau2(exercice, "termeDominant");

  function valider() {
    if (!complet) return;
    const reponse: ReponseTermeDominant = { numerateur, denominateur };
    if (diagnostiquer) {
      const s = diagnostiquer(reponse);
      setDernierStatut(s.numerateur !== "correct" ? s.numerateur : s.denominateur);
    }
    onValider(reponse);
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale()}</p>
      <div className="equation-box equation-box-donnees">
        <Katex expression={formatBlocDonneesLatex(exercice)} block />
      </div>
      <EtatActuelLimite exercice={exercice} phase="termeDominant" />
      <p className="prompt-text">{consignePhase(exercice, "termeDominant")}</p>
      <ApercuExpressionLatex texte={numerateur} />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">Numérateur</label>
        <input
          type="text"
          className={`text-input${statuts && statuts.numerateur !== "correct" ? " is-erronee" : ""}`}
          value={numerateur}
          onChange={(e) => setNumerateur(e.target.value)}
          placeholder="ex : 3x^3"
        />
      </div>
      <ApercuExpressionLatex texte={denominateur} />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">Dénominateur</label>
        <input
          type="text"
          className={`text-input${statuts && statuts.denominateur !== "correct" ? " is-erronee" : ""}`}
          value={denominateur}
          onChange={(e) => setDenominateur(e.target.value)}
          placeholder="ex : -2x^2"
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
          <p>{texteAideNiveau1(exercice, "termeDominant")}</p>
          {niveauAide >= 2 && <p>{aide2}</p>}
        </div>
      )}
    </div>
  );
}

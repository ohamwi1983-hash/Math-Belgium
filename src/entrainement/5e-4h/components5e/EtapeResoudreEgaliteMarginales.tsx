import { useState } from "react";
import type { ExerciceContexteEconomiqueB } from "../core5e/contexteEconomique.types";
import type { ReponseEgaliteMarginales } from "../moteur5e/verificationContexteEconomique";
import { consigneEcran, consigneGenerale, formatTermesDonneesLatex, questionFinale, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatContexteEconomique";
import { Katex } from "../components/Katex";
import { QuestionFinale } from "../components/QuestionFinale";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelContexteEconomique } from "./EtatActuelContexteEconomique";
import { CalculatriceScientifique } from "./CalculatriceScientifique";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceContexteEconomiqueB;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseEgaliteMarginales) => void;
  diagnostiquerRacine: (texte: string) => StatutVerification;
}

/** Écran "resoudreEgaliteMarginales" — 2 champs numériques (les 2 racines de Cm(x)=Rm(x), ordre
 * indifférent), PUIS un choix EXPLICITE "positive"/"négative" (jamais les 2 valeurs numériques
 * elles-mêmes en libellé de bouton — cela révèlerait les racines avant même que l'élève les ait
 * calculées, voir `verificationContexteEconomique.ts::ReponseEgaliteMarginales`). Le rappel du
 * domaine économique (x>0) est affiché en clair — c'est le RAISONNEMENT qui doit être explicite,
 * jamais un indice sur la valeur. */
export function EtapeResoudreEgaliteMarginales({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquerRacine }: Props) {
  const [racine1, setRacine1] = useState("");
  const [racine2, setRacine2] = useState("");
  const [choix, setChoix] = useState<"positive" | "negative" | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = racine1.trim() !== "" && racine2.trim() !== "" && choix !== null;
  const apresEchec = tentativesUtilisees > 0;
  const statut1 = apresEchec ? diagnostiquerRacine(racine1) : null;
  const statut2 = apresEchec ? diagnostiquerRacine(racine2) : null;

  function valider() {
    if (!complet) return;
    onValider({ racines: [racine1, racine2], choix: choix as "positive" | "negative" });
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale(exercice)}</p>
      <div className="equation-box equation-box-donnees">
        {formatTermesDonneesLatex(exercice).map((frag, i) => (
          <Katex key={i} expression={frag} />
        ))}
      </div>
      <QuestionFinale question={questionFinale(exercice)} />
      <EtatActuelContexteEconomique exercice={exercice} ecran="resoudreEgaliteMarginales" />
      <p className="prompt-text">{consigneEcran(exercice, "resoudreEgaliteMarginales")}</p>

      <div className="field field-inline">
        <label className="field-label field-label-minuscule">
          <Katex expression="x_1=" />
        </label>
        <input type="text" className={`text-input${statut1 && statut1 !== "correct" ? " is-erronee" : ""}`} value={racine1} onChange={(e) => setRacine1(e.target.value)} placeholder="ex : 3" />
      </div>
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">
          <Katex expression="x_2=" />
        </label>
        <input type="text" className={`text-input${statut2 && statut2 !== "correct" ? " is-erronee" : ""}`} value={racine2} onChange={(e) => setRacine2(e.target.value)} placeholder="ex : -2" />
      </div>

      <p className="prompt-text">Rappel : x représente une quantité produite — laquelle des 2 solutions est physiquement valable ?</p>
      <div className="options-grid-compact">
        <button type="button" className={`btn${choix === "positive" ? " toggle-active" : ""}`} onClick={() => setChoix("positive")}>
          La solution positive (x&gt;0)
        </button>
        <button type="button" className={`btn${choix === "negative" ? " toggle-active" : ""}${montrerErreurs && choix === "negative" ? " is-erronee" : ""}`} onClick={() => setChoix("negative")}>
          La solution négative (x&lt;0)
        </button>
      </div>

      <CalculatriceScientifique />
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
          <p>{texteAideNiveau1("resoudreEgaliteMarginales")}</p>
          {niveauAide >= 2 && <p>{texteAideNiveau2(exercice, "resoudreEgaliteMarginales")}</p>}
        </div>
      )}
    </div>
  );
}

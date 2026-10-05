import { useState } from "react";
import type { ExerciceVitessePosition } from "../core5e/vitessePosition.types";
import { consigneEcran, consigneJustification, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatVitessePosition";
import type { ReponseResoudre } from "../moteur5e/verificationVitessePosition";
import { EnonceVitessePosition } from "./EnonceVitessePosition";
import { EtatActuelVitessePosition } from "./EtatActuelVitessePosition";
import { BoutonAide } from "./BoutonAide";
import { CalculatriceScientifique } from "./CalculatriceScientifique";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceVitessePosition;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseResoudre) => void;
  /** Diagnostic PAR CHAMP (surlignage rouge individuel) — correct si la valeur saisie correspond
   * à L'UNE des 2 racines attendues, peu importe la position du champ. */
  diagnostiquerRacine?: (texte: string) => StatutVerification;
}

/** Écran "resoudre" — RÉSOUT L'ÉQUATION DU SECOND DEGRÉ e(t)=distanceCible : 2 champs numériques
 * (les 2 racines, ENSEMBLE, ordre indifférent — même patron que `EtapeRacinesTangente.tsx`,
 * 5gen28) PUIS un QCM dédié "pourquoi rejette-t-on la racine négative" (`exercice.
 * optionsRejetRacine`, ordre déjà mélangé à la construction) — l'interaction dédiée exigée par
 * CLAUDE.md pour ne JAMAIS rejeter une racine silencieusement : l'élève doit explicitement
 * justifier le rejet, pas seulement omettre la racine négative de sa réponse finale.
 */
export function EtapeResoudreVitessePosition({
  exercice,
  tentativesUtilisees,
  tentativesMax,
  niveauAide,
  niveauAideMax,
  onActiverAide,
  onValider,
  diagnostiquerRacine,
}: Props) {
  const [racine1, setRacine1] = useState("");
  const [racine2, setRacine2] = useState("");
  const [justificationIndex, setJustificationIndex] = useState<number | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = racine1.trim() !== "" && racine2.trim() !== "" && justificationIndex !== null;
  const apresEchec = tentativesUtilisees > 0;
  const statut1 = apresEchec && diagnostiquerRacine && racine1.trim() !== "" ? diagnostiquerRacine(racine1) : null;
  const statut2 = apresEchec && diagnostiquerRacine && racine2.trim() !== "" ? diagnostiquerRacine(racine2) : null;
  const justificationErronee = apresEchec && justificationIndex !== null && exercice.optionsRejetRacine[justificationIndex]?.correcte !== true;
  const aide2 = texteAideNiveau2("resoudre");

  function valider() {
    if (!complet) return;
    onValider({ racines: [racine1, racine2], justificationIndex });
  }

  return (
    <div>
      <EnonceVitessePosition exercice={exercice} />
      <EtatActuelVitessePosition exercice={exercice} ecran="resoudre" />
      <p className="prompt-text">{consigneEcran(exercice, "resoudre")}</p>

      <div className="field field-inline">
        <label className="field-label field-label-minuscule">t =</label>
        <input
          type="text"
          className={`text-input${statut1 && statut1 !== "correct" ? " is-erronee" : ""}`}
          value={racine1}
          onChange={(e) => setRacine1(e.target.value)}
          placeholder="ex : 5"
        />
      </div>
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">t =</label>
        <input
          type="text"
          className={`text-input${statut2 && statut2 !== "correct" ? " is-erronee" : ""}`}
          value={racine2}
          onChange={(e) => setRacine2(e.target.value)}
          placeholder="ex : -8"
        />
      </div>
      <CalculatriceScientifique />

      <p className="prompt-text">{consigneJustification()}</p>
      <div className="options-grid">
        {exercice.optionsRejetRacine.map((option, index) => (
          <button
            key={index}
            type="button"
            className={`btn${justificationIndex === index ? " toggle-active" : ""}${justificationErronee && justificationIndex === index ? " is-erronee" : ""}`}
            onClick={() => setJustificationIndex(index)}
          >
            {option.texte}
          </button>
        ))}
      </div>

      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, null)}
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideNiveau1("resoudre")}</p>
          {niveauAide >= 2 && <p>{aide2}</p>}
        </div>
      )}
    </div>
  );
}

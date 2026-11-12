import { useState } from "react";
import type { ExerciceVitessePosition } from "../core5e/vitessePosition.types";
import { consigneEcranRiche, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatVitessePosition";
import type { ReponseResoudre } from "../moteur5e/verificationVitessePosition";
import { Katex } from "../components/Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { CalculatriceScientifique } from "./CalculatriceScientifique";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";
import { TexteRiche5e } from "./TexteRiche5e";

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
  validation?: ValidationEtapeProps | null;
}

/** Écran "resoudre" — résout l'équation du second degré s(t)=distanceCible : 2 champs numériques
 * (les 2 racines, ENSEMBLE, ordre indifférent). Le choix de la solution à rejeter est l'écran
 * suivant ("rejet", QCM à une seule tentative) : un choix fermé ne partage jamais les 3 tentatives
 * des champs libres (décision D de l'audit). Exemples des champs DÉCIMAUX : les racines sont
 * toujours entières, un exemple ne peut donc jamais être une réponse. */
export function EtapeResoudreVitessePosition({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquerRacine, validation }: Props) {
  const [racine1, setRacine1] = useState("");
  const [racine2, setRacine2] = useState("");
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = racine1.trim() !== "" && racine2.trim() !== "";
  const apresEchec = tentativesUtilisees > 0;
  const statut1 = apresEchec && diagnostiquerRacine && racine1.trim() !== "" ? diagnostiquerRacine(racine1) : null;
  const statut2 = apresEchec && diagnostiquerRacine && racine2.trim() !== "" ? diagnostiquerRacine(racine2) : null;
  const aides = niveauAide >= 2 ? [texteAideNiveau1("resoudre"), texteAideNiveau2("resoudre")] : niveauAide >= 1 ? [texteAideNiveau1("resoudre")] : [];

  function valider() {
    if (!complet) return;
    onValider({ racines: [racine1, racine2] });
  }

  return (
    <div>
      <p className="prompt-text">
        <TexteRiche5e texte={consigneEcranRiche(exercice, "resoudre")} />
      </p>

      {[
        { valeur: racine1, set: setRacine1, statut: statut1, placeholder: "ex : 2,5", indice: 1 },
        { valeur: racine2, set: setRacine2, statut: statut2, placeholder: "ex : −1,5", indice: 2 },
      ].map((champ) => (
        <div key={champ.indice} className="field field-inline">
          <label className="field-label field-label-minuscule">
            <Katex expression={`t_{${champ.indice}}=`} />
          </label>
          <input
            type="text"
            className={`text-input${champ.statut && champ.statut !== "correct" ? " is-erronee" : ""}`}
            value={champ.valeur}
            onChange={(e) => champ.set(e.target.value)}
            placeholder={champ.placeholder}
          />
        </div>
      ))}
      <CalculatriceScientifique />

      {aides.length > 0 && (
        <div className="aide-5e">
          {aides.map((aide, i) => (
            <div key={i}>
              <p>
                <TexteRiche5e texte={aide.texte} />
              </p>
              {aide.latex && <Katex expression={aide.latex} block />}
            </div>
          ))}
        </div>
      )}
      {!validation && (
        <>
          <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
            Valider
          </button>
          {montrerErreurs && (
            <p className="alert-error" role="alert">
              {formatMessageErreur(tentativesUtilisees, tentativesMax, null)}
            </p>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

import { useState } from "react";
import type { ExerciceVitessePosition } from "../core5e/vitessePosition.types";
import { consigneEcranRiche } from "../ui5e/formatVitessePosition";
import { aidesVitessePosition } from "../ui5e/retoursVitessePosition";
import { saisieIllisibleVitessePosition } from "../moteur5e/sessionVitessePosition";
import { MESSAGES_ILLISIBLE_DERIVEES } from "../moteur5e/saisieDerivees";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { PiedEcranFonctions } from "./PiedEcranFonctions";
import type { ReponseResoudre } from "../moteur5e/verificationVitessePosition";
import { Katex } from "../components/Katex";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { CalculatriceScientifique } from "./CalculatriceScientifique";
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
  const [illisible, setIllisible] = useState(false);
  const complet = racine1.trim() !== "" && racine2.trim() !== "";
  const apresEchec = tentativesUtilisees > 0;
  const statut1 = apresEchec && diagnostiquerRacine && racine1.trim() !== "" ? diagnostiquerRacine(racine1) : null;
  const statut2 = apresEchec && diagnostiquerRacine && racine2.trim() !== "" ? diagnostiquerRacine(racine2) : null;
  function valider() {
    if (!complet) return;
    if (saisieIllisibleVitessePosition(exercice, "resoudre", [racine1, racine2])) {
      setIllisible(true);
      return;
    }
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
            onChange={(e) => {
              setIllisible(false);
              champ.set(normaliserSigneMoins(e.target.value));
            }}
            placeholder={champ.placeholder}
            disabled={!!validation}
            autoComplete="off"
          />
        </div>
      ))}
      <CalculatriceScientifique />

      <PiedEcranFonctions
        aides={aidesVitessePosition(exercice, "resoudre")}
        niveauAide={niveauAide}
        niveauAideMax={niveauAideMax}
        onActiverAide={onActiverAide}
        onValider={valider}
        vide={!complet}
        illisible={illisible}
        texteIllisible={MESSAGES_ILLISIBLE_DERIVEES.nombre}
        tentativesUtilisees={tentativesUtilisees}
        tentativesMax={tentativesMax}
        cible={null}
        validation={validation}
      />
    </div>
  );
}

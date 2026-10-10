import { useState } from "react";
import type { ExerciceTriangleLies } from "../core/triangleLies.types";
import { diagnostiquerSoustraction } from "../moteur/verificationTriangleLies";
import type { ReponseSoustractionTriangleLies } from "../moteur/verificationTriangleLies";
import { NIVEAU_AIDE_MAX_SOUSTRACTION } from "../moteur/sessionTriangleLies";
import { consigneSoustraction, formatDistancesParcouruesTexte, formatEtatActuelPontConfirme, texteAideSoustractionNiveau1, texteAideSoustractionNiveau2 } from "../ui/formatTriangleLies";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { formatMessageErreur } from "../ui/messageErreur";
import { BlocDonneesTriangleLies } from "./BlocDonneesTriangleLies";
import { EnonceTriangleLies } from "./EnonceTriangleLies";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceTriangleLies;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseSoustractionTriangleLies) => void;
}

/** Écran 2, `sommetPartage` uniquement — les 2 côtés du triangle cible, chacun obtenu en
 * soustrayant la distance déjà parcourue au côté correspondant du triangle pont. */
export function EtapeSoustractionTriangleLies({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [cote1, setCote1] = useState("");
  const [cote2, setCote2] = useState("");
  const complet = cote1.trim() !== "" && cote2.trim() !== "";
  const reponse: ReponseSoustractionTriangleLies = { cote1: Number(cote1.replace(",", ".")), cote2: Number(cote2.replace(",", ".")) };
  const statut = complet ? diagnostiquerSoustraction(exercice, reponse) : undefined;
  const apresEchec = tentativesUtilisees > 0;
  const uniteCote = exercice.donneesPont[0]?.unite ?? "";

  return (
    <div>
      <EnonceTriangleLies exercice={exercice} />
      <BlocDonneesTriangleLies titre="État actuel" lignes={[formatEtatActuelPontConfirme(exercice)]} />
      <BlocDonneesTriangleLies titre="Distances déjà parcourues" lignes={formatDistancesParcouruesTexte(exercice)} />
      <p className="prompt-text">{consigneSoustraction()}</p>
      <div className="field-row">
        <div className="field">
          <label className="field-label" htmlFor="triangle-lies-soustraction-cote1">
            Côté 1
          </label>
          <div className="champ-avec-unite">
            <input
              id="triangle-lies-soustraction-cote1"
              className={`text-input${apresEchec && statut && statut !== "correct" ? " is-erronee" : ""}`}
              value={cote1}
              onChange={(e) => setCote1(filtrerSaisieNumerique(e.target.value))}
              onKeyDown={gererKeyDownNumerique}
            />
            <span className="champ-avec-unite-suffixe">{uniteCote}</span>
          </div>
        </div>
        <div className="field">
          <label className="field-label" htmlFor="triangle-lies-soustraction-cote2">
            Côté 2
          </label>
          <div className="champ-avec-unite">
            <input
              id="triangle-lies-soustraction-cote2"
              className={`text-input${apresEchec && statut && statut !== "correct" ? " is-erronee" : ""}`}
              value={cote2}
              onChange={(e) => setCote2(filtrerSaisieNumerique(e.target.value))}
              onKeyDown={gererKeyDownNumerique}
            />
            <span className="champ-avec-unite-suffixe">{uniteCote}</span>
          </div>
        </div>
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{texteAideSoustractionNiveau1()}</p>
          {niveauAide >= 2 && <p>{texteAideSoustractionNiveau2(exercice)}</p>}
        </div>
      )}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_SOUSTRACTION} onActiverAide={onActiverAide} />

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(reponse)}>
        Valider
      </button>
      {apresEchec && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, statut)}
        </p>
      )}
    </div>
  );
}

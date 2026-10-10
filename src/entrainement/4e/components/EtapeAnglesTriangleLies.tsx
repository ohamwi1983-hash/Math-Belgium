import { useState } from "react";
import type { ExerciceTriangleLies } from "../core/triangleLies.types";
import { diagnostiquerAngles } from "../moteur/verificationTriangleLies";
import type { ReponseAnglesTriangleLies } from "../moteur/verificationTriangleLies";
import { NIVEAU_AIDE_MAX_ANGLES } from "../moteur/sessionTriangleLies";
import { consigneAngles, formatAnglesBrutsViseeTexte, formatEtatActuelPontConfirme, texteAideAnglesNiveau1, texteAideAnglesNiveau2, texteAideAnglesNiveau3 } from "../ui/formatTriangleLies";
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
  onValider: (reponse: ReponseAnglesTriangleLies) => void;
}

/** Écran 2, `anglePartage` uniquement — l'angle utile (différence des 2 visées) et l'angle déduit
 * de l'hypothèse annexe, les 2 angles qui ferment le triangle cible. */
export function EtapeAnglesTriangleLies({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [utile, setUtile] = useState("");
  const [hypothese, setHypothese] = useState("");
  const complet = utile.trim() !== "" && hypothese.trim() !== "";
  const reponse: ReponseAnglesTriangleLies = { angleUtile: Number(utile.replace(",", ".")), angleHypothese: Number(hypothese.replace(",", ".")) };
  const statut = complet ? diagnostiquerAngles(exercice, reponse) : undefined;
  const apresEchec = tentativesUtilisees > 0;

  return (
    <div>
      <EnonceTriangleLies exercice={exercice} />
      <BlocDonneesTriangleLies titre="État actuel" lignes={[formatEtatActuelPontConfirme(exercice)]} />
      <BlocDonneesTriangleLies titre="Visées depuis le point d'observation" lignes={formatAnglesBrutsViseeTexte(exercice)} />
      <p className="prompt-text">{consigneAngles()}</p>
      <div className="field-row">
        <div className="field">
          <label className="field-label" htmlFor="triangle-lies-angle-utile">
            Angle utile
          </label>
          <div className="champ-avec-unite">
            <input
              id="triangle-lies-angle-utile"
              className={`text-input${apresEchec && statut && statut !== "correct" ? " is-erronee" : ""}`}
              value={utile}
              onChange={(e) => setUtile(filtrerSaisieNumerique(e.target.value))}
              onKeyDown={gererKeyDownNumerique}
            />
            <span className="champ-avec-unite-suffixe">°</span>
          </div>
        </div>
        <div className="field">
          <label className="field-label" htmlFor="triangle-lies-angle-hypothese">
            Angle (hypothèse annexe)
          </label>
          <div className="champ-avec-unite">
            <input
              id="triangle-lies-angle-hypothese"
              className={`text-input${apresEchec && statut && statut !== "correct" ? " is-erronee" : ""}`}
              value={hypothese}
              onChange={(e) => setHypothese(filtrerSaisieNumerique(e.target.value))}
              onKeyDown={gererKeyDownNumerique}
            />
            <span className="champ-avec-unite-suffixe">°</span>
          </div>
        </div>
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{texteAideAnglesNiveau1()}</p>
          {niveauAide >= 2 && <p>{texteAideAnglesNiveau2(exercice)}</p>}
          {niveauAide >= 3 && <p>{texteAideAnglesNiveau3(exercice)}</p>}
        </div>
      )}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_ANGLES} onActiverAide={onActiverAide} />

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

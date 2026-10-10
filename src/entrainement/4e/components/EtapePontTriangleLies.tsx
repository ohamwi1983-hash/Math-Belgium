import { useState } from "react";
import type { ExerciceTriangleLies } from "../core/triangleLies.types";
import { diagnostiquerPont, diagnostiquerPontSommetPartage } from "../moteur/verificationTriangleLies";
import type { ReponsePontSommetPartage } from "../moteur/verificationTriangleLies";
import { NIVEAU_AIDE_MAX_PONT } from "../moteur/sessionTriangleLies";
import { consignePont, formatDonneesPontTexte, texteAidePontNiveau1, texteAidePontNiveau2 } from "../ui/formatTriangleLies";
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
  /** `cotePartage`/`anglePartage` — une seule valeur transférée. */
  onValider: (valeur: number) => void;
  /** `sommetPartage` uniquement — angle au sommet commun + les 2 côtés qui en partent. */
  onValiderSommetPartage: (reponse: ReponsePontSommetPartage) => void;
}

/** Écran 1, commun aux 3 configurations — résoudre le triangle "pont". `cotePartage`/`anglePartage`
 * n'ont qu'un seul côté transféré à trouver ; `sommetPartage` demande 3 valeurs (angle + 2 côtés). */
export function EtapePontTriangleLies({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, onValiderSommetPartage }: Props) {
  const [texte, setTexte] = useState("");
  const [texteAngle, setTexteAngle] = useState("");
  const [texteCote1, setTexteCote1] = useState("");
  const [texteCote2, setTexteCote2] = useState("");
  const apresEchec = tentativesUtilisees > 0;

  if (exercice.variante === "sommetPartage") {
    const complet = texteAngle.trim() !== "" && texteCote1.trim() !== "" && texteCote2.trim() !== "";
    const reponse: ReponsePontSommetPartage = {
      angle: Number(texteAngle.replace(",", ".")),
      cote1: Number(texteCote1.replace(",", ".")),
      cote2: Number(texteCote2.replace(",", ".")),
    };
    const statut = complet ? diagnostiquerPontSommetPartage(exercice, reponse) : undefined;
    const uniteCote = exercice.donneesPont[0]?.unite ?? "";

    return (
      <div>
        <EnonceTriangleLies exercice={exercice} />
        <BlocDonneesTriangleLies titre="Données" lignes={formatDonneesPontTexte(exercice)} />
        <p className="prompt-text">{consignePont(exercice)}</p>
        <div className="field field-inline">
          <label className="field-label" htmlFor="triangle-lies-pont-angle">
            Angle =
          </label>
          <div className="champ-avec-unite">
            <input
              id="triangle-lies-pont-angle"
              className={`text-input${apresEchec && statut && statut !== "correct" ? " is-erronee" : ""}`}
              value={texteAngle}
              onChange={(e) => setTexteAngle(filtrerSaisieNumerique(e.target.value))}
              onKeyDown={gererKeyDownNumerique}
            />
            <span className="champ-avec-unite-suffixe">°</span>
          </div>
        </div>
        <div className="field-row">
          <div className="field field-inline">
            <label className="field-label" htmlFor="triangle-lies-pont-cote1">
              Côté 1 =
            </label>
            <div className="champ-avec-unite">
              <input
                id="triangle-lies-pont-cote1"
                className={`text-input${apresEchec && statut && statut !== "correct" ? " is-erronee" : ""}`}
                value={texteCote1}
                onChange={(e) => setTexteCote1(filtrerSaisieNumerique(e.target.value))}
                onKeyDown={gererKeyDownNumerique}
              />
              <span className="champ-avec-unite-suffixe">{uniteCote}</span>
            </div>
          </div>
          <div className="field field-inline">
            <label className="field-label" htmlFor="triangle-lies-pont-cote2">
              Côté 2 =
            </label>
            <div className="champ-avec-unite">
              <input
                id="triangle-lies-pont-cote2"
                className={`text-input${apresEchec && statut && statut !== "correct" ? " is-erronee" : ""}`}
                value={texteCote2}
                onChange={(e) => setTexteCote2(filtrerSaisieNumerique(e.target.value))}
                onKeyDown={gererKeyDownNumerique}
              />
              <span className="champ-avec-unite-suffixe">{uniteCote}</span>
            </div>
          </div>
        </div>

        {niveauAide > 0 && (
          <div className="triangle-quelconque-aide">
            <p>{texteAidePontNiveau1(exercice)}</p>
            {niveauAide >= 2 && <p>{texteAidePontNiveau2(exercice)}</p>}
          </div>
        )}
        <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_PONT} onActiverAide={onActiverAide} />

        <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValiderSommetPartage(reponse)}>
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

  const complet = texte.trim() !== "";
  const valeur = Number(texte.replace(",", "."));
  const statut = complet ? diagnostiquerPont(exercice, valeur) : undefined;

  return (
    <div>
      <EnonceTriangleLies exercice={exercice} />
      <BlocDonneesTriangleLies titre="Données" lignes={formatDonneesPontTexte(exercice)} />
      <p className="prompt-text">{consignePont(exercice)}</p>
      <div className="field field-inline">
        <label className="field-label" htmlFor="triangle-lies-pont">
          {exercice.labelCoteTransfere} =
        </label>
        <div className="champ-avec-unite">
          <input
            id="triangle-lies-pont"
            className={`text-input${apresEchec && statut && statut !== "correct" ? " is-erronee" : ""}`}
            value={texte}
            onChange={(e) => setTexte(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
          <span className="champ-avec-unite-suffixe">m</span>
        </div>
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{texteAidePontNiveau1(exercice)}</p>
          {niveauAide >= 2 && <p>{texteAidePontNiveau2(exercice)}</p>}
        </div>
      )}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_PONT} onActiverAide={onActiverAide} />

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(valeur)}>
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

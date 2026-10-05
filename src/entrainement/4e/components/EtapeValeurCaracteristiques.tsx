import { useState } from "react";
import type { ExerciceCaracteristiquesFonction, ReponseExistence } from "../core/caracteristiquesFonction.types";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { verifierValeurEnVCaracteristiques } from "../moteur/verificationCaracteristiquesFonction";
import { MafsGraphCaracteristiquesFonction } from "./MafsGraphCaracteristiquesFonction";

type Choix = "nExistePas" | "existe";

interface Props {
  exercice: ExerciceCaracteristiquesFonction;
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (reponse: ReponseExistence) => void;
}

/**
 * Étape "f(v)" (question e, refonte point 7) : v cible toujours soit le point creux (cercle vide,
 * zone 3 — réponse "n'existe pas"), soit l'abscisse partagée de la discontinuité (cercle plein,
 * b5, refonte 3 correction 2 — réponse la valeur réelle) ; jamais une zone "simple" quelconque
 * comme avant la refonte. Même principe binaire que l'ordonnée à l'origine — l'élève doit d'abord
 * déterminer si la valeur existe avant, le cas échéant, de la lire sur le graphique.
 */
export function EtapeValeurCaracteristiques({ exercice, tentativesUtilisees, tentativesMax, onValider }: Props) {
  const [choix, setChoix] = useState<Choix | null>(null);
  const [valeur, setValeur] = useState("");

  function choisir(nouveauChoix: Choix) {
    setChoix(nouveauChoix);
    setValeur("");
  }

  const nombre = Number(valeur.trim().replace(",", "."));
  const reponse: ReponseExistence | null =
    choix === "nExistePas"
      ? { existe: false, valeur: null }
      : choix === "existe" && valeur.trim() !== "" && Number.isFinite(nombre)
        ? { existe: true, valeur: nombre }
        : null;
  const champErrone =
    tentativesUtilisees > 0 && choix === "existe" && (reponse === null || !verifierValeurEnVCaracteristiques(exercice, reponse));

  return (
    <div>
      <MafsGraphCaracteristiquesFonction exercice={exercice} />
      <p className="prompt-text">
        La fonction est-elle définie en x = {exercice.v} ? Si oui, quelle est sa valeur ? (arrondi au centième accepté si besoin)
      </p>
      <div className="options-grid">
        <button type="button" className={choix === "nExistePas" ? "btn toggle-active" : "btn"} onClick={() => choisir("nExistePas")}>
          N'existe pas
        </button>
        <button type="button" className={choix === "existe" ? "btn toggle-active" : "btn"} onClick={() => choisir("existe")}>
          Existe
        </button>
      </div>
      {choix === "existe" && (
        <div className="field field-inline contenu-conditionnel">
          <label className="field-label field-label-minuscule" htmlFor="caract-valeur">
            f({exercice.v}) =
          </label>
          <input
            id="caract-valeur"
            className={`text-input${champErrone ? " is-erronee" : ""}`}
            value={valeur}
            onChange={(e) => setValeur(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
        </div>
      )}
      <button
        type="button"
        className="btn btn-primary"
        disabled={reponse === null}
        onClick={() => reponse !== null && onValider(reponse)}
      >
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
        </p>
      )}
    </div>
  );
}

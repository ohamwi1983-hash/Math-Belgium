import { useState } from "react";
import type { ExerciceTriangleLies } from "../core/triangleLies.types";
import { diagnostiquerCible } from "../moteur/verificationTriangleLies";
import { niveauAideMaxCible } from "../moteur/sessionTriangleLies";
import {
  consigneCible,
  formatDonneesCibleEnonceTexte,
  formatEtatActuelAnglesConfirmes,
  formatEtatActuelPontConfirme,
  formatEtatActuelSoustractionConfirme,
  libelleBoutonAide,
  texteAideCibleNiveau1,
  texteAideCibleNiveau2,
  texteAideCibleNiveau3,
} from "../ui/formatTriangleLies";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { formatMessageErreur } from "../ui/messageErreur";
import { BlocDonneesTriangleLies } from "./BlocDonneesTriangleLies";
import { EnonceTriangleLies } from "./EnonceTriangleLies";

interface Props {
  exercice: ExerciceTriangleLies;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (valeur: number) => void;
}

/** Écran commun aux 2 variantes, toujours suivi de "interpretation" — résoudre le triangle cible
 * pour la grandeur demandée (côté/angle/aire). Plafond d'aide DYNAMIQUE
 * (`niveauAideMaxCible`, 3 niveaux si aire — terrain pédagogique neuf — 2 sinon). */
export function EtapeCibleTriangleLies({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [texte, setTexte] = useState("");
  const complet = texte.trim() !== "";
  const valeur = Number(texte.replace(",", "."));
  const statut = complet ? diagnostiquerCible(exercice, valeur) : undefined;
  const apresEchec = tentativesUtilisees > 0;
  const niveauAideMax = niveauAideMaxCible(exercice);

  const etatActuel = [formatEtatActuelPontConfirme(exercice)];
  if (exercice.variante === "anglePartage") {
    etatActuel.push(formatEtatActuelAnglesConfirmes(exercice));
  }
  if (exercice.variante === "sommetPartage") {
    etatActuel.push(formatEtatActuelSoustractionConfirme(exercice));
  }

  return (
    <div>
      <EnonceTriangleLies exercice={exercice} />
      <BlocDonneesTriangleLies titre="État actuel" lignes={etatActuel} />
      {exercice.variante === "cotePartage" && <BlocDonneesTriangleLies titre="Données" lignes={formatDonneesCibleEnonceTexte(exercice)} />}
      <p className="prompt-text">{consigneCible(exercice)}</p>
      <div className="field">
        <label className="field-label" htmlFor="triangle-lies-cible">
          Réponse
        </label>
        <div className="champ-avec-unite">
          <input
            id="triangle-lies-cible"
            className={`text-input${apresEchec && statut && statut !== "correct" ? " is-erronee" : ""}`}
            value={texte}
            onChange={(e) => setTexte(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
          <span className="champ-avec-unite-suffixe">{exercice.uniteGrandeurCible}</span>
        </div>
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{texteAideCibleNiveau1(exercice)}</p>
          {niveauAide >= 2 && <p>{texteAideCibleNiveau2(exercice)}</p>}
          {niveauAide >= 3 && <p>{texteAideCibleNiveau3()}</p>}
        </div>
      )}
      <button type="button" className="btn btn-aide" disabled={niveauAide >= niveauAideMax} onClick={onActiverAide}>
        {libelleBoutonAide(niveauAide, niveauAideMax)}
      </button>

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

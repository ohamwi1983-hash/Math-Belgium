import { useState } from "react";
import type { ExerciceTriangleQuelconque, UniteLongueur } from "../core/triangleQuelconque.types";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { diagnostiquerAire } from "../moteur/verificationTriangleQuelconque";
import { consigneAire, labelChampAire, NOMBRE_NIVEAUX_AIDE_AIRE, OPTIONS_UNITE_AIRE, optionsCroquisAire, placeholderAire, textesAideAire, valeursTriangleSketchAire } from "../ui/formatTriangleQuelconque";
import { calculerTriangleQuelconqueSketch } from "../ui/triangleQuelconqueSketch";
import { TriangleQuelconqueSketch } from "./TriangleQuelconqueSketch";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { formatMessageErreur } from "../ui/messageErreur";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceTriangleQuelconque;
  tentativesUtilisees: number;
  tentativesMax: number;
  recapitulatif: EntreeRecapitulatif[];
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (valeur: number, unite: UniteLongueur) => void;
}

/** Écran 2, dernière étape — calcule l'aire à partir des deux côtés + l'angle compris désormais
 * tous connus (la donnée manquante de l'écran 1 est confirmée, voir le récapitulatif).
 *
 * **Menu déroulant d'unité au carré** (`promptcorrectionsgenerateur19unitesnotation.md`, point 3) —
 * toujours affiché (l'aire est toujours présente, contrairement à la donnée manquante qui peut être
 * un angle) ; aucune valeur présélectionnée, même convention que l'écran 1. */
export function EtapeAireTriangleQuelconque({
  exercice,
  tentativesUtilisees,
  tentativesMax,
  recapitulatif,
  niveauAide,
  onActiverAide,
  onValider,
}: Props) {
  const [texte, setTexte] = useState("");
  const [unite, setUnite] = useState<UniteLongueur | "">("");

  const complet = texte.trim() !== "" && unite !== "";
  const valeur = Number(texte.replace(",", "."));
  const statut = complet ? diagnostiquerAire(exercice, valeur, unite as UniteLongueur) : undefined;

  const croquis = calculerTriangleQuelconqueSketch(valeursTriangleSketchAire(exercice), optionsCroquisAire(exercice, niveauAide));
  const textesAide = textesAideAire(exercice, niveauAide);

  return (
    <div>
      <RecapitulatifPanel entrees={recapitulatif} />
      <p className="prompt-text">{consigneAire()}</p>
      <TriangleQuelconqueSketch croquis={croquis} />

      <div className="field">
        <label className="field-label" htmlFor="triangle-quelconque-aire">
          {labelChampAire()}
        </label>
        <div className="champ-avec-unite">
          <input
            id="triangle-quelconque-aire"
            className={`text-input${tentativesUtilisees > 0 && statut !== undefined && statut !== "correct" ? " is-erronee" : ""}`}
            placeholder={placeholderAire(exercice)}
            value={texte}
            onChange={(e) => setTexte(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
          <select className="champ-avec-unite-select" aria-label="Unité" value={unite} onChange={(e) => setUnite(e.target.value as UniteLongueur | "")}>
            <option value="">Unité…</option>
            {OPTIONS_UNITE_AIRE.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {textesAide.length > 0 && (
        <div className="triangle-quelconque-aide">
          {textesAide.map((texteAide) => (
            <p key={texteAide}>{texteAide}</p>
          ))}
        </div>
      )}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={NOMBRE_NIVEAUX_AIDE_AIRE} onActiverAide={onActiverAide} />

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(valeur, unite as UniteLongueur)}>
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, statut)}
        </p>
      )}
    </div>
  );
}

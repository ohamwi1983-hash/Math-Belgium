import { useState } from "react";
import type { ExerciceTriangleQuelconque, UniteLongueur } from "../core/triangleQuelconque.types";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { diagnostiquerAire } from "../moteur/verificationTriangleQuelconque";
import { consigneAire, labelChampAire, NOMBRE_NIVEAUX_AIDE_AIRE, OPTIONS_UNITE_AIRE, optionsCroquisAire, placeholderAire, textesAideAire, valeursTriangleSketchAire, latexAide2Aire } from "../ui/formatTriangleQuelconque";
import { Katex } from "./Katex";
import { calculerTriangleQuelconqueSketch } from "../ui/triangleQuelconqueSketch";
import { TriangleQuelconqueSketch } from "./TriangleQuelconqueSketch";
import { formatMessageErreur } from "../ui/messageErreur";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

interface Props {
  exercice: ExerciceTriangleQuelconque;
  tentativesUtilisees: number;
  tentativesMax: number;
  recapitulatif: EntreeRecapitulatif[];
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (valeur: number, unite: UniteLongueur) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
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
  validation,
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
            onChange={(e) => setTexte(normaliserSigneMoins(e.target.value))}
          />
          <span className="select-souligne-wrap">
            <select className="champ-avec-unite-select" aria-label="Unité" value={unite} onChange={(e) => setUnite(e.target.value as UniteLongueur | "")}>
              <option value="">Unité…</option>
              {OPTIONS_UNITE_AIRE.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </span>
        </div>
      </div>

      {textesAide.length > 0 && (
        <div className="triangle-quelconque-aide">
          {/* Aide 2 : la formule substituée en KaTeX (jamais écrite au clavier). */}
          {textesAide.map((texteAide, i) =>
            i === 1 ? (
              <div key="formule">
                <p>Formule à appliquer :</p>
                {latexAide2Aire(exercice).map((ligne) => (
                  <Katex key={ligne} expression={ligne} block />
                ))}
              </div>
            ) : (
              <p key={texteAide}>{texteAide}</p>
            ),
          )}
        </div>
      )}
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={NOMBRE_NIVEAUX_AIDE_AIRE} onActiverAide={onActiverAide} />

        <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(valeur, unite as UniteLongueur)}>
          Valider
        </button>
        {tentativesUtilisees > 0 && (
          <p className="alert-error" role="alert">
            {formatMessageErreur(tentativesUtilisees, tentativesMax, statut)}
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

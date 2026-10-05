import { useState } from "react";
import type { ExerciceCaracteristiquesDroite } from "../core/caracteristiquesDroite.types";
import { NIVEAU_AIDE_MAX_CARACTERISTIQUES } from "../moteur/sessionCaracteristiquesDroite";
import { cibleChampPrincipal, diagnostiquerCaracteristiques, diagnostiquerChamp } from "../moteur/verificationCaracteristiquesDroite";
import type { ReponseCaracteristiques, ReponseChamp } from "../moteur/verificationCaracteristiquesDroite";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import {
  PLACEHOLDER_ANGLE,
  PLACEHOLDER_ORDONNEE,
  PLACEHOLDER_PENTE,
  QUESTION_ORDONNEE,
  QUESTION_PENTE,
  formatAideCaracteristiquesNiveau2Latex,
  formatEnonceLatex,
  formatEtatActuelPointVecteurLatex,
  libelleBoutonAide,
  segmentsAideCaracteristiquesNiveau1,
} from "../ui/formatCaracteristiquesDroite";
import { formatMessageErreur } from "../ui/messageErreur";
import { ConsigneCaracteristiquesDroiteEcran2 } from "./ConsigneCaracteristiquesDroiteEcran2";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";

type Choix = "existe" | "nExistePas";

interface Props {
  exercice: ExerciceCaracteristiquesDroite;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseCaracteristiques) => void;
}

function champDepuisSaisie(choix: Choix | null, valeur: string, toggleDisponible: boolean): ReponseChamp | null {
  if (!toggleDisponible) {
    const nombre = Number(valeur.trim().replace(",", "."));
    return valeur.trim() !== "" && Number.isFinite(nombre) ? { existe: true, valeur: nombre } : null;
  }
  if (choix === "nExistePas") return { existe: false };
  if (choix === "existe") {
    const nombre = Number(valeur.trim().replace(",", "."));
    return valeur.trim() !== "" && Number.isFinite(nombre) ? { existe: true, valeur: nombre } : null;
  }
  return null;
}

/**
 * Écran 2 — pente-ou-angle (`exercice.caracteristiqueDemandee`, pente/angleOx/angleOy) + ordonnée
 * à l'origine. Le champ "angle" (Ox ou Oy) n'a JAMAIS de toggle "n'existe pas" (un angle avec un
 * axe reste toujours défini, y compris pour une verticale/horizontale) — seuls "pente" et
 * "ordonnée à l'origine" peuvent valoir "n'existe pas" (cas vertical). Chaque champ est diagnostiqué
 * INDÉPENDAMMENT en direct après un échec (`diagnostiquerChamp`), pour isoler une erreur sur l'un
 * sans jamais marquer l'autre à tort — le marquage disparaît dès que l'élève corrige, jamais figé à
 * l'instant de la dernière tentative. Les deux questions ("pente"/"ordonnée à l'origine") sont
 * chacune structurées dans leur propre bloc visuellement séparé et étiqueté (`.champ-bloc`,
 * `QUESTION_PENTE`/`QUESTION_ORDONNEE`) — corrige une ambiguïté sur 4 boutons empilés sans en-tête
 * (`promptgen46modifications.md`, point 3).
 */
export function EtapeCaracteristiquesDroite({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const estAngle = exercice.caracteristiqueDemandee !== "pente";

  const [choixPrincipal, setChoixPrincipal] = useState<Choix | null>(null);
  const [valeurPrincipal, setValeurPrincipal] = useState("");
  const [choixOrdonnee, setChoixOrdonnee] = useState<Choix | null>(null);
  const [valeurOrdonnee, setValeurOrdonnee] = useState("");

  const reponsePrincipale = champDepuisSaisie(choixPrincipal, valeurPrincipal, !estAngle);
  const reponseOrdonnee = champDepuisSaisie(choixOrdonnee, valeurOrdonnee, true);
  const complet = reponsePrincipale !== null && reponseOrdonnee !== null;

  const apresEchec = tentativesUtilisees > 0;
  const statutPrincipal = apresEchec && reponsePrincipale !== null ? diagnostiquerChamp(reponsePrincipale, cibleChampPrincipal(exercice)) : undefined;
  const statutOrdonnee = apresEchec && reponseOrdonnee !== null ? diagnostiquerChamp(reponseOrdonnee, exercice.ordonneeOrigine) : undefined;
  const erroneePrincipal = statutPrincipal !== undefined && statutPrincipal !== "correct";
  const erroneeOrdonnee = statutOrdonnee !== undefined && statutOrdonnee !== "correct";
  const statutCombine = apresEchec && complet ? diagnostiquerCaracteristiques(exercice, { champPrincipal: reponsePrincipale, ordonnee: reponseOrdonnee }) : undefined;

  function choisirPrincipal(choix: Choix) {
    setChoixPrincipal(choix);
    setValeurPrincipal("");
  }
  function choisirOrdonnee(choix: Choix) {
    setChoixOrdonnee(choix);
    setValeurOrdonnee("");
  }

  return (
    <div>
      <ConsigneCaracteristiquesDroiteEcran2 exercice={exercice} />
      <div className="equation-box">
        <Katex expression={formatEnonceLatex(exercice)} />
      </div>
      <EtatActuelPanel latex={formatEtatActuelPointVecteurLatex(exercice)} label="Point et vecteur confirmés" />

      {estAngle ? (
        <div className="field">
          <label className="field-label field-label-minuscule" htmlFor="caracteristiques-droite-principal">
            Angle α (en degrés) =
          </label>
          <input
            id="caracteristiques-droite-principal"
            className={`text-input${erroneePrincipal ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_ANGLE}
            value={valeurPrincipal}
            onChange={(e) => setValeurPrincipal(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
        </div>
      ) : (
        <div className="champ-bloc">
          <p className="champ-bloc-question">{QUESTION_PENTE}</p>
          <div className="options-grid">
            <button type="button" className={choixPrincipal === "nExistePas" ? "btn toggle-active" : "btn"} onClick={() => choisirPrincipal("nExistePas")}>
              N'existe pas
            </button>
            <button type="button" className={choixPrincipal === "existe" ? "btn toggle-active" : "btn"} onClick={() => choisirPrincipal("existe")}>
              Existe
            </button>
          </div>
          {choixPrincipal === "existe" && (
            <div className="field contenu-conditionnel">
              <label className="field-label field-label-minuscule" htmlFor="caracteristiques-droite-principal">
                Pente m =
              </label>
              <input
                id="caracteristiques-droite-principal"
                className={`text-input${erroneePrincipal ? " is-erronee" : ""}`}
                placeholder={PLACEHOLDER_PENTE}
                value={valeurPrincipal}
                onChange={(e) => setValeurPrincipal(filtrerSaisieNumerique(e.target.value))}
                onKeyDown={gererKeyDownNumerique}
              />
            </div>
          )}
        </div>
      )}

      <div className="champ-bloc">
        <p className="champ-bloc-question">{QUESTION_ORDONNEE}</p>
        <div className="options-grid">
          <button type="button" className={choixOrdonnee === "nExistePas" ? "btn toggle-active" : "btn"} onClick={() => choisirOrdonnee("nExistePas")}>
            N'existe pas
          </button>
          <button type="button" className={choixOrdonnee === "existe" ? "btn toggle-active" : "btn"} onClick={() => choisirOrdonnee("existe")}>
            Existe
          </button>
        </div>
        {choixOrdonnee === "existe" && (
          <div className="field contenu-conditionnel">
            <label className="field-label field-label-minuscule" htmlFor="caracteristiques-droite-ordonnee">
              Ordonnée à l'origine p =
            </label>
            <input
              id="caracteristiques-droite-ordonnee"
              className={`text-input${erroneeOrdonnee ? " is-erronee" : ""}`}
              placeholder={PLACEHOLDER_ORDONNEE}
              value={valeurOrdonnee}
              onChange={(e) => setValeurOrdonnee(filtrerSaisieNumerique(e.target.value))}
              onKeyDown={gererKeyDownNumerique}
            />
          </div>
        )}
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>
            <RenduFragments fragments={segmentsAideCaracteristiquesNiveau1()} />
          </p>
          {niveauAide >= 2 && (
            <p>
              <Katex expression={formatAideCaracteristiquesNiveau2Latex(exercice)} />
            </p>
          )}
        </div>
      )}
      <button type="button" className="btn btn-aide" disabled={niveauAide >= NIVEAU_AIDE_MAX_CARACTERISTIQUES} onClick={onActiverAide}>
        {libelleBoutonAide(niveauAide, NIVEAU_AIDE_MAX_CARACTERISTIQUES)}
      </button>

      <button
        type="button"
        className="btn btn-primary"
        disabled={!complet}
        onClick={() => complet && onValider({ champPrincipal: reponsePrincipale as ReponseChamp, ordonnee: reponseOrdonnee as ReponseChamp })}
      >
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, statutCombine)}
        </p>
      )}
    </div>
  );
}

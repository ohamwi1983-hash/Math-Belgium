import { useState } from "react";
import type { ExerciceEtudeCompletePipeline } from "../core5e/etudeComplete.types";
import { CONSIGNE_GENERALE_ETUDE_COMPLETE, consignePhase, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatEtudeComplete";
import { Katex } from "../components/Katex";
import { BlocDonneesEtudeComplete } from "./BlocDonneesEtudeComplete";
import { BoutonAide } from "./BoutonAide";
import { CalculatriceScientifique } from "./CalculatriceScientifique";
import { EtatActuelEtudeComplete } from "./EtatActuelEtudeComplete";
import type { ReponseAsymptoteInfini, ReponseBlocAsymptote } from "../moteur5e/sessionEtudeComplete";

interface Props {
  exercice: ExerciceEtudeCompletePipeline;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseAsymptoteInfini) => void;
  diagnostiquer?: (reponse: ReponseAsymptoteInfini) => { moins: boolean; plus: boolean };
}

type Choix = "aucune" | "horizontale" | "oblique";

interface EtatBloc {
  choix: Choix | null;
  valeur: string;
}

function blocVersReponse(etat: EtatBloc): ReponseBlocAsymptote | null {
  if (etat.choix === null) return null;
  if (etat.choix === "aucune") return { aucune: true };
  if (etat.valeur.trim() === "") return null;
  return etat.choix === "horizontale" ? { aucune: false, type: "horizontale", valeur: etat.valeur } : { aucune: false, type: "oblique", equation: etat.valeur };
}

/** Un bloc indépendant "vers −∞" ou "vers +∞" — gate "Pas de AO ou AH"/"Une AO ou AH"
 * (`.options-grid`) puis, si "Une", combobox AO/AH + champ équation en dessous. */
function BlocDirection({
  titre,
  etat,
  setEtat,
  erronee,
}: {
  titre: string;
  etat: EtatBloc;
  setEtat: (e: EtatBloc) => void;
  erronee: boolean;
}) {
  return (
    <div>
      <p className="prompt-text">{titre}</p>
      <div className="options-grid">
        <button type="button" className={etat.choix === "aucune" ? "btn toggle-active" : "btn"} onClick={() => setEtat({ choix: "aucune", valeur: "" })}>
          Pas de AO ou AH
        </button>
        <button
          type="button"
          className={etat.choix === "horizontale" || etat.choix === "oblique" ? "btn toggle-active" : "btn"}
          onClick={() => setEtat({ choix: etat.choix === "horizontale" || etat.choix === "oblique" ? etat.choix : "horizontale", valeur: etat.valeur })}
        >
          Une AO ou AH
        </button>
      </div>
      {(etat.choix === "horizontale" || etat.choix === "oblique") && (
        <div className="field-row contenu-conditionnel">
          <select className="ce-select" aria-label="Type d'asymptote" value={etat.choix} onChange={(e) => setEtat({ choix: e.target.value as Choix, valeur: "" })}>
            <option value="horizontale">AH</option>
            <option value="oblique">AO</option>
          </select>
          <span className="field-label field-label-minuscule">{etat.choix === "horizontale" ? "AH≡" : "AO≡"}</span>
          <input
            type="text"
            className={`text-input${erronee ? " is-erronee" : ""}`}
            value={etat.valeur}
            onChange={(e) => setEtat({ ...etat, valeur: e.target.value })}
            placeholder={etat.choix === "horizontale" ? "ex : y=-2" : "ex : y=3x-2"}
          />
        </div>
      )}
    </div>
  );
}

/** Écran "asymptoteInfini" — 2 blocs indépendants "vers −∞"/"vers +∞", TOUJOURS vérifiés contre la
 * même cible (voir `moteur5e/sessionEtudeComplete.ts`). */
export function EtapeAsymptoteInfiniEtudeComplete({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [moins, setMoins] = useState<EtatBloc>({ choix: null, valeur: "" });
  const [plus, setPlus] = useState<EtatBloc>({ choix: null, valeur: "" });
  const montrerErreurs = tentativesUtilisees > 0;

  const reponseMoins = blocVersReponse(moins);
  const reponsePlus = blocVersReponse(plus);
  const complet = reponseMoins !== null && reponsePlus !== null;
  const correction = montrerErreurs && diagnostiquer && complet ? diagnostiquer({ moins: reponseMoins, plus: reponsePlus }) : null;

  function valider() {
    if (!reponseMoins || !reponsePlus) return;
    onValider({ moins: reponseMoins, plus: reponsePlus });
  }

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_ETUDE_COMPLETE}</p>
      <BlocDonneesEtudeComplete exercice={exercice} />
      <EtatActuelEtudeComplete exercice={exercice} phase="asymptoteInfini" />
      <p className="prompt-text">{consignePhase(exercice, "asymptoteInfini")}</p>
      <BlocDirection titre="Vers −∞" etat={moins} setEtat={setMoins} erronee={correction !== null && !correction.moins} />
      <BlocDirection titre="Vers +∞" etat={plus} setEtat={setPlus} erronee={correction !== null && !correction.plus} />
      <CalculatriceScientifique />
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideNiveau1(exercice, "asymptoteInfini")}</p>
          {niveauAide >= 2 && <Katex expression={texteAideNiveau2(exercice, "asymptoteInfini")} block />}
        </div>
      )}
    </div>
  );
}

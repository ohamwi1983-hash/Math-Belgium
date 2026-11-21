import { useState } from "react";
import { PiedEcranFonctions } from "./PiedEcranFonctions";
import { aidesEtude, cibleEtude, refusSaisieEtude } from "../ui5e/retoursEtudeComplete";
import type { ExerciceEtudeCompletePipeline } from "../core5e/etudeComplete.types";
import { CONSIGNE_GENERALE_ETUDE_COMPLETE, consignePhase } from "../ui5e/formatEtudeComplete";
import { BlocDonneesEtudeComplete } from "./BlocDonneesEtudeComplete";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { CalculatriceScientifique } from "./CalculatriceScientifique";
import { EnTeteExercice } from "./EnTeteExercice";
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
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
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
      <p className="prompt-text prompt-text--question-multiple">{titre}</p>
      <div className="options-grid">
        <button type="button" className={etat.choix === "aucune" ? "btn toggle-active" : "btn"} onClick={() => setEtat({ choix: "aucune", valeur: "" })}>
          Ni AH ni AO
        </button>
        <button
          type="button"
          className={etat.choix === "horizontale" || etat.choix === "oblique" ? "btn toggle-active" : "btn"}
          onClick={() => setEtat({ choix: etat.choix === "horizontale" || etat.choix === "oblique" ? etat.choix : "horizontale", valeur: etat.valeur })}
        >
          Une AH ou une AO
        </button>
      </div>
      {(etat.choix === "horizontale" || etat.choix === "oblique") && (
        <div className="field-row contenu-conditionnel">
          <span className="select-souligne-wrap">
            <select className="ce-select" aria-label="Type d'asymptote" value={etat.choix} onChange={(e) => setEtat({ choix: e.target.value as Choix, valeur: "" })}>
              <option value="horizontale">AH</option>
              <option value="oblique">AO</option>
            </select>
          </span>
          <span className="field-label field-label-minuscule">{etat.choix === "horizontale" ? "AH :" : "AO :"}</span>
          <input
            type="text"
            className={`text-input${erronee ? " is-erronee" : ""}`}
            value={etat.valeur}
            onChange={(e) => setEtat({ ...etat, valeur: e.target.value })}
            placeholder={etat.choix === "horizontale" ? "ex : y=9" : "ex : y=7x−11"}
          />
        </div>
      )}
    </div>
  );
}

/** Écran "asymptoteInfini" — 2 blocs indépendants "vers −∞"/"vers +∞", TOUJOURS vérifiés contre la
 * même cible (voir `moteur5e/sessionEtudeComplete.ts`). */
export function EtapeAsymptoteInfiniEtudeComplete({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, validation}: Props) {
  const [refusAffiche, setRefusAffiche] = useState<string | null>(null);
  const [saisieSoumise, setSaisieSoumise] = useState<string[] | null>(null);
  const [moins, setMoins] = useState<EtatBloc>({ choix: null, valeur: "" });
  const [plus, setPlus] = useState<EtatBloc>({ choix: null, valeur: "" });
  const montrerErreurs = tentativesUtilisees > 0;

  const reponseMoins = blocVersReponse(moins);
  const reponsePlus = blocVersReponse(plus);
  const complet = reponseMoins !== null && reponsePlus !== null;
  const correction = montrerErreurs && diagnostiquer && complet ? diagnostiquer({ moins: reponseMoins, plus: reponsePlus }) : null;

  function valider() {
    if (!complet) return;
    const refus = refusSaisieEtude(exercice, "asymptoteInfini", [reponseMoins, reponsePlus].map((b) => (!b || b.aucune ? "" : b.type === "horizontale" ? b.valeur : b.equation)));
    setRefusAffiche(refus);
    if (refus) return;
    setSaisieSoumise([reponseMoins, reponsePlus].map((b) => (!b || b.aucune ? "" : b.type === "horizontale" ? b.valeur : b.equation)));
    if (!reponseMoins || !reponsePlus) return;
    onValider({ moins: reponseMoins, plus: reponsePlus });
  }

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={CONSIGNE_GENERALE_ETUDE_COMPLETE}
        blocDonnees={<BlocDonneesEtudeComplete exercice={exercice} />}
      />
      <p className="prompt-text">{consignePhase(exercice, "asymptoteInfini")}</p>
      <BlocDirection titre="Vers −∞" etat={moins} setEtat={setMoins} erronee={correction !== null && !correction.moins} />
      <BlocDirection titre="Vers +∞" etat={plus} setEtat={setPlus} erronee={correction !== null && !correction.plus} />
      <CalculatriceScientifique />
      <PiedEcranFonctions
        aides={aidesEtude(exercice, "asymptoteInfini")}
        niveauAide={niveauAide}
        niveauAideMax={niveauAideMax}
        onActiverAide={onActiverAide}
        onValider={valider}
        vide={!complet}
        illisible={refusAffiche !== null}
        texteIllisible={refusAffiche ?? ""}
        tentativesUtilisees={tentativesUtilisees}
        tentativesMax={tentativesMax}
        cible={saisieSoumise && tentativesUtilisees > 0 ? cibleEtude(exercice, "asymptoteInfini", saisieSoumise) : null}
        validation={validation}
      />
    </div>
  );
}

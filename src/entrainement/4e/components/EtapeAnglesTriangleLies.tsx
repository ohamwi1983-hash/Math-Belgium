import { useState } from "react";
import type { ExerciceTriangleLies } from "../core/triangleLies.types";
import type { ReponseAnglesTriangleLies } from "../moteur/verificationTriangleLies";
import { NIVEAU_AIDE_MAX_ANGLES } from "../moteur/sessionTriangleLies";
import { consigneAngles, formatAnglesBrutsViseeTexte } from "../ui/formatTriangleLies";
import { aidesAngles, messageAngles } from "../ui/aidesTrianglesLies";
import { MESSAGE_ANGLE_ILLISIBLE, MessageRetour, useTentativeLisible } from "./RetourSaisie";
import { RenduFragments } from "./RenduFragments";
import { lireNombreSaisi } from "../ui/lireNombre";

import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { BlocDonneesTriangleLies } from "./BlocDonneesTriangleLies";
import { EnTeteExercice } from "./EnTeteExercice";
import { QuestionFinale } from "./QuestionFinale";
import { TriangleLiesSketch } from "./TriangleLiesSketch";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

interface Props {
  exercice: ExerciceTriangleLies;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  /** Récap « Ce qu'on sait déjà » des écrans déjà clos (`calculerRecapitulatifTriangleLies`). */
  recapitulatif: EntreeRecapitulatif[];
  onValider: (reponse: ReponseAnglesTriangleLies) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran 2, `anglePartage` uniquement — l'angle utile (différence des 2 visées) et l'angle déduit
 * de l'hypothèse annexe, les 2 angles qui ferment le triangle cible. */
export function EtapeAnglesTriangleLies({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, recapitulatif, onValider, validation }: Props) {
  const [utile, setUtile] = useState("");
  const [hypothese, setHypothese] = useState("");
  const complet = utile.trim() !== "" && hypothese.trim() !== "";
  const lus = [lireNombreSaisi(utile), lireNombreSaisi(hypothese)];
  const reponse: ReponseAnglesTriangleLies = { angleUtile: lus[0] ?? 0, angleHypothese: lus[1] ?? 0 };
  // Règles communes (audit 4e ch. 5, lot B) : saisie illisible jamais transmise (aucune tentative).
  const saisie = useTentativeLisible<ReponseAnglesTriangleLies>();
  const apresEchec = tentativesUtilisees > 0;

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={exercice.contexte}
        blocDonnees={
          <>
            <QuestionFinale question={exercice.questionCible} />
            <TriangleLiesSketch exercice={exercice} />
          </>
        }
      />
      <RecapitulatifPanel entrees={recapitulatif} />
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
              className={`text-input${apresEchec && !saisie.illisible ? " is-erronee" : ""}`}
              value={utile}
              onChange={(e) => setUtile(normaliserSigneMoins(e.target.value))}
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
              className={`text-input${apresEchec && !saisie.illisible ? " is-erronee" : ""}`}
              value={hypothese}
              onChange={(e) => setHypothese(normaliserSigneMoins(e.target.value))}
            />
            <span className="champ-avec-unite-suffixe">°</span>
          </div>
        </div>
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          {aidesAngles(exercice).slice(0, niveauAide).map((fragments, i) => (
            <p key={i}>
              <RenduFragments fragments={fragments} />
            </p>
          ))}
        </div>
      )}
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_ANGLES} onActiverAide={onActiverAide} />

        <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => saisie.tenter(reponse, lus.every((x) => x !== null), onValider)}>
          Valider
        </button>
        <MessageRetour
          illisible={saisie.illisible}
          texteIllisible={MESSAGE_ANGLE_ILLISIBLE}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          cible={saisie.soumise !== null ? messageAngles(exercice, saisie.soumise) : null}
        />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

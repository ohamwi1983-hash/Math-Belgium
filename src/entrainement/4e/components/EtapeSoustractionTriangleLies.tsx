import { useState } from "react";
import type { ExerciceTriangleLies } from "../core/triangleLies.types";
import type { ReponseSoustractionTriangleLies } from "../moteur/verificationTriangleLies";
import { NIVEAU_AIDE_MAX_SOUSTRACTION } from "../moteur/sessionTriangleLies";
import { consigneSoustraction, formatDistancesParcouruesTexte, libellesSommetPartage, uniteLongueurPont } from "../ui/formatTriangleLies";
import { aidesSoustraction, messageSoustraction } from "../ui/aidesTrianglesLies";
import { MESSAGE_LONGUEUR_ILLISIBLE, MessageRetour, useTentativeLisible } from "./RetourSaisie";
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
  onValider: (reponse: ReponseSoustractionTriangleLies) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran 2, `sommetPartage` uniquement — les 2 côtés du triangle cible, chacun obtenu en
 * soustrayant la distance déjà parcourue au côté correspondant du triangle pont. */
export function EtapeSoustractionTriangleLies({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, recapitulatif, onValider, validation }: Props) {
  const [cote1, setCote1] = useState("");
  const [cote2, setCote2] = useState("");
  const complet = cote1.trim() !== "" && cote2.trim() !== "";
  const lus = [lireNombreSaisi(cote1), lireNombreSaisi(cote2)];
  const reponse: ReponseSoustractionTriangleLies = { cote1: lus[0] ?? 0, cote2: lus[1] ?? 0 };
  // Règles communes (audit 4e ch. 5, lot B) : saisie illisible jamais transmise (aucune tentative).
  const saisie = useTentativeLisible<ReponseSoustractionTriangleLies>();
  const apresEchec = tentativesUtilisees > 0;
  const uniteCote = uniteLongueurPont(exercice);
  const libelles = libellesSommetPartage(exercice);

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
      <BlocDonneesTriangleLies titre="Distances déjà parcourues" lignes={formatDistancesParcouruesTexte(exercice)} />
      <p className="prompt-text">{consigneSoustraction()}</p>
      <div className="field-row">
        <div className="field">
          <label className="field-label" htmlFor="triangle-lies-soustraction-cote1">
            {libelles.coteCible1}
          </label>
          <div className="champ-avec-unite">
            <input
              id="triangle-lies-soustraction-cote1"
              className={`text-input${apresEchec && !saisie.illisible ? " is-erronee" : ""}`}
              value={cote1}
              onChange={(e) => setCote1(normaliserSigneMoins(e.target.value))}
            />
            <span className="champ-avec-unite-suffixe">{uniteCote}</span>
          </div>
        </div>
        <div className="field">
          <label className="field-label" htmlFor="triangle-lies-soustraction-cote2">
            {libelles.coteCible2}
          </label>
          <div className="champ-avec-unite">
            <input
              id="triangle-lies-soustraction-cote2"
              className={`text-input${apresEchec && !saisie.illisible ? " is-erronee" : ""}`}
              value={cote2}
              onChange={(e) => setCote2(normaliserSigneMoins(e.target.value))}
            />
            <span className="champ-avec-unite-suffixe">{uniteCote}</span>
          </div>
        </div>
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          {aidesSoustraction(exercice).slice(0, niveauAide).map((fragments, i) => (
            <p key={i}>
              <RenduFragments fragments={fragments} />
            </p>
          ))}
        </div>
      )}
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_SOUSTRACTION} onActiverAide={onActiverAide} />

        <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => saisie.tenter(reponse, lus.every((x) => x !== null), onValider)}>
          Valider
        </button>
        <MessageRetour
          illisible={saisie.illisible}
          texteIllisible={MESSAGE_LONGUEUR_ILLISIBLE}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          cible={saisie.soumise !== null ? messageSoustraction(exercice, saisie.soumise) : null}
        />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

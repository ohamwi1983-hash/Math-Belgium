import { useState } from "react";
import type { ExerciceTriangleLies } from "../core/triangleLies.types";
import type { ReponsePontSommetPartage } from "../moteur/verificationTriangleLies";
import { NIVEAU_AIDE_MAX_PONT } from "../moteur/sessionTriangleLies";
import { consignePont, formatDonneesPontTexte, libellesSommetPartage, uniteLongueurPont } from "../ui/formatTriangleLies";
import { aidesPont, messagePont, messagePontSommetPartage } from "../ui/aidesTrianglesLies";
import { MESSAGE_ANGLE_ILLISIBLE, MESSAGE_LONGUEUR_ILLISIBLE, MessageRetour, useTentativeLisible } from "./RetourSaisie";
import { RenduFragments } from "./RenduFragments";
import { lireNombreSaisi } from "../ui/lireNombre";

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
  /** `cotePartage`/`anglePartage` — une seule valeur transférée. */
  onValider: (valeur: number) => void;
  /** `sommetPartage` uniquement — angle au sommet commun + les 2 côtés qui en partent. */
  onValiderSommetPartage: (reponse: ReponsePontSommetPartage) => void;
  validation?: ValidationEtapeProps | null;
}

/** Écran 1, commun aux 3 configurations — résoudre le triangle "pont". `cotePartage`/`anglePartage`
 * n'ont qu'un seul côté transféré à trouver ; `sommetPartage` demande 3 valeurs (angle + 2 côtés). */
export function EtapePontTriangleLies({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, onValiderSommetPartage, validation }: Props) {
  const [texte, setTexte] = useState("");
  const [texteAngle, setTexteAngle] = useState("");
  const [texteCote1, setTexteCote1] = useState("");
  const [texteCote2, setTexteCote2] = useState("");
  // Règles communes (audit 4e ch. 5, lot B) : saisie illisible jamais transmise (aucune tentative).
  const saisieSP = useTentativeLisible<ReponsePontSommetPartage>();
  const saisie = useTentativeLisible<number>();
  const apresEchec = tentativesUtilisees > 0 && !saisie.illisible && !saisieSP.illisible;

  if (exercice.variante === "sommetPartage") {
    const complet = texteAngle.trim() !== "" && texteCote1.trim() !== "" && texteCote2.trim() !== "";
    const lus = [lireNombreSaisi(texteAngle), lireNombreSaisi(texteCote1), lireNombreSaisi(texteCote2)];
    const reponse: ReponsePontSommetPartage = { angle: lus[0] ?? 0, cote1: lus[1] ?? 0, cote2: lus[2] ?? 0 };
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
        <BlocDonneesTriangleLies titre="Données" lignes={formatDonneesPontTexte(exercice)} />
        <p className="prompt-text">{consignePont(exercice)}</p>
        <div className="field field-inline">
          <label className="field-label" htmlFor="triangle-lies-pont-angle">
            {libelles.angle} =
          </label>
          <div className="champ-avec-unite">
            <input
              id="triangle-lies-pont-angle"
              className={`text-input${apresEchec ? " is-erronee" : ""}`}
              value={texteAngle}
              onChange={(e) => setTexteAngle(normaliserSigneMoins(e.target.value))}
            />
            <span className="champ-avec-unite-suffixe">°</span>
          </div>
        </div>
        <div className="field-row">
          <div className="field field-inline">
            <label className="field-label" htmlFor="triangle-lies-pont-cote1">
              {libelles.cote1} =
            </label>
            <div className="champ-avec-unite">
              <input
                id="triangle-lies-pont-cote1"
                className={`text-input${apresEchec ? " is-erronee" : ""}`}
                value={texteCote1}
                onChange={(e) => setTexteCote1(normaliserSigneMoins(e.target.value))}
              />
              <span className="champ-avec-unite-suffixe">{uniteCote}</span>
            </div>
          </div>
          <div className="field field-inline">
            <label className="field-label" htmlFor="triangle-lies-pont-cote2">
              {libelles.cote2} =
            </label>
            <div className="champ-avec-unite">
              <input
                id="triangle-lies-pont-cote2"
                className={`text-input${apresEchec ? " is-erronee" : ""}`}
                value={texteCote2}
                onChange={(e) => setTexteCote2(normaliserSigneMoins(e.target.value))}
              />
              <span className="champ-avec-unite-suffixe">{uniteCote}</span>
            </div>
          </div>
        </div>

      {niveauAide > 0 && (
          <div className="triangle-quelconque-aide">
            {aidesPont(exercice).slice(0, niveauAide).map((fragments, i) => (
              <p key={i}>
                <RenduFragments fragments={fragments} />
              </p>
            ))}
          </div>
        )}
        {!validation && (
          <>
            <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_PONT} onActiverAide={onActiverAide} />

            <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => saisieSP.tenter(reponse, lus.every((x) => x !== null), onValiderSommetPartage)}>
              Valider
            </button>
            <MessageRetour
              illisible={saisieSP.illisible}
              texteIllisible={lus[0] === null ? MESSAGE_ANGLE_ILLISIBLE : MESSAGE_LONGUEUR_ILLISIBLE}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              cible={saisieSP.soumise !== null ? messagePontSommetPartage(exercice, saisieSP.soumise) : null}
            />
          </>
        )}
        {validation && <ValidationEcran {...validation} />}
      </div>
    );
  }

  const complet = texte.trim() !== "";
  const valeur = lireNombreSaisi(texte);

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
      <BlocDonneesTriangleLies titre="Données" lignes={formatDonneesPontTexte(exercice)} />
      <p className="prompt-text">{consignePont(exercice)}</p>
      <div className="field field-inline">
        <label className="field-label" htmlFor="triangle-lies-pont">
          {exercice.labelCoteTransfere} =
        </label>
        <div className="champ-avec-unite">
          <input
            id="triangle-lies-pont"
            className={`text-input${apresEchec ? " is-erronee" : ""}`}
            value={texte}
            onChange={(e) => setTexte(normaliserSigneMoins(e.target.value))}
          />
          <span className="champ-avec-unite-suffixe">{uniteLongueurPont(exercice)}</span>
        </div>
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          {aidesPont(exercice).slice(0, niveauAide).map((fragments, i) => (
            <p key={i}>
              <RenduFragments fragments={fragments} />
            </p>
          ))}
        </div>
      )}
      {!validation && (
        <>
          <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_PONT} onActiverAide={onActiverAide} />

          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => saisie.tenter(valeur ?? 0, valeur !== null, onValider)}>
            Valider
          </button>
          <MessageRetour
            illisible={saisie.illisible}
            texteIllisible={MESSAGE_LONGUEUR_ILLISIBLE}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            cible={saisie.soumise !== null ? messagePont(exercice, saisie.soumise) : null}
          />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

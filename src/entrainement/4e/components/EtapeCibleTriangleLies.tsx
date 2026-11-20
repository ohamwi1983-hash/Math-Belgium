import { useState } from "react";
import type { ExerciceTriangleLies } from "../core/triangleLies.types";
import { niveauAideMaxCible } from "../moteur/sessionTriangleLies";
import { consigneCible, formatDonneesCibleEnonceTexte } from "../ui/formatTriangleLies";
import { aidesCible, messageCible } from "../ui/aidesTrianglesLies";
import { MESSAGE_ANGLE_ILLISIBLE, MESSAGE_LONGUEUR_ILLISIBLE, MessageRetour, useTentativeLisible } from "./RetourSaisie";
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
  onValider: (valeur: number) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran commun aux 2 variantes, toujours suivi de "interpretation" — résoudre le triangle cible
 * pour la grandeur demandée (côté/angle/aire). Plafond d'aide DYNAMIQUE
 * (`niveauAideMaxCible`, 3 niveaux si aire — terrain pédagogique neuf — 2 sinon). */
export function EtapeCibleTriangleLies({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, recapitulatif, onValider, validation }: Props) {
  const [texte, setTexte] = useState("");
  const complet = texte.trim() !== "";
  const valeur = lireNombreSaisi(texte);
  // Règles communes (audit 4e ch. 5, lot B) : saisie illisible jamais transmise (aucune tentative).
  const saisie = useTentativeLisible<number>();
  const apresEchec = tentativesUtilisees > 0;
  const niveauAideMax = niveauAideMaxCible(exercice);

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
      {exercice.variante === "cotePartage" && <BlocDonneesTriangleLies titre="Données" lignes={formatDonneesCibleEnonceTexte(exercice)} />}
      <p className="prompt-text">{consigneCible(exercice)}</p>
      <div className="field">
        <label className="field-label" htmlFor="triangle-lies-cible">
          Réponse
        </label>
        <div className="champ-avec-unite">
          <input
            id="triangle-lies-cible"
            className={`text-input${apresEchec && !saisie.illisible ? " is-erronee" : ""}`}
            value={texte}
            onChange={(e) => setTexte(normaliserSigneMoins(e.target.value))}
          />
          <span className="champ-avec-unite-suffixe">{exercice.uniteGrandeurCible}</span>
        </div>
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          {aidesCible(exercice).slice(0, niveauAide).map((fragments, i) => (
            <p key={i}>
              <RenduFragments fragments={fragments} />
            </p>
          ))}
        </div>
      )}
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />

        <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => saisie.tenter(valeur ?? 0, valeur !== null, onValider)}>
          Valider
        </button>
        <MessageRetour
          illisible={saisie.illisible}
          texteIllisible={exercice.uniteGrandeurCible === "°" ? MESSAGE_ANGLE_ILLISIBLE : MESSAGE_LONGUEUR_ILLISIBLE}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          cible={saisie.soumise !== null ? messageCible(exercice, saisie.soumise) : null}
        />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

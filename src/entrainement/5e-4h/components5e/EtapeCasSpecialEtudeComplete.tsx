import { useState } from "react";
import { PiedEcranFonctions } from "./PiedEcranFonctions";
import { TexteRiche5e } from "./TexteRiche5e";
import { aidesEtude, cibleEtude, refusSaisieEtude } from "../ui5e/retoursEtudeComplete";
import type { ExerciceEtudeCompletePipeline } from "../core5e/etudeComplete.types";
import { CONSIGNE_GENERALE_ETUDE_COMPLETE, consigneCasSpecialTexte } from "../ui5e/formatEtudeComplete";
import { BlocDonneesEtudeComplete } from "./BlocDonneesEtudeComplete";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { CalculatriceScientifique } from "./CalculatriceScientifique";
import { EnTeteExercice } from "./EnTeteExercice";
import type { ReponseCasSpecial } from "../moteur5e/verificationEtudeComplete";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceEtudeCompletePipeline;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseCasSpecial) => void;
  diagnostiquer?: (reponse: ReponseCasSpecial) => { x: StatutVerification; y: StatutVerification };
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran "casSpecial" (recoupement) — consigne substituant la VRAIE équation de l'asymptote (rendue
 * en KaTeX, `consignePhase` renvoie un fragment LaTeX complet prose+math pour cette phase
 * spécifiquement, jamais un placeholder générique "asymptote(x)" — `prompt5gen24correctionrefonte2.md`,
 * point 6), et champs x/y CÔTE À CÔTE sur une même ligne (`.field-row` unique + 2 `.field-inline`,
 * même convention 4e que les coordonnées d'un point — `EtapeCoordonneesRelationVectorielle.tsx`),
 * jamais empilés verticalement comme le rendait `EtapeChampsEtudeComplete` générique.
 */
export function EtapeCasSpecialEtudeComplete({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, validation}: Props) {
  const [refusAffiche, setRefusAffiche] = useState<string | null>(null);
  const [saisieSoumise, setSaisieSoumise] = useState<string[] | null>(null);
  const [texteX, setTexteX] = useState("");
  const [texteY, setTexteY] = useState("");
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = texteX.trim() !== "" && texteY.trim() !== "";
  const correction = montrerErreurs && diagnostiquer && complet ? diagnostiquer({ x: texteX, y: texteY }) : null;

  function valider() {
    if (!complet) return;
    const refus = refusSaisieEtude(exercice, "casSpecial", [texteX, texteY]);
    setRefusAffiche(refus);
    if (refus) return;
    setSaisieSoumise([texteX, texteY]);
    onValider({ x: texteX, y: texteY });
  }

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={CONSIGNE_GENERALE_ETUDE_COMPLETE}
        blocDonnees={<BlocDonneesEtudeComplete exercice={exercice} />}
      />
      <p className="prompt-text">
        <TexteRiche5e texte={consigneCasSpecialTexte(exercice)} />
      </p>
      <div className="field-row">
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="etude-complete-cas-special-x">
            x
          </label>
          <input
            id="etude-complete-cas-special-x"
            type="text"
            className={`text-input${correction && correction.x !== "correct" ? " is-erronee" : ""}`}
            value={texteX}
            onChange={(e) => setTexteX(e.target.value)}
            placeholder="ex : 13/2"
          />
        </div>
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="etude-complete-cas-special-y">
            y
          </label>
          <input
            id="etude-complete-cas-special-y"
            type="text"
            className={`text-input${correction && correction.y !== "correct" ? " is-erronee" : ""}`}
            value={texteY}
            onChange={(e) => setTexteY(e.target.value)}
            placeholder="ex : 41"
          />
        </div>
      </div>
      <CalculatriceScientifique />
      <PiedEcranFonctions
        aides={aidesEtude(exercice, "casSpecial")}
        niveauAide={niveauAide}
        niveauAideMax={niveauAideMax}
        onActiverAide={onActiverAide}
        onValider={valider}
        vide={!complet}
        illisible={refusAffiche !== null}
        texteIllisible={refusAffiche ?? ""}
        tentativesUtilisees={tentativesUtilisees}
        tentativesMax={tentativesMax}
        cible={saisieSoumise && tentativesUtilisees > 0 ? cibleEtude(exercice, "casSpecial", saisieSoumise) : null}
        validation={validation}
      />
    </div>
  );
}

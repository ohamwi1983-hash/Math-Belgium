import { useState } from "react";
import { PiedEcranFonctions } from "./PiedEcranFonctions";
import { aidesEtude, cibleEtude, refusSaisieEtude } from "../ui5e/retoursEtudeComplete";
import type { ExerciceEtudeComplete } from "../core5e/etudeComplete.types";
import type { PhaseEtudeComplete } from "../moteur5e/typesEtudeComplete";
import { CONSIGNE_GENERALE_CONSTRUCTION_INVERSE, CONSIGNE_GENERALE_ETUDE_COMPLETE, consignePhase, formatProprietesConstructionInverseTexte } from "../ui5e/formatEtudeComplete";
import { Katex } from "../components/Katex";
import { BlocDonneesEtudeComplete } from "./BlocDonneesEtudeComplete";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { CalculatriceScientifique } from "./CalculatriceScientifique";
import type { StatutVerification } from "../moteur/statutVerification";
import type { ExerciceEtudeCompletePipeline } from "../core5e/etudeComplete.types";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceEtudeComplete;
  phase: PhaseEtudeComplete;
  labels: string[];
  placeholders: string[];
  /** Si vrai, chaque `label` est un fragment LaTeX rendu en mode DISPLAY (`<Katex block />`) —
   * réutilise le même composant d'affichage déjà correct ailleurs (bloc état actuel/aides) sur les
   * labels interactifs de type "lim x→... f(x)=" (jamais du texte plat, transversal). */
  labelsLatex?: boolean;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (valeurs: string[]) => void;
  diagnostiquer?: (valeurs: string[]) => StatutVerification[];
  /** Contrôle AVANT validation : renvoie un message (sans consommer de tentative) quand la saisie
   * n'est pas du type demandé — ex. forme non simplifiée à l'écran « Simplification » (audit 5e
   * ch. 4, décision D). `null` = rien à signaler. */
  prevalider?: (valeurs: string[]) => string | null;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran générique à N champs texte libres (1 ou 2) — réutilisé par les écrans "point vide"
 * (1 champ), "AH"/"AO" (1 champ), "casSpecial" (2 champs), "constructionInverse" (1 champ).
 * Calculatrice TOUJOURS présente (contextes réalistes, arithmétique non triviale), sauf sur l'écran
 * "domaine"/"classification" (purement symbolique, gérés par `EtapeListeNombresEtudeComplete`). */
export function EtapeChampsEtudeComplete({ exercice, phase, labels, placeholders, labelsLatex, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, prevalider, validation}: Props) {
  const [refusAffiche, setRefusAffiche] = useState<string | null>(null);
  const [saisieSoumise, setSaisieSoumise] = useState<string[] | null>(null);
  const [valeurs, setValeurs] = useState<string[]>(labels.map(() => ""));
  const [messagePrevalidation, setMessagePrevalidation] = useState<string | null>(null);
  const [, setDernierStatuts] = useState<StatutVerification[] | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = valeurs.every((v) => v.trim() !== "");
  const correction = montrerErreurs && diagnostiquer && complet ? diagnostiquer(valeurs) : null;

  function modifier(i: number, v: string) {
    setValeurs((arr) => arr.map((x, j) => (j === i ? v : x)));
    setMessagePrevalidation(null);
  }
  function valider() {
    if (!complet) return;
    const refus = refusSaisieEtude(exercice, phase, valeurs);
    setRefusAffiche(refus);
    if (refus) return;
    const message = prevalider ? prevalider(valeurs) : null;
    setMessagePrevalidation(message);
    if (message) return;
    setSaisieSoumise(valeurs);
    if (diagnostiquer) setDernierStatuts(diagnostiquer(valeurs));
    onValider(valeurs);
  }

  const estBonus = exercice.mode === "constructionInverse";
  const pipeline = estBonus ? null : (exercice as ExerciceEtudeCompletePipeline);

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={estBonus ? CONSIGNE_GENERALE_CONSTRUCTION_INVERSE : CONSIGNE_GENERALE_ETUDE_COMPLETE}
        blocDonnees={
          <>
            {pipeline && <BlocDonneesEtudeComplete exercice={pipeline} />}
            {exercice.mode === "constructionInverse" && (
              <div className="equation-box equation-box-donnees">
                {formatProprietesConstructionInverseTexte(exercice.proprietes).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            )}
          </>
        }
      />
      <p className="prompt-text">{consignePhase(exercice, phase)}</p>
      {labels.map((label, i) => (
        <div key={i} className="field-row">
          {label && labelsLatex && (
            <span className="field-label field-label-minuscule">
              <Katex expression={label} block />
            </span>
          )}
          {label && !labelsLatex && <p className="field-label field-label-minuscule ce-slot-latex">{label}</p>}
          <input
            type="text"
            className={`text-input${correction && correction[i] !== "correct" ? " is-erronee" : ""}`}
            value={valeurs[i]}
            onChange={(e) => modifier(i, e.target.value)}
            placeholder={placeholders[i]}
          />
        </div>
      ))}
      <CalculatriceScientifique />
      <PiedEcranFonctions
        aides={aidesEtude(exercice, phase)}
        niveauAide={niveauAide}
        niveauAideMax={niveauAideMax}
        onActiverAide={onActiverAide}
        onValider={valider}
        vide={!complet}
        illisible={refusAffiche !== null}
        messageSansTentative={messagePrevalidation}
        texteIllisible={refusAffiche ?? ""}
        tentativesUtilisees={tentativesUtilisees}
        tentativesMax={tentativesMax}
        cible={saisieSoumise && tentativesUtilisees > 0 ? cibleEtude(exercice, phase, saisieSoumise) : null}
        validation={validation}
      />
    </div>
  );
}

import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import type { ExerciceParadoxesProbabilites } from "./core6e/paradoxesProbabilites.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceParadoxesProbabilites } from "./generateurs6e/paradoxesProbabilites";
import type { IdVarianteParadoxesProbabilites } from "./generateurs6e/paradoxesProbabilites";
import { activerAideSuivante, demarrerSessionParadoxes, niveauAideMaxPhase, soumettreReponseEcran } from "./moteur6e/sessionParadoxesProbabilites";
import { estPhaseChoix } from "./moteur6e/typesParadoxesProbabilites";
import type { EtatSessionParadoxes, PhaseParadoxe } from "./moteur6e/typesParadoxesProbabilites";
import { diagnostiquerChamps } from "./moteur6e/verificationParadoxesProbabilites";
import { Katex } from "./components/Katex";
import { RenduFragments } from "./components/RenduFragments";
import { EtapeParadoxesProbabilites } from "./components6e/EtapeParadoxesProbabilites";
import type { ModeEcranParadoxe } from "./components6e/EtapeParadoxesProbabilites";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import {
  aideNiveau1,
  aideNiveau2,
  blocDonnees,
  champsEcran,
  conclusionCorrecte,
  consigneEcran,
  consigneGenerale,
  formatReponseAttenduePhaseLatex,
  fragmentsOption,
  libellePhase,
  optionsConclusion,
  optionsPrediction,
} from "./ui6e/formatParadoxesProbabilites";
import { figureEcranSvg } from "./ui6e/figureParadoxesProbabilites";
import { calculerRecapitulatifParadoxes, calculerSegmentsProgressionParadoxes } from "./ui6e/recapitulatifParadoxesProbabilites";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";

/**
 * `6gen76` — « Quand l'intuition se trompe » (audit 6e ch. 6, décision M, fiche P3) : générateur
 * COURT de motivation, 4 écrans pour trois paradoxes (Méré, Monty Hall, deux enfants) :
 * prédiction (non notée) → modéliser → calculer → conclure. Même patron que `App6gen32.tsx` ; le
 * `?code=` (QR code des feuilles) rejoue l'instance de `generateurs6e/paradoxesProbabilites/
 * exportEvaluation.ts` avec les MÊMES fonctions de génération (modèle `App6gen14.tsx`).
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionParadoxes {
  return demarrerSessionParadoxes(REGLAGES_DEMO, genererExerciceParadoxesProbabilites);
}

/** Première session : le code d'un exercice imprimé (`?code=XXXXXX`) en fixe le PREMIER exercice. */
function sessionInitiale(): EtatSessionParadoxes {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionParadoxes(REGLAGES_DEMO, () =>
    genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceParadoxesProbabilites, (id) => construireAvecVarianteId(id as IdVarianteParadoxesProbabilites)),
  );
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionParadoxes;
  revele: boolean;
}

function modeEcran(e: ExerciceParadoxesProbabilites, phase: PhaseParadoxe): ModeEcranParadoxe {
  if (phase === "prediction") return { type: "choix", options: optionsPrediction(e), note: false };
  if (phase === "conclure") return { type: "choix", options: optionsConclusion(e), note: true };
  return { type: "champs", champs: champsEcran(e, phase) };
}

function reponseAttendue(e: ExerciceParadoxesProbabilites, phase: PhaseParadoxe): ReactNode {
  if (phase === "prediction") return undefined;
  if (phase === "conclure") {
    return (
      <p className="prompt-text">
        <RenduFragments fragments={conclusionCorrecte(e)} />
      </p>
    );
  }
  return (
    <span className="equation-box-termes">
      {formatReponseAttenduePhaseLatex(e, phase).map((frag, i) => (
        <Katex key={i} expression={frag} />
      ))}
    </span>
  );
}

export function App6gen76() {
  const [etat, setEtat] = useState<EtatSessionParadoxes>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<PhaseParadoxe, boolean>>>({});
  /** Compteur d'exercices affichés : entre dans la `key` de l'écran pour vider la saisie à chaque
   * nouvel exercice (« Générer », « Nouvel exercice »), même quand la phase est la même. */
  const [compteur, setCompteur] = useState(0);

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  function votreReponse(valeurs: string[]): ReactNode {
    const mode = modeEcran(exercice, phase);
    if (mode.type === "choix") return <RenduFragments fragments={fragmentsOption(mode.options, valeurs[0])} />;
    return mode.champs.map((c, i) => `${c.label} : ${valeurs[i]}`).join(" ; ");
  }

  function terminerEtape(nouvelEtat: EtatSessionParadoxes, valeurs: string[]) {
    const transition = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee || nouvelEtat.exerciceCourant !== etat.exerciceCourant;
    if (!transition) {
      setEtat(nouvelEtat);
      return;
    }
    const revele = nouvelEtat.derniereTransitionRevelee;
    setAideParPhase((prev) => ({ ...prev, [phase]: etat.niveauAide > 0 }));
    setHistorique((h) => [...h, { titre: libellePhase(exercice, phase), votreReponse: votreReponse(valeurs), correcte: !revele, reponseAttendue: revele ? reponseAttendue(exercice, phase) : undefined }]);
    setEnAttente({ etatSuivant: nouvelEtat, revele });
  }

  function reinitialiser(nouvelEtat: EtatSessionParadoxes) {
    setEtat(nouvelEtat);
    setEnAttente(null);
    setHistorique([]);
    setAideParPhase({});
    setFicheOuverteIndex(null);
    setCompteur((c) => c + 1);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      reinitialiser(nouvelleSession());
      return;
    }
    setEtat(enAttente.etatSuivant);
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    reinitialiser(demarrerSessionParadoxes(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteParadoxesProbabilites)));
  }

  // Hook DEV-ONLY (même garde que `SelecteurVarianteDev`) : exercice tiré exposé pour Playwright.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen76?: unknown }).__debug6gen76 = { exercice, phase };
  }

  const mode = modeEcran(exercice, phase);
  const choix = estPhaseChoix(phase);
  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttendue(exercice, phase),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
        ...(choix ? { messageRevele: "Ce n'était pas la bonne réponse (une seule tentative sur un choix fermé)." } : {}),
      }
    : null;

  const segments = calculerSegmentsProgressionParadoxes(etat, aideParPhase);
  const rappelPrediction = phase === "conclure" ? fragmentsOption(optionsPrediction(exercice), etat.prediction) : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Quand l'intuition se trompe</h1>
        <p className="app-subtitle">Chapitre 6 — Les probabilités</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={segments} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifParadoxes(etat)} />
        <EtapeParadoxesProbabilites
          key={`${compteur}-${phase}`}
          consigneGenerale={consigneGenerale(exercice)}
          blocDonnees={blocDonnees(exercice)}
          figureSvg={figureEcranSvg(exercice, phase)}
          consigneEcran={consigneEcran(exercice, phase)}
          rappelPrediction={rappelPrediction}
          mode={mode}
          aideNiveau1={aideNiveau1(exercice, phase)}
          aideNiveau2={aideNiveau2(exercice, phase)}
          tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
          tentativesMax={choix ? 1 : etat.reglages.tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMaxPhase(etat)}
          onActiverAide={() => setEtat(activerAideSuivante(etat))}
          validation={validation}
          diagnostiquer={(valeurs) => diagnostiquerChamps(exercice, phase, valeurs)}
          onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs), valeurs)}
        />
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}

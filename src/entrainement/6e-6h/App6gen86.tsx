import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import type { ExerciceComparerEncadrerLog } from "./core6e/comparerEncadrerLogarithmes.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceComparerEncadrerLog } from "./generateurs6e/comparerEncadrerLogarithmes";
import type { IdVarianteComparerEncadrerLog } from "./generateurs6e/comparerEncadrerLogarithmes";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionComparerEncadrerLog, soumettreReponseEcran } from "./moteur6e/sessionComparerEncadrerLogarithmes";
import { estPhaseChoix } from "./moteur6e/typesComparerEncadrerLogarithmes";
import type { EtatSessionComparerEncadrerLog, PhaseComparerEncadrerLog } from "./moteur6e/typesComparerEncadrerLogarithmes";
import { diagnostiquerChamps, messageSpecifique } from "./moteur6e/verificationComparerEncadrerLogarithmes";
import { Katex } from "./components/Katex";
import { RenduFragments } from "./components/RenduFragments";
import { EtapeComparerEncadrerLogarithmes } from "./components6e/EtapeComparerEncadrerLogarithmes";
import type { ModeEcranComparerLog } from "./components6e/EtapeComparerEncadrerLogarithmes";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import {
  aideNiveau1,
  aideNiveau2,
  blocDonnees,
  champsEcran,
  consigneEcran,
  consigneGenerale,
  formatReponseAttendueLatex,
  fragmentsReponseChoix,
  libellePhase,
  optionCorrecteFragments,
  optionsEcran,
} from "./ui6e/formatComparerEncadrerLogarithmes";
import { calculerRecapitulatifComparerEncadrerLog, calculerSegmentsProgressionComparerEncadrerLog } from "./ui6e/recapitulatifComparerEncadrerLogarithmes";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";

/**
 * `6gen86` — « Comparer et encadrer des logarithmes sans calculatrice » (chapitre 3, section
 * `proprietes`, processus 2). Encadrer logₐ(N) entre deux entiers, comparer deux logarithmes de
 * bases différentes, ranger quatre nombres, valeur approchée par le changement de base. Même patron
 * que `App6gen79.tsx` (choix fermés et champs libres dans une seule chaîne d'écrans) ; le `?code=`
 * (QR code des feuilles) rejoue l'instance de `generateurs6e/comparerEncadrerLogarithmes/exportEvaluation.ts`
 * avec les MÊMES fonctions de génération (modèle `App6gen14.tsx`).
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionComparerEncadrerLog {
  return demarrerSessionComparerEncadrerLog(REGLAGES_DEMO, genererExerciceComparerEncadrerLog);
}

/** Première session : le code d'un exercice imprimé (`?code=XXXXXX`) en fixe le PREMIER exercice. */
function sessionInitiale(): EtatSessionComparerEncadrerLog {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionComparerEncadrerLog(REGLAGES_DEMO, () =>
    genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceComparerEncadrerLog, (id) => construireAvecVarianteId(id as IdVarianteComparerEncadrerLog)),
  );
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionComparerEncadrerLog;
  revele: boolean;
}

function modeEcran(e: ExerciceComparerEncadrerLog, phase: PhaseComparerEncadrerLog): ModeEcranComparerLog {
  if (phase === "ordre") return { type: "ordre", options: optionsEcran(e, phase) };
  if (estPhaseChoix(phase)) return { type: "choix", options: optionsEcran(e, phase) };
  return { type: "champs", champs: champsEcran(e, phase) };
}

function reponseAttendue(e: ExerciceComparerEncadrerLog, phase: PhaseComparerEncadrerLog): ReactNode {
  if (estPhaseChoix(phase)) {
    return (
      <p className="prompt-text">
        <RenduFragments fragments={optionCorrecteFragments(e, phase)} />
      </p>
    );
  }
  return (
    <span className="equation-box-termes">
      {formatReponseAttendueLatex(e, phase).map((frag, i) => (
        <Katex key={i} expression={frag} />
      ))}
    </span>
  );
}

export function App6gen86() {
  const [etat, setEtat] = useState<EtatSessionComparerEncadrerLog>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<PhaseComparerEncadrerLog, boolean>>>({});
  /** Compteur d'exercices affichés : entre dans la `key` de l'écran pour vider la saisie à chaque
   * nouvel exercice (« Générer », « Nouvel exercice »), même quand la phase est la même. */
  const [compteur, setCompteur] = useState(0);

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  function votreReponse(valeurs: string[]): ReactNode {
    if (estPhaseChoix(phase)) return <RenduFragments fragments={fragmentsReponseChoix(exercice, phase, valeurs[0])} />;
    const mode = modeEcran(exercice, phase);
    return mode.type === "champs" ? (
      <span>
        {mode.champs.map((c, i) => (
          <span key={i}>
            {i > 0 && " ; "}
            <Katex expression={c.labelLatex} /> {valeurs[i]}
          </span>
        ))}
      </span>
    ) : null;
  }

  function terminerEtape(nouvelEtat: EtatSessionComparerEncadrerLog, valeurs: string[]) {
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

  function reinitialiser(nouvelEtat: EtatSessionComparerEncadrerLog) {
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
    reinitialiser(demarrerSessionComparerEncadrerLog(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteComparerEncadrerLog)));
  }

  // Hook DEV-ONLY (même garde que `SelecteurVarianteDev`) : exercice tiré exposé pour Playwright.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen86?: unknown }).__debug6gen86 = { exercice, phase };
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

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Comparer et encadrer des logarithmes sans calculatrice</h1>
        <p className="app-subtitle">Chapitre 3 — Fonctions logarithmes</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionComparerEncadrerLog(etat, aideParPhase)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifComparerEncadrerLog(etat)} />
        <EtapeComparerEncadrerLogarithmes
          key={`${compteur}-${phase}`}
          consigneGenerale={consigneGenerale(exercice)}
          blocDonnees={blocDonnees(exercice)}
          consigneEcran={consigneEcran(exercice, phase)}
          mode={mode}
          aideNiveau1={aideNiveau1(exercice, phase)}
          aideNiveau2={aideNiveau2(exercice, phase)}
          tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
          tentativesMax={choix ? 1 : etat.reglages.tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={NIVEAU_AIDE_MAX}
          onActiverAide={() => setEtat(activerAideSuivante(etat))}
          validation={validation}
          diagnostiquer={(valeurs) => diagnostiquerChamps(exercice, phase, valeurs)}
          messageSpecifique={(valeurs) => messageSpecifique(exercice, phase, valeurs)}
          onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs), valeurs)}
        />
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}

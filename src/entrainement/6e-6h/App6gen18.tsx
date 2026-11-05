import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceDeterminerParametresLogarithme } from "./generateurs6e/determinerParametresLogarithme";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionDeterminerParametresLogarithme, soumettreReponse } from "./moteur6e/sessionDeterminerParametresLogarithme";
import type { EtatSessionDeterminerParametresLogarithme, PhaseDeterminerParametresLogarithme } from "./moteur6e/typesDeterminerParametresLogarithme";
import { diagnostiquerEquationB, diagnostiquerFonction, diagnostiquerLireA } from "./moteur6e/verificationDeterminerParametresLogarithme";
import type { StatutVerification } from "./moteur/statutVerification";
import { EtapeChampDeterminerParametres } from "./components6e/EtapeChampDeterminerParametres";
import { GrapheParametresLogarithme } from "./components6e/GrapheParametresLogarithme";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { Katex } from "./components/Katex";
import {
  CONSIGNE_GENERALE,
  LIBELLE_PHASE,
  PLACEHOLDERS,
  aideNiveau1,
  aideNiveau2,
  consigneEcran,
  descriptionGraphique,
  formatReponseAttenduePhaseLatex,
} from "./ui6e/formatDeterminerParametresLogarithme";
import { calculerRecapitulatifDeterminerParametresLogarithme, calculerSegmentsProgressionDeterminerParametresLogarithme } from "./ui6e/recapitulatifDeterminerParametresLogarithme";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { ExerciceDeterminerParametresLogarithme } from "./core6e/determinerParametresLogarithme.types";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";

/**
 * `6gen18` — Paramètres depuis des conditions graphiques : f(x) = a + b·ln(x), a et b lus sur un
 * graphique (section 6 du chapitre 3 de 6e). Trois écrans : a (f(1) = a), équation en b (tangente
 * en x = 1, ou point en x = e / e²), f(x). Voir `core6e/determinerParametresLogarithme.types.ts`.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3 };

const LIBELLE_CHAMP: Record<PhaseDeterminerParametresLogarithme, string> = {
  lireA: "a =",
  equationB: "Équation :",
  fonction: "f(x) =",
};

const DIAGNOSTIQUEURS: Record<PhaseDeterminerParametresLogarithme, (exercice: ExerciceDeterminerParametresLogarithme, texte: string) => StatutVerification> = {
  lireA: diagnostiquerLireA,
  equationB: diagnostiquerEquationB,
  fonction: diagnostiquerFonction,
};

function nouvelleSession(): EtatSessionDeterminerParametresLogarithme {
  return demarrerSessionDeterminerParametresLogarithme(REGLAGES_DEMO, genererExerciceDeterminerParametresLogarithme);
}

/** Tirage de l'instance imprimée sur une feuille (code `?code=XXXXXX`) — MÊMES fonctions de
 * génération que l'adaptateur d'export (`generateurs6e/determinerParametresLogarithme/exportEvaluation.ts`). */
function exerciceDuCode(code: NonNullable<ReturnType<typeof lireCodeDepuisUrl>>): ExerciceDeterminerParametresLogarithme {
  return genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceDeterminerParametresLogarithme, (id) =>
    construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  );
}

/** Première session : l'exercice du code de l'URL s'il y en a un, sinon un tirage normal. */
function sessionInitiale(): EtatSessionDeterminerParametresLogarithme {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionDeterminerParametresLogarithme(REGLAGES_DEMO, () => exerciceDuCode(code));
}

/** État tenu en attente dès qu'un écran se termine — appliqué au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement. */
interface TransitionEnAttente {
  etatSuivant: EtatSessionDeterminerParametresLogarithme;
  revele: boolean;
}

function ReponseLatex({ valeurs }: { valeurs: string[] }) {
  return (
    <span className="equation-box-termes">
      {valeurs.map((frag, i) => (
        <Katex key={i} expression={`\\displaystyle ${frag}`} />
      ))}
    </span>
  );
}

export function App6gen18() {
  const [etat, setEtat] = useState<EtatSessionDeterminerParametresLogarithme>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Numéro d'exercice local, inclus dans la `key` des écrans (champ vidé à chaque exercice). */
  const [numeroExercice, setNumeroExercice] = useState(0);

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  function terminerEtape(nouvelEtat: EtatSessionDeterminerParametresLogarithme, votreReponse: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (!transitionDEcran) {
      setEtat(nouvelEtat);
      return;
    }
    const revele = nouvelEtat.derniereTransitionRevelee;
    setHistorique((h) => [
      ...h,
      {
        titre: LIBELLE_PHASE[etat.phase],
        votreReponse,
        correcte: !revele,
        reponseAttendue: revele ? <ReponseLatex valeurs={formatReponseAttenduePhaseLatex(exercice, etat.phase)} /> : undefined,
      },
    ]);
    setEnAttente({ etatSuivant: nouvelEtat, revele });
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      setEtat(nouvelleSession());
      setHistorique([]);
      setNumeroExercice((n) => n + 1);
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    setHistorique([]);
    setNumeroExercice((n) => n + 1);
    setEtat(demarrerSessionDeterminerParametresLogarithme(REGLAGES_DEMO, () => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0])));
  }

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1) : expose l'exercice tiré pour la
  // vérification Playwright — jamais consommé par le code applicatif (même patron que `App6gen27.tsx`).
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen18?: unknown }).__debug6gen18 = { exercice, phase };
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: <ReponseLatex valeurs={formatReponseAttenduePhaseLatex(exercice, phase)} />,
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  const segments = calculerSegmentsProgressionDeterminerParametresLogarithme(etat);

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Paramètres depuis des conditions graphiques</h1>
        <p className="app-subtitle">Chapitre 3 — Fonctions logarithmes</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={segments} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifDeterminerParametresLogarithme(etat)} />
        <EtapeChampDeterminerParametres
          key={`${numeroExercice}-${phase}`}
          consigneGenerale={CONSIGNE_GENERALE}
          figure={<GrapheParametresLogarithme exercice={exercice} surlignerAbscisse1={phase === "lireA" && etat.niveauAide >= 2} />}
          descriptionFigure={descriptionGraphique(exercice, false)}
          consigneEcran={consigneEcran(phase, exercice)}
          libelleChamp={LIBELLE_CHAMP[phase]}
          placeholder={PLACEHOLDERS[phase]}
          aideNiveau1={aideNiveau1(phase, exercice)}
          aideNiveau2={aideNiveau2(phase, exercice)}
          tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
          tentativesMax={etat.reglages.tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={NIVEAU_AIDE_MAX}
          onActiverAide={() => setEtat(activerAideSuivante(etat))}
          diagnostiquer={(texte) => DIAGNOSTIQUEURS[phase](exercice, texte)}
          onValider={(texte) => terminerEtape(soumettreReponse(etat, texte), texte)}
          validation={validation}
        />
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}

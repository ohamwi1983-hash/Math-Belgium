import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import type { ExerciceSommeInfinie } from "./core5e/sommeInfinieSituation.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceSommeInfinie } from "./generateurs5e/sommeInfinieSituation";
import type { IdVarianteSommeInfinie } from "./generateurs5e/sommeInfinieSituation";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionSommeInfinie, soumettreReponseEcran } from "./moteur5e/sessionSommeInfinieSituation";
import type { EtatSessionSommeInfinie, PhaseSommeInfinie } from "./moteur5e/typesSommeInfinieSituation";
import { diagnostiquerChamps, messageIllisible, messagePiege, refusFormat } from "./moteur5e/verificationSommeInfinieSituation";
import { EtapeSommeInfinieSituation, FragmentsSommeInfinie } from "./components5e/EtapeSommeInfinieSituation";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import { RecapitulatifPanel } from "./components5e/RecapitulatifPanel";
import { aideNiveau1, aideNiveau2, champsEcran, consigneEcran, consigneGenerale, libellePhase, reponseFragments } from "./ui5e/formatSommeInfinieSituation";
import { calculerRecapitulatifSommeInfinie, calculerSegmentsProgressionSommeInfinie } from "./ui5e/recapitulatifSommeInfinieSituation";
import { PALETTE_ECRAN, construireSvgSommeInfinie } from "./export5e/svgSommeInfinieSituation";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";

/**
 * `5gen48` — « Somme infinie en situation » (chapitre 3 de 5e « Suites », section `convergence`,
 * processus 3 TRANSFÉRER). Nombre décimal périodique → fraction irréductible, balle qui rebondit
 * (distance totale), poursuite de Zénon (Achille et la tortue), figures emboîtées (triangles ou
 * hexagones des milieux) : premier terme → raison → somme infinie (|q| < 1 justifié) → réponse au
 * problème. Même patron que `App5gen45.tsx` ; le `?code=` (QR code des feuilles) rejoue l'instance de
 * `generateurs5e/sommeInfinieSituation/exportEvaluation.ts` avec les MÊMES fonctions de génération.
 */

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionSommeInfinie {
  return demarrerSessionSommeInfinie(REGLAGES_DEMO, genererExerciceSommeInfinie);
}

/** Première session : le code d'un exercice imprimé (`?code=XXXXXX`) en fixe le PREMIER exercice. */
function sessionInitiale(): EtatSessionSommeInfinie {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionSommeInfinie(REGLAGES_DEMO, () =>
    genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceSommeInfinie, (id) => construireAvecVarianteId(id as IdVarianteSommeInfinie)),
  );
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionSommeInfinie;
  revele: boolean;
}

function reponseAttendue(e: ExerciceSommeInfinie, phase: PhaseSommeInfinie): ReactNode {
  return (
    <span className="prompt-text" style={{ overflowX: "auto", display: "block", maxWidth: "100%" }}>
      <FragmentsSommeInfinie fragments={reponseFragments(e, phase)} />
    </span>
  );
}

export function App5gen48() {
  const [etat, setEtat] = useState<EtatSessionSommeInfinie>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<PhaseSommeInfinie, boolean>>>({});
  /** Compteur d'exercices affichés : entre dans la `key` de l'écran pour vider la saisie à chaque
   * nouvel exercice (« Générer », « Nouvel exercice »), même quand la phase est la même. */
  const [compteur, setCompteur] = useState(0);

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
  const champs = champsEcran(exercice, phase);

  function terminerEtape(nouvelEtat: EtatSessionSommeInfinie, valeurs: string[]) {
    const transition = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee || nouvelEtat.exerciceCourant !== etat.exerciceCourant;
    if (!transition) {
      setEtat(nouvelEtat);
      return;
    }
    const revele = nouvelEtat.derniereTransitionRevelee;
    setAideParPhase((prev) => ({ ...prev, [phase]: etat.niveauAide > 0 }));
    setHistorique((h) => [...h, { titre: libellePhase(phase), votreReponse: valeurs[0], correcte: !revele, reponseAttendue: revele ? reponseAttendue(exercice, phase) : undefined }]);
    setEnAttente({ etatSuivant: nouvelEtat, revele });
  }

  function reinitialiser(nouvelEtat: EtatSessionSommeInfinie) {
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
    reinitialiser(demarrerSessionSommeInfinie(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteSommeInfinie)));
  }

  // Hook DEV-ONLY (même garde que `SelecteurVarianteDev`) : exercice tiré exposé pour Playwright.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug5gen48?: unknown }).__debug5gen48 = { exercice, phase };
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttendue(exercice, phase),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Somme infinie en situation</h1>
        <p className="app-subtitle">Chapitre 3 — Suites</p>
        <ProgressionPuces segments={calculerSegmentsProgressionSommeInfinie(etat, aideParPhase)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      <main className="card">
        <div className="card-body">
          <RecapitulatifPanel entrees={calculerRecapitulatifSommeInfinie(etat)} />
          <EtapeSommeInfinieSituation
            key={`${compteur}-${phase}`}
            consigneGenerale={consigneGenerale(exercice)}
            figureSvg={construireSvgSommeInfinie(exercice, PALETTE_ECRAN)}
            consigneEcran={consigneEcran(exercice, phase)}
            champs={champs}
            aideNiveau1={aideNiveau1(exercice, phase)}
            aideNiveau2={aideNiveau2(exercice, phase)}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            niveauAideMax={NIVEAU_AIDE_MAX}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            validation={validation}
            diagnostiquer={(valeurs) => diagnostiquerChamps(exercice, phase, valeurs)}
            piege={(valeurs) => messagePiege(exercice, phase, valeurs)}
            refusFormat={(valeurs) => refusFormat(exercice, phase, valeurs)}
            messageIllisible={messageIllisible()}
            onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs), valeurs)}
          />
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}

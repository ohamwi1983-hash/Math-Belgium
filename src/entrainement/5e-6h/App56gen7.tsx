// Copie 5e (6h) de `5e-4h/App5gen48.tsx` (56gen7 ← 5gen48, chantier D du 26/11/2026) — copiée pour que les deux années puissent diverger.
import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession5e } from "../5e-4h/core5e/session5e.types";
import type { ExerciceSommeInfinie } from "./generateurs56/sommeInfinieSituation/core/sommeInfinieSituation.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceSommeInfinie } from "./generateurs56/sommeInfinieSituation";
import type { IdVarianteSommeInfinie } from "./generateurs56/sommeInfinieSituation";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionSommeInfinie, soumettreReponseEcran } from "./generateurs56/sommeInfinieSituation/moteur/sessionSommeInfinieSituation";
import type { EtatSessionSommeInfinie, PhaseSommeInfinie } from "./generateurs56/sommeInfinieSituation/moteur/typesSommeInfinieSituation";
import { PHASES } from "./generateurs56/sommeInfinieSituation/moteur/typesSommeInfinieSituation";
import { diagnostiquerChamps, messageIllisible, messagePiege, refusFormat } from "./generateurs56/sommeInfinieSituation/moteur/verificationSommeInfinieSituation";
import { EtapeSommeInfinieSituation, FragmentsSommeInfinie } from "./generateurs56/sommeInfinieSituation/composants/EtapeSommeInfinieSituation";
import { SelecteurVarianteDev } from "../5e-4h/components5e/SelecteurVarianteDev";
import { RecapitulatifPanel } from "../5e-4h/components5e/RecapitulatifPanel";
import { aideNiveau1, aideNiveau2, champsEcran, consigneEcran, consigneGenerale, libellePhase, reponseFragments } from "./generateurs56/sommeInfinieSituation/ui/formatSommeInfinieSituation";
import { calculerRecapitulatifSommeInfinie, calculerSegmentsProgressionSommeInfinie } from "./generateurs56/sommeInfinieSituation/ui/recapitulatifSommeInfinieSituation";
import { PALETTE_ECRAN, construireSvgSommeInfinie } from "./generateurs56/sommeInfinieSituation/export/svgSommeInfinieSituation";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { correctionDetailleeSommeInfinie } from "./generateurs56/sommeInfinieSituation/corrigeDetaille";
import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";
import { lettreEtape, lignesDeLEtape } from "../export/corrigeTableau";

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

export function App56gen7() {
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
    setHistorique((h) => [...h, { corrigeDetaille: corrigeDetailleEcranCourant(), titre: libellePhase(phase), votreReponse: valeurs[0], correcte: !revele, reponseAttendue: revele ? reponseAttendue(exercice, phase) : undefined }]);
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
    (window as unknown as { __debug56gen7?: unknown }).__debug56gen7 = { exercice, phase };
  }

  /** Corrigé détaillé « comme au tableau » de l'écran en cours — UNE seule source pour la validation
   * (après la réponse) et pour l'entrée d'historique de l'étape (fiche de sa puce). */
  function corrigeDetailleEcranCourant() {
    return <CorrigeDetailleEcran etapes={lignesDeLEtape(correctionDetailleeSommeInfinie(exercice), lettreEtape(PHASES.indexOf(phase)))} />;
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttendue(exercice, phase),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
        // Corrigé détaillé « comme au tableau » de l'étape (même source que le papier,
        // `generateurs5e/sommeInfinieSituation/corrigeDetaille.ts`), affiché sous la réponse attendue quand elle est révélée.
        corrigeDetaille: corrigeDetailleEcranCourant(),
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e (6h) — Entraînement</p>
        <h1 className="app-title">Somme infinie en situation</h1>
        <p className="app-subtitle">Nombres réels et suites</p>
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

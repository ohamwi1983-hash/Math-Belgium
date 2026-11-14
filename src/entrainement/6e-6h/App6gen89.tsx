import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import type { ExerciceLinearisation } from "./core6e/linearisationDonnees";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLinearisation } from "./generateurs6e/linearisationDonnees";
import type { IdVarianteLinearisation } from "./generateurs6e/linearisationDonnees";
import { activerAideSuivante, demarrerSessionLinearisation, niveauAideMaxPhase, soumettreReponseEcran, tentativesMaxCourant } from "./moteur6e/sessionLinearisation";
import { estPhaseChoix } from "./moteur6e/typesLinearisation";
import type { EtatSessionLinearisation, PhaseLinearisation } from "./moteur6e/typesLinearisation";
import { diagnostiquerChamps, messagePiege } from "./moteur6e/verificationLinearisation";
import { Katex } from "./components/Katex";
import { RenduFragments } from "./components/RenduFragments";
import { EtapeLinearisation } from "./components6e/EtapeLinearisation";
import type { ModeEcranLinearisation } from "./components6e/EtapeLinearisation";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import {
  aideNiveau1,
  aideNiveau2,
  champsEcran,
  consigneEcran,
  consigneGenerale,
  formatReponseAttenduePhaseLatex,
  fragmentsOption,
  libellePhase,
  libellesChamps,
  optionsChoix,
  reponseChoix,
  tableauHtml,
} from "./ui6e/formatLinearisation";
import { figureCorrigeSvg } from "./ui6e/figureLinearisation";
import { calculerRecapitulatifLinearisation, calculerSegmentsProgressionLinearisation } from "./ui6e/recapitulatifLinearisation";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";

/**
 * `6gen89` — « Linéariser des données : du tableau au modèle » (chapitre 3 de 6e, section
 * « problèmes », processus 3 TRANSFÉRER). Trois parcours : semi-log (modèle exponentiel), log-log
 * (modèle puissance), choisir la représentation (aucune, semi-log ou log-log). Même patron que
 * `App6gen82.tsx` ; le `?code=` (QR code des feuilles) rejoue l'instance de
 * `generateurs6e/linearisationDonnees/exportEvaluation.ts` avec les MÊMES fonctions de génération.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionLinearisation {
  return demarrerSessionLinearisation(REGLAGES_DEMO, genererExerciceLinearisation);
}

/** Première session : le code d'un exercice imprimé (`?code=XXXXXX`) en fixe le PREMIER exercice. */
function sessionInitiale(): EtatSessionLinearisation {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionLinearisation(REGLAGES_DEMO, () => genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceLinearisation, (id) => construireAvecVarianteId(id as IdVarianteLinearisation)));
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionLinearisation;
  revele: boolean;
}

function modeEcran(e: ExerciceLinearisation, phase: PhaseLinearisation): ModeEcranLinearisation {
  return estPhaseChoix(phase) ? { type: "choix", options: optionsChoix(e) } : { type: "champs", champs: champsEcran(e, phase) };
}

function reponseAttendue(e: ExerciceLinearisation, phase: PhaseLinearisation): ReactNode {
  if (estPhaseChoix(phase)) {
    return (
      <p className="prompt-text">
        <RenduFragments fragments={reponseChoix(e)} />
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

export function App6gen89() {
  const [etat, setEtat] = useState<EtatSessionLinearisation>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<PhaseLinearisation, boolean>>>({});
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

  function terminerEtape(nouvelEtat: EtatSessionLinearisation, valeurs: string[]) {
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

  function reinitialiser(nouvelEtat: EtatSessionLinearisation) {
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
    reinitialiser(demarrerSessionLinearisation(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteLinearisation)));
  }

  // Hook DEV-ONLY (même garde que `SelecteurVarianteDev`) : exercice tiré exposé pour Playwright.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen89?: unknown }).__debug6gen89 = { exercice, phase };
  }

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
        <h1 className="app-title">Linéariser des données</h1>
        <p className="app-subtitle">Chapitre 3 — Fonctions logarithmes</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionLinearisation(etat, aideParPhase)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifLinearisation(etat)} />
        <EtapeLinearisation
          key={`${compteur}-${phase}`}
          consigneGenerale={consigneGenerale(exercice)}
          tableauHtml={tableauHtml(exercice, true)}
          consigneEcran={consigneEcran(exercice, phase)}
          mode={modeEcran(exercice, phase)}
          aideNiveau1={aideNiveau1(exercice, phase)}
          aideNiveau2={aideNiveau2(exercice, phase)}
          tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
          tentativesMax={tentativesMaxCourant(etat)}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMaxPhase(etat)}
          onActiverAide={() => setEtat(activerAideSuivante(etat))}
          validation={validation}
          diagnostiquer={(valeurs) => diagnostiquerChamps(exercice, phase, valeurs)}
          piege={(valeurs) => messagePiege(exercice, phase, valeurs, libellesChamps(exercice, phase))}
          onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs), valeurs)}
        />
        {enAttente?.etatSuivant.terminee && (
          <figure style={{ margin: "1rem 0 0", textAlign: "center" }} aria-label="Points transformés et droite">
            <div dangerouslySetInnerHTML={{ __html: figureCorrigeSvg(exercice) }} />
          </figure>
        )}
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}

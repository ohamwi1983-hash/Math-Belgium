import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import type { ExerciceOptimiserLog } from "./core6e/optimiserModeleLog.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceOptimiserLog } from "./generateurs6e/optimiserModeleLog";
import type { IdVarianteOptimiserLog } from "./generateurs6e/optimiserModeleLog";
import { activerAideSuivante, demarrerSessionOptimiserLog, niveauAideMaxPhase, soumettreReponseEcran, tentativesMaxPhase } from "./moteur6e/sessionOptimiserModeleLog";
import { estPhaseChoix } from "./moteur6e/typesOptimiserModeleLog";
import type { EtatSessionOptimiserLog, PhaseOptimiserLog } from "./moteur6e/typesOptimiserModeleLog";
import { messageSaisieNonDecomptee } from "./moteur6e/verificationOptimiserModeleLog";
import { Katex } from "./components/Katex";
import { RenduFragments } from "./components/RenduFragments";
import { EtapeOptimiserModeleLog } from "./components6e/EtapeOptimiserModeleLog";
import type { ModeEcranOptimiser } from "./components6e/EtapeOptimiserModeleLog";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { LIBELLE_PHASE, aideNiveau1, aideNiveau2, consigneGeneraleEcran, fiche, formatReponseAttenduePhaseLatex, optionsNature } from "./ui6e/formatOptimiserModeleLog";
import { figureOptimiserLogSvg } from "./ui6e/figureOptimiserModeleLog";
import { calculerRecapitulatifOptimiserLog, calculerSegmentsProgressionOptimiserLog } from "./ui6e/recapitulatifOptimiserModeleLog";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";

/**
 * `6gen91` — « Optimiser un modèle logarithmique » (6e, chapitre 3, section « etude »,
 * processus 3). Chaîne fixe de 5 écrans (domaine → dérivée → zéro → nature → optimum en contexte),
 * patron de `App6gen80.tsx`. Le `?code=` (QR code des feuilles) rejoue l'instance de
 * `generateurs6e/optimiserModeleLog/exportEvaluation.ts` avec les MÊMES fonctions de génération
 * (modèle `App6gen14.tsx`).
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionOptimiserLog {
  return demarrerSessionOptimiserLog(REGLAGES_DEMO, genererExerciceOptimiserLog);
}

/** Première session : le code d'un exercice imprimé (`?code=XXXXXX`) en fixe le PREMIER exercice. */
function sessionInitiale(): EtatSessionOptimiserLog {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionOptimiserLog(REGLAGES_DEMO, () =>
    genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceOptimiserLog, (id) => construireAvecVarianteId(id as IdVarianteOptimiserLog)),
  );
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionOptimiserLog;
  revele: boolean;
}

function modeEcran(e: ExerciceOptimiserLog, phase: PhaseOptimiserLog): ModeEcranOptimiser {
  const fi = fiche(e);
  switch (phase) {
    case "domaine":
      return { type: "domaine", nom: fi.nom };
    case "derivee":
      return { type: "champ", champ: fi.champs.derivee };
    case "zero":
      return { type: "champ", champ: fi.champs.zero };
    case "nature":
      return { type: "choix", options: optionsNature(e) };
    case "valeur":
      return { type: "deuxChamps", champs: [fi.champs.optimum, fi.champs.valeur] };
  }
}

function reponseAttendue(e: ExerciceOptimiserLog, phase: PhaseOptimiserLog): ReactNode {
  return (
    <span className="equation-box-termes">
      {formatReponseAttenduePhaseLatex(e, phase).map((frag, i) => (
        <Katex key={i} expression={frag} />
      ))}
    </span>
  );
}

export function App6gen91() {
  const [etat, setEtat] = useState<EtatSessionOptimiserLog>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Compteur d'exercices affichés : entre dans la `key` de l'écran pour vider la saisie à chaque
   * nouvel exercice (« Générer », « Nouvel exercice »), même quand la phase est la même. */
  const [compteur, setCompteur] = useState(0);

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
  const fi = fiche(exercice);

  function votreReponse(valeurs: string[]): ReactNode {
    const mode = modeEcran(exercice, phase);
    if (mode.type === "choix") {
      const option = mode.options.find((o) => o.id === valeurs[0]);
      return option ? <RenduFragments fragments={option.fragments} /> : valeurs[0];
    }
    if (mode.type === "domaine") return `${valeurs[0]}${valeurs[1]} ; ${valeurs[2]}${valeurs[3]}`;
    return valeurs.join(" ; ");
  }

  function terminerEtape(nouvelEtat: EtatSessionOptimiserLog, valeurs: string[]) {
    const transition = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee || nouvelEtat.exerciceCourant !== etat.exerciceCourant;
    if (!transition) {
      setEtat(nouvelEtat);
      return;
    }
    const revele = nouvelEtat.derniereTransitionRevelee;
    setHistorique((h) => [...h, { titre: LIBELLE_PHASE[phase], votreReponse: votreReponse(valeurs), correcte: !revele, reponseAttendue: revele ? reponseAttendue(exercice, phase) : undefined }]);
    setEnAttente({ etatSuivant: nouvelEtat, revele });
  }

  function reinitialiser(nouvelEtat: EtatSessionOptimiserLog) {
    setEtat(nouvelEtat);
    setEnAttente(null);
    setHistorique([]);
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
    reinitialiser(demarrerSessionOptimiserLog(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteOptimiserLog)));
  }

  // Hook DEV-ONLY (même garde que `SelecteurVarianteDev`) : exercice tiré exposé pour Playwright.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen91?: unknown }).__debug6gen91 = { exercice, phase };
  }

  const choix = estPhaseChoix(phase);
  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttendue(exercice, phase),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
        ...(choix ? { messageRevele: "Ce n'était pas la bonne conclusion (une seule tentative sur un choix fermé)." } : {}),
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Optimiser un modèle logarithmique</h1>
        <p className="app-subtitle">Chapitre 3 — Fonctions logarithmes</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionOptimiserLog(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifOptimiserLog(etat)} />
        <EtapeOptimiserModeleLog
          key={`${compteur}-${phase}`}
          consigneGenerale={consigneGeneraleEcran(exercice)}
          blocDonnees={fi.blocDonnees}
          consigneEcran={fi.consignes[phase]}
          mode={modeEcran(exercice, phase)}
          aideNiveau1={aideNiveau1(exercice, phase)}
          aideNiveau2={aideNiveau2(exercice, phase)}
          tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
          tentativesMax={tentativesMaxPhase(etat)}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMaxPhase(phase)}
          onActiverAide={() => setEtat(activerAideSuivante(etat))}
          validation={validation}
          messageSaisie={(valeurs) => messageSaisieNonDecomptee(exercice, phase, valeurs)}
          onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs), valeurs)}
        />
        {enAttente?.etatSuivant.terminee && (
          <figure style={{ margin: "1rem 0 0", textAlign: "center" }} aria-label="Courbe du modèle et optimum">
            <div dangerouslySetInnerHTML={{ __html: figureOptimiserLogSvg(exercice) }} />
            <figcaption style={{ fontSize: "0.9rem", marginTop: "0.4rem", color: "var(--ink-soft)" }}>Courbe du modèle sur son domaine dans le contexte, avec l'optimum.</figcaption>
          </figure>
        )}
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}

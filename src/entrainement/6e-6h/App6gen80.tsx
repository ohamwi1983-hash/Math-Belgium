import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import type { ExerciceAccumulerGrandeur } from "./core6e/accumulerGrandeur.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceAccumulerGrandeur } from "./generateurs6e/accumulerGrandeur";
import type { IdVarianteAccumulerGrandeur } from "./generateurs6e/accumulerGrandeur";
import { activerAideSuivante, demarrerSessionAccumulerGrandeur, niveauAideMaxPhase, soumettreReponseEcran, tentativesMaxPhase } from "./moteur6e/sessionAccumulerGrandeur";
import { estPhaseChoix } from "./moteur6e/typesAccumulerGrandeur";
import type { EtatSessionAccumulerGrandeur, PhaseAccumulerGrandeur } from "./moteur6e/typesAccumulerGrandeur";
import { diagnostiquerEcran } from "./moteur6e/verificationAccumulerGrandeur";
import { Katex } from "./components/Katex";
import { RenduFragments } from "./components/RenduFragments";
import { EtapeAccumulerGrandeur } from "./components6e/EtapeAccumulerGrandeur";
import type { ModeEcranAccumuler } from "./components6e/EtapeAccumulerGrandeur";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { LIBELLE_PHASE, aideNiveau1, aideNiveau2, blocDonnees, champEcran, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex, optionsModele } from "./ui6e/formatAccumulerGrandeur";
import { figureAccumulerGrandeurSvg, figureEnonceAccumulerGrandeur, legendeAire } from "./ui6e/figureAccumulerGrandeur";
import { calculerRecapitulatifAccumulerGrandeur, calculerSegmentsProgressionAccumulerGrandeur } from "./ui6e/recapitulatifAccumulerGrandeur";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";

/**
 * `6gen80` — « Accumuler une grandeur : débits, puissances, consommations » (6e, chapitre 4,
 * section « problèmes », processus 3). Chaîne fixe de 5 écrans (modèle → primitive → quantité →
 * transfert → unité), patron de `App6gen76.tsx`. Le `?code=` (QR code des feuilles) rejoue
 * l'instance de `generateurs6e/accumulerGrandeur/exportEvaluation.ts` avec les MÊMES fonctions de
 * génération (modèle `App6gen14.tsx`).
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionAccumulerGrandeur {
  return demarrerSessionAccumulerGrandeur(REGLAGES_DEMO, genererExerciceAccumulerGrandeur);
}

/** Première session : le code d'un exercice imprimé (`?code=XXXXXX`) en fixe le PREMIER exercice. */
function sessionInitiale(): EtatSessionAccumulerGrandeur {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionAccumulerGrandeur(REGLAGES_DEMO, () =>
    genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceAccumulerGrandeur, (id) => construireAvecVarianteId(id as IdVarianteAccumulerGrandeur)),
  );
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionAccumulerGrandeur;
  revele: boolean;
}

function modeEcran(e: ExerciceAccumulerGrandeur, phase: PhaseAccumulerGrandeur): ModeEcranAccumuler {
  if (phase === "modele") return { type: "choix", options: optionsModele(e) };
  return { type: "champ", champ: champEcran(e, phase) };
}

function reponseAttendue(e: ExerciceAccumulerGrandeur, phase: PhaseAccumulerGrandeur): ReactNode {
  return (
    <span className="equation-box-termes">
      {formatReponseAttenduePhaseLatex(e, phase).map((frag, i) => (
        <Katex key={i} expression={frag} />
      ))}
    </span>
  );
}

export function App6gen80() {
  const [etat, setEtat] = useState<EtatSessionAccumulerGrandeur>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Compteur d'exercices affichés : entre dans la `key` de l'écran pour vider la saisie à chaque
   * nouvel exercice (« Générer », « Nouvel exercice »), même quand la phase est la même. */
  const [compteur, setCompteur] = useState(0);

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  function votreReponse(valeurs: string[]): ReactNode {
    const mode = modeEcran(exercice, phase);
    if (mode.type === "choix") {
      const option = mode.options.find((o) => o.id === valeurs[0]);
      return option ? <RenduFragments fragments={option.fragments} /> : valeurs[0];
    }
    return valeurs[0];
  }

  function terminerEtape(nouvelEtat: EtatSessionAccumulerGrandeur, valeurs: string[]) {
    const transition = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee || nouvelEtat.exerciceCourant !== etat.exerciceCourant;
    if (!transition) {
      setEtat(nouvelEtat);
      return;
    }
    const revele = nouvelEtat.derniereTransitionRevelee;
    setHistorique((h) => [...h, { titre: LIBELLE_PHASE[phase], votreReponse: votreReponse(valeurs), correcte: !revele, reponseAttendue: revele ? reponseAttendue(exercice, phase) : undefined }]);
    setEnAttente({ etatSuivant: nouvelEtat, revele });
  }

  function reinitialiser(nouvelEtat: EtatSessionAccumulerGrandeur) {
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
    reinitialiser(demarrerSessionAccumulerGrandeur(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteAccumulerGrandeur)));
  }

  // Hook DEV-ONLY (même garde que `SelecteurVarianteDev`) : exercice tiré exposé pour Playwright.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen80?: unknown }).__debug6gen80 = { exercice, phase };
  }

  const choix = estPhaseChoix(phase);
  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttendue(exercice, phase),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
        ...(choix ? { messageRevele: "Ce n'était pas la bonne expression (une seule tentative sur un choix fermé)." } : {}),
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Accumuler une grandeur : débits, puissances, consommations</h1>
        <p className="app-subtitle">Chapitre 4 — Intégrales et primitives</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionAccumulerGrandeur(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifAccumulerGrandeur(etat)} />
        <EtapeAccumulerGrandeur
          key={`${compteur}-${phase}`}
          consigneGenerale={consigneGenerale(exercice)}
          blocDonnees={blocDonnees(exercice)}
          figureSvg={figureEnonceAccumulerGrandeur(exercice)}
          consigneEcran={consigneEcran(exercice, phase)}
          mode={modeEcran(exercice, phase)}
          aideNiveau1={aideNiveau1(exercice, phase)}
          aideNiveau2={aideNiveau2(exercice, phase)}
          tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
          tentativesMax={tentativesMaxPhase(etat)}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMaxPhase(phase)}
          onActiverAide={() => setEtat(activerAideSuivante(etat))}
          validation={validation}
          diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs)}
          onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs), valeurs)}
        />
        {enAttente?.etatSuivant.terminee && (
          <figure style={{ margin: "1rem 0 0", textAlign: "center" }} aria-label="Quantité accumulée">
            <div dangerouslySetInnerHTML={{ __html: figureAccumulerGrandeurSvg(exercice, true) }} />
            <figcaption style={{ fontSize: "0.9rem", marginTop: "0.4rem", color: "var(--ink-soft)" }}>
              Aire hachurée : {legendeAire(exercice)}.
            </figcaption>
          </figure>
        )}
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}

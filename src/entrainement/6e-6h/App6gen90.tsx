import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import type { ExerciceEchellesLogarithmiques } from "./core6e/echellesLogarithmiques.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEchellesLogarithmiques } from "./generateurs6e/echellesLogarithmiques";
import type { IdVarianteEchelles } from "./generateurs6e/echellesLogarithmiques";
import { activerAideSuivante, demarrerSessionEchelles, niveauAideMaxPhase, soumettreReponseEcran, tentativesMaxPhase } from "./moteur6e/sessionEchellesLogarithmiques";
import { estPhaseChoix } from "./moteur6e/typesEchellesLogarithmiques";
import type { EtatSessionEchelles, PhaseEchelles } from "./moteur6e/typesEchellesLogarithmiques";
import { diagnostiquerEcran } from "./moteur6e/verificationEchellesLogarithmiques";
import { Katex } from "./components/Katex";
import { RenduFragments } from "./components/RenduFragments";
import { EtapeAccumulerGrandeur } from "./components6e/EtapeAccumulerGrandeur";
import type { ModeEcranAccumuler } from "./components6e/EtapeAccumulerGrandeur";
import { CalculatriceScientifique } from "./components6e/CalculatriceScientifique";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { LIBELLE_PHASE, aideNiveau1, aideNiveau2, blocDonnees, champEcran, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex, optionsTraduire } from "./ui6e/formatEchellesLogarithmiques";
import { calculerRecapitulatifEchelles, calculerSegmentsProgressionEchelles } from "./ui6e/recapitulatifEchellesLogarithmiques";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";

/**
 * `6gen90` — « Échelles logarithmiques : rapports et sommes » (6e, chapitre 3, section
 * « problèmes », processus 3). Chaîne fixe de 3 écrans (traduire → calcul → réponse en contexte),
 * patron de `App6gen80.tsx` dont l'écran `EtapeAccumulerGrandeur` (champ libre OU choix fermé) est
 * réutilisé tel quel. Le `?code=` (QR code des feuilles) rejoue l'instance de
 * `generateurs6e/echellesLogarithmiques/exportEvaluation.ts` avec les MÊMES fonctions de génération.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionEchelles {
  return demarrerSessionEchelles(REGLAGES_DEMO, genererExerciceEchellesLogarithmiques);
}

/** Première session : le code d'un exercice imprimé (`?code=XXXXXX`) en fixe le PREMIER exercice. */
function sessionInitiale(): EtatSessionEchelles {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionEchelles(REGLAGES_DEMO, () =>
    genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceEchellesLogarithmiques, (id) => construireAvecVarianteId(id as IdVarianteEchelles)),
  );
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionEchelles;
  revele: boolean;
}

function modeEcran(e: ExerciceEchellesLogarithmiques, phase: PhaseEchelles): ModeEcranAccumuler {
  if (phase === "traduire") return { type: "choix", options: optionsTraduire(e) };
  return { type: "champ", champ: champEcran(e, phase) };
}

function reponseAttendue(e: ExerciceEchellesLogarithmiques, phase: PhaseEchelles): ReactNode {
  return (
    <span className="equation-box-termes">
      {formatReponseAttenduePhaseLatex(e, phase).map((frag, i) => (
        <Katex key={i} expression={frag} />
      ))}
    </span>
  );
}

export function App6gen90() {
  const [etat, setEtat] = useState<EtatSessionEchelles>(sessionInitiale);
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

  function terminerEtape(nouvelEtat: EtatSessionEchelles, valeurs: string[]) {
    const transition = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee || nouvelEtat.exerciceCourant !== etat.exerciceCourant;
    if (!transition) {
      setEtat(nouvelEtat);
      return;
    }
    const revele = nouvelEtat.derniereTransitionRevelee;
    setHistorique((h) => [...h, { titre: LIBELLE_PHASE[phase], votreReponse: votreReponse(valeurs), correcte: !revele, reponseAttendue: revele ? reponseAttendue(exercice, phase) : undefined }]);
    setEnAttente({ etatSuivant: nouvelEtat, revele });
  }

  function reinitialiser(nouvelEtat: EtatSessionEchelles) {
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
    reinitialiser(demarrerSessionEchelles(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteEchelles)));
  }

  // Hook DEV-ONLY (même garde que `SelecteurVarianteDev`) : exercice tiré exposé pour Playwright.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen90?: unknown }).__debug6gen90 = { exercice, phase };
  }

  const choix = estPhaseChoix(phase);
  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttendue(exercice, phase),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
        ...(choix ? { messageRevele: "Ce n'était pas la bonne relation (une seule tentative sur un choix fermé)." } : {}),
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Échelles logarithmiques : rapports et sommes</h1>
        <p className="app-subtitle">Chapitre 3 — Fonctions logarithmes</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionEchelles(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifEchelles(etat)} />
        <EtapeAccumulerGrandeur
          key={`${compteur}-${phase}`}
          consigneGenerale={consigneGenerale(exercice)}
          blocDonnees={blocDonnees(exercice)}
          figureSvg={null}
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
        {!choix && <CalculatriceScientifique />}
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}

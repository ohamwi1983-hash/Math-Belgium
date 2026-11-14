import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import type { ExerciceEncadrerIntegrales } from "./core6e/encadrerIntegrales.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEncadrerIntegrales } from "./generateurs6e/encadrerIntegrales";
import type { IdVarianteEncadrerIntegrales } from "./generateurs6e/encadrerIntegrales";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionEncadrerIntegrales, soumettreReponseEcran } from "./moteur6e/sessionEncadrerIntegrales";
import { estPhaseChoix } from "./moteur6e/typesEncadrerIntegrales";
import type { EtatSessionEncadrerIntegrales, PhaseEncadrerIntegrales } from "./moteur6e/typesEncadrerIntegrales";
import { diagnostiquerChamps, messageSpecifique } from "./moteur6e/verificationEncadrerIntegrales";
import { Katex } from "./components/Katex";
import { RenduFragments } from "./components/RenduFragments";
import { EtapeEncadrerIntegrales } from "./components6e/EtapeEncadrerIntegrales";
import type { ModeEcranEncadrer } from "./components6e/EtapeEncadrerIntegrales";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import {
  aideNiveau1,
  aideNiveau2,
  blocDonnees,
  champsEcran,
  consigneEcran,
  consigneGenerale,
  formatReponseAttendueLatex,
  fragmentsOption,
  libellePhase,
  optionCorrecteFragments,
  optionsEcran,
} from "./ui6e/formatEncadrerIntegrales";
import { figureCorrigeSvg, figureEcranSvg } from "./ui6e/figureEncadrerIntegrales";
import { calculerRecapitulatifEncadrerIntegrales, calculerSegmentsProgressionEncadrerIntegrales } from "./ui6e/recapitulatifEncadrerIntegrales";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";

/**
 * `6gen79` — « Comparer et encadrer des intégrales » (chapitre 4, section `integralesdefinies`,
 * processus 2). Signe d'une intégrale sans la calculer, comparaison de deux intégrales, encadrement
 * par m(b − a) et M(b − a), encadrement d'une valeur moyenne. Même patron que `App6gen76.tsx`
 * (choix fermés et champs libres dans une seule chaîne d'écrans) ; le `?code=` (QR code des
 * feuilles) rejoue l'instance de `generateurs6e/encadrerIntegrales/exportEvaluation.ts` avec les
 * MÊMES fonctions de génération (modèle `App6gen14.tsx`).
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionEncadrerIntegrales {
  return demarrerSessionEncadrerIntegrales(REGLAGES_DEMO, genererExerciceEncadrerIntegrales);
}

/** Première session : le code d'un exercice imprimé (`?code=XXXXXX`) en fixe le PREMIER exercice. */
function sessionInitiale(): EtatSessionEncadrerIntegrales {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionEncadrerIntegrales(REGLAGES_DEMO, () =>
    genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceEncadrerIntegrales, (id) => construireAvecVarianteId(id as IdVarianteEncadrerIntegrales)),
  );
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionEncadrerIntegrales;
  revele: boolean;
}

function modeEcran(e: ExerciceEncadrerIntegrales, phase: PhaseEncadrerIntegrales): ModeEcranEncadrer {
  if (estPhaseChoix(phase)) return { type: "choix", options: optionsEcran(e, phase) };
  return { type: "champs", champs: champsEcran(phase) };
}

function reponseAttendue(e: ExerciceEncadrerIntegrales, phase: PhaseEncadrerIntegrales): ReactNode {
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

export function App6gen79() {
  const [etat, setEtat] = useState<EtatSessionEncadrerIntegrales>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<PhaseEncadrerIntegrales, boolean>>>({});
  /** Compteur d'exercices affichés : entre dans la `key` de l'écran pour vider la saisie à chaque
   * nouvel exercice (« Générer », « Nouvel exercice »), même quand la phase est la même. */
  const [compteur, setCompteur] = useState(0);

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  function votreReponse(valeurs: string[]): ReactNode {
    const mode = modeEcran(exercice, phase);
    if (mode.type === "choix") return <RenduFragments fragments={fragmentsOption(mode.options, valeurs[0])} />;
    return mode.champs.map((c, i) => `${c.label} ${valeurs[i]}`).join(" ; ");
  }

  function terminerEtape(nouvelEtat: EtatSessionEncadrerIntegrales, valeurs: string[]) {
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

  function reinitialiser(nouvelEtat: EtatSessionEncadrerIntegrales) {
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
    reinitialiser(demarrerSessionEncadrerIntegrales(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteEncadrerIntegrales)));
  }

  // Hook DEV-ONLY (même garde que `SelecteurVarianteDev`) : exercice tiré exposé pour Playwright.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen79?: unknown }).__debug6gen79 = { exercice, phase };
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
        <h1 className="app-title">Comparer et encadrer des intégrales</h1>
        <p className="app-subtitle">Chapitre 4 — Intégrales et primitives</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionEncadrerIntegrales(etat, aideParPhase)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifEncadrerIntegrales(etat)} />
        <EtapeEncadrerIntegrales
          key={`${compteur}-${phase}`}
          consigneGenerale={consigneGenerale(exercice)}
          blocDonnees={blocDonnees(exercice)}
          figureSvg={enAttente?.etatSuivant.terminee ? figureCorrigeSvg(exercice) : figureEcranSvg(exercice, phase)}
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

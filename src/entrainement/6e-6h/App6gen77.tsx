import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import type { ExerciceIntegraleGraphique } from "./core6e/integraleGraphique.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceIntegraleGraphique } from "./generateurs6e/integraleGraphique";
import type { IdVarianteIntegraleGraphique } from "./generateurs6e/integraleGraphique";
import { activerAideSuivante, demarrerSessionIntegraleGraphique, niveauAideMaxPhase, soumettreReponseEcran, tentativesMaxCourant } from "./moteur6e/sessionIntegraleGraphique";
import { estPhaseChoix } from "./moteur6e/typesIntegraleGraphique";
import type { EtatSessionIntegraleGraphique, PhaseIntegraleGraphique } from "./moteur6e/typesIntegraleGraphique";
import { diagnostiquerChamps } from "./moteur6e/verificationIntegraleGraphique";
import { Katex } from "./components/Katex";
import { EtapeIntegraleGraphique } from "./components6e/EtapeIntegraleGraphique";
import type { ModeEcranIntegraleGraphique } from "./components6e/EtapeIntegraleGraphique";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { aideNiveau1, aideNiveau2, champsEcran, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex, libellePhase, optionsAbscisses } from "./ui6e/formatIntegraleGraphique";
import { figureIntegraleGraphiqueSvg } from "./ui6e/figureIntegraleGraphique";
import { calculerRecapitulatifIntegraleGraphique, calculerSegmentsProgressionIntegraleGraphique } from "./ui6e/recapitulatifIntegraleGraphique";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";

/**
 * `6gen77` — « L'intégrale lue sur un graphique (aire signée) » (chapitre 4, section
 * `integralesdefinies`, processus 2). Le sens de l'intégrale sans primitive : aires de figures
 * simples comptées négativement sous l'axe, additivité, bornes inversées, aire ≠ intégrale. Même
 * patron que `App6gen76.tsx` ; le `?code=` (QR code des feuilles) rejoue l'instance de
 * `generateurs6e/integraleGraphique/exportEvaluation.ts` avec les MÊMES fonctions de génération.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionIntegraleGraphique {
  return demarrerSessionIntegraleGraphique(REGLAGES_DEMO, genererExerciceIntegraleGraphique);
}

/** Première session : le code d'un exercice imprimé (`?code=XXXXXX`) en fixe le PREMIER exercice. */
function sessionInitiale(): EtatSessionIntegraleGraphique {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionIntegraleGraphique(REGLAGES_DEMO, () =>
    genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceIntegraleGraphique, (id) => construireAvecVarianteId(id as IdVarianteIntegraleGraphique)),
  );
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionIntegraleGraphique;
  revele: boolean;
}

function modeEcran(e: ExerciceIntegraleGraphique, phase: PhaseIntegraleGraphique): ModeEcranIntegraleGraphique {
  return estPhaseChoix(e, phase) ? { type: "abscisses", options: optionsAbscisses(e) } : { type: "champs", champs: champsEcran(e, phase) };
}

function reponseAttendue(e: ExerciceIntegraleGraphique, phase: PhaseIntegraleGraphique): ReactNode {
  return (
    <span className="equation-box-termes">
      {formatReponseAttenduePhaseLatex(e, phase).map((frag, i) => (
        <Katex key={i} expression={frag} />
      ))}
    </span>
  );
}

export function App6gen77() {
  const [etat, setEtat] = useState<EtatSessionIntegraleGraphique>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<PhaseIntegraleGraphique, boolean>>>({});
  /** Compteur d'exercices affichés : entre dans la `key` de l'écran pour vider la saisie à chaque
   * nouvel exercice (« Générer », « Nouvel exercice »), même quand la phase est la même. */
  const [compteur, setCompteur] = useState(0);

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  function votreReponse(valeurs: string[]): ReactNode {
    const mode = modeEcran(exercice, phase);
    if (mode.type === "abscisses") return valeurs[0] ? valeurs[0].split(";").map((x) => `x = ${x.replace("-", "−")}`).join(" ; ") : "—";
    return (
      <span className="equation-box-termes">
        {mode.champs.map((c, i) => (
          <span key={i}>
            {c.labelLatex ? <Katex expression={c.labelLatex} /> : c.label} : {valeurs[i]}
            {i < mode.champs.length - 1 ? " ; " : ""}
          </span>
        ))}
      </span>
    );
  }

  function terminerEtape(nouvelEtat: EtatSessionIntegraleGraphique, valeurs: string[]) {
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

  function reinitialiser(nouvelEtat: EtatSessionIntegraleGraphique) {
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
    reinitialiser(demarrerSessionIntegraleGraphique(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteIntegraleGraphique)));
  }

  // Hook DEV-ONLY (même garde que `SelecteurVarianteDev`) : exercice tiré exposé pour Playwright.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen77?: unknown }).__debug6gen77 = { exercice, phase };
  }

  const choix = estPhaseChoix(exercice, phase);
  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttendue(exercice, phase),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
        ...(choix ? { messageRevele: "Ce n'était pas la bonne sélection (une seule tentative sur un choix fermé)." } : {}),
      }
    : null;

  // Figure de l'énoncé (courbe seule) ; à la fin, celle du corrigé (aires coloriées selon leur signe).
  const fini = !!enAttente?.etatSuivant.terminee;
  const figure = figureIntegraleGraphiqueSvg(exercice, fini);

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">L'intégrale lue sur un graphique</h1>
        <p className="app-subtitle">Chapitre 4 — Intégrales et primitives</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionIntegraleGraphique(etat, aideParPhase)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifIntegraleGraphique(etat)} />
        <EtapeIntegraleGraphique
          key={`${compteur}-${phase}`}
          consigneGenerale={consigneGenerale(exercice)}
          figureSvg={figure}
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
          onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs), valeurs)}
        />
        {fini && <p className="prompt-text" style={{ textAlign: "center" }}>En vert, les aires comptées positivement ; en rouge, celles comptées négativement.</p>}
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}

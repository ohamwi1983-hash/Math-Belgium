import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import type { ExerciceFonctionAire } from "./core6e/fonctionAire.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceFonctionAire } from "./generateurs6e/fonctionAire";
import type { IdVarianteFonctionAire } from "./generateurs6e/fonctionAire";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionFonctionAire, soumettreReponseEcran } from "./moteur6e/sessionFonctionAire";
import { estPhaseChoix } from "./moteur6e/typesFonctionAire";
import type { EtatSessionFonctionAire, PhaseFonctionAire } from "./moteur6e/typesFonctionAire";
import { diagnostiquerChamps } from "./moteur6e/verificationFonctionAire";
import { RenduFragments } from "./components/RenduFragments";
import { EtapeFonctionAire } from "./components6e/EtapeFonctionAire";
import type { ModeEcranFonctionAire } from "./components6e/EtapeFonctionAire";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { aideNiveau1, aideNiveau2, champsEcran, consigneEcran, consigneGenerale, libellePhase, lignesChoix, reponseAttendue } from "./ui6e/formatFonctionAire";
import { figureCandidat, figureCorrigeExercice, figureFonctionF } from "./ui6e/figureFonctionAire";
import { calculerRecapitulatifFonctionAire, calculerSegmentsProgressionFonctionAire } from "./ui6e/recapitulatifFonctionAire";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";

/**
 * `6gen78` — « La fonction aire » (chapitre 4 de 6e, section `integralesdefinies`). Données : la
 * courbe de f sur quadrillage et la borne a ; on étudie A(x) = ∫ₐˣ f(t) dt (valeurs par des aires
 * signées, sens de variation, extremums, A′ = f, reconnaissance du graphique). Même patron que
 * `App6gen76.tsx` ; le `?code=` (QR code des feuilles) rejoue l'instance de
 * `generateurs6e/fonctionAire/exportEvaluation.ts` avec les MÊMES fonctions de génération.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionFonctionAire {
  return demarrerSessionFonctionAire(REGLAGES_DEMO, genererExerciceFonctionAire);
}

/** Première session : le code d'un exercice imprimé (`?code=XXXXXX`) en fixe le PREMIER exercice. */
function sessionInitiale(): EtatSessionFonctionAire {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionFonctionAire(REGLAGES_DEMO, () =>
    genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceFonctionAire, (id) => construireAvecVarianteId(id as IdVarianteFonctionAire)),
  );
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionFonctionAire;
  revele: boolean;
}

function modeEcran(e: ExerciceFonctionAire, phase: PhaseFonctionAire): ModeEcranFonctionAire {
  if (phase === "choixGraphique") return { type: "graphes", graphes: e.ordre.map((indice, i) => ({ id: String(indice), svg: figureCandidat(e, indice, i + 1) })) };
  if (estPhaseChoix(phase)) return { type: "lignes", lignes: lignesChoix(e, phase) };
  return { type: "champs", champs: champsEcran(e, phase) };
}

function reponseAttendueNoeud(e: ExerciceFonctionAire, phase: PhaseFonctionAire): ReactNode {
  return (
    <p className="prompt-text">
      <RenduFragments fragments={reponseAttendue(e, phase)} />
    </p>
  );
}

export function App6gen78() {
  const [etat, setEtat] = useState<EtatSessionFonctionAire>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<PhaseFonctionAire, boolean>>>({});
  /** Entre dans la `key` de l'écran : la saisie repart vide à chaque nouvel exercice. */
  const [compteur, setCompteur] = useState(0);

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
  const mode = modeEcran(exercice, phase);

  function votreReponse(valeurs: string[]): ReactNode {
    if (mode.type === "graphes") return `graphique ${exercice.ordre.indexOf(Number(valeurs[0])) + 1}`;
    if (mode.type === "lignes") {
      return mode.lignes.map((ligne, i) => (
        <span key={i}>
          {i > 0 ? " ; " : ""}
          <RenduFragments fragments={ligne.label} /> : <RenduFragments fragments={ligne.options.find((o) => o.id === valeurs[i])?.fragments ?? []} />
        </span>
      ));
    }
    return mode.champs.map((c, i) => (
      <span key={i}>
        {i > 0 ? " ; " : ""}
        <RenduFragments fragments={c.label} /> {valeurs[i]}
      </span>
    ));
  }

  function terminerEtape(nouvelEtat: EtatSessionFonctionAire, valeurs: string[]) {
    const transition = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee || nouvelEtat.exerciceCourant !== etat.exerciceCourant;
    if (!transition) {
      setEtat(nouvelEtat);
      return;
    }
    const revele = nouvelEtat.derniereTransitionRevelee;
    setAideParPhase((prev) => ({ ...prev, [phase]: etat.niveauAide > 0 }));
    setHistorique((h) => [...h, { titre: libellePhase(exercice, phase), votreReponse: votreReponse(valeurs), correcte: !revele, reponseAttendue: revele ? reponseAttendueNoeud(exercice, phase) : undefined }]);
    setEnAttente({ etatSuivant: nouvelEtat, revele });
  }

  function reinitialiser(nouvelEtat: EtatSessionFonctionAire) {
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
    reinitialiser(demarrerSessionFonctionAire(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteFonctionAire)));
  }

  // Hook DEV-ONLY (même garde que `SelecteurVarianteDev`) : exercice tiré exposé pour Playwright.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen78?: unknown }).__debug6gen78 = { exercice, phase };
  }

  const choix = estPhaseChoix(phase);
  const derniere = enAttente?.etatSuivant.terminee ?? false;
  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttendueNoeud(exercice, phase),
        labelSuivant: derniere ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
        ...(choix ? { messageRevele: "Ce n'était pas la bonne réponse (une seule tentative sur un choix fermé)." } : {}),
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">La fonction aire</h1>
        <p className="app-subtitle">Chapitre 4 — Intégrales et primitives</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionFonctionAire(etat, aideParPhase)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifFonctionAire(etat)} />
        <EtapeFonctionAire
          key={`${compteur}-${phase}`}
          consigneGenerale={consigneGenerale(exercice)}
          figureSvg={figureFonctionF(exercice)}
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
          figureCorrige={derniere ? figureCorrigeExercice(exercice) : null}
          diagnostiquer={(valeurs) => diagnostiquerChamps(exercice, phase, valeurs)}
          onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs), valeurs)}
        />
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}

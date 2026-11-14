import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import type { ExerciceLorenzGini } from "./core6e/lorenzGini";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLorenzGini } from "./generateurs6e/lorenzGini";
import type { IdVarianteLorenzGini } from "./generateurs6e/lorenzGini";
import { activerAideSuivante, demarrerSessionLorenz, niveauAideMaxPhase, soumettreReponseEcran, tentativesMaxCourant } from "./moteur6e/sessionLorenzGini";
import { estPhaseChoix } from "./moteur6e/typesLorenzGini";
import type { EtatSessionLorenz, PhaseLorenz } from "./moteur6e/typesLorenzGini";
import { diagnostiquerChamps, messagePiege } from "./moteur6e/verificationLorenzGini";
import { Katex } from "./components/Katex";
import { RenduFragments } from "./components/RenduFragments";
import { EtapeLorenzGini } from "./components6e/EtapeLorenzGini";
import type { ModeEcranLorenz } from "./components6e/EtapeLorenzGini";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import {
  aideNiveau1,
  aideNiveau2,
  blocDonnees,
  champsEcran,
  consigneEcran,
  consigneGenerale,
  formatReponseAttenduePhaseLatex,
  fragmentsOption,
  libellePhase,
  libellesChamps,
  optionsChoix,
  reponseChoix,
} from "./ui6e/formatLorenzGini";
import { figureEnonceSvg, figuresCorrigeSvg } from "./ui6e/figureLorenzGini";
import { calculerRecapitulatifLorenz, calculerSegmentsProgressionLorenz } from "./ui6e/recapitulatifLorenzGini";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";

/**
 * `6gen82` — « Inégalités de revenus : courbe de Lorenz et coefficient de Gini » (chapitre 4 de 6e,
 * section « problèmes », processus 3 TRANSFÉRER). Trois parcours : lecture (L(p), interprétation,
 * aire, Gini), comparaison (deux pays ou avant/après une réforme : deux aires, deux Gini, verdict),
 * paramètre (a pour un Gini visé). Même patron que `App6gen76.tsx` ; le `?code=` (QR code des
 * feuilles) rejoue l'instance de `generateurs6e/lorenzGini/exportEvaluation.ts` avec les MÊMES
 * fonctions de génération.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionLorenz {
  return demarrerSessionLorenz(REGLAGES_DEMO, genererExerciceLorenzGini);
}

/** Première session : le code d'un exercice imprimé (`?code=XXXXXX`) en fixe le PREMIER exercice. */
function sessionInitiale(): EtatSessionLorenz {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionLorenz(REGLAGES_DEMO, () => genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceLorenzGini, (id) => construireAvecVarianteId(id as IdVarianteLorenzGini)));
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionLorenz;
  revele: boolean;
}

function modeEcran(e: ExerciceLorenzGini, phase: PhaseLorenz): ModeEcranLorenz {
  return estPhaseChoix(phase) ? { type: "choix", options: optionsChoix(e, phase) } : { type: "champs", champs: champsEcran(e, phase) };
}

function reponseAttendue(e: ExerciceLorenzGini, phase: PhaseLorenz): ReactNode {
  if (estPhaseChoix(phase)) {
    return (
      <p className="prompt-text">
        <RenduFragments fragments={reponseChoix(e, phase)} />
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

export function App6gen82() {
  const [etat, setEtat] = useState<EtatSessionLorenz>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<PhaseLorenz, boolean>>>({});
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

  function terminerEtape(nouvelEtat: EtatSessionLorenz, valeurs: string[]) {
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

  function reinitialiser(nouvelEtat: EtatSessionLorenz) {
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
    reinitialiser(demarrerSessionLorenz(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteLorenzGini)));
  }

  // Hook DEV-ONLY (même garde que `SelecteurVarianteDev`) : exercice tiré exposé pour Playwright.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen82?: unknown }).__debug6gen82 = { exercice, phase };
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
        <h1 className="app-title">Courbe de Lorenz et coefficient de Gini</h1>
        <p className="app-subtitle">Chapitre 4 — Intégrales et primitives</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionLorenz(etat, aideParPhase)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifLorenz(etat)} />
        <EtapeLorenzGini
          key={`${compteur}-${phase}`}
          consigneGenerale={consigneGenerale(exercice)}
          blocDonnees={blocDonnees(exercice)}
          figureHtml={figureEnonceSvg(exercice)}
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
          piege={(valeurs) => messagePiege(exercice, phase, valeurs, libellesChamps(exercice))}
          onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs), valeurs)}
        />
        {enAttente?.etatSuivant.terminee && (
          <figure style={{ margin: "1rem 0 0", textAlign: "center" }} aria-label="Aire entre la diagonale et la courbe de Lorenz">
            {figuresCorrigeSvg(exercice).map((svg, i) => (
              <div key={i} style={{ margin: "0 0 8px" }} dangerouslySetInnerHTML={{ __html: svg }} />
            ))}
          </figure>
        )}
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}

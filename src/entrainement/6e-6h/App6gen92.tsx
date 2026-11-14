import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import type { ExerciceGrandsNombres } from "./core6e/grandsNombresLog";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceGrandsNombres } from "./generateurs6e/grandsNombresLog";
import type { IdVarianteGrandsNombres } from "./generateurs6e/grandsNombresLog";
import { activerAideSuivante, demarrerSessionGrandsNombres, niveauAideMaxPhase, soumettreReponseEcran, tentativesMaxCourant } from "./moteur6e/sessionGrandsNombresLog";
import { estPhaseChoix } from "./moteur6e/typesGrandsNombresLog";
import type { EtatSessionGrandsNombres, PhaseGrandsNombres } from "./moteur6e/typesGrandsNombresLog";
import { diagnostiquerChamps, messageIllisible, messagePiege } from "./moteur6e/verificationGrandsNombresLog";
import { RenduFragments } from "./components/RenduFragments";
import { EtapeGrandsNombresLog } from "./components6e/EtapeGrandsNombresLog";
import type { ModeEcranGrandsNombres } from "./components6e/EtapeGrandsNombresLog";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { aideNiveau1, aideNiveau2, champsEcran, consigneEcran, consigneGenerale, fragmentsOption, libellePhase, optionsChoix, reponseFragments } from "./ui6e/formatGrandsNombresLog";
import { calculerRecapitulatifGrandsNombres, calculerSegmentsProgressionGrandsNombres } from "./ui6e/recapitulatifGrandsNombresLog";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";

/**
 * `6gen92` — « Grands nombres et logarithme décimal » (chapitre 3 de 6e, section `proprietes`,
 * processus 3 TRANSFÉRER). Le logarithme décimal pour des nombres trop grands pour la calculatrice :
 * nombre de chiffres, comparaison, écriture scientifique et premier chiffre, temps de calcul d'un
 * algorithme en 2ⁿ opérations. Même patron que `App6gen82.tsx` ; le `?code=` (QR code des feuilles)
 * rejoue l'instance de `generateurs6e/grandsNombresLog/exportEvaluation.ts` avec les MÊMES fonctions
 * de génération.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionGrandsNombres {
  return demarrerSessionGrandsNombres(REGLAGES_DEMO, genererExerciceGrandsNombres);
}

/** Première session : le code d'un exercice imprimé (`?code=XXXXXX`) en fixe le PREMIER exercice. */
function sessionInitiale(): EtatSessionGrandsNombres {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionGrandsNombres(REGLAGES_DEMO, () =>
    genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceGrandsNombres, (id) => construireAvecVarianteId(id as IdVarianteGrandsNombres)),
  );
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionGrandsNombres;
  revele: boolean;
}

function modeEcran(e: ExerciceGrandsNombres, phase: PhaseGrandsNombres): ModeEcranGrandsNombres {
  return estPhaseChoix(phase) ? { type: "choix", options: optionsChoix(e) } : { type: "champs", champs: champsEcran(e, phase) };
}

function reponseAttendue(e: ExerciceGrandsNombres, phase: PhaseGrandsNombres): ReactNode {
  return (
    <span className="prompt-text" style={{ overflowX: "auto", display: "block", maxWidth: "100%" }}>
      <RenduFragments fragments={reponseFragments(e, phase)} />
    </span>
  );
}

export function App6gen92() {
  const [etat, setEtat] = useState<EtatSessionGrandsNombres>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<PhaseGrandsNombres, boolean>>>({});
  /** Compteur d'exercices affichés : entre dans la `key` de l'écran pour vider la saisie à chaque
   * nouvel exercice (« Générer », « Nouvel exercice »), même quand la phase est la même. */
  const [compteur, setCompteur] = useState(0);

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  function votreReponse(valeurs: string[]): ReactNode {
    const mode = modeEcran(exercice, phase);
    if (mode.type === "choix") return <RenduFragments fragments={fragmentsOption(mode.options, valeurs[0])} />;
    return mode.champs.length === 1 ? valeurs[0] : mode.champs.map((c, i) => `${c.label} : ${valeurs[i]}`).join(" ; ");
  }

  function terminerEtape(nouvelEtat: EtatSessionGrandsNombres, valeurs: string[]) {
    const transition = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee || nouvelEtat.exerciceCourant !== etat.exerciceCourant;
    if (!transition) {
      setEtat(nouvelEtat);
      return;
    }
    const revele = nouvelEtat.derniereTransitionRevelee;
    setAideParPhase((prev) => ({ ...prev, [phase]: etat.niveauAide > 0 }));
    setHistorique((h) => [...h, { titre: libellePhase(phase), votreReponse: votreReponse(valeurs), correcte: !revele, reponseAttendue: revele ? reponseAttendue(exercice, phase) : undefined }]);
    setEnAttente({ etatSuivant: nouvelEtat, revele });
  }

  function reinitialiser(nouvelEtat: EtatSessionGrandsNombres) {
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
    reinitialiser(demarrerSessionGrandsNombres(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteGrandsNombres)));
  }

  // Hook DEV-ONLY (même garde que `SelecteurVarianteDev`) : exercice tiré exposé pour Playwright.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen92?: unknown }).__debug6gen92 = { exercice, phase };
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
        <h1 className="app-title">Grands nombres et logarithme décimal</h1>
        <p className="app-subtitle">Chapitre 3 — Fonctions logarithmes</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionGrandsNombres(etat, aideParPhase)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifGrandsNombres(etat)} />
        <EtapeGrandsNombresLog
          key={`${compteur}-${phase}`}
          consigneGenerale={consigneGenerale(exercice)}
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
          piege={(valeurs) => messagePiege(exercice, phase, valeurs)}
          messageIllisible={messageIllisible}
          onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs), valeurs)}
        />
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}

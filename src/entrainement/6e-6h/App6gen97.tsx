import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import type { ExercicePolygones } from "./core6e/polygonesReguliers.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExercicePolygones } from "./generateurs6e/polygonesReguliers";
import { activerAideSuivante, demarrerSessionPolygones, niveauAideMaxPhase, soumettreReponseEcran, tentativesMaxPhase } from "./moteur6e/sessionPolygonesReguliers";
import { estPhaseChoix } from "./moteur6e/typesPolygonesReguliers";
import type { EtatSessionPolygones, PhasePolygones } from "./moteur6e/typesPolygonesReguliers";
import { diagnosticEcran, messageSaisieNonDecomptee } from "./moteur6e/verificationPolygonesReguliers";
import { Katex } from "./components/Katex";
import { RenduFragments } from "./components/RenduFragments";
import { EtapePolygonesReguliers } from "./components6e/EtapePolygonesReguliers";
import type { ModeEcranPolygones } from "./components6e/EtapePolygonesReguliers";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import {
  LIBELLE_PHASE,
  aideNiveau1,
  aideNiveau2,
  champsEcran,
  consigneEcran,
  consigneGenerale,
  formatReponseAttenduePhaseLatex,
  messageDiagnostic,
  optionsChoix,
  reponseFragments,
} from "./ui6e/formatPolygonesReguliers";
import { figureEcran } from "./ui6e/figurePolygonesReguliers";
import { calculerRecapitulatifPolygones, calculerSegmentsProgressionPolygones } from "./ui6e/recapitulatifPolygonesReguliers";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { correctionDetailleePolygones } from "./generateurs6e/polygonesReguliers/corrigeDetaille";
import { phasesDe } from "./moteur6e/typesPolygonesReguliers";
import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";
import { lettreEtape, lignesDeLEtape } from "../export/corrigeTableau";

/**
 * `6gen97` — « Polygones réguliers et racines n-ièmes » (6e, chapitre 5, section « Racines n-ièmes
 * d'un nombre complexe », processus 3). Trois variantes, chaîne fixe de 4 écrans chacune (voir
 * `moteur6e/typesPolygonesReguliers.ts`). Patron de `App6gen95.tsx`. Le `?code=` (QR code des
 * feuilles) rejoue l'instance de `generateurs6e/polygonesReguliers/exportEvaluation.ts` avec les
 * MÊMES fonctions de génération.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionPolygones {
  return demarrerSessionPolygones(REGLAGES_DEMO, genererExercicePolygones);
}

/** Première session : le code d'un exercice imprimé (`?code=XXXXXX`) en fixe le PREMIER exercice. */
function sessionInitiale(): EtatSessionPolygones {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionPolygones(REGLAGES_DEMO, () => genererAvecCode(code, CATALOGUE_VARIANTES, genererExercicePolygones, (id) => construireAvecVarianteId(id)));
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionPolygones;
  revele: boolean;
}

function modeEcran(e: ExercicePolygones, phase: PhasePolygones): ModeEcranPolygones {
  if (estPhaseChoix(phase)) return { type: "choix", options: optionsChoix(e, phase) };
  return { type: "champs", champs: champsEcran(e, phase) };
}

function reponseAttendue(e: ExercicePolygones, phase: PhasePolygones): ReactNode {
  if (phase === "conclusion") return <RenduFragments fragments={reponseFragments(e, phase)} />;
  return <Katex expression={formatReponseAttenduePhaseLatex(e, phase).join(",\\quad ")} />;
}

export function App6gen97() {
  const [etat, setEtat] = useState<EtatSessionPolygones>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Compteur d'exercices affichés : entre dans la `key` de l'écran pour vider la saisie à chaque
   * nouvel exercice (« Générer », « Nouvel exercice »), même quand la phase est la même. */
  const [compteur, setCompteur] = useState(0);

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  function votreReponse(valeurs: string[]): ReactNode {
    if (estPhaseChoix(phase)) {
      const option = optionsChoix(exercice, phase).find((o) => o.id === valeurs[0]);
      return option ? <RenduFragments fragments={option.fragments} /> : "?";
    }
    return valeurs.join(" ; ");
  }

  function terminerEtape(nouvelEtat: EtatSessionPolygones, valeurs: string[]) {
    const transition = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee || nouvelEtat.exerciceCourant !== etat.exerciceCourant;
    if (!transition) {
      setEtat(nouvelEtat);
      return;
    }
    const revele = nouvelEtat.derniereTransitionRevelee;
    setHistorique((h) => [...h, { titre: LIBELLE_PHASE[phase], votreReponse: votreReponse(valeurs), correcte: !revele, reponseAttendue: revele ? reponseAttendue(exercice, phase) : undefined }]);
    setEnAttente({ etatSuivant: nouvelEtat, revele });
  }

  function reinitialiser(nouvelEtat: EtatSessionPolygones) {
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
    reinitialiser(demarrerSessionPolygones(REGLAGES_DEMO, () => construireAvecVarianteId(id)));
  }

  // Hook DEV-ONLY (même garde que `SelecteurVarianteDev`) : exercice tiré exposé pour Playwright.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen97?: unknown }).__debug6gen97 = { exercice, phase };
  }

  const choix = estPhaseChoix(phase);
  const validation = enAttente
    ? {
        revele: enAttente.revele,
        corrigeDetaille: <CorrigeDetailleEcran etapes={lignesDeLEtape(correctionDetailleePolygones(exercice), lettreEtape(phasesDe(exercice).indexOf(phase)))} />,
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
        <h1 className="app-title">Polygones réguliers et racines n-ièmes</h1>
        <p className="app-subtitle">Chapitre 5 — Nombres complexes</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionPolygones(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifPolygones(etat)} />
        <EtapePolygonesReguliers
          key={`${compteur}-${phase}`}
          consigneGenerale={consigneGenerale(exercice)}
          consigneEcran={consigneEcran(exercice, phase)}
          figure={figureEcran(exercice, phase, enAttente !== null)}
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
          diagnostic={(valeurs) => {
            const id = diagnosticEcran(exercice, phase, valeurs);
            return id === null ? null : messageDiagnostic(exercice, phase, id);
          }}
          onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs), valeurs)}
        />
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}

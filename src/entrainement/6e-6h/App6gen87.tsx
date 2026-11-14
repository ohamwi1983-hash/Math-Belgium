import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import type { ExerciceTangentesLog } from "./core6e/tangentesLogarithmiques.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceTangentesLog } from "./generateurs6e/tangentesLogarithmiques";
import type { IdVarianteTangentesLog } from "./generateurs6e/tangentesLogarithmiques";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionTangentesLog, soumettreReponseEcran } from "./moteur6e/sessionTangentesLogarithmiques";
import { estPhaseListe } from "./moteur6e/typesTangentesLogarithmiques";
import type { EtatSessionTangentesLog, PhaseTangentesLog } from "./moteur6e/typesTangentesLogarithmiques";
import { diagnostiquerChamps, messageSpecifique } from "./moteur6e/verificationTangentesLogarithmiques";
import { Katex } from "./components/Katex";
import { EtapeTangentesLogarithmiques } from "./components6e/EtapeTangentesLogarithmiques";
import type { ModeEcranTangentes } from "./components6e/EtapeTangentesLogarithmiques";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import {
  aideNiveau1,
  aideNiveau2,
  blocDonnees,
  champsEcran,
  consigneEcran,
  consigneGenerale,
  formatReponseAttendueLatex,
  libellePhase,
} from "./ui6e/formatTangentesLogarithmiques";
import { figureTangentesSvg } from "./ui6e/figureTangentesLogarithmiques";
import { calculerRecapitulatifTangentesLog, calculerSegmentsProgressionTangentesLog } from "./ui6e/recapitulatifTangentesLogarithmiques";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";

/**
 * `6gen87` — « Tangentes aux courbes logarithmiques » (chapitre 3, section `derivee`, processus 2).
 * Tangente en un point, tangente(s) parallèle(s) à une droite, tangente passant par un point
 * extérieur P(0 ; p). Même patron que `App6gen79.tsx` (champs libres, 3 tentatives) ; le `?code=`
 * (QR code des feuilles) rejoue l'instance de `generateurs6e/tangentesLogarithmiques/exportEvaluation.ts`
 * avec les MÊMES fonctions de génération (modèle `App6gen14.tsx`). La figure montre la courbe seule
 * pendant l'exercice, la courbe et la ou les tangentes une fois l'exercice terminé.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionTangentesLog {
  return demarrerSessionTangentesLog(REGLAGES_DEMO, genererExerciceTangentesLog);
}

/** Première session : le code d'un exercice imprimé (`?code=XXXXXX`) en fixe le PREMIER exercice. */
function sessionInitiale(): EtatSessionTangentesLog {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionTangentesLog(REGLAGES_DEMO, () =>
    genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceTangentesLog, (id) => construireAvecVarianteId(id as IdVarianteTangentesLog)),
  );
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionTangentesLog;
  revele: boolean;
}

function modeEcran(e: ExerciceTangentesLog, phase: PhaseTangentesLog): ModeEcranTangentes {
  if (estPhaseListe(phase)) return { type: "liste", champ: champsEcran(e, phase)[0], labelAjout: "Ajouter une valeur" };
  return { type: "champs", champs: champsEcran(e, phase) };
}

function reponseAttendue(e: ExerciceTangentesLog, phase: PhaseTangentesLog): ReactNode {
  return (
    <span className="equation-box-termes">
      {formatReponseAttendueLatex(e, phase).map((frag, i) => (
        <Katex key={i} expression={frag} />
      ))}
    </span>
  );
}

export function App6gen87() {
  const [etat, setEtat] = useState<EtatSessionTangentesLog>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<PhaseTangentesLog, boolean>>>({});
  /** Compteur d'exercices affichés : entre dans la `key` de l'écran pour vider la saisie à chaque
   * nouvel exercice (« Générer », « Nouvel exercice »), même quand la phase est la même. */
  const [compteur, setCompteur] = useState(0);

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  function votreReponse(valeurs: string[]): ReactNode {
    const mode = modeEcran(exercice, phase);
    if (mode.type === "liste") return valeurs.join(" ; ");
    return mode.champs.map((c, i) => `${c.label} ${valeurs[i]}`).join(" ; ");
  }

  function terminerEtape(nouvelEtat: EtatSessionTangentesLog, valeurs: string[]) {
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

  function reinitialiser(nouvelEtat: EtatSessionTangentesLog) {
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
    reinitialiser(demarrerSessionTangentesLog(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteTangentesLog)));
  }

  // Hook DEV-ONLY (même garde que `SelecteurVarianteDev`) : exercice tiré exposé pour Playwright.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen87?: unknown }).__debug6gen87 = { exercice, phase };
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttendue(exercice, phase),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Tangentes aux courbes logarithmiques</h1>
        <p className="app-subtitle">Chapitre 3 — Fonctions logarithmes</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionTangentesLog(etat, aideParPhase)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifTangentesLog(etat)} />
        <EtapeTangentesLogarithmiques
          key={`${compteur}-${phase}`}
          consigneGenerale={consigneGenerale(exercice)}
          blocDonnees={blocDonnees(exercice)}
          figureSvg={figureTangentesSvg(exercice, !!enAttente?.etatSuivant.terminee)}
          consigneEcran={consigneEcran(exercice, phase)}
          mode={modeEcran(exercice, phase)}
          aideNiveau1={aideNiveau1(exercice, phase)}
          aideNiveau2={aideNiveau2(exercice, phase)}
          tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
          tentativesMax={etat.reglages.tentativesMax}
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

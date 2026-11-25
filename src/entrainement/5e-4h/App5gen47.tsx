import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { anneeDuRang } from "./core5e/modeliserSuite";
import type { ExerciceModeliserSuite } from "./core5e/modeliserSuite";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceModeliserSuite } from "./generateurs5e/modeliserSuite";
import type { IdVarianteModeliserSuite } from "./generateurs5e/modeliserSuite";
import { activerAideSuivante, demarrerSessionModeliserSuite, niveauAideMaxPhase, soumettreReponseEcran, tentativesMaxCourant } from "./moteur5e/sessionModeliserSuite";
import { estPhaseChoix, phasesPourExercice } from "./moteur5e/typesModeliserSuite";
import type { EtatSessionModeliserSuite, PhaseModeliserSuite } from "./moteur5e/typesModeliserSuite";
import { diagnostiquerChamps, messageIllisible, messagePiege } from "./moteur5e/verificationModeliserSuite";
import { EtapeModeliserSuite, FragmentsModelisation } from "./components5e/EtapeModeliserSuite";
import type { ModeEcranModeliserSuite } from "./components5e/EtapeModeliserSuite";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import { RecapitulatifPanel } from "./components5e/RecapitulatifPanel";
import {
  aideNiveau1,
  aideNiveau2,
  champsEcran,
  consigneEcran,
  consigneGenerale,
  explicationVerdictFaux,
  fragmentsOption,
  libellePhase,
  optionsChoix,
  reponseFragments,
} from "./ui5e/formatModeliserSuite";
import { calculerRecapitulatifModeliserSuite, calculerSegmentsProgressionModeliserSuite } from "./ui5e/recapitulatifModeliserSuite";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { correctionDetailleeModeliserSuite } from "./generateurs5e/modeliserSuite/corrigeDetaille";
import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";
import { lettreEtape, lignesDeLEtape } from "../export/corrigeTableau";

/**
 * `5gen47` — « Modéliser une situation par une suite » (chapitre 3 de 5e « Suites », section
 * `problemes-classiques`, processus 3 TRANSFÉRER). Une situation concrète évolue chaque année d'une
 * quantité ou d'un pourcentage constant : nature de la suite (choix fermé), u₁ selon la convention
 * de rang de l'énoncé, raison (r, ou q = 1 ± t/100), puis la question posée (une année → son rang
 * et son terme ; un total → N et S_N ; un seuil → tableau de valeurs et première année). Même patron
 * que `App5gen44.tsx` ; le `?code=` (QR code des feuilles) rejoue l'instance de
 * `generateurs5e/modeliserSuite/exportEvaluation.ts` avec les MÊMES fonctions de génération.
 */

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionModeliserSuite {
  return demarrerSessionModeliserSuite(REGLAGES_DEMO, genererExerciceModeliserSuite);
}

/** Première session : le code d'un exercice imprimé (`?code=XXXXXX`) en fixe le PREMIER exercice. */
function sessionInitiale(): EtatSessionModeliserSuite {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionModeliserSuite(REGLAGES_DEMO, () =>
    genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceModeliserSuite, (id) => construireAvecVarianteId(id as IdVarianteModeliserSuite)),
  );
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionModeliserSuite;
  revele: boolean;
  /** Explication d'un verdict faux (choix fermé, une seule tentative). */
  explication: string | null;
}

function modeEcran(e: ExerciceModeliserSuite, phase: PhaseModeliserSuite): ModeEcranModeliserSuite {
  if (estPhaseChoix(phase)) return { type: "choix", options: optionsChoix() };
  if (phase === "tableau" && e.variante === "seuil") {
    const champs = champsEcran(e, phase);
    return { type: "tableau", unite: e.contexte.unite, lignes: e.rangsTable.map((rang, i) => ({ rang, annee: anneeDuRang(e, rang), champ: champs[i] })) };
  }
  return { type: "champs", champs: champsEcran(e, phase) };
}

function reponseAttendue(e: ExerciceModeliserSuite, phase: PhaseModeliserSuite): ReactNode {
  return (
    <span className="prompt-text" style={{ overflowX: "auto", display: "block", maxWidth: "100%" }}>
      <FragmentsModelisation fragments={reponseFragments(e, phase)} />
    </span>
  );
}

export function App5gen47() {
  const [etat, setEtat] = useState<EtatSessionModeliserSuite>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<PhaseModeliserSuite, boolean>>>({});
  /** Compteur d'exercices affichés : entre dans la `key` de l'écran pour vider la saisie à chaque
   * nouvel exercice (« Générer », « Nouvel exercice »), même quand la phase est la même. */
  const [compteur, setCompteur] = useState(0);

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  function votreReponse(valeurs: string[]): ReactNode {
    const mode = modeEcran(exercice, phase);
    if (mode.type === "choix") return <FragmentsModelisation fragments={fragmentsOption(mode.options, valeurs[0])} />;
    if (mode.type === "tableau") return mode.lignes.map((ligne, i) => `u${ligne.rang} : ${valeurs[i]}`).join(" ; ");
    return mode.champs.length === 1 ? valeurs[0] : mode.champs.map((c, i) => `${c.label} : ${valeurs[i]}`).join(" ; ");
  }

  function terminerEtape(nouvelEtat: EtatSessionModeliserSuite, valeurs: string[]) {
    const transition = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee || nouvelEtat.exerciceCourant !== etat.exerciceCourant;
    if (!transition) {
      setEtat(nouvelEtat);
      return;
    }
    const revele = nouvelEtat.derniereTransitionRevelee;
    const explication = revele && estPhaseChoix(phase) ? explicationVerdictFaux(exercice) : null;
    setAideParPhase((prev) => ({ ...prev, [phase]: etat.niveauAide > 0 }));
    setHistorique((h) => [...h, { corrigeDetaille: corrigeDetailleEcranCourant(), titre: libellePhase(exercice, phase), votreReponse: votreReponse(valeurs), correcte: !revele, reponseAttendue: revele ? reponseAttendue(exercice, phase) : undefined }]);
    setEnAttente({ etatSuivant: nouvelEtat, revele, explication });
  }

  function reinitialiser(nouvelEtat: EtatSessionModeliserSuite) {
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
    reinitialiser(demarrerSessionModeliserSuite(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteModeliserSuite)));
  }

  // Hook DEV-ONLY (même garde que `SelecteurVarianteDev`) : exercice tiré exposé pour Playwright.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug5gen47?: unknown }).__debug5gen47 = { exercice, phase };
  }

  const choix = estPhaseChoix(phase);

  /** Corrigé détaillé « comme au tableau » de l'écran en cours — UNE seule source pour la validation
   * (après la réponse) et pour l'entrée d'historique de l'étape (fiche de sa puce). */
  function corrigeDetailleEcranCourant() {
    return <CorrigeDetailleEcran etapes={lignesDeLEtape(correctionDetailleeModeliserSuite(exercice), lettreEtape(phasesPourExercice(exercice).indexOf(phase)))} />;
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttendue(exercice, phase),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
        // Corrigé détaillé « comme au tableau » de l'étape (même source que le papier,
        // `generateurs5e/modeliserSuite/corrigeDetaille.ts`), affiché sous la réponse attendue quand elle est révélée.
        corrigeDetaille: corrigeDetailleEcranCourant(),
        ...(choix ? { messageRevele: `Ce n'était pas le bon type de suite (une seule tentative sur un choix fermé).${enAttente.explication ? ` ${enAttente.explication}` : ""}` } : {}),
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Modéliser une situation par une suite</h1>
        <p className="app-subtitle">Chapitre 3 — Suites</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionModeliserSuite(etat, aideParPhase)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifModeliserSuite(etat)} />
        <EtapeModeliserSuite
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
          messageIllisible={messageIllisible(phase)}
          onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs), valeurs)}
        />
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}

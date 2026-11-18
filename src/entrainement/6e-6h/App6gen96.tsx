import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceImpedances } from "./generateurs6e/impedancesComplexes";
import type { IdVarianteImpedances } from "./generateurs6e/impedancesComplexes";
import { activerAideSuivante, demarrerSessionImpedances, niveauAideMaxPhase, soumettreReponseEcran, tentativesMaxPhase } from "./moteur6e/sessionImpedances";
import { estPhaseChoix } from "./moteur6e/typesImpedances";
import type { EtatSessionImpedances, PhaseImpedances } from "./moteur6e/typesImpedances";
import { controleAvantSoumission, diagnostiquerChamps, messagePiege } from "./moteur6e/verificationImpedances";
import { RenduFragments } from "./components/RenduFragments";
import { EtapeImpedances } from "./components6e/EtapeImpedances";
import type { ModeEcranImpedances } from "./components6e/EtapeImpedances";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { NOM_NATURE, OPTIONS_NATURE, aideNiveau1, aideNiveau2, champsEcran, consigneEcran, consigneGenerale, libellePhase, reponseFragments } from "./ui6e/formatImpedances";
import { schemaCircuitSvg } from "./ui6e/schemaCircuitImpedances";
import { calculerRecapitulatifImpedances, calculerSegmentsProgressionImpedances } from "./ui6e/recapitulatifImpedances";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import type { NatureCircuit } from "./core6e/impedancesComplexes";
import { correctionDetailleeImpedances } from "./generateurs6e/impedancesComplexes/corrigeDetaille";
import { PHASES_IMPEDANCES } from "./moteur6e/typesImpedances";
import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";
import { lettreEtape, lignesDeLEtape } from "../export/corrigeTableau";

/**
 * `6gen96` — « Électricité : impédances complexes » (chapitre 5 de 6e, « Nombres complexes »,
 * section `problemesavances`, processus 3 TRANSFÉRER). Circuit série RL/RC, série RLC ou deux
 * branches en parallèle : impédance de chaque composant (notation j des électriciens), impédance
 * totale sous forme algébrique, module et déphasage, intensité efficace, puis nature du circuit
 * (choix fermé, une tentative). Même patron que `App6gen94.tsx` (écrans à champs libres) et
 * `App6gen95.tsx` (choix fermé à une tentative). Le `?code=` (QR code des feuilles) rejoue
 * l'instance de `generateurs6e/impedancesComplexes/exportEvaluation.ts` avec les MÊMES fonctions.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionImpedances {
  return demarrerSessionImpedances(REGLAGES_DEMO, genererExerciceImpedances);
}

/** Première session : le code d'un exercice imprimé (`?code=XXXXXX`) en fixe le PREMIER exercice. */
function sessionInitiale(): EtatSessionImpedances {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionImpedances(REGLAGES_DEMO, () =>
    genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceImpedances, (id) => construireAvecVarianteId(id as IdVarianteImpedances)),
  );
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionImpedances;
  revele: boolean;
}

export function App6gen96() {
  const [etat, setEtat] = useState<EtatSessionImpedances>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<PhaseImpedances, boolean>>>({});
  /** Compteur d'exercices affichés : entre dans la `key` de l'écran pour vider la saisie à chaque
   * nouvel exercice (« Générer », « Nouvel exercice »), même quand la phase est la même. */
  const [compteur, setCompteur] = useState(0);

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
  const champs = champsEcran(exercice, phase);
  const mode: ModeEcranImpedances = estPhaseChoix(phase) ? { type: "choix", options: OPTIONS_NATURE } : { type: "champs", champs };

  function reponseAttendue(): ReactNode {
    return (
      <span className="prompt-text" style={{ overflowX: "auto", display: "block", maxWidth: "100%" }}>
        <RenduFragments fragments={reponseFragments(exercice, phase)} />
      </span>
    );
  }

  function votreReponse(valeurs: string[]): ReactNode {
    if (estPhaseChoix(phase)) return `circuit ${NOM_NATURE[valeurs[0] as NatureCircuit] ?? valeurs[0]}`;
    return champs.map((c, i) => `${c.label} : ${valeurs[i]}`).join(" ; ");
  }

  function terminerEtape(nouvelEtat: EtatSessionImpedances, valeurs: string[]) {
    const transition = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee || nouvelEtat.exerciceCourant !== etat.exerciceCourant;
    if (!transition) {
      setEtat(nouvelEtat);
      return;
    }
    const revele = nouvelEtat.derniereTransitionRevelee;
    setAideParPhase((prev) => ({ ...prev, [phase]: etat.niveauAide > 0 }));
    setHistorique((h) => [...h, { titre: libellePhase(phase), votreReponse: votreReponse(valeurs), correcte: !revele, reponseAttendue: revele ? reponseAttendue() : undefined }]);
    setEnAttente({ etatSuivant: nouvelEtat, revele });
  }

  function reinitialiser(nouvelEtat: EtatSessionImpedances) {
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
    reinitialiser(demarrerSessionImpedances(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteImpedances)));
  }

  // Hook DEV-ONLY (même garde que `SelecteurVarianteDev`) : exercice tiré exposé pour Playwright.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen96?: unknown }).__debug6gen96 = { exercice, phase };
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        corrigeDetaille: <CorrigeDetailleEcran etapes={lignesDeLEtape(correctionDetailleeImpedances(exercice), lettreEtape(PHASES_IMPEDANCES.indexOf(phase)))} />,
        reponseAttendue: reponseAttendue(),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Électricité : impédances complexes</h1>
        <p className="app-subtitle">Chapitre 5 — Nombres complexes</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionImpedances(etat, aideParPhase)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifImpedances(etat)} />
        <EtapeImpedances
          key={`${compteur}-${phase}`}
          consigneGenerale={consigneGenerale(exercice)}
          schemaSvg={schemaCircuitSvg(exercice)}
          consigneEcran={consigneEcran(exercice, phase)}
          mode={mode}
          aideNiveau1={aideNiveau1(exercice, phase)}
          aideNiveau2={aideNiveau2(exercice, phase)}
          tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
          tentativesMax={tentativesMaxPhase(etat)}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMaxPhase(phase)}
          onActiverAide={() => setEtat(activerAideSuivante(etat))}
          validation={validation}
          diagnostiquer={(valeurs) => diagnostiquerChamps(exercice, phase, valeurs)}
          controle={(valeurs) => controleAvantSoumission(exercice, phase, valeurs)}
          piege={(valeurs) => messagePiege(exercice, phase, valeurs)}
          onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs), valeurs)}
        />
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}

import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLinearisation } from "./generateurs6e/linearisationEuler";
import type { IdVarianteLinearisation } from "./generateurs6e/linearisationEuler";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionLinearisation, soumettreReponseEcran } from "./moteur6e/sessionLinearisationEuler";
import type { EtatSessionLinearisation, PhaseLinearisation } from "./moteur6e/typesLinearisationEuler";
import { controleAvantSoumission, diagnostiquerChamps, messagePiege } from "./moteur6e/verificationLinearisationEuler";
import { RenduFragments } from "./components/RenduFragments";
import { EtapeLinearisationEuler } from "./components6e/EtapeLinearisationEuler";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { aideNiveau1, aideNiveau2, champsEcran, consigneEcran, consigneGenerale, libellePhase, reponseFragments } from "./ui6e/formatLinearisationEuler";
import { calculerRecapitulatifLinearisation, calculerSegmentsProgressionLinearisation } from "./ui6e/recapitulatifLinearisationEuler";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { correctionDetailleeLinearisation } from "./generateurs6e/linearisationEuler/corrigeDetaille";
import { phasesPourExercice as phasesLinearisation } from "./moteur6e/typesLinearisationEuler";
import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";
import { lettreEtape, lignesDeLEtape } from "../export/corrigeTableau";

/**
 * `6gen93` — « Linéariser avec les formules d'Euler » (chapitre 5 de 6e, « Nombres complexes »,
 * section `formulemoivre`, processus 2 APPLIQUER). Linéariser cosᵖx·sinᑫx en quatre écrans (facteur
 * K d'Euler, binôme, regroupement en 2cos(kx) ou 2i sin(kx), forme linéarisée) ; variante
 * « application » : linéariser, en déduire une primitive puis une intégrale exacte. Même patron que
 * `App6gen92.tsx` ; le `?code=` (QR code des feuilles) rejoue l'instance de
 * `generateurs6e/linearisationEuler/exportEvaluation.ts` avec les MÊMES fonctions de génération.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionLinearisation {
  return demarrerSessionLinearisation(REGLAGES_DEMO, genererExerciceLinearisation);
}

/** Première session : le code d'un exercice imprimé (`?code=XXXXXX`) en fixe le PREMIER exercice. */
function sessionInitiale(): EtatSessionLinearisation {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionLinearisation(REGLAGES_DEMO, () =>
    genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceLinearisation, (id) => construireAvecVarianteId(id as IdVarianteLinearisation)),
  );
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionLinearisation;
  revele: boolean;
}

export function App6gen93() {
  const [etat, setEtat] = useState<EtatSessionLinearisation>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<PhaseLinearisation, boolean>>>({});
  /** Compteur d'exercices affichés : entre dans la `key` de l'écran pour vider la saisie à chaque
   * nouvel exercice (« Générer », « Nouvel exercice »), même quand la phase est la même. */
  const [compteur, setCompteur] = useState(0);

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
  const champs = champsEcran(exercice, phase);

  function reponseAttendue(): ReactNode {
    return (
      <span className="prompt-text" style={{ overflowX: "auto", display: "block", maxWidth: "100%" }}>
        <RenduFragments fragments={reponseFragments(exercice, phase)} />
      </span>
    );
  }

  function votreReponse(valeurs: string[]): ReactNode {
    return champs.length === 1 ? valeurs[0] : champs.map((c, i) => `${c.label} : ${valeurs[i]}`).join(" ; ");
  }

  function terminerEtape(nouvelEtat: EtatSessionLinearisation, valeurs: string[]) {
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

  function reinitialiser(nouvelEtat: EtatSessionLinearisation) {
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
    reinitialiser(demarrerSessionLinearisation(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteLinearisation)));
  }

  // Hook DEV-ONLY (même garde que `SelecteurVarianteDev`) : exercice tiré exposé pour Playwright.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen93?: unknown }).__debug6gen93 = { exercice, phase };
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        corrigeDetaille: <CorrigeDetailleEcran etapes={lignesDeLEtape(correctionDetailleeLinearisation(exercice), lettreEtape(phasesLinearisation(exercice).indexOf(phase)))} />,
        reponseAttendue: reponseAttendue(),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Linéariser avec les formules d'Euler</h1>
        <p className="app-subtitle">Chapitre 5 — Nombres complexes</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionLinearisation(etat, aideParPhase)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifLinearisation(etat)} />
        <EtapeLinearisationEuler
          key={`${compteur}-${phase}`}
          consigneGenerale={consigneGenerale(exercice)}
          consigneEcran={consigneEcran(exercice, phase)}
          champs={champs}
          aideNiveau1={aideNiveau1(exercice, phase)}
          aideNiveau2={aideNiveau2(exercice, phase)}
          tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
          tentativesMax={etat.reglages.tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={NIVEAU_AIDE_MAX}
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

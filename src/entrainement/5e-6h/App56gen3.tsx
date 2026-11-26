// Copie 5e (6h) de `5e-4h/App5gen44.tsx` (56gen3 ← 5gen44, chantier D du 26/11/2026) — copiée pour que les deux années puissent diverger.
import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession5e } from "../5e-4h/core5e/session5e.types";
import type { ExerciceDefinirSuite } from "./generateurs56/definirSuite/core/definirSuite";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceDefinirSuite } from "./generateurs56/definirSuite";
import type { IdVarianteDefinirSuite } from "./generateurs56/definirSuite";
import { activerAideSuivante, demarrerSessionDefinirSuite, niveauAideMaxPhase, soumettreReponseEcran, tentativesMaxCourant } from "./generateurs56/definirSuite/moteur/sessionDefinirSuite";
import { estPhaseChoix, phasesPourExercice } from "./generateurs56/definirSuite/moteur/typesDefinirSuite";
import type { EtatSessionDefinirSuite, PhaseDefinirSuite } from "./generateurs56/definirSuite/moteur/typesDefinirSuite";
import { diagnostiquerChamps, explicationVerdictFaux, messageIllisible, messagePiege } from "./generateurs56/definirSuite/moteur/verificationDefinirSuite";
import { EtapeDefinirSuite, RenduFragments5e } from "./generateurs56/definirSuite/composants/EtapeDefinirSuite";
import type { ModeEcranDefinirSuite } from "./generateurs56/definirSuite/composants/EtapeDefinirSuite";
import { SelecteurVarianteDev } from "../5e-4h/components5e/SelecteurVarianteDev";
import { aideNiveau1, aideNiveau2, champsEcran, consigneEcran, consigneGenerale, fragmentsOption, libellePhase, optionsChoix, reponseFragments } from "./generateurs56/definirSuite/ui/formatDefinirSuite";
import { calculerRecapitulatifDefinirSuite, calculerSegmentsProgressionDefinirSuite } from "./generateurs56/definirSuite/ui/recapitulatifDefinirSuite";
import { RecapitulatifPanel } from "../5e-4h/components5e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { correctionDetailleeDefinirSuite } from "./generateurs56/definirSuite/corrigeDetaille";
import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";
import { lettreEtape, lignesDeLEtape } from "../export/corrigeTableau";

/**
 * `5gen44` — « Définir et reconnaître une suite » (chapitre 3 de 5e, section `suites-geometriques`,
 * processus 2 APPLIQUER). Notations uₙ₊₁ / u₂ₙ / uₙ₋₁ et calcul d'un terme, termes d'une récurrence
 * non affine, nature d'une suite (formule explicite, récurrence, liste de termes). Même patron que
 * `App6gen92.tsx` ; le `?code=` (QR code des feuilles) rejoue l'instance de
 * `generateurs5e/definirSuite/exportEvaluation.ts` avec les MÊMES fonctions de génération.
 */

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionDefinirSuite {
  return demarrerSessionDefinirSuite(REGLAGES_DEMO, genererExerciceDefinirSuite);
}

/** Première session : le code d'un exercice imprimé (`?code=XXXXXX`) en fixe le PREMIER exercice. */
function sessionInitiale(): EtatSessionDefinirSuite {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionDefinirSuite(REGLAGES_DEMO, () =>
    genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceDefinirSuite, (id) => construireAvecVarianteId(id as IdVarianteDefinirSuite)),
  );
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionDefinirSuite;
  revele: boolean;
  /** Explication d'un verdict faux (choix fermé, une seule tentative). */
  explication: string | null;
}

function modeEcran(e: ExerciceDefinirSuite, phase: PhaseDefinirSuite): ModeEcranDefinirSuite {
  if (estPhaseChoix(phase) && e.variante !== "notations" && e.variante !== "recurrence") return { type: "choix", options: optionsChoix(e) };
  return { type: "champs", champs: champsEcran(e, phase) };
}

function reponseAttendue(e: ExerciceDefinirSuite, phase: PhaseDefinirSuite): ReactNode {
  return (
    <span className="prompt-text" style={{ overflowX: "auto", display: "block", maxWidth: "100%" }}>
      <RenduFragments5e fragments={reponseFragments(e, phase)} />
    </span>
  );
}

export function App56gen3() {
  const [etat, setEtat] = useState<EtatSessionDefinirSuite>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<PhaseDefinirSuite, boolean>>>({});
  /** Compteur d'exercices affichés : entre dans la `key` de l'écran pour vider la saisie à chaque
   * nouvel exercice (« Générer », « Nouvel exercice »), même quand la phase est la même. */
  const [compteur, setCompteur] = useState(0);

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  function votreReponse(valeurs: string[]): ReactNode {
    const mode = modeEcran(exercice, phase);
    if (mode.type === "choix") return <RenduFragments5e fragments={fragmentsOption(mode.options, valeurs[0])} />;
    return mode.champs.length === 1 ? valeurs[0] : mode.champs.map((c, i) => `${c.label} ${valeurs[i]}`).join(" ; ");
  }

  function terminerEtape(nouvelEtat: EtatSessionDefinirSuite, valeurs: string[]) {
    const transition = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee || nouvelEtat.exerciceCourant !== etat.exerciceCourant;
    if (!transition) {
      setEtat(nouvelEtat);
      return;
    }
    const revele = nouvelEtat.derniereTransitionRevelee;
    const explication = revele && estPhaseChoix(phase) && exercice.variante !== "notations" && exercice.variante !== "recurrence" ? explicationVerdictFaux(exercice, valeurs[0]) : null;
    setAideParPhase((prev) => ({ ...prev, [phase]: etat.niveauAide > 0 }));
    setHistorique((h) => [...h, { corrigeDetaille: corrigeDetailleEcranCourant(), titre: libellePhase(exercice, phase), votreReponse: votreReponse(valeurs), correcte: !revele, reponseAttendue: revele ? reponseAttendue(exercice, phase) : undefined }]);
    setEnAttente({ etatSuivant: nouvelEtat, revele, explication });
  }

  function reinitialiser(nouvelEtat: EtatSessionDefinirSuite) {
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
    reinitialiser(demarrerSessionDefinirSuite(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteDefinirSuite)));
  }

  // Hook DEV-ONLY (même garde que `SelecteurVarianteDev`) : exercice tiré exposé pour Playwright.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug5gen44?: unknown }).__debug5gen44 = { exercice, phase };
  }

  const choix = estPhaseChoix(phase);

  /** Corrigé détaillé « comme au tableau » de l'écran en cours — UNE seule source pour la validation
   * (après la réponse) et pour l'entrée d'historique de l'étape (fiche de sa puce). */
  function corrigeDetailleEcranCourant() {
    return <CorrigeDetailleEcran etapes={lignesDeLEtape(correctionDetailleeDefinirSuite(exercice), lettreEtape(phasesPourExercice(exercice).indexOf(phase)))} />;
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttendue(exercice, phase),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
        // Corrigé détaillé « comme au tableau » de l'étape (même source que le papier,
        // `generateurs5e/definirSuite/corrigeDetaille.ts`), affiché sous la réponse attendue quand elle est révélée.
        corrigeDetaille: corrigeDetailleEcranCourant(),
        ...(choix ? { messageRevele: `Ce n'était pas la bonne conclusion (une seule tentative sur un choix fermé).${enAttente.explication ? ` ${enAttente.explication}` : ""}` } : {}),
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Définir et reconnaître une suite</h1>
        <p className="app-subtitle">Chapitre 3 — Suites</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionDefinirSuite(etat, aideParPhase)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifDefinirSuite(etat)} />
        <EtapeDefinirSuite
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
          messageIllisible={(valeurs) => messageIllisible(exercice, phase, valeurs)}
          onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs), valeurs)}
        />
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}

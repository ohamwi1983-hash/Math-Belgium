// Copie 5e (6h) de `5e-4h/App5gen45.tsx` (56gen4 ← 5gen45, chantier D du 26/11/2026) — copiée pour que les deux années puissent diverger.
import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession5e } from "../5e-4h/core5e/session5e.types";
import type { ExerciceSommesTermes } from "./generateurs56/sommesTermes/core/sommesTermes.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceSommesTermes } from "./generateurs56/sommesTermes";
import type { IdVarianteSommesTermes } from "./generateurs56/sommesTermes";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionSommesTermes, soumettreReponseEcran } from "./generateurs56/sommesTermes/moteur/sessionSommesTermes";
import type { EtatSessionSommesTermes, PhaseSommesTermes } from "./generateurs56/sommesTermes/moteur/typesSommesTermes";
import { phasesPourExercice } from "./generateurs56/sommesTermes/moteur/typesSommesTermes";
import { diagnostiquerChamps, messageIllisible, messagePiege } from "./generateurs56/sommesTermes/moteur/verificationSommesTermes";
import { EtapeSommesTermes, FragmentsSommes } from "./generateurs56/sommesTermes/composants/EtapeSommesTermes";
import { SelecteurVarianteDev } from "../5e-4h/components5e/SelecteurVarianteDev";
import { RecapitulatifPanel } from "../5e-4h/components5e/RecapitulatifPanel";
import { aideNiveau1, aideNiveau2, champsEcran, consigneEcran, consigneGenerale, libellePhase, reponseFragments } from "./generateurs56/sommesTermes/ui/formatSommesTermes";
import { calculerRecapitulatifSommesTermes, calculerSegmentsProgressionSommesTermes } from "./generateurs56/sommesTermes/ui/recapitulatifSommesTermes";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { correctionDetailleeSommesTermes } from "./generateurs56/sommesTermes/corrigeDetaille";
import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";
import { lettreEtape, lignesDeLEtape } from "../export/corrigeTableau";

/**
 * `5gen45` — « Sommes de termes consécutifs » (chapitre 3 de 5e « Suites », section
 * `suites-geometriques`, processus 2 APPLIQUER). Somme de uₚ à uₙ d'une suite arithmétique ou
 * géométrique, ou somme écrite en extension (liste, impairs/pairs, multiples, 3 + 6 + 12 + …) :
 * compter les termes (n − p + 1), trouver le premier (et le dernier) terme, puis appliquer la
 * formule de la somme avec le PREMIER TERME DE LA SOMME. Même patron que `6e-6h/App6gen92.tsx` ; le
 * `?code=` (QR code des feuilles) rejoue l'instance de `generateurs5e/sommesTermes/exportEvaluation.ts`
 * avec les MÊMES fonctions de génération.
 */

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionSommesTermes {
  return demarrerSessionSommesTermes(REGLAGES_DEMO, genererExerciceSommesTermes);
}

/** Première session : le code d'un exercice imprimé (`?code=XXXXXX`) en fixe le PREMIER exercice. */
function sessionInitiale(): EtatSessionSommesTermes {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionSommesTermes(REGLAGES_DEMO, () =>
    genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceSommesTermes, (id) => construireAvecVarianteId(id as IdVarianteSommesTermes)),
  );
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionSommesTermes;
  revele: boolean;
}

function reponseAttendue(e: ExerciceSommesTermes, phase: PhaseSommesTermes): ReactNode {
  return (
    <span className="prompt-text" style={{ overflowX: "auto", display: "block", maxWidth: "100%" }}>
      <FragmentsSommes fragments={reponseFragments(e, phase)} />
    </span>
  );
}

export function App56gen4() {
  const [etat, setEtat] = useState<EtatSessionSommesTermes>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<PhaseSommesTermes, boolean>>>({});
  /** Compteur d'exercices affichés : entre dans la `key` de l'écran pour vider la saisie à chaque
   * nouvel exercice (« Générer », « Nouvel exercice »), même quand la phase est la même. */
  const [compteur, setCompteur] = useState(0);

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
  const champs = champsEcran(exercice, phase);

  function votreReponse(valeurs: string[]): string {
    return champs.length === 1 ? valeurs[0] : champs.map((c, i) => `${c.label} : ${valeurs[i]}`).join(" ; ");
  }

  function terminerEtape(nouvelEtat: EtatSessionSommesTermes, valeurs: string[]) {
    const transition = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee || nouvelEtat.exerciceCourant !== etat.exerciceCourant;
    if (!transition) {
      setEtat(nouvelEtat);
      return;
    }
    const revele = nouvelEtat.derniereTransitionRevelee;
    setAideParPhase((prev) => ({ ...prev, [phase]: etat.niveauAide > 0 }));
    setHistorique((h) => [...h, { corrigeDetaille: corrigeDetailleEcranCourant(), titre: libellePhase(phase), votreReponse: votreReponse(valeurs), correcte: !revele, reponseAttendue: revele ? reponseAttendue(exercice, phase) : undefined }]);
    setEnAttente({ etatSuivant: nouvelEtat, revele });
  }

  function reinitialiser(nouvelEtat: EtatSessionSommesTermes) {
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
    reinitialiser(demarrerSessionSommesTermes(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteSommesTermes)));
  }

  // Hook DEV-ONLY (même garde que `SelecteurVarianteDev`) : exercice tiré exposé pour Playwright.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug5gen45?: unknown }).__debug5gen45 = { exercice, phase };
  }

  /** Corrigé détaillé « comme au tableau » de l'écran en cours — UNE seule source pour la validation
   * (après la réponse) et pour l'entrée d'historique de l'étape (fiche de sa puce). */
  function corrigeDetailleEcranCourant() {
    return <CorrigeDetailleEcran etapes={lignesDeLEtape(correctionDetailleeSommesTermes(exercice), lettreEtape(phasesPourExercice(exercice).indexOf(phase)))} />;
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttendue(exercice, phase),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
        // Corrigé détaillé « comme au tableau » de l'étape (même source que le papier,
        // `generateurs5e/sommesTermes/corrigeDetaille.ts`), affiché sous la réponse attendue quand elle est révélée.
        corrigeDetaille: corrigeDetailleEcranCourant(),
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Sommes de termes consécutifs</h1>
        <p className="app-subtitle">Chapitre 3 — Suites</p>
        <ProgressionPuces segments={calculerSegmentsProgressionSommesTermes(etat, aideParPhase)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      <main className="card">
        <div className="card-body">
          <RecapitulatifPanel entrees={calculerRecapitulatifSommesTermes(etat)} />
          <EtapeSommesTermes
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
            piege={(valeurs) => messagePiege(exercice, phase, valeurs)}
            messageIllisible={messageIllisible(phase)}
            onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs), valeurs)}
          />
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}

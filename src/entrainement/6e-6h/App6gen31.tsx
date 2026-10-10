import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceTiragesArbres } from "./generateurs6e/tiragesArbres";
import type { IdVarianteTiragesArbres } from "./generateurs6e/tiragesArbres";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionTiragesArbres, soumettreReponseEcran } from "./moteur6e/sessionTiragesArbres";
import type { EtatSessionTiragesArbres } from "./moteur6e/typesTiragesArbres";
import { diagnostiquerEcran } from "./moteur6e/verificationTiragesArbres";
import { Katex } from "./components/Katex";
import { EtapeChampsTiragesArbres } from "./components6e/EtapeChampsTiragesArbres";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2, blocDonnees, champsEcran, consigneEcran, consigneGenerale, etatActuel, formatReponseAttenduePhaseLatex } from "./ui6e/formatTiragesArbres";

/**
 * `6gen31` — Tirages, arbres et dénombrement (chapitre 8, "Probabilités", DEUXIÈME générateur de ce
 * chapitre — construit sur l'infrastructure fondée par `6gen30`, voir
 * `moteur6e/verificationProbabilites.ts`). Même patron que `App6gen30.tsx` : aucun bloc JSX par
 * famille/écran, un seul dispatch piloté par `ui6e/formatTiragesArbres.ts` (`champsEcran`) et
 * `moteur6e/verificationTiragesArbres.ts` (`diagnostiquerEcran`). Contrairement à `6gen30`, AUCUN
 * écran à choix ici (les 3 familles ne posent que des champs texte libre — numériques ou, pour
 * `cEcran1`, une équation) : un seul composant écran (`EtapeChampsTiragesArbres`), jamais de
 * dispatch `estEcranChoix`.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionTiragesArbres {
  return demarrerSessionTiragesArbres(REGLAGES_DEMO, genererExerciceTiragesArbres);
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionTiragesArbres;
  revele: boolean;
}

export function App6gen31() {
  const [etat, setEtat] = useState<EtatSessionTiragesArbres>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionTiragesArbres) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      setEnAttente({ etatSuivant: nouvelEtat, revele: nouvelEtat.derniereTransitionRevelee });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    setEtat(enAttente.etatSuivant.terminee ? nouvelleSession() : enAttente.etatSuivant);
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    setEtat(demarrerSessionTiragesArbres(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteTiragesArbres)));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1, même garde que
  // `SelecteurVarianteDev`) : expose l'exercice tiré tel quel sur `window` — permet à la
  // vérification Playwright (build de production) de reconstruire la réponse EXACTE attendue à
  // chaque écran depuis les vrais paramètres tirés, plutôt que de re-parser le LaTeX affiché.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen31?: unknown }).__debug6gen31 = { exercice, phase };
  }

  const aideCommun = {
    tentativesUtilisees: etat.etapeCourante.tentativesUtilisees,
    tentativesMax: etat.reglages.tentativesMax,
    niveauAide: etat.niveauAide,
    niveauAideMax: NIVEAU_AIDE_MAX,
    onActiverAide: () => setEtat(activerAideSuivante(etat)),
  };

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: (
          <span className="equation-box-termes">
            {formatReponseAttenduePhaseLatex(exercice, phase).map((frag, i) => (
              <Katex key={i} expression={frag} />
            ))}
          </span>
        ),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  const propsCommun = {
    consigneGenerale: consigneGenerale(exercice),
    blocDonnees: blocDonnees(exercice),
    etatActuel: etatActuel(exercice, phase),
    consigneEcran: consigneEcran(exercice, phase),
    aideNiveau1: formatAideNiveau1(exercice, phase),
    aideNiveau2: formatAideNiveau2(exercice, phase),
    ...aideCommun,
    validation,
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Tirages, arbres et dénombrement</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        <EtapeChampsTiragesArbres key={phase} {...propsCommun} champs={champsEcran(exercice, phase)} diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs)} onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs))} />
      </main>
    </div>
  );
}

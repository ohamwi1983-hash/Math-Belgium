import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceAffixesRacines } from "./generateurs6e/affixesRacines";
import type { IdVarianteAffixesRacines } from "./generateurs6e/affixesRacines";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionAffixesRacines, soumettreReponseEcran } from "./moteur6e/sessionAffixesRacines";
import { phasesPourExercice } from "./moteur6e/typesAffixesRacines";
import type { EtatSessionAffixesRacines, PhaseAffixesRacines } from "./moteur6e/typesAffixesRacines";
import { diagnostiquerEcran } from "./moteur6e/verificationAffixesRacines";
import { Katex } from "./components/Katex";
import { EtapeChampsAffixesRacines } from "./components6e/EtapeChampsAffixesRacines";
import { EtapeChoixAffixesRacines } from "./components6e/EtapeChoixAffixesRacines";
import { EtapeRacinesAffixesRacines } from "./components6e/EtapeRacinesAffixesRacines";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { LIBELLE_PHASE, OPTIONS_RELATION_B, OPTIONS_SYSTEME_C, blocDonnees, champsEcran, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex, niveauAideMaxEcran, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatAffixesRacines";
import { calculerRecapitulatifAffixesRacines, calculerSegmentsProgressionAffixesRacines } from "./ui6e/recapitulatifAffixesRacines";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";

/**
 * `6gen35` — Nombres complexes : affixes et racines carrées (chapitre 7, "Nombres complexes",
 * SECOND générateur de ce chapitre, après `6gen34`). Même patron dispatcher générique que
 * `App6gen34.tsx`, avec 3 composants "Etape" possibles selon la NATURE de l'écran (pas seulement la
 * famille) : `EtapeChampsAffixesRacines` (saisie libre à arité fixe : aEcran1, bEcran2, cEcran2),
 * `EtapeChoixAffixesRacines` (QCM : bEcran1, cEcran1), `EtapeRacinesAffixesRacines` (add-as-needed,
 * 2 racines : cEcran3 uniquement).
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionAffixesRacines {
  return demarrerSessionAffixesRacines(REGLAGES_DEMO, genererExerciceAffixesRacines);
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionAffixesRacines;
  revele: boolean;
}

export function App6gen35() {
  const [etat, setEtat] = useState<EtatSessionAffixesRacines>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, à part de `EtatSessionAffixesRacines`, jamais dans le moteur : la saisie de l'élève
   * n'a aucune autre utilité une fois l'étape close. Remis à vide à chaque nouvel exercice, comme
   * `enAttente`. */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Puce "aide" (jaune) : le moteur ne garde `niveauAide` que pour l'écran COURANT (remis à 0 au
   * changement de phase) — on la persiste donc nous-mêmes ici, phase par phase, au même point que
   * `historique`. */
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<PhaseAffixesRacines, boolean>>>({});

  /** `votreReponse` : UNIQUEMENT formaté/poussé dans l'historique quand l'étape se clôt RÉELLEMENT
   * (même garde que la transition d'écran elle-même) — jamais à chaque tentative ratée. */
  function terminerEtape(nouvelEtat: EtatSessionAffixesRacines, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const phaseFermee = etat.phase;
      const revele = nouvelEtat.derniereTransitionRevelee;
      setAideParPhase((prev) => ({ ...prev, [phaseFermee]: etat.niveauAide > 0 }));
      if (votreReponse !== undefined) {
        setHistorique((h) => [
          ...h,
          {
            titre: LIBELLE_PHASE[phaseFermee],
            votreReponse,
            correcte: !revele,
            reponseAttendue: revele ? (
              <span className="equation-box-termes">
                {formatReponseAttenduePhaseLatex(exercice, phaseFermee).map((frag, i) => (
                  <Katex key={i} expression={frag} />
                ))}
              </span>
            ) : undefined,
          },
        ]);
      }
      setEnAttente({ etatSuivant: nouvelEtat, revele });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      setEtat(nouvelleSession());
      setHistorique([]);
      setAideParPhase({});
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    setHistorique([]);
    setAideParPhase({});
    setEtat(demarrerSessionAffixesRacines(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteAffixesRacines)));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1) : expose l'exercice tiré tel
  // quel sur `window` — permet à la vérification Playwright (build de production) de reconstruire
  // la réponse EXACTE attendue à chaque écran depuis les vrais paramètres tirés, jamais en
  // re-parsant le LaTeX affiché (fragile). Jamais consommé par le code applicatif lui-même — mirroir
  // `App6gen34.tsx`.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen35?: unknown }).__debug6gen35 = { exercice, phase };
  }

  const aideCommun = {
    tentativesUtilisees: etat.etapeCourante.tentativesUtilisees,
    tentativesMax: etat.reglages.tentativesMax,
    niveauAide: etat.niveauAide,
    niveauAideMax: Math.min(NIVEAU_AIDE_MAX, niveauAideMaxEcran(exercice, phase)),
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

  const ecranCommun = {
    consigneGenerale: consigneGenerale(exercice),
    blocDonnees: blocDonnees(exercice),
    consigneEcran: consigneEcran(exercice, phase),
    aideNiveau1: formatAideNiveau1(exercice, phase),
    aideNiveau2: formatAideNiveau2(exercice, phase),
    validation,
  };

  function rendreEcran() {
    if (phase === "bEcran1") {
      return (
        <EtapeChoixAffixesRacines
          key={phase}
          {...aideCommun}
          {...ecranCommun}
          options={OPTIONS_RELATION_B}
          onValider={(id) => terminerEtape(soumettreReponseEcran(etat, [id]), <Katex expression={OPTIONS_RELATION_B.find((o) => o.id === id)?.latex ?? id} />)}
        />
      );
    }
    if (phase === "cEcran1" && exercice.famille === "C") {
      const options = OPTIONS_SYSTEME_C(exercice.a, exercice.b);
      return (
        <EtapeChoixAffixesRacines
          key={phase}
          {...aideCommun}
          {...ecranCommun}
          options={options}
          onValider={(id) => terminerEtape(soumettreReponseEcran(etat, [id]), <Katex expression={options.find((o) => o.id === id)?.latex ?? id} />)}
        />
      );
    }
    if (phase === "cEcran3") {
      return (
        <EtapeRacinesAffixesRacines
          key={phase}
          {...aideCommun}
          {...ecranCommun}
          diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs)}
          onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs), valeurs.join(", "))}
        />
      );
    }
    return (
      <EtapeChampsAffixesRacines
        key={phase}
        {...aideCommun}
        {...ecranCommun}
        champs={champsEcran(exercice, phase)}
        diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs)}
        onValider={(valeurs) =>
          terminerEtape(soumettreReponseEcran(etat, valeurs), champsEcran(exercice, phase).map((c, i) => `${c.label} : ${valeurs[i]}`).join(" ; "))
        }
      />
    );
  }

  /** Surcharge locale de `calculerSegmentsProgressionAffixesRacines` : "correcte" devient "aide"
   * quand `aideParPhase` montre que l'écran a été fermé avec de l'aide active. */
  const segmentsBase = calculerSegmentsProgressionAffixesRacines(etat);
  const segments: EtatPuceProgression[] = phasesPourExercice(exercice).map((p, i) =>
    segmentsBase[i] === "correcte" && aideParPhase[p] ? "aide" : segmentsBase[i],
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Nombres complexes : affixes et racines carrées</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={segments} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifAffixesRacines(etat)} />
        {rendreEcran()}
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}

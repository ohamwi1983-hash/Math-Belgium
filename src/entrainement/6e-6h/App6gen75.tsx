import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import type { ExerciceFrequenceProbabilite } from "./core6e/frequenceProbabilite.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceFrequenceProbabilite } from "./generateurs6e/frequenceProbabilite";
import type { IdVarianteFrequenceProbabilite } from "./generateurs6e/frequenceProbabilite";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionFrequenceProbabilite, soumettreReponseEcran, tentativesMaxCourant } from "./moteur6e/sessionFrequenceProbabilite";
import type { EtatSessionFrequenceProbabilite, PhaseFrequenceProbabilite } from "./moteur6e/typesFrequenceProbabilite";
import { PHASES_FREQUENCE_PROBABILITE, estPhaseChoix } from "./moteur6e/typesFrequenceProbabilite";
import { diagnostiquerEcran } from "./moteur6e/verificationFrequenceProbabilite";
import { EtapeFrequenceProbabilite } from "./components6e/EtapeFrequenceProbabilite";
import type { ModeSaisieFrequence } from "./components6e/EtapeFrequenceProbabilite";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { CalculatriceScientifique } from "./components6e/CalculatriceScientifique";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { RenduFragments } from "./components/RenduFragments";
import {
  LIBELLE_PHASE,
  aideNiveau1,
  aideNiveau2,
  champEcran,
  consigneEcran,
  consigneGenerale,
  libelleOption,
  optionsChoix,
  reponseAttendueFragments,
  tableauEffectifs,
  tableauRegle,
} from "./ui6e/formatFrequenceProbabilite";
import { svgDiagrammeFrequences, svgGrilleSommes } from "./ui6e/figuresFrequenceProbabilite";
import { calculerRecapitulatifFrequenceProbabilite, calculerSegmentsProgressionFrequenceProbabilite } from "./ui6e/recapitulatifFrequenceProbabilite";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionFrequenceProbabilite {
  return demarrerSessionFrequenceProbabilite(REGLAGES_DEMO, genererExerciceFrequenceProbabilite);
}

/** Première session : si l'URL porte le code d'un exercice imprimé (`?code=XXXXXX`), son PREMIER
 * exercice est cette instance — tirée avec les MÊMES fonctions que l'adaptateur papier
 * (`generateurs6e/frequenceProbabilite/exportEvaluation.ts`), effectifs simulés compris. */
function sessionInitiale(): EtatSessionFrequenceProbabilite {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionFrequenceProbabilite(REGLAGES_DEMO, () =>
    genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceFrequenceProbabilite, (id) => construireAvecVarianteId(id as IdVarianteFrequenceProbabilite)),
  );
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionFrequenceProbabilite;
  revele: boolean;
}

/** Figure sous les données : grille surlignée (B, après l'écran 1), diagramme fréquences/modèle
 * (écrans 3 et 4, pour comparer). Jamais avant la fin de l'écran concerné. */
function figureDonnees(exercice: ExerciceFrequenceProbabilite, phase: PhaseFrequenceProbabilite): string | null {
  if (phase === "ecran3" || phase === "ecran4") return svgDiagrammeFrequences(exercice);
  if (phase === "ecran2" && exercice.famille === "B") return svgGrilleSommes(exercice.evenement.sommes);
  return null;
}

function ReponseAttendue({ exercice, phase }: { exercice: ExerciceFrequenceProbabilite; phase: PhaseFrequenceProbabilite }) {
  return (
    <span className="equation-box-termes">
      <RenduFragments fragments={reponseAttendueFragments(exercice, phase)} />
    </span>
  );
}

export function App6gen75() {
  const [etat, setEtat] = useState<EtatSessionFrequenceProbabilite>(sessionInitiale);
  /** Compteur d'exercices affichés : entre dans la `key` des écrans pour vider la saisie à chaque
   * nouvel exercice, même quand la phase est la même (`nombreExercices: 1`). */
  const [numeroExercice, setNumeroExercice] = useState(0);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  const [aideUtiliseeParPhase, setAideUtiliseeParPhase] = useState<Partial<Record<PhaseFrequenceProbabilite, boolean>>>({});

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  function terminerEtape(nouvelEtat: EtatSessionFrequenceProbabilite, votreReponse: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele = nouvelEtat.derniereTransitionRevelee;
      setHistorique((h) => [
        ...h,
        { titre: LIBELLE_PHASE[etat.phase], votreReponse, correcte: !revele, reponseAttendue: revele ? <ReponseAttendue exercice={exercice} phase={etat.phase} /> : undefined },
      ]);
      if (etat.niveauAide > 0) setAideUtiliseeParPhase((m) => ({ ...m, [etat.phase]: true }));
      setEnAttente({ etatSuivant: nouvelEtat, revele });
      return;
    }
    setEtat(nouvelEtat);
  }

  function reinitialiserExercice(nouvelEtat: EtatSessionFrequenceProbabilite) {
    setEtat(nouvelEtat);
    setNumeroExercice((n) => n + 1);
    setHistorique([]);
    setAideUtiliseeParPhase({});
    setEnAttente(null);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      reinitialiserExercice(nouvelleSession());
      return;
    }
    setEtat(enAttente.etatSuivant);
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    reinitialiserExercice(demarrerSessionFrequenceProbabilite(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteFrequenceProbabilite)));
  }

  // Hook DEV-ONLY (même garde que `SelecteurVarianteDev`) : expose l'exercice tiré pour la
  // vérification Playwright.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen75?: unknown }).__debug6gen75 = { exercice, phase };
  }

  const choix = estPhaseChoix(exercice, phase);
  const mode: ModeSaisieFrequence = choix
    ? { type: "choix", options: optionsChoix(exercice, phase) }
    : { type: "champ", champ: champEcran(exercice, phase), diagnostiquer: (valeurs) => diagnostiquerEcran(exercice, phase, valeurs) };

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: (
          <>
            <ReponseAttendue exercice={exercice} phase={phase} />
            {phase === "ecran1" && exercice.famille === "B" && <div style={{ textAlign: "center", margin: "8px 0" }} dangerouslySetInnerHTML={{ __html: svgGrilleSommes(exercice.evenement.sommes) }} />}
          </>
        ),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
        ...(choix ? { messageRevele: "Ce n'était pas la bonne réponse (une seule tentative sur un choix fermé)." } : {}),
      }
    : null;

  const segments: EtatPuceProgression[] = calculerSegmentsProgressionFrequenceProbabilite(etat).map((segment, index) =>
    segment === "correcte" && aideUtiliseeParPhase[PHASES_FREQUENCE_PROBABILITE[index]] ? "aide" : segment,
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Fréquence et probabilité</h1>
        <p className="app-subtitle">Chapitre 6 — Les probabilités</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={segments} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifFrequenceProbabilite(etat)} />
        <EtapeFrequenceProbabilite
          key={`${numeroExercice}-${phase}`}
          consigneGenerale={consigneGenerale(exercice)}
          tableaux={[tableauEffectifs(exercice), tableauRegle()]}
          figureDonnees={figureDonnees(exercice, phase)}
          consigneEcran={consigneEcran(exercice, phase)}
          mode={mode}
          aideNiveau1={aideNiveau1(exercice, phase)}
          aideNiveau2={aideNiveau2(exercice, phase)}
          tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
          tentativesMax={tentativesMaxCourant(etat)}
          niveauAide={etat.niveauAide}
          niveauAideMax={NIVEAU_AIDE_MAX}
          onActiverAide={() => setEtat(activerAideSuivante(etat))}
          validation={validation}
          onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs), choix ? libelleOption(exercice, phase, valeurs[0]) : valeurs[0])}
        />
        {phase !== "ecran1" && <CalculatriceScientifique />}
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />}
    </div>
  );
}

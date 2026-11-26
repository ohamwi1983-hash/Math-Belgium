// Copie 5e (6h) de `5e-4h/App5gen19.tsx` (56gen12 ← 5gen19, chantier D du 26/11/2026) — copiée pour que les deux années puissent diverger.
import { useState } from "react";
import type { PropsAncienne } from "./commun56/AppMixte56";
import { AppMixte56 } from "./commun56/AppMixte56";
import { CATALOGUE_INSTABLE, DEFINITION_INSTABLE, estInstable, genererInstable } from "./generateurs56/suiteRecurrenteAffine/instable";
import type { ExerciceInstable, PhaseInstable } from "./generateurs56/suiteRecurrenteAffine/instable";
import type { ExerciceSuiteRecurrenteAffine } from "../5e-4h/core5e/suiteRecurrenteAffine.types";
import type { ReglagesSession5e } from "../5e-4h/core5e/session5e.types";
import { CATALOGUE_REGIMES_SUITE_RECURRENTE_AFFINE, construireAvecRegime, genererExerciceSuiteRecurrenteAffine } from "./generateurs56/suiteRecurrenteAffine";
import type { RegimeSuiteRecurrenteAffine } from "../5e-4h/core5e/suiteRecurrenteAffine.types";
import { SelecteurVarianteDev } from "../5e-4h/components5e/SelecteurVarianteDev";

const OPTIONS_REGIME = [
  { id: "convergent", label: "Convergente (|a| < 1)" },
  { id: "divergent", label: "Divergente (|a| ≥ 1)" },
];
import {
  niveauAideMaxSuiteRecurrenteAffine,
  activerAideSuivante,
  demarrerSessionSuiteRecurrenteAffine,
  soumettreReponsePoserRecurrence,
  soumettreReponseRegimePermanent,
  soumettreReponseTermesSuccessifs,
} from "./generateurs56/suiteRecurrenteAffine/moteur/sessionSuiteRecurrenteAffine";
import type { EtatSessionSuiteRecurrenteAffine, PhaseSuiteRecurrenteAffine } from "./generateurs56/suiteRecurrenteAffine/moteur/typesSuiteRecurrenteAffine";
import {
  diagnostiquerPoserRecurrence,
  diagnostiquerRegimePermanent,
  diagnostiquerTermesSuccessifs,
} from "./generateurs56/suiteRecurrenteAffine/moteur/verificationSuiteRecurrenteAffine";
import { EtapePoserRecurrence } from "./generateurs56/suiteRecurrenteAffine/composants/EtapePoserRecurrence";
import { EtapeRegimePermanent } from "./generateurs56/suiteRecurrenteAffine/composants/EtapeRegimePermanent";
import { EtapeTermesSuccessifs } from "./generateurs56/suiteRecurrenteAffine/composants/EtapeTermesSuccessifs";
import { CalculatriceScientifique } from "../5e-4h/components5e/CalculatriceScientifique";
import { consigneGenerale, formatReponseAttenduePhaseLatex } from "./generateurs56/suiteRecurrenteAffine/ui/formatSuiteRecurrenteAffine";
import { EnTeteExercice } from "../5e-4h/components5e/EnTeteExercice";
import { calculerRecapitulatifSuiteRecurrenteAffine } from "./generateurs56/suiteRecurrenteAffine/ui/recapitulatifSuiteRecurrenteAffine";
import { RecapitulatifPanel } from "../5e-4h/components5e/RecapitulatifPanel";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { Katex } from "../5e-4h/components/Katex";
import { correctionDetailleeSuiteRecurrenteAffine } from "./generateurs56/suiteRecurrenteAffine/corrigeDetaille";
import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";
import { lignesDeLEtape } from "../export/corrigeTableau";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionSuiteRecurrenteAffine {
  return demarrerSessionSuiteRecurrenteAffine(REGLAGES_DEMO, genererExerciceSuiteRecurrenteAffine);
}

/** Première session : si l'URL porte le code d'un exercice imprimé (`?code=XXXXXX`), son PREMIER
 * exercice est cette instance — tirée avec les MÊMES fonctions et le MÊME catalogue (les 2 régimes)
 * que l'adaptateur d'export (`generateurs5e/suiteRecurrenteAffine/exportEvaluation.ts`). */
function sessionInitiale(): EtatSessionSuiteRecurrenteAffine {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionSuiteRecurrenteAffine(REGLAGES_DEMO, () =>
    genererAvecCode(code, CATALOGUE_REGIMES_SUITE_RECURRENTE_AFFINE, genererExerciceSuiteRecurrenteAffine, (id) => construireAvecRegime(id as RegimeSuiteRecurrenteAffine)),
  );
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionSuiteRecurrenteAffine;
  revele: boolean;
}

/** Séquence RÉELLE identique à `moteur5e/typesSuiteRecurrenteAffine.ts` (`phaseInitiale`/
 * `phaseApres`) — ORDRE_PHASES statique, comme `AppAnalyseFonction.tsx` (4e), puisque cette
 * séquence à 3 écrans est FIXE pour les 2 régimes (jamais de saut). "termesSuccessifs" (dernière
 * phase) n'a pas de branche "close" propre : tant que l'exercice n'est pas terminé elle est
 * forcément "courante", et une fois terminé un nouvel exercice démarre (même convention que
 * "tableauSignes" dans `AppAnalyseFonction.tsx`). */
const ORDRE_PHASES: PhaseSuiteRecurrenteAffine[] = ["poserRecurrence", "regimePermanent", "termesSuccessifs"];

function calculerSegmentsProgression(
  etat: EtatSessionSuiteRecurrenteAffine,
  aideUtiliseeParPhase: Partial<Record<PhaseSuiteRecurrenteAffine, boolean>>,
): EtatPuceProgression[] {
  return ORDRE_PHASES.map((phase) => {
    if (phase === etat.phase) return "courante";
    const score = phase === "poserRecurrence" ? etat.scorePoserRecurrencePartiel : phase === "regimePermanent" ? etat.scoreRegimePermanentPartiel : null;
    if (score === null) return "a-venir";
    const revele = phase === "poserRecurrence" ? etat.poserRecurrenceRevele : phase === "regimePermanent" ? etat.regimePermanentRevele : false;
    if (revele) return "revele";
    return aideUtiliseeParPhase[phase] ? "aide" : "correcte";
  });
}

function formatReponseRegimePermanent(reponse: { existe: boolean; L: string }): string {
  return reponse.existe ? `L = ${reponse.L}` : "N'existe pas";
}

export function App56gen12Ancienne({ premier, controle }: PropsAncienne<ExerciceSuiteRecurrenteAffine> = {}) {
  const [etat, setEtat] = useState<EtatSessionSuiteRecurrenteAffine>(() => (premier ? demarrerSessionSuiteRecurrenteAffine(REGLAGES_DEMO, () => premier) : sessionInitiale()));
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, à part de `EtatSessionSuiteRecurrenteAffine`, jamais dans le moteur. Remis à vide à
   * chaque nouvel exercice, comme `enAttente`. */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Capture locale de `etat.niveauAide > 0` pour chaque phase CLOSE — le moteur remet
   * `niveauAide` à 0 à chaque transition de phase (même mécanique que les autres générateurs de
   * ce chantier). */
  const [aideUtiliseeParPhase, setAideUtiliseeParPhase] = useState<Partial<Record<PhaseSuiteRecurrenteAffine, boolean>>>({});
  /** Incrémenté à chaque nouvel exercice (« Générer », « Nouvel exercice ») : fait partie de la clé
   * des écrans, pour que leurs champs repartent vides même quand le nouvel exercice commence par le
   * même écran (même convention qu'`App5gen10.tsx`). */
  const [numeroSession, setNumeroSession] = useState(0);

  /** `votreReponse` : UNIQUEMENT formatée/poussée dans l'historique quand l'étape se clôt
   * RÉELLEMENT (`transitionDEcran`) — jamais à chaque clic sur "Valider" (même garde
   * qu'`AppAnalyseFonction.tsx`). Réutilise `calculerRecapitulatifSuiteRecurrenteAffine` pour la
   * réponse ATTENDUE. Jamais appelée pour "termesSuccessifs" (dernière phase, jamais visible comme
   * puce close avant la fin de l'exercice — voir `calculerSegmentsProgression`). */
  function terminerEtape(nouvelEtat: EtatSessionSuiteRecurrenteAffine, votreReponse?: string) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele = nouvelEtat.derniereEtapeRevelee;
      setAideUtiliseeParPhase((m) => ({ ...m, [etat.phase]: etat.niveauAide > 0 }));
      if (votreReponse !== undefined) {
        const recap = calculerRecapitulatifSuiteRecurrenteAffine(nouvelEtat);
        const derniere = recap[recap.length - 1];
        if (derniere) {
          setHistorique((h) => [
            ...h,
            {
              corrigeDetaille: corrigeDetailleEcranCourant(),
              titre: derniere.libelle,
              votreReponse,
              correcte: !derniere.revele,
              reponseAttendue: derniere.revele ? (derniere.estLatex ? <Katex expression={derniere.valeur} /> : derniere.valeur) : undefined,
            },
          ]);
        }
      }
      setEnAttente({ etatSuivant: nouvelEtat, revele });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      if (controle) {
        controle.suivant();
        return;
      }
      setEtat(nouvelleSession());
      setHistorique([]);
      setAideUtiliseeParPhase({});
      setNumeroSession((n) => n + 1);
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    if (controle) {
      controle.variante(id);
      return;
    }
    setEnAttente(null);
    setHistorique([]);
    setAideUtiliseeParPhase({});
    setNumeroSession((n) => n + 1);
    setEtat(demarrerSessionSuiteRecurrenteAffine(REGLAGES_DEMO, () => construireAvecRegime(id as RegimeSuiteRecurrenteAffine)));
  }

  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const cleEcran = `${numeroSession}-${etat.indexExercice}-${etat.phase}`;

  /** Corrigé détaillé « comme au tableau » de l'écran en cours — UNE seule source pour la validation
   * (après la réponse) et pour l'entrée d'historique de l'étape (fiche de sa puce). */
  function corrigeDetailleEcranCourant() {
    return <CorrigeDetailleEcran etapes={lignesDeLEtape(correctionDetailleeSuiteRecurrenteAffine(exercice), { poserRecurrence: "a", regimePermanent: "b", termesSuccessifs: "c" }[etat.phase])} />;
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: (
          <span className="equation-box-termes">
            {formatReponseAttenduePhaseLatex(exercice, etat.phase).map((frag, i) => (
              <Katex key={i} expression={frag} />
            ))}
          </span>
        ),
        corrigeDetaille: corrigeDetailleEcranCourant(),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e (6h) — Entraînement</p>
        <h1 className="app-title">Suite récurrente affine et régime permanent</h1>
        <p className="app-subtitle">Nombres réels et suites</p>
        <ProgressionPuces segments={calculerSegmentsProgression(etat, aideUtiliseeParPhase)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <SelecteurVarianteDev options={controle?.catalogue ?? OPTIONS_REGIME} onGenerer={forcerVariante} />
      <main className="card">
        <div className="card-body">
          <EnTeteExercice consigneGenerale={consigneGenerale(exercice)} blocDonnees={null} />
          <RecapitulatifPanel entrees={calculerRecapitulatifSuiteRecurrenteAffine(etat)} />
          <>
              {etat.phase === "poserRecurrence" && (
                <EtapePoserRecurrence
                  key={cleEcran}
                  exercice={exercice}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMaxSuiteRecurrenteAffine(etat.phase)}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponsePoserRecurrence(etat, texte), texte)}
                  diagnostiquer={(texte) => diagnostiquerPoserRecurrence(texte, exercice)}
                  validation={validation}
                />
              )}

              {etat.phase === "regimePermanent" && (
                <EtapeRegimePermanent
                  key={cleEcran}
                  exercice={exercice}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMaxSuiteRecurrenteAffine(etat.phase)}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse) => terminerEtape(soumettreReponseRegimePermanent(etat, reponse), formatReponseRegimePermanent(reponse))}
                  diagnostiquer={(reponse) => diagnostiquerRegimePermanent(reponse, exercice)}
                  validation={validation}
                />
              )}
              {etat.phase === "regimePermanent" && <CalculatriceScientifique />}

              {etat.phase === "termesSuccessifs" && (
                <EtapeTermesSuccessifs
                  key={cleEcran}
                  exercice={exercice}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMaxSuiteRecurrenteAffine(etat.phase)}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(textes) => terminerEtape(soumettreReponseTermesSuccessifs(etat, textes))}
                  diagnostiquer={(textes) => diagnostiquerTermesSuccessifs(textes, exercice)}
                  validation={validation}
                />
              )}
              {etat.phase === "termesSuccessifs" && <CalculatriceScientifique />}
            </>
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}

// --- 5e (6h) : variante « point fixe et erreur d'arrondi » ajoutée en fin de catalogue (chantier D) -----
const CATALOGUE_56GEN12 = [...CATALOGUE_REGIMES_SUITE_RECURRENTE_AFFINE, ...CATALOGUE_INSTABLE];

/** Tirage de l'appli : « point fixe et erreur d'arrondi » une fois sur quatre, sinon le tirage d'origine
 * (celui de l'adaptateur et des `?code=` libres, inchangé). */
export function genererExercice56gen12Libre(): ExerciceSuiteRecurrenteAffine | ExerciceInstable {
  return Math.random() < 0.25 ? genererInstable() : genererExerciceSuiteRecurrenteAffine();
}

export function variante56gen12(id: string): ExerciceSuiteRecurrenteAffine | ExerciceInstable {
  return id === "instable" ? genererInstable() : construireAvecRegime(id as RegimeSuiteRecurrenteAffine);
}

export function App56gen12() {
  return (
    <AppMixte56<ExerciceSuiteRecurrenteAffine, ExerciceInstable, PhaseInstable>
      catalogue={CATALOGUE_56GEN12}
      genererLibreAdaptateur={genererExerciceSuiteRecurrenteAffine}
      genererLibre={genererExercice56gen12Libre}
      genererVariante={variante56gen12}
      estNouvelle={estInstable}
      genererLibreNouvelle={genererInstable}
      rendreAncienne={(p) => <App56gen12Ancienne key={p.key} premier={p.premier} controle={p.controle} />}
      configNouvelle={{ id: "56gen12", titre: "Suite récurrente affine et point fixe", eyebrow: "5e (6h) — Entraînement", sousTitre: "Nombres réels et suites", definition: DEFINITION_INSTABLE }}
    />
  );
}

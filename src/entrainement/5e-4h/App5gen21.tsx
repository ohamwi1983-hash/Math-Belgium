import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceAsymptoteOblique } from "./generateurs5e/asymptoteOblique";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import {
  activerAideSuivante,
  demarrerSessionAsymptoteOblique,
  niveauAideMaxAsymptoteOblique,
  soumettreReponseCalculerCoefficientA,
  soumettreReponseCalculerCoefficientB,
  soumettreReponseConclureEquationAsymptote,
  soumettreReponseDiviserEuclidienne,
  soumettreReponseEcrireFormeDeveloppee,
} from "./moteur5e/sessionAsymptoteOblique";
import type { ReponseDiviserEuclidienne } from "./moteur5e/sessionAsymptoteOblique";
import type { EtatSessionAsymptoteOblique, PhaseAsymptoteOblique } from "./moteur5e/typesAsymptoteOblique";
import { ordreComplet } from "./moteur5e/typesAsymptoteOblique";
import { diagnostiquerFormeDeveloppee, diagnostiquerNombre, diagnostiquerQuotient } from "./moteur5e/verificationAsymptoteOblique";
import type { ExerciceAsymptoteOblique } from "./core5e/asymptoteOblique.types";
import { EtapeChampLibreAsymptote } from "./components5e/EtapeChampLibreAsymptote";
import { EtapeDiviserEuclidienne } from "./components5e/EtapeDiviserEuclidienne";
import { Katex } from "./components/Katex";
import { LIBELLE_PHASE_ASYMPTOTE_OBLIQUE, formatReponseAttenduePhaseLatex } from "./ui5e/formatAsymptoteOblique";
import { estFormeQuotientPlusReste, retirerMembreGauche } from "./moteur5e/formeSaisieLimites";
import { calculerRecapitulatifAsymptoteOblique } from "./ui5e/recapitulatifAsymptoteOblique";
import { RecapitulatifPanel } from "./components5e/RecapitulatifPanel";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionAsymptoteOblique {
  return demarrerSessionAsymptoteOblique(REGLAGES_DEMO, genererExerciceAsymptoteOblique);
}

/** Première session : si l'URL porte le code d'un exercice imprimé (`?code=XXXXXX`), son PREMIER
 * exercice est cette instance — tirée avec les MÊMES fonctions de génération que l'adaptateur
 * d'export (`generateurs5e/asymptoteOblique/exportEvaluation.ts`) ; la suite de la session reste un tirage normal. */
function sessionInitiale(): EtatSessionAsymptoteOblique {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionAsymptoteOblique(REGLAGES_DEMO, () => genererAvecCode(code, CATALOGUE_FAMILLES, () => genererExerciceAsymptoteOblique(), (id) => construireAvecFamilleId(id)));
}

function reponseAttendueAsymptoteOblique(exercice: ExerciceAsymptoteOblique, phase: PhaseAsymptoteOblique) {
  return (
    <span className="equation-box-termes">
      {formatReponseAttenduePhaseLatex(exercice, phase).map((frag, i) => (
        <Katex key={i} expression={frag} />
      ))}
    </span>
  );
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionAsymptoteOblique;
  revele: boolean;
}

/** Une puce par phase de `ordreComplet(etat.exerciceCourant)` — séquence RÉELLE propre à la
 * variante du tirage ("divisionEuclidienne"/"viaLimites"), jamais un `ORDRE_PHASES` fixe
 * reconstitué à la main : même source que `calculerRecapitulatifAsymptoteOblique`. "courante" pour
 * `etat.phase`, "correcte"/"revele" pour les phases déjà closes (`revelesPartiels[phase]`),
 * "a-venir" au-delà. */
function calculerSegmentsProgression(
  etat: EtatSessionAsymptoteOblique,
  aideParPhase: Partial<Record<PhaseAsymptoteOblique, boolean>>,
): EtatPuceProgression[] {
  return ordreComplet(etat.exerciceCourant).map((phase) => {
    if (phase === etat.phase) return "courante";
    const score = etat.scoresPartiels[phase];
    if (score === undefined) return "a-venir";
    if (etat.revelesPartiels[phase]) return "revele";
    return aideParPhase[phase] ? "aide" : "correcte";
  });
}

export function App5gen21() {
  const [etat, setEtat] = useState<EtatSessionAsymptoteOblique>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos — tenu ICI, à part de
   * `EtatSessionAsymptoteOblique`, jamais dans le moteur (même principe que `AppAnalyseFonction.tsx`, 4e). */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Niveau d'aide RÉELLEMENT utilisé par phase close — capturé ici (présentation), `niveauAide`
   * (moteur) étant remis à 0 à chaque transition (même patron que `App5gen31.tsx::aideParPhase`). */
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<PhaseAsymptoteOblique, boolean>>>({});
  /** Compteur de générations dans la clé d'écran : « Générer » / « Nouvel exercice » vident les champs
   * même si le nouvel exercice commence par le même écran (audit 5c4a, 5gen21 point 4). */
  const [numeroGeneration, setNumeroGeneration] = useState(0);

  /** Fiche de la puce : l'écran qui VIENT de se clore (`phaseClose`), jamais la dernière ligne du
   * récapitulatif. */
  function ajouterHistorique(votreReponse: ReactNode, phaseClose: PhaseAsymptoteOblique, revele: boolean) {
    setHistorique((h) => [
      ...h,
      {
        titre: LIBELLE_PHASE_ASYMPTOTE_OBLIQUE[phaseClose],
        votreReponse,
        correcte: !revele,
        reponseAttendue: revele ? reponseAttendueAsymptoteOblique(etat.exerciceCourant, phaseClose) : undefined,
      },
    ]);
  }

  function terminerEtape(nouvelEtat: EtatSessionAsymptoteOblique, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      if (votreReponse !== undefined) ajouterHistorique(votreReponse, etat.phase, nouvelEtat.derniereEtapeRevelee);
      if (etat.niveauAide > 0) setAideParPhase((m) => ({ ...m, [etat.phase]: true }));
      setEnAttente({ etatSuivant: nouvelEtat, revele: nouvelEtat.derniereEtapeRevelee });
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
      setNumeroGeneration((g) => g + 1);
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    setHistorique([]);
    setAideParPhase({});
    setNumeroGeneration((g) => g + 1);
    setEtat(demarrerSessionAsymptoteOblique(REGLAGES_DEMO, () => construireAvecFamilleId(id)));
  }

  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const cleEcran = `${numeroGeneration}-${etat.indexExercice}-${etat.phase}`;
  const phase = etat.phase;

  const validation: ValidationEtapeProps | null = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttendueAsymptoteOblique(exercice, phase),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Asymptote oblique</h1>
        <p className="app-subtitle">Chapitre 4 — Limites et asymptotes</p>
        <ProgressionPuces segments={calculerSegmentsProgression(etat, aideParPhase)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={forcerVariante} />
      <main className="card">
        <div className="card-body">
          <RecapitulatifPanel entrees={calculerRecapitulatifAsymptoteOblique(etat)} />
          <EcranCourant
            exercice={exercice}
            phase={phase}
            etat={etat}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            cleEcran={cleEcran}
            terminerEtape={terminerEtape}
            setEtat={setEtat}
            validation={validation}
          />
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}

interface EcranProps {
  exercice: ExerciceAsymptoteOblique;
  phase: PhaseAsymptoteOblique;
  etat: EtatSessionAsymptoteOblique;
  tentativesUtilisees: number;
  tentativesMax: number;
  cleEcran: string;
  terminerEtape: (nouvelEtat: EtatSessionAsymptoteOblique, votreReponse?: ReactNode) => void;
  setEtat: (etat: EtatSessionAsymptoteOblique) => void;
  validation: ValidationEtapeProps | null;
}

function EcranCourant({
  exercice,
  phase,
  etat,
  tentativesUtilisees,
  tentativesMax,
  cleEcran,
  terminerEtape,
  setEtat,
  validation,
}: EcranProps) {
  const niveauAideMax = niveauAideMaxAsymptoteOblique();
  const onActiverAide = () => setEtat(activerAideSuivante(etat));
  const { a, b, c, coeffsD } = exercice;

  switch (phase) {
    case "diviserEuclidienne":
      return (
        <EtapeDiviserEuclidienne
          key={cleEcran}
          exercice={exercice}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponse) =>
            terminerEtape(soumettreReponseDiviserEuclidienne(etat, reponse), `quotient = ${reponse.quotient} ; reste = ${reponse.reste}`)
          }
          diagnostiquer={(r: ReponseDiviserEuclidienne) => ({
            quotient: diagnostiquerQuotient(retirerMembreGauche(r.quotient), a, b),
            reste: diagnostiquerNombre(r.reste.replace(/^\s*R\s*\(\s*x\s*\)\s*=\s*/, ""), c),
          })}
          validation={validation}
        />
      );

    case "ecrireFormeDeveloppee":
      return (
        <EtapeChampLibreAsymptote
          key={cleEcran}
          exercice={exercice}
          phase="ecrireFormeDeveloppee"
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(texte) => terminerEtape(soumettreReponseEcrireFormeDeveloppee(etat, texte), texte)}
          placeholder="ex : 7x − 11 + 9/(x − 8)"
          diagnostiquer={(t) => diagnostiquerFormeDeveloppee(retirerMembreGauche(t), a, b, c, coeffsD)}
          controleAvantValidation={(t) => {
            const saisie = retirerMembreGauche(t);
            if (diagnostiquerFormeDeveloppee(saisie, a, b, c, coeffsD) !== "correct") return null;
            return estFormeQuotientPlusReste(saisie, a, b)
              ? null
              : "Ce n'est pas encore la forme demandée : écris le quotient, puis le reste divisé par le dénominateur (ta saisie ne compte pas comme une tentative).";
          }}
          validation={validation}
        />
      );

    case "calculerCoefficientA":
      return (
        <EtapeChampLibreAsymptote
          key={cleEcran}
          exercice={exercice}
          phase="calculerCoefficientA"
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(texte) => terminerEtape(soumettreReponseCalculerCoefficientA(etat, texte), `a = ${texte}`)}
          placeholder="ex : 7"
          diagnostiquer={(t) => diagnostiquerNombre(t, a)}
          validation={validation}
        />
      );

    case "calculerCoefficientB":
      return (
        <EtapeChampLibreAsymptote
          key={cleEcran}
          exercice={exercice}
          phase="calculerCoefficientB"
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(texte) => terminerEtape(soumettreReponseCalculerCoefficientB(etat, texte), `b = ${texte}`)}
          placeholder="ex : −11"
          diagnostiquer={(t) => diagnostiquerNombre(t, b)}
          validation={validation}
        />
      );

    case "conclureEquationAsymptote":
      return (
        <EtapeChampLibreAsymptote
          key={cleEcran}
          exercice={exercice}
          phase="conclureEquationAsymptote"
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(texte) => terminerEtape(soumettreReponseConclureEquationAsymptote(etat, texte), texte)}
          placeholder="ex : 7x − 11"
          diagnostiquer={(t) => diagnostiquerQuotient(retirerMembreGauche(t), a, b)}
          validation={validation}
        />
      );
  }
}

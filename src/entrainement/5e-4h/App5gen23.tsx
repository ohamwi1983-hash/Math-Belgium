import { useState } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceLimitesContexte } from "./generateurs5e/limitesContexte";
import { estPhaseQCM, formatReponseAttendueTexte, formatReponseAttenduePhaseLatex, labelsChampsLatex } from "./ui5e/formatLimitesContexte";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import {
  activerAideSuivante,
  demarrerSessionLimitesContexte,
  niveauAideMaxLimitesContexte,
  soumettreReponseAsymptoteHorizontale,
  soumettreReponseAsymptoteObliqueClub,
  soumettreReponseConstruireC,
  soumettreReponseEvaluer,
  soumettreReponseEvaluerSeuil,
  soumettreReponseIdentification,
  soumettreReponseInequation,
  soumettreReponseInterpreter,
  soumettreReponseInterpreterPente,
  soumettreReponseLimiteC,
  soumettreReponseVASens,
} from "./moteur5e/sessionLimitesContexte";
import type { EtatSessionLimitesContexte, PhaseLimitesContexte } from "./moteur5e/typesLimitesContexte";
import {
  diagnostiquerConstructionC,
  diagnostiquerEvaluerSeuil,
  diagnostiquerNombreArrondiUnite,
  diagnostiquerNombreExact,
  diagnostiquerQuotient,
  verifierInterpretation,
} from "./moteur5e/verificationLimitesContexte";
import type { ExerciceLimitesContexte } from "./core5e/limitesContexte.types";
import { EtapeChampsLimitesContexte } from "./components5e/EtapeChampsLimitesContexte";
import { EtapeEvaluerSeuilPopulation } from "./components5e/EtapeEvaluerSeuilPopulation";
import { EtapeQCMLimitesContexte } from "./components5e/EtapeQCMLimitesContexte";
import { Katex } from "./components/Katex";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionLimitesContexte {
  return demarrerSessionLimitesContexte(REGLAGES_DEMO, genererExerciceLimitesContexte);
}

/** Réponse réellement attendue de la phase qui vient de se clore — même distinction QCM/LaTeX que
 * l'ancien `ResultatPanelLimitesContexte.tsx` (supprimé, remplacé par la validation inline). */
function reponseAttendueLimitesContexte(exercice: ExerciceLimitesContexte, phase: PhaseLimitesContexte) {
  if (estPhaseQCM(phase)) return <span>{formatReponseAttendueTexte(exercice, phase)}</span>;
  return (
    <span className="equation-box-termes">
      {formatReponseAttenduePhaseLatex(exercice, phase).map((frag, i) => (
        <Katex key={i} expression={frag} block={frag.includes("\\lim_{")} />
      ))}
    </span>
  );
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionLimitesContexte;
  revele: boolean;
}

export function App5gen23() {
  const [etat, setEtat] = useState<EtatSessionLimitesContexte>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionLimitesContexte) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      setEnAttente({ etatSuivant: nouvelEtat, revele: nouvelEtat.derniereEtapeRevelee });
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
    setEtat(demarrerSessionLimitesContexte(REGLAGES_DEMO, () => construireAvecFamilleId(id)));
  }

  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const cleEcran = `${etat.indexExercice}-${etat.phase}`;
  const phase = etat.phase;

  const validation: ValidationEtapeProps | null = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttendueLimitesContexte(exercice, phase),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Limites et asymptotes en contexte</h1>
      </header>
      <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={forcerVariante} />
      <main className="card">
        <div className="card-body">
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
    </div>
  );
}

interface EcranProps {
  exercice: ExerciceLimitesContexte;
  phase: PhaseLimitesContexte;
  etat: EtatSessionLimitesContexte;
  tentativesUtilisees: number;
  tentativesMax: number;
  cleEcran: string;
  terminerEtape: (nouvelEtat: EtatSessionLimitesContexte) => void;
  setEtat: (etat: EtatSessionLimitesContexte) => void;
  validation: ValidationEtapeProps | null;
}

function EcranCourant({ exercice, phase, etat, tentativesUtilisees, tentativesMax, cleEcran, terminerEtape, setEtat, validation }: EcranProps) {
  const niveauAideMax = niveauAideMaxLimitesContexte();
  const onActiverAide = () => setEtat(activerAideSuivante(etat));
  const propsCommunes = { tentativesUtilisees, tentativesMax, niveauAide: etat.niveauAide, niveauAideMax, onActiverAide, validation };

  if (exercice.famille === "prixRevient") {
    if (phase === "asymptoteHorizontale") {
      const { b } = exercice;
      return (
        <EtapeChampsLimitesContexte
          key={cleEcran}
          exercice={exercice}
          phase={phase}
          labels={labelsChampsLatex(exercice, phase)}
          placeholders={["ex : 20"]}
          {...propsCommunes}
          onValider={(v) => terminerEtape(soumettreReponseAsymptoteHorizontale(etat, v[0]))}
          diagnostiquer={(v) => [diagnostiquerNombreExact(v[0], b)]}
        />
      );
    }
    if (phase === "interpreter") {
      const { optionsInterpretation } = exercice;
      return (
        <EtapeQCMLimitesContexte
          key={cleEcran}
          exercice={exercice}
          phase={phase}
          options={optionsInterpretation}
          {...propsCommunes}
          onValider={(i) => terminerEtape(soumettreReponseInterpreter(etat, i))}
          verifier={(i) => verifierInterpretation(optionsInterpretation, i)}
        />
      );
    }
    if (phase === "vaSens") {
      const { optionsVASens } = exercice;
      return (
        <EtapeQCMLimitesContexte
          key={cleEcran}
          exercice={exercice}
          phase={phase}
          options={optionsVASens}
          {...propsCommunes}
          onValider={(i) => terminerEtape(soumettreReponseVASens(etat, i))}
          verifier={(i) => verifierInterpretation(optionsVASens, i)}
        />
      );
    }
  }

  if (exercice.famille === "eauSalee") {
    const { v0, r, c } = exercice;
    if (phase === "construireC") {
      return (
        <EtapeChampsLimitesContexte
          key={cleEcran}
          exercice={exercice}
          phase={phase}
          labels={labelsChampsLatex(exercice, phase)}
          placeholders={["ex : 8*5*t/(100+5*t)"]}
          champsEtroits={[false]}
          {...propsCommunes}
          onValider={(v) => terminerEtape(soumettreReponseConstruireC(etat, v[0]))}
          diagnostiquer={(v) => [diagnostiquerConstructionC(v[0], v0, r, c)]}
        />
      );
    }
    if (phase === "limiteC") {
      return (
        <EtapeChampsLimitesContexte
          key={cleEcran}
          exercice={exercice}
          phase={phase}
          labels={labelsChampsLatex(exercice, phase)}
          placeholders={["ex : 8"]}
          {...propsCommunes}
          onValider={(v) => terminerEtape(soumettreReponseLimiteC(etat, v[0]))}
          diagnostiquer={(v) => [diagnostiquerNombreExact(v[0], c)]}
        />
      );
    }
    if (phase === "interpreter") {
      const { optionsInterpretation } = exercice;
      return (
        <EtapeQCMLimitesContexte
          key={cleEcran}
          exercice={exercice}
          phase={phase}
          options={optionsInterpretation}
          {...propsCommunes}
          onValider={(i) => terminerEtape(soumettreReponseInterpreter(etat, i))}
          verifier={(i) => verifierInterpretation(optionsInterpretation, i)}
        />
      );
    }
  }

  if (exercice.famille === "clubLoisirs") {
    const { a, b, c, d, facteur, xEval, moisAttendu } = exercice;
    if (phase === "evaluer") {
      const f0 = (b - c / d) * facteur;
      const fX = (a * xEval + b - c / (xEval + d)) * facteur;
      return (
        <EtapeChampsLimitesContexte
          key={cleEcran}
          exercice={exercice}
          phase={phase}
          labels={labelsChampsLatex(exercice, phase)}
          placeholders={["ex : 250", "ex : 900"]}
          {...propsCommunes}
          onValider={(v) => terminerEtape(soumettreReponseEvaluer(etat, { valeurZero: v[0], valeurX: v[1] }))}
          diagnostiquer={(v) => [diagnostiquerNombreArrondiUnite(v[0], f0), diagnostiquerNombreArrondiUnite(v[1], fX)]}
        />
      );
    }
    if (phase === "inequation") {
      return (
        <EtapeChampsLimitesContexte
          key={cleEcran}
          exercice={exercice}
          phase={phase}
          labels={labelsChampsLatex(exercice, phase)}
          placeholders={["ex : 7"]}
          {...propsCommunes}
          onValider={(v) => terminerEtape(soumettreReponseInequation(etat, v[0]))}
          diagnostiquer={(v) => [diagnostiquerNombreExact(v[0], moisAttendu)]}
        />
      );
    }
    if (phase === "asymptoteOblique") {
      return (
        <EtapeChampsLimitesContexte
          key={cleEcran}
          exercice={exercice}
          phase={phase}
          labels={labelsChampsLatex(exercice, phase)}
          placeholders={["ex : 3x+2"]}
          champsEtroits={[false]}
          {...propsCommunes}
          onValider={(v) => terminerEtape(soumettreReponseAsymptoteObliqueClub(etat, v[0]))}
          diagnostiquer={(v) => [diagnostiquerQuotient(v[0], a, b)]}
        />
      );
    }
    if (phase === "interpreterPente") {
      return (
        <EtapeChampsLimitesContexte
          key={cleEcran}
          exercice={exercice}
          phase={phase}
          labels={labelsChampsLatex(exercice, phase)}
          placeholders={["ex : 300"]}
          {...propsCommunes}
          onValider={(v) => terminerEtape(soumettreReponseInterpreterPente(etat, v[0]))}
          diagnostiquer={(v) => [diagnostiquerNombreExact(v[0], a * facteur)]}
        />
      );
    }
  }

  if (exercice.famille === "population") {
    const { a, b, p, anneeRef, anneeEval, seuil } = exercice;
    if (phase === "identification") {
      return (
        <EtapeChampsLimitesContexte
          key={cleEcran}
          exercice={exercice}
          phase={phase}
          labels={labelsChampsLatex(exercice, phase)}
          placeholders={["ex : 5", "ex : 10"]}
          {...propsCommunes}
          onValider={(v) => terminerEtape(soumettreReponseIdentification(etat, { a: v[0], b: v[1] }))}
          diagnostiquer={(v) => [diagnostiquerNombreExact(v[0], a), diagnostiquerNombreExact(v[1], b)]}
        />
      );
    }
    if (phase === "interpreter") {
      const { optionsInterpretation } = exercice;
      return (
        <EtapeQCMLimitesContexte
          key={cleEcran}
          exercice={exercice}
          phase={phase}
          options={optionsInterpretation}
          {...propsCommunes}
          onValider={(i) => terminerEtape(soumettreReponseInterpreter(etat, i))}
          verifier={(i) => verifierInterpretation(optionsInterpretation, i)}
        />
      );
    }
    if (phase === "evaluerSeuil") {
      const x = anneeEval - anneeRef;
      const cible = a / (x + p) + b;
      return (
        <EtapeEvaluerSeuilPopulation
          key={cleEcran}
          exercice={exercice}
          {...propsCommunes}
          onValider={(r) => terminerEtape(soumettreReponseEvaluerSeuil(etat, r))}
          diagnostiquer={(r) => diagnostiquerEvaluerSeuil(r, cible, seuil)}
        />
      );
    }
  }

  return null;
}

import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceLimitesContexte } from "./generateurs5e/limitesContexte";
import {
  consigneGenerale,
  estPhaseQCM,
  formatContexteTexte,
  formatReponseAttendueTexte,
  formatReponseAttenduePhaseLatex,
  formatTermesDonneesLatex,
  labelsChampsLatex,
} from "./ui5e/formatLimitesContexte";
import { EnTeteExercice } from "./components5e/EnTeteExercice";
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
import { ordreComplet } from "./moteur5e/typesLimitesContexte";
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
import { calculerRecapitulatifLimitesContexte } from "./ui5e/recapitulatifLimitesContexte";
import { RecapitulatifPanel } from "./components5e/RecapitulatifPanel";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3 };

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

/** Une puce par phase de `ordreComplet(etat.exerciceCourant)` — séquence RÉELLE propre à la
 * famille du tirage (4 familles fixes, chacune sa propre séquence), jamais un `ORDRE_PHASES` fixe
 * reconstitué à la main : même source que `calculerRecapitulatifLimitesContexte`. "courante" pour
 * `etat.phase`, "correcte"/"revele" pour les phases déjà closes (`scoresPartiels[phase]`, 0 ⟺
 * révélée), "a-venir" au-delà. */
function calculerSegmentsProgression(
  etat: EtatSessionLimitesContexte,
  aideParPhase: Partial<Record<PhaseLimitesContexte, boolean>>,
): EtatPuceProgression[] {
  return ordreComplet(etat.exerciceCourant).map((phase) => {
    if (phase === etat.phase) return "courante";
    const score = etat.scoresPartiels[phase];
    if (score === undefined) return "a-venir";
    if (score === 0) return "revele";
    return aideParPhase[phase] ? "aide" : "correcte";
  });
}

export function App5gen23() {
  const [etat, setEtat] = useState<EtatSessionLimitesContexte>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos — tenu ICI, à part de
   * `EtatSessionLimitesContexte`, jamais dans le moteur (même principe que `AppAnalyseFonction.tsx`, 4e). */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Niveau d'aide RÉELLEMENT utilisé par phase close — capturé ici (présentation), `niveauAide`
   * (moteur) étant remis à 0 à chaque transition (même patron que `App5gen31.tsx::aideParPhase`). */
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<PhaseLimitesContexte, boolean>>>({});

  function ajouterHistorique(votreReponse: ReactNode, nouvelEtat: EtatSessionLimitesContexte) {
    const recap = calculerRecapitulatifLimitesContexte(nouvelEtat);
    const derniere = recap[recap.length - 1];
    if (!derniere) return;
    setHistorique((h) => [
      ...h,
      {
        titre: derniere.libelle,
        votreReponse,
        correcte: !derniere.revele,
        reponseAttendue: derniere.revele ? (derniere.estLatex ? <Katex expression={derniere.valeur} /> : derniere.valeur) : undefined,
      },
    ]);
  }

  function terminerEtape(nouvelEtat: EtatSessionLimitesContexte, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      if (votreReponse !== undefined) ajouterHistorique(votreReponse, nouvelEtat);
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
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    setHistorique([]);
    setAideParPhase({});
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
        <ProgressionPuces segments={calculerSegmentsProgression(etat, aideParPhase)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={forcerVariante} />
      <main className="card">
        <div className="card-body">
          <EnTeteExercice
            consigneGenerale={
              <>
                {consigneGenerale()}
                <br />
                {formatContexteTexte(exercice)}
              </>
            }
            blocDonnees={
              <div className="equation-box equation-box-donnees">
                {formatTermesDonneesLatex(exercice).map((frag, i) => (
                  <Katex key={i} expression={frag} />
                ))}
              </div>
            }
          />
          <RecapitulatifPanel entrees={calculerRecapitulatifLimitesContexte(etat)} />
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
  exercice: ExerciceLimitesContexte;
  phase: PhaseLimitesContexte;
  etat: EtatSessionLimitesContexte;
  tentativesUtilisees: number;
  tentativesMax: number;
  cleEcran: string;
  terminerEtape: (nouvelEtat: EtatSessionLimitesContexte, votreReponse?: ReactNode) => void;
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
          onValider={(v) => terminerEtape(soumettreReponseAsymptoteHorizontale(etat, v[0]), v[0])}
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
          onValider={(i) => terminerEtape(soumettreReponseInterpreter(etat, i), i !== null ? optionsInterpretation[i].texte : "")}
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
          onValider={(i) => terminerEtape(soumettreReponseVASens(etat, i), i !== null ? optionsVASens[i].texte : "")}
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
          onValider={(v) => terminerEtape(soumettreReponseConstruireC(etat, v[0]), `C(t) = ${v[0]}`)}
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
          onValider={(v) => terminerEtape(soumettreReponseLimiteC(etat, v[0]), `lim = ${v[0]}`)}
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
          onValider={(i) => terminerEtape(soumettreReponseInterpreter(etat, i), i !== null ? optionsInterpretation[i].texte : "")}
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
          onValider={(v) =>
            terminerEtape(soumettreReponseEvaluer(etat, { valeurZero: v[0], valeurX: v[1] }), `f(0) = ${v[0]} ; f(${xEval}) = ${v[1]}`)
          }
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
          onValider={(v) => terminerEtape(soumettreReponseInequation(etat, v[0]), v[0])}
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
          onValider={(v) => terminerEtape(soumettreReponseAsymptoteObliqueClub(etat, v[0]), `y = ${v[0]}`)}
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
          onValider={(v) => terminerEtape(soumettreReponseInterpreterPente(etat, v[0]), v[0])}
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
          onValider={(v) => terminerEtape(soumettreReponseIdentification(etat, { a: v[0], b: v[1] }), `a = ${v[0]} ; b = ${v[1]}`)}
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
          onValider={(i) => terminerEtape(soumettreReponseInterpreter(etat, i), i !== null ? optionsInterpretation[i].texte : "")}
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
          onValider={(r) =>
            terminerEtape(
              soumettreReponseEvaluerSeuil(etat, r),
              `${r.valeur} (${r.comparaison === "superieur" ? "Supérieur au seuil" : "Inférieur au seuil"})`,
            )
          }
          diagnostiquer={(r) => diagnostiquerEvaluerSeuil(r, cible, seuil)}
        />
      );
    }
  }

  return null;
}

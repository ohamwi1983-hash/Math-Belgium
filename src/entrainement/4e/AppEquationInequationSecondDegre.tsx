import { useState } from "react";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideSuivante,
  demarrerSessionEquationInequationSecondDegre,
  soumettreReponseInterpretation,
  soumettreReponseIsolerSubstituer,
  soumettreReponsePoserEquationInequation,
  soumettreReponsePoserSysteme,
  soumettreReponseResoudre,
  soumettreReponseValidationEquation,
  soumettreReponseValidationInequation,
} from "./moteur/sessionEquationInequationSecondDegre";
import type { EtatSessionEquationInequationSecondDegre, PhaseEquationInequationSecondDegre } from "./moteur/typesEquationInequationSecondDegre";
import {
  CATALOGUE_FAMILLES,
  CATALOGUE_VARIANTES,
  PAIRES_VALIDES,
  construireAvecFamilleId,
  genererExerciceEquationInequationSecondDegre,
} from "./generateurs/equationInequationSecondDegre";
import type { FamilleEquationInequationSecondDegre, VarianteEquationInequationSecondDegre } from "./core/equationInequationSecondDegre.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { RecapitulatifPanel } from "./components/RecapitulatifPanel";
import { calculerRecapitulatifEquationInequationSecondDegre } from "./ui/recapitulatifEquationInequationSecondDegre";
import { EtapePoserSystemeEquationInequationSecondDegre } from "./components/EtapePoserSystemeEquationInequationSecondDegre";
import { EtapePoserEquationInequationSecondDegre } from "./components/EtapePoserEquationInequationSecondDegre";
import { EtapeResoudreEquationInequationSecondDegre } from "./components/EtapeResoudreEquationInequationSecondDegre";
import { EtapeValidationEquationInequationSecondDegre } from "./components/EtapeValidationEquationInequationSecondDegre";
import { EtapeInterpretationEquationInequationSecondDegre } from "./components/EtapeInterpretationEquationInequationSecondDegre";
import { QuestionFinale } from "./components/QuestionFinale";
import { formatEquationInequationLatex, formatResolutionAttendueTexte, formatValidationAttendueTexte, texteAidePoserSystemeNiveau2 } from "./ui/formatEquationInequationSecondDegre";
import { Katex } from "./components/Katex";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionEquationInequationSecondDegre {
  return demarrerSessionEquationInequationSecondDegre(REGLAGES_DEMO, genererExerciceEquationInequationSecondDegre);
}

const LABEL_FAMILLE: Record<FamilleEquationInequationSecondDegre, string> = Object.fromEntries(
  CATALOGUE_FAMILLES.map((f) => [f.id, f.label]),
) as Record<FamilleEquationInequationSecondDegre, string>;
const LABEL_VARIANTE: Record<VarianteEquationInequationSecondDegre, string> = Object.fromEntries(
  CATALOGUE_VARIANTES.map((v) => [v.id, v.label]),
) as Record<VarianteEquationInequationSecondDegre, string>;

/** Combine les 2 axes (famille × variante) — SelecteurVarianteDev n'expose qu'un seul menu, donc
 * chaque paire réellement tirable (PAIRES_VALIDES) devient une option unique de ce menu. */
const OPTIONS_DEV = PAIRES_VALIDES.map((p) => ({
  id: `${p.familleId}::${p.varianteId}`,
  label: `${LABEL_FAMILLE[p.familleId]} — ${LABEL_VARIANTE[p.varianteId]}`,
}));

/** Séquence dépendant de `exercice.voieSysteme` (architecture D vs A/B/C — voir
 * `typesEquationInequationSecondDegre.ts`) : "interpretation" (dernière phase des 2 chemins) n'a
 * jamais besoin de sa propre branche "close" ci-dessous — jamais consultée comme phase passée.
 * Puces purement visuelles (pas de `onSegmentClick`). */
function sequencePourExercice(exercice: EtatSessionEquationInequationSecondDegre["exerciceCourant"]): PhaseEquationInequationSecondDegre[] {
  return exercice.voieSysteme
    ? ["poserSysteme", "isolerSubstituer", "resoudre", "validation", "interpretation"]
    : ["poserEquationInequation", "resoudre", "validation", "interpretation"];
}

function calculerSegmentsProgression(etat: EtatSessionEquationInequationSecondDegre): EtatPuceProgression[] {
  const sequence = sequencePourExercice(etat.exerciceCourant);
  const indexCourant = sequence.indexOf(etat.phase);
  return sequence.map((phase, index) => {
    if (index === indexCourant) return "courante";
    if (index > indexCourant) return "a-venir";
    const revele =
      phase === "poserSysteme"
        ? etat.poserSystemeRevele
        : phase === "isolerSubstituer"
          ? etat.isolerSubstituerRevele
          : phase === "poserEquationInequation"
            ? etat.poserEquationInequationRevele
            : phase === "resoudre"
              ? etat.resoudreRevele
              : etat.validationRevele;
    if (revele) return "revele";
    const niveauAide =
      phase === "poserSysteme"
        ? etat.niveauAidePoserSysteme
        : phase === "isolerSubstituer"
          ? etat.niveauAideIsolerSubstituer
          : phase === "poserEquationInequation"
            ? etat.niveauAidePoserEquationInequation
            : phase === "resoudre"
              ? etat.niveauAideResoudre
              : etat.niveauAideValidation;
    return niveauAide > 0 ? "aide" : "correcte";
  });
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionEquationInequationSecondDegre;
  revele: boolean;
}

export function AppEquationInequationSecondDegre() {
  const [etat, setEtat] = useState<EtatSessionEquationInequationSecondDegre>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionEquationInequationSecondDegre) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele = (() => {
        switch (etat.phase) {
          case "poserSysteme":
            return nouvelEtat.poserSystemeRevele;
          case "isolerSubstituer":
            return nouvelEtat.isolerSubstituerRevele;
          case "poserEquationInequation":
            return nouvelEtat.poserEquationInequationRevele;
          case "resoudre":
            return nouvelEtat.resoudreRevele;
          case "validation":
            return nouvelEtat.validationRevele;
          case "interpretation":
            return nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.interpretationRevele;
        }
      })();
      setEnAttente({ etatSuivant: nouvelEtat, revele });
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
    const [familleId, varianteId] = id.split("::") as [FamilleEquationInequationSecondDegre, VarianteEquationInequationSecondDegre];
    setEnAttente(null);
    setEtat(demarrerSessionEquationInequationSecondDegre(REGLAGES_DEMO, () => construireAvecFamilleId(familleId, varianteId)));
  }

  const exercice = etat.exerciceCourant;
  const optionCorrecte = exercice.optionsInterpretation.find((option) => option.correcte);

  const recapitulatif = calculerRecapitulatifEquationInequationSecondDegre(etat);

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: !etat.reglages.affichageReponseApresEchec ? undefined : (() => {
          switch (etat.phase) {
            case "poserSysteme":
              return <Katex expression={texteAidePoserSystemeNiveau2(exercice)} />;
            case "isolerSubstituer":
              return <Katex expression={formatEquationInequationLatex(exercice)} />;
            case "poserEquationInequation":
              return <Katex expression={formatEquationInequationLatex(exercice)} />;
            case "resoudre":
              return <>{formatResolutionAttendueTexte(exercice)}</>;
            case "validation":
              return <>{formatValidationAttendueTexte(exercice)}</>;
            case "interpretation":
              return optionCorrecte ? <>{optionCorrecte.texte}</> : undefined;
          }
        })(),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Équations/inéquations du second degré en contexte</h1>
        <p className="app-subtitle">Chapitre 1</p>
        <SelecteurVarianteDev options={OPTIONS_DEV} onGenerer={forcerVariante} />
      </header>

      <main className="card">
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} />

        <div className="card-body">
          <RecapitulatifPanel entrees={recapitulatif} />
          <QuestionFinale question={exercice.questionFinale} />
          {etat.phase === "poserSysteme" ? (
            <EtapePoserSystemeEquationInequationSecondDegre
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAidePoserSysteme}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponsePoserSysteme(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "isolerSubstituer" ? (
            <EtapePoserEquationInequationSecondDegre
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideIsolerSubstituer}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => terminerEtape(soumettreReponseIsolerSubstituer(etat, texte))}
              validation={validation}
            />
          ) : etat.phase === "poserEquationInequation" ? (
            <EtapePoserEquationInequationSecondDegre
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAidePoserEquationInequation}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => terminerEtape(soumettreReponsePoserEquationInequation(etat, texte))}
              validation={validation}
            />
          ) : etat.phase === "resoudre" ? (
            <EtapeResoudreEquationInequationSecondDegre
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideResoudre}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(valeurs) => terminerEtape(soumettreReponseResoudre(etat, valeurs))}
              validation={validation}
            />
          ) : etat.phase === "validation" ? (
            <EtapeValidationEquationInequationSecondDegre
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideValidation}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValiderEquation={(reponses) => terminerEtape(soumettreReponseValidationEquation(etat, reponses))}
              onValiderInequation={(reponse) => terminerEtape(soumettreReponseValidationInequation(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "interpretation" ? (
            <EtapeInterpretationEquationInequationSecondDegre
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideInterpretation}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(indexChoisi) => terminerEtape(soumettreReponseInterpretation(etat, indexChoisi))}
              validation={validation}
            />
          ) : null}
        </div>
      </main>
    </div>
  );
}

import { useRef, useState } from "react";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideSuivante,
  demarrerSessionEquationInequationSecondDegre,
  soumettreReponseContrainteEtGrandeur,
  soumettreReponseDomaine,
  soumettreReponseEliminerSysteme,
  soumettreReponseIdentification,
  soumettreReponseInterpretation,
  soumettreReponsePoserEquationInequation,
  soumettreReponsePoserSysteme,
  soumettreReponseResoudre,
  soumettreReponseSysteme,
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
import { EtapePoserSystemeEquationInequationSecondDegre } from "./components/EtapePoserSystemeEquationInequationSecondDegre";
import { EtapeEliminerSystemeEquationInequationSecondDegre } from "./components/EtapeEliminerSystemeEquationInequationSecondDegre";
import { EtapeIdentificationOptimisation } from "./components/EtapeIdentificationOptimisation";
import { EtapeContrainteEtGrandeurOptimisation } from "./components/EtapeContrainteEtGrandeurOptimisation";
import { EtapeSystemeOptimisation } from "./components/EtapeSystemeOptimisation";
import { EtapeDomaineOptimisation } from "./components/EtapeDomaineOptimisation";
import { EtapePoserEquationInequationSecondDegre } from "./components/EtapePoserEquationInequationSecondDegre";
import { EtapeResoudreEquationInequationSecondDegre } from "./components/EtapeResoudreEquationInequationSecondDegre";
import { EtapeValidationEquationInequationSecondDegre } from "./components/EtapeValidationEquationInequationSecondDegre";
import { EtapeInterpretationEquationInequationSecondDegre } from "./components/EtapeInterpretationEquationInequationSecondDegre";
import { QuestionFinale } from "./components/QuestionFinale";
import { formatDomaineLatex, formatFonctionDeveloppeeLatex, formatSystemeAccoladeLatex } from "./ui/formatOptimisation";
import {
  formatEquationInequationLatex,
  formatResolutionAttendueTexte,
  formatValidationAttendueTexte,
  texteAideEliminerSystemeNiveau2,
  texteAidePoserSystemeNiveau2,
} from "./ui/formatEquationInequationSecondDegre";
import { Katex } from "./components/Katex";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
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

const LIBELLE_PHASE: Record<PhaseEquationInequationSecondDegre, string> = {
  poserSysteme: "Poser le système",
  eliminerSysteme: "Éliminer le terme xy",
  identification: "Identifier x et y",
  contrainteEtGrandeur: "Poser la contrainte et exprimer la grandeur",
  systeme: "Résoudre le système",
  domaine: "Domaine de validité",
  poserEquationInequation: "Poser l'équation/l'inéquation",
  resoudre: "Résolution",
  validation: "Validation contextuelle",
  interpretation: "Interprétation",
};

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
          case "eliminerSysteme":
            return nouvelEtat.eliminerSystemeRevele;
          case "identification":
            return nouvelEtat.identificationRevele;
          case "contrainteEtGrandeur":
            return nouvelEtat.contrainteEtGrandeurRevele;
          case "systeme":
            return nouvelEtat.systemeRevele;
          case "domaine":
            return nouvelEtat.domaineRevele;
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
  const phase = etat.phase;
  const optionCorrecte = exercice.optionsInterpretation.find((option) => option.correcte);

  /** `estPremierEcran` : vrai uniquement sur le premier écran vu pour CET `exercice` (voir
   * `EnTeteExercice.tsx`, option 1B "plein puis compact"). */
  const premierePhaseRef = useRef(phase);
  const dernierExerciceRef = useRef(exercice);
  if (dernierExerciceRef.current !== exercice) {
    dernierExerciceRef.current = exercice;
    premierePhaseRef.current = phase;
  }
  const estPremierEcran = phase === premierePhaseRef.current;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: !etat.reglages.affichageReponseApresEchec ? undefined : (() => {
          switch (etat.phase) {
            case "poserSysteme":
              return <Katex expression={texteAidePoserSystemeNiveau2(exercice)} />;
            case "eliminerSysteme":
              return <Katex expression={texteAideEliminerSystemeNiveau2(exercice)} />;
            case "identification":
              return undefined;
            case "contrainteEtGrandeur":
              return exercice.base.variante === "modelisation" ? (
                <Katex expression={formatSystemeAccoladeLatex(exercice.base)} />
              ) : undefined;
            case "systeme":
              return exercice.base.variante === "modelisation" ? (
                <Katex expression={formatFonctionDeveloppeeLatex(exercice.base.fonction, exercice.base.contexte.labelVariable)} />
              ) : undefined;
            case "domaine":
              return <Katex expression={formatDomaineLatex(exercice.base.domaine, exercice.base.contexte.labelVariable)} />;
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
        <div className="card-progress">
          <div className="card-progress-row">
            <span className="card-progress-phase">{LIBELLE_PHASE[etat.phase]}</span>
          </div>
        </div>

        <div className="card-body">
          <QuestionFinale question={exercice.questionFinale} />
          {etat.phase === "poserSysteme" ? (
            <EtapePoserSystemeEquationInequationSecondDegre
              exercice={exercice}
              estPremierEcran={estPremierEcran}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAidePoserSysteme}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponsePoserSysteme(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "eliminerSysteme" ? (
            <EtapeEliminerSystemeEquationInequationSecondDegre
              exercice={exercice}
              estPremierEcran={estPremierEcran}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideEliminerSysteme}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => terminerEtape(soumettreReponseEliminerSysteme(etat, texte))}
              validation={validation}
            />
          ) : etat.phase === "identification" && exercice.base.variante === "modelisation" ? (
            <EtapeIdentificationOptimisation
              exercice={exercice.base}
              estPremierEcran={estPremierEcran}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={(reponse) => terminerEtape(soumettreReponseIdentification(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "contrainteEtGrandeur" && exercice.base.variante === "modelisation" ? (
            <EtapeContrainteEtGrandeurOptimisation
              exercice={exercice.base}
              estPremierEcran={estPremierEcran}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideContrainteEtGrandeur}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseContrainteEtGrandeur(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "systeme" && exercice.base.variante === "modelisation" ? (
            <EtapeSystemeOptimisation
              exercice={exercice.base}
              estPremierEcran={estPremierEcran}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideSysteme}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => terminerEtape(soumettreReponseSysteme(etat, texte))}
              validation={validation}
            />
          ) : etat.phase === "domaine" && exercice.base.variante === "modelisation" ? (
            <EtapeDomaineOptimisation
              exercice={exercice.base}
              estPremierEcran={estPremierEcran}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideDomaine}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseDomaine(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "poserEquationInequation" ? (
            <EtapePoserEquationInequationSecondDegre
              exercice={exercice}
              estPremierEcran={estPremierEcran}
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
              estPremierEcran={estPremierEcran}
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
              estPremierEcran={estPremierEcran}
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
              estPremierEcran={estPremierEcran}
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

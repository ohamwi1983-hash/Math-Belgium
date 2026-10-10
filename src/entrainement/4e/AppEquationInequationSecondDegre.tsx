import { useState } from "react";
import type { ExerciceEquationInequationSecondDegre } from "./core/equationInequationSecondDegre.types";
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
import type {
  EtatSessionEquationInequationSecondDegre,
  PhaseEquationInequationSecondDegre,
  ResultatExerciceEquationInequationSecondDegre,
} from "./moteur/typesEquationInequationSecondDegre";
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
import { ResultatPanelEquationInequationSecondDegre } from "./components/ResultatPanelEquationInequationSecondDegre";
import { ResumeSessionEquationInequationSecondDegre } from "./components/ResumeSessionEquationInequationSecondDegre";

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

interface Bilan {
  resultat: ResultatExerciceEquationInequationSecondDegre;
  exercice: ExerciceEquationInequationSecondDegre;
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

export function AppEquationInequationSecondDegre() {
  const [etat, setEtat] = useState<EtatSessionEquationInequationSecondDegre>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(exerciceTermine: ExerciceEquationInequationSecondDegre, nouvelEtat: EtatSessionEquationInequationSecondDegre) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;

  function onGenererDev(id: string) {
    const [familleId, varianteId] = id.split("::") as [FamilleEquationInequationSecondDegre, VarianteEquationInequationSecondDegre];
    setDernierBilan(null);
    setEtat(demarrerSessionEquationInequationSecondDegre(REGLAGES_DEMO, () => construireAvecFamilleId(familleId, varianteId)));
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Équations/inéquations du second degré en contexte</h1>
        <p className="app-subtitle">Chapitre 1</p>
        <SelecteurVarianteDev options={OPTIONS_DEV} onGenerer={onGenererDev} />
      </header>

      <main className="card">
        {enCoursDeSession && (
          <div className="card-progress">
            <div className="card-progress-row">
              <span className="card-progress-step">
                Exercice {etat.indexExercice + 1} / {etat.reglages.nombreExercices}
              </span>
              <span className="card-progress-phase">{LIBELLE_PHASE[etat.phase]}</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${(etat.indexExercice / etat.reglages.nombreExercices) * 100}%` }} />
            </div>
          </div>
        )}

        <div className="card-body">
          {enCoursDeSession && <QuestionFinale question={exercice.questionFinale} />}
          {dernierBilan ? (
            <ResultatPanelEquationInequationSecondDegre
              resultat={dernierBilan.resultat}
              exercice={dernierBilan.exercice}
              afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
              labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
              onContinuer={() => setDernierBilan(null)}
            />
          ) : etat.terminee ? (
            <ResumeSessionEquationInequationSecondDegre resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          ) : etat.phase === "poserSysteme" ? (
            <EtapePoserSystemeEquationInequationSecondDegre
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAidePoserSysteme}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => setEtat(soumettreReponsePoserSysteme(etat, reponse))}
            />
          ) : etat.phase === "eliminerSysteme" ? (
            <EtapeEliminerSystemeEquationInequationSecondDegre
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideEliminerSysteme}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => setEtat(soumettreReponseEliminerSysteme(etat, texte))}
            />
          ) : etat.phase === "identification" && exercice.base.variante === "modelisation" ? (
            <EtapeIdentificationOptimisation
              exercice={exercice.base}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={(reponse) => setEtat(soumettreReponseIdentification(etat, reponse))}
            />
          ) : etat.phase === "contrainteEtGrandeur" && exercice.base.variante === "modelisation" ? (
            <EtapeContrainteEtGrandeurOptimisation
              exercice={exercice.base}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideContrainteEtGrandeur}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => setEtat(soumettreReponseContrainteEtGrandeur(etat, reponse))}
            />
          ) : etat.phase === "systeme" && exercice.base.variante === "modelisation" ? (
            <EtapeSystemeOptimisation
              exercice={exercice.base}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideSysteme}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => setEtat(soumettreReponseSysteme(etat, texte))}
            />
          ) : etat.phase === "domaine" && exercice.base.variante === "modelisation" ? (
            <EtapeDomaineOptimisation
              exercice={exercice.base}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideDomaine}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => setEtat(soumettreReponseDomaine(etat, reponse))}
            />
          ) : etat.phase === "poserEquationInequation" ? (
            <EtapePoserEquationInequationSecondDegre
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAidePoserEquationInequation}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => setEtat(soumettreReponsePoserEquationInequation(etat, texte))}
            />
          ) : etat.phase === "resoudre" ? (
            <EtapeResoudreEquationInequationSecondDegre
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideResoudre}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(valeurs) => setEtat(soumettreReponseResoudre(etat, valeurs))}
            />
          ) : etat.phase === "validation" ? (
            <EtapeValidationEquationInequationSecondDegre
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideValidation}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValiderEquation={(reponses) => setEtat(soumettreReponseValidationEquation(etat, reponses))}
              onValiderInequation={(reponse) => setEtat(soumettreReponseValidationInequation(etat, reponse))}
            />
          ) : etat.phase === "interpretation" ? (
            <EtapeInterpretationEquationInequationSecondDegre
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideInterpretation}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(indexChoisi) => {
                const exerciceTermine = exercice;
                terminerEtape(exerciceTermine, soumettreReponseInterpretation(etat, indexChoisi));
              }}
            />
          ) : null}{" "}
        </div>
      </main>
    </div>
  );
}

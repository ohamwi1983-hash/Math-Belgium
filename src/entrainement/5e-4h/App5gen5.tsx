import { useState } from "react";
import type { ExerciceProblemeContexte } from "./core5e/problemesContexte.types";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { genererExerciceProblemeContexte } from "./generateurs5e/problemesContexte";
import {
  construireScenarioAConteneur,
  construireScenarioADeuxParaboles,
  construireScenarioAIntensiteCable,
  construireScenarioARacineAffine,
  construireScenarioAStockCommande,
} from "./generateurs5e/problemesContexte/scenarioA";
import { construireScenarioBAvecModele } from "./generateurs5e/problemesContexte/scenarioB";
import { construireScenarioCAvecFormes } from "./generateurs5e/problemesContexte/scenarioC";
import type { FormeChiffreAffairesC, FormeCoutVariableC } from "./core5e/problemesContexte.types";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";

const LABEL_FORME_CV: Record<FormeCoutVariableC, string> = { racineCarree: "CV=k√x", racineCubique: "CV=k∛x", carre: "CV=kx²", cube: "CV=kx³" };
const LABEL_FORME_CA: Record<FormeChiffreAffairesC, string> = { affine: "CA=px", racineCarree: "CA=p√x", racineCubique: "CA=p∛x" };
const FORMES_CV: FormeCoutVariableC[] = ["racineCarree", "racineCubique", "carre", "cube"];
const FORMES_CA: FormeChiffreAffairesC[] = ["affine", "racineCarree", "racineCubique"];

const GENERATEURS_SCENARIO: Record<string, () => ExerciceProblemeContexte> = {
  A1: () => construireScenarioAConteneur(),
  A2: () => construireScenarioAStockCommande(),
  A3: () => construireScenarioARacineAffine(),
  A4: () => construireScenarioAIntensiteCable(),
  A5: () => construireScenarioADeuxParaboles(),
  B1: () => construireScenarioBAvecModele("B1"),
  B2: () => construireScenarioBAvecModele("B2"),
  B3: () => construireScenarioBAvecModele("B3"),
  B4: () => construireScenarioBAvecModele("B4"),
  B5: () => construireScenarioBAvecModele("B5"),
};
const OPTIONS_SCENARIO = [
  { id: "A1", label: "A1 — bidons cylindriques (k/x vs ax²)" },
  { id: "A2", label: "A2 — stock/commande (ax+b vs k/x)" },
  { id: "A3", label: "A3 — racine/affine (k√x vs b-ax)" },
  { id: "A4", label: "A4 — intensité/câble (k/x² vs ax)" },
  { id: "A5", label: "A5 — deux paraboles" },
  { id: "B1", label: "B1 — coût unitaire cu(x)=a+b/x" },
  { id: "B2", label: "B2 — coût unitaire cu(x)=a+bx" },
  { id: "B3", label: "B3 — coût unitaire cu(x)=a+b/x²" },
  { id: "B4", label: "B4 — coût unitaire cu(x)=a/x+b/x²" },
  { id: "B5", label: "B5 — coût unitaire cu(x)=ax+b/x" },
];
for (const formeCV of FORMES_CV) {
  for (const formeCA of FORMES_CA) {
    const id = `C-${formeCV}-${formeCA}`;
    GENERATEURS_SCENARIO[id] = () => construireScenarioCAvecFormes(formeCV, formeCA);
    OPTIONS_SCENARIO.push({ id, label: `C — ${LABEL_FORME_CV[formeCV]} / ${LABEL_FORME_CA[formeCA]}` });
  }
}
import {
  activerAideSuivante,
  demarrerSessionProblemeContexte,
  niveauAideMaxPhase,
  soumettreReponseBeneficeC,
  soumettreReponseCoutMoyenC,
  soumettreReponseEgaliteAiresA,
  soumettreReponseEvaluationB,
  soumettreReponseExtremumSimpleA,
  soumettreReponseFormuleB,
  soumettreReponseGeneralisationA,
  soumettreReponseGeneralisationSimpleA,
  soumettreReponseGraphiqueA,
  soumettreReponseIntersectionSimpleA,
  soumettreReponseJustificationA,
  soumettreReponseLectureC,
  soumettreReponseReconnaissanceC,
  soumettreReponseResolutionB,
  soumettreReponseSeuilC,
  soumettreReponseSystemeB,
  soumettreReponseTableauA,
} from "./moteur5e/sessionProblemesContexte";
import type { EtatSessionProblemeContexte, PhaseProblemeContexte, ResultatExerciceProblemeContexte } from "./moteur5e/typesProblemesContexte";
import { consigneContexteAReduit, consigneContexteC, consigneVolumeA } from "./ui5e/formatProblemesContexte";
import { BlocContexteB } from "./components5e/BlocContexteB";
import { EtapeBeneficeC } from "./components5e/EtapeBeneficeC";
import { EtapeCoutMoyenC } from "./components5e/EtapeCoutMoyenC";
import { EtapeEgaliteAiresA } from "./components5e/EtapeEgaliteAiresA";
import { EtapeEvaluationB } from "./components5e/EtapeEvaluationB";
import { EtapeExtremumSimpleA } from "./components5e/EtapeExtremumSimpleA";
import { EtapeFormuleB } from "./components5e/EtapeFormuleB";
import { EtapeGeneralisationA } from "./components5e/EtapeGeneralisationA";
import { EtapeGeneralisationSimpleA } from "./components5e/EtapeGeneralisationSimpleA";
import { EtapeGraphiqueA } from "./components5e/EtapeGraphiqueA";
import { EtapeIntersectionSimpleA } from "./components5e/EtapeIntersectionSimpleA";
import { EtapeJustificationA } from "./components5e/EtapeJustificationA";
import { EtapeLectureC } from "./components5e/EtapeLectureC";
import { EtapeReconnaissanceC } from "./components5e/EtapeReconnaissanceC";
import { EtapeResolutionB } from "./components5e/EtapeResolutionB";
import { EtapeSeuilC } from "./components5e/EtapeSeuilC";
import { EtapeSystemeB } from "./components5e/EtapeSystemeB";
import { EtapeTableauA } from "./components5e/EtapeTableauA";
import { CalculatriceScientifique } from "./components5e/CalculatriceScientifique";
import { ResultatPanelProblemeContexte } from "./components5e/ResultatPanelProblemeContexte";
import { ResumeSessionProblemeContexte } from "./components5e/ResumeSessionProblemeContexte";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionProblemeContexte {
  return demarrerSessionProblemeContexte(REGLAGES_DEMO, genererExerciceProblemeContexte);
}

interface Bilan {
  resultat: ResultatExerciceProblemeContexte;
  aideParPhase: Partial<Record<PhaseProblemeContexte, number>>;
}

export function App5gen5() {
  const [etat, setEtat] = useState<EtatSessionProblemeContexte>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<PhaseProblemeContexte, number>>>({});

  function terminerEtape(nouvelEtat: EtatSessionProblemeContexte) {
    const miseAJour = { ...aideParPhase, [etat.phase]: etat.niveauAide };
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], aideParPhase: miseAJour });
      setAideParPhase({});
    } else {
      setAideParPhase(miseAJour);
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const niveauAideMax = enCoursDeSession ? niveauAideMaxPhase(etat.phase) : 0;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Problèmes-contexte</h1>
      </header>
      <SelecteurVarianteDev
        options={OPTIONS_SCENARIO}
        onGenerer={(id) => {
          setDernierBilan(null);
          setEtat(demarrerSessionProblemeContexte(REGLAGES_DEMO, GENERATEURS_SCENARIO[id]));
        }}
      />
      <main className="card">
        <div className="card-body">
          {enCoursDeSession && (
            <>
              {exercice.scenario === "A" && exercice.combo === "kInverseXAxCarre" && etat.phase === "tableau" && (
                <EtapeTableauA
                  exercice={exercice}
                  donnees={<div className="equation-box">{consigneVolumeA(exercice)}</div>}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMax}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(r) => terminerEtape(soumettreReponseTableauA(etat, r))}
                />
              )}
              {exercice.scenario === "A" && exercice.combo === "kInverseXAxCarre" && etat.phase === "tableau" && <CalculatriceScientifique />}
              {exercice.scenario === "A" && exercice.combo === "kInverseXAxCarre" && etat.phase === "generalisation" && (
                <EtapeGeneralisationA
                  exercice={exercice}
                  donnees={<div className="equation-box">{consigneVolumeA(exercice)}</div>}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMax}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(r) => terminerEtape(soumettreReponseGeneralisationA(etat, r))}
                />
              )}
              {exercice.scenario === "A" && exercice.combo === "kInverseXAxCarre" && etat.phase === "egaliteAires" && (
                <EtapeEgaliteAiresA
                  exercice={exercice}
                  donnees={<div className="equation-box">{consigneVolumeA(exercice)}</div>}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMax}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(r) => terminerEtape(soumettreReponseEgaliteAiresA(etat, r))}
                />
              )}
              {exercice.scenario === "A" && exercice.combo === "kInverseXAxCarre" && etat.phase === "egaliteAires" && <CalculatriceScientifique />}
              {exercice.scenario === "A" && exercice.combo === "kInverseXAxCarre" && etat.phase === "graphique" && (
                <EtapeGraphiqueA
                  exercice={exercice}
                  donnees={<div className="equation-box">{consigneVolumeA(exercice)}</div>}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMax}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(r) => terminerEtape(soumettreReponseGraphiqueA(etat, r))}
                />
              )}
              {exercice.scenario === "A" &&
                exercice.combo === "kInverseXAxCarre" &&
                etat.phase === "justification" &&
                etat.xOptimalRetenu !== null && (
                  <EtapeJustificationA
                    exercice={exercice}
                    donnees={<div className="equation-box">{consigneVolumeA(exercice)}</div>}
                    xOptimalRetenu={etat.xOptimalRetenu}
                    tentativesUtilisees={tentativesUtilisees}
                    tentativesMax={tentativesMax}
                    niveauAide={etat.niveauAide}
                    niveauAideMax={niveauAideMax}
                    onActiverAide={() => setEtat(activerAideSuivante(etat))}
                    onValider={(r) => terminerEtape(soumettreReponseJustificationA(etat, r))}
                  />
                )}
              {exercice.scenario === "A" &&
                exercice.combo === "kInverseXAxCarre" &&
                etat.phase === "justification" &&
                etat.xOptimalRetenu !== null && <CalculatriceScientifique />}

              {exercice.scenario === "A" && exercice.combo !== "kInverseXAxCarre" && etat.phase === "generalisationSimple" && (
                <EtapeGeneralisationSimpleA
                  exercice={exercice}
                  donnees={<div className="equation-box">{consigneContexteAReduit(exercice)}</div>}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMax}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(r) => terminerEtape(soumettreReponseGeneralisationSimpleA(etat, r))}
                />
              )}
              {exercice.scenario === "A" && exercice.combo !== "kInverseXAxCarre" && etat.phase === "intersectionSimple" && (
                <EtapeIntersectionSimpleA
                  exercice={exercice}
                  donnees={<div className="equation-box">{consigneContexteAReduit(exercice)}</div>}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMax}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(r) => terminerEtape(soumettreReponseIntersectionSimpleA(etat, r))}
                />
              )}
              {exercice.scenario === "A" && exercice.combo !== "kInverseXAxCarre" && etat.phase === "intersectionSimple" && (
                <CalculatriceScientifique />
              )}
              {exercice.scenario === "A" && exercice.combo !== "kInverseXAxCarre" && etat.phase === "extremumSimple" && (
                <EtapeExtremumSimpleA
                  exercice={exercice}
                  donnees={<div className="equation-box">{consigneContexteAReduit(exercice)}</div>}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMax}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(r) => terminerEtape(soumettreReponseExtremumSimpleA(etat, r))}
                />
              )}

              {exercice.scenario === "B" && etat.phase === "systeme" && (
                <EtapeSystemeB
                  exercice={exercice}
                  donnees={<BlocContexteB exercice={exercice} />}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMax}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(r) => terminerEtape(soumettreReponseSystemeB(etat, r))}
                />
              )}
              {exercice.scenario === "B" && etat.phase === "resolution" && (
                <EtapeResolutionB
                  exercice={exercice}
                  donnees={<BlocContexteB exercice={exercice} />}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMax}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(r) => terminerEtape(soumettreReponseResolutionB(etat, r))}
                />
              )}
              {exercice.scenario === "B" && etat.phase === "resolution" && <CalculatriceScientifique />}
              {exercice.scenario === "B" && etat.phase === "formule" && etat.aRetenu !== null && etat.bRetenu !== null && (
                <EtapeFormuleB
                  exercice={exercice}
                  donnees={<BlocContexteB exercice={exercice} />}
                  aRetenu={etat.aRetenu}
                  bRetenu={etat.bRetenu}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMax}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(r) => terminerEtape(soumettreReponseFormuleB(etat, r))}
                />
              )}
              {exercice.scenario === "B" && etat.phase === "evaluation" && etat.aRetenu !== null && etat.bRetenu !== null && (
                <EtapeEvaluationB
                  exercice={exercice}
                  donnees={<BlocContexteB exercice={exercice} />}
                  aRetenu={etat.aRetenu}
                  bRetenu={etat.bRetenu}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMax}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(r) => terminerEtape(soumettreReponseEvaluationB(etat, r))}
                />
              )}

              {exercice.scenario === "C" && etat.phase === "lecture" && (
                <EtapeLectureC
                  exercice={exercice}
                  donnees={<div className="equation-box">{consigneContexteC()}</div>}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMax}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(r) => terminerEtape(soumettreReponseLectureC(etat, r))}
                />
              )}
              {exercice.scenario === "C" && etat.phase === "lecture" && exercice.formeCV !== "racineCarree" && <CalculatriceScientifique />}
              {exercice.scenario === "C" && etat.phase === "coutMoyen" && (
                <EtapeCoutMoyenC
                  exercice={exercice}
                  donnees={<div className="equation-box">{consigneContexteC()}</div>}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMax}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(r) => terminerEtape(soumettreReponseCoutMoyenC(etat, r))}
                />
              )}
              {exercice.scenario === "C" && etat.phase === "coutMoyen" && <CalculatriceScientifique />}
              {exercice.scenario === "C" && etat.phase === "reconnaissance" && (
                <EtapeReconnaissanceC
                  exercice={exercice}
                  donnees={<div className="equation-box">{consigneContexteC()}</div>}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMax}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(r) => terminerEtape(soumettreReponseReconnaissanceC(etat, r))}
                />
              )}
              {exercice.scenario === "C" && etat.phase === "benefice" && (
                <EtapeBeneficeC
                  exercice={exercice}
                  donnees={<div className="equation-box">{consigneContexteC()}</div>}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMax}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(r) => terminerEtape(soumettreReponseBeneficeC(etat, r))}
                />
              )}
              {exercice.scenario === "C" && etat.phase === "benefice" && (exercice.formeCV !== "racineCarree" || exercice.formeCA !== "affine") && (
                <CalculatriceScientifique />
              )}
              {exercice.scenario === "C" && etat.phase === "seuil" && (
                <EtapeSeuilC
                  exercice={exercice}
                  donnees={<div className="equation-box">{consigneContexteC()}</div>}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMax}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(r) => terminerEtape(soumettreReponseSeuilC(etat, r))}
                />
              )}
            </>
          )}
          {dernierBilan && (
            <ResultatPanelProblemeContexte
              resultat={dernierBilan.resultat}
              aideParPhase={dernierBilan.aideParPhase}
              dernier={etat.terminee}
              onContinuer={() => setDernierBilan(null)}
            />
          )}
          {etat.terminee && !dernierBilan && (
            <ResumeSessionProblemeContexte resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          )}{" "}
        </div>
      </main>
    </div>
  );
}

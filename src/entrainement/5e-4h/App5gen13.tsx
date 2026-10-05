import { useState } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { construireAvecTechniqueEtPhase2, genererExerciceModelisationSinusoide } from "./generateurs5e/modelisationSinusoide";
import type { Phase2ChoixDev } from "./generateurs5e/modelisationSinusoide";
import type { ExerciceModelisationSinusoide, TechniquePhase1 } from "./core5e/modelisationSinusoide.types";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";

const LABEL_TECHNIQUE: Record<TechniquePhase1, string> = {
  b1: "B1 — grande roue",
  b2: "B2 — max/min/extremum connu",
  b3: "B3 — 2 points connus",
  donnee: "f(t) donnée directement",
};
const LABEL_PHASE2: Record<Phase2ChoixDev, string> = {
  resoudre: "Résoudre",
  extremum: "Extremum",
  inequation: "Inéquation",
  aucune: "Aucune Phase 2",
};
const PHASE2_CHOIX: Phase2ChoixDev[] = ["resoudre", "extremum", "inequation", "aucune"];

const OPTIONS_TECHNIQUE_PHASE2 = [
  { id: "b1|aucune", label: `${LABEL_TECHNIQUE.b1} (jamais de Phase 2)` },
  // b2 force TOUJOURS Phase 2 = "resoudre" (c'est la définition de cette technique,
  // `generateurs5e/modelisationSinusoide/index.ts`) — une seule entrée, jamais un choix silencieusement
  // ignoré comme pour b3.
  { id: "b2|resoudre", label: `${LABEL_TECHNIQUE.b2} (+ résolution f(t)=k systématique)` },
  ...PHASE2_CHOIX.map((p2) => ({ id: `b3|${p2}`, label: `${LABEL_TECHNIQUE.b3} + ${LABEL_PHASE2[p2]}` })),
  ...(["resoudre", "extremum", "inequation"] as Phase2ChoixDev[]).map((p2) => ({
    id: `donnee|${p2}`,
    label: `${LABEL_TECHNIQUE.donnee} + ${LABEL_PHASE2[p2]}`,
  })),
];
import {
  niveauAideMaxModelisation,
  activerAideSuivante,
  demarrerSessionModelisationSinusoide,
  soumettreReponseAmplitude,
  soumettreReponseArgumentResoudre,
  soumettreReponseDecalage,
  soumettreReponseFonctionFinale,
  soumettreReponseIsolerSinInequation,
  soumettreReponseIsolerTExtremum,
  soumettreReponseIsolerTInequation,
  soumettreReponseIsolerTResoudre,
  soumettreReponseListerIntervalles,
  soumettreReponsePhi,
  soumettreReponsePoserExtremum,
  soumettreReponsePulsation,
  soumettreReponseResolution,
  soumettreReponseResoudreUInequation,
  soumettreReponseSolutionsExtremum,
  soumettreReponseSolutionsResoudre,
  soumettreReponseSysteme,
} from "./moteur5e/sessionModelisationSinusoide";
import type {
  EtatSessionModelisationSinusoide,
  PhaseModelisationSinusoide,
  ResultatExerciceModelisationSinusoide,
} from "./moteur5e/typesModelisationSinusoide";
import type { ReponseBornes, ReponseResolution, ReponseSysteme } from "./moteur5e/sessionModelisationSinusoide";
import {
  diagnostiquerArgumentResoudre,
  diagnostiquerFonctionFinale,
  diagnostiquerIsolerSinInequation,
  diagnostiquerIsolerTExtremum,
  diagnostiquerIsolerTInequation,
  diagnostiquerIsolerTResoudre,
  diagnostiquerListerIntervalles,
  diagnostiquerNombre,
  diagnostiquerNombreDixieme,
  diagnostiquerNombreUnite,
  diagnostiquerPhiModuloDeuxPi,
  diagnostiquerPoserExtremum,
  diagnostiquerResoudreUInequation,
  diagnostiquerSolutionsExtremum,
  diagnostiquerSolutionsResoudre,
  diagnostiquerSysteme,
} from "./moteur5e/verificationModelisationSinusoide";
import type { ReponseArgumentResoudre } from "./moteur5e/verificationModelisationSinusoide";
import type { StatutVerification } from "./moteur/statutVerification";
import { EtapeArgumentResoudre } from "./components5e/EtapeArgumentResoudre";
import { EtapeBornes } from "./components5e/EtapeBornes";
import { EtapeChampSimpleModelisation } from "./components5e/EtapeChampSimpleModelisation";
import { EtapeIsolerSinInequation } from "./components5e/EtapeIsolerSinInequation";
import { EtapeLignesModelisation } from "./components5e/EtapeLignesModelisation";
import { EtapeListerIntervalles } from "./components5e/EtapeListerIntervalles";
import { EtapeResolution } from "./components5e/EtapeResolution";
import { EtapeSysteme } from "./components5e/EtapeSysteme";
import { CalculatriceScientifique } from "./components5e/CalculatriceScientifique";
import { ResultatPanelModelisationSinusoide } from "./components5e/ResultatPanelModelisationSinusoide";
import { ResumeSessionModelisationSinusoide } from "./components5e/ResumeSessionModelisationSinusoide";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 5, tentativesMax: 3, penaliteActivee: true };

const PHASES_CHAMP_SIMPLE = new Set(["amplitude", "decalage", "pulsation", "phi", "fonctionFinale", "poserExtremum", "isolerTExtremum"]);
const PHASES_LIGNES = new Set(["isolerTResoudre", "solutionsResoudre", "solutionsExtremum"]);
const PHASES_BORNES = new Set(["resoudreUInequation", "isolerTInequation"]);

// ============================================================================
// Dispatch de diagnostic (A.1) — un statut à 3 valeurs par écran, calculé côté PRÉSENTATION
// uniquement (jamais consommé par le score/les tentatives, qui restent pilotés par le booléen
// historique `onValider` déclenche côté moteur). Réplique localement (jamais exporté depuis
// `sessionModelisationSinusoide.ts`, qui garde ses accesseurs `commeXxx` privés) le même narrowing
// que les fonctions `soumettreReponseXxx` du moteur — gardes défensives jamais atteintes en
// pratique, chaque phase n'étant accessible que depuis la séquence à laquelle elle appartient (même
// principe que `commeB1OuB2`/`commeResoudre`/etc. côté moteur).
// ============================================================================

function combinerStatuts(a: StatutVerification, b: StatutVerification): StatutVerification {
  if (a === "parse_error" || b === "parse_error") return "parse_error";
  return a === "correct" && b === "correct" ? "correct" : "not_equivalent";
}

function diagnostiquerChampSimplePhase(
  exercice: ExerciceModelisationSinusoide,
  phase: PhaseModelisationSinusoide,
  texte: string,
): StatutVerification {
  const phase1 = exercice.phase1;
  switch (phase) {
    case "amplitude":
      if (phase1.technique !== "b1" && phase1.technique !== "b2")
        throw new Error("diagnostiquerChampSimplePhase : phase 'amplitude' hors technique b1/b2");
      return diagnostiquerNombreUnite(texte, phase1.fonction.A);
    case "decalage":
      if (phase1.technique !== "b1" && phase1.technique !== "b2")
        throw new Error("diagnostiquerChampSimplePhase : phase 'decalage' hors technique b1/b2");
      return diagnostiquerNombreUnite(texte, phase1.fonction.b);
    case "pulsation":
      if (phase1.technique !== "b1" && phase1.technique !== "b2")
        throw new Error("diagnostiquerChampSimplePhase : phase 'pulsation' hors technique b1/b2");
      return diagnostiquerNombreDixieme(texte, phase1.fonction.omega);
    case "phi":
      if (phase1.technique !== "b2") throw new Error("diagnostiquerChampSimplePhase : phase 'phi' hors technique b2");
      return diagnostiquerPhiModuloDeuxPi(texte, phase1.fonction.phi as number);
    case "fonctionFinale":
      return diagnostiquerFonctionFinale(phase1, texte);
    case "poserExtremum": {
      const question = exercice.phase2;
      if (question === null || question.type !== "extremum")
        throw new Error("diagnostiquerChampSimplePhase : phase 'poserExtremum' hors phase2 'extremum'");
      return diagnostiquerPoserExtremum(question, texte);
    }
    case "isolerTExtremum": {
      const question = exercice.phase2;
      if (question === null || question.type !== "extremum")
        throw new Error("diagnostiquerChampSimplePhase : phase 'isolerTExtremum' hors phase2 'extremum'");
      return diagnostiquerIsolerTExtremum(question, texte);
    }
    default:
      throw new Error(`diagnostiquerChampSimplePhase : phase '${phase}' inattendue`);
  }
}

function diagnostiquerSystemePhase(exercice: ExerciceModelisationSinusoide, reponse: ReponseSysteme): StatutVerification {
  const phase1 = exercice.phase1;
  if (phase1.technique !== "b3") throw new Error("diagnostiquerSystemePhase : technique hors 'b3'");
  const [gauche1, droite1] = reponse.equation1.split("=");
  const [gauche2, droite2] = reponse.equation2.split("=");
  if (gauche1 === undefined || droite1 === undefined || gauche2 === undefined || droite2 === undefined) return "parse_error";
  return combinerStatuts(
    diagnostiquerSysteme(gauche1, droite1, phase1.t1, 1, phase1.alpha1),
    diagnostiquerSysteme(gauche2, droite2, phase1.t2, 1, phase1.alpha2),
  );
}

function diagnostiquerResolutionPhase(exercice: ExerciceModelisationSinusoide, reponse: ReponseResolution): StatutVerification {
  const phase1 = exercice.phase1;
  if (phase1.technique !== "b3") throw new Error("diagnostiquerResolutionPhase : technique hors 'b3'");
  return combinerStatuts(diagnostiquerNombre(reponse.omega, phase1.fonction.omega), diagnostiquerNombre(reponse.phi, phase1.fonction.phi as number));
}

function diagnostiquerArgumentResoudrePhase(exercice: ExerciceModelisationSinusoide, reponse: ReponseArgumentResoudre): StatutVerification {
  const question = exercice.phase2;
  if (question === null || question.type !== "resoudre") throw new Error("diagnostiquerArgumentResoudrePhase : phase2 hors type 'resoudre'");
  return diagnostiquerArgumentResoudre(question, reponse);
}

function diagnostiquerLignesPhase(
  exercice: ExerciceModelisationSinusoide,
  phase: "isolerTResoudre" | "solutionsResoudre" | "solutionsExtremum",
  lignes: string[],
): StatutVerification {
  if (phase === "solutionsExtremum") {
    const question = exercice.phase2;
    if (question === null || question.type !== "extremum")
      throw new Error("diagnostiquerLignesPhase : phase 'solutionsExtremum' hors phase2 'extremum'");
    return diagnostiquerSolutionsExtremum(question, lignes);
  }
  const question = exercice.phase2;
  if (question === null || question.type !== "resoudre") throw new Error(`diagnostiquerLignesPhase : phase '${phase}' hors phase2 'resoudre'`);
  return phase === "isolerTResoudre" ? diagnostiquerIsolerTResoudre(question, lignes) : diagnostiquerSolutionsResoudre(question, lignes);
}

function diagnostiquerIsolerSinInequationPhase(exercice: ExerciceModelisationSinusoide, texte: string): StatutVerification {
  const question = exercice.phase2;
  if (question === null || question.type !== "inequation") throw new Error("diagnostiquerIsolerSinInequationPhase : phase2 hors type 'inequation'");
  return diagnostiquerIsolerSinInequation(texte, question.casSpecial, question.sens, question.m);
}

function diagnostiquerBornesPhase(
  exercice: ExerciceModelisationSinusoide,
  phase: "resoudreUInequation" | "isolerTInequation",
  reponse: ReponseBornes,
): StatutVerification {
  const question = exercice.phase2;
  if (question === null || question.type !== "inequation") throw new Error(`diagnostiquerBornesPhase : phase '${phase}' hors phase2 'inequation'`);
  return phase === "resoudreUInequation"
    ? diagnostiquerResoudreUInequation(question, reponse.inf, reponse.sup)
    : diagnostiquerIsolerTInequation(question, reponse.inf, reponse.sup);
}

function diagnostiquerListerIntervallesPhase(exercice: ExerciceModelisationSinusoide, paires: [string, string][]): StatutVerification {
  const question = exercice.phase2;
  if (question === null || question.type !== "inequation") throw new Error("diagnostiquerListerIntervallesPhase : phase2 hors type 'inequation'");
  return diagnostiquerListerIntervalles(paires, question.intervalles);
}

function nouvelleSession(): EtatSessionModelisationSinusoide {
  return demarrerSessionModelisationSinusoide(REGLAGES_DEMO, genererExerciceModelisationSinusoide);
}

interface Bilan {
  resultat: ResultatExerciceModelisationSinusoide;
  aideParPhase: Partial<Record<PhaseModelisationSinusoide, { niveauAide: number; revele: boolean }>>;
}

export function App5gen13() {
  const [etat, setEtat] = useState<EtatSessionModelisationSinusoide>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<PhaseModelisationSinusoide, { niveauAide: number; revele: boolean }>>>({});

  function terminerEtape(nouvelEtat: EtatSessionModelisationSinusoide) {
    // A.1 : `revele` doit être lu sur `nouvelEtat` (POST-soumission) — `etat.etapeCourante.revelee`
    // (PRÉ-soumission) est structurellement toujours `false` ici, voir `derniereEtapeRevelee` dans
    // `typesModelisationSinusoide.ts`.
    const miseAJour = { ...aideParPhase, [etat.phase]: { niveauAide: etat.niveauAide, revele: nouvelEtat.derniereEtapeRevelee } };
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
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const cleEcran = `${etat.indexExercice}-${etat.phase}`;
  const phase = etat.phase;
  const technique = exercice.phase1.technique;
  /** Calculatrice — écrans supplémentaires au-delà de "systeme"/"argumentResoudre"/
   * "resoudreUInequation" (déjà unconditionnels ci-dessous) : B2 l'active aussi sur les 2 derniers
   * écrans de sa Phase 2 toujours "resoudre" (isolerTResoudre/solutionsResoudre) ; B3 ET "donnee"
   * l'activent sur TOUS leurs écrans, du premier au dernier, quel que soit le type de Phase 2 tiré
   * (`prompt5gen13B1B2B3.md`, étendu à "donnee" par `prompt5gen13ftDonnee3variantes.md` — "donnee"
   * n'a jamais "fonctionFinale"/"systeme"/"resolution" dans sa séquence, ces entrées de
   * `PHASES_CALC_B3` lui restent donc simplement inertes). */
  const PHASES_CALC_B3 = new Set<PhaseModelisationSinusoide>([
    "fonctionFinale",
    "isolerTResoudre",
    "solutionsResoudre",
    "poserExtremum",
    "isolerTExtremum",
    "solutionsExtremum",
    "isolerSinInequation",
    "isolerTInequation",
    "listerIntervallesInequation",
  ]);
  const PHASES_CALC_B2 = new Set<PhaseModelisationSinusoide>(["isolerTResoudre", "solutionsResoudre"]);
  const calculatriceEcranSupplementaire =
    ((technique === "b3" || technique === "donnee") && PHASES_CALC_B3.has(phase)) || (technique === "b2" && PHASES_CALC_B2.has(phase));

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Modéliser une fonction sinusoïdale en contexte</h1>
      </header>
      <SelecteurVarianteDev
        options={OPTIONS_TECHNIQUE_PHASE2}
        onGenerer={(id) => {
          const [technique, phase2Choix] = id.split("|") as [TechniquePhase1, Phase2ChoixDev];
          setDernierBilan(null);
          setEtat(demarrerSessionModelisationSinusoide(REGLAGES_DEMO, () => construireAvecTechniqueEtPhase2(technique, phase2Choix)));
        }}
      />
      <main className="card">
        <div className="card-body">
          {enCoursDeSession && (
            <>
              {PHASES_CHAMP_SIMPLE.has(phase) && (
                <EtapeChampSimpleModelisation
                  key={cleEcran}
                  exercice={exercice}
                  phase={phase}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMaxModelisation(exercice, etat.phase)}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => {
                    switch (phase) {
                      case "amplitude":
                        return terminerEtape(soumettreReponseAmplitude(etat, texte));
                      case "decalage":
                        return terminerEtape(soumettreReponseDecalage(etat, texte));
                      case "pulsation":
                        return terminerEtape(soumettreReponsePulsation(etat, texte));
                      case "phi":
                        return terminerEtape(soumettreReponsePhi(etat, texte));
                      case "fonctionFinale":
                        return terminerEtape(soumettreReponseFonctionFinale(etat, texte));
                      case "poserExtremum":
                        return terminerEtape(soumettreReponsePoserExtremum(etat, texte));
                      case "isolerTExtremum":
                        return terminerEtape(soumettreReponseIsolerTExtremum(etat, texte));
                      default:
                        return;
                    }
                  }}
                  diagnostiquer={(texte) => diagnostiquerChampSimplePhase(exercice, phase, texte)}
                />
              )}

              {phase === "systeme" && (
                <EtapeSysteme
                  key={cleEcran}
                  exercice={exercice}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMaxModelisation(exercice, etat.phase)}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse) => terminerEtape(soumettreReponseSysteme(etat, reponse))}
                  diagnostiquer={(reponse) => diagnostiquerSystemePhase(exercice, reponse)}
                />
              )}
              {phase === "systeme" && <CalculatriceScientifique />}
              {phase === "resolution" && (
                <EtapeResolution
                  key={cleEcran}
                  exercice={exercice}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMaxModelisation(exercice, etat.phase)}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse) => terminerEtape(soumettreReponseResolution(etat, reponse))}
                  diagnostiquer={(reponse) => diagnostiquerResolutionPhase(exercice, reponse)}
                />
              )}
              {phase === "resolution" && <CalculatriceScientifique />}

              {phase === "argumentResoudre" && (
                <EtapeArgumentResoudre
                  key={cleEcran}
                  exercice={exercice}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMaxModelisation(exercice, etat.phase)}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse) => terminerEtape(soumettreReponseArgumentResoudre(etat, reponse))}
                  diagnostiquer={(reponse) => diagnostiquerArgumentResoudrePhase(exercice, reponse)}
                />
              )}
              {phase === "argumentResoudre" && <CalculatriceScientifique />}

              {PHASES_LIGNES.has(phase) && (
                <EtapeLignesModelisation
                  key={cleEcran}
                  exercice={exercice}
                  phase={phase as "isolerTResoudre" | "solutionsResoudre" | "solutionsExtremum"}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMaxModelisation(exercice, etat.phase)}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(lignes) => {
                    switch (phase) {
                      case "isolerTResoudre":
                        return terminerEtape(soumettreReponseIsolerTResoudre(etat, lignes));
                      case "solutionsResoudre":
                        return terminerEtape(soumettreReponseSolutionsResoudre(etat, lignes));
                      case "solutionsExtremum":
                        return terminerEtape(soumettreReponseSolutionsExtremum(etat, lignes));
                      default:
                        return;
                    }
                  }}
                  diagnostiquer={(lignes) =>
                    diagnostiquerLignesPhase(exercice, phase as "isolerTResoudre" | "solutionsResoudre" | "solutionsExtremum", lignes)
                  }
                />
              )}

              {phase === "isolerSinInequation" && (
                <EtapeIsolerSinInequation
                  key={cleEcran}
                  exercice={exercice}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMaxModelisation(exercice, etat.phase)}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseIsolerSinInequation(etat, texte))}
                  diagnostiquer={(texte) => diagnostiquerIsolerSinInequationPhase(exercice, texte)}
                />
              )}

              {PHASES_BORNES.has(phase) && (
                <EtapeBornes
                  key={cleEcran}
                  exercice={exercice}
                  phase={phase as "resoudreUInequation" | "isolerTInequation"}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMaxModelisation(exercice, etat.phase)}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse) =>
                    terminerEtape(
                      phase === "resoudreUInequation"
                        ? soumettreReponseResoudreUInequation(etat, reponse)
                        : soumettreReponseIsolerTInequation(etat, reponse),
                    )
                  }
                  diagnostiquer={(reponse) => diagnostiquerBornesPhase(exercice, phase as "resoudreUInequation" | "isolerTInequation", reponse)}
                />
              )}
              {phase === "resoudreUInequation" && <CalculatriceScientifique />}

              {phase === "listerIntervallesInequation" && (
                <EtapeListerIntervalles
                  key={cleEcran}
                  exercice={exercice}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMaxModelisation(exercice, etat.phase)}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(paires) => terminerEtape(soumettreReponseListerIntervalles(etat, paires))}
                  diagnostiquer={(paires) => diagnostiquerListerIntervallesPhase(exercice, paires)}
                />
              )}
              {calculatriceEcranSupplementaire && <CalculatriceScientifique />}
            </>
          )}
          {dernierBilan && (
            <ResultatPanelModelisationSinusoide
              resultat={dernierBilan.resultat}
              aideParPhase={dernierBilan.aideParPhase}
              dernier={etat.terminee}
              onContinuer={() => setDernierBilan(null)}
            />
          )}
          {etat.terminee && !dernierBilan && (
            <ResumeSessionModelisationSinusoide resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          )}{" "}
        </div>
      </main>
    </div>
  );
}

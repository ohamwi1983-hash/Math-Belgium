import { useState } from "react";
import type {
  ExerciceEgaliteExpressions,
  ExerciceEquationTrig,
  ExerciceEquationTrigonometrique,
  ExerciceProduitFacteurs,
  ExercicePythagoricienne,
} from "./core5e/equationsTrigonometriques.types";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import {
  construireExerciceEgaliteExpressions,
  construireExercicePythagoricienne,
  genererExerciceEquationTrig,
  genererExerciceEquationTrigonometrique,
  genererExerciceProduitFacteurs,
} from "./generateurs5e/equationsTrigonometriques";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";

const GENERATEURS_FAMILLE: Record<string, () => ExerciceEquationTrigonometrique> = {
  directe: () => ({ famille: "directe", exercice: genererExerciceEquationTrig() }),
  produit: genererExerciceProduitFacteurs,
  pythagoricienne: construireExercicePythagoricienne,
  egalite: construireExerciceEgaliteExpressions,
};
const OPTIONS_FAMILLE = [
  { id: "directe", label: "Application directe" },
  { id: "produit", label: "Produit de facteurs" },
  { id: "pythagoricienne", label: "Substitution pythagoricienne" },
  { id: "egalite", label: "Égalité avec conversion" },
];
import {
  niveauAideMaxEquationTrig,
  activerAideSuivante,
  demarrerSessionEquationTrig,
  soumettreReponseArgument,
  soumettreReponseArgumentProduit,
  soumettreReponseConversionEgalite,
  soumettreReponseConversionPythagoricienne,
  soumettreReponseIsolerX,
  soumettreReponseIsolerXProduit,
  soumettreReponsePrefacteur,
  soumettreReponseRacinesPythagoricienne,
  soumettreReponseRacinesResolution,
  soumettreReponseReconnaissance,
  soumettreReponseResoudreEgalite,
  soumettreReponseSeparerFacteurs,
  soumettreReponseSolutions,
  soumettreReponseSolutionsEgalite,
  soumettreReponseSolutionsProduit,
  soumettreReponseSolutionsPythagoricienne,
} from "./moteur5e/sessionEquationTrig";
import {
  diagnostiquerArgument,
  diagnostiquerArgumentProduit,
  diagnostiquerConversionEgalite,
  diagnostiquerConversionPythagoricienne,
  diagnostiquerFactorisationProduit,
  diagnostiquerIsolerX,
  diagnostiquerIsolerXProduit,
  diagnostiquerRacinesPythagoricienne,
  diagnostiquerRacinesResolution,
  diagnostiquerResoudreEgalite,
  diagnostiquerSeparerFacteurs,
  diagnostiquerSolutions,
  diagnostiquerSolutionsEgalite,
  diagnostiquerSolutionsProduit,
  diagnostiquerSolutionsPythagoricienne,
} from "./moteur5e/verificationEquationTrig";
import type {
  EtatSessionEquationTrigonometrique,
  PhaseEquationTrigonometrique,
  ResultatExerciceEquationTrigonometrique,
} from "./moteur5e/typesEquationTrig";
import { EtapeArgumentEquationTrig } from "./components5e/EtapeArgumentEquationTrig";
import { EtapeArgumentProduit } from "./components5e/EtapeArgumentProduit";
import { EtapeConversionEgalite } from "./components5e/EtapeConversionEgalite";
import { EtapeConversionPythagoricienne } from "./components5e/EtapeConversionPythagoricienne";
import { EtapeIsolerXEquationTrig } from "./components5e/EtapeIsolerXEquationTrig";
import { EtapeIsolerXProduit } from "./components5e/EtapeIsolerXProduit";
import { EtapePrefacteurProduit } from "./components5e/EtapePrefacteurProduit";
import { EtapeRacinesPythagoricienne } from "./components5e/EtapeRacinesPythagoricienne";
import { EtapeRacinesResolutionPythagoricienne } from "./components5e/EtapeRacinesResolutionPythagoricienne";
import { EtapeReconnaissanceEquationTrig } from "./components5e/EtapeReconnaissanceEquationTrig";
import { EtapeResoudreEgalite } from "./components5e/EtapeResoudreEgalite";
import { EtapeSepararFacteursProduit } from "./components5e/EtapeSepararFacteursProduit";
import { EtapeSolutionsEgalite } from "./components5e/EtapeSolutionsEgalite";
import { EtapeSolutionsEquationTrig } from "./components5e/EtapeSolutionsEquationTrig";
import { EtapeSolutionsProduit } from "./components5e/EtapeSolutionsProduit";
import { EtapeSolutionsPythagoricienne } from "./components5e/EtapeSolutionsPythagoricienne";
import { ResultatPanelEquationTrig } from "./components5e/ResultatPanelEquationTrig";
import { ResumeSessionEquationTrig } from "./components5e/ResumeSessionEquationTrig";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 5, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionEquationTrigonometrique {
  return demarrerSessionEquationTrig(REGLAGES_DEMO, genererExerciceEquationTrigonometrique);
}

type AideParPhase = Partial<Record<PhaseEquationTrigonometrique, { niveauAide: number; revele: boolean }>>;

interface Bilan {
  resultat: ResultatExerciceEquationTrigonometrique;
  aideParPhase: AideParPhase;
}

function commeDirecte(exercice: ExerciceEquationTrigonometrique): ExerciceEquationTrig {
  if (exercice.famille !== "directe") throw new Error("commeDirecte : exercice hors famille 'directe'");
  return exercice.exercice;
}
function commeProduit(exercice: ExerciceEquationTrigonometrique): ExerciceProduitFacteurs {
  if (exercice.famille !== "produit") throw new Error("commeProduit : exercice hors famille 'produit'");
  return exercice;
}
function commePythagoricienne(exercice: ExerciceEquationTrigonometrique): ExercicePythagoricienne {
  if (exercice.famille !== "pythagoricienne") throw new Error("commePythagoricienne : exercice hors famille 'pythagoricienne'");
  return exercice;
}
function commeEgalite(exercice: ExerciceEquationTrigonometrique): ExerciceEgaliteExpressions {
  if (exercice.famille !== "egalite") throw new Error("commeEgalite : exercice hors famille 'egalite'");
  return exercice;
}

export function App5gen10() {
  const [etat, setEtat] = useState<EtatSessionEquationTrigonometrique>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<AideParPhase>({});

  function terminerEtape(nouvelEtat: EtatSessionEquationTrigonometrique) {
    // C.3 : `revele` doit être lu sur `nouvelEtat` (POST-soumission) — `etat.etapeCourante.revelee`
    // (PRÉ-soumission) est structurellement toujours `false` ici, voir `derniereEtapeRevelee` dans
    // `typesEquationTrig.ts`.
    const miseAJour: AideParPhase = { ...aideParPhase, [etat.phase]: { niveauAide: etat.niveauAide, revele: nouvelEtat.derniereEtapeRevelee } };
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

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Équations trigonométriques</h1>
      </header>
      <SelecteurVarianteDev
        options={OPTIONS_FAMILLE}
        onGenerer={(id) => {
          setDernierBilan(null);
          setEtat(demarrerSessionEquationTrig(REGLAGES_DEMO, GENERATEURS_FAMILLE[id]));
        }}
      />
      <main className="card">
        <div className="card-body">
          {enCoursDeSession && (
            <>
              {etat.phase === "reconnaissance" && (
                <EtapeReconnaissanceEquationTrig
                  key={cleEcran}
                  exercice={exercice}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  onValider={(choix) => terminerEtape(soumettreReponseReconnaissance(etat, choix))}
                />
              )}

              {etat.phase === "argument" && (
                <EtapeArgumentEquationTrig
                  key={cleEcran}
                  exercice={commeDirecte(exercice)}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMaxEquationTrig(exercice, etat.phase)}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse) => terminerEtape(soumettreReponseArgument(etat, reponse))}
                  diagnostiquer={(reponse) => diagnostiquerArgument(commeDirecte(exercice), reponse)}
                />
              )}
              {etat.phase === "isolerX" && (
                <EtapeIsolerXEquationTrig
                  key={cleEcran}
                  exercice={commeDirecte(exercice)}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMaxEquationTrig(exercice, etat.phase)}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(lignes) => terminerEtape(soumettreReponseIsolerX(etat, lignes))}
                  diagnostiquer={(lignes) => diagnostiquerIsolerX(commeDirecte(exercice), lignes)}
                />
              )}
              {etat.phase === "solutions" && (
                <EtapeSolutionsEquationTrig
                  key={cleEcran}
                  exercice={commeDirecte(exercice)}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMaxEquationTrig(exercice, etat.phase)}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(textes) => terminerEtape(soumettreReponseSolutions(etat, textes))}
                  diagnostiquer={(textes) => diagnostiquerSolutions(commeDirecte(exercice), textes)}
                />
              )}

              {etat.phase === "prefacteur" && (
                <EtapePrefacteurProduit
                  key={cleEcran}
                  exercice={commeProduit(exercice)}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMaxEquationTrig(exercice, etat.phase)}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponsePrefacteur(etat, texte))}
                  diagnostiquer={(texte) => diagnostiquerFactorisationProduit(commeProduit(exercice), texte)}
                />
              )}
              {etat.phase === "separerFacteurs" && (
                <EtapeSepararFacteursProduit
                  key={cleEcran}
                  exercice={commeProduit(exercice)}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMaxEquationTrig(exercice, etat.phase)}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(lignes) => terminerEtape(soumettreReponseSeparerFacteurs(etat, lignes))}
                  diagnostiquer={(lignes) => diagnostiquerSeparerFacteurs(commeProduit(exercice), lignes)}
                />
              )}
              {etat.phase === "argumentProduit" && (
                <EtapeArgumentProduit
                  key={cleEcran}
                  exercice={commeProduit(exercice)}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMaxEquationTrig(exercice, etat.phase)}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse) => terminerEtape(soumettreReponseArgumentProduit(etat, reponse))}
                  diagnostiquer={(reponse) => diagnostiquerArgumentProduit(commeProduit(exercice), reponse)}
                />
              )}
              {etat.phase === "isolerXProduit" && (
                <EtapeIsolerXProduit
                  key={cleEcran}
                  exercice={commeProduit(exercice)}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMaxEquationTrig(exercice, etat.phase)}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse) => terminerEtape(soumettreReponseIsolerXProduit(etat, reponse))}
                  diagnostiquer={(reponse) => diagnostiquerIsolerXProduit(commeProduit(exercice), reponse)}
                />
              )}
              {etat.phase === "solutionsProduit" && (
                <EtapeSolutionsProduit
                  key={cleEcran}
                  exercice={commeProduit(exercice)}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMaxEquationTrig(exercice, etat.phase)}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(textes) => terminerEtape(soumettreReponseSolutionsProduit(etat, textes))}
                  diagnostiquer={(textes) => diagnostiquerSolutionsProduit(commeProduit(exercice), textes)}
                />
              )}

              {etat.phase === "conversionPythagoricienne" && (
                <EtapeConversionPythagoricienne
                  key={cleEcran}
                  exercice={commePythagoricienne(exercice)}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMaxEquationTrig(exercice, etat.phase)}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseConversionPythagoricienne(etat, texte))}
                  diagnostiquer={(texte) => diagnostiquerConversionPythagoricienne(commePythagoricienne(exercice), texte)}
                />
              )}
              {etat.phase === "racinesPythagoricienne" && (
                <EtapeRacinesPythagoricienne
                  key={cleEcran}
                  exercice={commePythagoricienne(exercice)}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMaxEquationTrig(exercice, etat.phase)}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(textes) => terminerEtape(soumettreReponseRacinesPythagoricienne(etat, textes))}
                  diagnostiquer={(textes) => diagnostiquerRacinesPythagoricienne(commePythagoricienne(exercice), textes)}
                />
              )}
              {etat.phase === "racinesResolution" && (
                <EtapeRacinesResolutionPythagoricienne
                  key={cleEcran}
                  exercice={commePythagoricienne(exercice)}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMaxEquationTrig(exercice, etat.phase)}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse) => terminerEtape(soumettreReponseRacinesResolution(etat, reponse))}
                  diagnostiquer={(reponse) => diagnostiquerRacinesResolution(commePythagoricienne(exercice), reponse)}
                />
              )}
              {etat.phase === "solutionsPythagoricienne" && (
                <EtapeSolutionsPythagoricienne
                  key={cleEcran}
                  exercice={commePythagoricienne(exercice)}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMaxEquationTrig(exercice, etat.phase)}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(textes) => terminerEtape(soumettreReponseSolutionsPythagoricienne(etat, textes))}
                  diagnostiquer={(textes) => diagnostiquerSolutionsPythagoricienne(commePythagoricienne(exercice), textes)}
                />
              )}

              {etat.phase === "conversionEgalite" && (
                <EtapeConversionEgalite
                  key={cleEcran}
                  exercice={commeEgalite(exercice)}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMaxEquationTrig(exercice, etat.phase)}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseConversionEgalite(etat, texte))}
                  diagnostiquer={(texte) => diagnostiquerConversionEgalite(commeEgalite(exercice), texte)}
                />
              )}
              {etat.phase === "resoudreEgalite" && (
                <EtapeResoudreEgalite
                  key={cleEcran}
                  exercice={commeEgalite(exercice)}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMaxEquationTrig(exercice, etat.phase)}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(lignes) => terminerEtape(soumettreReponseResoudreEgalite(etat, lignes))}
                  diagnostiquer={(lignes) => diagnostiquerResoudreEgalite(commeEgalite(exercice), lignes)}
                />
              )}
              {etat.phase === "solutionsEgalite" && (
                <EtapeSolutionsEgalite
                  key={cleEcran}
                  exercice={commeEgalite(exercice)}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMaxEquationTrig(exercice, etat.phase)}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(textes) => terminerEtape(soumettreReponseSolutionsEgalite(etat, textes))}
                  diagnostiquer={(textes) => diagnostiquerSolutionsEgalite(commeEgalite(exercice), textes)}
                />
              )}
            </>
          )}
          {dernierBilan && (
            <ResultatPanelEquationTrig
              resultat={dernierBilan.resultat}
              aideParPhase={dernierBilan.aideParPhase}
              dernier={etat.terminee}
              onContinuer={() => setDernierBilan(null)}
            />
          )}
          {etat.terminee && !dernierBilan && (
            <ResumeSessionEquationTrig resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          )}{" "}
        </div>
      </main>
    </div>
  );
}

import { useState } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { construireAvecFonction, genererExerciceExtremumsSinusoide } from "./generateurs5e/extremumsSinusoide";
import type { FonctionExtremum } from "./core5e/extremumsSinusoide.types";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";

const OPTIONS_FONCTION = [
  { id: "sin", label: "sin" },
  { id: "cos", label: "cos" },
];
import {
  activerAideSuivante,
  demarrerSessionExtremumsSinusoide,
  niveauAideMaxExtremums,
  soumettreReponseIsolerX,
  soumettreReponsePoserEquation,
  soumettreReponseSolutions,
} from "./moteur5e/sessionExtremumsSinusoide";
import {
  diagnostiquerIsolerXExtremum,
  diagnostiquerPoserEquationExtremum,
  diagnostiquerSolutionsExtremum,
} from "./moteur5e/verificationExtremumsSinusoide";
import type { EtatSessionExtremumsSinusoide } from "./moteur5e/typesExtremumsSinusoide";
import { formatTermesEtatActuelExtremums } from "./ui5e/formatExtremumsSinusoide";
import { EtapeParametreExtremum } from "./components5e/EtapeParametreExtremum";
import { EtapeSolutionsExtremum } from "./components5e/EtapeSolutionsExtremum";
import { CercleTrigEquationSketch } from "./components5e/CercleTrigEquationSketch";
import { Katex } from "./components/Katex";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionExtremumsSinusoide {
  return demarrerSessionExtremumsSinusoide(REGLAGES_DEMO, genererExerciceExtremumsSinusoide);
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionExtremumsSinusoide;
  revele: boolean;
}

export function App5gen11() {
  const [etat, setEtat] = useState<EtatSessionExtremumsSinusoide>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionExtremumsSinusoide) {
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
    setEtat(demarrerSessionExtremumsSinusoide(REGLAGES_DEMO, () => construireAvecFonction(id as FonctionExtremum)));
  }

  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;

  const [equationSubstitueeAttendue, brancheXAttendue] = formatTermesEtatActuelExtremums(exercice, "solutions");

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue:
          etat.phase === "poserEquation" ? (
            <Katex expression={equationSubstitueeAttendue} />
          ) : etat.phase === "isolerX" ? (
            <Katex expression={brancheXAttendue} />
          ) : (
            <CercleTrigEquationSketch points={exercice.solutions} regime="exact" />
          ),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Extremums d'une fonction sinusoïdale</h1>
      </header>
      <SelecteurVarianteDev options={OPTIONS_FONCTION} onGenerer={forcerVariante} />
      <main className="card">
        <div className="card-body">
          {(etat.phase === "poserEquation" || etat.phase === "isolerX") && (
            <EtapeParametreExtremum
              key={etat.phase}
              exercice={exercice}
              phase={etat.phase}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={niveauAideMaxExtremums(etat.phase)}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) =>
                terminerEtape(etat.phase === "poserEquation" ? soumettreReponsePoserEquation(etat, texte) : soumettreReponseIsolerX(etat, texte))
              }
              diagnostiquer={(texte) =>
                etat.phase === "poserEquation"
                  ? diagnostiquerPoserEquationExtremum(exercice, texte)
                  : diagnostiquerIsolerXExtremum(exercice, texte)
              }
              validation={validation}
            />
          )}
          {etat.phase === "solutions" && (
            <EtapeSolutionsExtremum
              key={etat.phase}
              exercice={exercice}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={niveauAideMaxExtremums(etat.phase)}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(textes) => terminerEtape(soumettreReponseSolutions(etat, textes))}
              diagnostiquer={(textes) => diagnostiquerSolutionsExtremum(exercice, textes)}
              validation={validation}
            />
          )}
        </div>
      </main>
    </div>
  );
}

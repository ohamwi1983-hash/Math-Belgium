import { useState } from "react";
import type { VarianteQuizFonctionsLogarithmes } from "./core6e/quizFonctionsLogarithmes.types";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import {
  demarrerSessionQuizFonctionsLogarithmes,
  soumettreReponseQuizFonctionsLogarithmes,
} from "./moteur6e/sessionQuizFonctionsLogarithmes";
import type {
  EtatSessionQuizFonctionsLogarithmes,
  ResultatExerciceQuizFonctionsLogarithmes,
} from "./moteur6e/typesQuizFonctionsLogarithmes";
import {
  CATALOGUE_VARIANTES,
  construireAvecVarianteId,
  creerGenerateurSansRepetition,
  etendueNombreQuestions,
  nombreQuestions,
} from "./generateurs6e/quizFonctionsLogarithmes";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { EtapeQuestionQuizFonctionsLogarithmes } from "./components6e/EtapeQuestionQuizFonctionsLogarithmes";
import { ResultatPanelQuizFonctionsLogarithmes } from "./components6e/ResultatPanelQuizFonctionsLogarithmes";
import { ResumeSessionQuizFonctionsLogarithmes } from "./components6e/ResumeSessionQuizFonctionsLogarithmes";

/** Une session = toutes les questions du thème choisi (`nombreQuestions`, jamais une constante en
 * dur), couplé à `creerGenerateurSansRepetition` : aucune question n'est répétée. */
function reglagesPourTheme(theme: VarianteQuizFonctionsLogarithmes): ReglagesSession6e {
  return { nombreExercices: nombreQuestions(theme), tentativesMax: 1 };
}

const ETENDUE_QUESTIONS = etendueNombreQuestions();

function nouvelleSession(theme: VarianteQuizFonctionsLogarithmes): EtatSessionQuizFonctionsLogarithmes {
  return demarrerSessionQuizFonctionsLogarithmes(reglagesPourTheme(theme), creerGenerateurSansRepetition(theme));
}

/** Contrairement à la plupart des générateurs, le thème (variante) n'est pas tiré au hasard : c'est
 * l'ÉLÈVE qui le choisit sur un écran d'accueil dédié — même principe que 6gen65 (porté depuis
 * plateforme-maths, chapitre 3 « Fonctions logarithmes »). */
export function App6gen66() {
  const [themeChoisi, setThemeChoisi] = useState<VarianteQuizFonctionsLogarithmes | null>(null);
  const [etat, setEtat] = useState<EtatSessionQuizFonctionsLogarithmes | null>(null);
  const [dernierResultat, setDernierResultat] = useState<ResultatExerciceQuizFonctionsLogarithmes | null>(null);

  function choisirTheme(theme: VarianteQuizFonctionsLogarithmes) {
    setThemeChoisi(theme);
    setEtat(nouvelleSession(theme));
    setDernierResultat(null);
  }

  function onValider(reponse: boolean) {
    if (!etat) return;
    const nouvelEtat = soumettreReponseQuizFonctionsLogarithmes(etat, reponse);
    setDernierResultat(nouvelEtat.resultats[nouvelEtat.resultats.length - 1]);
    setEtat(nouvelEtat);
  }

  function onGenererDev(varianteId: string) {
    const theme = varianteId as VarianteQuizFonctionsLogarithmes;
    setThemeChoisi(theme);
    setDernierResultat(null);
    setEtat(demarrerSessionQuizFonctionsLogarithmes(reglagesPourTheme(theme), () => construireAvecVarianteId(theme)));
  }

  const enCoursDeSession = etat !== null && !etat.terminee && !dernierResultat;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Fonctions logarithmes — vrai ou faux</h1>
        <p className="app-subtitle">Chapitre 3 — {themeChoisi ? CATALOGUE_VARIANTES.find((v) => v.id === themeChoisi)?.label : "Fonctions logarithmes"}</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
        {enCoursDeSession && etat && (
          <div className="progress">
            <div className="progress-label">
              <span>
                Question {etat.indexExercice + 1} / {etat.reglages.nombreExercices}
              </span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${(etat.indexExercice / etat.reglages.nombreExercices) * 100}%` }} />
            </div>
          </div>
        )}
      </header>

      <main className="card">
        <div className="card-body">
          {!etat ? (
            <div>
              <h2 className="result-title">Choisis un thème</h2>
              <p className="result-subtitle">
                {CATALOGUE_VARIANTES.length} thèmes,{" "}
                {ETENDUE_QUESTIONS.min === ETENDUE_QUESTIONS.max ? ETENDUE_QUESTIONS.min : `${ETENDUE_QUESTIONS.min} à ${ETENDUE_QUESTIONS.max}`} affirmations
                vrai/faux chacun — révision complète du chapitre 3.
              </p>
              <div className="accueil-choix">
                {CATALOGUE_VARIANTES.map((variante, index) => (
                  <button key={variante.id} type="button" className="btn btn-primary" onClick={() => choisirTheme(variante.id)}>
                    {index + 1}. {variante.label}
                  </button>
                ))}
              </div>
            </div>
          ) : dernierResultat ? (
            <ResultatPanelQuizFonctionsLogarithmes
              resultat={dernierResultat}
              labelBouton={etat.terminee ? "Voir le résumé" : "Question suivante"}
              onContinuer={() => setDernierResultat(null)}
            />
          ) : etat.terminee ? (
            <ResumeSessionQuizFonctionsLogarithmes
              resultats={etat.resultats}
              onRecommencer={() => themeChoisi && setEtat(nouvelleSession(themeChoisi))}
              onChangerTheme={() => {
                setThemeChoisi(null);
                setEtat(null);
              }}
            />
          ) : (
            <EtapeQuestionQuizFonctionsLogarithmes question={etat.exerciceCourant.question} onValider={onValider} />
          )}{" "}
        </div>
      </main>
    </div>
  );
}

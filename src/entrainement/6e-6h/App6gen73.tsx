import { useState } from "react";
import type { VarianteQuizConiques } from "./core6e/quizConiques.types";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { demarrerSessionQuizConiques, soumettreReponseQuizConiques } from "./moteur6e/sessionQuizConiques";
import type { EtatSessionQuizConiques, ResultatExerciceQuizConiques } from "./moteur6e/typesQuizConiques";
import {
  CATALOGUE_VARIANTES,
  construireAvecVarianteId,
  creerGenerateurSansRepetition,
  etendueNombreQuestions,
  nombreQuestions,
} from "./generateurs6e/quizConiques";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { EtapeQuestionQuizConiques } from "./components6e/EtapeQuestionQuizConiques";
import { ResultatPanelQuizConiques } from "./components6e/ResultatPanelQuizConiques";
import { ResumeSessionQuizConiques } from "./components6e/ResumeSessionQuizConiques";

/** Une session = toutes les questions du thème choisi (`nombreQuestions`, taille réelle de la banque,
 * jamais une constante en dur), couplé à `creerGenerateurSansRepetition` : aucune question n'est
 * répétée. */
function reglagesPourTheme(theme: VarianteQuizConiques): ReglagesSession6e {
  return { nombreExercices: nombreQuestions(theme), tentativesMax: 1 };
}

const ETENDUE_QUESTIONS = etendueNombreQuestions();

function nouvelleSession(theme: VarianteQuizConiques): EtatSessionQuizConiques {
  return demarrerSessionQuizConiques(reglagesPourTheme(theme), creerGenerateurSansRepetition(theme));
}

/** Contrairement à la plupart des générateurs, le thème (variante) n'est pas tiré au hasard : c'est
 * l'ÉLÈVE qui le choisit sur un écran d'accueil dédié — même principe que 6gen64/65/66/67/68/69/70/
 * 71/72. Le panneau dev (`SelecteurVarianteDev`) reste réservé au développement, jamais visible sur
 * l'écran normal donné aux élèves. */
export function App6gen73() {
  const [themeChoisi, setThemeChoisi] = useState<VarianteQuizConiques | null>(null);
  const [etat, setEtat] = useState<EtatSessionQuizConiques | null>(null);
  const [dernierResultat, setDernierResultat] = useState<ResultatExerciceQuizConiques | null>(null);

  function choisirTheme(theme: VarianteQuizConiques) {
    setThemeChoisi(theme);
    setEtat(nouvelleSession(theme));
    setDernierResultat(null);
  }

  function onValider(reponse: boolean) {
    if (!etat) return;
    const nouvelEtat = soumettreReponseQuizConiques(etat, reponse);
    setDernierResultat(nouvelEtat.resultats[nouvelEtat.resultats.length - 1]);
    setEtat(nouvelEtat);
  }

  function onGenererDev(varianteId: string) {
    const theme = varianteId as VarianteQuizConiques;
    setThemeChoisi(theme);
    setDernierResultat(null);
    setEtat(demarrerSessionQuizConiques(reglagesPourTheme(theme), () => construireAvecVarianteId(theme)));
  }

  const enCoursDeSession = etat !== null && !etat.terminee && !dernierResultat;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Les coniques — vrai ou faux</h1>
        <p className="app-subtitle">Chapitre 10 — {themeChoisi ? CATALOGUE_VARIANTES.find((v) => v.id === themeChoisi)?.label : "Les coniques"}</p>
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
        {!etat ? (
          <div>
            <h2 className="result-title">Choisis un thème</h2>
            <p className="result-subtitle">
              {CATALOGUE_VARIANTES.length} thèmes,{" "}
              {ETENDUE_QUESTIONS.min === ETENDUE_QUESTIONS.max ? ETENDUE_QUESTIONS.min : `${ETENDUE_QUESTIONS.min} à ${ETENDUE_QUESTIONS.max}`} affirmations vrai/faux
              chacun — révision complète du chapitre « Les coniques ».
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
          <ResultatPanelQuizConiques
            resultat={dernierResultat}
            labelBouton={etat.terminee ? "Voir le résumé" : "Question suivante"}
            onContinuer={() => setDernierResultat(null)}
          />
        ) : etat.terminee ? (
          <ResumeSessionQuizConiques
            resultats={etat.resultats}
            onRecommencer={() => themeChoisi && setEtat(nouvelleSession(themeChoisi))}
            onChangerTheme={() => {
              setThemeChoisi(null);
              setEtat(null);
            }}
          />
        ) : (
          <EtapeQuestionQuizConiques question={etat.exerciceCourant.question} onValider={onValider} />
        )}
      </main>
    </div>
  );
}

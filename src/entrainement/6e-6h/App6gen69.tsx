import { useState } from "react";
import type { VarianteQuizProbabilites } from "./core6e/quizProbabilites.types";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { demarrerSessionQuizProbabilites, soumettreReponseQuizProbabilites } from "./moteur6e/sessionQuizProbabilites";
import type { EtatSessionQuizProbabilites, ResultatExerciceQuizProbabilites } from "./moteur6e/typesQuizProbabilites";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, creerGenerateurSansRepetition } from "./generateurs6e/quizProbabilites";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { EtapeQuestionQuizProbabilites } from "./components6e/EtapeQuestionQuizProbabilites";
import { ResultatPanelQuizProbabilites } from "./components6e/ResultatPanelQuizProbabilites";
import { ResumeSessionQuizProbabilites } from "./components6e/ResumeSessionQuizProbabilites";

/** `nombreExercices: 35` correspond exactement à la taille de la banque par thème (voir
 * `generateurs6e/quizProbabilites/banque.ts`) : couplé à `creerGenerateurSansRepetition`, une
 * session parcourt donc les 35 questions du thème choisi sans jamais en répéter une. */
const REGLAGES_DEMO: ReglagesSession6e = {
  nombreExercices: 35,
  tentativesMax: 1,
  penaliteActivee: true,
};

function nouvelleSession(theme: VarianteQuizProbabilites): EtatSessionQuizProbabilites {
  return demarrerSessionQuizProbabilites(REGLAGES_DEMO, creerGenerateurSansRepetition(theme));
}


/** Contrairement à la plupart des générateurs, le thème (variante) n'est pas tiré au hasard : c'est
 * l'ÉLÈVE qui le choisit sur un écran d'accueil dédié — même principe que 6gen64/6gen65/6gen66/
 * 6gen67/6gen68. Le panneau dev (`SelecteurVarianteDev`) reste réservé au développement, jamais
 * visible sur l'écran normal donné aux élèves. */
export function App6gen69() {
  const [themeChoisi, setThemeChoisi] = useState<VarianteQuizProbabilites | null>(null);
  const [etat, setEtat] = useState<EtatSessionQuizProbabilites | null>(null);
  const [dernierResultat, setDernierResultat] = useState<ResultatExerciceQuizProbabilites | null>(null);

  function choisirTheme(theme: VarianteQuizProbabilites) {
    setThemeChoisi(theme);
    setEtat(nouvelleSession(theme));
    setDernierResultat(null);
  }

  function onValider(reponse: boolean) {
    if (!etat) return;
    const nouvelEtat = soumettreReponseQuizProbabilites(etat, reponse);
    setDernierResultat(nouvelEtat.resultats[nouvelEtat.resultats.length - 1]);
    setEtat(nouvelEtat);
  }

  function onGenererDev(varianteId: string) {
    const theme = varianteId as VarianteQuizProbabilites;
    setThemeChoisi(theme);
    setDernierResultat(null);
    setEtat(demarrerSessionQuizProbabilites(REGLAGES_DEMO, () => construireAvecVarianteId(theme)));
  }

  const enCoursDeSession = etat !== null && !etat.terminee && !dernierResultat;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Probabilités — vrai ou faux</h1>
        <p className="app-subtitle">Chapitre 8{themeChoisi ? ` — ${CATALOGUE_VARIANTES.find((v) => v.id === themeChoisi)?.label}` : ""}</p>
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
            <p className="result-subtitle">4 thèmes, 35 affirmations vrai/faux chacun — révision complète du chapitre 8.</p>
            <div className="accueil-choix">
              {CATALOGUE_VARIANTES.map((variante, index) => (
                <button key={variante.id} type="button" className="btn btn-primary" onClick={() => choisirTheme(variante.id)}>
                  {index + 1}. {variante.label}
                </button>
              ))}
            </div>
          </div>
        ) : dernierResultat ? (
          <ResultatPanelQuizProbabilites
            resultat={dernierResultat}
            labelBouton={etat.terminee ? "Voir le résumé" : "Question suivante"}
            onContinuer={() => setDernierResultat(null)}
          />
        ) : etat.terminee ? (
          <ResumeSessionQuizProbabilites
            resultats={etat.resultats}
            onRecommencer={() => themeChoisi && setEtat(nouvelleSession(themeChoisi))}
            onChangerTheme={() => {
              setThemeChoisi(null);
              setEtat(null);
            }}
          />
        ) : (
          <EtapeQuestionQuizProbabilites question={etat.exerciceCourant.question} onValider={onValider} />
        )}
      </main>
    </div>
  );
}

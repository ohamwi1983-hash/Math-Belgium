import { useState } from "react";
import type { VarianteQuizCombinatoire } from "./core6e/quizCombinatoire.types";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { demarrerSessionQuizCombinatoire, soumettreReponseQuizCombinatoire } from "./moteur6e/sessionQuizCombinatoire";
import type { EtatSessionQuizCombinatoire, ResultatExerciceQuizCombinatoire } from "./moteur6e/typesQuizCombinatoire";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, creerGenerateurSansRepetition } from "./generateurs6e/quizCombinatoire";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { EtapeQuestionQuizCombinatoire } from "./components6e/EtapeQuestionQuizCombinatoire";
import { ResultatPanelQuizCombinatoire } from "./components6e/ResultatPanelQuizCombinatoire";
import { ResumeSessionQuizCombinatoire } from "./components6e/ResumeSessionQuizCombinatoire";

/** `nombreExercices: 35` correspond exactement à la taille de la banque par thème (voir
 * `generateurs6e/quizCombinatoire/banque.ts`) : couplé à `creerGenerateurSansRepetition`, une
 * session parcourt donc les 35 questions du thème choisi sans jamais en répéter une. */
const REGLAGES_DEMO: ReglagesSession6e = {
  nombreExercices: 35,
  tentativesMax: 1,
  penaliteActivee: true,
};

function nouvelleSession(theme: VarianteQuizCombinatoire): EtatSessionQuizCombinatoire {
  return demarrerSessionQuizCombinatoire(REGLAGES_DEMO, creerGenerateurSansRepetition(theme));
}


/** Contrairement à la plupart des générateurs, le thème (variante) n'est pas tiré au hasard : c'est
 * l'ÉLÈVE qui le choisit sur un écran d'accueil dédié — même principe que 6gen64/65/66/67/68/69. Le
 * panneau dev (`SelecteurVarianteDev`) reste réservé au développement, jamais visible sur l'écran
 * normal donné aux élèves. */
export function App6gen70() {
  const [themeChoisi, setThemeChoisi] = useState<VarianteQuizCombinatoire | null>(null);
  const [etat, setEtat] = useState<EtatSessionQuizCombinatoire | null>(null);
  const [dernierResultat, setDernierResultat] = useState<ResultatExerciceQuizCombinatoire | null>(null);

  function choisirTheme(theme: VarianteQuizCombinatoire) {
    setThemeChoisi(theme);
    setEtat(nouvelleSession(theme));
    setDernierResultat(null);
  }

  function onValider(reponse: boolean) {
    if (!etat) return;
    const nouvelEtat = soumettreReponseQuizCombinatoire(etat, reponse);
    setDernierResultat(nouvelEtat.resultats[nouvelEtat.resultats.length - 1]);
    setEtat(nouvelEtat);
  }

  function onGenererDev(varianteId: string) {
    const theme = varianteId as VarianteQuizCombinatoire;
    setThemeChoisi(theme);
    setDernierResultat(null);
    setEtat(demarrerSessionQuizCombinatoire(REGLAGES_DEMO, () => construireAvecVarianteId(theme)));
  }

  const enCoursDeSession = etat !== null && !etat.terminee && !dernierResultat;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Analyse combinatoire — vrai ou faux</h1>
        <p className="app-subtitle">Chapitre 9{themeChoisi ? ` — ${CATALOGUE_VARIANTES.find((v) => v.id === themeChoisi)?.label}` : ""}</p>
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
            <p className="result-subtitle">6 thèmes, 35 affirmations vrai/faux chacun — révision complète du chapitre 9.</p>
            <div className="accueil-choix">
              {CATALOGUE_VARIANTES.map((variante, index) => (
                <button key={variante.id} type="button" className="btn btn-primary" onClick={() => choisirTheme(variante.id)}>
                  {index + 1}. {variante.label}
                </button>
              ))}
            </div>
          </div>
        ) : dernierResultat ? (
          <ResultatPanelQuizCombinatoire
            resultat={dernierResultat}
            labelBouton={etat.terminee ? "Voir le résumé" : "Question suivante"}
            onContinuer={() => setDernierResultat(null)}
          />
        ) : etat.terminee ? (
          <ResumeSessionQuizCombinatoire
            resultats={etat.resultats}
            onRecommencer={() => themeChoisi && setEtat(nouvelleSession(themeChoisi))}
            onChangerTheme={() => {
              setThemeChoisi(null);
              setEtat(null);
            }}
          />
        ) : (
          <EtapeQuestionQuizCombinatoire question={etat.exerciceCourant.question} onValider={onValider} />
        )}
      </main>
    </div>
  );
}

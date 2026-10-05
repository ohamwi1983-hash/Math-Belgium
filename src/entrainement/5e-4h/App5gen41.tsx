import { useState } from "react";
import type { VarianteQuizSuites5e } from "./core5e/quizSuites5e.types";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { demarrerSessionQuizSuites5e, soumettreReponseQuizSuites5e } from "./moteur5e/sessionQuizSuites5e";
import type { EtatSessionQuizSuites5e, ResultatExerciceQuizSuites5e } from "./moteur5e/typesQuizSuites5e";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, creerGenerateurSansRepetition } from "./generateurs5e/quizSuites5e/index";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import { EtapeQuestionQuizSuites5e } from "./components5e/EtapeQuestionQuizSuites5e";
import { ResultatPanelQuizSuites5e } from "./components5e/ResultatPanelQuizSuites5e";
import { ResumeSessionQuizSuites5e } from "./components5e/ResumeSessionQuizSuites5e";

/** `nombreExercices: 20` correspond exactement à la taille de la banque par thème (voir
 * `generateurs5e/quizSuites5e/banque.ts`) : couplé à `creerGenerateurSansRepetition`, une
 * session parcourt donc les 20 questions du thème choisi sans jamais en répéter une. */
const REGLAGES_DEMO: ReglagesSession5e = {
  nombreExercices: 20,
  tentativesMax: 1,
  penaliteActivee: true,
};

function nouvelleSession(theme: VarianteQuizSuites5e): EtatSessionQuizSuites5e {
  return demarrerSessionQuizSuites5e(REGLAGES_DEMO, creerGenerateurSansRepetition(theme));
}

/** 5gen41 — "Suites" (quiz vrai/faux), chapitre 3, réplique mécanique du patron quiz vrai/faux déjà
 * établi au chapitre 1 (5gen39) et au chapitre 2 (5gen40). Contrairement aux autres générateurs, le
 * thème (variante) n'est pas tiré au hasard : c'est l'ÉLÈVE qui le choisit sur un écran d'accueil
 * dédié. "Changer de thème" (`ResumeSessionQuizSuites5e`) ramène à CET écran de choix, jamais à
 * l'accueil global de la plateforme (`onRetourAccueil`, réservé au bouton "← Accueil"). Le panneau
 * dev (`SelecteurVarianteDev`, 5e) reste réservé au développement, jamais visible sur l'écran normal
 * donné aux élèves. */
export function App5gen41() {
  const [themeChoisi, setThemeChoisi] = useState<VarianteQuizSuites5e | null>(null);
  const [etat, setEtat] = useState<EtatSessionQuizSuites5e | null>(null);
  const [dernierResultat, setDernierResultat] = useState<ResultatExerciceQuizSuites5e | null>(null);

  function choisirTheme(theme: VarianteQuizSuites5e) {
    setThemeChoisi(theme);
    setEtat(nouvelleSession(theme));
    setDernierResultat(null);
  }

  function onValider(reponse: boolean) {
    if (!etat) return;
    const nouvelEtat = soumettreReponseQuizSuites5e(etat, reponse);
    setDernierResultat(nouvelEtat.resultats[nouvelEtat.resultats.length - 1]);
    setEtat(nouvelEtat);
  }

  function onGenererDev(varianteId: string) {
    const theme = varianteId as VarianteQuizSuites5e;
    setThemeChoisi(theme);
    setDernierResultat(null);
    setEtat(demarrerSessionQuizSuites5e(REGLAGES_DEMO, () => construireAvecVarianteId(theme)));
  }

  const enCoursDeSession = etat !== null && !etat.terminee && !dernierResultat;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Les suites — vrai ou faux</h1>
        <p className="app-subtitle">Chapitre 3{themeChoisi ? ` — ${CATALOGUE_VARIANTES.find((v) => v.id === themeChoisi)?.label}` : ""}</p>
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
              <p className="result-subtitle">7 thèmes, 20 affirmations vrai/faux chacun — révision complète du chapitre.</p>
              <div className="accueil-choix">
                {CATALOGUE_VARIANTES.map((variante, index) => (
                  <button key={variante.id} type="button" className="btn btn-primary" onClick={() => choisirTheme(variante.id)}>
                    {index + 1}. {variante.label}
                  </button>
                ))}
              </div>
            </div>
          ) : dernierResultat ? (
            <ResultatPanelQuizSuites5e
              resultat={dernierResultat}
              labelBouton={etat.terminee ? "Voir le résumé" : "Question suivante"}
              onContinuer={() => setDernierResultat(null)}
            />
          ) : etat.terminee ? (
            <ResumeSessionQuizSuites5e
              resultats={etat.resultats}
              onRecommencer={() => themeChoisi && setEtat(nouvelleSession(themeChoisi))}
              onChangerTheme={() => {
                setThemeChoisi(null);
                setEtat(null);
              }}
            />
          ) : (
            <EtapeQuestionQuizSuites5e question={etat.exerciceCourant.question} onValider={onValider} />
          )}{" "}
        </div>
      </main>
    </div>
  );
}

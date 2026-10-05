import { useState } from "react";
import type { VarianteQuizDerivees5e } from "./core5e/quizDerivees5e.types";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { demarrerSessionQuizDerivees5e, soumettreReponseQuizDerivees5e } from "./moteur5e/sessionQuizDerivees5e";
import type { EtatSessionQuizDerivees5e, ResultatExerciceQuizDerivees5e } from "./moteur5e/typesQuizDerivees5e";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, creerGenerateurSansRepetition } from "./generateurs5e/quizDerivees5e/index";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import { EtapeQuestionQuizDerivees5e } from "./components5e/EtapeQuestionQuizDerivees5e";
import { ResultatPanelQuizDerivees5e } from "./components5e/ResultatPanelQuizDerivees5e";
import { ResumeSessionQuizDerivees5e } from "./components5e/ResumeSessionQuizDerivees5e";

/** `nombreExercices: 20` correspond exactement à la taille de la banque par thème (voir
 * `generateurs5e/quizDerivees5e/banque.ts`) : couplé à `creerGenerateurSansRepetition`, une
 * session parcourt donc les 20 questions du thème choisi sans jamais en répéter une. */
const REGLAGES_DEMO: ReglagesSession5e = {
  nombreExercices: 20,
  tentativesMax: 1,
  penaliteActivee: true,
};

function nouvelleSession(theme: VarianteQuizDerivees5e): EtatSessionQuizDerivees5e {
  return demarrerSessionQuizDerivees5e(REGLAGES_DEMO, creerGenerateurSansRepetition(theme));
}

/** 5gen43 — "Dérivées et applications" (quiz vrai/faux), chapitre 5, réplique mécanique du patron
 * quiz vrai/faux déjà établi au chapitre 1 (5gen39), au chapitre 2 (5gen40), au chapitre 3 (5gen41)
 * et au chapitre 4 (5gen42). Contrairement aux autres générateurs, le thème (variante) n'est pas
 * tiré au hasard : c'est l'ÉLÈVE qui le choisit sur un écran d'accueil dédié. "Changer de thème"
 * (`ResumeSessionQuizDerivees5e`) ramène à CET écran de choix, jamais à l'accueil global de la
 * plateforme (`onRetourAccueil`, réservé au bouton "← Accueil"). Le panneau dev
 * (`SelecteurVarianteDev`, 5e) reste réservé au développement, jamais visible sur l'écran normal
 * donné aux élèves. */
export function App5gen43() {
  const [themeChoisi, setThemeChoisi] = useState<VarianteQuizDerivees5e | null>(null);
  const [etat, setEtat] = useState<EtatSessionQuizDerivees5e | null>(null);
  const [dernierResultat, setDernierResultat] = useState<ResultatExerciceQuizDerivees5e | null>(null);

  function choisirTheme(theme: VarianteQuizDerivees5e) {
    setThemeChoisi(theme);
    setEtat(nouvelleSession(theme));
    setDernierResultat(null);
  }

  function onValider(reponse: boolean) {
    if (!etat) return;
    const nouvelEtat = soumettreReponseQuizDerivees5e(etat, reponse);
    setDernierResultat(nouvelEtat.resultats[nouvelEtat.resultats.length - 1]);
    setEtat(nouvelEtat);
  }

  function onGenererDev(varianteId: string) {
    const theme = varianteId as VarianteQuizDerivees5e;
    setThemeChoisi(theme);
    setDernierResultat(null);
    setEtat(demarrerSessionQuizDerivees5e(REGLAGES_DEMO, () => construireAvecVarianteId(theme)));
  }

  const enCoursDeSession = etat !== null && !etat.terminee && !dernierResultat;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Dérivées et applications — vrai ou faux</h1>
        <p className="app-subtitle">Chapitre 5{themeChoisi ? ` — ${CATALOGUE_VARIANTES.find((v) => v.id === themeChoisi)?.label}` : ""}</p>
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
            <ResultatPanelQuizDerivees5e
              resultat={dernierResultat}
              labelBouton={etat.terminee ? "Voir le résumé" : "Question suivante"}
              onContinuer={() => setDernierResultat(null)}
            />
          ) : etat.terminee ? (
            <ResumeSessionQuizDerivees5e
              resultats={etat.resultats}
              onRecommencer={() => themeChoisi && setEtat(nouvelleSession(themeChoisi))}
              onChangerTheme={() => {
                setThemeChoisi(null);
                setEtat(null);
              }}
            />
          ) : (
            <EtapeQuestionQuizDerivees5e question={etat.exerciceCourant.question} onValider={onValider} />
          )}{" "}
        </div>
      </main>
    </div>
  );
}

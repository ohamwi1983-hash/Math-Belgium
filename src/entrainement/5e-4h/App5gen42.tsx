import { useState } from "react";
import type { VarianteQuizLimites5e } from "./core5e/quizLimites5e.types";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { demarrerSessionQuizLimites5e, soumettreReponseQuizLimites5e } from "./moteur5e/sessionQuizLimites5e";
import type { EtatSessionQuizLimites5e, ResultatExerciceQuizLimites5e } from "./moteur5e/typesQuizLimites5e";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, creerGenerateurSansRepetition } from "./generateurs5e/quizLimites5e/index";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import { EtapeQuestionQuizLimites5e } from "./components5e/EtapeQuestionQuizLimites5e";
import { ResultatPanelQuizLimites5e } from "./components5e/ResultatPanelQuizLimites5e";
import { ResumeSessionQuizLimites5e } from "./components5e/ResumeSessionQuizLimites5e";

/** `nombreExercices: 20` correspond exactement à la taille de la banque par thème (voir
 * `generateurs5e/quizLimites5e/banque.ts`) : couplé à `creerGenerateurSansRepetition`, une
 * session parcourt donc les 20 questions du thème choisi sans jamais en répéter une. */
const REGLAGES_DEMO: ReglagesSession5e = {
  nombreExercices: 20,
  tentativesMax: 1,
  penaliteActivee: true,
};

function nouvelleSession(theme: VarianteQuizLimites5e): EtatSessionQuizLimites5e {
  return demarrerSessionQuizLimites5e(REGLAGES_DEMO, creerGenerateurSansRepetition(theme));
}

/** 5gen42 — "Limites et asymptotes" (quiz vrai/faux), chapitre 4, réplique mécanique du patron quiz
 * vrai/faux déjà établi au chapitre 1 (5gen39), au chapitre 2 (5gen40) et au chapitre 3 (5gen41).
 * Contrairement aux autres générateurs, le thème (variante) n'est pas tiré au hasard : c'est
 * l'ÉLÈVE qui le choisit sur un écran d'accueil dédié. "Changer de thème"
 * (`ResumeSessionQuizLimites5e`) ramène à CET écran de choix, jamais à l'accueil global de la
 * plateforme (`onRetourAccueil`, réservé au bouton "← Accueil"). Le panneau dev
 * (`SelecteurVarianteDev`, 5e) reste réservé au développement, jamais visible sur l'écran normal
 * donné aux élèves. */
export function App5gen42() {
  const [themeChoisi, setThemeChoisi] = useState<VarianteQuizLimites5e | null>(null);
  const [etat, setEtat] = useState<EtatSessionQuizLimites5e | null>(null);
  const [dernierResultat, setDernierResultat] = useState<ResultatExerciceQuizLimites5e | null>(null);

  function choisirTheme(theme: VarianteQuizLimites5e) {
    setThemeChoisi(theme);
    setEtat(nouvelleSession(theme));
    setDernierResultat(null);
  }

  function onValider(reponse: boolean) {
    if (!etat) return;
    const nouvelEtat = soumettreReponseQuizLimites5e(etat, reponse);
    setDernierResultat(nouvelEtat.resultats[nouvelEtat.resultats.length - 1]);
    setEtat(nouvelEtat);
  }

  function onGenererDev(varianteId: string) {
    const theme = varianteId as VarianteQuizLimites5e;
    setThemeChoisi(theme);
    setDernierResultat(null);
    setEtat(demarrerSessionQuizLimites5e(REGLAGES_DEMO, () => construireAvecVarianteId(theme)));
  }

  const enCoursDeSession = etat !== null && !etat.terminee && !dernierResultat;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Limites et asymptotes — vrai ou faux</h1>
        <p className="app-subtitle">Chapitre 4{themeChoisi ? ` — ${CATALOGUE_VARIANTES.find((v) => v.id === themeChoisi)?.label}` : ""}</p>
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
            <ResultatPanelQuizLimites5e
              resultat={dernierResultat}
              labelBouton={etat.terminee ? "Voir le résumé" : "Question suivante"}
              onContinuer={() => setDernierResultat(null)}
            />
          ) : etat.terminee ? (
            <ResumeSessionQuizLimites5e
              resultats={etat.resultats}
              onRecommencer={() => themeChoisi && setEtat(nouvelleSession(themeChoisi))}
              onChangerTheme={() => {
                setThemeChoisi(null);
                setEtat(null);
              }}
            />
          ) : (
            <EtapeQuestionQuizLimites5e question={etat.exerciceCourant.question} onValider={onValider} />
          )}{" "}
        </div>
      </main>
    </div>
  );
}

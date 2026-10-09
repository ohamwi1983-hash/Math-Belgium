import { useState } from "react";
import type { VarianteQuizConiques } from "./core6e/quizConiques.types";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { demarrerSessionQuizConiques, soumettreReponseQuizConiques } from "./moteur6e/sessionQuizConiques";
import type { EtatSessionQuizConiques, ResultatExerciceQuizConiques } from "./moteur6e/typesQuizConiques";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, creerGenerateurSansRepetition } from "./generateurs6e/quizConiques";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { EtapeQuestionQuizConiques } from "./components6e/EtapeQuestionQuizConiques";
import { ResultatPanelQuizConiques } from "./components6e/ResultatPanelQuizConiques";
import { ResumeSessionQuizConiques } from "./components6e/ResumeSessionQuizConiques";

/** `nombreExercices: 35` correspond exactement à la taille de la banque par thème (voir
 * `generateurs6e/quizConiques/banque.ts`) : couplé à `creerGenerateurSansRepetition`, une session
 * parcourt donc les 35 questions du thème choisi sans jamais en répéter une. */
const REGLAGES_DEMO: ReglagesSession6e = {
  nombreExercices: 35,
  tentativesMax: 1,
  penaliteActivee: true,
};

/** Le chapitre "Les coniques" n'a JAMAIS porté de numéro dans ce dépôt (contrairement aux chapitres
 * 1/2/3/4/7/8/9/10, révisés par 6gen64-71) — même situation que "Lieux géométriques" (6gen72). Il
 * est désigné par son seul nom partout, y compris dans `docs/historique-6e.md` et
 * `.claude/rules/6e-chapitres.md`. Le sous-titre le nomme donc plutôt que d'inventer un numéro. */
const NOM_CHAPITRE = "Chapitre « Les coniques »";

function nouvelleSession(theme: VarianteQuizConiques): EtatSessionQuizConiques {
  return demarrerSessionQuizConiques(REGLAGES_DEMO, creerGenerateurSansRepetition(theme));
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
    setEtat(demarrerSessionQuizConiques(REGLAGES_DEMO, () => construireAvecVarianteId(theme)));
  }

  const enCoursDeSession = etat !== null && !etat.terminee && !dernierResultat;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Les coniques — vrai ou faux</h1>
        <p className="app-subtitle">
          {NOM_CHAPITRE}
          {themeChoisi ? ` — ${CATALOGUE_VARIANTES.find((v) => v.id === themeChoisi)?.label}` : ""}
        </p>
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
            <p className="result-subtitle">6 thèmes, 35 affirmations vrai/faux chacun — révision complète du chapitre « Les coniques ».</p>
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

import { useState } from "react";
import type { VarianteQuizFonctions5e } from "./core5e/quizFonctions5e.types";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { demarrerSessionQuizFonctions5e, soumettreReponseQuizFonctions5e } from "./moteur5e/sessionQuizFonctions5e";
import type { EtatSessionQuizFonctions5e, ResultatExerciceQuizFonctions5e } from "./moteur5e/typesQuizFonctions5e";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, creerGenerateurSansRepetition, etendueNombreQuestions, nombreQuestions } from "./generateurs5e/quizFonctions5e/index";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import { EtapeQuestionQuizFonctions5e } from "./components5e/EtapeQuestionQuizFonctions5e";
import { ResultatPanelQuizFonctions5e } from "./components5e/ResultatPanelQuizFonctions5e";
import { ResumeSessionQuizFonctions5e } from "./components5e/ResumeSessionQuizFonctions5e";
import { useNoterEssai } from "../../lib/suiviContexte";

/** `nombreExercices` = taille RÉELLE de la banque du thème (`.claude/rules/quiz-generators.md`,
 * piège du nombre fixe) : couplé à `creerGenerateurSansRepetition`, une session parcourt toutes les
 * affirmations du thème choisi sans jamais en répéter une, même si la banque change de taille. */
function reglagesPour(theme: VarianteQuizFonctions5e): ReglagesSession5e {
  return { nombreExercices: nombreQuestions(theme), tentativesMax: 1 };
}

const ETENDUE_QUESTIONS = etendueNombreQuestions();

function nouvelleSession(theme: VarianteQuizFonctions5e): EtatSessionQuizFonctions5e {
  return demarrerSessionQuizFonctions5e(reglagesPour(theme), creerGenerateurSansRepetition(theme));
}

/** 5gen39 — "Fonctions : rappels et compléments" (quiz vrai/faux), chapitre 1, réplique mécanique
 * du patron quiz vrai/faux du 4e (gen59-62). Contrairement aux autres générateurs, le thème
 * (variante) n'est pas tiré au hasard : c'est l'ÉLÈVE qui le choisit sur un écran d'accueil dédié.
 * "Changer de thème" (`ResumeSessionQuizFonctions5e`) ramène à CET écran de choix, jamais à
 * l'accueil global de la plateforme (`onRetourAccueil`, réservé au bouton "← Accueil"). Le panneau
 * des variantes (`SelecteurVarianteDev`, 5e) reste visible, comme dans tous les générateurs. */
export function App5gen39() {
  const noterEssai = useNoterEssai();
  const [themeChoisi, setThemeChoisi] = useState<VarianteQuizFonctions5e | null>(null);
  const [etat, setEtat] = useState<EtatSessionQuizFonctions5e | null>(null);
  const [dernierResultat, setDernierResultat] = useState<ResultatExerciceQuizFonctions5e | null>(null);

  function choisirTheme(theme: VarianteQuizFonctions5e) {
    setThemeChoisi(theme);
    setEtat(nouvelleSession(theme));
    setDernierResultat(null);
  }

  function onValider(reponse: boolean) {
    if (!etat) return;
    const nouvelEtat = soumettreReponseQuizFonctions5e(etat, reponse);
    const resultat = nouvelEtat.resultats[nouvelEtat.resultats.length - 1];
    // « Mon suivi » (`lib/suiviEssais.ts`) : chaque affirmation répondue = un essai d'un écran, gardé sur l'appareil.
    if (resultat && nouvelEtat.resultats.length > etat.resultats.length) noterEssai([resultat.revele ? "revele" : "correcte"], resultat.variante);
    setDernierResultat(resultat);
    setEtat(nouvelEtat);
  }

  function onGenererDev(varianteId: string) {
    const theme = varianteId as VarianteQuizFonctions5e;
    setThemeChoisi(theme);
    setDernierResultat(null);
    setEtat(demarrerSessionQuizFonctions5e(reglagesPour(theme), () => construireAvecVarianteId(theme)));
  }

  const enCoursDeSession = etat !== null && !etat.terminee && !dernierResultat;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Fonctions : rappels et compléments — vrai ou faux</h1>
        <p className="app-subtitle">Chapitre 1{themeChoisi ? ` — ${CATALOGUE_VARIANTES.find((v) => v.id === themeChoisi)?.label}` : ""}</p>
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
                {ETENDUE_QUESTIONS.min === ETENDUE_QUESTIONS.max
                  ? `${ETENDUE_QUESTIONS.max} affirmations`
                  : `${ETENDUE_QUESTIONS.min} à ${ETENDUE_QUESTIONS.max} affirmations`}{" "}
                vrai/faux chacun — révision complète du chapitre.
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
            <ResultatPanelQuizFonctions5e
              resultat={dernierResultat}
              labelBouton={etat.terminee ? "Voir le résumé" : "Question suivante"}
              onContinuer={() => setDernierResultat(null)}
            />
          ) : etat.terminee ? (
            <ResumeSessionQuizFonctions5e
              resultats={etat.resultats}
              onRecommencer={() => themeChoisi && setEtat(nouvelleSession(themeChoisi))}
              onChangerTheme={() => {
                setThemeChoisi(null);
                setEtat(null);
              }}
            />
          ) : (
            <EtapeQuestionQuizFonctions5e question={etat.exerciceCourant.question} onValider={onValider} />
          )}{" "}
        </div>
      </main>
    </div>
  );
}

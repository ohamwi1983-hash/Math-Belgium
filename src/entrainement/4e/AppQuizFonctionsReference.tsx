import { useState } from "react";
import type { VarianteQuizFonctionsReference } from "./core/quizFonctionsReference.types";
import type { ReglagesSession } from "./core/session.types";
import { demarrerSessionQuizFonctionsReference, soumettreReponseQuizFonctionsReference } from "./moteur/sessionQuizFonctionsReference";
import type { EtatSessionQuizFonctionsReference, ResultatExerciceQuizFonctionsReference } from "./moteur/typesQuizFonctionsReference";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, creerGenerateurSansRepetition, nombreQuestions } from "./generateurs/quizFonctionsReference";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeQuestionQuizFonctionsReference } from "./components/EtapeQuestionQuizFonctionsReference";
import { ResultatPanelQuizFonctionsReference } from "./components/ResultatPanelQuizFonctionsReference";
import { ResumeSessionQuizFonctionsReference } from "./components/ResumeSessionQuizFonctionsReference";

/** `nombreExercices` est calculé depuis la taille RÉELLE de la banque du thème choisi
 * (`nombreQuestions`, `generateurs/quizFonctionsReference/index.ts`) — jamais une constante fixe
 * (33 à 35 selon le thème) : couplé à `creerGenerateurSansRepetition`, une session parcourt donc
 * exactement les questions du thème choisi sans jamais en répéter une. */
function reglagesPourTheme(theme: VarianteQuizFonctionsReference): ReglagesSession {
  return {
    nombreExercices: nombreQuestions(theme),
    tentativesMax: 1,
    penaliteActivee: true,
    affichageReponseApresEchec: true,
    affichageExplication: true,
  };
}

function nouvelleSession(theme: VarianteQuizFonctionsReference): EtatSessionQuizFonctionsReference {
  return demarrerSessionQuizFonctionsReference(reglagesPourTheme(theme), creerGenerateurSansRepetition(theme));
}

/** Contrairement aux autres générateurs, le thème (variante) n'est pas tiré au hasard : c'est
 * l'ÉLÈVE qui le choisit sur un écran d'accueil dédié — même principe que "Statistique descriptive
 * à une variable" (gen59), "La fonction du second degré" (gen60) et "Équations et inéquations du
 * second degré" (gen61). Le panneau dev (`SelecteurVarianteDev`) reste réservé au développement,
 * jamais visible sur l'écran normal donné aux élèves. */
export function AppQuizFonctionsReference() {
  const [themeChoisi, setThemeChoisi] = useState<VarianteQuizFonctionsReference | null>(null);
  const [etat, setEtat] = useState<EtatSessionQuizFonctionsReference | null>(null);
  const [dernierResultat, setDernierResultat] = useState<ResultatExerciceQuizFonctionsReference | null>(null);

  function choisirTheme(theme: VarianteQuizFonctionsReference) {
    setThemeChoisi(theme);
    setEtat(nouvelleSession(theme));
    setDernierResultat(null);
  }

  function onValider(reponse: boolean) {
    if (!etat) return;
    const nouvelEtat = soumettreReponseQuizFonctionsReference(etat, reponse);
    setDernierResultat(nouvelEtat.resultats[nouvelEtat.resultats.length - 1]);
    setEtat(nouvelEtat);
  }

  function onGenererDev(varianteId: string) {
    const theme = varianteId as VarianteQuizFonctionsReference;
    setThemeChoisi(theme);
    setDernierResultat(null);
    setEtat(demarrerSessionQuizFonctionsReference(reglagesPourTheme(theme), () => construireAvecVarianteId(theme)));
  }

  const enCoursDeSession = etat !== null && !etat.terminee && !dernierResultat;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Caractéristiques d'une fonction &amp; fonctions de référence — vrai ou faux</h1>
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
              <p className="result-subtitle">7 thèmes, 33 à 35 affirmations vrai/faux chacun — révision complète du chapitre.</p>
              <div className="accueil-choix">
                {CATALOGUE_VARIANTES.map((variante, index) => (
                  <button key={variante.id} type="button" className="btn btn-primary" onClick={() => choisirTheme(variante.id)}>
                    {index + 1}. {variante.label}
                  </button>
                ))}
              </div>
            </div>
          ) : dernierResultat ? (
            <ResultatPanelQuizFonctionsReference
              resultat={dernierResultat}
              labelBouton={etat.terminee ? "Voir le résumé" : "Question suivante"}
              onContinuer={() => setDernierResultat(null)}
            />
          ) : etat.terminee ? (
            <ResumeSessionQuizFonctionsReference
              resultats={etat.resultats}
              onRecommencer={() => themeChoisi && setEtat(nouvelleSession(themeChoisi))}
              onChangerTheme={() => {
                setThemeChoisi(null);
                setEtat(null);
              }}
            />
          ) : (
            <EtapeQuestionQuizFonctionsReference question={etat.exerciceCourant.question} onValider={onValider} />
          )}{" "}
        </div>
      </main>
    </div>
  );
}

import { Fragment, useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession } from "./core/session.types";
import type { SolutionEnsemble } from "./core/inequation.types";
import type { ExerciceProblemesFonctionsReference } from "./core/problemesFonctionsReference.types";
import {
  activerAide,
  demarrerSessionProblemesFonctionsReference,
  soumettreDomaine,
  soumettreFonction,
  soumettreInterpretation,
  soumettreQuestion,
} from "./moteur/sessionProblemesFonctionsReference";
import type { EtatSessionProblemesFonctionsReference, PhaseProblemesFonctionsReference } from "./moteur/sessionProblemesFonctionsReference";
import { decrireProbleme, diagnostiquerFonction, diagnostiquerQuestion, ensembleLatex, expressionSansPrefixe } from "./moteur/problemesFonctionsReference";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceProblemesFonctionsReference } from "./generateurs/problemesFonctionsReference";
import {
  aidesDomaine,
  aidesFonction,
  aidesInterpretation,
  aidesQuestion,
  consigneDomaine,
  consigneFonction,
  consigneQuestion,
  domaineAttenduLatex,
  enonceFragments,
  fonctionAttendueLatex,
  fonctionLatex,
  libelleChampFonction,
  messageQuestion,
  optionsInterpretation,
  placeholderFonction,
  questionInterpretation,
  solutionAttendueLatex,
} from "./ui/formatProblemesFonctionsReference";
import { formatMessageErreur } from "./ui/messageErreur";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { EtapeChoixProbleme, EtapeEnsembleProbleme, EtapeFonctionProbleme } from "./components/EtapesProblemesFonctionsReference";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { Katex } from "./components/Katex";
import { RenduFragments } from "./components/RenduFragments";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { ecranClos, segmentsDepuisHistorique, type EcranClos } from "./ui/historiqueProgression";
import { expressionLibreVersLatex } from "./ui/formatExpressionLatex";

const CONSIGNE_GENERALE = "Modélise la situation par une fonction de référence, puis utilise-la pour répondre aux questions.";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

const MESSAGE_CHOIX_FERME = "Ce n'était pas la bonne réponse (une seule tentative sur un choix fermé).";

function demarrer(varianteId: string | null): EtatSessionProblemesFonctionsReference {
  return demarrerSessionProblemesFonctionsReference(REGLAGES_DEMO, () =>
    varianteId ? construireAvecVarianteId(varianteId) : genererExerciceProblemesFonctionsReference(),
  );
}

/** Première session : si l'URL porte le code d'un exercice imprimé (`?code=XXXXXX`), son exercice
 * est tiré avec les MÊMES fonctions que l'adaptateur d'export (`CATALOGUE_VARIANTES`,
 * `genererExerciceProblemesFonctionsReference`, `construireAvecVarianteId`). */
function sessionInitiale(): EtatSessionProblemesFonctionsReference {
  const code = lireCodeDepuisUrl();
  if (!code) return demarrer(null);
  return demarrerSessionProblemesFonctionsReference(REGLAGES_DEMO, () =>
    genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceProblemesFonctionsReference, construireAvecVarianteId),
  );
}

const NOMBRE_ECRANS = 4;

const TITRES: Record<PhaseProblemesFonctionsReference, string> = {
  fonction: "Fonction",
  domaine: "Domaine du contexte",
  question: "Question concrète",
  interpretation: "Interprétation",
};

function reponseAttendue(phase: PhaseProblemesFonctionsReference, e: ExerciceProblemesFonctionsReference): ReactNode {
  switch (phase) {
    case "fonction":
      return <Katex expression={fonctionAttendueLatex(e)} />;
    case "domaine":
      return <Katex expression={domaineAttenduLatex(e)} />;
    case "question":
      return <Katex expression={solutionAttendueLatex(e)} />;
    case "interpretation":
      return <span>{optionsInterpretation(e)[0]}</span>;
  }
}

/** Saisie de l'écran 1 rendue « t(v) = … » en KaTeX (préfixe recopié ou non), jamais en notation
 * clavier ; texte brut à typographie corrigée si elle n'est pas analysable. */
function saisieFonctionEnLatex(e: ExerciceProblemesFonctionsReference, saisie: string): ReactNode {
  const expression = expressionSansPrefixe(saisie);
  try {
    return <Katex expression={`${fonctionLatex(e)} = ${expressionLibreVersLatex(expression)}`} />;
  } catch {
    return expression.replace(/-/g, "−").replace(/(\d)\.(\d)/g, "$1,$2");
  }
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionProblemesFonctionsReference;
  revele: boolean;
}

export function AppProblemesFonctionsReference() {
  const [etat, setEtat] = useState<EtatSessionProblemesFonctionsReference>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  const [varianteForcee, setVarianteForcee] = useState<string | null>(null);
  /** Message de la dernière tentative refusée sur un écran à saisie libre. */
  const [messageErreur, setMessageErreur] = useState<string | null>(null);
  /** Compteur d'exercices : clé de la zone d'étapes, pour que les champs repartent vides. */
  const [numeroExercice, setNumeroExercice] = useState(0);

  const exercice = etat.exerciceCourant;
  const description = decrireProbleme(exercice);
  const max = etat.reglages.tentativesMax;

  function terminerEtape(nouvelEtat: EtatSessionProblemesFonctionsReference, votreReponse: ReactNode, erreurSiRefus: () => string | null) {
    const transition = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transition) {
      const revele = nouvelEtat.revele[etat.phase];
      setHistorique((h) => [...h, ecranClos(TITRES[etat.phase], votreReponse, revele, etat.aideUtilisee[etat.phase], reponseAttendue(etat.phase, exercice))]);
      setEnAttente({ etatSuivant: nouvelEtat, revele });
      setMessageErreur(null);
      return;
    }
    setMessageErreur(erreurSiRefus());
    setEtat(nouvelEtat);
  }

  function nouvelExercice(varianteId: string | null) {
    setEtat(demarrer(varianteId));
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setMessageErreur(null);
    setNumeroExercice((n) => n + 1);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      nouvelExercice(varianteForcee);
      return;
    }
    setEtat(enAttente.etatSuivant);
    setEnAttente(null);
  }

  function onGenererDev(varianteId: string) {
    setVarianteForcee(varianteId);
    nouvelExercice(varianteId);
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: etat.reglages.affichageReponseApresEchec ? reponseAttendue(etat.phase, exercice) : undefined,
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
        ...(etat.phase === "domaine" || etat.phase === "interpretation" ? { messageRevele: MESSAGE_CHOIX_FERME } : {}),
      }
    : null;

  const onActiverAide = () => setEtat(activerAide(etat));

  function validerFonction(saisie: string) {
    const statut = diagnostiquerFonction(saisie, exercice);
    terminerEtape(soumettreFonction(etat, saisie), saisieFonctionEnLatex(exercice, saisie), () => {
      const n = etat.etapeCourante.tentativesUtilisees + 1;
      if (statut === "mauvaise_variable") return `Écris l'expression avec la lettre ${description.variable} — tentative ${n}/${max}, réessaie.`;
      return formatMessageErreur(n, max, statut === "parse_error" ? "parse_error" : "not_equivalent");
    });
  }

  function validerQuestion(saisie: SolutionEnsemble) {
    const statut = diagnostiquerQuestion(saisie, exercice);
    terminerEtape(soumettreQuestion(etat, saisie), <Katex expression={ensembleLatex(saisie)} />, () => {
      const n = etat.etapeCourante.tentativesUtilisees + 1;
      if (statut === "faux" || statut === "correct") return formatMessageErreur(n, max);
      return `${messageQuestion(statut, exercice)} Tentative ${n}/${max}, réessaie.`;
    });
  }

  const optionsDomaine = exercice.ordreDomaine.map((index) => ({ index, contenu: description.optionsDomaine[index]!, latex: true }));
  const textesInterpretation = optionsInterpretation(exercice);
  const optionsInterp = exercice.ordreInterpretation.map((index) => ({ index, contenu: textesInterpretation[index]!, latex: false }));

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Problèmes modélisés par une fonction de référence</h1>
        <p className="app-subtitle">Caractéristiques d'une fonction et fonctions de référence</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
      </header>

      <main className="card">
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, NOMBRE_ECRANS, !enAttente)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />

        <div className="card-body">
          <EnTeteExercice
            consigneGenerale={CONSIGNE_GENERALE}
            blocDonnees={
              <p className="prompt-text">
                <RenduFragments fragments={enonceFragments(exercice)} />
              </p>
            }
          />
          <Fragment key={numeroExercice}>
            {etat.phase === "fonction" ? (
              <EtapeFonctionProbleme
                consigne={consigneFonction(exercice)}
                aides={aidesFonction(exercice)}
                niveauAide={etat.niveauAide}
                onActiverAide={onActiverAide}
                validation={validation}
                libelle={libelleChampFonction(exercice)}
                placeholder={placeholderFonction(exercice)}
                messageErreur={messageErreur}
                onValider={validerFonction}
              />
            ) : etat.phase === "domaine" ? (
              <EtapeChoixProbleme
                key="domaine"
                consigne={consigneDomaine(exercice)}
                aides={aidesDomaine(exercice)}
                niveauAide={etat.niveauAide}
                onActiverAide={onActiverAide}
                validation={validation}
                options={optionsDomaine}
                onValider={(index) => terminerEtape(soumettreDomaine(etat, index), <Katex expression={description.optionsDomaine[index]!} />, () => null)}
              />
            ) : etat.phase === "question" ? (
              <EtapeEnsembleProbleme
                consigne={consigneQuestion(exercice)}
                aides={aidesQuestion(exercice)}
                niveauAide={etat.niveauAide}
                onActiverAide={onActiverAide}
                validation={validation}
                messageErreur={messageErreur}
                onValider={validerQuestion}
              />
            ) : (
              <EtapeChoixProbleme
                key="interpretation"
                consigne={questionInterpretation(exercice)}
                aides={aidesInterpretation(exercice)}
                niveauAide={etat.niveauAide}
                onActiverAide={onActiverAide}
                validation={validation}
                options={optionsInterp}
                onValider={(index) => terminerEtape(soumettreInterpretation(etat, index), <span>{textesInterpretation[index]}</span>, () => null)}
              />
            )}
          </Fragment>
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex].entree} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}

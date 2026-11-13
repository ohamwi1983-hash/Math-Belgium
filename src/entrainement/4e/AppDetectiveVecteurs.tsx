import { Fragment, useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceDetectiveVecteurs, IdDescriptionVecteurs } from "./core/detectiveVecteurs.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDetectiveVecteurs } from "./generateurs/detectiveVecteurs";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { NOMBRE_ECRANS, activerAide, demarrer, ecranSuivant, soumettre, tentativesMaxEcran, type EtatDetectiveVecteurs } from "./moteur/sessionDetectiveVecteurs";
import { diagnostiquerCorrection, verdictFaux, verifierDescription, verifierLigne, type SaisieCorrection, type StatutChamp } from "./moteur/verificationDetectiveVecteurs";
import { SCENARIOS, colonne, descriptionCorrecte, indiceLigneFausse, valeursAttendues } from "./moteur/modeleDetectiveVecteurs";
import { expressionLibreVersLatex } from "./ui/formatExpressionLatex";
import {
  CONSIGNE_GENERALE,
  TITRES_ECRANS,
  aideSaisie,
  aidesEcran,
  consignesEcrans,
  descriptionFragments,
  enonceExercice,
  libellesValeurs,
  lignesCopie,
  messagesARevoir,
  valeurFragments,
} from "./ui/formatDetectiveVecteurs";
import { ecranClos, segmentsDepuisHistorique, type EcranClos } from "./ui/historiqueProgression";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { Katex } from "./components/Katex";
import { RenduFragments } from "./components/RenduFragments";
import { CopieEleve, EtapeDescriptionErreur, EtapeLigneFausse } from "./components/EtapesDetectiveErreurs";
import { EtapeCorrectionVecteurs } from "./components/EtapesDetectiveVecteurs";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

/**
 * gen91 — « Le détective d'erreurs vectoriel » (4e, chapitre 6, section « revision », processus 3
 * TRANSFÉRER), sur le modèle de gen81. La résolution d'un exercice de calcul vectoriel par un élève
 * fictif (4 ou 5 lignes) contient UNE ligne fausse ; la suite en découle. Trois écrans :
 * 1. quelle ligne est fausse ? (choix fermé, une tentative) ;
 * 2. quelle est l'erreur ? (4 descriptions, une tentative) ;
 * 3. corriger : bonne valeur de la ligne, puis conclusion (champs : 3 tentatives ; verdict : une).
 * Aucun point affiché. `?code=` (QR code d'une feuille) : première instance tirée avec les MÊMES
 * fonctions que l'adaptateur.
 */

function exerciceInitial(): ExerciceDetectiveVecteurs {
  const code = lireCodeDepuisUrl();
  if (!code) return genererExerciceDetectiveVecteurs();
  return genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceDetectiveVecteurs, construireAvecVariante);
}

interface TransitionEnAttente {
  revele: boolean;
  reponseAttendue: ReactNode;
  messageRevele?: string;
  derniere: boolean;
}

function reponseAttendue(e: ExerciceDetectiveVecteurs, ecran: number): ReactNode {
  if (ecran === 0) return <p style={{ margin: 0 }}>{`Ligne ${indiceLigneFausse(e) + 1}`}</p>;
  if (ecran === 1)
    return (
      <p style={{ margin: 0 }}>
        <RenduFragments fragments={descriptionFragments(descriptionCorrecte(e), e)} />
      </p>
    );
  return (
    <ul style={{ margin: 0, paddingLeft: "1.2em" }}>
      {valeursAttendues(e).map((v, i) => (
        <li key={i}>
          <RenduFragments fragments={valeurFragments(v)} />
        </li>
      ))}
    </ul>
  );
}

/** Une saisie libre en LaTeX (fiche de l'écran 3) — jamais la notation clavier brute. */
function latexSaisie(texte: string): string {
  const s = texte.trim().replace(/(\d),(\d)/g, "$1.$2").replace(/√\s*(\d+)/g, "rac($1)").replace(/√\(/g, "rac(");
  try {
    return expressionLibreVersLatex(s).replace(/(\d)\.(\d)/g, "$1{,}$2");
  } catch {
    return "?";
  }
}

/** La saisie de l'élève, réécrite (fiche de l'écran 3). */
function saisieEcrite(e: ExerciceDetectiveVecteurs, saisie: SaisieCorrection): ReactNode {
  return (
    <ul style={{ margin: 0, paddingLeft: "1.2em" }}>
      {valeursAttendues(e).map((v, i) => {
        const [a = "", b = ""] = (saisie.textes[i] ?? []).map(latexSaisie);
        let contenu: ReactNode;
        if (v.genre === "verdict") contenu = saisie.verdict ? v.libelleVrai : v.libelleFaux;
        else if (v.genre === "nombre") contenu = <Katex expression={v.quantite ? `${v.quantite} = ${a}` : a} />;
        else if (v.genre === "vecteur") contenu = <Katex expression={`${v.quantite} = ${colonne(a, b)}`} />;
        else contenu = <Katex expression={`${v.nom}(${a}\\,;\\,${b})`} />;
        return <li key={i}>{contenu}</li>;
      })}
    </ul>
  );
}

export function AppDetectiveVecteurs() {
  const [etat, setEtat] = useState<EtatDetectiveVecteurs>(() => demarrer(exerciceInitial()));
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Clé des écrans : les champs repartent vides après « Générer » ou « Nouvel exercice ». */
  const [generation, setGeneration] = useState(0);
  const [statuts, setStatuts] = useState<StatutChamp[] | null>(null);
  const [erreurLecture, setErreurLecture] = useState(false);
  const [verdictFige, setVerdictFige] = useState(false);

  const e = etat.exercice;
  const ecran = etat.ecran;

  function recommencer(exercice: ExerciceDetectiveVecteurs) {
    setEtat(demarrer(exercice));
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setStatuts(null);
    setErreurLecture(false);
    setVerdictFige(false);
    setGeneration((g) => g + 1);
  }

  function conclure(correct: boolean, votreReponse: ReactNode, definitif = false) {
    const resultat = soumettre(etat, correct, definitif);
    setErreurLecture(false);
    if (!resultat.clos) {
      setEtat(resultat.etat);
      return;
    }
    const attendue = reponseAttendue(e, ecran);
    setHistorique((h) => [...h, ecranClos(TITRES_ECRANS[ecran]!, votreReponse, resultat.revele, etat.niveauAide > 0, attendue)]);
    setEtat(resultat.etat);
    setEnAttente({
      revele: resultat.revele,
      reponseAttendue: attendue,
      messageRevele: ecran === 0 ? "Ce n'était pas la ligne fausse." : ecran === 1 ? "Ce n'était pas la bonne explication." : definitif ? "La conclusion n'était pas la bonne." : undefined,
      derniere: ecran >= NOMBRE_ECRANS - 1,
    });
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.derniere) {
      recommencer(genererExerciceDetectiveVecteurs());
      return;
    }
    setEtat(ecranSuivant(etat));
    setStatuts(null);
    setEnAttente(null);
  }

  const validation: ValidationEtapeProps | null = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: enAttente.reponseAttendue,
        labelSuivant: enAttente.derniere ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
        messageRevele: enAttente.messageRevele,
      }
    : null;

  const consigne = <RenduFragments fragments={consignesEcrans(e)[ecran]!} />;
  const communs = { aides: aidesEcran(e, ecran), niveauAide: etat.niveauAide, onActiverAide: () => setEtat(activerAide(etat)), validation };

  function ecranCourant(): ReactNode {
    if (ecran === 0) {
      return (
        <EtapeLigneFausse
          {...communs}
          consigne={consigne}
          nombreLignes={SCENARIOS[e.scenario].nombreLignes}
          attendue={indiceLigneFausse(e)}
          onValider={(i) => conclure(verifierLigne(e, i), <p style={{ margin: 0 }}>{`Ligne ${i + 1}`}</p>)}
        />
      );
    }
    if (ecran === 1) {
      return (
        <EtapeDescriptionErreur<IdDescriptionVecteurs>
          {...communs}
          consigne={consigne}
          options={e.options.map((id) => ({ id, fragments: descriptionFragments(id, e) }))}
          attendue={descriptionCorrecte(e)}
          onValider={(id) =>
            conclure(
              verifierDescription(e, id),
              <p style={{ margin: 0 }}>
                <RenduFragments fragments={descriptionFragments(id, e)} />
              </p>,
            )
          }
        />
      );
    }
    const libelles = libellesValeurs(e);
    const messages = messagesARevoir(e);
    const valeurs = valeursAttendues(e).map((valeur, i) => ({ valeur, libelle: libelles[i]!, aRevoir: messages[i]! }));
    return (
      <EtapeCorrectionVecteurs
        {...communs}
        consigne={consigne}
        valeurs={valeurs}
        aideSaisie={aideSaisie(e)}
        tentativesUtilisees={etat.tentativesUtilisees}
        tentativesMax={tentativesMaxEcran(ecran)}
        statuts={statuts}
        erreurLecture={erreurLecture}
        verdictFige={verdictFige}
        onValider={(saisie) => {
          const diagnostic = diagnostiquerCorrection(e, saisie);
          if (diagnostic.includes("parse_error")) {
            setErreurLecture(true);
            return;
          }
          setStatuts(diagnostic);
          const mauvaisVerdict = verdictFaux(e, diagnostic);
          if (!mauvaisVerdict && valeursAttendues(e).some((v) => v.genre === "verdict")) setVerdictFige(true);
          conclure(
            diagnostic.every((s) => s === "correct"),
            saisieEcrite(e, saisie),
            mauvaisVerdict,
          );
        }}
      />
    );
  }

  const blocDonnees = (
    <>
      <p style={{ margin: "6px 0" }}>
        <RenduFragments fragments={enonceExercice(e)} />
      </p>
      <CopieEleve lignes={lignesCopie(e)} ligneSignalee={ecran >= 1 ? indiceLigneFausse(e) : null} />
    </>
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Le détective d'erreurs vectoriel</h1>
        <p className="app-subtitle">Chapitre 6 — Calcul vectoriel</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={(id) => recommencer(construireAvecVariante(id))} />
      </header>

      <main className="card">
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, NOMBRE_ECRANS, !enAttente)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />

        <div className="card-body">
          <EnTeteExercice consigneGenerale={CONSIGNE_GENERALE} blocDonnees={blocDonnees} />
          <Fragment key={`${generation}-${ecran}`}>{ecranCourant()}</Fragment>
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex].entree} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}

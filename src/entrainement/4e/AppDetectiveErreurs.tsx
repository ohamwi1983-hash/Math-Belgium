import { Fragment, useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceDetectiveErreurs, IdDescription } from "./core/detectiveErreurs.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDetectiveErreurs } from "./generateurs/detectiveErreurs";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { NOMBRE_ECRANS, activerAide, demarrer, ecranSuivant, soumettre, tentativesMaxEcran, type EtatDetectiveErreurs } from "./moteur/sessionDetectiveErreurs";
import { champsAttendus, diagnostiquerCorrection, lireNombre, verifierDescription, verifierLigne, type StatutChamp } from "./moteur/verificationDetectiveErreurs";
import { DECIMALES, SCENARIOS, descriptionCorrecte, indiceLigneFausse, nombreLatex } from "./moteur/modeleDetectiveErreurs";
import {
  CONSIGNE_GENERALE,
  NOTE_MEMOIRE,
  TITRES_ECRANS,
  aidesEcran,
  consignesEcrans,
  descriptionFragments,
  enonceTriangle,
  libellesChamps,
  lignesCopie,
  valeurLatex,
} from "./ui/formatDetectiveErreurs";
import { ecranClos, segmentsDepuisHistorique, type EcranClos } from "./ui/historiqueProgression";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { CalculatriceScientifique } from "./components/CalculatriceScientifique";
import { Katex } from "./components/Katex";
import { RenduFragments } from "./components/RenduFragments";
import { CopieEleve, EtapeCorrectionCopie, EtapeDescriptionErreur, EtapeLigneFausse } from "./components/EtapesDetectiveErreurs";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

/**
 * gen81 — « Le détective d'erreurs » (4e, chapitre 5, section « triangle », processus 3
 * TRANSFÉRER). La résolution complète d'un triangle par un élève fictif (5 ou 6 lignes) contient UNE
 * ligne fausse ; la suite en découle. Trois écrans :
 * 1. quelle ligne est fausse ? (choix fermé, une tentative) ;
 * 2. quelle est l'erreur ? (4 descriptions, une tentative) ;
 * 3. corriger : bonne valeur de la ligne, puis résultat final (3 tentatives, valeurs exactes).
 * Aucun point affiché. `?code=` (QR code d'une feuille) : première instance tirée avec les MÊMES
 * fonctions que l'adaptateur.
 */

function exerciceInitial(): ExerciceDetectiveErreurs {
  const code = lireCodeDepuisUrl();
  if (!code) return genererExerciceDetectiveErreurs();
  return genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceDetectiveErreurs, construireAvecVariante);
}

interface TransitionEnAttente {
  revele: boolean;
  reponseAttendue: ReactNode;
  messageRevele?: string;
  derniere: boolean;
}

function reponseAttendue(e: ExerciceDetectiveErreurs, ecran: number): ReactNode {
  if (ecran === 0) return <p style={{ margin: 0 }}>{`Ligne ${indiceLigneFausse(e) + 1}`}</p>;
  if (ecran === 1)
    return (
      <p style={{ margin: 0 }}>
        <RenduFragments fragments={descriptionFragments(descriptionCorrecte(e), e)} />
      </p>
    );
  return (
    <ul style={{ margin: 0, paddingLeft: "1.2em" }}>
      {champsAttendus(e).map((v, i) => (
        <li key={i}>
          <Katex expression={valeurLatex(v)} />
        </li>
      ))}
    </ul>
  );
}

export function AppDetectiveErreurs() {
  const [etat, setEtat] = useState<EtatDetectiveErreurs>(() => demarrer(exerciceInitial()));
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Clé des écrans : les champs repartent vides après « Générer » ou « Nouvel exercice ». */
  const [generation, setGeneration] = useState(0);
  const [statuts, setStatuts] = useState<StatutChamp[] | null>(null);
  const [erreurLecture, setErreurLecture] = useState(false);

  const e = etat.exercice;
  const ecran = etat.ecran;

  function recommencer(exercice: ExerciceDetectiveErreurs) {
    setEtat(demarrer(exercice));
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setStatuts(null);
    setErreurLecture(false);
    setGeneration((g) => g + 1);
  }

  function conclure(correct: boolean, votreReponse: ReactNode) {
    const resultat = soumettre(etat, correct);
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
      messageRevele: ecran === 0 ? "Ce n'était pas la ligne fausse." : ecran === 1 ? "Ce n'était pas la bonne explication." : undefined,
      derniere: ecran >= NOMBRE_ECRANS - 1,
    });
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.derniere) {
      recommencer(genererExerciceDetectiveErreurs());
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
        <EtapeDescriptionErreur
          {...communs}
          consigne={consigne}
          options={e.options.map((id) => ({ id, fragments: descriptionFragments(id, e) }))}
          attendue={descriptionCorrecte(e)}
          onValider={(id: IdDescription) =>
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
    const champs = libellesChamps(e);
    return (
      <EtapeCorrectionCopie
        {...communs}
        consigne={consigne}
        champs={champs}
        tentativesUtilisees={etat.tentativesUtilisees}
        tentativesMax={tentativesMaxEcran(ecran)}
        statuts={statuts}
        erreurLecture={erreurLecture}
        onValider={(saisies) => {
          const diagnostic = diagnostiquerCorrection(e, saisies);
          if (diagnostic.includes("parse_error")) {
            setErreurLecture(true);
            return;
          }
          setStatuts(diagnostic);
          const attendus = champsAttendus(e);
          conclure(
            diagnostic.every((s) => s === "correct"),
            <ul style={{ margin: 0, paddingLeft: "1.2em" }}>
              {saisies.map((s, i) => (
                <li key={i}>
                  <Katex expression={`${champs[i]!.quantite} \\approx ${nombreLatex(lireNombre(s)!, DECIMALES[attendus[i]!.nature] + 2)}`} />
                  {champs[i]!.unite ? ` ${champs[i]!.unite}` : ""}
                </li>
              ))}
            </ul>,
          );
        }}
      />
    );
  }

  const blocDonnees = (
    <>
      <p style={{ margin: "6px 0" }}>
        <RenduFragments fragments={enonceTriangle(e)} />
      </p>
      <p style={{ margin: "6px 0", fontSize: "0.92em", color: "var(--color-text-muted)" }}>{NOTE_MEMOIRE}</p>
      <CopieEleve lignes={lignesCopie(e)} ligneSignalee={ecran >= 1 ? indiceLigneFausse(e) : null} />
    </>
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Le détective d'erreurs</h1>
        <p className="app-subtitle">Chapitre 5 — Cercle trigonométrique & triangles quelconques</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={(id) => recommencer(construireAvecVariante(id))} />
      </header>

      <main className="card">
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, NOMBRE_ECRANS, !enAttente)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />

        <div className="card-body">
          <EnTeteExercice consigneGenerale={CONSIGNE_GENERALE} blocDonnees={blocDonnees} />
          <CalculatriceScientifique />
          <Fragment key={`${generation}-${ecran}`}>{ecranCourant()}</Fragment>
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex].entree} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}

import { Fragment, useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceDetectiveSecondDegre, IdDescriptionSecondDegre } from "./core/detectiveSecondDegre.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDetectiveSecondDegre } from "./generateurs/detectiveSecondDegre";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";
import { lettreEtape, lignesDeLEtape } from "../export/corrigeTableau";
import { correctionDetailleeDetectiveSecondDegre } from "./generateurs/detectiveSecondDegre/corrigeDetaille";
import { NOMBRE_ECRANS, activerAide, demarrer, ecranSuivant, soumettre, tentativesMaxEcran, type EtatDetectiveSecondDegre } from "./moteur/sessionDetectiveSecondDegre";
import { diagnostiquerCorrection, estResultatCopie, verifierDescription, verifierLigne } from "./moteur/verificationDetectiveSecondDegre";
import { copieEleve, descriptionCorrecte, indiceLigneFausse, nombreLignes } from "./moteur/modeleDetectiveSecondDegre";
import { CONSIGNE_GENERALE, TITRES_ECRANS, aidesEcran, consignesEcrans, descriptionFragments, recit, reponseFragments } from "./ui/formatDetectiveSecondDegre";
import { ensembleLatex } from "./ui/ensembleSolutionTrinome";
import { ecranClos, segmentsDepuisHistorique, type EcranClos } from "./ui/historiqueProgression";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { RenduFragments } from "./components/RenduFragments";
import { Katex } from "./components/Katex";
import { CopieEleve, EtapeDescriptionErreur, EtapeLigneFausse } from "./components/EtapesDetectiveErreurs";
import { EtapeEnsembleSolutionTrinome } from "./components/EtapeEnsembleSolutionTrinome";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

/**
 * gen121 — « Détective d'erreurs : second degré » (4e, chapitre 2 « Équations et inéquations du
 * second degré », section `revision`, processus 3 TRANSFÉRER), même mécanique que gen81, gen91,
 * gen107 et gen112. La résolution d'une équation ou d'une inéquation par un élève fictif (4 à
 * 6 lignes) contient UNE ligne fausse ; la suite en découle. Trois écrans :
 * 1. quelle ligne est fausse ? (choix fermé, une tentative) ;
 * 2. quelle est l'erreur ? (4 descriptions, une tentative) ;
 * 3. l'ensemble-solution corrigé (saisie guidée, 3 tentatives).
 * Aucun point affiché. `?code=` (QR code d'une feuille) : première instance tirée avec les MÊMES
 * fonctions que l'adaptateur.
 */

function exerciceInitial(): ExerciceDetectiveSecondDegre {
  const code = lireCodeDepuisUrl();
  if (!code) return genererExerciceDetectiveSecondDegre();
  return genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceDetectiveSecondDegre, construireAvecVariante);
}

interface TransitionEnAttente {
  revele: boolean;
  reponseAttendue: ReactNode;
  messageRevele?: string;
  derniere: boolean;
}

function reponseAttendue(e: ExerciceDetectiveSecondDegre, ecran: number): ReactNode {
  if (ecran === 0) return <p style={{ margin: 0 }}>{`Ligne ${indiceLigneFausse(e) + 1}`}</p>;
  const fragments = ecran === 1 ? descriptionFragments(descriptionCorrecte(e), e) : reponseFragments(e);
  return (
    <p style={{ margin: 0 }}>
      <RenduFragments fragments={fragments} />
    </p>
  );
}

export function AppDetectiveSecondDegre() {
  const [etat, setEtat] = useState<EtatDetectiveSecondDegre>(() => demarrer(exerciceInitial()));
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Clé des écrans : les champs repartent vides après « Générer » ou « Nouvel exercice ». */
  const [generation, setGeneration] = useState(0);
  const [erronee, setErronee] = useState(false);
  const [messageFaux, setMessageFaux] = useState<string | null>(null);
  const [illisible, setIllisible] = useState(false);

  const e = etat.exercice;
  const ecran = etat.ecran;

  function recommencer(exercice: ExerciceDetectiveSecondDegre) {
    setEtat(demarrer(exercice));
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setErronee(false);
    setMessageFaux(null);
    setIllisible(false);
    setGeneration((g) => g + 1);
  }

  function conclure(correct: boolean, votreReponse: ReactNode) {
    const resultat = soumettre(etat, correct);
    setIllisible(false);
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
      recommencer(genererExerciceDetectiveSecondDegre());
      return;
    }
    setEtat(ecranSuivant(etat));
    setErronee(false);
    setMessageFaux(null);
    setEnAttente(null);
  }

  // Hook DEV-ONLY (même garde que `SelecteurVarianteDev`) : exercice tiré exposé pour Playwright.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debuggen121?: unknown }).__debuggen121 = { exercice: e, ecran };
  }

  const validation: ValidationEtapeProps | null = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: enAttente.reponseAttendue,
        labelSuivant: enAttente.derniere ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
        messageRevele: enAttente.messageRevele,
        corrigeDetaille: <CorrigeDetailleEcran etapes={lignesDeLEtape(correctionDetailleeDetectiveSecondDegre(e), lettreEtape(ecran))} />,
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
          nombreLignes={nombreLignes(e)}
          attendue={indiceLigneFausse(e)}
          onValider={(i) => conclure(verifierLigne(e, i), <p style={{ margin: 0 }}>{`Ligne ${i + 1}`}</p>)}
        />
      );
    }
    if (ecran === 1) {
      return (
        <EtapeDescriptionErreur<IdDescriptionSecondDegre>
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
    return (
      <EtapeEnsembleSolutionTrinome
        {...communs}
        consigne={consigne}
        tentativesUtilisees={etat.tentativesUtilisees}
        tentativesMax={tentativesMaxEcran(ecran)}
        erronee={erronee}
        messageFaux={messageFaux}
        illisible={illisible}
        onValider={(lecture) => {
          const statut = diagnostiquerCorrection(e, lecture);
          if (statut === "parse_error" || lecture.statut !== "ok") {
            setIllisible(true);
            return;
          }
          const correct = statut === "correct";
          setErronee(!correct);
          setMessageFaux(!correct && estResultatCopie(e, lecture.ensemble) ? `C'est l'ensemble de la copie : reprends la résolution à partir de la ligne ${indiceLigneFausse(e) + 1}.` : null);
          conclure(correct, <Katex expression={`S=${ensembleLatex(lecture.ensemble)}`} />);
        }}
      />
    );
  }

  const blocDonnees = (
    <>
      <p style={{ margin: "6px 0" }}>
        <RenduFragments fragments={recit(e)} />
      </p>
      <CopieEleve lignes={copieEleve(e)} ligneSignalee={ecran >= 1 ? indiceLigneFausse(e) : null} />
    </>
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">{"Détective d'erreurs : second degré"}</h1>
        <p className="app-subtitle">Chapitre 2 — Équations et inéquations du second degré</p>
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

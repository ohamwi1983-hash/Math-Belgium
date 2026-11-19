import { Fragment, useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceDetectiveStatistique, IdDescriptionStatistique } from "./core/detectiveStatistique.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDetectiveStatistique } from "./generateurs/detectiveStatistique";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";
import { lettreEtape, lignesDeLEtape } from "../export/corrigeTableau";
import { correctionDetailleeDetectiveStatistique } from "./generateurs/detectiveStatistique/corrigeDetaille";
import { NOMBRE_ECRANS, activerAide, demarrer, ecranSuivant, soumettre, tentativesMaxEcran, type EtatDetectiveStatistique } from "./moteur/sessionDetectiveStatistique";
import { diagnostiquerCorrection, estResultatCopie, verifierDescription, verifierLigne } from "./moteur/verificationDetectiveStatistique";
import { descriptionCorrecte, indiceLigneFausse, nombreLignes } from "./moteur/modeleDetectiveStatistique";
import {
  CONSIGNE_GENERALE,
  TITRES_ECRANS,
  aideSaisie,
  aidesEcran,
  consignesEcrans,
  descriptionFragments,
  libelleChamp,
  lignesCopie,
  prefixeChamp,
  recitApres,
  recitAvant,
  reponseFragments,
  tableauDonnees,
  uniteChamp,
} from "./ui/formatDetectiveStatistique";
import { ecranClos, segmentsDepuisHistorique, type EcranClos } from "./ui/historiqueProgression";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { RenduFragments } from "./components/RenduFragments";
import { CopieEleve, EtapeDescriptionErreur, EtapeLigneFausse } from "./components/EtapesDetectiveErreurs";
import { EtapeCorrectionDetectiveStatistique } from "./components/EtapeCorrectionDetectiveStatistique";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

/**
 * gen112 — « Détective d'erreurs : statistique » (4e, chapitre 4 « Statistique descriptive »,
 * section `revision`, processus 3 TRANSFÉRER), même mécanique que gen91 et 5gen49. La résolution
 * d'un exercice du chapitre par un élève fictif (4 à 6 lignes) contient UNE ligne fausse ; la suite
 * en découle. Trois écrans :
 * 1. quelle ligne est fausse ? (choix fermé, une tentative) ;
 * 2. quelle est l'erreur ? (4 descriptions, une tentative) ;
 * 3. le résultat final corrigé (champ libre, 3 tentatives).
 * Aucun point affiché. `?code=` (QR code d'une feuille) : première instance tirée avec les MÊMES
 * fonctions que l'adaptateur.
 */

function exerciceInitial(): ExerciceDetectiveStatistique {
  const code = lireCodeDepuisUrl();
  if (!code) return genererExerciceDetectiveStatistique();
  return genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceDetectiveStatistique, construireAvecVariante);
}

interface TransitionEnAttente {
  revele: boolean;
  reponseAttendue: ReactNode;
  messageRevele?: string;
  derniere: boolean;
}

/** Saisie de l'élève pour la fiche de l'écran : virgule décimale, « − » typographique. */
function saisieEcrite(texte: string): ReactNode {
  return <p style={{ margin: 0 }}>{texte.trim().replace(/-/g, "−").replace(/(\d)\.(\d)/g, "$1,$2")}</p>;
}

function reponseAttendue(e: ExerciceDetectiveStatistique, ecran: number): ReactNode {
  if (ecran === 0) return <p style={{ margin: 0 }}>{`Ligne ${indiceLigneFausse(e) + 1}`}</p>;
  const fragments = ecran === 1 ? descriptionFragments(descriptionCorrecte(e), e) : reponseFragments(e);
  return (
    <p style={{ margin: 0 }}>
      <RenduFragments fragments={fragments} />
    </p>
  );
}

export function AppDetectiveStatistique() {
  const [etat, setEtat] = useState<EtatDetectiveStatistique>(() => demarrer(exerciceInitial()));
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

  function recommencer(exercice: ExerciceDetectiveStatistique) {
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
      recommencer(genererExerciceDetectiveStatistique());
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
    (window as unknown as { __debuggen112?: unknown }).__debuggen112 = { exercice: e, ecran };
  }

  const validation: ValidationEtapeProps | null = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: enAttente.reponseAttendue,
        labelSuivant: enAttente.derniere ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
        messageRevele: enAttente.messageRevele,
        corrigeDetaille: <CorrigeDetailleEcran etapes={lignesDeLEtape(correctionDetailleeDetectiveStatistique(e), lettreEtape(ecran))} />,
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
        <EtapeDescriptionErreur<IdDescriptionStatistique>
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
      <EtapeCorrectionDetectiveStatistique
        {...communs}
        consigne={consigne}
        libelle={libelleChamp(e)}
        prefixe={prefixeChamp(e)}
        unite={uniteChamp(e)}
        aideSaisie={aideSaisie(e)}
        tentativesUtilisees={etat.tentativesUtilisees}
        tentativesMax={tentativesMaxEcran(ecran)}
        erronee={erronee}
        messageFaux={messageFaux}
        illisible={illisible}
        onValider={(texte) => {
          const statut = diagnostiquerCorrection(e, texte);
          if (statut === "parse_error") {
            setIllisible(true);
            return;
          }
          const correct = statut === "correct";
          setErronee(!correct);
          setMessageFaux(!correct && estResultatCopie(e, texte) ? `C'est le résultat de la copie : reprends la résolution à partir de la ligne ${indiceLigneFausse(e) + 1}.` : null);
          conclure(correct, saisieEcrite(texte));
        }}
      />
    );
  }

  const tab = tableauDonnees(e);
  const blocDonnees = (
    <>
      <p style={{ margin: "6px 0" }}>
        <RenduFragments fragments={recitAvant(e)} />
      </p>
      {tab && (
        <div className="tf-table-scroll">
          <table className="tf-table">
            <caption style={{ captionSide: "top", textAlign: "left", fontWeight: 600, paddingBottom: 4 }}>{tab.legende}</caption>
            <thead>
              <tr>
                {tab.entetes.map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tab.lignes.map((ligne, i) => (
                <tr key={i}>
                  {ligne.map((x, j) => (
                    <td key={j}>{x}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p style={{ margin: "6px 0" }}>
        <RenduFragments fragments={recitApres(e)} />
      </p>
      <CopieEleve lignes={lignesCopie(e)} ligneSignalee={ecran >= 1 ? indiceLigneFausse(e) : null} />
    </>
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">{"Détective d'erreurs\u00a0: statistique"}</h1>
        <p className="app-subtitle">Chapitre 4 — Statistique descriptive</p>
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

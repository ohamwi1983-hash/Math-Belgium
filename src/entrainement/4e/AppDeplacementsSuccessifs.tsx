import { Fragment, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceDeplacementsSuccessifs } from "./core/deplacementsSuccessifs.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDeplacementsSuccessifs } from "./generateurs/deplacementsSuccessifs";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { TENTATIVES_MAX, activerAide, demarrer, ecranSuivant, soumettre, type EtatDeplacementsSuccessifs } from "./moteur/sessionDeplacementsSuccessifs";
import { ecrans, total } from "./moteur/modeleDeplacementsSuccessifs";
import {
  diagnostiquerDistance,
  diagnostiquerK,
  diagnostiquerTraduction,
  diagnostiquerVecteur,
  lireNombre,
  lireVecteur,
  type SaisieVecteur,
  type StatutComposantes,
} from "./moteur/verificationDeplacementsSuccessifs";
import {
  PLACEHOLDER_ARRONDI,
  PLACEHOLDER_EXACTE,
  aidesEcran,
  colonneLatex,
  consigneEcran,
  instructionTexte,
  introFragments,
  libelleVecteurEcran,
  listeInstructions,
  messageDistance,
  messageK,
  messageVecteur,
  nombreLatex,
  nomDistance,
  repereFragments,
  reponseAttendueFragments,
  suiteFragments,
  titresEcrans,
  uniteTexte,
  vecteurTotalLatex,
  vecteurU,
} from "./ui/formatDeplacementsSuccessifs";
import { construireFigureDeplacements } from "./ui/figureDeplacementsSuccessifs";
import { ecranClos, saisieEnLatex, segmentsDepuisHistorique, type EcranClos } from "./ui/historiqueProgression";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { Katex } from "./components/Katex";
import { RenduFragments } from "./components/RenduFragments";
import { CalculatriceScientifique } from "./components/CalculatriceScientifique";
import { EtapeNombre, EtapeTraduction, EtapeVecteur } from "./components/EtapesDeplacementsSuccessifs";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

/**
 * gen86 — « Carte au trésor et randonnée : déplacements successifs » (4e, chapitre 6, section
 * « norme », processus 3 TRANSFÉRER). Une suite d'instructions (est, nord, ouest, sud, diagonale)
 * part de D ; repère : x vers l'est, y vers le nord. Écrans : 1. chaque déplacement en vecteur (le
 * piège : ouest / sud négatifs) ; 2. le déplacement total (Chasles) ; puis selon la situation :
 * distance à vol d'oiseau (norme, exacte ou arrondie) et vecteur de retour (opposé), ou dernier
 * déplacement vers une cible et sa longueur, ou rocher → trésor, nombre de grands pas (k·w) et
 * distance. Aucun point affiché. `?code=` (QR code d'une feuille) : première instance tirée avec les
 * MÊMES fonctions que l'adaptateur.
 */

function exerciceInitial(): ExerciceDeplacementsSuccessifs {
  const code = lireCodeDepuisUrl();
  if (!code) return genererExerciceDeplacementsSuccessifs();
  return genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceDeplacementsSuccessifs, construireAvecVariante);
}

interface TransitionEnAttente {
  revele: boolean;
  reponseAttendue: ReactNode;
  derniere: boolean;
}

function vecteurSaisi(s: SaisieVecteur): ReactNode {
  const v = lireVecteur(s);
  return v ? <Katex expression={colonneLatex(v)} /> : "—";
}

export function AppDeplacementsSuccessifs() {
  const [etat, setEtat] = useState<EtatDeplacementsSuccessifs>(() => demarrer(exerciceInitial()));
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Clé des écrans : les champs repartent vides après « Générer » ou « Nouvel exercice ». */
  const [generation, setGeneration] = useState(0);
  const [statuts, setStatuts] = useState<StatutComposantes[] | null>(null);
  const [messageErreur, setMessageErreur] = useState<string | null>(null);
  const [champsFaux, setChampsFaux] = useState(false);
  const [erreurLecture, setErreurLecture] = useState(false);

  const e = etat.exercice;
  const liste = ecrans(e);
  const ecran = liste[etat.ecran]!;
  const total_ = liste.length;

  function recommencer(exercice: ExerciceDeplacementsSuccessifs) {
    setEtat(demarrer(exercice));
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setStatuts(null);
    setMessageErreur(null);
    setChampsFaux(false);
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
    const attendue = <RenduFragments fragments={reponseAttendueFragments(e, ecran)} />;
    setHistorique((h) => [...h, ecranClos(titresEcrans(e)[etat.ecran]!, votreReponse, resultat.revele, etat.niveauAide > 0, attendue)]);
    setEtat(resultat.etat);
    setEnAttente({ revele: resultat.revele, reponseAttendue: attendue, derniere: etat.ecran >= total_ - 1 });
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.derniere) {
      recommencer(genererExerciceDeplacementsSuccessifs());
      return;
    }
    setEtat(ecranSuivant(etat));
    setStatuts(null);
    setMessageErreur(null);
    setChampsFaux(false);
    setEnAttente(null);
  }

  const validation: ValidationEtapeProps | null = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: enAttente.reponseAttendue,
        labelSuivant: enAttente.derniere ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  // Le trajet apparaît sur la carte une fois le déplacement total trouvé (jamais avant : ce serait
  // la réponse de l'écran en cours) ; le dernier vecteur, une fois l'exercice terminé.
  const clos = historique.length;
  const figure = useMemo(() => construireFigureDeplacements(e, { theme: "ecran", trajet: clos >= 2, complet: clos >= total_ }), [e, clos, total_]);

  const consigne = <RenduFragments fragments={consigneEcran(e, ecran)} />;
  const communs = {
    niveauAide: etat.niveauAide,
    onActiverAide: () => setEtat(activerAide(etat)),
    validation,
    aides: aidesEcran(e, ecran),
    tentativesUtilisees: etat.tentativesUtilisees,
    tentativesMax: TENTATIVES_MAX,
    erreurLecture,
  };

  function ecranCourant(): ReactNode {
    if (ecran === "traduire") {
      return (
        <EtapeTraduction
          {...communs}
          consigne={consigne}
          instructions={e.deplacements.map((d) => instructionTexte(e.situation, d))}
          libelles={e.deplacements.map((_, i) => `${vecteurU(i + 1)} =`)}
          statuts={statuts}
          onValider={(saisies) => {
            const diagnostic = diagnostiquerTraduction(e, saisies);
            if (diagnostic.includes("parse_error")) {
              setErreurLecture(true);
              return;
            }
            setStatuts(diagnostic);
            conclure(
              diagnostic.every((s) => s === "correct"),
              <span>
                {saisies.map((s, i) => (
                  <Fragment key={i}>
                    {i > 0 && " ; "}
                    <Katex expression={`${vecteurU(i + 1)} = ${colonneLatex(lireVecteur(s)!)}`} />
                  </Fragment>
                ))}
              </span>,
            );
          }}
        />
      );
    }
    if (ecran === "total" || ecran === "retour" || ecran === "cible") {
      return (
        <EtapeVecteur
          {...communs}
          consigne={consigne}
          libelle={libelleVecteurEcran(e, ecran)}
          messageErreur={messageErreur}
          champsFaux={champsFaux}
          onValider={(saisie) => {
            const statut = diagnostiquerVecteur(e, ecran, saisie);
            if (statut === "parse_error") {
              setErreurLecture(true);
              return;
            }
            setMessageErreur(messageVecteur(e, ecran, statut));
            setChampsFaux(statut !== "correct");
            conclure(statut === "correct", vecteurSaisi(saisie));
          }}
        />
      );
    }
    if (ecran === "k") {
      return (
        <EtapeNombre
          {...communs}
          consigne={consigne}
          libelle="k ="
          placeholder="ex : 6"
          unite={null}
          avecRacine={false}
          aideSaisie={null}
          messageIllisible="Ta réponse n'est pas lisible : écris un nombre entier. Aucune tentative n'est comptée."
          messageErreur={messageErreur}
          onValider={(texte) => {
            const statut = diagnostiquerK(e, texte);
            if (statut === "parse_error") {
              setErreurLecture(true);
              return;
            }
            setMessageErreur(messageK(statut));
            conclure(statut === "correct", <Katex expression={`k = ${nombreLatex(lireNombre(texte)!)}`} />);
          }}
        />
      );
    }
    const exacte = e.precision === "exacte";
    return (
      <EtapeNombre
        {...communs}
        consigne={consigne}
        libelle={`${nomDistance(e)} =`}
        placeholder={exacte ? PLACEHOLDER_EXACTE : PLACEHOLDER_ARRONDI}
        unite={uniteTexte(e.situation)}
        avecRacine={exacte}
        aideSaisie={exacte ? "Une racine : touche √ ou écris rac(…), par exemple 2√11 ou rac(44)." : null}
        messageIllisible="Ta réponse n'est pas lisible : écris un nombre, ou une racine comme 2√11 ou rac(44). Aucune tentative n'est comptée."
        messageErreur={messageErreur}
        onValider={(texte) => {
          const statut = diagnostiquerDistance(e, texte);
          if (statut === "parse_error") {
            setErreurLecture(true);
            return;
          }
          setMessageErreur(messageDistance(e, statut));
          conclure(
            statut === "correct",
            <span>
              {saisieEnLatex(texte.replace(/√\(/g, "sqrt(").replace(/√\s*(\d+(?:[.,]\d+)?)/g, "sqrt($1)"))} {uniteTexte(e.situation)}
            </span>,
          );
        }}
      />
    );
  }

  const blocDonnees = (
    <>
      <ul style={{ margin: "6px 0 0", paddingLeft: 0, listStyle: "none", display: "grid", gap: 4 }}>
        {listeInstructions(e).map((fragments, i) => (
          <li key={i}>
            <RenduFragments fragments={fragments} />
          </li>
        ))}
      </ul>
      <p style={{ margin: "8px 0 0" }}>
        <RenduFragments fragments={suiteFragments(e)} />
      </p>
      <p style={{ margin: "6px 0 0", fontSize: "0.95em" }}>
        <RenduFragments fragments={repereFragments(e)} />
      </p>
      <div style={{ maxWidth: 440, margin: "10px auto 0" }} dangerouslySetInnerHTML={{ __html: figure }} />
      {clos >= 2 && (
        <p className="triangle-quelconque-legende" style={{ textAlign: "center", margin: "2px 0 0" }}>
          Trajet tracé, déplacement total : <Katex expression={`${vecteurTotalLatex(e)} = ${colonneLatex(total(e))}`} />
        </p>
      )}
    </>
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Carte au trésor et randonnée : déplacements successifs</h1>
        <p className="app-subtitle">Chapitre 6 — Calcul vectoriel</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={(id) => recommencer(construireAvecVariante(id))} />
      </header>

      <main className="card">
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, total_, !enAttente)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />

        <div className="card-body">
          <EnTeteExercice consigneGenerale={<RenduFragments fragments={introFragments(e)} />} blocDonnees={blocDonnees} />
          {e.precision === "arrondi" && <CalculatriceScientifique />}
          <Fragment key={`${generation}-${etat.ecran}`}>{ecranCourant()}</Fragment>
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex].entree} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}

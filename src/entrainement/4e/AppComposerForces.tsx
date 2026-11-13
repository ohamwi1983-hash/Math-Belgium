import { Fragment, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceComposerForces, NomTriangle, UniteComposerForces } from "./core/composerForces.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceComposerForces } from "./generateurs/composerForces";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { activerAide, demarrer, ecranSuivant, soumettre, tentativesMaxEcran, type EtatComposerForces } from "./moteur/sessionComposerForces";
import { diagnostiquerSaisie, lireNombre, verifierTriangle } from "./moteur/verificationComposerForces";
import { ecranIntensite, nombreEcrans, triangleUtile } from "./moteur/modeleComposerForces";
import {
  aidesEcran,
  consigneGenerale,
  consignesEcrans,
  enonceFragments,
  libelleChamp,
  libelleTriangle,
  messageStatut,
  placeholderChamp,
  reponseAttendueFragments,
  saisieTexte,
  titresEcrans,
} from "./ui/formatComposerForces";
import { construireFigureComposerForces } from "./ui/figureComposerForces";
import { ecranClos, segmentsDepuisHistorique, type EcranClos } from "./ui/historiqueProgression";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { RenduFragments } from "./components/RenduFragments";
import { CalculatriceScientifique } from "./components/CalculatriceScientifique";
import { EtapeChoixTriangle, EtapeSaisieComposerForces } from "./components/EtapesComposerForces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

/**
 * gen80 — « Composer deux forces ou deux vitesses » (4e, chapitre 5, section « triangulation »,
 * processus 3 TRANSFÉRER). Deux vecteurs partent d'un même point ; leur résultante est la diagonale
 * du parallélogramme. Écrans (sens direct) : 1. choisir le triangle à résoudre (choix fermé, une
 * tentative) ; 2. son angle intérieur, 180° − θ (le piège : θ mis directement dans Al-Kashi) ;
 * 3. l'intensité de la résultante (Al-Kashi, unité) ; 4. sa direction (loi des sinus — angle avec
 * le GRAND vecteur, toujours aigu). Variante « cap » : la direction de la résultante est imposée ;
 * loi des sinus d'abord (angle entre le cap et la route), puis le troisième angle, puis l'intensité.
 * Aucun point affiché. `?code=` (QR code d'une feuille) : première instance tirée avec les MÊMES
 * fonctions que l'adaptateur.
 */

function exerciceInitial(): ExerciceComposerForces {
  const code = lireCodeDepuisUrl();
  if (!code) return genererExerciceComposerForces();
  return genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceComposerForces, construireAvecVariante);
}

interface TransitionEnAttente {
  revele: boolean;
  reponseAttendue: ReactNode;
  messageRevele?: string;
  derniere: boolean;
}

function reponseAttendue(e: ExerciceComposerForces, ecran: number): ReactNode {
  if (ecran === 0) return libelleTriangle(triangleUtile(e));
  return <RenduFragments fragments={reponseAttendueFragments(e, ecran)} />;
}

export function AppComposerForces() {
  const [etat, setEtat] = useState<EtatComposerForces>(() => demarrer(exerciceInitial()));
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Clé des écrans : les champs repartent vides après « Générer » ou « Nouvel exercice ». */
  const [generation, setGeneration] = useState(0);
  const [messageErreur, setMessageErreur] = useState<string | null>(null);
  const [erreurLecture, setErreurLecture] = useState(false);

  const e = etat.exercice;
  const ecran = etat.ecran;
  const total = nombreEcrans(e);

  function recommencer(exercice: ExerciceComposerForces) {
    setEtat(demarrer(exercice));
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setMessageErreur(null);
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
    setHistorique((h) => [...h, ecranClos(titresEcrans(e)[ecran]!, votreReponse, resultat.revele, etat.niveauAide > 0, attendue)]);
    setEtat(resultat.etat);
    setEnAttente({
      revele: resultat.revele,
      reponseAttendue: attendue,
      messageRevele: ecran === 0 ? "Ce n'était pas le bon triangle." : undefined,
      derniere: ecran >= total - 1,
    });
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.derniere) {
      recommencer(genererExerciceComposerForces());
      return;
    }
    setEtat(ecranSuivant(etat));
    setMessageErreur(null);
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

  // Écrans clos : le triangle utile est surligné dès que l'écran 1 est clos, l'angle intérieur
  // inscrit dès que l'écran 2 est clos (jamais avant : ce serait la réponse de l'écran en cours).
  const clos = historique.length;
  const figure = useMemo(() => construireFigureComposerForces(e, { theme: "ecran", triangle: clos >= 1, angleTriangle: clos >= 2 }), [e, clos]);

  const consigne = <RenduFragments fragments={consignesEcrans(e, "ecran")[ecran]!} />;
  const communs = { niveauAide: etat.niveauAide, onActiverAide: () => setEtat(activerAide(etat)), validation, aides: aidesEcran(e, ecran) };

  function ecranCourant(): ReactNode {
    if (ecran === 0) {
      return (
        <EtapeChoixTriangle
          {...communs}
          consigne={consigne}
          options={e.ordreTriangles}
          attendu={triangleUtile(e)}
          onValider={(choix: NomTriangle) => conclure(verifierTriangle(e, choix), libelleTriangle(choix))}
        />
      );
    }
    return (
      <EtapeSaisieComposerForces
        {...communs}
        consigne={consigne}
        libelle={libelleChamp(e, ecran)}
        placeholder={placeholderChamp(e, ecran)}
        avecUnite={ecranIntensite(e, ecran)}
        tentativesUtilisees={etat.tentativesUtilisees}
        tentativesMax={tentativesMaxEcran(ecran)}
        messageErreur={messageErreur}
        erreurLecture={erreurLecture}
        onValider={(texte: string, unite: UniteComposerForces | null) => {
          const statut = diagnostiquerSaisie(e, ecran, texte, unite);
          if (statut === "parse_error") {
            setErreurLecture(true);
            return;
          }
          setMessageErreur(messageStatut(e, ecran, statut));
          conclure(statut === "correct", saisieTexte(e, ecran, lireNombre(texte)!, unite));
        }}
      />
    );
  }

  const blocDonnees = (
    <>
      <p style={{ margin: "6px 0" }}>
        <RenduFragments fragments={enonceFragments(e)} />
      </p>
      <div className="composer-forces-figure" style={{ maxWidth: 420, margin: "10px auto 0" }} dangerouslySetInnerHTML={{ __html: figure }} />
      <p className="triangle-quelconque-legende" style={{ textAlign: "center", margin: "2px 0 0" }}>
        Figure à l'échelle : les longueurs sont proportionnelles aux intensités.
      </p>
    </>
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Composer deux forces ou deux vitesses</h1>
        <p className="app-subtitle">Chapitre 5 — Cercle trigonométrique &amp; triangles quelconques</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={(id) => recommencer(construireAvecVariante(id))} />
      </header>

      <main className="card">
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, total, !enAttente)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />

        <div className="card-body">
          <EnTeteExercice consigneGenerale={consigneGenerale(e)} blocDonnees={blocDonnees} />
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

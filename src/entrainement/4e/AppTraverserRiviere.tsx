import { Fragment, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceTraverserRiviere } from "./core/traverserRiviere.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceTraverserRiviere } from "./generateurs/traverserRiviere";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { activerAide, demarrer, ecranSuivant, soumettre, TENTATIVES_SAISIE, type EtatTraverserRiviere } from "./moteur/sessionTraverserRiviere";
import { diagnostiquerChamp, lireNombre, type StatutChamp } from "./moteur/verificationTraverserRiviere";
import { nombreEcrans } from "./moteur/modeleTraverserRiviere";
import {
  aidesEcran,
  champsEcran,
  consigneGenerale,
  consignesEcrans,
  enonceFragments,
  messageStatut,
  reponseAttendueFragments,
  saisieTexte,
  titresEcrans,
} from "./ui/formatTraverserRiviere";
import { construireFigureTraverserRiviere } from "./ui/figureTraverserRiviere";
import { ecranClos, segmentsDepuisHistorique, type EcranClos } from "./ui/historiqueProgression";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { RenduFragments } from "./components/RenduFragments";
import { CalculatriceScientifique } from "./components/CalculatriceScientifique";
import { EtapeSaisieTraverserRiviere } from "./components/EtapesTraverserRiviere";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

/**
 * gen87 — « Traverser une rivière : vitesses en composantes » (4e, chapitre 6, section
 * « applications », processus 3 TRANSFÉRER). Repère d'origine D : x le long de la rive (sens du
 * courant), y vers l'autre rive. Tout se fait en composantes (jamais la loi des cosinus, c'est gen29).
 * - « Où accoste-t-il ? » (4 écrans) : 1. vitesse réelle v_R = v_p + v_c en composantes ; 2. durée
 *   t = L / y(v_R) — le courant ne change pas la durée (le piège visé) ; 3. abscisse du point
 *   d'accostage x_A = x(v_R) · t ; 4. vitesse réelle ‖v_R‖ ou distance parcourue DA.
 * - « Quelle direction pour arriver juste en face ? » (3 écrans) : 1. composante x de v_p = −c ;
 *   2. composante y par Pythagore ; 3. durée.
 * Champs ouverts : 3 tentatives, une saisie illisible ne compte pas. Aucun point affiché. `?code=`
 * (QR code d'une feuille) : première instance tirée avec les MÊMES fonctions que l'adaptateur.
 */

function exerciceInitial(): ExerciceTraverserRiviere {
  const code = lireCodeDepuisUrl();
  if (!code) return genererExerciceTraverserRiviere();
  return genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceTraverserRiviere, construireAvecVariante);
}

interface TransitionEnAttente {
  revele: boolean;
  reponseAttendue: ReactNode;
  derniere: boolean;
}

export function AppTraverserRiviere() {
  const [etat, setEtat] = useState<EtatTraverserRiviere>(() => demarrer(exerciceInitial()));
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Clé des écrans : les champs repartent vides après « Générer » ou « Nouvel exercice ». */
  const [generation, setGeneration] = useState(0);
  const [statuts, setStatuts] = useState<StatutChamp[] | null>(null);
  const [messageErreur, setMessageErreur] = useState<string | null>(null);
  const [erreurLecture, setErreurLecture] = useState(false);

  const e = etat.exercice;
  const ecran = etat.ecran;
  const total = nombreEcrans(e);
  const termine = historique.length >= total;

  function recommencer(exercice: ExerciceTraverserRiviere) {
    setEtat(demarrer(exercice));
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setStatuts(null);
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
    const attendue = <RenduFragments fragments={reponseAttendueFragments(e, ecran)} />;
    setHistorique((h) => [...h, ecranClos(titresEcrans(e)[ecran]!, votreReponse, resultat.revele, etat.niveauAide > 0, attendue)]);
    setEtat(resultat.etat);
    setEnAttente({ revele: resultat.revele, reponseAttendue: attendue, derniere: ecran >= total - 1 });
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.derniere) {
      recommencer(genererExerciceTraverserRiviere());
      return;
    }
    setEtat(ecranSuivant(etat));
    setStatuts(null);
    setMessageErreur(null);
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

  // La figure résolue (vecteurs vitesse, trajectoire à l'échelle) n'apparaît qu'une fois le dernier
  // écran clos : avant, elle donnerait les réponses à l'œil.
  const figure = useMemo(() => construireFigureTraverserRiviere(e, { theme: "ecran", resolue: termine }), [e, termine]);
  const champs = champsEcran(e, ecran);

  const blocDonnees = (
    <>
      <p style={{ margin: "6px 0" }}>
        <RenduFragments fragments={enonceFragments(e)} />
      </p>
      <div className="traverser-riviere-figure" style={{ maxWidth: 420, margin: "10px auto 0" }} dangerouslySetInnerHTML={{ __html: figure }} />
      <p className="triangle-quelconque-legende" style={{ textAlign: "center", margin: "2px 0 0" }}>
        {termine ? "Figure à l'échelle : trajectoire réelle et triangle des vitesses." : "Vue de dessus (schéma, pas à l'échelle)."}
      </p>
    </>
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Traverser une rivière : vitesses en composantes</h1>
        <p className="app-subtitle">Chapitre 6 — Calcul vectoriel</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={(id) => recommencer(construireAvecVariante(id))} />
      </header>

      <main className="card">
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, total, !enAttente)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />

        <div className="card-body">
          <EnTeteExercice consigneGenerale={consigneGenerale(e)} blocDonnees={blocDonnees} />
          <CalculatriceScientifique />
          <Fragment key={`${generation}-${ecran}`}>
            <EtapeSaisieTraverserRiviere
              consigne={<RenduFragments fragments={consignesEcrans(e, "ecran")[ecran]!} />}
              champs={champs}
              aides={aidesEcran(e, ecran)}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAide(etat))}
              tentativesUtilisees={etat.tentativesUtilisees}
              tentativesMax={TENTATIVES_SAISIE}
              statuts={statuts}
              messageErreur={messageErreur}
              erreurLecture={erreurLecture}
              validation={validation}
              onValider={(textes) => {
                const diagnostic = champs.map((c, i) => diagnostiquerChamp(e, c.grandeur, textes[i] ?? ""));
                if (diagnostic.includes("parse_error")) {
                  setErreurLecture(true);
                  return;
                }
                setStatuts(diagnostic);
                const premierFaux = diagnostic.findIndex((s) => s !== "correct");
                setMessageErreur(premierFaux >= 0 ? messageStatut(e, champs[premierFaux]!.grandeur, diagnostic[premierFaux]!) : null);
                conclure(
                  premierFaux < 0,
                  saisieTexte(
                    e,
                    ecran,
                    textes.map((t) => lireNombre(t)!),
                  ),
                );
              }}
            />
          </Fragment>
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex].entree} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}

import { Fragment, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceEquilibreForces, OptionCondition } from "./core/equilibreForces.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceEquilibreForces } from "./generateurs/equilibreForces";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { activerAide, demarrer, ecranSuivant, soumettre, tentativesMaxEcran, type EtatEquilibreForces } from "./moteur/sessionEquilibreForces";
import { diagnostiquerAngle, diagnostiquerF3, diagnostiquerIntensite, diagnostiquerResultante, lireNombre, verifierCondition } from "./moteur/verificationEquilibreForces";
import { ECRAN_CONDITION, ECRAN_F3, ECRAN_INTENSITE, ECRAN_RESULTANTE, intensiteExacteDemandee, nombreEcrans } from "./moteur/modeleEquilibreForces";
import {
  CONSIGNE_GENERALE,
  NORME3,
  OPTIONS_CONDITION_LATEX,
  aidesEcran,
  consignesEcrans,
  enonceFragments,
  messageAngle,
  messageComposantes,
  messageIntensite,
  reponseAttendueFragments,
  saisieAngleTexte,
  saisieIntensiteTexte,
  saisieVecteur,
  titresEcrans,
  vecteurEcran,
} from "./ui/formatEquilibreForces";
import { construireFigureForces, construireFigurePolygone } from "./ui/figureEquilibreForces";
import { ecranClos, segmentsDepuisHistorique, type EcranClos } from "./ui/historiqueProgression";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { Katex } from "./components/Katex";
import { RenduFragments } from "./components/RenduFragments";
import { CalculatriceScientifique } from "./components/CalculatriceScientifique";
import { EtapeChoixCondition, EtapeComposantesEquilibre, EtapeValeurEquilibre } from "./components/EtapesEquilibreForces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

/**
 * gen90 — « Équilibre de forces en composantes » (4e, chapitre 6, section « applications »,
 * processus 3 TRANSFÉRER). Trois forces appliquées en un même point se compensent ; F₁ et F₂ sont
 * connues (composantes données, ou lues sur un quadrillage), F₃ est cherchée. Écrans :
 * 1. la condition d'équilibre, F₃ = −(F₁ + F₂) (choix fermé, une tentative) ;
 * 2. la résultante F₁ + F₂ en composantes ;
 * 3. F₃ en composantes (piège : oublier le signe moins, résultante et force d'équilibre confondues) ;
 * 4. l'intensité de F₃ (exacte, ou arrondie au dixième de newton ; piège : additionner les
 *    intensités) ;
 * 5. (selon la variante) l'angle aigu entre F₃ et l'axe x, par l'arc tangente — comme l'exemple
 *    « résultante par les composantes » du cours.
 * Aucun point affiché. `?code=` (QR code d'une feuille) : première instance tirée avec les MÊMES
 * fonctions que l'adaptateur.
 */

function exerciceInitial(): ExerciceEquilibreForces {
  const code = lireCodeDepuisUrl();
  if (!code) return genererExerciceEquilibreForces();
  return genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceEquilibreForces, construireAvecVariante);
}

interface TransitionEnAttente {
  revele: boolean;
  reponseAttendue: ReactNode;
  messageRevele?: string;
  derniere: boolean;
}

export function AppEquilibreForces() {
  const [etat, setEtat] = useState<EtatEquilibreForces>(() => demarrer(exerciceInitial()));
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Clé des écrans : les champs repartent vides après « Générer » ou « Nouvel exercice ». */
  const [generation, setGeneration] = useState(0);
  const [messageErreur, setMessageErreur] = useState<string | null>(null);
  const [messageSansPenalite, setMessageSansPenalite] = useState<string | null>(null);
  const [champsFaux, setChampsFaux] = useState<{ x: boolean; y: boolean } | null>(null);

  const e = etat.exercice;
  const ecran = etat.ecran;
  const total = nombreEcrans(e);

  function recommencer(exercice: ExerciceEquilibreForces) {
    setEtat(demarrer(exercice));
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setMessageErreur(null);
    setMessageSansPenalite(null);
    setChampsFaux(null);
    setGeneration((g) => g + 1);
  }

  function conclure(correct: boolean, votreReponse: ReactNode) {
    const resultat = soumettre(etat, correct);
    setMessageSansPenalite(null);
    if (!resultat.clos) {
      setEtat(resultat.etat);
      return;
    }
    const attendue = <RenduFragments fragments={reponseAttendueFragments(e, ecran)} />;
    setHistorique((h) => [...h, ecranClos(titresEcrans(e)[ecran]!, votreReponse, resultat.revele, etat.niveauAide > 0, attendue)]);
    setEtat(resultat.etat);
    setEnAttente({
      revele: resultat.revele,
      reponseAttendue: attendue,
      messageRevele: ecran === ECRAN_CONDITION ? "Ce n'était pas la condition d'équilibre." : undefined,
      derniere: ecran >= total - 1,
    });
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.derniere) {
      recommencer(genererExerciceEquilibreForces());
      return;
    }
    setEtat(ecranSuivant(etat));
    setMessageErreur(null);
    setMessageSansPenalite(null);
    setChampsFaux(null);
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

  // F₃ n'apparaît sur la figure qu'une fois l'écran de ses composantes clos (jamais avant : ce serait
  // la réponse de l'écran en cours), avec le polygone des forces.
  const f3Connue = historique.length > ECRAN_F3;
  const figure = useMemo(() => construireFigureForces(e, { theme: "ecran", avecF3: f3Connue }), [e, f3Connue]);
  const polygone = useMemo(() => (f3Connue ? construireFigurePolygone(e, "ecran") : null), [e, f3Connue]);

  const consigne = <RenduFragments fragments={consignesEcrans(e, "ecran")[ecran]!} />;
  const communs = {
    niveauAide: etat.niveauAide,
    onActiverAide: () => setEtat(activerAide(etat)),
    validation,
    aides: aidesEcran(e, ecran),
    tentativesUtilisees: etat.tentativesUtilisees,
    tentativesMax: tentativesMaxEcran(ecran),
    messageErreur,
    messageSansPenalite,
  };

  function ecranCourant(): ReactNode {
    if (ecran === ECRAN_CONDITION) {
      return (
        <EtapeChoixCondition
          niveauAide={communs.niveauAide}
          onActiverAide={communs.onActiverAide}
          aides={communs.aides}
          validation={validation}
          consigne={consigne}
          options={e.ordreConditions}
          onValider={(choix: OptionCondition) => conclure(verifierCondition(choix), <Katex expression={OPTIONS_CONDITION_LATEX[choix]} />)}
        />
      );
    }
    if (ecran === ECRAN_RESULTANTE || ecran === ECRAN_F3) {
      return (
        <EtapeComposantesEquilibre
          {...communs}
          consigne={consigne}
          idBase={`equilibre-forces-${ecran}`}
          vecteurLatex={vecteurEcran(ecran)}
          champsFaux={champsFaux}
          onValider={(textes) => {
            const d = ecran === ECRAN_RESULTANTE ? diagnostiquerResultante(e, textes) : diagnostiquerF3(e, textes);
            if (d.statut === "parse_error" || !d.lu) {
              setMessageSansPenalite("Une composante n'est pas lisible : écris un nombre entier ou décimal, par exemple −40. Aucune tentative n'est comptée.");
              return;
            }
            setChampsFaux({ x: !d.xJuste, y: !d.yJuste });
            setMessageErreur(messageComposantes(e, d.statut));
            conclure(d.statut === "correct", <RenduFragments fragments={saisieVecteur(ecran, d.lu)} />);
          }}
        />
      );
    }
    if (ecran === ECRAN_INTENSITE) {
      return (
        <EtapeValeurEquilibre
          {...communs}
          consigne={consigne}
          libelleLatex={`${NORME3} =`}
          suffixe="N"
          placeholder={intensiteExacteDemandee(e) ? "ex : 5rac(2)" : "ex : 12,3"}
          indication={intensiteExacteDemandee(e) ? "Une racine carrée s'écrit rac(…) ou √, par exemple 3rac(5)." : "Un nombre décimal, avec une virgule ou un point."}
          onValider={(texte) => {
            const statut = diagnostiquerIntensite(e, texte);
            if (statut === "parse_error") {
              setMessageSansPenalite("Valeur illisible : écris un nombre ou une racine, par exemple 3rac(5). Aucune tentative n'est comptée.");
              return;
            }
            if (statut === "approchee") {
              setMessageSansPenalite(messageIntensite(e, statut));
              return;
            }
            setMessageErreur(messageIntensite(e, statut));
            conclure(statut === "correct", saisieIntensiteTexte(texte));
          }}
        />
      );
    }
    return (
      <EtapeValeurEquilibre
        {...communs}
        consigne={consigne}
        libelleLatex="\alpha ="
        suffixe="°"
        placeholder="ex : 47,3"
        onValider={(texte) => {
          const statut = diagnostiquerAngle(e, texte);
          if (statut === "parse_error") {
            setMessageSansPenalite("Valeur illisible : écris un nombre, par exemple 47,3. Aucune tentative n'est comptée.");
            return;
          }
          setMessageErreur(messageAngle(statut));
          conclure(statut === "correct", saisieAngleTexte(lireNombre(texte)!));
        }}
      />
    );
  }

  const blocDonnees = (
    <>
      <p style={{ margin: "6px 0" }}>
        <RenduFragments fragments={enonceFragments(e)} />
      </p>
      <div className="equilibre-forces-figure" style={{ maxWidth: 420, margin: "10px auto 0" }} dangerouslySetInnerHTML={{ __html: figure }} />
      {polygone && <div className="equilibre-forces-figure" style={{ maxWidth: 420, margin: "4px auto 0" }} dangerouslySetInnerHTML={{ __html: polygone }} />}
    </>
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Équilibre de forces en composantes</h1>
        <p className="app-subtitle">Chapitre 6 — Calcul vectoriel</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={(id) => recommencer(construireAvecVariante(id))} />
      </header>

      <main className="card">
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, total, !enAttente)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />

        <div className="card-body">
          <EnTeteExercice consigneGenerale={CONSIGNE_GENERALE} blocDonnees={blocDonnees} />
          {ecran >= ECRAN_INTENSITE && <CalculatriceScientifique />}
          <Fragment key={`${generation}-${ecran}`}>{ecranCourant()}</Fragment>
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex].entree} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}

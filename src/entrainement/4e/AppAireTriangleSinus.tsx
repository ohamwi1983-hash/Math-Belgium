import { Fragment, useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceAireTriangleSinus } from "./core/aireTriangleSinus.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceAireTriangleSinus } from "./generateurs/aireTriangleSinus";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { activerAide, demarrer, ecranSuivant, estChoixFerme, etapeCourante, soumettre, tentativesMax, type EtatAireTriangleSinus } from "./moteur/sessionAireTriangleSinus";
import { etapes, type EtapeAireTriangle, type OptionFormule, type OptionNombre } from "./moteur/modeleAireTriangleSinus";
import { diagnostiquerAngles, diagnostiquerNombre, nombreAnglesAttendu, type StatutChamp } from "./moteur/verificationAireTriangleSinus";
import {
  LIBELLES_NOMBRE_ANGLES,
  aidesEtape,
  champEtape,
  champsAngles,
  consigneEtape,
  consigneGenerale,
  donneesFragments,
  indicationSaisie,
  latexOptionFormule,
  messagePiegeAngles,
  messagePiegeNombre,
  nombreEcrans,
  optionsFormule,
  proposerRacine,
  reponseAnglesLatex,
  reponseNumeriqueLatex,
  titreEtape,
} from "./ui/formatAireTriangleSinus";
import { ecranClos, segmentsDepuisHistorique, type EcranClos } from "./ui/historiqueProgression";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { Katex } from "./components/Katex";
import { RenduFragments } from "./components/RenduFragments";
import { CalculatriceScientifique } from "./components/CalculatriceScientifique";
import { FigureAireTriangleSinus } from "./components/FigureAireTriangleSinus";
import { EtapeChampsAireTriangle, EtapeChoixAireTriangle } from "./components/EtapesAireTriangleSinus";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

/**
 * gen75 — « Aire d'un triangle quelconque » (4e, chapitre 5, section « triangle », processus 2
 * APPLIQUER). Cinq familles (aire directe, angle à partir de l'aire — deux amplitudes —, côté à
 * partir de l'aire, quadrilatère découpé par une diagonale, formule de Héron), 2 ou 3 écrans
 * chacune (`moteur/modeleAireTriangleSinus.ts::etapes`) : choix fermé à UN essai, champs
 * numériques à 3 essais. Figure à l'échelle, inconnue « ? ». Aucun point affiché. `?code=` (QR
 * code d'une feuille) : première instance tirée avec les MÊMES fonctions que l'adaptateur.
 */

function exerciceInitial(): ExerciceAireTriangleSinus {
  const code = lireCodeDepuisUrl();
  if (!code) return genererExerciceAireTriangleSinus();
  return genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceAireTriangleSinus, construireAvecVariante);
}

interface TransitionEnAttente {
  revele: boolean;
  reponseAttendue: ReactNode;
  messageRevele?: string;
  derniere: boolean;
}

type Angle = Extract<ExerciceAireTriangleSinus, { famille: "aire" | "angle" | "cote" }>;
type FamilleAngle = Extract<ExerciceAireTriangleSinus, { famille: "angle" }>;

function texteNombreAngles(id: OptionNombre): string {
  return LIBELLES_NOMBRE_ANGLES[id];
}

function reponseAttendue(e: ExerciceAireTriangleSinus, etape: EtapeAireTriangle): ReactNode {
  if (etape === "formuleAire" || etape === "formuleCote") return <Katex expression={latexOptionFormule(e as Angle, etape, "correcte")} />;
  if (etape === "nombreAngles") {
    return nombreAnglesAttendu(e as FamilleAngle) === "deux"
      ? "Deux amplitudes : un angle aigu et son supplémentaire ont le même sinus."
      : "Une seule amplitude : un sinus égal à 1 ne correspond qu'à l'angle droit.";
  }
  if (etape === "angles") return <Katex expression={reponseAnglesLatex(e as FamilleAngle)} />;
  return <Katex expression={reponseNumeriqueLatex(e, etape)} />;
}

/** Saisie de l'élève, telle que tapée, en typographie française. */
function saisieAffichee(texte: string, suffixe: string): ReactNode {
  const propre = texte.trim().replace(/-/g, "−").replace(/(\d)\.(\d)/g, "$1,$2");
  return (
    <>
      {propre}
      {suffixe && (
        <>
          {" "}
          <Katex expression={suffixe} />
        </>
      )}
    </>
  );
}

export function AppAireTriangleSinus() {
  const [etat, setEtat] = useState<EtatAireTriangleSinus>(() => demarrer(exerciceInitial()));
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Clé des écrans : les champs repartent vides après « Générer » ou « Nouvel exercice ». */
  const [generation, setGeneration] = useState(0);
  const [statuts, setStatuts] = useState<StatutChamp[] | null>(null);
  const [messagePiege, setMessagePiege] = useState<string | null>(null);
  const [erreurLecture, setErreurLecture] = useState(false);

  const e = etat.exercice;
  const etape = etapeCourante(etat);
  const total = nombreEcrans(e);

  function recommencer(exercice: ExerciceAireTriangleSinus) {
    setEtat(demarrer(exercice));
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setStatuts(null);
    setMessagePiege(null);
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
    const attendue = reponseAttendue(e, etape);
    setHistorique((h) => [...h, ecranClos(titreEtape(e, etape), votreReponse, resultat.revele, etat.niveauAide > 0, attendue)]);
    setEtat(resultat.etat);
    setEnAttente({
      revele: resultat.revele,
      reponseAttendue: attendue,
      messageRevele: estChoixFerme(etape) ? "Ce n'était pas la bonne réponse." : undefined,
      derniere: etat.ecran >= total - 1,
    });
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.derniere) {
      recommencer(genererExerciceAireTriangleSinus());
      return;
    }
    setEtat(ecranSuivant(etat));
    setStatuts(null);
    setMessagePiege(null);
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

  const consigne = <RenduFragments fragments={consigneEtape(e, etape)} />;
  const communs = { niveauAide: etat.niveauAide, onActiverAide: () => setEtat(activerAide(etat)), aides: aidesEtape(e, etape), validation, consigne };

  function ecranCourant(): ReactNode {
    if (etape === "formuleAire" || etape === "formuleCote") {
      const options = optionsFormule(e as Angle, etape);
      return (
        <EtapeChoixAireTriangle<OptionFormule>
          {...communs}
          options={options.map((o) => ({ id: o.id, contenu: <Katex expression={o.latex} /> }))}
          attendu="correcte"
          onValider={(choix) => conclure(choix === "correcte", <Katex expression={options.find((o) => o.id === choix)!.latex} />)}
        />
      );
    }
    if (etape === "nombreAngles") {
      const attendu = nombreAnglesAttendu(e as FamilleAngle);
      return (
        <EtapeChoixAireTriangle<OptionNombre>
          {...communs}
          options={(["un", "deux"] as const).map((id) => ({ id, contenu: texteNombreAngles(id) }))}
          attendu={attendu}
          onValider={(choix) => conclure(choix === attendu, texteNombreAngles(choix))}
        />
      );
    }
    if (etape === "angles") {
      const t = e as FamilleAngle;
      const champs = champsAngles(t).map((libelle) => ({ libelle, suffixe: "\\text{°}" }));
      return (
        <EtapeChampsAireTriangle
          {...communs}
          champs={champs}
          indication={indicationSaisie(e, etape)}
          boutonRacine={false}
          tentativesUtilisees={etat.tentativesUtilisees}
          tentativesMax={tentativesMax(etape)}
          statuts={statuts}
          messagePiege={messagePiege}
          erreurLecture={erreurLecture}
          onValider={(saisies) => {
            const d = diagnostiquerAngles(t, saisies);
            if (d.statuts.includes("parse_error")) {
              setErreurLecture(true);
              return;
            }
            setStatuts(d.statuts);
            setMessagePiege(d.piege ? messagePiegeAngles(d.piege) : null);
            conclure(
              d.statuts.every((s) => s === "correct"),
              <>
                {saisies.map((s, i) => (
                  <Fragment key={i}>
                    {i > 0 && " et "}
                    {saisieAffichee(s, "")}°
                  </Fragment>
                ))}
              </>,
            );
          }}
        />
      );
    }
    const champ = champEtape(e, etape);
    return (
      <EtapeChampsAireTriangle
        {...communs}
        champs={[champ]}
        indication={indicationSaisie(e, etape)}
        boutonRacine={proposerRacine(e, etape)}
        tentativesUtilisees={etat.tentativesUtilisees}
        tentativesMax={tentativesMax(etape)}
        statuts={statuts}
        messagePiege={messagePiege}
        erreurLecture={erreurLecture}
        onValider={([texte]) => {
          const d = diagnostiquerNombre(e, etape, texte!);
          if (d.statut === "parse_error") {
            setErreurLecture(true);
            return;
          }
          setStatuts([d.statut]);
          setMessagePiege(d.piege ? messagePiegeNombre(etape, d.piege) : null);
          conclure(d.statut === "correct", saisieAffichee(texte!, champ.suffixe));
        }}
      />
    );
  }

  const indexNombre = etapes(e).indexOf("nombreAngles");
  const deuxSolutions = indexNombre >= 0 && (etat.ecran > indexNombre || (etat.ecran === indexNombre && enAttente !== null));

  const blocDonnees = (
    <>
      <p style={{ margin: "6px 0" }}>
        <RenduFragments fragments={donneesFragments(e)} />
      </p>
      <FigureAireTriangleSinus exercice={e} deuxSolutions={deuxSolutions} />
    </>
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Aire d'un triangle quelconque</h1>
        <p className="app-subtitle">Chapitre 5 — Cercle trigonométrique et triangles quelconques</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={(id) => recommencer(construireAvecVariante(id))} />
      </header>

      <main className="card">
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, total, !enAttente)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />

        <div className="card-body">
          <EnTeteExercice consigneGenerale={<RenduFragments fragments={consigneGenerale(e)} />} blocDonnees={blocDonnees} />
          <CalculatriceScientifique />
          <Fragment key={`${generation}-${etat.ecran}`}>{ecranCourant()}</Fragment>
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex].entree} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}

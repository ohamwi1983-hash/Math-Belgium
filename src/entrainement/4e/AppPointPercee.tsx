import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";
import { lettreEtape, lignesDeLEtape } from "../export/corrigeTableau";
import { correctionDetailleePercee } from "./generateurs/perceePlanAuxiliaire/corrigeDetaille";
import { Fragment, useState } from "react";
import type { ReactNode } from "react";
import type { ExercicePercee } from "./core/perceePlanAuxiliaire.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExercicePercee } from "./generateurs/perceePlanAuxiliaire";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import {
  AIDES_PERCEE,
  AIDES_PLAN,
  AIDES_POINTS,
  anneauxFigure,
  consigneEcran,
  elementsCandidat,
  elementsFinaux,
  elementsPaire,
  enonce,
  estCommun,
  explicationPercee,
  explicationPlan,
  explicationPoints,
  legendeFinale,
  libellePaire,
  nomPlan,
  optionSuivie,
  paireCorrecte,
  percee,
  reponsePercee,
  reponsePlan,
  reponsePoints,
  texteOption,
  TITRES_ECRANS,
} from "./ui/formatPercee";
import { cadreFigure, COULEUR_ALPHA, COULEUR_D, COULEUR_PI, figurePerceeSvg, pixelAnneau, type OptionsFigurePercee } from "./ui/figurePercee";
import { ecranClos, segmentsDepuisHistorique, type EcranClos } from "./ui/historiqueProgression";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { EtapePlanAuxiliaire, EtapePointPercee, EtapePointsCommunsPercee, FigureCliquable, type CibleFigure } from "./components/EtapesPercee";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

/**
 * gen102 — « Point de percée par plan auxiliaire » (4e, chapitre 8 « Géométrie dans l'espace »,
 * section `percee`, processus 2 APPLIQUER). La méthode du cours, un écran par étape, la construction
 * se faisant sur la figure :
 * 1. choisir un plan auxiliaire π qui contient d (le triangle du plan touché s'affiche en vert) ;
 * 2. désigner deux points communs à π et α (toucher un point nommé sur la figure, ou choisir un
 *    point de rencontre de deux droites, dont les droites se dessinent) : la droite b ;
 * 3. désigner le point de percée parmi des points numérotés sur d (toucher sur la figure).
 * UNE tentative par écran, la bonne réponse est montrée après un échec ; aucun point affiché.
 * `?code=` (QR code d'une feuille) : première instance tirée avec les MÊMES fonctions que
 * l'adaptateur.
 */

function exerciceInitial(): ExercicePercee {
  const code = lireCodeDepuisUrl();
  if (!code) return genererExercicePercee();
  return genererAvecCode(code, CATALOGUE_VARIANTES, genererExercicePercee, construireAvecVariante);
}

interface TransitionEnAttente {
  revele: boolean;
  reponseAttendue: ReactNode;
  messageRevele: string;
  derniere: boolean;
}

function Legende({ planAux }: { planAux: [string, string, string] | null }) {
  const item = (couleur: string, texte: string, trait = false) => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span aria-hidden="true" style={trait ? { display: "inline-block", width: 18, height: 4, borderRadius: 2, background: couleur } : { display: "inline-block", width: 14, height: 14, borderRadius: 3, background: couleur, opacity: 0.75 }} />
      {texte}
    </span>
  );
  return (
    <p style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", justifyContent: "center", margin: "4px 0 0", fontWeight: 600 }}>
      {item(COULEUR_D, "droite d", true)}
      {item(COULEUR_ALPHA, "plan α")}
      {planAux && item(COULEUR_PI, `plan π = ${nomPlan(planAux)}`)}
    </p>
  );
}

export function AppPointPercee() {
  const [exercice, setExercice] = useState<ExercicePercee>(exerciceInitial);
  const [ecran, setEcran] = useState(0);
  const [niveauAide, setNiveauAide] = useState(0);
  const [choixPlan, setChoixPlan] = useState<number | null>(null);
  const [selectionPoints, setSelectionPoints] = useState<number[]>([]);
  const [paire, setPaire] = useState<[number, number] | null>(null);
  const [selectionPercee, setSelectionPercee] = useState<number | null>(null);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Clé des écrans : les choix repartent vides après « Générer » ou « Nouvel exercice ». */
  const [generation, setGeneration] = useState(0);

  const e = exercice;
  const total = 3;
  const clos = !!enAttente;
  // Option qui porte les écrans 2 et 3 : fixée dès la clôture de l'écran 1.
  const indexSuivi = optionSuivie(e, ecran === 0 && !clos ? null : choixPlan);
  const option = e.options[indexSuivi]!;
  const suite = option.suite!;

  function recommencer(ex: ExercicePercee) {
    setExercice(ex);
    setEcran(0);
    setNiveauAide(0);
    setChoixPlan(null);
    setSelectionPoints([]);
    setPaire(null);
    setSelectionPercee(null);
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setGeneration((g) => g + 1);
  }

  function conclure(correct: boolean, votreReponse: string, attendue: string, messageRevele: string) {
    const reponse = <p style={{ margin: 0 }}>{attendue}</p>;
    setHistorique((h) => [...h, ecranClos(TITRES_ECRANS[ecran]!, <p style={{ margin: 0 }}>{votreReponse}</p>, !correct, niveauAide > 0, reponse)]);
    setEnAttente({ revele: !correct, reponseAttendue: reponse, messageRevele, derniere: ecran >= total - 1 });
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.derniere) {
      recommencer(genererExercicePercee());
      return;
    }
    setEcran((n) => n + 1);
    setNiveauAide(0);
    setEnAttente(null);
  }

  const validation: ValidationEtapeProps | null = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: enAttente.reponseAttendue,
        labelSuivant: enAttente.derniere ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
        messageRevele: enAttente.messageRevele,
        corrigeDetaille: <CorrigeDetailleEcran etapes={lignesDeLEtape(correctionDetailleePercee(e, indexSuivi, paire ?? undefined), lettreEtape(ecran))} />,
      }
    : null;

  const aides = [AIDES_PLAN, AIDES_POINTS, AIDES_PERCEE][ecran]!;
  const communs = { aides, niveauAide, onActiverAide: () => setNiveauAide((n) => Math.min(aides.length, n + 1)), validation };

  // --- Figure et cibles tactiles selon l'écran -----------------------------------------------------
  const cadre = cadreFigure(e);
  let elements: Omit<OptionsFigurePercee, "mode"> = { etiquetteD: true };
  let cibles: CibleFigure[] = [];
  let onToucher: (cle: string) => void = () => {};
  let planLegende: [string, string, string] | null = null;
  if (ecran === 0) {
    const montre = clos ? option.nom : choixPlan !== null ? e.options[choixPlan]!.nom : null;
    elements = { etiquetteD: true, planAux: montre };
    planLegende = montre;
  } else if (ecran === 1) {
    planLegende = option.nom;
    if (clos && paire) {
      elements = { etiquetteD: true, ...elementsPaire(e, option, paire) };
    } else {
      const morceaux = selectionPoints.map((i) => elementsCandidat(e, suite.candidats[i]!));
      elements = { etiquetteD: true, planAux: option.nom, points: morceaux.flatMap((m) => m.points), segments: morceaux.flatMap((m) => m.segments) };
      cibles = suite.candidats.map((c, i) => ({ c, i })).filter(({ c }) => !c.construction).map(({ c, i }) => ({ cle: String(i), pixel: cadre.pixel(c.position!) }));
      onToucher = (cle) => basculerPoint(Number(cle));
    }
  } else if (paire) {
    planLegende = option.nom;
    elements = clos ? { etiquetteD: true, ...elementsFinaux(e, option, paire) } : { etiquetteD: true, ...elementsPaire(e, option, paire) };
    elements.anneaux = anneauxFigure(e, option, selectionPercee, clos);
    if (!clos) {
      cibles = suite.percee.map((c) => ({ cle: String(c.numero), pixel: pixelAnneau(e, cadre, c) }));
      onToucher = (cle) => setSelectionPercee(Number(cle));
    }
  }
  const svg = figurePerceeSvg(e, { mode: "ecran", ...elements });

  function basculerPoint(i: number) {
    setSelectionPoints((s) => (s.includes(i) ? s.filter((x) => x !== i) : s.length >= 2 ? s : [...s, i]));
  }

  // --- Écran courant ---------------------------------------------------------------------------------
  function ecranCourant(): ReactNode {
    if (ecran === 0) {
      return (
        <EtapePlanAuxiliaire
          {...communs}
          consigne={consigneEcran(e, 0, null)}
          options={e.options.map((o) => ({ texte: texteOption(o), valide: o.contientDroite }))}
          choix={choixPlan}
          onChoisir={setChoixPlan}
          explication={clos && choixPlan !== null ? explicationPlan(e, choixPlan) : null}
          onValider={() => {
            if (choixPlan === null) return;
            const o = e.options[choixPlan]!;
            conclure(o.contientDroite, texteOption(o), reponsePlan(e), "Ce plan ne contient pas la droite d.");
          }}
        />
      );
    }
    if (ecran === 1) {
      return (
        <EtapePointsCommunsPercee
          {...communs}
          consigne={consigneEcran(e, 1, option)}
          candidats={suite.candidats}
          selection={selectionPoints}
          onBasculer={basculerPoint}
          estCommun={(i) => estCommun(e, option, suite.candidats[i]!)}
          explication={clos && selectionPoints.length === 2 ? explicationPoints(e, option, [selectionPoints[0]!, selectionPoints[1]!]) : null}
          onValider={() => {
            if (selectionPoints.length !== 2) return;
            const choisie: [number, number] = [selectionPoints[0]!, selectionPoints[1]!];
            const juste = paireCorrecte(e, option, choisie[0], choisie[1]);
            setPaire(juste ? choisie : suite.paireAttendue);
            conclure(juste, libellePaire(suite, choisie), reponsePoints(e, option), "Ce n'était pas une bonne paire de points.");
          }}
        />
      );
    }
    const juste = percee(suite).numero;
    return (
      <EtapePointPercee
        {...communs}
        consigne={consigneEcran(e, 2, option)}
        numeros={suite.percee.map((c) => c.numero)}
        juste={juste}
        selection={selectionPercee}
        onChoisir={setSelectionPercee}
        explication={clos && selectionPercee !== null && paire ? explicationPercee(e, option, paire, selectionPercee) : null}
        onValider={() => {
          if (selectionPercee === null || !paire) return;
          conclure(selectionPercee === juste, `Point ${selectionPercee}`, reponsePercee(e, option, paire), "Ce n'était pas le point de percée.");
        }}
      />
    );
  }

  const blocDonnees = (
    <FigureCliquable
      svg={svg}
      cibles={cibles}
      onToucher={onToucher}
      legende={
        <>
          <Legende planAux={planLegende} />
          {ecran === 2 && clos && (
            <p style={{ margin: "6px 0 0", fontSize: "0.92em", textAlign: "center" }}>{legendeFinale()}</p>
          )}
        </>
      }
    />
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Point de percée par plan auxiliaire</h1>
        <p className="app-subtitle">Chapitre 8 — Géométrie dans l'espace</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={(id) => recommencer(construireAvecVariante(id))} />
      </header>

      <main className="card">
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, total, !enAttente)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />

        <div className="card-body">
          <EnTeteExercice consigneGenerale={enonce(e)} blocDonnees={blocDonnees} />
          <Fragment key={`${generation}-${ecran}`}>{ecranCourant()}</Fragment>
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex].entree} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}

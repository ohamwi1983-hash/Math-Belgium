import { Fragment, useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceValeurExacte, TermeTrig } from "./core/valeurExacte.types";
import type { Quadrant } from "./core/cercleTrigonometrique.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceValeurExacte } from "./generateurs/valeurExacte";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { activerAide, demarrer, ecranCourant, ecranSuivant, soumettre, tentativesMaxEcran, type EcranValeurExacte, type EtatValeurExacte } from "./moteur/sessionValeurExacte";
import { angleAssocie, angleReduit, quadrantDe, signeDe, valeurExpression, valeurFonction } from "./moteur/modeleValeurExacte";
import {
  diagnostiquerAngleAssocie,
  diagnostiquerReduction,
  diagnostiquerValeurExacte,
  diagnostiquerValeurTerme,
  normaliserSaisieExacte,
  statutSansTentative,
  verifierPlacement,
} from "./moteur/verificationValeurExacte";
import {
  CONSIGNE_GENERALE,
  aidesFinal,
  aidesPlacement,
  aidesReduction,
  aidesValeur,
  angleTravail,
  consigneEcran,
  enTeteTerme,
  expressionLatex,
  fonctionAngleLatex,
  messageStatutAngle,
  messageStatutExact,
  rappelReduction,
  resultatLatex,
  titreEcran,
  valeurLatex,
} from "./ui/formatValeurExacte";
import { ecranClos, saisieEnLatex, segmentsDepuisHistorique, type EcranClos } from "./ui/historiqueProgression";
import { libelleQuadrant } from "./ui/formatCercleTrigonometrique";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { Katex } from "./components/Katex";
import { RenduFragments } from "./components/RenduFragments";
import {
  EtapeFinaleValeurExacte,
  EtapePlacementValeurExacte,
  EtapeReductionValeurExacte,
  EtapeValeurTermeValeurExacte,
  FigureAngleAssocieValeurExacte,
  FigureReductionValeurExacte,
} from "./components/EtapesValeurExacte";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

/**
 * gen76 — « Valeur exacte sans calculatrice » (4e, chapitre 5, section « associes », processus 2
 * APPLIQUER). Synthèse de gen14 (réduire, quadrant, signe), gen15 (valeurs remarquables) et gen17
 * (angles associés) : valeur exacte d'une expression de 2 ou 3 termes (sin 150° + cos 240° · tan 315°).
 * Écrans : pour chaque terme, [angle ramené dans [0° ; 360°[] → quadrant et signe (choix fermés, une
 * tentative) → angle associé et valeur exacte ; puis la valeur exacte de l'expression. Aucun point
 * affiché. `?code=` (QR code d'une feuille) : première instance tirée avec les MÊMES fonctions que
 * l'adaptateur.
 */

function exerciceInitial(): ExerciceValeurExacte {
  const code = lireCodeDepuisUrl();
  if (!code) return genererExerciceValeurExacte();
  return genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceValeurExacte, construireAvecVariante);
}

interface TransitionEnAttente {
  revele: boolean;
  reponseAttendue: ReactNode;
  messageRevele?: string;
  derniere: boolean;
}

interface Retour {
  messageSansTentative: string | null;
  diagnostics: string[];
  erreurs: boolean[];
}

const RETOUR_VIDE: Retour = { messageSansTentative: null, diagnostics: [], erreurs: [] };

function signeTexte(s: 1 | -1): string {
  return s === 1 ? "positif" : "négatif";
}

function reponseAttendue(e: ExerciceValeurExacte, ecran: EcranValeurExacte): ReactNode {
  if (ecran.type === "final") return <Katex expression={`${expressionLatex(e)} = ${resultatLatex(e)}`} />;
  const t = e.termes[ecran.terme]!;
  const ft = fonctionAngleLatex(t.fonction, angleTravail(t));
  if (ecran.type === "reduction") return <Katex expression={`${angleReduit(t.angle)}^\\circ`} />;
  if (ecran.type === "placement")
    return (
      <span>
        {libelleQuadrant(quadrantDe(t))} ; <Katex expression={ft} /> est {signeTexte(signeDe(t))}.
      </span>
    );
  return (
    <span>
      Angle associé : <Katex expression={`${angleAssocie(t)}^\\circ`} /> ; <Katex expression={`${ft} = ${valeurLatex(valeurFonction(t))}`} />
    </span>
  );
}

/** En-tête de l'écran d'un terme. Le rappel « sin 855° = sin 135° » n'apparaît qu'APRÈS l'écran de
 * réduction (il en est la réponse). */
function BoiteTerme({ e, terme, avecRappel }: { e: ExerciceValeurExacte; terme: number; avecRappel: boolean }) {
  const rappel = avecRappel ? rappelReduction(e.termes[terme]!) : null;
  return (
    <div style={{ margin: "16px 0 12px" }}>
      <p style={{ margin: 0, fontWeight: 600 }}>
        <RenduFragments fragments={enTeteTerme(e, terme)} />
      </p>
      {rappel && (
        <p style={{ margin: "4px 0 0" }}>
          <RenduFragments fragments={rappel} />
        </p>
      )}
    </div>
  );
}

/** Valeurs des termes établies aux écrans précédents (rappel de l'écran final). */
function RecapitulatifTermes({ e }: { e: ExerciceValeurExacte }) {
  return (
    <div style={{ margin: "16px 0 12px" }}>
      <p style={{ margin: "0 0 4px", fontWeight: 600 }}>Valeurs trouvées :</p>
      <ul style={{ margin: 0, paddingLeft: "1.2em", display: "grid", gap: 6 }}>
        {e.termes.map((t: TermeTrig, i) => (
          <li key={i}>
            <Katex expression={`${fonctionAngleLatex(t.fonction, t.angle)} = ${valeurLatex(valeurFonction(t))}`} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AppValeurExacte() {
  const [etat, setEtat] = useState<EtatValeurExacte>(() => demarrer(exerciceInitial()));
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Clé des écrans : les champs repartent vides après « Générer » ou « Nouvel exercice ». */
  const [generation, setGeneration] = useState(0);
  const [retour, setRetour] = useState<Retour>(RETOUR_VIDE);

  const e = etat.exercice;
  const ecran = ecranCourant(etat);

  function recommencer(exercice: ExerciceValeurExacte) {
    setEtat(demarrer(exercice));
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setRetour(RETOUR_VIDE);
    setGeneration((g) => g + 1);
  }

  function conclure(correct: boolean, votreReponse: ReactNode, diagnostics: string[], erreurs: boolean[]) {
    const resultat = soumettre(etat, correct);
    setRetour({ messageSansTentative: null, diagnostics: correct ? [] : diagnostics, erreurs: correct ? [] : erreurs });
    if (!resultat.clos) {
      setEtat(resultat.etat);
      return;
    }
    const attendue = reponseAttendue(e, ecran);
    setHistorique((h) => [...h, ecranClos(titreEcran(e, ecran), votreReponse, resultat.revele, etat.niveauAide > 0, attendue)]);
    setEtat(resultat.etat);
    setEnAttente({
      revele: resultat.revele,
      reponseAttendue: attendue,
      messageRevele: ecran.type === "placement" ? "Ce n'était pas le bon choix." : undefined,
      derniere: etat.ecran >= etat.ecrans.length - 1,
    });
  }

  function sansTentative(message: string, erreurs: boolean[]) {
    setRetour({ messageSansTentative: message, diagnostics: [], erreurs });
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.derniere) {
      recommencer(genererExerciceValeurExacte());
      return;
    }
    setEtat(ecranSuivant(etat));
    setRetour(RETOUR_VIDE);
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

  const communs = {
    niveauAide: etat.niveauAide,
    onActiverAide: () => setEtat(activerAide(etat)),
    validation,
    consigne: <RenduFragments fragments={consigneEcran(e, ecran)} />,
    tentativesUtilisees: etat.tentativesUtilisees,
    tentativesMax: tentativesMaxEcran(ecran),
    messageSansTentative: retour.messageSansTentative,
    diagnostics: retour.diagnostics,
  };

  function ecranAffiche(): ReactNode {
    if (ecran.type === "final") {
      return (
        <EtapeFinaleValeurExacte
          {...communs}
          enTete={<RecapitulatifTermes e={e} />}
          aides={aidesFinal(e)}
          labelValeur={<Katex expression={`${expressionLatex(e)} =`} />}
          erreur={retour.erreurs[0] ?? false}
          onValider={(texte) => {
            const statut = diagnostiquerValeurExacte(texte, valeurExpression(e));
            if (statutSansTentative(statut)) return sansTentative(messageStatutExact(statut), [true]);
            conclure(statut === "correct", saisieEnLatex(normaliserSaisieExacte(texte)), [messageStatutExact(statut === "signe" ? "faux" : statut)], [true]);
          }}
        />
      );
    }
    const t = e.termes[ecran.terme]!;
    const enTete = <BoiteTerme e={e} terme={ecran.terme} avecRappel={ecran.type !== "reduction"} />;
    const ft = fonctionAngleLatex(t.fonction, angleTravail(t));
    if (ecran.type === "reduction") {
      return (
        <EtapeReductionValeurExacte
          {...communs}
          enTete={enTete}
          aides={aidesReduction(t)}
          figures={[null, <FigureReductionValeurExacte terme={t} />]}
          erreur={retour.erreurs[0] ?? false}
          onValider={(texte) => {
            const statut = diagnostiquerReduction(texte, t);
            if (statut === "parse_error") return sansTentative(messageStatutAngle(statut, "reduction"), [true]);
            conclure(statut === "correct", `${texte.trim().replace("-", "−").replace(/°$/, "")}°`, [messageStatutAngle(statut, "reduction")], [true]);
          }}
        />
      );
    }
    if (ecran.type === "placement") {
      return (
        <EtapePlacementValeurExacte
          {...communs}
          enTete={enTete}
          aides={aidesPlacement()}
          fonctionLatex={<Katex expression={ft} />}
          onValider={(quadrant: Quadrant, signe) => {
            const ok = quadrant !== "axeOx" && quadrant !== "axeOy" && verifierPlacement(t, quadrant, signe);
            conclure(
              ok,
              <span>
                {libelleQuadrant(quadrant)} ; {signeTexte(signe)}
              </span>,
              [],
              [],
            );
          }}
        />
      );
    }
    return (
      <EtapeValeurTermeValeurExacte
        {...communs}
        enTete={enTete}
        aides={aidesValeur(t)}
        figures={[<FigureAngleAssocieValeurExacte terme={t} />, null]}
        labelValeur={
          <>
            Valeur exacte : <Katex expression={`${ft} =`} />
          </>
        }
        erreurs={[retour.erreurs[0] ?? false, retour.erreurs[1] ?? false]}
        onValider={(texteAngle, texteValeur) => {
          const sa = diagnostiquerAngleAssocie(texteAngle, t);
          const sv = diagnostiquerValeurTerme(texteValeur, t);
          if (statutSansTentative(sa) || statutSansTentative(sv)) {
            const message = statutSansTentative(sa) ? messageStatutAngle(sa, "valeur") : messageStatutExact(sv, t.fonction);
            return sansTentative(message, [statutSansTentative(sa), statutSansTentative(sv)]);
          }
          const diagnostics = [...(sa !== "correct" ? [messageStatutAngle(sa, "valeur")] : []), ...(sv !== "correct" ? [messageStatutExact(sv, t.fonction)] : [])];
          conclure(
            sa === "correct" && sv === "correct",
            <span>
              {`${texteAngle.trim().replace(/°$/, "")}°`} ; {saisieEnLatex(normaliserSaisieExacte(texteValeur))}
            </span>,
            diagnostics,
            [sa !== "correct", sv !== "correct"],
          );
        }}
      />
    );
  }

  const blocDonnees = (
    <div className="equation-box">
      <Katex expression={expressionLatex(e)} block />
    </div>
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Valeur exacte sans calculatrice</h1>
        <p className="app-subtitle">Chapitre 5 — Cercle trigonométrique et triangles quelconques</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={(id) => recommencer(construireAvecVariante(id))} />
      </header>

      <main className="card">
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, etat.ecrans.length, !enAttente)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />

        <div className="card-body">
          <EnTeteExercice consigneGenerale={CONSIGNE_GENERALE} blocDonnees={blocDonnees} />
          <Fragment key={`${generation}-${etat.ecran}`}>{ecranAffiche()}</Fragment>
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex].entree} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}

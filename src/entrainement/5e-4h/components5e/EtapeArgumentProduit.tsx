import { useState } from "react";
import type { ExerciceEquationTrig, ExerciceProduitFacteurs } from "../core5e/equationsTrigonometriques.types";
import { diagnostiquerArgument, type ReponseArgument, type ReponseDeuxFacteursArgument } from "../moteur5e/verificationEquationTrig";
import { CONSIGNE_ARGUMENT_PRODUIT, formatEnonceProduitLatex, formatQuestionArgumentTexte, formatTermesEtatActuelProduit } from "../ui5e/formatEquationTrigonometrique";
import { decouperEquationLongueLatex } from "../ui5e/blocFitterEquation";
import { ANNONCE_PRECISION_DECIMAL, CONSIGNE_GENERALE_EQUATION_TRIG, texteAideArgumentNiveau1, texteAideArgumentNiveau2 } from "../ui5e/formatEquationTrig";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { CalculatriceScientifique } from "./CalculatriceScientifique";
import { BoutonAide } from "./BoutonAide";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceProduitFacteurs;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseDeuxFacteursArgument) => void;
  /** Statut à 3 valeurs, calculé côté PRÉSENTATION uniquement — voir `EtapeArgumentEquationTrig`. */
  diagnostiquer?: (reponse: ReponseDeuxFacteursArgument) => StatutVerification;
}

/** Bloc "état actuel" — rappelle prefacteur (si présent) + les 2 équations séparées déjà
 * confirmées à l'écran "separerFacteurs". */
function EtatActuelProduit({
  exercice,
  phase,
}: {
  exercice: ExerciceProduitFacteurs;
  phase: "separerFacteurs" | "argumentProduit" | "isolerXProduit" | "solutionsProduit";
}) {
  const termes = formatTermesEtatActuelProduit(exercice, phase);
  if (termes.length === 0) return null;
  return (
    <div className="etat-actuel-box etat-actuel-box-termes">
      {termes.map((t, i) => (
        <Katex key={i} expression={t} />
      ))}
    </div>
  );
}

/** Un facteur (moitié de l'écran), même mécanique/gate que `EtapeArgumentEquationTrig` (D.1),
 * dupliquée pour les 2 facteurs indépendamment (E.1 — calculatrice/gate/aide conditionnées PAR
 * facteur, un facteur peut être en régime "decimal" pendant que l'autre est "exact"). */
function BlocFacteurArgument({
  facteur,
  numero,
  choix,
  setChoix,
  lignes,
  setLignes,
  erronee,
}: {
  facteur: ExerciceEquationTrig;
  numero: 1 | 2;
  choix: boolean | null;
  setChoix: (v: boolean) => void;
  lignes: string[];
  setLignes: (updater: (arr: string[]) => string[]) => void;
  erronee: boolean;
}) {
  const gateActif = facteur.fonction !== "tan";
  const lignesVisibles = choix === false;
  return (
    <div>
      <p className="prompt-text">
        Facteur {numero} — {formatQuestionArgumentTexte(facteur.fonction)} <Katex expression={facteur.k.latex} /> ?
        {facteur.regime === "decimal" && ANNONCE_PRECISION_DECIMAL}
      </p>
      {facteur.regime === "decimal" && <CalculatriceScientifique />}
      {gateActif && (
        <div className="options-grid">
          <button type="button" className={choix === true ? "btn toggle-active" : "btn"} onClick={() => setChoix(true)}>
            Aucune solution
          </button>
          <button type="button" className={choix === false ? "btn toggle-active" : "btn"} onClick={() => setChoix(false)}>
            Au moins une série d'angles
          </button>
        </div>
      )}
      {lignesVisibles && (
        <div className="contenu-conditionnel">
          {lignes.map((ligne, i) => (
            <div key={i}>
              <ApercuExpressionLatex texte={ligne} />
              <div className="field-row">
                <input
                  type="text"
                  className={`text-input${erronee ? " is-erronee" : ""}`}
                  value={ligne}
                  onChange={(e) => setLignes((arr) => arr.map((v, j) => (j === i ? e.target.value : v)))}
                  placeholder="ex : pi/3 + 2*k*pi"
                />
                {lignes.length > 1 && (
                  <button type="button" className="btn liste-morceaux-retirer" aria-label="Retirer" onClick={() => setLignes((arr) => arr.filter((_, j) => j !== i))}>
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
          <button type="button" className="btn" onClick={() => setLignes((arr) => [...arr, ""])}>
            + Ajouter une série
          </button>
        </div>
      )}
    </div>
  );
}

/** Écran "résoudre l'argument pour chaque facteur" (famille "produit") — les 2 facteurs traités
 * ENSEMBLE sur un seul écran, chacun avec son propre add-as-needed + gate "Aucune solution"/"Au
 * moins une série d'angles" (E.1, applique D.1 par facteur — un facteur peut être sin décimal
 * pendant que l'autre est cos exact). */
export function EtapeArgumentProduit({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [choix1, setChoix1] = useState<boolean | null>(exercice.facteur1.fonction === "tan" ? false : null);
  const [lignes1, setLignes1] = useState<string[]>([""]);
  const [choix2, setChoix2] = useState<boolean | null>(exercice.facteur2.fonction === "tan" ? false : null);
  const [lignes2, setLignes2] = useState<string[]>([""]);
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;

  const complet1 = choix1 === true || (choix1 === false && lignes1.length > 0 && lignes1.every((l) => l.trim() !== ""));
  const complet2 = choix2 === true || (choix2 === false && lignes2.length > 0 && lignes2.every((l) => l.trim() !== ""));
  const complet = complet1 && complet2;

  const reponseFacteur1: ReponseArgument = choix1 === true ? { aucuneSolution: true } : { aucuneSolution: false, lignes: lignes1 };
  const reponseFacteur2: ReponseArgument = choix2 === true ? { aucuneSolution: true } : { aucuneSolution: false, lignes: lignes2 };
  const facteur1Erronee = montrerErreurs && choix1 === false && diagnostiquerArgument(exercice.facteur1, reponseFacteur1) !== "correct";
  const facteur2Erronee = montrerErreurs && choix2 === false && diagnostiquerArgument(exercice.facteur2, reponseFacteur2) !== "correct";

  function valider() {
    if (!complet) return;
    const reponse: ReponseDeuxFacteursArgument = {
      facteur1: (choix1 === true ? { aucuneSolution: true } : { aucuneSolution: false, lignes: lignes1 }) as ReponseArgument,
      facteur2: (choix2 === true ? { aucuneSolution: true } : { aucuneSolution: false, lignes: lignes2 }) as ReponseArgument,
    };
    if (diagnostiquer) setDernierStatut(diagnostiquer(reponse));
    onValider(reponse);
  }

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_EQUATION_TRIG}</p>
      <div className="equation-box equation-box-termes">
        {decouperEquationLongueLatex(formatEnonceProduitLatex(exercice)).map((morceau, i) => (
          <Katex key={i} expression={morceau} />
        ))}
      </div>
      <EtatActuelProduit exercice={exercice} phase="argumentProduit" />
      <p className="prompt-text">{CONSIGNE_ARGUMENT_PRODUIT}</p>

      <BlocFacteurArgument facteur={exercice.facteur1} numero={1} choix={choix1} setChoix={setChoix1} lignes={lignes1} setLignes={setLignes1} erronee={facteur1Erronee} />
      <BlocFacteurArgument facteur={exercice.facteur2} numero={2} choix={choix2} setChoix={setChoix2} lignes={lignes2} setLignes={setLignes2} erronee={facteur2Erronee} />

      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>Facteur 1 — {texteAideArgumentNiveau1(exercice.facteur1.fonction)}</p>
          <p>Facteur 2 — {texteAideArgumentNiveau1(exercice.facteur2.fonction)}</p>
          {niveauAide >= 2 && (
            <>
              <p>Facteur 1 — {texteAideArgumentNiveau2(exercice.facteur1.fonction)}</p>
              <p>Facteur 2 — {texteAideArgumentNiveau2(exercice.facteur2.fonction)}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

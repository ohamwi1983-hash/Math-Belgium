import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import type { ExerciceFonctionsCyclometriques } from "../core6e/fonctionsCyclometriques.types";
import type { ReponseFonctionsCyclometriques } from "../moteur6e/verificationFonctionsCyclometriques";
import { evaluerValeurCyclometrique } from "../moteur6e/expressionCyclometrique";
import { CONSIGNE_GENERALE, formatExpressionLatex } from "../ui6e/formatFonctionsCyclometriques";
import { aideValeur1, aideValeur2, cibleValeur } from "../ui6e/aidesFonctionsCyclometriques";
import { Katex } from "../components/Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";
import {
  AidesCyclo,
  MESSAGES_ILLISIBLE_CYCLO,
  MESSAGE_APPROCHEE_CYCLO,
  MESSAGE_RECOPIE_ARC,
  MessageRetourCyclo,
  cibleDepuisTexte,
  contientFonctionTrig,
  estApprocheeDe,
  useRetourCyclo,
} from "./RetourSaisieCyclo";

interface Props {
  exercice: ExerciceFonctionsCyclometriques;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseFonctionsCyclometriques) => void;
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran UNIQUE de `6gen2` — verdict « Existe / N'existe pas » (choix fermé : un verdict faux clôt
 * l'écran, une seule tentative), puis, après « Existe », la valeur exacte (champ : trois
 * tentatives). Règles communes du 6e ch. 1 (lot B) : saisie illisible, valeur approchée
 * (« 1,047 » pour π/3) ou fonction recopiée (« arccos(1/2) ») signalées SANS tentative ; π, √,
 * fractions et « − » lus ; messages ciblés (arcsin(sin θ) = θ hors de l'image, angle hors de
 * l'image, signe) ; aides KaTeX à deux niveaux sans la conclusion.
 */
export function EtapeFonctionsCyclometriques({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation }: Props) {
  const [existe, setExiste] = useState<boolean | null>(null);
  const [texte, setTexte] = useState("");
  const retour = useRetourCyclo<ReponseFonctionsCyclometriques>();
  const complet = existe === true ? texte.trim() !== "" : existe === false;
  const derniere = retour.soumise;

  function valider() {
    if (!complet) return;
    if (existe === false) return retour.tenter({ existe: false, texte: null }, null, onValider);
    const v = evaluerValeurCyclometrique(texte);
    const blocage =
      v === null
        ? MESSAGES_ILLISIBLE_CYCLO.valeurExacte
        : contientFonctionTrig(texte)
          ? MESSAGE_RECOPIE_ARC
          : exercice.existe && exercice.valeurNumerique !== null && estApprocheeDe(texte, exercice.valeurNumerique)
            ? MESSAGE_APPROCHEE_CYCLO
            : null;
    retour.tenter({ existe: true, texte }, blocage, onValider);
  }

  const valeurSoumise = derniere?.existe && derniere.texte !== null ? evaluerValeurCyclometrique(derniere.texte) : null;
  const cible = valeurSoumise !== null ? cibleValeur(exercice, valeurSoumise) : null;

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={CONSIGNE_GENERALE}
        blocDonnees={
          <div className="equation-box">
            <Katex expression={formatExpressionLatex(exercice)} />
          </div>
        }
      />

      <div className="options-grid-compact">
        <button type="button" className={`btn${existe === true ? " toggle-active" : ""}`} disabled={!!validation} onClick={() => setExiste(true)}>
          Existe
        </button>
        <button type="button" className={`btn${existe === false ? " toggle-active" : ""}`} disabled={!!validation} onClick={() => setExiste(false)}>
          N'existe pas
        </button>
      </div>

      {existe === true && (
        <>
          <ApercuExpressionLatex texte={texte} />
          <div className="field contenu-conditionnel">
            <input
              type="text"
              className={`text-input${tentativesUtilisees > 0 && derniere?.texte === texte ? " is-erronee" : ""}`}
              value={texte}
              disabled={!!validation}
              placeholder="valeur exacte"
              onChange={(e) => setTexte(e.target.value)}
            />
          </div>
        </>
      )}

      <AidesCyclo aide1={aideValeur1(exercice)} aide2={aideValeur2(exercice)} niveauAide={niveauAide} />
      {!validation && (
        <>
          <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
            Valider
          </button>
          <MessageRetourCyclo blocage={retour.blocage} tentativesUtilisees={tentativesUtilisees} tentativesMax={tentativesMax} cible={cible ? cibleDepuisTexte(cible) : null} />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

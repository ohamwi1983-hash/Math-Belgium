import { useState } from "react";
import type { ExerciceProduitFacteurs } from "../core5e/equationsTrigonometriques.types";
import { diagnostiquerIsolerX, type ReponseDeuxFacteursLignes } from "../moteur5e/verificationEquationTrig5gen10";
import { CONSIGNE_ISOLER_X_PRODUIT, formatEnonceProduitLatex } from "../ui5e/formatEquationTrigonometrique";
import { decouperEquationLongueLatex } from "../ui5e/blocFitterEquation";
import { ANNONCE_PRECISION_DECIMAL, CONSIGNE_GENERALE_EQUATION_TRIG, formatAideIsolerXNiveau2Latex } from "../ui5e/formatEquationTrig";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { aidesIsolerX, messageCibleIsolerX, messageFacteur } from "../ui5e/aidesTrigonometrie";
import { BoutonAide } from "./BoutonAide";
import { AidesTrig, RetourSaisieTrig, estLisible, useTentativeLisible } from "./RetourSaisieTrig";
import type { StatutVerification } from "../moteur/statutVerification";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceProduitFacteurs;
  tentativesUtilisees: number;
  tentativesMax: number;
  /** D.2 (E.1) — aide plafonnée à 0 sur cet écran (retirée entièrement) ; les 3 props ci-dessous
   * restent dans le contrat pour que `App5gen10.tsx` garde un câblage uniforme sur tous les écrans,
   * mais ne sont jamais consommées ici (jamais de bouton/bloc d'aide rendu). */
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseDeuxFacteursLignes) => void;
  /** Statut à 3 valeurs, calculé côté PRÉSENTATION uniquement — voir `EtapeArgumentEquationTrig`. */
  diagnostiquer?: (reponse: ReponseDeuxFacteursLignes) => StatutVerification;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran "isoler x pour chaque facteur" (famille "produit") — les 2 facteurs traités ENSEMBLE,
 * chacun pré-rempli au nombre de branches déjà confirmées à l'écran précédent. Un facteur peut
 * légitimement avoir ZÉRO branche (`aucuneSolution` déjà confirmé à l'écran "argumentProduit",
 * jamais un simple `Math.max(1, ...)` qui forcerait à tort une ligne à isoler pour un facteur qui
 * n'en a aucune — bug de softlock trouvé par vérification Playwright de bout en bout : ce cas
 * n'a AUCUNE réponse possible, `diagnostiquerIsolerX` exigeant 0 ligne, jamais 1). D.2 (E.1) :
 * AUCUNE aide sur cet écran (`niveauAideMaxEquationTrig` plafonne cette phase à 0). */
export function EtapeIsolerXProduit({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, validation}: Props) {
  const facteur1NecessiteLignes = exercice.facteur1.branchesU.length > 0;
  const facteur2NecessiteLignes = exercice.facteur2.branchesU.length > 0;
  const [lignes1, setLignes1] = useState<string[]>(() => Array.from({ length: exercice.facteur1.branchesU.length }, () => ""));
  const [lignes2, setLignes2] = useState<string[]>(() => Array.from({ length: exercice.facteur2.branchesU.length }, () => ""));
  const saisie = useTentativeLisible<ReponseDeuxFacteursLignes>();
  const montrerErreurs = tentativesUtilisees > 0;
  const complet1 = !facteur1NecessiteLignes || (lignes1.length > 0 && lignes1.every((l) => l.trim() !== ""));
  const complet2 = !facteur2NecessiteLignes || (lignes2.length > 0 && lignes2.every((l) => l.trim() !== ""));
  const complet = complet1 && complet2;
  const facteur1Erronee = (saisie.illisible || montrerErreurs) && facteur1NecessiteLignes && diagnostiquerIsolerX(exercice.facteur1, lignes1) !== "correct";
  const facteur2Erronee = (saisie.illisible || montrerErreurs) && facteur2NecessiteLignes && diagnostiquerIsolerX(exercice.facteur2, lignes2) !== "correct";

  function valider() {
    if (!complet) return;
    const reponse: ReponseDeuxFacteursLignes = { facteur1: lignes1, facteur2: lignes2 };
    // Saisie illisible : rien n'est transmis au moteur (aucune tentative consommée).
    saisie.tenter(reponse, estLisible(diagnostiquer?.(reponse)), onValider);
  }

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={CONSIGNE_GENERALE_EQUATION_TRIG}
        blocDonnees={
          <div className="equation-box equation-box-termes">
            {decouperEquationLongueLatex(formatEnonceProduitLatex(exercice)).map((morceau, i) => (
              <Katex key={i} expression={morceau} />
            ))}
          </div>
        }
      />
      <p className="prompt-text">{CONSIGNE_ISOLER_X_PRODUIT}</p>

      <p className="prompt-text prompt-text--question-multiple">
        Facteur 1{facteur1NecessiteLignes && exercice.facteur1.regime === "decimal" && ANNONCE_PRECISION_DECIMAL} :
      </p>
      {facteur1NecessiteLignes ? (
        <>
          {lignes1.map((ligne, i) => (
            <div key={i}>
              <ApercuExpressionLatex texte={ligne} />
              <div className="field-row">
                <input
                  type="text"
                  className={`text-input${facteur1Erronee ? " is-erronee" : ""}`}
                  value={ligne}
                  onChange={(e) => setLignes1((arr) => arr.map((v, j) => (j === i ? e.target.value : v)))}
                  placeholder="ex : π/5 + kπ/7"
                />
                {lignes1.length > 1 && (
                  <button type="button" className="btn liste-morceaux-retirer" aria-label="Retirer" onClick={() => setLignes1((arr) => arr.filter((_, j) => j !== i))}>
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
          <button type="button" className="btn" onClick={() => setLignes1((arr) => [...arr, ""])}>
            + Ajouter une série
          </button>
        </>
      ) : (
        <p className="prompt-text">Ce facteur n'a aucune solution — rien à isoler.</p>
      )}

      <p className="prompt-text prompt-text--question-multiple">
        Facteur 2{facteur2NecessiteLignes && exercice.facteur2.regime === "decimal" && ANNONCE_PRECISION_DECIMAL} :
      </p>
      {facteur2NecessiteLignes ? (
        <>
          {lignes2.map((ligne, i) => (
            <div key={i}>
              <ApercuExpressionLatex texte={ligne} />
              <div className="field-row">
                <input
                  type="text"
                  className={`text-input${facteur2Erronee ? " is-erronee" : ""}`}
                  value={ligne}
                  onChange={(e) => setLignes2((arr) => arr.map((v, j) => (j === i ? e.target.value : v)))}
                  placeholder="ex : π/5 + kπ/7"
                />
                {lignes2.length > 1 && (
                  <button type="button" className="btn liste-morceaux-retirer" aria-label="Retirer" onClick={() => setLignes2((arr) => arr.filter((_, j) => j !== i))}>
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
          <button type="button" className="btn" onClick={() => setLignes2((arr) => [...arr, ""])}>
            + Ajouter une série
          </button>
        </>
      ) : (
        <p className="prompt-text">Ce facteur n'a aucune solution — rien à isoler.</p>
      )}

      <AidesTrig niveauAide={niveauAide} aides={aidesIsolerX([...formatAideIsolerXNiveau2Latex(exercice.facteur1), ...formatAideIsolerXNiveau2Latex(exercice.facteur2)])} />
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
          Valider
        </button>
        <RetourSaisieTrig
          illisible={saisie.illisible}
          champ="solutions"
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          cible={montrerErreurs && saisie.soumise ? (messageFacteur(1, messageCibleIsolerX(saisie.soumise.facteur1, exercice.facteur1.branchesX, exercice.facteur1.a.numerateur / exercice.facteur1.a.denominateur, exercice.facteur1.b.decimal)) ?? messageFacteur(2, messageCibleIsolerX(saisie.soumise.facteur2, exercice.facteur2.branchesX, exercice.facteur2.a.numerateur / exercice.facteur2.a.denominateur, exercice.facteur2.b.decimal))) : null}
        />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

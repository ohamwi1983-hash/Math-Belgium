import { useState } from "react";
import type { ExerciceProduitFacteurs } from "../core5e/equationsTrigonometriques.types";
import { diagnostiquerIsolerX, type ReponseDeuxFacteursLignes } from "../moteur5e/verificationEquationTrig";
import { formatEnonceProduitLatex, formatTermesEtatActuelProduit } from "../ui5e/formatEquationTrigonometrique";
import { decouperEquationLongueLatex } from "../ui5e/blocFitterEquation";
import { ANNONCE_PRECISION_DECIMAL, CONSIGNE_GENERALE_EQUATION_TRIG } from "../ui5e/formatEquationTrig";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

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
}

/** Bloc "état actuel" — rappelle prefacteur (si présent) + les facteurs séparés + l'argument
 * (formes réelles substituées, D.2) déjà confirmés aux 2 écrans précédents. */
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

/** Écran "isoler x pour chaque facteur" (famille "produit") — les 2 facteurs traités ENSEMBLE,
 * chacun pré-rempli au nombre de branches déjà confirmées à l'écran précédent. Un facteur peut
 * légitimement avoir ZÉRO branche (`aucuneSolution` déjà confirmé à l'écran "argumentProduit",
 * jamais un simple `Math.max(1, ...)` qui forcerait à tort une ligne à isoler pour un facteur qui
 * n'en a aucune — bug de softlock trouvé par vérification Playwright de bout en bout : ce cas
 * n'a AUCUNE réponse possible, `diagnostiquerIsolerX` exigeant 0 ligne, jamais 1). D.2 (E.1) :
 * AUCUNE aide sur cet écran (`niveauAideMaxEquationTrig` plafonne cette phase à 0). */
export function EtapeIsolerXProduit({ exercice, tentativesUtilisees, tentativesMax, onValider, diagnostiquer }: Props) {
  const facteur1NecessiteLignes = exercice.facteur1.branchesU.length > 0;
  const facteur2NecessiteLignes = exercice.facteur2.branchesU.length > 0;
  const [lignes1, setLignes1] = useState<string[]>(() => Array.from({ length: exercice.facteur1.branchesU.length }, () => ""));
  const [lignes2, setLignes2] = useState<string[]>(() => Array.from({ length: exercice.facteur2.branchesU.length }, () => ""));
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet1 = !facteur1NecessiteLignes || (lignes1.length > 0 && lignes1.every((l) => l.trim() !== ""));
  const complet2 = !facteur2NecessiteLignes || (lignes2.length > 0 && lignes2.every((l) => l.trim() !== ""));
  const complet = complet1 && complet2;
  const facteur1Erronee = montrerErreurs && facteur1NecessiteLignes && diagnostiquerIsolerX(exercice.facteur1, lignes1) !== "correct";
  const facteur2Erronee = montrerErreurs && facteur2NecessiteLignes && diagnostiquerIsolerX(exercice.facteur2, lignes2) !== "correct";

  function valider() {
    if (!complet) return;
    const reponse: ReponseDeuxFacteursLignes = { facteur1: lignes1, facteur2: lignes2 };
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
      <EtatActuelProduit exercice={exercice} phase="isolerXProduit" />
      <p className="prompt-text">Résous ces équations ci-dessus et donne les valeurs de x.</p>

      <p className="prompt-text">
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
                  placeholder="ex : pi/6 + k*pi"
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

      <p className="prompt-text">
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
                  placeholder="ex : pi/6 + k*pi"
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

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
        </p>
      )}
    </div>
  );
}

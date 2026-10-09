import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import type { AideAvecLatex } from "../ui6e/formatTransformationsPlan";
import { BoutonAide } from "./BoutonAide";

interface Props {
  consigneGenerale: string;
  blocDonnees: string[];
  etatActuel: string[] | null;
  consigneEcran: string;
  nombreMaxPoints: number;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (textes: string[]) => void;
}

/**
 * Écran DÉDIÉ famille C, écran 3 ("applique la rotation confirmée aux autres points donnés") —
 * add-as-needed (jusqu'à `nombreMaxPoints` valeurs, jamais de gate "aucune" : l'énoncé donne
 * TOUJOURS au moins 2 points, une image manquante est donc toujours une réponse incomplète, jamais
 * une réponse "0 image" valide) — croix rouge `×` pour retirer une ligne (jamais un bouton texte
 * "Retirer", convention CLAUDE.md), copié-adapté de `EtapeListeEquationsExpLog.tsx` (6gen14) sans le
 * gate "aucune". Démarre à `nombreMaxPoints` lignes (PAS 1) : `nombreMaxPoints` est le compte EXACT
 * de points fournis (`exercice.autresPoints.length`, `App6gen40.tsx`), et la vérification
 * (`diagnostiquerImagesRotation`, `moteur6e/verificationTransformationsPlan.ts`) exige ce COMPTE
 * EXACT — démarrer à 1 laisserait l'élève valider une réponse structurellement incomplète sans être
 * informé qu'il lui manque des images (même piège déjà documenté et évité par
 * `EtapeListeEquationsComplexes.tsx`/6gen36 et `EtapeRacinesAffixesRacines.tsx`/6gen35). `App6gen40.
 * tsx` doit le rendre avec `key={phase}`.
 */
export function EtapeImagesTransformationsPlan({ consigneGenerale, blocDonnees, etatActuel, consigneEcran, nombreMaxPoints, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [lignes, setLignes] = useState<string[]>(() => Array.from({ length: Math.max(1, nombreMaxPoints) }, () => ""));
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = lignes.length > 0 && lignes.every((l) => l.trim() !== "");

  function ajouterLigne() {
    if (lignes.length >= nombreMaxPoints) return;
    setLignes((arr) => [...arr, ""]);
  }
  function retirerLigne(i: number) {
    setLignes((arr) => arr.filter((_, j) => j !== i));
  }
  function modifierLigne(i: number, valeur: string) {
    setLignes((arr) => arr.map((v, j) => (j === i ? valeur : v)));
  }
  function valider() {
    if (!complet) return;
    onValider(lignes);
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale}</p>
      <div className="equation-box">
        <div className="equation-box-donnees">
          {blocDonnees.map((frag, i) => (
            <Katex key={i} expression={frag} />
          ))}
        </div>
      </div>
      {etatActuel && (
        <div className="etat-actuel-box">
          <div className="etat-actuel-box-termes">
            {etatActuel.map((frag, i) => (
              <Katex key={i} expression={frag} />
            ))}
          </div>
        </div>
      )}
      <p className="prompt-text">{consigneEcran}</p>
      {lignes.map((ligne, i) => (
        <div key={i}>
          <ApercuExpressionLatex texte={ligne} />
          <div className="field-row">
            <input type="text" className={`text-input ${montrerErreurs ? "is-erronee" : ""}`} value={ligne} placeholder="ex : 3+2i" onChange={(e) => modifierLigne(i, e.target.value)} />
            {lignes.length > 1 && (
              <button type="button" className="btn liste-morceaux-retirer" aria-label={`Retirer l'image ${i + 1}`} onClick={() => retirerLigne(i)}>
                ×
              </button>
            )}
          </div>
        </div>
      ))}
      {lignes.length < nombreMaxPoints && (
        <button type="button" className="btn" onClick={ajouterLigne}>
          + Ajouter une image
        </button>
      )}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{aideNiveau1.texte}</p>
          {aideNiveau1.latex && <Katex expression={aideNiveau1.latex} block />}
          {niveauAide >= 2 && (
            <>
              <p>{aideNiveau2.texte}</p>
              {aideNiveau2.latex && <Katex expression={aideNiveau2.latex} block />}
            </>
          )}
        </div>
      )}
    </div>
  );
}

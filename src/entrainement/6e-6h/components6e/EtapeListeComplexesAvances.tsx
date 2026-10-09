import { useState } from "react";
import { Katex } from "../components/Katex";
import type { AideAvecLatex } from "../ui6e/formatComplexesAvances";
import { BoutonAide } from "./BoutonAide";

interface Props {
  consigneGenerale: string;
  blocDonnees: string[];
  etatActuel: string[] | null;
  consigneEcran: string;
  nombreMaxLignes: number;
  placeholder: string;
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
 * Écran GÉNÉRIQUE add-as-needed (jusqu'à `nombreMaxLignes` valeurs texte libres) pour `6gen42` —
 * mirroir `EtapeImagesTransformationsPlan.tsx` (6gen40), réutilisé par `bInterEcran3`,
 * `dRatioEcran1`, `dReellesEcran3`, `dModulesEcran2` (comptage EXACT attendu variable selon
 * l'exercice — 2, n, 2, 2 respectivement, `App6gen42.tsx`/`nombreMaxListe`). Démarre à
 * `nombreMaxLignes` lignes (PAS 1 — `diagnostiquerEnsembleComplexes`, `moteur6e/
 * verificationComplexesAvances.ts`, exige un COMPTE EXACT et renvoie silencieusement
 * `not_equivalent` sur toute longueur différente ; démarrer à 1 laisserait l'élève valider une
 * réponse structurellement incomplète sans jamais être informé qu'il lui manque des champs — même
 * piège déjà documenté et évité par `EtapeListeEquationsComplexes.tsx`/6gen36 et
 * `EtapeRacinesAffixesRacines.tsx`/6gen35 pour ce même chapitre). Croix rouge `×` pour retirer une
 * ligne, jamais un bouton texte "Retirer". `App6gen42.tsx` doit le rendre avec `key={phase}`.
 */
export function EtapeListeComplexesAvances({ consigneGenerale, blocDonnees, etatActuel, consigneEcran, nombreMaxLignes, placeholder, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [lignes, setLignes] = useState<string[]>(() => Array.from({ length: Math.max(1, nombreMaxLignes) }, () => ""));
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = lignes.length > 0 && lignes.every((l) => l.trim() !== "");

  function ajouterLigne() {
    if (lignes.length >= nombreMaxLignes) return;
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
            <Katex key={i} expression={frag} block />
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
        <div key={i} className="field-row">
          <input type="text" className={`text-input ${montrerErreurs ? "is-erronee" : ""}`} value={ligne} placeholder={placeholder} onChange={(e) => modifierLigne(i, e.target.value)} />
          {lignes.length > 1 && (
            <button type="button" className="btn liste-morceaux-retirer" aria-label={`Retirer la ligne ${i + 1}`} onClick={() => retirerLigne(i)}>
              ×
            </button>
          )}
        </div>
      ))}
      {lignes.length < nombreMaxLignes && (
        <button type="button" className="btn" onClick={ajouterLigne}>
          + Ajouter une valeur
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

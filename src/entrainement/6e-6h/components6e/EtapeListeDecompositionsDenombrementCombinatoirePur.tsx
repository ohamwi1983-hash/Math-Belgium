import { useState } from "react";
import { Katex } from "../components/Katex";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import { labelAjoutDecompositionD, labelListeDecompositionD, placeholderDecompositionD } from "../ui6e/formatDenombrementCombinatoirePur";
import { SEPARATEUR_LISTES_D } from "../moteur6e/verificationDenombrementCombinatoirePur";
import { BoutonAide } from "./BoutonAide";

interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

interface Props {
  consigneGenerale: string;
  blocDonnees: string[];
  etatActuel: string[] | null;
  consigneEcran: string;
  s1: number;
  s2: number;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (valeurs: string[]) => void;
  diagnostiquer: (valeurs: string[]) => StatutVerification;
}

const MAX_LIGNES = 8;

/** Une des 2 listes add-as-needed (S₁ ou S₂) — croix rouge `×` pour retirer une ligne (jamais un
 * bouton texte "Retirer", convention CLAUDE.md), toujours au moins 1 ligne (une somme cible admet
 * toujours au moins une décomposition valide). */
function ListeUneSomme({ sommeCible, lignes, onModifier, onAjouter, onRetirer, montrerErreurs }: { sommeCible: number; lignes: string[]; onModifier: (i: number, v: string) => void; onAjouter: () => void; onRetirer: (i: number) => void; montrerErreurs: boolean }) {
  return (
    <div className="field">
      <label className="field-label field-label-minuscule">{labelListeDecompositionD(sommeCible)}</label>
      {lignes.map((ligne, i) => (
        <div key={i} className="field-row">
          <input type="text" className={`text-input ${montrerErreurs ? "is-erronee" : ""}`} value={ligne} placeholder={placeholderDecompositionD()} onChange={(e) => onModifier(i, e.target.value)} />
          {lignes.length > 1 && (
            <button type="button" className="btn liste-morceaux-retirer" aria-label={`Retirer la décomposition ${i + 1} pour S=${sommeCible}`} onClick={() => onRetirer(i)}>
              ×
            </button>
          )}
        </div>
      ))}
      {lignes.length < MAX_LIGNES && (
        <button type="button" className="btn" onClick={onAjouter}>
          {labelAjoutDecompositionD()}
        </button>
      )}
    </div>
  );
}

/**
 * Écran DÉDIÉ à `dEcran1` (famille D, `6gen46`) — 2 listes add-as-needed SIMULTANÉES (une pour les
 * décompositions de `S₁`, une pour `S₂`), jamais gérées par le composant générique
 * `EtapeChampsDenombrementCombinatoirePur.tsx` (`champs: ChampDef[]` suppose un nombre de champs
 * FIXE par écran, incompatible avec une liste de taille variable — CLAUDE.md, "Interface de saisie
 * flexible : tout ensemble de taille variable → pattern add-as-needed"). Mirroir stylistique
 * `EtapeListeEquationsExpLog.tsx` (6gen14, croix rouge + gate "aucune" — ici pas de gate "aucune" :
 * une somme cible du domaine [3,18] avec n=3 dés à 6 faces admet TOUJOURS au moins une
 * décomposition). Le tableau `string[]` plat transmis à `onValider`/`diagnostiquer` encode les 2
 * listes séparées par le marqueur `SEPARATEUR_LISTES_D` (`moteur6e/
 * verificationDenombrementCombinatoirePur.ts`) — convention imposée par le moteur de session
 * générique (`soumettreReponseEcran(etat, valeurs: string[])`, format uniforme quel que soit
 * l'écran). `App6gen46.tsx` doit le rendre avec `key={phase}`.
 */
export function EtapeListeDecompositionsDenombrementCombinatoirePur({ consigneGenerale, blocDonnees, etatActuel, consigneEcran, s1, s2, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [lignesS1, setLignesS1] = useState<string[]>([""]);
  const [lignesS2, setLignesS2] = useState<string[]>([""]);
  const montrerErreurs = tentativesUtilisees > 0;

  function valeursCourantes(): string[] {
    return [...lignesS1, SEPARATEUR_LISTES_D, ...lignesS2];
  }

  const dernierStatut = montrerErreurs ? diagnostiquer(valeursCourantes()) : null;
  const toutRempli = lignesS1.every((v) => v.trim() !== "") && lignesS2.every((v) => v.trim() !== "");

  function valider() {
    if (!toutRempli) return;
    onValider(valeursCourantes());
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
      <div className="contenu-conditionnel">
        <ListeUneSomme
          sommeCible={s1}
          lignes={lignesS1}
          montrerErreurs={montrerErreurs}
          onModifier={(i, v) => setLignesS1((arr) => arr.map((x, j) => (j === i ? v : x)))}
          onAjouter={() => setLignesS1((arr) => (arr.length >= MAX_LIGNES ? arr : [...arr, ""]))}
          onRetirer={(i) => setLignesS1((arr) => arr.filter((_, j) => j !== i))}
        />
        <ListeUneSomme
          sommeCible={s2}
          lignes={lignesS2}
          montrerErreurs={montrerErreurs}
          onModifier={(i, v) => setLignesS2((arr) => arr.map((x, j) => (j === i ? v : x)))}
          onAjouter={() => setLignesS2((arr) => (arr.length >= MAX_LIGNES ? arr : [...arr, ""]))}
          onRetirer={(i) => setLignesS2((arr) => arr.filter((_, j) => j !== i))}
        />
      </div>
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!toutRempli} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
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

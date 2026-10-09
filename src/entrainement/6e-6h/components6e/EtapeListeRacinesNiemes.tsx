import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import type { AideAvecLatex } from "../ui6e/formatRacinesNiemes";
import { BoutonAide } from "./BoutonAide";

interface Ligne {
  re: string;
  im: string;
}

interface Props {
  consigneGenerale: string;
  blocDonnees: string[];
  etatActuel: string[] | null;
  consigneEcran: string;
  /** Nombre de racines attendues (n de l'exercice) — détermine le nombre de lignes de départ. */
  nAttendu: number;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  /** Valeurs APLATIES `[re0,im0,re1,im1,...]` — voir en-tête `moteur6e/verificationRacinesNiemes.ts`
   * pour la raison de ce contrat (garder la signature standard `string[]` du reste du chantier). */
  onValider: (valeursAplaties: string[]) => void;
  diagnostiquer: (valeursAplaties: string[]) => StatutVerification;
}

/**
 * Écran add-as-needed pour `6gen39` — famille A écran 3, famille C écrans 2/3 — chaque ligne est une
 * racine (2 champs : partie réelle, partie imaginaire — voir en-tête `moteur6e/
 * verificationRacinesNiemes.ts` pour la raison de cette paire plutôt qu'un seul champ complexe
 * "a+bi"). Démarre à `nAttendu` lignes (PAS 1 — le nombre de racines EST l'énoncé, aucune raison de
 * suggérer qu'une seule ligne pourrait suffire), croix rouge `×` pour retirer une ligne (jamais un
 * bouton texte "Retirer" — convention CLAUDE.md), jusqu'à `nAttendu+2` lignes (marge de correction,
 * mirroir `EtapeRacinesAffixesRacines.tsx`, 6gen35). `App6gen39.tsx` doit le rendre avec
 * `key={phase}`.
 */
export function EtapeListeRacinesNiemes({ consigneGenerale, blocDonnees, etatActuel, consigneEcran, nAttendu, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [lignes, setLignes] = useState<Ligne[]>(() => Array.from({ length: nAttendu }, () => ({ re: "", im: "" })));
  const montrerErreurs = tentativesUtilisees > 0;
  const aplati = lignes.flatMap((l) => [l.re, l.im]);
  const dernierStatut = montrerErreurs ? diagnostiquer(aplati) : null;
  const complet = lignes.length > 0 && lignes.every((l) => l.re.trim() !== "" && l.im.trim() !== "");
  const maxLignes = nAttendu + 2;

  function ajouterLigne() {
    if (lignes.length >= maxLignes) return;
    setLignes((arr) => [...arr, { re: "", im: "" }]);
  }
  function retirerLigne(i: number) {
    setLignes((arr) => arr.filter((_, j) => j !== i));
  }
  function modifierLigne(i: number, champ: "re" | "im", valeur: string) {
    setLignes((arr) => arr.map((l, j) => (j === i ? { ...l, [champ]: valeur } : l)));
  }
  function valider() {
    if (!complet) return;
    onValider(aplati);
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
        {lignes.map((ligne, i) => (
          <div key={i}>
            <ApercuExpressionLatex texte={ligne.re} label={`Partie réelle ${i + 1} =`} />
            <ApercuExpressionLatex texte={ligne.im} label={`Partie imaginaire ${i + 1} =`} />
            <div className="field-row field-row-wrap">
              <div className="field field-inline">
                <label className="field-label field-label-minuscule">Partie réelle {i + 1} =</label>
                <input type="text" className={`text-input ${montrerErreurs ? "is-erronee" : ""}`} value={ligne.re} placeholder="ex : sqrt(2)" onChange={(e) => modifierLigne(i, "re", e.target.value)} />
              </div>
              <div className="field field-inline">
                <label className="field-label field-label-minuscule">Partie imaginaire {i + 1} =</label>
                <input type="text" className={`text-input ${montrerErreurs ? "is-erronee" : ""}`} value={ligne.im} placeholder="ex : -sqrt(2)" onChange={(e) => modifierLigne(i, "im", e.target.value)} />
              </div>
              {lignes.length > 1 && (
                <button type="button" className="btn liste-morceaux-retirer" aria-label={`Retirer la racine ${i + 1}`} onClick={() => retirerLigne(i)}>
                  ×
                </button>
              )}
            </div>
          </div>
        ))}
        {lignes.length < maxLignes && (
          <button type="button" className="btn" onClick={ajouterLigne}>
            + Ajouter une racine
          </button>
        )}
      </div>
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

import { Fragment, useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import type { AideAvecLatex, ChampDef } from "../ui6e/formatTangentesConique";
import { BoutonAide } from "./BoutonAide";

interface Props {
  consigneGenerale: string;
  blocDonnees: string[];
  etatActuel: string[] | null;
  consigneEcran: string;
  champs: ChampDef[];
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

const MAX_LIGNES_LISTE = 4;

/** Une ligne d'un champ `type:"liste"` (add-as-needed) — `sousChamps.length` valeurs (toujours 3
 * dans ce générateur : équation + x + y du point de tangence), croix rouge `×` pour retirer (jamais
 * un bouton texte "Retirer", CLAUDE.md). */
function ChampListe({ champ, valeur, onChange, montrerErreurs }: { champ: ChampDef; valeur: string; onChange: (v: string) => void; montrerErreurs: boolean }) {
  const sousChamps = champ.sousChamps ?? [];
  const [lignes, setLignes] = useState<string[][]>(() => {
    try {
      const parsed = JSON.parse(valeur || "[]") as string[][];
      return parsed.length > 0 ? parsed : [sousChamps.map(() => "")];
    } catch {
      return [sousChamps.map(() => "")];
    }
  });

  function pousser(nouvellesLignes: string[][]) {
    setLignes(nouvellesLignes);
    onChange(JSON.stringify(nouvellesLignes));
  }

  return (
    <div className="field">
      <label className="field-label">{champ.label}</label>
      {lignes.map((ligne, i) => (
        <div key={i} className="contenu-conditionnel">
          <div className="field-row field-row-wrap">
            {sousChamps.map((sc, j) => (
              <Fragment key={j}>
                <ApercuExpressionLatex texte={ligne[j] ?? ""} />
                <div className="field">
                  <label className="field-label field-label-minuscule">{sc.label}</label>
                  <input
                    type="text"
                    className={`text-input ${montrerErreurs ? "is-erronee" : ""}`}
                    value={ligne[j] ?? ""}
                    placeholder={sc.placeholder}
                    onChange={(e) => pousser(lignes.map((l, li) => (li === i ? l.map((v, vj) => (vj === j ? e.target.value : v)) : l)))}
                  />
                </div>
              </Fragment>
            ))}
            {lignes.length > 1 && (
              <button type="button" className="btn liste-morceaux-retirer" aria-label={`Retirer la ligne ${i + 1}`} onClick={() => pousser(lignes.filter((_, li) => li !== i))}>
                ×
              </button>
            )}
          </div>
        </div>
      ))}
      {lignes.length < MAX_LIGNES_LISTE && (
        <button type="button" className="btn" onClick={() => pousser([...lignes, sousChamps.map(() => "")])}>
          + Ajouter une ligne
        </button>
      )}
    </div>
  );
}

/**
 * Écran GÉNÉRIQUE à N champs (texte libre, choix, OU liste add-as-needed) pour `6gen62` — mirroir
 * `EtapeChampsEquationConiqueCaracteristiques.tsx` (6gen59), étendu avec `type:"liste"` pour les
 * écrans `bEcran4`/`cEcran4` (aucun composant dédié séparé — voir en-tête
 * `ui6e/formatTangentesConique.ts`). Chaque champ est TOUJOURS rendu dans un `.field` empilé (label
 * AU-DESSUS du champ), **JAMAIS `.field-inline`** (CLAUDE.md — piège label descriptif). `champs:
 * ChampDef[]` (`ui6e/formatTangentesConique.ts`) pilote entièrement le rendu — AUCUN JSX par
 * famille/écran dans ce composant. Structure d'écran imposée par CLAUDE.md (consigne générale →
 * bloc données → état actuel → bloc de travail) conservée à l'identique. À rendre avec `key={phase}`
 * par `App6gen62.tsx` parent.
 */
export function EtapeChampsTangentesConique({ consigneGenerale, blocDonnees, etatActuel, consigneEcran, champs, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [valeurs, setValeurs] = useState<string[]>(() => champs.map((c) => (c.type === "liste" ? JSON.stringify([(c.sousChamps ?? []).map(() => "")]) : "")));
  const montrerErreurs = tentativesUtilisees > 0;
  const dernierStatut = montrerErreurs ? diagnostiquer(valeurs) : null;

  function toutRempliPourChamp(champ: ChampDef, valeur: string): boolean {
    if (champ.type !== "liste") return valeur.trim() !== "";
    try {
      const lignes = JSON.parse(valeur || "[]") as string[][];
      return lignes.length > 0 && lignes.every((l) => l.every((v) => v.trim() !== ""));
    } catch {
      return false;
    }
  }

  const toutRempli = champs.every((c, i) => toutRempliPourChamp(c, valeurs[i] ?? ""));

  function valider() {
    if (!toutRempli) return;
    onValider(valeurs);
  }

  function changer(index: number, valeur: string) {
    setValeurs((prev) => prev.map((v, i) => (i === index ? valeur : v)));
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
      {champs.map((champ, i) => {
        if (champ.type === "liste") return <ChampListe key={i} champ={champ} valeur={valeurs[i] ?? ""} onChange={(v) => changer(i, v)} montrerErreurs={montrerErreurs} />;
        if (champ.type === "choix")
          return (
            <div className="field" key={i}>
              <label className={`field-label ${champ.minuscule ? "field-label-minuscule" : ""}`}>{champ.label}</label>
              {/* Grille 2 colonnes (`.options-grid-compact`, jamais `.field-row-wrap`) — convention
               * transversale "boutons de choix toujours 2 colonnes, jamais empilés verticalement"
               * (CLAUDE.md). */}
              <div className="options-grid-compact">
                {(champ.options ?? []).map((option) => (
                  <button key={option.valeur} type="button" className={`btn ${valeurs[i] === option.valeur ? "toggle-active" : ""} ${montrerErreurs && valeurs[i] === option.valeur ? "is-erronee" : ""}`} onClick={() => changer(i, option.valeur)}>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          );
        return (
          <Fragment key={i}>
            <ApercuExpressionLatex texte={valeurs[i]} />
            <div className="field">
              <label className={`field-label ${champ.minuscule ? "field-label-minuscule" : ""}`}>{champ.label}</label>
              <input type="text" className={`text-input ${montrerErreurs ? "is-erronee" : ""}`} value={valeurs[i]} placeholder={champ.placeholder} onChange={(e) => changer(i, e.target.value)} />
            </div>
          </Fragment>
        );
      })}
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
        <div className="aide-5e contenu-conditionnel">
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

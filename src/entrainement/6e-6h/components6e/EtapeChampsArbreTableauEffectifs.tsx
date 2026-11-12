import { useState } from "react";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import type { AideAvecLatex, ArbreAffichage, ChampDef, FragmentConsigne, TableauEffectifsAffichage } from "../ui6e/formatArbreTableauEffectifs";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";
import { ArbreEffectifs, TableauEffectifs } from "./FiguresArbreTableauEffectifs";

interface Props {
  consigneGenerale: FragmentConsigne[];
  /** Figures de l'instance (`arbreEcran`/`tableauEcran`) : celle que l'écran fait compléter est
   * rendue dans la zone de travail (`travail`), l'autre (complète) dans l'énoncé. */
  arbre: ArbreAffichage | null;
  tableau: TableauEffectifsAffichage | null;
  travail: "arbre" | "tableau" | null;
  consigneEcran: FragmentConsigne[];
  champs: ChampDef[];
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (valeurs: string[]) => void;
  /** Diagnostic champ par champ — figé AU MOMENT de la validation (jamais recalculé pendant la
   * frappe : sinon le cadre rouge qui disparaît trahirait la bonne réponse). */
  diagnostiquerChamps: (valeurs: string[]) => StatutVerification[];
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran à champs de `6gen74` (arbre, tableau, probabilités conditionnelles). Même structure que
 * `EtapeChampsIndependanceBayes.tsx` (consigne générale → données → travail → aide → Valider). À
 * l'écran « tableau », les champs sont DANS les cases du tableau. `App6gen74.tsx` le rend avec une
 * `key` qui change à chaque écran et à chaque nouvel exercice (champs remis à vide).
 */
export function EtapeChampsArbreTableauEffectifs({
  consigneGenerale,
  arbre,
  tableau,
  travail,
  consigneEcran,
  champs,
  aideNiveau1,
  aideNiveau2,
  tentativesUtilisees,
  tentativesMax,
  niveauAide,
  niveauAideMax,
  onActiverAide,
  onValider,
  diagnostiquerChamps,
  validation,
}: Props) {
  const [valeurs, setValeurs] = useState<string[]>(() => champs.map(() => ""));
  const [statutsSoumis, setStatutsSoumis] = useState<StatutVerification[] | null>(null);
  const montrerErreurs = tentativesUtilisees > 0 && statutsSoumis !== null;
  const erreurs = champs.map((_, i) => montrerErreurs && statutsSoumis[i] !== "correct");
  const dernierStatut: StatutVerification | null = montrerErreurs ? (statutsSoumis.includes("parse_error") ? "parse_error" : "not_equivalent") : null;
  const toutRempli = valeurs.every((v) => v.trim() !== "");
  const gele = !!validation;

  function valider() {
    if (!toutRempli) return;
    setStatutsSoumis(diagnostiquerChamps(valeurs));
    onValider(valeurs);
  }

  function changer(index: number, valeur: string) {
    setValeurs((prev) => prev.map((v, i) => (i === index ? valeur : v)));
  }

  const arbreDonnee = arbre && travail !== "arbre" ? arbre : null;
  const tableauDonnee = tableau && travail !== "tableau" ? tableau : null;

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={<RenduFragments fragments={consigneGenerale} />}
        blocDonnees={
          arbreDonnee || tableauDonnee ? (
            <>
              {arbreDonnee && <ArbreEffectifs arbre={arbreDonnee} />}
              {tableauDonnee && <TableauEffectifs tableau={tableauDonnee} />}
            </>
          ) : null
        }
      />
      <p className="prompt-text">
        <RenduFragments fragments={consigneEcran} />
      </p>
      {travail === "arbre" && arbre && <ArbreEffectifs arbre={arbre} />}
      {travail === "tableau" && tableau ? (
        <TableauEffectifs
          tableau={tableau}
          saisie={{ valeurs, erreurs, placeholder: "", libelles: champs.map((c) => c.label), gele, onChange: changer }}
        />
      ) : (
        <div className={`field-row ${champs.length > 3 ? "field-row-wrap" : ""}`}>
          {champs.map((champ, i) => (
            <div className={champs.length > 1 ? "field field-inline" : "field"} key={i}>
              <label className="field-label field-label-minuscule">
                <Katex expression={champ.labelLatex} />
              </label>
              <input
                type="text"
                inputMode="decimal"
                aria-label={champ.label}
                className={`text-input ${erreurs[i] ? "is-erronee" : ""}`}
                value={valeurs[i]}
                placeholder={champ.placeholder}
                disabled={gele}
                onChange={(e) => changer(i, e.target.value)}
              />
            </div>
          ))}
        </div>
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
      {!validation && (
        <>
          <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
          <button type="button" className="btn btn-primary" disabled={!toutRempli} onClick={valider}>
            Valider
          </button>
          {montrerErreurs && (
            <p className="alert-error" role="alert">
              {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
            </p>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

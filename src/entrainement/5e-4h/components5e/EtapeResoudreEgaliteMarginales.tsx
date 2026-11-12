import { useState } from "react";
import type { ExerciceContexteEconomiqueB } from "../core5e/contexteEconomique.types";
import type { ReponseEgaliteMarginales } from "../moteur5e/verificationContexteEconomique";
import { consigneEcranRiche, consigneGenerale, formatTermesDonneesLatex, questionFinale, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatContexteEconomique";
import { Katex } from "../components/Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { CalculatriceScientifique } from "./CalculatriceScientifique";
import type { StatutVerification } from "../moteur/statutVerification";
import { EnTeteExercice } from "./EnTeteExercice";
import { TexteRiche5e } from "./TexteRiche5e";

interface Props {
  exercice: ExerciceContexteEconomiqueB;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseEgaliteMarginales) => void;
  diagnostiquerRacine: (texte: string) => StatutVerification;
  diagnostiquerRetenue: (texte: string) => StatutVerification;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran`. */
  validation?: ValidationEtapeProps | null;
}

/** Écran "resoudreEgaliteMarginales" — 2 champs numériques (les 2 solutions de C'_T(x) = R'_T(x),
 * ordre indifférent), PUIS la quantité retenue, SAISIE (audit 5e ch. 5 : le bouton « solution
 * positive / négative » avait toujours la même bonne réponse). Une saisie illisible n'est pas
 * décomptée. */
export function EtapeResoudreEgaliteMarginales({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquerRacine, diagnostiquerRetenue, validation }: Props) {
  const [racine1, setRacine1] = useState("");
  const [racine2, setRacine2] = useState("");
  const [retenue, setRetenue] = useState("");
  const [ecritureIllisible, setEcritureIllisible] = useState(false);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = racine1.trim() !== "" && racine2.trim() !== "" && retenue.trim() !== "";
  const statut1 = montrerErreurs ? diagnostiquerRacine(racine1) : null;
  const statut2 = montrerErreurs ? diagnostiquerRacine(racine2) : null;
  const statut3 = montrerErreurs ? diagnostiquerRetenue(retenue) : null;

  function valider() {
    if (!complet) return;
    if ([racine1, racine2].some((t) => diagnostiquerRacine(t) === "parse_error") || diagnostiquerRetenue(retenue) === "parse_error") {
      setEcritureIllisible(true);
      return;
    }
    setEcritureIllisible(false);
    onValider({ racines: [racine1, racine2], retenue });
  }

  const champ = (label: string, valeur: string, modifier: (v: string) => void, statut: StatutVerification | null, placeholder: string) => (
    <div className="field field-inline">
      <label className="field-label field-label-minuscule">
        <Katex expression={label} />
      </label>
      <input type="text" className={`text-input${statut && statut !== "correct" ? " is-erronee" : ""}`} value={valeur} onChange={(e) => modifier(e.target.value)} placeholder={placeholder} disabled={Boolean(validation)} />
    </div>
  );

  const aide1 = texteAideNiveau1("resoudreEgaliteMarginales", exercice);
  const aide2 = texteAideNiveau2(exercice, "resoudreEgaliteMarginales");

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={<TexteRiche5e texte={consigneGenerale(exercice)} />}
        blocDonnees={
          <div className="equation-box equation-box-donnees">
            {formatTermesDonneesLatex(exercice).map((frag, i) => (
              <Katex key={i} expression={frag} />
            ))}
          </div>
        }
      />
      <p className="question-finale">
        <TexteRiche5e texte={questionFinale(exercice)} />
      </p>
      <p className="prompt-text">
        <TexteRiche5e texte={consigneEcranRiche(exercice, "resoudreEgaliteMarginales")} />
      </p>
      {champ("x_1=", racine1, setRacine1, statut1, "ex : 0,5")}
      {champ("x_2=", racine2, setRacine2, statut2, "ex : −0,5")}
      <p className="prompt-text">Quelle solution correspond à une quantité produite possible ?</p>
      {champ("x_{\\text{retenue}}=", retenue, setRetenue, statut3, "ex : 0,5")}

      <CalculatriceScientifique />
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{aide1.texte}</p>
          {aide1.latex && <Katex expression={aide1.latex} block />}
          {niveauAide >= 2 && (
            <>
              <p>{aide2.texte}</p>
              {aide2.latex && <Katex expression={aide2.latex} block />}
            </>
          )}
        </div>
      )}
      {!validation && (
        <>
          <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
            Valider
          </button>
          {ecritureIllisible && (
            <p className="alert-error" role="alert">
              Écriture non reconnue : vérifie ta saisie (cette tentative n'est pas décomptée).
            </p>
          )}
          {!ecritureIllisible && montrerErreurs && (
            <p className="alert-error" role="alert">
              Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
            </p>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

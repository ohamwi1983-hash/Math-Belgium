import type { ReactNode } from "react";
import type { ExerciceSinusoidePoints, PointPlace } from "./moteur5e/modeleSinusoidePoints";
import { cadre, colonneDe, pointsPeriode, pointsReport } from "./moteur5e/modeleSinusoidePoints";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceSinusoidePoints } from "./generateurs5e/sinusoidePoints";
import { correctionDetailleeSinusoidePoints } from "./generateurs5e/sinusoidePoints/corrigeDetaille";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { diagnostiquerParametres, diagnostiquerPeriode, diagnostiquerReport } from "./moteur5e/verificationSinusoidePoints";
import { TENTATIVES_CHAMP } from "./moteur5e/sessionEcransTrig";
import { CONSIGNE_GENERALE, TITRES_ECRANS, aideSaisie, aidesEcran, consignesEcrans, enonceExercice, reponsesEcrans, xLatex } from "./ui5e/formatSinusoidePoints";
import { figureSinusoidePoints, geometrie, type PointFigure } from "./ui5e/figureSinusoidePoints";
import { CoqueTrig5e } from "./components5e/CoqueTrig5e";
import { EtapeChampsTrig5e, SaisieTrig } from "./components5e/EtapesTrig5e";
import { EtapePlacerPointsTrig5e } from "./components5e/EtapePlacerPointsTrig5e";
import { RenduFragments } from "../4e/components/RenduFragments";
import { Katex } from "./components/Katex";
import { xColonne } from "./moteur5e/modeleSinusoidePoints";

/**
 * 5gen52 — « Construire une sinusoïde point par point » (5e, chapitre 2, section `parametres`,
 * processus 2 APPLIQUER) : la méthode de construction du § 4, enseignée sans générateur jusqu'ici.
 * Trois écrans :
 * 1. A (avec son signe), b, T et Φ (quatre champs, 3 tentatives ; Φ juste à une période près) ;
 * 2. les cinq points d'une période à partir de Φ, placés en touchant le quadrillage (3 tentatives) ;
 * 3. les quatre points clés qui manquent sur [Φ − T/2 ; Φ + 3T/2], par périodicité (3 tentatives).
 * Quadrillage au pas T/4 ou T/8, chaque colonne étiquetée en multiple exact de π : tout point clé
 * tombe sur une intersection. `?code=` : mêmes fonctions que l'adaptateur. Aucun point affiché.
 */

function exerciceInitial(): ExerciceSinusoidePoints {
  const code = lireCodeDepuisUrl();
  if (!code) return genererExerciceSinusoidePoints();
  return genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceSinusoidePoints, construireAvecVariante);
}

function paragraphe(fragments: Parameters<typeof RenduFragments>[0]["fragments"]): ReactNode {
  return (
    <p style={{ margin: 0 }}>
      <RenduFragments fragments={fragments} />
    </p>
  );
}

function figure(e: ExerciceSinusoidePoints, courbe: "aucune" | "periode" | "complete", points: PointFigure[]): ReactNode {
  return (
    <div
      style={{ width: "100%", maxWidth: 520, margin: "10px auto" }}
      dangerouslySetInnerHTML={{ __html: figureSinusoidePoints(e, { courbe, points }).replace(/width="\d+" height="\d+"/, 'style="width:100%;height:auto;display:block"') }}
    />
  );
}

function versPlaces(e: ExerciceSinusoidePoints, pts: { x: import("./moteur5e/trigExact").Rat; y: number }[]): PointPlace[] {
  const c = cadre(e);
  return pts.map((p) => ({ i: colonneDe(c, p.x), y: p.y }));
}

function pointsTexte(e: ExerciceSinusoidePoints, pts: PointPlace[]): ReactNode {
  const c = cadre(e);
  const tri = [...pts].sort((a, b) => a.i - b.i);
  return (
    <p style={{ margin: 0 }}>
      <Katex expression={tri.map((p) => `\\left(${xLatex(e, xColonne(c, p.i))}\\,;\\,${p.y}\\right)`).join("\\;;\\;")} />
    </p>
  );
}

export function App5gen52() {
  return (
    <CoqueTrig5e<ExerciceSinusoidePoints>
      titre="Construire une sinusoïde point par point"
      sousTitre="Chapitre 2 — Trigonométrie"
      idDebug="__debug5gen52"
      catalogue={CATALOGUE_VARIANTES}
      exerciceInitial={exerciceInitial}
      genererLibre={genererExerciceSinusoidePoints}
      genererVariante={construireAvecVariante}
      nombreEcrans={() => 3}
      titreEcran={(_, i) => TITRES_ECRANS[i]!}
      tentativesMax={() => TENTATIVES_CHAMP}
      reponseAttendue={(e, i) => paragraphe(reponsesEcrans(e)[i]!)}
      figureApres={(e, i) =>
        i === 0 ? undefined : figure(e, i === 1 ? "periode" : "complete", versPlaces(e, i === 1 ? pointsPeriode(e) : [...pointsPeriode(e), ...pointsReport(e)]).map((p) => ({ ...p, style: "juste" as const })))
      }
      corrige={correctionDetailleeSinusoidePoints}
      consigneGenerale={() => CONSIGNE_GENERALE}
      blocDonnees={(e) => (
        <p style={{ margin: "6px 0" }}>
          <RenduFragments fragments={enonceExercice(e)} />
        </p>
      )}
      rendreEcran={({ e, ecran, niveauAide, onActiverAide, conclure, validation, tentativesUtilisees, tentativesMax }) => {
        const communs = { aides: aidesEcran(e, ecran), niveauAide, onActiverAide, validation, tentativesUtilisees, tentativesMax };
        if (ecran === 0)
          return (
            <EtapeChampsTrig5e
              {...communs}
              consigne={consignesEcrans(e)[0]!}
              champs={[
                { prefixe: "A =", nom: "A" },
                { prefixe: "b =", nom: "b" },
                { prefixe: "T =", nom: "T" },
                { prefixe: "\\Phi =", nom: "Φ" },
              ]}
              raccourcis={[{ libelle: "π", mode: "ajoute", texte: "π" }]}
              aideSaisie={aideSaisie()}
              diagnostiquer={(v) => diagnostiquerParametres(e, v)}
              onValider={(ok, v) =>
                conclure(
                  ok,
                  <p style={{ margin: 0 }}>
                    A = <SaisieTrig texte={v[0]!} /> ; b = <SaisieTrig texte={v[1]!} /> ; T = <SaisieTrig texte={v[2]!} /> ; Φ = <SaisieTrig texte={v[3]!} />
                  </p>,
                )
              }
              idChamp="sinusoide-points-A"
            />
          );
        const g = geometrie(e);
        const fixes = ecran === 2 ? versPlaces(e, pointsPeriode(e)) : [];
        return (
          <EtapePlacerPointsTrig5e
            {...communs}
            consigne={consignesEcrans(e)[ecran]!}
            nombre={ecran === 1 ? 5 : 4}
            geometrie={g}
            fixes={fixes}
            dessiner={(points) => figureSinusoidePoints(e, { courbe: "aucune", points })}
            diagnostiquer={(pts) => (ecran === 1 ? diagnostiquerPeriode(e, pts) : diagnostiquerReport(e, pts))}
            onValider={(ok, pts) => conclure(ok, pointsTexte(e, pts))}
          />
        );
      }}
    />
  );
}

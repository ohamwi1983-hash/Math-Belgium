import type { ReactNode } from "react";
import type { ExerciceLoiNormale } from "./core6e/loiNormale.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLoiNormale } from "./generateurs6e/loiNormale";
import { arrondir, bornesZ } from "./generateurs6e/loiNormale/calculs";
import type { PhaseLoiNormale } from "./moteur6e/typesLoiNormale";
import { DEFINITION_6GEN51, attentesLoiNormale } from "./moteur6e/verificationLoiNormale";
import { FORMAT_6GEN51, xTexte, zTexte } from "./ui6e/formatLoiNormale";
import { AppCombinatoire } from "./components6e/AppCombinatoire";
import type { ConfigAppCombinatoire } from "./components6e/AppCombinatoire";
import { CourbeGauss } from "./components6e/CourbeGauss";
import type { EtiquetteGauss } from "./components6e/CourbeGauss";
import { TablePhi } from "../components/TablePhi";

/**
 * `6gen51` — Loi normale (6e ch. 8, § 6, processus 2 APPLIQUER), refondu (audit, lot C) : table de Φ
 * CONSULTABLE sous la consigne de chaque écran (A à D), courbe de Gauss avec l'aire cherchée hachurée
 * (borne inconnue nommée t, z ou a), choix fermés seuls sur leur écran (G17). Socle commun du ch. 7.
 */
function figure(e: ExerciceLoiNormale): ReactNode {
  const avecZero = (l: EtiquetteGauss[], texte = "0") => (l.every((x) => Math.abs(x.z) > 0.45) ? [...l, { z: 0, texte }] : l);
  switch (e.famille) {
    case "A":
    case "B": {
      const { z1, z2 } = bornesZ(e);
      const aire = e.sousType === "inferieur" ? { de: null, a: z1 } : e.sousType === "superieur" ? { de: z1, a: null } : { de: z1, a: z2 };
      const txt = (z: number, x: number) => (e.famille === "A" ? zTexte(z) : xTexte(x));
      const lab: EtiquetteGauss[] = [{ z: z1, texte: txt(z1, e.famille === "B" ? e.x1 : 0) }];
      if (z2 !== null) lab.push({ z: z2, texte: txt(z2, e.famille === "B" ? (e.x2 as number) : 0) });
      return <CourbeGauss aires={[aire]} etiquettes={avecZero(lab, e.famille === "A" ? "0" : xTexte(e.mu))} axe={e.famille === "A" ? "z" : e.contexte.unite} description="Courbe de Gauss : l'aire hachurée est la probabilité cherchée." />;
    }
    case "C":
    case "D": {
      const l = e.famille === "C" ? "t" : "a";
      const z = e.famille === "C" ? e.t : e.z;
      const centre = e.famille === "C" ? "0" : xTexte(e.mu);
      const aires = e.sousType === "inferieur" ? [{ de: null, a: z }] : e.sousType === "superieur" ? [{ de: z, a: null }] : e.sousType === "centre" ? [{ de: -z, a: z }] : [{ de: 0, a: z }];
      const lab: EtiquetteGauss[] = [{ z, texte: l }];
      if (e.sousType === "centre") lab.push({ z: -z, texte: e.famille === "C" ? "−t" : "" });
      return <CourbeGauss aires={aires} etiquettes={avecZero(lab, centre)} axe={e.famille === "C" ? "z" : e.contexte.unite} description="Courbe de Gauss : l'aire hachurée correspond à la probabilité donnée ; la borne cherchée est nommée." />;
    }
    case "E": {
      const k = e.k;
      const aires = !e.unCote ? [{ de: null, a: -k }, { de: k, a: null }] : e.coteDemande === "superieur" ? [{ de: k, a: null }] : [{ de: null, a: -k }];
      const lab: EtiquetteGauss[] = [
        { z: -k, texte: xTexte(arrondir(e.mu - k * e.sigma, 2)) },
        { z: 0, texte: xTexte(e.mu) },
        { z: k, texte: xTexte(arrondir(e.mu + k * e.sigma, 2)) },
      ];
      return <CourbeGauss aires={aires} etiquettes={lab} axe={e.contexte.unite} description="Courbe de Gauss : l'aire hachurée est la proportion cherchée." />;
    }
  }
}

const CONFIG: ConfigAppCombinatoire<ExerciceLoiNormale, PhaseLoiNormale> = {
  id: "6gen51",
  titre: "Loi normale",
  sousTitre: "Chapitre 8 — Variables aléatoires",
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceLoiNormale,
  genererVariante: construireAvecVarianteId,
  definition: DEFINITION_6GEN51,
  attentes: attentesLoiNormale,
  format: FORMAT_6GEN51,
  complement: (e) => (
    <>
      {figure(e)}
      {e.famille !== "E" && <TablePhi />}
    </>
  ),
};

export function App6gen51() {
  return <AppCombinatoire config={CONFIG} />;
}

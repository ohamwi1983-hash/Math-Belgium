-- =================================================================================================
-- Math-Belgium — répartition Connaître / Appliquer / Transférer mémorisée dans le profil
-- =================================================================================================
--
-- À exécuter APRÈS 0001_comptes.sql (ne dépend pas de 0002–0004), dans l'éditeur SQL du projet
-- Supabase (SQL Editor → New query → coller TOUT ce fichier → Run). Idempotent : le relancer ne
-- casse rien et ne perd ni ne modifie aucune donnée (colonne `add column if not exists`, fonction
-- `create or replace`, contrainte ajoutée seulement si elle est absente, droits redonnés à
-- l'identique). Aucune clé secrète, aucun jeton : rien à remplacer.
--
-- Résultat attendu : « Success. No rows returned ». Sur la page de conception (feuilles
-- d'exercices, évaluations, examens), carte « Préparer l'évaluation » → Modifier → « Enregistrer
-- comme ma répartition » mémorise alors la répartition dans le compte (recharger la page).
-- Tant que ce fichier n'est pas exécuté, le réglage marche pour la session seulement et le site
-- affiche « Mémorisation pas encore activée » ; rien d'autre ne change.
--
-- Contenu :
--   profils.repartition   jsonb, NULL = répartition par défaut du site (25 / 50 / 25) ;
--                          sinon {"connaitre": 30, "appliquer": 45, "transferer": 25} : exactement
--                          ces trois clés, entiers 0 … 100, somme 100 (contrainte
--                          `profils_repartition_valide`).
--   Droits : le professeur peut modifier `nom_affiche` (0001) et maintenant `repartition` — de SON
--            profil, compte actif (politique `profils_modification` de 0001, inchangée). Aucune
--            autre colonne (est_admin, actif…) ne devient modifiable ; `anon` n'a toujours aucun
--            droit. Lecture : comme le reste du profil (le sien ; l'administrateur lit les profils).
--   RLS : inchangé. Suppression du compte (`supprimer_mon_compte`) : inchangée, la ligne part.
-- =================================================================================================

alter table public.profils add column if not exists repartition jsonb;
comment on column public.profils.repartition is
  'Répartition « Préparer l''évaluation » du professeur : {"connaitre", "appliquer", "transferer"} en pourcentages entiers (somme 100). NULL = défaut du site.';

-- Validité (pure, sans accès aux tables) : NULL accepté (= défaut) ; sinon un objet à exactement
-- trois clés `connaitre`, `appliquer`, `transferer`, chacune un nombre ENTIER écrit sans signe ni
-- décimale (25 ; pas 25.0, -5 ni "25"), entre 0 et 100, et dont la somme vaut 100. Le `case`
-- évite toute conversion d'une valeur qui ne serait pas un nombre.
create or replace function public.repartition_valide(j jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case
           when j is null then true
           when jsonb_typeof(j) <> 'object' then false
           when (select count(*) from jsonb_object_keys(j)) <> 3 then false
           when not (j ? 'connaitre' and j ? 'appliquer' and j ? 'transferer') then false
           when jsonb_typeof(j -> 'connaitre') <> 'number' or jsonb_typeof(j -> 'appliquer') <> 'number'
             or jsonb_typeof(j -> 'transferer') <> 'number' then false
           when (j ->> 'connaitre') !~ '^[0-9]{1,3}$' or (j ->> 'appliquer') !~ '^[0-9]{1,3}$'
             or (j ->> 'transferer') !~ '^[0-9]{1,3}$' then false
           when (j ->> 'connaitre')::int > 100 or (j ->> 'appliquer')::int > 100 or (j ->> 'transferer')::int > 100 then false
           else (j ->> 'connaitre')::int + (j ->> 'appliquer')::int + (j ->> 'transferer')::int = 100
         end;
$$;

revoke all on function public.repartition_valide(jsonb) from public, anon;
grant execute on function public.repartition_valide(jsonb) to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_constraint
     where conname = 'profils_repartition_valide' and conrelid = 'public.profils'::regclass
  ) then
    alter table public.profils add constraint profils_repartition_valide check (public.repartition_valide(repartition));
  end if;
end;
$$;

-- Droits : `repartition` rejoint `nom_affiche` parmi les colonnes que le professeur peut modifier
-- (droit de COLONNE : est_admin, actif, id, dates restent hors de portée). Lecture : déjà couverte
-- par `grant select on public.profils to authenticated` (0001). `anon` : rien.
grant update (repartition) on public.profils to authenticated;
revoke all on public.profils from anon;

-- Supabase recharge son cache de schéma à chaque DDL ; on le demande quand même (sans effet ailleurs).
notify pgrst, 'reload schema';

-- =================================================================================================
-- Math-Belgium — heure zéro (H0) dans l'horaire du carnet de matière vue
-- =================================================================================================
--
-- À exécuter APRÈS 0001_comptes.sql, 0002_carnet.sql et 0003_horaire.sql, dans l'éditeur SQL du
-- projet Supabase (SQL Editor → New query → coller TOUT ce fichier → Run). Idempotent : le relancer
-- ne casse rien et ne perd ni ne modifie aucune donnée (colonne `add column if not exists`,
-- fonctions `create or replace`, chaque contrainte remplacée SEULEMENT si elle a encore son ancienne
-- définition, par une version ÉLARGIE qui accepte tout ce que l'ancienne acceptait). Aucune clé
-- secrète, aucun jeton : rien à remplacer.
--
-- Résultat attendu : « Success. No rows returned ». Dans /carnet → Mon horaire → Modifier la
-- grille, la case « Cette école a une heure zéro (H0) » devient utilisable (recharger la page).
-- Tant que ce fichier n'est pas exécuté, le carnet et l'horaire marchent comme avant, sans H0.
--
-- Heure zéro : certaines écoles ont, exceptionnellement, une heure AVANT la première heure. Elle se
-- place juste avant H1, sans pause, et dure comme les autres heures (corrigeable à la main comme
-- les autres) ; H1 … Hn gardent leurs numéros et leurs horaires : rien ne bouge dans les cases ni
-- dans les séances existantes.
--
-- Contenu :
--   horaires_ecoles.heure_zero   booléen, faux par défaut (aucune grille existante ne change).
--   horaires_ecoles  correction de H0 permise (`exceptions`, heure 0) seulement si `heure_zero` ;
--              H0 ne peut pas commencer la veille (début de H1 − durée d'une heure ≥ 00h00).
--              La fin de la journée (`journee_horaire_tient`) ne change pas : H0 est AVANT H1.
--   horaire_cases.heure          0 … 15 (au lieu de 1 … 15) : H0 fixe dans l'horaire.
--   seances.numero_heure         0 … 15 (au lieu de 1 … 15) : séance en H0 (fixe ou ponctuelle).
--   seances.numero_heure_fin     1 … 15, toujours > numero_heure : heure double « H0–H1 ».
--   RLS, droits, clés étrangères et cascades : inchangés (0002, 0003).
-- =================================================================================================

-- -------------------------------------------------------------------------------------------------
-- Colonne de la grille
-- -------------------------------------------------------------------------------------------------

alter table public.horaires_ecoles add column if not exists heure_zero boolean not null default false;
comment on column public.horaires_ecoles.heure_zero is 'Heure zéro (H0) : une heure juste avant H1, sans pause, de la durée d''une heure (corrigeable dans exceptions, heure 0).';

-- -------------------------------------------------------------------------------------------------
-- Fonctions de validation (pures, sans accès aux tables)
-- -------------------------------------------------------------------------------------------------

-- Heures corrigées à la main, avec H0 : comme `exceptions_horaire_valides(j, nombre)` (0003), mais
-- l'heure 0 est permise quand l'école a une heure zéro ; au plus 16 objets (H0 + 15 heures).
create or replace function public.exceptions_horaire_valides(j jsonb, nombre int, heure_zero boolean)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select jsonb_typeof(j) = 'array'
     and jsonb_array_length(j) <= 16
     and not exists (
       select 1 from jsonb_array_elements(j) e
        where case
                when jsonb_typeof(e) <> 'object' then true
                when (select count(*) from jsonb_object_keys(e)) <> 3 then true
                when jsonb_typeof(e -> 'heure') <> 'number' or jsonb_typeof(e -> 'debut') <> 'string' or jsonb_typeof(e -> 'fin') <> 'string' then true
                when (e ->> 'heure') !~ '^[0-9]{1,2}$' then true
                when (e ->> 'heure')::int not between (case when coalesce(heure_zero, false) then 0 else 1 end) and nombre then true
                when (e ->> 'debut') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' or (e ->> 'fin') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then true
                when (e ->> 'fin') <= (e ->> 'debut') then true
                else false
              end
     )
     and (select count(distinct e ->> 'heure') from jsonb_array_elements(j) e) = jsonb_array_length(j);
$$;

-- H0 ne commence pas la veille : corrigée à la main, ses heures « HH:MM » sont forcément dans la
-- journée ; sinon elle commence au début de H1 (corrigé à la main ou début des cours) moins la
-- durée d'une heure, qui doit rester ≥ 00h00.
create or replace function public.heure_zero_tient(debut time, duree int, exceptions jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  with corr as (
    select e from jsonb_array_elements(case when jsonb_typeof(exceptions) = 'array' then exceptions else '[]'::jsonb end) e
  )
  select case
           when exists (select 1 from corr where e ->> 'heure' = '0') then true
           else coalesce(
                  (select substr(e ->> 'debut', 1, 2)::int * 60 + substr(e ->> 'debut', 4, 2)::int
                     from corr
                    where e ->> 'heure' = '1' and (e ->> 'debut') ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
                    limit 1),
                  (extract(hour from debut) * 60 + extract(minute from debut))::int
                ) - duree >= 0
         end;
$$;

revoke all on function public.exceptions_horaire_valides(jsonb, int, boolean) from public, anon;
revoke all on function public.heure_zero_tient(time, int, jsonb) from public, anon;
grant execute on function public.exceptions_horaire_valides(jsonb, int, boolean) to authenticated;
grant execute on function public.heure_zero_tient(time, int, jsonb) to authenticated;

-- -------------------------------------------------------------------------------------------------
-- Contraintes élargies (mêmes noms qu'en 0002 / 0003 ; remplacées seulement si encore anciennes)
-- -------------------------------------------------------------------------------------------------

do $$
declare
  d text;
begin
  -- Grille : corrections d'heures avec H0 (0003 : heure 1 … n).
  select pg_get_constraintdef(oid) into d from pg_constraint
   where conname = 'horaires_ecoles_exceptions_valides' and conrelid = 'public.horaires_ecoles'::regclass;
  if d is null or d not like '%heure_zero%' then
    alter table public.horaires_ecoles drop constraint if exists horaires_ecoles_exceptions_valides;
    alter table public.horaires_ecoles add constraint horaires_ecoles_exceptions_valides
      check (public.exceptions_horaire_valides(exceptions, nombre_heures, heure_zero) and octet_length(exceptions::text) <= 3000);
  end if;

  -- Grille : H0 ne commence pas la veille (nouvelle contrainte).
  if not exists (select 1 from pg_constraint where conname = 'horaires_ecoles_heure_zero_tient' and conrelid = 'public.horaires_ecoles'::regclass) then
    alter table public.horaires_ecoles add constraint horaires_ecoles_heure_zero_tient
      check (not heure_zero or public.heure_zero_tient(debut, duree_heure, exceptions));
  end if;

  -- Cases de l'horaire : heure 0 … 15 (0003 : 1 … 15, contrainte nommée par Postgres).
  select pg_get_constraintdef(oid) into d from pg_constraint
   where conname = 'horaire_cases_heure_check' and conrelid = 'public.horaire_cases'::regclass;
  if d is null or d not like '%heure >= 0%' then
    alter table public.horaire_cases drop constraint if exists horaire_cases_heure_check;
    alter table public.horaire_cases add constraint horaire_cases_heure_check check (heure between 0 and 15);
  end if;

  -- Séances : numéro d'heure 0 … 15 (0002 : 1 … 15, contrainte nommée par Postgres).
  select pg_get_constraintdef(oid) into d from pg_constraint
   where conname = 'seances_numero_heure_check' and conrelid = 'public.seances'::regclass;
  if d is null or d not like '%numero_heure >= 0%' then
    alter table public.seances drop constraint if exists seances_numero_heure_check;
    alter table public.seances add constraint seances_numero_heure_check check (numero_heure is null or numero_heure between 0 and 15);
  end if;

  -- Séances : dernière heure d'une heure double 1 … 15, après la première (0003 : 2 … 15) → « H0–H1 ».
  select pg_get_constraintdef(oid) into d from pg_constraint
   where conname = 'seances_numero_heure_fin_valide' and conrelid = 'public.seances'::regclass;
  if d is null or d not like '%numero_heure_fin >= 1%' then
    alter table public.seances drop constraint if exists seances_numero_heure_fin_valide;
    alter table public.seances add constraint seances_numero_heure_fin_valide
      check (numero_heure_fin is null or (numero_heure is not null and numero_heure_fin between 1 and 15 and numero_heure_fin > numero_heure));
  end if;
end;
$$;

-- Supabase recharge son cache de schéma à chaque DDL ; on le demande quand même (sans effet ailleurs).
notify pgrst, 'reload schema';

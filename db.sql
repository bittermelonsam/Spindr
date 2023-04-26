-- boilerplate for sql data table
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


DROP TABLE IF EXISTS public.song;
DROP TABLE IF EXISTS public.playlist;
DROP TABLE IF EXISTS public.user;
-- 
CREATE TABLE public.user (
    "_id" serial NOT NULL,
    "name" varchar UNIQUE,
    "acc_token" varchar NOT NULL,
    "ref_token" varchar NOT NULL,
    "spotify_uri" varchar NOT NULL,
    CONSTRAINT "user_pk" PRIMARY KEY("_id")
);

CREATE TABLE public.playlist ( 
    "_id" serial NOT NULL,
    "name" varchar NOT NULL,
    "user_id" integer NOT NULL,
    CONSTRAINT "playlist_pk" PRIMARY KEY("_id")
);

CREATE TABLE public.song (
    "_id" serial NOT NULL,
    "title" varchar NOT NULL,
    "artist" varchar NOT NULL,
    "album" varchar NOT NULL,
    "image" varchar NOT NULL,
    "saved" boolean NOT NULL,
    "playlist_id" integer NOT NULL,
    CONSTRAINT "song_pk" PRIMARY KEY("_id")
);


--the lines below will label the columns in public.songs as foreign keys and point towards the references
ALTER TABLE public.song ADD CONSTRAINT "song_fk0" FOREIGN KEY ("playlist_id") REFERENCES public.playlist("_id");
ALTER TABLE public.playlist ADD CONSTRAINT "user_fk0" FOREIGN KEY ("user_id") REFERENCES public.user("_id");

INSERT INTO public.user(name, acc_token, ref_token, spotify_uri) VALUES ('anna', 'abcd', 'efgh', 'http://google.com');
-- {
--   "country": "string",
--   "display_name": "string",
--   "email": "string",
--   "explicit_content": {
--     "filter_enabled": false,
--     "filter_locked": false
--   },
--   "external_urls": {
--     "spotify": "string"
--   },
--   "followers": {
--     "href": "string",
--     "total": 0
--   },
--   "href": "string",
--   "id": "string",
--   "images": [
--     {
--       "url": "https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228",
--       "height": 300,
--       "width": 300
--     }
--   ],
--   "product": "string",
--   "type": "string",
--   "uri": "string"
-- }
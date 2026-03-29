--
-- PostgreSQL database dump
--

\restrict PcaOPDIuMHjz3d1G5kr4xf8JNk2G6HgCEs174ISFKdxFH65dyiBoqYuvyLTVJCD

-- Dumped from database version 14.21 (Homebrew)
-- Dumped by pg_dump version 14.21 (Homebrew)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: comments; Type: TABLE; Schema: public; Owner: azis.
--

CREATE TABLE public.comments (
    id uuid NOT NULL,
    track_id uuid NOT NULL,
    user_id uuid NOT NULL,
    text character varying(500) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.comments OWNER TO "azis.";

--
-- Name: likes; Type: TABLE; Schema: public; Owner: azis.
--

CREATE TABLE public.likes (
    user_id uuid NOT NULL,
    track_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.likes OWNER TO "azis.";

--
-- Name: tracks; Type: TABLE; Schema: public; Owner: azis.
--

CREATE TABLE public.tracks (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    file_url text NOT NULL,
    cover_image_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    caption character varying(150)
);


ALTER TABLE public.tracks OWNER TO "azis.";

--
-- Name: users; Type: TABLE; Schema: public; Owner: azis.
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(255) NOT NULL,
    password_hash text NOT NULL,
    username character varying(50) NOT NULL,
    display_name character varying(100) NOT NULL,
    bio text,
    profile_image_url text,
    is_verified boolean DEFAULT false,
    is_banned boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO "azis.";

--
-- Name: verification_codes; Type: TABLE; Schema: public; Owner: azis.
--

CREATE TABLE public.verification_codes (
    user_id uuid NOT NULL,
    code character varying(6) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.verification_codes OWNER TO "azis.";

--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: azis.
--

COPY public.comments (id, track_id, user_id, text, created_at) FROM stdin;
5fd2e075-e6e0-4d7a-80b2-c971657c6e3c	8c277b52-cb9b-4e27-a569-bfdec40a6310	77ddc544-534f-46f6-af44-26daab05fffe	K	2026-03-07 23:01:08.820108-08
8e394afe-ca9d-4b5d-86fb-ab8abb1ace3d	87cf6299-7b20-4619-a3d4-afb79b664021	77ddc544-534f-46f6-af44-26daab05fffe	Kk	2026-03-07 23:04:52.147281-08
dd1f0e55-58d6-4a20-885a-1837bf54d0ea	87cf6299-7b20-4619-a3d4-afb79b664021	77ddc544-534f-46f6-af44-26daab05fffe	Kk	2026-03-07 23:05:06.921986-08
6fa8a3aa-9fe1-4074-bc58-17046906d36a	8c277b52-cb9b-4e27-a569-bfdec40a6310	77ddc544-534f-46f6-af44-26daab05fffe	Ok;kin	2026-03-07 23:32:32.561972-08
be452959-a4a0-4dca-83f9-e051ecd467fd	8c277b52-cb9b-4e27-a569-bfdec40a6310	77ddc544-534f-46f6-af44-26daab05fffe	Hi	2026-03-10 22:17:24.666214-07
aff28fe5-d361-44d5-a820-4ca7f558e1c8	8c277b52-cb9b-4e27-a569-bfdec40a6310	77ddc544-534f-46f6-af44-26daab05fffe	Really nice	2026-03-15 03:01:54.700352-07
\.


--
-- Data for Name: likes; Type: TABLE DATA; Schema: public; Owner: azis.
--

COPY public.likes (user_id, track_id, created_at) FROM stdin;
77ddc544-534f-46f6-af44-26daab05fffe	4db3d352-cd5d-4745-9db6-6e0b7a10a363	2026-03-07 23:32:07.952762-08
\.


--
-- Data for Name: tracks; Type: TABLE DATA; Schema: public; Owner: azis.
--

COPY public.tracks (id, user_id, title, description, file_url, cover_image_url, created_at, caption) FROM stdin;
87cf6299-7b20-4619-a3d4-afb79b664021	77ddc544-534f-46f6-af44-26daab05fffe	Log	\N	/uploads/1772950322024-799926572.mp3	/uploads/1772950322054-980332541.jpg	2026-03-07 22:12:02.140199-08	Fucc off
4db3d352-cd5d-4745-9db6-6e0b7a10a363	77ddc544-534f-46f6-af44-26daab05fffe	Real bugs role call	\N	/uploads/1772950356225-690392199.mp3	/uploads/1772950356248-690026877.jpg	2026-03-07 22:12:36.311113-08	Fuck u bluh
8c277b52-cb9b-4e27-a569-bfdec40a6310	77ddc544-534f-46f6-af44-26daab05fffe	Faggitassnigga	\N	/uploads/1772950383332-445404821.mp3	\N	2026-03-07 22:13:03.390895-08	Fuck cuh
6deeacff-0605-4193-ba06-f97b8984d759	77ddc544-534f-46f6-af44-26daab05fffe	Test	\N	/uploads/1773809527794-190871390.mp3	\N	2026-03-17 21:52:07.890101-07	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: azis.
--

COPY public.users (id, email, password_hash, username, display_name, bio, profile_image_url, is_verified, is_banned, created_at, updated_at) FROM stdin;
8a602dc2-1948-41fa-b207-77270710b8bc	a@b.com	$2b$10$WPSxKiIkZHvsy7L9RAgJl..ukPh4bZF9U4elvdbj18gY.MLurSeZi	creator1	Creator One	\N	\N	f	f	2026-02-21 17:39:47.663827	2026-02-21 17:39:47.663827
7b211200-53eb-4cf0-bd05-07282821609f		$2b$10$CotVxMyvVaaqRbOr2LM25.7mWZysGLUZ9Pzt1xzh38a89iLE0y2Te			\N	\N	f	f	2026-02-21 19:09:05.231866	2026-02-21 19:09:05.231866
87e46e78-0586-4624-b5d4-095dc3b8675c	81808llc@gmail.com	$2b$10$FhwTY01ySke1/3OAKcs62Oc0muS0HfjhChGbokP8ymM4T93UnUvDq	Creator2	Creator2	\N	\N	f	f	2026-02-21 19:10:06.714985	2026-02-21 19:10:06.714985
858318e1-8d28-4c14-9b07-7c95d998075a	81808llc+test@gmail.com	$2b$10$c2q6gNDU3fCszez5IqgMUOu/3CWqNP8sdbHCkFrRdq/TBFuXcrbYW	Creator22	Creator22	\N	\N	f	f	2026-02-21 19:17:20.549721	2026-02-21 19:17:20.549721
2c591820-9679-436c-8286-1b1894c96992	81808llc+test1@gmail.com	$2b$10$S/qm6cVIw/InAsw.MF0jh.XQsTwVrr8/thZKzGBvJVHUEOzaWG.Va	Creator2233	Creator2233	\N	\N	f	f	2026-02-21 19:17:59.244575	2026-02-21 19:17:59.244575
22112fdd-de23-4545-9486-25069acbcd51	81808llc+1@gmail.com	$2b$10$BQ6WE/0vYdjeTGF4nH12juNqHC4QaibStvY.gEa2uIJ9xdFKdoHiO	Abc	Abc	\N	\N	f	f	2026-02-21 21:41:10.780209	2026-02-21 21:41:10.780209
c1c4d1fd-f235-4483-90f2-fa39f7603e93	81808llc+12@gmail.com	$2b$10$IVR89sjhHNfFHF9t8DiZlul1PHz9lyT/ATzEHeY/CfPvnkpfUoWCa	Abc1	Abc1	\N	\N	f	f	2026-02-21 21:42:15.643055	2026-02-21 21:42:15.643055
08c3bcba-ead9-4f5c-b4db-6b2bab508f15	81808llc+4@gmail.com	$2b$10$ShOvnPZZ9yKNPdwxVvRV3uSK6KaRw3f.rqZds55uRM9kl/OdslAea	hey	Hey	\N	\N	f	f	2026-02-22 21:47:15.848207	2026-02-22 21:47:15.848207
3494a932-cdd6-4829-8166-f3e6441bc7ff	81808llc+9@gmail.com	$2b$10$r/Pg5fzy.paNKuZs1s.yYuKAVRPUx56IfDmuyhkB2/rw69Xuny.tG	bill22	Bill22	\N	\N	f	f	2026-02-24 21:23:45.766745	2026-02-24 21:23:45.766745
cffa522b-0be7-4042-91a0-2ceec228d9e8	818llc+99@gmail.com	$2b$10$Gcd1Jg5qOGthRWqKEZkgOuCA3PKp4aQ06kjWDA/.7N8Cc.aZKiGjG	bill222	Bill222	\N	\N	f	f	2026-02-24 22:19:15.49934	2026-02-24 22:19:15.49934
3d23399f-c5f9-4c25-a3c2-81401b1bd877	818llc+993@gmail.com	$2b$10$VSQSHODZSPH7Ma1opWBiw.ZLvwETTD5WBcvp6DJq7qnqwkzVMM0Oi	bill2222	Bill2222	\N	\N	f	f	2026-02-24 22:19:31.538561	2026-02-24 22:19:31.538561
77ddc544-534f-46f6-af44-26daab05fffe	81808llc+a1@gmail.com	$2b$10$htG5yct9bZwhFgZ7TlvhKeCvL.ggvj2G.LFMi7BZd5DsxW0aRSscq	billy	Billy	\N	\N	t	f	2026-03-01 16:57:10.725269	2026-03-01 16:57:10.725269
\.


--
-- Data for Name: verification_codes; Type: TABLE DATA; Schema: public; Owner: azis.
--

COPY public.verification_codes (user_id, code, expires_at, created_at) FROM stdin;
cffa522b-0be7-4042-91a0-2ceec228d9e8	351761	2026-02-24 22:49:15.51-08	2026-02-24 22:19:15.511275-08
3d23399f-c5f9-4c25-a3c2-81401b1bd877	143212	2026-02-24 22:49:31.541-08	2026-02-24 22:19:31.541261-08
\.


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: azis.
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: likes likes_pkey; Type: CONSTRAINT; Schema: public; Owner: azis.
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_pkey PRIMARY KEY (user_id, track_id);


--
-- Name: tracks tracks_pkey; Type: CONSTRAINT; Schema: public; Owner: azis.
--

ALTER TABLE ONLY public.tracks
    ADD CONSTRAINT tracks_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: azis.
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: azis.
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: azis.
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: verification_codes verification_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: azis.
--

ALTER TABLE ONLY public.verification_codes
    ADD CONSTRAINT verification_codes_pkey PRIMARY KEY (user_id);


--
-- Name: idx_comments_track; Type: INDEX; Schema: public; Owner: azis.
--

CREATE INDEX idx_comments_track ON public.comments USING btree (track_id);


--
-- Name: idx_tracks_created_at; Type: INDEX; Schema: public; Owner: azis.
--

CREATE INDEX idx_tracks_created_at ON public.tracks USING btree (created_at DESC);


--
-- Name: comments comments_track_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: azis.
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_track_id_fkey FOREIGN KEY (track_id) REFERENCES public.tracks(id) ON DELETE CASCADE;


--
-- Name: comments comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: azis.
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: likes likes_track_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: azis.
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_track_id_fkey FOREIGN KEY (track_id) REFERENCES public.tracks(id) ON DELETE CASCADE;


--
-- Name: likes likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: azis.
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: tracks tracks_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: azis.
--

ALTER TABLE ONLY public.tracks
    ADD CONSTRAINT tracks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: verification_codes verification_codes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: azis.
--

ALTER TABLE ONLY public.verification_codes
    ADD CONSTRAINT verification_codes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict PcaOPDIuMHjz3d1G5kr4xf8JNk2G6HgCEs174ISFKdxFH65dyiBoqYuvyLTVJCD


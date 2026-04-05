-- ==============================================================================
-- PROJECT: Internship & Placement Tracking System
-- ROLE: Supabase Engineer / Database Administrator
-- ==============================================================================
-- Note: Requires uuid-ossp extension for uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. STUDENTS TABLE
CREATE TABLE public.students (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    phone TEXT,
    department TEXT,
    cgpa NUMERIC(3, 2),
    graduation_year INTEGER,
    skills TEXT[] DEFAULT '{}',
    avatar_url TEXT,
    resume_url TEXT,
    resumes JSONB DEFAULT '[]'::jsonb
);

-- 2. ADMINS TABLE
CREATE TABLE public.admins (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT
);

-- Insert Default Admin Account
INSERT INTO public.admins (id, email)
VALUES ('c9952846-0573-4da3-a011-6625953cb52a', 'admin@college.com')
ON CONFLICT DO NOTHING;

-- 3. JOBS TABLE
CREATE TABLE public.jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT,
    company TEXT,
    skills_required TEXT[],
    location TEXT,
    salary TEXT,
    platform_source TEXT,
    application_link TEXT,
    deadline DATE,
    job_type TEXT DEFAULT 'Full-time',
    created_at TIMESTAMP DEFAULT NOW()
);

-- 4. APPLICATIONS TABLE
CREATE TABLE public.applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'Pending',
    match_percentage INT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- FINAL STEP: Refresh Schema Cache for API
NOTIFY pgrst, 'reload schema';

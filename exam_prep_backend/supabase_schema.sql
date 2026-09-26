-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Table to store document chunks and their embeddings
create table if not exists document_chunks (
    id bigserial primary key,
    subject text not null,
    document_title text not null,
    chunk_content text not null,
    embedding vector(768),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a function to search for relevant document chunks
create or replace function match_document_chunks (
    query_embedding vector(768),
    match_threshold float,
    match_count int,
    filter_subject text
)
returns table (
    id bigint,
    subject text,
    document_title text,
    chunk_content text,
    similarity float
)
language sql stable
as $$
    select
        document_chunks.id,
        document_chunks.subject,
        document_chunks.document_title,
        document_chunks.chunk_content,
        1 - (document_chunks.embedding <=> query_embedding) as similarity
    from document_chunks
    where document_chunks.subject = filter_subject
      and 1 - (document_chunks.embedding <=> query_embedding) > match_threshold
    order by document_chunks.embedding <=> query_embedding
    limit match_count;
$$;

-- Table for syllabus progress
create table if not exists syllabus_progress (
    id bigserial primary key,
    user_id text not null,
    subject text not null,
    chapter_id text not null,
    is_completed boolean default false,
    progress_percent int default 0,
    confidence text,
    unique(user_id, subject, chapter_id)
);

-- Table for notes
create table if not exists notes (
    id bigserial primary key,
    user_id text not null,
    subject text not null,
    title text not null,
    content text not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table for tasks
create table if not exists tasks (
    id bigserial primary key,
    user_id text not null,
    subject text not null,
    title text not null,
    is_completed boolean default false,
    due_date text,
    priority text default 'Medium'
);

-- Table for error book
create table if not exists error_book (
    id bigserial primary key,
    user_id text not null,
    subject text not null,
    topic text not null,
    error_category text not null,
    description text,
    frequency int default 1,
    unique(user_id, subject, topic, error_category)
);

-- Table for daily goals
create table if not exists daily_goals (
    id bigserial primary key,
    user_id text not null,
    date text not null,
    goals text[],
    unique(user_id, date)
);

-- Table for evening review
create table if not exists evening_reviews (
    id bigserial primary key,
    user_id text not null,
    date text not null,
    rating int,
    accomplish text,
    improve text,
    unique(user_id, date)
);

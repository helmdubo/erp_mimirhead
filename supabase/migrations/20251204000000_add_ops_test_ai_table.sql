-- Create test AI table in ops schema
CREATE TABLE IF NOT EXISTS ops.test_ai_table (
    id bigserial PRIMARY KEY,
    created_at timestamptz DEFAULT now() NOT NULL,
    note text
);

-- Enable Row Level Security
ALTER TABLE ops.test_ai_table ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for authenticated users
CREATE POLICY "Allow authenticated users to read test_ai_table"
    ON ops.test_ai_table
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to insert test_ai_table"
    ON ops.test_ai_table
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update test_ai_table"
    ON ops.test_ai_table
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete test_ai_table"
    ON ops.test_ai_table
    FOR DELETE
    TO authenticated
    USING (true);

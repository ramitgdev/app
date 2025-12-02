-- Task Management Schema for DevHub
-- Add this to your Supabase SQL Editor

-- ============================================
-- TASKS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date TIMESTAMP WITH TIME ZONE,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    tags TEXT[] DEFAULT '{}',
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2)
);

-- ============================================
-- TASK COMMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.task_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_workspace_id ON public.tasks(workspace_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON public.task_comments(task_id);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

-- Tasks policies
CREATE POLICY "tasks_select_own" ON public.tasks
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "tasks_insert_own" ON public.tasks
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "tasks_update_own" ON public.tasks
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "tasks_delete_own" ON public.tasks
    FOR DELETE USING (user_id = auth.uid());

-- Task comments policies
CREATE POLICY "task_comments_select_own" ON public.task_comments
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "task_comments_insert_own" ON public.task_comments
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "task_comments_update_own" ON public.task_comments
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "task_comments_delete_own" ON public.task_comments
    FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_comments_updated_at BEFORE UPDATE ON public.task_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get task statistics
CREATE OR REPLACE FUNCTION get_task_stats(user_uuid UUID, workspace_uuid UUID DEFAULT NULL)
RETURNS TABLE (
    total_tasks BIGINT,
    pending_tasks BIGINT,
    in_progress_tasks BIGINT,
    completed_tasks BIGINT,
    overdue_tasks BIGINT,
    completion_rate DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    WITH task_counts AS (
        SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE status = 'pending') as pending,
            COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
            COUNT(*) FILTER (WHERE status = 'completed') as completed,
            COUNT(*) FILTER (WHERE status IN ('pending', 'in_progress') AND due_date < NOW()) as overdue
        FROM public.tasks 
        WHERE user_id = user_uuid 
        AND (workspace_uuid IS NULL OR workspace_id = workspace_uuid)
    )
    SELECT 
        total,
        pending,
        in_progress,
        completed,
        overdue,
        CASE 
            WHEN total = 0 THEN 0
            ELSE ROUND((completed::DECIMAL / total::DECIMAL) * 100, 2)
        END as completion_rate
    FROM task_counts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


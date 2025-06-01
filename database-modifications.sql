-- =====================================================
-- PetSmart Admin Dashboard Database Modifications
-- =====================================================

-- 1. Create admin_sessions table for admin login tracking
CREATE TABLE IF NOT EXISTS admin_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_user_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- 2. Create admin_activity_logs table for audit trail
CREATE TABLE IF NOT EXISTS admin_activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create dashboard_metrics table for caching dashboard statistics
CREATE TABLE IF NOT EXISTS dashboard_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_name TEXT NOT NULL UNIQUE,
    metric_value JSONB NOT NULL,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 4. Create system_settings table for admin configuration
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key TEXT NOT NULL UNIQUE,
    setting_value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES admin_users(id) ON DELETE SET NULL
);

-- 5. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_user_id ON admin_sessions(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_active ON admin_sessions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_admin_user_id ON admin_activity_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_created_at ON admin_activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_resource ON admin_activity_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_metrics_expires_at ON dashboard_metrics(expires_at);

-- 6. Add RLS policies for admin tables
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Admin sessions policies
CREATE POLICY "Admin users can view their own sessions" ON admin_sessions
    FOR SELECT USING (
        admin_user_id IN (
            SELECT id FROM admin_users WHERE id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Admin users can insert their own sessions" ON admin_sessions
    FOR INSERT WITH CHECK (
        admin_user_id IN (
            SELECT id FROM admin_users WHERE id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Admin users can update their own sessions" ON admin_sessions
    FOR UPDATE USING (
        admin_user_id IN (
            SELECT id FROM admin_users WHERE id = auth.uid() AND is_active = true
        )
    );

-- Admin activity logs policies
CREATE POLICY "Admin users can view activity logs" ON admin_activity_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Admin users can insert activity logs" ON admin_activity_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- Dashboard metrics policies
CREATE POLICY "Admin users can view dashboard metrics" ON dashboard_metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Admin users can manage dashboard metrics" ON dashboard_metrics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE id = auth.uid() AND is_active = true AND role IN ('super_admin', 'admin')
        )
    );

-- System settings policies
CREATE POLICY "Admin users can view system settings" ON system_settings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Super admins can manage system settings" ON system_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE id = auth.uid() AND is_active = true AND role = 'super_admin'
        )
    );

-- 7. Enhanced RLS policies for existing tables to allow admin access

-- Allow admins to view all user profiles
CREATE POLICY "Admin users can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- Allow admins to update user profiles
CREATE POLICY "Admin users can update profiles" ON profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- Allow admins to view all pets
CREATE POLICY "Admin users can view all pets" ON pets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- Allow admins to create pets
CREATE POLICY "Admin users can create pets" ON pets
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- Allow admins to update pets
CREATE POLICY "Admin users can update pets" ON pets
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- Allow admins to delete pets (soft delete)
CREATE POLICY "Admin users can delete pets" ON pets
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- Allow admins to manage appointments
CREATE POLICY "Admin users can view all appointments" ON appointments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Admin users can update appointments" ON appointments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- Allow admins to manage products
CREATE POLICY "Admin users can manage products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- Allow admins to view and manage orders
CREATE POLICY "Admin users can view all orders" ON orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Admin users can update orders" ON orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- Allow admins to view all messages
CREATE POLICY "Admin users can view all messages" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Admin users can send messages" ON messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- Allow admins to manage notifications
CREATE POLICY "Admin users can view all notifications" ON notifications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Admin users can create notifications" ON notifications
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- 8. Create functions for dashboard metrics calculation
CREATE OR REPLACE FUNCTION calculate_dashboard_metrics()
RETURNS JSONB AS $$
DECLARE
    result JSONB := '{}';
    total_users INTEGER;
    total_pets INTEGER;
    monthly_revenue NUMERIC;
    pending_orders INTEGER;
    today_appointments INTEGER;
BEGIN
    -- Calculate total users
    SELECT COUNT(*) INTO total_users FROM profiles;
    
    -- Calculate total pets
    SELECT COUNT(*) INTO total_pets FROM pets;
    
    -- Calculate monthly revenue
    SELECT COALESCE(SUM(total_amount), 0) INTO monthly_revenue 
    FROM orders 
    WHERE created_at >= date_trunc('month', CURRENT_DATE)
    AND status NOT IN ('cancelled');
    
    -- Calculate pending orders
    SELECT COUNT(*) INTO pending_orders 
    FROM orders 
    WHERE status = 'pending';
    
    -- Calculate today's appointments
    SELECT COUNT(*) INTO today_appointments 
    FROM appointments 
    WHERE appointment_date = CURRENT_DATE;
    
    -- Build result JSON
    result := jsonb_build_object(
        'total_users', total_users,
        'total_pets', total_pets,
        'monthly_revenue', monthly_revenue,
        'pending_orders', pending_orders,
        'today_appointments', today_appointments,
        'calculated_at', NOW()
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create function to log admin activities
CREATE OR REPLACE FUNCTION log_admin_activity(
    p_admin_user_id UUID,
    p_action TEXT,
    p_resource_type TEXT,
    p_resource_id UUID DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO admin_activity_logs (
        admin_user_id,
        action,
        resource_type,
        resource_id,
        old_values,
        new_values,
        ip_address,
        user_agent
    ) VALUES (
        p_admin_user_id,
        p_action,
        p_resource_type,
        p_resource_id,
        p_old_values,
        p_new_values,
        p_ip_address,
        p_user_agent
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description, is_public) VALUES
('app_name', '"PetSmart Admin Dashboard"', 'Application name', true),
('app_version', '"1.0.0"', 'Application version', true),
('maintenance_mode', 'false', 'Enable maintenance mode', false),
('max_file_upload_size', '10485760', 'Maximum file upload size in bytes (10MB)', false),
('session_timeout', '3600', 'Admin session timeout in seconds', false),
('notification_settings', '{"email_enabled": true, "push_enabled": true}', 'Global notification settings', false)
ON CONFLICT (setting_key) DO NOTHING;

-- 11. Create initial super admin user (update with your email)
-- Note: This user will need to be created through Supabase Auth first
-- INSERT INTO admin_users (id, email, role, is_active, created_at) VALUES
-- ('your-user-id-here', 'admin@petsmart.com', 'super_admin', true, NOW())
-- ON CONFLICT (email) DO NOTHING;

COMMENT ON TABLE admin_sessions IS 'Tracks admin user login sessions';
COMMENT ON TABLE admin_activity_logs IS 'Audit trail for admin actions';
COMMENT ON TABLE dashboard_metrics IS 'Cached dashboard statistics';
COMMENT ON TABLE system_settings IS 'System configuration settings';

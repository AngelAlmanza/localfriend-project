-- Migration: Add SELECT RLS Policies for Product/Service Views
-- Description: Allow authenticated users to read their own records from
--              product_views and service_views (required for "recently viewed" feature).
--              Previously only INSERT was allowed, causing SELECT queries to return 0 rows.
-- Date: 2026-03-09

-- =============================================
-- PRODUCT_VIEWS - SELECT policy
-- =============================================
CREATE POLICY "Users can view their own product views"
  ON product_views FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- =============================================
-- SERVICE_VIEWS - SELECT policy
-- =============================================
CREATE POLICY "Users can view their own service views"
  ON service_views FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

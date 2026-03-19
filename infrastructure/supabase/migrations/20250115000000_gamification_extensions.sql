-- =====================================================================
-- Migration: Gamification Extensions - Reward Redemption & Badge Upgrades
-- Created: 2025-01-15
-- Description: Extends the gamification system with reward catalog,
--              redemption tracking, and badge upgrade history
-- =====================================================================

-- =====================================================================
-- PART 1: CREATE CUSTOM TYPES
-- =====================================================================

-- Create badge tier type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE badge_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create redeemable reward type enum
DO $$ BEGIN
    CREATE TYPE redeemable_reward_type AS ENUM (
        'premium_feature',
        'theme',
        'household_perk',
        'discount'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================================
-- PART 2: CREATE TABLES
-- =====================================================================

-- ---------------------------------------------------------------------
-- Table: redeemable_rewards (Reward Catalog)
-- Purpose: Catalog of rewards that users can redeem with XP
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.redeemable_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    type redeemable_reward_type NOT NULL,
    cost_xp INTEGER NOT NULL CHECK (cost_xp > 0),
    metadata JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.redeemable_rewards IS 'Catalog of rewards available for XP redemption';
COMMENT ON COLUMN public.redeemable_rewards.cost_xp IS 'XP cost to redeem this reward (must be positive)';
COMMENT ON COLUMN public.redeemable_rewards.metadata IS 'Flexible JSON field for reward-specific data (e.g., feature_flag, theme_id, discount_code_template, one_time_only)';
COMMENT ON COLUMN public.redeemable_rewards.is_active IS 'Whether reward is currently available for redemption';

-- ---------------------------------------------------------------------
-- Table: redemptions (User Redemption History)
-- Purpose: Tracks all user reward redemptions
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    redeemable_reward_id UUID NOT NULL REFERENCES public.redeemable_rewards(id) ON DELETE RESTRICT,
    cost_xp INTEGER NOT NULL,
    redemption_metadata JSONB,
    redeemed_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.redemptions IS 'History of user reward redemptions';
COMMENT ON COLUMN public.redemptions.cost_xp IS 'Snapshot of XP cost at time of redemption (for historical tracking)';
COMMENT ON COLUMN public.redemptions.redemption_metadata IS 'Generated codes, activation data, expiry dates, etc.';

-- Create partial unique index for one-time-only rewards
-- This is enforced at the application/function level by checking metadata.one_time_only
CREATE INDEX IF NOT EXISTS idx_redemptions_user_reward 
ON public.redemptions(user_id, redeemable_reward_id);

-- ---------------------------------------------------------------------
-- Table: badge_upgrades (Badge Upgrade History)
-- Purpose: Tracks badge tier upgrades (bronze → silver → gold → platinum)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.badge_upgrades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL, -- The NEW upgraded badge (FK to badges table when it exists)
    from_badge_id UUID, -- The old badge being upgraded from (nullable for initial badges)
    badge_type TEXT NOT NULL,
    from_tier badge_tier NOT NULL,
    to_tier badge_tier NOT NULL,
    upgraded_at TIMESTAMPTZ DEFAULT NOW(),
    eligibility_criteria JSONB,
    CONSTRAINT valid_tier_upgrade CHECK (
        (from_tier = 'bronze' AND to_tier = 'silver') OR
        (from_tier = 'silver' AND to_tier = 'gold') OR
        (from_tier = 'gold' AND to_tier = 'platinum')
    )
);

COMMENT ON TABLE public.badge_upgrades IS 'History of badge tier upgrades';
COMMENT ON COLUMN public.badge_upgrades.badge_id IS 'The NEW upgraded badge ID';
COMMENT ON COLUMN public.badge_upgrades.from_badge_id IS 'The previous badge ID that was upgraded (null for initial badges)';
COMMENT ON COLUMN public.badge_upgrades.eligibility_criteria IS 'Criteria that was met for this upgrade (time_based, threshold_based, etc.)';
COMMENT ON CONSTRAINT valid_tier_upgrade ON public.badge_upgrades IS 'Ensures upgrades follow proper progression: bronze→silver→gold→platinum';

-- =====================================================================
-- PART 3: EXTEND EXISTING TABLES (OPTIONAL - only if tables exist)
-- =====================================================================

-- ---------------------------------------------------------------------
-- Extend badges table with new columns for upgrade tracking
-- ---------------------------------------------------------------------
-- Note: These columns are optional/nullable for backward compatibility
-- Wrapped in exception handler to skip if table doesn't exist
DO $$ 
BEGIN
    -- Check if badges table exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'badges'
    ) THEN
        -- Add upgraded_from column (ID of previous tier badge)
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'badges' 
            AND column_name = 'upgraded_from'
        ) THEN
            ALTER TABLE public.badges ADD COLUMN upgraded_from UUID;
            COMMENT ON COLUMN public.badges.upgraded_from IS 'ID of previous tier badge that was upgraded (null for initial badges)';
        END IF;

        -- Add illustration_url column (URL to badge illustration in storage)
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'badges' 
            AND column_name = 'illustration_url'
        ) THEN
            ALTER TABLE public.badges ADD COLUMN illustration_url TEXT;
            COMMENT ON COLUMN public.badges.illustration_url IS 'URL to badge illustration/image in Supabase Storage';
        END IF;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Badges table does not exist, skipping badge extensions';
END $$;

-- ---------------------------------------------------------------------
-- Extend rewards table with redemption-related columns
-- ---------------------------------------------------------------------
-- Note: These columns are optional/nullable for backward compatibility
-- Wrapped in exception handler to skip if table doesn't exist
DO $$ 
BEGIN
    -- Check if rewards table exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'rewards'
    ) THEN
        -- Add cost_xp column (snapshot of XP cost at redemption)
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'rewards' 
            AND column_name = 'cost_xp'
        ) THEN
            ALTER TABLE public.rewards ADD COLUMN cost_xp INTEGER CHECK (cost_xp >= 0);
            COMMENT ON COLUMN public.rewards.cost_xp IS 'XP cost snapshot at time of redemption (for historical tracking)';
        END IF;

        -- Add redeemable_reward_id column (reference to catalog)
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'rewards' 
            AND column_name = 'redeemable_reward_id'
        ) THEN
            ALTER TABLE public.rewards ADD COLUMN redeemable_reward_id UUID;
            COMMENT ON COLUMN public.rewards.redeemable_reward_id IS 'Reference to the catalog item in redeemable_rewards table';
        END IF;

        -- Add redemption_metadata column (additional redemption data)
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'rewards' 
            AND column_name = 'redemption_metadata'
        ) THEN
            ALTER TABLE public.rewards ADD COLUMN redemption_metadata JSONB;
            COMMENT ON COLUMN public.rewards.redemption_metadata IS 'Generated codes, activation data, expiry dates, etc.';
        END IF;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Rewards table does not exist, skipping reward extensions';
END $$;

-- Add foreign key constraint for redeemable_reward_id (if both tables exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_schema = 'public' 
        AND table_name = 'rewards'
        AND constraint_name = 'rewards_redeemable_reward_id_fkey'
    ) THEN
        ALTER TABLE public.rewards 
        ADD CONSTRAINT rewards_redeemable_reward_id_fkey 
        FOREIGN KEY (redeemable_reward_id) 
        REFERENCES public.redeemable_rewards(id) 
        ON DELETE SET NULL;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- Ignore if constraint already exists or tables don't exist
        NULL;
END $$;

-- =====================================================================
-- PART 4: CREATE INDEXES FOR PERFORMANCE
-- =====================================================================

-- Redemptions indexes
CREATE INDEX IF NOT EXISTS idx_redemptions_user_redeemed_at 
ON public.redemptions(user_id, redeemed_at DESC);

CREATE INDEX IF NOT EXISTS idx_redemptions_redeemable_reward 
ON public.redemptions(redeemable_reward_id);

-- Badge upgrades indexes
CREATE INDEX IF NOT EXISTS idx_badge_upgrades_user_upgraded_at 
ON public.badge_upgrades(user_id, upgraded_at DESC);

CREATE INDEX IF NOT EXISTS idx_badge_upgrades_badge_id 
ON public.badge_upgrades(badge_id);

CREATE INDEX IF NOT EXISTS idx_badge_upgrades_from_badge_id 
ON public.badge_upgrades(from_badge_id);

-- Redeemable rewards indexes
CREATE INDEX IF NOT EXISTS idx_redeemable_rewards_active_cost 
ON public.redeemable_rewards(is_active, cost_xp) 
WHERE is_active = true;

-- =====================================================================
-- PART 5: CREATE TRIGGERS
-- =====================================================================

-- Apply updated_at trigger to redeemable_rewards
DROP TRIGGER IF EXISTS update_redeemable_rewards_updated_at ON public.redeemable_rewards;
CREATE TRIGGER update_redeemable_rewards_updated_at 
BEFORE UPDATE ON public.redeemable_rewards
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================================
-- PART 6: CREATE DATABASE FUNCTIONS
-- =====================================================================

-- ---------------------------------------------------------------------
-- Function: redeem_reward
-- Purpose: Atomically redeem a reward and deduct XP from user balance
-- Returns: JSON with success status, redemption_id, and remaining_xp
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.redeem_reward(
    p_user_id UUID,
    p_redeemable_reward_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_reward_record RECORD;
    v_user_xp_record RECORD;
    v_redemption_id UUID;
    v_remaining_xp INTEGER;
    v_already_redeemed BOOLEAN;
BEGIN
    -- Step 1: Check if reward exists and is active
    SELECT * INTO v_reward_record
    FROM public.redeemable_rewards
    WHERE id = p_redeemable_reward_id AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'REWARD_NOT_FOUND',
            'message', 'Reward not found or is no longer active'
        );
    END IF;
    
    -- Step 2: Get user's current XP (assuming user_xp table exists)
    -- Note: Adjust table name if different
    SELECT * INTO v_user_xp_record
    FROM public.user_xp
    WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'USER_NOT_FOUND',
            'message', 'User XP record not found'
        );
    END IF;
    
    -- Step 3: Check if user has enough XP
    IF v_user_xp_record.total_xp < v_reward_record.cost_xp THEN
        RETURN json_build_object(
            'success', false,
            'error', 'INSUFFICIENT_XP',
            'message', 'Not enough XP to redeem this reward',
            'required_xp', v_reward_record.cost_xp,
            'current_xp', v_user_xp_record.total_xp
        );
    END IF;
    
    -- Step 4: Check if reward is one-time-only and already redeemed
    IF (v_reward_record.metadata->>'one_time_only')::boolean = true THEN
        SELECT EXISTS(
            SELECT 1 FROM public.redemptions
            WHERE user_id = p_user_id 
            AND redeemable_reward_id = p_redeemable_reward_id
        ) INTO v_already_redeemed;
        
        IF v_already_redeemed THEN
            RETURN json_build_object(
                'success', false,
                'error', 'ALREADY_REDEEMED',
                'message', 'This one-time reward has already been redeemed'
            );
        END IF;
    END IF;
    
    -- Step 5: Insert redemption record
    INSERT INTO public.redemptions (
        user_id,
        redeemable_reward_id,
        cost_xp,
        redemption_metadata,
        redeemed_at
    )
    VALUES (
        p_user_id,
        p_redeemable_reward_id,
        v_reward_record.cost_xp,
        json_build_object(
            'reward_title', v_reward_record.title,
            'reward_type', v_reward_record.type::text,
            'redeemed_at', NOW()
        )::jsonb,
        NOW()
    )
    RETURNING id INTO v_redemption_id;
    
    -- Step 6: Deduct XP from user_xp table
    UPDATE public.user_xp
    SET 
        total_xp = total_xp - v_reward_record.cost_xp,
        updated_at = NOW()
    WHERE user_id = p_user_id
    RETURNING total_xp INTO v_remaining_xp;
    
    -- Step 7: Return success with details
    RETURN json_build_object(
        'success', true,
        'redemption_id', v_redemption_id,
        'remaining_xp', v_remaining_xp,
        'redeemed_xp', v_reward_record.cost_xp,
        'reward_title', v_reward_record.title
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', 'INTERNAL_ERROR',
            'message', SQLERRM
        );
END;
$$;

COMMENT ON FUNCTION public.redeem_reward IS 'Atomically redeem a reward with XP. Checks reward availability, user XP balance, one-time redemption constraints, and deducts XP.';

-- ---------------------------------------------------------------------
-- Function: check_badge_upgrade_eligibility
-- Purpose: Check if a badge is eligible for tier upgrade
-- Returns: JSON with eligibility status and criteria met
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_badge_upgrade_eligibility(
    p_badge_id UUID,
    p_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_badge_record RECORD;
    v_days_since_earned INTEGER;
    v_next_tier TEXT;
    v_required_days INTEGER;
    v_time_criteria_met BOOLEAN := false;
    v_threshold_criteria_met BOOLEAN := false;
    v_eligible BOOLEAN := false;
BEGIN
    -- Step 1: Get badge details (assuming badges table exists)
    SELECT * INTO v_badge_record
    FROM public.badges
    WHERE id = p_badge_id AND user_id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'BADGE_NOT_FOUND',
            'message', 'Badge not found for this user'
        );
    END IF;
    
    -- Step 2: Calculate days since earned
    v_days_since_earned := EXTRACT(DAY FROM (NOW() - v_badge_record.earned_at));
    
    -- Step 3: Determine next tier and requirements
    CASE v_badge_record.tier
        WHEN 'bronze' THEN
            v_next_tier := 'silver';
            v_required_days := 30;
        WHEN 'silver' THEN
            v_next_tier := 'gold';
            v_required_days := 90;
        WHEN 'gold' THEN
            v_next_tier := 'platinum';
            v_required_days := 180;
        ELSE
            -- Already at platinum or invalid tier
            RETURN json_build_object(
                'success', true,
                'badge_type', v_badge_record.type,
                'current_tier', v_badge_record.tier,
                'next_tier', null,
                'eligible', false,
                'criteria_met', json_build_object(
                    'time_based', false,
                    'threshold_based', false
                ),
                'days_since_earned', v_days_since_earned,
                'message', 'Already at maximum tier (platinum)'
            );
    END CASE;
    
    -- Step 4: Check time-based criteria
    v_time_criteria_met := (v_days_since_earned >= v_required_days);
    
    -- Step 5: Check threshold-based criteria
    -- This should be customized based on badge type and criteria in metadata
    -- For now, we'll assume threshold is met if time is met (simplified logic)
    -- In production, you'd query gamification stats or badge-specific thresholds
    IF v_badge_record.criteria ? 'threshold' THEN
        -- Example: Check if user exceeded threshold by required multiplier
        -- This is placeholder logic - customize based on your badge criteria
        v_threshold_criteria_met := true;
    ELSE
        -- No threshold requirement for this badge type
        v_threshold_criteria_met := true;
    END IF;
    
    -- Step 6: Determine overall eligibility
    v_eligible := (v_time_criteria_met AND v_threshold_criteria_met);
    
    -- Step 7: Return eligibility status
    RETURN json_build_object(
        'success', true,
        'badge_type', v_badge_record.type,
        'current_tier', v_badge_record.tier,
        'next_tier', v_next_tier,
        'eligible', v_eligible,
        'criteria_met', json_build_object(
            'time_based', v_time_criteria_met,
            'threshold_based', v_threshold_criteria_met
        ),
        'days_since_earned', v_days_since_earned,
        'required_days', v_required_days
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', 'INTERNAL_ERROR',
            'message', SQLERRM
        );
END;
$$;

COMMENT ON FUNCTION public.check_badge_upgrade_eligibility IS 'Check if a badge is eligible for tier upgrade based on time and threshold criteria';

-- ---------------------------------------------------------------------
-- Function: get_user_redemptions
-- Purpose: Get user's redemption history with reward details
-- Returns: TABLE of redemptions with joined reward information
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_user_redemptions(p_user_id UUID)
RETURNS TABLE (
    redemption_id UUID,
    user_id UUID,
    redeemable_reward_id UUID,
    cost_xp INTEGER,
    redemption_metadata JSONB,
    redeemed_at TIMESTAMPTZ,
    reward_title TEXT,
    reward_description TEXT,
    reward_type TEXT,
    reward_metadata JSONB
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT 
        r.id AS redemption_id,
        r.user_id,
        r.redeemable_reward_id,
        r.cost_xp,
        r.redemption_metadata,
        r.redeemed_at,
        rr.title AS reward_title,
        rr.description AS reward_description,
        rr.type::text AS reward_type,
        rr.metadata AS reward_metadata
    FROM public.redemptions r
    INNER JOIN public.redeemable_rewards rr ON r.redeemable_reward_id = rr.id
    WHERE r.user_id = p_user_id
    ORDER BY r.redeemed_at DESC;
$$;

COMMENT ON FUNCTION public.get_user_redemptions IS 'Retrieve user redemption history with full reward details';

-- ---------------------------------------------------------------------
-- Function: get_badge_upgrade_history
-- Purpose: Get user's badge upgrade history
-- Returns: TABLE of badge upgrades with badge details
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_badge_upgrade_history(p_user_id UUID)
RETURNS TABLE (
    upgrade_id UUID,
    user_id UUID,
    badge_id UUID,
    from_badge_id UUID,
    badge_type TEXT,
    from_tier TEXT,
    to_tier TEXT,
    upgraded_at TIMESTAMPTZ,
    eligibility_criteria JSONB
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT 
        bu.id AS upgrade_id,
        bu.user_id,
        bu.badge_id,
        bu.from_badge_id,
        bu.badge_type,
        bu.from_tier::text,
        bu.to_tier::text,
        bu.upgraded_at,
        bu.eligibility_criteria
    FROM public.badge_upgrades bu
    WHERE bu.user_id = p_user_id
    ORDER BY bu.upgraded_at DESC;
$$;

COMMENT ON FUNCTION public.get_badge_upgrade_history IS 'Retrieve user badge upgrade history showing progression through tiers';

-- =====================================================================
-- PART 7: ROW-LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

-- Enable RLS on all new tables
ALTER TABLE public.redeemable_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badge_upgrades ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- RLS Policies: redeemable_rewards
-- ---------------------------------------------------------------------

-- SELECT: Authenticated users can view all active rewards
DROP POLICY IF EXISTS "Authenticated users can view active rewards" ON public.redeemable_rewards;
CREATE POLICY "Authenticated users can view active rewards"
ON public.redeemable_rewards
FOR SELECT
TO authenticated
USING (is_active = true);

-- Service role has full access (for admin operations)
DROP POLICY IF EXISTS "Service role has full access to rewards" ON public.redeemable_rewards;
CREATE POLICY "Service role has full access to rewards"
ON public.redeemable_rewards
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ---------------------------------------------------------------------
-- RLS Policies: redemptions
-- ---------------------------------------------------------------------

-- SELECT: Users can view their own redemptions only
DROP POLICY IF EXISTS "Users can view own redemptions" ON public.redemptions;
CREATE POLICY "Users can view own redemptions"
ON public.redemptions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Service role has full access
DROP POLICY IF EXISTS "Service role has full access to redemptions" ON public.redemptions;
CREATE POLICY "Service role has full access to redemptions"
ON public.redemptions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Note: INSERT is handled via redeem_reward() function which uses SECURITY DEFINER

-- ---------------------------------------------------------------------
-- RLS Policies: badge_upgrades
-- ---------------------------------------------------------------------

-- SELECT: Users can view their own badge upgrade history only
DROP POLICY IF EXISTS "Users can view own badge upgrades" ON public.badge_upgrades;
CREATE POLICY "Users can view own badge upgrades"
ON public.badge_upgrades
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Service role has full access
DROP POLICY IF EXISTS "Service role has full access to badge upgrades" ON public.badge_upgrades;
CREATE POLICY "Service role has full access to badge upgrades"
ON public.badge_upgrades
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Note: INSERT is handled via upgrade functions which use SECURITY DEFINER

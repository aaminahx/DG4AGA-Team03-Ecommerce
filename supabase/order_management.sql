BEGIN;

-- =========================================
-- ECOHOME: ORDER STATUS HISTORY
-- =========================================

CREATE TABLE IF NOT EXISTS public.order_status_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    order_id uuid NOT NULL
        REFERENCES public.orders(id)
        ON DELETE RESTRICT,

    previous_status text NOT NULL,

    new_status text NOT NULL,

    changed_by uuid NOT NULL
        REFERENCES auth.users(id)
        ON DELETE RESTRICT,

    changed_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT valid_previous_status CHECK (
        previous_status IN (
            'placed',
            'processing',
            'dispatched',
            'delivered',
            'cancelled'
        )
    ),

    CONSTRAINT valid_new_status CHECK (
        new_status IN (
            'placed',
            'processing',
            'dispatched',
            'delivered',
            'cancelled'
        )
    ),

    CONSTRAINT different_order_status CHECK (
        previous_status <> new_status
    )
);


-- =========================================
-- INDEXES
-- =========================================

CREATE INDEX IF NOT EXISTS order_status_history_order_idx
ON public.order_status_history (
    order_id,
    changed_at DESC
);


-- =========================================
-- ROW LEVEL SECURITY
-- =========================================

ALTER TABLE public.order_status_history
ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.order_status_history
FROM PUBLIC, anon, authenticated;

GRANT SELECT ON TABLE public.order_status_history
TO authenticated;


-- Administrators can read order status history.

DROP POLICY IF EXISTS "Admins can view order status history"
ON public.order_status_history;

CREATE POLICY "Admins can view order status history"
ON public.order_status_history
FOR SELECT
TO authenticated
USING (
    (SELECT public.is_admin())
);


-- =========================================
-- SECURE ORDER STATUS UPDATE FUNCTION
-- =========================================

CREATE OR REPLACE FUNCTION public.update_order_status(
    p_order_id uuid,
    p_expected_status text,
    p_new_status text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$

DECLARE
    v_admin_id uuid := (SELECT auth.uid());
    v_current_status text;
    v_item record;

BEGIN

    -- Require authentication.

    IF v_admin_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required'
            USING ERRCODE = '42501';
    END IF;


    -- Require administrator permissions.

    IF public.is_admin() IS DISTINCT FROM true THEN
        RAISE EXCEPTION 'Administrator access required'
            USING ERRCODE = '42501';
    END IF;


    -- Validate submitted values.

    IF p_order_id IS NULL
       OR p_expected_status IS NULL
       OR p_new_status IS NULL
       OR p_expected_status NOT IN (
           'placed',
           'processing',
           'dispatched',
           'delivered',
           'cancelled'
       )
       OR p_new_status NOT IN (
           'placed',
           'processing',
           'dispatched',
           'delivered',
           'cancelled'
       )
    THEN
        RAISE EXCEPTION 'Invalid order status request';
    END IF;


    -- Lock the order to prevent concurrent updates.

    SELECT status
    INTO v_current_status
    FROM public.orders
    WHERE id = p_order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order not found';
    END IF;


    -- Prevent updates from outdated browser pages.

    IF v_current_status IS DISTINCT FROM p_expected_status THEN
        RAISE EXCEPTION
            'Order status has changed. Refresh and try again.';
    END IF;


    -- Prevent duplicate status changes.

    IF v_current_status = p_new_status THEN
        RAISE EXCEPTION
            'Order already has this status';
    END IF;


    -- Enforce permitted status transitions.

    IF NOT (
        (
            v_current_status = 'placed'
            AND p_new_status IN (
                'processing',
                'cancelled'
            )
        )
        OR
        (
            v_current_status = 'processing'
            AND p_new_status IN (
                'dispatched',
                'cancelled'
            )
        )
        OR
        (
            v_current_status = 'dispatched'
            AND p_new_status = 'delivered'
        )
    ) THEN
        RAISE EXCEPTION
            'This order status transition is not permitted';
    END IF;


    -- Restore purchased stock when cancelling.

    IF p_new_status = 'cancelled' THEN

        IF NOT EXISTS (
            SELECT 1
            FROM public.order_items
            WHERE order_id = p_order_id
        ) THEN
            RAISE EXCEPTION
                'Cannot cancel an order with no items';
        END IF;

        FOR v_item IN

            SELECT product_id, quantity
            FROM public.order_items
            WHERE order_id = p_order_id
            ORDER BY product_id

        LOOP

            UPDATE public.products
            SET
                stock_quantity =
                    stock_quantity + v_item.quantity,

                updated_at = now()

            WHERE id = v_item.product_id;

            IF NOT FOUND THEN
                RAISE EXCEPTION
                    'Unable to restore product stock';
            END IF;

        END LOOP;

    END IF;


    -- Update the order status.

    UPDATE public.orders
    SET status = p_new_status
    WHERE id = p_order_id;


    -- Record the administrator's action.

    INSERT INTO public.order_status_history (
        order_id,
        previous_status,
        new_status,
        changed_by
    )
    VALUES (
        p_order_id,
        v_current_status,
        p_new_status,
        v_admin_id
    );

END;

$function$;


-- =========================================
-- RESTRICT FUNCTION EXECUTION
-- =========================================

REVOKE ALL ON FUNCTION public.update_order_status(
    uuid,
    text,
    text
)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.update_order_status(
    uuid,
    text,
    text
)
TO authenticated;

COMMIT;
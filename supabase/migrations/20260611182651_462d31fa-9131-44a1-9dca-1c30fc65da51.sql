-- Asignar rol admin a natimyphone@gmail.com de forma idempotente
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'natimyphone@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
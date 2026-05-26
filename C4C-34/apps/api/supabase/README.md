# Supabase Database Notes

Project ref:

```text
zbjxkiqqxdsybnrzjkpv
```

Applied migrations:

```text
20260525073043_init_hastakala_person4_backend
20260525073122_harden_hastakala_rls_and_function_search_path
20260525075445_add_hastakala_demo_reset_function
```

The database schema is mirrored in `../prisma/schema.prisma`.

Runtime connection:

```env
DATABASE_URL=postgresql://postgres:YOUR_DATABASE_PASSWORD@db.zbjxkiqqxdsybnrzjkpv.supabase.co:5432/postgres
```

Do not commit real database passwords or service-role keys.

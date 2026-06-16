#!/usr/bin/env python3
"""
Auto-return armada from DALAM_PERJALANAN to STANDBY.
Runs every minute via Hermes cron job.
Fetches all armada with status=DALAM_PERJALANAN where returnAt <= now,
then resets them to STANDBY and clears returnAt.
"""
import os, sys

try:
    import psycopg2
except ImportError:
    os.system(f"{sys.executable} -m pip install psycopg2-binary -q")
    import psycopg2

DATABASE_URL = os.environ.get("DATABASE_URL", "")
if not DATABASE_URL:
    # Try reading from .env file
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line.startswith("DATABASE_URL="):
                    DATABASE_URL = line.split("=", 1)[1].strip().strip('"').strip("'")

if not DATABASE_URL:
    print("ERROR: DATABASE_URL not found")
    sys.exit(1)

try:
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    # Find armada that should return to standby
    cur.execute("""
        SELECT id, nama, "returnAt"
        FROM "Armada"
        WHERE status = 'DALAM_PERJALANAN'
        AND "returnAt" IS NOT NULL
        AND "returnAt" <= NOW()
    """)
    rows = cur.fetchall()

    if rows:
        armada_ids = [r[0] for r in rows]
        placeholders = ",".join(["%s"] * len(armada_ids))
        cur.execute(f"""
            UPDATE "Armada"
            SET status = 'STANDBY', "returnAt" = NULL
            WHERE id IN ({placeholders})
        """, armada_ids)
        conn.commit()
        for r in rows:
            print(f"Armada '{r[1]}' (id={r[0]}) returned to STANDBY (was due at {r[2]})")
        print(f"Total: {len(rows)} armada returned to STANDBY")
    else:
        print("No armada to return")

    cur.close()
    conn.close()
except Exception as e:
    print(f"ERROR: {e}")
    sys.exit(1)

import os
import sys
from pprint import pprint

# Ensure we can import from the backend module
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))
from app.db.client import get_supabase

def show_db_state():
    db = get_supabase()
    print("\n--- 📊 REAL-TIME DB STATE: MASTERY TABLE ---")
    try:
        mastery_rows = db.table("mastery").select("*").execute().data
        if not mastery_rows:
            print("No mastery records found. (Students start with a default prior of 0.30 unrecorded)")
        else:
            for row in mastery_rows:
                print(f"Student: {row['student_id']} | Concept: {row['concept_id']} | Mastery (p_mastery): {row['p_mastery']}")
                
        print("\n--- 📚 CONCEPTS TABLE ---")
        concepts = db.table("concepts").select("id, name").execute().data
        for c in concepts[:3]:
            print(f"Concept ID: {c['id']} | Name: {c['name']}")
        print("...")
        
    except Exception as e:
        print(f"Error connecting to DB: {e}")

if __name__ == "__main__":
    show_db_state()

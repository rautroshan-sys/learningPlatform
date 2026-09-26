"""
app/adaptive/dag.py
Concept DAG utilities:
  - topological sort (Kahn's algorithm)
  - gap detection (prerequisite backtracking, depth capped at 2)
  - personalized path generation (topo-sorted, weighted by mastery)
"""
from __future__ import annotations
from collections import deque


def topological_sort(concepts: list[dict]) -> list[dict]:
    """
    Kahn's algorithm topological sort on the concept DAG.
    concepts: list of {id, name, prerequisite_ids: [...], ...}
    Returns concepts in dependency order (prerequisites first).
    """
    id_to_concept = {c["id"]: c for c in concepts}
    in_degree: dict[str, int] = {c["id"]: 0 for c in concepts}
    adj: dict[str, list[str]] = {c["id"]: [] for c in concepts}

    for c in concepts:
        for prereq_id in (c.get("prerequisite_ids") or []):
            if prereq_id in adj:
                adj[prereq_id].append(c["id"])
                in_degree[c["id"]] += 1

    queue = deque(cid for cid, deg in in_degree.items() if deg == 0)
    sorted_ids: list[str] = []

    while queue:
        cid = queue.popleft()
        sorted_ids.append(cid)
        for neighbor in adj.get(cid, []):
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    # Any remaining node with in_degree > 0 means a cycle — skip gracefully
    return [id_to_concept[cid] for cid in sorted_ids if cid in id_to_concept]


def build_learning_path(
    concepts: list[dict],
    mastery_map: dict[str, float],
) -> list[dict]:
    """
    Return a learning path: topo-sorted concepts annotated with p_mastery
    and recommended=True for the first concept below the mastery threshold.

    mastery_map: { concept_id: p_mastery }
    """
    from app.adaptive.bkt import MASTERY_THRESHOLD

    sorted_concepts = topological_sort(concepts)
    path = []
    first_recommended = True

    for c in sorted_concepts:
        p = mastery_map.get(c["id"], 0.30)  # BKT prior if no row
        is_recommended = False
        if first_recommended and p < MASTERY_THRESHOLD:
            is_recommended = True
            first_recommended = False
        path.append({
            "concept_id": c["id"],
            "name": c["name"],
            "p_mastery": p,
            "recommended": is_recommended,
        })

    return path


def detect_gap(
    wrong_concept_id: str,
    concepts: list[dict],
    mastery_map: dict[str, float],
    max_depth: int = 2,
) -> str | None:
    """
    Trace prerequisite_ids on the wrong concept up to max_depth levels.
    Returns the concept_id of the first unmet prerequisite found, or None.
    Unmet = p_mastery < MASTERY_THRESHOLD.
    """
    from app.adaptive.bkt import MASTERY_THRESHOLD

    id_to_concept = {c["id"]: c for c in concepts}

    def _trace(concept_id: str, depth: int) -> str | None:
        if depth > max_depth:
            return None
        concept = id_to_concept.get(concept_id)
        if concept is None:
            return None
        for prereq_id in (concept.get("prerequisite_ids") or []):
            p = mastery_map.get(prereq_id, 0.30)
            if p < MASTERY_THRESHOLD:
                return prereq_id
            # recurse into that prereq's prerequisites
            found = _trace(prereq_id, depth + 1)
            if found:
                return found
        return None

    return _trace(wrong_concept_id, 1)

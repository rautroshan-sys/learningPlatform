"""
app/adaptive/bkt.py
Bayesian Knowledge Tracing (BKT) mastery update.

Parameters (fixed for MVP — can be per-concept later):
  p_learn  = 0.10  probability of learning after each attempt
  p_guess  = 0.25  probability of guessing correctly without knowledge
  p_slip   = 0.10  probability of slipping (knowing but answering wrong)
  p_prior  = 0.30  initial mastery prior (matches ARCHITECTURE.md default)

Reference: Corbett & Anderson (1994) BKT formulation.
"""


P_LEARN = 0.10
P_GUESS = 0.25
P_SLIP = 0.10
P_PRIOR = 0.30

# Mastery threshold for gap detection and tier-up decisions
MASTERY_THRESHOLD = 0.70
# Tier boundaries
TIER_THRESHOLDS = {1: 0.0, 2: 0.45, 3: 0.75}


def bkt_update(p_mastery: float, correct: bool) -> float:
    """
    Given the current mastery probability and whether the student answered
    correctly, return the updated mastery probability.

    Formula:
      P(known | evidence) = P(evidence | known) * P(known)
                            / P(evidence)
    Then update for learning:
      P(known_next) = P(known | evidence) + P(not known | evidence) * P_LEARN
    """
    if correct:
        p_evidence_given_known = 1 - P_SLIP
        p_evidence_given_unknown = P_GUESS
    else:
        p_evidence_given_known = P_SLIP
        p_evidence_given_unknown = 1 - P_GUESS

    # Bayes update
    numerator = p_evidence_given_known * p_mastery
    denominator = numerator + p_evidence_given_unknown * (1 - p_mastery)

    if denominator == 0:
        p_known_given_evidence = p_mastery
    else:
        p_known_given_evidence = numerator / denominator

    # Learning step
    p_mastery_next = p_known_given_evidence + (1 - p_known_given_evidence) * P_LEARN

    # Clamp to [0, 1]
    return max(0.0, min(1.0, p_mastery_next))


def select_tier(p_mastery: float) -> int:
    """
    Return the appropriate difficulty tier (1, 2, or 3) for the given mastery.
    """
    if p_mastery >= TIER_THRESHOLDS[3]:
        return 3
    if p_mastery >= TIER_THRESHOLDS[2]:
        return 2
    return 1

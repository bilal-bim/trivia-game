# Player Flow Diagram - Visual Representation

## Complete Player Journey Flow

```
                                    START
                                      |
                                      v
                            ┌─────────────────┐
                            │   Home Page     │
                            │  ┌───────────┐  │
                            │  │ Join Game │  │ ← Primary CTA for players
                            │  └───────────┘  │
                            │                 │
                            │  [Create Game]  │ ← Secondary option
                            └─────────────────┘
                                      |
                                      v
                            ┌─────────────────┐
                            │  Enter Room     │
                            │     Code        │
                            │ ┌─────────────┐ │
                            │ │ABC-123-XYZ  │ │ ← Auto-format, forgiving
                            │ └─────────────┘ │
                            │    [Join]       │
                            └─────────────────┘
                                      |
                                      v
                          ┌─────────────────────┐
                          │   Code Validation   │
                          └─────────────────────┘
                               |             |
                         [Valid]           [Invalid]
                               |             |
                               v             v
                    ┌─────────────────┐  ┌─────────────────┐
                    │ Enter Nickname  │  │   Error State   │
                    │ ┌─────────────┐ │  │                 │
                    │ │[Your Name]  │ │  │ ❌ Room not    │
                    │ └─────────────┘ │  │    found        │
                    │   [Continue]    │  │                 │
                    └─────────────────┘  │ Try again or    │
                               |         │ [Create Game]   │
                               v         └─────────────────┘
                          ┌─────────────────────┐
                          │ Nickname Validation │
                          └─────────────────────┘
                               |             |
                         [Available]    [Taken]
                               |             |
                               v             v
                    ┌─────────────────┐  ┌─────────────────┐
                    │   Join Lobby    │  │ Name Conflict   │
                    └─────────────────┘  │                 │
                               |         │ "Alex" is taken │
                               |         │                 │
                               |         │ Try: Alex2,     │
                               |         │      Alex_Player│
                               |         │                 │
                               |         │ [Use Suggestion]│
                               |         └─────────────────┘
                               |                   |
                               v                   v
                     ┌─────────────────────────────────┐
                     │         Lobby Experience        │
                     │                                 │
                     │  🎮 Waiting for Game to Start  │
                     │                                 │
                     │  Players in Room (4/10):       │
                     │  ┌─────┐ ┌─────┐ ┌─────┐      │
                     │  │Host │ │You  │ │Mike │ ...  │ ← You highlighted
                     │  │Sarah│ │Alex │ │     │      │
                     │  └─────┘ └─────┘ └─────┘      │
                     │                                 │
                     │  Game Settings:                │
                     │  • 10 Questions                │
                     │  • 20 seconds per question     │
                     │  • Mixed categories            │
                     │                                 │
                     │  💬 Chat with other players    │
                     │  ┌─────────────────────────┐   │
                     │  │You: Hey everyone!      │   │
                     │  │Mike: Ready to play!    │   │
                     │  └─────────────────────────┘   │
                     │                                 │
                     │    ⏳ Waiting for host...      │
                     └─────────────────────────────────┘
                                      |
                                      v
                     ┌─────────────────────────────────┐
                     │       Game Starting!            │
                     │                                 │
                     │         🚀 Get Ready!          │
                     │                                 │
                     │      Game starts in: 3         │ ← Countdown
                     │                                 │
                     │    10 questions coming up      │
                     │    20 seconds each             │
                     │                                 │
                     └─────────────────────────────────┘
                                      |
                                      v
                     ┌─────────────────────────────────┐
                     │        Question Display         │
                     │                                 │
                     │    Question 1 of 10            │
                     │                                 │
                     │  What is the capital of        │
                     │        France?                 │
                     │                                 │
                     │         ⏱️ 18s                 │ ← Visual timer
                     │                                 │
                     │  [A] London    [B] Berlin      │
                     │  [C] Paris     [D] Madrid      │ ← Large touch targets
                     │                                 │
                     └─────────────────────────────────┘
                                      |
                                      v
                     ┌─────────────────────────────────┐
                     │      Answer Selected            │
                     │                                 │
                     │  What is the capital of        │
                     │        France?                 │
                     │                                 │
                     │         ✓ Answer Locked        │
                     │                                 │
                     │  [A] London    [B] Berlin      │
                     │  [C] Paris ✨  [D] Madrid      │ ← Your selection highlighted
                     │                                 │
                     │    Waiting for other players   │
                     │         (3/4 answered)         │
                     └─────────────────────────────────┘
                                      |
                                      v
                     ┌─────────────────────────────────┐
                     │        Answer Reveal            │
                     │                                 │
                     │  What is the capital of        │
                     │        France?                 │
                     │                                 │
                     │  [A] London    [B] Berlin      │
                     │  [C] Paris ✅  [D] Madrid      │ ← Correct answer
                     │                                 │
                     │      🎉 Correct! +100 pts     │ ← Personal feedback
                     │                                 │
                     │  The capital of France is      │
                     │  Paris, established as the     │ ← Educational content
                     │  capital in 508 AD.           │
                     └─────────────────────────────────┘
                                      |
                                      v
                     ┌─────────────────────────────────┐
                     │         Scoreboard              │
                     │                                 │
                     │     📊 After Question 1        │
                     │                                 │
                     │  🥇 1st: Mike     (100 pts)   │
                     │  🥈 2nd: You      (100 pts)   │ ← You highlighted
                     │  🥉 3rd: Sarah    (100 pts)   │
                     │      4th: Jordan  (0 pts)     │
                     │                                 │
                     │      Your streak: 1 🔥         │ ← Personal achievement
                     │                                 │
                     │    Next question in: 5s        │
                     └─────────────────────────────────┘
                                      |
                                      v
                            [Loop: Questions 2-10]
                                      |
                                      v
                     ┌─────────────────────────────────┐
                     │         Final Results           │
                     │                                 │
                     │        🏆 Game Complete!       │
                     │                                 │
                     │  🥇 1st: You      (850 pts)   │ ← Victory celebration
                     │  🥈 2nd: Mike     (720 pts)   │
                     │  🥉 3rd: Sarah    (680 pts)   │
                     │      4th: Jordan  (420 pts)   │
                     │                                 │
                     │    Final streak: 7 🔥🔥🔥      │
                     │                                 │
                     │  [Share Score] [Play Again]    │
                     └─────────────────────────────────┘
                                      |
                                      v
                                    END
```

## Key Player Experience Moments

### Joining Experience
```
[Room Code Entry] → [Validation] → [Nickname] → [Lobby Welcome]
     |                 |              |             |
   Focus on         Instant         Personal      Social
   input field      feedback        identity      connection
```

### Question-Answer Cycle
```
[Question Appears] → [Reading] → [Decision] → [Selection] → [Waiting] → [Reveal] → [Scoring]
       |              |           |            |            |           |          |
   Initial scan   Comprehension  Choice      Commitment   Anticipation Result   Achievement
```

### Emotional States Throughout Game
1. **Anticipation**: Joining lobby, meeting other players
2. **Focus**: Reading questions, making decisions  
3. **Tension**: Timer pressure, competitive moments
4. **Relief**: Answer submitted, waiting for results
5. **Joy/Disappointment**: Seeing if answer was correct
6. **Competitiveness**: Checking scoreboard position
7. **Achievement**: Final results, personal performance

### Critical UX Success Factors
- **Immediate Feedback**: Every action gets instant visual response
- **Personal Recognition**: Player always highlighted in lists/scores
- **Social Connection**: See other players, feel part of group
- **Redemption**: Bad questions don't ruin entire experience
- **Achievement**: Celebrate personal bests, not just winners
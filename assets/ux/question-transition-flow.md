# Question-to-Scoreboard Transition Flow

## Detailed Transition Sequence

```
                         QUESTION PHASE
                              |
                              v
     ┌─────────────────────────────────────────────────────┐
     │                 Question Display                    │
     │                                                     │
     │           Question 3 of 10                         │
     │                                                     │
     │     Which planet is known as the Red Planet?       │
     │                                                     │
     │              ⏱️ Timer: 20s                         │ ← Circular countdown
     │          ████████████░░░░░░░░                      │
     │                                                     │
     │   [A] Venus      [B] Mars      [C] Jupiter         │ ← Large, accessible
     │                 [D] Saturn                         │   touch targets
     │                                                     │
     │              👥 4 players active                   │
     └─────────────────────────────────────────────────────┘
                              |
                              v
     ┌─────────────────────────────────────────────────────┐
     │              Player Selection State                 │
     │                                                     │
     │     Which planet is known as the Red Planet?       │
     │                                                     │
     │              ⏱️ Timer: 12s                         │
     │          ██████░░░░░░░░░░░░░░░                     │
     │                                                     │
     │   [A] Venus      [B] Mars ✨    [C] Jupiter        │ ← Selected answer
     │                 [D] Saturn                         │   highlighted
     │                                                     │
     │            ✓ Answer Locked In                      │ ← Confirmation
     │        Waiting for other players...                │
     │              (3/4 answered)                        │ ← Social pressure
     └─────────────────────────────────────────────────────┘
                              |
                              v
     ┌─────────────────────────────────────────────────────┐
     │                Time Expired                        │
     │                                                     │
     │     Which planet is known as the Red Planet?       │
     │                                                     │
     │              ⏱️ Time's Up!                         │ ← Gentle notification
     │          ░░░░░░░░░░░░░░░░░░░░░░                     │
     │                                                     │
     │   [A] Venus      [B] Mars ✨    [C] Jupiter        │
     │                 [D] Saturn                         │
     │                                                     │
     │           All answers submitted                     │
     │            Revealing results...                    │ ← Build anticipation
     └─────────────────────────────────────────────────────┘
                              |
                              v (Animation: 1.5s)
     ┌─────────────────────────────────────────────────────┐
     │                Answer Reveal                        │
     │                                                     │
     │     Which planet is known as the Red Planet?       │
     │                                                     │
     │              The answer is...                      │ ← Dramatic pause
     │                                                     │
     │   [A] Venus      [B] Mars ✅    [C] Jupiter        │ ← Correct answer
     │                 [D] Saturn                         │   highlighted
     │                                                     │
     │            🎉 Correct! +100 pts                    │ ← Personal feedback
     │                                                     │
     │  Mars appears red due to iron oxide (rust)        │ ← Educational moment
     │  covering much of its surface.                     │
     └─────────────────────────────────────────────────────┘
                              |
                              v (Animation: 2s)
     ┌─────────────────────────────────────────────────────┐
     │               Individual Result                     │
     │                                                     │
     │                Your Result                         │
     │                                                     │
     │              ✅ CORRECT!                           │ ← Big, clear feedback
     │                                                     │
     │              +100 points                           │
     │             Total: 250 pts                         │ ← Running total
     │                                                     │
     │           Current streak: 2 🔥                     │ ← Achievement tracking
     │                                                     │
     │      You got 2 of the last 3 correct!            │ ← Performance context
     └─────────────────────────────────────────────────────┘
                              |
                              v (Animation: Build scoreboard)
     ┌─────────────────────────────────────────────────────┐
     │                 Scoreboard                          │
     │                                                     │
     │            📊 After Question 3                     │
     │                                                     │
     │     ┌─────────────────────────────────────┐       │ ← Animated reveal
     │     │ 🥇 1st: Alex        (300 pts) ⬆️   │       │   from bottom up
     │     └─────────────────────────────────────┘       │
     │     ┌─────────────────────────────────────┐       │
     │YOu→ │ 🥈 2nd: You         (250 pts) ➡️   │ ←     │ ← Your position
     │     └─────────────────────────────────────┘   │   │   highlighted
     │     ┌─────────────────────────────────────┐   │   │
     │     │ 🥉 3rd: Sarah       (200 pts) ⬇️   │   │   │
     │     └─────────────────────────────────────┘   │   │
     │     ┌─────────────────────────────────────┐   │   │
     │     │    4th: Mike        (150 pts) ⬇️   │   │   │
     │     └─────────────────────────────────────┘   │   │
     │                                               │   │
     │              Your best streak: 3 🔥🔥🔥      │   │
     │                                                   │
     │         Next question starting in: 5s             │ ← Clear countdown
     │              ████░░░░░░░░                        │
     └─────────────────────────────────────────────────────┘
                              |
                              v (5 second countdown)
     ┌─────────────────────────────────────────────────────┐
     │              Next Question Ready                    │
     │                                                     │
     │                Question 4 of 10                    │ ← Progress indicator
     │                                                     │
     │                Get Ready! 🚀                       │
     │                                                     │
     │            Starting in: 3... 2... 1...            │ ← Final countdown
     │                                                     │
     │              [Next question loads]                 │
     └─────────────────────────────────────────────────────┘
                              |
                              v
                    [RETURN TO QUESTION PHASE]
```

## Micro-Interaction Details

### Answer Selection Animation
```
Before Selection:     After Selection:      Confirmation:
┌─────────────┐      ┌─────────────┐       ┌─────────────┐
│ [B] Mars    │  →   │ [B] Mars ✨ │   →   │ [B] Mars ✨ │
└─────────────┘      └─────────────┘       └─────────────┘
                     Pulse animation        Lock-in effect
                     Scale: 1.0 → 1.05     Checkmark appears
```

### Timer Visual States
```
20s: ████████████████████ (Green - Calm)
10s: ██████████░░░░░░░░░░ (Orange - Warning)  
5s:  ███░░░░░░░░░░░░░░░░░ (Red - Urgent)
0s:  ░░░░░░░░░░░░░░░░░░░░ (Gray - Complete)
```

### Scoreboard Animation Sequence
1. **Individual Result** (2s): Personal feedback with celebration
2. **Fade to Scoreboard** (0.5s): Smooth transition
3. **Position Reveals** (2s): Names animate from bottom to top
4. **Rank Changes** (1s): Show movement with arrows
5. **Personal Highlight** (1s): Your row gets special treatment
6. **Next Question Countdown** (5s): Clear preparation time

## Emotional Journey Mapping

### Timing and Emotional States
```
Time: 0s     5s     10s    15s    20s    22s    24s    26s    31s
      |      |      |      |      |      |      |      |      |
State: 📖 → 🤔 → ⚡ → 😰 → ✅ → 😬 → 🎉 → 📊 → 🚀
      Read  Think Choose Panic Submit Wait  Joy   Rank  Ready

Emotions:
📖 Curiosity: Reading and understanding question
🤔 Contemplation: Considering options
⚡ Decision: Making choice under time pressure  
😰 Urgency: Timer running out, need to act
✅ Relief: Answer submitted successfully
😬 Anticipation: Waiting for results
🎉 Joy/Disappointment: Seeing if correct
📊 Competition: Checking ranking position
🚀 Momentum: Ready for next challenge
```

### Sound and Haptic Feedback
- **Question Start**: Gentle chime, light vibration
- **Timer Warning** (5s left): Subtle pulse vibration
- **Answer Submit**: Satisfying click sound, firm haptic
- **Time Up**: Gentle notification tone
- **Correct Answer**: Success chime, celebration haptic
- **Wrong Answer**: Soft error tone, brief vibration
- **Scoreboard**: Whoosh sound for animations
- **Next Question**: Ready signal, anticipation vibration

## Accessibility Considerations

### Screen Reader Announcements
```
Question Phase:
- "Question 3 of 10. Which planet is known as the Red Planet?"
- "Timer: 15 seconds remaining"
- "Answer options: A Venus, B Mars, C Jupiter, D Saturn"

Selection Phase:
- "Mars selected. Answer locked in."
- "Waiting for other players. 3 of 4 have answered."

Results Phase:
- "Correct! You earned 100 points."
- "Current total: 250 points"
- "Scoreboard: You are in 2nd place"
```

### Keyboard Navigation
```
Tab Order:
1. Answer A button
2. Answer B button  
3. Answer C button
4. Answer D button
5. Timer (focusable for screen reader)

Keyboard Shortcuts:
- 1, 2, 3, 4: Select answers A, B, C, D
- Space: Submit selected answer
- Enter: Confirm selection
```

### Visual Accessibility
- **High Contrast Mode**: Alternative color schemes
- **Reduced Motion**: Static transitions for vestibular sensitivity
- **Large Text**: Scalable fonts up to 200%
- **Color Independence**: Never rely solely on color for information

## Performance Optimizations

### Preloading Strategy
- Next question preloaded during scoreboard display
- Answer reveal animations cached
- Scoreboard data prepared during answer collection

### Network Resilience  
- Answer submissions with retry logic
- Offline question caching for uninterrupted flow
- Graceful degradation for slow connections

### Battery Optimization
- Reduce animation complexity on mobile
- Smart refresh rates based on device capabilities
- Minimize WebSocket message frequency during stable states
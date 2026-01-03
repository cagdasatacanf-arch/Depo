# Technical Indicators - Quick Reference Guide

## 📊 Visual Guide to Each Indicator

### 1. SMA 20 & SMA 50 (Simple Moving Averages)

**What it shows:**
```
Price:  ___/‾‾\___/‾‾‾
SMA20:  __/‾‾\__/‾‾ (Orange dashed)
SMA50:  _/‾‾‾\__/ (Red dashed)
```

**How to read:**
- MAs smooth out price noise
- Slower MA (50) shows longer-term trend
- Faster MA (20) responds quicker to changes

**Signals:**
| Condition | Signal | Action |
|-----------|--------|--------|
| Price > SMA20 > SMA50 | Strong uptrend | Hold/Buy |
| SMA20 crosses above SMA50 | Golden Cross | Buy ✅ |
| Price > SMA20 | Short-term bullish | Consider buy |
| Price < SMA20 < SMA50 | Strong downtrend | Hold/Sell |
| SMA20 crosses below SMA50 | Death Cross | Sell ❌ |
| Price < SMA20 | Short-term bearish | Consider sell |

**Best for:** Identifying trend direction and strength

---

### 2. EMA 20 (Exponential Moving Average)

**What it shows:**
```
Price:  ___/‾‾\___/‾‾‾
EMA20:  __/‾\__/‾‾ (Purple solid, faster than SMA)
```

**Difference from SMA:**
- Reacts faster to price changes
- Gives more weight to recent prices
- Better for short-term trading

**Signals:**
| Condition | Signal | Action |
|-----------|--------|--------|
| Price > EMA20 | Uptrend | Bullish |
| Price crosses above EMA20 | Breakout | Buy |
| Price bounces off EMA20 | Support confirmed | Hold |
| Price < EMA20 | Downtrend | Bearish |
| Price crosses below EMA20 | Breakdown | Sell |

**Best for:** Active trading, quick trend changes

---

### 3. Bollinger Bands

**What it shows:**
```
Upper: ___/‾‾‾‾‾‾\___
Price: __/‾\___/‾\__
Middle:___‾‾‾‾‾‾‾___ (SMA 20)
Lower: ___‾‾‾‾‾‾‾___
```

**Components:**
- **Upper Band** = SMA + (2 × Standard Deviation)
- **Middle Band** = SMA 20
- **Lower Band** = SMA - (2 × Standard Deviation)

**Width tells you:**
- **Wide bands** = High volatility, big price swings
- **Narrow bands** = Low volatility, "squeeze" (big move coming!)
- **Expanding** = Trend getting stronger
- **Contracting** = Trend weakening, consolidation

**Signals:**
| Condition | Signal | Action |
|-----------|--------|--------|
| Price at lower band | Oversold | Buy opportunity |
| Price at upper band | Overbought | Sell opportunity |
| Bands narrowing | Squeeze | Prepare for breakout |
| Price breaks above upper | Strong breakout | Momentum buy |
| Price breaks below lower | Strong breakdown | Momentum sell |
| Walking the upper band | Very strong uptrend | Stay in trade |

**The "Bollinger Bounce":**
```
Upper: _______________
Price:    ↗ ↙ ↗ ↙  (Bounces between bands)
Lower: _______________
```
**Best for:** Range trading, volatility analysis

---

### 4. RSI (Relative Strength Index)

**What it shows:**
```
100 ─────────────────
 70 ═════════════════ Overbought
 50 ─────────────────
 30 ═════════════════ Oversold
  0 ─────────────────

RSI:  __/‾‾\___/‾\__
```

**Zones:**
- **70-100**: Overbought (too many buyers, may reverse down)
- **30-70**: Neutral (no extreme)
- **0-30**: Oversold (too many sellers, may reverse up)

**Classic Signals:**
| Condition | Signal | Action |
|-----------|--------|--------|
| RSI < 30 | Oversold | Buy signal |
| RSI > 70 | Overbought | Sell signal |
| RSI 40-60 | Neutral | Wait |
| RSI crosses above 50 | Momentum shifting up | Bullish |
| RSI crosses below 50 | Momentum shifting down | Bearish |

**Advanced: Divergences**
```
Price:  /\  /\  (Higher highs)
RSI:    /\ /   (Lower highs) ← Bearish divergence

Price:  \/ \/  (Lower lows)
RSI:    \/ \   (Higher lows) ← Bullish divergence
```

**Divergence signals:**
- **Bullish divergence** = Price falling but RSI rising → Reversal up likely
- **Bearish divergence** = Price rising but RSI falling → Reversal down likely

**Best for:** Overbought/oversold conditions, divergence spotting

---

### 5. MACD (Moving Average Convergence Divergence)

**What it shows:**
```
MACD:      ___/‾\___/‾‾ (Blue line)
Signal:    __/‾\__/‾‾  (Red line)
Histogram: ▌ ▌   ▌▌  ▌ (Purple bars, difference between lines)
           ─────────── Zero line
```

**Components:**
- **MACD Line** (Blue) = EMA(12) - EMA(26)
- **Signal Line** (Red) = EMA(9) of MACD
- **Histogram** (Purple) = MACD - Signal

**Signals:**
| Condition | Signal | Action |
|-----------|--------|--------|
| MACD crosses above Signal | Buy signal | Enter long |
| MACD crosses below Signal | Sell signal | Exit/Short |
| MACD > 0 | Bullish momentum | Uptrend |
| MACD < 0 | Bearish momentum | Downtrend |
| Histogram growing | Strengthening trend | Add to position |
| Histogram shrinking | Weakening trend | Consider exit |

**Crossover Strategy:**
```
Signal: ___/‾‾\___
MACD:   __/X‾\X__
        BUY ↑  ↓ SELL
```

**Divergence (Advanced):**
- Price makes new high, MACD doesn't = Bearish (sell)
- Price makes new low, MACD doesn't = Bullish (buy)

**Best for:** Trend confirmation, momentum trading

---

## 🎯 Combining Indicators

### Strategy 1: Triple Confirmation

**Goal:** High-confidence buy signal

**Enable:**
- Bollinger Bands
- RSI
- MACD

**Buy when ALL are true:**
1. ✅ Price touches lower Bollinger Band
2. ✅ RSI < 30 (oversold)
3. ✅ MACD about to cross above Signal

**Why it works:** Three independent indicators agree → Strong signal

---

### Strategy 2: Trend Riding

**Goal:** Stay in winning trades longer

**Enable:**
- SMA 20
- EMA 20
- MACD

**Buy:** Price crosses above EMA 20, MACD positive
**Hold:** As long as price stays above EMA 20
**Sell:** Price crosses below EMA 20 OR MACD turns negative

**Why it works:** Catches trends early, exits before major reversals

---

### Strategy 3: Volatility Breakout

**Goal:** Catch big moves after quiet periods

**Enable:**
- Bollinger Bands
- Volume

**Watch for:**
1. Bollinger Bands narrow (squeeze)
2. Price consolidates between bands
3. Volume decreases

**Trade:**
- When price breaks out of bands with HIGH volume → Buy direction of breakout
- Set stop-loss at opposite band

**Why it works:** Low volatility → High volatility, explosive moves

---

### Strategy 4: Divergence Hunter

**Goal:** Catch reversals before they happen

**Enable:**
- RSI
- MACD
- Price chart

**Look for:**
1. Price making new highs/lows
2. RSI or MACD NOT making new highs/lows
3. Divergence pattern forms

**Trade:**
- Bearish divergence at resistance → Short
- Bullish divergence at support → Long

**Why it works:** Divergences often precede trend reversals

---

## 📱 Quick Decision Matrix

| Market Condition | Best Indicators | Strategy |
|------------------|-----------------|----------|
| **Strong Uptrend** | SMA 20/50, EMA 20 | Ride trend, buy dips |
| **Strong Downtrend** | SMA 20/50, EMA 20 | Stay out or short |
| **Range-bound** | RSI, Bollinger Bands | Buy low, sell high |
| **Volatile** | Bollinger Bands | Wait for squeeze |
| **Quiet/Consolidating** | Bollinger Bands, Volume | Prepare for breakout |
| **Unclear direction** | All indicators | Wait for agreement |

---

## ⚠️ Common Mistakes to Avoid

### ❌ Mistake 1: Using too many indicators
**Problem:** Chart becomes cluttered, conflicting signals
**Solution:** Use 2-3 max, that complement each other

### ❌ Mistake 2: Ignoring timeframe
**Problem:** Short-term noise gives false signals
**Solution:** Higher timeframe = more reliable

### ❌ Mistake 3: Trading against trend
**Problem:** Fighting the trend usually loses
**Solution:** Trade WITH the trend (price > MAs = only buy)

### ❌ Mistake 4: Trusting one signal
**Problem:** All indicators give false signals sometimes
**Solution:** Wait for confirmation from 2-3 indicators

### ❌ Mistake 5: Forgetting volume
**Problem:** Signal without volume confirmation often fails
**Solution:** Always check volume increases on breakouts

### ❌ Mistake 6: Overreacting to extremes
**Problem:** "Overbought" doesn't mean instant reversal
**Solution:** Strong trends can stay overbought/oversold for long time

### ❌ Mistake 7: Ignoring divergences
**Problem:** Miss early warning of reversals
**Solution:** Always watch for price/indicator disagreement

---

## 🎓 Indicator Cheat Sheet

| Indicator | Period | Overbought | Oversold | Best For |
|-----------|--------|------------|----------|----------|
| **RSI** | 14 | >70 | <30 | Reversals |
| **SMA 20** | 20 days | - | - | Short trend |
| **SMA 50** | 50 days | - | - | Medium trend |
| **EMA 20** | 20 days | - | - | Quick trend |
| **Bollinger** | 20, 2σ | Upper band | Lower band | Volatility |
| **MACD** | 12,26,9 | - | - | Momentum |

---

## 🔍 Real Example Walkthrough

### Scenario: GOOGL Analysis

**Situation:**
- Time Period: 90 days
- Current Price: $177.90
- Want to: Decide if should buy

**Step 1: Check Trend**
- Enable SMA 20 & SMA 50
- Observe: Price > SMA20 > SMA50 ✅
- **Conclusion:** Clear uptrend

**Step 2: Check Momentum**
- Enable MACD
- Observe: MACD > 0, MACD > Signal ✅
- **Conclusion:** Strong momentum

**Step 3: Check if Overbought**
- Enable RSI
- Observe: RSI = 65 (not extreme)
- **Conclusion:** Not overbought, room to grow

**Step 4: Find Entry**
- Enable Bollinger Bands
- Observe: Price near middle band
- **Conclusion:** Not at extreme, fair price

**Decision:**
✅ **BUY** - All indicators bullish, not overbought, trend confirmed

**Entry:** Current price ($177.90)
**Stop Loss:** Below SMA20 or lower Bollinger Band
**Target:** Upper Bollinger Band or when RSI > 70

---

## 📚 Further Learning

### Practice Workflow

1. **Start simple**: Enable just SMA 20 for 1 week
2. **Add gradually**: Add one new indicator per week
3. **Paper trade**: Test signals without real money
4. **Track results**: Note which indicator combos work best
5. **Specialize**: Focus on 2-3 favorite indicators

### Resources to Explore

- Study historical price + indicators
- Compare multiple stocks with same indicators
- Test different timeframes (30d vs 365d)
- Watch for patterns that repeat
- Learn from both winners and losers

---

**Remember:**
- 📈 **Indicators LAG** - They follow price, don't predict
- 🎯 **Context matters** - Same signal means different things in different markets
- ⚠️ **No holy grail** - No indicator works 100% of time
- 🔄 **Adapt** - Markets change, what works now may not work later
- 💡 **Practice** - The more you use them, the better you'll understand

---

**Happy Trading! 📊**

Indicators are tools, not crystal balls. Use them wisely, combine them intelligently, and always manage your risk!

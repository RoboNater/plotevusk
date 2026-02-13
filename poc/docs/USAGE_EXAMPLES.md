# DebugPlot Usage Examples

## Example 1: Basic Python List

```python
# example1.py
data = [10, 25, 30, 45, 50, 60, 75, 80, 90, 100]
print("Breakpoint here")  # Set breakpoint on this line
```

**Steps:**
1. Set breakpoint on line 3
2. Start debugging (F5)
3. Right-click `data` in Variables pane
4. Select "Plot Variable"
5. See line chart with 10 data points

---

## Example 2: NumPy Array

```python
# example2.py
import numpy as np

# Generate sine wave
x = np.linspace(0, 2*np.pi, 100)
sine = np.sin(x)
cosine = np.cos(x)

print("Breakpoint here")  # Set breakpoint on this line
```

**Steps:**
1. Set breakpoint on line 8
2. Start debugging (F5)
3. Right-click `sine` → Plot Variable → See sine wave
4. Right-click `cosine` → Plot Variable → See cosine wave
5. Observe how NumPy arrays are automatically converted to numeric arrays

---

## Example 3: Data Analysis Workflow

```python
# example3.py
import numpy as np

# Simulate sensor readings
raw_data = np.random.randn(1000) * 10 + 50
filtered_data = np.convolve(raw_data, np.ones(10)/10, mode='same')

mean_value = np.mean(raw_data)
std_dev = np.std(raw_data)

print(f"Mean: {mean_value}, Std Dev: {std_dev}")
print("Breakpoint here")  # Set breakpoint on this line
```

**Steps:**
1. Set breakpoint on line 10
2. Start debugging (F5)
3. Compare visualizations:
   - Plot `raw_data` → See noisy signal
   - Plot `filtered_data` → See smoothed signal
4. Observe effect of moving average filter in action

---

## Example 4: Error Handling & Edge Cases

```python
# example4.py
import numpy as np

valid_data = [1, 2, 3, 4, 5]
empty_data = []
none_data = None
scalar_data = 42
text_data = ['hello', 'world']

print("Breakpoint here")  # Set breakpoint on this line
```

**Try plotting each variable to see error handling:**

| Variable | Result | Message |
|----------|--------|---------|
| `valid_data` | ✅ Chart renders | 5 data points plotted |
| `empty_data` | ❌ Error | "No plottable data in 'empty_data' (variable is empty)" |
| `none_data` | ❌ Error | "No plottable data in 'none_data' (variable is None)" |
| `scalar_data` | ❌ Error | "No plottable data in 'scalar_data' (cannot convert to array)" |
| `text_data` | ❌ Error | "No plottable data in 'text_data' (cannot convert to array)" |

---

## Example 5: Command Palette Usage

If you prefer not to use the context menu, you can also use the Command Palette:

```python
# example5.py
data_a = [1, 2, 4, 8, 16, 32]
data_b = [100, 90, 80, 70, 60, 50]

print("Breakpoint here")  # Set breakpoint on this line
```

**Steps:**
1. Set breakpoint
2. Start debugging (F5)
3. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
4. Type "DebugPlot: Plot Variable"
5. Enter variable name (e.g., `data_a`)
6. Chart appears automatically

---

## Example 6: Working with Large Arrays

```python
# example6.py
import numpy as np

# Test with various sizes
small = np.arange(100)        # 100 elements - ~0.5s render
medium = np.arange(1000)      # 1,000 elements - ~0.5s render
large = np.arange(10000)      # 10,000 elements - ~2s render
too_large = np.arange(50000)  # 50,000+ elements - NOT SUPPORTED

print("Breakpoint here")  # Set breakpoint on this line
```

**Performance Expectations:**
- Small arrays (< 1,000): Instant
- Medium arrays (1,000-10,000): < 2 seconds
- Large arrays (> 10,000): Error message with size limit info

**Note:** The 10,000-element limit is due to the Debug Adapter Protocol (DAP) response size constraint (~43KB). This is a technical limitation of Python debugging, not the DebugPlot extension itself.

---

## Example 7: Exploring Computational Results

```python
# example7.py
import numpy as np

# Compute some analytical results
x = np.linspace(0, 10, 1000)
y = np.sin(x) * np.exp(-x/5)  # Damped sine wave

# Linear regression simulation
slope = 2.5
noise = np.random.randn(100) * 0.5
regression_line = slope * np.arange(100) + noise

print("Computed results")
print("Breakpoint here")  # Set breakpoint on this line
```

**Workflow:**
1. Set breakpoint
2. Start debugging
3. Plot `y` to see the damped oscillation pattern
4. Plot `regression_line` to visualize the noisy linear data
5. Analyze patterns visually while debugging

---

## Tips & Tricks

### Tip 1: Quick Variable Inspection
Right-clicking and plotting is faster than scrolling through variable values in large arrays.

### Tip 2: Theme Awareness
Charts automatically adapt to VS Code's light/dark theme. The grid and background adjust, but axis labels remain consistent (known limitation).

### Tip 3: Multiple Charts
Each plot opens in a new panel. You can open multiple charts simultaneously to compare data side-by-side.

### Tip 4: Variables from Loop Iterations
You can plot variables at different loop iterations:
```python
for i in range(10):
    data = [i*1, i*2, i*3, i*4, i*5]
    print(f"Iteration {i}")  # Set breakpoint here to plot each iteration's data
```

### Tip 5: Nested Structures
You can access nested variables using dot notation in the Command Palette:
```python
class DataContainer:
    def __init__(self):
        self.values = [1, 2, 3, 4, 5]

container = DataContainer()
print("Breakpoint here")
# Can plot: container.values
```

---

## Limitations to Be Aware Of

1. **1D Data Only**: 2D arrays and matrices are not supported
2. **Numeric Data Required**: Text, dates, and mixed-type arrays won't plot
3. **Size Limit**: Maximum 10,000 elements (technical constraint)
4. **Single Chart Type**: Only line charts (no scatter, bar, histogram)
5. **Theme Switching**: Existing chart text colors don't update when theme changes

---

## Troubleshooting

**Problem:** "Plot Variable" option doesn't appear in context menu
- **Solution:** Make sure you're debugging a Python script with `debugpy` enabled

**Problem:** Chart doesn't show up
- **Solution:** Check VS Code Developer Console (Help → Toggle Developer Tools) for error messages

**Problem:** Error "Array is too large to plot"
- **Solution:** The array exceeds 10,000 elements. This is a DAP protocol limitation.

**Problem:** "Cannot convert to array" error for valid data
- **Solution:** Make sure the variable contains only numeric values (no strings, None, or mixed types)

---

## Learn More

- See [../extension/README.md](../extension/README.md) for installation and feature overview

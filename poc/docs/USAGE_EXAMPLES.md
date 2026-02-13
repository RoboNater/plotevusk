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
1. Set breakpoint on line 11
2. Start debugging (F5)
3. Compare visualizations:
   - Plot `raw_data` → See noisy signal
   - Plot `filtered_data` → See smoothed signal
4. Observe effect of moving average filter

## Example 4: Error Handling

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
- `valid_data` → ✅ Chart renders
- `empty_data` → ❌ "No plottable data in 'empty_data' (variable is empty)"
- `none_data` → ❌ "No plottable data in 'none_data' (variable is None)"
- `scalar_data` → ❌ "No plottable data in 'scalar_data' (cannot convert to array)"
- `text_data` → ❌ "No plottable data in 'text_data' (cannot convert to array)"

## Example 5: Large Array Performance

```python
# example5.py
import numpy as np

# Test various sizes
small = np.arange(100)         # Very fast (~0.5s)
medium = np.arange(1000)       # Fast (~0.5s)
large = np.arange(10000)       # Acceptable (~2s)
too_large = np.arange(15000)   # Will show size limit error

print("Breakpoint here")  # Set breakpoint on this line
```

**Steps:**
1. Set breakpoint on line 9
2. Start debugging (F5)
3. Test performance with different sizes:
   - Plot `small` → Instant render
   - Plot `medium` → Fast render
   - Plot `large` → Acceptable delay (~2s)
   - Plot `too_large` → See helpful error message about size limit

## Tips and Best Practices

### Using Command Palette

If you prefer keyboard-driven workflow:
1. Pause at breakpoint
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. Type "plot" and select "DebugPlot: Plot Variable"
4. Enter variable name

### Working with Large Data

For arrays larger than 10,000 elements:
- Consider plotting a slice: `large_array[::10]` (every 10th element)
- Use statistical visualization tools for very large datasets
- DebugPlot is optimized for quick debugging insights, not big data analysis

### Comparing Multiple Variables

To compare multiple variables side-by-side:
1. Plot first variable (creates Panel 1)
2. Plot second variable (creates Panel 2)
3. Drag panels to arrange side-by-side
4. Use "Split Editor Right" to view both simultaneously

### Theme Integration

Charts automatically adapt to your VS Code theme:
- **Dark themes**: Dark background, light grid lines
- **Light themes**: Light background, dark grid lines
- Chart colors remain consistent for readability

Note: If you switch themes while a chart is open, the background and grid will update, but text colors won't change until you create a new chart.

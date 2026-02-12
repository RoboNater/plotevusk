import numpy as np

# Test various array sizes
small = np.arange(100)              # 100 elements
medium = np.arange(1000)            # 1,000 elements (already tested)
large = np.arange(10000)            # 10,000 elements
very_large = np.arange(11000)       # 11,000 elements 
# very_large generates error:
# DebugPlot: Error reading 'very_large': Unterminated fractional number in JSON at position 43691 (line 1 column 43692)

print("Performance test data loaded")
breakpoint()
print("done")

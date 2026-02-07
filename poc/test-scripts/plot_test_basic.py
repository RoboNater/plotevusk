import numpy as np

# Simple 1D data for testing
data_list = [1, 4, 9, 16, 25, 36, 49]
data_np = np.array([2.0, 3.1, 5.2, 4.8, 7.1, 6.5])
data_float_list = [1.1, 2.2, 3.3, 4.4, 5.5]
data_int_range = list(range(10))

# Edge cases
data_single = [42]
data_negative = [-3, -1, 0, 1, 3]

# Exception cases
data_scalar = 5  # scalar, Not a list or array
data_string = 'hello'  # string, Not a list or array
data_null = None  # NoneType, Not a list or array

# Delay 60 seconds
import time
time.sleep(500)

# Set breakpoint on the next line
print("done")  # <-- Breakpoint here

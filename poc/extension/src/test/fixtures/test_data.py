import numpy as np

# Test variables - used by integration tests
data_list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
data_np = np.array([0, 10, 20, 30, 40, 50, 60, 70, 80, 90])
single_value = [42]
large_array = np.arange(1000)  # Array with 1000 elements
empty_list = []
text_data = ['hello', 'world']

# Exception cases
data_none = None
data_scalar = 42
data_undefined_var = None  # Represents an undefined variable

# Breakpoint on the line below
print("Test data loaded")  # <-- Breakpoint here

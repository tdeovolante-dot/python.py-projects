import pandas as pd
import matplotlib.pyplot as plt

#1 Dataset in Rands (Size in sq m, Price in Rands - '000,000)
data = {
    'Size_sqm': [50, 100, 150, 250, 280, 350, 420, 500],
    'Price_M': [0.85, 1.20, 1.50, 1.95, 2.40, 2.85, 3.60, 4.20]
}
# 2. Convert Dictionary to Pandas DataFrame
df = pd.DataFrame(data)

# 3. Calculate linear Regression
n = len(df)
mean_x = df['Size_sqm'].mean()
mean_y = df['Price_M'].mean()

m = sum((df['Size_sqm'] - mean_x) * (df['Price_M'] - mean_y)) / sum((df['Size_sqm'] - mean_x) ** 2)
b = mean_y - (m * mean_x)

print("--- House Price Predictor (ZAR) Loaded ---")

# 4 User Input & Prediction
user_size = float(input("Enter the size of the house in square meters (e.g 150): "))
predicted_price = m * user_size + b
actual_rand_price = predicted_price * 1_000_000  # Convert Millions to full Rand amount

print(f"nPredicted Price for a house of size {user_size} sqm: R{actual_rand_price:,.2f}")

# 5 Plot in Rands
plt.scatter(df['Size_sqm'], df['Price_M'], color='blue', label='Historical Property Data')

line_x = [min(df['Size_sqm']), max(df['Size_sqm'].max(), user_size)]
line_y = [(m * x) + b for x in line_x]
plt.plot(line_x, line_y, color='red', label='Learned Regression Line')

# Highlight the predicted point
plt.scatter([user_size], [predicted_price], color='green', s=100, zorder=5, label=f'Your Input ({user_size} sqm)')


plt.title('SA House size vs Price Predictor (ZAR)')
plt.xlabel('Property Size (sqm)')
plt.ylabel('Property Price (Million ZAR) - R')
plt.legend()
plt.grid()
plt.show()

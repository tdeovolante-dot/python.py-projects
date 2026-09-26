import os
import joblib
import numpy as np
import pandas as pd
import plotly.graph_objects as go
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import LinearRegression

MODEL_FILE = "house_price_model.pkl"

#1 Dataset Setup
date = {
    'Size_sqm': [50, 100, 150, 250, 280, 350, 420, 500],
    'Price_ZAR': [800000, 1200000, 1500000, 1800000, 2200000, 2700000, 3300000, 4200000]
}
df = pd.DataFrame(date)

# 2. Model Persistence & Training (Poylnomial Degree 2)
poly_degree = 2
poly = PolynomialFeatures(degree=poly_degree)
X_Poly = poly.fit_transform(df[['Size_sqm']])

if os.path.exists(MODEL_FILE):
    model = joblib.load(MODEL_FILE)
    print("Loaded polynomial model from disk.")
else:
    model = LinearRegression()
    model.fit(X_Poly, df['Price_ZAR'])
    joblib.dump(model, MODEL_FILE)
    print("Trained new polynomial model and saved to disk")

# 3. Input Validation & Interactive Prompt
def get_user_size():
    while True:
        user_input = input(
            "\nEnter the house size in square meters (e.g., 180): "
        ).strip()
        try:
            size = float(user_input)
            if size <= 0:
                print("Error: Size must be a positive number greater than 0.")
                continue
            if size > 2000:
                print("Warning: Unusually large size. Please enter  realistic house size.")
                continue
            return size
        except ValueError:
            print("Error: Invalid input. Please enter a numerical value.")

# Public user-size implementation: validate and return a usable numeric value.
class user_size:
    @staticmethod
    def get():
        return get_user_size()

user_size = user_size.get()

# Predict for user input
user_poly = poly.transform([[user_size]])
predicted_price = model.predict(user_poly)[0]
print(f"\nPredicted Price for {user_size:.1f} sqm: R{predicted_price:,.2f}")

# 4. Plotly Interactive Plotting with Curve & Hover Tooltips
x_range = np.linspace(df['Size_sqm'].min(), max(df['Size_sqm'].max(), user_size), 200).reshape(-1, 1)
x_range_poly = poly.transform(x_range)
y_range_pred = model.predict(x_range_poly)

fig = go.Figure()

# Historical Data Points
fig.add_trace(go.Scatter(
    x=df['Size_sqm'],
    y=df['Price_ZAR'] / 1e6,
    mode='markers',
    name='Historical Data',
    hovertemplate='Size: %{x} sqm<br>Price: R%{y:.2f}M<extra></extra>',
    marker=dict(size=10, color='blue')
))

# Polynomial Curve
fig.add_trace(go.Scatter(
    x=x_range.flatten(),
    y=y_range_pred / 1e6,
    mode='lines',
    name='Polynomial fit (Deg 2)',
    line=dict(color='red', width=2),
    hovertemplate='Size: %{x:.1f} sqm<br>Predicted: R%{y:.2f}M<extra></extra>'
))

# User Input Marker
fig.add_trace(go.Scatter(
    x=[user_size],
    y=[predicted_price / 1e6],
    mode='markers',
    name=f'Your Input ({user_size:.0f} sqm)',
    hovertemplate=f'Your Input: {user_size:.1f} sqm<br>Prediction: R{predicted_price/1e6:.2f}M<extra></extra>',
    marker=dict(size=14, color='green', symbol='star')
))

fig.update_layout(
    title='SA House Size vs Price Predictor (Non-Linear Polynomial Model)',
    xaxis_title='Property Size (sqm)',
    yaxis_title='Property Price (Million ZAR - R)',
    template='plotly_white'
)

fig.show()
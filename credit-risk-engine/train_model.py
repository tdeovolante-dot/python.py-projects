"""
train_model.py
--------------
Machine Learning Credit Default Model Training Pipeline
Programmed & Engineered by: Lethabo Tsoeute
Academic Profile: Grade 12 Scholar | Prospective Actuarial Science Degree Student

Trains a Random Forest classifier on multidimensional actuarial-credit data
and serializes the production model to models/default_model.pkl.
Part of an applied quantitative portfolio highlighting independent learning to date.

Run once before launching the Streamlit dashboard:
    python train_model.py
"""

__author__ = "Lethabo Tsoeute"
__title__ = "Grade 12 Scholar & Prospective Actuarial Science Student"
__version__ = "2.0.0"

import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import roc_auc_score, classification_report
import joblib


def main():
    # ------------------------------------------------------------------
    # 1. Load the insurance dataset
    # ------------------------------------------------------------------
    data_path = "data/insurance_data.csv"
    if not os.path.exists(data_path):
        raise FileNotFoundError(
            f"Dataset not found at '{data_path}'. "
            "Ensure data/insurance_data.csv exists."
        )

    df = pd.read_csv(data_path)
    print(f"Loaded {len(df)} records from {data_path}")
    print(df.head())

    # ------------------------------------------------------------------
    # 2. Feature engineering  (map to the columns the dashboard expects)
    # ------------------------------------------------------------------
    df["debt_to_income"] = df["DTI_Ratio"] * 100.0
    df["revolving_utilization"] = df["Lambda_Freq"]  # proxy utilization
    df["age"] = df["Age"]
    df["monthly_income"] = df["Income_ZAR"] / 12.0
    df["open_credit_lines"] = df["Claim_Hist_Yrs"]

    # Binary target: 1 = default (Base_PD >= 0.06 threshold)
    df["default_flag"] = (df["Base_PD"] >= 0.06).astype(int)

    feature_cols = [
        "debt_to_income",
        "revolving_utilization",
        "age",
        "monthly_income",
        "open_credit_lines",
    ]

    X = df[feature_cols]
    y = df["default_flag"]

    print(f"\nTarget distribution:\n{y.value_counts()}")
    print(f"Default rate: {y.mean():.2%}")

    # ------------------------------------------------------------------
    # 3. Train / test split
    # ------------------------------------------------------------------
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )

    # ------------------------------------------------------------------
    # 4. Train Random Forest
    # ------------------------------------------------------------------
    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=6,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=42,
    )
    model.fit(X_train, y_train)

    # ------------------------------------------------------------------
    # 5. Evaluate
    # ------------------------------------------------------------------
    y_proba = model.predict_proba(X_test)[:, 1]
    auc = roc_auc_score(y_test, y_proba)
    print(f"\nTest AUC-ROC: {auc:.4f}")
    print(classification_report(y_test, model.predict(X_test), target_names=["Paid", "Default"]))

    # ------------------------------------------------------------------
    # 6. Save model
    # ------------------------------------------------------------------
    os.makedirs("models", exist_ok=True)
    model_path = "models/default_model.pkl"
    joblib.dump(model, model_path)
    print(f"Model saved to {model_path}")


if __name__ == "__main__":
    main()

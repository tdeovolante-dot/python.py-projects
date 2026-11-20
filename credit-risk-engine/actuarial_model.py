"""
Actuarial Risk Engine & Stochastic Credit Stress-Testing Pipeline
=================================================================
Programmed & Engineered by: Lethabo Tsoeute
Academic Profile: Grade 12 Scholar | Prospective Actuarial Science Degree Student
Project Mission: Applied portfolio showcasing independent study and programming in
                 collective risk theory, compound Poisson-Gamma processes, solvency
                 loadings, and financial stress-testing.
"""

__author__ = "Lethabo Tsoeute"
__title__ = "Grade 12 Scholar & Prospective Actuarial Science Student"
__version__ = "2.0.0"

import numpy as np
import pandas as pd
from scipy.stats import poisson, gamma


class ActuarialCreditModel:
    """
    Actuarial Risk Engine & Stochastic Credit Stress-Testing Pipeline.
    Integrates Compound Poisson-Gamma claims with Logistic Credit PD Shocks.
    """
    def __init__(self, df: pd.DataFrame, seed: int = 42):
        self.df = df.copy()
        np.random.seed(seed)

    def calculate_actuarial_baselines(self) -> pd.DataFrame:
        """Computes deterministic pure premiums in ZAR."""
        self.df['Pure_Premium_ZAR'] = self.df['Lambda_Freq'] * self.df['Expected_Severity_ZAR']
        return self.df

    def run_monte_carlo_simulation(self, n_sims: int = 10000, shape_alpha: float = 1.2) -> tuple:
        """
        Executes a 10,000-trial Monte Carlo simulation using Compound Poisson-Gamma processes.
        Returns:
            - Updated DataFrame with VaR/TVaR metrics
            - Full policy simulation matrix (n_policies x n_sims)
        """
        n_policies = len(self.df)
        sim_matrix = np.zeros((n_policies, n_sims))

        for i, row in self.df.iterrows():
            lam = row['Lambda_Freq']
            sev_mean = row['Expected_Severity_ZAR']
            scale_beta = sev_mean / shape_alpha

            # 1. Sample claim counts for all trials
            claim_counts = np.random.poisson(lam, size=n_sims)

            # 2. Vectorized sampling for non-zero claim events
            for sim_idx in range(n_sims):
                count = claim_counts[sim_idx]
                if count > 0:
                    claims = np.random.gamma(shape_alpha, scale_beta, size=count)
                    sim_matrix[i, sim_idx] = np.sum(claims)

        # Calculate policyholder-level risk metrics
        self.df['MC_Mean_Loss_ZAR'] = sim_matrix.mean(axis=1)
        self.df['MC_VaR_95_ZAR'] = np.percentile(sim_matrix, 95, axis=1)

        tvar_list = []
        for i in range(n_policies):
            var_threshold = self.df.loc[i, 'MC_VaR_95_ZAR']
            tail_losses = sim_matrix[i, sim_matrix[i, :] >= var_threshold]
            tvar_list.append(tail_losses.mean() if len(tail_losses) > 0 else var_threshold)

        self.df['MC_TVaR_95_ZAR'] = tvar_list
        return self.df, sim_matrix

    def price_medical_aid_plans(self, admin_cost_zar: float = 4800.0, profit_margin: float = 0.10) -> pd.DataFrame:
        """
        Applies a commercial solvency-loaded pricing algorithm to derive monthly premiums.
        """
        # Risk loading: 15% on 95% VaR buffer
        var_buffer = self.df['MC_VaR_95_ZAR'] - self.df['Pure_Premium_ZAR']
        risk_loaded_annual = self.df['Pure_Premium_ZAR'] + (0.15 * var_buffer)

        # Commercial gross premium
        self.df['Annual_Premium_ZAR'] = (risk_loaded_annual + admin_cost_zar) / (1.0 - profit_margin)
        self.df['Monthly_Premium_ZAR'] = self.df['Annual_Premium_ZAR'] / 12.0
        return self.df

    def stress_test_credit_pd(self, sim_matrix: np.ndarray) -> pd.DataFrame:
        """
        Integrates simulated healthcare cash-flow shocks into the Credit PD model.
        Uses a generalized logistic link function to adjust default probabilities dynamically.
        """
        n_policies, n_sims = sim_matrix.shape
        adjusted_pds = []

        for i, row in self.df.iterrows():
            monthly_income = row['Income_ZAR'] / 12.0
            base_score = row['Credit_Score']
            dti = row['DTI_Ratio']
            monthly_premium = row['Monthly_Premium_ZAR']

            # Simulate trial-by-trial financial strain
            sim_claim_losses = sim_matrix[i, :]

            # FCF Ratio = (Monthly Income - Fixed Debt - Premium - Stochastic Claim) / Monthly Income
            monthly_debt = monthly_income * dti
            free_cash_flow = monthly_income - monthly_debt - monthly_premium - (sim_claim_losses / 12.0)

            # Stress condition: Default probability spikes when cash flow drops below 10% of monthly income
            fcf_ratio = free_cash_flow / monthly_income
            stress_factor = np.where(fcf_ratio < 0.10, (0.10 - fcf_ratio) * 2.5, 0.0)

            # Recalculate mean stressed Probability of Default across all MC scenarios
            stressed_pd_trials = 1.0 / (1.0 + np.exp(-(-5.0 + (3.0 * dti) - (0.005 * (base_score - 600)) + stress_factor)))
            adjusted_pds.append(np.mean(stressed_pd_trials))

        self.df['Stressed_PD'] = adjusted_pds
        self.df['PD_Delta_%'] = ((self.df['Stressed_PD'] - self.df['Base_PD']) / self.df['Base_PD']) * 100.0
        return self.df


class MedicalAidPricePredictor:
    """
    Actuarial Medical Scheme & Health Insurance Pricing Engine.
    Calculates gross monthly premiums based on risk loading, plan cover tiers,
    demographics, and prescribed solvency buffers.
    """

    # Base actuarial tariffs per plan tier (Annual ZAR base risk)
    PLAN_BASE_RATES = {
        "Essential / Entry": 14400.0,        # R1,200/pm base
        "Core / Hospital": 28800.0,           # R2,400/pm base
        "Comprehensive / Savings": 54000.0,   # R4,500/pm base
        "Executive / Elite": 96000.0          # R8,000/pm base
    }

    def __init__(self, admin_fee_monthly: float = 380.0, target_solvency_margin: float = 0.12):
        self.admin_fee_monthly = admin_fee_monthly
        self.solvency_margin = target_solvency_margin

    def calculate_health_risk_factor(self, age: int, bmi: float, smoker: bool, chronic_conditions: int) -> float:
        """Computes composite health risk multiplier (HRF)."""
        # Age curve factor (exponential scaling past 30)
        age_factor = 1.0 + max(0, (age - 30) * 0.018)

        # BMI risk curve
        if bmi < 18.5:
            bmi_factor = 1.05
        elif 18.5 <= bmi <= 24.9:
            bmi_factor = 1.00
        elif 25.0 <= bmi <= 29.9:
            bmi_factor = 1.12
        else:  # BMI >= 30 (Obese)
            bmi_factor = 1.30

        # Smoker & Chronic multipliers
        smoker_factor = 1.35 if smoker else 1.00
        chronic_factor = 1.00 + (chronic_conditions * 0.22)

        return age_factor * bmi_factor * smoker_factor * chronic_factor

    def predict_premium(
        self,
        age: int,
        bmi: float,
        smoker: bool,
        plan_tier: str,
        adult_dependents: int = 0,
        child_dependents: int = 0,
        chronic_conditions: int = 0
    ) -> dict:
        """
        Calculates monthly premium breakdown for a main member + dependents.
        """
        base_annual = self.PLAN_BASE_RATES.get(plan_tier, 28800.0)
        hrf = self.calculate_health_risk_factor(age, bmi, smoker, chronic_conditions)

        # Risk-adjusted pure annual premium for main member
        main_member_pure = base_annual * hrf

        # Dependent pricing (Adults at 75% of main risk, Children at 40%)
        adult_dep_pure = adult_dependents * (base_annual * 0.75 * (1.0 + max(0, (age - 30) * 0.01)))
        child_dep_pure = child_dependents * (base_annual * 0.40)

        total_pure_annual = main_member_pure + adult_dep_pure + child_dep_pure

        # Solvency buffer & administrative loading
        gross_annual = (total_pure_annual / (1.0 - self.solvency_margin)) + (self.admin_fee_monthly * 12)
        gross_monthly = gross_annual / 12.0

        return {
            "Gross_Monthly_Premium_ZAR": round(gross_monthly, 2),
            "Pure_Risk_Premium_Monthly": round(total_pure_annual / 12.0, 2),
            "Health_Risk_Factor": round(hrf, 3),
            "Admin_Fee_Monthly": self.admin_fee_monthly,
            "Solvency_Loading_Monthly": round((gross_annual * self.solvency_margin) / 12.0, 2),
            "Main_Member_Monthly": round((main_member_pure / 12.0), 2),
            "Dependents_Monthly": round((adult_dep_pure + child_dep_pure) / 12.0, 2)
        }

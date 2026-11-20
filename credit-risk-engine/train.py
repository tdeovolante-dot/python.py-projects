"""
Credit Risk Terminal & Actuarial Pricing Engine
====================================================
Programmed & Engineered by: Lethabo Tsoeute
Academic Profile: Grade 12 Scholar | Prospective Actuarial Science Degree Student
Project Mission: Applied portfolio synthesizing independent learning in quantitative
                 finance, actuarial risk mathematics, stochastic modeling, and machine learning.
"""

__author__ = "Lethabo Tsoeute"
__title__ = "Grade 12 Scholar & Prospective Actuarial Science Student"
__version__ = "2.0.0"
__maintainer__ = "Lethabo Tsoeute"

from importlib import import_module
from datetime import datetime

# 1. DEPENDENCY CHECKS
try:
    st = import_module("streamlit")
except ModuleNotFoundError as exc:
    raise RuntimeError(
        "Streamlit is not installed. Install with: "
        "python -m pip install streamlit pandas numpy plotly joblib scipy scikit-learn"
    ) from exc

pd = import_module("pandas")
np = import_module("numpy")
go = import_module("plotly.graph_objects")
px = import_module("plotly.express")

# 2. PAGE CONFIGURATION & TERMINAL STYLING
st.set_page_config(page_title="Credit Risk Terminal", layout="wide")

# CSS block for dark, terminal-like aesthetic
st.markdown("""
<style>
    .stApp { background-color: #0e1117; }
    h1, h2, h3, h4, p, label { color: #00FF00 !important; font-family: 'Courier New', monospace; }
</style>
""", unsafe_allow_html=True)

# ---------- ZAR Formatter ----------
def format_zar(value: float, decimals: int = 2) -> str:
    """Format a numeric value as South African Rand."""
    return f"R {value:,.{decimals}f}"


# 3. SA COMPANY & BANK BENCHMARK PRESETS (ZAR)
SA_PRESETS = {
    "SBK.JO - Standard Bank Group": {"cap": 310000.0, "price": 195.0, "vol": 0.28, "lt_debt": 180000.0, "st_debt": 25000.0},
    "FSR.JO - FirstRand Limited": {"cap": 380000.0, "price": 68.5, "vol": 0.25, "lt_debt": 210000.0, "st_debt": 30000.0},
    "ABG.JO - Absa Group": {"cap": 145000.0, "price": 172.0, "vol": 0.31, "lt_debt": 95000.0, "st_debt": 15000.0},
    "NED.JO - Nedbank Group": {"cap": 115000.0, "price": 235.0, "vol": 0.29, "lt_debt": 78000.0, "st_debt": 12000.0},
    "CPI.JO - Capitec Bank": {"cap": 310000.0, "price": 2650.0, "vol": 0.34, "lt_debt": 15000.0, "st_debt": 5000.0},
    "DAL - Custom / Overseas Baseline": {"cap": 17992.0, "price": 28.0, "vol": 0.4819, "lt_debt": 35728.0, "st_debt": 2662.0}
}

SA_BENCHMARKS = {
    "Standard Bank": {"tier1_ratio": 14.2, "npl_ratio": 3.8, "roa": 1.4, "cost_to_income": 56.1},
    "FirstRand":     {"tier1_ratio": 15.1, "npl_ratio": 3.2, "roa": 2.1, "cost_to_income": 51.3},
    "Absa":          {"tier1_ratio": 13.5, "npl_ratio": 4.5, "roa": 1.2, "cost_to_income": 58.7},
    "Nedbank":       {"tier1_ratio": 13.8, "npl_ratio": 4.1, "roa": 1.3, "cost_to_income": 57.2},
    "Capitec":       {"tier1_ratio": 28.5, "npl_ratio": 5.1, "roa": 4.8, "cost_to_income": 38.9},
}

# ---------- Load CSV dataset ----------
@st.cache_data
def load_insurance_data():
    """Load the 30-policy insurance/credit dataset."""
    try:
        return pd.read_csv("data/insurance_data.csv")
    except FileNotFoundError:
        return None

df_insurance = load_insurance_data()

# ---------- Import actuarial models ----------
try:
    from actuarial_model import ActuarialCreditModel, MedicalAidPricePredictor
    ACTUARIAL_AVAILABLE = True
except ImportError:
    ACTUARIAL_AVAILABLE = False

# 4. SIDEBAR: DEVELOPER SIGNATURE & MODEL INPUTS (ZAR)
st.sidebar.markdown("""
<div style="border: 1px solid #00FF00; border-radius: 6px; padding: 12px 14px; margin-bottom: 20px; background-color: #0b1410;">
    <div style="font-size: 10px; color: #66ff66; text-transform: uppercase; letter-spacing: 1.2px; font-weight: 600;">Developer Profile & Portfolio</div>
    <div style="font-size: 16px; font-weight: bold; color: #00FF00; font-family: 'Courier New', monospace; margin: 3px 0;">Lethabo Tsoeute</div>
    <div style="font-size: 11px; color: #a0c4ab; line-height: 1.4; font-weight: 500;">Grade 12 Scholar &bull; Prospective Actuarial Science University Student</div>
    <div style="font-size: 10px; color: #7f9f88; margin-top: 6px; border-top: 1px dashed #204028; padding-top: 5px; font-style: italic;">"Applied portfolio showcasing what I have learned so far in actuarial mathematics & quantitative modeling."</div>
</div>
""", unsafe_allow_html=True)

st.sidebar.title("MODEL INPUTS (ZAR)")
st.sidebar.markdown("*Select an SA benchmark or adjust sliders to stress-test the company.*")

preset_choice = st.sidebar.selectbox("Load Company Preset", list(SA_PRESETS.keys()))
defaults = SA_PRESETS[preset_choice]

ticker = st.sidebar.text_input("Ticker Symbol", value=preset_choice.split(" - ")[0])
market_cap = st.sidebar.number_input("Market Cap (ZAR M)", min_value=1.0, value=float(defaults["cap"]), step=100.0)
share_price = st.sidebar.number_input("Share Price (ZAR)", min_value=0.1, value=float(defaults["price"]), step=1.0)
price_vol = st.sidebar.slider("Price Volatility (1-Yr %)", min_value=0.0, max_value=1.0, value=float(defaults["vol"]))
long_term_debt = st.sidebar.number_input("Long-Term Debt (ZAR M)", min_value=0.0, value=float(defaults["lt_debt"]), step=100.0)
short_term_debt = st.sidebar.number_input("Short-Term Debt (ZAR M)", min_value=0.0, value=float(defaults["st_debt"]), step=100.0)

# Auto-calculate total debt
total_debt = long_term_debt + short_term_debt
st.sidebar.markdown(f"**Total Debt:** {format_zar(total_debt)} M")

# --- SIDEBAR: Actuarial Health Inputs ---
st.sidebar.markdown("---")
st.sidebar.title("HEALTH & ACTUARIAL INPUTS")

if df_insurance is not None:
    policy_ids = df_insurance["Policy_ID"].tolist()
    selected_policy = st.sidebar.selectbox("Select Policy (from CSV)", policy_ids)
    policy_row = df_insurance[df_insurance["Policy_ID"] == selected_policy].iloc[0]
    age_input = int(policy_row["Age"])
    bmi_input = float(policy_row["BMI"])
    smoker_input = policy_row["Smoker"] == "Yes"
    lambda_freq = float(policy_row["Lambda_Freq"])
    expected_severity = float(policy_row["Expected_Severity_ZAR"])
    income_zar = float(policy_row["Income_ZAR"])
    credit_score = int(policy_row["Credit_Score"])
    dti_ratio = float(policy_row["DTI_Ratio"])
    base_pd = float(policy_row["Base_PD"])
else:
    # Manual fallback inputs
    age_input = st.sidebar.slider("Age", 18, 65, 35)
    bmi_input = st.sidebar.slider("BMI", 15.0, 45.0, 25.0)
    smoker_input = st.sidebar.checkbox("Smoker", value=False)
    lambda_freq = st.sidebar.slider("Claim Frequency (λ)", 0.01, 0.50, 0.12)
    expected_severity = st.sidebar.number_input("Expected Severity (ZAR)", 5000.0, 200000.0, 45000.0)
    income_zar = st.sidebar.number_input("Annual Income (ZAR)", 100000.0, 2000000.0, 480000.0)
    credit_score = st.sidebar.slider("Credit Score", 300, 850, 650)
    dti_ratio = st.sidebar.slider("DTI Ratio", 0.0, 0.80, 0.35)
    base_pd = 0.075

plan_tier = st.sidebar.selectbox("Medical Aid Plan Tier", [
    "Essential / Entry", "Core / Hospital", "Comprehensive / Savings", "Executive / Elite"
])
adult_deps = st.sidebar.number_input("Adult Dependents", 0, 5, 0)
child_deps = st.sidebar.number_input("Child Dependents", 0, 8, 0)
chronic_conditions = st.sidebar.number_input("Chronic Conditions", 0, 5, 0)

# =====================================================================
# 5. MAIN DASHBOARD AREA
# =====================================================================
st.title(f"Terminal: [{ticker}] Credit Risk Scorecard")
st.markdown(
    "<p style='color: #88c999 !important; font-size: 13px; margin-top: -12px; margin-bottom: 8px; font-family: \"Courier New\", monospace;'>"
    "Programmed & Engineered by <strong>Lethabo Tsoeute</strong> &nbsp;|&nbsp; "
    "<span style='color: #00FF00;'>Grade 12 Scholar &amp; Prospective Actuarial Science Degree Student</span>"
    "</p>",
    unsafe_allow_html=True
)

with st.expander("🎓 About the Developer & Independent Actuarial Learning Synopsis"):
    st.markdown(r"""
    **Developer:** **Lethabo Tsoeute**  
    **Academic Status:** Grade 12 Scholar & Prospective Actuarial Science University Student  
    
    > *"This terminal is an applied portfolio demonstrating what I have studied and programmed so far in preparation for reading for an Actuarial Science degree at university."*
    
    #### Key Actuarial & Quantitative Concepts Modeled in This Platform:
    1. **Stochastic Claims Modeling (Collective Risk Theory):** 
       Compound Poisson-Gamma process combining claim occurrence frequencies ($\lambda$) with severity distributions via 10,000 Monte Carlo trials.
    2. **Solvency Capital & Tail Risk Metrics:** 
       Computation of 95% Value at Risk (VaR) and Tail Value at Risk (TVaR / Expected Shortfall) to calibrate statutory solvency margins.
    3. **Credit Risk & Stochastic Cash-Flow Shocks:** 
       Generalized logistic link function dynamically evaluating default probability (PD) shifts under simulated healthcare financial burdens.
    4. **Geometric Brownian Motion (GBM):** 
       Multi-path asset price simulation under drift-diffusion mechanics to model Merton structural debt-barrier breaches.
    5. **Machine Learning Risk Classification:** 
       Supervised Random Forest classification trained on multifaceted borrower and policy metrics.
    6. **South African Banking Prudential Benchmarks:** 
       Comparative analysis of Tier 1 capital ratios, non-performing loans (NPL), ROA, and cost-to-income metrics across Standard Bank, FirstRand, Absa, Nedbank, and Capitec.
    """)
st.markdown("---")

# 6. TOP METRICS (THE SCORECARD)
col1, col2, col3, col4 = st.columns(4)

# Simulated default probability calculation
simulated_default_prob = (total_debt / market_cap) * (price_vol / 100) * 1.5

with col1:
    st.metric(label="1-Yr Default Prob", value=f"{simulated_default_prob:.2%}", delta="-0.15%")
with col2:
    st.metric(label="5-Yr Market CDS", value="542 bps", delta="12 bps")
with col3:
    st.metric(label="Debt/Equity (%)", value=f"{(total_debt / market_cap) * 100:.2f}%", delta="-3.1%")
with col4:
    st.metric(label="Share Price", value=format_zar(share_price), delta="+0.54")

st.markdown("---")

# 7. SA BANK BENCHMARKS TABLE
st.subheader("SA Bank Regulatory Benchmarks")
bench_df = pd.DataFrame.from_dict(SA_BENCHMARKS, orient="index")
bench_df.index.name = "Bank"
bench_df.columns = ["Tier 1 Capital (%)", "NPL Ratio (%)", "ROA (%)", "Cost-to-Income (%)"]
st.dataframe(bench_df, use_container_width=True)

st.markdown("---")

# 8. INTERACTIVE TERMINAL CHART
st.subheader("1-Yr Default Prob vs Share Price History")

# Generate fake historical data for chart display
dates = pd.date_range(end=datetime.today(), periods=200)
np.random.seed(42)
mock_price = share_price + np.cumsum(np.random.normal(0, 1.5, 200))
mock_risk = np.clip(simulated_default_prob + np.random.normal(0, 0.005, 200), 0.001, 1.0)

fig = go.Figure()
fig.add_trace(go.Scatter(x=dates, y=mock_price, name="Share Price (ZAR)", line=dict(color="white", width=2)))
fig.add_trace(go.Scatter(x=dates, y=mock_risk, name="Default Prob (%)", line=dict(color="#00FF00", width=2), yaxis="y2"))

fig.update_layout(
    plot_bgcolor="black",
    paper_bgcolor="black",
    font=dict(color="white"),
    xaxis=dict(gridcolor="#333333"),
    yaxis=dict(title="Share Price (ZAR)", gridcolor="#333333"),
    yaxis2=dict(title="Default Prob (%)", overlaying="y", side="right", gridcolor="#333333")
)
st.plotly_chart(fig, use_container_width=True)

# 9. SECTOR COMPARISON TABLE
st.subheader("Sector Comparison | Banking & Financial Services (SA)")

mock_sector = pd.DataFrame({
    "Ticker": ["SBK.JO", "FSR.JO", "ABG.JO", "NED.JO", "CPI.JO"],
    "Debt/Equity (%)": [58.06, 55.26, 65.51, 67.82, 4.83],
    "EBIT/Int Exp": [3.2, 4.1, 2.9, 3.0, 8.5],
    "Int Coverage": [4.1, 5.2, 3.8, 3.9, 10.2],
    "ROA (%)": [1.4, 2.1, 1.2, 1.3, 4.8]
})
st.dataframe(mock_sector, use_container_width=True, hide_index=True)

# 10. MACHINE LEARNING MODEL INTEGRATION
st.subheader("Live AI Model Prediction")
st.caption("Connects directly to the Random Forest model trained in 'train_model.py'")

try:
    joblib = import_module("joblib")
    model_path = "models/default_model.pkl"
    model = joblib.load(model_path)

    # Feature mapping based on UI inputs
    live_features = pd.DataFrame([{
        'debt_to_income': (total_debt / market_cap) * 100,
        'revolving_utilization': (price_vol / 100),
        'age': age_input,
        'monthly_income': income_zar / 12.0,
        'open_credit_lines': 7
    }])

    ml_prediction = model.predict_proba(live_features)[0][1]

    if ml_prediction > 0.5:
        st.error(f"⚠ High Risk Detected! The AI predicts a {ml_prediction * 100:.2f}% chance of default.")
    else:
        st.success(f"✅ Safe! The AI predicts a {ml_prediction * 100:.2f}% chance of default.")

except Exception:
    st.warning("⚠ ML Model not found. Run `python train_model.py` first to generate the .pkl file.")

# =====================================================================
# 11. MONTE CARLO CREDIT RISK SIMULATION
# =====================================================================
st.markdown("---")
st.subheader("Monte Carlo Credit Risk Simulation")

mc_paths = st.sidebar.slider("Monte Carlo Simulation Paths", min_value=100, max_value=2000, value=500, step=100)
trading_days = 252
dt = 1 / trading_days
mu = 0.05  # 5% drift assumption

# Generate random normal distribution shocks
np.random.seed(42)
shocks = np.random.normal(0, 1, (trading_days, mc_paths))

# Calculate daily price paths via Geometric Brownian Motion (GBM)
sigma = price_vol
price_matrix = np.zeros((trading_days, mc_paths))
price_matrix[0] = share_price

for t in range(1, trading_days):
    drift = (mu - 0.5 * (sigma ** 2)) * dt
    diffusion = sigma * np.sqrt(dt) * shocks[t]
    price_matrix[t] = price_matrix[t - 1] * np.exp(drift + diffusion)

# Define default barrier based on leverage ratio
leverage_ratio = total_debt / (market_cap + total_debt)
default_barrier = share_price * leverage_ratio

# Identify paths that breached the threshold
defaulted_paths = np.any(price_matrix < default_barrier, axis=0)
mc_default_rate = np.sum(defaulted_paths) / mc_paths * 100

st.metric(
    label="Simulated 1-Yr Breach Probability",
    value=f"{mc_default_rate:.2f}%",
    help="Percentage of paths crossing below debt barrier"
)

# Render simulation plot (first 100 paths for performance)
display_paths = min(100, mc_paths)
fig_mc = go.Figure()

for i in range(display_paths):
    line_color = "red" if defaulted_paths[i] else "rgba(0, 255, 0, 0.15)"
    fig_mc.add_trace(go.Scatter(
        y=price_matrix[:, i],
        mode="lines",
        line=dict(width=1, color=line_color),
        showlegend=False
    ))

# Add Default Barrier Line
fig_mc.add_hline(
    y=default_barrier,
    line_dash="dash",
    line_color="red",
    annotation_text=f"Default Threshold ({format_zar(default_barrier)})"
)

fig_mc.update_layout(
    plot_bgcolor="black",
    paper_bgcolor="black",
    font=dict(color="white"),
    margin=dict(l=20, r=20, t=30, b=20),
    xaxis=dict(title="Trading Days", gridcolor="#222222"),
    yaxis=dict(title="Share Price (ZAR)", gridcolor="#222222")
)

st.plotly_chart(fig_mc, use_container_width=True)

# =====================================================================
# 12. MEDICAL AID & INSURANCE PRICE PREDICTOR UI
# =====================================================================
st.markdown("---")
st.header("🏥 Medical Aid & Health Insurance Price Predictor")
st.caption("Predicts monthly gross premiums, solvency loadings, and risk adjustments using actuarial tariff curves.")

col_left, col_right = st.columns([1, 1])

with col_left:
    st.subheader("📋 Member & Risk Profile")

    plan_tier_ui = st.selectbox(
        "Select Scheme Plan Tier",
        ["Essential / Entry", "Core / Hospital", "Comprehensive / Savings", "Executive / Elite"],
        index=1,
        key="plan_tier_ui"
    )

    c1, c2 = st.columns(2)
    with c1:
        member_age = st.number_input("Member Age", min_value=18, max_value=85, value=age_input, key="member_age_ui")
        member_bmi = st.number_input("BMI Index", min_value=12.0, max_value=50.0, value=bmi_input, step=0.5, key="member_bmi_ui")
    with c2:
        is_smoker = st.radio("Smoker Status", ["Non-Smoker", "Smoker"], key="smoker_ui") == "Smoker"
        chronics = st.number_input("Chronic Conditions Count", min_value=0, max_value=10, value=chronic_conditions, key="chronics_ui")

    st.markdown("##### 👨‍👩‍👧 Family & Dependents")
    d1, d2 = st.columns(2)
    with d1:
        num_adult_deps = st.number_input("Adult Dependents", min_value=0, max_value=5, value=adult_deps, key="adult_deps_ui")
    with d2:
        num_child_deps = st.number_input("Child Dependents", min_value=0, max_value=10, value=child_deps, key="child_deps_ui")

# Instantiate Predictor Engine
if ACTUARIAL_AVAILABLE:
    predictor = MedicalAidPricePredictor(admin_fee_monthly=420.0, target_solvency_margin=0.15)
    pricing = predictor.predict_premium(
        age=member_age,
        bmi=member_bmi,
        smoker=is_smoker,
        plan_tier=plan_tier_ui,
        adult_dependents=num_adult_deps,
        child_dependents=num_child_deps,
        chronic_conditions=chronics
    )

    estimated_monthly_premium = pricing["Gross_Monthly_Premium_ZAR"]

    with col_right:
        st.subheader("💰 Predicted Premium Output")

        # Display main predicted price card
        st.metric(
            label=f"Estimated Gross Monthly Premium ({plan_tier_ui})",
            value=format_zar(pricing['Gross_Monthly_Premium_ZAR']),
            delta=f"Risk Multiplier: {pricing['Health_Risk_Factor']}x",
            delta_color="off"
        )

        # Granular Metrics Grid
        m1, m2, m3 = st.columns(3)
        m1.metric("Base Risk Portion", format_zar(pricing['Pure_Risk_Premium_Monthly']))
        m2.metric("Solvency Buffer", format_zar(pricing['Solvency_Loading_Monthly']))
        m3.metric("Admin Fee", format_zar(pricing['Admin_Fee_Monthly']))

        # Cost Composition Donut Chart
        labels = ['Main Member Risk', 'Dependents Risk', 'Solvency Loading', 'Admin Fee']
        values = [
            pricing['Main_Member_Monthly'],
            pricing['Dependents_Monthly'],
            pricing['Solvency_Loading_Monthly'],
            pricing['Admin_Fee_Monthly']
        ]

        fig_donut = go.Figure(data=[go.Pie(
            labels=labels,
            values=values,
            hole=.5,
            marker_colors=['#00CC96', '#636EFA', '#EF553B', '#AB63FA']
        )])
        fig_donut.update_layout(
            title_text="Monthly Premium Cost Breakdown",
            paper_bgcolor="black",
            plot_bgcolor="black",
            font=dict(color="white"),
            margin=dict(l=20, r=20, t=40, b=20),
            height=260
        )
        st.plotly_chart(fig_donut, use_container_width=True)
else:
    estimated_monthly_premium = 3500.0
    with col_right:
        st.warning("Actuarial model module not found. Using fallback premium estimate.")

# =====================================================================
# 13. ACTUARIAL HEALTH RISK & CASH-FLOW STRESS TEST
# =====================================================================
st.markdown("---")
st.header("🏥 Actuarial Health Risk & Cash-Flow Stress Test")

# Run 10,000 Compound Poisson-Gamma Trials
n_sims_health = 10000
shape_alpha = 1.2
scale_beta = expected_severity / shape_alpha

np.random.seed(99)
claim_counts = np.random.poisson(lambda_freq, size=n_sims_health)
sim_losses = np.array([
    np.sum(np.random.gamma(shape_alpha, scale_beta, size=c)) if c > 0 else 0.0
    for c in claim_counts
])

var_95 = np.percentile(sim_losses, 95)
tvar_95 = sim_losses[sim_losses >= var_95].mean() if np.any(sim_losses >= var_95) else var_95

# Display Metrics
col_a, col_b, col_c = st.columns(3)
col_a.metric("Predicted Monthly Premium", format_zar(estimated_monthly_premium))
col_b.metric("95% Annual Loss VaR", format_zar(var_95))
col_c.metric("95% Tail Loss (TVaR)", format_zar(tvar_95))

# Plot Claims Loss Distribution using Plotly
fig_actuarial = px.histogram(
    sim_losses, nbins=50,
    title="Simulated Annual Medical Claim Losses (ZAR)",
    labels={'value': 'Claim Loss (R)'}
)
fig_actuarial.update_layout(
    plot_bgcolor="black",
    paper_bgcolor="black",
    font=dict(color="white"),
    xaxis=dict(gridcolor="#333333"),
    yaxis=dict(gridcolor="#333333"),
)
st.plotly_chart(fig_actuarial, use_container_width=True)

# =====================================================================
# 14. FULL ACTUARIAL PIPELINE (30-POLICY PORTFOLIO)
# =====================================================================
st.markdown("---")
st.header("📊 Full Portfolio: Actuarial Credit Stress-Test Pipeline")

if ACTUARIAL_AVAILABLE and df_insurance is not None:
    with st.spinner("Running 10,000-trial Monte Carlo simulation across 30 policies..."):
        engine = ActuarialCreditModel(df_insurance)
        engine.calculate_actuarial_baselines()
        df_simulated, sim_matrix = engine.run_monte_carlo_simulation(n_sims=10000)
        engine.price_medical_aid_plans()
        df_final = engine.stress_test_credit_pd(sim_matrix)

    # Summary table
    display_cols = [
        "Policy_ID", "Age", "Income_ZAR", "Credit_Score", "DTI_Ratio",
        "Monthly_Premium_ZAR", "MC_VaR_95_ZAR", "MC_TVaR_95_ZAR",
        "Base_PD", "Stressed_PD", "PD_Delta_%"
    ]
    st.dataframe(
        df_final[display_cols].style.format({
            "Income_ZAR": "R {:,.0f}",
            "Monthly_Premium_ZAR": "R {:,.2f}",
            "MC_VaR_95_ZAR": "R {:,.2f}",
            "MC_TVaR_95_ZAR": "R {:,.2f}",
            "Base_PD": "{:.3f}",
            "Stressed_PD": "{:.3f}",
            "PD_Delta_%": "{:+.1f}%",
        }),
        use_container_width=True,
        hide_index=True,
    )

    # PD Delta bar chart
    fig_pd = go.Figure()
    colors = ["red" if d > 0 else "#00FF00" for d in df_final["PD_Delta_%"]]
    fig_pd.add_trace(go.Bar(
        x=df_final["Policy_ID"],
        y=df_final["PD_Delta_%"],
        marker_color=colors,
        text=[f"{v:+.1f}%" for v in df_final["PD_Delta_%"]],
        textposition="outside"
    ))
    fig_pd.update_layout(
        title="PD Stress Delta by Policy (% change from Base PD)",
        plot_bgcolor="black",
        paper_bgcolor="black",
        font=dict(color="white"),
        xaxis=dict(title="Policy ID", gridcolor="#222222"),
        yaxis=dict(title="PD Delta (%)", gridcolor="#222222"),
    )
    st.plotly_chart(fig_pd, use_container_width=True)

    # Portfolio-level summary
    col_s1, col_s2, col_s3 = st.columns(3)
    col_s1.metric("Avg Base PD", f"{df_final['Base_PD'].mean():.3f}")
    col_s2.metric("Avg Stressed PD", f"{df_final['Stressed_PD'].mean():.3f}")
    col_s3.metric("Avg PD Delta", f"{df_final['PD_Delta_%'].mean():+.1f}%")

elif df_insurance is None:
    st.error("Dataset `data/insurance_data.csv` not found. Place the 30-policy CSV in the data/ folder.")
else:
    st.warning("Install `scipy` to enable the full actuarial pipeline: `pip install scipy`")

# =====================================================================
# FOOTER & DEVELOPER SIGNATURE
# =====================================================================
st.markdown("---")
col_foot1, col_foot2 = st.columns([3, 2])
with col_foot1:
    st.markdown("""
    <div style="font-family: 'Courier New', monospace; color: #88c999; font-size: 12px; line-height: 1.5;">
        <span style="color: #00FF00; font-weight: bold;">Credit Risk Terminal v2.0</span> &nbsp;|&nbsp; 
        Programmed & Engineered by <strong style="color: #00FF00;">Lethabo Tsoeute</strong><br/>
        <span style="color: #bbb;">Grade 12 Scholar &bull; Prospective Actuarial Science University Student &bull; Independent Applied Portfolio</span>
    </div>
    """, unsafe_allow_html=True)
with col_foot2:
    st.markdown(f"""
    <div style="font-family: 'Courier New', monospace; color: #777; font-size: 11px; text-align: right; line-height: 1.5;">
        Engine Status: <span style="color: #00FF00;">ONLINE / OPERATIONAL</span><br/>
        Session Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
    </div>
    """, unsafe_allow_html=True)
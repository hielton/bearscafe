import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import "./Analytics.css";

const STARS = [5, 4, 3, 2, 1];

function formatDate(date) {
  if (!date) return "Date unavailable";
  const parsed = new Date(`${date}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function RatingStars({ rating }) {
  return <span className="analytics-stars" aria-label={`${rating} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map(star => <span key={star} className={`analytics-star ${star <= Math.round(rating || 0) ? "filled" : ""}`}>★</span>)}
  </span>;
}

function StatCard({ label, value, detail, icon }) {
  return <div className="analytics-stat-card">
    <div className="analytics-stat-top"><span className="analytics-stat-label">{label}</span><span className="analytics-stat-icon">{icon}</span></div>
    <strong className="analytics-stat-value">{value}</strong>
    <span className="analytics-stat-detail">{detail}</span>
  </div>;
}

function Distribution({ distribution, total }) {
  return <div className="analytics-mini-distribution">
    {STARS.map(star => {
      const count = Number(distribution?.[star] || 0);
      return <div className="analytics-mini-row" key={star}>
        <span>{star} ★</span>
        <div className="analytics-mini-track"><div className="analytics-mini-fill" style={{ width: `${total ? count / total * 100 : 0}%` }} /></div>
        <span>{count}</span>
      </div>;
    })}
  </div>;
}

function FeedbackPanel({ type, id, refreshKey }) {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    const url = type === "dish" ? `/analytics/dishes/${id}/feedback` : `/analytics/meals/${id}/feedback`;
    api.get(url).then(response => {
      if (active) setFeedback(Array.isArray(response.data) ? response.data : []);
    }).catch(err => {
      if (active) setError(err.response?.data?.message || "Unable to load student feedback.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [type, id, refreshKey]);

  if (loading) return <div className="analytics-feedback-state">Loading student feedback...</div>;
  if (error) return <div className="analytics-feedback-state analytics-error-text">{error}</div>;
  if (!feedback.length) return <div className="analytics-feedback-state">No written feedback has been submitted yet.</div>;

  return <div className="analytics-feedback-list">
    <h4>Student feedback ({feedback.length})</h4>
    {feedback.map(item => <article className="analytics-feedback-item" key={item.feedbackId}>
      <div className="analytics-feedback-meta">
        {item.ratingValue != null ? <RatingStars rating={item.ratingValue} /> : <span>Rating unavailable</span>}
        <span>{type === "dish" && item.mealDate ? `${formatDate(item.mealDate)} · ${item.mealPeriod || "Meal"} · ` : ""}{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}</span>
      </div>
      <p>{item.comment}</p>
    </article>)}
  </div>;
}

function MealCard({ meal, refreshKey }) {
  const [expanded, setExpanded] = useState(false);
  const hasRatings = Number(meal.totalRatings) > 0;
  return <article className="analytics-meal-card">
    <div className="analytics-meal-main">
      <div className="analytics-meal-image">{meal.imageUrl ? <img src={meal.imageUrl} alt={meal.mealName} /> : <span aria-hidden="true">🍽️</span>}</div>
      <div className="analytics-meal-info">
        <div className="analytics-meal-tags"><span className="analytics-period-tag">{meal.mealPeriod || "MEAL"}</span><span className="analytics-meal-date">{formatDate(meal.mealDate)}</span></div>
        <h3>{meal.mealName}</h3>
        <div className="analytics-meal-rating">{hasRatings ? <><RatingStars rating={meal.averageRating} /><strong>{Number(meal.averageRating).toFixed(2)}</strong><span>({meal.totalRatings} ratings)</span></> : <span className="analytics-no-rating">No ratings yet</span>}</div>
      </div>
      <button type="button" className="analytics-details-button" aria-expanded={expanded} onClick={() => setExpanded(value => !value)}>{expanded ? "Hide feedback −" : "View feedback +"}</button>
    </div>
    <Distribution distribution={meal.ratingDistribution} total={meal.totalRatings} />
    {expanded && <FeedbackPanel type="meal" id={meal.mealId} refreshKey={refreshKey} />}
  </article>;
}

function DishCard({ dish, refreshKey }) {
  const [expanded, setExpanded] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const history = dish.ratingHistory || [];
  const hasRatings = Number(dish.totalRatings) > 0;
  return <article className="analytics-meal-card">
    <div className="analytics-meal-main">
      <div className="analytics-meal-image"><span aria-hidden="true">🍽️</span></div>
      <div className="analytics-meal-info">
        <div className="analytics-meal-tags"><span className="analytics-period-tag">HISTORICAL DISH</span><span className="analytics-meal-date">{dish.timesServed} serving{dish.timesServed === 1 ? "" : "s"}</span></div>
        <h3>{dish.dishName}</h3>
        <div className="analytics-meal-rating">{hasRatings ? <><RatingStars rating={dish.averageRating} /><strong>{Number(dish.averageRating).toFixed(2)}</strong><span>({dish.totalRatings} ratings)</span></> : <span className="analytics-no-rating">No ratings yet</span>}</div>
      </div>
      <button type="button" className="analytics-details-button" aria-expanded={expanded} onClick={() => setExpanded(value => !value)}>{expanded ? "Hide feedback −" : "View feedback +"}</button>
    </div>
    <Distribution distribution={dish.ratingDistribution} total={dish.totalRatings} />
    <button type="button" className="analytics-history-toggle" aria-expanded={showHistory} onClick={() => setShowHistory(value => !value)}>{showHistory ? "Hide serving history −" : `View serving history (${history.length}) +`}</button>
    {showHistory && <div className="analytics-history-list">
      {history.length ? history.map(item => <div className="analytics-history-row" key={item.mealId}>
        <span>{formatDate(item.mealDate)} · {item.mealPeriod}</span>
        <span>{item.totalRatings ? `${Number(item.averageRating).toFixed(2)} ★` : "No ratings"}</span>
        <span>{item.totalRatings} ratings</span>
      </div>) : <p>No completed published servings yet.</p>}
    </div>}
    {expanded && <FeedbackPanel type="dish" id={dish.dishId} refreshKey={refreshKey} />}
  </article>;
}

function Analytics() {
  const [view, setView] = useState("servings");
  const [meals, setMeals] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("ALL");
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    Promise.all([api.get("/analytics/meals"), api.get("/analytics/dishes")]).then(([mealResponse, dishResponse]) => {
      if (!active) return;
      setMeals(Array.isArray(mealResponse.data) ? mealResponse.data : []);
      setDishes(Array.isArray(dishResponse.data) ? dishResponse.data : []);
    }).catch(err => {
      if (active) setError(err.response?.data?.message || (err.response?.status === 403 ? "You do not have permission to view analytics." : "Unable to load analytics. Check the backend and your staff login."));
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [refreshKey]);

  const filteredMeals = useMemo(() => meals.filter(meal =>
    (meal.mealName || "").toLowerCase().includes(search.toLowerCase()) &&
    (period === "ALL" || meal.mealPeriod === period) &&
    (!selectedDate || meal.mealDate === selectedDate)
  ), [meals, search, period, selectedDate]);

  const filteredDishes = useMemo(() => dishes.filter(dish =>
    (dish.dishName || "").toLowerCase().includes(search.toLowerCase())
  ), [dishes, search]);

  const items = view === "servings" ? filteredMeals : filteredDishes;
  const summary = useMemo(() => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRatings = 0;
    let totalScore = 0;
    let reviewed = 0;
    let top = null;
    for (const item of items) {
      const count = Number(item.totalRatings || 0);
      totalRatings += count;
      if (count > 0) {
        reviewed++;
        // Use star counts to avoid rounding errors from per-meal averages.
        for (let star = 1; star <= 5; star++) {
          const starCount = Number(item.ratingDistribution?.[star] || 0);
          distribution[star] += starCount;
          totalScore += star * starCount;
        }
        if (!top || Number(item.averageRating) > Number(top.averageRating)) top = item;
      }
    }
    return { distribution, totalRatings, average: totalRatings ? totalScore / totalRatings : null, reviewed, top };
  }, [items]);

  const maxDistribution = Math.max(1, ...Object.values(summary.distribution));
  function refresh() { setRefreshKey(value => value + 1); }
  function switchView(next) { setView(next); setSearch(""); setPeriod("ALL"); setSelectedDate(""); }

  return <main className="analytics-page">
    <header className="analytics-header">
      <div><span className="analytics-eyebrow">BEARSCAFE · STAFF INSIGHTS</span><h1>Meal Analytics</h1><p>Understand student satisfaction across individual servings and historical dishes.</p></div>
      <button type="button" className="analytics-refresh-button" onClick={refresh} disabled={loading}>↻ Refresh data</button>
    </header>
    <div className="analytics-tabs" role="group" aria-label="Analytics view">
      <button type="button" className={view === "servings" ? "analytics-tab active" : "analytics-tab"} aria-pressed={view === "servings"} onClick={() => switchView("servings")}>Individual Servings</button>
      <button type="button" className={view === "dishes" ? "analytics-tab active" : "analytics-tab"} aria-pressed={view === "dishes"} onClick={() => switchView("dishes")}>Historical Dishes</button>
    </div>
    {loading ? <div className="analytics-status-card">Loading analytics...</div> : error ? <div className="analytics-status-card analytics-error"><h2>Could not load analytics</h2><p>{error}</p><button type="button" onClick={refresh}>Try again</button></div> : <>
      <section className="analytics-filter-bar">
        <div className="analytics-filter-field analytics-search"><label htmlFor="analytics-search">Search {view === "dishes" ? "dishes" : "meals"}</label><input id="analytics-search" type="search" placeholder="Search by name..." value={search} onChange={event => setSearch(event.target.value)} /></div>
        {view === "servings" && <>
          <div className="analytics-filter-field"><label htmlFor="analytics-period">Meal period</label><select id="analytics-period" value={period} onChange={event => setPeriod(event.target.value)}><option value="ALL">All periods</option><option value="BREAKFAST">Breakfast</option><option value="LUNCH">Lunch</option><option value="DINNER">Dinner</option></select></div>
          <div className="analytics-filter-field"><label htmlFor="analytics-date">Serving date</label><input id="analytics-date" type="date" value={selectedDate} onChange={event => setSelectedDate(event.target.value)} /></div>
        </>}
        <button type="button" className="analytics-clear-button" onClick={() => { setSearch(""); setPeriod("ALL"); setSelectedDate(""); }}>Clear filters</button>
      </section>
      <section className="analytics-stats-grid">
        <StatCard label="Average rating" value={summary.average == null ? "—" : `${summary.average.toFixed(2)} / 5`} detail="Weighted average across student ratings" icon="★" />
        <StatCard label="Total ratings" value={summary.totalRatings} detail="Student ratings received" icon="✦" />
        <StatCard label={view === "dishes" ? "Top-rated dish" : "Top-rated meal"} value={summary.top ? (view === "dishes" ? summary.top.dishName : summary.top.mealName) : "—"} detail={summary.top ? `${Number(summary.top.averageRating).toFixed(2)} stars` : "No rated items yet"} icon="🏆" />
        <StatCard label={view === "dishes" ? "Dishes reviewed" : "Meals reviewed"} value={summary.reviewed} detail={`${items.length} ${view === "dishes" ? "dishes" : "meals"} in selection`} icon="▦" />
      </section>
      <section className="analytics-chart-section"><div className="analytics-section-heading"><div><h2>Rating distribution</h2><p>How students rated the selected {view === "dishes" ? "dishes" : "servings"}.</p></div><span className="analytics-section-count">{summary.totalRatings} ratings</span></div>
        <div className="analytics-chart">{[1, 2, 3, 4, 5].map(star => <div className="analytics-chart-column" key={star}><strong>{summary.distribution[star]}</strong><div className="analytics-chart-track"><div className="analytics-chart-bar" style={{ height: `${summary.distribution[star] / maxDistribution * 100}%` }} /></div><span>{star} ★</span></div>)}</div>
      </section>
      <section className="analytics-meals-section"><div className="analytics-section-heading"><div><h2>{view === "dishes" ? "Historical dish performance" : "Meal performance"}</h2><p>{view === "dishes" ? "Explore combined ratings, serving history, and feedback across dates." : "Review individual meals and student comments."}</p></div><span className="analytics-section-count">{items.length} {view === "dishes" ? "dishes" : "meals"}</span></div>
        {!items.length ? <div className="analytics-status-card"><h3>No {view === "dishes" ? "dishes" : "meals"} found</h3><p>Try adjusting your filters.</p></div> : <div className="analytics-meals-list">{view === "dishes" ? filteredDishes.map(dish => <DishCard key={dish.dishId} dish={dish} refreshKey={refreshKey} />) : filteredMeals.map(meal => <MealCard key={meal.mealId} meal={meal} refreshKey={refreshKey} />)}</div>}
      </section>
    </>}
  </main>;
}

export default Analytics;

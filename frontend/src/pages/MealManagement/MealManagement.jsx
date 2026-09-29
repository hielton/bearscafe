import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router-dom";

import api from "../../api/axios";

import "./MealManagement.css";

function MealManagement() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");
  const [message, setMessage] =
    useState("");

  const [searchTerm, setSearchTerm] =
    useState("");
  const [periodFilter, setPeriodFilter] =
    useState("ALL");
  const [statusFilter, setStatusFilter] =
    useState("ALL");
  const [sortOrder, setSortOrder] =
    useState("NEWEST");

  /*
    Stores the selected period for each
    historical meal when using it today.

    Example:
    {
      4: "LUNCH",
      7: "DINNER"
    }

    If a meal does not have a value here,
    its original mealPeriod is used.
  */
  const [
    reusePeriods,
    setReusePeriods,
  ] = useState({});

  const [
    reusingMealId,
    setReusingMealId,
  ] = useState(null);

  useEffect(() => {
    fetchMeals();
  }, []);

  async function fetchMeals() {
    try {
      const response =
        await api.get("/meals");

      setMeals(response.data);
      setError("");
    } catch (error) {
      console.error(
        "Error fetching meals:",
        error
      );

      if (
        error.response?.status === 403
      ) {
        setError(
          "You do not have permission to manage meals."
        );
      } else {
        setError(
          "Could not load meals."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  const today =
    new Date().toLocaleDateString(
      "en-CA"
    );

  const todayMeals = meals.filter(
    (meal) =>
      meal.mealDate === today &&
      meal.status === "PUBLISHED"
  );

  /*
    Checks whether a meal with the same
    name is already being served during
    the selected period today.

    This means the same food can appear
    for lunch and dinner, but cannot be
    duplicated twice within lunch.
  */
  function isMealOnTodaysMenu(
    meal,
    selectedPeriod
  ) {
    return todayMeals.some(
      (todayMeal) =>
        todayMeal.mealPeriod ===
          selectedPeriod &&
        todayMeal.name
          ?.trim()
          .toLowerCase() ===
          meal.name
            ?.trim()
            .toLowerCase()
    );
  }

  /*
    Returns the period currently selected
    for reuse.

    If staff has not changed it, the
    historical meal's original period
    remains the default.
  */
  function getReusePeriod(meal) {
    return (
      reusePeriods[meal.id] ||
      meal.mealPeriod
    );
  }

  function handleReusePeriodChange(
    mealId,
    period
  ) {
    setReusePeriods(
      (currentPeriods) => ({
        ...currentPeriods,
        [mealId]: period,
      })
    );

    setMessage("");
    setError("");
  }

  async function handleUseToday(meal) {
    setMessage("");
    setError("");

    const selectedPeriod =
      getReusePeriod(meal);

    if (
      isMealOnTodaysMenu(
        meal,
        selectedPeriod
      )
    ) {
      setError(
        `${meal.name} is already on today's ${selectedPeriod.toLowerCase()} menu.`
      );

      return;
    }

    const reusedMeal = {
      name: meal.name,
      description: meal.description,
      imageUrl: meal.imageUrl,
      mealDate: today,
      mealPeriod: selectedPeriod,
      status: "PUBLISHED",
    };

    try {
      setReusingMealId(meal.id);

      await api.post(
        "/meals",
        reusedMeal
      );

      setMessage(
        `${meal.name} was added to today's ${selectedPeriod.toLowerCase()} menu.`
      );

      await fetchMeals();

      /*
        Reset this meal's reuse selector
        back to its original period.
      */
      setReusePeriods(
        (currentPeriods) => {
          const updatedPeriods = {
            ...currentPeriods,
          };

          delete updatedPeriods[
            meal.id
          ];

          return updatedPeriods;
        }
      );
    } catch (error) {
      console.error(
        "Error reusing meal:",
        error
      );

      if (
        error.response?.status === 403
      ) {
        setError(
          "You do not have permission to add meals."
        );
      } else {
        setError(
          "Could not add this meal to today's menu."
        );
      }
    } finally {
      setReusingMealId(null);
    }
  }

  async function handleDelete(id) {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this meal?"
      );

    if (!confirmed) {
      return;
    }

    setMessage("");
    setError("");

    try {
      await api.delete(
        `/meals/${id}`
      );

      setMeals(
        (currentMeals) =>
          currentMeals.filter(
            (meal) =>
              meal.id !== id
          )
      );

      setMessage(
        "Meal deleted successfully."
      );
    } catch (error) {
      console.error(
        "Error deleting meal:",
        error
      );

      if (
        error.response?.status === 403
      ) {
        setError(
          "You do not have permission to delete meals."
        );
      } else {
        setError(
          "Could not delete meal."
        );
      }
    }
  }

  function clearFilters() {
    setSearchTerm("");
    setPeriodFilter("ALL");
    setStatusFilter("ALL");
    setSortOrder("NEWEST");
  }

  /*
    Today's meals are not displayed
    again in history.
  */
  const historyMeals =
    meals.filter(
      (meal) =>
        meal.mealDate !== today
    );

  const filteredMeals =
    useMemo(() => {
      let result = [
        ...historyMeals,
      ];

      if (
        searchTerm.trim() !== ""
      ) {
        const search =
          searchTerm
            .trim()
            .toLowerCase();

        result =
          result.filter(
            (meal) => {
              const name =
                meal.name
                  ?.toLowerCase() ||
                "";

              const description =
                meal.description
                  ?.toLowerCase() ||
                "";

              return (
                name.includes(
                  search
                ) ||
                description.includes(
                  search
                )
              );
            }
          );
      }

      if (
        periodFilter !== "ALL"
      ) {
        result =
          result.filter(
            (meal) =>
              meal.mealPeriod ===
              periodFilter
          );
      }

      if (
        statusFilter !== "ALL"
      ) {
        result =
          result.filter(
            (meal) =>
              meal.status ===
              statusFilter
          );
      }

      result.sort(
        (a, b) => {
          const dateA =
            new Date(
              a.mealDate
            );

          const dateB =
            new Date(
              b.mealDate
            );

          if (
            sortOrder ===
            "OLDEST"
          ) {
            return (
              dateA -
              dateB
            );
          }

          return (
            dateB -
            dateA
          );
        }
      );

      return result;
    }, [
      historyMeals,
      searchTerm,
      periodFilter,
      statusFilter,
      sortOrder,
    ]);

  if (loading) {
    return (
      <div className="meal-management">
        <p>
          Loading meals...
        </p>
      </div>
    );
  }

  return (
    <div className="meal-management">

      <div className="management-header">
        <div>
          <h1>
            Meal Management
          </h1>

          <p>
            Create, edit, reuse,
            and manage cafeteria
            meals.
          </p>
        </div>

        <Link
          to="/add-meals"
          className="add-meal-button"
        >
          + Add New Meal
        </Link>
      </div>

      {message && (
        <p className="success-message">
          {message}
        </p>
      )}

      {error && (
        <p className="error-message">
          {error}
        </p>
      )}

      <section className="management-section">

        <div className="section-heading">
          <div>
            <h2>
              Meal History
            </h2>

            <p className="meal-count">
              Showing{" "}
              {filteredMeals.length}{" "}
              of{" "}
              {historyMeals.length}{" "}
              historical meals
            </p>
          </div>
        </div>

        <div className="history-controls">

          <div className="search-group">
            <label htmlFor="meal-search">
              Search
            </label>

            <input
              id="meal-search"
              type="text"
              placeholder="Search meals..."
              value={searchTerm}
              onChange={(
                event
              ) =>
                setSearchTerm(
                  event.target
                    .value
                )
              }
            />
          </div>

          <div className="filter-group">
            <label htmlFor="period-filter">
              Meal Period
            </label>

            <select
              id="period-filter"
              value={
                periodFilter
              }
              onChange={(
                event
              ) =>
                setPeriodFilter(
                  event.target
                    .value
                )
              }
            >
              <option value="ALL">
                All
              </option>

              <option value="BREAKFAST">
                Breakfast
              </option>

              <option value="LUNCH">
                Lunch
              </option>

              <option value="DINNER">
                Dinner
              </option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="status-filter">
              Status
            </label>

            <select
              id="status-filter"
              value={
                statusFilter
              }
              onChange={(
                event
              ) =>
                setStatusFilter(
                  event.target
                    .value
                )
              }
            >
              <option value="ALL">
                All
              </option>

              <option value="DRAFT">
                Draft
              </option>

              <option value="PUBLISHED">
                Published
              </option>

              <option value="UNPUBLISHED">
                Unpublished
              </option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="sort-order">
              Sort By
            </label>

            <select
              id="sort-order"
              value={sortOrder}
              onChange={(
                event
              ) =>
                setSortOrder(
                  event.target
                    .value
                )
              }
            >
              <option value="NEWEST">
                Newest First
              </option>

              <option value="OLDEST">
                Oldest First
              </option>
            </select>
          </div>

          <button
            type="button"
            className="clear-filter-button"
            onClick={
              clearFilters
            }
          >
            Clear Filters
          </button>
        </div>

        {filteredMeals.length ===
        0 ? (
          <div className="empty-history">
            <h3>
              No meals found
            </h3>

            <p>
              Try changing your
              search or filters.
            </p>
          </div>
        ) : (
          <div className="meal-history">

            {filteredMeals.map(
              (meal) => {
                const selectedPeriod =
                  getReusePeriod(
                    meal
                  );

                const alreadyOnSelectedMenu =
                  isMealOnTodaysMenu(
                    meal,
                    selectedPeriod
                  );

                const isReusing =
                  reusingMealId ===
                  meal.id;

                return (
                  <div
                    className="history-card"
                    key={meal.id}
                  >

                    <div className="history-main">

                      {meal.imageUrl && (
                        <img
                          src={
                            meal.imageUrl
                          }
                          alt={
                            meal.name
                          }
                          className="history-image"
                        />
                      )}

                      <div className="history-info">

                        <div className="history-card-header">

                          <h3>
                            {meal.name}
                          </h3>

                          <span
                            className={`status-badge status-${meal.status?.toLowerCase()}`}
                          >
                            {
                              meal.status
                            }
                          </span>

                        </div>

                        <p className="history-description">
                          {meal.description ||
                            "No description provided."}
                        </p>

                        <div className="meal-details">

                          <span>
                            <strong>
                              Last
                              served:
                            </strong>{" "}
                            {
                              meal.mealDate
                            }
                          </span>

                          <span>
                            <strong>
                              Original
                              period:
                            </strong>{" "}
                            {
                              meal.mealPeriod
                            }
                          </span>

                        </div>
                      </div>
                    </div>

                    <div className="history-actions">

                      <div className="reuse-period-control">
                        <label
                          htmlFor={`reuse-period-${meal.id}`}
                        >
                          Serve today as
                        </label>

                        <select
                          id={`reuse-period-${meal.id}`}
                          value={
                            selectedPeriod
                          }
                          onChange={(
                            event
                          ) =>
                            handleReusePeriodChange(
                              meal.id,
                              event
                                .target
                                .value
                            )
                          }
                          disabled={
                            isReusing
                          }
                        >
                          <option value="BREAKFAST">
                            Breakfast
                          </option>

                          <option value="LUNCH">
                            Lunch
                          </option>

                          <option value="DINNER">
                            Dinner
                          </option>
                        </select>
                      </div>

                      {alreadyOnSelectedMenu ? (
                        <button
                          type="button"
                          className="on-today-button"
                          disabled
                        >
                          ✓ On{" "}
                          {selectedPeriod
                            .charAt(0)
                            .toUpperCase() +
                            selectedPeriod
                              .slice(1)
                              .toLowerCase()}{" "}
                          Menu
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="reuse-button"
                          disabled={
                            isReusing
                          }
                          onClick={() =>
                            handleUseToday(
                              meal
                            )
                          }
                        >
                          {isReusing
                            ? "Adding..."
                            : "Use Today"}
                        </button>
                      )}

                      <Link
                        to={`/edit-meal/${meal.id}`}
                        className="edit-button"
                      >
                        Edit
                      </Link>

                      <button
                        type="button"
                        className="delete-button"
                        disabled={
                          isReusing
                        }
                        onClick={() =>
                          handleDelete(
                            meal.id
                          )
                        }
                      >
                        Delete
                      </button>

                    </div>
                  </div>
                );
              }
            )}

          </div>
        )}

      </section>
    </div>
  );
}

export default MealManagement;
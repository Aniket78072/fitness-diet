import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { logFoodText, logFoodImage, fetchFoodLogs } from "../features/foodSlice";
import Message from "../components/Message";

function formatDate(dateString) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

export default function FoodLog() {
  const dispatch = useDispatch();
  const { logs, loading, error } = useSelector((s) => s.food);
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [showMore, setShowMore] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("info");

  useEffect(() => {
    dispatch(fetchFoodLogs());
  }, [dispatch]);

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    const resultAction = await dispatch(logFoodText(text));
    if (logFoodText.fulfilled.match(resultAction)) {
      setMessage("Food logged successfully!");
      setMessageType("info");
      setText("");
      dispatch(fetchFoodLogs());
    } else {
      setMessage("Failed to log food: " + (resultAction.error?.message || "Unknown error"));
      setMessageType("error");
    }
  };

  const handleImageSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("foodImage", file);
    const resultAction = await dispatch(logFoodImage(formData));
    if (logFoodImage.fulfilled.match(resultAction)) {
      setMessage("Food logged successfully!");
      setMessageType("info");
      setFile(null);
      dispatch(fetchFoodLogs());
    } else {
      setMessage("Failed to log food: " + (resultAction.error?.message || "Unknown error"));
      setMessageType("error");
    }
  };

  // Group logs by date
  const logsByDate = logs.reduce((acc, log) => {
    const date = formatDate(log.createdAt || log.date || "");
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {});

  // Get sorted dates
  const sortedDates = Object.keys(logsByDate).sort((a, b) => new Date(b) - new Date(a));

  // Limit dates if not showing more
  const displayedDates = showMore ? sortedDates : sortedDates.slice(0, 3);

  const totalLogs = logs.length;
  const hasMore = totalLogs > 0 && (showMore ? false : sortedDates.length > 3);

  return (
    <div className="p-6 food-log-container mt-20">
      <h2 className="text-2xl mb-4 mt-30 tex text-orange-500 font-bold">Log Food</h2>
      <Message message={message} type={messageType} onClose={() => setMessage(null)} />
      <form onSubmit={handleTextSubmit} className="flex gap-2 mb-4">
        <input
          placeholder="Enter food name"
          onChange={(e) => setText(e.target.value)}
          value={text}
          className="input-text"
        />
        <button className="btn btn-blue" disabled={loading}>Log Text</button>
      </form>
      {/* <form onSubmit={handleImageSubmit} className="flex gap-2 mb-6">
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button className="btn btn-purple" disabled={loading}>Log Image</button>
      </form> */}

      {error && <p className="text-red-600 mb-4">Error: {error}</p>}

      <h3 className="text-lg mb-2">Your Logs</h3>
      {Object.keys(logsByDate).length === 0 && <p>No food logs found.</p>}
      {displayedDates.map((date) => (
        <div key={date} className="log-date-group">
          <h4 className="log-date">{date}</h4>
          <ul className="log-list">
            {logsByDate[date].map((log, idx) => (
              <li key={idx} className="log-item">
                {log.imageUrl && (
                  <img src={log.imageUrl} alt={log.foodName} className="log-image" />
                )}
                <div className="log-details">
                  <div className="log-food-name">{log.foodName}</div>
                  <div className="log-calories">{log.calories} kcal</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
      {hasMore && (
        <button
          onClick={() => setShowMore(!showMore)}
          className="btn btn-blue mt-4"
        >
          {showMore ? "Show Less" : "Show More"}
        </button>
      )}
    </div>
  );
}

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
    <div className="p-4 md:p-6 max-w-4xl mx-auto ">
      <h2 className="text-2xl font-bold mb-6 text-orange-500">Log Food</h2>
      <Message message={message} type={messageType} onClose={() => setMessage(null)} />

      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <form onSubmit={handleTextSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            placeholder="Enter food name (e.g., '1 apple' or 'chicken breast 200g')"
            onChange={(e) => setText(e.target.value)}
            value={text}
            className="flex-1 px-3 py-3 border rounded text-sm w-full"
            required
          />
          <button
            className="px-6 py-3 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition-colors disabled:bg-gray-400 text-sm w-full sm:w-auto whitespace-nowrap"
            disabled={loading}
          >
            {loading ? "Logging..." : "Log Food"}
          </button>
        </form>
      </div>

      {/* <form onSubmit={handleImageSubmit} className="flex gap-2 mb-6">
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button className="btn btn-purple" disabled={loading}>Log Image</button>
      </form> */}

      {error && <p className="text-red-600 mb-4 text-center">Error: {error}</p>}

      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Your Food Logs</h3>
        {Object.keys(logsByDate).length === 0 ? (
          <p className="text-gray-500 text-center py-4">No food logs found.</p>
        ) : (
          <div className="space-y-4">
            {displayedDates.map((date) => (
              <div key={date} className="bg-gray-50 p-4 rounded-lg border">
                <h4 className="text-lg font-medium text-gray-800 mb-3 pb-2 border-b">{date}</h4>
                <div className="space-y-3">
                  {logsByDate[date].map((log, idx) => (
                    <div key={idx} className="flex items-center bg-white p-3 rounded shadow-sm border">
                      {log.imageUrl && (
                        <img
                          src={log.imageUrl}
                          alt={log.foodName}
                          className="w-16 h-16 object-cover rounded mr-4 flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{log.foodName}</div>
                        <div className="text-orange-600 font-medium text-sm">{log.calories} kcal</div>
                        {log.protein && (
                          <div className="text-gray-600 text-xs">{log.protein}g protein</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {hasMore && (
          <div className="text-center mt-6">
            <button
              onClick={() => setShowMore(!showMore)}
              className="px-6 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition-colors text-sm"
            >
              {showMore ? "Show Less" : "Show More"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

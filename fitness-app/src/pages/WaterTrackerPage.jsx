import WaterTracker from "../components/WaterTracker";

export default function WaterTrackerPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Water Tracker</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <WaterTracker />
        </div>
      </div>
    </div>
  );
}

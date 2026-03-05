export default function ExerciseRegimenHandout() {
  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold tracking-wide">West Houston Heart Center</h1>
        <div className="mt-1 text-sm text-gray-500">1140 Business Center Dr. Ste 300, Houston, TX 77043</div>
      </div>

      <h2 className="text-xl font-bold text-center mb-2 text-red-700">Exercise Regimen for Heart Health</h2>
      <p className="text-center text-sm text-gray-500 mb-8">Patient Education Handout</p>

      {/* Overview */}
      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded mb-6">
        <h3 className="font-bold text-blue-800 mb-2">Why Exercise Matters for Your Heart</h3>
        <p className="text-sm leading-relaxed text-gray-700">
          Regular physical activity is one of the most effective ways to strengthen your heart, improve
          circulation, lower blood pressure, and reduce your risk of heart disease. The American Heart
          Association recommends at least 150 minutes of moderate-intensity aerobic activity per week,
          or 75 minutes of vigorous activity, combined with muscle-strengthening activities at least
          2 days per week. Always consult your doctor before starting a new exercise program.
        </p>
      </div>

      {/* Aerobic Exercise */}
      <div className="mb-6">
        <h3 className="font-bold text-sm uppercase tracking-wide text-blue-700 mb-3 border-b border-blue-200 pb-1">
          Cardiovascular (Aerobic) Exercise
        </h3>
        <p className="text-sm text-gray-600 mb-3">Goal: 150 minutes/week moderate OR 75 minutes/week vigorous</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-semibold text-blue-800 mb-2">Moderate Intensity</p>
            <ul className="text-gray-600 space-y-1 list-disc list-inside">
              <li>Brisk walking (3-4 mph)</li>
              <li>Leisurely cycling (under 10 mph)</li>
              <li>Water aerobics</li>
              <li>Ballroom dancing</li>
              <li>Gardening / yard work</li>
              <li>Tennis (doubles)</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-blue-800 mb-2">Vigorous Intensity</p>
            <ul className="text-gray-600 space-y-1 list-disc list-inside">
              <li>Jogging / running</li>
              <li>Swimming laps</li>
              <li>Cycling (over 10 mph)</li>
              <li>Hiking uphill</li>
              <li>Jump rope</li>
              <li>Tennis (singles)</li>
            </ul>
          </div>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 rounded p-3 mt-3">
          <p className="text-sm text-indigo-800">
            <strong>Intensity Guide:</strong> During moderate exercise, you can talk but not sing.
            During vigorous exercise, you can only say a few words before needing to catch your breath.
          </p>
        </div>
      </div>

      {/* Strength Training */}
      <div className="mb-6">
        <h3 className="font-bold text-sm uppercase tracking-wide text-green-700 mb-3 border-b border-green-200 pb-1">
          Strength Training
        </h3>
        <p className="text-sm text-gray-600 mb-3">Goal: 2+ days per week, all major muscle groups</p>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="bg-green-50 rounded p-3">
            <p className="font-semibold text-green-800 mb-1">Upper Body</p>
            <ul className="text-gray-600 text-xs space-y-1 list-disc list-inside">
              <li>Push-ups (wall or floor)</li>
              <li>Bicep curls</li>
              <li>Shoulder press</li>
              <li>Resistance band rows</li>
            </ul>
          </div>
          <div className="bg-green-50 rounded p-3">
            <p className="font-semibold text-green-800 mb-1">Lower Body</p>
            <ul className="text-gray-600 text-xs space-y-1 list-disc list-inside">
              <li>Squats (chair-assisted)</li>
              <li>Lunges</li>
              <li>Calf raises</li>
              <li>Leg press</li>
            </ul>
          </div>
          <div className="bg-green-50 rounded p-3">
            <p className="font-semibold text-green-800 mb-1">Core</p>
            <ul className="text-gray-600 text-xs space-y-1 list-disc list-inside">
              <li>Planks</li>
              <li>Seated twists</li>
              <li>Bird-dogs</li>
              <li>Bridges</li>
            </ul>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded p-3 mt-3">
          <p className="text-sm text-green-800">
            <strong>Tip:</strong> Start with light weights or body weight. Aim for 2-3 sets of 8-12 repetitions.
            Rest 30-60 seconds between sets. Increase weight gradually as you get stronger.
          </p>
        </div>
      </div>

      {/* Flexibility */}
      <div className="mb-6">
        <h3 className="font-bold text-sm uppercase tracking-wide text-purple-700 mb-3 border-b border-purple-200 pb-1">
          Flexibility &amp; Balance
        </h3>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="bg-purple-50 rounded p-3">
            <p className="font-semibold text-purple-800 mb-1">Stretching</p>
            <p className="text-gray-600 text-xs">Hold each stretch 15-30 seconds. Focus on major muscle groups. Do after exercise when muscles are warm.</p>
          </div>
          <div className="bg-purple-50 rounded p-3">
            <p className="font-semibold text-purple-800 mb-1">Yoga</p>
            <p className="text-gray-600 text-xs">Gentle or chair yoga improves flexibility, balance, and stress reduction. Many free classes available online.</p>
          </div>
          <div className="bg-purple-50 rounded p-3">
            <p className="font-semibold text-purple-800 mb-1">Tai Chi</p>
            <p className="text-gray-600 text-xs">Slow, flowing movements improve balance, coordination, and calm the mind. Excellent for all fitness levels.</p>
          </div>
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className="mb-6">
        <h3 className="font-bold text-sm uppercase tracking-wide text-gray-700 mb-3 border-b border-gray-300 pb-1">
          Sample Weekly Exercise Schedule
        </h3>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Day</th>
              <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Activity</th>
              <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="border border-gray-300 px-3 py-1.5">Monday</td><td className="border border-gray-300 px-3 py-1.5">Brisk Walking</td><td className="border border-gray-300 px-3 py-1.5">30 min</td></tr>
            <tr className="bg-gray-50"><td className="border border-gray-300 px-3 py-1.5">Tuesday</td><td className="border border-gray-300 px-3 py-1.5">Strength Training (Upper Body)</td><td className="border border-gray-300 px-3 py-1.5">20-30 min</td></tr>
            <tr><td className="border border-gray-300 px-3 py-1.5">Wednesday</td><td className="border border-gray-300 px-3 py-1.5">Cycling or Swimming</td><td className="border border-gray-300 px-3 py-1.5">30 min</td></tr>
            <tr className="bg-gray-50"><td className="border border-gray-300 px-3 py-1.5">Thursday</td><td className="border border-gray-300 px-3 py-1.5">Strength Training (Lower Body + Core)</td><td className="border border-gray-300 px-3 py-1.5">20-30 min</td></tr>
            <tr><td className="border border-gray-300 px-3 py-1.5">Friday</td><td className="border border-gray-300 px-3 py-1.5">Brisk Walking or Dancing</td><td className="border border-gray-300 px-3 py-1.5">30 min</td></tr>
            <tr className="bg-gray-50"><td className="border border-gray-300 px-3 py-1.5">Saturday</td><td className="border border-gray-300 px-3 py-1.5">Yoga / Stretching or Active Recreation</td><td className="border border-gray-300 px-3 py-1.5">30-45 min</td></tr>
            <tr><td className="border border-gray-300 px-3 py-1.5">Sunday</td><td className="border border-gray-300 px-3 py-1.5 text-gray-500 italic">Rest Day</td><td className="border border-gray-300 px-3 py-1.5">—</td></tr>
          </tbody>
        </table>
      </div>

      {/* Exercise Log */}
      <div className="mb-6">
        <h3 className="font-bold text-sm uppercase tracking-wide text-gray-700 mb-3 border-b border-gray-300 pb-1">
          Weekly Exercise Log
        </h3>
        <p className="text-sm text-gray-500 mb-2">Track your progress — fill in what you did each day this week:</p>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-3 py-2 text-left font-semibold w-24">Day</th>
              <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Activity</th>
              <th className="border border-gray-300 px-3 py-2 text-left font-semibold w-24">Duration</th>
              <th className="border border-gray-300 px-3 py-2 text-left font-semibold w-28">How I Felt</th>
            </tr>
          </thead>
          <tbody>
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, i) => (
              <tr key={day} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                <td className="border border-gray-300 px-3 py-3 text-xs">{day}</td>
                <td className="border border-gray-300 px-3 py-3"></td>
                <td className="border border-gray-300 px-3 py-3"></td>
                <td className="border border-gray-300 px-3 py-3"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Safety */}
      <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded mb-6">
        <h3 className="font-bold text-red-800 mb-2">Safety Guidelines &amp; Warning Signs</h3>
        <p className="text-sm text-gray-700 mb-2"><strong>Stop exercising and contact your doctor immediately if you experience:</strong></p>
        <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside mb-3">
          <li>Chest pain, pressure, or tightness</li>
          <li>Unusual shortness of breath</li>
          <li>Dizziness, lightheadedness, or feeling faint</li>
          <li>Irregular or rapid heartbeat</li>
          <li>Nausea or cold sweats during exercise</li>
          <li>Pain in your jaw, neck, arm, or shoulder</li>
        </ul>
        <p className="text-sm text-gray-700"><strong>Before you start:</strong></p>
        <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
          <li>Always warm up for 5-10 minutes before exercising</li>
          <li>Cool down and stretch for 5-10 minutes after</li>
          <li>Stay hydrated — drink water before, during, and after exercise</li>
          <li>Avoid exercising outdoors in extreme heat or cold</li>
          <li>Wear comfortable, supportive shoes</li>
        </ul>
      </div>

      {/* Progression Plan */}
      <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded mb-6">
        <h3 className="font-bold text-green-800 mb-2">Progression Plan</h3>
        <div className="text-sm text-gray-700 space-y-2">
          <div>
            <strong className="text-green-800">Weeks 1-2 (Getting Started):</strong>{' '}
            Start with 10-15 minutes of walking, 3-4 days per week. Focus on building the habit.
          </div>
          <div>
            <strong className="text-green-800">Weeks 3-4 (Building Up):</strong>{' '}
            Increase to 20-25 minutes per session. Add a second activity type (e.g., light strength training).
          </div>
          <div>
            <strong className="text-green-800">Week 5+ (Full Program):</strong>{' '}
            Work toward the full 150 minutes/week goal. Include both aerobic and strength training.
            Continue to increase intensity gradually.
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-400 mt-8 pt-4 border-t border-gray-200">
        <p className="italic mb-2">This information is for educational purposes. Always follow your doctor&apos;s specific recommendations for your condition.</p>
        <p className="font-semibold">West Houston Heart Center</p>
        <p>Dr. Humayun Naqvi, MD, MBA, FACC</p>
        <p>Phone: 832-271-5897 | Fax: 1 (877) 669-0063 | www.htxheart.com</p>
      </div>
    </div>
  );
}

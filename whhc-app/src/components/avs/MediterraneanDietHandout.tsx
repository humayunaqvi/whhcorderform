export default function MediterraneanDietHandout() {
  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold tracking-wide">West Houston Heart Center</h1>
        <div className="mt-1 text-sm text-gray-500">1140 Business Center Dr. Ste 300, Houston, TX 77043</div>
      </div>

      <h2 className="text-xl font-bold text-center mb-2 text-red-700">Mediterranean Diet Guide</h2>
      <p className="text-center text-sm text-gray-500 mb-8">Patient Education Handout</p>

      {/* Overview */}
      <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded mb-6">
        <h3 className="font-bold text-green-800 mb-2">What is the Mediterranean Diet?</h3>
        <p className="text-sm leading-relaxed text-gray-700">
          The Mediterranean Diet is inspired by the traditional eating patterns of countries bordering the
          Mediterranean Sea. It emphasizes whole, minimally processed foods rich in heart-healthy fats,
          fiber, and antioxidants. Research consistently shows that this dietary pattern reduces the risk
          of heart disease, stroke, and other cardiovascular events by approximately 30%.
        </p>
      </div>

      {/* Foods to Eat Daily */}
      <div className="mb-6">
        <h3 className="font-bold text-sm uppercase tracking-wide text-green-700 mb-3 border-b border-green-200 pb-1">
          Foods to Eat Daily
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-green-50 rounded p-3">
            <p className="font-semibold text-green-800 mb-1">Vegetables</p>
            <p className="text-gray-600">Tomatoes, spinach, kale, broccoli, peppers, onions, eggplant, zucchini. Aim for 3-5 servings daily.</p>
          </div>
          <div className="bg-green-50 rounded p-3">
            <p className="font-semibold text-green-800 mb-1">Fruits</p>
            <p className="text-gray-600">Berries, apples, oranges, grapes, figs, dates, pomegranates. 2-3 servings daily, preferably whole fruit.</p>
          </div>
          <div className="bg-green-50 rounded p-3">
            <p className="font-semibold text-green-800 mb-1">Whole Grains</p>
            <p className="text-gray-600">Whole wheat bread, brown rice, quinoa, oats, barley, farro. Choose whole grains over refined.</p>
          </div>
          <div className="bg-green-50 rounded p-3">
            <p className="font-semibold text-green-800 mb-1">Olive Oil</p>
            <p className="text-gray-600">Extra virgin olive oil as your primary fat source. Use for cooking, dressings, and dipping bread.</p>
          </div>
          <div className="bg-green-50 rounded p-3">
            <p className="font-semibold text-green-800 mb-1">Nuts &amp; Seeds</p>
            <p className="text-gray-600">Almonds, walnuts, pistachios, flaxseeds, chia seeds. A small handful daily (about 1 oz).</p>
          </div>
          <div className="bg-green-50 rounded p-3">
            <p className="font-semibold text-green-800 mb-1">Legumes</p>
            <p className="text-gray-600">Lentils, chickpeas, black beans, kidney beans. Include in meals 3-4 times per week.</p>
          </div>
        </div>
      </div>

      {/* Foods to Eat Weekly */}
      <div className="mb-6">
        <h3 className="font-bold text-sm uppercase tracking-wide text-blue-700 mb-3 border-b border-blue-200 pb-1">
          Foods to Eat in Moderation (Weekly)
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-blue-50 rounded p-3">
            <p className="font-semibold text-blue-800 mb-1">Fish &amp; Seafood</p>
            <p className="text-gray-600">Salmon, sardines, mackerel, tuna, shrimp. 2-3 times per week. Rich in omega-3 fatty acids.</p>
          </div>
          <div className="bg-blue-50 rounded p-3">
            <p className="font-semibold text-blue-800 mb-1">Poultry</p>
            <p className="text-gray-600">Chicken, turkey. 2-3 times per week. Choose skinless, grilled, or baked preparations.</p>
          </div>
          <div className="bg-blue-50 rounded p-3">
            <p className="font-semibold text-blue-800 mb-1">Eggs</p>
            <p className="text-gray-600">Up to 7 eggs per week. A good source of protein and nutrients.</p>
          </div>
          <div className="bg-blue-50 rounded p-3">
            <p className="font-semibold text-blue-800 mb-1">Dairy</p>
            <p className="text-gray-600">Greek yogurt, feta, mozzarella in moderate amounts. Choose plain, unsweetened yogurt.</p>
          </div>
        </div>
      </div>

      {/* Foods to Limit */}
      <div className="mb-6">
        <h3 className="font-bold text-sm uppercase tracking-wide text-red-700 mb-3 border-b border-red-200 pb-1">
          Foods to Limit or Avoid
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-red-50 rounded p-3">
            <p className="font-semibold text-red-800 mb-1">Red Meat</p>
            <p className="text-gray-600">Limit to a few times per month. Choose lean cuts when you do eat red meat.</p>
          </div>
          <div className="bg-red-50 rounded p-3">
            <p className="font-semibold text-red-800 mb-1">Processed Foods</p>
            <p className="text-gray-600">Avoid processed meats (hot dogs, sausage, bacon), packaged snacks, and fast food.</p>
          </div>
          <div className="bg-red-50 rounded p-3">
            <p className="font-semibold text-red-800 mb-1">Added Sugars</p>
            <p className="text-gray-600">Minimize sodas, candy, pastries, and sweetened beverages. Use fruit for natural sweetness.</p>
          </div>
          <div className="bg-red-50 rounded p-3">
            <p className="font-semibold text-red-800 mb-1">Refined Grains</p>
            <p className="text-gray-600">Limit white bread, white rice, and regular pasta. Choose whole grain alternatives.</p>
          </div>
        </div>
      </div>

      {/* Sample Meal Plan */}
      <div className="mb-6">
        <h3 className="font-bold text-sm uppercase tracking-wide text-gray-700 mb-3 border-b border-gray-300 pb-1">
          Sample Daily Meal Plan
        </h3>
        <div className="text-sm space-y-3">
          <div className="flex gap-3">
            <span className="font-semibold text-gray-700 w-24 shrink-0">Breakfast:</span>
            <span className="text-gray-600">Greek yogurt with berries, walnuts, and a drizzle of honey. Whole grain toast with olive oil.</span>
          </div>
          <div className="flex gap-3">
            <span className="font-semibold text-gray-700 w-24 shrink-0">Lunch:</span>
            <span className="text-gray-600">Large mixed green salad with chickpeas, tomatoes, cucumbers, feta cheese, and olive oil vinaigrette. Whole wheat pita.</span>
          </div>
          <div className="flex gap-3">
            <span className="font-semibold text-gray-700 w-24 shrink-0">Dinner:</span>
            <span className="text-gray-600">Grilled salmon with roasted vegetables (bell peppers, zucchini, onions) and quinoa. Side of steamed broccoli with lemon.</span>
          </div>
          <div className="flex gap-3">
            <span className="font-semibold text-gray-700 w-24 shrink-0">Snacks:</span>
            <span className="text-gray-600">Handful of almonds, fresh fruit, hummus with vegetable sticks, or a small piece of dark chocolate.</span>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mb-6">
        <h3 className="font-bold text-yellow-800 mb-2">Tips for Getting Started</h3>
        <ul className="text-sm text-gray-700 space-y-1.5 list-disc list-inside">
          <li>Start by replacing butter with extra virgin olive oil for cooking and dressings</li>
          <li>Add one extra serving of vegetables to each meal</li>
          <li>Eat fish twice a week instead of red meat</li>
          <li>Keep a bowl of fresh fruit on your counter for easy snacking</li>
          <li>Replace sugary drinks with water, herbal tea, or sparkling water with lemon</li>
          <li>Cook more meals at home using fresh, whole ingredients</li>
          <li>Enjoy meals slowly and with family when possible — it&apos;s part of the lifestyle</li>
        </ul>
      </div>

      {/* Benefits */}
      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded mb-6">
        <h3 className="font-bold text-blue-800 mb-2">Heart Health Benefits</h3>
        <ul className="text-sm text-gray-700 space-y-1.5 list-disc list-inside">
          <li><strong>Reduces cardiovascular events</strong> by approximately 30% (PREDIMED study)</li>
          <li><strong>Lowers LDL cholesterol</strong> and improves overall cholesterol ratios</li>
          <li><strong>Reduces blood pressure</strong> through potassium-rich foods and lower sodium</li>
          <li><strong>Decreases inflammation</strong> — a key driver of heart disease</li>
          <li><strong>Improves blood sugar control</strong> and reduces diabetes risk</li>
          <li><strong>Supports healthy weight</strong> management through nutrient-dense foods</li>
          <li><strong>Provides antioxidants</strong> that protect blood vessels from damage</li>
        </ul>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-400 mt-8 pt-4 border-t border-gray-200">
        <p className="font-semibold">West Houston Heart Center</p>
        <p>Dr. Humayun Naqvi, MD, MBA, FACC</p>
        <p>Phone: 832-271-5897 | Fax: 1 (877) 669-0063 | www.htxheart.com</p>
      </div>
    </div>
  );
}

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useLanguage } from "../contexts/LanguageContext";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const Results = ({ stats, isLoading }) => {
  const { language } = useLanguage();
  const isRTL = language === "ar";

  // Bilingual content
  const COLORS = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff8042",
    "#8dd1e1",
    "#d0ed57",
  ];
  const content = {
    ar: {
      title: "نظرة عامة على نتائج التصويت",
      votesByOption: "الأصوات حسب الخيار",
      distribution: "التوزيع",
      votesPerDay: "الأصوات يومياً (آخر 7 أيام)",
      votes: "أصوات",
      date: "التاريخ",
      loading: "جاري التحميل...",
      noData: "لا توجد بيانات لعرضها",
    },
    en: {
      title: "Poll Results Overview",
      votesByOption: "Votes by Option",
      distribution: "Distribution",
      votesPerDay: "Votes per Day (Last 7 Days)",
      votes: "votes",
      date: "Date",
      loading: "Loading...",
      noData: "No data to display",
    },
  };

  const current = content[language];

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "40px",
          flexDirection: "column",
          alignItems: "center",
          direction: isRTL ? "rtl" : "ltr",
        }}
      >
        <div className="spinner"></div>
        <p
          style={{
            fontFamily: isRTL ? "'Rubik', sans-serif" : "'Inter', sans-serif",
          }}
        >
          {current.loading}
        </p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "300px",
          direction: isRTL ? "rtl" : "ltr",
          fontFamily: isRTL ? "'Rubik', sans-serif" : "'Inter', sans-serif",
        }}
      >
        {current.noData}
      </div>
    );
  }

  const { breakdown, dailyStats } = stats;

  // Format breakdown data for charts
  const chartData = breakdown.map((item) => ({
    name: item._id,
    votes: item.count,
  }));

  // Format daily stats for line chart
  const formattedDailyStats = dailyStats.map((item) => ({
    date: item._id,
    votes: item.count,
  }));

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: "white",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            direction: isRTL ? "rtl" : "ltr",
            textAlign: isRTL ? "right" : "left",
            fontFamily: isRTL ? "'Rubik', sans-serif" : "'Inter', sans-serif",
          }}
        >
          <p style={{ margin: 0, fontWeight: "bold" }}>{label}</p>
          <p style={{ margin: 0, color: "#8884d8" }}>
            {payload[0].value} {current.votes}
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom pie label renderer (positions labels outside the pie)
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    outerRadius,
    percent,
    name,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 20;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#333"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
        fontFamily={isRTL ? "Rubik, sans-serif" : "Inter, sans-serif"}
      >
        {`${name}: ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div
      style={{
        padding: "20px",
        direction: isRTL ? "rtl" : "ltr",
        textAlign: isRTL ? "right" : "left",
        fontFamily: isRTL ? "'Rubik', sans-serif" : "'Inter', sans-serif",
      }}
    >
      <h3>{current.title}</h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          marginBottom: "40px",
        }}
      >
        {/* Bar Chart */}
        <div>
          <h4>{current.votesByOption}</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="name"
                tick={{
                  fontFamily: isRTL
                    ? "'Rubik', sans-serif"
                    : "'Inter', sans-serif'",
                  fontSize: 12,
                }}
              />

              <YAxis
                tick={{
                  fontFamily: isRTL
                    ? "'Rubik', sans-serif"
                    : "'Inter', sans-serif'",
                  fontSize: 12,
                }}
              />

              <Tooltip content={<CustomTooltip />} />

              <Legend
                wrapperStyle={{
                  fontFamily: isRTL
                    ? "'Rubik', sans-serif"
                    : "'Inter', sans-serif'",
                  fontSize: 12,
                }}
              />

              <Bar dataKey="votes" name={current.votes}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div>
          <h4>{current.distribution}</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="votes"
                labelLine={true}
                label={renderCustomizedLabel}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{
                  fontFamily: isRTL
                    ? "'Rubik', sans-serif"
                    : "'Inter', sans-serif'",
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Stats */}
      {formattedDailyStats.length > 0 && (
        <div>
          <h4>{current.votesPerDay}</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={formattedDailyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{
                  fontFamily: isRTL
                    ? "'Rubik', sans-serif"
                    : "'Inter', sans-serif'",
                  fontSize: 12,
                }}
              />
              <YAxis
                tick={{
                  fontFamily: isRTL
                    ? "'Rubik', sans-serif"
                    : "'Inter', sans-serif'",
                  fontSize: 12,
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="votes" name={current.votes} fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default Results;

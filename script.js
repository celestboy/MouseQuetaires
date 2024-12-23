





// Keep existing Chart.js initialization code at the end of your script.js
document.addEventListener("DOMContentLoaded", function () {
  const data = {
    labels: ["Consommation énergétique (kWh/mois)", "Émissions CO2 (kg/mois)"],
    datasets: [
      {
        label: "CMS",
        data: [6.86, 3.26],
        backgroundColor: "#ef4444",
      },
      {
        label: "Site Codé",
        data: [2.69, 1.28],
        backgroundColor: "#10b981",
      },
    ],
  };

  const config = {
    type: "bar",
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Valeur",
          },
        },
      },
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: false,
        },
      },
    },
  };

  const ctx = document.getElementById("impactChart").getContext("2d");
  new Chart(ctx, config);
});

/* GSAP Start */

document.querySelectorAll(".ai-item").forEach(item => {

  const preview = item.querySelector(".ai-preview");

  let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  let pos = { x: mouse.x, y: mouse.y };

  // update mouse position
  item.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  // show / hide preview with GSAP
  item.addEventListener("mouseenter", () => {
    gsap.to(preview, {
      opacity: 1,
      scale: 1,
      duration: 0.3,
      ease: "power3.out"
    });
  });

  item.addEventListener("mouseleave", () => {
    gsap.to(preview, {
      opacity: 0,
      scale: 0.9,
      duration: 0.25,
      ease: "power3.out"
    });
  });

  // GSAP ticker = ULTRA SMOOTH
  gsap.ticker.add(() => {
    pos.x += (mouse.x - pos.x) * 0.12;
    pos.y += (mouse.y - pos.y) * 0.12;

    gsap.set(preview, {
      x: pos.x,
      y: pos.y
    });
  });

});
/* GSAP Close */


document.addEventListener("DOMContentLoaded", () => {

  console.log("APP JS LOADED");

  const sections = document.querySelectorAll("[data-json]");

  if (!sections.length) {
    console.error("❌ No sections with data-json found");
    return;
  }

  sections.forEach(section => {

    const jsonPath = section.getAttribute("data-json");
    const grid = section.querySelector(".work-grid");

    if (!jsonPath) {
      console.error("❌ Missing data-json in section");
      return;
    }

    if (!grid) {
      console.error("❌ work-grid not found inside section");
      return;
    }

    console.log("Loading:", jsonPath);

    fetch(jsonPath)
      .then(res => {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(data => {

        grid.innerHTML = "";

        data.works.forEach((item, index) => {

          const delay = index * 0.08;

          let mediaHTML = "";

          if (item.type === "image") {
            mediaHTML = `
              <div class="card-img">
                <img src="${item.media}">
              </div>
            `;
          }

          else if (item.type === "video") {
            mediaHTML = `
              <div class="card-img">
                <video autoplay muted loop playsinline>
                  <source src="${item.media}">
                </video>
              </div>
            `;
          }

          else {
            mediaHTML = `<div class="card-visual"></div>`;
          }

          const textClass =
            item.textColor === "text-white"
              ? "is-white"
              : "is-dark";

          const card = `
            <div class="work-card reveal"
                 style="transition-delay:${delay}s">

              <div class="work-card-img ${item.theme}">
                ${mediaHTML}
              </div>

              <div class="card-arrow">
                <svg width="14" height="14" viewBox="0 0 14 14">
                  <path d="M2 12L12 2M12 2H5M12 2V9"
                    stroke="currentColor"
                    stroke-width="1.5"/>
                </svg>
              </div>

              <div class="work-card-info ${textClass}">
                <div class="card-tag">${item.tag}</div>
                <div class="card-name">${item.title}</div>
              </div>

            </div>
          `;

          grid.insertAdjacentHTML("beforeend", card);
        });

        setTimeout(() => {
          section.querySelectorAll(".reveal").forEach(el => {
            el.classList.add("visible");
          });
        }, 100);

      })
      .catch(err => {
        console.error("FETCH ERROR:", jsonPath, err);
      });

  });

});


document.addEventListener("DOMContentLoaded", () => {

  console.log("🔥 SERVICES INIT");

  const container = document.getElementById("servicesGrid");
  const section = document.getElementById("services");

  if (!section || !container) {
    console.error("❌ Missing section or container");
    return;
  }

  const jsonPath = section.dataset.json;

  console.log("📦 Loading JSON:", jsonPath);

  fetch(jsonPath)
    .then(res => {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(data => {

      console.log("✅ DATA LOADED:", data);

      container.innerHTML = "";

      data.services
        .slice()        // copy array
        .reverse()      // last → first
        .forEach(item => {

          container.insertAdjacentHTML("beforeend", `
            <div class="service-item reveal">

              <div class="service-num">${item.number}</div>

              <div class="service-icon">
                <i class="fa-solid ${item.icon}"></i>
              </div>

              <div class="service-name">${item.title}</div>

              <p class="service-desc">${item.desc}</p>

              <a href="${item.link}" class="service-link" target="_blank">
                View Site →
              </a>

            </div>
          `);

        });

    })
    .catch(err => {
      console.error("❌ FETCH ERROR:", err);
    });

});
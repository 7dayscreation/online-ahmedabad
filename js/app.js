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
  <a href="${item.link}" 
     class="work-card reveal"
     style="transition-delay:${delay}s"
     target="_blank">

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

  </a>
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


/* AI SITES JSON LOAD */

/* AI SITES */

document.addEventListener("DOMContentLoaded", () => {

  // PREVENT DOUBLE INIT
  if (window.aiSitesLoaded) return;
  window.aiSitesLoaded = true;

  const section = document.getElementById("aiSites");
  const container = document.getElementById("aiSitesGrid");
  const loadMoreBtn = document.getElementById("loadMoreAi");

  if (!section || !container || !loadMoreBtn) return;

  const jsonPath = section.dataset.json;

  const itemsPerLoad = 10;

  let allData = [];
  let currentIndex = 0;

  fetch(jsonPath)
    .then(res => {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(data => {

      allData = data;

      container.innerHTML = "";

      renderItems();

      loadMoreBtn.addEventListener("click", renderItems);

    })
    .catch(err => console.error(err));

  function renderItems() {

    const items = allData.slice(currentIndex, currentIndex + itemsPerLoad);
    const total = allData.length;

    items.forEach((item, index) => {

      const number = total - (currentIndex + index);
      const formatted = number < 10 ? `0${number}` : number;

      const tagsHTML = (item.tags || [])
        .slice(0, 3)
        .map(tag => `<span>${tag}</span>`)
        .join("");

      container.insertAdjacentHTML("beforeend", `
        <div class="ai-card">

          <div class="ai-number">${formatted}</div>

          <div class="ai-image">
            <img src="${item.image}" alt="${item.name}">
          </div>

          <div class="ai-content">
            <div class="ai-title">${item.name}</div>
            <div class="ai-tags">${tagsHTML}</div>
          </div>

          <div class="ai-date">${item.date}</div>

          <div class="ai-action">
            <a href="${item.url}" target="_blank" class="visit-btn">
              View Site
            </a>
          </div>

        </div>
      `);

    });

    currentIndex += itemsPerLoad;

    if (currentIndex >= total) {
      loadMoreBtn.style.display = "none";
    }
  }

});

/* Scroll With Image  */




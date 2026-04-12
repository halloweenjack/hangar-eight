document.addEventListener("DOMContentLoaded", function () {
  // feed.run();
  initializeSmoothScroll();
  initializeHeroFadeIn();
  initializeHeaderFadeIn();
  initializeToTopButton();
  initializeBlink();

  initializeVisibilityHandlers();

  var calendarEl = document.getElementById("calendar");
  var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    eventTimeFormat: { hour: "numeric", minute: "2-digit" },
    googleCalendarApiKey: "AIzaSyAX9F6qCXVIeiatFQ1RXE7NAmqroLkb2JQ",
    events: {
      googleCalendarId:
        "e1a4f31f4259b98dd48dc06d59fc88e1e14a39fc7d909dfb8b3127544777777d@group.calendar.google.com",
    },
    firstDay: 1,
    eventClick: function (info) {
      info.jsEvent.preventDefault();
    },
    eventDidMount: (e) => {
      tippy(e.el, {
        content: e.event.title,
      });
    },
  });
  calendar.render();
});

const initializeSmoothScroll = () => {
  new SmoothScroll('a[href*="#"]', {
    speedAsDuration: true,
    speed: 1000,
    easing: "easeInOutQuint",
    header: "#top",
  });
};

const initializeVisibilityHandlers = () => {
  const fadeInElements = document.querySelectorAll(".fade-in-element");
  const slideInElements = document.querySelectorAll(".slide-in-element");

  const handleVisibility = (elements) => {
    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top <= window.innerHeight) {
        el.classList.add("visible");
      }
    });
  };

  const checkVisibility = () => {
    handleVisibility(fadeInElements);
    handleVisibility(slideInElements);
  };

  window.addEventListener("scroll", checkVisibility);
  checkVisibility();
};

const initializeHeroFadeIn = () => {
  setTimeout(() => {
    document.querySelector("#hero").classList.add("fade-in");
  }, 1000);
};

const initializeHeaderFadeIn = () => {
  setTimeout(() => {
    document.querySelector("header").classList.add("fade-in");
  }, 1000);
};

const initializeToTopButton = () => {
  const toTopButton = document.querySelector("#toTop");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 100) {
      toTopButton.classList.add("visible");
    } else {
      toTopButton.classList.remove("visible");
    }
  });
};

const initializeBlink = () => {
  const arrow = document.querySelector(".arrow");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 100) {
      arrow.classList.add("invisible");
    } else {
      arrow.classList.remove("invisible");
    }
  });
};

document.addEventListener("scroll", function () {
  const header = document.querySelector("header");
  if (window.scrollY > 80) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});
// script.js
document.getElementById("menu-btn").addEventListener("click", function () {
  this.classList.toggle("active");
  document.getElementById("sp-menu").classList.toggle("show");
  document.getElementById("sp-menu-bg").classList.toggle("show");

  const toTopButton = document.getElementById("toTop");
  if (document.getElementById("sp-menu").classList.contains("show")) {
    toTopButton.classList.remove("visible");
    document.body.classList.add("no-scroll"); // スクロールを無効にする
  } else {
    toTopButton.classList.add("visible");
    document.body.classList.remove("no-scroll"); // スクロールを有効にする
  }
});

// sp-menu内のリンクをクリックしたときにメニューを閉じる
document.querySelectorAll("#sp-menu a").forEach((link) => {
  link.addEventListener("click", function () {
    document.getElementById("menu-btn").classList.remove("active");
    document.getElementById("sp-menu").classList.remove("show");
    document.getElementById("sp-menu-bg").classList.remove("show");
    document.getElementById("toTop").classList.add("visible");
    document.body.classList.remove("no-scroll"); // スクロールを有効にする
  });
});


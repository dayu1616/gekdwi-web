(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header scrolled state ---------- */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile navigation ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("primary-nav");

  function setNav(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Tutup menu navigasi" : "Buka menu navigasi");
    nav.classList.toggle("is-open", open);
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setNav(toggle.getAttribute("aria-expanded") !== "true");
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) setNav(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        setNav(false);
        toggle.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 820) setNav(false);
    });
  }

  /* ---------- Menu filter ---------- */
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip[data-filter]"));
  var items = Array.prototype.slice.call(document.querySelectorAll(".menu-item"));
  var emptyState = document.getElementById("menu-empty");

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var filter = chip.getAttribute("data-filter");

      chips.forEach(function (other) {
        var active = other === chip;
        other.classList.toggle("is-active", active);
        other.setAttribute("aria-pressed", String(active));
      });

      var shown = 0;
      items.forEach(function (item) {
        var match = filter === "semua" || item.getAttribute("data-cat") === filter;
        item.classList.toggle("is-hidden", !match);
        if (match) shown += 1;
      });

      if (emptyState) emptyState.hidden = shown !== 0;
    });
  });

  /* ---------- Reveal on scroll ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    revealEls.forEach(function (el, index) {
      el.style.transitionDelay = Math.min(index % 3, 2) * 70 + "ms";
      observer.observe(el);
    });
  }

  /* ---------- Reservation form ---------- */
  var form = document.getElementById("reservation-form");
  var status = document.getElementById("form-status");

  if (form) {
    var fields = {
      nama: document.getElementById("nama"),
      orang: document.getElementById("orang"),
      tanggal: document.getElementById("tanggal"),
      jam: document.getElementById("jam")
    };

    var today = new Date();
    var iso = today.getFullYear() + "-" +
      String(today.getMonth() + 1).padStart(2, "0") + "-" +
      String(today.getDate()).padStart(2, "0");
    if (fields.tanggal) fields.tanggal.min = iso;

    function errorFor(name) {
      return document.getElementById(name + "-error");
    }

    function setError(name, hasError) {
      var input = fields[name];
      var message = errorFor(name);
      if (!input || !message) return;
      input.parentElement.classList.toggle("has-error", hasError);
      input.setAttribute("aria-invalid", String(hasError));
      message.hidden = !hasError;
    }

    function validate() {
      var firstInvalid = null;

      if (!fields.nama.value.trim()) {
        setError("nama", true);
        firstInvalid = firstInvalid || fields.nama;
      } else {
        setError("nama", false);
      }

      if (!fields.orang.value) {
        setError("orang", true);
        firstInvalid = firstInvalid || fields.orang;
      } else {
        setError("orang", false);
      }

      var dateValue = fields.tanggal.value;
      if (!dateValue) {
        setError("tanggal", true);
        firstInvalid = firstInvalid || fields.tanggal;
      } else if (dateValue < iso) {
        setError("tanggal", true);
        var dateMsg = errorFor("tanggal");
        if (dateMsg) dateMsg.textContent = "Tanggal tidak boleh di masa lalu.";
        firstInvalid = firstInvalid || fields.tanggal;
      } else {
        setError("tanggal", false);
      }

      if (!fields.jam.value) {
        setError("jam", true);
        firstInvalid = firstInvalid || fields.jam;
      } else {
        setError("jam", false);
      }

      return firstInvalid;
    }

    Object.keys(fields).forEach(function (name) {
      var input = fields[name];
      if (!input) return;
      var eventName = input.tagName === "SELECT" ? "change" : "input";
      input.addEventListener(eventName, function () {
        if (input.parentElement.classList.contains("has-error")) {
          setError(name, false);
          if (name === "tanggal") {
            var dateMsg = errorFor("tanggal");
            if (dateMsg) dateMsg.textContent = "Pilih tanggal kedatangan.";
          }
        }
        if (status) {
          status.textContent = "";
          status.className = "form__status";
        }
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!status) return;

      var invalid = validate();
      if (invalid) {
        status.textContent = "Mohon lengkapi data yang ditandai di atas.";
        status.className = "form__status is-error";
        invalid.focus();
        return;
      }

      var submitBtn = form.querySelector('button[type="submit"]');
      var nama = fields.nama.value.trim();
      var orang = fields.orang.value;
      var tanggal = fields.tanggal.value;
      var jam = fields.jam.value;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Mengirim…";
      }
      status.textContent = "";
      status.className = "form__status";

      window.setTimeout(function () {
        var formatted = tanggal;
        try {
          formatted = new Date(tanggal + "T00:00:00").toLocaleDateString("id-ID", {
            day: "numeric", month: "long", year: "numeric"
          });
        } catch (e) { /* keep raw value */ }

        status.textContent = "Terima kasih, " + nama + ". Permintaan meja untuk " +
          orang + " orang pada " + formatted + " pukul " + jam +
          " sudah kami terima. Kami akan menghubungi kamu untuk konfirmasi.";
        status.className = "form__status is-success";

        form.reset();
        Object.keys(fields).forEach(function (name) { setError(name, false); });

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Kirim permintaan";
        }
        if (fields.tanggal) fields.tanggal.min = iso;
      }, 700);
    });
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();

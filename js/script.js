/* Ambikesh.dev — interactions. All data comes from SITE_CONFIG in config.js */
(function () {
  "use strict";
  const C = SITE_CONFIG;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  // A link is "configured" only if it is non-empty and not a placeholder.
  const isSet = (v) => typeof v === "string" && v.trim() !== "" && !/^ADD_/i.test(v) && !/YOUR_USERNAME/i.test(v);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(t._h);
    t._h = setTimeout(() => t.classList.remove("show"), 3800);
  }

  // Button: real link or "Coming Soon"
  function linkBtn(url, label, icon, cls = "btn-ghost-x") {
    if (isSet(url)) {
      return `<a class="btn-x btn-sm-x ${cls}" href="${esc(url)}" target="_blank" rel="noopener noreferrer"><i class="${icon}"></i>${label}</a>`;
    }
    return `<span class="btn-x btn-sm-x ${cls} disabled" aria-disabled="true" title="Not configured yet"><i class="${icon}"></i>${label}: Coming Soon</span>`;
  }

  /* ---------- Social links ---------- */
  const socialMap = {
    github: ["bi bi-github", "GitHub"],
    linkedin: ["bi bi-linkedin", "LinkedIn"],
    instagram: ["bi bi-instagram", "Instagram"],
    twitter: ["bi bi-twitter-x", "X (Twitter)"],
    facebook: ["bi bi-facebook", "Facebook"]
  };
  function renderSocials() {
    $$("[data-socials]").forEach((box) => {
      let html = "";
      Object.entries(socialMap).forEach(([k, [icon, label]]) => {
        const url = C.social[k];
        html += isSet(url)
          ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer" aria-label="${label}"><i class="${icon}"></i></a>`
          : `<a href="#" class="unset" data-unset="${label}" aria-label="${label} (coming soon)"><i class="${icon}"></i></a>`;
      });
      html += isSet(C.email)
        ? `<a href="mailto:${esc(C.email)}" aria-label="Email"><i class="bi bi-envelope-fill"></i></a>`
        : `<a href="#" class="unset" data-unset="Email" aria-label="Email (coming soon)"><i class="bi bi-envelope-fill"></i></a>`;
      box.innerHTML = html;
    });
    document.addEventListener("click", (e) => {
      const a = e.target.closest("[data-unset]");
      if (a) { e.preventDefault(); toast(`${a.dataset.unset} link is coming soon.`); }
    });
  }

  /* ---------- Projects ---------- */
  function renderProjects() {
    const grid = $("#projectGrid");
    grid.innerHTML = C.projects.map((p, i) => `
      <div class="col-md-6 col-lg-4 project-col reveal" data-filter="${p.filter}">
        <article class="glass card-hover project-card">
          <div class="project-thumb">
            <img src="${esc(p.image)}" alt="${esc(p.title)} project thumbnail" loading="lazy" width="1024" height="656">
            <span class="project-cat">${esc(p.category)}</span>
          </div>
          <div class="project-body">
            <h3>${esc(p.title)}</h3>
            <p>${esc(p.description)}</p>
            <div>${p.tech.map((t) => `<span class="tech-tag">${esc(t)}</span>`).join("")}</div>
            <div class="project-actions">
              ${linkBtn(p.github, "GitHub", "bi bi-github")}
              ${linkBtn(p.demo, "Live Demo", "bi bi-box-arrow-up-right")}
              <button class="btn-x btn-sm-x btn-primary-x" data-detail="${i}"><i class="bi bi-eye"></i>Details</button>
            </div>
          </div>
        </article>
      </div>`).join("");

    $$(".filter-btn").forEach((b) => b.addEventListener("click", () => {
      $$(".filter-btn").forEach((x) => { x.classList.remove("active"); x.setAttribute("aria-pressed", "false"); });
      b.classList.add("active"); b.setAttribute("aria-pressed", "true");
      const f = b.dataset.f;
      $$(".project-col").forEach((c) => c.classList.toggle("hidden-item", f !== "all" && c.dataset.filter !== f));
    }));

    grid.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-detail]");
      if (!btn) return;
      const p = C.projects[+btn.dataset.detail];
      $("#modalContent").innerHTML = `
        <img src="${esc(p.image)}" alt="${esc(p.title)}" style="width:100%;aspect-ratio:16/9;object-fit:cover">
        <div class="p-4">
          <span class="section-tag">${esc(p.category)}</span>
          <h3 id="modalTitle" class="mt-2">${esc(p.title)}</h3>
          <p class="text-muted-c">${esc(p.description)}</p>
          <h5 class="mt-3" style="font-size:1rem">Technologies</h5>
          <div>${p.tech.map((t) => `<span class="tech-tag">${esc(t)}</span>`).join("")}</div>
          <div class="project-actions mt-3">${linkBtn(p.github, "GitHub", "bi bi-github")}${linkBtn(p.demo, "Live Demo", "bi bi-box-arrow-up-right")}</div>
        </div>`;
      openModal();
    });
  }
  let lastFocus = null;
  function openModal() { lastFocus = document.activeElement; $("#projectModal").classList.add("open"); $(".modal-close").focus(); document.body.style.overflow = "hidden"; }
  function closeModal() { $("#projectModal").classList.remove("open"); document.body.style.overflow = ""; lastFocus && lastFocus.focus(); }

  /* ---------- Internships ---------- */
  function renderInternships() {
    $("#internTimeline").innerHTML = C.internships.map((n) => `
      <div class="tl-item reveal">
        <span class="tl-dot"></span>
        <div class="glass card-hover tl-card">
          <h3 style="font-size:1.25rem">${esc(n.organization)}</h3>
          <div class="tl-meta">
            <span><i class="bi bi-cpu"></i>${esc(n.domain)}</span>
            <span><i class="bi bi-calendar3"></i>${esc(n.duration)}</span>
            <span><i class="bi ${n.mode === "Offline" ? "bi-geo-alt" : n.mode === "Online (Virtual)" ? "bi-display" : "bi-question-circle"}"></i>Mode: ${isSet(n.mode) ? esc(n.mode) : "To be added"}</span>
            ${n.project ? `<span><i class="bi bi-kanban"></i>Project: ${esc(n.project)}</span>` : ""}
          </div>
          <p class="text-muted-c mb-3">${esc(n.description)}</p>
          <div class="project-actions">${linkBtn(n.certificate, "Certificate", "bi bi-award", "btn-primary-x")}${linkBtn(n.website, "Organization", "bi bi-globe")}${linkBtn(n.github, "GitHub", "bi bi-github")}</div>
        </div>
      </div>`).join("");
  }

  /* ---------- Certificates ---------- */
  function renderCerts() {
    const v = (x) => (isSet(x) ? esc(x) : `<span class="pending">To be added</span>`);
    $("#certGrid").innerHTML = C.certificates.map((c) => `
      <div class="col-md-6 col-lg-4 reveal">
        <div class="glass card-hover cert-card">
          <div class="skill-icon"><i class="bi ${esc(c.icon)}"></i></div>
          <h3 style="font-size:1.1rem">${esc(c.title)}</h3>
          <p class="text-muted-c mb-3" style="font-size:.9rem">${esc(c.issuer)}</p>
          <div class="cert-row"><span>Issue date</span><span>${v(c.date)}</span></div>
          <div class="cert-row"><span>Certificate ID</span><span>${v(c.id)}</span></div>
          <div class="project-actions mt-auto pt-3">${linkBtn(c.verify, "Verify", "bi bi-patch-check")}${linkBtn(c.file, "View", "bi bi-file-earmark-pdf")}</div>
        </div>
      </div>`).join("") + `
      <div class="col-md-6 col-lg-4 reveal">
        <div class="glass cert-card" style="border-style:dashed;justify-content:center;text-align:center">
          <div class="skill-icon mx-auto"><i class="bi bi-plus-lg"></i></div>
          <h3 style="font-size:1.1rem">Additional Certifications</h3>
          <p class="text-muted-c mb-0" style="font-size:.9rem">More certifications will be added here as they are earned.</p>
        </div>
      </div>`;
  }

  /* ---------- Contact info ---------- */
  function renderContact() {
    const rows = [
      ["bi-envelope", "Email", C.email, isSet(C.email) ? `mailto:${C.email}` : null],
      ["bi-telephone", "Phone", C.phone, isSet(C.phone) ? `tel:${C.phone.replace(/\s/g, "")}` : null],
      ["bi-geo-alt", "Location", C.location, null],
      ["bi-linkedin", "LinkedIn", C.social.linkedin, isSet(C.social.linkedin) ? C.social.linkedin : null],
      ["bi-github", "GitHub", C.social.github, isSet(C.social.github) ? C.social.github : null]
    ];
    $("#contactInfo").innerHTML = rows.map(([ic, label, val, href]) => {
      const shown = label === "Location" || isSet(val) ? esc(val) : `<span class="text-muted-c">Coming soon</span>`;
      const inner = href ? `<a href="${esc(href)}" ${href.startsWith("http") ? 'target="_blank" rel="noopener noreferrer"' : ""}>${shown}</a>` : shown;
      return `<div class="contact-line"><div class="skill-icon"><i class="bi ${ic}"></i></div><div><small class="text-muted-c">${label}</small><div>${inner}</div></div></div>`;
    }).join("");
  }

  /* ---------- Resume ---------- */
  function initResume() {
    $$("[data-resume]").forEach((b) => b.addEventListener("click", async (e) => {
      e.preventDefault();
      if (!isSet(C.resume)) return toast("Resume is not configured yet.");
      try {
        const r = await fetch(C.resume, { method: "HEAD" });
        const type = r.headers.get("content-type") || "";
        if (!r.ok || type.includes("text/html")) throw new Error("missing");
        const a = document.createElement("a");
        a.href = C.resume; a.download = C.resume.split("/").pop();
        document.body.appendChild(a); a.click(); a.remove();
      } catch {
        toast("The resume PDF hasn't been uploaded yet. Please check back soon or contact me directly.");
      }
    }));
  }

  /* ---------- Contact form ---------- */
  function initForm() {
    const form = $("#contactForm");
    const status = $("#formStatus");
    const rules = {
      name: (v) => (v.trim().length >= 2 ? "" : "Please enter your full name."),
      email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Please enter a valid email address."),
      subject: (v) => (v.trim().length >= 3 ? "" : "Please add a short subject."),
      message: (v) => (v.trim().length >= 10 ? "" : "Message should be at least 10 characters.")
    };
    const check = (el) => {
      const msg = rules[el.name](el.value);
      el.classList.toggle("invalid", !!msg);
      el.setAttribute("aria-invalid", msg ? "true" : "false");
      $(`#err-${el.name}`).textContent = msg;
      return !msg;
    };
    $$("input, textarea", form).forEach((el) => el.addEventListener("blur", () => check(el)));
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const ok = $$("input, textarea", form).map(check).every(Boolean);
      if (!ok) { status.className = "notice mt-3"; status.textContent = "Please fix the highlighted fields."; status.hidden = false; return; }
      const d = Object.fromEntries(new FormData(form));
      if (!isSet(C.email)) {
        status.className = "notice mt-3";
        status.textContent = "Your message looks good, but no email address or email service has been configured yet, so it can't be sent. Please reach out via the social links for now.";
        status.hidden = false;
        return;
      }
      const body = `Name: ${d.name}\nEmail: ${d.email}\n\n${d.message}`;
      window.location.href = `mailto:${C.email}?subject=${encodeURIComponent(d.subject)}&body=${encodeURIComponent(body)}`;
      status.className = "notice ok mt-3";
      status.textContent = "Your email app should open with this message pre-filled. Please press Send there to deliver it.";
      status.hidden = false;
    });
  }

  /* ---------- Typing ---------- */
  function initTyping() {
    const el = $("#typed");
    const words = ["Computer Science Engineering Student","Gate Aspirant", "Aspiring Software Engineer", "Frontend Developer", "Programmer"];
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { el.textContent = words[1]; return; }
    let w = 0, i = 0, del = false;
    (function tick() {
      const word = words[w];
      el.textContent = word.slice(0, i);
      if (!del && i < word.length) i++;
      else if (del && i > 0) i--;
      else if (!del) { del = true; return setTimeout(tick, 1600); }
      else { del = false; w = (w + 1) % words.length; }
      setTimeout(tick, del ? 35 : 70);
    })();
  }

  /* ---------- Nav, reveal, misc ---------- */
  function initNav() {
    const nav = $(".site-nav"), links = $("#navLinks"), burger = $(".burger"), toTop = $("#toTop");
    const onScroll = () => {
      nav.classList.toggle("scrolled", scrollY > 20);
      toTop.classList.toggle("show", scrollY > 600);
    };
    addEventListener("scroll", onScroll, { passive: true }); onScroll();
    burger.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      burger.setAttribute("aria-expanded", open);
      burger.innerHTML = open ? '<i class="bi bi-x-lg"></i>' : '<i class="bi bi-list"></i>';
    });
    $$("a", links).forEach((a) => a.addEventListener("click", () => {
      links.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); burger.innerHTML = '<i class="bi bi-list"></i>';
    }));
    toTop.addEventListener("click", () => scrollTo({ top: 0 }));

    const navMap = new Map($$("a", links).map((a) => [a.getAttribute("href").slice(1), a]));
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting && navMap.has(en.target.id)) {
          navMap.forEach((a) => a.classList.remove("active"));
          navMap.get(en.target.id).classList.add("active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$("section[id]").forEach((s) => spy.observe(s));
  }
  function initReveal() {
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("visible"); io.unobserve(en.target); }
    }), { threshold: 0.12 });
    $$(".reveal").forEach((el) => io.observe(el));
  }
  function initFaq() {
    $$(".faq-q").forEach((q) => q.addEventListener("click", () => {
      const item = q.parentElement, a = q.nextElementSibling, open = !item.classList.contains("open");
      item.classList.toggle("open", open); q.setAttribute("aria-expanded", open);
      a.style.maxHeight = open ? a.scrollHeight + "px" : 0;
    }));
  }

  document.addEventListener("DOMContentLoaded", () => {
    $$("[data-brand]").forEach((e) => (e.textContent = C.brand));
    $("#year").textContent = new Date().getFullYear();
    renderSocials(); renderProjects(); renderInternships(); renderCerts(); renderContact();
    initResume(); initForm(); initTyping(); initNav(); initFaq(); initReveal();
    $(".modal-close").addEventListener("click", closeModal);
    $("#projectModal").addEventListener("click", (e) => { if (e.target.id === "projectModal") closeModal(); });
    addEventListener("keydown", (e) => { if (e.key === "Escape" && $("#projectModal").classList.contains("open")) closeModal(); });
  });
  addEventListener("load", () => setTimeout(() => $("#preloader").classList.add("hide"), 300));
  setTimeout(() => { const p = $("#preloader"); p && p.classList.add("hide"); }, 3500);
})();

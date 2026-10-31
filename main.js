/* Locutor Digital · interações da landing page */

/*
 * Destino do formulário de piloto.
 * Cole aqui a URL de um serviço que receba POST em JSON (Formspree, Getform,
 * webhook do n8n, endpoint próprio). Enquanto estiver vazio, o formulário
 * valida os campos e mostra um aviso em vez de fingir que enviou.
 */
const FORM_ENDPOINT = "";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Onda do player (hero) ---------- */

(function buildWave() {
  const wave = document.getElementById("wave");
  if (!wave) return;
  const count = window.innerWidth < 768 ? 40 : 56;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const bar = document.createElement("span");
    const t = i / count;
    const envelope = 0.45 + 0.55 * Math.abs(Math.sin(t * Math.PI * 2.4 + 0.6));
    const lo = (0.12 + 0.18 * ((i * 7) % 5) / 5) * envelope;
    const hi = Math.min(1, (0.55 + 0.45 * ((i * 13) % 7) / 7) * envelope + 0.1);
    bar.style.setProperty("--lo", lo.toFixed(2));
    bar.style.setProperty("--hi", hi.toFixed(2));
    bar.style.animationDelay = `${-((i * 173) % 1600)}ms`;
    if (i < Math.round(count * 0.28)) bar.classList.add("is-hot");
    frag.appendChild(bar);
  }
  wave.appendChild(frag);
})();

/* ---------- Curva de ducking ---------- */

(function buildDuck() {
  const path = document.getElementById("duck-path");
  if (!path) return;
  const width = 600;
  const mid = 104;
  const pts = [];
  for (let x = 0; x <= width; x += 2) {
    // amplitude cai suavemente ao entrar na locução e volta ao sair
    const inDuck = 1 / (1 + Math.exp(-(x - 205) / 8)) - 1 / (1 + Math.exp(-(x - 395) / 8));
    const amp = 50 - 38 * inDuck;
    const y = mid + amp * Math.sin((x / width) * Math.PI * 18);
    pts.push(`${x === 0 ? "M" : "L"}${x} ${y.toFixed(1)}`);
  }
  path.setAttribute("d", pts.join(" "));
})();

/* ---------- Revelação no scroll ---------- */

(function reveals() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
  );
  // pequeno escalonamento entre irmãos para a grade não entrar de uma vez
  items.forEach((el) => {
    const siblings = Array.from(el.parentElement.children).filter((c) => c.classList.contains("reveal"));
    const index = siblings.indexOf(el);
    if (index > 0 && !reduceMotion) el.style.transitionDelay = `${Math.min(index, 5) * 80}ms`;
    io.observe(el);
  });
})();

/* ---------- Tagline palavra por palavra ---------- */

(function tagline() {
  const root = document.querySelector("[data-tagline]");
  if (!root) return;

  const words = [];
  const wrap = (node, accent) => {
    node.textContent
      .trim()
      .split(/\s+/)
      .forEach((text, i, arr) => {
        const span = document.createElement("span");
        span.className = "w" + (accent ? " is-accent" : "");
        span.textContent = text;
        words.push(span);
        root.appendChild(span);
        root.appendChild(document.createTextNode(" "));
      });
  };

  const parts = Array.from(root.childNodes);
  root.textContent = "";
  parts.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent.trim()) wrap(node, false);
    } else {
      wrap(node, node.hasAttribute("data-accent"));
    }
  });

  if (reduceMotion) {
    words.forEach((w) => w.classList.add("is-on"));
    return;
  }

  let ticking = false;
  const update = () => {
    ticking = false;
    const line = window.innerHeight * 0.62;
    let allOn = true;
    words.forEach((w) => {
      const on = w.getBoundingClientRect().top < line;
      w.classList.toggle("is-on", on);
      if (!on) allOn = false;
    });
    // uma vez acesa por inteiro, a frase permanece acesa
    if (allOn) window.removeEventListener("scroll", onScroll);
  };
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  update();
})();

/* ---------- Menu mobile ---------- */

(function mobileMenu() {
  const toggle = document.querySelector(".nav__toggle");
  const menu = document.getElementById("menu-mobile");
  if (!toggle || !menu) return;
  const items = menu.querySelectorAll("li");

  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    menu.setAttribute("aria-hidden", String(!open));
    menu.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
    items.forEach((li, i) => {
      li.style.transitionDelay = open ? `${Math.min(i * 60, 400)}ms` : "0ms";
    });
  };

  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  menu.addEventListener("click", (e) => {
    if (e.target.closest("a")) setOpen(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("is-open")) {
      setOpen(false);
      toggle.focus();
    }
  });
  window.matchMedia("(min-width: 900px)").addEventListener("change", (e) => {
    if (e.matches) setOpen(false);
  });
})();

/* ---------- Item atual da navegação ---------- */

(function scrollSpy() {
  const links = document.querySelectorAll('.nav__links a[href^="#"]');
  const map = new Map();
  links.forEach((a) => {
    const section = document.querySelector(a.getAttribute("href"));
    if (section) map.set(section, a);
  });
  if (!("IntersectionObserver" in window) || !map.size) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.removeAttribute("aria-current"));
        map.get(entry.target).setAttribute("aria-current", "true");
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  map.forEach((_, section) => io.observe(section));
})();

/* ---------- Formulário de piloto ---------- */

(function pilotForm() {
  const form = document.getElementById("pilot-form");
  if (!form) return;
  const button = form.querySelector('button[type="submit"]');
  const ok = document.getElementById("form-ok");
  const error = document.getElementById("form-error");
  const errorText = document.getElementById("form-error-text");
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const validators = {
    nome: (v) => v.trim().length > 1,
    email: (v) => emailRe.test(v.trim()),
    empresa: (v) => v.trim().length > 1,
    lojas: (v) => v !== "",
  };

  const check = (input) => {
    const test = validators[input.name];
    if (!test) return true;
    const valid = test(input.value);
    const field = input.closest(".field");
    field.classList.toggle("has-error", !valid);
    input.setAttribute("aria-invalid", String(!valid));
    if (input.name === "email") {
      field.querySelector(".field__error span").textContent = input.value.trim()
        ? "Esse email parece incompleto. Confira o domínio."
        : "Informe seu email.";
    }
    return valid;
  };

  form.querySelectorAll("input, select").forEach((input) => {
    input.addEventListener("blur", () => {
      if (input.value) check(input);
    });
    input.addEventListener("input", () => {
      if (input.closest(".field").classList.contains("has-error")) check(input);
    });
  });

  const showError = (msg) => {
    errorText.textContent = msg;
    error.classList.add("is-visible");
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    ok.classList.remove("is-visible");
    error.classList.remove("is-visible");

    const inputs = Array.from(form.querySelectorAll("input, select"));
    const results = inputs.map(check);
    if (results.includes(false)) {
      inputs[results.indexOf(false)].focus();
      return;
    }

    if (!FORM_ENDPOINT) {
      showError("O envio online ainda não está ativo. Fale com a Studio Delf pelos canais de atendimento.");
      console.warn("Locutor Digital: defina FORM_ENDPOINT em main.js para ativar o formulário.");
      return;
    }

    button.setAttribute("aria-busy", "true");
    button.disabled = true;
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      ok.classList.add("is-visible");
    } catch (err) {
      showError("Não foi possível enviar agora. Verifique sua conexão e tente novamente.");
    } finally {
      button.removeAttribute("aria-busy");
      button.disabled = false;
    }
  });
})();

/* ---------- Ano no rodapé ---------- */

document.getElementById("year").textContent = new Date().getFullYear();

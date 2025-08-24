/* CYOAPlayerB — Stateful CYOA runtime with scrollable history
   - Each visited entry becomes its own block; previous choices are removed
   - Minimal Nunjucks-like templating for `{% if flags.X %}{% else %}{% endif %}`
   - Applies `set_flags` on arrival
   - Choice gating: if_all / if_any / if_none (at most one)
   - Done / Inventory panels
   - Typewriter effect; no mid-typing scrolls
   - After typing completes (or skip), scroll so the latest entry's *title* is at the top
*/
(function () {
  "use strict";

  class CYOAPlayerB {
    constructor(container_div, options = {}) {
      if (!container_div) throw new Error("CYOAPlayerB: container_div required");
      this.root = container_div;
      this.root.classList.add("cyoaB_container");

      this.opts = Object.assign(
        {
          typeDurationMinMs: 300,
          typeDurationMaxMs: 1400,
          alignTopPaddingPx: 8,   // small breathing room above the title when aligning
          restartLabel: "Restart",
          doneLabel: "Done",
          inventoryLabel: "Inventory",
          winLabel: "You win!",
          loseLabel: "You lose!",
        },
        options
      );

      this.game = null;
      this.state = { flags: {}, current_entry_id: null, visited: 0 };
      this._typingToken = null;
      this.$currentBlock = null;

      // Build UI
      this.root.innerHTML = `
        <div class="cyoaB_header">
          <div class="cyoaB_title"></div>
          <div class="cyoaB_meta"></div>
        </div>
        <div class="cyoaB_storystream" aria-live="polite"></div>
        <div class="cyoaB_end_of_game"></div>
        <div class="cyoaB_status">
          <div class="cyoaB_panel cyoaB_done_panel" hidden>
            <div class="cyoaB_panel_title">${this.opts.doneLabel}</div>
            <ul class="cyoaB_list cyoaB_done_list"></ul>
          </div>
          <div class="cyoaB_panel cyoaB_inventory_panel" hidden>
            <div class="cyoaB_panel_title">${this.opts.inventoryLabel}</div>
            <ul class="cyoaB_list cyoaB_inventory_list"></ul>
          </div>
        </div>
        <div class="cyoaB_controls">
          <button type="button" class="cyoaB_restart game_play_button">${this.opts.restartLabel}</button>
        </div>
      `;

      // Cache
      this.$title = this.root.querySelector(".cyoaB_title");
      this.$meta = this.root.querySelector(".cyoaB_meta");
      this.$stream = this.root.querySelector(".cyoaB_storystream");
      this.$end = this.root.querySelector(".cyoaB_end_of_game");
      this.$donePanel = this.root.querySelector(".cyoaB_done_panel");
      this.$doneList = this.root.querySelector(".cyoaB_done_list");
      this.$invPanel = this.root.querySelector(".cyoaB_inventory_panel");
      this.$invList = this.root.querySelector(".cyoaB_inventory_list");
      this.$restart = this.root.querySelector(".cyoaB_restart");

      // Events
      this.$restart.addEventListener("click", () => this.reset_game());
      this.$stream.addEventListener("click", (e) => {
        const link = e.target.closest("a[data-entry-id]");
        if (link) {
          e.preventDefault();
          this._choose(link.getAttribute("data-entry-id"));
          return;
        }
        const typing = e.target.closest(".cyoaB_entry_content.is-typing");
        if (typing && this._typingToken) this._typingToken.skip = true; // reveal & align
      });
    }

    set_game(json_game) {
      if (!json_game || !json_game.entries || !json_game.start_entry_id) {
        throw new Error("CYOAPlayerB: invalid game JSON");
      }
      this.game = json_game;
      this._validateGame(this.game);
      this._renderHeader();
      this.reset_game();
    }

    reset_game() {
      if (!this.game) return;
      this.state = { flags: {}, current_entry_id: this.game.start_entry_id, visited: 0 };
      this._typingToken = null;
      this.$currentBlock = null;
      this.$stream.innerHTML = "";
      this.$end.textContent = "";
      this.$end.className = "cyoaB_end_of_game";
      this._appendCurrent();
    }

    /* -------------------------
       Internal: rendering & logic
       ------------------------- */

    _renderHeader() {
      this.$title.textContent = this.game.title || "";
      this.$title.hidden = !this.game.title;
      const tagLine = [];
      if (this.game.description) tagLine.push(this.game.description);
      if (Array.isArray(this.game.tags) && this.game.tags.length) {
        tagLine.push(this.game.tags.map((t) => `#${t}`).join(" "));
      }
      this.$meta.textContent = tagLine.join(" · ");
      this.$meta.hidden = tagLine.length === 0;
    }

    _choose(nextId) {
      if (!this.game.entries[nextId]) {
        console.warn("Unknown entry_id:", nextId);
        return;
      }
      // Freeze current block (remove its choices)
      this._finalizeCurrentBlock();

      // Advance
      this.state.current_entry_id = nextId;
      this._appendCurrent();
    }

    _appendCurrent() {
      const entry = this.game.entries[this.state.current_entry_id];
      if (!entry) {
        console.warn("Missing entry:", this.state.current_entry_id);
        return;
      }

      // Apply set_flags ON ARRIVAL
      if (Array.isArray(entry.set_flags)) {
        for (const f of entry.set_flags) {
          if (typeof f === "string" && f.trim()) this.state.flags[f] = true;
        }
      }
      this.state.visited += 1;

      // Build new block
      const block = document.createElement("section");
      block.className = "cyoaB_entryblock";
      block.setAttribute("data-entry-id", this.state.current_entry_id);
      block.innerHTML = `
        <div class="cyoaB_entry">
          <div class="cyoaB_entry_id">${this.state.current_entry_id || ""}</div>
          <div class="cyoaB_entry_title"></div>
          <div class="cyoaB_entry_content" aria-live="polite"></div>
        </div>
        <div class="cyoaB_choices" role="list"></div>
      `;

      const $title = block.querySelector(".cyoaB_entry_title");
      const $content = block.querySelector(".cyoaB_entry_content");
      const $choices = block.querySelector(".cyoaB_choices");

      $title.textContent = entry.title || "";
      $title.hidden = !entry.title;

      // Render content with simple nunjucks-like if/else/endif and flags
      const renderedContent = this._renderTemplate(entry.content || "", this.state.flags);

      // Render choices/end now, but we will align after typing finishes
      this.$end.textContent = "";
      this.$end.className = "cyoaB_end_of_game";
      if (entry.end === "win" || entry.end === "lose") {
        $choices.innerHTML = "";
        this.$end.textContent = entry.end === "win" ? this.opts.winLabel : this.opts.loseLabel;
        this.$end.classList.add(entry.end === "win" ? "cyoaB_end_win" : "cyoaB_end_lose");
      } else {
        const frag = document.createDocumentFragment();
        const choices = Array.isArray(entry.choices) ? entry.choices : [];
        for (const c of choices) {
          if (!c || typeof c.entry_id !== "string") continue;
          if (!this._isChoiceVisible(c, this.state.flags)) continue;

          const a = document.createElement("a");
          a.href = "#";
          a.className = "cyoaB_choice_link entry_action";
          a.setAttribute("role", "listitem");
          a.setAttribute("data-entry-id", c.entry_id);
          a.textContent = c.content || "(continue)";
          frag.appendChild(a);
        }
        if (frag.childNodes.length) {
          $choices.appendChild(frag);
        } else {
          const span = document.createElement("div");
          span.className = "cyoaB_no_choices";
          span.textContent = "No choices available.";
          $choices.appendChild(span);
        }
      }

      // Append to stream and mark current
      this.$stream.appendChild(block);
      this.$currentBlock = block;

      // Update status panels for current state
      this._renderStatusPanels();

      // Typewriter for this block; when done, align latest title to top
      this._typewriterTo($content, renderedContent, $title);
    }

    _finalizeCurrentBlock() {
      if (!this.$currentBlock) return;
      const choices = this.$currentBlock.querySelector(".cyoaB_choices");
      if (choices) choices.remove(); // freeze block
    }

    _isChoiceVisible(choice, flags) {
      const tests = ["if_all", "if_any", "if_none"].filter((k) => k in choice);
      if (tests.length > 1) {
        console.warn("Choice has multiple visibility keys; using the first:", tests, choice);
      }
      const key = tests[0];
      if (!key) return true;

      const arr = Array.isArray(choice[key]) ? choice[key] : [];
      const get = (name) => !!flags[name];

      if (key === "if_all") return arr.every(get);
      if (key === "if_any") return arr.some(get);
      if (key === "if_none") return arr.every((n) => !get(n));
      return true;
    }

    _renderStatusPanels() {
      // Done
      const done = this.game.done_flags || {};
      this.$doneList.innerHTML = "";
      let doneCount = 0;
      for (const [flag, desc] of Object.entries(done)) {
        if (this.state.flags[flag]) {
          const li = document.createElement("li");
          li.textContent = desc || flag;
          this.$doneList.appendChild(li);
          doneCount++;
        }
      }
      this.$donePanel.hidden = doneCount === 0;

      // Inventory
      const inv = this.game.inventory_flags || {};
      this.$invList.innerHTML = "";
      let invCount = 0;
      for (const [flag, desc] of Object.entries(inv)) {
        if (this.state.flags[flag]) {
          const li = document.createElement("li");
          li.textContent = desc || flag;
          this.$invList.appendChild(li);
          invCount++;
        }
      }
      this.$invPanel.hidden = invCount === 0;
    }

    /* ------- Typewriter ------- */
    _stopTypewriter() {
      if (this._typingToken) {
        this._typingToken.cancelled = true;
        this._typingToken = null;
      }
    }

    // Now accepts anchorEl (the title) to align after typing
    _typewriterTo(el, fullText, anchorEl) {
      this._stopTypewriter();
      el.textContent = "";
      el.style.whiteSpace = "pre-wrap";
      el.classList.add("is-typing");

      const total = fullText.length;
      const duration = Math.min(
        this.opts.typeDurationMaxMs,
        Math.max(this.opts.typeDurationMinMs, total * 12) // ≈12ms per char, bounded
      );

      const token = { cancelled: false, skip: false };
      this._typingToken = token;

      const start = performance.now();
      const finish = () => {
        el.textContent = fullText;
        el.classList.remove("is-typing");
        this._typingToken = null;
        // Align newest entry title to top (container or window)
        this._scrollEntryTitleToTop(anchorEl || el);
      };

      const step = (now) => {
        if (token.cancelled) return;
        if (token.skip) return finish();

        const t = Math.min(1, (now - start) / duration);
        const chars = Math.floor(t * total);
        if (el.textContent.length !== chars) {
          el.textContent = fullText.slice(0, chars);
        }
        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          finish();
        }
      };
      requestAnimationFrame(step);
    }

    /* ------- Scrolling helpers ------- */

    _getScrollContainer() {
      // Prefer a scrollable ancestor of `this.root`; fallback to window
      let el = this.root;
      while (el) {
        const style = getComputedStyle(el);
        const canScrollY =
          (style.overflowY === "auto" || style.overflowY === "scroll") &&
          el.scrollHeight > el.clientHeight;
        if (canScrollY) return el;
        el = el.parentElement;
      }
      return window;
    }

    _scrollEntryTitleToTop(titleEl, immediate = false) {
      if (!titleEl) return;
      const container = this._getScrollContainer();
      const behavior = immediate ? "auto" : "smooth";
      const pad = this.opts.alignTopPaddingPx || 0;

      if (container === window) {
        const rect = titleEl.getBoundingClientRect();
        const currentY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
        const target = Math.max(0, currentY + rect.top - pad);
        try {
          window.scrollTo({ top: target, behavior });
        } catch {
          window.scrollTo(0, target);
        }
      } else {
        const cRect = container.getBoundingClientRect();
        const tRect = titleEl.getBoundingClientRect();
        const delta = (tRect.top - cRect.top) - pad;
        const target = Math.max(0, container.scrollTop + delta);
        try {
          container.scrollTo({ top: target, behavior });
        } catch {
          container.scrollTop = target;
        }
      }
    }

    /* --- Minimal Nunjucks-like `{% if flags.X %}{% else %}{% endif %}` with nesting --- */
    _renderTemplate(template, flags) {
      if (!template) return "";
      try {
        return this._renderIfBlocks(String(template), flags);
      } catch (e) {
        console.warn("Template render error:", e);
        return String(template).replace(/{%[^%]*%}/g, "");
      }
    }

    _renderIfBlocks(str, flags) {
      const IF_OPEN = /{%\s*if\s+([^%]+?)\s*%}/g;

      const evalCond = (expr) => {
        const e = expr.trim().replace(/\s+/g, " ");
        let negate = false;
        let body = e;
        if (body.startsWith("not ")) { negate = true; body = body.slice(4).trim(); }
        else if (body.startsWith("!")) { negate = true; body = body.slice(1).trim(); }
        const m = /^flags\.([A-Za-z0-9_]+)$/.exec(body);
        const val = m ? !!flags[m[1]] : false;
        return negate ? !val : val;
      };

      const renderOnce = (s) => {
        IF_OPEN.lastIndex = 0;
        const m = IF_OPEN.exec(s);
        if (!m) return s;
        const ifIdx = m.index;
        const cond = m[1];
        let pos = IF_OPEN.lastIndex;

        // find matching endif with depth tracking; track else at depth 1
        let depth = 1;
        let elseStart = -1, elseEnd = -1, bodyEnd = -1;

        while (pos < s.length) {
          const open = s.indexOf("{%", pos);
          if (open === -1) break;
          const close = s.indexOf("%}", open + 2);
          if (close === -1) break;
          const tag = s.slice(open + 2, close).trim();

          if (tag.startsWith("if ")) { depth++; pos = close + 2; continue; }
          if (tag === "endif") {
            depth--;
            if (depth === 0) { bodyEnd = open; pos = close + 2; break; }
            pos = close + 2; continue;
          }
          if (tag === "else" && depth === 1 && elseStart === -1) {
            elseStart = open; elseEnd = close + 2; pos = close + 2; continue;
          }
          pos = close + 2;
        }

        if (bodyEnd === -1) return s; // unbalanced; bail

        const before = s.slice(0, ifIdx);
        const trueBlock = s.slice(IF_OPEN.lastIndex, elseStart === -1 ? bodyEnd : elseStart);
        const falseBlock = elseStart === -1 ? "" : s.slice(elseEnd, bodyEnd);
        const after = s.slice(pos);

        const branch = evalCond(cond) ? trueBlock : falseBlock;
        return before + renderOnce(branch) + renderOnce(after);
      };

      let prev, cur = str;
      do {
        prev = cur;
        cur = renderOnce(cur);
      } while (cur !== prev && /{%\s*if\s+/.test(cur));
      return cur;
    }

    /* -------- Validation (console warnings only) -------- */
    _validateGame(game) {
      if (!game.entries[game.start_entry_id]) {
        console.warn("Validation: start_entry_id not found:", game.start_entry_id);
      }
      for (const [id, e] of Object.entries(game.entries)) {
        if (e && (e.end === "win" || e.end === "lose")) {
          if (Array.isArray(e.choices) && e.choices.length) {
            console.warn(`Validation: terminal entry "${id}" should have no choices.`);
          }
        }
        if (Array.isArray(e?.choices)) {
          for (const c of e.choices) {
            const has = ["if_all", "if_any", "if_none"].filter((k) => k in (c || {}));
            if (has.length > 1) {
              console.warn(`Validation: choice in "${id}" has multiple if_* keys:`, has, c);
            }
            if (!game.entries[c.entry_id]) {
              console.warn(`Validation: choice in "${id}" points to missing entry "${c.entry_id}"`);
            }
          }
        }
      }
    }
  }

  window.CYOAPlayerB = CYOAPlayerB;
})();
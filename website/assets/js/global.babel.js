"use strict";

document.addEventListener("DOMContentLoaded", function () {
  var search = document.querySelector(".header-search input");
  var autoCompleteCont = document.querySelector(".auto-complete-menu");
  var noResults = "<p style=\"padding: 0 10px; color: #fff\">No results.</p>";
  var debounce = null;
  var req = null;
  search.addEventListener("focus", function (e) {
    document.body.classList.add("show-auto-complete");
  });
  search.addEventListener("blur", function (e) {
    document.body.classList.remove("show-auto-complete");
  });
  search.addEventListener("input", function (e) {
    var val = e.target.value.trim();

    if (!val) {
      document.body.classList.remove("show-auto-complete");
      return;
    } else if (document.activeElement === search) {
      document.body.classList.add("show-auto-complete");
    }

    if (debounce) {
      clearTimeout(debounce);
    }

    if (req) {
      req.abort();
    }

    debounce = setTimeout(function () {
      req = new XMLHttpRequest();

      req.onreadystatechange = function () {
        if (this.readyState == 4) {
          var resp = JSON.parse(this.responseText);
          autoCompleteCont.innerHTML = "\n                            ".concat(resp.length ? resp.map(function (_ref) {
            var item = _ref.item;
            return "\n                                        <div class=\"search-item\">\n                                            <a href=\"".concat(item.url, "\">\n                                                <div class=\"search-item-inner\">\n                                                    <h3>").concat(item.title, "</h3>\n                                                    ").concat(item === null || item === void 0 ? void 0 : item.titlesArray.map(function (v) {
              var match = v.match(new RegExp(val, "gim"));
              return "<span class=\"header-span ".concat(match ? "highlight" : "", "\">").concat(v, "</span>");
            }).join(", "), "\n                                                </div>\n                                            </a>\n                                        </div>\n                                    ");
          }).join("") : noResults, "\n                        ");
        }
      };

      req.open("GET", "/auto-complete/" + encodeURIComponent(val), true);

      try {
        req.send();
      } catch (e) {
        autoCompleteCont.innerHTML = noResults;
      }

      debounce = null;
      req = null;
    }, 300);
  });
  var burger = document.querySelector(".burger");
  burger.addEventListener("click", function (e) {
    document.body.classList.toggle("show-mobile-header");
  });
});
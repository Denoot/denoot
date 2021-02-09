document.addEventListener("DOMContentLoaded", () => {

    const search = document.querySelector(".header-search input");
    const autoCompleteCont = document.querySelector(".auto-complete-menu");
    const noResults = `<p>No results.</p>`;
    let debounce = null;
    let req = null;

    search.addEventListener("focus", e => {
        document.body.classList.add("show-auto-complete");
    });
    search.addEventListener("blur", e => {
        document.body.classList.remove("show-auto-complete");
    });

    search.addEventListener("input", e => {

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

        debounce = setTimeout(() => {

            req = new XMLHttpRequest();
            req.onreadystatechange = function () {

                if (this.readyState == 4) {

                    const resp = JSON.parse(this.responseText);

                    autoCompleteCont.innerHTML = `
                            ${resp.length ? resp.map(({ item }) => {
                        return `
                                        <div class="search-item">
                                            <a href="${item.url}">
                                                <div class="search-item-inner">
                                                    <h3>${item.title}</h3>
                                                </div>
                                            </a>
                                        </div>
                                    `;
                    }).join("") : noResults
                        }
                        `

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


    const burger = document.querySelector(".burger");

    burger.addEventListener("click", e => {
        document.body.classList.toggle("show-mobile-header");
    });

});
/**
 * A web component which adds an input element to a list of elements
 * and allows them to be filtered
 */
class FilterableList extends HTMLElement {
  constructor() {
    super();

    // Template
    const template = document.getElementById("filterable-list").content;
    const shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.appendChild(template.cloneNode(true));

    this._input = this.shadowRoot.querySelector("input");
    this._list = this.shadowRoot.querySelector("ul");
    this._noResults = this.shadowRoot.querySelector(".no-results");

    this._input.addEventListener("input", () => this._filterItems());
  }

  _filterItems() {
    const searchText = this._input.value.toLowerCase();
    const items = Array.from(this.querySelectorAll("li"));

    let visibleItems = 0;

    items.forEach((item) => {
      const text = item.textContent.toLowerCase();
      const shouldShow = text.includes(searchText);
      item.classList.toggle("hidden", !shouldShow);
      if (shouldShow) visibleItems++;
    });

    this._noResults.style.display = visibleItems === 0 ? "block" : "none";
  }
}

customElements.define("filterable-list", FilterableList);

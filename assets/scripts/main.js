/**
 * Copied from Lodash
 */
function last(array) {
  let length = array == null ? 0 : array.length;
  return length ? array[length - 1] : undefined;
}

/**
 * A web component which adds an input element to a list of elements
 * and allows them to be filtered
 */
class FilterableList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    // Template
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }
      </style>
      <input part="search" type="search" placeholder="City or State">
      <ul part="list">
        <slot></slot>
      </ul>
      <div class="no-results" style="display: none;">
        No matching items found
      </div>
    `;

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

/**
 * Take a string like "113 PM EDT Sat Oct 12 2024" and turn it into an date object
 */
function parseDate(inputString) {
  console.log("Input string:", inputString);

  const dateRegex =
    /(\d{1,2})(\d{2}) (AM|PM)\ (\w{3,4})\ (\w{3})\ (\w{3})\ (\d{1,2})\ (\d{4})/;
  const dateMatch = dateRegex.exec(inputString);

  if (dateMatch) {
    try {
      // Capture groups
      const { hour, minute, ampm, zone, month, monthDate, year } = {
        hour: dateMatch[1],
        minute: dateMatch[2],
        ampm: dateMatch[3],
        zone: dateMatch[4],
        day: dateMatch[5],
        month: dateMatch[6],
        monthDate: dateMatch[7],
        year: dateMatch[8],
      };

      dayjs.extend(window.dayjs_plugin_utc);
      dayjs.extend(window.dayjs_plugin_timezone);
      dayjs.extend(window.dayjs_plugin_customParseFormat);

      const isoTimeZone = timezoneMap[zone];
      console.log("ISO timezone:", isoTimeZone);

      const rebuiltString = `${year}-${month}-${monthDate} ${hour}:${minute} ${ampm}`;
      console.log("Rebuilt string:", rebuiltString);

      const parsedDate = dayjs.tz(
        rebuiltString,
        "YYYY-MMM-D h:mm A",
        isoTimeZone
      );

      console.log("ISO date:", parsedDate.toISOString());

      return parsedDate;
    } catch (err) {
      return new Error(err);
    }
  } else {
    return null;
  }
}

const timezoneMap = {
  EST: "America/New_York", // Eastern Standard Time
  EDT: "America/New_York", // Eastern Daylight Time
  CST: "America/Chicago", // Central Standard Time
  CDT: "America/Chicago", // Central Daylight Time
  MST: "America/Denver", // Mountain Standard Time
  MDT: "America/Denver", // Mountain Daylight Time
  PST: "America/Los_Angeles", // Pacific Standard Time
  PDT: "America/Los_Angeles", // Pacific Daylight Time
  AKST: "America/Anchorage", // Alaska Standard Time
  AKDT: "America/Anchorage", // Alaska Daylight Time
  HST: "Pacific/Honolulu", // Hawaii Standard Time
  HDT: "Pacific/Honolulu", // Hawaii Daylight Time (rarely used)
  AST: "America/Puerto_Rico", // Atlantic Standard Time
  ADT: "America/Puerto_Rico", // Atlantic Daylight Time
  SST: "Pacific/Pago_Pago", // Samoa Standard Time
  ChST: "Pacific/Guam", // Chamorro Standard Time
};

class Line {
  line = "";
  title = "";
  text = "";
  keep = true;
  pre = false;
  blockDelimiter = false;
  number = 1;
  office = "";
  date = null;

  parseSectionTitle() {
    // .DISCUSSION... - an example of a section header
    const sectionTitleRegex = /^\.(.+)\.\.\./gm;

    // Execute the regex
    const sectionTitleMatch = sectionTitleRegex.exec(this.line);

    if (sectionTitleMatch) {
      this.title = sectionTitleMatch[1]; // first capture group
      this.text = this.line.replace(sectionTitleRegex, "");
    }
  }

  parseNewBlock() {
    if (this.line.length === 0) {
      this.keep = false;
      this.blockDelimiter = true;
    }
  }

  parseIgnore() {
    if (this.line.includes("&&") || this.line.includes("$$")) {
      this.keep = false;
    }
  }

  parseFormat() {
    this.pre = this.line.includes("  ") || this.line.includes("...");
  }

  parseOffice() {
    if (this.line.includes("National Weather Service") && this.number < 10) {
      this.office = this.line;
    }
  }

  parseDate() {
    // Parse dates between lines 5 and 10
    if (this.number > 5 && this.number < 10) {
      this.date = parseDate(this.text) || null;
    }
  }

  constructor(line, number) {
    this.line = line;
    this.text = line;
    this.number = number;

    this.parseSectionTitle();
    this.parseNewBlock();
    this.parseIgnore();
    this.parseFormat();
    this.parseOffice();
    this.parseDate();
  }
}

class SectionTitle {
  text = "";

  constructor(text) {
    this.text = text;
  }
}

class Block {
  text = "";
  type = "p";

  append(text, pre = false) {
    this.type = pre ? "pre" : "p";
    const spacer = pre ? "\n" : " ";
    const padding = this.text ? spacer : "";
    this.text = this.text.concat(padding, text);
  }

  constructor(text = "") {
    this.text = text;
  }
}

class Section {
  title = "";
  blocks = [new Block()];

  appendBlock(text) {
    if (last(this.blocks).length !== 0) {
      this.blocks.push(new Block(text, "p"));
    }
  }

  appendText(text, pre = false) {
    last(this.blocks).append(text, pre);
  }

  constructor(title) {
    this.title = new SectionTitle(title);
  }
}

class Discussion {
  sections = [new Section("HEADER")];
  office = "";
  date = null;
  text = "";
  sourceURL = "";

  // Append a new section to the discussion
  appendSection(title) {
    this.sections.push(new Section(title));
  }

  // Append text to the last block in the last section
  appendText(text, pre) {
    last(this.sections).appendText(text, pre);
  }

  async fetch() {
    await fetch(this.sourceURL)
      .then((res) => {
        return res.text();
      })
      .then((data) => {
        const parser = new DOMParser();
        const discussionPage = parser.parseFromString(data, "text/html");
        this.text = discussionPage.querySelector(
          "pre.glossaryProduct"
        ).innerText;
      });
  }

  parse() {
    let lineNumber = 1;

    const lines = this.text.split("\n");

    lines.forEach((read) => {
      const line = new Line(read, lineNumber);

      if (line.title) {
        this.appendSection(line.title);
      }

      if (line.blockDelimiter) {
        last(this.sections).appendBlock("");
      }

      if (line.keep) {
        this.appendText(line.text, line.pre);
      }

      if (line.office) {
        this.office = line.office;
      }

      if (line.date) {
        this.date = line.date;
      }

      // Increment line number
      lineNumber++;
    });
  }

  constructor(code) {
    this.sourceURL = `https://forecast.weather.gov/product.php?site=${code}&issuedby=${code}&product=AFD&format=TXT&version=1&glossary=0`;
  }
}

// Are we on a discussion page?
const discussionElement = document.getElementById("discussion");

if (discussionElement) {
  const discussionCode = discussionElement.dataset.code;
  const discussionSourceElement = document.getElementById("discussion-source");
  const discussion = new Discussion(discussionCode);

  // Source
  discussionSourceElement.href = discussion.sourceURL;

  // Fetch discussion data
  discussion.fetch().then(() => {
    discussion.parse();

    // Date
    if (discussion.date) {
      const dateElement = document.createElement("time");
      dateElement.className = "discussion-date";
      console.log(discussion.date);
      dateElement.textContent = `${discussion.date
        .toDate()
        .toLocaleDateString()}, ${discussion.date
        .toDate()
        .toLocaleTimeString()} (in your timezone)`;
      discussionElement.append(dateElement);
    }

    // Sections
    discussion.sections.forEach((section) => {
      // Header
      const headerElement = document.createElement("h3");
      headerElement.className = "section-header";
      headerElement.textContent = section.title.text;
      discussionElement.append(headerElement);

      // Blocks
      section.blocks.forEach((block) => {
        const blockElement = document.createElement(block.type);
        blockElement.textContent = block.text;
        discussionElement.append(blockElement);
      });
    });
  });
}

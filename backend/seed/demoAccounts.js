// Fixed histories for the demo accounts. Each one shows specific cases
// from the test table (see the plan). Ranges assume a 10-year check.

const contact = (name, role, phone) => ({
  name,
  role,
  phone,
  email: `${name.split(" ")[0]}.${name.split(" ").at(-1)}@example.com`.toLowerCase(),
});
const noContact = { name: "", role: "", phone: "", email: "" };

const job = (organization, title, startMonth, endMonth, person) => ({
  type: "work",
  organization,
  title,
  startMonth,
  endMonth,
  isCurrent: endMonth === null,
  contact: person,
  notes: "",
});

const school = (organization, title, startMonth, endMonth) => ({
  type: "school",
  organization,
  title,
  startMonth,
  endMonth,
  isCurrent: endMonth === null,
  contact: { name: "Registrar's Office", role: "Registrar", phone: "(617) 555-0110", email: "" },
  notes: "",
});

const other = (title, startMonth, endMonth, notes = "") => ({
  type: "other",
  organization: "",
  title,
  startMonth,
  endMonth,
  isCurrent: false,
  contact: noContact,
  notes,
});

export const DEMO_ACCOUNTS = {
  // No gaps; school and a part-time job overlap.
  "demo.complete": [
    school("Eastfield University", "B.S. in Computer Science", "2015-09", "2019-05"),
    job(
      "Brightpath Tutoring",
      "Tutor (part-time)",
      "2018-06",
      "2020-12",
      contact("Marcus Okafor", "Program Director", "(212) 555-0123"),
    ),
    job(
      "Summit Peak Software",
      "Software Developer",
      "2021-01",
      null,
      contact("Elena Varga", "Engineering Manager", "(415) 555-0141"),
    ),
  ],

  // Two 3-month gaps (one at the start of the range) and an explained period.
  "demo.gaps": [
    other(
      "Family caregiving",
      "2017-03",
      "2018-08",
      "Cared for a family member full time after a move.",
    ),
    school(
      "Northbrook Institute of Technology",
      "M.S. in Information Systems",
      "2018-09",
      "2020-05",
    ),
    job(
      "Northbrook Institute of Technology",
      "Teaching Assistant (part-time)",
      "2019-01",
      "2020-05",
      contact("Hana Tanaka", "Course Coordinator", "(617) 555-0172"),
    ),
    job(
      "Harbor Lane Logistics",
      "Data Analyst",
      "2020-09",
      null,
      contact("Priya Natarajan", "Operations Manager", "(312) 555-0131"),
    ),
  ],

  // A break covered by an explained period, so no gaps.
  "demo.explained": [
    job(
      "Cedar Point Health",
      "Medical Assistant",
      "2014-01",
      "2021-03",
      contact("Sofia Moreno", "Clinic Manager", "(305) 555-0158"),
    ),
    other("Family caregiving", "2021-04", "2022-01"),
    job(
      "Juniper Dental Group",
      "Office Manager",
      "2022-02",
      null,
      contact("Owen Brennan", "Director", "(206) 555-0187"),
    ),
  ],

  // No activities: the whole range is one gap.
  "demo.empty": [],
};

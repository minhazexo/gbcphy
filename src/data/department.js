// Canonical facts about the department, its college and its university.
// Page modules render these; edit copy and data here, not in the pages.
// `notices` is intentionally absent — it is live content and comes from
// the content store.

import {
  FaGraduationCap,
  FaFlask,
  FaUsers,
  FaEnvelope
} from "react-icons/fa";

export const DEPARTMENT = {
  name: "Department of Physics",
  college: "Government Bangla College",
  affiliation: "Attached College of Dhaka Central University",
  established: 2010,
  facultyCount: 8,
  rootsSummary:
    "Our department stands on a historic college and a new public university — Bangla-medium heritage since 1962, now united with six sister colleges under DCU (2026).",
  collegeInfo: {
    name: "Government Bangla College",
    bengaliName: "সরকারি বাঙলা কলেজ",
    established: "1 October 1962",
    founder: "Principal Abul Kashem",
    location: "Mirpur, Dhaka",
    origin:
      "Founded after the Language Movement to establish Bangla as a medium of higher education. Proposed at Bakshibazar's Nabakumar Institution with 30 students, the college began as a night college and grew into one of Dhaka's major public colleges.",
    milestones: [
      "1962 — Founded on 1 October by Principal Abul Kashem",
      "1963–1969 — Science, Commerce, B.Com and B.Sc sections opened",
      "1964 — 87.5% pass rate in BA examinations",
      "Founder wrote ~40 Bengali textbooks for Physics, Chemistry & Mathematics"
    ],
    website: "https://www.sarkaribanglacollege.gov.bd/"
  },
  universityInfo: {
    name: "Dhaka Central University",
    shortName: "DCU",
    established: "Ordinance 8 February 2026 · Act passed 10 April 2026",
    status: "Public university — 7 government colleges as attached colleges",
    origin:
      "Formed by uniting seven renowned government colleges of Dhaka under one academic framework after their affiliation with the University of Dhaka (2017–2025). Colleges retain their names, campuses and assets while DCU conducts curricula, examinations and certification.",
    colleges: [
      "Dhaka College",
      "Eden Mohila College",
      "Government Bangla College",
      "Government Titumir College",
      "Begum Badrunnesa Govt. Mohila College",
      "Kabi Nazrul Govt. College",
      "Govt. Shaheed Suhrawardy College"
    ],
    scale: "Around 200,000 students and 1,000+ teachers across the seven campuses",
    website: "https://www.dcu.ac.bd/"
  },
  mission:
    "To provide world-class physics education and foster scientific inquiry through rigorous academics, hands-on laboratory training, and meaningful research — preparing graduates for careers in academia, industry, and beyond.",
  visionShort: "Rigorous theory, hands-on labs, and mentorship — from B.Sc. Honours to M.Sc.",
  announcement: {
    label: "Notice",
    text: "M.Sc. final examination routine published — see Notices",
    target: "news"
  },
  contact: {
    address: "Science Building, Government Bangla College, Mirpur, Dhaka",
    street: "Science Building, Government Bangla College, Mirpur",
    locality: "Dhaka",
    country: "BD",
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=Government+Bangla+College+Mirpur+Dhaka",
    hours: "Department office hours as per college notice"
  },
  seo: {
    title: "Department of Physics | Government Bangla College",
    description:
      "Department of Physics, Government Bangla College (attached college of Dhaka Central University): B.Sc. Honours & M.Sc. programs, faculty, labs, class routine, and notices."
  },
  audiences: [
    {
      title: "Prospective Students",
      description: "Programs, eligibility, and how to apply under Dhaka Central University.",
      cta: "Explore programs",
      target: "programs",
      kind: "scroll"
    },
    {
      title: "Current Students",
      description: "Class routine, notices, and academic resources in one place.",
      cta: "View class routine",
      target: "/class-routine",
      kind: "route"
    },
    {
      title: "Researchers & Alumni",
      description: "Research areas, labs, faculty expertise, and collaboration.",
      cta: "Meet faculty",
      target: "/teachers",
      kind: "route"
    }
  ],
  quickLinks: [
    { label: "Programs", icon: <FaGraduationCap />, kind: "scroll", target: "programs" },
    { label: "Faculty", icon: <FaUsers />, kind: "route", target: "/teachers" },
    { label: "Research", icon: <FaFlask />, kind: "scroll", target: "research" },
    { label: "Contact", icon: <FaEnvelope />, kind: "scroll", target: "contact" }
  ],
  programs: [
    {
      title: "B.Sc. (Honours) in Physics",
      duration: "4 Years",
      description:
        "Undergraduate program following Dhaka Central University curriculum with theory, lab work, and viva-voce.",
      icon: <FaGraduationCap />,
      outcomes: [
        "Classical, quantum & statistical physics",
        "Laboratory & electronics training",
        "Preparation for M.Sc. and teaching careers"
      ],
      cta: "View syllabus & routine"
    },
    {
      title: "M.Sc. in Physics",
      duration: "1 Year",
      description:
        "Postgraduate program with advanced theory, practical, and research-oriented components.",
      icon: <FaFlask />,
      outcomes: [
        "Advanced theory & experiments",
        "Research aptitude & project work",
        "Pathways to academia and industry"
      ],
      cta: "Explore academic details"
    }
  ],
  researchAreas: [
    {
      title: "Condensed Matter Physics",
      description: "Solids, materials, and their electrical and magnetic behaviour."
    },
    {
      title: "Nuclear & Particle Physics",
      description: "Nuclei, particles, and fundamental interactions."
    },
    {
      title: "Electronics & Instrumentation",
      description: "Circuits, devices, and measurement techniques taught in labs."
    },
    {
      title: "Theoretical & Mathematical Physics",
      description: "Mathematical models of classical and quantum systems."
    },
    {
      title: "Experimental & Computational Physics",
      description: "Laboratory methods and computer-based analysis."
    }
  ],
  facilities: [
    {
      title: "Advanced Physics Laboratory",
      description: "Core honours/M.Sc. experiments — optics, modern physics, and heat."
    },
    {
      title: "Electronics Lab",
      description: "Analog/digital circuits, devices, and measurement setups."
    },
    {
      title: "Computer Lab",
      description: "Numerical analysis, simulation, and academic computing."
    },
    {
      title: "Department Seminar Library",
      description: "Reference books and study space for honours/M.Sc. students."
    }
  ],
  faqs: [
    {
      q: "Which degrees does the department offer?",
      a: "B.Sc. (Honours) in Physics (4 years) and M.Sc. in Physics (1 year), following the Dhaka Central University curriculum."
    },
    {
      q: "Where can I find class times and exam routines?",
      a: "All schedules are published on the Class Routine page. Examination notices also appear under Notices on this page."
    },
    {
      q: "Who teaches in the department?",
      a: "Eight faculty members — professors to demonstrators — covering theory and laboratory courses. See the Teachers page for profiles."
    },
    {
      q: "Where is the department located?",
      a: "Science Building, Government Bangla College, Mirpur, Dhaka. Use the Visit & Connect section map link for directions."
    }
  ],
  testimonials: [
    {
      text: "The department provided excellent research facilities and guidance for my postgraduate studies.",
      author: "Dr. Mohammad Ali",
      position: "Research Scientist"
    },
    {
      text: "The curriculum is well-structured and prepares students for both academia and industry.",
      author: "Sarah Khan",
      position: "Former Student, M.Sc."
    }
  ]
};

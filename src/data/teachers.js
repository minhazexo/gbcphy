// Canonical faculty roster for the Department of Physics.
// Source: Govt. Bangla College official roster — Physics (Dept 110)
// https://sarkaribanglacollege.gov.bd/teachersinfo/110 (accessed Sep 2026)
// Fields mirror the official listing verbatim (names transliterated,
// Bengali titles/designations, photos, emails, mobiles, BCS batches).
// The official site lists no subjects or years of experience, so those
// invented fields were removed. Two teachers have no photo on the official
// site (photo: null) — views render an initials avatar for them.

export const FACULTY = [
  {
    name: 'Kamrun Nahar',
    nameBn: 'কামরুন নাহার',
    photo: '/images/Teacher\'s%20Img/kamrun.jpg',
    email: 'kamrunnaher231977@gmail.com',
    phone: '01819464294',
    title: 'Professor, Department of Physics',
    designationBn: 'অধ্যাপক',
    department: 'Physics',
    batch: 'BCS 22'
  },
  {
    name: 'Mohammad Shariful Arefin',
    nameBn: 'মোহাম্মদ শরীফুল আরেফীন',
    photo: '/images/Teacher\'s%20Img/arefin.jpg',
    email: 'arefinroman@gmail.com',
    phone: '01712653188',
    title: 'Associate Professor, Department of Physics',
    designationBn: 'সহযোগী অধ্যাপক',
    department: 'Physics',
    batch: 'BCS 24'
  },
  {
    name: 'Farhana Fakrun Nesha',
    nameBn: 'ফারহানা ফকরুন নেছা',
    photo: '/images/Teacher\'s%20Img/farhana.jpg',
    email: 'nessanfarhana@gmail.com',
    phone: '01912732402',
    title: 'Associate Professor, Department of Physics',
    designationBn: 'সহযোগী অধ্যাপক',
    department: 'Physics',
    batch: 'BCS 28'
  },
  {
    name: 'Laboni Saha',
    nameBn: 'লাবণী সাহা',
    photo: '/images/Teacher\'s%20Img/Labani.jpg',
    email: 'labanisaha29@gmail.com',
    // Official listing shows 0178800775 (10 digits — appears truncated on the site)
    phone: '0178800775',
    title: 'Assistant Professor, Department of Physics',
    designationBn: 'সহকারী অধ্যাপক',
    department: 'Physics',
    batch: 'BCS 29'
  },
  {
    name: 'Tahrin Haque',
    nameBn: 'তাহরীন হক',
    photo: '/images/Teacher\'s%20Img/tahrin.jpg',
    email: 'tahrin.loka@yahoo.com',
    phone: '01916920750',
    title: 'Assistant Professor, Department of Physics',
    designationBn: 'সহকারী অধ্যাপক',
    department: 'Physics',
    batch: 'BCS 33'
  },
  {
    name: 'Awlad Hossain',
    nameBn: 'আওলাদ হোসেন',
    photo: '/images/Teacher\'s%20Img/Awlad.jpg',
    email: '',
    phone: '01724199348',
    title: 'Assistant Professor, Department of Physics',
    designationBn: 'সহকারী অধ্যাপক',
    department: 'Physics',
    batch: 'BCS 34'
  },
  {
    name: 'Naznin Ara Parvin',
    nameBn: 'নাজনীন আরা পারভীন',
    photo: '/images/Teacher\'s%20Img/najnin.jpg',
    email: 'naju.aeceiu@gmail.com',
    phone: '01747288393',
    title: 'Assistant Professor, Department of Physics',
    designationBn: 'সহকারী অধ্যাপক',
    department: 'Physics',
    batch: 'BCS 34'
  },
  {
    name: 'Shamima Sharmin',
    nameBn: 'শামিমা শারমিন',
    photo: '/images/Teacher\'s%20Img/Shamima.jpg',
    email: 'shamimasharmin732@gmail.com',
    phone: '01516063732',
    title: 'Demonstrator, Department of Physics',
    designationBn: 'প্রদর্শক',
    department: 'Physics',
    batch: ''
  }
];

export const facultyCount = FACULTY.length;

export const facultyPreview = (limit = 3) => FACULTY.slice(0, limit);

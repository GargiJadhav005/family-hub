// Mock data for standalone frontend operation without backend

export const MOCK_USERS = {
  teacher: {
    id: 'teacher-001',
    name: 'व्ही. व्ही. चिपळूणकर',
    email: 'teacher@vainateya.edu',
    role: 'teacher' as const,
    meta: {
      class: 'इयत्ता १-ब',
      school: 'वैनतेय प्राथमिक विद्या मंदिर',
      subject: 'वर्गशिक्षक',
    },
  },
  parent: {
    id: 'parent-001',
    name: 'अभिभावक - आरी कैलास',
    email: 'parent@vainateya.edu',
    role: 'parent' as const,
    meta: {
      child: 'आरी कैलास हेम्सध्योने',
      class: 'इयत्ता १-ब',
      school: 'वैनतेय प्राथमिक विद्या मंदिर',
    },
  },
  student: {
    id: 'student-001',
    name: 'आरी कैलास हेम्सध्योने',
    email: 'student@vainateya.edu',
    role: 'student' as const,
    meta: {
      class: 'इयत्ता १-ब',
      roll: '01',
      school: 'वैनतेय प्राथमिक विद्या मंदिर',
    },
  },
  admin: {
    id: 'admin-001',
    name: 'प्रशासक',
    email: 'admin@vainateya.edu',
    role: 'admin' as const,
    meta: { school: 'वैनतेय प्राथमिक विद्या मंदिर' },
  },
};

export const MOCK_STUDENTS = [
  { id: 's1', name: 'आरी कैलास हेम्सध्योने', roll: '01', className: 'इयत्ता १-ब', parentName: 'कैलास हेम्सध्योने', studentEmail: 'aari.01@vainateya.edu', parentEmail: 'parent.aari.01@vainateya.edu' },
  { id: 's2', name: 'मेधा केशव चाहण', roll: '02', className: 'इयत्ता १-ब', parentName: 'केशव चाहण', studentEmail: 'medha.02@vainateya.edu', parentEmail: 'parent.medha.02@vainateya.edu' },
  { id: 's3', name: 'सुप्रिश्रा विनोद निकाळे', roll: '03', className: 'इयत्ता १-ब', parentName: 'विनोद निकाळे', studentEmail: 'suprisha.03@vainateya.edu', parentEmail: 'parent.suprisha.03@vainateya.edu' },
  { id: 's4', name: 'श्रावी विनोद घटमाळे', roll: '05', className: 'इयत्ता १-ब', parentName: 'विनोद घटमाळे', studentEmail: 'shravi.05@vainateya.edu', parentEmail: 'parent.shravi.05@vainateya.edu' },
  { id: 's5', name: 'मानवी किशोर जावरे', roll: '06', className: 'इयत्ता १-ब', parentName: 'किशोर जावरे', studentEmail: 'manavi.06@vainateya.edu', parentEmail: 'parent.manavi.06@vainateya.edu' },
  { id: 's6', name: 'पायल विजय मोरे', roll: '07', className: 'इयत्ता १-ब', parentName: 'विजय मोरे', studentEmail: 'payal.07@vainateya.edu', parentEmail: 'parent.payal.07@vainateya.edu' },
  { id: 's7', name: 'तपस्वी गोकुळ ढेपले', roll: '08', className: 'इयत्ता १-ब', parentName: 'गोकुळ ढेपले', studentEmail: 'tapaswi.08@vainateya.edu', parentEmail: 'parent.tapaswi.08@vainateya.edu' },
  { id: 's8', name: 'सेजल सागर शिंदे', roll: '10', className: 'इयत्ता १-ब', parentName: 'सागर शिंदे', studentEmail: 'sejal.10@vainateya.edu', parentEmail: 'parent.sejal.10@vainateya.edu' },
  { id: 's9', name: 'आराध्या निर्मित दुसाने', roll: '12', className: 'इयत्ता १-ब', parentName: 'निर्मित दुसाने', studentEmail: 'aaradhya.12@vainateya.edu', parentEmail: 'parent.aaradhya.12@vainateya.edu' },
  { id: 's10', name: 'श्रावण आबा जाधव', roll: '24', className: 'इयत्ता १-ब', parentName: 'आबा जाधव', studentEmail: 'shravan.24@vainateya.edu', parentEmail: 'parent.shravan.24@vainateya.edu' },
];

export const MOCK_HOMEWORK = [
  { _id: 'hw1', id: 'hw1', subject: 'गणित', title: 'बेरीज आणि वजाबाकी सराव', description: 'पाठ्यपुस्तकातील पृष्ठ क्र. ४५-४८ वरील सर्व उदाहरणे सोडवा.', dueDate: '2025-04-15', className: 'इयत्ता १-ब', createdAt: '2025-04-07', completed: false },
  { _id: 'hw2', id: 'hw2', subject: 'मराठी', title: 'निबंध लेखन - माझी शाळा', description: '१० ओळींचा निबंध लिहा: "माझी शाळा"', dueDate: '2025-04-12', className: 'इयत्ता १-ब', createdAt: '2025-04-06', completed: false },
  { _id: 'hw3', id: 'hw3', subject: 'इंग्रजी', title: 'Alphabet Writing Practice', description: 'Write A to Z in both capital and small letters - 3 times each.', dueDate: '2025-04-14', className: 'इयत्ता १-ब', createdAt: '2025-04-05', completed: true },
  { _id: 'hw4', id: 'hw4', subject: 'परिसर अभ्यास', title: 'वनस्पतींचे निरीक्षण', description: 'घराजवळच्या ५ झाडांची नावे व चित्रे काढा.', dueDate: '2025-04-18', className: 'इयत्ता १-ब', createdAt: '2025-04-07', completed: false },
];

export const MOCK_SCORES = [
  { _id: 'sc1', id: 'sc1', subject: 'गणित', title: 'प्रथम सत्र परीक्षा', score: 85, total: 100, grade: 'A', date: '2025-01-15', icon: '🔢' },
  { _id: 'sc2', id: 'sc2', subject: 'मराठी', title: 'प्रथम सत्र परीक्षा', score: 92, total: 100, grade: 'A+', date: '2025-01-16', icon: '📖' },
  { _id: 'sc3', id: 'sc3', subject: 'इंग्रजी', title: 'प्रथम सत्र परीक्षा', score: 78, total: 100, grade: 'B+', date: '2025-01-17', icon: '🔤' },
  { _id: 'sc4', id: 'sc4', subject: 'विज्ञान', title: 'प्रथम सत्र परीक्षा', score: 88, total: 100, grade: 'A', date: '2025-01-18', icon: '🔬' },
  { _id: 'sc5', id: 'sc5', subject: 'परिसर अभ्यास', title: 'प्रथम सत्र परीक्षा', score: 90, total: 100, grade: 'A+', date: '2025-01-19', icon: '🌿' },
  { _id: 'sc6', id: 'sc6', subject: 'गणित', title: 'द्वितीय सत्र परीक्षा', score: 91, total: 100, grade: 'A+', date: '2025-03-10', icon: '🔢' },
  { _id: 'sc7', id: 'sc7', subject: 'मराठी', title: 'द्वितीय सत्र परीक्षा', score: 88, total: 100, grade: 'A', date: '2025-03-11', icon: '📖' },
  { _id: 'sc8', id: 'sc8', subject: 'इंग्रजी', title: 'द्वितीय सत्र परीक्षा', score: 72, total: 100, grade: 'B+', date: '2025-03-12', icon: '🔤' },
];

export const MOCK_QUIZZES = [
  {
    _id: 'q1',
    title: 'गणित मजेशीर क्विझ',
    subject: 'गणित',
    icon: '🔢',
    questions: [
      { question: '५ + ३ = ?', options: ['६', '७', '८', '९'], correctIndex: 2 },
      { question: '१० - ४ = ?', options: ['५', '६', '७', '८'], correctIndex: 1 },
      { question: '२ × ३ = ?', options: ['४', '५', '६', '७'], correctIndex: 2 },
      { question: '१२ ÷ ४ = ?', options: ['२', '३', '४', '५'], correctIndex: 1 },
      { question: 'कोणती संख्या सम आहे?', options: ['३', '५', '८', '९'], correctIndex: 2 },
    ],
  },
  {
    _id: 'q2',
    title: 'मराठी शब्दसंग्रह',
    subject: 'मराठी',
    icon: '📖',
    questions: [
      { question: '"सूर्य" चा विरुद्धार्थी शब्द कोणता?', options: ['चंद्र', 'तारा', 'ढग', 'वारा'], correctIndex: 0 },
      { question: '"मोठा" चा विरुद्धार्थी शब्द?', options: ['उंच', 'लहान', 'रुंद', 'जाड'], correctIndex: 1 },
      { question: '"पाणी" चे समानार्थी शब्द?', options: ['जल', 'हवा', 'माती', 'अग्नी'], correctIndex: 0 },
      { question: '"फूल" चे अनेकवचन काय?', options: ['फुला', 'फुले', 'फुलं', 'फुली'], correctIndex: 1 },
    ],
  },
  {
    _id: 'q3',
    title: 'विज्ञान ज्ञान',
    subject: 'विज्ञान',
    icon: '🔬',
    questions: [
      { question: 'सूर्य कोणत्या दिशेला उगवतो?', options: ['पश्चिम', 'उत्तर', 'पूर्व', 'दक्षिण'], correctIndex: 2 },
      { question: 'पाण्याचे रासायनिक सूत्र काय?', options: ['CO2', 'O2', 'H2O', 'N2'], correctIndex: 2 },
      { question: 'झाडांना अन्न कसे मिळते?', options: ['पाण्यातून', 'मातीतून', 'प्रकाशसंश्लेषण', 'हवेतून'], correctIndex: 2 },
    ],
  },
  {
    _id: 'q4',
    title: 'इंग्रजी Fun Quiz',
    subject: 'इंग्रजी',
    icon: '🔤',
    questions: [
      { question: 'What is the opposite of "big"?', options: ['Tall', 'Small', 'Wide', 'Long'], correctIndex: 1 },
      { question: 'Which is a fruit?', options: ['Carrot', 'Potato', 'Apple', 'Onion'], correctIndex: 2 },
      { question: 'How many days in a week?', options: ['5', '6', '7', '8'], correctIndex: 2 },
      { question: '"Cat" चे plural काय?', options: ['Cats', 'Cates', 'Caties', 'Catss'], correctIndex: 0 },
    ],
  },
];

export const MOCK_MEETINGS = [
  { _id: 'm1', studentName: 'आरी कैलास', teacherName: 'व्ही. व्ही. चिपळूणकर', date: '2025-04-20', timeLabel: 'सकाळी १०:00 - १०:३०', mode: 'प्रत्यक्ष', status: 'नियोजित' },
  { _id: 'm2', studentName: 'मेधा केशव', teacherName: 'व्ही. व्ही. चिपळूणकर', date: '2025-04-20', timeLabel: 'सकाळी १०:३० - ११:००', mode: 'ऑनलाइन', status: 'नियोजित' },
  { _id: 'm3', studentName: 'श्रावी विनोद', teacherName: 'व्ही. व्ही. चिपळूणकर', date: '2025-04-15', timeLabel: 'दुपारी २:०० - २:३०', mode: 'प्रत्यक्ष', status: 'पूर्ण' },
  { _id: 'm4', studentName: 'सेजल सागर', teacherName: 'व्ही. व्ही. चिपळूणकर', date: '2025-04-22', timeLabel: 'सकाळी ११:०० - ११:३०', mode: 'प्रत्यक्ष', status: 'नियोजित' },
];

export const MOCK_INSTRUCTIONS = [
  { _id: 'i1', teacherName: 'व्ही. व्ही. चिपळूणकर', message: 'उद्या शाळेत वार्षिक क्रीडा स्पर्धा आहे. सर्व विद्यार्थ्यांनी पांढरे कपडे घालून यावे.', createdAt: '2025-04-07T10:00:00Z' },
  { _id: 'i2', teacherName: 'व्ही. व्ही. चिपळूणकर', message: 'गणिताचा गृहपाठ गुरुवारपर्यंत पूर्ण करा. अपूर्ण गृहपाठ असल्यास पालकांना कळवले जाईल.', createdAt: '2025-04-06T09:00:00Z' },
  { _id: 'i3', teacherName: 'व्ही. व्ही. चिपळूणकर', message: 'पुढील आठवड्यात प्रथम सत्र परीक्षा सुरू होणार आहे. कृपया मुलांचा अभ्यास करून घ्या.', createdAt: '2025-04-05T14:00:00Z' },
];

export const MOCK_EVENTS = [
  { _id: 'e1', title: 'वार्षिक क्रीडा स्पर्धा', description: 'शाळेच्या मैदानावर वार्षिक क्रीडा महोत्सव. सर्वांना उपस्थित राहणे अनिवार्य.', date: '2025-04-15', icon: '🏃', type: 'event' },
  { _id: 'e2', title: 'विज्ञान प्रदर्शन', description: 'विद्यार्थ्यांच्या विज्ञान प्रकल्पांचे प्रदर्शन. पालकांना आमंत्रण.', date: '2025-04-25', icon: '🔬', type: 'event' },
  { _id: 'e3', title: 'बालदिन उत्सव', description: 'बालदिनानिमित्त विशेष सांस्कृतिक कार्यक्रम आणि खेळ.', date: '2025-05-01', icon: '🎪', type: 'event' },
  { _id: 'e4', title: 'शिक्षक दिन', description: 'शिक्षक दिनानिमित्त विद्यार्थ्यांनी शिक्षकांचा सन्मान कार्यक्रम.', date: '2025-05-05', icon: '🎓', type: 'event' },
];

export const MOCK_NOTICES = [
  { _id: 'n1', title: 'शाळा गणवेश बदल सूचना', description: 'पुढील महिन्यापासून नवीन गणवेश लागू होईल. तपशील कार्यालयात उपलब्ध.', date: '2025-04-10', type: 'notice' },
  { _id: 'n2', title: 'PTM वेळापत्रक', description: 'पालक-शिक्षक सभा दिनांक २० एप्रिल रोजी सकाळी १० ते १२ वाजता.', date: '2025-04-08', type: 'notice' },
  { _id: 'n3', title: 'परीक्षा वेळापत्रक प्रकाशित', description: 'द्वितीय सत्र परीक्षेचे वेळापत्रक नोटीस बोर्डवर लावले आहे.', date: '2025-04-05', type: 'notice' },
];

export const MOCK_ATTENDANCE = MOCK_STUDENTS.map(s => ({
  studentId: s.id,
  status: Math.random() > 0.15 ? 'present' : Math.random() > 0.5 ? 'absent' : 'late',
}));

export const MOCK_ADMIN_STATS = {
  totalUsers: 165,
  teachers: 8,
  students: 54,
  parents: 54,
  newEnquiries: 12,
  totalAnnouncements: 5,
};